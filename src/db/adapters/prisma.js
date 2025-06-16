/**
 * Prisma adapter for multi-tenant database operations
 * @module @voilajsx/appkit/db
 * @file src/db/adapters/prisma.js
 */

import { createDatabaseError } from '../defaults.js';

/**
 * Prisma adapter implementation for SQL databases
 * Supports PostgreSQL, MySQL, SQLite with automatic tenant isolation
 */
export class PrismaAdapter {
  /**
   * Creates a new PrismaAdapter instance
   * @param {Object} options - Adapter configuration
   * @param {string} options.url - Database connection URL
   */
  constructor(options) {
    this.options = options;
    this.PrismaClient = null;
  }

  /**
   * Creates a new Prisma client instance
   * @param {Object} config - Client configuration
   * @param {string} config.url - Database connection URL
   * @returns {Promise<Object>} New Prisma client instance
   */
  async createClient(config) {
    if (!this.PrismaClient) {
      try {
        const prismaModule = await import('@prisma/client');
        this.PrismaClient = prismaModule.PrismaClient;
      } catch (error) {
        throw createDatabaseError(
          'Prisma client not found. Install with: npm install @prisma/client',
          500
        );
      }
    }

    try {
      const client = new this.PrismaClient({
        datasourceUrl: config.url,
        log: this._getLogLevel(),
        ...config.clientOptions,
      });

      await client.$connect();
      return client;
    } catch (error) {
      throw createDatabaseError(
        `Failed to create Prisma client: ${error.message}`,
        500
      );
    }
  }

  /**
   * Applies tenant middleware to Prisma client for automatic row-level isolation
   * @param {Object} client - Prisma client instance
   * @param {string} tenantId - Tenant identifier
   * @param {Object} [options] - Middleware options
   * @param {string} [options.fieldName='tenantId'] - Tenant field name
   * @returns {Object} Client with tenant middleware applied
   */
  async applyTenantMiddleware(client, tenantId, options = {}) {
    const tenantField = options.fieldName || 'tenantId';

    // Apply Prisma middleware for automatic tenant filtering
    client.$use(async (params, next) => {
      // Handle create operations - inject tenant ID
      if (params.action === 'create') {
        if (params.args.data && typeof params.args.data === 'object') {
          params.args.data[tenantField] = tenantId;
        }
      }

      // Handle createMany operations - inject tenant ID for all records
      else if (params.action === 'createMany') {
        if (params.args.data && Array.isArray(params.args.data)) {
          params.args.data = params.args.data.map((item) => ({
            ...item,
            [tenantField]: tenantId,
          }));
        }
      }

      // Handle upsert operations - inject tenant ID
      else if (params.action === 'upsert') {
        if (params.args.create && typeof params.args.create === 'object') {
          params.args.create[tenantField] = tenantId;
        }
        if (params.args.update && typeof params.args.update === 'object') {
          params.args.update[tenantField] = tenantId;
        }
        // Add tenant filter to where clause
        if (!params.args.where[tenantField]) {
          params.args.where[tenantField] = tenantId;
        }
      }

      // Handle read/update/delete operations - add tenant filter
      if (
        [
          'findFirst',
          'findMany',
          'findUnique',
          'findUniqueOrThrow',
          'findFirstOrThrow',
          'update',
          'updateMany',
          'delete',
          'deleteMany',
          'count',
          'aggregate',
          'groupBy',
        ].includes(params.action)
      ) {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};

        // Handle complex where clauses
        if (params.args.where.AND) {
          // Add tenant filter to existing AND array
          if (
            !params.args.where.AND.some((condition) => condition[tenantField])
          ) {
            params.args.where.AND.push({ [tenantField]: tenantId });
          }
        } else if (params.args.where.OR) {
          // Wrap OR conditions with tenant filter
          params.args.where = {
            AND: [{ [tenantField]: tenantId }, { OR: params.args.where.OR }],
          };
        } else {
          // Simple where clause - add tenant filter if not present
          if (!params.args.where[tenantField]) {
            params.args.where[tenantField] = tenantId;
          }
        }
      }

      return next(params);
    });

