import WebSocket from 'ws';
import { UserShareableState, RoomId, UserId, MessageCodec } from '@apex-roller/shared';
import { left, right, Either, isLeft } from 'fp-ts/lib/Either';


export class Room {
  id: RoomId
  state: UserShareableState
  hostId: UserId
  userIds: Set<UserId>

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
}

export class Rooms {
  maxRooms: Number
  maxRoomsPerUser: Number

  private rooms: Map<RoomId, Room>
  private users: Map<UserId, Set<RoomId>>
  private userConnections: Map<UserId, WebSocket>

  constructor(maxRooms: Number, maxRoomsPerUser: Number) {
    this.maxRooms = maxRooms;
    this.maxRoomsPerUser = maxRoomsPerUser;
    this.rooms = new Map();
    this.users = new Map(); 
    this.userConnections = new Map();
  }

  private linkUserToRoom(userId: UserId, roomId: RoomId) {
    const rooms = this.getUserRooms(userId);
    if (rooms) {
      if (rooms.size >= this.maxRoomsPerUser) {
        return left(`cannot enter room: max user rooms (${this.maxRoomsPerUser}) reached`);
      }
      rooms.add(roomId);
    } else {
      this.users.set(userId, new Set([roomId]));
    }
    return right(null);
  }

  private unlinkUserFromRoom(userId: UserId, roomId: RoomId) {
    this.getUserRooms(userId)?.delete(roomId);
  }

  registerUser(userId: UserId, connection: WebSocket): WebSocket | undefined {
    const existingConnection = this.userConnections.get(userId);
    this.userConnections.set(userId, connection);
    return existingConnection;
  }

  updateRoomState(userId: UserId, roomId: RoomId, state: UserShareableState): Either<string, null> {
    const room = this.getRoom(roomId);
    if (!room) {
      return left('room does not exist');
    }
    if (room?.hostId !== userId) {
      return left('not a host');
    }
    room.state = state;
    room?.userIds.forEach(userId => {
      // TODO do we want to send update to host (back)?
      if (userId === room.hostId) return;
      this.userConnections.get(userId)?.send(MessageCodec.encode({ eventType: 'update', roomId, state }));
    });
    return right(null);
  }

  getRoom(roomId: RoomId): Room | undefined {
    return this.rooms.get(roomId);
  }

  getUserRooms(userId: UserId): Set<RoomId> | undefined {
    return this.users.get(userId);
  }

  createOrJoinRoom(roomId: RoomId, userId: UserId, state: UserShareableState): Either<string, Room> {
    let room = this.getRoom(roomId);

    if (room) {
      const maybeError = this.linkUserToRoom(userId, roomId);
      if (isLeft(maybeError)) {
        return maybeError;
      }

      if (!room.userIds.has(userId)) {
        room.addUser(userId);
      }
    } else {
      if (this.rooms.size >= this.maxRooms) {
        return left(`cannot create more rooms: max rooms (${this.maxRooms}) reached`);
      }
      room = new Room(roomId, userId, state);
      const maybeError = this.linkUserToRoom(userId, roomId);
      if (isLeft(maybeError)) {
        return maybeError;
      }
      
      this.rooms.set(roomId, room);
    }

    return right(room);
  }

  disconnectFromRoom(roomId: RoomId, userId: UserId) {
    const room = this.getRoom(roomId);
    if (!room) {
      return;
    }
    this.unlinkUserFromRoom(userId, roomId);
    const { isEmpty, newHostId: newHost } = room?.removeUser(userId)!;
    if (isEmpty) {
      this.rooms.delete(room.id);
    } else if (newHost) {
      this.userConnections.get(newHost)?.send(MessageCodec.encode({
        eventType: 'connected',
        isHost: true,
        roomId,
        state: room.state,
      }));
    }
  }

  disconnectFromAllRooms(userId: UserId) {
    // TODO this is performance-intensive - re-elects host in every room this user was host on
    this.getUserRooms(userId)?.forEach(roomId => this.disconnectFromRoom(roomId, userId));
  }
}
