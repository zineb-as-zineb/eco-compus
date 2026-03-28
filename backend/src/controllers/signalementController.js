const Signalement = require('../models/Signalement');
const User        = require('../models/User');

// ── Logique de suggestion par catégorie ────────────────────────────────────
const genSuggestion = (categorie) => {
  const suggestions = {
    energie: 'Éteignez les appareils en veille et optez pour des équipements basse consommation (classe A+++). ' +
             'Pensez à débrancher les chargeurs inutilisés et à utiliser des multiprises avec interrupteur.',
    eau:     'Signalez les fuites immédiatement au service de maintenance. ' +
             'Installez des réducteurs de débit sur les robinets et sensibilisez la communauté à fermer les robinets pendant le savonnage.',
    eclairage: 'Remplacez les ampoules classiques par des LED basse consommation. ' +
               'Installez des détecteurs de présence dans les couloirs et salles peu fréquentées pour éviter l\'éclairage inutile.',
    autre:   'Évaluez l\'impact environnemental du problème et proposez une solution durable. ' +
             'Impliquez la communauté campus dans la réflexion et contactez le service éco-responsabilité.',
  };
  return suggestions[categorie] ?? suggestions.autre;
};

// GET /api/signalements
exports.getAll = async (req, res) => {
  try {
    const signalements = await Signalement.findAll({
      include: [{ model: User, attributes: ['id', 'nom', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(signalements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/signalements
exports.create = async (req, res) => {
  try {
    const { titre, description, categorie, localisation } = req.body;

    if (!titre || !description || !categorie || !localisation)
      return res.status(400).json({ message: 'Champs requis : titre, description, categorie, localisation' });

    const validCategories = ['energie', 'eau', 'eclairage', 'autre'];
    if (!validCategories.includes(categorie))
      return res.status(400).json({ message: 'Catégorie invalide' });

    const suggestion = genSuggestion(categorie);
    const photo      = req.file ? `uploads/${req.file.filename}` : null;

    const signalement = await Signalement.create({
      titre,
      description,
      categorie,
      localisation,
      suggestion,
      photo,
      user_id: req.user.id,
    });

    res.status(201).json(signalement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/signalements/:id/statut
exports.updateStatut = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' });

    const { statut } = req.body;
    const allowed = ['en_attente', 'en_cours', 'traite'];

    if (!statut || !allowed.includes(statut))
      return res.status(400).json({ message: `Statut invalide. Valeurs acceptées : ${allowed.join(', ')}` });

    const sig = await Signalement.findByPk(req.params.id);
    if (!sig)
      return res.status(404).json({ message: 'Signalement introuvable' });

    await sig.update({ statut });
    res.json(sig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/signalements/:id/suggestion
exports.getSuggestion = async (req, res) => {
  try {
    const sig = await Signalement.findByPk(req.params.id);
    if (!sig)
      return res.status(404).json({ message: 'Signalement introuvable' });

    // Générer et sauvegarder si absent
    if (!sig.suggestion) {
      const suggestion = genSuggestion(sig.categorie);
      await sig.update({ suggestion });
    }

    res.json({ suggestion: sig.suggestion });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
