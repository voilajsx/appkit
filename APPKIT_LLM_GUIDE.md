# VoilaJSX AppKit LLM Implementation Guide

> **Complete guide for AI/LLM systems to correctly implement VoilaJSX AppKit
> modules**

This guide provides clear decision trees, usage patterns, and implementation
examples specifically designed for Large Language Models to generate correct,
secure, and performant code using VoilaJSX AppKit.

## 🎯 Core Implementation Principles

### **Universal Pattern - ALWAYS Follow This**

```typescript
// 1. Import the module
import { moduleExport } from '@voilajsx/appkit/module';

// 2. Get instance (ONE function per module)
const instance = moduleExport.get();

// 3. Use methods directly
instance.method(args);
```

### **Decision Framework for LLMs**

```
1. Identify user requirement
2. Map to appropriate module(s)
3. Check environment needs
4. Implement with error handling
5. Follow security best practices
```

---

## 📦 Module 1: Utils - The Foundation

### **When to Use Utils**

```typescript
// ✅ ALWAYS use for these scenarios:
// - Accessing nested object properties
// - Checking if values are empty
// - Creating URL-friendly strings
// - Processing arrays (chunking, deduplication)
// - Debouncing function calls
// - Extracting object properties
// - Constraining numbers to ranges
// - Formatting file sizes
// - Text truncation with word preservation
// - Async delays
// - Generating unique IDs

// ❌ DON'T use for:
// - Complex data transformations (use dedicated libraries)
// - Heavy computational tasks
// - DOM manipulation
// - File system operations
```

### **LLM Decision Tree**

```
User needs data manipulation?
├─ Nested object access? → utils.get()
├─ Empty value check? → utils.isEmpty()
├─ URL from text? → utils.slugify()
├─ Split array? → utils.chunk()
├─ Remove duplicates? → utils.unique()
├─ Extract object fields? → utils.pick()
├─ Debounce function? → utils.debounce()
├─ Constrain number? → utils.clamp()
├─ Format file size? → utils.formatBytes()
├─ Truncate text? → utils.truncate()
├─ Async delay? → utils.sleep()
├─ Generate ID? → utils.uuid()
└─ Complex transformation? → Use specialized library
```

### **Implementation Patterns**

#### **Safe Property Access (95% use case)**

```typescript
import { utility } from '@voilajsx/appkit/utils';
const utils = utility.get();

// ✅ ALWAYS use instead of direct access
const userName = utils.get(user, 'profile.name', 'Guest');
const avatar = utils.get(user, 'profile.avatar.url');
const firstItem = utils.get(data, 'items[0].title', 'No items');

// ❌ NEVER do direct access (crashes on undefined)
// const userName = user.profile.name; // DANGEROUS
```

#### **Form Validation Pattern**

```typescript
const validateForm = (data) => {
  const errors = {};

  // Use isEmpty for all validation checks
  if (utils.isEmpty(utils.get(data, 'name'))) {
    errors.name = 'Name is required';
  }

  if (utils.isEmpty(utils.get(data, 'email'))) {
    errors.email = 'Email is required';
  }

  return {
    isValid: utils.isEmpty(errors),
    errors,
  };
};
```

#### **API Response Processing**

```typescript
// Process API responses safely
const processApiResponse = (response) => {
  const items = utils.get(response, 'data.items', []);
  const batches = utils.chunk(items, 50); // Pagination

  return batches.map((batch) =>
    batch.map((item) => utils.pick(item, ['id', 'title', 'status']))
  );
};
```

#### **Search with Debouncing**

```typescript
// Performance optimization for search
const searchHandler = utils.debounce((query) => {
  if (!utils.isEmpty(query)) {
    performSearch(query);
  }
}, 300); // 300ms delay

// Usage in React/Vue components
const handleSearchInput = (event) => {
  searchHandler(event.target.value);
};
```

#### **Data Extraction for APIs**

```typescript
// Extract safe user data for API responses
const extractUserData = (user) => ({
  id: utils.get(user, 'id'),
  name: utils.get(user, 'profile.displayName', 'Anonymous'),
  avatar: utils.get(user, 'profile.avatar.url'),
  slug: utils.slugify(utils.get(user, 'profile.displayName', '')),
  joinedAt: utils.get(user, 'metadata.createdAt'),
});
```

### **Environment Configuration**

```bash
# Optional performance tuning
VOILA_UTILS_CACHE=true                 # Enable caching (default: true)
VOILA_UTILS_PERFORMANCE=true           # Enable optimizations (default: true)
VOILA_UTILS_DEBUG=false                # Debug logging (default: false in production)
```

---

## 🔐 Module 2: Auth - Security Foundation

### **When to Use Auth**

```typescript
// ✅ ALWAYS use for:
// - User registration and login
// - JWT token management
// - Password hashing and verification
// - Route protection with roles
// - Permission-based access control
// - Multi-level authorization (user.basic → admin.system)

// ❌ DON'T use for:
// - Simple applications with no user accounts
// - Static websites
// - Public APIs with no authentication
// - Third-party OAuth integration (use passport.js)
```

### **LLM Decision Tree**

```
User needs authentication?
├─ User registration? → auth.hashPassword() + signToken()
├─ User login? → auth.comparePassword() + signToken()
├─ Verify token? → auth.verifyToken()
├─ Extract user from request? → auth.user(req)
├─ Protect route by role? → auth.requireRole()
├─ Protect by permission? → auth.requirePermission()
├─ Simple role hierarchy? → Use custom roles
├─ Enterprise hierarchy? → Use built-in role.level
└─ OAuth integration? → Use passport.js + AppKit
```

### **Implementation Patterns**

#### **User Registration (Complete Flow)**

```typescript
import { authenticator } from '@voilajsx/appkit/auth';
const auth = authenticator.get();

app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Hash password securely
    const hashedPassword = await auth.hashPassword(password);

    // Create user in database
    const user = await db.createUser({
      email,
      name,
      password: hashedPassword,
      role: 'user', // Start with basic role
      level: 'basic', // Start with basic level
    });

    // Generate JWT token with role.level structure
    const token = auth.signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      level: user.level,
      permissions: ['manage:own'], // Basic permissions
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});
```

#### **User Login (Complete Flow)**

```typescript
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await auth.comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate new token
    const token = auth.signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      level: user.level,
      permissions: user.permissions || [],
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});
```

#### **Route Protection Patterns**

```typescript
// Basic user access (any authenticated user)
app.get('/dashboard', auth.requireRole('user.basic'), (req, res) => {
  const user = auth.user(req); // Safe user extraction
  res.json({ message: `Welcome ${user.email}` });
});

// Moderator access (inherits from user)
app.get('/moderate', auth.requireRole('moderator.review'), (req, res) => {
  res.json({ message: 'Moderator panel' });
});

// Admin tenant access
app.get('/admin/tenant', auth.requireRole('admin.tenant'), (req, res) => {
  res.json({ message: 'Tenant admin panel' });
});

// Permission-based access
app.post('/content', auth.requirePermission('create:tenant'), (req, res) => {
  res.json({ message: 'Content created' });
});

// System-level access (highest privilege)
app.get('/admin/system', auth.requireRole('admin.system'), (req, res) => {
  res.json({ message: 'System administration' });
});
```

#### **Express vs Fastify Integration**

```typescript
// Express (use Express variants)
app.get('/profile', auth.requireLoginExpress(), (req, res) => {
  const user = auth.user(req);
  res.json({ user });
});

// Fastify (use regular methods)
fastify.get(
  '/profile',
  { preHandler: auth.requireLogin() },
  async (request, reply) => {
    const user = auth.user(request);
    return { user };
  }
);
```

#### **Role Hierarchy Examples**

```typescript
// Built-in hierarchy (recommended for enterprise)
const roles = {
  'user.basic': 1, // Basic user access
  'user.pro': 2, // Pro user features
  'user.max': 3, // Maximum user features
  'moderator.review': 4, // Content review
  'moderator.approve': 5, // Content approval
  'moderator.manage': 6, // User management
  'admin.tenant': 7, // Tenant administration
  'admin.org': 8, // Organization administration
  'admin.system': 9, // System administration
};

// Custom hierarchy (for specific domains)
const customRoles = {
  patient: 1,
  nurse: 2,
  doctor: 3,
  admin: 4,
};
```

### **Environment Configuration**

```bash
# Required
VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024-minimum-32-chars

# Optional
VOILA_AUTH_EXPIRES_IN=7d               # Token expiration (default: 7d)
VOILA_AUTH_ALGORITHM=HS256             # JWT algorithm (default: HS256)
VOILA_AUTH_ISSUER=your-app-name        # Token issuer (default: appkit)

# Custom roles (optional - overrides built-in hierarchy)
VOILA_AUTH_ROLES=user:1,moderator:2,admin:3
```

### **Security Best Practices for LLMs**

```typescript
// ✅ ALWAYS hash passwords before storing
const hashedPassword = await auth.hashPassword(password);

// ✅ ALWAYS use auth.user() for safe user extraction
const user = auth.user(req); // Returns null if not authenticated

// ✅ ALWAYS validate token before processing
try {
  const payload = auth.verifyToken(token);
} catch (error) {
  // Handle invalid/expired token
}

// ❌ NEVER store plain text passwords
// await db.createUser({ password }); // DANGEROUS

// ❌ NEVER access req.user directly
// const user = req.user; // Can crash when undefined

// ❌ NEVER skip token validation
// const payload = jwt.decode(token); // DANGEROUS - no verification
```

---

## ⚙️ Module 3: Config - Environment Management

### **When to Use Config**

```typescript
// ✅ ALWAYS use for:
// - Environment variable parsing
// - Application configuration management
// - Feature flag implementation
// - Database connection settings
// - API configuration
// - Service credentials (non-secret)

// ❌ DON'T use for:
// - Secret management (use dedicated secret stores)
// - Runtime configuration changes
// - User preferences storage
// - Session data
```

### **LLM Decision Tree**

```
User needs configuration?
├─ Environment variables? → configure.get() → config.get('path')
├─ Database settings? → config.get('database.*')
├─ API configuration? → config.get('api.*')
├─ Feature flags? → config.get('features.*')
├─ Required config validation? → configure.validateRequired()
├─ Module-specific config? → configure.getModuleConfig()
├─ Environment detection? → configure.isDevelopment/isProduction()
└─ Runtime config changes? → Use database/cache instead
```

### **Implementation Patterns**

#### **Environment Variable Convention**

```bash
# ✅ Framework variables (single underscore) - NOT parsed
VOILA_AUTH_SECRET=jwt-secret           # AppKit internal
VOILA_LOGGING_LEVEL=debug             # AppKit internal

# ✅ Application variables (double underscore) - PARSED into config
DATABASE__HOST=localhost               # → config.get('database.host')
DATABASE__PORT=5432                   # → config.get('database.port')
DATABASE__CREDENTIALS__USER=admin     # → config.get('database.credentials.user')

API__BASE_URL=https://api.example.com  # → config.get('api.base_url')
API__TIMEOUT=30000                    # → config.get('api.timeout')

FEATURES__ANALYTICS__ENABLED=true     # → config.get('features.analytics.enabled')
```

#### **Database Configuration Pattern**

```typescript
import { configure } from '@voilajsx/appkit/config';
const config = configure.get();

// Database connection setup
const dbConfig = {
  host: config.get('database.host', 'localhost'),
  port: config.get('database.port', 5432),
  database: config.get('database.name', 'myapp'),
  username: config.get('database.credentials.user', 'postgres'),
  password: config.get('database.credentials.password'),

  // Connection pool settings
  pool: {
    min: config.get('database.pool.min', 2),
    max: config.get('database.pool.max', 10),
  },

  // SSL configuration
  ssl: config.get('database.ssl.enabled', false),
};

// Validate required configuration
if (configure.isProduction()) {
  configure.validateRequired([
    'database.host',
    'database.credentials.password',
  ]);
}
```

#### **API Client Configuration**

```typescript
// External API configuration
const apiConfig = {
  baseURL: config.get('api.base_url', 'https://api.example.com'),
  timeout: config.get('api.timeout', 30000),
  retries: config.get('api.retries', 3),
  rateLimit: config.get('api.rate_limit', 1000),

  // Authentication
  apiKey: config.get('api.credentials.key'),

  // Headers
  headers: {
    'User-Agent': config.get('api.user_agent', 'MyApp/1.0'),
    Accept: 'application/json',
  },
};

// Create HTTP client with configuration
const httpClient = axios.create(apiConfig);
```

#### **Feature Flags Implementation**

```typescript
// Feature flag management
class FeatureFlags {
  static isEnabled(feature: string): boolean {
    return config.get(`features.${feature}.enabled`, false);
  }

  static getConfig(feature: string, defaultValue: any = null) {
    return config.get(`features.${feature}`, defaultValue);
  }
}

// Usage in application
if (FeatureFlags.isEnabled('analytics')) {
  // Initialize analytics
  const analyticsConfig = FeatureFlags.getConfig('analytics');
  initAnalytics(analyticsConfig);
}

if (FeatureFlags.isEnabled('beta_ui')) {
  // Show beta UI features
  showBetaFeatures();
}
```

#### **Environment-Specific Logic**

```typescript
// Environment-based configuration
if (configure.isDevelopment()) {
  // Development-specific settings
  app.use(cors({ origin: '*' }));
  app.use(morgan('dev'));

  // Enable debug features
  const debugPort = config.get('debug.port', 9229);
  enableDebugger(debugPort);
}

if (configure.isProduction()) {
  // Production optimizations
  app.use(compression());
  app.use(helmet());

  // Validate critical configuration
  configure.validateRequired([
    'database.url',
    'redis.url',
    'api.credentials.key',
  ]);
}

if (configure.isTest()) {
  // Test-specific settings
  const testDb = config.get('test.database.url', 'sqlite::memory:');
  setupTestDatabase(testDb);
}
```

#### **Module Configuration Pattern**

```typescript
// Get configuration for specific modules
const emailConfig = configure.getModuleConfig('email', {
  provider: 'console',
  from: 'noreply@example.com',
});

const storageConfig = configure.getModuleConfig('storage', {
  provider: 'local',
  directory: './uploads',
});

const cacheConfig = configure.getModuleConfig('cache', {
  provider: 'memory',
  ttl: 3600,
});
```

### **Environment Configuration Examples**

```bash
# Development
NODE_ENV=development
DATABASE__HOST=localhost
DATABASE__PORT=5432
FEATURES__DEBUG__ENABLED=true

# Staging
NODE_ENV=staging
DATABASE__HOST=staging-db.example.com
DATABASE__PORT=5432
FEATURES__ANALYTICS__ENABLED=true
FEATURES__DEBUG__ENABLED=false

# Production
NODE_ENV=production
DATABASE__HOST=prod-db.example.com
DATABASE__PORT=5432
DATABASE__SSL__ENABLED=true
FEATURES__ANALYTICS__ENABLED=true
FEATURES__DEBUG__ENABLED=false
API__RATE_LIMIT=10000
```

### **Configuration Validation Patterns**

```typescript
// Startup configuration validation
try {
  configure.validateRequired(['database.host', 'api.credentials.key']);

  console.log('✅ Configuration validation passed');
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  process.exit(1);
}

// Runtime configuration access with validation
function getConfigValue<T>(
  path: string,
  validator?: (value: any) => boolean
): T {
  const value = config.get<T>(path);

  if (validator && !validator(value)) {
    throw new Error(`Invalid configuration value for ${path}: ${value}`);
  }

  return value;
}

// Usage
const maxRetries = getConfigValue<number>(
  'api.retries',
  (val) => val > 0 && val <= 10
);
```

---

## 📝 Module 4: Logging - Observability Foundation

### **When to Use Logging**

```typescript
// ✅ ALWAYS use for:
// - Application events and state changes
// - Error tracking and debugging
// - Performance monitoring
// - User action auditing
// - System health monitoring
// - Request/response logging
// - Security event tracking

// ❌ DON'T use for:
// - Sensitive data logging (passwords, API keys, PII)
// - High-frequency events that flood logs
// - Temporary debugging (use console.log temporarily)
// - Binary data logging
```

### **LLM Decision Tree**

```
User needs logging?
├─ Application startup/shutdown? → log.info()
├─ User actions (login, signup)? → log.info() with metadata
├─ System errors? → log.error() with error details
├─ Performance issues? → log.warn() with metrics
├─ Security events? → log.warn() or log.error()
├─ Development debugging? → log.debug()
├─ Different app components? → logger.get('component')
├─ Request context? → log.child({ requestId })
├─ External service logs? → Use HTTP transport
├─ Team notifications? → Use webhook transport
└─ Sensitive data? → DON'T log, use audit trail instead
```

