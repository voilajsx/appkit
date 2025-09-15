/**
 * @fileoverview AppKit Generate Command - Feature scaffolding
 * @description Generates new features using FBCA pattern with AppKit modules
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a new feature
 */
export async function generateFeature(type, name, options) {
  console.log(`🔧 Generating ${type}: "${name}"...\n`);

  try {
    // Validate feature name
    if (!name || !/^[a-zA-Z0-9-_]+$/.test(name)) {
      console.error('❌ Invalid feature name. Use only letters, numbers, hyphens, and underscores.');
      process.exit(1);
    }

    // Check if we're in a project directory
    const currentDir = process.cwd();
    const packageJsonPath = path.join(currentDir, 'package.json');

    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      if (!packageJson.dependencies || !packageJson.dependencies['@voilajsx/appkit']) {
        console.error('❌ Not in an AppKit project directory. Run this from project root.');
        process.exit(1);
      }
    } catch {
      console.error('❌ No package.json found. Run this from project root.');
      process.exit(1);
    }

    // Check if features directory exists
    const featuresPath = path.join(currentDir, 'src/api/features');
    try {
      await fs.access(featuresPath);
    } catch {
      console.error('❌ Features directory not found. Make sure you have the correct FBCA structure.');
      process.exit(1);
    }

    // Check if feature already exists
    const featurePath = path.join(featuresPath, name);
    try {
      await fs.access(featurePath);
      console.error(`❌ Feature "${name}" already exists.`);
      process.exit(1);
    } catch {
      // Feature doesn't exist, good to proceed
    }

    // Generate feature based on type
    if (type === 'feature') {
      await generateFeatureScaffolding(featuresPath, name, options);
    } else {
      console.error(`❌ Unknown type "${type}". Use: feature`);
      process.exit(1);
    }

    console.log(`✅ Generated ${type} "${name}" successfully!`);
    console.log(`\n📁 Files created:`);
    console.log(`  src/api/features/${name}/${name}.route.js`);
    console.log(`  src/api/features/${name}/${name}.service.js`);
    console.log(`  src/api/features/${name}/${name}.types.ts`);
    console.log(`  src/api/features/${name}/${name}.model.ts`);

    console.log(`\n🚀 Feature available at: /api/${name}`);
    console.log(`\n💡 Next steps:`);
    console.log(`  1. Update ${name}.types.ts with your data types`);
    console.log(`  2. Add Prisma model to schema.prisma (see ${name}.model.ts)`);
    console.log(`  3. Implement business logic in ${name}.service.js`);
    console.log(`  4. Test your API: curl http://localhost:3000/api/${name}`);

  } catch (error) {
    console.error('❌ Failed to generate feature:', error.message);
    process.exit(1);
  }
}

/**
 * Generate complete feature scaffolding
 */
async function generateFeatureScaffolding(featuresPath, name, options) {
  const featurePath = path.join(featuresPath, name);
  await fs.mkdir(featurePath, { recursive: true });

  // Generate all feature files
  await generateFeatureRoute(featurePath, name, options);
  await generateFeatureService(featurePath, name, options);
  await generateFeatureTypes(featurePath, name, options);
  await generateFeatureModel(featurePath, name, options);

  console.log(`✅ Created feature directory: ${name}/`);
}

/**
 * Generate feature route file
 */
