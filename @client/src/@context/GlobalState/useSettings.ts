import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { useLocalStorage } from 'react-use';


const persistKey = 'settings-private-state-persist';

type Settings = {
  notificationIsEnabled: boolean
  notificationKey: string
  backgroundImageIsEnabled: boolean
  backgroundSrc: string | null
  missClickGuard: {
    isEnabled: boolean
    delay: number
  }
}

const defaultSettings: Settings = {
  notificationIsEnabled: false,
  notificationKey: 'allEyesOnMe',
  backgroundImageIsEnabled: false,
  backgroundSrc: null,
  missClickGuard: {
    isEnabled: true,
    delay: 1000,
  },
};

function useSettings(): [Settings, Dispatch<SetStateAction<Settings>>] {
  const [initialState, persistState] = useLocalStorage(persistKey, defaultSettings);
  const [state, setState] = useState<Settings>(initialState!);
  useEffect(() => persistState(state), [state, persistState]);
  
  return [state, setState];
}

export type { Settings };
export { defaultSettings };
export default useSettings;
