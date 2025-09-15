#!/usr/bin/env node

/**
 * @fileoverview AppKit CLI - Backend FBCA scaffolding tool
 * @description Creates backend APIs with Feature-Based Component Architecture using @voilajsx/appkit modules
 * @package @voilajsx/appkit
 */

import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

program
  .name('appkit')
  .description('🚀 AppKit CLI - Backend FBCA scaffolding with AppKit modules')
  .version(packageJson.version);

// Create command
program
  .command('create')
  .description('Create a new backend API project')
  .argument('<name>', 'project name')
  .option('--api', 'create backend API with FBCA structure (default)')
  .option('--express', 'use Express.js framework (default)', true)
  .option('--fastify', 'use Fastify framework')
  .option('--prisma', 'include Prisma ORM setup', true)
  .action(async (name, options) => {
    const { createProject } = await import('./commands/create.js');
    await createProject(name, options);
  });

// Generate command
program
  .command('generate')
  .alias('g')
  .description('Generate a new feature')
  .argument('<type>', 'feature type (feature)')
  .argument('<name>', 'feature name')
  .option('--crud', 'include CRUD operations')
  .option('--auth', 'include authentication using @voilajsx/appkit/auth')
  .option('--db', 'include database integration with Prisma and AppKit database module')
  .action(async (type, name, options) => {
    const { generateFeature } = await import('./commands/generate.js');
    await generateFeature(type, name, options);
  });

// Parse arguments
program.parse();