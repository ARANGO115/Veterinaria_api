const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '../..');

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

  return environmentPath;
};

module.exports = loadEnvironment;
