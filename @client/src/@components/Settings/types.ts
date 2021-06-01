import { SetStateAction, Dispatch } from 'react';
import { Mode } from '@hooks/useWebsocket';
import { audioMap } from '@utils/audio';


export type SettingsProps = {
  mode: Mode
  state: SettingsState
  setState: Dispatch<SetStateAction<SettingsState>>
}

export type SettingsImperativeAPI = {
  runGuard: (fn: () => any) => void
}

export type SettingsState = {
  notificationIsEnabled: boolean
  notificationKey: keyof typeof audioMap
  backgroundImageIsEnabled: boolean
  backgroundSrc: string | null
  missClickGuard: {
    isEnabled: boolean
    delay: number
  }
}
