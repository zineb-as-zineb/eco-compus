const Signalement = require('../models/Signalement');
const User = require('../models/User');

const suggestions = {
  energie:   "Éteignez les appareils en veille et utilisez des multiprises intelligentes.",
  eau:       "Signalez au service technique et fermez l'arrivée d'eau principale.",
  eclairage: "Installez des détecteurs de présence pour éteindre les lumières automatiquement.",
  autre:     "Consultez le guide éco-responsable du campus."
};

const getAll = async (req, res) => {
  try {
    const signalements = await Signalement.findAll({
      include: [{ model: User, as: 'auteur', attributes: ['id', 'nom', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(signalements);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const create = async (req, res) => {
  try {
    const { titre, description, categorie, localisation } = req.body;
    const signalement = await Signalement.create({
      titre, description, categorie, localisation,
      suggestion: suggestions[categorie] || suggestions.autre,
      user_id: req.user.id
    });
    res.status(201).json(signalement);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    if (!['en_attente', 'en_cours', 'traite'].includes(statut))
      return res.status(400).json({ message: 'Statut invalide' });

    const signalement = await Signalement.findByPk(req.params.id);
    if (!signalement) return res.status(404).json({ message: 'Non trouvé' });

    signalement.statut = statut;
    await signalement.save();
    res.json(signalement);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getSuggestion = async (req, res) => {
  try {
    const signalement = await Signalement.findByPk(req.params.id);
    if (!signalement) return res.status(404).json({ message: 'Non trouvé' });
    res.json({ suggestion: signalement.suggestion });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAll, create, updateStatut, getSuggestion };