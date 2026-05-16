import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import { toggleTimer, removeTimer } from '../store/timersSlice';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function MultiTimer() {
  const dispatch = useDispatch();
  const { timers } = useSelector((state) => state.timers);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const activeCount = timers.filter(t => t.status !== 'completed').length;

  // Запрашиваем разрешение на уведомления при монтировании
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={activeCount} color="error">
          <TimerIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{ sx: { width: 300, maxHeight: 400, overflow: 'auto' } }}
      >
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Таймеры
          </Typography>
          {timers.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Нет активных таймеров
            </Typography>
          )}

          <List dense>
            {timers.map((timer) => (
              <ListItem key={timer.id} divider>
                <ListItemText
                  primary={timer.label || 'Без названия'}
                  secondary={
                    timer.status === 'completed'
                      ? 'Завершён'
                      : `${formatTime(timer.remaining)} из ${formatTime(timer.total)}`
                  }
                />
                {timer.status !== 'completed' && (
                  <ListItemSecondaryAction>
                    <ButtonGroup size="small" variant="outlined">
                      {timer.status === 'running' && (
                        <Button onClick={() => dispatch(toggleTimer(timer.id))} size="small">
                          Пауза
                        </Button>
                      )}
                      {timer.status === 'paused' && (
                        <Button onClick={() => dispatch(toggleTimer(timer.id))} size="small">
                          Старт
                        </Button>
                      )}
                      <Button
                        onClick={() => dispatch(removeTimer(timer.id))}
                        size="small"
                        color="error"
                      >
                        Сброс
                      </Button>
                    </ButtonGroup>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  );
}