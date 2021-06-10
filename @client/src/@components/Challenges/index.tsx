import { getChallenges } from '@modules/challenges';
import { FC, Fragment, useCallback, useEffect, useState, ReactNode } from 'react';
import { AmmoType } from '@apex-roller/shared';
import { ReactComponent as ArrowsAmmo } from '@images/arrows-ammo.svg';
import { ReactComponent as EnergyAmmo } from '@images/energy-ammo.svg';
import { ReactComponent as HeavyAmmo } from '@images/heavy-ammo.svg';
import { ReactComponent as LightAmmo } from '@images/light-ammo.svg';
import { ReactComponent as ShotgunAmmo } from '@images/shotgun-ammo.svg';
import { ReactComponent as SniperAmmo } from '@images/sniper-ammo.svg';
import { ReactComponent as RelicEnergyAmmo } from '@images/relic-energy-ammo.svg';
import { ReactComponent as RelicHeavyAmmo } from '@images/relic-heavy-ammo.svg';
import { ReactComponent as RelicLightAmmo } from '@images/relic-light-ammo.svg';
import { ReactComponent as RelicShotgunAmmo } from '@images/relic-shotgun-ammo.svg';
import { ReactComponent as RelicSniperAmmo } from '@images/relic-sniper-ammo.svg';
import { css } from '@emotion/react';
import ColumnStyled from '@styled/ColumnStyled';
import RowStyled from '@styled/RowStyled';
import { margin, gap, padding } from '@styled/constants';
import { v4 as uuid } from 'uuid';
import Guard from '@utils/missClickGuard';
import { generateRandomIndex } from '@utils/random';
import WebsocketService from '@modules/websocketService';
import useCurrentRoomId from '@hooks/useCurrentRoomId';
import audioPlayer from '@modules/audioPlayer';
import getOrCreateUserId from '@utils/getOrCreateUserId';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { useLatest, useUpdateEffect } from 'react-use';
import useGlobalState from '@hooks/useGlobalState';
import { Skeleton } from '@material-ui/lab';
import { ReplayOutlined, InfoOutlined, ErrorOutline } from '@material-ui/icons';
import {
  Button,
  Paper,
  Typography,
  Checkbox,
  Select,
  FormControl,
  FormLabel,
  InputLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  MenuItem,
  List,
  ListItem,
  Slider,
  Modal,
  Fade,
  Backdrop,
} from '@material-ui/core';
import { range } from 'ramda';
import useMessage from '@hooks/useMessage';


const wss = new WebsocketService();

const relicAmmoTypeImagesMap: Record<AmmoType, typeof ArrowsAmmo> = {
  Light: RelicLightAmmo,
  Heavy: RelicHeavyAmmo,
  Energy: RelicEnergyAmmo,
  Shotgun: RelicShotgunAmmo,
  Sniper: RelicSniperAmmo,
  Arrows: ArrowsAmmo, // такого релика нет
};

const ammoTypeImagesMap: Record<AmmoType, typeof ArrowsAmmo> = {
  Light: LightAmmo,
  Heavy: HeavyAmmo,
  Energy: EnergyAmmo,
  Shotgun: ShotgunAmmo,
  Sniper: SniperAmmo,
  Arrows: ArrowsAmmo,
};

const guard = new Guard();


