import { SetStateAction, Dispatch } from 'react';
import { Mode } from '@components/App/types';


export type SettingsProps = {
  mode: Mode
  state: SettingsState
  setState: Dispatch<SetStateAction<SettingsState>>
}

export type SettingsState = {
  notificationIsEnabled: boolean
  notificationKey: string
  backgroundImageIsEnabled: boolean
  backgroundSrc: string | null
  missClickGuard: {
    isEnabled: boolean
    delay: number
  }
}
