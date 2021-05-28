import { UserShareableState, UpdateMessage, UpdateMessageCodec } from '../../../shared/types';
import { User } from './user';

export class Room {
  host: User
  state: UserShareableState
  users: Map<string, User>

  constructor(host: User, state: UserShareableState) {
    this.host = host;
    this.state = state;
    this.users = new Map([
      [host.id, host],
    ]);
  }

  addUser(user: User) {
    this.users.set(user.id, user);
  }

  broadcast(message: UpdateMessage) {
    const serializedMessage = JSON.stringify(UpdateMessageCodec.encode(message));
    
    this.users.forEach((user, userId) => {
      if (userId === this.host.id) return;
      user.connection.send(serializedMessage);
    });
  }
}
