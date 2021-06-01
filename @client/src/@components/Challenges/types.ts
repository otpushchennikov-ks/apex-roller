import { Dispatch } from 'react';
import { Mode } from '@hooks/useWebsocket';
import { UserShareableState as ShareableState } from '@apex-roller/shared';
import { ShareableStateAction } from '@hooks/useShareableStateReducer';


export type ChallengesProps = {
  mode: Mode
  reconnectWebsocket: () => void
  shareableState: ShareableState
  dispatchShareableState: Dispatch<ShareableStateAction>
  runMissclickguard: (fn: () => any) => void
}
