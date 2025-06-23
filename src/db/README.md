# @voilajsx/appkit - Database Module 💾

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> Ultra-simple database wrapper with auto-discovery, app isolation,
> enterprise-grade organization routing, and progressive multi-tenancy

The Database module provides **three simple methods** - `database.get()`,
`database.tenant()`, and `database.org()` - that automatically handle app
detection, tenant isolation, and **enterprise organization management with
flexible database routing**. Zero configuration needed, production-ready by
default.

## 🚀 Why Choose AppKit Database?

- **⚡ 3 Simple Methods** - `get()`, `tenant()`, `org()` - covers all use cases
- **🔍 Auto-Discovery** - Detects your apps and Prisma clients automatically
- **🎯 App Isolation** - Each app uses its own Prisma schema and client
- **🏢 Enterprise Organization Routing** - Custom database mapping with fault
  tolerance
- **🏢 Progressive Multi-Tenancy** - Start simple, add orgs/tenants when needed
- **🔧 Zero Configuration** - Just 3 environment variables
- **🌍 Framework Agnostic** - Works with Express, Fastify, Koa, etc.
- **📦 Production-Ready** - Built-in caching, cleanup, error handling, and
  circuit breakers

## 🏢 Enterprise Organization Features

### **Flexible Database Routing per Organization**

- **Multi-cloud deployment**: Each org can use different cloud providers
- **On-premise hybrid**: Mix cloud and on-premise databases seamlessly
- **Custom URL resolution**: Complete control over org → database mapping
- **Fault tolerance**: Circuit breakers, exponential backoff, and graceful
  fallbacks
- **Enterprise monitoring**: Built-in metrics, health checks, and debug logging

### **Deployment Flexibility**

```bash
# Single server with org databases
DATABASE_URL=postgresql://localhost:5432/{org}_db

# Multi-cloud per organization
DATABASE_URL=postgresql://{org}.rds.amazonaws.com:5432/prod

# Custom resolver for complex routing
# Use orgUrlResolver function for enterprise directory integration
```

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

## 🏢 Enterprise Organization Routing

### **Flexible URL Resolution Patterns**

#### 1. **Simple Pattern-Based Routing**

```bash
# Database per organization with placeholder
DATABASE_URL=postgresql://localhost:5432/{org}_database
VOILA_DB_ORGS=true

# Results in:
# acme-corp → postgresql://localhost:5432/acme_corp_database
# tech-inc → postgresql://localhost:5432/tech_inc_database
```

#### 2. **Multi-Cloud Enterprise Routing**

```typescript
// Custom resolver for enterprise deployments
import { database, getSmartDefaults } from '@voilajsx/appkit/db';

const config = {
  ...getSmartDefaults(),
  orgUrlResolver: async (orgId: string) => {
    // Fetch org config from enterprise directory
    const orgConfig = await enterpriseDirectory.getOrgConfig(orgId);

    switch (orgConfig.cloudProvider) {
      case 'aws':
        return `postgresql://${orgId}.rds.amazonaws.com:5432/prod`;
      case 'azure':
        return `postgresql://${orgId}.postgres.database.azure.com:5432/prod`;
      case 'gcp':
        return `postgresql://${orgId}.sql.gcp.com:5432/prod`;
      case 'onpremise':
        return `postgresql://onprem-${orgConfig.region}.company.com:5432/${orgId}`;
      default:
        throw new Error(
          `Unsupported cloud provider: ${orgConfig.cloudProvider}`
        );
    }
  },
  orgUrlCacheTTL: 5 * 60 * 1000, // 5-minute cache
};

// Use with custom config
const orgDB = await database.org('acme-corp').get();
```

#### 3. **Hybrid Deployment Examples**

```typescript
// Example: Mix of cloud providers based on org tier
const orgUrlResolver = async (orgId: string) => {
  const org = await getOrgDetails(orgId);

  if (org.tier === 'enterprise') {
    // Dedicated AWS RDS for enterprise customers
    return `postgresql://${orgId}.cluster-xxx.us-east-1.rds.amazonaws.com:5432/prod`;
  } else if (org.region === 'eu') {
    // EU customers on Azure for compliance
    return `postgresql://${orgId}.postgres.database.azure.com:5432/prod`;
  } else {
    // Standard customers on shared infrastructure
    return `postgresql://shared-db.company.com:5432/${orgId}_db`;
  }
};
```

### **Enterprise Features & Monitoring**

#### Built-in Fault Tolerance

- **Circuit Breakers**: Automatic failure isolation per organization
- **Exponential Backoff**: Smart retry logic with increasing delays
- **Graceful Fallbacks**: Multiple layers of URL resolution fallbacks
- **Connection Pooling**: Efficient resource management per organization

#### Production Monitoring

```typescript
// Get comprehensive metrics
const metrics = await database.getOrgResolverMetrics();
console.log({
  cacheHitRate: metrics.cacheStats.hitRate,
  averageResolveTime: metrics.averageResolveTime,
  circuitBreakerStatus: metrics.circuitBreakerStatus,
  totalOrgsResolved: metrics.totalResolves,
});

// Health check for specific organization
const health = await database.checkOrgHealth('acme-corp');
console.log({
  healthy: health.healthy,
  latency: health.latency,
  source: health.source, // 'resolver' | 'fallback' | 'cache'
});
```

#### Debug & Development Logs

```bash
# Development mode shows detailed resolution logs
NODE_ENV=development

