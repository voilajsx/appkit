# @voilajsx/appkit - Database Module 💾

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple object-driven database with optional multi-tenancy and smart
> defaults

The Database module provides **one function** that returns a database object
with all methods. Zero configuration needed, production-ready by default, with
optional multi-tenancy and environment-aware smart defaults.

## 🚀 Why Choose This?

- **⚡ One Function** - Just `database.get()`, everything else is automatic
- **🔧 Zero Configuration** - Smart defaults for everything
- **🌍 Environment-First** - Auto-detects from `VOILA_DB_*` variables
- **🎯 Object-Driven** - Clean API, perfect for AI code generation
- **🏢 Optional Multi-Tenancy** - Enable when needed, simple when not
- **🔌 Universal Support** - Prisma (default), Mongoose, Express, Fastify

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

```bash
# Set your environment variable
echo "VOILA_DB_URL=postgresql://localhost:5432/myapp" > .env
```

```javascript
// One import, one function call
import { database } from '@voilajsx/appkit/db';

const db = database.get();

// Single-tenant mode (default)
const client = await db.client();
const users = await client.user.findMany();

// Multi-tenant mode (when URL has {tenant} or enabled explicitly)
const tenantDb = await db.tenant('acme');
const tenantUsers = await tenantDb.user.findMany(); // Automatically isolated
```

**That's it!** Production-ready database with optional multi-tenancy.

## 📖 Essential API Reference

### Main Function

#### `database.get()`

Returns a database object with all methods.

```javascript
import { database } from '@voilajsx/appkit/db';

const db = database.get(); // Environment parsed once for performance
```

### Database Methods

```javascript
// Single-tenant mode
await db.client(); // Simple Prisma client

// Multi-tenant mode
await db.tenant(tenantId); // Tenant-specific client
await db.createTenant(tenantId); // Create new tenant
await db.deleteTenant(tenantId, { confirm: true }); // Delete tenant
await db.exists(tenantId); // Check if tenant exists
await db.list(); // List all tenants

// Middleware
db.middleware(options); // Universal middleware (Express + Fastify)

// Utilities
await db.health(); // Health check
await db.disconnect(); // Clean shutdown
```

## 💡 Simple Examples

### Single-Tenant Application

```javascript
/**
 * Simple single-tenant application
 * @module @voilajsx/appkit/db
 * @file examples/single-tenant.js
 */

import express from 'express';
import { database } from '@voilajsx/appkit/db';

const app = express();
const db = database.get();

app.use(express.json());

// Single database for entire application
app.get('/users', async (req, res) => {
  const client = await db.client();
  const users = await client.user.findMany();
  res.json({ users });
});

app.post('/users', async (req, res) => {
  const client = await db.client();
  const user = await client.user.create({
    data: req.body,
  });
  res.json({ user });
});

app.listen(3000, () => {
  console.log('Single-tenant app running on port 3000');
});
```

### Multi-Tenant Application (Database-per-Tenant)

```javascript
/**
 * Multi-tenant application with database isolation
 * @module @voilajsx/appkit/db
 * @file examples/multi-tenant-database.js
 */

import express from 'express';
import { database } from '@voilajsx/appkit/db';

const app = express();
const db = database.get();

app.use(express.json());

// Universal middleware for tenant detection
app.use(db.middleware());

// All routes automatically tenant-aware
app.get('/users', async (req, res) => {
  // req.db is tenant-specific database connection
  const users = await req.db.user.findMany();
  res.json({ users, tenant: req.tenantId });
});

app.post('/users', async (req, res) => {
  // Automatic tenant isolation
  const user = await req.db.user.create({
    data: req.body,
  });
  res.json({ user });
});

// Tenant management
app.post('/admin/tenants', async (req, res) => {
  const { tenantId } = req.body;
  await db.createTenant(tenantId);
  res.json({ success: true, tenant: tenantId });
});

app.delete('/admin/tenants/:id', async (req, res) => {
  await db.deleteTenant(req.params.id, { confirm: true });
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Multi-tenant app running on port 3000');
});
```

