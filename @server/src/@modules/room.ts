import WebSocket from 'ws'
import { UserShareableState, UpdateMessage, RoomId, UserId, MessageCodec } from '@apex-roller/shared';

export class User {
  id: UserId
  connection: WebSocket

  constructor(id: UserId, connection: WebSocket) {
    this.id = id;
    this.connection = connection;
  }
}

export class Room {
  id: RoomId
  host: User
  state: UserShareableState
  users: Map<UserId, User>

  constructor(id: RoomId, host: User, state: UserShareableState) {
    this.id = id;
    this.host = host;
    this.state = state;
    this.users = new Map();
    this.addUser(this.host);
  }

  addUser(user: User) {
    this.users.set(user.id, user);
  }

  removeUser(userId: UserId): { isEmpty: boolean, newHost?: User } {
    this.users.delete(userId);
    if (userId == this.host.id) {
      const { done, value } = this.users.values().next();
      if (done) {
        return { isEmpty: true };
      }
      this.host = value;
      return { isEmpty: false, newHost: this.host }
    }
    return { isEmpty: false }
  }

  broadcast(message: UpdateMessage) {
    const serializedMessage = MessageCodec.encode(message);
    this.users.forEach((user, userId) => {
      if (userId === this.host.id) return;
      user.connection.send(serializedMessage);
    });
  }

  updateState(state: UserShareableState) {
    this.state = state;
    this.broadcast({eventType: 'update', roomId: this.id, state: this.state});
  }
}

export class Rooms {
  maxRooms: Number
  maxRoomsPerUser: Number

  private rooms: Map<RoomId, Room>
  private users: Map<UserId, Set<RoomId>>

  constructor(maxRooms: Number, maxRoomsPerUser: Number) {
    this.maxRooms = maxRooms;
    this.maxRoomsPerUser = maxRoomsPerUser;
    this.rooms = new Map();
    this.users = new Map(); 
  }

  private linkUserToRoom(userId: UserId, roomId: RoomId) {
    const rooms = this.getUserRooms(userId);
    if (rooms) {
      if (rooms.size >= this.maxRoomsPerUser) {
        // TODO fail properly
        throw new Error(`cannot enter room: max user rooms (${this.maxRoomsPerUser}) reached`)
      }
      rooms.add(roomId);
    } else {
      this.users.set(userId, new Set([roomId]));
    }
  }

  private unlinkUserFromRoom(userId: UserId, roomId: RoomId) {
    this.getUserRooms(userId)?.delete(roomId);
  }

  getRoom(roomId: RoomId): Room | undefined {
    return this.rooms.get(roomId);
  }

  getUserRooms(userId: UserId): Set<RoomId> | undefined {
    return this.users.get(userId);
  }

  createOrJoinRoom(roomId: RoomId, user: User, state: UserShareableState): Room {
    let room = this.getRoom(roomId);
    if (room) {
      this.linkUserToRoom(user.id, roomId);
      if (!room.users.has(user.id)) {
        room.addUser(user);
      }
    } else {
      if (this.rooms.size >= this.maxRooms) {
        // TODO fail properly OR depart user from a room
        throw new Error(`cannot create more rooms: max rooms (${this.maxRooms}) reached`);
      }
      room = new Room(roomId, user, state);
      this.linkUserToRoom(user.id, roomId);
      this.rooms.set(roomId, room);
    }
    return room;
  }

  disconnectFromRoom(roomId: RoomId, userId: UserId) {
    const room = this.getRoom(roomId);
    if (!room) {
      return;
    }
    this.unlinkUserFromRoom(userId, roomId);
    const { isEmpty, newHost } = room?.removeUser(userId)!;
    if (isEmpty) {
      this.rooms.delete(room.id);
    } else if (newHost) {
      newHost.connection.send(MessageCodec.encode({
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
