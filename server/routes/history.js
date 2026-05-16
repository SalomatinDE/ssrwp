const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const viewHistoryController = require('../controllers/viewHistoryController');

router.get('/', authMiddleware, viewHistoryController.getHistory);

module.exports = router;