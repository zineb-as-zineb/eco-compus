const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getAll, create, updateStatut, getSuggestion } = require('../controllers/signalementController');

router.get('/',               getAll);
router.post('/',       protect, create);
router.put('/:id/statut', protect, updateStatut);
router.get('/:id/suggestion', getSuggestion);

module.exports = router;