const { body } = require('express-validator');

exports.registerValidator = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
  body('username').trim().isLength({ min: 3 }).withMessage('Имя пользователя минимум 3 символа')
];

exports.loginValidator = [
  body('email').isEmail().withMessage('Введите корректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен')
];

exports.profileValidator = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Имя пользователя должно быть минимум 3 символа'),
  body('avatar_url')
    .optional()
    .isURL()
    .withMessage('Некорректный URL аватара')
];

// Создание рецепта
exports.recipeValidator = [
  body('title').notEmpty().withMessage('Название рецепта обязательно'),
  body('description').optional().isString(),
  body('cooking_time').optional().isInt({ min: 1 }).withMessage('Время приготовления должно быть положительным числом'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Сложность должна быть easy, medium или hard'),
  body('image_url').optional().isURL().withMessage('Некорректный URL изображения'),
  body('ingredients')
    .isArray({ min: 1 }).withMessage('Добавьте хотя бы один ингредиент'),
  body('ingredients.*.ingredient_id')
    .isInt({ min: 1 }).withMessage('ID ингредиента должен быть положительным числом'),
  body('ingredients.*.quantity')
    .isFloat({ min: 0.01 }).withMessage('Количество должно быть больше 0'),
  body('ingredients.*.unit')
    .notEmpty().withMessage('Единица измерения обязательна'),
  body('steps')
    .isArray({ min: 1 }).withMessage('Добавьте хотя бы один шаг'),
  body('steps.*.step_number')
    .isInt({ min: 1 }).withMessage('Номер шага должен быть положительным числом'),
  body('steps.*.instruction')
    .notEmpty().withMessage('Инструкция шага обязательна'),
  body('steps.*.duration')
    .optional().isInt({ min: 0 }).withMessage('Длительность шага должна быть неотрицательным числом')
];

// Обновление рецепта (поля опциональны, но если переданы, должны быть валидны)
exports.recipeUpdateValidator = [
  body('title').optional().notEmpty().withMessage('Название не может быть пустым'),
  body('description').optional().isString(),
  body('cooking_time').optional().isInt({ min: 1 }).withMessage('Время приготовления должно быть положительным числом'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Сложность должна быть easy, medium или hard'),
  body('image_url').optional().isURL().withMessage('Некорректный URL изображения'),
  body('ingredients')
    .optional()
    .isArray({ min: 1 }).withMessage('Добавьте хотя бы один ингредиент'),
  body('ingredients.*.ingredient_id')
    .optional().isInt({ min: 1 }).withMessage('ID ингредиента должен быть положительным числом'),
  body('ingredients.*.quantity')
    .optional().isFloat({ min: 0.01 }).withMessage('Количество должно быть больше 0'),
  body('ingredients.*.unit')
    .optional().notEmpty().withMessage('Единица измерения обязательна'),
  body('steps')
    .optional()
    .isArray({ min: 1 }).withMessage('Добавьте хотя бы один шаг'),
  body('steps.*.step_number')
    .optional().isInt({ min: 1 }).withMessage('Номер шага должен быть положительным числом'),
  body('steps.*.instruction')
    .optional().notEmpty().withMessage('Инструкция шага обязательна'),
  body('steps.*.duration')
    .optional().isInt({ min: 0 }).withMessage('Длительность шага должна быть неотрицательным числом')
];

// Генерация меню
exports.menuGenerateValidator = [
  body('ingredients')
    .isArray({ min: 1 }).withMessage('Укажите хотя бы один ингредиент'),
  body('ingredients.*')
    .isString().trim().notEmpty().withMessage('Название ингредиента не должно быть пустым')
];

// Оценка рецепта
exports.rateValidator = [
  body('score')
    .isInt({ min: 1, max: 5 }).withMessage('Оценка должна быть от 1 до 5')
];

// комментарий
exports.commentValidator = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Комментарий должен содержать от 1 до 1000 символов')
];