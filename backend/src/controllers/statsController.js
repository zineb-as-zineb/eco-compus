const Signalement = require('../models/Signalement');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Accès admin uniquement' });

    const { periode } = req.query;
    const where = {};

    if (periode && periode !== 'tout') {
      const jours = periode === '7j' ? 7 : periode === '30j' ? 30 : 90;
      where.createdAt = {
        [Op.gte]: new Date(Date.now() - jours * 24 * 60 * 60 * 1000),
      };
    }

    const [total, parStatut, parCategorie, parMois] = await Promise.all([
      Signalement.count({ where }),
      Signalement.findAll({
        where,
        attributes: ['statut', [sequelize.fn('COUNT', '*'), 'count']],
        group: ['statut'], raw: true,
      }),
      Signalement.findAll({
        where,
        attributes: ['categorie', [sequelize.fn('COUNT', '*'), 'count']],
        group: ['categorie'], raw: true,
      }),
      Signalement.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'mois'],
          [sequelize.fn('COUNT', '*'), 'count'],
        ],
        where: { createdAt: { [Op.gte]: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } },
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
        raw: true,
      }),
    ]);

    res.json({ total, parStatut, parCategorie, parMois });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};