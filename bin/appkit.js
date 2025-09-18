#!/usr/bin/env node

/**
 * @fileoverview AppKit CLI - Backend FBCA scaffolding tool
 * @description Creates backend APIs with Feature-Based Component Architecture using @voilajsx/appkit modules
 * @package @voilajsx/appkit
 * @file appkit/bin/appkit.js
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

// Generate command - unified entry point
program
  .command('generate')
  .alias('g')
  .description('Generate AppKit projects and features')
  .argument('<type>', 'what to generate (app, feature)')
  .argument('[name]', 'name (auto-detected for app in current directory)')
  .option(
    '--db',
    'include database integration with Prisma and AppKit database module'
  )
  .option('--crud', 'include CRUD operations (for features)')
  .option(
    '--auth',
    'include authentication using @voilajsx/appkit/auth (for features)'
  )
  .action(async (type, name, options) => {
    const { generate } = await import('./commands/generate.js');
    await generate(type, name, options);
  });

// Create command - legacy compatibility (redirects to generate app)
program
  .command('create')
  .description(
    'Create a new backend API project (legacy - use "generate app" instead)'
  )
  .argument('<name>', 'project name')
  .option('--api', 'create backend API with FBCA structure (default)')
  .option('--express', 'use Express.js framework (default)', true)
  .option('--fastify', 'use Fastify framework')
  .option('--prisma', 'include Prisma ORM setup', true)
  .action(async (name, options) => {
    console.log(
      '⚠️  "create" command is deprecated. Use "npx appkit generate app" instead.'
    );
    const { createProject } = await import('./commands/create.js');
    await createProject(name, options);
  });

// Add help examples
program.addHelpText(
  'after',
  `

Examples:
  $ npx appkit generate app my-project    Create new project in ./my-project/
  $ npx appkit generate app               Create project in current directory
  $ npx appkit generate feature users     Add users feature to existing project
  $ npx appkit generate feature posts --db   Add posts feature with database

Smart Features:
  • Auto-detects project name from current folder
  • Never overwrites existing files
  • Shows detailed creation/skip summary
  • Incrementally adds AppKit to any Node.js project
`
);

// Parse arguments
program.parse();
