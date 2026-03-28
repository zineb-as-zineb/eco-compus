const router = require('express').Router();
const auth   = require('../middlewares/authMiddleware');
const ctrl   = require('../controllers/statsController');

router.get('/', auth, ctrl.getStats);

module.exports = router;