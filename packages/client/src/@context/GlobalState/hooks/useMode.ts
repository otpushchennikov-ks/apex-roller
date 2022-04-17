import { useState, Dispatch, SetStateAction } from 'react';


export type Mode =
  | { type: 'initializing' }
  | { type: 'private' }
  | { type: 'host' }
  | { type: 'client' }
  | { type: 'disconnected' }
  | { type: 'error', text: string };


export const defaultMode: Mode = { type: 'initializing' };

export function useMode(): [Mode, Dispatch<SetStateAction<Mode>>] {
  const [mode, setMode] = useState<Mode>({ type: 'initializing' });

  return [mode, setMode];
}
