import { Mode } from '@hooks/useWebsocket';


export type SettingsPrivateProps = {
  mode: Mode
}

export type SettingsPrivateImperativeAPI = {
  runGuard: (fn: () => any) => void
}

export type SettingsPrivateState = {
  isWithBackground: boolean
  currentBackgroundSrc: string | null
  missClickGuard: {
    isEnabled: boolean
    delay: number
  }
}
