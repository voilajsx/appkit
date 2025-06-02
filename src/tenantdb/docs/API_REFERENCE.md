# Tenant Database Module API Reference

## Overview

The `@voilajsx/appkit/tenantdb` module provides secure multi-tenant database
utilities for Node.js applications, including automatic tenant isolation,
database connection management, and Express middleware for seamless integration.

## Installation

```bash
npm install @voilajsx/appkit
```

## Quick Start

```javascript
import { createDb, createMiddleware } from '@voilajsx/appkit/tenantdb';

const db = createDb({ url: process.env.DATABASE_URL });
const middleware = createMiddleware(db);
```

## API Reference

### Main Functions

#### createDb(config)

Creates a multi-tenant database instance with automatic strategy and adapter
detection.

##### Parameters

| Name              | Type     | Required | Default       | Description                              |
| ----------------- | -------- | -------- | ------------- | ---------------------------------------- |
| `config`          | `Object` | Yes      | -             | Configuration object                     |
| `config.url`      | `string` | Yes      | -             | Database connection URL                  |
| `config.strategy` | `string` | No       | Auto-detected | Tenancy strategy: 'row' or 'database'    |
| `config.adapter`  | `string` | No       | Auto-detected | Database adapter: 'prisma' or 'mongoose' |

##### Auto-Detection Rules

- **Strategy Detection**: URLs containing `{tenant}` use 'database' strategy,
  others use 'row'
- **Adapter Detection**: URLs containing 'mongodb' use 'mongoose', others use
  'prisma'

##### Returns

- `Object` - Multi-tenant database instance with methods

##### Throws

- `Error` - If config.url is missing
- `Error` - If unknown strategy specified
- `Error` - If unknown adapter specified

##### Example

```javascript
// Row-level strategy (auto-detected)
const db = createDb({
  url: 'postgresql://localhost:5432/myapp',
});

// Database-per-tenant strategy (auto-detected from {tenant})
const db = createDb({
  url: 'postgresql://localhost:5432/{tenant}',
});

// Explicit configuration
const db = createDb({
  url: process.env.DATABASE_URL,
  strategy: 'row',
  adapter: 'prisma',
});
```

---

#### createMiddleware(db)

Creates Express middleware for automatic tenant detection and database context.

##### Parameters

| Name | Type     | Required | Description                       |
| ---- | -------- | -------- | --------------------------------- |
| `db` | `Object` | Yes      | Database instance from createDb() |

##### Returns

- `Function` - Express middleware function

##### Throws

- `Error` - If database instance is missing

##### Middleware Behavior

The middleware automatically:

1. Extracts tenant ID from request (see Tenant ID Sources below)
2. Validates tenant exists
3. Sets `req.db` with tenant-specific database connection
4. Sets `req.tenantId` with extracted tenant ID
5. Calls `next()` to continue request processing

##### Tenant ID Sources

The middleware checks for tenant ID in this order:

1. `req.headers['x-tenant-id']` - Custom header
2. `req.query.tenantId` - Query parameter
3. `req.params.tenantId` - URL parameter
4. `req.tenant?.id` - Tenant object property
5. `req.user?.tenantId` - User object property
6. `req.body?.tenantId` - Request body property

##### Error Responses

| Error Type       | HTTP Status | Response                                                         |
| ---------------- | ----------- | ---------------------------------------------------------------- |
| No tenant ID     | 400         | `{"error": "Tenant error", "message": "Tenant ID is required"}`  |
| Tenant not found | 404         | `{"error": "Tenant error", "message": "Tenant 'xxx' not found"}` |
| Other errors     | 400         | `{"error": "Tenant error", "message": "Error message"}`          |

##### Example

```javascript
import { createMiddleware } from '@voilajsx/appkit/tenantdb';

const middleware = createMiddleware(db);

// Apply to all routes
app.use(middleware);

// Or apply to specific routes
app.use('/api', middleware);

// Use in route handlers
app.get('/users', async (req, res) => {
  // req.db is automatically set to tenant-specific connection
  const users = await req.db.user.findMany();
  res.json(users);
});
```

---

### Database Instance Methods

