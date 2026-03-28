const router = require('express').Router();
const auth   = require('../middlewares/authMiddleware');
const ctrl   = require('../controllers/notificationController');

router.get('/',          auth, ctrl.getMesNotifications);
router.put('/lire-tout', auth, ctrl.marquerToutLu);
router.put('/:id/lu',    auth, ctrl.marquerLu);

module.exports = router;