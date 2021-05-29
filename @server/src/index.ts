import path from 'path';
import express from 'express';

import { Server as WebSocketServer } from 'ws';
import { User, Rooms } from './@modules/room'
import { RollerWebSocketServer } from './@modules/server'

const PORT = process.env.PORT || 5000;

const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'build');
const httpServer = express()
  .use(express.static(clientBuildPath))
  .get('/*', (_, res) => res.sendFile(path.join(clientBuildPath, 'index.html')))
  .listen(PORT, () => console.log(`Server is running in port: ${PORT}`));

const rooms = new Rooms(50);

RollerWebSocketServer(
  new WebSocketServer({ server: httpServer }),
  {
    onConnect: (message, context, connection) => {
      const { roomId, userId, state } = message;
      const user = new User(userId, connection);
      context.userId = userId;

      const room = rooms.createOrJoinRoom(roomId, user, state);
      
      return {
        eventType: 'connected',
        isHost: room.host.id == user.id,
        roomId,
        state: room.state
      };
    },
    onUpdate: (message, context) => {
      if (!context.userId) {
        return {
          eventType: 'error',
          message: 'update: not connected to any room',
        };
      };

      const { roomId, state } = message;
      const room = rooms.getRoom(roomId);

      if (!room || room.host.id !== context.userId) {
        return {
          eventType: 'error',
          message: 'update: room does not exists or user is not a host',
        };
      };

      room.updateState(state);
      console.log(`updated room state: ${roomId} <- ${JSON.stringify(room.state)}`);
    },
    onClose: (context) => {
      console.log(`user ${context.userId} disconnected`);
    }
  }
)
