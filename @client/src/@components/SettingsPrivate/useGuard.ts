import { useImperativeHandle, useRef, useEffect, ForwardedRef } from 'react';
import { message as noty } from 'antd';
import { SettingsPrivateImperativeAPI, SettingsPrivateState } from './types';


export default function useGuard(ref: ForwardedRef<SettingsPrivateImperativeAPI>, reactiveData: SettingsPrivateState['missClickGuard']) {
  const timerIdRef = useRef<number | null>(null)
  const refData = useRef(reactiveData);
  
  // Сохраняем реактивные данные в данные-ссылку для удобства,
  // т.к. реализуем публичное апи через useImperativeHandle
  useEffect(() => {
    refData.current = reactiveData;
    if (typeof timerIdRef.current === 'number') {
      window.clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, [reactiveData]);

  useImperativeHandle(ref, () => ({
    runGuard: (fn) => {
      if (typeof timerIdRef.current === 'number' && refData.current.isEnabled) {
        noty.info(`No more than once every ${refData.current.delay / 1000} seconds`, 3);
        return;
      };

      if (refData.current.isEnabled) {
        timerIdRef.current = window.setTimeout(() => {
          timerIdRef.current = null;
        }, refData.current.delay);
      }

      fn();
    },
  }));
}
