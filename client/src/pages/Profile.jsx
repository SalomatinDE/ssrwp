import { useSelector } from 'react-redux';
import { Typography, Box, Avatar, Paper } from '@mui/material';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h5">Загрузка данных профиля...</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Avatar
          src={user.avatar_url}
          sx={{ width: 80, height: 80, mr: 3 }}
        >
          {user.username?.[0]?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h5">{user.username}</Typography>
          <Typography variant="body1" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary">
        Дата регистрации: {new Date(user.created_at).toLocaleDateString()}
      </Typography>
    </Paper>
  );
}