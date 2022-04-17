import { FC, useState, useEffect, useCallback } from 'react';
import { StartOverlayStyled } from './styled';
import { StartOverlayProps } from './types';
import { Typography } from '@material-ui/core';


export const StartOverlay: FC<StartOverlayProps> = ({ render }) => {
  const [isInit, setIsInit] = useState(false);

  const handleInit = useCallback(() => {
    setIsInit(true);
    window.removeEventListener('click', handleInit);
    window.removeEventListener('keypress', handleInit);
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleInit);
    window.addEventListener('keypress', handleInit);
  }, [handleInit]);

  return (
    <>
      {!isInit ?
        <StartOverlayStyled>
          <Typography
            color="textPrimary"
            style={{ margin: 'auto', fontSize: 64 }}
          >
            Lets go!
          </Typography>
        </StartOverlayStyled>
        :
        render()
      }
    </>
  );
};
