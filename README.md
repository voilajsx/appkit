# @voilajsx/appkit

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The minimal, LLM-ready application toolkit that just works**

Ultra-simple Node.js framework with 12 essential modules. Zero configuration
needed, production-ready by default, with built-in enterprise features and
revolutionary AI-friendly documentation.

## 🚀 Why Choose VoilaJSX AppKit?

- **⚡ One Function Per Module** - `utility.get()`, `authenticator.get()`,
  `configure.get()` - everything follows the same pattern
- **🔧 Zero Configuration** - Smart defaults with environment-driven scaling
- **🏢 Enterprise Ready** - Multi-tenancy, security, observability built-in
- **🤖 LLM-Optimized** - Revolutionary `@llm-rule` documentation system
- **📈 Progressive Scaling** - Development → Production with no code changes
- **🎯 90/10 Rule** - 90% of use cases with 10% of the complexity

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

```typescript
import { utility, authenticator, configure, logger } from '@voilajsx/appkit';

// Get instances - one function each
const utils = utility.get();
const auth = authenticator.get();
const config = configure.get();
const log = logger.get();

// Use immediately - no configuration needed
const userName = utils.get(user, 'profile.name', 'Guest');
const token = auth.signToken({ userId: 123 });
const dbHost = config.get('database.host', 'localhost');
log.info('🚀 App started');
```

**That's it!** Everything works out of the box with smart defaults.

## 📋 The Essential 12 Modules

