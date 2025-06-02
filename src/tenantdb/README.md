# @voilajsx/appkit - Tenant Database Module 🏢

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Simple, secure multi-tenant database solution for Node.js applications

The Tenant Database module of `@voilajsx/appkit` provides automatic multi-tenant
database isolation with support for row-level and database-per-tenant
strategies. Get multi-tenancy working in minutes with automatic tenant filtering
and zero configuration.

## Module Overview

The Tenant Database module provides everything you need for multi-tenant
applications:

| Feature                     | What it does                        | Main functions                       |
| --------------------------- | ----------------------------------- | ------------------------------------ |
| **Tenant Isolation**        | Automatically isolates tenant data  | `forTenant()`, `createTenant()`      |
| **Strategy Auto-Detection** | Chooses isolation strategy from URL | Auto-configured based on URL pattern |
| **Express Integration**     | Seamless middleware for web apps    | `createMiddleware()`                 |
| **Tenant Management**       | Create and manage tenant lifecycle  | `createTenant()`, `deleteTenant()`   |

## 🚀 Features

- **🔄 Two Isolation Strategies** - Row-level (shared DB) or database-per-tenant
- **🔌 Auto-Detection** - Automatically detects strategy and adapter from URL
- **🛡️ Automatic Filtering** - Tenant data is automatically isolated
- **⚡ Simple API** - Just 6 methods to learn
- **🎯 Framework Agnostic** - Works with Express, Fastify, Koa, and more
- **📦 Zero Configuration** - Works out of the box with sensible defaults

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start

Import the functions you need and start using them right away. The module
automatically detects your database type and isolation strategy from the URL
pattern.

```javascript
import { createDb, createMiddleware } from '@voilajsx/appkit/tenantdb';
import express from 'express';

const app = express();

// Create multi-tenant database (auto-detects everything)
const db = createDb({
  url: process.env.DATABASE_URL,
});

// Add middleware for automatic tenant context
app.use(createMiddleware(db));

// All database operations are now tenant-aware
app.get('/users', async (req, res) => {
  const users = await req.db.user.findMany();
  res.json(users);
});
```

## 📖 Core Functions

### Database Management

These utilities enable you to create and manage multi-tenant database
connections with automatic tenant isolation. Perfect for SaaS applications that
need to keep customer data separate.

| Function         | Purpose                          | When to use                             |
| ---------------- | -------------------------------- | --------------------------------------- |
| `createDb()`     | Initialize multi-tenant database | App startup, configuration              |
| `db.forTenant()` | Get tenant-specific connection   | Manual tenant handling, background jobs |

```javascript
// Create database instance
const db = createDb({ url: process.env.DATABASE_URL });

// Get tenant-specific connection
const tenantDb = await db.forTenant('acme_corp');
const users = await tenantDb.user.findMany();
```

### Tenant Lifecycle

These functions enable you to manage the complete tenant lifecycle from creation
to deletion. Use these for user registration flows and account management.

| Function            | Purpose            | When to use                   |
| ------------------- | ------------------ | ----------------------------- |
| `db.createTenant()` | Create new tenant  | User registration, onboarding |
| `db.deleteTenant()` | Delete tenant data | Account deletion, cleanup     |

```javascript
// Create new tenant
await db.createTenant('new_company');

// Delete tenant (careful!)
await db.deleteTenant('old_company');
```

### Tenant Discovery

These utilities help you find and validate tenants in your system. Essential for
admin dashboards and tenant validation workflows.

| Function            | Purpose                | When to use                             |
| ------------------- | ---------------------- | --------------------------------------- |
| `db.tenantExists()` | Check if tenant exists | Validation, error prevention            |
| `db.listTenants()`  | Get all tenant IDs     | Admin dashboards, background processing |

```javascript
// Check if tenant exists
const exists = await db.tenantExists('acme_corp');

// Get all tenants
const tenants = await db.listTenants();
```

## 🔧 Configuration Options

The examples above show basic usage, but you have control over isolation
strategies and database adapters:

### Isolation Strategy Options

| Strategy   | Description                           | URL Pattern                     | Example                           |
| ---------- | ------------------------------------- | ------------------------------- | --------------------------------- |
| `row`      | Shared database with tenant filtering | Regular database URL            | `postgresql://localhost/myapp`    |
| `database` | Separate database per tenant          | URL with `{tenant}` placeholder | `postgresql://localhost/{tenant}` |

```javascript
// Row-level strategy (default)
const db = createDb({
  url: 'postgresql://localhost:5432/myapp',
});

// Database-per-tenant strategy
const db = createDb({
  url: 'postgresql://localhost:5432/{tenant}',
});
```

### Adapter Detection

| Adapter    | Description                 | Supported URLs                 | Use Case                  |
| ---------- | --------------------------- | ------------------------------ | ------------------------- |
| `prisma`   | Modern ORM with type safety | `postgresql://`, `mysql://`    | SQL databases with Prisma |
| `mongoose` | MongoDB object modeling     | `mongodb://`, `mongodb+srv://` | MongoDB applications      |

