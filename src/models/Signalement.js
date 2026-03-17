const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Signalement = sequelize.define('Signalement', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titre:        { type: DataTypes.STRING(200), allowNull: false },
  description:  { type: DataTypes.TEXT },
  categorie:    { type: DataTypes.ENUM('energie', 'eau', 'eclairage', 'autre'), allowNull: false },
  localisation: { type: DataTypes.STRING(150) },
  statut:       { type: DataTypes.ENUM('en_attente', 'en_cours', 'traite'), defaultValue: 'en_attente' },
  suggestion:   { type: DataTypes.TEXT },
  user_id:      { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
}, { tableName: 'signalements', timestamps: true });

User.hasMany(Signalement, { foreignKey: 'user_id' });
Signalement.belongsTo(User, { foreignKey: 'user_id', as: 'auteur' });

module.exports = Signalement;