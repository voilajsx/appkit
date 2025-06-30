# @voilajsx/appkit - Authentication Module 🔐

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple role-level-permission authentication with enterprise-grade
> security and smart hierarchy

**One function** returns an auth object with all methods. Zero configuration
needed, production-ready security by default, with built-in role inheritance and
permission system.

## 🚀 Why Choose This?

- **⚡ One Function** - Just `authenticator.get()`, everything else is automatic
- **🔒 Enterprise Security** - Production-grade security by default
- **🔧 Zero Configuration** - Smart defaults for everything
- **👥 Smart Role Hierarchy** - Built-in role.level inheritance
- **🎯 Permission System** - Fine-grained permission control with action:scope
  format
- **🛡️ Null-Safe Access** - Safe user extraction with `auth.user(req)`

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

```bash
# Set your environment variable
echo "VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024-minimum-32-chars" > .env
```

```javascript
import { authenticator } from '@voilajsx/appkit/auth';

const auth = authenticator.get();

// JWT operations with new structure
const token = auth.signToken({
  userId: 123,
  role: 'admin',
  level: 'tenant',
  permissions: ['edit:tenant'],
});
const payload = auth.verifyToken(token);

// Password operations
const hash = await auth.hashPassword('userPassword123');
const isValid = await auth.comparePassword('userPassword123', hash);

// Safe user access
const user = auth.user(req); // Returns null if not authenticated

// Role-level and permission-based routes
app.get('/admin', auth.requireRole('admin.tenant'), handler);
app.post('/edit', auth.requirePermission('edit:tenant'), handler);
```

## 🏗️ Role-Level-Permission Architecture

### **Role Hierarchy** (Built-in)

```javascript
user:      basic → pro → max
moderator: review → approve → manage
admin:     tenant → org → system
```

Higher levels automatically inherit all lower level permissions.

### **Permission System**

**Format**: `action:scope`

**Core Actions**: `view`, `create`, `edit`, `delete`, `manage` **Core Scopes**:
`own`, `tenant`, `org`, `system`

**Examples**:

- `view:own` - View own data
- `edit:tenant` - Edit tenant data
- `manage:org` - Full management of organization
- `blog:publish:tenant` - Custom action (publish blog posts in tenant)

## 📖 API Reference

### Core Function

```javascript
const auth = authenticator.get(); // One function, all methods
```

### Methods

```javascript
// JWT with role-level structure
auth.signToken({ userId, role, level, permissions });
auth.verifyToken(token);

// Passwords
auth.hashPassword(password, rounds);
auth.comparePassword(password, hash);

// User access
auth.user(req); // Safe user extraction (null if not authenticated)

// Role checking (with inheritance)
auth.hasRole('admin.org', 'admin.tenant'); // true (org inherits tenant)

// Permission checking
auth.can(user, 'edit:tenant');

// Middleware
auth.requireLogin(options);
auth.requireToken(options);
auth.requireRole('admin.tenant');
auth.requirePermission('edit:tenant');
```

### Utility Methods

```javascript
// Inspect configuration
authenticator.getRoles(); // Get role hierarchy
authenticator.getPermissions(); // Get permission config
authenticator.getAllRoles(); // Get all role.levels sorted
authenticator.isValidRole('admin.tenant'); // Validate role.level
authenticator.reset(newConfig); // Reset instance (testing)
```

## 💡 Default Permissions

### **User Levels** (Product Tiers)

```javascript
user.basic:  ['manage:own']     // Full control over own data
user.pro:    ['manage:own']     // Feature limits handled at app level
user.max:    ['manage:own']     // Feature limits handled at app level
```

### **Moderator Levels** (Content Control)

```javascript
moderator.review:   ['view:tenant']                           // View only
moderator.approve:  ['view:tenant', 'create:tenant', 'edit:tenant']  // No delete
moderator.manage:   ['view:tenant', 'create:tenant', 'edit:tenant']  // No delete
```

### **Admin Levels** (Full Management)

