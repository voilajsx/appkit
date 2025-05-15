# @voilajs/appkit/tenantdb - LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Always include JSDoc comments for functions

2. **JSDoc Format** (Required for all functions):

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error Handling**:

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Throw descriptive error messages

4. **Framework Agnostic**:
   - Primary functions should work with any Node.js framework
   - Express middleware should be clearly labeled as such
   - Provide adapter patterns for different ORMs/query builders

## Function Signatures

### Core Database Functions

#### createDb(config)

```typescript
function createDb(config: {
  url: string;
  strategy?: 'row' | 'schema' | 'database';
  adapter?: 'prisma' | 'mongoose' | 'knex' | 'typeorm';
  pooling?: {
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
  };
  cache?: {
    enabled?: boolean;
    ttl?: number;
  };
  adapterConfig?: Record<string, any>;
}): MultiTenantDb;
```

- Default `strategy`: `'row'`
- Default `adapter`: `'prisma'`
- Default `pooling.max`: `10`
- Default `pooling.min`: `2`
- Default `pooling.idleTimeoutMillis`: `30000`
- Default `cache.enabled`: `true`
- Default `cache.ttl`: `300000` (5 minutes)
- Throws: `'Database URL is required'`, `'Unknown adapter'`,
  `'Unknown strategy'`

#### MultiTenantDb.forTenant(tenantId)

```typescript
function forTenant(tenantId: string): Promise<DbClient>;
```

- Throws: `'Tenant ID is required'`

#### MultiTenantDb.createTenant(tenantId, options)

```typescript
function createTenant(
  tenantId: string,
  options?: {
    runMigrations?: boolean;
    template?: string;
  }
): Promise<void>;
```

- Default `options.runMigrations`: `true`
- Throws: `'Tenant ID is required'`, `'Tenant already exists'`,
  `'Invalid tenant ID format'`

#### MultiTenantDb.deleteTenant(tenantId)

```typescript
function deleteTenant(tenantId: string): Promise<void>;
```

- Throws: `'Tenant ID is required'`

#### MultiTenantDb.migrateTenant(tenantId)

```typescript
function migrateTenant(tenantId: string): Promise<void>;
```

- Throws: `'Tenant ID is required'`

#### MultiTenantDb.listTenants()

```typescript
function listTenants(): Promise<string[]>;
```

#### MultiTenantDb.tenantExists(tenantId)

```typescript
function tenantExists(tenantId: string): Promise<boolean>;
```

#### MultiTenantDb.getStats()

```typescript
function getStats(): {
  adapter: string;
  strategy: string;
  cachedConnections: number;
  connectionCounts: Record<string, number>;
  totalConnections: number;
  cacheEnabled: boolean;
  cacheConfig: Object;
};
```

#### MultiTenantDb.clearCache()

```typescript
function clearCache(): Promise<void>;
```

#### MultiTenantDb.disconnect()

```typescript
function disconnect(): Promise<void>;
```

#### MultiTenantDb.healthCheck()

```typescript
function healthCheck(): Promise<boolean>;
```

### Middleware Functions

#### createMiddleware(db, options)

```typescript
function createMiddleware(
  db: MultiTenantDb,
  options?: {
    getTenantId?: (req: any) => string | null;
    onError?: (error: Error, req: any, res: any) => void;
    required?: boolean;
  }
): (req: any, res: any, next: Function) => Promise<void>;
```

- Default `options.required`: `true`
- Default `options.getTenantId`: Function that checks request headers, query
  parameters, route parameters, tenant object, user object, and body
- Default `options.onError`: Function that returns HTTP 400/404 with error
  message

#### createTenantContext(db)

```typescript
function createTenantContext(db: MultiTenantDb): {
  run: (tenantId: string, fn: Function) => Promise<any>;
  get: () => { tenantId: string; db: DbClient } | undefined;
  getTenantId: () => string | undefined;
  getDb: () => DbClient | undefined;
};
```

