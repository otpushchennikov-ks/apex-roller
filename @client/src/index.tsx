import 'antd/dist/antd.css'
import { render } from 'react-dom';
import Search from '@components/Search';
import { message } from 'antd';
import { RootStyled } from '@styled';
import useShareableStateReducer from '@hooks/useShareableStateReducer';
import useWebsocket from '@hooks/useWebsocket';
import { BrowserRouter } from 'react-router-dom';
import Settings from '@components/Settings';
import Challenges from '@components/Challenges';
import { useRef } from 'react';
import { useSettingsState } from '@components/Settings';
import { SettingsImperativeAPI } from '@components/Settings/types';
import StartOverlay from '@components/StartOverlay';
import { FC } from 'react';
import axios from 'axios';
import { restHost } from '@utils/constants';
import TopRooms from '@components/TopRooms';


axios.defaults.baseURL = restHost;
message.config({ maxCount: 3 });

function App() {
  const SettingsImperativeAPIRef = useRef<SettingsImperativeAPI | null>(null)
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
          ref={SettingsImperativeAPIRef}
        />
        <Challenges
          mode={mode}
          runMissclickguard={SettingsImperativeAPIRef.current?.runGuard ?? (fn => fn())}
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
