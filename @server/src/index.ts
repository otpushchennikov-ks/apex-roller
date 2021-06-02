import path from 'path';
import express from 'express';
import { Server as WebSocketServer } from 'ws';
import { Rooms } from './@modules/room';
import { RollerWebSocketServer } from './@modules/server';
import { isLeft } from 'fp-ts/lib/Either';
import { MessageCodec } from '@apex-roller/shared';
import cors from 'cors';


const PORT = process.env.PORT || 5000;

const clientBuildPath = path.join(__dirname, '..', '..', '@client', 'build');
const httpServer = express()
  .use(cors())
  .use(express.static(clientBuildPath))
  .get('/api/topRooms', (_, res) => res.json({ topRooms: rooms.recentlyUpdatedRooms.map(room => room.id) }))
  .get('/*', (_, res) => res.sendFile(path.join(clientBuildPath, 'index.html')))
  .listen(PORT, () => console.log(`Server is running in port: ${PORT}`));

const rooms = new Rooms({ maxRooms: 50, maxUsers: 50, maxRoomsPerUser: 3, nRecentlyUpdatedRoomsToKeep: 5 });

RollerWebSocketServer(
  new WebSocketServer({ server: httpServer }),
  { reconnectTimeout: 10_000, heartbeatTimeout: 120_000 }, 
  {
    onConnect: (message, context, connection) => {
      const { roomId, userId, state } = message;
      
      const result = rooms.createOrJoinRoom(roomId, userId, connection, state);
      if (isLeft(result)) {
        return {
          eventType: 'error',
          message: result.left,
        };
      }
      if (result.right.connectionToClose) {
        console.log(`dropping previous connection of user ${userId} to room ${roomId}`);
        result.right.connectionToClose.send(MessageCodec.encode({
          eventType: 'disconnect',
        }));
      }

      context.userId = userId;
      context.roomId = roomId;

      return {
        eventType: 'connected',
        isHost: result.right.room.hostId == userId,
        roomId,
        state: result.right.room.state
      };
    },
    onUpdate: (message, context) => {
      if (!context.userId || !context.roomId) {
        return {
          eventType: 'error',
          message: 'not connected to any room',
        };
      };

      const { state } = message;
      const result = rooms.updateRoomState(context.roomId, context.userId, state);
      if (isLeft(result)) {
        return {
          eventType: 'error',
          message: result.left,
        };
      }

      console.log(`updated state in room ${context.roomId}: ${JSON.stringify(state)}`);
    },
    onDisconnect: (context) => {
      if (context.roomId && context.userId) {
        rooms.disconnectFromRoom(context.roomId, context.userId);
      }
      console.log(`user ${context.userId} disconnected`);
    }
  }
);
