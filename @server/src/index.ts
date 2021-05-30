import path from 'path';
import express from 'express';
import { Server as WebSocketServer } from 'ws';
import { Rooms } from './@modules/room';
import { RollerWebSocketServer } from './@modules/server';
import { isLeft } from 'fp-ts/lib/Either';
import { MessageCodec } from '../../@shared';


const PORT = process.env.PORT || 5000;

const clientBuildPath = path.join(__dirname, '..', '..', '@client', 'build');
const httpServer = express()
  .use(express.static(clientBuildPath))
  .get('/*', (_, res) => res.sendFile(path.join(clientBuildPath, 'index.html')))
  .listen(PORT, () => console.log(`Server is running in port: ${PORT}`));

const rooms = new Rooms(50, 3);

RollerWebSocketServer(new WebSocketServer({ server: httpServer }), {
  onConnect: (message, context, connection) => {
    const { roomId, userId, state } = message;
    context.userId = userId;

    const existingConnection = rooms.registerUser(userId, connection);
    existingConnection?.send(MessageCodec.encode({
      eventType: 'disconnect'
    }));

    const room = rooms.createOrJoinRoom(roomId, userId, state);
    
    if (isLeft(room)) {
      return {
        eventType: 'error',
        message: room.left,
      };  
    }

    return {
      eventType: 'connected',
      isHost: room.right.hostId == userId,
      roomId,
      state: room.right.state
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
    const result = rooms.updateRoomState(context.userId, roomId, state);
    if (isLeft(result)) {
      return {
        eventType: 'error',
        message: result.left,
      };
    }

    console.log(`updated room state: ${roomId} <- ${JSON.stringify(state)}`);
  },
  onClose: (context) => {
    if (!context.userId) {
      return;
    }
    console.log(`user ${context.userId} disconnected`);
  }
});