```javascript
admin.tenant:  ['manage:tenant']                              // Single location
admin.org:     ['manage:tenant', 'manage:org']               // Multiple locations
admin.system:  ['manage:tenant', 'manage:org', 'manage:system'] // Full platform
```

## 🎯 Usage Examples

### **Basic Express App**

```javascript
import express from 'express';
import { authenticator } from '@voilajsx/appkit/auth';

const app = express();
const auth = authenticator.get();

// Registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await auth.hashPassword(password);
  const user = await db.createUser({
    email,
    password: hashedPassword,
    role: 'user',
    level: 'basic',
  });

  const token = auth.signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    level: user.level,
    permissions: ['manage:own'], // Optional: explicit permissions
  });

  res.json({ token });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.findUserByEmail(email);
  const isValid = await auth.comparePassword(password, user.password);

  if (isValid) {
    const token = auth.signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      level: user.level,
    });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

### **Role-Level Protection**

```javascript
// Public route
app.get('/public', (req, res) => {
  res.json({ message: 'Everyone can see this' });
});

// Basic user access
app.get('/dashboard', auth.requireRole('user.basic'), (req, res) => {
  const user = auth.user(req);
  res.json({ message: `Welcome ${user.email}` });
});

// Moderator access (any moderator level)
app.get('/moderate', auth.requireRole('moderator.review'), (req, res) => {
  res.json({ message: 'Moderator panel' });
});

// Admin tenant management
app.get('/admin/tenant', auth.requireRole('admin.tenant'), (req, res) => {
  res.json({ message: 'Tenant admin panel' });
});

// System admin only
app.get('/admin/system', auth.requireRole('admin.system'), (req, res) => {
  res.json({ message: 'System admin panel' });
});
```

### **Permission-Based Protection**

```javascript
// Permission-based routes
app.get('/content', auth.requirePermission('view:tenant'), (req, res) => {
  res.json({ message: 'Can view tenant content' });
});

app.post('/content', auth.requirePermission('create:tenant'), (req, res) => {
  res.json({ message: 'Can create tenant content' });
});

app.delete(
  '/content/:id',
  auth.requirePermission('delete:tenant'),
  (req, res) => {
    res.json({ message: 'Can delete tenant content' });
  }
);

// Custom permissions
app.post(
  '/blog/publish',
  auth.requirePermission('blog:publish:tenant'),
  (req, res) => {
    res.json({ message: 'Blog published' });
  }
);
```

### **Business Logic with Hierarchy**

```javascript
class PostService {
  async deletePost(postId, req) {
    const user = auth.user(req);

    if (!user) {
      throw new Error('Authentication required');
    }

    const post = await db.getPost(postId);

    // Check permissions using hierarchy
    const canDelete =
      post.createdBy === user.userId || // Own post
      auth.hasRole(`${user.role}.${user.level}`, 'moderator.manage') || // Moderator+
      auth.can(user, 'delete:tenant'); // Explicit permission

    if (!canDelete) {
      throw new Error('Permission denied');
    }

    await db.deletePost(postId);
    return { success: true };
  }

  async createPost(postData, req) {
    const user = auth.user(req);

    if (!user) {
      throw new Error('Authentication required');
    }

    // Check if user can publish immediately
    const canPublish =
      auth.hasRole(`${user.role}.${user.level}`, 'moderator.approve') ||
      auth.can(user, 'blog:publish:tenant');

    const status = canPublish ? 'published' : 'draft';

    const post = await db.createPost({
      ...postData,
      createdBy: user.userId,
      status,
    });

    return post;
  }
}
```

### **Optional Authentication**

```javascript
app.get('/content', (req, res) => {
  const user = auth.user(req); // Safe - returns null if not authenticated

  if (!user) {
    return res.json({ content: 'Public content only' });
  }

  // Check role.level hierarchy
  if (auth.hasRole(`${user.role}.${user.level}`, 'admin.tenant')) {
    return res.json({ content: 'Admin content' });
  }

  if (auth.hasRole(`${user.role}.${user.level}`, 'moderator.review')) {
    return res.json({ content: 'Moderator content' });
  }

  res.json({ content: 'User content' });
});
```

## 🌍 Environment Variables

```bash
# Required
VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024-minimum-32-chars

