/**
 * AppKit PrismaDB - Simple auto-discovering database wrapper
 * @module @voilajsx/appkit/prismadb
 * @file src/prismadb/index.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Auto-detect app name from file path
 * @param {string} callerPath - Path of the calling file
 * @returns {string|null} App name or null
 */
function detectAppFromPath(callerPath = null) {
  // Get the caller's file path
  const callPath = callerPath || process.cwd();

  // Look for /apps/{appName}/ pattern in the path
  const appsMatch = callPath.match(/\/apps\/([^\/]+)/);

  if (appsMatch) {
    const detectedApp = appsMatch[1];
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🔍 [PrismaDB] Auto-detected app: ${detectedApp} from path: ${callPath}`
      );
    }
    return detectedApp;
  }

  return null;
}
function findAppsDirectoryUpwards(startDir) {
  const paths = [];
  let currentDir = startDir;

  // Search up to 6 levels up
  for (let i = 0; i < 6; i++) {
    paths.push(path.join(currentDir, 'apps'));
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break; // Reached root
    currentDir = parentDir;
  }

  return paths;
}

/**
 * Global state
 */
const clients = new Map();
let discoveredApps = null;

/**
 * Auto-discover apps with Prisma clients
 */
async function discoverApps() {
  if (discoveredApps) return discoveredApps;

  // Find apps directory - search upwards from current location
  const searchPaths = [
    process.env.VOILA_APPS_DIR,
    // Search upwards from current working directory
    ...findAppsDirectoryUpwards(process.cwd()),
    // From node_modules, go back to project root
    path.join(__dirname, '../../../../../apps'),
    path.join(__dirname, '../../../../apps'),
    path.join(__dirname, '../../../apps'),
  ].filter(Boolean);

  let foundAppsDir = null;
  for (const searchPath of searchPaths) {
    if (fs.existsSync(searchPath)) {
      foundAppsDir = searchPath;
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 [PrismaDB] Found apps directory: ${searchPath}`);
      }
      break;
    }
  }

  if (!foundAppsDir) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '⚠️  [PrismaDB] No apps directory found. Searched:',
        searchPaths
      );
    }
    return [];
  }

  const apps = [];
  try {
    const appFolders = fs
      .readdirSync(foundAppsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const appName of appFolders) {
      const clientPath = path.join(
        foundAppsDir,
        appName,
        'prisma/generated/client/index.js'
      );

      if (fs.existsSync(clientPath)) {
        apps.push({
          name: appName,
          clientPath,
        });

        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ [PrismaDB] Found: ${appName}`);
        }
      }
    }

    discoveredApps = apps;
  } catch (error) {
    console.error('❌ [PrismaDB] Discovery error:', error.message);
    return [];
  }

  return apps;
}

/**
 * Create Prisma client for app
 */
async function createClient(appName, config = {}) {
  const apps = await discoverApps();
  const app = apps.find((a) => a.name === appName);

  if (!app) {
    const availableApps = apps.map((a) => a.name).join(', ') || 'none';
    throw new Error(`App '${appName}' not found. Available: ${availableApps}`);
  }

  // Load Prisma client
  let PrismaClient;
  try {
    const module = await import(app.clientPath);
    PrismaClient = module.PrismaClient;
  } catch (error) {
    throw new Error(`Failed to load ${appName} client: ${error.message}`);
  }

  // Get database URL with multiple fallbacks
  const dbUrl =
    config.url || // Direct config
    process.env.DATABASE_URL || // Global
    process.env.VOILA_DATABASE_URL || // AppKit
    process.env[`VOILA_${appName.toUpperCase()}_DATABASE_URL`]; // App-specific

  if (!dbUrl) {
    throw new Error(`Database URL not found for ${appName}`);
  }

  // Create client
  const prisma = new PrismaClient({
    datasourceUrl: dbUrl,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // Add metadata
  prisma._appName = appName;
  prisma._appKit = true;

  return prisma;
}

/**
 * PrismaDB - Simple database access
 */
export const prismadb = {
  /**
   * Configure global database URL
   * @param {string} url - Database URL
   */
  configure(url) {
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = url;
    }
  },

  /**
   * Get client for app (with auto-detection)
   * @param {string} appName - App name (optional if can be auto-detected)
   * @param {Object} config - Optional config with url
   * @returns {Object} Prisma client
   */
  async get(appName = null, config = {}) {
    // Auto-detect app name if not provided
    if (!appName) {
      appName = detectAppFromPath();
      if (!appName) {
        throw new Error(
          'App name is required. Either pass it explicitly or run from /apps/{appName}/ directory'
        );
      }
    }

    // Allow passing URL directly in config
    const clientKey = config.url ? `${appName}_${config.url}` : appName;

    if (!clients.has(clientKey)) {
      const client = await createClient(appName, config);
      clients.set(clientKey, client);

      // Setup cleanup on first client
      if (clients.size === 1) {
        const cleanup = async () => {
          for (const client of clients.values()) {
            try {
              await client.$disconnect();
            } catch (error) {
              console.error('Disconnect error:', error.message);
            }
          }
          clients.clear();
        };

        process.on('beforeExit', cleanup);
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
      }
    }

    return clients.get(clientKey);
  },

  /**
   * List available apps
   * @returns {Array} App names
   */
  async list() {
    const apps = await discoverApps();
    return apps.map((app) => app.name);
  },

  /**
   * Get current app name based on execution path
   * @returns {string|null} Current app name
   */
  currentApp() {
    return detectAppFromPath();
  },
  async health(appName) {
    try {
      const client = await this.get(appName);
      await client.$queryRaw`SELECT 1`;
      return { app: appName, status: 'healthy' };
    } catch (error) {
      return { app: appName, status: 'unhealthy', error: error.message };
    }
  },
};

// Default export
export default prismadb;