### **Implementation Patterns**

#### **Basic Application Logging**

```typescript
import { logger } from '@voilajsx/appkit/logging';
const log = logger.get();

// Application lifecycle
app.listen(port, () => {
  log.info('🚀 Application started', {
    port,
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  });
});

process.on('SIGTERM', () => {
  log.info('📴 Application shutting down', { signal: 'SIGTERM' });
  process.exit(0);
});

// Error handling
process.on('uncaughtException', (error) => {
  log.error('💥 Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
```

#### **Component-Based Logging**

```typescript
// Create component-specific loggers
const authLog = logger.get('auth');
const dbLog = logger.get('database');
const apiLog = logger.get('api');

// Database operations
dbLog.info('📊 Database connected', {
  host: dbConfig.host,
  database: dbConfig.database,
});

dbLog.warn('⚠️ Slow query detected', {
  query: 'SELECT * FROM users',
  duration: '2.3s',
  table: 'users',
});

// Authentication events
authLog.info('✅ User login successful', {
  userId: user.id,
  email: user.email,
  role: user.role,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
});

authLog.warn('⚠️ Failed login attempt', {
  email: attemptedEmail,
  ip: req.ip,
  reason: 'invalid_password',
});
```

#### **Request Logging Middleware**

```typescript
// Express middleware for request logging
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();

  // Create request-scoped logger
  req.log = logger.get('api').child({
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });

  const startTime = Date.now();

  req.log.info('📨 Request started');

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    req.log.info('📤 Request completed', {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
    });
  });

  next();
});

// Usage in routes
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    req.log.debug('Fetching user', { userId: id });

    const user = await db.getUser(id);
    if (!user) {
      req.log.warn('User not found', { userId: id });
      return res.status(404).json({ error: 'User not found' });
    }

    req.log.info('User fetched successfully', {
      userId: id,
      userRole: user.role,
    });

    res.json({ user });
  } catch (error) {
    req.log.error('Failed to fetch user', {
      userId: id,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({ error: 'Internal server error' });
  }
});
```

#### **Error Logging with Context**

```typescript
// Enhanced error logging
class ErrorLogger {
  static logError(error: Error, context: any = {}) {
    const log = logger.get('error');

    log.error('💥 Application error', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...context,
    });
  }

  static logApiError(error: Error, req: any) {
    this.logError(error, {
      method: req.method,
      url: req.url,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  static logDatabaseError(error: Error, query: string) {
    this.logError(error, {
      type: 'database_error',
      query: query.substring(0, 200), // Truncate long queries
      database: process.env.DATABASE_NAME,
    });
  }
}

// Usage
try {
  await db.updateUser(userId, userData);
} catch (error) {
  ErrorLogger.logDatabaseError(error, 'UPDATE users SET ...');
  throw error;
}
```

#### **Performance Monitoring**

```typescript
// Performance logging helper
class PerformanceLogger {
  private static timers = new Map();

  static startTimer(operation: string, context: any = {}) {
    const timerId = `${operation}_${Date.now()}_${Math.random()}`;
    this.timers.set(timerId, {
      operation,
      context,
      startTime: Date.now(),
    });
    return timerId;
  }

  static endTimer(timerId: string) {
    const timer = this.timers.get(timerId);
    if (!timer) return;

    const duration = Date.now() - timer.startTime;
    const log = logger.get('performance');

    log.info('⏱️ Operation completed', {
      operation: timer.operation,
      duration: `${duration}ms`,
      ...timer.context,
    });

    // Warn on slow operations
    if (duration > 1000) {
      log.warn('🐌 Slow operation detected', {
        operation: timer.operation,
        duration: `${duration}ms`,
        ...timer.context,
      });
    }

    this.timers.delete(timerId);
  }
}

// Usage
const timerId = PerformanceLogger.startTimer('database_query', {
  table: 'users',
  operation: 'SELECT',
});

const users = await db.getUsers();
PerformanceLogger.endTimer(timerId);
```

### **Security Logging Patterns**

```typescript
// Security event logging
const securityLog = logger.get('security');

// ✅ SAFE: Log security events without sensitive data
securityLog.warn('🔓 Authentication failed', {
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  attemptedEmail: email, // OK to log email
  reason: 'invalid_password',
  timestamp: new Date().toISOString(),
});

// ✅ SAFE: Log access patterns
securityLog.info('🔑 Admin access granted', {
  userId: user.id,
  role: user.role,
  action: 'user_management',
  ip: req.ip,
});

// ❌ NEVER log sensitive data
securityLog.error('Login attempt', {
  password: plainTextPassword, // DANGEROUS
  apiKey: req.headers.authorization, // DANGEROUS
  creditCard: userData.payment.card, // DANGEROUS
});

// ✅ SAFE: Log payment events without sensitive data
securityLog.info('💳 Payment processed', {
  userId: user.id,
  amount: payment.amount,
  currency: payment.currency,
  cardLast4: payment.card.last4, // Only last 4 digits
  transactionId: payment.id,
});
```

### **Environment Configuration**

