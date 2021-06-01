import styled from '@emotion/styled';
import { mainBoxWidth } from './constants';


const RootStyled = styled.div`
  width: 100vw;
  height: 100vh;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;

  .content {
    width: ${mainBoxWidth};
  }
`;

export default RootStyled;
