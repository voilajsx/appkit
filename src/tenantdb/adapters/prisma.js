/**
 * @voilajsx/appkit - Prisma adapter for multi-tenant database
 * @module @voilajsx/appkit/tenantdb
 * @file src/tenantdb/adapters/prisma.js
 */

/**
 * Prisma adapter implementation
 */
export class PrismaAdapter {
  constructor(options) {
    this.options = options;
    this.client = null;
  }

  /**
   * Connects to the database
   * @param {Object} config - Connection configuration
   * @returns {Promise<Object>} Prisma client
   */
  async connect(config) {
    const { PrismaClient } = await import('@prisma/client');

    this.client = new PrismaClient({
      datasourceUrl: config.url || this.options.url,
      log: ['error'],
    });

    await this.client.$connect();
    return this.client;
  }

  /**
   * Disconnects from the database
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.client) {
      await this.client.$disconnect();
      this.client = null;
    }
  }

  /**
   * Creates a new database client instance
   * @param {Object} config - Client configuration
   * @returns {Promise<Object>} New Prisma client instance
   */
  async createClient(config) {
    const { PrismaClient } = await import('@prisma/client');

    const client = new PrismaClient({
      datasourceUrl: config.url,
      log: ['error'],
    });

    await client.$connect();
    return client;
  }

  /**
   * Executes a raw query
   * @param {string} query - SQL query
   * @param {Array} [params] - Query parameters
   * @returns {Promise<any>} Query result
   */
  async executeQuery(query, params = []) {
    if (!this.client) {
      throw new Error('Not connected to database');
    }
    return this.client.$executeRawUnsafe(query, ...params);
  }

  /**
   * Creates a new database
   * @param {string} name - Database name
   * @returns {Promise<void>}
   */
  async createDatabase(name) {
    const sanitizedName = this.sanitizeName(name);
    const provider = this.detectProvider();

    switch (provider) {
      case 'postgresql':
        await this.executeQuery(`CREATE DATABASE "${sanitizedName}"`);
        break;
      case 'mysql':
        await this.executeQuery(`CREATE DATABASE \`${sanitizedName}\``);
        break;
      default:
        throw new Error(
          `Database creation not supported for provider: ${provider}`
        );
    }
  }

  /**
   * Drops a database
   * @param {string} name - Database name
   * @returns {Promise<void>}
   */
  async dropDatabase(name) {
    const sanitizedName = this.sanitizeName(name);
    const provider = this.detectProvider();

    switch (provider) {
      case 'postgresql':
        // Terminate existing connections
        await this.executeQuery(`
         SELECT pg_terminate_backend(pg_stat_activity.pid)
         FROM pg_stat_activity
         WHERE pg_stat_activity.datname = '${sanitizedName}'
           AND pid <> pg_backend_pid()
       `);
        await this.executeQuery(`DROP DATABASE IF EXISTS "${sanitizedName}"`);
        break;
      case 'mysql':
        await this.executeQuery(`DROP DATABASE IF EXISTS \`${sanitizedName}\``);
        break;
      default:
        throw new Error(
          `Database deletion not supported for provider: ${provider}`
        );
    }
  }

  /**
   * Lists all databases
   * @returns {Promise<string[]>} Array of database names
   */
  async listDatabases() {
    const provider = this.detectProvider();

    switch (provider) {
      case 'postgresql':
        const pgResult = await this.client.$queryRaw`
         SELECT datname FROM pg_database 
         WHERE datistemplate = false 
         AND datname NOT IN ('postgres', 'template0', 'template1')
       `;
        return pgResult.map((row) => row.datname);

      case 'mysql':
        const mysqlResult = await this.client.$queryRaw`
         SELECT SCHEMA_NAME FROM information_schema.SCHEMATA
         WHERE SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
       `;
        return mysqlResult.map((row) => row.SCHEMA_NAME);

      default:
        throw new Error(
          `Listing databases not supported for provider: ${provider}`
        );
    }
  }

  /**
   * Applies middleware to client for row-level isolation
   * @param {Object} client - Prisma client
   * @param {string} tenantId - Tenant identifier
   * @returns {Object} Client with middleware
   */
  applyTenantMiddleware(client, tenantId) {
    // Apply Prisma middleware for row-level isolation
    client.$use(async (params, next) => {
      // Inject tenantId on create
      if (params.action === 'create' || params.action === 'createMany') {
        if (params.action === 'create') {
          params.args.data = {
            ...params.args.data,
            tenantId,
          };
        } else if (params.args.data) {
          params.args.data = params.args.data.map((item) => ({
            ...item,
            tenantId,
          }));
        }
      }

      // Add tenantId filter on queries
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
          params.args.where.AND.push({ tenantId });
        } else if (params.args.where.OR) {
          // Wrap OR conditions and add tenantId
          params.args.where = {
            AND: [{ tenantId }, { OR: params.args.where.OR }],
          };
        } else {
          params.args.where = {
            ...params.args.where,
            tenantId,
          };
        }
      }

      return next(params);
    });

    return client;
  }

  /**
   * Detects the database provider from connection URL
   * @returns {string} Provider name
   */
  detectProvider() {
    const url = this.options.url;
    if (url.includes('postgresql://') || url.includes('postgres://')) {
      return 'postgresql';
    }
    if (url.includes('mysql://')) {
      return 'mysql';
    }
    throw new Error('Unsupported database provider');
  }

  /**
   * Sanitizes database name to prevent SQL injection
   * @private
   * @param {string} name - Database name
   * @returns {string} Sanitized name
   */
  sanitizeName(name) {
    // Remove any characters that aren't alphanumeric, underscore, or hyphen
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }
}
