require('dotenv').config();
require('./models/Notification');
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const sequelize = require('./config/db');

// Import des modèles (nécessaire pour la sync)
require('./models/User');
require('./models/Signalement');

const app = express();

// ── Middlewares ────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les photos uploadées statiquement
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/signalements', require('./routes/signalements'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/stats',         require('./routes/stats'));
// Santé du serveur
app.get('/', (req, res) =>
  res.json({ status: '🌱 Campus Éco API opérationnelle', version: '1.0.0' })
);

// Gestion des routes inexistantes
app.use((req, res) =>
  res.status(404).json({ message: 'Route introuvable' })
);

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur :', err.message);
  res.status(500).json({ message: err.message || 'Erreur serveur interne' });
});

// ── Synchronisation DB + démarrage ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion PostgreSQL établie');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Base de données synchronisée');
    app.listen(PORT, () =>
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ Impossible de se connecter à la base :', err.message);
    process.exit(1);
  });