# Sample output:
[AppKit OrgResolver] Cache miss for org 'acme-corp', resolving...
[AppKit OrgResolver] Resolver attempt 1/3 for org 'acme-corp'
[AppKit OrgResolver] ✅ Resolved org 'acme-corp' via custom resolver (245ms)
[AppKit OrgResolver] 🎯 Org 'acme-corp' resolved to database via resolver (245ms)
```

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

# Enterprise multi-cloud mode (custom resolver)
DATABASE_URL=postgresql://fallback:5432/default  # Fallback only
VOILA_DB_ORGS=true
VOILA_DB_TENANTS=true
# + Custom orgUrlResolver function in code
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

### Enterprise URL Patterns

```bash
# Pattern 1: Database-per-organization with placeholder
DATABASE_URL=postgresql://localhost:5432/{org}_database
VOILA_DB_ORGS=true

# Pattern 2: Multi-cloud with subdomain per org
DATABASE_URL=postgresql://{org}.rds.amazonaws.com:5432/prod
VOILA_DB_ORGS=true

# Pattern 3: Region-based routing
DATABASE_URL=postgresql://{org}-{region}.database.company.com:5432/prod
VOILA_DB_ORGS=true

# Pattern 4: MongoDB multi-tenancy
DATABASE_URL=mongodb://localhost:27017/{org}_db
VOILA_DB_ORGS=true
VOILA_DB_TENANTS=true

# Pattern 5: Custom resolver (no URL placeholder needed)
DATABASE_URL=postgresql://fallback:5432/default  # Fallback only
VOILA_DB_ORGS=true
# Use orgUrlResolver function for complex routing logic
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

### Enterprise Multi-Organization Setup

```typescript
/**
 * Enterprise organization service with custom routing
 * @file /apps/core/src/services/org-service.ts
 */
import { database, getSmartDefaults } from '@voilajsx/appkit/db';

// Configure custom organization URL resolver
const orgUrlResolver = async (orgId: string) => {
  try {
    // Fetch org configuration from enterprise directory
    const orgConfig = await enterpriseAPI.getOrganization(orgId);

    if (!orgConfig) {
      throw new Error(`Organization '${orgId}' not found in directory`);
    }

    // Route based on organization tier and compliance requirements
    switch (orgConfig.tier) {
      case 'enterprise':
        // Dedicated infrastructure for enterprise customers
        return `postgresql://${orgId}.dedicated.company.com:5432/prod`;

      case 'business':
        // Shared infrastructure with dedicated databases
        return `postgresql://business.cluster.company.com:5432/${orgId}_db`;

      case 'startup':
        // Multi-tenant shared database
        return `postgresql://shared.company.com:5432/multitenant`;

      default:
        throw new Error(`Unknown organization tier: ${orgConfig.tier}`);
    }
  } catch (error: any) {
    // Log error for monitoring
    console.error(`Failed to resolve URL for org '${orgId}':`, error.message);
    throw error; // Re-throw to trigger fallback
  }
};

export const OrgService = {
  async getOrgDatabase(orgId: string, tenantId?: string) {
    if (tenantId) {
      // Get tenant-specific database within organization
      return await database.org(orgId).tenant(tenantId);
    } else {
      // Get organization-wide database
      return await database.org(orgId).get();
    }
  },

  async createOrganization(orgData: any) {
    // Validate organization data
    const { id, name, tier, region } = orgData;

    // Register in enterprise directory first
    await enterpriseAPI.createOrganization({ id, name, tier, region });

    // Database will be created on first access via URL resolver
    const orgDB = await database.org(id).get();

    // Initialize organization schema/data
    await orgDB.organization.create({
      data: { id, name, tier, region, createdAt: new Date() },
    });

    return { success: true, orgId: id };
  },

  async getOrganizationHealth(orgId: string) {
    try {
      const startTime = Date.now();
      const db = await database.org(orgId).get();

      // Test database connectivity
      await db.$queryRaw`SELECT 1`;

      return {
        orgId,
        healthy: true,
        latency: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        orgId,
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },
};
```

### Multi-Tenant API with Organization Context

```typescript
/**
 * Multi-tenant API with automatic organization and tenant detection
 * @file /apps/api/src/routes/users.ts
 */
import express from 'express';
import { database, createMiddleware } from '@voilajsx/appkit/db';

const router = express.Router();

// Automatic org/tenant detection middleware
router.use(
  createMiddleware(database, {
    orgHeader: 'x-org-id',
    orgRequired: true,
    tenantHeader: 'x-tenant-id',
    tenantRequired: true,
    autoCreate: false, // Don't auto-create in production
    extractOrg: (req) => {
      // Custom org extraction logic
      return req.user?.organizationId || req.subdomain;
    },
  })
);

// Routes automatically get org/tenant context
router.get('/users', async (req, res) => {
  try {
    // req.db is automatically configured for the org/tenant
    const users = await req.db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      users,
      context: {
        organization: req.orgId,
        tenant: req.tenantId,
        total: users.length,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      organization: req.orgId,
      tenant: req.tenantId,
    });
  }
});

router.post('/users', async (req, res) => {
  try {
    // tenant_id and org context automatically handled
    const user = await req.db.user.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        role: req.body.role || 'user',
      },
    });

    res.status(201).json({
      user,
      context: {
        organization: req.orgId,
        tenant: req.tenantId,
      },
    });
  } catch (error: any) {
    console.error('Failed to create user:', error);
    res.status(500).json({
      error: 'Failed to create user',
      details: error.message,
    });
  }
});