# Optional
VOILA_AUTH_BCRYPT_ROUNDS=12        # Default: 10
VOILA_AUTH_EXPIRES_IN=1h           # Default: 7d
VOILA_AUTH_DEFAULT_ROLE=user       # Default: user
VOILA_AUTH_DEFAULT_LEVEL=basic     # Default: basic

# Custom role hierarchy (optional)
VOILA_AUTH_ROLES=user.basic:1,user.pro:2,admin.system:9

# Custom permissions (optional)
VOILA_AUTH_PERMISSIONS=user.basic:view:own,admin.tenant:manage:tenant
```

## 🔧 Custom Role Hierarchies

### **E-commerce Platform**

```bash
VOILA_AUTH_ROLES=customer.basic:1,vendor.starter:2,vendor.pro:3,staff.support:4,admin.store:5,admin.platform:6
```

### **Healthcare System**

```bash
VOILA_AUTH_ROLES=patient.basic:1,nurse.junior:2,nurse.senior:3,doctor.resident:4,doctor.attending:5,admin.clinic:6,admin.hospital:7
```

### **Educational Platform**

```bash
VOILA_AUTH_ROLES=student.basic:1,teacher.junior:2,teacher.senior:3,principal.school:4,admin.district:5,admin.system:6
```

## 🔄 Authentication Types

### **User Authentication** (`requireLogin`)

- For web applications and user interfaces
- Sets `req.user` (accessible via `auth.user(req)`)

### **API Authentication** (`requireToken`)

- For service-to-service communication
- Sets `req.token` (accessible via `auth.user(req)`)

### **Role Authorization** (`requireRole`)

- Checks role.level with inheritance
- `admin.org` automatically has `admin.tenant` access

### **Permission Authorization** (`requirePermission`)

- Checks specific permissions
- `manage:tenant` includes all other actions for tenant scope

## 🤖 LLM Guidelines

### **Essential Patterns**

```javascript
// ✅ ALWAYS use these patterns
import { authenticator } from '@voilajsx/appkit/auth';
const auth = authenticator.get();

// ✅ New token structure
const token = auth.signToken({
  userId,
  role: 'user',
  level: 'basic',
  permissions: ['manage:own'], // optional
});

// ✅ Safe user access
const user = auth.user(req);
if (!user) return res.status(401).json({ error: 'Auth required' });

// ✅ Role.level format
auth.requireRole('admin.tenant');
auth.hasRole('admin.org', 'admin.tenant'); // inheritance check

// ✅ Permission format
auth.requirePermission('edit:tenant');
auth.can(user, 'manage:org');
```

### **Anti-Patterns to Avoid**

```javascript
// ❌ DON'T access req.user directly (can crash)
const user = req.user;

// ❌ DON'T use old role format
auth.requireRole('admin'); // Should be 'admin.tenant'

// ❌ DON'T forget role and level in tokens
auth.signToken({ userId }); // Missing role/level

// ❌ DON'T hardcode permission checks
if (user.permissions.includes('edit:tenant')) {
} // Use auth.can() instead
```

## 📈 Performance

- **JWT Operations**: ~1ms per token
- **Password Hashing**: ~100ms (10 rounds)
- **Permission Checking**: ~0.1ms per check
- **Memory Usage**: <1MB overhead
- **Environment Parsing**: Once per app startup

## 🧪 Testing

```javascript
import { authenticator } from '@voilajsx/appkit/auth';

// Reset for clean testing
const auth = authenticator.reset({
  jwt: { secret: 'test-secret-32-characters-long' },
  roles: {
    'test.user': { level: 1, inherits: [] },
    'test.admin': { level: 2, inherits: ['test.user'] },
  },
});

// Test role hierarchy
const hasRole = auth.hasRole('test.admin', 'test.user'); // true

// Test permissions
const user = { role: 'test', level: 'admin', permissions: ['edit:own'] };
const canEdit = auth.can(user, 'edit:own'); // true
```

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a>
</p>