async function generateFeatureRoute(featurePath, name, options) {
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const hasAuth = options.auth;
  const hasCrud = options.crud;

  let routeContent = `/**
 * ${capitalizedName} routes
 * FBCA pattern: /api/${name}/*
 */

import express from 'express';
import { ${name}Service } from './${name}.service.js';`;

  if (hasAuth) {
    routeContent += `
import { requireAuth } from '../../lib/middleware.js';`;
  }

  routeContent += `

const router = express.Router();

// GET /api/${name}
router.get('/', ${hasAuth ? 'requireAuth, ' : ''}async (req, res, next) => {
  try {
    const result = await ${name}Service.getAll(${hasAuth ? 'req.user' : ''});
    res.json(result);
  } catch (error) {
    next(error);
  }
});`;

  if (hasCrud) {
    routeContent += `

// POST /api/${name}
router.post('/', ${hasAuth ? 'requireAuth, ' : ''}async (req, res, next) => {
  try {
    const result = await ${name}Service.create(req.body${hasAuth ? ', req.user' : ''});
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/${name}/:id
router.get('/:id', ${hasAuth ? 'requireAuth, ' : ''}async (req, res, next) => {
  try {
    const result = await ${name}Service.getById(req.params.id${hasAuth ? ', req.user' : ''});
    if (!result) {
      return res.status(404).json({ error: '${capitalizedName} not found' });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PUT /api/${name}/:id
router.put('/:id', ${hasAuth ? 'requireAuth, ' : ''}async (req, res, next) => {
  try {
    const result = await ${name}Service.update(req.params.id, req.body${hasAuth ? ', req.user' : ''});
    if (!result) {
      return res.status(404).json({ error: '${capitalizedName} not found' });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/${name}/:id
router.delete('/:id', ${hasAuth ? 'requireAuth, ' : ''}async (req, res, next) => {
  try {
    const result = await ${name}Service.delete(req.params.id${hasAuth ? ', req.user' : ''});
    if (!result) {
      return res.status(404).json({ error: '${capitalizedName} not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});`;
  } else {
    routeContent += `

// POST /api/${name}
router.post('/', ${hasAuth ? 'requireAuth, ' : ''}async (req, res, next) => {
  try {
    const result = await ${name}Service.create(req.body${hasAuth ? ', req.user' : ''});
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/${name}/:id
router.get('/:id', ${hasAuth ? 'requireAuth, ' : ''}async (req, res, next) => {
  try {
    const result = await ${name}Service.getById(req.params.id${hasAuth ? ', req.user' : ''});
    if (!result) {
      return res.status(404).json({ error: '${capitalizedName} not found' });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});`;
  }

  routeContent += `

export default router;`;

  await fs.writeFile(path.join(featurePath, `${name}.route.js`), routeContent);
}

/**
 * Generate feature service file
 */
async function generateFeatureService(featurePath, name, options) {
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const hasAuth = options.auth;
  const hasCrud = options.crud;

  let serviceContent = `/**
 * ${capitalizedName} business logic using AppKit modules
 */

import { logger } from '@voilajsx/appkit/logger';
import { cache } from '@voilajsx/appkit/cache';`;

  if (hasAuth) {
    serviceContent += `
import { auth } from '@voilajsx/appkit/auth';`;
  }

  serviceContent += `
import { db } from '../../lib/database.js';

const log = logger.create({ service: '${name}' });

export const ${name}Service = {
  /**
   * Get all ${name} records
   */
  async getAll(${hasAuth ? 'user' : ''}) {
    try {
      log.info('Fetching all ${name} records'${hasAuth ? ', { userId: user.id }' : ''});

      // Try cache first
      const cacheKey = '${name}:all'${hasAuth ? ' + user.id' : ''};
      const cached = await cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // TODO: Implement database query
      // Example with Prisma:
      // const records = await db.client.${name}.findMany(${hasAuth ? '{ where: { userId: user.id } }' : ''});

      // Placeholder data
      const records = [
        {
          id: '1',
          name: 'Sample ${capitalizedName}',
          createdAt: new Date(),
          updatedAt: new Date()${hasAuth ? ',\\n          userId: user.id' : ''}
        }
      ];

      // Cache for 5 minutes
      await cache.set(cacheKey, JSON.stringify(records), 300);

      return records;
    } catch (error) {
      log.error('Error fetching ${name} records:', error);
      throw error;
    }
  },

  /**
   * Create new ${name} record
   */
  async create(data${hasAuth ? ', user' : ''}) {
    try {
      log.info('Creating ${name} record'${hasAuth ? ', { userId: user.id }' : ''});

      // TODO: Validate data here
      // Example: const validated = await validate${capitalizedName}Data(data);

      // TODO: Implement database insert
      // Example with Prisma:
      // const record = await db.client.${name}.create({
      //   data: { ...data${hasAuth ? ', userId: user.id' : ''} }
      // });

      // Placeholder implementation
      const record = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()${hasAuth ? ',\\n        userId: user.id' : ''}
      };

      // Clear relevant caches
      await cache.del('${name}:all'${hasAuth ? ' + user.id' : ''});

      return record;
    } catch (error) {
      log.error('Error creating ${name} record:', error);
      throw error;
    }
  },

  /**
   * Get ${name} by ID
   */
  async getById(id${hasAuth ? ', user' : ''}) {
    try {
      log.info(\`Fetching ${name} record: \${id}\`${hasAuth ? ', { userId: user.id }' : ''});

      // Try cache first
      const cacheKey = \`${name}:\${id}\`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        const record = JSON.parse(cached);
        ${hasAuth ? `
        // Check ownership
        if (record.userId !== user.id) {
          return null; // or throw authorization error
        }` : ''}
        return record;
      }

      // TODO: Implement database query
      // Example with Prisma:
      // const record = await db.client.${name}.findUnique({
      //   where: { id${hasAuth ? ', userId: user.id' : ''} }
      // });

      // Placeholder implementation
      const record = id === '1' ? {
        id: '1',
        name: 'Sample ${capitalizedName}',
        createdAt: new Date(),
        updatedAt: new Date()${hasAuth ? ',\\n        userId: user.id' : ''}
      } : null;

      if (record) {
        // Cache for 10 minutes
        await cache.set(cacheKey, JSON.stringify(record), 600);
      }

      return record;
    } catch (error) {
      log.error(\`Error fetching ${name} record \${id}:\`, error);
      throw error;
    }
  }`;

  if (hasCrud) {
    serviceContent += `,

  /**
   * Update ${name} record
   */
  async update(id, data${hasAuth ? ', user' : ''}) {
    try {
      log.info(\`Updating ${name} record: \${id}\`${hasAuth ? ', { userId: user.id }' : ''});

      // TODO: Validate data here
      // TODO: Implement database update
      // Example with Prisma:
      // const record = await db.client.${name}.update({
      //   where: { id${hasAuth ? ', userId: user.id' : ''} },
      //   data: { ...data, updatedAt: new Date() }
      // });

      // Placeholder implementation
      const record = {
        id,
        ...data,
        updatedAt: new Date()${hasAuth ? ',\\n        userId: user.id' : ''}
      };

      // Clear caches
      await cache.del(\`${name}:\${id}\`);
      await cache.del('${name}:all'${hasAuth ? ' + user.id' : ''});

      return record;
    } catch (error) {
      log.error(\`Error updating ${name} record \${id}:\`, error);
      throw error;
    }
  },

  /**
   * Delete ${name} record
   */
  async delete(id${hasAuth ? ', user' : ''}) {
    try {
      log.info(\`Deleting ${name} record: \${id}\`${hasAuth ? ', { userId: user.id }' : ''});

      // TODO: Implement database delete
      // Example with Prisma:
      // const record = await db.client.${name}.delete({
      //   where: { id${hasAuth ? ', userId: user.id' : ''} }
      // });

      // Clear caches
      await cache.del(\`${name}:\${id}\`);
      await cache.del('${name}:all'${hasAuth ? ' + user.id' : ''});

      return true;
    } catch (error) {
      log.error(\`Error deleting ${name} record \${id}:\`, error);
      throw error;
    }
  }`;
  }

  serviceContent += `
};`;

  await fs.writeFile(path.join(featurePath, `${name}.service.js`), serviceContent);
}

