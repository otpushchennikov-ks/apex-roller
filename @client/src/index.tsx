import 'antd/dist/antd.css';
import { FC } from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import StartOverlay from '@components/StartOverlay';
import { GlobalStateContextProvider } from '@context/GlobalState';
import RootStyled from '@styled/RootStyled';
import Challenges from '@components/Challenges';
import Search from '@components/Search';
import Settings from '@components/Settings';
import TopRooms from '@components/TopRooms';
import './initConfig';


const App: FC = () => {
  return (
    <RootStyled>
      <div className="content">
        <TopRooms />
        <Search />
        <Settings />
        <Challenges />
      </div>
    </RootStyled>
  );
};

const Root: FC = () => {
  return (
    <GlobalStateContextProvider>
      <StartOverlay
        render={() => <App />}
      />
    </GlobalStateContextProvider>
  );
};

render(
  <BrowserRouter>
    <Root />
  </BrowserRouter>,
  document.getElementById('root')
);
