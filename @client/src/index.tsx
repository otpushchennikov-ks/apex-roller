import './initConfig';
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
import { createMuiTheme, ThemeProvider, useTheme } from '@material-ui/core';
import GlobalStyles from '@styled/GlobalStyles';


const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#263238',
      light: '#4f5b62',
      dark: '#000a12',
      contrastText: '#fff',
    },
  },
});

const App: FC = () => {
  const theme = useTheme();
  
  return (
    <GlobalStateContextProvider>
      <RootStyled mainBgColor={theme.palette.background.default}>
        <StartOverlay
          render={() => {
            return (
              <div style={{ minWidth: 320 }}>
                <TopRooms />
                <Search />
                <Settings />
                <Challenges />
              </div>
            );
          }}
        />
      </RootStyled>
      <GlobalStyles />
    </GlobalStateContextProvider>
  );
};

render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
