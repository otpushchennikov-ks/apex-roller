import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { rootBgColor } from '@styled/constants';


export const StartOverlayStyled = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  background-color: ${rootBgColor};
  display: flex;
`;

// export const initBtnStyles = css`
//   position: ;
// `;