### Tenancy Strategy Classes

#### RowStrategy

```typescript
class RowStrategy {
  constructor(options: { url: string; prismaClient?: any; log?: string[] });

  getConnection(tenantId: string): Promise<DbClient>;
  createTenant(tenantId: string): Promise<void>;
  deleteTenant(tenantId: string): Promise<void>;
  migrateTenant(tenantId: string): Promise<void>;
  listTenants(): Promise<string[]>;
  tenantExists(tenantId: string): Promise<boolean>;
  disconnect(): Promise<void>;
}
```

#### SchemaStrategy

```typescript
class SchemaStrategy {
  constructor(options: { url: string; prismaClient?: any; log?: string[] });

  getConnection(tenantId: string): Promise<DbClient>;
  createTenant(
    tenantId: string,
    options?: { template?: string; runMigrations?: boolean }
  ): Promise<void>;
  deleteTenant(tenantId: string): Promise<void>;
  migrateTenant(tenantId: string): Promise<void>;
  listTenants(): Promise<string[]>;
  tenantExists(tenantId: string): Promise<boolean>;
  disconnect(): Promise<void>;
}
```

#### DatabaseStrategy

```typescript
class DatabaseStrategy {
  constructor(options: { url: string; prismaClient?: any; log?: string[] });

  getConnection(tenantId: string): Promise<DbClient>;
  createTenant(
    tenantId: string,
    options?: { runMigrations?: boolean }
  ): Promise<void>;
  deleteTenant(tenantId: string): Promise<void>;
  migrateTenant(tenantId: string): Promise<void>;
  listTenants(): Promise<string[]>;
  tenantExists(tenantId: string): Promise<boolean>;
  disconnect(): Promise<void>;
}
```

## Example Implementations

### Basic Multi-Tenant Setup

```javascript
/**
 * Creates a multi-tenant database instance with row-level strategy
 * @param {string} databaseUrl - Database connection URL
 * @returns {Object} Multi-tenant database instance
 */
function createTenantDatabase(databaseUrl) {
  if (!databaseUrl) {
    throw new Error('Database URL is required');
  }

  // Import from @voilajs/appkit
  const { createDb } = require('@voilajs/appkit/tenantdb');

  // Create with default row-level strategy and Prisma adapter
  const db = createDb({
    url: databaseUrl,
    strategy: 'row',
    adapter: 'prisma',
    cache: {
      enabled: true,
      ttl: 5 * 60 * 1000, // 5 minutes
    },
  });

  // Graceful shutdown handling
  process.on('SIGTERM', async () => {
    console.log('Shutting down tenant database connections...');
    await db.disconnect();
    process.exit(0);
  });

  return db;
}

/**
 * Example using the tenant database with Express
 * @param {Object} app - Express app
 * @param {Object} db - Multi-tenant database instance
 */
function setupTenantRoutes(app, db) {
  const { createMiddleware } = require('@voilajs/appkit/tenantdb');

  // Create tenant middleware
  const tenantMiddleware = createMiddleware(db, {
    // Custom tenant ID extraction
    getTenantId: (req) => {
      return req.headers['x-tenant-id'] || req.query.tenant;
    },
    // Custom error handling
    onError: (error, req, res) => {
      console.error('Tenant error:', error.message);
      res.status(400).json({
        error: 'Tenant error',
        message: error.message,
      });
    },
    required: true,
  });

  // Apply middleware to routes
  app.use('/api', tenantMiddleware);

  // Tenant management routes
  app.post('/admin/tenants', async (req, res) => {
    try {
      const { tenantId, name } = req.body;

      if (!tenantId || !/^[a-z0-9-]+$/.test(tenantId)) {
        return res.status(400).json({
          error:
            'Invalid tenant ID. Use lowercase letters, numbers, and hyphens only.',
        });
      }

      if (await db.tenantExists(tenantId)) {
        return res.status(409).json({ error: 'Tenant already exists' });
      }

      await db.createTenant(tenantId);

      // Store additional tenant metadata in your system
      const tenant = await storeTenantMetadata(tenantId, name);

      res.status(201).json({ tenant });
    } catch (error) {
      console.error('Error creating tenant:', error);
      res.status(500).json({ error: 'Failed to create tenant' });
    }
  });

  // API routes (with tenant context)
  app.get('/api/users', async (req, res) => {
    try {
      // req.db is automatically set to the tenant's database connection
      const users = await req.db.user.findMany();
      res.json({ users });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching users' });
    }
  });
}
```