#### db.forTenant(tenantId)

Gets a database connection for a specific tenant.

##### Parameters

| Name       | Type     | Required | Description       |
| ---------- | -------- | -------- | ----------------- |
| `tenantId` | `string` | Yes      | Tenant identifier |

##### Returns

- `Promise<Object>` - Database client for the tenant (Prisma client or Mongoose
  connection)

##### Throws

- `Error` - If tenantId is missing

##### Example

```javascript
// Get tenant-specific database connection
const tenantDb = await db.forTenant('acme_corp');

// Use with Prisma
const users = await tenantDb.user.findMany();

// Use with Mongoose
const User = tenantDb.model('User');
const users = await User.find();
```

---

#### db.createTenant(tenantId)

Creates a new tenant.

##### Parameters

| Name       | Type     | Required | Description       |
| ---------- | -------- | -------- | ----------------- |
| `tenantId` | `string` | Yes      | Tenant identifier |

##### Tenant ID Validation

- Must contain only alphanumeric characters, underscores, and hyphens
- Pattern: `/^[a-zA-Z0-9_-]+$/`

##### Returns

- `Promise<void>`

##### Throws

- `Error` - If tenantId is missing
- `Error` - If tenantId format is invalid
- `Error` - If tenant creation fails

##### Behavior by Strategy

| Strategy            | Behavior                                               |
| ------------------- | ------------------------------------------------------ |
| Row-level           | No-op (tenant created implicitly on first data insert) |
| Database-per-tenant | Creates new database for tenant                        |

##### Example

```javascript
// Create new tenant
await db.createTenant('new_company');

// Tenant ID validation
await db.createTenant('valid_tenant_123'); // ✅ Valid
await db.createTenant('invalid tenant!'); // ❌ Throws error
```

---

#### db.deleteTenant(tenantId)

Deletes a tenant and all associated data.

##### Parameters

| Name       | Type     | Required | Description       |
| ---------- | -------- | -------- | ----------------- |
| `tenantId` | `string` | Yes      | Tenant identifier |

##### Returns

- `Promise<void>`

##### Throws

- `Error` - If tenantId is missing
- `Error` - If tenant deletion fails

##### Behavior by Strategy

| Strategy            | Behavior                                                   |
| ------------------- | ---------------------------------------------------------- |
| Row-level           | Deletes all records with matching tenantId from all tables |
| Database-per-tenant | Drops the entire tenant database                           |

##### ⚠️ Warning

This operation is irreversible and will permanently delete all tenant data.

##### Example

```javascript
// Delete tenant and all data
await db.deleteTenant('old_company');

// Always verify before deletion
const exists = await db.tenantExists('old_company');
if (exists) {
  await db.deleteTenant('old_company');
}
```

---

#### db.tenantExists(tenantId)

Checks if a tenant exists.

##### Parameters

| Name       | Type     | Required | Description       |
| ---------- | -------- | -------- | ----------------- |
| `tenantId` | `string` | Yes      | Tenant identifier |

##### Returns

- `Promise<boolean>` - `true` if tenant exists, `false` otherwise

##### Throws

- Never throws (returns `false` for invalid input)

##### Behavior by Strategy

| Strategy            | Check Method                                    |
| ------------------- | ----------------------------------------------- |
| Row-level           | Searches for any records with matching tenantId |
| Database-per-tenant | Checks if database exists                       |

##### Example

```javascript
// Check if tenant exists
const exists = await db.tenantExists('acme_corp');

if (exists) {
  const tenantDb = await db.forTenant('acme_corp');
  // Use tenant database
} else {
  // Handle tenant not found
}
```

---

#### db.listTenants()

Lists all tenant IDs.

##### Parameters

None

##### Returns

- `Promise<string[]>` - Array of tenant IDs

##### Throws

- `Error` - If listing fails

##### Behavior by Strategy

| Strategy            | Source                                           |
| ------------------- | ------------------------------------------------ |
| Row-level           | Extracts unique tenantId values from all tables  |
| Database-per-tenant | Lists all databases (excluding system databases) |

##### Example

