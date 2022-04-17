import { FC, useState } from 'react';
import { Slider } from '@material-ui/core';
import { TCountSlider } from './types';
import { range } from 'ramda';

export const CountSlider: FC<TCountSlider> = ({
  defaultValue,
  min,
  max,
  disabled,
  onAfterChange,
}) => {
  const [smoothValue, setSmoothValue] = useState(defaultValue);

  return (
    <Slider
      track={false}
      min={min}
      max={max}
      disabled={disabled}
      step={1}
      style={{ width: 'calc(100% - 35px)', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
      marks={range(min, max + 1).map(value => ({ value, label: value }))}
      value={smoothValue}
      onChange={(_, value) => setSmoothValue(value as number)}
      onChangeCommitted={(_, value) => onAfterChange(value as number)}
    />
  );
};