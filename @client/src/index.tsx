import 'antd/dist/antd.css'
import { render } from 'react-dom';
import Search from '@components/Search';
import RootStyled from '@styled/RootStyled';
import useShareableStateReducer from '@hooks/useShareableStateReducer';
import useWebsocket from '@hooks/useWebsocket';
import { BrowserRouter } from 'react-router-dom';
import Settings from '@components/Settings';
import Challenges from '@components/Challenges';
import { useSettingsState } from '@components/Settings';
import StartOverlay from '@components/StartOverlay';
import { FC } from 'react';
import TopRooms from '@components/TopRooms';
import './initConfig';


function App() {
  const [settings, setSettings] = useSettingsState();

  const {
    shareableState,
    dispatchShareableState,
  } = useShareableStateReducer();
  
  const { mode, reconnect } = useWebsocket({
    shareableState,
    dispatchShareableState,
    settings,
  });

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
          settings={settings}
          reconnectWebsocket={reconnect}
          shareableState={shareableState}
          dispatchShareableState={dispatchShareableState}
        />
      </div>
    </RootStyled>
  );
}

const Root: FC = () => {
  return (
    <StartOverlay
      render={() => <App />}
    />
  );
};

render(
  <BrowserRouter>
    <Root />
  </BrowserRouter>,
  document.getElementById('root')
);
