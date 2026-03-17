const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom:          { type: DataTypes.STRING(100), allowNull: false },
  email:        { type: DataTypes.STRING(150), unique: true, allowNull: false },
  mot_de_passe: { type: DataTypes.STRING(255), allowNull: false },
  role:         { type: DataTypes.ENUM('etudiant', 'admin'), defaultValue: 'etudiant' },
}, { tableName: 'users', timestamps: true });

module.exports = User;