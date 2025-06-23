# @voilajsx/appkit - Database Module 💾

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> Ultra-simple database wrapper with auto-discovery, app isolation, and
> progressive multi-tenancy

The Database module provides **three simple methods** - `database.get()`,
`database.tenant()`, and `database.org()` - that automatically handle app
detection, tenant isolation, and organization management. Zero configuration
needed, production-ready by default.

## 🚀 Why Choose AppKit Database?

- **⚡ 3 Simple Methods** - `get()`, `tenant()`, `org()` - covers all use cases
- **🔍 Auto-Discovery** - Detects your apps and Prisma clients automatically
- **🎯 App Isolation** - Each app uses its own Prisma schema and client
- **🏢 Progressive Multi-Tenancy** - Start simple, add orgs/tenants when needed
- **🔧 Zero Configuration** - Just 3 environment variables
- **🌍 Framework Agnostic** - Works with Express, Fastify, Koa, etc.
- **📦 Production-Ready** - Built-in caching, cleanup, and error handling

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

### Single Database (Simple)

```typescript
import { database } from '@voilajsx/appkit/db';

// Get database client (auto-detects current app from file path)
const db = await database.get();
const users = await db.user.findMany();
```

### Multi-Tenant (Row-Level Isolation)

```typescript
import { database } from '@voilajsx/appkit/db';

// Enable tenant mode
// .env: VOILA_DB_TENANTS=true

// Get tenant-specific client (auto-filters all queries)
const tenantDB = await database.tenant('team-alpha');
const users = await tenantDB.user.findMany(); // Only returns team-alpha users
```

### Multi-Organization (Database-Level Isolation)

```typescript
import { database } from '@voilajsx/appkit/db';

// Enable organization mode
// .env: VOILA_DB_ORGS=true, VOILA_DB_TENANTS=true

// Each org gets its own database, tenants within each org
const orgTenantDB = await database.org('acme-corp').tenant('team-alpha');
const users = await orgTenantDB.user.findMany(); // acme-corp database, team-alpha filtered
```

**That's it!** Three simple methods that grow with your needs.

## 🎯 Core API

### Progressive Complexity

```typescript
// Level 1: Single database (auto-detects app)
const db = await database.get();

// Level 2: Multi-tenant (row-level isolation)
const tenantDB = await database.tenant('team-alpha');

// Level 3: Multi-organization (database-level isolation)
const orgDB = await database.org('acme-corp').get();
const orgTenantDB = await database.org('acme-corp').tenant('team-alpha');
```

### Configuration-Driven API

The API automatically adapts based on your environment variables:

```bash
# Single database mode
DATABASE_URL=postgresql://localhost:5432/myapp

# Multi-tenant mode (row-level isolation)
DATABASE_URL=postgresql://localhost:5432/myapp
VOILA_DB_TENANTS=true

# Multi-organization mode (database-level isolation)
DATABASE_URL=postgresql://localhost:5432/{org}
VOILA_DB_ORGS=true
VOILA_DB_TENANTS=true
```

## 🗂️ Directory Structure

AppKit automatically discovers apps in this structure:

```
your-project/
├── apps/
│   ├── auth/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── generated/client/index.js  ✅ Auto-discovered
│   │   └── src/
│   │       └── routes/
│   │           └── users.ts               ✅ Auto-detects 'auth' app
│   ├── billing/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── generated/client/index.js  ✅ Auto-discovered
│   │   └── src/
│   │       └── api/
│   │           └── invoices.ts            ✅ Auto-detects 'billing' app
│   └── analytics/
│       ├── prisma/
│       │   └── generated/client/index.js  ✅ Auto-discovered
│       └── src/
├── .env
└── package.json
```

## 💡 Real-World Examples

### User Model (Single App)

```typescript
/**
 * User Model with auto-detection
 * @file /apps/auth/src/models/user.ts
 */
import { database } from '@voilajsx/appkit/db';

export const UserModel = {
  async create(userData: any) {
    const db = await database.get(); // Auto-detects 'auth' app

    return await db.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  },

  async findById(userId: string) {
    const db = await database.get(); // Auto-detects 'auth' app

    return await db.user.findUnique({
      where: { id: userId },
    });
  },

  async findAll({ page = 1, limit = 10 } = {}) {
    const db = await database.get(); // Auto-detects 'auth' app
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      db.user.findMany({ skip, take: limit }),
      db.user.count(),
    ]);

    return {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },
};
```

