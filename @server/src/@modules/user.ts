import WebSocket from 'ws'

export class User {
  id: string
  connection: WebSocket

  constructor(id: string, connection: WebSocket) {
    this.id = id;
    this.connection = connection;
  }

}
