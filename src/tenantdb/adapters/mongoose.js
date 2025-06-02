/**
 * @voilajsx/appkit - Mongoose adapter for multi-tenant database
 * @module @voilajsx/appkit/tenantdb
 * @file src/tenantdb/adapters/mongoose.js
 */

/**
 * Mongoose adapter implementation
 */
export class MongooseAdapter {
  constructor(options) {
    this.options = options;
    this.client = null;
    this.mongoose = null;
  }

  /**
   * Connects to the database
   * @param {Object} config - Connection configuration
   * @returns {Promise<Object>} Mongoose connection
   */
  async connect(config) {
    this.mongoose = (await import('mongoose')).default;

    this.client = await this.mongoose.createConnection(
      config.url || this.options.url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    return this.client;
  }

  /**
   * Disconnects from the database
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  /**
   * Creates a new database client instance
   * @param {Object} config - Client configuration
   * @returns {Promise<Object>} New Mongoose connection
   */
  async createClient(config) {
    if (!this.mongoose) {
      this.mongoose = (await import('mongoose')).default;
    }

    const connection = await this.mongoose.createConnection(config.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    return connection;
  }

  /**
   * Executes a raw query
   * @param {string} query - MongoDB command
   * @param {Array} [params] - Query parameters
   * @returns {Promise<any>} Query result
   */
  async executeQuery(query, params = []) {
    if (!this.client) {
      throw new Error('Not connected to database');
    }

    // For MongoDB, we use the native MongoDB driver
    const db = this.client.db;
    return db.command(query);
  }

  /**
   * Creates a new database
   * @param {string} name - Database name
   * @returns {Promise<void>}
   */
  async createDatabase(name) {
    // MongoDB creates databases automatically when data is inserted
    // We'll create a connection to verify it's possible
    const dbUrl = this.buildDatabaseUrl(name);
    const connection = await this.createClient({ url: dbUrl });

    try {
      // Create an init collection to ensure database exists
      await connection.db.createCollection('_init');
    } finally {
      await connection.close();
    }
  }

  /**
   * Drops a database
   * @param {string} name - Database name
   * @returns {Promise<void>}
   */
  async dropDatabase(name) {
    const dbUrl = this.buildDatabaseUrl(name);
    const connection = await this.createClient({ url: dbUrl });

    try {
      await connection.db.dropDatabase();
    } finally {
      await connection.close();
    }
  }

  /**
   * Lists all databases
   * @returns {Promise<string[]>} Array of database names
   */
  async listDatabases() {
    if (!this.client) {
      throw new Error('Not connected to database');
    }

    const admin = this.client.db.admin();
    const result = await admin.listDatabases();

    return result.databases
      .map((db) => db.name)
      .filter((name) => !['admin', 'config', 'local'].includes(name));
  }

  /**
   * Applies middleware to connection for row-level isolation
   * @param {Object} connection - Mongoose connection
   * @param {string} tenantId - Tenant identifier
   * @returns {Object} Connection with middleware
   */
  applyTenantMiddleware(connection, tenantId) {
    // For Mongoose, we need to add middleware to schemas
    // This needs to be done when models are created
    const originalModel = connection.model.bind(connection);

    connection.model = function (name, schema, collection) {
      if (schema) {
        // Add pre hooks for queries
        schema.pre(
          [
            'find',
            'findOne',
            'findOneAndUpdate',
            'findOneAndDelete',
            'count',
            'distinct',
          ],
          function () {
            if (!this.getQuery().tenantId) {
              this.where({ tenantId });
            }
          }
        );

        // Add pre hook for save
        schema.pre('save', function () {
          if (!this.tenantId) {
            this.tenantId = tenantId;
          }
        });

        // Add pre hook for insertMany
        schema.pre('insertMany', function (next, docs) {
          if (Array.isArray(docs)) {
            docs.forEach((doc) => {
              if (!doc.tenantId) {
                doc.tenantId = tenantId;
              }
            });
          }
          next();
        });

        // Add pre hooks for update operations
        schema.pre(
          ['updateOne', 'updateMany', 'findOneAndUpdate'],
          function () {
            if (!this.getFilter().tenantId) {
              this.where({ tenantId });
            }
          }
        );

        // Add pre hooks for delete operations
        schema.pre(
          ['deleteOne', 'deleteMany', 'findOneAndDelete'],
          function () {
            if (!this.getFilter().tenantId) {
              this.where({ tenantId });
            }
          }
        );
      }

      return originalModel(name, schema, collection);
    };

    return connection;
  }

  /**
   * Builds database URL for tenant
   * @private
   * @param {string} dbName - Database name
   * @returns {string} Tenant-specific MongoDB URL
   */
  buildDatabaseUrl(dbName) {
    const url = this.options.url;
    const sanitizedName = this.sanitizeName(dbName);

    // Parse MongoDB URL and replace database name
    const urlParts = url.match(
      /^(mongodb(?:\+srv)?:\/\/[^/]+\/)([^/?]+)(.*)?$/
    );
    if (!urlParts) {
      throw new Error('Invalid MongoDB URL format');
    }

    return `${urlParts[1]}${sanitizedName}${urlParts[3] || ''}`;
  }

  /**
   * Sanitizes database name to prevent injection
   * @private
   * @param {string} name - Database name
   * @returns {string} Sanitized name
   */
  sanitizeName(name) {
    // MongoDB database names have restrictions
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }
}
