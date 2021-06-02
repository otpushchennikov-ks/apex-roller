import { FC, useState, useRef, useEffect } from 'react';
import { StartOverlayStyled } from './styled';
import { Button } from 'antd';
import { StartOverlayProps } from './types';


const StartOverlay: FC<StartOverlayProps> = ({ render }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isInit, setIsInit] = useState(false);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <>
      {!isInit ?
        <StartOverlayStyled>
          <Button
            ref={buttonRef}
            style={{ margin: 'auto', transform: 'scale(3)' }}
            onClick={() => setIsInit(true)}
            onBlur={() => buttonRef.current?.focus()}
          >
            Lets go!
          </Button>
        </StartOverlayStyled>
        :
        render()
      }
    </>
  );
};

export default StartOverlay;
