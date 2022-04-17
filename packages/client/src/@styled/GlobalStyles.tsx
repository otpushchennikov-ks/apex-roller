import { Global, css } from '@emotion/react';
import { FC } from 'react';


export const GlobalStyles: FC = () => {
  return (
    <Global styles={css`
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; }
    `} />
  );
};
