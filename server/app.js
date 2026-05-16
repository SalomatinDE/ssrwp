require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const AppError = require('./utils/errors');

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', recipeRoutes);

app.use('/api/menu', require('./routes/menu'));
app.use('/api/ingredients', require('./routes/ingredients'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/history', require('./routes/history'));

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Маршрут ${req.originalUrl} не найден`, 404));
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
