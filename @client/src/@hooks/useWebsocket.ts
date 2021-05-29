// import { UserShareableState, ConnectMessageCodec } from '../../../shared/types';
import { UserShareableState, MessageCodec, RoomId, UserId } from '@apex-roller/shared';
import { useEffectOnce, useLocation, useLocalStorage } from 'react-use';
import { useRef, useEffect } from 'react';
import getUserId from '@utils/getUserId';


const host = process.env.NODE_ENV === 'production' ?
  window.location.origin.replace(/^http/, 'ws')
  :
  'ws://localhost:5000';

export default function useWebsocket(userShareableState: UserShareableState) {
  const wsClientRef = useRef<WebSocket | null>(null);
  const weaponsIsInitRef = useRef(false);
  const location = useLocation();
  const roomId = location.pathname?.slice(1);

  // Инициализация wsClient и отправка сообщения 'connect' при получении
  // корректных weapons из persisted state
  useEffect(() => {
    if (
      !roomId ||
      weaponsIsInitRef.current ||
      !userShareableState.weapons.length
    ) return;

    weaponsIsInitRef.current = true;

    wsClientRef.current = new WebSocket(host);

    wsClientRef.current!.onopen = () => {
      const connectData = MessageCodec.encode({
        eventType: 'connect',
        roomId: roomId as RoomId,
        userId: getUserId() as UserId,
        state: {
          challengeIndex: userShareableState.challengeIndex,
          isUnique: userShareableState.isUnique,
          count: userShareableState.count,
          weapons: userShareableState.weapons,
        },
      });
      
      // wsClientRef.current!.send(JSON.stringify(connectData));

    };
  }, [userShareableState, roomId]);
}