### Multi-Tenant Application (Row-Level)

```javascript
/**
 * Multi-tenant application with shared database
 * @module @voilajsx/appkit/db
 * @file examples/multi-tenant-row.js
 */

import express from 'express';
import { database } from '@voilajsx/appkit/db';

const app = express();
const db = database.get();

app.use(express.json());
app.use(db.middleware());

// All operations automatically filtered by tenantId
app.get('/posts', async (req, res) => {
  // Only returns posts for current tenant
  const posts = await req.db.post.findMany({
    include: { author: true },
  });
  res.json({ posts });
});

app.post('/posts', async (req, res) => {
  // tenantId automatically added to new posts
  const post = await req.db.post.create({
    data: {
      title: req.body.title,
      content: req.body.content,
      authorId: req.user.id,
    },
  });
  res.json({ post });
});

// Cross-tenant admin operations
app.get('/admin/stats', async (req, res) => {
  const tenants = await db.list();
  const stats = [];

  for (const tenantId of tenants) {
    const tenantDb = await db.tenant(tenantId);
    const userCount = await tenantDb.user.count();
    const postCount = await tenantDb.post.count();

    stats.push({
      tenant: tenantId,
      users: userCount,
      posts: postCount,
    });
  }

  res.json({ stats });
});

app.listen(3000, () => {
  console.log('Row-level multi-tenant app running on port 3000');
});
```

### Fastify Integration

```javascript
/**
 * Fastify application with database integration
 * @module @voilajsx/appkit/db
 * @file examples/fastify-app.js
 */

import Fastify from 'fastify';
import { database } from '@voilajsx/appkit/db';

const fastify = Fastify({ logger: true });
const db = database.get();

// Register database middleware
fastify.register(async function (fastify) {
  fastify.addHook('preHandler', db.middleware());
});

// Routes automatically have tenant context
fastify.get('/users', async (request, reply) => {
  const users = await request.db.user.findMany();
  return { users, tenant: request.tenantId };
});

fastify.post('/users', async (request, reply) => {
  const user = await request.db.user.create({
    data: request.body,
  });
  return { user };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Fastify app running on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

## 🌍 Environment Variables

### Essential Configuration

```bash
# Required - Database connection
VOILA_DB_URL=postgresql://localhost:5432/myapp

# Optional - Auto-detected from URL
VOILA_DB_STRATEGY=row               # 'row' or 'database'
VOILA_DB_ADAPTER=prisma             # 'prisma' or 'mongoose'
VOILA_DB_TENANT=false               # Enable tenant mode

# Optional - Performance tuning
VOILA_DB_POOL_SIZE=10               # Connection pool size
VOILA_DB_TIMEOUT=10000              # Connection timeout (ms)
VOILA_DB_RETRIES=3                  # Connection retries
VOILA_DB_SSL=true                   # Force SSL in production

# Optional - Tenant configuration
VOILA_DB_TENANT_FIELD=tenantId      # Tenant field name
VOILA_DB_TENANT_HEADER=x-tenant-id  # Header for tenant detection
VOILA_DB_TENANT_REQUIRED=true       # Require tenant in middleware
VOILA_DB_TENANT_AUTO_CREATE=false   # Auto-create missing tenants
```

### Smart URL Detection

```bash
# Single-tenant (row strategy auto-selected)
VOILA_DB_URL=postgresql://localhost:5432/myapp

# Multi-tenant database-per-tenant (database strategy auto-selected)
VOILA_DB_URL=postgresql://localhost:5432/{tenant}

