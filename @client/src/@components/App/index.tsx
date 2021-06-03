import Search from '@components/Search';
import RootStyled from '@styled/RootStyled';
import useShareableStateReducer from '@hooks/useShareableStateReducer';
import Settings from '@components/Settings';
import Challenges from '@components/Challenges';
import { useSettingsState } from '@components/Settings';
import { FC, useState } from 'react';
import TopRooms from '@components/TopRooms';
import { Mode } from './types';


const App: FC = () => {
  // TODO: шарить это через контекст
  const [settings, setSettings] = useSettingsState();
  const [mode, setMode] = useState<Mode>({ type: 'initializing' });
  const { shareableState, dispatchShareableState } = useShareableStateReducer();

  return (
    <RootStyled>
      <div className="content">
        <TopRooms />
        <Search />
        <Settings
          state={settings}
          setState={setSettings}
          mode={mode}
        />
        <Challenges
          mode={mode}
          setMode={setMode}
          settings={settings}
          shareableState={shareableState}
          dispatchShareableState={dispatchShareableState}
        />
      </div>
    </RootStyled>
  );
}

export default App;
