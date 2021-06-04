import { FC } from 'react';
import { Button, Checkbox, InputNumber, Select } from 'antd';
import { Global, css } from '@emotion/react';
import generateRandomBackgroundSrc from '@utils/generateRandomBackgroundSrc';
import { rootBgColor, gap } from '@styled/constants';
import { PlayCircleOutlined, RedoOutlined } from '@ant-design/icons';
import audioPlayer from '@modules/audioPlayer';
import RootStyled from '@styled/RootStyled';
import highlitedMixin from '@styled/highlitedMixin';
import ColumnStyled from '@styled/ColumnStyled';
import RowStyled from '@styled/RowStyled';
import useGlobalState from '@hooks/useGlobalState';


const Settings: FC = () => {
  const { settings, setSettings, mode } = useGlobalState();

  return (
    <ColumnStyled css={highlitedMixin} style={{ position: 'absolute', top: 20, right: 20, padding: 10 }}>
      <RowStyled style={{ marginBottom: gap }}>
        <Checkbox
          checked={settings.notificationIsEnabled}
          onChange={({ target: { checked }}) => setSettings(settings => ({
            ...settings,
            notificationIsEnabled: checked,
          }))}
        >
          Notification
        </Checkbox>
        <Select
          disabled={!settings.notificationIsEnabled}
          style={{ width: 175, marginRight: 10 }}
          dropdownMatchSelectWidth={false}
          value={settings.notificationKey ?? undefined}
          onChange={nextNotificationKey => setSettings(settings => ({
            ...settings,
            notificationKey: nextNotificationKey,
          }))}
        >
          {Object.entries(audioPlayer.map).map(([key, { name }]) => {
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
          disabled={settings.notificationIsEnabled}
          onClick={() => audioPlayer.play(settings.notificationKey)}
        >
          <PlayCircleOutlined />
        </Button>
      </RowStyled>
      {['host', 'private'].includes(mode.type) &&
        <div style={{ marginBottom: gap }}>
          <Checkbox
            checked={settings.missClickGuard.isEnabled}
            onChange={({ target: { checked }}) => setSettings(settings => ({
              ...settings,
              missClickGuard: {
                ...settings.missClickGuard,
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
            value={settings.missClickGuard.delay / 1000}
            onChange={value => setSettings(settings => ({
              ...settings,
              missClickGuard: {
                ...settings.missClickGuard,
                delay: value * 1000,
              }
            }))}
            style={{ margin: `0 ${gap}px 0 2px` }}
            disabled={!settings.missClickGuard.isEnabled}
          />
          <span>seconds</span>
        </div>
      }
      <div>
        <Checkbox
          checked={settings.backgroundImageIsEnabled}
          onChange={({ target: { checked }}) => {
            setSettings(settings => ({
              ...settings,
              backgroundImageIsEnabled: checked,
            }));

            if (!checked) {
              setSettings(settings => ({
                ...settings,
                backgroundSrc: null,
              }));
            } else {
              setSettings(settings => ({
                ...settings,
                backgroundSrc: generateRandomBackgroundSrc(settings.backgroundSrc ?? undefined),
              }));
            }
          }}
        >
          Background image
        </Checkbox>
        <Button
          disabled={!settings.backgroundImageIsEnabled}
          onClick={() => setSettings(settings => ({
            ...settings,
            backgroundSrc: generateRandomBackgroundSrc(settings.backgroundSrc ?? undefined),
          }))}
        >
          <RedoOutlined />
        </Button>
      </div>
      <Global styles={css`
        ${RootStyled} {
          background-color: ${rootBgColor};
          background-image:  ${settings.backgroundSrc ? `url(${settings.backgroundSrc})` : ''};
          background-position: center;
          background-size: cover;
        }
      `}/>
    </ColumnStyled>
  );
};

export default Settings;