// Dynamic tenant switching within organization
router.post('/switch-tenant', async (req, res) => {
  try {
    const { tenantId } = req.body;

    // Switch to different tenant within same organization
    const newDb = await req.switchTenant(tenantId);
    const users = await newDb.user.count();

    res.json({
      switched: true,
      organization: req.orgId,
      previousTenant: req.tenantId,
      newTenant: tenantId,
      userCount: users,
    });
  } catch (error: any) {
    res.status(400).json({
      error: 'Failed to switch tenant',
      details: error.message,
    });
  }
});

export default router;
```

### Enterprise Monitoring & Health Checks

```typescript
/**
 * Enterprise monitoring service
 * @file /apps/monitoring/src/services/database-monitor.ts
 */
import { database } from '@voilajsx/appkit/db';

export class DatabaseMonitor {
  async getSystemHealth() {
    try {
      // Get overall system health
      const systemHealth = await database.health();

      // Get organization resolver metrics
      const resolverMetrics = await this.getOrgResolverMetrics();

      // Test sample organizations
      const orgHealthChecks = await this.checkSampleOrgs();

      return {
        timestamp: new Date().toISOString(),
        system: systemHealth,
        resolver: resolverMetrics,
        organizations: orgHealthChecks,
        overall: {
          healthy:
            systemHealth.healthy && orgHealthChecks.every((org) => org.healthy),
          issues: orgHealthChecks.filter((org) => !org.healthy).length,
        },
      };
    } catch (error: any) {
      return {
        timestamp: new Date().toISOString(),
        healthy: false,
        error: error.message,
      };
    }
  }

  private async getOrgResolverMetrics() {
    // This would be exposed by the database module
    return {
      cacheSize: 0, // Number of cached org URLs
      hitRate: 0, // Cache hit percentage
      avgResolveTime: 0, // Average resolution time in ms
      circuitBreakers: [], // Open circuit breakers
    };
  }

  private async checkSampleOrgs() {
    const sampleOrgs = ['acme-corp', 'tech-inc', 'startup-xyz'];

    const healthChecks = await Promise.allSettled(
      sampleOrgs.map(async (orgId) => {
        const startTime = Date.now();
        try {
          const db = await database.org(orgId).get();
          await db.$queryRaw`SELECT 1`; // Quick connectivity test

          return {
            orgId,
            healthy: true,
            latency: Date.now() - startTime,
          };
        } catch (error: any) {
          return {
            orgId,
            healthy: false,
            latency: Date.now() - startTime,
            error: error.message,
          };
        }
      })
    );

    return healthChecks.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : {
            orgId: 'unknown',
            healthy: false,
            error: result.reason?.message || 'Unknown error',
          }
    );
  }

  async reportMetrics() {
    const health = await this.getSystemHealth();

    // Send to your monitoring system (Datadog, New Relic, etc.)
    await this.sendToMonitoring('database.health', health);

    // Alert on issues
    if (!health.overall.healthy) {
      await this.sendAlert({
        severity: 'high',
        message: `Database health issues detected: ${health.overall.issues} organizations unhealthy`,
        details: health,
      });
    }

    return health;
  }

  private async sendToMonitoring(metric: string, data: any) {
    // Implementation depends on your monitoring stack
    console.log(`📊 [Monitoring] ${metric}:`, data);
  }

  private async sendAlert(alert: any) {
    // Implementation depends on your alerting system
    console.error(`🚨 [Alert] ${alert.message}`, alert.details);
  }
}
```

## 🏢 Multi-Tenancy Features

### Automatic Tenant Isolation

When you use `database.tenant(id)`, the module automatically:

1. **Adds tenant_id** to all create/update operations
2. **Filters all queries** to only return tenant's data
3. **Handles complex queries** (AND, OR clauses)
4. **Isolates by app** - each app manages its own tenant data
5. **Works with organizations** - tenants are scoped within orgs

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

## 🔍 Vector Search & AI Support

AppKit Database includes built-in support for vector embeddings and semantic
search using PostgreSQL's pgvector extension. Perfect for AI applications, RAG
systems, and semantic search.

### **Quick Start - Vector Operations**

```typescript
import { database } from '@voilajsx/appkit/db';

// Enable vector support
// .env: VOILA_DB_VECTORS=true

// Get vector-enabled database (same connection as regular operations)
const vectorDB = await database.vectors();

// Create vector table
await vectorDB.$executeRaw`
  CREATE EXTENSION IF NOT EXISTS vector;
  
  CREATE TABLE documents (
    id serial primary key,
    content text,
    embedding vector(1536),
    tenant_id text,
    created_at timestamp default now()
  );
  
  CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);
`;
```

### **Multi-Tenant Vector Search**

```typescript
// Organization + tenant vector isolation
const orgVectorDB = await database.org('acme-corp').vectors();
const tenantVectorDB = await database.tenant('team-alpha'); // Add vector tables

// Store embeddings with automatic tenant isolation
await tenantVectorDB.documents.create({
  data: {
    content: 'AppKit makes database management simple and powerful',
    embedding: await generateEmbedding(content), // Your embedding function
    tenant_id: 'team-alpha', // Automatically added by middleware
  },
});

// Semantic search with tenant filtering
const results = await tenantVectorDB.$queryRaw`
  SELECT content, 1 - (embedding <=> ${queryEmbedding}::vector) as similarity
  FROM documents 
  WHERE tenant_id = 'team-alpha'
  ORDER BY embedding <=> ${queryEmbedding}::vector
  LIMIT 5
`;
```

### **Vector Database Setup**

**Neon (Recommended):**

```bash
# Neon includes pgvector automatically
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb
VOILA_DB_VECTORS=true
```

**Any PostgreSQL Provider:**

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### **Environment Configuration**

```bash
# Required
DATABASE_URL=postgresql://your-connection-string

