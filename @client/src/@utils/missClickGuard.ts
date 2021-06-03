type TimerId = number;
type TimerKey = string;

class MissClickGuard {
  private guardsMap: Map<TimerKey, TimerId>
  private delay: number = 1;

  constructor() {
    this.guardsMap = new Map()
  }

  reinit(delay: number) {
    this.delay = delay;
    this.guardsMap.forEach(timerId => window.clearTimeout(timerId));
    this.guardsMap = new Map();
  }

  try(timerKey: TimerKey, onSuccess: () => void, onFailure: () => void) {
    if (!this.guardsMap.has(timerKey)) {
      onSuccess();
      if (this.delay > 0) {
        this.guardsMap.set(timerKey, window.setTimeout(() => {
          this.guardsMap.delete(timerKey);
        }, this.delay));
      }
    } else {
      onFailure();
    }
  }
}

export default MissClickGuard;
