import { useMemo } from 'react';
import { useLocation } from 'react-use';
import { RoomIdCodec } from '@apex-roller/shared';


export default function useCurrentRoomId() {
  const uri = useLocation()?.pathname?.slice(1)
  const maybeRoomId = useMemo(() => RoomIdCodec.decode(!uri ? uri : window.decodeURI(uri)), [uri]);

  return maybeRoomId;
}