```bash
# Basic logging
VOILA_LOGGING_LEVEL=info               # debug, info, warn, error
VOILA_LOGGING_CONSOLE=true             # Console output (default: true)

# File logging
VOILA_LOGGING_FILE=true                # File output (default: true)
VOILA_LOGGING_DIR=./logs               # Log directory
VOILA_LOGGING_FILE_SIZE=50000000       # 50MB rotation
VOILA_LOGGING_FILE_RETENTION=30        # 30 days retention

# Database logging (auto-enabled if DATABASE_URL exists)
DATABASE_URL=postgres://user:pass@host/db

# External service logging
VOILA_LOGGING_HTTP_URL=https://logs.datadog.com/api/v1/logs

# Slack notifications (errors only by default)
VOILA_LOGGING_WEBHOOK_URL=https://hooks.slack.com/services/xxx
VOILA_LOGGING_WEBHOOK_LEVEL=error

# Service identification
VOILA_SERVICE_NAME=my-app
VOILA_SERVICE_VERSION=1.0.0
```

---

## 📁 Module 5: Storage - File Management

### **When to Use Storage**

```typescript
// ✅ ALWAYS use for:
// - User file uploads (avatars, documents)
// - Static asset management
// - Backup and archive storage
// - Generated content (reports, exports)
// - Media files (images, videos)
// - Document management systems

// ❌ DON'T use for:
// - Database data storage
// - Session storage
// - Cache storage
// - Configuration files
// - Temporary processing files (use /tmp)
```

### **LLM Decision Tree**

```
User needs file storage?
├─ File upload? → storage.put()
├─ File download? → storage.get()
├─ File deletion? → storage.delete()
├─ File listing? → storage.list()
├─ Public file access? → storage.url()
├─ Private file access? → storage.signedUrl()
├─ File existence check? → storage.exists()
├─ File copying? → storage.copy()
├─ Development/testing? → Local strategy (auto)
├─ Production/scaling? → S3/R2 strategy (env vars)
└─ Temporary files? → Use /tmp directory instead
```

### **Implementation Patterns**

#### **File Upload Handling**

```typescript
import { store } from '@voilajsx/appkit/storage';
import multer from 'multer';

const storage = store.get();
const upload = multer({ storage: multer.memoryStorage() });

// Avatar upload endpoint
app.post('/users/:id/avatar', upload.single('avatar'), async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.originalname.split('.').pop();
    const filename = `avatars/${id}/${timestamp}.${extension}`;

    // Upload to storage
    await storage.put(filename, file.buffer, {
      contentType: file.mimetype,
      metadata: {
        userId: id,
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Update user avatar URL
    const avatarUrl = storage.url(filename);
    await db.updateUser(id, { avatarUrl });

    res.json({
      success: true,
      avatarUrl,
      filename,
    });
  } catch (error) {
    console.error('Avatar upload failed:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

#### **Document Management System**

```typescript
class DocumentManager {
  private storage = store.get();

  async uploadDocument(
    file: Buffer,
    metadata: {
      userId: string;
      category: string;
      filename: string;
      contentType: string;
    }
  ) {
    const { userId, category, filename } = metadata;
    const timestamp = Date.now();
    const key = `documents/${userId}/${category}/${timestamp}-${filename}`;

    await this.storage.put(key, file, {
      contentType: metadata.contentType,
      metadata: {
        userId,
        category,
        originalName: filename,
        uploadedAt: new Date().toISOString(),
      },
    });

    return {
      documentId: key,
      url: this.storage.url(key),
      category,
      uploadedAt: new Date(),
    };
  }

  async getUserDocuments(userId: string, category?: string) {
    const prefix = category
      ? `documents/${userId}/${category}/`
      : `documents/${userId}/`;

    const files = await this.storage.list(prefix);

    return files.map((file) => ({
      documentId: file.key,
      filename: file.key.split('/').pop(),
      category: file.key.split('/')[2],
      size: file.size,
      lastModified: file.lastModified,
      url: this.storage.url(file.key),
    }));
  }

  async generateShareLink(documentId: string, expiresInHours: number = 24) {
    const expiresIn = expiresInHours * 3600; // Convert to seconds
    const signedUrl = await this.storage.signedUrl(documentId, expiresIn);

    return {
      url: signedUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      expiresInHours,
    };
  }

  async deleteDocument(documentId: string) {
    return await this.storage.delete(documentId);
  }
}

// Usage
const docManager = new DocumentManager();

app.post('/documents', upload.single('document'), async (req, res) => {
  const { category } = req.body;
  const file = req.file;

  const document = await docManager.uploadDocument(file.buffer, {
    userId: req.user.id,
    category,
    filename: file.originalname,
    contentType: file.mimetype,
  });

  res.json(document);
});
```

#### **Image Processing Pipeline**

```typescript
import sharp from 'sharp';

class ImageProcessor {
  private storage = store.get();

  async processAndStoreImage(
    imageBuffer: Buffer,
    basePath: string,
    options: {
      formats?: ('webp' | 'jpeg' | 'png')[];
      sizes?: { name: string; width: number; height?: number }[];
    } = {}
  ) {
    const {
      formats = ['webp', 'jpeg'],
      sizes = [
        { name: 'thumb', width: 150, height: 150 },
        { name: 'medium', width: 500 },
        { name: 'large', width: 1200 },
      ],
    } = options;

    const results = [];

    // Process each size and format combination
    for (const size of sizes) {
      for (const format of formats) {
        try {
          let processor = sharp(imageBuffer).resize(size.width, size.height, {
            fit: 'cover',
            withoutEnlargement: true,
          });

          // Apply format-specific optimization
          switch (format) {
            case 'webp':
              processor = processor.webp({ quality: 85 });
              break;
            case 'jpeg':
              processor = processor.jpeg({ quality: 85, mozjpeg: true });
              break;
            case 'png':
              processor = processor.png({ compressionLevel: 9 });
              break;
          }

          const processedBuffer = await processor.toBuffer();
          const filename = `${basePath}-${size.name}.${format}`;

          await this.storage.put(filename, processedBuffer, {
            contentType: `image/${format}`,
            metadata: {
              size: size.name,
              format,
              width: size.width,
              height: size.height || 'auto',
            },
          });

          results.push({
            size: size.name,
            format,
            filename,
            url: this.storage.url(filename),
          });
        } catch (error) {
          console.error(`Failed to process ${size.name} ${format}:`, error);
        }
      }
    }

    return results;
  }