# Multi-tenant row-level (explicit strategy)
VOILA_DB_URL=postgresql://localhost:5432/myapp
VOILA_DB_STRATEGY=row
VOILA_DB_TENANT=true
```

## 🔧 Multi-Tenancy Strategies

### Row-Level Strategy (Shared Database)

**Best for**: Many small tenants, cost-effective, simple setup

```bash
VOILA_DB_URL=postgresql://localhost:5432/myapp
```

**How it works**:

- Single shared database
- `tenantId` column in all tables
- Automatic filtering by tenant
- Prisma/Mongoose middleware handles isolation

**Pros**: Cost-effective, simple migrations, shared resources **Cons**: Less
isolation, potential data leakage if misconfigured

### Database Strategy (Database-per-Tenant)

**Best for**: Fewer large tenants, maximum isolation, compliance

```bash
VOILA_DB_URL=postgresql://localhost:5432/{tenant}
```

**How it works**:

- Separate database per tenant
- Complete data isolation
- Individual database management
- Per-tenant backups and scaling

**Pros**: Maximum isolation, individual scaling, compliance-ready **Cons**:
Higher resource usage, complex migrations

## 🛡️ Framework Support

### Express Integration

```javascript
// Automatic tenant detection and database injection
app.use(db.middleware());

app.get('/api/data', (req, res) => {
  // req.db - tenant-specific database
  // req.tenantId - current tenant ID
});
```

### Fastify Integration

```javascript
// Fastify plugin support
fastify.register(async function (fastify) {
  fastify.addHook('preHandler', db.middleware());
});

// Or use helper
import { fastifyPlugin } from '@voilajsx/appkit/db/middleware';
fastify.register(fastifyPlugin(db));
```

### Tenant Detection Sources

1. **Headers**: `x-tenant-id` (configurable)
2. **URL Parameters**: `/api/:tenantId/users`
3. **Query Parameters**: `/api/users?tenantId=acme`
4. **Request Body**: `{ tenantId: 'acme', ...data }`
5. **User Context**: `req.user.tenantId`
6. **Subdomain**: `acme.myapp.com` → tenant: `acme`

## 💾 Database Support

### Prisma (Default)

```bash
# PostgreSQL
VOILA_DB_URL=postgresql://user:pass@localhost:5432/{tenant}

# MySQL
VOILA_DB_URL=mysql://user:pass@localhost:3306/{tenant}

# SQLite (development)
VOILA_DB_URL=file:./data/{tenant}.db
```

### Mongoose

```bash
# MongoDB
VOILA_DB_URL=mongodb://localhost:27017/{tenant}

# MongoDB Atlas
VOILA_DB_URL=mongodb+srv://user:pass@cluster.mongodb.net/{tenant}
```

## 🏥 Health Monitoring

```javascript
// Health check endpoint
app.get('/health/database', async (req, res) => {
  const health = await db.health();
  res.json(health);
});

// Example response:
// {
//   healthy: true,
//   connections: 5,
//   strategy: "database",
//   adapter: "prisma",
//   tenant: true
// }
```

## 🔧 Advanced Usage

### Manual Tenant Operations

```javascript
// Create tenant programmatically
await db.createTenant('newcompany');

// Check if tenant exists
if (await db.exists('acme')) {
  const tenantDb = await db.tenant('acme');
  // Use tenant database
}

// List all tenants
const tenants = await db.list();
console.log('All tenants:', tenants);

