import { useState, forwardRef, useEffect } from 'react';
import { Checkbox, InputNumber } from 'antd';
import { SettingsPrivateProps, SettingsPrivateImperativeAPI, SettingsPrivateState } from './types';
import { Global, css } from '@emotion/react';
import generateRandomBackgroundSrc from '@utils/generateRandomBackgroundSrc';
import { RootStyled, highlitedMixin } from '@styled';
import { rootBgColor, gap } from '@styled/constants';
import useGuard from './useGuard';
import { useLocalStorage } from 'react-use';


const persistKey = 'settings-private-state-persist';

const defaultSettingsPrivateState: SettingsPrivateState = {
  isWithBackground: false,
  currentBackgroundSrc: null,
  missClickGuard: {
    isEnabled: true,
    delay: 1000,
  },
};

const SettingsPrivate = forwardRef<SettingsPrivateImperativeAPI, SettingsPrivateProps>(({ mode }, ref) => {
  const [initialState, persistState] = useLocalStorage(persistKey, defaultSettingsPrivateState);
  const [state, setState] = useState<SettingsPrivateState>(initialState!);
  console.log(state.missClickGuard.delay);

  useEffect(() => persistState(state), [state, persistState]);

  useGuard(ref, state.missClickGuard);

  return (
    <>
      <div
        css={highlitedMixin}
        style={{ position: 'absolute', top: 20, left: 20, padding: 10 }}
      >
        <Checkbox
          checked={state.isWithBackground}
          onChange={({ target: { checked }}) => {
            setState(state => ({
              ...state,
              isWithBackground: checked,
            }));

            if (!checked) {
              setState(state => ({
                ...state,
                currentBackgroundSrc: null,
              }));
            } else {
              setState(state => ({
                ...state,
                currentBackgroundSrc: generateRandomBackgroundSrc(state.currentBackgroundSrc ?? undefined),
              }));
            }
          }}
        >
          with background
        </Checkbox>
      </div>
      {['host', 'private'].includes(mode.type) &&
        <div
          css={highlitedMixin}
          style={{ position: 'absolute', top: 20, right: 20 }}
        >
          <Checkbox
            checked={state.missClickGuard.isEnabled}
            onChange={({ target: { checked }}) => setState(state => ({
              ...state,
              missClickGuard: {
                ...state.missClickGuard,
                isEnabled: checked,
              }
            }))}
          >
            Missclick guard
          </Checkbox>
          <InputNumber
            min={1}
            step={0.1}
            max={5}
            value={state.missClickGuard.delay / 1000}
            onChange={value => {console.log(value); setState(state => ({
              ...state,
              missClickGuard: {
                ...state.missClickGuard,
                delay: value * 1000,
              }
            }))}}
            style={{ margin: `0 ${gap}px 0 2px` }}
            disabled={!state.missClickGuard.isEnabled}
          />
          <span>seconds</span>
        </div>
      }
      <Global styles={css`
        ${RootStyled} {
          background-color: ${rootBgColor};
          background-image:  ${state.currentBackgroundSrc ? `url(${state.currentBackgroundSrc})` : ''};
          background-position: center;
          background-size: cover;
        }
      `}/>
    </>
  );
});

export default SettingsPrivate;
