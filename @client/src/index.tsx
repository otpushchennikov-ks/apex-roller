import 'antd/dist/antd.css'
import { render } from 'react-dom';
import Search from '@components/Search';
import { message } from 'antd';
import { RootStyled } from '@styled';
import useShareableStateReducer from '@hooks/useShareableStateReducer';
import useWebsocket from '@hooks/useWebsocket';
import { BrowserRouter } from 'react-router-dom';
import SettingsPrivate from '@components/SettingsPrivate';
import Challenges from '@components/Challenges';
import { useRef } from 'react';
import { SettingsPrivateImperativeAPI } from '@components/SettingsPrivate/types';


message.config({ maxCount: 3 });

function App() {
  const SettingsPrivateImperativeAPIRef = useRef<SettingsPrivateImperativeAPI | null>(null);

  const {
    shareableState,
    dispatchShareableState,
  } = useShareableStateReducer();

  const { mode, reconnect } = useWebsocket({
    shareableState,
    dispatchShareableState,
  });

  return (
    <RootStyled>
      <div className="content">
        <Search />
        <SettingsPrivate
          mode={mode}
          ref={SettingsPrivateImperativeAPIRef}
        />
        <Challenges
          mode={mode}
          runMissclickguard={SettingsPrivateImperativeAPIRef.current?.runGuard ?? (fn => fn())}
          reconnectWebsocket={reconnect}
          shareableState={shareableState}
          dispatchShareableState={dispatchShareableState}
        />
      </div>
    </RootStyled>
  );
}

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
