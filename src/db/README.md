# @voilajsx/appkit - Database Module 💾

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple database wrapper with auto-discovery, app isolation, and optional
> multi-tenancy

The Database module provides **one simple API** - `database.get()` for
single-tenant and `database.tenant(id)` for multi-tenant. Zero configuration
needed, auto-discovers your apps and Prisma clients, production-ready by
default.

## 🚀 Why Choose This?

- **⚡ One Simple API** - `database.get()` and `database.tenant()` - that's it!
- **🔍 Auto-Discovery** - Finds your apps and Prisma clients automatically
- **🎯 App Isolation** - Each app uses its own Prisma schema and client
- **🔧 Zero Configuration** - Just works with environment variables
- **🏢 Optional Multi-Tenancy** - Enable when needed, simple when not
- **🌍 Environment-First** - Smart defaults from `DATABASE_URL`
- **📦 Production-Ready** - Built-in caching, cleanup, and error handling

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

### Single-Tenant (Simple Database Access)

```javascript
import { database } from '@voilajsx/appkit/db';

// Configure once (optional - can use DATABASE_URL env var)
database.configure('postgresql://localhost:5432/myapp');

// Get database client (auto-detects app from file path)
const client = await database.get();
const users = await client.user.findMany();
```

### Multi-Tenant (Automatic Tenant Isolation)

```javascript
import { database } from '@voilajsx/appkit/db';

// Configure once
database.configure('postgresql://localhost:5432/myapp');

// Get tenant-specific client (auto-filters all queries)
const tenantClient = await database.tenant('acme-corp');
const users = await tenantClient.user.findMany(); // Only returns acme-corp users
```

**That's it!** Auto-discovery + app isolation + optional multi-tenancy in 2
simple functions.

## 🎯 Core API

### Single-Tenant Mode

```javascript
import { database } from '@voilajsx/appkit/db';

// Auto-detects app from file path (/apps/auth/ → 'auth')
const client = await database.get();

// Explicit app name
const authClient = await database.get('auth');
const analyticsClient = await database.get('analytics');

// Use like normal Prisma
const users = await authClient.user.findMany();
```

### Multi-Tenant Mode

```javascript
import { database } from '@voilajsx/appkit/db';

// Auto-detects app, applies tenant filtering
const tenantClient = await database.tenant('tenant-123');

// Explicit app + tenant
const authTenant = await database.tenant('tenant-123', 'auth');

// All queries automatically filtered by tenant
const users = await tenantClient.user.findMany(); // Only tenant-123 users
const posts = await tenantClient.post.create({
  data: { title: 'Hello' }, // Automatically adds tenantId: 'tenant-123'
});
```

### Utility Methods

```javascript
// Health check
const health = await database.health();

// List discovered apps
const apps = await database.apps(); // ['auth', 'analytics', 'billing']
```

## 🗂️ Directory Structure

The module auto-discovers apps in this structure:

```
your-project/
├── apps/
│   ├── auth/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── generated/client/index.js  ✅ Auto-discovered
│   │   └── backend/
│   ├── analytics/
│   │   ├── prisma/
│   │   │   └── generated/client/index.js  ✅ Auto-discovered
│   │   └── backend/
│   └── billing/
│       ├── prisma/
│       │   └── generated/client/index.js  ✅ Auto-discovered
│       └── backend/
├── package.json
└── .env
```

## 💡 Real-World Examples

### User Model (Single-Tenant)

```javascript
/**
 * User Model with auto-detection
 * @file /apps/auth/backend/user/user.model.js
 */
import { database } from '@voilajsx/appkit/db';

// Configure once
database.configure('postgresql://localhost:5432/myapp');

export const UserModel = {
  async create(userData) {
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

  async findById(userId) {
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

```javascript
/**
 * Multi-tenant API with Express
 * @file /apps/auth/routes/users.js
 */
import express from 'express';
import { database } from '@voilajsx/appkit/db';

const router = express.Router();

