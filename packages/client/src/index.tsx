import './init-config';
import { FC } from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { StartOverlay, Challenges, Search, Settings, TopRooms } from '@components';
import { GlobalStateContextProvider } from '@context/GlobalState';
import { RootStyled, GlobalStyles } from '@styled';
import { createTheme, ThemeProvider, useTheme } from '@material-ui/core';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';


const theme = createTheme({
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


serviceWorkerRegistration.register();
reportWebVitals();
