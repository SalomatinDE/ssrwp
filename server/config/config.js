// server/config/config.js
require('dotenv').config(); // загружаем переменные из .env

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    seederStorage: 'sequelize' // опционально: хранение выполненных сидов
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME + '_test',
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  },
  production: {
    use_env_variable: 'DATABASE_URL', // для production обычно используется одна строка подключения
    dialect: 'postgres',
    logging: false
  }
};