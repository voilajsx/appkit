# @voilajsx/appkit/tenantdb - LLM API Reference

**Note**: Implementation is in JavaScript. TypeScript signatures are for
reference only.

## LLM Code Generation Guidelines

1. **File Header Comments** (Required for all files):

   ```javascript
   /**
    * Brief description of what the file does
    * @module @voilajsx/appkit/tenantdb
    * @file path/to/filename.js
    */
   ```

````

2. **Function JSDoc** (Required for all functions):

   ```javascript
   /**
    * One clear sentence describing what the function does
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Focus on reduced file size and clean code

4. **Comment Guidelines**:

   - **File headers**: Always include with description, module, and file path
   - **Function docs**: One clear sentence describing the purpose
   - **Inline comments**: Only for complex logic that's confusing or hard to
     understand
   - **No basic comments**: Avoid obvious comments like `// Create tenant`
     before `createTenant()`
   - **Focus on minimal file size**: Comment only when necessary for
     understanding

5. **Configuration**:

   - Use simple hardcoded URLs for basic examples
     (`'postgresql://localhost:5432/myapp'`)
   - Use environment variables only in complete application examples
     (`process.env.DATABASE_URL`)

6. **Database References**:

   - If database operations are needed, use the tenant-scoped `db` object (e.g.,
     `tenantDb.user.findMany()`)
   - Don't import or define database clients - assume they're available from the
     module
   - Keep database operations simple and generic

7. **Error Handling**:
   - Use try/catch blocks for async functions
   - Throw descriptive error messages

## Function Signatures

### 1. `createDb`

```typescript
function createDb(config: {
  url: string;
  strategy?: 'row' | 'database';
  adapter?: 'prisma' | 'mongoose';
}): TenantDatabase;
```

- Auto-detects `strategy` from URL pattern (`{tenant}` = database strategy)
- Auto-detects `adapter` from URL protocol (`mongodb` = mongoose)

### 2. `createMiddleware`

```typescript
function createMiddleware(db: TenantDatabase): ExpressMiddleware;
```

- Sets `req.db` with tenant-scoped database connection
- Sets `req.tenantId` with extracted tenant ID

### 3. `TenantDatabase` methods

```typescript
interface TenantDatabase {
  forTenant(tenantId: string): Promise<DatabaseClient>;
  createTenant(tenantId: string): Promise<void>;
  deleteTenant(tenantId: string): Promise<void>;
  tenantExists(tenantId: string): Promise<boolean>;
  listTenants(): Promise<string[]>;
  disconnect(): Promise<void>;
}
```

### 4. Tenant ID Sources (Middleware)

Middleware checks these sources in order:

1. `req.headers['x-tenant-id']`
2. `req.query.tenantId`
3. `req.params.tenantId`
4. `req.tenant?.id`
5. `req.user?.tenantId`
6. `req.body?.tenantId`

## Example Implementations

### Basic Multi-Tenant Setup

```javascript
/**
 * Basic multi-tenant Express application with automatic tenant isolation
 * @module @voilajsx/appkit/tenantdb
 * @file examples/basic-app.js
 */

import { createDb, createMiddleware } from '@voilajsx/appkit/tenantdb';
import express from 'express';

const app = express();
app.use(express.json());

/**
 * Creates multi-tenant database with row-level isolation
 * @returns {Object} Database instance with tenant methods
 */
function setupDatabase() {
  return createDb({
    url: 'postgresql://localhost:5432/myapp',
  });
}

const db = setupDatabase();
const tenantMiddleware = createMiddleware(db);

// Add tenant context to all API routes
app.use('/api', tenantMiddleware);

/**
 * Gets all users for the current tenant
 * @param {Object} req - Express request with tenant context
 * @param {Object} res - Express response
 */
app.get('/api/users', async (req, res) => {
  const users = await req.db.user.findMany();
  res.json(users);
});

/**
 * Creates a new user for the current tenant
 * @param {Object} req - Express request with tenant context and user data
 * @param {Object} res - Express response
 */
app.post('/api/users', async (req, res) => {
  const user = await req.db.user.create({
    data: req.body,
  });
  res.json(user);
});

app.listen(3000);
```