### Multi-Tenant API Routes

```typescript
/**
 * Multi-tenant API with Express
 * @file /apps/auth/src/routes/users.ts
 */
import express from 'express';
import { database } from '@voilajsx/appkit/db';

const router = express.Router();

// Single endpoint serves all tenants
router.get('/users', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    // Get tenant-specific database (auto-detects 'auth' app)
    const db = await database.tenant(tenantId);

    // All queries auto-filtered by tenant_id
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    res.json({ users, tenant: tenantId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const db = await database.tenant(tenantId);

    // tenant_id automatically added to new records
    const user = await db.user.create({
      data: req.body,
    });

    res.status(201).json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Cross-Organization Analytics

```typescript
/**
 * Analytics service accessing multiple organizations
 * @file /apps/analytics/src/services/metrics.ts
 */
import { database } from '@voilajsx/appkit/db';

export const MetricsService = {
  async getOrgDashboard(orgId: string, tenantId?: string) {
    if (tenantId) {
      // Tenant-specific metrics within organization
      const analyticsDB = await database.org(orgId).tenant(tenantId);

      return {
        org: orgId,
        tenant: tenantId,
        events: await analyticsDB.event.count(),
        revenue: await analyticsDB.revenue.aggregate({
          _sum: { amount: true },
        }),
      };
    } else {
      // Organization-wide metrics
      const analyticsDB = await database.org(orgId).get();

      return {
        org: orgId,
        totalEvents: await analyticsDB.event.count(),
        totalRevenue: await analyticsDB.revenue.aggregate({
          _sum: { amount: true },
        }),
        tenantCount: (
          await analyticsDB.event.findMany({
            select: { tenant_id: true },
            distinct: ['tenant_id'],
          })
        ).length,
      };
    }
  },

  async compareOrganizations(orgIds: string[]) {
    const results = await Promise.all(
      orgIds.map(async (orgId) => {
        const db = await database.org(orgId).get();

        return {
          org: orgId,
          users: await db.user.count(),
          events: await db.event.count(),
        };
      })
    );

    return results;
  },
};
```

### Universal Middleware Integration

```typescript
/**
 * Automatic tenant detection with Express
 * @file /apps/api/src/server.ts
 */
import express from 'express';
import { database, createMiddleware } from '@voilajsx/appkit/db';

const app = express();

// Automatic tenant/org detection middleware
app.use(
  createMiddleware(database, {
    orgRequired: false, // org-id optional
    tenantRequired: true, // tenant-id required
    autoCreate: true, // auto-create missing tenants
  })
);

// Routes automatically get tenant context
app.get('/api/users', async (req, res) => {
  // req.db is automatically set up with tenant filtering
  const users = await req.db.user.findMany();
  res.json({ users, tenant: req.tenantId });
});

// Dynamic tenant switching
app.post('/api/switch-tenant', async (req, res) => {
  const newTenantId = req.body.tenantId;

  // Switch to different tenant
  const newDb = await req.switchTenant(newTenantId);
  const users = await newDb.user.findMany();

  res.json({ users, tenant: newTenantId });
});

app.listen(3000);
```

## 🌍 Environment Configuration

### Minimal Setup (3 Variables Only)

```bash
# Required: Database connection
DATABASE_URL=postgresql://localhost:5432/myapp

# Optional: Enable organizations (separate databases per org)
VOILA_DB_ORGS=true

# Optional: Enable tenants (row-level isolation within databases)
VOILA_DB_TENANTS=true
```

### Advanced URL Patterns

```bash
# Database-per-organization with placeholder
DATABASE_URL=postgresql://localhost:5432/{org}_database

# Organization with tenant support
DATABASE_URL=postgresql://localhost:5432/{org}_db
VOILA_DB_ORGS=true
VOILA_DB_TENANTS=true

