# VoilaJSX AppKit 🚀

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![AI Ready](https://img.shields.io/badge/AI-Optimized-purple.svg)](https://github.com/voilajsx/appkit)

> **A comprehensive Node.js toolkit designed for modern application
> development**

**Zero configuration. Enterprise features by default. Optimized for both human
developers and AI code generation.**

## 🚀 What VoilaJSX AppKit Really Is

VoilaJSX AppKit is a **complete Node.js development toolkit** that eliminates
the complexity of building production-ready applications. Instead of juggling
dozens of libraries and configuration files, you get 12 integrated modules that
work together seamlessly.

### **How Developers Can Leverage AppKit**

**🎯 For Rapid Development**

- **One function per module**: `authenticator.get()`, `database.get()`,
  `security.get()`
- **Instant setup**: No configuration files, just environment variables
- **Production patterns**: Enterprise-grade security and scalability built-in

**🏗️ For Maintainable Architecture**

- **Consistent APIs**: Same patterns across all modules
- **Progressive complexity**: Start simple, scale to enterprise automatically
- **Type-safe**: Full TypeScript support with intelligent IntelliSense

**⚡ For Performance**

- **Smart defaults**: Memory caching, connection pooling, resource management
- **Auto-scaling**: Modules automatically upgrade (Memory → Redis → Database)
- **Optimized**: Battle-tested patterns for high-throughput applications

## 🤖 Enhanced for AI-Driven Development

While perfectly designed for human developers, AppKit excels in AI-assisted
development:

- **🎯 Predictable Code Generation**: AI agents generate consistent, working
  applications
- **📝 LLM-Optimized Documentation**: Every function includes clear usage
  patterns
- **🔒 Built-in Best Practices**: Security, scalability, and maintainability by
  default
- **⚙️ Non-Ambiguous APIs**: Clear function signatures prevent common mistakes

### **Why This Matters for Developers**

| Traditional Approach                      | VoilaJSX AppKit Approach                |
| ----------------------------------------- | --------------------------------------- |
| Research → Configure → Integrate → Secure | **Import → Use → Deploy**               |
| Multiple libraries, version conflicts     | **Integrated modules, tested together** |
| Manual scaling decisions                  | **Environment-driven auto-scaling**     |
| Security implemented later                | **Security enabled by default**         |
| Inconsistent error handling               | **Unified error patterns**              |

## 🏢 Enterprise Benefits

### **Progressive Complexity**

```typescript
// Day 1: Simple development
const auth = authenticator.get();
const token = auth.signToken({ userId: 123, role: 'user', level: 'basic' });

// Month 6: Multi-tenant (just add environment variable)
// VOILA_DB_TENANT=auto
const db = await database.get(); // Now auto-filtered by tenant

// Year 1: Multi-organization enterprise (same code)
// ORG_ACME=postgresql://acme.aws.com/prod
const acmeDb = await database.org('acme').get(); // Enterprise scaling
```

## 🚀 Quick Start for Developers & AI Agents

### **Installation**

```bash
npm install @voilajsx/appkit
```

### **30-Second Working App**

```typescript
import { authenticator, database, error, logger } from '@voilajsx/appkit';

const auth = authenticator.get();
const db = await database.get();
const err = error.get();
const log = logger.get('api');

// Protected API endpoint
app.post(
  '/api/users',
  auth.requireRole('admin.tenant'),
  err.asyncRoute(async (req, res) => {
    const user = auth.user(req);

    if (!req.body.email) {
      throw err.badRequest('Email required');
    }

    const newUser = await db.user.create({ data: req.body });
    log.info('User created', { userId: newUser.id });

    res.json({ user: newUser });
  })
);
```

**Result**: Production-ready API with authentication, database, error handling,
and logging. **Zero configuration needed.**

## 🎭 Complete Module Ecosystem

### **🔧 Core Infrastructure**

| Module                    | Purpose                            | AI-Optimized Features                    |
| ------------------------- | ---------------------------------- | ---------------------------------------- |
| **[Auth](/auth)**         | JWT tokens, role-based permissions | Semantic role hierarchy, auto-middleware |
| **[Database](/database)** | Multi-tenant, progressive scaling  | Auto-tenant filtering, org management    |
| **[Security](/security)** | CSRF, rate limiting, encryption    | Enterprise-grade by default              |
| **[Error](/error)**       | HTTP status codes, semantic errors | Framework-agnostic middleware            |

### **📊 Data & Communication**

| Module                  | Auto-Scales                | Production Features                 |
| ----------------------- | -------------------------- | ----------------------------------- |
| **[Cache](/cache)**     | Memory → Redis             | Namespace isolation, TTL management |
| **[Storage](/storage)** | Local → S3/R2              | CDN integration, signed URLs        |
| **[Queue](/queue)**     | Memory → Redis → DB        | Background jobs, scheduling         |
| **[Email](/email)**     | Console → SMTP → Resend    | Templates, multi-provider           |
| **[Events](/events)**   | Memory → Redis → WebSocket | Real-time, pub/sub, notifications   |

### **🛠️ Developer Experience**

| Module                  | Purpose                | LLM Benefits                              |
| ----------------------- | ---------------------- | ----------------------------------------- |
| **[Utils](/utils)**     | 12 essential utilities | Safe property access, performance helpers |
| **[Config](/config)**   | Environment variables  | Type-safe, validation included            |
| **[Logging](/logging)** | Structured logging     | Multi-transport, auto-scaling             |

## 🌍 Environment-Driven Progressive Scaling

### **Development** (Zero Configuration)

```bash
npm start  # Memory cache, local storage, console logs
```

### **Production** (Auto-Detection)

```bash
# Set these environment variables - everything scales automatically
DATABASE_URL=postgresql://prod-db/app     # → Database persistence
REDIS_URL=redis://prod-cache:6379         # → Distributed cache/queue
AWS_S3_BUCKET=prod-assets                 # → Cloud storage + CDN
RESEND_API_KEY=re_production_key          # → Professional email
VOILA_DB_TENANT=auto                      # → Multi-tenant mode
```

**Same code. Different environment. Enterprise features automatically enabled.**

## 🏢 Enterprise-Ready Examples

### **Multi-Tenant SaaS API**

```typescript
import { authenticator, database, security, caching } from '@voilajsx/appkit';

const auth = authenticator.get();
const db = await database.get(); // Auto-filtered by tenant
const secure = security.get();
const cache = caching.get('api');

// User endpoint (tenant-isolated)
app.get(
  '/api/users',
  auth.requireLogin(),
  secure.requests(100, 900000), // Rate limiting
  async (req, res) => {
    const users = await cache.getOrSet(
      'users',
      async () => {
        return await db.user.findMany(); // Only current tenant
      },
      300
    );

    res.json(users);
  }
);

// Admin endpoint (cross-tenant access)
app.get(
  '/api/admin/analytics',
  auth.requireRole('admin.system'),
  async (req, res) => {
    const dbAll = await database.getTenants(); // All tenants
    const stats = await dbAll.user.groupBy({
      by: ['tenant_id'],
      _count: true,
    });

    res.json(stats);
  }
);
```

### **Real-Time Chat Application**

```typescript
import { eventing, authenticator, database } from '@voilajsx/appkit';

const events = eventing.get();
const auth = authenticator.get();
const db = await database.get();

// WebSocket connection with authentication
events.onConnection(async (socket) => {
  const token = socket.handshake.auth.token;
  const user = auth.verifyToken(token);

  // Join user to their rooms
  await socket.join(`user:${user.userId}`);
  await socket.join(`tenant:${user.tenant_id}`);

  // Handle chat messages
  socket.on('message', async (data) => {
    const message = await db.message.create({
      data: {
        content: data.content,
        userId: user.userId,
        roomId: data.roomId,
      },
    });

    // Broadcast to room (tenant-isolated)
    events.to(`room:${data.roomId}`).emit('newMessage', {
      id: message.id,
      content: message.content,
      user: { name: user.name },
      timestamp: message.createdAt,
    });
  });

  // Real-time notifications
  socket.on('typing', (data) => {
    socket.to(`room:${data.roomId}`).emit('userTyping', {
      userId: user.userId,
      userName: user.name,
    });
  });
});

// REST API integration
app.post('/api/notifications', auth.requireLogin(), async (req, res) => {
  const user = auth.user(req);

  // Send real-time notification
  events.to(`user:${user.userId}`).emit('notification', {
    type: 'info',
    message: req.body.message,
    timestamp: new Date(),
  });

  res.json({ sent: true });
});
```

```typescript
import { store, queuing, logger, security } from '@voilajsx/appkit';

const storage = store.get();
const queue = queuing.get();
const log = logger.get('upload');
const secure = security.get();

// File upload with background processing
app.post(
  '/upload',
  secure.requests(10, 60000), // 10 uploads per minute
  async (req, res) => {
    // Sanitize filename
    const safeName = secure.input(req.file.originalname);
    const key = `uploads/${Date.now()}-${safeName}`;

    // Store file (auto-detects Local/S3/R2)
    await storage.put(key, req.file.buffer, {
      contentType: req.file.mimetype,
    });

    // Queue background processing
    await queue.add('process-image', {
      key,
      userId: req.user.id,
      originalName: req.file.originalname,
    });

    log.info('File uploaded', { key, userId: req.user.id });

    res.json({
      url: storage.url(key),
      key,
      processing: true,
    });
  }
);

// Background processing
queue.process('process-image', async (data) => {
  const log = logger.get('processor');

  try {
    const buffer = await storage.get(data.key);

    // Process image (resize, optimize, etc.)
    const processed = await processImage(buffer);

    // Store processed version
    const processedKey = data.key.replace('.', '-processed.');
    await storage.put(processedKey, processed);

    log.info('Image processed', {
      original: data.key,
      processed: processedKey,
    });

    return { processedKey };
  } catch (error) {
    log.error('Processing failed', {
      key: data.key,
      error: error.message,
    });
    throw error;
  }
});
```

## 🤖 AI Agent Integration Examples

### **Prompt for Complete Auth System**

```
Create a Node.js API with user authentication, role-based access control,
and protected admin routes using VoilaJSX AppKit.
```

**AI Agent Output** (guaranteed to work):

```typescript
import { authenticator, error, database, logger } from '@voilajsx/appkit';

const auth = authenticator.get();
const err = error.get();
const db = await database.get();
const log = logger.get('auth');

// Login endpoint
app.post(
  '/auth/login',
  err.asyncRoute(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw err.badRequest('Email and password required');
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      throw err.unauthorized('Invalid credentials');
    }

    const isValid = await auth.comparePassword(password, user.password);
    if (!isValid) {
      throw err.unauthorized('Invalid credentials');
    }

    const token = auth.signToken({
      userId: user.id,
      role: user.role,
      level: user.level,
    });

    log.info('User logged in', { userId: user.id });
    res.json({ token, user: { id: user.id, email: user.email } });
  })
);

// Protected user route
app.get(
  '/api/profile',
  auth.requireLogin(),
  err.asyncRoute(async (req, res) => {
    const user = auth.user(req);
    const profile = await db.user.findUnique({
      where: { id: user.userId },
    });
    res.json(profile);
  })
);

// Admin-only route
app.get(
  '/api/admin/users',
  auth.requireRole('admin.tenant'),
  err.asyncRoute(async (req, res) => {
    const users = await db.user.findMany();
    res.json(users);
  })
);

// Error handling middleware (must be last)
app.use(err.handleErrors());
```

### **Prompt for Multi-Tenant Data API**

```
Build a multi-tenant API where users can only see their organization's data,
but admins can access all organizations.
```

**AI Agent Output**:

```typescript
import { database, authenticator, error } from '@voilajsx/appkit';

const auth = authenticator.get();
const err = error.get();

// User data (tenant-isolated)
app.get(
  '/api/projects',
  auth.requireLogin(),
  err.asyncRoute(async (req, res) => {
    const db = await database.get(); // Auto-filtered by user's tenant
    const projects = await db.project.findMany({
      include: { tasks: true },
    });
    res.json(projects); // Only current tenant's projects
  })
);

// Admin data (cross-tenant)
app.get(
  '/api/admin/all-projects',
  auth.requireRole('admin.system'),
  err.asyncRoute(async (req, res) => {
    const dbAll = await database.getTenants(); // All tenants
    const allProjects = await dbAll.project.findMany({
      include: {
        tasks: true,
        _count: { select: { tasks: true } },
      },
    });
    res.json(allProjects); // All organizations' projects
  })
);

// Organization-specific admin access
app.get(
  '/api/admin/org/:orgId/projects',
  auth.requireRole('admin.org'),
  err.asyncRoute(async (req, res) => {
    const { orgId } = req.params;
    const orgDb = await database.org(orgId).get();
    const projects = await orgDb.project.findMany();
    res.json(projects); // Specific organization's projects
  })
);
```

## 🚀 Production Deployment

### **Required Environment Variables**

```bash
# Core Security (Required)
VOILA_AUTH_SECRET=your-super-secure-jwt-secret-minimum-32-chars

# Database (Required)
DATABASE_URL=postgresql://user:pass@host:5432/database

# Production Services (Auto-detected)
REDIS_URL=redis://user:pass@host:6379
AWS_S3_BUCKET=your-bucket
RESEND_API_KEY=re_your_api_key
VOILA_SECURITY_CSRF_SECRET=your-csrf-secret-32-chars

# Multi-tenancy (Optional)
VOILA_DB_TENANT=auto

# Organization Scaling (Optional)
ORG_ACME=postgresql://acme.dedicated.aws.com/prod
ORG_STARTUP=mongodb://startup.azure.com/db
```

### **Docker Production Setup**

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

EXPOSE 3000
CMD ["node", "server.js"]
```

### **Kubernetes Deployment**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: voila-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: voila-app
  template:
    metadata:
      labels:
        app: voila-app
    spec:
      containers:
        - name: app
          image: my-app:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: redis-url
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
```

## 📊 Performance & Scalability

### **Benchmarks**

- **Startup Time**: < 100ms (all modules loaded)
- **Memory Usage**: < 50MB baseline (production)
- **Request Throughput**: 10,000+ req/sec (with Redis)
- **Database Connections**: Automatic pooling and management

### **Scaling Characteristics**

| Environment     | Cache         | Storage     | Queue         | Database      |
| --------------- | ------------- | ----------- | ------------- | ------------- |
| **Development** | Memory        | Local       | Memory        | Single        |
| **Staging**     | Redis         | S3          | Redis         | Single        |
| **Production**  | Redis Cluster | S3/R2 + CDN | Redis Cluster | Read Replicas |
| **Enterprise**  | Multi-region  | Multi-cloud | Distributed   | Multi-tenant  |

## 🧪 Testing & Quality

### **Testing Setup**

```typescript
import { utility, logger, caching, database } from '@voilajsx/appkit';

describe('API Tests', () => {
  beforeEach(() => {
    // Reset modules for clean tests
    utility.clearCache();
  });

  afterEach(async () => {
    // Clean up resources
    await logger.clear();
    await caching.clear();
    await database.clear();
  });

  test('should handle user creation safely', async () => {
    const auth = authenticator.get();
    const utils = utility.get();

    const userData = {
      email: 'test@example.com',
      name: 'Test User',
    };

    // Test safe property access
    const email = utils.get(userData, 'email');
    expect(email).toBe('test@example.com');

    // Test JWT token creation
    const token = auth.signToken({
      userId: 123,
      role: 'user',
      level: 'basic',
    });

    expect(token).toBeDefined();

    // Test token verification
    const payload = auth.verifyToken(token);
    expect(payload.userId).toBe(123);
  });
});
```

### **Code Quality Standards**

- **100% TypeScript**: Full type safety across all modules
- **Comprehensive Tests**: Unit, integration, and e2e testing
- **Security Audits**: Regular dependency and vulnerability scanning
- **Performance Monitoring**: Built-in metrics and observability

## 🔍 SEO & Discovery

### **Keywords & Technologies**

- **Node.js Framework**: Enterprise-grade backend development
- **AI Code Generation**: LLM-optimized, agentic programming
- **Multi-tenant SaaS**: Progressive scaling, organization management
- **Zero Configuration**: Environment-driven, production-ready
- **TypeScript Ready**: Full type safety, modern development
- **Microservices**: Modular architecture, independent scaling
- **JWT Authentication**: Role-based access control, security
- **Real-time Applications**: WebSocket support, event-driven, pub/sub
- **Cloud Native**: Docker, Kubernetes, auto-scaling
- **Developer Experience**: Fast development, maintainable code

### **Use Cases**

- **SaaS Applications**: Multi-tenant, progressive scaling
- **API Backends**: RESTful, GraphQL, real-time
- **E-commerce Platforms**: Payments, inventory, user management
- **Content Management**: File handling, media processing
- **Enterprise Applications**: Security, compliance, audit trails
- **Microservices**: Independent, scalable, maintainable
- **AI Applications**: LLM integration, automated workflows
- **Startup MVPs**: Rapid development, production-ready

## 📚 Learning Resources

### **Quick References**

- [🚀 Getting Started Guide](/docs/getting-started) - Zero to production in 10
  minutes
- [🏗️ Architecture Guide](/docs/architecture) - How modules work together
- [🔒 Security Best Practices](/docs/security) - Production-ready security
- [📈 Scaling Guide](/docs/scaling) - Development to enterprise
- [🤖 AI Integration](/docs/ai-integration) - LLM code generation patterns

### **Module Documentation**

- [Authentication & Authorization](/docs/auth) - JWT, roles, permissions
- [Database & Multi-tenancy](/docs/database) - Progressive scaling,
  organizations
- [File Storage & CDN](/docs/storage) - Local to cloud, automatic optimization
- [Caching & Performance](/docs/cache) - Memory to Redis, namespace isolation
- [Background Jobs](/docs/queue) - Processing, scheduling, reliability
- [Email & Communications](/docs/email) - Multi-provider, templates
- [Real-time Events](/docs/events) - WebSocket, pub/sub, notifications
- [Security & Compliance](/docs/security) - CSRF, encryption, rate limiting
- [Error Handling](/docs/error) - HTTP status codes, semantic errors
- [Logging & Observability](/docs/logging) - Structured, multi-transport
- [Configuration Management](/docs/config) - Environment-driven, type-safe
- [Utilities & Helpers](/docs/utils) - 12 essential developer tools

## 🌟 Community & Support

### **Getting Help**

- 📖 [Documentation](https://docs.voilajsx.com) - Comprehensive guides and API
  reference
- 💬 [Discord Community](https://discord.gg/voilajsx) - Real-time help and
  discussions
- 🐙 [GitHub Issues](https://github.com/voilajsx/appkit/issues) - Bug reports
  and feature requests
- 🐦 [Twitter Updates](https://twitter.com/voilajsx) - Latest news and tips
- 📧 [Email Support](mailto:support@voilajsx.com) - Direct support for
  enterprises

### **Contributing**

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for:

- 🐛 Bug fixes and improvements
- 📝 Documentation enhancements
- ✨ New module features
- 🧪 Test coverage improvements
- 💡 Feature suggestions

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx) - See [LICENSE](LICENSE) for
details.

---

<p align="center">
  <strong>🚀 Built for the AI-first future of software development</strong><br>
  <strong>Where enterprise applications are generated, not written</strong><br><br>
  <a href="https://github.com/voilajsx/appkit">⭐ Star us on GitHub</a> • 
  <a href="https://discord.gg/voilajsx">💬 Join our Discord</a> • 
  <a href="https://twitter.com/voilajsx">🐦 Follow on Twitter</a> • 
  <a href="https://docs.voilajsx.com">📖 Read the Docs</a>
</p>

---

### **🔖 Tags**

`nodejs` `typescript` `framework` `ai-ready` `enterprise` `multi-tenant` `saas`
`microservices` `jwt-authentication` `zero-config` `production-ready`
`agentic-ai` `llm-optimized` `progressive-scaling` `real-time` `websocket`
`pub-sub` `developer-experience`
