const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const auth   = require('../middlewares/authMiddleware');
const ctrl   = require('../controllers/signalementController');

// ── Config Multer (upload photo) ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Seuls les fichiers image sont acceptés'));
  },
});

// ── Routes ─────────────────────────────────────────────────────────────────
router.get('/',                auth, ctrl.getAll);
router.post('/',               auth, upload.single('photo'), ctrl.create);
router.put('/:id/statut',     auth, ctrl.updateStatut);
router.get('/:id/suggestion', auth, ctrl.getSuggestion);

module.exports = router;
