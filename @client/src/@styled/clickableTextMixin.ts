import { css } from '@emotion/react';
import { clickableTextColor } from './constants';

const clickableTextMixin = css`
  color: ${clickableTextColor};
  cursor: pointer;
  text-decoration: none;
  font-weight: bold;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default clickableTextMixin;
