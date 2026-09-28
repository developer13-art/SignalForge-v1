/**
 * Environment Loader
 *
 * Loads environment variables from the repository-root `.env` file.
 * Must be called before any configuration module is imported, because
 * the config modules read from `process.env` at import time.
 *
 * Because ESM modules are evaluated at import time and cannot defer
 * imports, this module is invoked from `index.js` before importing
 * the server composition, and it sets a global flag to prevent
 * double-loading.
 *
 * @module signalforge/server/bootstrap/loadEnv
 */
const fs = require('node:fs');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const dotenv = require('dotenv');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let loaded = false;

function findEnvFiles(startDir) {
  const candidates = [
    path.resolve(startDir, '..', '..', '..', '.env'),
    path.resolve(startDir, '..', '..', '..', '..', '.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
    path.resolve(process.cwd(), '..', '..', '.env'),
  ];
  return candidates;
}
function loadEnv(options = {}) {
  if (loaded && !options.force) {
    return { loaded: true, path: null, skipped: true };
  }

  const env = process.env.NODE_ENV || 'development';
  const candidates = findEnvFiles(__dirname);

  let envFile = null;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      envFile = candidate;
      break;
    }
  }

  if (envFile) {
    const result = dotenv.config({ path: envFile, override: false });
    if (result.error && !options.silent) {
      process.stderr.write(
        `[loadEnv] Failed to load ${envFile}: ${result.error.message}\n`,
      );
    }
  }

  const envSpecific = candidates.map((candidate) =>
    candidate.replace(/\.env$/, `.env.${env}`),
  );

  for (const envSpecificFile of envSpecific) {
    if (fs.existsSync(envSpecificFile)) {
      dotenv.config({ path: envSpecificFile, override: true });
      break;
    }
  }

  loaded = true;

  return {
    loaded: true,
    path: envFile,
    env,
  };
}
function isEnvLoaded() {
  return loaded;
}
function resetEnv() {
  loaded = false;
}
module.exports = loadEnv;
module.exports.loadEnv = loadEnv;
module.exports.isEnvLoaded = isEnvLoaded;
module.exports.resetEnv = resetEnv;
