import 'antd/dist/antd.css'
import { useState, useMemo, useRef } from 'react';
import { render } from 'react-dom';
import challenges from './challenges';
import { Select, Button, InputNumber, Checkbox, List, Typography, message } from 'antd';
import { v4 as uuid } from 'uuid';
import { AmmoType } from './weapons';
import { generateRandomBackgroundSrc } from './utils';
import LightAmmoImage from './images/light-ammo.png';
import HeavyAmmoImage from './images/heavy-ammo.png';
import EnergyAmmoImage from './images/energy-ammo.png';
import ShotgunAmmoImage from './images/shotgun-ammo.png';
import SniperAmmoImage from './images/sniper-ammo.png';
import ArrowsAmmoImage from './images/arrows-ammo.png';
import RelicAmmoImage from './images/relic-ammo.png';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import styles from './style.module.scss';


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
  const [regenerateListId, setRegenerageListId] = useState(uuid());
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [weaponsIsUnique, setWeaponsIsUnique] = useState(true);
  const [weaponsCount, setWeaponsCount] = useState(2);
  const [missClickGuardIsEnabled, setMissClickGuardIsEnabled] = useState(false);
  const [missClickGuardMsConfig, setMissClickGuardMsConfig] = useState<number>(3000);
  const missClickTimerIdRef = useRef<number | null>(null);

  const listJsx = useMemo(() => {
    return (
      <List key={regenerateListId}>
        {challenges[currentChallengeIndex].runFn(weaponsCount, weaponsIsUnique).map(({ name, ammoType }, i) => {
          return (
            <List.Item
              key={name}
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
    );
  }, [
    regenerateListId,
    currentChallengeIndex,
    weaponsCount,
    weaponsIsUnique,
  ]);

  return (
    <div
      className={classNames([styles.root, styles.box])}
      style={{
        backgroundColor: !currentBackgroundSrc ? '#000' : undefined,
        backgroundImage: currentBackgroundSrc ? `url(${currentBackgroundSrc})` : undefined,
      }}
    >
      <Helmet>
        <title>Apex roller</title>
      </Helmet>
      <div style={{ margin: 'auto' }}>
        <div className={styles.boxHighlited} style={{ padding: 20 }}>
          <div className={styles.box} style={{ margin: '0 auto 10px' }}>
            <Text strong={true} style={{ marginRight: 10 }}>
              Challenge
            </Text>
            <Select
              value={currentChallengeIndex}
              onChange={value => setCurrentChallengeIndex(value)}
              style={{ width: inputWidth }}
              size="large"
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
              onChange={value => setWeaponsCount(value)}
              style={{ width: inputWidth }}
              size="large"
            />
          </div>
          <Checkbox
            checked={weaponsIsUnique}
            onChange={({ target: { checked }}) => setWeaponsIsUnique(checked)}
            style={{ width: 121, display: 'flex', margin: '0 auto 10px' }}
          >
            <Text strong={true}>Is unique</Text>
          </Checkbox>
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
              
              setRegenerageListId(uuid());

              if (isWithBackground) {
                setCurrentBackgroundSrc(generateRandomBackgroundSrc(currentBackgroundSrc!));
              }
            }}
          >
            <Text strong={true}>Use challenge</Text>
          </Button>
        </div>
        <div
          className={styles.boxHighlited}
          style={{ marginTop: 20, padding: 20 }}
        >
          {listJsx}
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
    </div>
  );
}

render(<App />, document.getElementById('root'));