```javascript
// Prisma adapter (auto-detected)
createDb({ url: 'postgresql://localhost:5432/myapp' });

// Mongoose adapter (auto-detected)
createDb({ url: 'mongodb://localhost:27017/myapp' });
```

## 💡 Common Use Cases

Here's where you can apply the tenant database module's functionality in your
applications:

| Category              | Use Case             | Description                                    | Components Used                     |
| --------------------- | -------------------- | ---------------------------------------------- | ----------------------------------- |
| **SaaS Applications** | Multi-tenant SaaS    | Isolate customer data in shared infrastructure | `createDb()`, `createMiddleware()`  |
| **User Management**   | Account Registration | Create tenant space during user signup         | `createTenant()`, `tenantExists()`  |
| **Admin Operations**  | Tenant Management    | Admin dashboard for managing tenants           | `listTenants()`, `deleteTenant()`   |
| **Data Processing**   | Background Jobs      | Process data for all tenants                   | `listTenants()`, `forTenant()`      |
| **API Development**   | Multi-tenant APIs    | Automatic tenant isolation in REST APIs        | `createMiddleware()`, `forTenant()` |
| **Compliance**        | Data Isolation       | Complete data separation for compliance        | Database-per-tenant strategy        |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common multi-tenant scenarios using the `@voilajsx/appkit/tenantdb` module.
We've created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajsx/appkit/blob/main/src/tenantdb/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs to understand the module's
capabilities and generate high-quality multi-tenant code.

### How to Use LLM Code Generation

Simply copy one of the prompts below and share it with ChatGPT, Claude, or
another capable LLM. The LLM will read the reference document and generate
secure, best-practice multi-tenant code tailored to your specific requirements.

### Sample Prompts to Try

#### Basic Multi-Tenant Setup

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/tenantdb/docs/PROMPT_REFERENCE.md and then create a complete multi-tenant Express application using @voilajsx/appkit/tenantdb with the following features:
- Automatic tenant detection from subdomain
- Row-level tenant isolation with Prisma
- User registration that creates tenant
- Protected routes with tenant-aware database queries
```

#### Advanced Tenant Management

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/tenantdb/docs/PROMPT_REFERENCE.md and then implement a tenant management system using @voilajsx/appkit/tenantdb that includes:
- Database-per-tenant isolation for high security
- Admin dashboard for creating/deleting tenants
- Background job processing for all tenants
- Tenant health monitoring and validation
```

#### Migration from Single-Tenant

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/tenantdb/docs/PROMPT_REFERENCE.md and then create a migration plan from a single-tenant to multi-tenant application using @voilajsx/appkit/tenantdb with:
- Row-level strategy for minimal database changes
- Data migration scripts for existing users
- Backward compatibility during transition
- Testing strategy for tenant isolation
```

## 📋 Example Code

For complete, working examples, check our examples folder:

- [Basic Multi-Tenant App](https://github.com/voilajsx/appkit/blob/main/src/tenantdb/examples/01-basic-app.js) -
  Simple Express app with tenant middleware
- [Tenant Management](https://github.com/voilajsx/appkit/blob/main/src/tenantdb/examples/02-tenant-management.js) -
  Creating and managing tenants
- [Database Per Tenant](https://github.com/voilajsx/appkit/blob/main/src/tenantdb/examples/03-database-strategy.js) -
  High isolation with separate databases
- [Background Jobs](https://github.com/voilajsx/appkit/blob/main/src/tenantdb/examples/04-background-jobs.js) -
  Processing data across all tenants

## 🛡️ Security Best Practices

Following these practices will help ensure your multi-tenant system remains
secure:

1. **Validate Tenant Access**: Always verify users can only access their tenant
   data
2. **Sanitize Tenant IDs**: Use only alphanumeric characters, underscores, and
   hyphens
3. **Database Isolation**: Choose appropriate isolation level for your security
   requirements
4. **Connection Security**: Use SSL/TLS for database connections in production
5. **Audit Logging**: Log all tenant creation and deletion operations
6. **Input Validation**: Validate all tenant-related inputs to prevent injection
   attacks

## 📊 Performance Considerations

- **Strategy Selection**: Row-level is faster for many small tenants,
  database-per-tenant for fewer large tenants
- **Index Management**: Ensure tenant ID columns are properly indexed for
  row-level strategy
- **Connection Pooling**: Database-per-tenant strategy manages connections
  automatically
- **Query Optimization**: Use tenant-specific queries instead of filtering large
  datasets

## 🔍 Error Handling

The module provides specific error messages that you should handle
appropriately:

```javascript
try {
  const tenantDb = await db.forTenant('nonexistent');
} catch (error) {
  if (error.message.includes('not found')) {
    // Handle tenant not found
  } else if (error.message.includes('required')) {
    // Handle missing tenant ID
  } else {
    // Handle other errors
  }
}
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajsx/appkit/blob/main/src/tenantdb/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/tenantdb/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajsx/appkit/blob/main/src/tenantdb/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJS](https://github.com/voilajs)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
