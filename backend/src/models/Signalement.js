const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Signalement = sequelize.define('Signalement', {
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  categorie: {
    type: DataTypes.ENUM('energie', 'eau', 'eclairage', 'autre'),
    allowNull: false,
  },
  localisation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'en_cours', 'traite'),
    defaultValue: 'en_attente',
  },
  suggestion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   
  anonyme: {
   type: DataTypes.BOOLEAN,
   defaultValue: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// Associations
User.hasMany(Signalement, { foreignKey: 'user_id' });
Signalement.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Signalement;
