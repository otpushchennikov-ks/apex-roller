import 'antd/dist/antd.css'
import { AmmoType } from '@apex-roller/shared';
import { useState, useRef, useCallback } from 'react';
import { render } from 'react-dom';
import challenges from '@modules/challenges';
import { Select, Button, InputNumber, Checkbox, List, Typography, message, Skeleton, Empty } from 'antd';
import { InfoOutlined, WarningOutlined } from '@ant-design/icons';
import generateRandomBackgroundSrc from '@utils/generateRandomBackgroundSrc';
import LightAmmoImage from '@images/light-ammo.png';
import HeavyAmmoImage from '@images/heavy-ammo.png';
import EnergyAmmoImage from '@images/energy-ammo.png';
import ShotgunAmmoImage from '@images/shotgun-ammo.png';
import SniperAmmoImage from '@images/sniper-ammo.png';
import ArrowsAmmoImage from '@images/arrows-ammo.png';
import RelicAmmoImage from '@images/relic-ammo.png';
import classNames from 'classnames';
import styles from '@styles/style.module.scss';
import useUserShareableStateReducer from '@hooks/useUserShareableStateReducer';
import useWebsocket, { Mode } from '@hooks/useWebsocket';


message.config({ maxCount: 3 });

const { Text } = Typography;
const inputWidth = 300;

const ammoTypeImagesMap: Record<AmmoType, string> = {
  Light: LightAmmoImage,
  Heavy: HeavyAmmoImage,
  Energy: EnergyAmmoImage,
  Shotgun: ShotgunAmmoImage,
  Sniper: SniperAmmoImage,
  Arrows: ArrowsAmmoImage,
  Relic: RelicAmmoImage,
};