  async cleanupOldImages(basePath: string) {
    const files = await this.storage.list(basePath);

    for (const file of files) {
      if (
        file.key.includes('-thumb.') ||
        file.key.includes('-medium.') ||
        file.key.includes('-large.')
      ) {
        await this.storage.delete(file.key);
      }
    }
  }
}
```

#### **Backup and Archive System**

```typescript
class BackupManager {
  private storage = store.get();

  async createBackup(sourcePrefix: string) {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const backupPrefix = `backups/${timestamp}/`;

    const sourceFiles = await this.storage.list(sourcePrefix);
    const backupResults = [];

    for (const file of sourceFiles) {
      try {
        const fileData = await this.storage.get(file.key);
        const backupKey = `${backupPrefix}${file.key}`;

        await this.storage.put(backupKey, fileData, {
          contentType: file.contentType,
          metadata: {
            originalKey: file.key,
            backupDate: timestamp,
            originalSize: file.size,
          },
        });

        backupResults.push({
          original: file.key,
          backup: backupKey,
          size: file.size,
        });
      } catch (error) {
        console.error(`Failed to backup ${file.key}:`, error);
      }
    }

    return {
      backupDate: timestamp,
      backupPrefix,
      filesBackedUp: backupResults.length,
      files: backupResults,
    };
  }

  async cleanupOldBackups(retentionDays: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const backups = await this.storage.list('backups/');

    for (const backup of backups) {
      const datePart = backup.key.split('/')[1]; // Extract date from backups/YYYY-MM-DD/...
      const backupDate = new Date(datePart);

      if (backupDate < cutoffDate) {
        await this.storage.delete(backup.key);
      }
    }
  }
}
```

### **Environment Configuration**

```bash
# Local storage (development)
# No configuration needed - auto-detected

# AWS S3 (production)
AWS_S3_BUCKET=my-app-storage
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Cloudflare R2 (recommended - zero egress fees)
CLOUDFLARE_R2_BUCKET=my-app-storage
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...

# Custom domain for public URLs
VOILA_STORAGE_PUBLIC_URL=https://cdn.myapp.com

# Local storage customization
VOILA_STORAGE_LOCAL_DIR=./uploads
VOILA_STORAGE_LOCAL_BASE_URL=http://localhost:3000/uploads
```

---

## 🔄 Module 6: Queue - Background Processing

### **When to Use Queue**

```typescript
// ✅ ALWAYS use for:
// - Email sending (async)
// - Image/video processing
// - Data import/export operations
// - Report generation
// - Webhook delivery
// - Notification sending
// - Cleanup tasks
// - Third-party API calls

// ❌ DON'T use for:
// - Real-time responses (use direct processing)
// - Simple synchronous operations
// - Database transactions that need immediate consistency
// - User-facing operations that need instant feedback
```

### **LLM Decision Tree**

```
User needs background processing?
├─ Send emails? → queue.add('email', data)
├─ Process images? → queue.add('image-process', data)
├─ Generate reports? → queue.add('report', data)
├─ Send webhooks? → queue.add('webhook', data)
├─ Cleanup tasks? → queue.add('cleanup', data)
├─ Delayed execution? → queue.schedule(jobType, data, delay)
├─ High priority task? → queue.add(type, data, { priority: 10 })
├─ Job monitoring? → queue.getStats()
├─ Development/testing? → Memory transport (auto)
├─ Production/scaling? → Redis/Database transport (env vars)
└─ Real-time processing? → Process directly, don't queue
```

### **Implementation Patterns**

#### **Email Queue System**

```typescript
import { queuing } from '@voilajsx/appkit/queue';
const queue = queuing.get();

