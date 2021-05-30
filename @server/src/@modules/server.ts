import WebSocket, { Server } from 'ws';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { ConnectMessage, UpdateMessage, Message, MessageCodec, UserId } from '@apex-roller/shared';

export type ConnectionContext = {
  isAlive: boolean,
  userId?: UserId,
}

export function RollerWebSocketServer(
  server: Server,
  handlers: {
    onConnect: (message: ConnectMessage, context: ConnectionContext, connection: WebSocket) => (Message | undefined),
    onUpdate: (message: UpdateMessage, context: ConnectionContext, connection: WebSocket) => (Message | undefined),
    onClose: (context: ConnectionContext) => void
  }
): Server {
  server.on('connection', (connection, request) => {
    const context: ConnectionContext = { isAlive: true };
  
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
  
    setInterval(() => connection.ping(), 20000);
    connection.on('pong', () => context.isAlive = true);
    connection.on('close', () => {
      context.isAlive = false;
      handlers.onClose(context);
    });
  });

  return server;
}