### Database-per-Tenant Strategy

```javascript
/**
 * Creates a multi-tenant database with database-per-tenant strategy
 * @param {string} databaseUrl - Database URL with {tenant} placeholder
 * @returns {Object} Multi-tenant database instance
 */
function createDatabasePerTenant(databaseUrl) {
  if (!databaseUrl.includes('{tenant}')) {
    throw new Error('Database URL must contain {tenant} placeholder');
  }

  const { createDb } = require('@voilajs/appkit/tenantdb');

  const db = createDb({
    url: databaseUrl,
    strategy: 'database',
    adapter: 'prisma',
    pooling: {
      max: 5, // Limit connections since each tenant has its own database
      min: 0,
      idleTimeoutMillis: 10000, // Close idle connections sooner
    },
  });

  return db;
}

/**
 * Sets up tenant provisioning with database strategy
 * @param {Object} db - Multi-tenant database instance
 */
async function provisionTenant(db, tenantId, metadata) {
  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }

  try {
    // Validate tenant ID format
    if (!/^[a-z0-9-]+$/.test(tenantId)) {
      throw new Error(
        'Tenant ID must contain only lowercase letters, numbers, and hyphens'
      );
    }

    // Create tenant database
    await db.createTenant(tenantId, { runMigrations: true });

    // Initialize tenant data
    const tenantDb = await db.forTenant(tenantId);

    // Create initial admin user
    await tenantDb.user.create({
      data: {
        email: `admin@${tenantId}.example.com`,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });

    // Create default settings
    await tenantDb.settings.create({
      data: {
        theme: 'light',
        companyName: metadata.companyName || tenantId,
        timezone: metadata.timezone || 'UTC',
      },
    });

    console.log(`Tenant ${tenantId} provisioned successfully`);
    return true;
  } catch (error) {
    console.error(`Failed to provision tenant ${tenantId}:`, error);

    // Clean up on failure
    try {
      if (await db.tenantExists(tenantId)) {
        await db.deleteTenant(tenantId);
      }
    } catch (cleanupError) {
      console.error(`Cleanup failed for tenant ${tenantId}:`, cleanupError);
    }

    throw error;
  }
}
```

### Schema-per-Tenant Strategy (PostgreSQL)

```javascript
/**
 * Creates a multi-tenant database with schema-per-tenant strategy
 * @param {string} databaseUrl - PostgreSQL database URL
 * @returns {Object} Multi-tenant database instance
 */
function createSchemaPerTenant(databaseUrl) {
  const { createDb } = require('@voilajs/appkit/tenantdb');

  const db = createDb({
    url: databaseUrl,
    strategy: 'schema',
    adapter: 'prisma',
  });

  return db;
}

/**
 * Sets up tenant provisioning with schema strategy
 * @param {Object} db - Multi-tenant database instance
 * @param {string} tenantId - Tenant identifier
 * @param {Object} options - Provisioning options
 */
async function provisionTenantSchema(db, tenantId, options = {}) {
  try {
    // Create tenant schema using a template if specified
    await db.createTenant(tenantId, {
      template: options.template || 'template_schema',
      runMigrations: true,
    });

    // Connect to tenant schema
    const tenantDb = await db.forTenant(tenantId);

    // Initialize tenant data
    await tenantDb.$transaction([
      // Create initial admin user
      tenantDb.user.create({
        data: {
          email: options.adminEmail || `admin@${tenantId}.example.com`,
          name: options.adminName || 'Admin User',
          role: 'ADMIN',
        },
      }),

      // Create default settings
      tenantDb.settings.create({
        data: {
          companyName: options.companyName || tenantId,
          timezone: options.timezone || 'UTC',
          features: {
            billing: options.features?.billing || false,
            reporting: options.features?.reporting || true,
            api: options.features?.api || false,
          },
        },
      }),
    ]);

    console.log(`Tenant schema ${tenantId} provisioned successfully`);
    return true;
  } catch (error) {
    console.error(`Failed to provision tenant schema ${tenantId}:`, error);

    // Clean up on failure
    try {
      if (await db.tenantExists(tenantId)) {
        await db.deleteTenant(tenantId);
      }
    } catch (cleanupError) {
      console.error(`Cleanup failed for tenant ${tenantId}:`, cleanupError);
    }

    throw error;
  }
}
```