// Single endpoint serves all tenants
router.get('/users', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'];

    // Get tenant-specific database (auto-detects 'auth' app)
    const db = await database.tenant(tenantId);

    // All queries auto-filtered by tenant
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    res.json({ users, tenant: tenantId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'];
    const db = await database.tenant(tenantId);

    // tenantId automatically added to new records
    const user = await db.user.create({
      data: req.body,
    });

    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Cross-App Operations

```javascript
/**
 * Analytics service accessing multiple apps
 * @file /apps/analytics/services/metrics.js
 */
import { database } from '@voilajsx/appkit/db';

export const MetricsService = {
  async getDashboardStats(tenantId) {
    // Access different apps for the same tenant
    const authDB = await database.tenant(tenantId, 'auth');
    const billingDB = await database.tenant(tenantId, 'billing');
    const analyticsDB = await database.tenant(tenantId, 'analytics');

    // Aggregate data across apps
    const [userCount, orderCount, eventCount] = await Promise.all([
      authDB.user.count(),
      billingDB.order.count(),
      analyticsDB.event.count(),
    ]);

    return {
      tenant: tenantId,
      metrics: {
        users: userCount,
        orders: orderCount,
        events: eventCount,
      },
    };
  },

  async getAppsList() {
    // Discover all available apps
    const apps = await database.apps();
    return apps; // ['auth', 'analytics', 'billing']
  },
};
```

## 🌍 Environment Configuration

### Simple Setup

```bash
# Just set your database URL
DATABASE_URL="postgresql://localhost:5432/myapp"
```

### Advanced Setup

```bash
# Database connection
DATABASE_URL="postgresql://localhost:5432/myapp"

# Or use appkit-specific variables
VOILA_DATABASE_URL="postgresql://localhost:5432/myapp"

# Custom apps directory (optional)
VOILA_APPS_DIR="/custom/path/to/apps"

# App-specific databases (if needed)
VOILA_AUTH_DATABASE_URL="postgresql://localhost:5432/auth_db"
VOILA_ANALYTICS_DATABASE_URL="postgresql://localhost:5432/analytics_db"
```

## 🏢 Multi-Tenancy Features

### Automatic Tenant Isolation

When you use `database.tenant(id)`, the module automatically:

1. **Adds tenant ID** to all create/update operations
2. **Filters all queries** to only return tenant's data
3. **Handles complex queries** (AND, OR clauses)
4. **Isolates by app** - each app manages its own tenant data

### Tenant Schema Requirements

Add a `tenantId` field to your Prisma models:

```prisma
// prisma/schema.prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  name     String
  tenantId String // Add this field

  @@index([tenantId])
  @@map("auth_users")
}

model Post {
  id       String @id @default(cuid())
  title    String
  content  String
  tenantId String // Add this field

  @@index([tenantId])
  @@map("blog_posts")
}
```

## 🔧 App Isolation Features

### Separate Schemas per App

Each app maintains its own:

- **Prisma schema** (`/apps/{app}/prisma/schema.prisma`)
- **Migrations** (`/apps/{app}/prisma/migrations/`)
- **Generated client** (`/apps/{app}/prisma/generated/client/`)
- **Database tables** (with app prefixes like `auth_users`, `blog_posts`)

### Auto-Detection

The module automatically:

1. **Scans `/apps` directory** for Prisma clients
2. **Detects current app** from file path
3. **Loads correct client** for each app
4. **Caches clients** for performance

## 🚀 Migration from Other Solutions

### From Direct Prisma

```javascript
// Before: Direct Prisma import
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const users = await prisma.user.findMany();

// After: AppKit Database
import { database } from '@voilajsx/appkit/db';
const db = await database.get();
const users = await db.user.findMany();
```

### From VoilaJS AppKit v1

```javascript
// Before: Complex configuration
import { database } from '@voilajsx/appkit/db';
const db = database.get({
  database: { url: 'postgresql://...', adapter: 'prisma' },
  adapter: { type: 'prisma', client: PrismaClient },
});
const client = await db.client();

// After: Simple configuration
import { database } from '@voilajsx/appkit/db';
database.configure('postgresql://...');
const client = await database.get();
```

## 📊 Performance

- **Auto-discovery**: Runs once at startup, cached thereafter
- **Client caching**: Prisma clients cached per app for reuse
- **Memory usage**: <2MB additional overhead per app
- **Connection pooling**: Handled by Prisma (configurable)
- **Startup time**: <100ms additional for auto-discovery

## 🛡️ Error Handling

The module uses AppKit's standard error system:

```javascript
import { database } from '@voilajsx/appkit/db';
import { createDatabaseError } from '@voilajsx/appkit/db/defaults';

try {
  const client = await database.get('nonexistent-app');
} catch (error) {
  console.log(error.statusCode); // 500
  console.log(error.message); // "App 'nonexistent-app' not found"
}

// In your models, use standard error creation
export const UserModel = {
  async create(userData) {
    try {
      const db = await database.get();
      return await db.user.create({ data: userData });
    } catch (error) {
      if (error.code === 'P2002') {
        throw createDatabaseError('Email already registered', 409);
      }
      throw createDatabaseError('Failed to create user', 500);
    }
  },
};
```

## 📈 Best Practices

### Model Organization

```javascript
// ✅ Good: One model per file, use auto-detection
export const UserModel = {
  async create(userData) {
    const db = await database.get(); // Auto-detects current app
    return await db.user.create({ data: userData });
  },
};
```

### Configuration

```javascript
// ✅ Good: Configure once at app startup
database.configure('postgresql://localhost:5432/myapp');

// ✅ Good: Or use environment variables
// DATABASE_URL=postgresql://localhost:5432/myapp
```

### Multi-Tenant Routes

```javascript
// ✅ Good: Extract tenant ID from request
router.get('/users', async (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  const db = await database.tenant(tenantId);
  const users = await db.user.findMany();
  res.json({ users, tenant: tenantId });
});
```

## 🔍 Troubleshooting

### App Not Found

```bash
Error: App 'auth' not found. Available: none

# Solutions:
1. Run: npx prisma generate (in /apps/auth/)
2. Check directory structure: /apps/auth/prisma/generated/client/
3. Set VOILA_APPS_DIR if using custom structure
```

### Database Connection Issues

```bash
Error: Database URL not found for auth

# Solutions:
1. Set DATABASE_URL environment variable
2. Use database.configure('your-url')
3. Check .env file location
```

### Multi-Tenant Query Issues

```bash
Error: Unknown field `tenantId` on model `User`

# Solutions:
1. Add tenantId field to your Prisma schema
2. Run: npx prisma migrate dev
3. Or use single-tenant mode: database.get()
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
