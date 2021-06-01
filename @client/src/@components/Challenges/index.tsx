import challengesData from '@modules/challenges';
import { FC } from 'react';
import { Skeleton, Empty, Button, Typography, Select, InputNumber, Checkbox, List } from 'antd';
import { InfoOutlined, WarningOutlined } from '@ant-design/icons';
import { ChallengesProps } from './types';
import { AmmoType } from '@apex-roller/shared';
import LightAmmoImage from '@images/light-ammo.png';
import HeavyAmmoImage from '@images/heavy-ammo.png';
import EnergyAmmoImage from '@images/energy-ammo.png';
import ShotgunAmmoImage from '@images/shotgun-ammo.png';
import SniperAmmoImage from '@images/sniper-ammo.png';
import ArrowsAmmoImage from '@images/arrows-ammo.png';
import RelicAmmoImage from '@images/relic-ammo.png';
import ColumnStyled from '@styled/ColumnStyled';
import { RowStyled, highlitedMixin } from '@styled';
import { margin, lightYellowColor, inputWidth, gap } from '@styled/constants';


const { Text } = Typography;

const ammoTypeImagesMap: Record<AmmoType, string> = {
  Light: LightAmmoImage,
  Heavy: HeavyAmmoImage,
  Energy: EnergyAmmoImage,
  Shotgun: ShotgunAmmoImage,
  Sniper: SniperAmmoImage,
  Arrows: ArrowsAmmoImage,
  Relic: RelicAmmoImage,
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
            <RowStyled style={{ margin: `0 auto ${gap}px` }}>
              <Text strong={true} style={{ marginRight: margin }}>
                Challenge
              </Text>
              <Select
                value={shareableState.challengeIndex}
                onChange={value => dispatchShareableState({ type: 'changeIndex', nextIndex: value })}
                style={{ width: inputWidth }}
                size="large"
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
            </RowStyled>
            <RowStyled style={{ margin: `0 auto ${gap}px` }}>
              <Text strong={true} style={{ marginRight: 10 }}>
                Weapons count
              </Text>
              <InputNumber
                min={1}
                max={5}
                value={shareableState.count}
                onChange={value => dispatchShareableState({ type: 'changeCount', nextCount: value })}
                style={{ width: inputWidth }}
                size="large"
                disabled={mode.type === 'client'}
              />
            </RowStyled>
            <Checkbox
              checked={shareableState.isUnique}
              onChange={({ target: { checked }}) => dispatchShareableState({ type: 'changeIsUnique', nextIsUnique: checked })}
              style={{ width: 121, display: 'flex', margin: `0 auto ${['host', 'private'].includes(mode.type) ? `${gap}px` : 0}` }}
              disabled={mode.type === 'client'}
            >
              <Text strong={true}>Is unique</Text>
            </Checkbox>
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
              {shareableState.weapons.map(({ name, ammoType }, i) => {
                return (
                  <List.Item
                    key={name + i}
                    style={{ fontSize: 32 }}
                  >
                    <RowStyled>
                      <Text strong={true} style={{ marginRight: 10 }}>
                        {i + 1}.
                      </Text>
                      <Text strong={true}>{name}</Text>
                      <img
                        style={{ display: 'block', marginLeft: 10, width: 42 }}
                        src={ammoTypeImagesMap[ammoType]}
                        alt=""
                      />
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