### Using Tenant Context with Async Local Storage

```javascript
/**
 * Sets up tenant context for business logic
 * @param {Object} db - Multi-tenant database instance
 * @returns {Object} Tenant service with context functions
 */
function createTenantService(db) {
  const { createTenantContext } = require('@voilajs/appkit/tenantdb');
  const context = createTenantContext(db);

  return {
    /**
     * Executes function within tenant context
     * @param {string} tenantId - Tenant identifier
     * @param {Function} fn - Function to execute
     * @returns {Promise<any>} Function result
     */
    async runForTenant(tenantId, fn) {
      return context.run(tenantId, fn);
    },

    /**
     * Gets current tenant ID from context
     * @returns {string|undefined} Current tenant ID
     */
    getCurrentTenantId() {
      return context.getTenantId();
    },

    /**
     * Gets database for current tenant
     * @returns {Object|undefined} Current tenant database
     * @throws {Error} If not in tenant context
     */
    getDB() {
      const db = context.getDb();
      if (!db) {
        throw new Error('Not in tenant context');
      }
      return db;
    },

    /**
     * Executes business logic in current tenant context
     * @param {Function} businessLogic - Business logic to execute
     * @returns {Promise<any>} Business logic result
     * @throws {Error} If not in tenant context
     */
    async execute(businessLogic) {
      const tenantId = this.getCurrentTenantId();
      if (!tenantId) {
        throw new Error('Not in tenant context');
      }

      const db = this.getDB();
      return businessLogic(db, tenantId);
    },
  };
}

/**
 * Example showing how to use tenant context in business logic
 * @param {Object} tenantService - Tenant service
 */
async function processTenantData(tenantService) {
  try {
    // Get all tenants
    const tenantDb = await db.forTenant('system');
    const tenants = await tenantDb.tenant.findMany({
      where: { status: 'active' },
    });

    for (const tenant of tenants) {
      await tenantService.runForTenant(tenant.id, async () => {
        // This runs in tenant context, DB queries are automatically isolated
        const db = tenantService.getDB();

        // Get users who need report
        const users = await db.user.findMany({
          where: { reportSubscription: true },
        });

        // Generate and send reports
        for (const user of users) {
          const report = await generateUserReport(user.id);
          await sendEmailReport(user.email, report);
        }

        console.log(`Processed reports for tenant: ${tenant.id}`);
      });
    }
  } catch (error) {
    console.error('Error processing tenant data:', error);
  }
}
```

## Code Generation Rules

1. **Always validate tenant ID** before using in database operations
2. **Use try/catch blocks** for all async operations
3. **Properly handle database connection lifecycle** with disconnect
4. **Apply tenant isolation consistently** across all queries
5. **Sanitize inputs** to prevent SQL injection when building queries
6. **Cache connections appropriately** for performance
7. **Apply proper error handling** with descriptive messages
8. **Always use await** with async database operations
9. **Follow the tenancy strategy pattern** for consistency
10. **Use middleware to simplify tenant routing** in web applications

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
