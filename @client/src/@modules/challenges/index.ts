import makeChallenge, { NumberSetting, BooleanSetting } from './makeChallenge';
import { selectFromMultiplePools, selectRandom } from '@utils/random';
import weapons from '../weapons';


const weaponIsUniqueSetting: BooleanSetting = { id: 'weaponIsUnique', label: 'weapon is unique', type: 'boolean', default: true };
const ammoTypeIsUniqueSetting: BooleanSetting = { id: 'ammoTypeIsUnique', label: 'ammo type is unique', type: 'boolean', default: false };
const makeWeaponsCountSetting: (min: number, max: number) => NumberSetting = (min, max) => ({
  id: 'weaponsCount',
  label: 'weapons count',
  type: 'number',
  default: 2,
  min,
  max,
});

const challenges = [
  makeChallenge({
    mode: 'BR',
    name: 'All',
    settingsForRender: [
      weaponIsUniqueSetting,
      ammoTypeIsUniqueSetting,
      makeWeaponsCountSetting(2, 5),
    ],
    getPools: () => [weapons.slice()],
    run: (currentSettings, pools) => selectFromMultiplePools(
      currentSettings.weaponsCount as number,
      pools,
      {
        withReplacement: !currentSettings.weaponIsUnique,
        uniquenessPredicate: currentSettings.ammoTypeIsUnique ? (a, b) => a.ammoType === b.ammoType : undefined,
      },
    ),
  }),
  makeChallenge({
    mode: 'BR',
    name: 'Wingman and other guns',
    description: 'You cant fight until you find a wingman.',
    settingsForRender: [
      weaponIsUniqueSetting,
      ammoTypeIsUniqueSetting,
      makeWeaponsCountSetting(2, 5),
    ],
    getPools: () => {
      const wingman = weapons.filter(({ name }) => name === 'Wingman');
      const others = weapons.filter(({ name }) => name !== 'Wingman');

      return [wingman, others];
    },
    run: (currentSettings, pools) => [pools[0], selectRandom(
      (currentSettings.weaponsCount as number) - pools[0].length,
      pools[1],
      {
        withReplacement: !currentSettings.weaponIsUnique,
        uniquenessPredicate: currentSettings.ammoTypeIsUnique ? (a, b) => a.ammoType === b.ammoType : undefined,
      },
    )],
  }),
  makeChallenge({
    mode: 'BR',
    name: 'Wingman and snipers',
    settingsForRender: [
      weaponIsUniqueSetting,
      makeWeaponsCountSetting(2, 5),
    ],
    getPools: () => {
      const wingman = weapons.filter(({ name }) => name === 'Wingman');
      const snipers = weapons.filter(({ type }) => type === 'Sniper');

      return [wingman, snipers];
    },
    run: (currentSettings, pools) => [pools[0], selectRandom(
      (currentSettings.weaponsCount as number) - pools[0].length,
      pools[1],
      { withReplacement: !currentSettings.weaponIsUnique },
    )],
  }),
  makeChallenge({
    mode: 'BR',
    name: 'Snipers and shotguns',
    settingsForRender: [
      weaponIsUniqueSetting,
      makeWeaponsCountSetting(2, 5),
    ],
    getPools: () => {
      const snipers = weapons.filter(({ type }) => type === 'Sniper');
      const shotguns = weapons.filter(({ type }) => type === 'Shotgun');

      return [snipers, shotguns];
    },
    run: (currentSettings, pools) => selectFromMultiplePools(
      currentSettings.weaponsCount as number,
      pools,
      { withReplacement: !currentSettings.weaponIsUnique },
    ),
  }),
  makeChallenge({
    mode: 'BR',
    name: 'Peacekeeper and mastiff',
    getPools: () => {
      const peacekeeper = weapons.filter(({ name }) => name === 'Peacekeeper');
      const mastiff = weapons.filter(({ name }) => name === 'Mastiff Shotgun');

      return [peacekeeper, mastiff];
    },
    run: (_, pools) => pools,
  }),
  makeChallenge({
    mode: 'BR',
    name: 'Melee only',
    description: 'You must fight like a real man',
    getPools: () => [],
    run: () => [],
  }),
  makeChallenge({
    mode: 'ARENA',
    name: 'All',
    settingsForRender: [
      weaponIsUniqueSetting,
      ammoTypeIsUniqueSetting,
      makeWeaponsCountSetting(1, 5),
    ],
    getPools: () => [weapons.filter(({ isAirdrop, isArenaStart }) => !isAirdrop && !isArenaStart)],
    run: (currentSettings, pools) => selectFromMultiplePools(
      currentSettings.weaponsCount as number,
      pools,
      {
        withReplacement: !currentSettings.weaponIsUnique,
        uniquenessPredicate: currentSettings.ammoTypeIsUnique ? (a, b) => a.ammoType === b.ammoType : undefined,
      },
    ),
  }),
];

const getChallenges = (mode?: string) => !mode ? challenges : challenges.filter(challenge => challenge.mode === mode);

export { getChallenges };
export type { Challenge } from './makeChallenge';
