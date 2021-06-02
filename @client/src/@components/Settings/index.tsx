import { useState, forwardRef, useEffect, Dispatch, SetStateAction } from 'react';
import { Button, Checkbox, InputNumber, Select } from 'antd';
import { SettingsProps, SettingsImperativeAPI, SettingsState } from './types';
import { Global, css } from '@emotion/react';
import generateRandomBackgroundSrc from '@utils/generateRandomBackgroundSrc';
import { RootStyled, highlitedMixin, ColumnStyled, RowStyled } from '@styled';
import { rootBgColor, gap } from '@styled/constants';
import useImperativeApi from './useImperativeApi';
import { useLocalStorage } from 'react-use';
import { PlayCircleOutlined, RedoOutlined } from '@ant-design/icons';
import { audioMap, playAudio } from '@utils/audio';


const persistKey = 'settings-private-state-persist';

const defaultSettingsState: SettingsState = {
  notificationIsEnabled: false,
  notificationKey: 'allEyesOnMe',
  backgroundImageIsEnabled: false,
  backgroundSrc: null,
  missClickGuard: {
    isEnabled: true,
    delay: 1000,
  },
};

export const useSettingsState: () => [SettingsState, Dispatch<SetStateAction<SettingsState>>] = () => {
  const [initialState, persistState] = useLocalStorage(persistKey, defaultSettingsState);
  const [state, setState] = useState<SettingsState>(initialState!);
  useEffect(() => persistState(state), [state, persistState]);
  return [state, setState];
};

const Settings = forwardRef<SettingsImperativeAPI, SettingsProps>(({ mode, state, setState }, ref) => {


  useImperativeApi(ref, state);

  return (
    <ColumnStyled css={highlitedMixin} style={{ position: 'absolute', top: 20, right: 20, padding: 10 }}>
      <RowStyled style={{ marginBottom: gap }}>
        <Checkbox
          checked={state.notificationIsEnabled}
          onChange={({ target: { checked }}) => setState(state => ({
            ...state,
            notificationIsEnabled: checked,
          }))}
        >
          Notification
        </Checkbox>
        <Select
          disabled={!state.notificationIsEnabled}
          style={{ width: 175, marginRight: 10 }}
          dropdownMatchSelectWidth={false}
          value={state.notificationKey ?? undefined}
          onChange={nextNotificationKey => setState(state => ({
            ...state,
            notificationKey: nextNotificationKey,
          }))}
        >
          {Object.entries(audioMap).map(([key, { name }]) => {
            return (
              <Select.Option
                key={key}
                value={key}
              >
                {name}
              </Select.Option>
            );
          })}
        </Select>
        <Button
          disabled={state.notificationIsEnabled}
          onClick={() => playAudio(state.notificationKey)}
        >
          <PlayCircleOutlined />
        </Button>
      </RowStyled>
      {['host', 'private'].includes(mode.type) &&
        <div style={{ marginBottom: gap }}>
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
      <div>
        <Checkbox
          checked={state.backgroundImageIsEnabled}
          onChange={({ target: { checked }}) => {
            setState(state => ({
              ...state,
              backgroundImageIsEnabled: checked,
            }));

            if (!checked) {
              setState(state => ({
                ...state,
                backgroundSrc: null,
              }));
            } else {
              setState(state => ({
                ...state,
                backgroundSrc: generateRandomBackgroundSrc(state.backgroundSrc ?? undefined),
              }));
            }
          }}
        >
          Background image
        </Checkbox>
        <Button
          disabled={!state.backgroundImageIsEnabled}
          onClick={() => setState(state => ({
            ...state,
            backgroundSrc: generateRandomBackgroundSrc(state.backgroundSrc ?? undefined),
          }))}
        >
          <RedoOutlined />
        </Button>
      </div>
      <Global styles={css`
        ${RootStyled} {
          background-color: ${rootBgColor};
          background-image:  ${state.backgroundSrc ? `url(${state.backgroundSrc})` : ''};
          background-position: center;
          background-size: cover;
        }
      `}/>
    </ColumnStyled>
  );
});

export default Settings;
