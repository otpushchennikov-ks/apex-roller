import { Weapon, ChallengeSettings } from '@packages/shared';
import { identity } from 'ramda';


type BaseSetting = {
  id: string
  label: string
}

export type NumberSetting = BaseSetting & {
  type: 'number'
  min: number
  max: number
  default: number
}

export type BooleanSetting = BaseSetting & {
  type: 'boolean'
  default: boolean
}

export type Setting = NumberSetting | BooleanSetting

export type Challenge = {
  mode: 'BR' | 'ARENA'
  name: string
  description?: string
  settingsForRender?: Setting[]
  flatPool: Weapon[]
  run: (currentSettings: ChallengeSettings) => Weapon[][]
};

export function makeChallenge({
  mode,
  name,
  description,
  settingsForRender,
  getPools,
  run,
}: {
  mode: 'BR' | 'ARENA'
  name: string
  description?: string
  settingsForRender?: Setting[]
  getPools: () => Weapon[][]
  run: (currentSettings: ChallengeSettings, pools: Weapon[][]) => Weapon[][]
}): Challenge {
  return {
    mode,
    name,
    description,
    settingsForRender,
    flatPool: getPools().flatMap(identity),
    run: currentSettings => run(currentSettings, getPools()),
  };
}
