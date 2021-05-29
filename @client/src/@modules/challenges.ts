import { ChallengeFactory, Challenge, Weapon } from '@apex-roller/shared';
import weapons from '@modules/weapons';
import generateRandomIndex from '@utils/generateRandomIndex';

const makeChallenge: ChallengeFactory = (name, poolFactory) => {
  return {
    name,
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

const brChallenges: Challenge[] = [
  makeChallenge('BR: all weapons', () => weapons.slice()),
  makeChallenge('BR: all weapons without airdrop', () => weapons.filter(({ isAirdrop }) => !isAirdrop)),
  makeChallenge('BR: all pistols', () => weapons.filter(({ type }) => type === 'Pistol')),
  makeChallenge('BR: all smg\'s', () => weapons.filter(({ type }) => type === 'SMG')),
  makeChallenge('BR: snipers and pistols', () => weapons.filter(({ type }) => type === 'Sniper' || type === 'Pistol')),
];

const arenaChallenges: Challenge[] = [
  makeChallenge('Arena: all weapons', () => weapons.filter(({ isAirdrop, isArenaStart }) => !isAirdrop && !isArenaStart)),
];

const challenges: Challenge[] = [
  ...brChallenges,
  ...arenaChallenges,
];

export default challenges;
