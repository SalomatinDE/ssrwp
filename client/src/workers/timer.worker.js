// src/workers/timer.worker.js
const timers = new Map(); // id -> { total, remaining, status, intervalId }

self.onmessage = (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'start': {
      const { id, duration } = payload;
      // Если уже есть таймер с таким id – очистим его и перезапустим
      stopTimer(id);
      const timer = {
        id,
        total: duration,
        remaining: duration,
        status: 'running',
        intervalId: null,
      };
      timer.intervalId = setInterval(() => {
        timer.remaining -= 1;
        self.postMessage({ type: 'tick', id, remaining: timer.remaining });
        if (timer.remaining <= 0) {
          clearInterval(timer.intervalId);
          timer.status = 'completed';
          self.postMessage({ type: 'completed', id });
          timers.delete(id);
        }
      }, 1000);
      timers.set(id, timer);
      self.postMessage({ type: 'tick', id, remaining: timer.remaining });
      break;
    }
    case 'pause': {
      const { id } = payload;
      const timer = timers.get(id);
      if (timer && timer.status === 'running') {
        clearInterval(timer.intervalId);
        timer.status = 'paused';
        self.postMessage({ type: 'statusChanged', id, status: 'paused' });
      }
      break;
    }
    case 'resume': {
      const { id } = payload;
      const timer = timers.get(id);
      if (timer && timer.status === 'paused') {
        timer.status = 'running';
        timer.intervalId = setInterval(() => {
          timer.remaining -= 1;
          self.postMessage({ type: 'tick', id, remaining: timer.remaining });
          if (timer.remaining <= 0) {
            clearInterval(timer.intervalId);
            timer.status = 'completed';
            self.postMessage({ type: 'completed', id });
            timers.delete(id);
          }
        }, 1000);
        self.postMessage({ type: 'statusChanged', id, status: 'running' });
      }
      break;
    }
    case 'reset': {
      const { id } = payload;
      const timer = timers.get(id);
      if (timer) {
        clearInterval(timer.intervalId);
        timers.delete(id);
        self.postMessage({ type: 'removed', id });
      }
      break;
    }
    default:
      break;
  }
};

function stopTimer(id) {
  const timer = timers.get(id);
  if (timer) {
    clearInterval(timer.intervalId);
    timers.delete(id);
  }
}