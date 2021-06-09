import { range } from 'ramda';


const generateRandomIndex = (length: number) => Math.floor(Math.random() * length);

function selectRandom<T>(
  n: number,
  pool: T[],
  {
    withReplacement = true,
    uniquenessPredicate,
  }: {
    withReplacement: boolean,
    uniquenessPredicate?: (a: T, b: T) => boolean
}): T[] {
  if (n >= pool.length) {
    return pool;
  }
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    const nextIndex = generateRandomIndex(pool.length);
    const selectedItem = pool[nextIndex];
    result.push(selectedItem);

    if (uniquenessPredicate) {
      for (let j = pool.length - 1; j >= 0; j--) {
        if (uniquenessPredicate(selectedItem, pool[j])) {
          pool.splice(j, 1);
        }
      }
    } else if (!withReplacement) {
      pool.splice(nextIndex, 1);
    }
  }
  return result;
}

function selectFromMultiplePools<T>(
  n: number,
  pools: T[][],
  {
    withReplacement = true,
    uniquenessPredicate,
  }: {
    withReplacement: boolean,
    uniquenessPredicate?: (a: T, b: T) => boolean,
}): T[][] {
  const result: T[][] = Array.from(range(0, pools.length), () => []);
  const excessItems = n % pools.length;
  // TODO: allow for multiple strategies
  for (let i = 0; i < excessItems; ++i) {
    const selectedPool = generateRandomIndex(pools.length);
    result[selectedPool].push(...selectRandom(1, pools[selectedPool], { withReplacement, uniquenessPredicate }));
  }
  const nItemsPerPool = Math.floor(n / pools.length);
  if (nItemsPerPool > 0) {
    for (let poolId = 0; poolId < pools.length; ++poolId) {
      const itemsToAdd = selectRandom(nItemsPerPool, pools[poolId], { withReplacement, uniquenessPredicate });
      result[poolId].push(...itemsToAdd);
    }
  }
  return result;
}

const backgrounds = [
  'https://images6.alphacoders.com/992/thumb-1920-992280.jpg',
  'https://images2.alphacoders.com/992/thumb-1920-992034.jpg',
  'https://images2.alphacoders.com/989/thumb-1920-989919.png',
  'https://images7.alphacoders.com/104/thumb-1920-1042341.jpg',
  'https://images8.alphacoders.com/100/thumb-1920-1005726.jpg',
  'https://images5.alphacoders.com/102/thumb-1920-1028455.jpg',
  'https://images6.alphacoders.com/112/thumb-1920-1124008.jpg',
  'https://images7.alphacoders.com/112/thumb-1920-1124004.jpg',
  'https://wallpapercave.com/wp/wp3969391.jpg',
];

const generateRandomBackgroundSrc = (current?: string) => {
  const generate = () => backgrounds[generateRandomIndex(backgrounds.length)];
  let nextBackground = generate();

  while (nextBackground === current) {
    nextBackground = generate();
  }

  return nextBackground;
};

export {
  generateRandomBackgroundSrc,
  generateRandomIndex,
  selectFromMultiplePools,
  selectRandom,
};
