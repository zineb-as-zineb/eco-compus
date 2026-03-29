const Signalement = require('../models/Signalement');
const { Op } = require('sequelize');
const User        = require('../models/User');
const Notification = require('../models/Notification');
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
    const { categorie, statut, search } = req.query;
    const where = {};

    if (categorie) where.categorie = categorie;
    if (statut)    where.statut    = statut;
    if (search) {
      where[Op.or] = [
        { titre:        { [Op.iLike]: `%${search}%` } },
        { localisation: { [Op.iLike]: `%${search}%` } },
        { description:  { [Op.iLike]: `%${search}%` } },
      ];
    }

    const signalements = await Signalement.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'nom', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    const result = signalements.map(s => {
      const data = s.toJSON();
      if (data.anonyme && req.user.role !== 'admin') {
        data.User = { id: null, nom: 'Anonyme', email: null };
      }
      return data;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/signalements
exports.create = async (req, res) => {
  try {
    const { titre, description, categorie, localisation, anonyme } = req.body;

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
      anonyme: anonyme === 'true' || anonyme === true,
    });

    // ✅ Notifier tous les admins
    const admins = await User.findAll({ where: { role: 'admin' } });
    await Promise.all(admins.map(admin =>
      Notification.create({
        user_id: admin.id,
        signalement_id: signalement.id,
        message: `📋 Nouveau signalement : "${titre}" — catégorie ${categorie}`,
      })
    ));

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

    // ✅ Notifier l'étudiant qui a créé le signalement
    const labels = { en_attente: '⏳ En attente', en_cours: '🔧 En cours', traite: '✅ Traité' };
    await Notification.create({
      user_id: sig.user_id,
      signalement_id: sig.id,
      message: `Votre signalement "${sig.titre}" est maintenant : ${labels[statut]}`,
    });

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
