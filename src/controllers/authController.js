const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const register = async (req, res) => {
  try {
    const { nom, email, mot_de_passe } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email déjà utilisé' });

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const user = await User.create({ nom, email, mot_de_passe: hashedPassword });

    res.status(201).json({ token: generateToken(user), user: { id: user.id, nom: user.nom, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });

    res.json({ token: generateToken(user), user: { id: user.id, nom: user.nom, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };