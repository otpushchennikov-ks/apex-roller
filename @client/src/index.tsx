import 'antd/dist/antd.css';
import { FC } from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import StartOverlay from '@components/StartOverlay';
import App from '@components/App';
import './initConfig';


const Root: FC = () => <StartOverlay render={() => <App />} />;

render(
  <BrowserRouter>
    <Root />
  </BrowserRouter>,
  document.getElementById('root')
);
