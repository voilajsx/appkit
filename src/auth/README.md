# @voilajsx/appkit - Authentication Module 🔐

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple authentication with JWT, bcrypt, and role-based permissions. One
> function call, zero configuration, production-ready security.

**One function** returns an auth object with all methods. Built-in role
hierarchy and permission inheritance. Works with any Node.js framework.

## 🚀 Why Choose This?

- **⚡ One Function** - Just `authClass.get()`, everything else is automatic
- **🔒 Enterprise Security** - Production-grade security by default
- **🔧 Zero Configuration** - Smart defaults for everything
- **👥 Smart Role Hierarchy** - Built-in role.level inheritance
- **🎯 Permission System** - Fine-grained permission control with action:scope
  format
- **🛡️ Null-Safe Access** - Safe user extraction with `auth.user(req)`
- **🤖 AI-Ready** - Optimized for LLM code generation

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

**⚠️ AUTH_SECRET Required**: You must generate a secure secret for JWT tokens.
No default is provided for security reasons.

```bash
# Generate and set your JWT secret (required for startup)
echo "VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024-minimum-32-chars" > .env
```

```typescript
import { authClass } from '@voilajsx/appkit/auth';

const auth = authClass.get();

// Basic usage patterns
const token = auth.signToken({ userId: 123, role: 'admin', level: 'tenant' });
const user = auth.user(req); // Safe - returns null if not authenticated
app.get('/admin', auth.requireRole('admin.tenant'), handler);
```

## 🏗️ Role-Level-Permission Architecture

**What is role.level format?** A two-part system where `role.level` (like
`admin.tenant`) provides automatic inheritance. Higher levels include all lower
level permissions, eliminating complex permission management.

**Why it matters:** `admin.org` automatically has `admin.tenant` access,
`admin.tenant` has `user.basic` access. One check handles the entire hierarchy.

### **Built-in Role Hierarchy**

```typescript
user:      basic → pro → max
moderator: review → approve → manage
admin:     tenant → org → system
```

### **Permission System**

**Format**: `action:scope` - Clean, predictable permission structure.

**Examples**: `view:own`, `edit:tenant`, `manage:org`, `delete:system`

## 🤖 LLM Quick Reference - Copy These Patterns

### **Token Structure (Copy Exactly)**

```typescript
// ✅ CORRECT - Always use this structure
const token = auth.signToken({
  userId: 123,
  role: 'admin',        // Role name
  level: 'tenant',      // Level within role
  permissions: ['manage:tenant']  // Optional
});

// ❌ WRONG - Will break auth
{ userId: 123, roles: ['admin'] }           // Missing role/level split
{ userId: 123, role: 'admin.tenant' }      // Don't combine role.level
```

### **Role Inheritance (Copy These Patterns)**

```typescript
// ✅ These return TRUE (higher includes lower)
auth.hasRole('admin.org', 'admin.tenant'); // org > tenant
auth.hasRole('admin.system', 'user.basic'); // system > basic
auth.hasRole('user.pro', 'user.basic'); // pro > basic

// ❌ These return FALSE (lower cannot access higher)
auth.hasRole('user.basic', 'admin.tenant'); // basic < tenant
auth.hasRole('admin.tenant', 'admin.org'); // tenant < org
```

### **Framework Detection (Auto-Generated)**

```typescript
// ✅ FASTIFY - Use these patterns
app.get('/admin', { preHandler: auth.requireRole('admin.tenant') }, handler);

// ✅ EXPRESS - Use these patterns
app.get('/admin', auth.requireRoleExpress('admin.tenant'), handler);
```

## ⚠️ Common LLM Mistakes - Avoid These

### **Token Creation Errors**

```typescript
// ❌ Missing required fields
auth.signToken({ userId: 123 }); // Missing role/level
auth.signToken({ userId: 123, role: 'admin' }); // Missing level

// ✅ Always include userId, role, level
auth.signToken({ userId: 123, role: 'admin', level: 'tenant' });
```

### **Role Check Errors**

```typescript
// ❌ Wrong inheritance assumption
if (user.role === 'admin') {
} // Ignores levels
auth.hasRole('admin.tenant', 'admin.org'); // Backwards check

// ✅ Use proper hierarchy checks
auth.hasRole(`${user.role}.${user.level}`, 'admin.tenant');
```

### **Permission Errors**

```typescript
// ❌ Wrong permission format
auth.can(user, 'admin'); // Not action:scope format
auth.can(user, 'edit_tenant'); // Use colon, not underscore

// ✅ Use action:scope format
auth.can(user, 'edit:tenant');
auth.can(user, 'manage:org');
```

## 🚨 Error Handling Patterns

### **Token Operations**

```typescript
try {
  const token = auth.signToken({ userId, role, level });
  return { token };
} catch (error) {
  // Invalid role.level, missing secret, etc.
  return res.status(500).json({ error: 'Token creation failed' });
}

try {
  const payload = auth.verifyToken(token);
  // Use payload...
} catch (error) {
  if (error.message === 'Token has expired') {
    return res.status(401).json({ error: 'Session expired' });
  }
  return res.status(401).json({ error: 'Invalid token' });
}
```

### **Middleware Error Handling**

```typescript
// Errors are handled automatically by middleware
app.get('/admin', auth.requireRole('admin.tenant'), (req, res) => {
  // This only runs if auth succeeds
  // 401/403 errors sent automatically if auth fails
});
```