const Challenges: FC = () => {
  const { messageJsx, showMessage } = useMessage();
  const [fullPoolModalIsOpen, setFullPoolModalIsOpen] = useState(false);

  const {
    mode,
    setMode,
    shareableState,
    dispatchShareableState,
    settings,
  } = useGlobalState();

  const { maybeRoomId, uriIsEmpty } = useCurrentRoomId();

  const stableShowMessage = useLatest(showMessage);
  const stableDispatchShareableState = useLatest(dispatchShareableState);
  const stableSetMode = useLatest(setMode);
  const stableMode = useLatest(mode);
  const stableSettings = useLatest(settings);
  const stableShareableState = useLatest(shareableState);
  const stableUriIsEmpty = useLatest(uriIsEmpty);
  
  const {
    missClickGuard: {
      delay: guardDelay,
      isEnabled: guardIsEnabled,
    },
  } = settings;
  const guardFailureMessage = `No more than once every ${guardDelay / 1000} seconds`;

  useEffect(() => {
    guard.reinit(guardIsEnabled ? guardDelay : 0);
  }, [guardDelay, guardIsEnabled]);

  const registerHandlers = useCallback(() => {
    wss.on('connected', message => {
      stableShowMessage.current('success', message.eventType);
      stableSetMode.current({ type: message.isHost ? 'host' : 'client' });
      if (!message.isHost) {
        stableDispatchShareableState.current({ type: 'replaceState', nextState: message.state });
      }  
    });

    wss.on('disconnect', message => {
      stableShowMessage.current('info', message.eventType);
      stableSetMode.current({ type: 'disconnected' });
      wss.disconnect();
    });

    wss.on('error', message => {
      stableShowMessage.current('error', message.message);
      stableSetMode.current({ type: 'error', text: message.message });  
    });
    
    wss.on('update', message => {
      stableDispatchShareableState.current({ type: 'replaceState', nextState: message.state });
      audioPlayer.play(stableSettings.current.notificationKey);  
    });
  }, [stableDispatchShareableState, stableSetMode, stableSettings, stableShowMessage]);

  // Получение эвентов
  useEffect(() => {
    if (stableUriIsEmpty.current) {
      wss.disconnect();
      stableShowMessage.current('info', 'private');
      stableSetMode.current({ type: 'private' });
      return;
    }

    const maybeUserId = getOrCreateUserId();

    if (isLeft(maybeUserId)) {
      const error = PathReporter.report(maybeUserId).join('; ');
      console.log(error);
      stableShowMessage.current('error', error);
      return;
    }

    if (isLeft(maybeRoomId)) {
      const error = PathReporter.report(maybeRoomId).join('; ');
      console.log(error);
      stableShowMessage.current('error', error);
      return;
    }
    
    wss.connect(maybeUserId.right, maybeRoomId.right, stableShareableState.current)
      .then(() => registerHandlers());

  }, [
    maybeRoomId,
    stableUriIsEmpty,
    stableShareableState,
    stableSetMode,
    registerHandlers,
    stableShowMessage,
  ]);

  // Отправка эвентов
  useUpdateEffect(() => {
    if (stableMode.current.type !== 'host' || stableUriIsEmpty.current) {
      return;
    }

    if (isLeft(maybeRoomId)) {
      const error = PathReporter.report(maybeRoomId).join('; ');
      console.log(error);
      stableShowMessage.current('error', error);
      return;
    }

    wss.send({
      eventType: 'update',
      roomId: maybeRoomId.right,
      state: shareableState,
    });
  }, [
    maybeRoomId,
    shareableState,
    stableSetMode,
    stableMode,
  ]);

  const dataEntryIsDisabled = mode.type !== 'host' && mode.type !== 'private';
  const currentChallenge = getChallenges(shareableState.challengeMode)[shareableState.challengeIndex];

  const getJsx = (): ReactNode => {
    switch (mode.type) {
      case 'initializing':
        return (
          <Paper style={{ padding }}>
            <ColumnStyled style={{ alignItems: 'center', marginBottom: margin }}>
              <Skeleton variant="rect" style={{ width: 320, height: 32, marginBottom: gap }}/>
              <Skeleton variant="rect" style={{ width: 320, height: 32, marginBottom: gap }}/>
              <Skeleton variant="rect" style={{ width: 220, height: 32, marginBottom: gap }}/>
              <Skeleton variant="rect" style={{ width: 140, height: 32 }} />
            </ColumnStyled>
            <ColumnStyled style={{ alignItems: 'center' }}>
              <RowStyled style={{ marginBottom: gap }}>
                <Skeleton variant="circle" style={{ height: 32, width: 32, marginRight: gap }}/>
                <Skeleton variant="rect" style={{ height: 32, width: 278 }}/>
              </RowStyled>
              <RowStyled>
                <Skeleton variant="circle" style={{ height: 32, width: 32, marginRight: gap }}/>
                <Skeleton variant="rect" style={{ height: 32, width: 278 }}/>
              </RowStyled>
            </ColumnStyled>
          </Paper>
        );
      case 'disconnected':
        return (
          <Paper style={{ padding }}>
            <ColumnStyled style={{ alignItems: 'center' }}>
              <InfoOutlined
                color="action"
                style={{ fontSize: 99 }}
              />
              <Typography style={{ fontWeight: 'bold', fontSize: 32 }}>Disconnected</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  const maybeUserId = getOrCreateUserId();
  
                  if (isLeft(maybeUserId)) {
                    const error = PathReporter.report(maybeUserId).join('; ');
                    console.log(error);
                    showMessage('error', error);
  
                    return;
                  }

                  if (isLeft(maybeRoomId)) {
                    const error = PathReporter.report(maybeRoomId).join('; ');
                    console.log(error);
                    showMessage('error', error);
                    return;
                  }
  
                  wss.connect(maybeUserId.right, maybeRoomId.right, shareableState)
                    .then(() => registerHandlers());
                }}
                size="large"
              >
                Reconnect
              </Button>
            </ColumnStyled>
          </Paper>
        );
      case 'error':
        return (
          <Paper style={{ padding }}>
            <ColumnStyled style={{ alignItems: 'center' }}>
              <ErrorOutline style={{ fontSize: 99 }} color="error" />
              <Typography style={{ fontWeight: 'bold', fontSize: 32 }}>{mode.text}</Typography>
            </ColumnStyled>
          </Paper>
        );
      case 'private':
      case 'host':
      case 'client':
        return (
          <>
            <Paper style={{ padding, marginBottom: margin }}>
              <RowStyled style={{ justifyContent: 'center' }}>
                <FormControl style={{ textAlign: 'center' }}>
                  <FormLabel>Mode</FormLabel>
                  <RadioGroup
                    row={true}
                    value={shareableState.challengeMode}
                    onChange={({ target: { value }}) => dispatchShareableState({
                      type: 'changeChallengeMode',
                      nextMode: value as string,
                    })}
                  >
                    <FormControlLabel
                      label="BR"
                      control={
                        <Radio
                          disabled={dataEntryIsDisabled}
                          value="BR"
                          color="default"
                        />
                      }
                    />
                    <FormControlLabel
                      label="ARENA"
                      control={
                        <Radio
                          disabled={dataEntryIsDisabled}
                          value="ARENA"
                          color="default"
                        />
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </RowStyled>
              <RowStyled>
                <FormControl style={{ marginRight: gap, flexGrow: 2 }}>
                  <InputLabel color="primary" id="challenge">Challenge</InputLabel>
                  <Select
                    labelId="challenge"
                    value={shareableState.challengeIndex}
                    onChange={({ target: { value }}) => dispatchShareableState({
                      type: 'changeChallengeIndex',
                      nextIndex: value as number,
                    })}
                    disabled={dataEntryIsDisabled}
                  >
                    {getChallenges(shareableState.challengeMode).map(({ name }, i) => {
                      return (
                        <MenuItem key={uuid()} value={i}>
                          {name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                <Button
                  color="default"
                  size="small"
                  disabled={dataEntryIsDisabled}
                  onClick={() => {
                    guard.try('rollChallenge', () => {
                      dispatchShareableState({
                        type: 'changeChallengeIndex',
                        nextIndex: generateRandomIndex(getChallenges(shareableState.challengeMode).length),
                      });
                    }, () => showMessage('info', guardFailureMessage));
                  }}
                >
                  <ReplayOutlined />
                </Button>
              </RowStyled>
              {currentChallenge.description &&
                <ColumnStyled style={{ marginTop: margin }}>
                  <Typography style={{ fontSize: 14 }} color="textSecondary">Description</Typography>
                  <Typography style={{ maxWidth: 298 }}>
                    {currentChallenge.description}
                  </Typography>
                </ColumnStyled>
              }
              {Boolean(currentChallenge.settingsForRender?.length) &&
                <ColumnStyled style={{ marginTop: margin, alignItems: 'flex-start' }}>
                  <Typography style={{ fontSize: 14 }} color="textSecondary">Settings</Typography>
                  {currentChallenge.settingsForRender!.map(setting => {
                    switch (setting.type) {
                      case 'boolean':
                        return (
                          <FormControlLabel
                            label={setting.label}
                            control={
                              <Checkbox
                                disabled={dataEntryIsDisabled}
                                size="small"
                                color="default"
                                checked={shareableState.challengeSettings[setting.id]! as boolean}
                                onChange={({ target: { checked }}) => dispatchShareableState({
                                  type: 'changeChallengeSettings',
                                  nextSettings: {
                                    ...shareableState.challengeSettings,
                                    [setting.id]: checked,
                                  },
                                })}
                              />
                            }
                          />
                        );
                      case 'number':
                        return (
                          <Slider
                            key={setting.min + setting.max}
                            valueLabelDisplay="auto"
                            min={setting.min}
                            max={setting.max}
                            disabled={dataEntryIsDisabled}
                            step={1}
                            style={{ width: 'calc(100% - 35px)', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
                            marks={range(setting.min, setting.max + 1).map(value => ({ value, label: `${value} pc.` }))}
                            defaultValue={shareableState.challengeSettings[setting.id]! as number}
                            onChangeCommitted={(_, value) => dispatchShareableState({
                              type: 'changeChallengeSettings',
                              nextSettings: {
                                ...shareableState.challengeSettings,
                                [setting.id]: value as number,
                              },
                            })}
                          />
                        );
  
                      default:
                        return null;
                    }
                  })}
                </ColumnStyled>
              }
              {!dataEntryIsDisabled &&
                <Button
                  color="primary"
                  variant="contained"
                  style={{ display: 'block', marginTop: margin, marginLeft: 'auto', marginRight: 'auto' }}
                  onClick={() => {
                    guard.try('useChallenge', () => {
                      dispatchShareableState({ type: 'regenerateGroupedValues' });
                    }, () => showMessage('info', guardFailureMessage));
                  }}
                >
                  Roll
                </Button>
              }
            </Paper>
            <Paper>
              <Modal
                open={fullPoolModalIsOpen}
                onClose={() => setFullPoolModalIsOpen(false)}
                closeAfterTransition={true}
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <Fade in={fullPoolModalIsOpen}>
                  <Paper style={{ maxHeight: '80%', overflowY: 'auto' }}>
                    <List>
                      {currentChallenge.flatPool.map(weapon => {
                        const AmmoImage = !weapon.isAirdrop ? ammoTypeImagesMap[weapon.ammoType] : relicAmmoTypeImagesMap[weapon.ammoType];
  
                        return (
                          <ListItem key={uuid()}>
                            <RowStyled style={{ width: '100%' }}>
                              <Typography color="textPrimary" style={{ fontSize: 24 }}>{weapon.name}</Typography>
                              <AmmoImage style={{ marginLeft: gap, width: 42, height: 42 }} />
                            </RowStyled>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Paper>
                </Fade>
              </Modal>
              <Typography
                style={{
                  fontSize: 14,
                  paddingTop: padding,
                  paddingLeft: padding,
                  paddingBottom: currentChallenge.flatPool.length ? gap : padding,
                  cursor: currentChallenge.flatPool.length ? 'pointer' : 'default',
                  display: 'inline-block',
                  fontWeight: 'bold',
                }}
                color="textSecondary"
                css={currentChallenge.flatPool.length && css`&:hover { text-decoration: underline; }`}
                onClick={() => currentChallenge.flatPool.length && setFullPoolModalIsOpen(true)}
              >
                Full pool quantity: {currentChallenge.flatPool.length} pc.
              </Typography>
              {shareableState.groupedValues.map((values, i) => {
                return (
                  <Fragment key={uuid()}>
                    <Typography style={{ fontSize: 14, paddingLeft: padding }} color="textSecondary">Group: {i + 1}</Typography>
                    <List dense={true}>
                      {values.map(weapon => {
                        const AmmoImage = !weapon.isAirdrop ? ammoTypeImagesMap[weapon.ammoType] : relicAmmoTypeImagesMap[weapon.ammoType];
  
                        return (
                          <ListItem key={uuid()}>
                            <RowStyled style={{ width: '100%' }}>
                              <Typography style={{ fontSize: 24 }}>{weapon.name}</Typography>
                              <AmmoImage style={{ marginLeft: gap, width: 42, height: 42 }} />
                            </RowStyled>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Fragment>
                );
              })}
            </Paper>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {getJsx()}
      {messageJsx}
    </>
  );
};

export default Challenges;
