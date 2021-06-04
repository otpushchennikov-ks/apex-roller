import { FC, createContext, Dispatch, SetStateAction } from 'react';
import { UserShareableState as ShareableState } from '@apex-roller/shared';
import useShareableState, { defaultShareableState, ShareableStateAction } from './useShareableState';
import useMode, { defaultMode, Mode } from './useMode';
import useSettings, { defaultSettings, Settings } from './useSettings';


type GlobalState = {
  shareableState: ShareableState
  dispatchShareableState: Dispatch<ShareableStateAction>
  mode: Mode
  setMode: Dispatch<SetStateAction<Mode>>
  settings: Settings,
  setSettings: Dispatch<SetStateAction<Settings>>
};

const emptyFunction = () => {};
const defaultValue: GlobalState = {
  shareableState: defaultShareableState,
  dispatchShareableState: emptyFunction,
  mode: defaultMode,
  setMode: emptyFunction,
  settings: defaultSettings,
  setSettings: emptyFunction,
};

const GlobalStateContext = createContext<GlobalState>(defaultValue);

const GlobalStateContextProvider: FC = ({ children }) => {
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

export default GlobalStateContext;
export { GlobalStateContextProvider };
