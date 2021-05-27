import 'antd/dist/antd.css'
import { useState, useMemo, useRef, CSSProperties } from 'react';
import { render } from 'react-dom';
import challenges from './challenges';
import { Select, Button, InputNumber, Checkbox, List, Tooltip, Typography, message } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
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


message.config({
  maxCount: 3,
  duration: 2.5,
});

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

const boxStyles: CSSProperties = {
  backgroundColor: 'rgba(250, 250, 250, 0.85)',
  borderRadius: 4,
  padding: 20,
};

export default function App() {
  const [currentBackgroundSrc, setCurrentBackgroundSrc] = useState(generateRandomBackgroundSrc());
  const [regenerateListId, setRegenerageListId] = useState(uuid());
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [weaponsIsUnique, setWeaponsIsUnique] = useState(true);
  const [weaponsCount, setWeaponsCount] = useState(2);
  const [missClickGuardIsEnabled, setMissClickGuardIsEnabled] = useState(true);
  const missClickTimerIdRef = useRef<number | null>(null);

  const listJsx = useMemo(() => {
    return (
      <List key={regenerateListId}>
        {challenges[currentChallengeIndex].runFn(weaponsCount, weaponsIsUnique).map(({ name, ammoType }, i) => {
          return (
            <List.Item key={name} style={{ fontSize: 32, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Text strong={true} style={{ marginRight: 10 }}>{i + 1}.</Text>
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
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${currentBackgroundSrc})`,
        backgroundSize: 'cover',
      }}
    >
      <Helmet>
        <title>Apex roller</title>
      </Helmet>
      <div style={{ margin: 'auto' }}>
        <div style={boxStyles}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: 'auto', marginRight: 'auto', marginBottom: 10 }}>
            <Text strong={true} style={{ marginRight: 10 }}>Challenge</Text>
            <Select
              value={currentChallengeIndex}
              onChange={value => setCurrentChallengeIndex(value)}
              style={{ width: inputWidth }}
              size="large"
            >
              {challenges.map(({ name }, i) => {
                return (
                  <Select.Option
                    key={i}
                    value={i}
                  >
                    {name}
                  </Select.Option>
                );
              })}
            </Select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: 'auto', marginRight: 'auto', marginBottom: 10 }}>
            <Text strong={true} style={{ marginRight: 10 }}>Weapons count</Text>
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
            style={{ width: 121, display: 'flex', marginBottom: 10, marginLeft: 'auto', marginRight: 'auto' }}
          >
            <Text strong={true}>Is unique</Text>
          </Checkbox>
          <Button
            style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
            onClick={() => {
              if (missClickTimerIdRef.current && missClickGuardIsEnabled) {
                message.info('No more than once every 4 seconds');
                return;
              };
  
              if (missClickGuardIsEnabled) {
                missClickTimerIdRef.current = window.setTimeout(() => {
                  missClickTimerIdRef.current = null;
                }, 4000);
              }
              
              setRegenerageListId(uuid());
              setCurrentBackgroundSrc(generateRandomBackgroundSrc(currentBackgroundSrc));
            }}
          >
            <Text strong={true}>Use challenge</Text>
          </Button>
        </div>
        <div style={{ ...boxStyles, marginTop: 20 }}>
          {listJsx}
        </div>
      </div>
      <Tooltip placement="left" title="Refresh background">
        <Button
          size="large"
          style={{ position: 'absolute', top: 20, left: 20 }}
          onClick={() => setCurrentBackgroundSrc(generateRandomBackgroundSrc(currentBackgroundSrc))}
        >
          <RedoOutlined />
        </Button>
      </Tooltip>
      <Checkbox
        checked={missClickGuardIsEnabled}
        onChange={({ target: { checked }}) => setMissClickGuardIsEnabled(checked)}
        style={{ position: 'absolute', top: 20, right: 20, ...boxStyles, padding: 10 }}
      >
        Missclick guard
      </Checkbox>
    </div>
  );
}

render(<App />, document.getElementById('root'));