### Database-Per-Tenant Strategy

```javascript
/**
 * Multi-tenant application with database-per-tenant isolation
 * @module @voilajsx/appkit/tenantdb
 * @file examples/database-strategy.js
 */

import { createDb } from '@voilajsx/appkit/tenantdb';

/**
 * Creates database instance with database-per-tenant strategy
 * @returns {Object} Database instance for managing separate tenant databases
 */
function createTenantDatabase() {
  return createDb({
    url: 'postgresql://admin:password@localhost:5432/{tenant}',
  });
}

const db = createTenantDatabase();

/**
 * Creates a new tenant with dedicated database
 * @param {string} tenantId - Unique tenant identifier
 * @param {string} adminEmail - Email for tenant admin user
 * @returns {Promise<Object>} Tenant details with admin user ID
 */
async function provisionTenant(tenantId, adminEmail) {
  await db.createTenant(tenantId);

  const tenantDb = await db.forTenant(tenantId);
  const admin = await tenantDb.user.create({
    data: {
      email: adminEmail,
      role: 'admin',
    },
  });

  return { tenantId, adminId: admin.id };
}

/**
 * Gets health status for a specific tenant
 * @param {string} tenantId - Tenant identifier to check
 * @returns {Promise<Object>} Health status and basic metrics
 */
async function getTenantHealth(tenantId) {
  if (!(await db.tenantExists(tenantId))) {
    return { status: 'not_found' };
  }

  const tenantDb = await db.forTenant(tenantId);
  const userCount = await tenantDb.user.count();

  return {
    status: 'healthy',
    tenantId,
    userCount,
  };
}
```

### Tenant Management

```javascript
/**
 * Administrative functions for tenant lifecycle management
 * @module @voilajsx/appkit/tenantdb
 * @file examples/tenant-management.js
 */

import { createDb } from '@voilajsx/appkit/tenantdb';

const db = createDb({ url: process.env.DATABASE_URL });

/**
 * Creates a new tenant with initial setup
 * @param {string} companyName - Company name for the tenant
 * @param {string} ownerEmail - Email for the tenant owner
 * @returns {Promise<Object>} Created tenant details
 * @throws {Error} If tenant creation fails
 */
async function createCompanyTenant(companyName, ownerEmail) {
  const tenantId = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  if (await db.tenantExists(tenantId)) {
    throw new Error('Company already exists');
  }

  await db.createTenant(tenantId);

  const tenantDb = await db.forTenant(tenantId);
  const owner = await tenantDb.user.create({
    data: {
      email: ownerEmail,
      role: 'owner',
      status: 'active',
    },
  });

  return { tenantId, ownerId: owner.id };
}

/**
 * Gets overview of all tenants with basic statistics
 * @returns {Promise<Object>} Tenant statistics and details
 */
async function getTenantOverview() {
  const tenants = await db.listTenants();
  const stats = [];

  for (const tenantId of tenants) {
    const tenantDb = await db.forTenant(tenantId);
    const userCount = await tenantDb.user.count();

    stats.push({
      tenantId,
      userCount,
      status: 'active',
    });
  }

  return {
    totalTenants: tenants.length,
    tenants: stats,
  };
}

/**
 * Safely deletes a tenant after validation
 * @param {string} tenantId - Tenant to delete
 * @param {string} confirmCode - Confirmation code for safety
 * @throws {Error} If confirmation code is invalid
 */
async function deleteTenantSafely(tenantId, confirmCode) {
  if (confirmCode !== `DELETE_${tenantId}`) {
    throw new Error('Invalid confirmation code');
  }

  await db.deleteTenant(tenantId);
}
```

### Express API Integration

