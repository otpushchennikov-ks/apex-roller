import WebSocket, { Server } from 'ws';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { ConnectMessage, UpdateMessage, Message, MessageCodec, UserId, RoomId } from '@apex-roller/shared';

export type ConnectionContext = {
  isAlive: boolean,
  lastPong: number,
  userId?: UserId,
  roomId?: RoomId,
}

export function RollerWebSocketServer(
  server: Server,
  options: {
    heartbeatTimeout: number,
    reconnectTimeout: number,
  },
  handlers: {
    onConnect: (message: ConnectMessage, context: ConnectionContext, connection: WebSocket) => (Message | undefined),
    onUpdate: (message: UpdateMessage, context: ConnectionContext, connection: WebSocket) => (Message | undefined),
    onDisconnect: (context: ConnectionContext) => void,
  }, 
): Server {
  const potentialReconnects = new Map();

  server.on('connection', (connection, request) => {
    const context: ConnectionContext = { isAlive: true, lastPong: Date.now() };
    
    const disconnect = () => {
      console.log(`closing connection to ${request.socket.remoteAddress}`);
      if (heartbeat) {
        clearInterval(heartbeat);
      }
      context.isAlive = false;
      const userId = context.userId; 
      if (userId) {
        const timeoutHandle = setTimeout(() => {
          potentialReconnects.delete(userId);
          handlers.onDisconnect(context);
        }, options.reconnectTimeout);
        potentialReconnects.set(userId, timeoutHandle);
      }
    };

    const heartbeat = setInterval(() => {
      if ((Date.now() - context.lastPong) > options.heartbeatTimeout) {
        disconnect();
      } else {
        connection.ping();
      }
    }, 20000);
  
    connection.on('message', data => {
      const maybeMessage = MessageCodec.decode(data.toString())
      if (isLeft(maybeMessage)) {
        console.log(PathReporter.report(maybeMessage))
        return;
      }
      const message = maybeMessage.right
      console.log(`${request.socket.remoteAddress} -> ${data.toString()}`)
  
      let response : Message | undefined;
      switch (message.eventType) {
        case 'connect': {
          const reconnectTimeoutHandle = potentialReconnects.get(message.userId);
          if (reconnectTimeoutHandle) {
            clearTimeout(reconnectTimeoutHandle);
            console.log(`user ${message.userId} is reconnecting`);
          }
          response = handlers.onConnect(message, context, connection);
          break;
        }
        case 'update': {
          response = handlers.onUpdate(message, context, connection);
          break;
        }
        default:
          break;
      }

      if (response) {
        const serializedResponse = MessageCodec.encode(response); 
        connection.send(serializedResponse);
        console.log(`${request.socket.remoteAddress} <- ${serializedResponse}`)
      }
    });

    connection.on('pong', () => context.lastPong = Date.now());
    connection.on('close', disconnect);
  });

  return server;
}
