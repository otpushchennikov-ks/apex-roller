import challenges from '@modules/challenges';
import { useReducer, useEffect } from 'react';
import { UserShareableState as State } from '@apex-roller/shared';
import { useEffectOnce, useLocalStorage } from 'react-use';


const statePersistKey = 'user-shareable-state-persist';

type Action = 
  | { type: 'changeIndex', nextIndex: number }
  | { type: 'changeCount', nextCount: number }
  | { type: 'changeIsUnique', nextIsUnique: boolean }
  | { type: 'regenerateWeapons' };

const defaultState: State = {
  challengeIndex: 0,
  count: 2,
  isUnique: true,
  weapons: [],
};

const reducer = (state: State, action: Action): State => {
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
        weapons: challenges[state.challengeIndex].runFn(state.count, state.isUnique),
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

    default:
      return state;
  }
};

export default function useUserShareableStateReducer() {
  const [initialState, persistState] = useLocalStorage(statePersistKey, defaultState);

  const [state, dispatch] =  useReducer(reducer, initialState!);

  useEffect(() => persistState(state), [state, persistState]);

  useEffectOnce(() => {
    if (!state.weapons.length) {
      dispatch({ type: 'regenerateWeapons' });
    }
  });

  return {
    userShareableState: state,
    dispatchUserShareableState: dispatch,
  };
}
