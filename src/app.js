const compression = require('compression');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const healthRoutes = require('./routes/healthRoutes');
const petRoutes = require('./routes/petRoutes');
const logger = require('./utils/logger');

const app = express();
const apiRateLimitMax = process.env.API_RATE_LIMIT_MAX === undefined
  ? 100
  : Number(process.env.API_RATE_LIMIT_MAX);

if (!Number.isSafeInteger(apiRateLimitMax) || apiRateLimitMax < 1) {
  throw new Error('API_RATE_LIMIT_MAX debe ser un entero positivo.');
}

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: apiRateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
    });
  }
}));

app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/pets', petRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`
  });
});

app.use(errorHandler);

module.exports = app;