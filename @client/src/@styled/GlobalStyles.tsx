import { Global, css } from '@emotion/react';
import { FC } from 'react';


const GlobalStyles: FC = () => {
  return (
    <Global styles={css`
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; }
    `}/>
  );
};

export default GlobalStyles;
