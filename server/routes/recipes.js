const router = require('express').Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/auth');
const commentsController = require('../controllers/commentsController');
const { commentValidator } = require('../utils/validators');
const { recipeValidator, recipeUpdateValidator } = require('../utils/validators');
const viewHistoryController = require('../controllers/viewHistoryController');

// Публичные
router.get('/', recipeController.getAll);
router.get('/:id', recipeController.getById);

// Защищённые
router.post('/', authMiddleware, recipeValidator, recipeController.create);
router.put('/:id', authMiddleware, recipeUpdateValidator, recipeController.update);
router.delete('/:id', authMiddleware, recipeController.delete);
// Запись просмотра рецепта (защищённый)
router.post('/:id/view', authMiddleware, viewHistoryController.recordView);

const rateValidator = require('../utils/validators').rateValidator;
router.post('/:id/rate', authMiddleware, rateValidator, require('../controllers/ratingController').rate);

// Комментарии к рецепту
router.get('/:id/comments', commentsController.getAllByRecipe);
router.post('/:id/comments', authMiddleware, commentValidator, commentsController.create);

module.exports = router;