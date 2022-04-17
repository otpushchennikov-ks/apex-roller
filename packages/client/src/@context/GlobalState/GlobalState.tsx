import { FC, createContext, Dispatch, SetStateAction } from 'react';
import { UserShareableState as ShareableState } from '@packages/shared';
import {
  useShareableState,
  useMode,
  useSettings,
  defaultShareableState,
  ShareableStateAction,
  defaultMode,
  Mode,
  defaultSettings,
  Settings,
} from './hooks';


type GlobalState = {
  shareableState: ShareableState
  dispatchShareableState: Dispatch<ShareableStateAction>
  mode: Mode
  setMode: Dispatch<SetStateAction<Mode>>
  settings: Settings,
  setSettings: Dispatch<SetStateAction<Settings>>
};

const emptyFunction = () => { };
const defaultValue: GlobalState = {
  shareableState: defaultShareableState,
  dispatchShareableState: emptyFunction,
  mode: defaultMode,
  setMode: emptyFunction,
  settings: defaultSettings,
  setSettings: emptyFunction,
};

export const GlobalStateContext = createContext<GlobalState>(defaultValue);

export const GlobalStateContextProvider: FC = ({ children }) => {
  const { shareableState, dispatchShareableState } = useShareableState();
  const [mode, setMode] = useMode();
  const [settings, setSettings] = useSettings();

  return (
    <GlobalStateContext.Provider
      value={{
        shareableState,
        dispatchShareableState,
        mode,
        setMode,
        settings,
        setSettings,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};
