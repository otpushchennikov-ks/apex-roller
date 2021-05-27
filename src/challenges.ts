import weapons, { Weapon } from './weapons';


type Challenge = {
  name: string
  runFn: (weaponsCount: number, isUnique?: boolean) => Weapon[]
}

type ChallengeFactory = (name: string, poolFactory: () => Weapon[]) => Challenge

const makeChallenge: ChallengeFactory = (name, poolFactory) => {
  return {
    name,
    runFn: (weaponsCount, isUnique = true) => {
      let pool = poolFactory();
      const generateIndex = () => Math.floor(Math.random() * pool.length);
  
      if (weaponsCount >= pool.length) {
        return pool;
      }
      
      let result: Weapon[] = [];
      for (let i = 0; i < weaponsCount; i++) {
        const nextIndex = generateIndex();
  
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
  makeChallenge('BR: all weapons without airdrops', () => weapons.filter(({ isAirdrop }) => !isAirdrop)),
];

const arenaChallenges: Challenge[] = [
  makeChallenge('Arena: all weapons', () => weapons.filter(({ isAirdrop, isArenaStart }) => !isAirdrop && !isArenaStart)),
];

const challenges: Challenge[] = [
  ...brChallenges,
  ...arenaChallenges,
];

export default challenges;
