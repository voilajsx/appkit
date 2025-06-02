# Tenant Database Module - Developer REFERENCE 🛠️

The tenant database module provides secure multi-tenant database isolation for
Node.js applications. It automatically keeps customer data separate with minimal
setup and works seamlessly with your existing database setup.

Whether you need simple row-level filtering or complete database isolation, this
module provides composable utilities that work with any Node.js framework and
integrate with minimal configuration.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🔄 [Row-Level Strategy](#row-level-strategy)
  - [Basic Setup](#basic-setup)
  - [Prisma Integration](#prisma-integration)
  - [Mongoose Integration](#mongoose-integration)
  - [Complete Row-Level Example](#complete-row-level-example)
- 🏢 [Database-Per-Tenant Strategy](#database-per-tenant-strategy)
  - [When to Use](#when-to-use)
  - [Setup Requirements](#setup-requirements)
  - [Tenant Lifecycle](#tenant-lifecycle)
  - [Complete Database Strategy Example](#complete-database-strategy-example)
- 🌐 [Express Middleware](#express-middleware)
  - [Basic Integration](#basic-integration)
  - [Tenant ID Sources](#tenant-id-sources)
  - [Error Handling](#error-handling)
  - [Complete Middleware Example](#complete-middleware-example)
- 📊 [Tenant Management](#tenant-management)
  - [Creating Tenants](#creating-tenants)
  - [Validating Tenants](#validating-tenants)
  - [Admin Operations](#admin-operations)
  - [Complete Management Example](#complete-management-example)
- 🚀 [Complete Integration Example](#complete-integration-example)
- 📚 [Additional Resources](#additional-resources)
- 💡 [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @voilajsx/appkit

# Install your preferred ORM
npm install @prisma/client prisma  # For Prisma
npm install mongoose              # For MongoDB
```

````

### Basic Import

```javascript
import { createDb, createMiddleware } from '@voilajsx/appkit/tenantdb';
```

## Row-Level Strategy

The row-level strategy uses a single shared database with automatic tenant
filtering via a `tenantId` column.

### Basic Setup

Use row-level strategy when you want simplicity and shared infrastructure:

```javascript
import { createDb } from '@voilajsx/appkit/tenantdb';

// Automatically detects row-level strategy from regular URL
const db = createDb({
  url: 'postgresql://localhost:5432/myapp',
});

// Get tenant-specific connection
const tenantDb = await db.forTenant('acme_corp');

// All queries automatically filtered by tenant
const users = await tenantDb.user.findMany();
```

**Expected Output:**

```
// Prisma automatically adds WHERE tenantId = 'acme_corp'
// MongoDB automatically adds { tenantId: 'acme_corp' } filter
```

**When to use:**

- **SaaS Applications**: Multiple small to medium customers sharing
  infrastructure
- **Rapid Development**: Quick setup with existing database
- **Cost Optimization**: Shared resources reduce infrastructure costs
- **Simple Requirements**: Basic isolation needs without regulatory constraints

### Prisma Integration

The module integrates seamlessly with existing Prisma schemas:

```javascript
// Your Prisma schema - just add tenantId field
model User {
  id       String @id @default(cuid())
  tenantId String // Add this field to all models
  email    String
  name     String

  @@index([tenantId])  // Important for performance
}
```

```javascript
import { createDb } from '@voilajsx/appkit/tenantdb';

const db = createDb({
  url: process.env.DATABASE_URL,
});

// Get tenant connection
const tenantDb = await db.forTenant('acme_corp');

// Create operation - tenantId automatically added
const user = await tenantDb.user.create({
  data: {
    email: 'john@acme.com',
    name: 'John Doe',
  },
});

// Query operations - automatically filtered
const users = await tenantDb.user.findMany({
  where: { active: true },
});
```

**When to use Prisma integration:**

- **Type Safety**: Full TypeScript support with generated types
- **Modern Development**: Latest ORM features and patterns
- **Complex Queries**: Advanced filtering, relations, and aggregations
- **Database Migrations**: Automated schema management

### Mongoose Integration

Perfect for MongoDB applications with existing Mongoose models:

```javascript
// Your Mongoose schema - just add tenantId field
const userSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
});
```

```javascript
import { createDb } from '@voilajsx/appkit/tenantdb';

const db = createDb({
  url: 'mongodb://localhost:27017/myapp',
});

// Get tenant connection
const tenantDb = await db.forTenant('acme_corp');

// Create models on tenant connection
const User = tenantDb.model('User', userSchema);

// Operations automatically include tenant filtering
const user = await User.create({
  email: 'john@acme.com',
  name: 'John Doe',
});

// Queries automatically filtered
const users = await User.find({ active: true });
```

**When to use Mongoose integration:**

- **MongoDB Applications**: Document-based data with flexible schemas
- **Existing Mongoose Code**: Minimal changes to current models
- **Rapid Prototyping**: Quick schema iterations and validation
- **Complex Aggregations**: Advanced MongoDB pipeline operations

### Complete Row-Level Example

Here's a production-ready example with user management and data isolation:

```javascript
import { createDb, createMiddleware } from '@voilajsx/appkit/tenantdb';
import express from 'express';

const app = express();
app.use(express.json());

// Initialize multi-tenant database
const db = createDb({
  url: process.env.DATABASE_URL,
});

// Add tenant middleware
app.use('/api', createMiddleware(db));

// User registration creates tenant-aware data
app.post('/api/users', async (req, res) => {
  const user = await req.db.user.create({
    data: req.body,
  });
  res.json(user);
});

// User listing automatically filtered by tenant
app.get('/api/users', async (req, res) => {
  const users = await req.db.user.findMany();
  res.json(users);
});
```

**When to implement row-level strategy:**

- **Multi-Tenant SaaS**: Customer management platforms, project tools, CRM
  systems
- **Team Collaboration**: Workspaces, channels, shared documents
- **Educational Platforms**: Schools, courses, student management
- **E-commerce Platforms**: Multi-vendor marketplaces with seller isolation

## Database-Per-Tenant Strategy

The database-per-tenant strategy creates a separate database for each tenant,
providing complete isolation.

### When to Use

Choose database-per-tenant strategy for maximum isolation and compliance:

```javascript
import { createDb } from '@voilajsx/appkit/tenantdb';

// Automatically detects database strategy from {tenant} placeholder
const db = createDb({
  url: 'postgresql://localhost:5432/{tenant}',
});

// Each tenant gets their own database
const acmeDb = await db.forTenant('acme_corp');
const globexDb = await db.forTenant('globex_ltd');
```

**Expected Behavior:**

- Each tenant has completely separate database
- No shared data between tenants
- Independent backups and scaling
- Full resource isolation

**When to use:**

- **Enterprise Customers**: Large clients requiring dedicated resources
- **Compliance Requirements**: HIPAA, GDPR, financial regulations requiring data
  isolation
- **Performance Critical**: High-volume tenants needing dedicated database
  resources
- **Independent Scaling**: Different performance requirements per tenant

### Setup Requirements

Database-per-tenant requires proper database permissions:

```javascript
// Database user needs CREATE DATABASE, DROP DATABASE permissions
const db = createDb({
  url: 'postgresql://admin:password@localhost:5432/{tenant}',
});

// Test setup
await db.createTenant('test_tenant');
console.log('✅ Database strategy configured correctly');
await db.deleteTenant('test_tenant');
```

### Tenant Lifecycle

Managing complete tenant lifecycle with dedicated databases:

```javascript
// Create new tenant with database
async function createTenant(tenantId, adminEmail) {
  // Create tenant database
  await db.createTenant(tenantId);

  // Set up initial data
  const tenantDb = await db.forTenant(tenantId);
  const admin = await tenantDb.user.create({
    data: {
      email: adminEmail,
      role: 'admin',
    },
  });

  return { tenantId, adminId: admin.id };
}
```

### Complete Database Strategy Example

Production-ready tenant management with complete isolation:

```javascript
import { createDb } from '@voilajsx/appkit/tenantdb';

const db = createDb({
  url: 'postgresql://admin:password@localhost:5432/{tenant}',
});

// Tenant provisioning API
app.post('/admin/tenants', async (req, res) => {
  const { name, adminEmail } = req.body;
  const tenantId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Create tenant with database
  await db.createTenant(tenantId);

  // Initialize tenant data
  const tenantDb = await db.forTenant(tenantId);
  const admin = await tenantDb.user.create({
    data: {
      email: adminEmail,
      role: 'admin',
    },
  });

  res.status(201).json({
    tenantId,
    adminUserId: admin.id,
  });
});

// Tenant health monitoring
app.get('/admin/tenants/:tenantId/health', async (req, res) => {
  const { tenantId } = req.params;

  if (!(await db.tenantExists(tenantId))) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  const tenantDb = await db.forTenant(tenantId);
  const userCount = await tenantDb.user.count();

  res.json({
    status: 'healthy',
    tenantId,
    userCount,
  });
});
```

**When to implement database strategy:**

- **Healthcare Applications**: Patient data requiring HIPAA compliance
- **Financial Services**: Customer data with regulatory isolation requirements
- **Enterprise SaaS**: Large customers with dedicated resource needs
- **International Platforms**: Geographic data residency requirements

## Express Middleware

The middleware provides seamless integration with Express applications for
automatic tenant context.

### Basic Integration

Simple setup that works with any Express application:

```javascript
import { createDb, createMiddleware } from '@voilajsx/appkit/tenantdb';
import express from 'express';

const app = express();
const db = createDb({ url: process.env.DATABASE_URL });

// Add tenant middleware to all API routes
app.use('/api', createMiddleware(db));

// Routes automatically have tenant context
app.get('/api/users', async (req, res) => {
  // req.db is tenant-specific
  // req.tenantId contains the tenant ID
  const users = await req.db.user.findMany();
  res.json(users);
});
```

**Expected Behavior:**

- Middleware runs before route handlers
- Sets `req.db` with tenant-scoped database connection
- Sets `req.tenantId` with extracted tenant identifier
- Validates tenant exists before proceeding

### Tenant ID Sources

The middleware checks multiple sources for tenant identification:

```javascript
// 1. Custom header (recommended for APIs)
fetch('/api/users', {
  headers: { 'X-Tenant-ID': 'acme_corp' },
});

// 2. URL parameter
app.get('/api/tenants/:tenantId/users', middleware, handler);

// 3. Query parameter
// /api/users?tenantId=acme_corp

// 4. Request body (for POST/PUT requests)
app.post('/api/users', middleware, (req, res) => {
  // Body: { "tenantId": "acme_corp", "name": "John" }
});
```

### Error Handling

The middleware provides consistent error responses:

```javascript
import { createMiddleware } from '@voilajsx/appkit/tenantdb';

const middleware = createMiddleware(db);
app.use('/api', middleware);

// Error scenarios:
// 1. No tenant ID found
// Response: 400 {"error": "Tenant error", "message": "Tenant ID is required"}

// 2. Tenant doesn't exist
// Response: 404 {"error": "Tenant error", "message": "Tenant 'xyz' not found"}
```

### Complete Middleware Example

Production-ready middleware integration:

```javascript
import { createDb, createMiddleware } from '@voilajsx/appkit/tenantdb';
import express from 'express';

const app = express();
app.use(express.json());

const db = createDb({ url: process.env.DATABASE_URL });
const tenant = createMiddleware(db);

// Public routes (no tenant needed)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected tenant routes
app.use('/api', tenant);

app.get('/api/users', async (req, res) => {
  const users = await req.db.user.findMany();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = await req.db.user.create({
    data: req.body,
  });
  res.json(user);
});
```

**When to use middleware approach:**

- **Web Applications**: Traditional multi-page applications with server-side
  rendering
- **REST APIs**: RESTful services with tenant-scoped endpoints
- **Microservices**: Service-to-service communication with tenant context
- **Admin Dashboards**: Management interfaces for multi-tenant systems

## Tenant Management

Administrative operations for managing tenant lifecycle and validation.

### Creating Tenants

Programmatic tenant creation with validation and setup:

```javascript
import { createDb } from '@voilajsx/appkit/tenantdb';

const db = createDb({ url: process.env.DATABASE_URL });

// Basic tenant creation
async function createTenant(name, ownerEmail) {
  const tenantId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Create tenant
  await db.createTenant(tenantId);

  // Initialize with owner
  const tenantDb = await db.forTenant(tenantId);
  const owner = await tenantDb.user.create({
    data: {
      email: ownerEmail,
      role: 'owner',
    },
  });

  return { tenantId, ownerId: owner.id };
}
```

### Validating Tenants

Comprehensive tenant validation and health checks:

```javascript
// Basic tenant validation
async function validateTenant(tenantId) {
  if (!(await db.tenantExists(tenantId))) {
    return { valid: false, error: 'Tenant not found' };
  }

  const tenantDb = await db.forTenant(tenantId);
  await tenantDb.$queryRaw`SELECT 1`;

  return { valid: true, status: 'healthy' };
}

// Get all tenants with status
async function getAllTenantsStatus() {
  const tenants = await db.listTenants();
  const results = [];

  for (const tenantId of tenants) {
    const status = await validateTenant(tenantId);
    results.push({ tenantId, ...status });
  }

  return results;
}
```

### Admin Operations

Administrative tools for tenant management:

```javascript
// List all tenants with basic info
app.get('/admin/tenants', async (req, res) => {
  const tenants = await db.listTenants();
  const details = [];

  for (const tenantId of tenants) {
    const tenantDb = await db.forTenant(tenantId);
    const userCount = await tenantDb.user.count();

    details.push({
      tenantId,
      userCount,
      status: 'active',
    });
  }

  res.json({ totalTenants: tenants.length, tenants: details });
});

// Delete tenant
app.delete('/admin/tenants/:tenantId', async (req, res) => {
  const { tenantId } = req.params;

  await db.deleteTenant(tenantId);
  res.json({ message: 'Tenant deleted successfully' });
});
```

### Complete Management Example

Production-ready tenant management system:

```javascript
import { createDb } from '@voilajsx/appkit/tenantdb';

const db = createDb({ url: process.env.DATABASE_URL });

// Create tenant with setup
app.post('/admin/tenants', async (req, res) => {
  const { name, ownerEmail } = req.body;
  const tenantId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Create tenant
  await db.createTenant(tenantId);

  // Initialize tenant data
  const tenantDb = await db.forTenant(tenantId);
  const owner = await tenantDb.user.create({
    data: {
      email: ownerEmail,
      role: 'owner',
    },
  });

  res.status(201).json({
    tenantId,
    ownerId: owner.id,
  });
});

// Get tenant stats
app.get('/admin/stats', async (req, res) => {
  const tenants = await db.listTenants();
  let totalUsers = 0;

  for (const tenantId of tenants) {
    const tenantDb = await db.forTenant(tenantId);
    const userCount = await tenantDb.user.count();
    totalUsers += userCount;
  }

  res.json({
    totalTenants: tenants.length,
    totalUsers,
  });
});
```

**When to implement tenant management:**

- **SaaS Platforms**: Customer onboarding and lifecycle management
- **Enterprise Solutions**: Large client provisioning and management
- **Development Tools**: Multi-environment or multi-project isolation
- **Service Providers**: Client data segregation and management

## Complete Integration Example

Here's a production-ready example showing all features working together:

```javascript
import express from 'express';
import { createDb, createMiddleware } from '@voilajsx/appkit/tenantdb';

const app = express();
app.use(express.json());

// Initialize services
const db = createDb({
  url: process.env.DATABASE_URL,
});

const tenant = createMiddleware(db);

// Public registration endpoint
app.post('/register', async (req, res) => {
  const { email, companyName } = req.body;

  // Create tenant for new company
  const tenantId = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  if (await db.tenantExists(tenantId)) {
    return res.status(400).json({ error: 'Company already exists' });
  }

  // Create tenant and owner account
  await db.createTenant(tenantId);
  const tenantDb = await db.forTenant(tenantId);

  const user = await tenantDb.user.create({
    data: {
      email,
      role: 'owner',
    },
  });

  res.status(201).json({
    user: { id: user.id, email, role: 'owner' },
    tenant: { id: tenantId, name: companyName },
  });
});

// Protected tenant routes
app.use('/api', tenant);

// User management
app.get('/api/users', async (req, res) => {
  const users = await req.db.user.findMany();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = await req.db.user.create({
    data: req.body,
  });
  res.json(user);
});

// Dashboard analytics
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

// System admin routes
app.get('/system/tenants', async (req, res) => {
  const tenants = await db.listTenants();
  const details = [];

  for (const tenantId of tenants) {
    const tenantDb = await db.forTenant(tenantId);
    const userCount = await tenantDb.user.count();

    details.push({
      tenantId,
      userCount,
      status: 'active',
    });
  }

  res.json({ totalTenants: tenants.length, tenants: details });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await db.disconnect();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

**When to implement this comprehensive approach:**

- **Production SaaS Applications**: Complete multi-tenant systems with user
  management
- **Enterprise Platforms**: B2B applications with complex tenant requirements
- **Startup MVPs**: Rapid development with scalable architecture from day one
- **Agency Projects**: Reusable patterns for client applications

## Additional Resources

- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/tenantdb/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajsx/appkit/blob/main/src/tenantdb/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## Best Practices

### 🔐 Security

- **Validate tenant IDs** using regex pattern `/^[a-zA-Z0-9_-]+$/`
- **Use HTTPS** in production for all database connections
- **Implement proper RBAC** within each tenant for user permissions
- **Audit tenant operations** including creation, deletion, and access patterns
- **Secure database credentials** using environment variables and secrets
  management

### 🏗️ Architecture

- **Choose strategy early** based on isolation and compliance requirements
- **Index tenantId columns** for optimal row-level strategy performance
- **Implement connection pooling** appropriate for your chosen strategy
- **Design for horizontal scaling** with database-per-tenant strategy
- **Plan migration paths** between strategies as requirements evolve

### 🚀 Performance

- **Monitor query performance** especially for row-level strategy with large
  datasets
- **Use database-per-tenant** for high-volume tenants requiring dedicated
  resources
- **Implement caching** at the application layer for frequently accessed tenant
  data
- **Balance connection limits** between tenant isolation and resource usage
- **Profile tenant operations** to identify bottlenecks and optimization
  opportunities

### 👥 User Experience

- **Provide clear tenant context** in UI/UX to avoid user confusion
- **Handle tenant switching** gracefully in applications supporting multiple
  tenants
- **Implement proper error messages** that don't reveal sensitive tenant
  information
- **Design intuitive onboarding** for new tenant creation and user invitation
  flows
- **Ensure data portability** for tenant migration and export requirements

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>

````
