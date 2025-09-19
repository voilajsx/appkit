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
  .action(async (type, name, options) => {
    const { generate } = await import('./commands/generate.js');
    await generate(type, name, options);
  });


// Add help examples
program.addHelpText(
  'after',
  `

Examples:
  $ appkit generate app my-project     Create new project in ./my-project/
  $ appkit generate app                Create project in current directory
  $ appkit generate feature posts     Add posts feature to existing project
  $ appkit generate feature posts --db   Add posts feature with database
  $ appkit generate feature user      Add complete user authentication system

Feature Types:
  • Basic features: Simple API endpoints with routes, services, and types
  • Database features (--db): Includes Prisma models and seeding
  • User feature: Complete authentication with 9 test accounts and JWT

Smart Features:
  • Auto-detects project name from current folder
  • Never overwrites existing files
  • Shows detailed creation/skip summary
  • Incrementally adds AppKit to any Node.js project
`
);

// Parse arguments
program.parse();
