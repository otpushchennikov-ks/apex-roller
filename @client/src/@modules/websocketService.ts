import { Message, EventType, MessageCodec, RoomId, UserId, UserShareableState } from '@apex-roller/shared';
import { wsHost } from '@utils/constants';
import { message as noty } from 'antd';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';


type SubscriberFn<M extends Message = Message> = (message: M) => void
type MessageOfEventType<E> = { eventType: E } & Message;

class WebSocketService {
  private client: WebSocket
  private subscribersMap: Map<EventType, SubscriberFn[]>

  constructor() {
    this.client = new WebSocket(wsHost);
    this.subscribersMap = new Map();
  }

  private callSubscribersByEvent(eventType: EventType, message: Message) {
    const subscribersOfConnectedEvent = this.subscribersMap.get(eventType);
    if (subscribersOfConnectedEvent) {
      subscribersOfConnectedEvent.map(subscriber => subscriber(message));
    }  
  }

  connect(userId: UserId, roomId: RoomId, state: UserShareableState): Promise<void> {
    return new Promise(resolve => {

      this.subscribersMap.clear();
  
      if (this.client.readyState === WebSocket.OPEN) {
        this.client.onclose = () => {
          this.client = new WebSocket(wsHost);
          this.client.onopen = () => {
            resolve()
            run();
          };
        };
  
        this.client.close();
      } else {
        this.client = new WebSocket(wsHost);
        this.client.onopen = () => {
          resolve();
          run();
        };
      }
  
      const run = () => {
        this.client.send(MessageCodec.encode({
          eventType: 'connect',
          roomId,
          userId,
          state,
        }));
    
        this.client.onmessage = ({ data }) => {
          const maybeMessage = MessageCodec.decode(data);
          if (isLeft(maybeMessage)) {
            const error = PathReporter.report(maybeMessage);
            console.log(error);
            noty.error(error);
            return;
          }
    
          this.callSubscribersByEvent(maybeMessage.right.eventType, maybeMessage.right);
        };
      };
    });
  }

  on<E extends EventType, M extends MessageOfEventType<E>>(eventType: E, subscriber: SubscriberFn<M>) {
    const currentSubscribers = this.subscribersMap.get(eventType);

    if (currentSubscribers) {
      currentSubscribers.push(subscriber as SubscriberFn);
    } else {
      this.subscribersMap.set(eventType, [subscriber as SubscriberFn]);
    }
  }

  send(message: Message) {
    if (this.client.readyState === WebSocket.OPEN) {
      this.client.send(MessageCodec.encode(message));
    }
  }

  disconnect() {
    this.subscribersMap.clear();

    if (this.client.readyState === WebSocket.OPEN) {
      this.client.close();
    }
  }
}

export default WebSocketService;
