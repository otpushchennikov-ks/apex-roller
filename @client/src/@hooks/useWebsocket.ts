import { UserShareableState, MessageCodec, UserIdCodec, RoomIdCodec } from '@apex-roller/shared';
import { useEffectOnce, useLocation } from 'react-use';
import { useState, Dispatch, useRef, useEffect } from 'react';
import getOrCreateUserId from '@utils/getOrCreateUserId';
import { UserShareableStateAction } from './useUserShareableStateReducer';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { message as noty } from 'antd';


const productionWsHost = window.location.origin.replace(/^http/, 'ws');
const host = process.env.NODE_ENV === 'production' ? productionWsHost : 'ws://localhost:5000';

export default function useWebsocket({
  userShareableState,
  dispatchUserShareableState,
}: {
  userShareableState: UserShareableState,
  dispatchUserShareableState: Dispatch<UserShareableStateAction>
}) {
  const clientRef = useRef<WebSocket | null>(null);
  const [isHost, setIsHost] = useState(false);
  const location = useLocation();
  const uriWithoutLeadingSlash = location.pathname?.slice(1);

  useEffectOnce(() => {
    if (!uriWithoutLeadingSlash) {
      setIsHost(true);
      return;
    }

    const maybeUserId = UserIdCodec.decode(getOrCreateUserId());
    if (isLeft(maybeUserId)) {
      return;
    };

    const maybeRoomId = RoomIdCodec.decode(uriWithoutLeadingSlash);
    if (isLeft(maybeRoomId)) {
      noty.error(PathReporter.report(maybeRoomId));
      return;
    }

    clientRef.current = new WebSocket(host);

    clientRef.current!.onopen = () => {
      clientRef.current!.send(MessageCodec.encode({
        eventType: 'connect', 
        roomId: maybeRoomId.right,
        userId: maybeUserId.right,
        state: {
          challengeIndex: userShareableState.challengeIndex,
          isUnique: userShareableState.isUnique,
          count: userShareableState.count,
          weapons: userShareableState.weapons,
        },
      }));
    };

    clientRef.current!.onmessage = ({ data }) => {
      const maybeMessage = MessageCodec.decode(data);

      if (isLeft(maybeMessage)) {
        console.log(PathReporter.report(maybeMessage));
        return;
      }

      const message = maybeMessage.right;

      switch (message.eventType) {
        case 'connected': {
          setIsHost(message.isHost);

          if (!message.isHost) {
            dispatchUserShareableState({ type: 'replaceState', nextState: message.state });
          }
          return;
        }

        case 'update': {
          if (!isHost) {
            dispatchUserShareableState({ type: 'replaceState', nextState: message.state });
          }
          return;
        }

        case 'disconnect': {
          console.log(message);
          return;
        }
        
        case 'error': {
          noty.error(message.message);
          return;
        }

        default: {
          return;
        }
      }
    };
  });
  

  useEffect(() => {
    if (!isHost || !uriWithoutLeadingSlash) return;

    const maybeRoomId = RoomIdCodec.decode(uriWithoutLeadingSlash);

    if (isLeft(maybeRoomId)) {
      noty.error(PathReporter.report(maybeRoomId));
      return;
    }

    clientRef.current?.send(MessageCodec.encode({
      eventType: 'update',
      roomId: maybeRoomId.right,
      state: userShareableState,
    }));
  }, [userShareableState, uriWithoutLeadingSlash, isHost]);

  return { isHost };
}
