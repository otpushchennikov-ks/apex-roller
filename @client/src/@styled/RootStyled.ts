import styled from '@emotion/styled';
import { margin } from './constants';


const RootStyled = styled.div<{ mainBgColor: string }>`
  width: 100%;
  min-height: 100vh;
  background-size: cover;
  padding: ${margin}px;
  background-color: ${({ mainBgColor }) => mainBgColor};
  display: flex;
  justify-content: center;
  align-items: center;
  @media (max-width: 768px) {
    padding-top: ${margin * 3}px;
  }
`;

export default RootStyled;
