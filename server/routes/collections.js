const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const ctrl = require('../controllers/collectionsController');

router.use(authMiddleware); // все маршруты защищены

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.rename);
router.delete('/:id', ctrl.delete);
router.get('/:id/recipes', ctrl.getRecipes);
router.post('/:id/recipes', ctrl.addRecipe);
router.delete('/:id/recipes/:recipeId', ctrl.removeRecipe);

module.exports = router;