| Module                    | Purpose                | Key Features                                     | Get Started            |
| ------------------------- | ---------------------- | ------------------------------------------------ | ---------------------- |
| [**Utils**](#utils)       | 12 daily utilities     | Safe access, slugify, chunk, debounce            | `utility.get()`        |
| [**Auth**](#auth)         | Role-level permissions | JWT, roles, middleware                           | `authenticator.get()`  |
| [**Config**](#config)     | Environment parsing    | `DATABASE__HOST` → `config.get('database.host')` | `configure.get()`      |
| [**Logging**](#logging)   | Auto-transport logs    | Console, file, database, webhooks                | `logger.get()`         |
| [**Storage**](#storage)   | Local/S3/R2 files      | Auto-strategy, CDN URLs                          | `store.get()`          |
| [**Queue**](#queue)       | Background jobs        | Memory/Redis/Database transports                 | `queuing.get()`        |
| [**Cache**](#cache)       | Auto Redis/Memory      | Namespace isolation                              | `caching.get('users')` |
| [**Events**](#events)     | Pub/Sub messaging      | Distributed event bus                            | `eventing.get()`       |
| [**Error**](#error)       | HTTP error handling    | Semantic status codes                            | `error.get()`          |
| [**Email**](#email)       | Auto-provider emails   | Resend/SMTP/Console                              | `emailing.get()`       |
| [**Database**](#database) | Multi-tenant DB        | Progressive org/tenant scaling                   | `database.get()`       |
| [**Security**](#security) | Enterprise protection  | CSRF, rate limiting, encryption                  | `security.get()`       |

## 🎯 Core Philosophy

### **Minimalism**

Every module follows the same pattern:

```typescript
const module = moduleExport.get(); // One function
module.coreMethod(args); // Essential methods only
```

### **LLM-Ready**

Revolutionary documentation with AI guidance:

```typescript
/**
 * @llm-rule WHEN: Building apps that need authentication with user roles
 * @llm-rule AVOID: Simple apps with basic login - adds unnecessary complexity
 * @llm-rule NOTE: Uses role.level hierarchy with automatic inheritance
 */
```

### **Enterprise-Grade**

Production features as defaults:

- Multi-tenancy built-in
- Security by default
- Auto-scaling transports
- Observability included

## 🔧 Environment-Driven Scaling

**The magic**: Set environment variables, get enterprise features automatically.

### Development (Zero Config)

```bash
# No environment variables needed
npm start
```

- Memory cache/queue/events
- Local file storage
- Console logging
- File-based config

### Production (Auto-Detection)

```bash
# Add cloud services - everything scales automatically
REDIS_URL=redis://...           # → Distributed cache/queue/events
DATABASE_URL=postgres://...     # → Database logging/queue
AWS_S3_BUCKET=bucket           # → Cloud storage
RESEND_API_KEY=re_...          # → Email service
```

**Same code, enterprise features. Zero configuration changes.**

## 📖 Module Deep Dive

### Utils

> **The 12 utilities every JavaScript developer needs daily**

Essential functions that solve 95% of daily programming needs:

```typescript
import { utility } from '@voilajsx/appkit/utils';
const utils = utility.get();

// Safe property access (never crashes)
const name = utils.get(user, 'profile.name', 'Guest');

// Universal empty check
if (utils.isEmpty(value)) {
  /* handle */
}

// Array operations
const batches = utils.chunk(items, 10);
const unique = utils.unique([1, 2, 2, 3]);

// String utilities
const slug = utils.slugify('Hello World!'); // → 'hello-world'
const preview = utils.truncate(text, { length: 100 });

// Performance helpers
const debouncedFn = utils.debounce(searchAPI, 300);
const volume = utils.clamp(userInput, 0, 1);
```

**[→ Full Utils Documentation](src/utils/README.md)**

### Auth

> **Enterprise role-level authentication with smart hierarchy**

Progressive authentication from simple to enterprise:

```typescript
import { authenticator } from '@voilajsx/appkit/auth';
const auth = authenticator.get();

// JWT operations
const token = auth.signToken({ userId: 123, role: 'admin', level: 'tenant' });
const payload = auth.verifyToken(token);

// Password security
const hash = await auth.hashPassword('password123');
const isValid = await auth.comparePassword('password123', hash);

// Middleware (Express/Fastify)
app.get('/admin', auth.requireRole('admin.tenant'), handler);
app.post('/edit', auth.requirePermission('edit:tenant'), handler);
```

**[→ Full Auth Documentation](src/auth/README.md)**

### Config

> **Convention-driven configuration with zero setup**

Smart environment variable parsing:

```typescript
import { configure } from '@voilajsx/appkit/config';
const config = configure.get();

// Environment: DATABASE__HOST=localhost
const dbHost = config.get('database.host'); // → 'localhost'

// Environment: API__TIMEOUT=30000
const timeout = config.get('api.timeout'); // → 30000 (auto-typed!)

// With defaults
const retries = config.get('api.retries', 3); // → 3 if not set
```

**Convention**: `UPPER_SNAKE__CASE` → `config.get('lower.snake.case')`

**[→ Full Config Documentation](src/config/README.md)**

### Logging

> **Production-ready logging with auto-transport detection**

Enterprise logging that just works:

```typescript
import { logger } from '@voilajsx/appkit/logging';
const log = logger.get();

// Structured logging
log.info('User login', { userId: 123, ip: req.ip });
log.error('Database error', { error: err.message, query });

// Component logging
const dbLog = logger.get('database');
dbLog.warn('Slow query', { duration: '2s', table: 'users' });
```

**Auto-transports**: Console + File (default) → +Database (`DATABASE_URL`) →
+Slack (`WEBHOOK_URL`)

**[→ Full Logging Documentation](src/logging/README.md)**

### Storage

> **Local/S3/R2 file storage with automatic strategy selection**

File storage that scales:

```typescript
import { store } from '@voilajsx/appkit/storage';
const storage = store.get();

// Works locally and in cloud
await storage.put('avatars/user123.jpg', imageBuffer);
const imageData = await storage.get('avatars/user123.jpg');
const url = storage.url('avatars/user123.jpg');

// List and organize
const files = await storage.list('documents/');
const signedUrl = await storage.signedUrl('private.pdf', 3600);
```

**Auto-strategy**: Local (dev) → S3/R2 (prod) based on environment variables.

**[→ Full Storage Documentation](src/storage/README.md)**

### Queue

> **Background job processing with automatic transport detection**

Job queues that scale from memory to Redis:

```typescript
import { queuing } from '@voilajsx/appkit/queue';
const queue = queuing.get();

// Add jobs
await queue.add('email', { to: 'user@example.com', subject: 'Welcome!' });
await queue.schedule('reminder', { userId: 123 }, 24 * 60 * 60 * 1000);

// Process jobs
queue.process('email', async (data) => {
  await sendEmail(data);
  return { sent: true };
});
```

**Auto-transport**: Memory (dev) → Redis → Database based on environment.

**[→ Full Queue Documentation](src/queue/README.md)**

### Cache

> **Redis/Memory caching with namespace isolation**

Caching with automatic strategy:

```typescript
import { caching } from '@voilajsx/appkit/cache';
const cache = caching.get('users');

// Set with TTL
await cache.set('user:123', userData, 3600);

// Get or compute
const user = await cache.getOrSet(
  'user:456',
  async () => {
    return await db.getUser(456);
  },
  1800
);
```

**Auto-strategy**: Memory (no Redis) → Redis (with `REDIS_URL`)

**[→ Full Cache Documentation](src/cache/README.md)**

### Events

> **Distributed pub/sub events with Redis/Memory strategy**

Event-driven architecture:

```typescript
import { eventing } from '@voilajsx/appkit/event';
const events = eventing.get();

// Subscribe to events
events.on('user.signup', (data) => {
  console.log('New user:', data.email);
});

// Emit events (distributed with Redis)
await events.emit('order.completed', { orderId: 'order-123' });
```

**Auto-strategy**: Memory (single server) → Redis (distributed)

**[→ Full Events Documentation](src/event/README.md)**

### Error

> **Semantic HTTP error handling with Express middleware**

Clean error handling:

```typescript
import { error } from '@voilajsx/appkit/error';
const err = error.get();

// Semantic errors
throw err.badRequest('Email is required');
throw err.unauthorized('Login required');
throw err.notFound('User not found');

// Express integration
app.use(err.handleErrors());
app.post(
  '/users',
  err.asyncRoute(async (req, res) => {
    // Automatic error handling
  })
);
```

**[→ Full Error Documentation](src/error/README.md)**

### Email

> **Auto-provider email sending with template support**

Email that just works:

```typescript
import { emailing } from '@voilajsx/appkit/email';

// Sends to console in dev, real emails in prod
await emailing.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Thanks for signing up!</h1>',
});
```

**Auto-provider**: Console (dev) → Resend/SMTP (prod)

**[→ Full Email Documentation](src/email/README.md)**

### Database

> **Progressive multi-tenancy with automatic adapter selection**

Database that grows with you:

```typescript
import { database } from '@voilajsx/appkit/database';

// Single tenant
const db = await database.get();
const users = await db.user.findMany();

// Multi-tenant (same code!)
const tenantDb = await database.get(); // Auto-filtered by tenant
const orgDb = await database.org('salesforce').get();
```

**Auto-scaling**: Single → Tenant → Multi-org with zero code changes.

**[→ Full Database Documentation](src/database/README.md)**

### Security

> **Enterprise security with CSRF, rate limiting, and encryption**

Security by default:

```typescript
import { security } from '@voilajsx/appkit/security';
const secure = security.get();

// Middleware protection
app.use(secure.forms()); // CSRF protection
app.use('/api', secure.requests()); // Rate limiting

// Input sanitization
const safeName = secure.input(req.body.name);
const encryptedSSN = secure.encrypt(sensitiveData);
```

**[→ Full Security Documentation](src/security/README.md)**

## 🌍 Environment Variables

### Framework Configuration (Single Underscore)

```bash
# AppKit internal variables
VOILA_AUTH_SECRET=your-jwt-secret
VOILA_LOGGING_LEVEL=debug
VOILA_SERVICE_NAME=my-app
```

### Application Configuration (Double Underscore)

```bash
# Your app config (parsed automatically)
DATABASE__HOST=localhost                → config.get('database.host')
API__TIMEOUT=30000                      → config.get('api.timeout')
FEATURES__ANALYTICS__ENABLED=true      → config.get('features.analytics.enabled')
```

### Cloud Service Auto-Detection

```bash
# Storage
AWS_S3_BUCKET=bucket                    → S3 storage
CLOUDFLARE_R2_BUCKET=bucket            → R2 storage (zero egress)

# Cache/Queue/Events
REDIS_URL=redis://localhost:6379       → Redis strategy

# Database
DATABASE_URL=postgres://...             → Database logging/queue

# Email
RESEND_API_KEY=re_...                   → Resend emails
SMTP_HOST=smtp.gmail.com               → SMTP emails

# Monitoring
VOILA_LOGGING_WEBHOOK_URL=https://...   → Slack alerts
```

## 🧪 Testing

Each module includes comprehensive testing utilities:

```typescript
import { utility, logger } from '@voilajsx/appkit';

describe('App Tests', () => {
  beforeEach(() => {
    // Reset instances for clean tests
    utility.clearCache();
    logger.clear();
  });

  test('should process data safely', () => {
    const utils = utility.get();
    const result = utils.get({ user: { name: 'John' } }, 'user.name');
    expect(result).toBe('John');
  });
});
```

## 🚀 Production Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

# Environment variables auto-configure everything
ENV REDIS_URL=redis://redis:6379
ENV DATABASE_URL=postgres://user:pass@db:5432/app
ENV RESEND_API_KEY=re_your_key

CMD ["npm", "start"]
```

### Vercel/Railway/Heroku

```bash
# Just set environment variables
REDIS_URL=redis://...
DATABASE_URL=postgres://...
RESEND_API_KEY=re_...

# Zero configuration needed!
```

## 🤖 AI-First Development

Revolutionary `@llm-rule` system helps AI generate correct code:

```typescript
/**
 * @llm-rule WHEN: Storing user passwords - always hash before database
 * @llm-rule AVOID: Storing plain text passwords - major security vulnerability
 */
```

**Benefits**:

- AI generates secure code by default
- Prevents common vulnerabilities
- Follows framework best practices
- Reduces debugging time

## 📊 Framework Metrics

- **Modules**: 12 essential modules
- **Lines to start**: 2 lines per module
- **Configuration**: 0 required, environment optional
- **Dependencies**: Minimal, peer dependencies where possible
- **Bundle size**: < 50KB per module
- **TypeScript**: Full support with comprehensive types

## 🏆 Why VoilaJSX AppKit?

### **vs Express.js**

- **AppKit**: Batteries included, zero config
- **Express**: Minimal, requires middleware assembly

### **vs NestJS**

- **AppKit**: Simple functions, learn once
- **NestJS**: Decorators, Angular-style complexity

### **vs Next.js**

- **AppKit**: Framework agnostic, backend focused
- **Next.js**: React-specific, full-stack

### **vs Serverless Framework**

- **AppKit**: Environment adaptive, runs anywhere
- **Serverless**: Cloud-specific, vendor lock-in

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md)
for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a></strong><br>
  Because frameworks should be simple, not PhD theses.
</p>
