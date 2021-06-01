import load from 'audio-loader';
import play from 'audio-play';


export const audioMap = {
  allEyesOnMe: {
    path: './audio/all eyes on me.mp3',
    name: 'All eyes on me',
  },
  base: {
    path: './audio/base.mp3',
    name: 'Base',
  },
  croak: {
    path: './audio/croak.mp3',
    name: 'Croak',
  },
  directQuieterVersion: {
    path: './audio/direct quieter version.mp3',
    name: 'Direct quieter version',
  },
  facebook: {
    path: './audio/facebook.mp3',
    name: 'Facebook',
  },
  glassySoftKnock: {
    path: './audio/glassy soft knock.mp3',
    name: 'Glassy soft knock',
  },
  justLikeThat: {
    path: './audio/just like that.mp3',
    name: 'Just like that'
  },
  knob: {
    path: './audio/knob.mp3',
    name: 'Knob',
  },
  plastik: {
    path: './audio/plastik.mp3',
    name: 'Plastik',
  },
};


export function playAudio(key: keyof typeof audioMap, volume = 0.7) {
  load(audioMap[key].path)
    .then(buffer => play(buffer, { volume }));
}
