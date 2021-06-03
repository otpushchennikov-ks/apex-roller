import WebSocket from 'ws';
import { left, right, Either } from 'fp-ts/lib/Either';

import { UserShareableState, RoomId, UserId, MessageCodec } from '@apex-roller/shared';
import getOrCreateLogger from './logger'

const logger = getOrCreateLogger('rooms');

export class Room {
  readonly id: RoomId
  readonly userIds: Set<UserId>

  hostId: UserId
  state: UserShareableState

  constructor(id: RoomId, host: UserId, state: UserShareableState) {
    this.id = id;
    this.state = state;
    this.hostId = host;
    this.userIds = new Set();
    this.addUser(this.hostId);
  }

  addUser(userId: UserId) {
    this.userIds.add(userId);
  }

  removeUser(userId: UserId): { isEmpty: boolean, newHostId?: UserId } {
    this.userIds.delete(userId);
    if (userId == this.hostId) {
      const { done, value } = this.userIds.values().next();
      if (done) {
        return { isEmpty: true };
      }
      this.hostId = value;
      return { isEmpty: false, newHostId: this.hostId }
    }
    return { isEmpty: false }
  }

  updateState(state: UserShareableState) {
    this.state = state;
  }

}

export class Rooms {
  maxRooms: number
  maxUsers: number
  maxRoomsPerUser: number
  nRecentlyUpdatedRoomsToKeep: number

  private rooms: Map<RoomId, Room>
  private userConnections: Map<UserId, Map<RoomId, WebSocket>>

  readonly recentlyUpdatedRooms: Array<Room>

  constructor({
    maxRooms,
    maxUsers,
    maxRoomsPerUser,
    nRecentlyUpdatedRoomsToKeep,
  }: {
    maxRooms: number
    maxUsers: number
    maxRoomsPerUser: number
    nRecentlyUpdatedRoomsToKeep: number
  }) {
    this.maxRooms = maxRooms;
    this.maxUsers = maxUsers;
    this.maxRoomsPerUser = maxRoomsPerUser;
    this.nRecentlyUpdatedRoomsToKeep = nRecentlyUpdatedRoomsToKeep;
    this.rooms = new Map();
    this.userConnections = new Map();
    this.recentlyUpdatedRooms = new Array();
  }

  private putToRecentlyUpdatedRooms(room: Room): void {
    this.removeFromRecentlyUpdatedRooms(room);
    if (this.recentlyUpdatedRooms.length >= this.nRecentlyUpdatedRoomsToKeep) {
      this.recentlyUpdatedRooms.pop();
    }
    this.recentlyUpdatedRooms.unshift(room);
  }

  private removeFromRecentlyUpdatedRooms(room: Room): void {
    for (let i = 0; i < this.recentlyUpdatedRooms.length; ++i) {
      if (room.id == this.recentlyUpdatedRooms[i].id) {
        this.recentlyUpdatedRooms.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Creates a room with user as host, or joins a room.
   * If user was not previously known to system, also registers user.
   * 
   * @returns error if any of system limits has been reached; reference to created room otherwise.
   * If user has joined a room they were previously in, also returns handle to the previous connection.
   */
  createOrJoinRoom(
    roomId: RoomId, userId: UserId, connection: WebSocket, state: UserShareableState
  ): Either<string, { room: Room, connectionToClose?: WebSocket }> {
    const room = this.rooms.get(roomId);
    if (!room && this.rooms.size >= this.maxRooms) {
      return left(`cannot create more rooms: max rooms (${this.maxRooms}) reached`);
    }

    const userRooms = this.userConnections.get(userId);
    if (userRooms) {
      if (userRooms.size >= this.maxRoomsPerUser && !userRooms.has(roomId)) {
        return left(`cannot enter room: max user rooms (${this.maxRoomsPerUser}) reached`);
      }
    } else {
      if (this.userConnections.size >= this.maxUsers) {
        return left(`cannot register user: max users (${this.maxUsers}) reached`);
      }
    }
    
    // register user, returning existing connection
    const existingConnection = userRooms?.get(roomId);
    userRooms?.set(roomId, connection) ?? this.userConnections.set(userId, new Map([[roomId, connection]]));

    if (room) {
      room.addUser(userId);
      this.putToRecentlyUpdatedRooms(room);
      logger.info(`added user ${userId} to existing room ${room.id}`);
      return right({ room, connectionToClose: existingConnection });
    } else {
      const newRoom = new Room(roomId, userId, state);
      this.rooms.set(roomId, newRoom);
      // not possible to have existing connection here
      existingConnection!;
      this.putToRecentlyUpdatedRooms(newRoom);
      logger.info(`created new room ${newRoom.id} with host ${userId}`);
      return right({ room: newRoom });
    }
  }

  /**
   * Updates room state.
   * 
   * @returns error if room does not exist, or user is not a host of the room; otherwise nothing.
   */
  updateRoomState(roomId: RoomId, userId: UserId, state: UserShareableState): Either<string, null> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return left('cannot update: room does not exist');
    }
    if (room?.hostId !== userId) {
      return left('cannot update: not a host');
    }

    room.updateState(state);
    const serializedUpdate = MessageCodec.encode({ eventType: 'update', roomId, state });
    room.userIds.forEach(userId => {
      // TODO do we want to send update to host (back)?
      if (userId === room.hostId) return;
      this.userConnections.get(userId)?.get(roomId)?.send(serializedUpdate);
    });
    logger.info(`updated state of room ${room.id}: ${serializedUpdate}`);
    this.putToRecentlyUpdatedRooms(room);
    return right(null);
  }

  /**
   * Disconnects user from room.
   * 
   * Does nothing if room does not exist.
   * 
   * If user disconnect has caused host re-election in the room, notifies the new host.
   */
  disconnectFromRoom(roomId: RoomId, userId: UserId): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    // should always exist
    this.userConnections.get(userId)!.delete(roomId);
    const { isEmpty, newHostId: newHost } = room!.removeUser(userId);
    this.removeFromRecentlyUpdatedRooms(room);

    if (isEmpty) {
      this.rooms.delete(room.id);
      logger.info(`deleted empty room ${room.id}`);
    } else if (newHost) {
      this.userConnections.get(newHost)?.get(roomId)?.send(MessageCodec.encode({
        eventType: 'connected',
        isHost: true,
        roomId,
        state: room.state,
      }));
      logger.info(`elected new host ${newHost} in room ${room.id}`);
    }
  }
}
