import { createSlice } from '@reduxjs/toolkit';

// Worker создаётся лениво, чтобы не блокировать серверный рендеринг
let worker = null;

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('../workers/timer.worker.js', import.meta.url), {
      type: 'module',
    });
  }
  return worker;
}

// Вспомогательная функция для отправки сообщения в worker
function postMessage(type, payload = {}) {
  getWorker().postMessage({ type, payload });
}

// Звуковой сигнал (используется в middleware или компоненте)
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // ignore
  }
}

const timersSlice = createSlice({
  name: 'timers',
  initialState: {
    timers: [], // массив объектов { id, label, total, remaining, status }
    workerReady: false,
  },
  reducers: {
    // Добавить новый таймер (запускается сразу)
    addTimer(state, action) {
      const { label, duration } = action.payload;
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      state.timers.push({
        id,
        label,
        total: duration,
        remaining: duration,
        status: 'running',
      });
      postMessage('start', { id, duration });
    },
    // Пауза / возобновление
    toggleTimer(state, action) {
      const timer = state.timers.find((t) => t.id === action.payload);
      if (!timer) return;
      if (timer.status === 'running') {
        postMessage('pause', { id: timer.id });
        timer.status = 'paused';
      } else if (timer.status === 'paused') {
        postMessage('resume', { id: timer.id });
        timer.status = 'running';
      }
    },
    // Удалить таймер (сброс)
    removeTimer(state, action) {
      const id = action.payload;
      const index = state.timers.findIndex((t) => t.id === id);
      if (index !== -1) {
        postMessage('reset', { id });
        state.timers.splice(index, 1);
      }
    },
    // Обновить оставшееся время из worker
    updateTimer(state, action) {
      const { id, remaining } = action.payload;
      const timer = state.timers.find((t) => t.id === id);
      if (timer) {
        timer.remaining = remaining;
      }
    },
    // Таймер завершён
    timerCompleted(state, action) {
      const id = action.payload;
      const timer = state.timers.find((t) => t.id === id);
      if (timer) {
        timer.status = 'completed';
        timer.remaining = 0;
        // Удаляем из списка через некоторое время? Можно оставить.
      }
    },
    // Установить готовность worker (можно использовать для отложенной инициализации)
    setWorkerReady(state) {
      state.workerReady = true;
    },
  },
});

export const { addTimer, toggleTimer, removeTimer, updateTimer, timerCompleted, setWorkerReady } = timersSlice.actions;

// Подписка на сообщения worker (запускается при первом использовании)
export function initWorkerListener(dispatch) {
  const w = getWorker();
  w.onmessage = (e) => {
    const { type, id, remaining } = e.data;
    switch (type) {
      case 'tick':
        dispatch(updateTimer({ id, remaining }));
        break;
      case 'completed':
        dispatch(timerCompleted(id));
        // Звуковой сигнал и уведомление
        playBeep();
        if (Notification.permission === 'granted') {
          const timer = store?.getState?.()?.timers?.timers?.find(t => t.id === id);
          new Notification('Таймер завершён', { body: timer?.label || 'Время вышло!' });
        }
        break;
      case 'statusChanged':
        // можно обработать, но статус уже обновлён в toggleTimer
        break;
      case 'removed':
        // Таймер удалён из worker, можно игнорировать
        break;
      default:
        break;
    }
  };
  dispatch(setWorkerReady());
}

// store для доступа из listener (нужен для Notification)
let store;
export function setStore(s) {
  store = s;
}

export default timersSlice.reducer;