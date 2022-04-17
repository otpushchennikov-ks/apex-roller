import { Weapon } from '@packages/shared';
import { FC, SVGProps } from 'react';

export type TWeaponListProps = {
  data: Weapon[];
  isPrimary?: boolean;
};

export type TSvgComponent = FC<SVGProps<
  SVGSVGElement
> & { title?: string }>;
