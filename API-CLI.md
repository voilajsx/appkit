# AppKit API CLI Documentation

## Overview

The AppKit CLI provides a powerful command-line interface for creating and managing TypeScript backend APIs using Feature-Based Component Architecture (FBCA). It includes auto-discovery routing, full AppKit integration, and VoilaJSX documentation standards.

## Installation

```bash
npm install -g @voilajsx/appkit
```

## Commands

### `appkit create <project-name>`

Creates a new TypeScript backend API project with FBCA structure.

**Usage:**
```bash
appkit create my-api
cd my-api
npm run dev
```

**What it creates:**
```
my-api/
├── package.json              # TypeScript dependencies & scripts
├── tsconfig.json             # TypeScript configuration
└── src/api/
    ├── server.ts             # Main server with AppKit integration
    ├── lib/
    │   └── router.ts         # Auto-discovery FBCA router
    └── features/
        └── greeting/         # Default feature for testing
            ├── greeting.route.ts    # Express routes
            ├── greeting.service.ts  # Business logic
            └── greeting.types.ts    # TypeScript interfaces
```

**Features included:**
- ✅ Full TypeScript setup with proper build process
- ✅ AppKit integration (logger, config, error handling)
- ✅ Auto-discovery routing system
- ✅ Default greeting feature for immediate testing
- ✅ VoilaJSX comment standards with @llm-rule annotations
- ✅ Production-ready configuration

**Available endpoints after creation:**
- `GET /health` - Health check
- `GET /api/greeting` - Basic greeting
- `GET /api/greeting/:name` - Personalized greeting

### `appkit generate feature <feature-name>`

Generates a new feature with route, service, and types files.

**Usage:**
```bash
appkit generate feature user
```

**Note:** Current generate command uses legacy JavaScript templates. For TypeScript features, manually create files using the structure below.

## Project Structure

### FBCA (Feature-Based Component Architecture)

Each feature is self-contained in its own directory:

```
src/api/features/<feature-name>/
├── <feature-name>.route.ts    # HTTP endpoints
├── <feature-name>.service.ts  # Business logic
└── <feature-name>.types.ts    # TypeScript interfaces
```

### Auto-Discovery

The router automatically discovers and loads features:
- Scans `src/api/features/` directory
- Looks for `{featureName}.route.ts` files
- Mounts at `/api/{featureName}`
- Hot-reload friendly with nodemon

## Development

### Scripts

```bash
npm run dev         # Start development server with hot-reload
npm run start       # Start production server
npm run build       # Build TypeScript to JavaScript
npm start:prod      # Start built production server
```

### Adding New Features

1. **Create feature directory:**
   ```bash
   mkdir src/api/features/user
   ```

2. **Create types file (`user.types.ts`):**
   ```typescript
   /**
    * User Feature Type Definitions - Shared interfaces and types
    * @module my-api/user-types
    * @file src/api/features/user/user.types.ts
    *
    * @llm-rule WHEN: Need type safety for user feature data structures
    * @llm-rule AVOID: Defining types inline - reduces reusability and consistency
    * @llm-rule NOTE: Shared across service and route layers for type consistency
    */

   export interface UserResponse {
     id: string;
     name: string;
     timestamp: string;
   }

   export interface UserCreateRequest {
     name: string;
   }
   ```

3. **Create service file (`user.service.ts`):**
   ```typescript
   /**
    * User Feature Service - Business logic with AppKit integration
    * @module my-api/user-service
    * @file src/api/features/user/user.service.ts
    *
    * @llm-rule WHEN: Need business logic layer with validation, logging, and config
    * @llm-rule AVOID: Direct database calls from routes - always use service layer
    * @llm-rule NOTE: Demonstrates AppKit logger, config, and error patterns for FBCA
    */

   import { loggerClass } from '@voilajsx/appkit/logger';
   import { configClass } from '@voilajsx/appkit/config';
   import { errorClass } from '@voilajsx/appkit/error';
   import type { UserResponse } from './user.types.js';

   const logger = loggerClass.get('user');
   const config = configClass.get();
   const error = errorClass.get();

   export const userService = {
     async getAll(): Promise<UserResponse[]> {
       try {
         logger.info('Processing get all users request');
         // Your business logic here
         return [];
       } catch (err) {
         logger.error('Failed to get users', { error: err });
         throw error.serverError('Failed to retrieve users');
       }
     }
   };
   ```

