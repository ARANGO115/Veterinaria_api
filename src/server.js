const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '..');
const environmentName = process.env.NODE_ENV || 'development';
const environmentFile = `.env.${environmentName}`;
const environmentPath = path.join(
  projectRoot,
  fs.existsSync(path.join(projectRoot, environmentFile))
    ? environmentFile
    : '.env'
);

dotenv.config({ path: environmentPath });

const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`Servidor ejecutándose en http://localhost:${PORT}`);
    });

    const shutdown = (signal) => {
      logger.info(`Señal ${signal} recibida. Cerrando servidor...`);

      server.close(async (error) => {
        if (error) {
          logger.error('Error al cerrar el servidor HTTP', error);
          process.exitCode = 1;
        }

        try {
          await mongoose.disconnect();
          logger.info('Servidor y conexión a MongoDB cerrados correctamente');
        } catch (disconnectError) {
          logger.error('Error al cerrar la conexión con MongoDB', disconnectError);
          process.exitCode = 1;
        }
      });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('No se pudo iniciar la API', error);
    process.exitCode = 1;
  }
};

startServer();
