const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const commentsController = require('../controllers/commentsController');
const { commentValidator } = require('../utils/validators');

router.put('/:id', authMiddleware, commentValidator, commentsController.update);
router.delete('/:id', authMiddleware, commentsController.delete);

module.exports = router;