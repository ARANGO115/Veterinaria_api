const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Veterinaria API funcionando correctamente'
  });
});

app.use(errorHandler);

module.exports = app;