```javascript
/**
 * Complete Express API with tenant authentication and management
 * @module @voilajsx/appkit/tenantdb
 * @file examples/express-api.js
 */

import express from 'express';
import { createDb, createMiddleware } from '@voilajsx/appkit/tenantdb';

const app = express();
app.use(express.json());

const db = createDb({ url: process.env.DATABASE_URL });

/**
 * Registers a new company and creates tenant
 * @param {Object} req - Request with company registration data
 * @param {Object} res - Response object
 */
app.post('/register', async (req, res) => {
  try {
    const { companyName, adminEmail } = req.body;
    const tenantId = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');

    await db.createTenant(tenantId);

    const tenantDb = await db.forTenant(tenantId);
    const admin = await tenantDb.user.create({
      data: {
        email: adminEmail,
        role: 'admin',
      },
    });

    res.status(201).json({
      tenantId,
      adminId: admin.id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Apply tenant middleware to API routes
app.use('/api', createMiddleware(db));

/**
 * Gets current tenant's user list
 */
app.get('/api/users', async (req, res) => {
  const users = await req.db.user.findMany({
    select: { id: true, email: true, role: true },
  });
  res.json(users);
});

/**
 * Creates new user in current tenant
 */
app.post('/api/users', async (req, res) => {
  const user = await req.db.user.create({
    data: req.body,
  });
  res.json(user);
});

/**
 * Gets tenant dashboard statistics
 */
app.get('/api/dashboard', async (req, res) => {
  const userCount = await req.db.user.count();
  const activeUsers = await req.db.user.count({
    where: { status: 'active' },
  });

  res.json({
    tenant: req.tenantId,
    stats: { userCount, activeUsers },
  });
});

/**
 * System admin endpoint for tenant overview
 */
app.get('/admin/tenants', async (req, res) => {
  const tenants = await db.listTenants();
  const details = [];

  for (const tenantId of tenants) {
    const tenantDb = await db.forTenant(tenantId);
    const userCount = await tenantDb.user.count();
    details.push({ tenantId, userCount });
  }

  res.json({ totalTenants: tenants.length, tenants: details });
});

app.listen(3000);
```

### MongoDB/Mongoose Integration

```javascript
/**
 * Multi-tenant MongoDB application using Mongoose
 * @module @voilajsx/appkit/tenantdb
 * @file examples/mongoose-app.js
 */

import { createDb, createMiddleware } from '@voilajsx/appkit/tenantdb';
import mongoose from 'mongoose';
import express from 'express';

const app = express();
app.use(express.json());

/**
 * Creates MongoDB multi-tenant database instance
 * @returns {Object} Database instance configured for MongoDB
 */
function setupMongoDatabase() {
  return createDb({
    url: 'mongodb://localhost:27017/myapp',
  });
}

// User schema with tenantId field
const userSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'user' },
});

const db = setupMongoDatabase();
app.use('/api', createMiddleware(db));

/**
 * Gets users for current tenant using Mongoose
 */
app.get('/api/users', async (req, res) => {
  const User = req.db.model('User', userSchema);
  const users = await User.find({ active: true });
  res.json(users);
});

/**
 * Creates user in current tenant using Mongoose
 */
app.post('/api/users', async (req, res) => {
  const User = req.db.model('User', userSchema);
  const user = await User.create(req.body);
  res.json(user);
});

app.listen(3000);
```

## Code Generation Rules

1. **Always include file header** with description, @module, and @file tags
2. **Use JSDoc for all functions** with one clear sentence descriptions
3. **Add inline comments** only for complex logic that needs explanation
4. **Use async/await** for all database operations
5. **Include comprehensive error handling** with try/catch blocks
6. **Use simple configuration** for basic examples (hardcoded URLs)
7. **Use environment variables** only in complete application examples
8. **Use tenant-scoped database objects** (req.db, tenantDb) for all operations
9. **Return consistent response formats** in API endpoints
10. **Focus on minimal file size** - avoid unnecessary comments
11. **Follow ESM import style** with single quotes and semicolons
12. **Include proper tenant validation** in administrative functions

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>

````
