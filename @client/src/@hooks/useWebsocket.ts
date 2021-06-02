import { UserShareableState as ShareableState, MessageCodec, RoomIdCodec } from '@apex-roller/shared';
import { useEffectOnce, useLocation, usePrevious } from 'react-use';
import { useState, Dispatch, useRef, useEffect, useCallback } from 'react';
import getOrCreateUserId from '@utils/getOrCreateUserId';
import { ShareableStateAction } from './useShareableStateReducer';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { message as noty } from 'antd';
import { SettingsState } from '@components/Settings/types';
import audioPlayer from '@modules/audioPlayer';


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
  shareableState,
  dispatchShareableState,
  settings,
}: {
  shareableState: ShareableState,
  dispatchShareableState: Dispatch<ShareableStateAction>
  settings: SettingsState
}) {
  const location = useLocation();
  const uri = location.pathname?.slice(1);
  const ws = useRef<WebSocket | null>(null);
  const [mode, setMode] = useState<Mode>({ type: 'initializing' });

  const latestSettings = useRef(settings);
  const latestMode = useRef(mode);
  useEffect(() => {
    latestSettings.current = settings;
    latestMode.current = mode;
  });

  const reconnect = useCallback(() => {
    const maybeRoomId = RoomIdCodec.decode(uri);
    if (isLeft(maybeUserId) || isLeft(maybeRoomId)) return;

    ws.current?.send(MessageCodec.encode({
      eventType: 'connect', 
      roomId:maybeRoomId.right,
      userId: maybeUserId.right,
      state: {
        challengeIndex: shareableState.challengeIndex,
        isUnique: shareableState.isUnique,
        count: shareableState.count,
        weapons: shareableState.weapons,
      },
    }));
  }, [shareableState, uri]);

  const init = useCallback((): Promise<WebSocket> => new Promise(resolve => {
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
          resolve(ws.current!);
          noty.success(message.eventType);
          setMode({ type: message.isHost ? 'host' : 'client' });

          if (!message.isHost) {
            dispatchShareableState({ type: 'replaceState', nextState: message.state });
          }
          return;
        }

        case 'update': {
          console.log('update incoming');
          dispatchShareableState({ type: 'replaceState', nextState: message.state });
          audioPlayer.play(latestSettings.current.notificationKey);
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
  }), [dispatchShareableState, reconnect]);

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

  useEffect(() => {
    if (latestMode.current.type !== 'host' || !uri) return;

    const maybeRoomId = RoomIdCodec.decode(uri);

    if (isLeft(maybeRoomId)) {
      noty.error(PathReporter.report(maybeRoomId));
      return;
    }

    if (ws.current && ws.current.readyState === ws.current.OPEN) {
      ws.current.send(MessageCodec.encode({
        eventType: 'update',
        roomId: maybeRoomId.right,
        state: shareableState,
      }));
    }
  }, [shareableState, uri]);

  return {
    mode,
    reconnect,
  };
}