# Vector support
VOILA_DB_VECTORS=true           # Enable vector operations

# Multi-tenancy (optional)
VOILA_DB_ORGS=true             # Organization isolation
VOILA_DB_TENANTS=true          # Tenant isolation
```

### **Real-World AI Example**

```typescript
/**
 * AI-powered document search with tenant isolation
 */
class DocumentSearch {
  async indexDocument(content: string, tenantId: string) {
    const vectorDB = await database.tenant(tenantId);

    // Generate embedding (your AI service)
    const embedding = await this.generateEmbedding(content);

    // Store with automatic tenant filtering
    return await vectorDB.documents.create({
      data: { content, embedding },
    });
  }

  async semanticSearch(query: string, tenantId: string) {
    const vectorDB = await database.tenant(tenantId);
    const queryEmbedding = await this.generateEmbedding(query);

    // Tenant-isolated vector search
    return await vectorDB.$queryRaw`
      SELECT 
        content,
        1 - (embedding <=> ${queryEmbedding}::vector) as similarity
      FROM documents 
      WHERE tenant_id = ${tenantId}
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT 10
    `;
  }
}
```

### **Hybrid Search (Vector + SQL)**

```typescript
// Combine semantic search with traditional filters
const hybridResults = await vectorDB.$queryRaw`
  SELECT 
    d.content,
    d.created_at,
    u.name as author,
    1 - (d.embedding <=> ${queryEmbedding}::vector) as similarity
  FROM documents d
  JOIN users u ON d.author_id = u.id
  WHERE d.tenant_id = ${tenantId}
    AND d.created_at > ${lastWeek}
    AND u.department = 'engineering'
  ORDER BY d.embedding <=> ${queryEmbedding}::vector
  LIMIT 5
`;
```

### **Vector Features**

✅ **Same Database** - Vector tables alongside regular data ✅ **Automatic
Tenant Isolation** - Vector searches respect tenant boundaries  
✅ **Organization Support** - Separate vector data per organization ✅
**pgvector Compatible** - Standard PostgreSQL extension ✅ **Hybrid Queries** -
Combine vector search with SQL filters ✅ **Production Ready** - HNSW indexes
for fast similarity search

**Why Vectors in Your Database:**

- **Unified Data Model** - No separate vector database to manage
- **ACID Transactions** - Consistent data with your application state
- **Cost Effective** - One database bill instead of two
- **Simple Deployment** - Same connection, same backup strategy

## 🔧 Framework Integration

### Express

```typescript
import express from 'express';
import { database, createMiddleware } from '@voilajsx/appkit/db';

const app = express();

// Automatic org/tenant detection
app.use(
  createMiddleware(database, {
    orgHeader: 'x-org-id',
    orgRequired: true,
    tenantHeader: 'x-tenant-id',
    tenantRequired: true,
  })
);

app.get('/users', async (req, res) => {
  const users = await req.db.user.findMany();
  res.json({
    users,
    organization: req.orgId,
    tenant: req.tenantId,
  });
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
    orgHeader: 'x-org-id',
    tenantHeader: 'x-tenant-id',
    autoCreate: true,
  })
);

fastify.get('/users', async (request, reply) => {
  const users = await request.db.user.findMany();
  return {
    users,
    organization: request.orgId,
    tenant: request.tenantId,
  };
});
```

### Koa

```typescript
import Koa from 'koa';
import { database, koaMiddleware } from '@voilajsx/appkit/db';

const app = new Koa();

// Add org/tenant middleware
app.use(
  koaMiddleware(database, {
    orgRequired: true,
    tenantRequired: true,
  })
);

