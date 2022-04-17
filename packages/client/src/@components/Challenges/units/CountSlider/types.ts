export type TCountSlider = {
  defaultValue: number;
  min: number;
  max: number;
  disabled: boolean;
  onAfterChange: (value: number) => void;
};