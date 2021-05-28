import path from 'path';
import express from 'express';
import { Server as WSS } from 'ws';
import { MessageCodec, UserId } from '../../shared/types';
import { Room } from './@modules/room'
import { User } from './@modules/user'

import { PathReporter } from 'io-ts/PathReporter'
import { isLeft } from 'fp-ts/Either';

const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'build');

const PORT = process.env.PORT || 5000;
const httpServer = express()
  .use(express.static(clientBuildPath))
  .get('/*', (_, res) => res.sendFile(path.join(clientBuildPath, 'index.html')))
  .listen(PORT, () => console.log(`Server is running in port: ${PORT}`));

const rooms = new Map<string, Room>();

const wss = new WSS({ server: httpServer });

wss.on('connection', connection => {
  let currentUserId: UserId | null = null;

  connection.on('message', data => {
    const maybeMessage = MessageCodec.decode(JSON.parse(data.toString()))
    if (isLeft(maybeMessage)) {
      console.log(PathReporter.report(maybeMessage))
      return;
    }

    const message = maybeMessage.right
    switch (message.eventType) {
      case 'connect': {
        const { roomId, userId, state } = message;

        let room = rooms.get(roomId);
        const user = new User(userId, connection);

        const isHost = !room || room.host.id === userId;
        if (!room) {
          currentUserId = userId;
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
        if (!currentUserId) return;

        const { roomId, state } = message;

        const room = rooms.get(roomId);

        if (!room || room.host.id !== currentUserId) return;

        room.state = state;
        room.broadcast(message);
        console.log(`update: ${roomId} <- ${JSON.stringify(room.state)}`);
        break;
      }

      default:
        break;
    }
  });

  setInterval(() => connection.ping(), 20000);

  connection.on('pong', () => console.log(`server: ${currentUserId} - alive`));

  connection.on('close', () => console.log('server: user disconnected'));
});