/**
 * Generate feature types file
 */
async function generateFeatureTypes(featurePath, name, options) {
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const hasAuth = options.auth;

  const typesContent = `/**
 * ${capitalizedName} TypeScript types and interfaces
 */

export interface ${capitalizedName}Entity {
  id: string;
  name: string;${hasAuth ? '\\n  userId: string;' : ''}
  createdAt: Date;
  updatedAt: Date;
}

export interface Create${capitalizedName}Request {
  name: string;
  // Add your specific fields here
}

export interface Update${capitalizedName}Request {
  name?: string;
  // Add your specific fields here
}

export interface ${capitalizedName}Response {
  id: string;
  name: string;${hasAuth ? '\\n  userId: string;' : ''}
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ${capitalizedName}ListResponse {
  data: ${capitalizedName}Response[];
  total: number;
  page?: number;
  limit?: number;
}`;

  await fs.writeFile(path.join(featurePath, `${name}.types.ts`), typesContent);
}

/**
 * Generate feature model file (Prisma reference)
 */
async function generateFeatureModel(featurePath, name, options) {
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const hasAuth = options.auth;

  const modelContent = `/**
 * ${capitalizedName} Prisma model definition
 * Add this to your schema.prisma file:
 */

/*
model ${capitalizedName} {
  id        String   @id @default(cuid())
  name      String
  ${hasAuth ? 'userId    String' : ''}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  ${hasAuth ? `// Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])` : ''}
  @@map("${name}")
}
*/

// This file serves as a reference for your Prisma schema
// Copy the model definition above to your schema.prisma file

export {}; // Make this a module`;

  await fs.writeFile(path.join(featurePath, `${name}.model.ts`), modelContent);
}