4. **Create route file (`user.route.ts`):**
   ```typescript
   /**
    * User Feature Routes - Express endpoints with AppKit integration
    * @module my-api/user-routes
    * @file src/api/features/user/user.route.ts
    *
    * @llm-rule WHEN: Need HTTP endpoints for user feature with error handling
    * @llm-rule AVOID: Adding routes without asyncRoute wrapper - breaks error handling
    * @llm-rule NOTE: Auto-discovered by router.ts, exports default Express router
    */

   import express from 'express';
   import { errorClass } from '@voilajsx/appkit/error';
   import { loggerClass } from '@voilajsx/appkit/logger';
   import { userService } from './user.service.js';

   const router = express.Router();
   const error = errorClass.get();
   const logger = loggerClass.get('user-routes');

   router.get('/', error.asyncRoute(async (_req, res) => {
     logger.info('GET /api/user request received');
     const result = await userService.getAll();
     res.json(result);
   }));

   export default router;
   ```

5. **Server auto-discovers the feature** - No manual registration needed!

## AppKit Integration

### Logger

```typescript
import { loggerClass } from '@voilajsx/appkit/logger';
const logger = loggerClass.get('feature-name');

logger.info('Processing request', { userId: '123' });
logger.error('Request failed', { error: err });
```

### Error Handling

```typescript
import { errorClass } from '@voilajsx/appkit/error';
const error = errorClass.get();

// In routes - use asyncRoute wrapper
router.get('/', error.asyncRoute(async (req, res) => {
  // Your code here
}));

// In services - throw AppKit errors
throw error.badRequest('Invalid input data');
throw error.serverError('Database connection failed');
```

### Configuration

```typescript
import { configClass } from '@voilajsx/appkit/config';
const config = configClass.get();

const port = config.get('server.port', 3000);
const dbUrl = config.get('database.url', 'mongodb://localhost');
```

## VoilaJSX Documentation Standards

All files include @llm-rule annotations for AI-friendly documentation:

```typescript
/**
 * Feature description
 * @module project-name/module-name
 * @file src/path/to/file.ts
 *
 * @llm-rule WHEN: When to use this module/function
 * @llm-rule AVOID: What to avoid or common mistakes
 * @llm-rule NOTE: Additional context (optional)
 */
```

## Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3000/health

# Feature endpoints
curl http://localhost:3000/api/greeting
curl http://localhost:3000/api/greeting/world
curl http://localhost:3000/api/user
```

### Integration with Testing Frameworks

The generated structure works seamlessly with:
- Jest/Vitest for unit testing
- Supertest for API testing
- Any testing framework that supports ES modules

## Production Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm run start:prod
   ```

3. **Environment variables:**
   ```bash
   NODE_ENV=production
   PORT=3000
   # Add your app-specific config
   ```

## Best Practices

### File Organization
- Keep features self-contained
- Use descriptive, consistent naming
- Follow the three-file pattern (route, service, types)

### Error Handling
- Always use `error.asyncRoute()` in routes
- Use AppKit error classes in services
- Include contextual logging

### TypeScript
- Define interfaces in `.types.ts` files
- Use proper return type annotations
- Import types with `type` keyword

### Logging
- Log request start/completion in routes
- Include relevant context in log messages
- Use appropriate log levels (info, warn, error)

## Troubleshooting

### Feature not auto-discovered
- Ensure file is named `{featureName}.route.ts`
- Check that it exports a default Express router
- Verify file is in `src/api/features/{featureName}/` directory

### Import errors
- Use `.js` extensions in imports (TypeScript requirement)
- Check tsconfig.json `moduleResolution` setting
- Ensure proper relative/absolute paths

### AppKit errors
- Verify @voilajsx/appkit is installed
- Check that AppKit modules are initialized correctly
- Review error logs for specific AppKit messages

## Examples

### Complete User Feature

See the generated greeting feature for a complete working example, or refer to the manual feature creation steps above.

### Advanced Patterns

```typescript
// Service with validation
async createUser(data: UserCreateRequest): Promise<UserResponse> {
  // Validate input
  if (!data.name || data.name.length < 2) {
    throw error.badRequest('Name must be at least 2 characters');
  }

  // Business logic
  const user = await this.repository.create(data);

  logger.info('User created successfully', { userId: user.id });
  return user;
}

// Route with parameters
router.post('/', error.asyncRoute(async (req, res) => {
  const userData = req.body;
  const result = await userService.createUser(userData);
  res.status(201).json(result);
}));
```

---

**Generated with AppKit CLI - Feature-Based Component Architecture for TypeScript APIs**