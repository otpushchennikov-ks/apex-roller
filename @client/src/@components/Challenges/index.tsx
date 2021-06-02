import challengesData from '@modules/challenges';
import { FC } from 'react';
import { Skeleton, Empty, Button, Typography, Select, InputNumber, Checkbox, List } from 'antd';
import { InfoOutlined, UndoOutlined, WarningOutlined } from '@ant-design/icons';
import { ChallengesProps } from './types';
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
import { RowStyled, highlitedMixin } from '@styled';
import { margin, lightYellowColor, gap } from '@styled/constants';
import generateRandomIndex from '@utils/generateRandomIndex';


const { Text } = Typography;

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

const Challenges: FC<ChallengesProps> = ({
  mode,
  reconnectWebsocket,
  shareableState,
  dispatchShareableState,
  runMissclickguard,
}) => {
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
            onClick={() => reconnectWebsocket()}
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
                >
                  {challengesData.map(({ name }, i) => {
                    return (
                      <Select.Option key={i} value={i}>
                        {name}
                      </Select.Option>
                    );
                  })}
                </Select>
                <Button
                  onClick={() => dispatchShareableState({
                    type: 'changeIndex',
                    nextIndex: generateRandomIndex(challengesData.length),
                  })}
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
                onChange={value => dispatchShareableState({ type: 'changeCount', nextCount: value })}
                style={{ flexGrow: 2 }}
                disabled={mode.type === 'client'}
              />
            </RowStyled>
            <div style={{ textAlign: 'center', margin: `0 auto ${['host', 'private'].includes(mode.type) ? `${gap}px` : 0}` }}>
              <Checkbox
                checked={shareableState.isUnique}
                onChange={({ target: { checked }}) => dispatchShareableState({ type: 'changeIsUnique', nextIsUnique: checked })}
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
                  runMissclickguard(() => {
                    dispatchShareableState({ type: 'regenerateWeapons' });
                  });
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
