import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress
} from '@mui/material';
import { registerUser, clearError } from '../store/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const validate = () => {
    const errors = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Введите корректный email';
    }
    if (!form.username || form.username.trim().length < 3) {
      errors.username = 'Имя пользователя (минимум 3 символа)';
    }
    if (!form.password || form.password.length < 6) {
      errors.password = 'Пароль должен быть минимум 6 символов';
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }
    return errors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
    // Сбрасываем ошибку конкретного поля, если она есть
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    dispatch(registerUser({ email: form.email, username: form.username, password: form.password }));
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h4" mb={3}>
        Регистрация
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          margin="normal"
          error={!!validationErrors.email}
          helperText={validationErrors.email}
          required
        />
        <TextField
          fullWidth
          label="Имя пользователя"
          name="username"
          value={form.username}
          onChange={handleChange}
          margin="normal"
          error={!!validationErrors.username}
          helperText={validationErrors.username}
          required
        />
        <TextField
          fullWidth
          label="Пароль"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          margin="normal"
          error={!!validationErrors.password}
          helperText={validationErrors.password}
          required
        />
        <TextField
          fullWidth
          label="Подтверждение пароля"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          margin="normal"
          error={!!validationErrors.confirmPassword}
          helperText={validationErrors.confirmPassword}
          required
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
        </Button>
      </form>

      <Typography mt={2} textAlign="center">
        Уже есть аккаунт?{' '}
        <Link component={RouterLink} to="/login">
          Войти
        </Link>
      </Typography>
    </Box>
  );
}