const express = require('express');
const path = require('path');
const { Server } = require('ws');
const PORT = process.env.PORT || 4000;

const server = express()
  .use(express.static(path.join(__dirname, 'build')))
  .listen(PORT, () => console.log(`Server is running in port: ${PORT}`));

class Room {
  constructor(host, state) {
    this.host = host;
    this.state = state;
    this.users = new Map([
      [host.id, host],
    ]);
  }

  addUser(user) {
    this.users.set(user.id, user);
  }

  broadcast(message) {
    const serializedMessage = JSON.stringify(message);
    
    this.users.forEach((user, userId) => {
      if (userId === this.host.id) return;

      if (user.connection.isAlive) {
        user.connection.send(serializedMessage);
      } else {
        // TODO: словить батхерд из-за актулизации хэш-мапы по делиту в цикле
        this.users.delete(userId);
      }
    });
  }
}

class User {
  constructor(id, connection) {
    this.id = id;
    this.connection = connection;
  }
}

const rooms = new Map();

const wss = new Server({ server });

wss.on('connection', connection => {
  connection.isAlive = true;

  connection.on('message', data => {
    const message = JSON.parse(data);
    
    switch (message.eventType) {
      case 'connect': {
        const { roomId, userId, state } = message;

        let room = rooms.get(roomId);
        const user = new User(userId, connection);

        const isHost = !room || room.host.id === userId;
        if (!room) {
          connection.userId = userId;
          room = new Room(user, state);
          rooms.set(roomId, room);
        } else {
          room.addUser(user);
        }
        
        connection.send(JSON.stringify({ eventType: 'connected', isHost, state: room.state }));

        console.log(`connected: ${userId} -> ${roomId}: ${JSON.stringify(room.state)}`);
        break;
      }

      case 'update': {
        if (!connection.userId) return;

        const { roomId, state } = message;

        const room = rooms.get(roomId);

        if (!room || room.host.id !== connection.userId) return;

        room.state = state;
        room.broadcast({ eventType: 'update', state: room.state });
        console.log(`update: ${roomId} <- ${JSON.stringify(room.state)}`);
        break;
      }

      default:
        break;
    }
  });

  // TODO: add hearthbeat
  connection.on('pong', connection => connection.isAlive = true);

  connection.on('close', () => console.log('server: user disconnected'));
});