# MongoDB multi-tenancy
DATABASE_URL=mongodb://localhost:27017/{org}_db
VOILA_DB_ORGS=true
VOILA_DB_TENANTS=true
```

## 🏢 Multi-Tenancy Features

### Automatic Tenant Isolation

When you use `database.tenant(id)`, the module automatically:

1. **Adds tenant_id** to all create/update operations
2. **Filters all queries** to only return tenant's data
3. **Handles complex queries** (AND, OR clauses)
4. **Isolates by app** - each app manages its own tenant data

### Required Schema Changes

Add a `tenant_id` field to your Prisma models:

```prisma
// apps/auth/prisma/schema.prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  name     String
  tenant_id String? // Add this field for future-proofing

  @@index([tenant_id])
  @@map("auth_users") // Your existing table naming pattern
}

model Session {
  id       String @id @default(cuid())
  userId   String
  token    String
  tenant_id String? // Add this field

  user User @relation(fields: [userId], references: [id])

  @@index([tenant_id])
  @@map("auth_sessions")
}
```

```prisma
// apps/billing/prisma/schema.prisma
model Invoice {
  id       String @id @default(cuid())
  amount   Decimal
  status   String
  tenant_id String? // Add this field

  @@index([tenant_id])
  @@map("billing_invoices")
}
```

**Important:** Always add `tenant_id String?` even if you don't use
multi-tenancy yet. This future-proofs your schema for when you need it.

## 🔧 Framework Integration

### Express

```typescript
import express from 'express';
import { database, createMiddleware } from '@voilajsx/appkit/db';

const app = express();

// Automatic tenant detection
app.use(
  createMiddleware(database, {
    tenantHeader: 'x-tenant-id',
    tenantRequired: true,
  })
);

app.get('/users', async (req, res) => {
  const users = await req.db.user.findMany();
  res.json(users);
});
```

### Fastify

```typescript
import Fastify from 'fastify';
import { database, fastifyPlugin } from '@voilajsx/appkit/db';

const fastify = Fastify();

// Register AppKit database plugin
await fastify.register(
  fastifyPlugin(database, {
    tenantHeader: 'x-tenant-id',
    autoCreate: true,
  })
);

fastify.get('/users', async (request, reply) => {
  const users = await request.db.user.findMany();
  return { users, tenant: request.tenantId };
});
```

### Koa

```typescript
import Koa from 'koa';
import { database, koaMiddleware } from '@voilajsx/appkit/db';

const app = new Koa();

// Add tenant middleware
app.use(
  koaMiddleware(database, {
    tenantRequired: true,
  })
);

app.use(async (ctx, next) => {
  if (ctx.path === '/users') {
    const users = await ctx.request.db.user.findMany();
    ctx.body = { users, tenant: ctx.request.tenantId };
  }
  await next();
});
```

## 🚀 Migration from Other Solutions

### From Direct Prisma

```typescript
// Before: Direct Prisma import
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const users = await prisma.user.findMany();

// After: AppKit Database
import { database } from '@voilajsx/appkit/db';
const db = await database.get();
const users = await db.user.findMany();
```

### From Manual Multi-Tenancy

```typescript
// Before: Manual tenant filtering everywhere
const users = await prisma.user.findMany({
  where: {
    tenant_id: tenantId,
    status: 'active',
  },
});

// After: Automatic tenant filtering
const tenantDB = await database.tenant(tenantId);
const users = await tenantDB.user.findMany({
  where: { status: 'active' }, // tenant_id automatically added
});
```

### From Multiple Database Connections

```typescript
// Before: Manual connection management
const getOrgDatabase = (orgId) => {
  const url = `postgresql://localhost:5432/${orgId}_db`;
  return new PrismaClient({ datasources: { db: { url } } });
};

// After: Automatic org management
const orgDB = await database.org('acme-corp').get();
```

## 📊 Performance

- **Auto-discovery**: Runs once at startup, cached thereafter
- **Client caching**: Database clients cached per app/org/tenant combination
- **Memory usage**: <2MB additional overhead per app
- **Connection pooling**: Handled by underlying adapters (Prisma/Mongoose)
- **Startup time**: <100ms additional for auto-discovery

## 🛡️ Error Handling

AppKit provides helpful, actionable error messages:

```typescript
// Missing tenant mode
await database.tenant('team-alpha');
// Error: Tenant mode not enabled.
// Enable: VOILA_DB_TENANTS=true
// Or use: database.get()

// Wrong API usage
await database.tenant('team-alpha'); // When orgs are enabled
// Error: Cannot use database.tenant() when organizations are enabled.
// Use: database.org('org-id').tenant('tenant-id')
// Or disable orgs: VOILA_DB_ORGS=false

