import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const PRESETS = [
  { label: '1 мин', value: 60 },
  { label: '3 мин', value: 180 },
  { label: '5 мин', value: 300 },
  { label: '10 мин', value: 600 },
  { label: 'Свой', value: 0 }, // кастомный ввод
];

export default function KitchenTimer() {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [snackOpen, setSnackOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customSeconds, setCustomSeconds] = useState('');
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Запуск таймера
  const startTimer = useCallback(() => {
    if (status === 'idle') {
      if (totalSeconds <= 0) return;
      setRemainingSeconds(totalSeconds);
      setStatus('running');
    } else if (status === 'paused') {
      setStatus('running');
    }
  }, [status, totalSeconds]);

  // Остановка (пауза)
  const pauseTimer = useCallback(() => {
    if (status === 'running') {
      setStatus('paused');
    }
  }, [status]);

  // Сброс
  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setStatus('idle');
    setRemainingSeconds(0);
    setTotalSeconds(0);
  }, []);

  // Звуковой сигнал
  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('Не удалось воспроизвести звук', e);
    }
  }, []);

  // Обратный отсчёт
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setStatus('idle');
            playBeep();
            setSnackOpen(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [status, playBeep]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Установка времени из пресета
  const handlePreset = (value) => {
    clearInterval(intervalRef.current);
    setStatus('idle');
    if (value === 0) {
      // кастомный ввод: пересчитываем из полей
      const mins = parseInt(customMinutes, 10) || 0;
      const secs = parseInt(customSeconds, 10) || 0;
      const total = mins * 60 + secs;
      setTotalSeconds(total > 0 ? total : 0);
      setRemainingSeconds(0);
    } else {
      setTotalSeconds(value);
      setRemainingSeconds(0);
    }
  };

  const handleCustomChange = () => {
    const mins = parseInt(customMinutes, 10) || 0;
    const secs = parseInt(customSeconds, 10) || 0;
    const total = mins * 60 + secs;
    if (total > 0) {
      clearInterval(intervalRef.current);
      setStatus('idle');
      setTotalSeconds(total);
      setRemainingSeconds(0);
    }
  };

  // Прогресс
  const progress = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

  return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h5" gutterBottom>
        Кухонный таймер
      </Typography>

      {/* Пресеты */}
      <Box mb={2}>
        <ButtonGroup variant="outlined" size="small">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              onClick={() => handlePreset(preset.value)}
              variant={totalSeconds === preset.value && status !== 'running' ? 'contained' : 'outlined'}
            >
              {preset.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Кастомный ввод (если выбрано "Свой") */}
      {totalSeconds === 0 && (
        <Box display="flex" justifyContent="center" gap={2} mb={2}>
          <TextField
            label="Минуты"
            type="number"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            onBlur={handleCustomChange}
            size="small"
            sx={{ width: 100 }}
          />
          <TextField
            label="Секунды"
            type="number"
            value={customSeconds}
            onChange={(e) => setCustomSeconds(e.target.value)}
            onBlur={handleCustomChange}
            size="small"
            sx={{ width: 100 }}
          />
        </Box>
      )}

      {/* Визуализация времени */}
      <Box position="relative" display="inline-flex" mt={2}>
        <CircularProgress
          variant="determinate"
          value={progress}
          size={200}
          thickness={3}
        />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h3" component="div" color="text.primary">
            {formatTime(status === 'idle' ? totalSeconds : remainingSeconds)}
          </Typography>
        </Box>
      </Box>

      {/* Кнопки управления */}
      <Box mt={3} display="flex" justifyContent="center" gap={2}>
        {status === 'idle' || status === 'paused' ? (
          <Button variant="contained" onClick={startTimer} disabled={totalSeconds <= 0}>
            Старт
          </Button>
        ) : null}
        {status === 'running' && (
          <Button variant="outlined" onClick={pauseTimer}>
            Пауза
          </Button>
        )}
        {status !== 'idle' && (
          <Button variant="outlined" color="error" onClick={resetTimer}>
            Сброс
          </Button>
        )}
      </Box>

      {/* Уведомление о завершении */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
      >
        <Alert severity="success" onClose={() => setSnackOpen(false)}>
          Время вышло!
        </Alert>
      </Snackbar>
    </Box>
  );
}