/**
 * Mongoose adapter for multi-tenant MongoDB operations
 * @module @voilajsx/appkit/db
 * @file src/db/adapters/mongoose.js
 */

import { createDatabaseError } from '../defaults.js';

/**
 * Mongoose adapter implementation for MongoDB
 * Supports both database-per-tenant and collection-level isolation
 */
export class MongooseAdapter {
  /**
   * Creates a new MongooseAdapter instance
   * @param {Object} options - Adapter configuration
   * @param {string} options.url - MongoDB connection URL
   */
  constructor(options) {
    this.options = options;
    this.mongoose = null;
    this.connections = new Map(); // Cache connections
  }

  /**
   * Creates a new Mongoose connection instance
   * @param {Object} config - Client configuration
   * @param {string} config.url - MongoDB connection URL
   * @returns {Promise<Object>} New Mongoose connection
   */
  async createClient(config) {
    if (!this.mongoose) {
      try {
        this.mongoose = (await import('mongoose')).default;
      } catch (error) {
        throw createDatabaseError(
          'Mongoose not found. Install with: npm install mongoose',
          500
        );
      }
    }

    try {
      const connection = await this.mongoose.createConnection(config.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: config.maxPoolSize || 10,
        serverSelectionTimeoutMS: config.timeout || 10000,
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0, // Disable mongoose buffering
        ...config.connectionOptions,
      });

      // Add connection event handlers
      this._setupConnectionEvents(connection, config.url);

      return connection;
    } catch (error) {
      throw createDatabaseError(
        `Failed to create Mongoose connection: ${error.message}`,
        500
      );
    }
  }

  /**
   * Applies tenant middleware to Mongoose connection for automatic isolation
   * @param {Object} connection - Mongoose connection
   * @param {string} tenantId - Tenant identifier
   * @param {Object} [options] - Middleware options
   * @param {string} [options.fieldName='tenantId'] - Tenant field name
   * @returns {Object} Connection with tenant middleware applied
   */
  async applyTenantMiddleware(connection, tenantId, options = {}) {
    const tenantField = options.fieldName || 'tenantId';

    // Store original model function
    const originalModel = connection.model.bind(connection);

    // Override model function to add middleware
    connection.model = function (name, schema, collection) {
      if (schema && !schema._tenantMiddlewareApplied) {
        // Mark schema as having middleware applied
        schema._tenantMiddlewareApplied = true;

        // Add tenant field to schema if not exists
        if (!schema.paths[tenantField]) {
          schema.add({
            [tenantField]: {
              type: String,
              required: true,
              index: true,
            },
          });
        }

        // Pre-save middleware - add tenant ID
        schema.pre('save', function () {
          if (!this[tenantField]) {
            this[tenantField] = tenantId;
          }
        });

        // Pre-insertMany middleware - add tenant ID to all documents
        schema.pre('insertMany', function (next, docs) {
          if (Array.isArray(docs)) {
            docs.forEach((doc) => {
              if (!doc[tenantField]) {
                doc[tenantField] = tenantId;
              }
            });
          }
          next();
        });

        // Query middleware - add tenant filter
        const queryMethods = [
          'find',
          'findOne',
          'findOneAndUpdate',
          'findOneAndDelete',
          'findOneAndRemove',
          'count',
          'countDocuments',
          'distinct',
          'estimatedDocumentCount',
        ];

        queryMethods.forEach((method) => {
          schema.pre(method, function () {
            const filter = this.getFilter();
            if (!filter[tenantField]) {
              this.where({ [tenantField]: tenantId });
            }
          });
        });

        // Update middleware - add tenant filter
        const updateMethods = ['updateOne', 'updateMany', 'replaceOne'];

        updateMethods.forEach((method) => {
          schema.pre(method, function () {
            const filter = this.getFilter();
            if (!filter[tenantField]) {
              this.where({ [tenantField]: tenantId });
            }

            // Also add tenant ID to update data if not present
            const update = this.getUpdate();
            if (update && typeof update === 'object' && !update[tenantField]) {
              if (update.$set) {
                update.$set[tenantField] = tenantId;
              } else {
                update[tenantField] = tenantId;
              }
            }
          });
        });

        // Delete middleware - add tenant filter
        const deleteMethods = ['deleteOne', 'deleteMany', 'remove'];

        deleteMethods.forEach((method) => {
          schema.pre(method, function () {
            const filter = this.getFilter();
            if (!filter[tenantField]) {
              this.where({ [tenantField]: tenantId });
            }
          });
        });

        // Aggregate middleware - add tenant match stage
        schema.pre('aggregate', function () {
          const pipeline = this.pipeline();

          // Check if tenant filter already exists in pipeline
          const hasMatch = pipeline.some(
            (stage) => stage.$match && stage.$match[tenantField]
          );

          if (!hasMatch) {
            // Add tenant filter as first stage
            pipeline.unshift({ $match: { [tenantField]: tenantId } });
          }
        });
      }

      return originalModel(name, schema, collection);
    };

    return connection;
  }

  /**
   * Creates a new database
   * @param {string} name - Database name
   * @param {Object} [systemClient] - System connection (optional for MongoDB)
   * @returns {Promise<void>}
   */
  async createDatabase(name, systemClient = null) {
    try {
      const dbUrl = this._buildDatabaseUrl(name);
      const connection = await this.createClient({ url: dbUrl });

      try {
        // Create a dummy collection to ensure database exists
        const initCollection = connection.db.collection('_init');
        await initCollection.insertOne({
          created: new Date(),
          tenant: name,
          purpose: 'Database initialization',
        });

        // Remove the init document
        await initCollection.deleteOne({ tenant: name });
      } finally {
        await connection.close();
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to create MongoDB database '${name}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Drops a database
   * @param {string} name - Database name
   * @param {Object} [systemClient] - System connection (optional for MongoDB)
   * @returns {Promise<void>}
   */
  async dropDatabase(name, systemClient = null) {
    try {
      const dbUrl = this._buildDatabaseUrl(name);
      const connection = await this.createClient({ url: dbUrl });

      try {
        await connection.db.dropDatabase();
      } finally {
        await connection.close();
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to drop MongoDB database '${name}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Lists all databases
   * @param {Object} [systemClient] - System connection (optional for MongoDB)
   * @returns {Promise<string[]>} Array of database names
   */
  async listDatabases(systemClient = null) {
    let connection = null;

    try {
      // Use system client or create new connection to admin database
      if (systemClient) {
        connection = systemClient;
      } else {
        const adminUrl = this._buildAdminUrl();
        connection = await this.createClient({ url: adminUrl });
      }

      const admin = connection.db.admin();
      const result = await admin.listDatabases();

      const databases = result.databases
        .map((db) => db.name)
        .filter((name) => !this._isSystemDatabase(name))
        .sort();

      return databases;
    } catch (error) {
      throw createDatabaseError(
        `Failed to list MongoDB databases: ${error.message}`,
        500
      );
    } finally {
      if (connection && !systemClient) {
        await connection.close();
      }
    }
  }

  /**
   * Gets database statistics
   * @param {Object} client - Database connection
   * @returns {Promise<Object>} Database statistics
   */
  async getDatabaseStats(client) {
    try {
      const db = client.db;

      // Get database stats
      const dbStats = await db.stats();

      // Get collection count
      const collections = await db.listCollections().toArray();
      const collectionCount = collections.filter(
        (col) => !col.name.startsWith('system.')
      ).length;

      return {
        provider: 'mongodb',
        collections: collectionCount,
        size: this._formatBytes(dbStats.dataSize || 0),
        documents: dbStats.objects || 0,
        indexes: dbStats.indexes || 0,
        avgObjSize: this._formatBytes(dbStats.avgObjSize || 0),
        storageSize: this._formatBytes(dbStats.storageSize || 0),
      };
    } catch (error) {
      throw createDatabaseError(
        `Failed to get MongoDB database stats: ${error.message}`,
        500
      );
    }
  }

  /**
   * Backs up a database
   * @param {string} dbName - Database name
   * @param {Object} systemClient - System connection
   * @param {Object} [options] - Backup options
   * @returns {Promise<string>} Backup identifier
   */
  async backupDatabase(dbName, systemClient, options = {}) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${dbName}_backup_${timestamp}`;

      // For MongoDB, we would typically use mongodump
      // This is a simplified implementation
      const connection = await this.createClient({
        url: this._buildDatabaseUrl(dbName),
      });

      try {
        const collections = await connection.db.listCollections().toArray();
        const backupData = {};

        for (const collectionInfo of collections) {
          if (!collectionInfo.name.startsWith('system.')) {
            const collection = connection.db.collection(collectionInfo.name);
            const documents = await collection.find({}).toArray();
            backupData[collectionInfo.name] = documents;
          }
        }

        // Store backup data (in production, this would go to file/cloud storage)
        const backupId = `backup_${backupName}`;

        // This is a simplified backup - in production you'd use:
        // - mongodump command
        // - GridFS for large backups
        // - Cloud storage integration

        return backupId;
      } finally {
        await connection.close();
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to backup MongoDB database '${dbName}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Restores a database from backup
   * @param {string} dbName - Database name
   * @param {string} backupId - Backup identifier
   * @param {Object} systemClient - System connection
   * @param {Object} [options] - Restore options
   * @returns {Promise<void>}
   */
  async restoreDatabase(dbName, backupId, systemClient, options = {}) {
    try {
      // In production, this would use mongorestore
      throw createDatabaseError(
        'MongoDB restore not implemented - use mongorestore externally',
        500
      );
    } catch (error) {
      throw createDatabaseError(
        `Failed to restore MongoDB database '${dbName}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Checks if tenant registry collection exists
   * @param {Object} client - Database connection
   * @returns {Promise<boolean>} True if registry exists
   */
  async hasTenantRegistry(client) {
    try {
      const collections = await client.db
        .listCollections({
          name: 'tenant_registry',
        })
        .toArray();

      return collections.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Creates tenant registry entry
   * @param {Object} client - Database connection
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async createTenantRegistryEntry(client, tenantId) {
    try {
      const collection = client.db.collection('tenant_registry');
      await collection.updateOne(
        { tenant_id: tenantId },
        {
          $set: {
            tenant_id: tenantId,
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
        { upsert: true }
      );
    } catch (error) {
      console.debug('Failed to create tenant registry entry:', error.message);
    }
  }

  /**
   * Deletes tenant registry entry
   * @param {Object} client - Database connection
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async deleteTenantRegistryEntry(client, tenantId) {
    try {
      const collection = client.db.collection('tenant_registry');
      await collection.deleteOne({ tenant_id: tenantId });
    } catch (error) {
      console.debug('Failed to delete tenant registry entry:', error.message);
    }
  }

  /**
   * Checks if tenant exists in registry
   * @param {Object} client - Database connection
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<boolean>} True if tenant exists in registry
   */
  async tenantExistsInRegistry(client, tenantId) {
    try {
      const collection = client.db.collection('tenant_registry');
      const doc = await collection.findOne({ tenant_id: tenantId });
      return !!doc;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets all tenants from registry
   * @param {Object} client - Database connection
   * @returns {Promise<string[]>} Array of tenant IDs
   */
  async getTenantsFromRegistry(client) {
    try {
      const collection = client.db.collection('tenant_registry');
      const docs = await collection
        .find(
          {},
          {
            projection: { tenant_id: 1, _id: 0 },
          }
        )
        .sort({ tenant_id: 1 })
        .toArray();

      return docs.map((doc) => doc.tenant_id);
    } catch (error) {
      return [];
    }
  }

  /**
   * Sets up tenant schema (creates indexes, etc.)
   * @param {Object} client - Tenant database connection
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async setupTenantSchema(client, tenantId) {
    try {
      console.log(`Setting up MongoDB schema for tenant '${tenantId}'`);

      // Create common indexes that would benefit multi-tenant applications
      const collections = await client.db.listCollections().toArray();

      for (const collectionInfo of collections) {
        if (!collectionInfo.name.startsWith('system.')) {
          const collection = client.db.collection(collectionInfo.name);

          // Create tenant index if collection has tenantId field
          try {
            await collection.createIndex(
              { tenantId: 1 },
              {
                background: true,
                name: 'tenant_index',
              }
            );
          } catch (error) {
            // Index might already exist or collection might not have tenantId
          }
        }
      }
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
    const disconnectPromises = [];

    for (const [key, connection] of this.connections) {
      disconnectPromises.push(
        connection
          .close()
          .catch((error) =>
            console.warn(`Error disconnecting ${key}:`, error.message)
          )
      );
    }

    await Promise.all(disconnectPromises);
    this.connections.clear();
  }

  // Private helper methods

  /**
   * Builds database URL for specific tenant
   * @private
   */
  _buildDatabaseUrl(tenantId) {
    const url = this.options.url;
    const sanitizedName = this._sanitizeName(tenantId);

    // Parse MongoDB URL and replace database name
    const urlParts = url.match(
      /^(mongodb(?:\+srv)?:\/\/[^/]+\/)([^/?]+)(.*)?$/
    );
    if (!urlParts) {
      throw createDatabaseError('Invalid MongoDB URL format', 500);
    }

    return `${urlParts[1]}${sanitizedName}${urlParts[3] || ''}`;
  }

  /**
   * Builds admin database URL
   * @private
   */
  _buildAdminUrl() {
    const url = this.options.url;
    const urlParts = url.match(
      /^(mongodb(?:\+srv)?:\/\/[^/]+\/)([^/?]+)(.*)?$/
    );
    if (!urlParts) {
      throw createDatabaseError('Invalid MongoDB URL format', 500);
    }

    return `${urlParts[1]}admin${urlParts[3] || ''}`;
  }

  /**
   * Checks if database name is a system database
   * @private
   */
  _isSystemDatabase(name) {
    const systemDatabases = ['admin', 'config', 'local'];
    return systemDatabases.includes(name) || name.startsWith('_');
  }

  /**
   * Sanitizes database name to prevent injection
   * @private
   */
  _sanitizeName(name) {
    // MongoDB database names have specific restrictions
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }

  /**
   * Formats bytes to human readable format
   * @private
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Sets up connection event handlers
   * @private
   */
  _setupConnectionEvents(connection, url) {
    connection.on('connected', () => {
      console.debug(`MongoDB connected: ${url}`);
    });

    connection.on('error', (error) => {
      console.error(`MongoDB connection error: ${error.message}`);
    });

    connection.on('disconnected', () => {
      console.debug(`MongoDB disconnected: ${url}`);
    });

    connection.on('reconnected', () => {
      console.debug(`MongoDB reconnected: ${url}`);
    });
  }
}
