const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const signalementRoutes = require('./routes/signalements');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/signalements', signalementRoutes);

app.get('/', (req, res) => res.json({ message: '🌱 Campus Éco API running' }));

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));
});