    return client;
  }

  /**
   * Creates a new database
   * @param {string} name - Database name
   * @param {Object} systemClient - System database client
   * @returns {Promise<void>}
   */
  async createDatabase(name, systemClient) {
    const sanitizedName = this._sanitizeName(name);
    const provider = this._detectProvider();

    try {
      switch (provider) {
        case 'postgresql':
          await systemClient.$executeRawUnsafe(
            `CREATE DATABASE "${sanitizedName}"`
          );
          break;

        case 'mysql':
          await systemClient.$executeRawUnsafe(
            `CREATE DATABASE \`${sanitizedName}\``
          );
          break;

        case 'sqlite':
          // SQLite creates databases automatically when connecting
          // We just need to ensure the file exists
          const dbPath = this._getSQLitePath(name);
          await this._createSQLiteDatabase(dbPath);
          break;

        default:
          throw createDatabaseError(
            `Database creation not supported for provider: ${provider}`,
            500
          );
      }
    } catch (error) {
      if (error.code === 'P2010' || error.message.includes('already exists')) {
        throw createDatabaseError(`Database '${name}' already exists`, 409);
      }
      throw createDatabaseError(
        `Failed to create database '${name}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Drops a database
   * @param {string} name - Database name
   * @param {Object} systemClient - System database client
   * @returns {Promise<void>}
   */
  async dropDatabase(name, systemClient) {
    const sanitizedName = this._sanitizeName(name);
    const provider = this._detectProvider();

    try {
      switch (provider) {
        case 'postgresql':
          // Terminate existing connections first
          await systemClient.$executeRawUnsafe(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '${sanitizedName}'
              AND pid <> pg_backend_pid()
          `);
          await systemClient.$executeRawUnsafe(
            `DROP DATABASE IF EXISTS "${sanitizedName}"`
          );
          break;

        case 'mysql':
          await systemClient.$executeRawUnsafe(
            `DROP DATABASE IF EXISTS \`${sanitizedName}\``
          );
          break;

        case 'sqlite':
          // For SQLite, delete the database file
          const dbPath = this._getSQLitePath(name);
          await this._deleteSQLiteDatabase(dbPath);
          break;

        default:
          throw createDatabaseError(
            `Database deletion not supported for provider: ${provider}`,
            500
          );
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to drop database '${name}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Lists all databases
   * @param {Object} systemClient - System database client
   * @returns {Promise<string[]>} Array of database names
   */
  async listDatabases(systemClient) {
    const provider = this._detectProvider();

    try {
      switch (provider) {
        case 'postgresql':
          const pgResult = await systemClient.$queryRaw`
            SELECT datname FROM pg_database 
            WHERE datistemplate = false 
            AND datname NOT IN ('postgres', 'template0', 'template1')
          `;
          return pgResult.map((row) => row.datname);

        case 'mysql':
          const mysqlResult = await systemClient.$queryRaw`
            SELECT SCHEMA_NAME as name FROM information_schema.SCHEMATA
            WHERE SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
          `;
          return mysqlResult.map((row) => row.name);

        case 'sqlite':
          // For SQLite, list database files in the directory
          return await this._listSQLiteDatabases();

        default:
          throw createDatabaseError(
            `Listing databases not supported for provider: ${provider}`,
            500
          );
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to list databases: ${error.message}`,
        500
      );
    }
  }

  /**
   * Gets database statistics
   * @param {Object} client - Database client
   * @returns {Promise<Object>} Database statistics
   */
  async getDatabaseStats(client) {
    const provider = this._detectProvider();

    try {
      const stats = {
        provider,
        tables: 0,
        size: '0 MB',
        connections: 0,
      };

      switch (provider) {
        case 'postgresql':
          const pgStats = await client.$queryRaw`
            SELECT 
              COUNT(*) as table_count,
              pg_size_pretty(pg_database_size(current_database())) as db_size,
              (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as connection_count
            FROM information_schema.tables 
            WHERE table_schema = 'public'
          `;
          if (pgStats[0]) {
            stats.tables = Number(pgStats[0].table_count);
            stats.size = pgStats[0].db_size;
            stats.connections = Number(pgStats[0].connection_count);
          }
          break;

        case 'mysql':
          const mysqlStats = await client.$queryRaw`
            SELECT 
              COUNT(*) as table_count,
              ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as size_mb
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
          `;
          if (mysqlStats[0]) {
            stats.tables = Number(mysqlStats[0].table_count);
            stats.size = `${mysqlStats[0].size_mb} MB`;
          }
          break;

        case 'sqlite':
          // SQLite stats would require file system operations
          stats.size = 'N/A';
          break;
      }

      return stats;
    } catch (error) {
      throw createDatabaseError(
        `Failed to get database stats: ${error.message}`,
        500
      );
    }
  }

  /**
   * Backs up a database
   * @param {string} dbName - Database name
   * @param {Object} systemClient - System database client
   * @param {Object} [options] - Backup options
   * @returns {Promise<string>} Backup file path
   */
  async backupDatabase(dbName, systemClient, options = {}) {
    const provider = this._detectProvider();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = options.path || `./backups/${dbName}_${timestamp}.sql`;

    try {
      switch (provider) {
        case 'postgresql':
          return await this._backupPostgreSQL(dbName, backupPath, options);
        case 'mysql':
          return await this._backupMySQL(dbName, backupPath, options);
        case 'sqlite':
          return await this._backupSQLite(dbName, backupPath, options);
        default:
          throw createDatabaseError(
            `Backup not supported for provider: ${provider}`,
            500
          );
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to backup database '${dbName}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Restores a database from backup
   * @param {string} dbName - Database name
   * @param {string} backupPath - Backup file path
   * @param {Object} systemClient - System database client
   * @param {Object} [options] - Restore options
   * @returns {Promise<void>}
   */
  async restoreDatabase(dbName, backupPath, systemClient, options = {}) {
    const provider = this._detectProvider();

    try {
      switch (provider) {
        case 'postgresql':
          return await this._restorePostgreSQL(
            dbName,
            backupPath,
            systemClient,
            options
          );
        case 'mysql':
          return await this._restoreMySQL(
            dbName,
            backupPath,
            systemClient,
            options
          );
        case 'sqlite':
          return await this._restoreSQLite(dbName, backupPath, options);
        default:
          throw createDatabaseError(
            `Restore not supported for provider: ${provider}`,
            500
          );
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to restore database '${dbName}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Checks if tenant registry table exists
   * @param {Object} client - Database client
   * @returns {Promise<boolean>} True if registry exists
   */
  async hasTenantRegistry(client) {
    try {
      const result = await client.$queryRaw`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'tenant_registry' OR table_name = 'TenantRegistry'
      `;
      return Number(result[0]?.count) > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Creates tenant registry entry
   * @param {Object} client - Database client
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async createTenantRegistryEntry(client, tenantId) {
    try {
      // Try different possible registry table names
      const tableExists = await this.hasTenantRegistry(client);
      if (!tableExists) return;

      await client.$executeRaw`
        INSERT INTO tenant_registry (tenant_id, created_at) 
        VALUES (${tenantId}, NOW())
        ON CONFLICT (tenant_id) DO NOTHING
      `;
    } catch (error) {
      // Ignore errors - registry is optional
      console.debug('Failed to create tenant registry entry:', error.message);
    }
  }

  /**
   * Deletes tenant registry entry
   * @param {Object} client - Database client
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async deleteTenantRegistryEntry(client, tenantId) {
    try {
      await client.$executeRaw`DELETE FROM tenant_registry WHERE tenant_id = ${tenantId}`;
    } catch (error) {
      // Ignore errors - registry is optional
      console.debug('Failed to delete tenant registry entry:', error.message);
    }
  }

  /**
   * Checks if tenant exists in registry
   * @param {Object} client - Database client
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<boolean>} True if tenant exists in registry
   */
  async tenantExistsInRegistry(client, tenantId) {
    try {
      const result = await client.$queryRaw`
        SELECT COUNT(*) as count FROM tenant_registry WHERE tenant_id = ${tenantId}
      `;
      return Number(result[0]?.count) > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets all tenants from registry
   * @param {Object} client - Database client
   * @returns {Promise<string[]>} Array of tenant IDs
   */
  async getTenantsFromRegistry(client) {
    try {
      const result = await client.$queryRaw`
        SELECT tenant_id FROM tenant_registry ORDER BY tenant_id
      `;
      return result.map((row) => row.tenant_id);
    } catch (error) {
      return [];
    }
  }

  /**
   * Sets up tenant schema (optional)
   * @param {Object} client - Tenant database client
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async setupTenantSchema(client, tenantId) {
    try {
      // Run Prisma migrations if available
      // This would typically be handled by Prisma CLI, but we can run basic setup
      console.log(`Setting up schema for tenant '${tenantId}'`);

      // Could run: npx prisma db push --force-reset
      // But this should be handled externally by the application
    } catch (error) {
      console.warn(
        `Schema setup failed for tenant '${tenantId}':`,
        error.message
      );
    }
  }

  /**
   * Disconnects the adapter
   * @returns {Promise<void>}
   */
  async disconnect() {
    // No persistent connections to close in adapter
    return Promise.resolve();
  }

  // Private helper methods

  /**
   * Detects database provider from URL
   * @private
   */
  _detectProvider() {
    const url = this.options.url;
    if (url.includes('postgresql://') || url.includes('postgres://')) {
      return 'postgresql';
    }
    if (url.includes('mysql://')) {
      return 'mysql';
    }
    if (
      url.includes('sqlite://') ||
      url.includes('.db') ||
      url.includes('.sqlite')
    ) {
      return 'sqlite';
    }
    throw createDatabaseError(
      'Unable to detect database provider from URL',
      500
    );
  }

  /**
   * Gets appropriate log level for Prisma client
   * @private
   */
  _getLogLevel() {
    const env = process.env.NODE_ENV;
    if (env === 'development') {
      return ['error', 'warn'];
    }
    if (env === 'production') {
      return ['error'];
    }
    return ['error', 'warn', 'info'];
  }

  /**
   * Sanitizes database name to prevent SQL injection
   * @private
   */
  _sanitizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }

  /**
   * SQLite-specific helper methods
   * @private
   */
  _getSQLitePath(dbName) {
    // Extract path from SQLite URL or use default
    const url = this.options.url;
    const pathMatch = url.match(/file:(.+)/);
    if (pathMatch) {
      const basePath = pathMatch[1].replace('{tenant}', '');
      return `${basePath}${dbName}.db`;
    }
    return `./data/${dbName}.db`;
  }

  async _createSQLiteDatabase(path) {
    // SQLite databases are created automatically when first accessed
    // We can create an empty file to ensure it exists
    const fs = await import('fs/promises');
    const pathModule = await import('path');

    await fs.mkdir(pathModule.dirname(path), { recursive: true });
    await fs.writeFile(path, '', { flag: 'a' }); // Create if not exists
  }

  async _deleteSQLiteDatabase(path) {
    const fs = await import('fs/promises');
    try {
      await fs.unlink(path);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async _listSQLiteDatabases() {
    const fs = await import('fs/promises');
    const pathModule = await import('path');

    const url = this.options.url;
    const pathMatch = url.match(/file:(.+)/);
    const dir = pathMatch ? pathModule.dirname(pathMatch[1]) : './data';

    try {
      const files = await fs.readdir(dir);
      return files
        .filter((file) => file.endsWith('.db') || file.endsWith('.sqlite'))
        .map((file) => pathModule.basename(file, pathModule.extname(file)));
    } catch (error) {
      return [];
    }
  }

  // Backup/Restore implementations would use child_process to run
  // pg_dump, mysqldump, etc. - simplified for brevity
  async _backupPostgreSQL(dbName, backupPath, options) {
    throw createDatabaseError(
      'PostgreSQL backup not implemented - use pg_dump externally',
      500
    );
  }

  async _backupMySQL(dbName, backupPath, options) {
    throw createDatabaseError(
      'MySQL backup not implemented - use mysqldump externally',
      500
    );
  }

  async _backupSQLite(dbName, backupPath, options) {
    const fs = await import('fs/promises');
    const sourcePath = this._getSQLitePath(dbName);
    await fs.copyFile(sourcePath, backupPath);
    return backupPath;
  }

  async _restorePostgreSQL(dbName, backupPath, systemClient, options) {
    throw createDatabaseError(
      'PostgreSQL restore not implemented - use psql externally',
      500
    );
  }

  async _restoreMySQL(dbName, backupPath, systemClient, options) {
    throw createDatabaseError(
      'MySQL restore not implemented - use mysql externally',
      500
    );
  }

  async _restoreSQLite(dbName, backupPath, options) {
    const fs = await import('fs/promises');
    const targetPath = this._getSQLitePath(dbName);
    await fs.copyFile(backupPath, targetPath);
  }
}