// Email processor
queue.process('email', async (data) => {
  const { to, subject, html, template, templateData } = data;

  try {
    if (template) {
      // Send templated email
      await emailService.sendTemplate(template, {
        to,
        subject,
        data: templateData,
      });
    } else {
      // Send regular email
      await emailService.send({
        to,
        subject,
        html,
      });
    }

    return {
      sent: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error; // Will trigger retry
  }
});

// Queue emails from application
async function sendWelcomeEmail(user: any) {
  await queue.add(
    'email',
    {
      to: user.email,
      template: 'welcome',
      templateData: {
        name: user.name,
        loginUrl: `${process.env.APP_URL}/login`,
      },
    },
    {
      priority: 5, // Normal priority
      attempts: 3, // Retry up to 3 times
    }
  );
}

async function sendPasswordReset(user: any, resetToken: string) {
  await queue.add(
    'email',
    {
      to: user.email,
      template: 'password-reset',
      templateData: {
        name: user.name,
        resetUrl: `${process.env.APP_URL}/reset?token=${resetToken}`,
      },
    },
    {
      priority: 8, // High priority
      attempts: 5, // Important email, more retries
    }
  );
}
```

#### **Image Processing Queue**

```typescript
// Image processing job
queue.process('image-process', async (data) => {
  const { imageUrl, userId, sizes = ['thumb', 'medium', 'large'] } = data;

  try {
    // Download original image
    const response = await fetch(imageUrl);
    const imageBuffer = await response.buffer();

    const results = [];

    // Process different sizes
    for (const size of sizes) {
      const processed = await processImageSize(imageBuffer, size);
      const filename = `images/${userId}/${size}-${Date.now()}.webp`;

      // Upload processed image
      await storage.put(filename, processed, {
        contentType: 'image/webp',
      });

      results.push({
        size,
        url: storage.url(filename),
      });
    }

    // Update database with processed images
    await db.updateUserImages(userId, results);

    return {
      processed: results.length,
      images: results,
    };
  } catch (error) {
    console.error('Image processing failed:', error);
    throw error;
  }
});

// Queue image processing
app.post(
  '/users/:id/upload-image',
  upload.single('image'),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;

    // Store original image
    const originalKey = `images/${id}/original-${Date.now()}.${file.originalname.split('.').pop()}`;
    await storage.put(originalKey, file.buffer, {
      contentType: file.mimetype,
    });

    // Queue processing
    await queue.add(
      'image-process',
      {
        imageUrl: storage.url(originalKey),
        userId: id,
        sizes: ['thumb', 'medium', 'large'],
      },
      {
        priority: 3,
        attempts: 2,
      }
    );

    res.json({
      message: 'Image uploaded, processing in background',
      originalUrl: storage.url(originalKey),
    });
  }
);
```

#### **Report Generation System**

```typescript
// Report generation job
queue.process('report', async (data) => {
  const { reportType, userId, filters, format = 'pdf' } = data;

  try {
    let reportData;

    // Generate different types of reports
    switch (reportType) {
      case 'user-activity':
        reportData = await generateUserActivityReport(userId, filters);
        break;
      case 'sales-summary':
        reportData = await generateSalesReport(filters);
        break;
      case 'analytics':
        reportData = await generateAnalyticsReport(filters);
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }

    // Generate file based on format
    let fileBuffer;
    let contentType;
    let extension;

    switch (format) {
      case 'pdf':
        fileBuffer = await generatePDF(reportData);
        contentType = 'application/pdf';
        extension = 'pdf';
        break;
      case 'csv':
        fileBuffer = Buffer.from(generateCSV(reportData));
        contentType = 'text/csv';
        extension = 'csv';
        break;
      case 'xlsx':
        fileBuffer = await generateExcel(reportData);
        contentType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
        break;
    }

    // Store report file
    const filename = `reports/${userId}/${reportType}-${Date.now()}.${extension}`;
    await storage.put(filename, fileBuffer, { contentType });

    // Generate signed URL for download
    const downloadUrl = await storage.signedUrl(filename, 24 * 3600); // 24 hours

    // Notify user that report is ready
    await queue.add('email', {
      to: await getUserEmail(userId),
      template: 'report-ready',
      templateData: {
        reportType,
        downloadUrl,
        expiresIn: '24 hours',
      },
    });

    return {
      reportId: filename,
      downloadUrl,
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
    };
  } catch (error) {
    console.error('Report generation failed:', error);

    // Notify user of failure
    await queue.add('email', {
      to: await getUserEmail(userId),
      template: 'report-failed',
      templateData: { reportType },
    });

    throw error;
  }
});

// API endpoint to request report
app.post('/reports/generate', async (req, res) => {
  const { reportType, filters, format } = req.body;
  const userId = req.user.id;

  // Queue report generation
  const jobId = await queue.add(
    'report',
    {
      reportType,
      userId,
      filters,
      format,
    },
    {
      priority: 1, // Low priority
      attempts: 1, // Don't retry failed reports
      removeOnComplete: 10, // Keep only 10 completed
      removeOnFail: 50, // Keep 50 failed for debugging
    }
  );

  res.json({
    message: 'Report generation started',
    jobId,
    estimatedTime: '5-10 minutes',
  });
});
```

#### **Webhook Delivery System**

```typescript
// Webhook delivery job with retry logic
queue.process('webhook', async (data) => {
  const { url, payload, headers = {}, event } = data;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MyApp-Webhook/1.0',
        'X-Event-Type': event,
        'X-Delivery-ID': crypto.randomUUID(),
        ...headers,
      },
      body: JSON.stringify(payload),
      timeout: 30000, // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(
        `Webhook delivery failed: ${response.status} ${response.statusText}`
      );
    }

    return {
      delivered: true,
      statusCode: response.status,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Webhook delivery failed:', error);
    throw error; // Will trigger retry
  }
});

