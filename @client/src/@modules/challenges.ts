import { ChallengeFactory, Challenge, Weapon } from '@apex-roller/shared';
import weapons from './weapons';
import generateRandomIndex from '@utils/generateRandomIndex';


const makeChallenge: ChallengeFactory = (mode, name, poolFactory) => {
  return {
    mode,
    name,
    getPoolQuantity: () => poolFactory().length,
    runFn: (weaponsCount, isUnique = true) => {
      let pool = poolFactory();
  
      if (weaponsCount >= pool.length) {
        return pool;
      }
      
      let result: Weapon[] = [];
      for (let i = 0; i < weaponsCount; i++) {
        const nextIndex = generateRandomIndex(pool.length);
  
        result.push(pool[nextIndex]);
  
        if (isUnique) {
          pool.splice(nextIndex, 1);
        }
      }
  
      return result;
    },
  };
};

const challenges: Challenge[] = [
  makeChallenge('BR', 'all', () => weapons.slice()),
  makeChallenge('BR', 'all without airdrop', () => weapons.filter(({ isAirdrop }) => !isAirdrop)),
  makeChallenge('BR', 'airdrop', () => weapons.filter(({ isAirdrop }) => isAirdrop)),
  makeChallenge('BR', 'smg', () => weapons.filter(({ type }) => type === 'SMG')),
  makeChallenge('BR', 'sniper OR shotgun', () => weapons.filter(({ type }) => type === 'Sniper' || type === 'Shotgun')),
  makeChallenge('BR', 'sniper OR pistol', () => weapons.filter(({ type }) => type === 'Sniper' || type === 'Pistol')),
  makeChallenge('BR', 'light', () => weapons.filter(({ ammoType }) => ammoType === 'Light')),
  makeChallenge('BR', 'heavy', () => weapons.filter(({ ammoType }) => ammoType === 'Heavy')),
  makeChallenge('BR', 'energy', () => weapons.filter(({ ammoType }) => ammoType === 'Energy')),
  makeChallenge('BR', 'shotgun', () => weapons.filter(({ ammoType }) => ammoType === 'Shotgun')),
  makeChallenge('BR', 'snipers', () => weapons.filter(({ ammoType }) => ammoType === 'Sniper')),

  // TODO: how to implements this challenges
  makeChallenge('BR', 'sniper AND shotgun', () => weapons.slice()),
  makeChallenge('BR', 'ar AND shotgun', () => weapons.slice()),
  makeChallenge('BR', 'sniper AND pistol', () => weapons.slice()),
  makeChallenge('BR', 'wingman with X', () => weapons.slice()),

  makeChallenge('ARENA', 'all', () => weapons.filter(({ isAirdrop, isArenaStart }) => !isAirdrop && !isArenaStart)),
  makeChallenge('ARENA', 'ar', () => weapons.filter(({ isAirdrop, isArenaStart, type }) => type === 'AR' && !isAirdrop && !isArenaStart)),
  makeChallenge('ARENA', 'smg', () => weapons.filter(({ isAirdrop, isArenaStart, type }) => type === 'SMG' && !isAirdrop && !isArenaStart)),
  makeChallenge('ARENA', 'marksman', () => weapons.filter(({ isAirdrop, isArenaStart, type }) => type === 'Marksman' && !isAirdrop && !isArenaStart))
];

export default challenges;
