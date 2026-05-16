const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User, Collection } = require('../models');
const AppError = require('../utils/errors');

// Генерация токенов
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { email, password, username } = req.body;

    // Проверка уникальности email и username
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Пользователь с таким email уже существует', 400);
    }
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      throw new AppError('Имя пользователя занято', 400);
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password_hash,
      username
    });

    const collection = await Collection.create({
      user_id: user.id,
      name: 'Избранное',
      is_favorites: true
    });

    const tokens = generateTokens(user.id);

    res.status(201).json({
      tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new AppError('Неверный email или пароль', 401);
    }

    const tokens = generateTokens(user.id);

    res.json({
      tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me (защищённый)
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'username', 'avatar_url', 'created_at']
    });
    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/profile (защищённый)
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { username, avatar_url } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }

    // Проверка уникальности нового username
    if (username && username !== user.username) {
      const existing = await User.findOne({ where: { username } });
      if (existing) {
        throw new AppError('Имя пользователя уже занято', 400);
      }
    }

    // Обновление разрешённых полей
    if (username !== undefined) user.username = username;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;
    await user.save();

    // Вернуть обновлённый профиль (без пароля)
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    });
  } catch (err) {
    next(err);
  }
};