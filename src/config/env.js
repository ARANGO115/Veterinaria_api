const fs = require('node:fs');
const path = require('node:path');
const dns = require('node:dns');
const net = require('node:net');
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '../..');

const configureDnsServers = () => {
  const configuredServers = process.env.MONGODB_DNS_SERVERS?.trim();

  if (!configuredServers) {
    return;
  }

  const servers = configuredServers.split(',').map(server => server.trim());
  const invalidServer = servers.find(server => net.isIP(server) === 0);

  if (invalidServer) {
    throw new Error(
      `MONGODB_DNS_SERVERS contiene una dirección inválida (${invalidServer}). Usa IPs DNS separadas por comas.`
    );
  }

  dns.setServers(servers);
};

const loadEnvironment = () => {
  const environmentName = process.env.NODE_ENV || 'development';
  const environmentFile = `.env.${environmentName}`;
  const environmentPath = path.join(
    projectRoot,
    fs.existsSync(path.join(projectRoot, environmentFile))
      ? environmentFile
      : '.env'
  );

  const result = dotenv.config({ path: environmentPath });

  if (result.error && result.error.code !== 'ENOENT') {
    throw result.error;
  }

  configureDnsServers();

  return environmentPath;
};

module.exports = loadEnvironment;
