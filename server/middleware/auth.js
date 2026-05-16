const jwt = require('jsonwebtoken');
const AppError = require('../utils/errors');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Не авторизован. Отсутствует токен.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    throw new AppError('Недействительный или просроченный токен.', 401);
  }
};