export default function App() {
  const [isWithBackground, setIsWithBackground] = useState(false);
  const [currentBackgroundSrc, setCurrentBackgroundSrc] = useState<string | null>(null);
  const [missClickGuardIsEnabled, setMissClickGuardIsEnabled] = useState(false);
  const [missClickGuardMsConfig, setMissClickGuardMsConfig] = useState(3000);
  const missClickTimerIdRef = useRef<number | null>(null);

  const {
    userShareableState,
    dispatchUserShareableState,
  } = useUserShareableStateReducer();

  const { mode, reconnect } = useWebsocket({
    userShareableState,
    dispatchUserShareableState,
  });

  const getJsxByMode = useCallback((mode: Mode) => {
    switch (mode.type) {
      case 'initializing':
        return (
          <div>
            <div
              className={classNames([styles.boxVertical, styles.boxHighlited])}
              style={{ marginBottom: 20 }}
            >
              <Skeleton.Input active={true} style={{ width: 400, marginBottom: 10 }}/>
              <Skeleton.Input active={true} style={{ width: 400, marginBottom: 10 }}/>
              <Skeleton.Input active={true} style={{ width: 200, marginBottom: 10 }}/>
              <Skeleton.Button active={true} style={{ width: 120 }} />
            </div>
            <div className={classNames([styles.boxVertical, styles.boxHighlited])}>
              <div className={styles.box} style={{ marginBottom: 10 }}>
                <Skeleton.Avatar active={true} style={{ marginRight: 10 }}/>
                <Skeleton.Input active={true} style={{ width: 400 }}/>
              </div>
              <div className={styles.box}>
                <Skeleton.Avatar active={true} style={{ marginRight: 10 }}/>
                <Skeleton.Input active={true} style={{ width: 400 }}/>
              </div>
            </div>
          </div>
        );
      case 'disconnected':
        return (
          <div className={classNames([styles.boxHighlited, styles.boxVertical])}>
            <Empty
              image={<InfoOutlined style={{ fontSize: 99, color: '#fff9c4' }} />}
              description={<div style={{ marginBottom: 20, fontWeight: 'bold', fontSize: 32 }}>Disconnected</div>}
            />
            <Button
              onClick={() => reconnect()}
              size="large"
            >
              Reconnect
            </Button>
          </div>
        );
      case 'error':
        return (
          <Empty
            image={<WarningOutlined style={{ fontSize: 99, color: '#e57373' }} />}
            description={
              <div
                className={styles.boxHighlited}
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
            <div className={styles.boxHighlited} style={{ padding: 20 }}>
              <div className={styles.box} style={{ margin: '0 auto 10px' }}>
                <Text strong={true} style={{ marginRight: 10 }}>
                  Challenge
                </Text>
                <Select
                  value={userShareableState.challengeIndex}
                  onChange={value => dispatchUserShareableState({ type: 'changeIndex', nextIndex: value })}
                  style={{ width: inputWidth }}
                  size="large"
                  disabled={mode.type === 'client'}
                >
                  {challenges.map(({ name }, i) => {
                    return (
                      <Select.Option key={i} value={i}>
                        {name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </div>
              <div
                className={styles.box}
                style={{ margin: '0 auto 10px' }}
              >
                <Text strong={true} style={{ marginRight: 10 }}>
                  Weapons count
                </Text>
                <InputNumber
                  min={1}
                  max={5}
                  value={userShareableState.count}
                  onChange={value => dispatchUserShareableState({ type: 'changeCount', nextCount: value })}
                  style={{ width: inputWidth }}
                  size="large"
                  disabled={mode.type === 'client'}
                />
              </div>
              <Checkbox
                checked={userShareableState.isUnique}
                onChange={({ target: { checked }}) => dispatchUserShareableState({ type: 'changeIsUnique', nextIsUnique: checked })}
                style={{ width: 121, display: 'flex', margin: `0 auto ${['host', 'private'].includes(mode.type) ? '10px' : 0}` }}
                disabled={mode.type === 'client'}
              >
                <Text strong={true}>Is unique</Text>
              </Checkbox>
              {['host', 'private'].includes(mode.type) &&
                <Button
                  style={{ display: 'block', margin: '0 auto' }}
                  onClick={() => {
                    // Start missclick guard logic
                    if (missClickTimerIdRef.current && missClickGuardIsEnabled) {
                      message.info(`No more than once every ${missClickGuardMsConfig / 1000} seconds`, missClickGuardMsConfig / 1000);
                      return;
                    };
        
                    if (missClickGuardIsEnabled) {
                      missClickTimerIdRef.current = window.setTimeout(() => {
                        missClickTimerIdRef.current = null;
                      }, missClickGuardMsConfig);
                    }
                    // end missclick guard logic

                    dispatchUserShareableState({ type: 'regenerateWeapons' });

                    if (isWithBackground) {
                      setCurrentBackgroundSrc(generateRandomBackgroundSrc(currentBackgroundSrc!));
                    }
                  }}
                >
                  <Text strong={true}>Use challenge</Text>
                </Button>
              }
            </div>
            <div
              className={styles.boxHighlited}
              style={{ marginTop: 20, padding: 20 }}
            >
              <List>
                {userShareableState.weapons.map(({ name, ammoType }, i) => {
                  return (
                    <List.Item
                      key={name + i}
                      style={{ fontSize: 32 }}
                      className={styles.box}
                    >
                      <Text strong={true} style={{ marginRight: 10 }}>
                        {i + 1}.
                      </Text>
                      <Text strong={true}>{name}</Text>
                      <img
                        style={{ display: 'block', marginLeft: 10, width: 42 }}
                        src={ammoTypeImagesMap[ammoType]}
                        alt=""
                      />
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
  }, [
    currentBackgroundSrc,
    dispatchUserShareableState,
    isWithBackground,
    missClickGuardIsEnabled,
    missClickGuardMsConfig,
    userShareableState.challengeIndex,
    userShareableState.count,
    userShareableState.isUnique,
    userShareableState.weapons,
    reconnect,
  ]);

  return (
    <div
      className={classNames([styles.root, styles.box])}
      style={{
        backgroundColor: !currentBackgroundSrc ? 'rgb(47, 49, 54)' : undefined,
        backgroundImage: currentBackgroundSrc ? `url(${currentBackgroundSrc})` : undefined,
      }}
    >
      <div style={{ margin: 'auto' }}>
        {getJsxByMode(mode)}
      </div>
      <div 
        className={classNames([styles.box, styles.boxHighlited])}
        style={{ position: 'absolute', top: 20, left: 20, padding: 10 }}
      >
        <Checkbox
          checked={isWithBackground}
          onChange={({ target: { checked }}) => {
            setIsWithBackground(checked);

            if (!checked) {
              setCurrentBackgroundSrc(null);
            } else {
              setCurrentBackgroundSrc(generateRandomBackgroundSrc(currentBackgroundSrc ?? undefined));
            }
          }}
        >
          with background
        </Checkbox>
      </div>
      {['host', 'private'].includes(mode.type) &&
        <div
          className={classNames([styles.box, styles.boxHighlited])}
          style={{ position: 'absolute', top: 20, right: 20 }}
        >
          <Checkbox
            checked={missClickGuardIsEnabled}
            onChange={({ target: { checked }}) => setMissClickGuardIsEnabled(checked)}
          >
            Missclick guard
          </Checkbox>
          <InputNumber
            min={1}
            max={5}
            value={missClickGuardMsConfig / 1000}
            onChange={value => setMissClickGuardMsConfig(value * 1000)}
            style={{ margin: '0 10px 0 2px' }}
            disabled={!missClickGuardIsEnabled}
          />
          <span>seconds</span>
        </div>
      }
    </div>
  );
}

render(<App />, document.getElementById('root'));