```javascript
// Get all tenants
const tenants = await db.listTenants();
console.log(tenants); // ['tenant1', 'tenant2', 'tenant3']

// Process all tenants
for (const tenantId of tenants) {
  const tenantDb = await db.forTenant(tenantId);
  // Process tenant data
}
```

---

#### db.disconnect()

Disconnects all database connections and cleans up resources.

##### Parameters

None

##### Returns

- `Promise<void>`

##### Throws

- `Error` - If disconnection fails (logs error but doesn't throw)

##### Example

```javascript
// Graceful shutdown
process.on('SIGTERM', async () => {
  await db.disconnect();
  process.exit(0);
});

// Manual cleanup
await db.disconnect();
```

---

## Error Handling

All functions throw descriptive errors. Always wrap calls in try-catch blocks:

```javascript
try {
  const tenantDb = await db.forTenant('acme_corp');
  const users = await tenantDb.user.findMany();
} catch (error) {
  console.error('Tenant operation failed:', error.message);
  // Handle error appropriately
}
```

### Common Error Messages

| Function           | Error Message                    | Cause                         |
| ------------------ | -------------------------------- | ----------------------------- |
| `createDb`         | "Database URL is required"       | Missing config.url            |
| `createDb`         | "Unknown strategy: xyz"          | Invalid strategy specified    |
| `createDb`         | "Unknown adapter: xyz"           | Invalid adapter specified     |
| `forTenant`        | "Tenant ID is required"          | Missing tenantId parameter    |
| `createTenant`     | "Tenant ID must contain only..." | Invalid tenantId format       |
| `createMiddleware` | "Database instance is required"  | Missing db parameter          |
| Middleware         | "Tenant ID is required"          | No tenant ID found in request |
| Middleware         | "Tenant 'xxx' not found"         | Tenant doesn't exist          |

## Strategy-Specific Behavior

### Row-Level Strategy

- **Database Structure**: Single shared database with `tenantId` column in all
  tables
- **Isolation**: Automatic middleware injection filters all queries by tenant
- **Performance**: Good with proper indexing on `tenantId` columns
- **Tenant Creation**: No setup required, tenant exists when first record
  inserted

### Database-Per-Tenant Strategy

- **Database Structure**: Separate database for each tenant
- **Isolation**: Complete database-level isolation
- **Performance**: Best performance, dedicated resources per tenant
- **Tenant Creation**: Creates new database, requires database privileges

## Adapter-Specific Features

### Prisma Adapter

- **Middleware**: Automatic query filtering via Prisma middleware
- **Transactions**: Full support for Prisma transactions
- **Type Safety**: Complete TypeScript support
- **Migrations**: Use Prisma Migrate for schema changes

### Mongoose Adapter

- **Middleware**: Schema-level pre/post hooks for tenant filtering
- **Models**: Works with existing Mongoose models
- **Connections**: Per-tenant connection management
- **Plugins**: Compatible with Mongoose plugins

## Security Considerations

1. **Tenant ID Validation**: Only alphanumeric characters, underscores, and
   hyphens allowed
2. **SQL Injection Prevention**: All tenant IDs are sanitized before database
   operations
3. **Access Control**: Middleware validates tenant existence before granting
   access
4. **Connection Isolation**: Database-per-tenant provides complete isolation
5. **Error Messages**: Generic error messages prevent information disclosure

## Performance Tips

1. **Index tenantId columns** for row-level strategy performance
2. **Use database-per-tenant** for large tenants with high isolation needs
3. **Connection pooling** is handled automatically by adapters
4. **Cache tenant validation** in production for frequently accessed tenants

## TypeScript Support

The module is written in JavaScript but provides excellent TypeScript
compatibility:

```typescript
interface TenantDatabase {
  forTenant(tenantId: string): Promise<any>;
  createTenant(tenantId: string): Promise<void>;
  deleteTenant(tenantId: string): Promise<void>;
  tenantExists(tenantId: string): Promise<boolean>;
  listTenants(): Promise<string[]>;
  disconnect(): Promise<void>;
}

interface TenantMiddleware {
  (
    req: Request & { db?: any; tenantId?: string },
    res: Response,
    next: NextFunction
  ): void;
}
```

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
