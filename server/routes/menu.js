const router = require('express').Router();
const menuController = require('../controllers/menuController');
const { menuGenerateValidator } = require('../utils/validators');

router.post('/generate', menuGenerateValidator, menuController.generate);

module.exports = router;