// Missing Prisma client
await database.get(); // In /apps/auth/ without generated client
// Error: Prisma client not found for app 'auth'.
// To fix this:
// 1. Run: cd apps/auth && npx prisma generate
// 2. Or ensure client exists at: apps/auth/prisma/generated/client/
```

## 📈 Best Practices

### Model Organization

```typescript
// ✅ Good: One model per file, use auto-detection
export const UserModel = {
  async create(userData: any) {
    const db = await database.get(); // Auto-detects current app
    return await db.user.create({ data: userData });
  },
};
```

### Environment Configuration

```typescript
// ✅ Good: Set once at app startup or use environment variables
// In .env file:
DATABASE_URL=postgresql://localhost:5432/myapp
VOILA_DB_TENANTS=true

// ✅ Good: Or configure programmatically (rare)
database.configure('postgresql://localhost:5432/myapp');
```

### Multi-Tenant Routes

```typescript
// ✅ Good: Extract tenant from request headers
router.get('/users', async (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  const db = await database.tenant(tenantId);
  const users = await db.user.findMany();
  res.json({ users, tenant: tenantId });
});

// ✅ Better: Use middleware for automatic detection
app.use(createMiddleware(database));
router.get('/users', async (req, res) => {
  const users = await req.db.user.findMany(); // Auto-filtered
  res.json({ users, tenant: req.tenantId });
});
```

### Schema Design

```typescript
// ✅ Good: Always add tenant_id for future-proofing
model User {
  id       String @id @default(cuid())
  email    String @unique
  name     String
  tenant_id String? // Always add this field

  @@index([tenant_id]) // Important for performance
}

// ❌ Avoid: Missing tenant_id field
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String
  // Missing tenant_id - hard to add later
}
```

## 🔍 Troubleshooting

### App Not Found

```bash
Error: Prisma client not found for app 'auth'. Available: none

# Solutions:
1. Run: cd apps/auth && npx prisma generate
2. Check directory structure: /apps/auth/prisma/generated/client/
3. Verify file exists: apps/auth/prisma/schema.prisma
```

### Database Connection Issues

```bash
Error: Database URL required. Set DATABASE_URL environment variable

# Solutions:
1. Add to .env file: DATABASE_URL=postgresql://localhost:5432/myapp
2. Check .env file location (should be in project root)
3. Restart your application after adding .env
```

### Multi-Tenant Query Issues

```bash
Error: Unknown field `tenant_id` on model `User`

# Solutions:
1. Add tenant_id field to your Prisma schema:
   tenant_id String?
   @@index([tenant_id])
2. Run: npx prisma db push
3. Or use single-tenant mode: database.get()
```

### API Usage Errors

```bash
Error: Cannot use database.tenant() when organizations are enabled.

# Solutions:
1. Use: database.org('org-id').tenant('tenant-id')
2. Or disable orgs: VOILA_DB_ORGS=false
3. Or use org-only: database.org('org-id').get()
```

## 🎯 API Reference

### Core Methods

```typescript
// Get database client (auto-detects current app)
const db = await database.get();

// Get tenant-specific client (when VOILA_DB_TENANTS=true, VOILA_DB_ORGS=false)
const tenantDB = await database.tenant('tenant-id');

// Get organization client (when VOILA_DB_ORGS=true)
const orgDB = await database.org('org-id').get();

// Get org + tenant client (when both enabled)
const orgTenantDB = await database.org('org-id').tenant('tenant-id');
```

### Utility Methods

```typescript
// Health check
const health = await database.health();

// List discovered apps
const apps = await database.apps();

// Configure database URL (rare - usually use env vars)
database.configure('postgresql://localhost:5432/myapp');
```

### Middleware

```typescript
// Universal middleware (works with Express, Fastify, Koa)
import { createMiddleware } from '@voilajsx/appkit/db';

app.use(
  createMiddleware(database, {
    tenantHeader: 'x-tenant-id', // Header name for tenant ID
    tenantRequired: true, // Require tenant ID
    orgHeader: 'x-org-id', // Header name for org ID
    orgRequired: false, // Org ID optional
    autoCreate: true, // Auto-create missing tenants/orgs
  })
);
```

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md).

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ for developers who value simplicity and power<br>
  <a href="https://github.com/voilajsx/appkit">⭐ Star us on GitHub</a>
</p>
