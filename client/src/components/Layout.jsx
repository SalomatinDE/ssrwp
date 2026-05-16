import { Outlet, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import MultiTimer from '../components/MultiTimer';

export default function Layout() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <RouterLink to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              🍳 Кулинарная платформа
            </RouterLink>
          </Typography>

          <Button color="inherit" component={RouterLink} to="/">
            Главная
          </Button>
          <Button color="inherit" component={RouterLink} to="/recipes">
            Рецепты
          </Button>
          <Button color="inherit" component={RouterLink} to="/menu">
          Генератор меню
          </Button>
          <Button color="inherit" component={RouterLink} to="/collections">
          Мои коллекции
          </Button>

          <MultiTimer />

          {token && user ? (
            <>
              <Button color="inherit" component={RouterLink} to="/profile">
                Профиль
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Войти
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Регистрация
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}