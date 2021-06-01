import challenges from '@modules/challenges';
import { useReducer, useEffect } from 'react';
import { UserShareableState as ShareableState } from '@apex-roller/shared';
import { useLocalStorage } from 'react-use';
import generateRandomIndex from '@utils/generateRandomIndex';


const statePersistKey = 'shareable-state-persist';

export type ShareableStateAction = 
  | { type: 'changeIndex', nextIndex: number }
  | { type: 'changeCount', nextCount: number }
  | { type: 'changeIsUnique', nextIsUnique: boolean }
  | { type: 'regenerateWeapons' }
  | { type: 'replaceState', nextState: ShareableState };

const defaultState: ShareableState = {
  challengeIndex: 0,
  count: 2,
  isUnique: true,
  weapons: challenges[generateRandomIndex(challenges.length)].runFn(2, true),
};

const reducer = (state: ShareableState, action: ShareableStateAction): ShareableState => {
  switch (action.type) {
    case 'changeIndex':
      return {
        ...state,
        challengeIndex: action.nextIndex,
        weapons: challenges[action.nextIndex].runFn(state.count, state.isUnique),
      };

    case 'changeCount':
      return {
        ...state,
        count: action.nextCount,
        weapons: challenges[state.challengeIndex].runFn(action.nextCount, state.isUnique),
      };

    case 'changeIsUnique':
      return {
        ...state,
        isUnique: action.nextIsUnique,
        weapons: challenges[state.challengeIndex].runFn(state.count, action.nextIsUnique),
      };

    case 'regenerateWeapons':
      return {
        ...state,
        weapons: challenges[state.challengeIndex].runFn(state.count, state.isUnique),
      };
    
    case 'replaceState':
      return action.nextState;

    default:
      return state;
  }
};

export default function useShareableStateReducer() {
  const [initialState, persistState] = useLocalStorage(statePersistKey, defaultState);
  const [state, dispatch] = useReducer(reducer, initialState!);
  useEffect(() => persistState(state), [state, persistState]);

  return {
    shareableState: state,
    dispatchShareableState: dispatch,
  };
}
