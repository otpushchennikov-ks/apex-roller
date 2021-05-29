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

  broadcast(message: UpdateMessage) {
    const serializedMessage = JSON.stringify(MessageCodec.encode(message));
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
  rooms: Map<RoomId, Room>

  constructor(maxRooms: Number) {
    this.maxRooms = maxRooms;
    this.rooms = new Map();
  }

  getRoom(roomId: RoomId): Room | undefined {
    return this.rooms.get(roomId);
  }

  createOrJoinRoom(roomId: RoomId, user: User, state: UserShareableState): Room {
    let room = this.getRoom(roomId);
    if (room) {
      if (!room.users.has(user.id)) {
        room.addUser(user);
      }
    } else {
      if (this.rooms.size >= this.maxRooms) {
        // TODO fail properly
        throw new Error('cannot create more rooms: max rooms reached');
      }
      room = new Room(roomId, user, state);
      this.rooms.set(roomId, room);
    }
    return room;
  }
}
