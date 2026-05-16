import { Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <Box textAlign="center" mt={8}>
      <Typography variant="h2" gutterBottom>
        Добро пожаловать на Кулинарную платформу
      </Typography>
      <Typography variant="h5" color="text.secondary" mb={4}>
        Генератор меню и тысячи рецептов
      </Typography>
      <Button variant="contained" size="large" component={Link} to="/recipes">
        Смотреть рецепты
      </Button>
    </Box>
  );
}