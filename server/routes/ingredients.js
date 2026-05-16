const router = require('express').Router();
const controller = require('../controllers/ingredientsController');

router.get('/', controller.getAll);

module.exports = router;