// Delete tenant (requires confirmation)
await db.deleteTenant('oldcompany', { confirm: true });
```

### Custom Middleware Configuration

```javascript
// Custom tenant detection
app.use(
  db.middleware({
    headerName: 'x-organization-id',
    paramName: 'orgId',
    required: false,
    autoCreate: true,
    onError: (error, req, res, next) => {
      res.status(error.statusCode || 500).json({
        error: 'Custom database error',
        message: error.message,
      });
    },
  })
);
```

### Tenant Switching

```javascript
app.get('/admin/switch/:tenantId', async (req, res) => {
  try {
    // Switch to different tenant mid-request
    const newDb = await req.switchTenant(req.params.tenantId);
    const users = await newDb.user.findMany();

    res.json({
      tenant: req.tenantId,
      users,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## 🤖 LLM Code Generation Guidelines

### File Headers (Required)

```javascript
/**
 * Brief description of what the file does
 * @module @voilajsx/appkit/db
 * @file path/to/filename.js
 */
```

### Function Documentation (Required)

```javascript
/**
 * Clear description of what the function does
 * @param {Type} paramName - Parameter description
 * @returns {ReturnType} Return value description
 */
```

### Code Style Requirements

- **ESM imports** with single quotes:
  `import { database } from '@voilajsx/appkit/db';`
- **Semicolons required** for all statements
- **2-space indentation** for consistency
- **Always include JSDoc** for function documentation

### Essential Patterns for LLM Generation

#### 1. Basic Database Setup

```javascript
// Always start with this pattern
import { database } from '@voilajsx/appkit/db';
const db = database.get();

// Single-tenant mode
const client = await db.client();

// Multi-tenant mode
const tenantDb = await db.tenant('acme');
```

#### 2. Middleware Integration Pattern

```javascript
// ✅ ALWAYS add middleware for multi-tenant apps
app.use(db.middleware());

// ✅ Use tenant-aware database operations
app.get('/api/data', async (req, res) => {
  const data = await req.db.model.findMany(); // Automatically isolated
  res.json({ data, tenant: req.tenantId });
});
```

#### 3. Error Handling Pattern

```javascript
// ✅ ALWAYS handle database errors properly
try {
  const tenantDb = await db.tenant('acme');
  const users = await tenantDb.user.findMany();
} catch (error) {
  res.status(error.statusCode || 500).json({
    error: error.message,
  });
}
```

#### 4. Tenant Management Pattern

```javascript
// ✅ ALWAYS validate tenant operations
app.post('/admin/tenants', async (req, res) => {
  try {
    const { tenantId } = req.body;

    // Check if tenant already exists
    if (await db.exists(tenantId)) {
      return res.status(409).json({ error: 'Tenant already exists' });
    }

    await db.createTenant(tenantId);
    res.json({ success: true, tenant: tenantId });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});
```

### Anti-Patterns to Avoid

```javascript
// ❌ DON'T access database without tenant context in multi-tenant apps
const users = await prisma.user.findMany(); // No tenant isolation

// ❌ DON'T forget middleware in multi-tenant applications
app.get('/api/data', (req, res) => {
  // No req.db or req.tenantId available
});

// ❌ DON'T create tenants without validation
await db.createTenant(userInput); // No validation

// ❌ DON'T delete tenants without confirmation
await db.deleteTenant(tenantId); // Should require { confirm: true }

// ❌ DON'T hardcode tenant IDs
const acmeDb = await db.tenant('acme'); // Should be dynamic
```

### Response Format Guidelines

#### Standard Success Response

```javascript
res.json({
  data: results,
  tenant: req.tenantId, // Include tenant context
  count: results.length,
});
```

#### Standard Error Response

```javascript
res.status(error.statusCode || 500).json({
  error: error.message,
  tenant: req.tenantId, // Include tenant context even in errors
});
```

## 📈 Performance

- **Connection pooling**: Configurable pool sizes per database
- **Lazy initialization**: Connections created only when needed
- **Connection caching**: Reuses tenant connections for performance
- **Memory usage**: <3MB additional overhead
- **Environment parsing**: Once per application lifecycle

## 🔍 Error Handling

All database functions return standard Error objects with `statusCode`
properties:

```javascript
try {
  await db.createTenant('invalid-tenant-id!');
} catch (error) {
  console.log(`Error ${error.statusCode}: ${error.message}`);
  // Error 400: Invalid tenant ID format
}
```

### Common Error Status Codes

- **400** - Invalid tenant ID or configuration
- **404** - Tenant not found
- **409** - Tenant already exists
- **500** - Database connection or operation error

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md).

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
