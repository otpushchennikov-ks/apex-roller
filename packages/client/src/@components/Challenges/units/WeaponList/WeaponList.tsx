import { FC } from 'react';
import { TWeaponListProps, TSvgComponent } from './types';
import { List, ListItem, Typography } from '@material-ui/core';
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
import { RowStyled, gap } from '@styled';
import { v4 as uuid } from 'uuid';


const relicAmmoTypeImagesMap: Record<string, TSvgComponent> = {
  Light: RelicLightAmmo,
  Heavy: RelicHeavyAmmo,
  Energy: RelicEnergyAmmo,
  Shotgun: RelicShotgunAmmo,
  Sniper: RelicSniperAmmo,
  Arrows: ArrowsAmmo, // такого релика нет
};

const ammoTypeImagesMap: Record<string, TSvgComponent> = {
  Light: LightAmmo,
  Heavy: HeavyAmmo,
  Energy: EnergyAmmo,
  Shotgun: ShotgunAmmo,
  Sniper: SniperAmmo,
  Arrows: ArrowsAmmo,
};


export const WeaponList: FC<TWeaponListProps> = ({ data, isPrimary }) => {
  return (
    <List>
      {data.map(weapon => {
        const ammoImages = Array.isArray(weapon.ammoType) ?
          weapon.ammoType.map(ammoType => weapon.isAirdrop ? relicAmmoTypeImagesMap[ammoType] : ammoTypeImagesMap[ammoType])
          :
          [!weapon.isAirdrop ? ammoTypeImagesMap[weapon.ammoType] : relicAmmoTypeImagesMap[weapon.ammoType]];

        return (
          <ListItem key={uuid()}>
            <RowStyled style={{ width: '100%' }}>
              <Typography color={isPrimary ? 'textPrimary' : 'textSecondary'} style={{ fontSize: 24 }}>{weapon.name}</Typography>
              <RowStyled>
                {ammoImages.map(AmmoImage => {
                  return (
                    <AmmoImage style={{ marginLeft: gap, width: 42, height: 42 }} key={uuid()} />
                  );
                })}
              </RowStyled>
            </RowStyled>
          </ListItem>
        );
      })}
    </List>
  );
};