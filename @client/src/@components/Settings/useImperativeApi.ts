import { useImperativeHandle, useRef, useEffect, ForwardedRef } from 'react';
import { message as noty } from 'antd';
import { SettingsImperativeAPI, SettingsState } from './types';


export default function useImperativeApi(ref: ForwardedRef<SettingsImperativeAPI>, reactiveState: SettingsState) {
  const timerIdRef = useRef<number | null>(null)
  const missClickGuardAsRef = useRef(reactiveState.missClickGuard);
  
  // Сохраняем реактивные данные в данные-ссылку для удобства,
  // т.к. реализуем публичное апи через useImperativeHandle
  useEffect(() => {
    missClickGuardAsRef.current = reactiveState.missClickGuard;
    if (typeof timerIdRef.current === 'number') {
      window.clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, [reactiveState.missClickGuard]);

  useImperativeHandle(ref, () => ({
    runGuard: fn => {
      if (typeof timerIdRef.current === 'number' && missClickGuardAsRef.current.isEnabled) {
        noty.info(`No more than once every ${missClickGuardAsRef.current.delay / 1000} seconds`, 3);
        return;
      };

      fn();

      if (missClickGuardAsRef.current.isEnabled) {
        timerIdRef.current = window.setTimeout(() => {
          timerIdRef.current = null;
        }, missClickGuardAsRef.current.delay);
      }
    },
  }));
}
