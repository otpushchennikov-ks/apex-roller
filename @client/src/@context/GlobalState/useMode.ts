import { useState, Dispatch, SetStateAction } from 'react';


type Mode =
  | { type: 'initializing' }
  | { type: 'private' }
  | { type: 'host' }
  | { type: 'client' }
  | { type: 'disconnected' }
  | { type: 'error', text: string };


const defaultMode: Mode = { type: 'initializing' };

function useMode(): [Mode, Dispatch<SetStateAction<Mode>>] {
  const [mode, setMode] = useState<Mode>({ type: 'initializing' });

  return [mode, setMode];
}

export { defaultMode };
export type { Mode };
export default useMode;
