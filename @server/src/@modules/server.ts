import WebSocket, { Server } from 'ws';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { ConnectMessage, UpdateMessage, Message, MessageCodec, UserId, RoomId } from '@apex-roller/shared';

import getOrCreateLogger from './logger';

const logger = getOrCreateLogger('ws');

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
      logger.info(`closing connection to ${request.socket.remoteAddress}`);
      if (heartbeat) {
        clearInterval(heartbeat);
      }
      context.isAlive = false;
      const userId = context.userId; 
      if (userId) {
        const timeoutHandle = setTimeout(() => {
          potentialReconnects.delete(userId + context.roomId);
          handlers.onDisconnect(context);
        }, options.reconnectTimeout);
        potentialReconnects.set(userId + context.roomId, timeoutHandle);
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
        logger.error(PathReporter.report(maybeMessage))
        return;
      }
      const message = maybeMessage.right
      logger.info(`${context.userId ?? request.socket.remoteAddress} -> ${data.toString()}`)
  
      let response : Message | undefined;
      switch (message.eventType) {
        case 'connect': {
          const reconnectTimeoutHandle = potentialReconnects.get(message.userId + message.roomId);
          if (reconnectTimeoutHandle) {
            clearTimeout(reconnectTimeoutHandle);
            logger.info(`user ${message.userId} is reconnecting to room ${message.roomId}`);
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
        logger.info(`${context.userId ?? request.socket.remoteAddress} <- ${serializedResponse}`)
      }
    });

    connection.on('pong', () => context.lastPong = Date.now());
    connection.on('close', disconnect);
  });

  return server;
}
