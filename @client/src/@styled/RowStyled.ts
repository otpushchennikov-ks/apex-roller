import styled from '@emotion/styled';


const RowStyled = styled.div<{ leadItemWidth?: string | number }>`
  > *:first-child {
    width: ${({ leadItemWidth = 'auto' }) => typeof leadItemWidth === 'string' ? leadItemWidth : `${leadItemWidth}px`};
  }
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default RowStyled;
