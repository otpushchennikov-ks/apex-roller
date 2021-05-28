import 'antd/dist/antd.css'
import { useState, useRef } from 'react';
import { render } from 'react-dom';
import challenges from './@modules/challenges';
import { Select, Button, InputNumber, Checkbox, List, Typography, message } from 'antd';
import generateRandomBackgroundSrc from '@utils/generateRandomBackgroundSrc';
import getUserId from '@utils/getUserId';
import LightAmmoImage from '@images/light-ammo.png';
import HeavyAmmoImage from '@images/heavy-ammo.png';
import EnergyAmmoImage from '@images/energy-ammo.png';
import ShotgunAmmoImage from '@images/shotgun-ammo.png';
import SniperAmmoImage from '@images/sniper-ammo.png';
import ArrowsAmmoImage from '@images/arrows-ammo.png';
import RelicAmmoImage from '@images/relic-ammo.png';
import classNames from 'classnames';
import styles from '@styles/style.module.scss';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { AmmoType, UserShareableState, Weapon } from '../../shared/types';


message.config({ maxCount: 3 });

const { Text } = Typography;
const inputWidth = 300;
const wsHost = process.env.NODE_ENV === 'production' ? window.location.origin.replace(/^http/, 'ws') : 'ws://localhost:5000';

const ammoTypeImagesMap: Record<AmmoType, string> = {
  Light: LightAmmoImage,
  Heavy: HeavyAmmoImage,
  Energy: EnergyAmmoImage,
  Shotgun: ShotgunAmmoImage,
  Sniper: SniperAmmoImage,
  Arrows: ArrowsAmmoImage,
  Relic: RelicAmmoImage,
};

function App() {
  const [isHost, setIsHost] = useState(true);
  const [isWithBackground, setIsWithBackground] = useState(false);
  const [currentBackgroundSrc, setCurrentBackgroundSrc] = useState<string | null>(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [weaponsIsUnique, setWeaponsIsUnique] = useState(true);
  const [weaponsCount, setWeaponsCount] = useState(2);
  const [missClickGuardIsEnabled, setMissClickGuardIsEnabled] = useState(false);
  const [missClickGuardMsConfig, setMissClickGuardMsConfig] = useState<number>(3000);
  const [currentWeapons, setCurrentWeapons] = useState<Weapon[]>([]);
  const missClickTimerIdRef = useRef<number | null>(null);
  const wsClientRef = useRef<WebSocket | null>(null);

  const { pathname } = useLocation();
  const roomId = pathname.slice(1);

  const generateWeapons = ({ index, count, isUnique }: { index: number, count: number, isUnique: boolean }) => {
    return challenges[index].runFn(count, isUnique);
  };

  useEffectOnce(() => {
    const nextWeapons = generateWeapons({ index: currentChallengeIndex, count: weaponsCount, isUnique: weaponsIsUnique });
    setCurrentWeapons(nextWeapons);

    if (!roomId) return;

    const wsClient = new WebSocket(wsHost);
    wsClient.onopen = () => {
      wsClient.send(JSON.stringify({
        eventType: 'connect',
        roomId,
        userId: getUserId(),
        state: {
          challengeIndex: currentChallengeIndex,
          isUnique: weaponsIsUnique,
          count: weaponsCount,
          weapons: nextWeapons,
        },
      }));

      wsClient.onmessage = message => {
        const data = JSON.parse(message.data);

        switch (data.eventType) {
          case 'connected': {
            wsClientRef.current = wsClient;
            setIsHost(data.isHost);

            const { state: { challengeIndex, isUnique, count, weapons }} = data;

            setCurrentChallengeIndex(challengeIndex);
            setWeaponsIsUnique(isUnique);
            setWeaponsCount(count);
            setCurrentWeapons(weapons);
            break;
          }

          case 'update': {
            const { state: { challengeIndex, isUnique, count, weapons }} = data;

            setCurrentChallengeIndex(challengeIndex);
            setWeaponsIsUnique(isUnique);
            setWeaponsCount(count);
            setCurrentWeapons(weapons);
            break;
          }

          default:
            break;
        }
      };
    };
  });

  const sendSharedState = (state: UserShareableState) => {
    wsClientRef.current?.send(JSON.stringify({
      eventType: 'update',
      roomId,
      state,
    }));
  };

  return (
    <div
      className={classNames([styles.root, styles.box])}
      style={{
        backgroundColor: !currentBackgroundSrc ? 'rgb(47, 49, 54)' : undefined,
        backgroundImage: currentBackgroundSrc ? `url(${currentBackgroundSrc})` : undefined,
      }}
    >
      <div style={{ margin: 'auto' }}>
        <div className={styles.boxHighlited} style={{ padding: 20 }}>
          <div className={styles.box} style={{ margin: '0 auto 10px' }}>
            <Text strong={true} style={{ marginRight: 10 }}>
              Challenge
            </Text>
            <Select
              value={currentChallengeIndex}
              onChange={value => {
                setCurrentChallengeIndex(value);

                const nextWeapons = generateWeapons({ index: value, count: weaponsCount, isUnique: weaponsIsUnique });
                setCurrentWeapons(nextWeapons);
                sendSharedState({ challengeIndex: value, isUnique: weaponsIsUnique, count: weaponsCount, weapons: nextWeapons });
              }}
              style={{ width: inputWidth }}
              size="large"
              disabled={!isHost}
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
              value={weaponsCount}
              onChange={value => {
                setWeaponsCount(value);
                
                const nextWeapons = generateWeapons({ index: currentChallengeIndex, count: value, isUnique: weaponsIsUnique });
                setCurrentWeapons(nextWeapons);
                sendSharedState({ challengeIndex: currentChallengeIndex, isUnique: weaponsIsUnique, count: value, weapons: nextWeapons });
              }}
              style={{ width: inputWidth }}
              size="large"
              disabled={!isHost}
            />
          </div>
          <Checkbox
            checked={weaponsIsUnique}
            onChange={({ target: { checked }}) => {
              setWeaponsIsUnique(checked);

              const nextWeapons = generateWeapons({ index: currentChallengeIndex, count: weaponsCount, isUnique: checked });
              setCurrentWeapons(nextWeapons);
              sendSharedState({ challengeIndex: currentChallengeIndex, isUnique: checked, count: weaponsCount, weapons: nextWeapons });
            }}
            style={{ width: 121, display: 'flex', margin: `0 auto ${isHost ? '10px' : 0}` }}
            disabled={!isHost}
          >
            <Text strong={true}>Is unique</Text>
          </Checkbox>
          {isHost &&
            <Button
              style={{ display: 'block', margin: '0 auto' }}
              onClick={() => {
                if (missClickTimerIdRef.current && missClickGuardIsEnabled) {
                  message.info(`No more than once every ${missClickGuardMsConfig / 1000} seconds`, missClickGuardMsConfig / 1000);
                  return;
                };
    
                if (missClickGuardIsEnabled) {
                  missClickTimerIdRef.current = window.setTimeout(() => {
                    missClickTimerIdRef.current = null;
                  }, missClickGuardMsConfig);
                }

                const nextWeapons = generateWeapons({ index: currentChallengeIndex, count: weaponsCount, isUnique: weaponsIsUnique });
                setCurrentWeapons(nextWeapons);
                sendSharedState({ challengeIndex: currentChallengeIndex, isUnique: weaponsIsUnique, count: weaponsCount, weapons: nextWeapons });

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
            {currentWeapons.map(({ name, ammoType }, i) => {
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
      {isHost &&
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

function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}

render(<Root />, document.getElementById('root'));
