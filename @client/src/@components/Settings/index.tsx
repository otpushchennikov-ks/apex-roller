import { FC, useState } from 'react';
import { Global, css } from '@emotion/react';
import { generateRandomBackgroundSrc } from '@utils/random';
import { padding, margin } from '@styled/constants';
import audioPlayer from '@modules/audioPlayer';
import RootStyled from '@styled/RootStyled';
import ColumnStyled from '@styled/ColumnStyled';
import RowStyled from '@styled/RowStyled';
import useGlobalState from '@hooks/useGlobalState';
import { SwipeableDrawer, Button, Checkbox, Slider, Select, MenuItem, FormControlLabel } from '@material-ui/core';
import { PlayCircleOutline, ReplayOutlined, SettingsOutlined } from '@material-ui/icons';
import { range } from 'ramda';


const Settings: FC = () => {
  const { settings, setSettings, mode } = useGlobalState();
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="text"
        style={{ position: 'absolute', top: 20, right: 20 }}
        onClick={() => setDrawerIsOpen(true)}
      >
        <SettingsOutlined />
      </Button>
      <SwipeableDrawer
        anchor="right"
        open={drawerIsOpen}
        onOpen={() => setDrawerIsOpen(true)}
        onClose={() => setDrawerIsOpen(false)}
      >
        <ColumnStyled style={{ padding }}>
          <ColumnStyled style={{ marginBottom: margin, alignItems: 'flex-start' }}>
            <FormControlLabel
              label="Notification"
              control={
                <Checkbox
                  size="small"
                  color="primary"
                  checked={settings.notificationIsEnabled}
                  onChange={({ target: { checked }}) => setSettings(settings => ({
                    ...settings,
                    notificationIsEnabled: checked,
                  }))}
                />
              }
            />
            <RowStyled>
              <Select
                disabled={!settings.notificationIsEnabled}
                style={{ width: 175, marginRight: 10 }}
                value={settings.notificationKey}
                onChange={({ target: { value }}) => setSettings(settings => ({
                  ...settings,
                  notificationKey: value as string,
                }))}
              >
                {Object.entries(audioPlayer.map).map(([key, { name }]) => {
                  return (
                    <MenuItem
                      key={key}
                      value={key}
                    >
                      {name}
                    </MenuItem>
                  );
                })}
              </Select>
              <Button
                size="small"
                variant="text"
                onClick={() => audioPlayer.play(settings.notificationKey)}
              >
                <PlayCircleOutline />
              </Button>
            </RowStyled>
          </ColumnStyled>
          {(mode.type === 'host' || mode.type === 'private') &&
            <ColumnStyled style={{ marginBottom: margin, alignItems: 'flex-start' }}>
              <FormControlLabel
                label="Missclick guard"
                control={
                  <Checkbox
                    size="small"
                    color="primary"
                    checked={settings.missClickGuard.isEnabled}
                    onChange={({ target: { checked }}) => setSettings(settings => ({
                      ...settings,
                      missClickGuard: {
                        ...settings.missClickGuard,
                        isEnabled: checked,
                      }
                    }))}
                  />
                }
              />
              <Slider
                valueLabelDisplay="auto"
                min={1}
                max={5}
                step={0.1}
                disabled={!settings.missClickGuard.isEnabled}
                style={{ width: 'calc(100% - 35px)', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
                marks={range(1, 6).map(value => ({ value, label: `${value} sec.` }))}
                value={settings.missClickGuard.delay / 1000}
                onChange={(_, value) => setSettings(settings => ({
                  ...settings,
                  missClickGuard: {
                    ...settings.missClickGuard,
                    delay: (value as number) * 1000,
                  }
                }))}
              />
            </ColumnStyled>
          }
          <div>
            <FormControlLabel
              label="Background image"
              control={
                <Checkbox
                  size="small"
                  color="primary"
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
                />
              }
            />
            <Button
              size="small"
              variant="text"
              disabled={!settings.backgroundImageIsEnabled}
              onClick={() => setSettings(settings => ({
                ...settings,
                backgroundSrc: generateRandomBackgroundSrc(settings.backgroundSrc ?? undefined),
              }))}
            >
              <ReplayOutlined />
            </Button>
          </div>
        </ColumnStyled>
      </SwipeableDrawer>
      <Global styles={css`
        ${RootStyled} {
          background-image:  ${settings.backgroundSrc ? `url(${settings.backgroundSrc})` : ''};
          background-position: center;
          background-size: cover;
        }
      `}/>
    </>
  );
};

export default Settings;
