import challengesData from '@modules/challenges';
import { FC, useCallback, useEffect } from 'react';
import { Skeleton, Empty, Button, Typography, Select, Checkbox, List, InputNumber, message as noty } from 'antd';
import { InfoOutlined, UndoOutlined, WarningOutlined } from '@ant-design/icons';
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
import ColumnStyled from '@styled/ColumnStyled';
import RowStyled from '@styled/RowStyled';
import highlitedMixin from '@styled/highlitedMixin';
import { margin, lightYellowColor, gap } from '@styled/constants';
import { onlyText } from 'react-children-utilities';
import { v4 as uuid } from 'uuid';
import Guard from '@utils/missClickGuard';
import generateRandomIndex from '@utils/generateRandomIndex';
import WebsocketService from '@modules/websocketService';
import useCurrentRoomId from '@hooks/useCurrentRoomId';
import audioPlayer from '@modules/audioPlayer';
import getOrCreateUserId from '@utils/getOrCreateUserId';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { useLatest, useUpdateEffect } from 'react-use';
import useGlobalState from '@hooks/useGlobalState';


const wss = new WebsocketService();

const { Text, Title } = Typography;

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
  const {
    mode,
    setMode,
    shareableState,
    dispatchShareableState,
    settings,
  } = useGlobalState();
  const { maybeRoomId, uriIsEmpty } = useCurrentRoomId();

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
      noty.success(message.eventType);
      stableSetMode.current({ type: message.isHost ? 'host' : 'client' });
      if (!message.isHost) {
        stableDispatchShareableState.current({ type: 'replaceState', nextState: message.state });
      }  
    });

    wss.on('disconnect', message => {
      noty.info(message.eventType);
      stableSetMode.current({ type: 'disconnected' });
      wss.disconnect();
    });

    wss.on('error', message => {
      noty.error(message.message);
      stableSetMode.current({ type: 'error', text: message.message });  
    });
    
    wss.on('update', message => {
      stableDispatchShareableState.current({ type: 'replaceState', nextState: message.state });
      audioPlayer.play(stableSettings.current.notificationKey);  
    });
  }, [stableDispatchShareableState, stableSetMode, stableSettings]);

  // Получение эвентов
  useEffect(() => {
    if (stableUriIsEmpty.current) {
      wss.disconnect();
      noty.info('private');
      stableSetMode.current({ type: 'private' });
      return;
    }

    const maybeUserId = getOrCreateUserId();

    if (isLeft(maybeUserId)) {
      const error = PathReporter.report(maybeUserId);
      console.log(error);
      noty.error(error);
      return;
    }

    if (isLeft(maybeRoomId)) {
      const error = PathReporter.report(maybeRoomId);
      console.log(error);
      noty.error(error);
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
  ]);

  // Отправка эвентов
  useUpdateEffect(() => {
    if (stableMode.current.type !== 'host' || stableUriIsEmpty.current) {
      return;
    }

    if (isLeft(maybeRoomId)) {
      const error = PathReporter.report(maybeRoomId);
      console.log(error);
      noty.error(error);
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

  switch (mode.type) {
    case 'initializing':
      return (
        <>
          <ColumnStyled
            css={highlitedMixin}
            style={{ marginBottom: margin, alignItems: 'center' }}
          >
            <Skeleton.Input active={true} style={{ width: 400, marginBottom: 10 }}/>
            <Skeleton.Input active={true} style={{ width: 400, marginBottom: 10 }}/>
            <Skeleton.Input active={true} style={{ width: 200, marginBottom: 10 }}/>
            <Skeleton.Button active={true} style={{ width: 120 }} />
          </ColumnStyled>
          <div css={highlitedMixin}>
            <RowStyled style={{ marginBottom: 10 }}>
              <Skeleton.Avatar active={true} style={{ marginRight: 10 }}/>
              <Skeleton.Input active={true} style={{ width: 400 }}/>
            </RowStyled>
            <RowStyled>
              <Skeleton.Avatar active={true} style={{ marginRight: 10 }}/>
              <Skeleton.Input active={true} style={{ width: 400 }}/>
            </RowStyled>
          </div>
        </>
      );
    case 'disconnected':
      return (
        <ColumnStyled css={highlitedMixin}>
          <Empty
            image={<InfoOutlined style={{ fontSize: 99, color: lightYellowColor }} />}
            description={<div style={{ marginBottom: margin, fontWeight: 'bold', fontSize: 32 }}>Disconnected</div>}
          />
          <Button
            onClick={() => {
              const maybeUserId = getOrCreateUserId();

              if (isLeft(maybeUserId)) {
                const error = PathReporter.report(maybeUserId);
                console.log(error);
                noty.error(error);
                return;
              }
          
              if (isLeft(maybeRoomId)) {
                const error = PathReporter.report(maybeRoomId);
                console.log(error);
                noty.error(error);
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
      );
    case 'error':
      return (
        <Empty
          image={<WarningOutlined style={{ fontSize: 99, color: '#e57373' }} />}
          description={
            <div
              css={highlitedMixin}
              style={{ fontWeight: 'bold', fontSize: 32 }}
            >
              {mode.text}
            </div>
          }
        />
      );
    case 'private':
    case 'host':
    case 'client':
      return (
        <>
          <div css={highlitedMixin}>
            <RowStyled leadItemWidth={105} style={{ margin: `0 auto ${gap}px` }}>
              <Text strong={true} style={{ marginRight: gap }}>
                Challenge
              </Text>
              <RowStyled style={{ flexGrow: 2 }}>
                <Select
                  value={shareableState.challengeIndex}
                  onChange={value => dispatchShareableState({ type: 'changeIndex', nextIndex: value })}
                  style={{ marginRight: gap, flexGrow: 2 }}
                  disabled={mode.type === 'client'}
                  showSearch={true}
                  filterOption={(inputText, node)=> onlyText(node?.children).toLowerCase().includes(inputText)}
                >
                  {challengesData.map(({ mode, name }, i) => {
                    return (
                      <Select.Option key={uuid()} value={i}>
                        <Text strong={true} style={{ marginRight: gap / 2 }}>{mode} </Text>
                        <span>{name}</span>
                      </Select.Option>
                    );
                  })}
                </Select>
                <Button
                  disabled={mode.type !== 'host'}
                  onClick={() => {
                    guard.try('rollChallenge', () => {
                      dispatchShareableState({
                        type: 'changeIndex',
                        nextIndex: generateRandomIndex(challengesData.length),
                      });
                    }, () => noty.info(guardFailureMessage));
                  }}
                >
                  <UndoOutlined />
                </Button>
              </RowStyled>
            </RowStyled>
            <RowStyled leadItemWidth={105} style={{ margin: `0 auto ${gap}px` }}>
              <Text strong={true} style={{ marginRight: 10 }}>
                Weapons count
              </Text>
              <InputNumber
                min={1}
                max={5}
                value={shareableState.count}
                onBlur={({ target: { value }}) => {
                  if (Number.isNaN(Number.parseInt(value))) {
                    dispatchShareableState({
                      type: 'changeCount',
                      nextCount: 1,
                    });
                  }
                }}
                onChange={value => {
                  if (value && value > 0 && value !== shareableState.count) {
                    dispatchShareableState({
                      type: 'changeCount',
                      nextCount: value,
                    });
                  }
                }}
                style={{ flexGrow: 2 }}
                disabled={mode.type === 'client'}
              />
            </RowStyled>
            <div style={{ textAlign: 'center', margin: `0 auto ${['host', 'private'].includes(mode.type) ? `${gap}px` : 0}` }}>
              <Checkbox
                checked={shareableState.isUnique}
                onChange={({ target: { checked }}) => {
                  dispatchShareableState({
                    type: 'changeIsUnique',
                    nextIsUnique: checked,
                  });
                }}
                style={{ display: 'inline-flex' }}
                disabled={mode.type === 'client'}
              >
                <Text strong={true}>Is unique</Text>
              </Checkbox>
            </div>
            {['host', 'private'].includes(mode.type) &&
              <Button
                style={{ display: 'block', margin: '0 auto' }}
                onClick={() => {
                  guard.try('useChallenge', () => {
                    dispatchShareableState({ type: 'regenerateWeapons' })
                  }, () => noty.info(guardFailureMessage));
                }}
              >
                <Text strong={true}>Use challenge</Text>
              </Button>
            }
          </div>
          <div
            css={highlitedMixin}
            style={{ marginTop: margin }}
          >
            <Title type="secondary" level={5}>Pool quantity: {challengesData[shareableState.challengeIndex].getPoolQuantity()}</Title>
            <List>
              {shareableState.weapons.map(({ name, ammoType, isAirdrop }, i) => {
                const Ammo = (isAirdrop ? relicAmmoTypeImagesMap : ammoTypeImagesMap)[ammoType];

                return (
                  <List.Item
                    key={name + i}
                    style={{ fontSize: 32 }}
                  >
                    <RowStyled style={{ width: '100%' }}>
                      <div>
                        <Text strong={true} style={{ marginRight: 10 }}>
                          {i + 1}.
                        </Text>
                        <Text strong={true}>{name}</Text>
                      </div>
                      <Ammo style={{ marginLeft: 10, width: 42, height: 42 }} />
                    </RowStyled>
                  </List.Item>
                );
              })}
            </List>
          </div>
        </>
      );
    default:
      return null;
  }
};

export default Challenges;
