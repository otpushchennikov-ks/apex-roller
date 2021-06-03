import { Dispatch, SetStateAction } from 'react';
import { Mode } from '@components/App/types';
import { UserShareableState as ShareableState } from '@apex-roller/shared';
import { ShareableStateAction } from '@hooks/useShareableStateReducer';
import { SettingsState } from '@components/Settings/types';


export type ChallengesProps = {
  mode: Mode
  setMode: Dispatch<SetStateAction<Mode>>
  shareableState: ShareableState
  dispatchShareableState: Dispatch<ShareableStateAction>
  settings: SettingsState
}
