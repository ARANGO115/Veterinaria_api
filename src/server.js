const dns = require('node:dns');
const { execFileSync } = require('node:child_process');
require('./config/env')();

const connectDB = require('./config/database');
const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const useWindowsDnsServers = () => {
  if (process.platform !== 'win32') {
    return;
  }

  const script = [
    "$activeAdapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Select-Object -ExpandProperty InterfaceAlias",
    "$servers = @(Get-DnsClientServerAddress -AddressFamily IPv4,IPv6 | Where-Object { $_.InterfaceAlias -in $activeAdapters -and $_.ServerAddresses.Count -gt 0 } | ForEach-Object { $_.ServerAddresses } | Where-Object { $_ -notlike 'fec0:0:0:ffff::*' } | Select-Object -Unique)",
    'ConvertTo-Json -InputObject @($servers) -Compress'
  ].join('; ');
  const output = execFileSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', script],
    { encoding: 'utf8', timeout: 5000, windowsHide: true }
  );
  const servers = JSON.parse(output.trim());

  if (!Array.isArray(servers) || servers.some(server => typeof server !== 'string') || servers.length === 0) {
    throw new Error('No se encontraron servidores DNS en los adaptadores activos de Windows.');
  }

  dns.setServers(servers);
};

const startServer = async () => {
  try {
    useWindowsDnsServers();
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
    const connectionErrors = error.reason?.servers
      ? [...error.reason.servers.entries()]
        .map(([server, details]) => {
          const cause = details.error;
          return cause
            ? `${server}: ${cause.name}${cause.code ? ` (${cause.code})` : ''}: ${cause.message}`
            : null;
        })
        .filter(Boolean)
      : [];

    if (connectionErrors.length > 0) {
      logger.error(
        'No se pudo iniciar la API. Fallos al conectar con MongoDB:',
        connectionErrors.join('; ')
      );
    } else {
      logger.error('No se pudo iniciar la API', error);
    }

    process.exitCode = 1;
  }
};

startServer();
