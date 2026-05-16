const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const {
  registerValidator,
  loginValidator,
  profileValidator
} = require('../utils/validators');

// Публичные эндпоинты
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);

// Защищённые эндпоинты
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, profileValidator, authController.updateProfile);

module.exports = router;