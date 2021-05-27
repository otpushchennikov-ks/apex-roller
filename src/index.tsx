import 'antd/dist/antd.css'
import { useState } from 'react';
import { render } from 'react-dom';
import challenges from './challenges';
import { Select, Button, InputNumber, Checkbox, List } from 'antd';
import { v4 as uuid } from 'uuid';
import { AmmoType } from './weapons';
import LightAmmoImage from './images/light-ammo.png';
import HeavyAmmoImage from './images/heavy-ammo.png';
import EnergyAmmoImage from './images/energy-ammo.png';
import ShotgunAmmoImage from './images/shotgun-ammo.png';
import SniperAmmoImage from './images/sniper-ammo.png';
import ArrowsAmmoImage from './images/arrows-ammo.png';
import RelicAmmoImage from './images/relic-ammo.png';


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
  const [regenerateListId, setRegenerageListId] = useState(uuid());
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [weaponsIsUnique, setWeaponsIsUnique] = useState(true);
  const [weaponsCount, setWeaponsCount] = useState(2);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div style={{ margin: 'auto' }}>
        <Select
          value={currentChallengeIndex}
          onChange={value => setCurrentChallengeIndex(value)}
          allowClear={true}
          style={{ width: inputWidth, display: 'block', marginBottom: 10, marginLeft: 'auto', marginRight: 'auto' }}
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
        <InputNumber
          min={1}
          max={10}
          value={weaponsCount}
          onChange={value => setWeaponsCount(value)}
          style={{ width: inputWidth, display: 'block', marginBottom: 10, marginLeft: 'auto', marginRight: 'auto' }}
          size="large"
        />
        <Checkbox
          checked={weaponsIsUnique}
          onChange={({ target: { checked }}) => setWeaponsIsUnique(checked)}
          style={{ width: 121, display: 'flex', marginBottom: 10, marginLeft: 'auto', marginRight: 'auto' }}
        >
          Уникальность
        </Checkbox>
        <Button
          style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
          onClick={() => setRegenerageListId(uuid())}
        >
          Рефреш
        </Button>
        <List key={regenerateListId}>
          {challenges[currentChallengeIndex].runFn(weaponsCount, weaponsIsUnique).map(({ name, ammoType }, i) => {
            return (
              <List.Item key={name} style={{ fontWeight: 'bold', fontSize: 37, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <span style={{ marginRight: 10 }}>{i + 1}.</span>
                <span>{name}</span>
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
  );
}

render(<App />, document.getElementById('root'));
