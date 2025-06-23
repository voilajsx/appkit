/**
 * Mongoose adapter for multi-tenant MongoDB operations
 * @module @voilajsx/appkit/db
 * @file src/db/adapters/mongoose.ts
 */

import { createDatabaseError } from '../defaults';

export interface MongooseClientConfig {
  url: string;
  maxPoolSize?: number;
  timeout?: number;
  connectionOptions?: any;
}

export interface TenantMiddlewareOptions {
  fieldName?: string;
  orgId?: string;
}

/**
 * Mongoose adapter implementation for MongoDB
 * Supports both database-per-tenant and collection-level isolation
 */
export class MongooseAdapter {
  private mongoose: any = null;
  private connections = new Map<string, any>(); // Cache connections
  private isDevelopment = process.env.NODE_ENV === 'development';

  constructor(private options: any = {}) {
    if (this.isDevelopment) {
      console.log('⚡ [AppKit] Mongoose adapter initialized');
    }
  }

  /**
   * Creates a new Mongoose connection instance
   */
  async createClient(config: MongooseClientConfig): Promise<any> {
    if (!this.mongoose) {
      try {
        this.mongoose = (await import('mongoose')).default;
      } catch (error: any) {
        throw createDatabaseError(
          'Mongoose not found. Install with: npm install mongoose',
          500
        );
      }
    }

    const cacheKey = this._buildCacheKey(config);
    
    if (this.connections.has(cacheKey)) {
      return this.connections.get(cacheKey);
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

      // Cache connection
      this.connections.set(cacheKey, connection);

      if (this.isDevelopment) {
        console.log(`✅ [AppKit] Created Mongoose connection: ${this._maskUrl(config.url)}`);
      }

      return connection;
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to create Mongoose connection: ${error.message}`,
        500
      );
    }
  }

  /**
   * Applies tenant middleware to Mongoose connection for automatic isolation
   */
  async applyTenantMiddleware(
    connection: any,
    tenantId: string,
    options: TenantMiddlewareOptions = {}
  ): Promise<any> {
    const tenantField = options.fieldName || 'tenant_id';

    // Store original model function
    const originalModel = connection.model.bind(connection);

    // Override model function to add middleware
    connection.model = function (name: string, schema?: any, collection?: string) {
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
        schema.pre('insertMany', function (next: any, docs: any[]) {
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

        // Update middleware - add tenant filter and data
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
            (stage: any) => stage.$match && stage.$match[tenantField]
          );

          if (!hasMatch) {
            // Add tenant filter as first stage
            pipeline.unshift({ $match: { [tenantField]: tenantId } });
          }
        });
      }

      return originalModel(name, schema, collection);
    };

    // Mark connection as tenant-filtered
    connection._tenantId = tenantId;
    connection._tenantFiltered = true;

    return connection;
  }

  /**
   * Creates a new database
   */
  async createDatabase(name: string, systemClient?: any): Promise<void> {
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

      if (this.isDevelopment) {
        console.log(`✅ [AppKit] Created MongoDB database: ${name}`);
      }
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to create MongoDB database '${name}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Drops a database
   */
  async dropDatabase(name: string, systemClient?: any): Promise<void> {
    try {
      const dbUrl = this._buildDatabaseUrl(name);
      const connection = await this.createClient({ url: dbUrl });

      try {
        await connection.db.dropDatabase();
        
        if (this.isDevelopment) {
          console.log(`✅ [AppKit] Dropped MongoDB database: ${name}`);
        }
      } finally {
        await connection.close();
      }
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to drop MongoDB database '${name}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Lists all databases
   */
  async listDatabases(systemClient?: any): Promise<string[]> {
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
        .map((db: any) => db.name)
        .filter((name: string) => !this._isSystemDatabase(name))
        .sort();

      return databases;
    } catch (error: any) {
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
   */
  async getDatabaseStats(client: any): Promise<any> {
    try {
      const db = client.db;

      // Get database stats
      const dbStats = await db.stats();

      // Get collection count
      const collections = await db.listCollections().toArray();
      const collectionCount = collections.filter(
        (col: any) => !col.name.startsWith('system.')
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
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to get MongoDB database stats: ${error.message}`,
        500
      );
    }
  }

  /**
   * Checks if tenant registry collection exists
   */
  async hasTenantRegistry(client: any): Promise<boolean> {
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
   */
  async createTenantRegistryEntry(client: any, tenantId: string): Promise<void> {
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
    } catch (error: any) {
      if (this.isDevelopment) {
        console.debug('Failed to create tenant registry entry:', error.message);
      }
    }
  }

  /**
   * Deletes tenant registry entry
   */
  async deleteTenantRegistryEntry(client: any, tenantId: string): Promise<void> {
    try {
      const collection = client.db.collection('tenant_registry');
      await collection.deleteOne({ tenant_id: tenantId });
    } catch (error: any) {
      if (this.isDevelopment) {
        console.debug('Failed to delete tenant registry entry:', error.message);
      }
    }
  }

  /**
   * Checks if tenant exists in registry
   */
  async tenantExistsInRegistry(client: any, tenantId: string): Promise<boolean> {
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
   */
  async getTenantsFromRegistry(client: any): Promise<string[]> {
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

      return docs.map((doc: any) => doc.tenant_id);
    } catch (error) {
      return [];
    }
  }

  /**
   * Disconnects the adapter
   */
  async disconnect(): Promise<void> {
    const disconnectPromises = [];

    for (const [key, connection] of this.connections) {
      disconnectPromises.push(
        connection
          .close()
          .catch((error: any) =>
            console.warn(`Error disconnecting ${key}:`, error.message)
          )
      );
    }

    await Promise.all(disconnectPromises);
    this.connections.clear();

    if (this.isDevelopment) {
      console.log('👋 [AppKit] Mongoose adapter disconnected');
    }
  }

  // Private helper methods

  /**
   * Builds cache key for connections
   */
  private _buildCacheKey(config: MongooseClientConfig): string {
    return `${config.url}_${config.maxPoolSize || 10}_${config.timeout || 10000}`;
  }

  /**
   * Builds database URL for specific tenant/org
   */
  private _buildDatabaseUrl(name: string): string {
    const url = this.options.url || process.env.DATABASE_URL;
    if (!url) {
      throw createDatabaseError('Database URL not configured', 500);
    }

    const sanitizedName = this._sanitizeName(name);

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
   */
  private _buildAdminUrl(): string {
    const url = this.options.url || process.env.DATABASE_URL;
    if (!url) {
      throw createDatabaseError('Database URL not configured', 500);
    }

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
   */
  private _isSystemDatabase(name: string): boolean {
    const systemDatabases = ['admin', 'config', 'local'];
    return systemDatabases.includes(name) || name.startsWith('_');
  }

  /**
   * Sanitizes database name to prevent injection
   */
  private _sanitizeName(name: string): string {
    // MongoDB database names have specific restrictions
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }

  /**
   * Formats bytes to human readable format
   */
  private _formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Masks URL for logging (hides credentials)
   */
  private _maskUrl(url: string): string {
    return url.replace(/:\/\/[^@]*@/, '://***:***@');
  }

  /**
   * Sets up connection event handlers
   */
  private _setupConnectionEvents(connection: any, url: string): void {
    connection.on('connected', () => {
      if (this.isDevelopment) {
        console.debug(`MongoDB connected: ${this._maskUrl(url)}`);
      }
    });

    connection.on('error', (error: any) => {
      console.error(`MongoDB connection error: ${error.message}`);
    });

    connection.on('disconnected', () => {
      if (this.isDevelopment) {
        console.debug(`MongoDB disconnected: ${this._maskUrl(url)}`);
      }
    });

    connection.on('reconnected', () => {
      if (this.isDevelopment) {
        console.debug(`MongoDB reconnected: ${this._maskUrl(url)}`);
      }
    });
  }
}