// Send webhooks for various events
async function sendWebhook(event: string, data: any) {
  const webhookUrls = await getWebhookUrls(event);

  for (const webhook of webhookUrls) {
    await queue.add(
      'webhook',
      {
        url: webhook.url,
        payload: {
          event,
          data,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
        headers: webhook.headers,
        event,
      },
      {
        priority: 6, // Medium-high priority
        attempts: 5, // Retry up to 5 times
        backoff: 'exponential',
      }
    );
  }
}

// Usage in application events
app.post('/users', async (req, res) => {
  const userData = req.body;

  try {
    const user = await db.createUser(userData);

    // Send webhook notification
    await sendWebhook('user.created', {
      userId: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'User creation failed' });
  }
});
```

#### **Scheduled Jobs and Cleanup Tasks**

```typescript
// Cleanup job processor
queue.process('cleanup', async (data) => {
  const { type, params } = data;

  try {
    switch (type) {
      case 'expired-tokens':
        const deletedTokens = await db.deleteExpiredTokens();
        return { deletedTokens };

      case 'old-logs':
        const retentionDays = params.retentionDays || 30;
        const deletedLogs = await db.deleteOldLogs(retentionDays);
        return { deletedLogs, retentionDays };

      case 'unused-files':
        const deletedFiles = await cleanupUnusedFiles();
        return { deletedFiles };

      case 'failed-jobs':
        const stats = await queue.clean('failed', 24 * 60 * 60 * 1000); // 24 hours
        return { cleanedJobs: stats };

      default:
        throw new Error(`Unknown cleanup type: ${type}`);
    }
  } catch (error) {
    console.error(`Cleanup task failed: ${type}`, error);
    throw error;
  }
});

// Schedule recurring cleanup tasks
async function scheduleCleanupTasks() {
  // Clean expired tokens daily
  await queue.schedule(
    'cleanup',
    {
      type: 'expired-tokens',
    },
    24 * 60 * 60 * 1000
  ); // 24 hours

  // Clean old logs weekly
  await queue.schedule(
    'cleanup',
    {
      type: 'old-logs',
      params: { retentionDays: 30 },
    },
    7 * 24 * 60 * 60 * 1000
  ); // 7 days

  // Clean unused files monthly
  await queue.schedule(
    'cleanup',
    {
      type: 'unused-files',
    },
    30 * 24 * 60 * 60 * 1000
  ); // 30 days
}

// Initialize cleanup schedule on app startup
app.listen(port, async () => {
  await scheduleCleanupTasks();
  console.log('Cleanup tasks scheduled');
});
```

#### **Job Monitoring and Management**

```typescript
// Queue monitoring dashboard
app.get('/admin/queue/stats', async (req, res) => {
  try {
    const stats = await queue.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/admin/queue/jobs/:status', async (req, res) => {
  const { status } = req.params;
  const { limit = 50 } = req.query;

  try {
    const jobs = await queue.getJobs(status, { limit: parseInt(limit) });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retry failed job
app.post('/admin/queue/jobs/:jobId/retry', async (req, res) => {
  const { jobId } = req.params;

  try {
    await queue.retry(jobId);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove job
app.delete('/admin/queue/jobs/:jobId', async (req, res) => {
  const { jobId } = req.params;

  try {
    await queue.remove(jobId);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Clean old jobs
app.post('/admin/queue/clean', async (req, res) => {
  const { status, grace = 86400000 } = req.body; // Default 24 hours

  try {
    await queue.clean(status, grace);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

#### **Advanced Job Options and Patterns**

```typescript
// High priority job
await queue.add(
  'critical-alert',
  {
    message: 'System overload detected',
    severity: 'critical',
  },
  {
    priority: 10, // Highest priority
    attempts: 5, // More retries for critical tasks
    backoff: 'exponential',
  }
);

// Low priority batch job
await queue.add(
  'analytics-batch',
  {
    date: '2024-01-15',
    type: 'daily-report',
  },
  {
    priority: -5, // Lower priority
    attempts: 1, // Don't retry batch jobs
    removeOnComplete: 10, // Keep only 10 completed
    removeOnFail: 50, // Keep 50 failed for debugging
  }
);

// Job with custom retry strategy
await queue.add(
  'api-sync',
  {
    endpoint: 'https://api.partner.com/sync',
    data: payload,
  },
  {
    attempts: 3,
    backoff: 'fixed', // Fixed delay between retries
  }
);

// Scheduled job with priority
const reminderDate = new Date('2024-12-25T09:00:00Z');
const delay = reminderDate.getTime() - Date.now();

await queue.schedule(
  'holiday-reminder',
  {
    type: 'holiday',
    message: 'Merry Christmas!',
  },
  delay
);
```

### **Environment Configuration**

```bash
# Memory transport (development)
# No configuration needed - auto-detected

# Redis transport (production distributed)
REDIS_URL=redis://localhost:6379

# Database transport (persistent)
DATABASE_URL=postgres://user:pass@localhost/db

# Queue configuration
VOILA_QUEUE_CONCURRENCY=5              # Concurrent jobs (default: 5)
VOILA_QUEUE_MAX_ATTEMPTS=3             # Max retry attempts (default: 3)
VOILA_QUEUE_RETRY_DELAY=5000           # Retry delay ms (default: 5000)
VOILA_QUEUE_RETRY_BACKOFF=exponential  # fixed or exponential

# Worker configuration
VOILA_QUEUE_WORKER=true                # Enable worker (default: true)
VOILA_QUEUE_REMOVE_COMPLETE=100        # Keep completed jobs (default: 100)
VOILA_QUEUE_REMOVE_FAILED=50           # Keep failed jobs (default: 50)

# Service identification
VOILA_SERVICE_NAME=my-app
VOILA_SERVICE_VERSION=1.0.0
```

### **Testing Queue Jobs**

```typescript
// Test utilities for queue jobs
describe('Queue Jobs', () => {
  beforeEach(async () => {
    // Clear queue before each test
    await queue.clear();
  });

  afterAll(async () => {
    // Clean up after tests
    await queue.close();
  });

  test('should process email job', async () => {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>',
    };

    // Add job
    const jobId = await queue.add('email', emailData);

    // Wait for job completion (in test environment)
    const result = await waitForJobCompletion(jobId);

    expect(result.sent).toBe(true);
    expect(result.timestamp).toBeDefined();
  });

  test('should retry failed jobs', async () => {
    // Mock a failing service
    emailService.send = jest
      .fn()
      .mockRejectedValueOnce(new Error('Service down'))
      .mockResolvedValueOnce({ sent: true });

    const jobId = await queue.add(
      'email',
      {
        to: 'test@example.com',
        subject: 'Test',
      },
      { attempts: 2 }
    );

    const result = await waitForJobCompletion(jobId);

    expect(emailService.send).toHaveBeenCalledTimes(2);
    expect(result.sent).toBe(true);
  });
});
```
