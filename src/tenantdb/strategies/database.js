/**
 * @voilajsx/appkit - Database-per-tenant strategy
 * @module @voilajsx/appkit/tenantdb
 * @file src/tenantdb/strategies/database.js
 */

/**
 * Database-per-tenant strategy
 * Each tenant has their own separate database
 */
export class DatabaseStrategy {
  constructor(options, adapter) {
    this.options = options;
    this.adapter = adapter;
    this.baseUrl = this.parseBaseUrl(options.url);
  }

  /**
   * Parses base URL for database connections
   * @private
   * @param {string} url - Database URL with {tenant} placeholder
   * @returns {Object} Parsed URL components
   */
  parseBaseUrl(url) {
    // Handle URLs like: postgresql://user:pass@host:5432/{tenant}
    const match = url.match(/^(.+?)\/\{tenant\}(.*)$/);
    if (!match) {
      throw new Error(
        'Database URL must contain {tenant} placeholder for database strategy'
      );
    }

    return {
      prefix: match[1],
      suffix: match[2] || '',
    };
  }

  /**
   * Gets database connection for tenant
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<Object>} Database client for tenant database
   */
  async getConnection(tenantId) {
    const databaseUrl = this.buildDatabaseUrl(tenantId);
    return this.adapter.createClient({ url: databaseUrl });
  }

  /**
   * Creates a new tenant database
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async createTenant(tenantId) {
    const dbName = this.sanitizeDatabaseName(tenantId);

    // Connect to system database to create new database
    const systemUrl = this.buildSystemUrl();
    const systemClient = await this.adapter.createClient({ url: systemUrl });

    try {
      await this.adapter.createDatabase(dbName);
    } finally {
      (await systemClient.$disconnect?.()) || (await systemClient.close?.());
    }
  }

  /**
   * Deletes a tenant database
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async deleteTenant(tenantId) {
    const dbName = this.sanitizeDatabaseName(tenantId);

    const systemUrl = this.buildSystemUrl();
    const systemClient = await this.adapter.createClient({ url: systemUrl });

    try {
      await this.adapter.dropDatabase(dbName);
    } finally {
      (await systemClient.$disconnect?.()) || (await systemClient.close?.());
    }
  }

  /**
   * Checks if tenant database exists
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<boolean>}
   */
  async tenantExists(tenantId) {
    const dbName = this.sanitizeDatabaseName(tenantId);

    const systemUrl = this.buildSystemUrl();
    const systemClient = await this.adapter.createClient({ url: systemUrl });

    try {
      const databases = await this.adapter.listDatabases();
      return databases.includes(dbName);
    } finally {
      (await systemClient.$disconnect?.()) || (await systemClient.close?.());
    }
  }

  /**
   * Lists all tenant databases
   * @returns {Promise<string[]>} Array of tenant IDs
   */
  async listTenants() {
    const systemUrl = this.buildSystemUrl();
    const systemClient = await this.adapter.createClient({ url: systemUrl });

    try {
      const databases = await this.adapter.listDatabases();

      // Filter out system databases and return as tenant IDs
      return databases.filter(
        (name) =>
          ![
            'postgres',
            'template0',
            'template1',
            'mysql',
            'information_schema',
            'performance_schema',
            'sys',
          ].includes(name)
      );
    } finally {
      (await systemClient.$disconnect?.()) || (await systemClient.close?.());
    }
  }

  /**
   * Builds database URL for tenant
   * @private
   * @param {string} tenantId - Tenant identifier
   * @returns {string} Database URL
   */
  buildDatabaseUrl(tenantId) {
    const dbName = this.sanitizeDatabaseName(tenantId);
    return `${this.baseUrl.prefix}/${dbName}${this.baseUrl.suffix}`;
  }

  /**
   * Builds system database URL
   * @private
   * @returns {string} System database URL
   */
  buildSystemUrl() {
    const provider = this.detectProvider();

    switch (provider) {
      case 'postgresql':
        return `${this.baseUrl.prefix}/postgres${this.baseUrl.suffix}`;
      case 'mysql':
        return `${this.baseUrl.prefix}/mysql${this.baseUrl.suffix}`;
      case 'mongodb':
        return `${this.baseUrl.prefix}/admin${this.baseUrl.suffix}`;
      default:
        // Use the first part without database name
        return this.baseUrl.prefix;
    }
  }

  /**
   * Detects database provider from URL
   * @private
   * @returns {string} Provider name
   */
  detectProvider() {
    if (
      this.baseUrl.prefix.includes('postgresql://') ||
      this.baseUrl.prefix.includes('postgres://')
    ) {
      return 'postgresql';
    }
    if (this.baseUrl.prefix.includes('mysql://')) {
      return 'mysql';
    }
    if (
      this.baseUrl.prefix.includes('mongodb://') ||
      this.baseUrl.prefix.includes('mongodb+srv://')
    ) {
      return 'mongodb';
    }
    throw new Error('Unsupported database provider for database strategy');
  }

  /**
   * Sanitizes database name to prevent SQL injection
   * @private
   * @param {string} tenantId - Tenant identifier
   * @returns {string} Sanitized database name
   */
  sanitizeDatabaseName(tenantId) {
    // Remove any characters that aren't alphanumeric, underscore, or hyphen
    return tenantId.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }

  /**
   * Disconnects all connections
   * @returns {Promise<void>}
   */
  async disconnect() {
    // No persistent connections in this strategy
    return Promise.resolve();
  }
}