app.use(async (ctx, next) => {
  if (ctx.path === '/users') {
    const users = await ctx.request.db.user.findMany();
    ctx.body = {
      users,
      organization: ctx.request.orgId,
      tenant: ctx.request.tenantId,
    };
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
// Before: Manual connection management per organization
const getOrgDatabase = (orgId) => {
  const url = `postgresql://localhost:5432/${orgId}_db`;
  return new PrismaClient({ datasources: { db: { url } } });
};

// After: Automatic org management with enterprise routing
const orgDB = await database.org('acme-corp').get();
```

## 📊 Performance

- **Auto-discovery**: Runs once at startup, cached thereafter
- **Client caching**: Database clients cached per app/org/tenant combination
- **Organization URL caching**: 5-minute TTL with LRU eviction
- **Memory usage**: <2MB additional overhead per app
- **Connection pooling**: Handled by underlying adapters (Prisma/Mongoose)
- **Startup time**: <100ms additional for auto-discovery
- **URL resolution**: <50ms average with caching, <500ms cold resolution

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

// Organization resolution failures
await database.org('unknown-org').get();
// Error: Failed to resolve database URL for organization 'unknown-org'
// Fallback used: postgresql://localhost:5432/unknown_org_database
// Check your orgUrlResolver function or organization directory
```

## 📈 Best Practices

### Organization URL Resolver Design

```typescript
// ✅ Good: Robust resolver with error handling
const orgUrlResolver = async (orgId: string) => {
  try {
    // Always validate input
    if (!orgId || typeof orgId !== 'string') {
      throw new Error('Invalid organization ID');
    }

    // Fetch from authoritative source
    const orgConfig = await enterpriseDirectory.getOrgConfig(orgId);
    if (!orgConfig) {
      throw new Error(`Organization '${orgId}' not found`);
    }

    // Return appropriate URL based on org config
    return buildDatabaseUrl(orgConfig);
  } catch (error) {
    // Log for monitoring but let AppKit handle fallback
    console.error(`Org resolver error for '${orgId}':`, error);
    throw error; // Re-throw to trigger fallback
  }
};

// ❌ Avoid: Resolver that swallows errors silently
const badResolver = async (orgId: string) => {
  try {
    return await getOrgUrl(orgId);
  } catch {
    return 'postgresql://default:5432/fallback'; // Don't do this
  }
};
```

### Model Organization

```typescript
// ✅ Good: One model per file, use auto-detection
export const UserModel = {
  async create(userData: any) {
    const db = await database.get(); // Auto-detects current app
    return await db.user.create({ data: userData });
  },

  async createInOrg(orgId: string, tenantId: string, userData: any) {
    const db = await database.org(orgId).tenant(tenantId);
    return await db.user.create({ data: userData });
  },
};
```

### Environment Configuration

```typescript
// ✅ Good: Set once at app startup or use environment variables
// In .env file:
DATABASE_URL=postgresql://localhost:5432/myapp
VOILA_DB_ORGS=true
VOILA_DB_TENANTS=true

// ✅ Good: Or configure programmatically (rare)
database.configure('postgresql://localhost:5432/myapp');
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
4. Verify DATABASE_URL format is correct for your database provider
```

### Organization Resolution Issues

```bash
Error: Failed to resolve database URL for organization 'acme-corp'
Using fallback: postgresql://localhost:5432/acme_corp_database

# Solutions:
1. Check your orgUrlResolver function implementation
2. Verify organization exists in your enterprise directory
3. Test resolver function independently:
   const url = await orgUrlResolver('acme-corp');
4. Check network connectivity to organization's database
5. Verify organization configuration in enterprise systems
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
4. Run: npx prisma generate after schema changes
```

### API Usage Errors

```bash
Error: Cannot use database.tenant() when organizations are enabled.

# Solutions:
1. Use: database.org('org-id').tenant('tenant-id')
2. Or disable orgs: VOILA_DB_ORGS=false
3. Or use org-only: database.org('org-id').get()
```

### Organization URL Resolution Timeout

```bash
Error: Resolver timeout after 10000ms for organization 'slow-org'

# Solutions:
1. Optimize your orgUrlResolver function
2. Add caching to external API calls
3. Increase timeout (not recommended):
   orgUrlCacheTTL: 10 * 60 * 1000 // 10 minutes
4. Check external service availability
5. Consider using fallback URLs for problematic organizations
```

### Circuit Breaker Issues

```bash
Warning: Circuit breaker OPEN for 'failing-org', using fallback

# Solutions:
1. Check organization's database server status
2. Verify network connectivity
3. Fix issues with orgUrlResolver for that organization
4. Manually reset circuit breaker if needed (in development):
   await database.resetOrgCircuitBreaker('failing-org');
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

### Organization Management

```typescript
// Create organization (if using database-per-org strategy)
await database.createOrg('new-org-id', { confirm: true });

// Delete organization and all data (requires confirmation)
await database.deleteOrg('old-org-id', { confirm: true });

// Check if organization exists
const exists = await database.orgExists('org-id');

// List all organizations (limited to accessible orgs)
const orgs = await database.listOrgs();
```

### Tenant Management

```typescript
// Create tenant within organization
await database.createTenant('tenant-id', { orgId: 'org-id' });

// Delete tenant and all data (requires confirmation)
await database.deleteTenant('tenant-id', {
  orgId: 'org-id',
  confirm: true,
});

// Check if tenant exists
const exists = await database.exists('tenant-id', { orgId: 'org-id' });

// List tenants within organization
const tenants = await database.list({
  orgId: 'org-id',
  filter: (id) => id.startsWith('active-'),
  limit: 100,
});
```

### Utility Methods

```typescript
// Health check
const health = await database.health();
// Returns: { healthy: boolean, strategy: string, adapter: string,
//           org: boolean, tenant: boolean, connections: number }

// List discovered apps
const apps = await database.apps();
// Returns: string[] - array of discovered app names

// Configure database URL (rare - usually use env vars)
database.configure('postgresql://localhost:5432/myapp');

// Clear cached instances (for testing)
database._clearCache();
```

### Enterprise Organization Features

```typescript
// Get organization URL resolver metrics
const metrics = await database.getOrgResolverMetrics();
// Returns: { cacheSize, hitRate, avgResolveTime, circuitBreakerStatus }

// Health check specific organization
const orgHealth = await database.checkOrgHealth('org-id');
// Returns: { healthy: boolean, latency: number, source: string, error?: string }

// Force refresh organization URL (bypass cache)
const newUrl = await database.refreshOrgUrl('org-id');

// Clear organization URL cache
database.clearOrgCache('org-id'); // Specific org
database.clearOrgCache(); // All orgs

// Preload organizations for faster access
await database.preloadOrgs(['org-1', 'org-2', 'org-3']);

// Manual circuit breaker control (development/testing)
database.setOrgCircuitBreaker('org-id', 'open'); // Disable org
database.setOrgCircuitBreaker('org-id', 'closed'); // Re-enable org
```

### Middleware Configuration

```typescript
// Universal middleware (works with Express, Fastify, Koa)
import { createMiddleware } from '@voilajsx/appkit/db';

app.use(
  createMiddleware(database, {
    // Organization settings
    orgHeader: 'x-org-id', // Header name for org ID
    orgParam: 'orgId', // URL parameter name for org ID
    orgRequired: true, // Require org ID

    // Tenant settings
    tenantHeader: 'x-tenant-id', // Header name for tenant ID
    tenantParam: 'tenantId', // URL parameter name for tenant ID
    tenantRequired: true, // Require tenant ID

    // Behavior settings
    autoCreate: false, // Auto-create missing tenants/orgs

    // Custom extraction functions
    extractOrg: (req) => req.user?.organizationId,
    extractTenant: (req) => req.user?.tenantId,

    // Error handling
    onError: (error, req, res, next) => {
      console.error('Database middleware error:', error);
      res.status(error.statusCode || 500).json({
        error: 'Database error',
        message: error.message,
      });
    },
  })
);
```

### Advanced Configuration

```typescript
import { getSmartDefaults } from '@voilajsx/appkit/db';

// Get default configuration
const config = getSmartDefaults();

// Custom configuration with enterprise features
const enterpriseConfig = {
  ...config,

  // Custom organization URL resolver
  orgUrlResolver: async (orgId: string) => {
    const orgConfig = await enterpriseDirectory.getOrgConfig(orgId);
    return orgConfig.databaseUrl;
  },

  // URL resolution caching (5 minutes default)
  orgUrlCacheTTL: 5 * 60 * 1000,

  // Advanced options
  database: {
    ...config.database,
    // Override auto-detected settings
    strategy: 'org', // 'row' | 'org'
    adapter: 'prisma', // 'prisma' | 'mongoose'
    tenant: true, // Enable tenant mode
    org: true, // Enable organization mode
  },
};
```

## 🔧 Advanced Usage Patterns

### Dynamic Organization Creation

```typescript
/**
 * Enterprise organization provisioning service
 */
export class OrgProvisioningService {
  async provisionNewOrganization(orgData: {
    id: string;
    name: string;
    tier: 'startup' | 'business' | 'enterprise';
    region: string;
  }) {
    const { id, name, tier, region } = orgData;

    try {
      // Step 1: Register in enterprise directory
      await enterpriseDirectory.createOrganization({
        id,
        name,
        tier,
        region,
        databaseUrl: this.generateOrgDatabaseUrl(id, tier, region),
      });

      // Step 2: Create organization database (will use custom resolver)
      await database.createOrg(id, { confirm: true });

      // Step 3: Initialize organization with default data
      const orgDB = await database.org(id).get();
      await this.initializeOrgSchema(orgDB, orgData);

      // Step 4: Create default tenant
      await database.createTenant('default', { orgId: id });

      return {
        success: true,
        organization: { id, name, tier, region },
        databaseUrl: await this.getOrgDatabaseUrl(id),
      };
    } catch (error: any) {
      // Cleanup on failure
      await this.cleanupFailedProvisioning(id);
      throw new Error(
        `Failed to provision organization '${id}': ${error.message}`
      );
    }
  }

  private generateOrgDatabaseUrl(
    orgId: string,
    tier: string,
    region: string
  ): string {
    switch (tier) {
      case 'enterprise':
        return `postgresql://${orgId}.dedicated-${region}.company.com:5432/prod`;
      case 'business':
        return `postgresql://business-${region}.company.com:5432/${orgId}_db`;
      case 'startup':
        return `postgresql://shared-${region}.company.com:5432/multitenant`;
      default:
        throw new Error(`Unknown tier: ${tier}`);
    }
  }

  private async initializeOrgSchema(orgDB: any, orgData: any) {
    // Create organization record
    await orgDB.organization.create({
      data: {
        id: orgData.id,
        name: orgData.name,
        tier: orgData.tier,
        region: orgData.region,
        createdAt: new Date(),
        settings: {
          maxUsers: this.getMaxUsers(orgData.tier),
          maxTenants: this.getMaxTenants(orgData.tier),
        },
      },
    });

    // Create default admin user
    await orgDB.user.create({
      data: {
        email: `admin@${orgData.id}.company.com`,
        name: 'Organization Admin',
        role: 'admin',
        tenant_id: 'default',
      },
    });
  }

  private async cleanupFailedProvisioning(orgId: string) {
    try {
      await enterpriseDirectory.deleteOrganization(orgId);
      await database.deleteOrg(orgId, { confirm: true });
    } catch (cleanupError) {
      console.error(`Failed to cleanup organization '${orgId}':`, cleanupError);
    }
  }
}
```

### Multi-Tenant Data Migration

```typescript
/**
 * Enterprise data migration service for tenant onboarding
 */
export class TenantMigrationService {
  async migrateTenantToOrganization(
    fromOrgId: string,
    toOrgId: string,
    tenantId: string,
    options: {
      preserveOriginal?: boolean;
      batchSize?: number;
      dryRun?: boolean;
    } = {}
  ) {
    const {
      preserveOriginal = false,
      batchSize = 1000,
      dryRun = false,
    } = options;

    try {
      // Get source and destination databases
      const sourceDB = await database.org(fromOrgId).tenant(tenantId);
      const targetDB = await database.org(toOrgId).tenant(tenantId);

      if (dryRun) {
        return await this.analyzeMigration(sourceDB, targetDB, tenantId);
      }

      // Start migration transaction
      const migrationResult = await this.performMigration(
        sourceDB,
        targetDB,
        tenantId,
        batchSize
      );

      if (!preserveOriginal && migrationResult.success) {
        await this.cleanupSourceData(sourceDB, tenantId);
      }

      return migrationResult;
    } catch (error: any) {
      throw new Error(
        `Migration failed for tenant '${tenantId}': ${error.message}`
      );
    }
  }

  private async analyzeMigration(
    sourceDB: any,
    targetDB: any,
    tenantId: string
  ) {
    const analysis = {
      tenantId,
      sourceRecords: {},
      targetRecords: {},
      conflicts: [],
      estimatedTime: 0,
    };

    // Analyze each model
    const models = this.getModelsWithTenantField(sourceDB);

    for (const modelName of models) {
      const sourceCount = await sourceDB[modelName].count({
        where: { tenant_id: tenantId },
      });

      const targetCount = await targetDB[modelName].count({
        where: { tenant_id: tenantId },
      });

      analysis.sourceRecords[modelName] = sourceCount;
      analysis.targetRecords[modelName] = targetCount;

      if (targetCount > 0) {
        analysis.conflicts.push({
          model: modelName,
          existingRecords: targetCount,
        });
      }

      // Estimate migration time (rough calculation)
      analysis.estimatedTime += Math.ceil(sourceCount / 1000) * 5; // 5 seconds per 1000 records
    }

    return {
      dryRun: true,
      analysis,
      recommendation:
        analysis.conflicts.length === 0 ? 'safe' : 'review_conflicts',
    };
  }

  private async performMigration(
    sourceDB: any,
    targetDB: any,
    tenantId: string,
    batchSize: number
  ) {
    const migrationLog = {
      tenantId,
      startTime: new Date(),
      endTime: null,
      success: false,
      modelsProcessed: [],
      totalRecords: 0,
      errors: [],
    };

    try {
      const models = this.getModelsWithTenantField(sourceDB);

      for (const modelName of models) {
        await this.migrateModel(
          sourceDB,
          targetDB,
          modelName,
          tenantId,
          batchSize,
          migrationLog
        );
        migrationLog.modelsProcessed.push(modelName);
      }

      migrationLog.success = true;
      migrationLog.endTime = new Date();

      return migrationLog;
    } catch (error: any) {
      migrationLog.errors.push({
        message: error.message,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  private async migrateModel(
    sourceDB: any,
    targetDB: any,
    modelName: string,
    tenantId: string,
    batchSize: number,
    migrationLog: any
  ) {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await sourceDB[modelName].findMany({
        where: { tenant_id: tenantId },
        skip: offset,
        take: batchSize,
      });

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      // Insert batch into target database
      await targetDB[modelName].createMany({
        data: batch.map((record) => ({
          ...record,
          id: undefined, // Let target generate new IDs
          createdAt: record.createdAt || new Date(),
          tenant_id: tenantId,
        })),
        skipDuplicates: true,
      });

      migrationLog.totalRecords += batch.length;
      offset += batchSize;

      // Progress logging
      console.log(
        `Migrated ${offset} ${modelName} records for tenant ${tenantId}`
      );

      if (batch.length < batchSize) {
        hasMore = false;
      }
    }
  }

  private getModelsWithTenantField(db: any): string[] {
    return Object.keys(db).filter(
      (key) =>
        !key.startsWith('$') &&
        !key.startsWith('_') &&
        typeof db[key] === 'object' &&
        typeof db[key].findFirst === 'function'
    );
  }
}
```

### Enterprise Monitoring Dashboard

```typescript
/**
 * Real-time enterprise database monitoring
 */
export class EnterpriseDashboard {
  async getDashboardData() {
    const [systemHealth, orgMetrics, tenantMetrics, performanceMetrics] =
      await Promise.all([
        this.getSystemHealth(),
        this.getOrganizationMetrics(),
        this.getTenantMetrics(),
        this.getPerformanceMetrics(),
      ]);

    return {
      timestamp: new Date().toISOString(),
      system: systemHealth,
      organizations: orgMetrics,
      tenants: tenantMetrics,
      performance: performanceMetrics,
      alerts: await this.getActiveAlerts(),
    };
  }

  private async getSystemHealth() {
    const health = await database.health();
    const resolverMetrics = await database.getOrgResolverMetrics();

    return {
      overall: health.healthy,
      strategy: health.strategy,
      adapter: health.adapter,
      connections: health.connections,
      orgResolver: {
        cacheSize: resolverMetrics.cacheSize,
        hitRate: resolverMetrics.cacheStats.hitRate,
        avgResolveTime: resolverMetrics.averageResolveTime,
        circuitBreakers: resolverMetrics.circuitBreakerStatus.filter(
          (cb) => cb.status === 'open'
        ).length,
      },
    };
  }

  private async getOrganizationMetrics() {
    const orgs = await database.listOrgs();
    const orgHealthChecks = await Promise.allSettled(
      orgs.map(async (orgId) => {
        const health = await database.checkOrgHealth(orgId);
        const tenantCount = await this.getTenantCountForOrg(orgId);

        return {
          orgId,
          healthy: health.healthy,
          latency: health.latency,
          tenantCount,
          lastChecked: new Date().toISOString(),
        };
      })
    );

    const orgStats = orgHealthChecks
      .map((result) => (result.status === 'fulfilled' ? result.value : null))
      .filter(Boolean);

    return {
      total: orgs.length,
      healthy: orgStats.filter((org) => org.healthy).length,
      unhealthy: orgStats.filter((org) => !org.healthy).length,
      avgLatency:
        orgStats.reduce((sum, org) => sum + org.latency, 0) / orgStats.length,
      organizations: orgStats,
    };
  }

  private async getTenantMetrics() {
    const orgs = await database.listOrgs();
    let totalTenants = 0;
    const tenantDistribution = new Map();

    for (const orgId of orgs) {
      try {
        const tenants = await database.list({ orgId });
        totalTenants += tenants.length;
        tenantDistribution.set(orgId, tenants.length);
      } catch (error) {
        console.warn(`Failed to get tenants for org ${orgId}:`, error);
      }
    }

    return {
      total: totalTenants,
      avgPerOrg: totalTenants / orgs.length,
      distribution: Object.fromEntries(tenantDistribution),
    };
  }

  private async getPerformanceMetrics() {
    // This would integrate with your APM solution
    return {
      avgQueryTime: 0, // From APM
      slowQueries: [], // From APM
      connectionPoolUtilization: 0, // From database monitoring
      cacheEfficiency: 0, // From Redis/internal caches
    };
  }

  private async getTenantCountForOrg(orgId: string): Promise<number> {
    try {
      const tenants = await database.list({ orgId });
      return tenants.length;
    } catch {
      return 0;
    }
  }

  private async getActiveAlerts() {
    // Integration with your alerting system
    return [
      // Example alerts
      {
        id: 'alert-1',
        severity: 'warning',
        message: 'High latency detected for org acme-corp',
        timestamp: new Date().toISOString(),
      },
    ];
  }
}
```

## 🌟 Enterprise Deployment Examples

### Kubernetes Deployment with Organization-Specific Databases

```yaml
# kubernetes/database-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: database-config
data:
  DATABASE_URL: 'postgresql://fallback:5432/default'
  VOILA_DB_ORGS: 'true'
  VOILA_DB_TENANTS: 'true'
  NODE_ENV: 'production'

---
apiVersion: v1
kind: Secret
metadata:
  name: database-secrets
type: Opaque
stringData:
  ORG_RESOLVER_API_KEY: 'your-enterprise-directory-api-key'
  DATABASE_PASSWORD: 'your-database-password'

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: appkit-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: appkit-api
  template:
    metadata:
      labels:
        app: appkit-api
    spec:
      containers:
        - name: api
          image: your-company/appkit-api:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: database-config
            - secretRef:
                name: database-secrets
          env:
            - name: ORG_URL_RESOLVER_ENDPOINT
              value: 'https://enterprise-directory.company.com/api/v1/orgs'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/db
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Docker Compose for Multi-Organization Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Main application
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/{org}
      - VOILA_DB_ORGS=true
      - VOILA_DB_TENANTS=true
      - NODE_ENV=development
    depends_on:
      - postgres
      - org-directory
    volumes:
      - ./apps:/app/apps
      - ./prisma:/app/prisma

  # Main PostgreSQL (for shared/fallback)
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=appkit
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Organization-specific databases (simulating multi-cloud)
  postgres-acme:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=acme_corp
    ports:
      - '5433:5432'
    volumes:
      - postgres_acme_data:/var/lib/postgresql/data

  postgres-tech:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=tech_inc
    ports:
      - '5434:5432'
    volumes:
      - postgres_tech_data:/var/lib/postgresql/data

  # Mock enterprise directory service
  org-directory:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./mock-services/org-directory:/app
    command: npm start
    ports:
      - '3001:3000'
    environment:
      - ORGS_CONFIG_FILE=/app/orgs-config.json

volumes:
  postgres_data:
  postgres_acme_data:
  postgres_tech_data:
```

### AWS Multi-Region Enterprise Setup

```typescript
// infrastructure/aws-org-resolver.ts
export const createAWSEnterpriseResolver = (config: {
  region: string;
  crossRegionOrgs: string[];
  rdsClusterPrefix: string;
}) => {
  return async (orgId: string) => {
    // Fetch organization configuration from AWS Systems Manager
    const ssm = new AWS.SSM({ region: config.region });

    try {
      const orgConfigParam = await ssm
        .getParameter({
          Name: `/enterprise/orgs/${orgId}/database-config`,
          WithDecryption: true,
        })
        .promise();

      const orgConfig = JSON.parse(orgConfigParam.Parameter!.Value!);

      // Build RDS connection string based on org configuration
      const endpoint = `${config.rdsClusterPrefix}-${orgId}.cluster-${orgConfig.region}.rds.amazonaws.com`;

      return `postgresql://${orgConfig.username}:${orgConfig.password}@${endpoint}:5432/${orgConfig.database}`;
    } catch (error) {
      // Fallback to cross-region lookup
      if (config.crossRegionOrgs.includes(orgId)) {
        return await this.lookupCrossRegion(orgId);
      }

      throw new Error(`Organization '${orgId}' not found in AWS configuration`);
    }
  };
};
```

## 📚 Additional Resources

- **[Getting Started Guide](./docs/getting-started.md)** - Step-by-step setup
- **[Enterprise Deployment](./docs/enterprise-deployment.md)** - Production best
  practices
- **[Migration Guide](./docs/migration.md)** - Moving from other solutions
- **[API Documentation](./docs/api.md)** - Complete API reference
- **[Troubleshooting Guide](./docs/troubleshooting.md)** - Common issues and
  solutions

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md).

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  <strong>Built with ❤️ for enterprise developers who value simplicity and power</strong><br>
  <a href="https://github.com/voilajsx/appkit">⭐ Star us on GitHub</a> •
  <a href="https://discord.gg/voilajsx">💬 Join our Discord</a> •
  <a href="https://twitter.com/voilajsx">🐦 Follow on Twitter</a>
</p>
