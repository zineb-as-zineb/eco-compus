const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { nom, email, mot_de_passe, role } = req.body;

    if (!nom || !email || !mot_de_passe)
      return res.status(400).json({ message: 'Champs requis manquants (nom, email, mot_de_passe)' });

    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });

    const hash = await bcrypt.hash(mot_de_passe, 10);
    const user = await User.create({
      nom,
      email,
      mot_de_passe: hash,
      role: role === 'admin' ? 'admin' : 'etudiant',
    });

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe)
      return res.status(400).json({ message: 'Email et mot de passe requis' });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: 'Utilisateur introuvable' });

    const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!valid)
      return res.status(401).json({ message: 'Mot de passe incorrect' });

    res.json({
      token: generateToken(user),
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
