# Session Module - Developer REFERENCE 🛠️

The session module provides secure session management utilities for Node.js
applications. It offers flexible session storage, authentication middleware, and
role-based access control - all with sensible defaults to get you started
quickly.

Whether you need simple in-memory sessions for development, file-based sessions
for small deployments, or Redis sessions for production scale, this module
provides composable utilities that work with any Node.js framework.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 💾 [Session Storage](#session-storage)
  - [Memory Store](#memory-store)
  - [File Store](#file-store)
  - [Redis Store](#redis-store)
  - [Complete Storage Example](#complete-storage-example)
- 🔐 [Session Management](#session-management)
  - [Basic Session Usage](#basic-session-usage)
  - [Session Lifecycle](#session-lifecycle)
  - [Complete Session Example](#complete-session-example)
- 🛡️ [Authentication Middleware](#authentication-middleware)
  - [Basic Authentication](#basic-authentication)
  - [Custom User Extraction](#custom-user-extraction)
  - [Complete Authentication Example](#complete-authentication-example)
- 👥 [Authorization Middleware](#authorization-middleware)
  - [Role-Based Access](#role-based-access)
  - [Custom Role Logic](#custom-role-logic)
  - [Complete Authorization Example](#complete-authorization-example)
- 🚀 [Complete Integration Example](#complete-integration-example)
- 📚 [Additional Resources](#additional-resources)
- 💡 [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @voilajsx/appkit
```

### Basic Import

```javascript
import {
  createSessionMiddleware,
  createSessionAuthMiddleware,
  createSessionAuthorizationMiddleware,
  MemoryStore,
  FileStore,
  RedisStore,
} from '@voilajsx/appkit/session';
```

## Session Storage

The session module supports three storage backends for different use cases.

### Memory Store

Use MemoryStore for development and single-process applications:

```javascript
import { createSessionMiddleware, MemoryStore } from '@voilajsx/appkit/session';

// Basic usage - uses MemoryStore by default
const sessionMiddleware = createSessionMiddleware({
  secret: 'your-secret-key',
});

// Explicit MemoryStore
const sessionMiddleware = createSessionMiddleware({
  store: new MemoryStore(),
  secret: 'your-secret-key',
});
```

**Expected Output:**

```
// Sessions stored in memory
// Automatic cleanup of expired sessions
// Session count tracking available
```

**When to use:**

- **Development**: Perfect for local development and testing
- **Single Process Apps**: Small applications running on one server
- **Testing**: Unit and integration tests
- **Prototyping**: Quick proof-of-concept applications

💡 **Tip**: MemoryStore automatically manages timers for session expiration and
provides a `length()` method to monitor active sessions.

### File Store

Use FileStore for simple production deployments:

```javascript
import { createSessionMiddleware, FileStore } from '@voilajsx/appkit/session';

// Basic file store
const sessionMiddleware = createSessionMiddleware({
  store: new FileStore('./sessions'),
  secret: process.env.SESSION_SECRET,
});

// Custom configuration
const sessionMiddleware = createSessionMiddleware({
  store: new FileStore('./data/sessions', {
    cleanupInterval: 30000, // 30 seconds
    extension: '.session',
  }),
  secret: process.env.SESSION_SECRET,
});
```

**Expected Output:**

```
// Sessions stored as JSON files in ./sessions/
// Background cleanup every minute
// Automatic directory creation
```

**When to use:**

- **Simple Production**: Single-server production deployments
- **Small Scale Applications**: Apps with moderate session volume
- **Persistent Sessions**: When you need sessions to survive server restarts
- **No External Dependencies**: When you can't use Redis or other databases

### Redis Store

Use RedisStore for production and multi-server deployments:

```javascript
import Redis from 'ioredis';
import { createSessionMiddleware, RedisStore } from '@voilajsx/appkit/session';

// With ioredis
const redis = new Redis(process.env.REDIS_URL);
const sessionMiddleware = createSessionMiddleware({
  store: new RedisStore(redis),
  secret: process.env.SESSION_SECRET,
});

// With node_redis
import { createClient } from 'redis';
const client = createClient({ url: process.env.REDIS_URL });
await client.connect();

const sessionMiddleware = createSessionMiddleware({
  store: new RedisStore(client, {
    prefix: 'myapp:sessions:',
  }),
  secret: process.env.SESSION_SECRET,
});
```

**Expected Output:**

```
// Sessions stored in Redis with automatic expiration
// Supports clustering and high availability
// Compatible with both ioredis and node_redis
```

**When to use:**

- **Production Applications**: High-traffic production environments
- **Multi-Server Deployments**: Load-balanced applications
- **Microservices**: Shared sessions across different services
- **High Availability**: Applications requiring session redundancy

### Complete Storage Example

Here's how to configure different stores based on environment:

```javascript
import {
  createSessionMiddleware,
  MemoryStore,
  FileStore,
  RedisStore,
} from '@voilajsx/appkit/session';

function createStore() {
  const env = process.env.NODE_ENV;

  if (env === 'production') {
    // Production: Use Redis
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL);
    return new RedisStore(redis, {
      prefix: 'prod:sess:',
    });
  } else if (env === 'staging') {
    // Staging: Use file store
    return new FileStore('./staging-sessions', {
      cleanupInterval: 60000, // 1 minute
    });
  } else {
    // Development: Use memory store
    return new MemoryStore();
  }
}

const sessionMiddleware = createSessionMiddleware({
  store: createStore(),
  secret: process.env.SESSION_SECRET || 'dev-secret',
});
```

**When to implement:**

- **Multi-Environment Applications**: When deploying across
  dev/staging/production
- **Scalable Architectures**: Applications that need to scale storage
  independently
- **Configuration Management**: Applications with environment-specific
  requirements

Similar to logging systems that use different transports for different
environments, session storage should be configured based on deployment needs.

## Session Management

Session management provides the core functionality for storing and retrieving
user data across requests.

### Basic Session Usage

Use sessions to store user data between requests:

```javascript
import { createSessionMiddleware } from '@voilajsx/appkit/session';

const sessionMiddleware = createSessionMiddleware({
  secret: 'your-secret-key',
});

app.use(sessionMiddleware);

// Save data to session
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Authenticate user (your logic)
  const user = await authenticateUser(email, password);

  if (user) {
    // Save user to session
    await req.session.save({
      user: { id: user.id, email: user.email },
    });
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Read data from session
app.get('/profile', (req, res) => {
  if (req.session.isActive() && req.session.data.user) {
    res.json({ user: req.session.data.user });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});
```

**Expected Output:**

```
// POST /login
{ "message": "Login successful" }

// GET /profile
{ "user": { "id": 123, "email": "user@example.com" } }
```

**When to use:**

- **User Authentication**: Store logged-in user information
- **Shopping Carts**: Maintain cart data across page visits
- **Form Data**: Preserve form data across multi-step processes
- **User Preferences**: Store temporary user settings

### Session Lifecycle

Manage session creation, updates, and destruction:

```javascript
app.post('/logout', async (req, res) => {
  // Destroy session completely
  await req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

app.post('/update-profile', async (req, res) => {
  if (!req.session.isActive()) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  // Update session data
  await req.session.save({
    user: {
      ...req.session.data.user,
      lastUpdated: new Date(),
    },
  });

  res.json({ message: 'Profile updated' });
});

app.post('/refresh-session', async (req, res) => {
  if (!req.session.isActive()) {
    return res.status(401).json({ error: 'No session to refresh' });
  }

  // Regenerate session ID (prevents session fixation)
  await req.session.regenerate();
  res.json({ message: 'Session refreshed' });
});

app.get('/session-info', (req, res) => {
  if (req.session.isActive()) {
    res.json({
      sessionAge: req.session.getAge(),
      sessionId: req.session.id,
      hasUser: !!req.session.data.user,
    });
  } else {
    res.json({ active: false });
  }
});
```

**When to use:**

- **Logout Functionality**: Clean session destruction
- **Security Updates**: Regenerate sessions after privilege changes
- **Session Monitoring**: Track session age and activity
- **Data Updates**: Modify session data without losing the session

### Complete Session Example

Here's a complete example of session management in a user authentication flow:

```javascript
import express from 'express';
import { createSessionMiddleware } from '@voilajsx/appkit/session';

const app = express();
app.use(express.json());

// Configure sessions
const sessionMiddleware = createSessionMiddleware({
  secret: process.env.SESSION_SECRET,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  rolling: true, // Extend session on activity
});

app.use(sessionMiddleware);

// Registration
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = await createUser({ email, password, name });

    // Start session for new user
    await req.session.save({
      user: { id: user.id, email, name },
      registeredAt: new Date(),
    });

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user.id, email, name },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create new session or regenerate existing one
    await req.session.regenerate();
    await req.session.save({
      user: { id: user.id, email: user.email, name: user.name },
      loginAt: new Date(),
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Update user data in session
app.put('/profile', async (req, res) => {
  if (!req.session.isActive()) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const { name } = req.body;
  const updatedUser = await updateUser(req.session.data.user.id, { name });

  // Update session with new data
  await req.session.save({
    user: {
      ...req.session.data.user,
      name: updatedUser.name,
    },
  });

  res.json({ user: updatedUser });
});

// Logout
app.post('/logout', async (req, res) => {
  await req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});
```

**When to implement:**

- **Web Applications**: Traditional web applications with user sessions
- **SPA Backends**: API backends for single-page applications
- **Multi-page Applications**: Applications with complex user flows

## Authentication Middleware

Authentication middleware protects routes by requiring active sessions with
authenticated users.

### Basic Authentication

Create middleware to require authenticated sessions:

```javascript
import { createSessionAuthMiddleware } from '@voilajsx/appkit/session';

// Basic authentication middleware
const authRequired = createSessionAuthMiddleware();

// Protect routes
app.get('/dashboard', authRequired, (req, res) => {
  // req.user contains the user from session
  res.json({
    message: 'Welcome to your dashboard',
    user: req.user,
  });
});

app.get('/profile', authRequired, (req, res) => {
  res.json({ user: req.user });
});
```

**Expected Behavior:**

- For authenticated requests: Passes control to next handler with `req.user`
  populated
- For unauthenticated requests: Returns 401 for API requests or redirects for
  web requests
- Automatic detection of API vs web requests based on headers

**When to use:**

- **Protected Routes**: Secure routes that require user authentication
- **User-Specific Data**: Routes that access user-specific information
- **Dashboard Pages**: User dashboard and profile pages
- **Account Settings**: Routes for managing user accounts

### Custom User Extraction

Customize how users are extracted from session data:

```javascript
const authRequired = createSessionAuthMiddleware({
  loginUrl: '/auth/login',
  getUser: (sessionData) => {
    // Custom user extraction logic
    return sessionData.currentUser || sessionData.user;
  },
});

// Multi-tenant authentication
const tenantAuth = createSessionAuthMiddleware({
  getUser: (sessionData) => {
    const user = sessionData.user;
    if (user && user.tenantId) {
      return user;
    }
    return null; // Require tenant information
  },
  onAuthRequired: (req, res, next, error) => {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please login with a valid tenant account',
    });
  },
});
```

**When to customize:**

- **Custom Session Structure**: When session data uses different keys
- **Multi-tenant Applications**: When users belong to specific tenants
- **Complex User Objects**: When user validation requires additional checks
- **Custom Error Handling**: When you need specific error responses

### Complete Authentication Example

Here's a complete authentication system with login/logout and protected routes:

```javascript
import express from 'express';
import {
  createSessionMiddleware,
  createSessionAuthMiddleware,
} from '@voilajsx/appkit/session';

const app = express();
app.use(express.json());

// Session middleware
const sessionMiddleware = createSessionMiddleware({
  secret: process.env.SESSION_SECRET,
});

// Authentication middleware
const authRequired = createSessionAuthMiddleware({
  loginUrl: '/login',
});

app.use(sessionMiddleware);

// Public routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to our app' });
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await req.session.save({ user });
    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected routes
app.get('/dashboard', authRequired, (req, res) => {
  res.json({
    message: `Welcome ${req.user.name}`,
    user: req.user,
  });
});

app.get('/api/orders', authRequired, async (req, res) => {
  const orders = await getOrdersByUserId(req.user.id);
  res.json({ orders });
});

app.post('/logout', authRequired, async (req, res) => {
  await req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});
```

**When to implement:**

- **Web Applications**: Applications with user authentication requirements
- **API Backends**: REST APIs that need session-based authentication
- **Content Management Systems**: Applications with user-generated content

## Authorization Middleware

Authorization middleware adds role-based access control to your authenticated
routes.

### Role-Based Access

Protect routes based on user roles:

```javascript
import { createSessionAuthorizationMiddleware } from '@voilajsx/appkit/session';

// Single role
const adminOnly = createSessionAuthorizationMiddleware(['admin']);

// Multiple roles
const moderatorAccess = createSessionAuthorizationMiddleware([
  'admin',
  'moderator',
]);

// Apply to routes
app.get('/admin/dashboard', authRequired, adminOnly, (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

app.delete('/posts/:id', authRequired, moderatorAccess, async (req, res) => {
  await deletePost(req.params.id);
  res.json({ message: 'Post deleted' });
});
```

**Expected Behavior:**

- For users with required roles: Passes control to next handler
- For users without required roles: Returns 403 Forbidden error
- Works with both API and web requests

**When to use:**

- **Admin Panels**: Restrict access to administrative features
- **Content Moderation**: Control who can moderate content
- **Feature Access**: Limit access to premium or beta features
- **Role-Based UI**: Control what users can see and do

### Custom Role Logic

Implement complex authorization logic:

```javascript
// Permission-based access
const canEditPosts = createSessionAuthorizationMiddleware(['editor'], {
  getRoles: (user) => {
    // Check permissions instead of simple roles
    const permissions = user.permissions || [];
    return permissions.includes('posts:edit') ? ['editor'] : [];
  },
});

// Subscription-based access
const premiumFeatures = createSessionAuthorizationMiddleware(['premium'], {
  getRoles: (user) => {
    if (user.subscription?.status === 'active') {
      return ['premium'];
    }
    return [];
  },
});

// Team-based access
const teamAccess = createSessionAuthorizationMiddleware(['member'], {
  getRoles: (user) => {
    const { teamId } = req.params;
    const userTeams = user.teams || [];

    if (userTeams.includes(teamId)) {
      return ['member'];
    }

    // Admins have access to all teams
    if (user.role === 'admin') {
      return ['member'];
    }

    return [];
  },
});
```

**When to customize:**

- **Complex Permission Systems**: When simple roles aren't sufficient
- **Resource-Based Access**: When access depends on specific resources
- **Subscription Models**: When access is based on subscription status
- **Team-Based Applications**: When users belong to different teams

### Complete Authorization Example

Here's a complete example with different access levels:

```javascript
import {
  createSessionMiddleware,
  createSessionAuthMiddleware,
  createSessionAuthorizationMiddleware,
} from '@voilajsx/appkit/session';

// Middleware setup
const sessionMiddleware = createSessionMiddleware({
  secret: process.env.SESSION_SECRET,
});

const authRequired = createSessionAuthMiddleware();
const adminOnly = createSessionAuthorizationMiddleware(['admin']);
const moderatorAccess = createSessionAuthorizationMiddleware([
  'admin',
  'moderator',
]);

// Custom authorization
const ownerOrAdmin = createSessionAuthorizationMiddleware(['owner'], {
  getRoles: (user) => {
    const roles = [];

    // Admin users can access everything
    if (user.role === 'admin') {
      roles.push('owner', 'admin');
    }

    // Resource owner can access their own content
    const resourceUserId = req.params.userId;
    if (user.id === resourceUserId) {
      roles.push('owner');
    }

    return roles;
  },
});

app.use(sessionMiddleware);

// Public endpoints
app.get('/api/posts', async (req, res) => {
  const posts = await getPublicPosts();
  res.json({ posts });
});

// Authenticated endpoints
app.get('/api/profile', authRequired, (req, res) => {
  res.json({ user: req.user });
});

// Moderator actions
app.put(
  '/api/posts/:id/flag',
  authRequired,
  moderatorAccess,
  async (req, res) => {
    await flagPost(req.params.id, req.user.id);
    res.json({ message: 'Post flagged for review' });
  }
);

// Admin only
app.get('/api/admin/users', authRequired, adminOnly, async (req, res) => {
  const users = await getAllUsers();
  res.json({ users });
});

app.delete(
  '/api/admin/users/:id',
  authRequired,
  adminOnly,
  async (req, res) => {
    await deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  }
);

// Owner or admin access
app.get(
  '/api/users/:userId/orders',
  authRequired,
  ownerOrAdmin,
  async (req, res) => {
    const orders = await getUserOrders(req.params.userId);
    res.json({ orders });
  }
);
```

**When to implement:**

- **Multi-User Applications**: Applications with different user types
- **Content Platforms**: Platforms with creators, moderators, and admins
- **SaaS Applications**: Applications with subscription-based features
- **Enterprise Applications**: Complex organizational access controls

## Complete Integration Example

Here's a production-ready example showing all features working together:

```javascript
import express from 'express';
import {
  createSessionMiddleware,
  createSessionAuthMiddleware,
  createSessionAuthorizationMiddleware,
  RedisStore,
} from '@voilajsx/appkit/session';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

// Environment configuration
const redis = new Redis(process.env.REDIS_URL);
const sessionStore = new RedisStore(redis, {
  prefix: 'myapp:sess:',
});

// Create middleware
const sessionMiddleware = createSessionMiddleware({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  rolling: true,
  secure: process.env.NODE_ENV === 'production',
});

const authRequired = createSessionAuthMiddleware({
  loginUrl: '/login',
});

const adminOnly = createSessionAuthorizationMiddleware(['admin']);
const verifiedOnly = createSessionAuthorizationMiddleware(['verified'], {
  getRoles: (user) => (user.emailVerified ? ['verified'] : []),
});

app.use(sessionMiddleware);

// Authentication routes
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = await createUser({ email, password, name });

    await req.session.save({
      user: {
        id: user.id,
        email,
        name,
        emailVerified: false,
        role: 'user',
      },
    });

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user.id, email, name },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Regenerate session for security
    await req.session.regenerate();
    await req.session.save({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role,
      },
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected routes
app.get('/profile', authRequired, (req, res) => {
  res.json({ user: req.user });
});

// Verified users only
app.post('/posts', authRequired, verifiedOnly, async (req, res) => {
  const post = await createPost({
    ...req.body,
    authorId: req.user.id,
  });
  res.json({ post });
});

// Admin routes
app.get('/admin/stats', authRequired, adminOnly, async (req, res) => {
  const stats = await getSystemStats();
  res.json({ stats });
});

// Logout
app.post('/logout', authRequired, async (req, res) => {
  await req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

**When to implement this comprehensive approach:**

- **Production Applications**: Full-featured applications with user management
- **Multi-User Platforms**: Applications with different user types and
  permissions
- **Scalable Applications**: Applications that need to handle high traffic
- **Enterprise Solutions**: Business applications with complex access
  requirements

## Additional Resources

- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/session/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajsx/appkit/blob/main/src/session/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## Best Practices

### 🔐 Security

- Store session secrets in environment variables
- Use HTTPS in production for secure cookies
- Regenerate session IDs after authentication
- Implement proper session timeout policies
- Sanitize session data before storage
- Use Redis authentication in production

### 🏗️ Architecture

- Choose appropriate storage backend for your scale
- Separate session logic from business logic
- Use middleware composition for complex auth scenarios
- Implement proper error handling and logging
- Monitor session storage health

### 🚀 Performance

- Keep session data small and focused
- Use Redis clustering for high availability
- Configure appropriate cleanup intervals
- Monitor session store performance
- Use rolling sessions judiciously

### 👥 User Experience

- Provide clear feedback for authentication failures
- Implement "remember me" functionality appropriately
- Handle session expiration gracefully
- Use appropriate session timeout values
- Provide secure logout functionality

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
