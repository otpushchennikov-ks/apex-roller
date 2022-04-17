import { Challenge, getChallenges } from '@db';
import { useReducer, useEffect } from 'react';
import { UserShareableState as ShareableState, ChallengeSettings } from '@packages/shared';
import { useLocalStorage } from 'react-use';
import { generateRandomIndex } from '@utils';


const statePersistKey = 'shareable-state-persist';

export type ShareableStateAction =
  | { type: 'changeChallengeMode', nextMode: string }
  | { type: 'changeChallengeIndex', nextIndex: number }
  | { type: 'changeChallengeSettings', nextSettings: ChallengeSettings }
  | { type: 'regenerateGroupedValues' }
  | { type: 'replaceState', nextState: ShareableState };

const getDefaultSettingsByChallenge = (challenge: Challenge): ChallengeSettings => {
  return !challenge.settingsForRender ? {} : challenge.settingsForRender.reduce((accumulator, setting) => ({
    ...accumulator,
    [setting.id]: setting.default,
  }), {} as ChallengeSettings);
};

export const defaultShareableState: ShareableState = {
  challengeMode: 'BR',
  challengeIndex: 0,
  challengeSettings: getDefaultSettingsByChallenge(getChallenges('BR')[0]),
  groupedValues: getChallenges('BR')[0].run(getDefaultSettingsByChallenge(getChallenges('BR')[0])),
};

const reducer = (state: ShareableState, action: ShareableStateAction): ShareableState => {
  switch (action.type) {
    case 'changeChallengeMode': {
      const challenges = getChallenges(action.nextMode);
      const nextChallenge = challenges[generateRandomIndex(challenges.length)];

      return {
        ...state,
        challengeMode: action.nextMode,
        challengeIndex: 0,
        challengeSettings: getDefaultSettingsByChallenge(nextChallenge),
        groupedValues: nextChallenge.run(getDefaultSettingsByChallenge(nextChallenge)),
      };
    }

    case 'changeChallengeIndex': {
      const nextChallenge = getChallenges(state.challengeMode)[action.nextIndex];

      return {
        ...state,
        challengeIndex: action.nextIndex,
        challengeSettings: getDefaultSettingsByChallenge(nextChallenge),
        groupedValues: nextChallenge.run(getDefaultSettingsByChallenge(nextChallenge)),
      };
    }

    case 'changeChallengeSettings': {
      return {
        ...state,
        challengeSettings: action.nextSettings,
        groupedValues: getChallenges(state.challengeMode)[state.challengeIndex].run(action.nextSettings),
      };
    }

    case 'regenerateGroupedValues': {
      const nextGroupedValues = getChallenges(state.challengeMode)[state.challengeIndex].run(state.challengeSettings);
      return {
        ...state,
        groupedValues: nextGroupedValues,
      };
    }

    case 'replaceState':
      return action.nextState;

    default:
      return state;
  }
};

export function useShareableState() {
  const [initialState, persistState] = useLocalStorage(statePersistKey, defaultShareableState);
  const [state, dispatch] = useReducer(reducer, initialState!);
  useEffect(() => persistState(state), [state, persistState]);

  return {
    shareableState: state,
    dispatchShareableState: dispatch,
  };
}
