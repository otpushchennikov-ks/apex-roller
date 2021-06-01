import { UserShareableState, MessageCodec, RoomIdCodec } from '@apex-roller/shared';
import { useEffectOnce, useLocation, usePrevious } from 'react-use';
import { useState, Dispatch, useRef, useEffect, useCallback } from 'react';
import getOrCreateUserId from '@utils/getOrCreateUserId';
import { UserShareableStateAction } from './useUserShareableStateReducer';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { message as noty } from 'antd';


const productionWsHost = window.location.origin.replace(/^http/, 'ws');
const host = process.env.NODE_ENV === 'production' ? productionWsHost : 'ws://localhost:5000';
const maybeUserId = getOrCreateUserId();

export type Mode =
  | { type: 'initializing' }
  | { type: 'private' }
  | { type: 'host' }
  | { type: 'client' }
  | { type: 'disconnected' }
  | { type: 'error', text: string };

export default function useWebsocket({
  userShareableState,
  dispatchUserShareableState,
}: {
  userShareableState: UserShareableState,
  dispatchUserShareableState: Dispatch<UserShareableStateAction>
}) {
  const location = useLocation();
  const uri = location.pathname?.slice(1);
  const ws = useRef<WebSocket | null>(null);
  const [mode, setMode] = useState<Mode>({ type: 'initializing' });

  const reconnect = useCallback(() => {
    const maybeRoomId = RoomIdCodec.decode(uri);
    if (isLeft(maybeUserId) || isLeft(maybeRoomId)) return;

    ws.current?.send(MessageCodec.encode({
      eventType: 'connect', 
      roomId:maybeRoomId.right,
      userId: maybeUserId.right,
      state: {
        challengeIndex: userShareableState.challengeIndex,
        isUnique: userShareableState.isUnique,
        count: userShareableState.count,
        weapons: userShareableState.weapons,
      },
    }));
  }, [userShareableState, uri]);

  const init = useCallback(() => {
    ws.current = new WebSocket(host);
    ws.current.onopen = () => reconnect();
    ws.current.onmessage = ({ data }) => {
      const maybeMessage = MessageCodec.decode(data);

      if (isLeft(maybeMessage)) {
        console.log(PathReporter.report(maybeMessage));
        return;
      }

      const message = maybeMessage.right;

      switch (message.eventType) {
        case 'connected': {
          noty.success(message.eventType);
          setMode({ type: message.isHost ? 'host' : 'client' });

          if (!message.isHost) {
            dispatchUserShareableState({ type: 'replaceState', nextState: message.state });
          }
          return;
        }

        case 'update': {
          dispatchUserShareableState({ type: 'replaceState', nextState: message.state });
          return;
        }

        case 'disconnect': {
          noty.info(message.eventType);
          setMode({ type: 'disconnected' });
          return;
        }
        
        case 'error': {
          noty.error(message.message);
          setMode({ type: 'error', text: message.message });
          return;
        }

        default: {
          return;
        }
      }
    };

  }, [dispatchUserShareableState, reconnect]);

  useEffectOnce(() => {
    if (!uri) {
      setMode({ type: 'private' });
      noty.info('private room');
      return;
    }

    if (isLeft(maybeUserId)) {
      const errorText = PathReporter.report(maybeUserId).join('\n');
      noty.error(errorText);
      setMode({ type: 'error', text: errorText });
      return;
    };

    const maybeRoomId = RoomIdCodec.decode(uri);
    if (isLeft(maybeRoomId)) {
      const errorText = PathReporter.report(maybeRoomId).join('\n');
      noty.error(errorText);
      setMode({ type: 'error', text: errorText });
      return;
    }

    init();
  });
  
  const previousUri = usePrevious(uri);
  useEffect(() => {
    if (!uri && ws.current) {
      noty.info('private room');
      ws.current.close();
      ws.current = null;
      return;
    }

    if (uri !== previousUri && previousUri !== undefined) {
      ws.current?.close();
      ws.current = null;
      init();
    }
  }, [previousUri, uri, init]);

  // TODO: кажется эту проверку теперь можно удалить
  // const serializedState = JSON.stringify(userShareableState);
  // const previousSerializedState = usePrevious(serializedState);
  useEffect(() => {
    if (mode.type !== 'host' || !uri /* || serializedState === previousSerializedState */) return;

    const maybeRoomId = RoomIdCodec.decode(uri);

    if (isLeft(maybeRoomId)) {
      noty.error(PathReporter.report(maybeRoomId));
      return;
    }

    ws.current?.send(MessageCodec.encode({
      eventType: 'update',
      roomId: maybeRoomId.right,
      state: userShareableState,
    }));
  }, [
    userShareableState,
    // serializedState,
    // previousSerializedState,
    uri,
    mode.type,
  ]);

  return {
    mode,
    reconnect,
  };
}
