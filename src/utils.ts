import { v4 as uuid } from 'uuid';


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

export const generateRandomIndex = (length: number) => Math.floor(Math.random() * length);

export const generateRandomBackgroundSrc = (current?: string) => {
  const generate = () => backgrounds[generateRandomIndex(backgrounds.length)];
  let nextBackground = generate();

  while (nextBackground === current) {
    nextBackground = generate();
  }

  return nextBackground;
};

export const getCurrentUserId = () => {
  if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', uuid());
  }

  return localStorage.getItem('userId');
};