## 🚀 Production Deployment Checklist

### **Environment Setup**

```bash
# ✅ Required - Strong secret (32+ characters)
VOILA_AUTH_SECRET=your-cryptographically-secure-secret-key-here

# ✅ Recommended - Shorter expiry for security
VOILA_AUTH_EXPIRES_IN=2h

# ✅ Performance - Higher rounds for better security
VOILA_AUTH_BCRYPT_ROUNDS=12
```

### **Security Validation**

```typescript
// App startup validation
try {
  const auth = authClass.get();
  console.log('✅ Auth initialized successfully');
} catch (error) {
  console.error('❌ Auth setup failed:', error.message);
  process.exit(1);
}
```

### **Common Issues**

- **"JWT secret required"** → Set VOILA_AUTH_SECRET environment variable
- **"Invalid role.level"** → Check role format: 'admin.tenant' not 'admin'
- **"Token expired"** → Generate new token or increase expiry time

## 📖 Essential Usage Patterns

### **Authentication Flow**

```typescript
// Registration
const hash = await auth.hashPassword(password);
const token = auth.signToken({ userId, role: 'user', level: 'basic' });

// Login
const isValid = await auth.comparePassword(password, hash);
if (isValid) token = auth.signToken({ userId, role, level });

// Safe user access
const user = auth.user(req);
if (!user) return res.status(401).json({ error: 'Auth required' });
```

### **Route Protection**

```typescript
// Fastify
app.get('/admin', { preHandler: auth.requireRole('admin.tenant') }, handler);
app.post(
  '/edit',
  { preHandler: auth.requirePermission('edit:tenant') },
  handler
);

// Express
app.get('/admin', auth.requireRoleExpress('admin.tenant'), handler);
app.post('/edit', auth.requirePermissionExpress('edit:tenant'), handler);
```

### **Permission Checking**

```typescript
// Role hierarchy check
if (auth.hasRole(`${user.role}.${user.level}`, 'admin.tenant')) {
  // User has admin.tenant or higher access
}

// Specific permission check
if (auth.can(user, 'edit:tenant')) {
  // User can edit tenant data
}
```

### **Progressive Complexity**

```typescript
// Simple: Just authentication
app.get('/profile', auth.requireLogin(), handler);

// Medium: Role-based
app.get('/admin', auth.requireRole('admin.tenant'), handler);

// Advanced: Permission-based
app.post('/publish', auth.requirePermission('blog:publish:tenant'), handler);
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

## 📖 API Reference

### **Core Function**

```typescript
const auth = authClass.get(); // One function, all methods
```

### **Authentication Methods**

```typescript
auth.signToken({ userId, role, level, permissions }); // Create JWT
auth.verifyToken(token); // Verify JWT
auth.hashPassword(password, rounds); // Hash password
auth.comparePassword(password, hash); // Verify password
auth.user(req); // Safe user access
```

### **Authorization Methods**

```typescript
auth.hasRole(userRole, requiredRole); // Check role hierarchy
auth.can(user, permission); // Check permission
auth.requireLogin(options); // Auth middleware
auth.requireRole(roleLevel); // Role middleware
auth.requirePermission(permission); // Permission middleware
```

### **Utility Methods**

```typescript
authClass.getRoles(); // Get role hierarchy
authClass.getPermissions(); // Get permission config
authClass.getAllRoles(); // Get all roles sorted
authClass.isValidRole(roleLevel); // Validate role
authClass.reset(newConfig); // Reset instance (testing)
```

## 🔧 Custom Role Examples

### **E-commerce Platform**

```bash
VOILA_AUTH_ROLES=customer.basic:1,vendor.starter:2,vendor.pro:3,staff.support:4,admin.store:5
```

### **Healthcare System**

```bash
VOILA_AUTH_ROLES=patient.basic:1,nurse.junior:2,doctor.resident:3,admin.clinic:4
```

### **Educational Platform**

```bash
VOILA_AUTH_ROLES=student.basic:1,teacher.junior:2,principal.school:3,admin.district:4
```

## 🧪 Testing

```typescript
// Reset for clean testing
const auth = authClass.reset({
  jwt: { secret: 'test-secret-32-characters-long-for-security' },
  roles: {
    'test.user': { level: 1, inherits: [] },
    'test.admin': { level: 2, inherits: ['test.user'] },
  },
});

// Test patterns
const hasRole = auth.hasRole('test.admin', 'test.user'); // true
const user = { role: 'test', level: 'admin', permissions: ['edit:own'] };
const canEdit = auth.can(user, 'edit:own'); // true
```

## 📈 Performance

- **JWT Operations**: ~1ms per token
- **Password Hashing**: ~100ms (10 rounds)
- **Permission Checking**: ~0.1ms per check
- **Memory Usage**: <1MB overhead
- **Environment Parsing**: Once per app startup

## 🔍 TypeScript Support

```typescript
import type {
  JwtPayload,
  AuthConfig,
  RoleHierarchy,
  FastifyPreHandler,
  ExpressMiddleware,
} from '@voilajsx/appkit/auth';

// All methods are fully typed
const user: JwtPayload | null = auth.user(req);
const middleware: FastifyPreHandler = auth.requireRole('admin.tenant');
```

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a>
</p>
