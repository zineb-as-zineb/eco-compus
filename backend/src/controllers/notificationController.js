const Notification = require('../models/Notification');

exports.getMesNotifications = async (req, res) => {
  try {
    const notifs = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.marquerLu = async (req, res) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Introuvable' });
    await notif.update({ lu: true });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.marquerToutLu = async (req, res) => {
  try {
    await Notification.update(
      { lu: true },
      { where: { user_id: req.user.id } }
    );
    res.json({ message: 'Toutes les notifications lues' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};