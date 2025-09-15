/**
 * @fileoverview AppKit Generate Command - Feature scaffolding with TypeScript templates
 * @description Generates new features using FBCA pattern with AppKit modules
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a new feature using TypeScript templates
 */
export async function generateFeature(type, name, options) {
  const withDb = options && options.db;
  console.log(`🔧 Generating ${type}: "${name}"${withDb ? ' with database support' : ''}...\n`);

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

      // Handle database integration if --db flag is used
      if (withDb) {
        await handleDatabaseIntegration(currentDir, name);
      }
    } else {
      console.error(`❌ Unknown type "${type}". Use: feature`);
      process.exit(1);
    }

    console.log(`✅ Generated ${type} "${name}" successfully!`);
    console.log(`\n📁 Files created:`);
    console.log(`  src/api/features/${name}/${name}.route.ts`);
    console.log(`  src/api/features/${name}/${name}.service.ts`);
    console.log(`  src/api/features/${name}/${name}.types.ts`);

    console.log(`\n🚀 Feature available at: /api/${name}`);
    console.log(`\n💡 Next steps:`);
    if (withDb) {
      console.log(`  1. Start your server: npm run dev`);
      console.log(`  2. Test your API: curl http://localhost:3000/api/${name}`);
      console.log(`  3. Update ${name}.types.ts with your data types if needed`);
      console.log(`\n📊 Database and Prisma client ready to use!`);
    } else {
      console.log(`  1. Update ${name}.types.ts with your data types`);
      console.log(`  2. Implement business logic in ${name}.service.ts`);
      console.log(`  3. Test your API: curl http://localhost:3000/api/${name}`);
    }

  } catch (error) {
    console.error('❌ Failed to generate feature:', error.message);
    process.exit(1);
  }
}

/**
 * Generate complete feature scaffolding using TypeScript templates
 */
async function generateFeatureScaffolding(featuresPath, name, options) {
  const featurePath = path.join(featuresPath, name);
  await fs.mkdir(featurePath, { recursive: true });

  // Choose template path based on --db flag
  const withDb = options && options.db;
  const templateDir = withDb ? 'feature-db' : 'feature';
  const templatesPath = path.join(__dirname, `../templates/${templateDir}`);

  try {
    // Generate TypeScript files from templates
    await generateFromTemplate(templatesPath, 'feature.route.ts.template', featurePath, `${name}.route.ts`, name);
    await generateFromTemplate(templatesPath, 'feature.service.ts.template', featurePath, `${name}.service.ts`, name);
    await generateFromTemplate(templatesPath, 'feature.types.ts.template', featurePath, `${name}.types.ts`, name);

    console.log(`✅ Created feature directory: ${name}/ ${withDb ? '(with database support)' : ''}`);
  } catch (error) {
    console.error(`❌ Failed to generate feature from templates: ${error.message}`);
    throw error;
  }
}

/**
 * Generate file from template with variable replacement
 */
async function generateFromTemplate(templatesPath, templateFile, outputPath, outputFile, featureName) {
  try {
    // Read template file
    const templatePath = path.join(templatesPath, templateFile);
    const templateContent = await fs.readFile(templatePath, 'utf8');

    // Get project name from package.json
    const currentDir = process.cwd();
    const packageJsonPath = path.join(currentDir, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    const projectName = packageJson.name || 'my-project';

    // Replace template variables
    const processedContent = templateContent
      .replace(/\{\{featureName\}\}/g, featureName)
      .replace(/\{\{FeatureName\}\}/g, featureName.charAt(0).toUpperCase() + featureName.slice(1))
      .replace(/\{\{projectName\}\}/g, projectName);

    // Write output file
    const outputFilePath = path.join(outputPath, outputFile);
    await fs.writeFile(outputFilePath, processedContent, 'utf8');

    console.log(`  ✅ Generated ${outputFile}`);
  } catch (error) {
    console.error(`❌ Failed to generate ${outputFile} from template ${templateFile}:`, error.message);
    throw error;
  }
}

/**
 * Handle database integration for --db flag
 */
async function handleDatabaseIntegration(projectDir, featureName) {
  try {
    console.log(`🗄️  Setting up database integration for ${featureName}...`);

    // Check if Prisma is installed
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

    if (!packageJson.dependencies?.prisma && !packageJson.devDependencies?.prisma) {
      console.log(`📦 Installing Prisma...`);
      // Note: In a real implementation, you would run npm install prisma here
      console.log(`⚠️  Please run: npm install prisma @prisma/client`);
    }

    // Check if prisma/schema.prisma exists
    const schemaPath = path.join(projectDir, 'prisma/schema.prisma');
    let schemaExists = false;

    try {
      await fs.access(schemaPath);
      schemaExists = true;
    } catch {
      // Schema doesn't exist, will create it
    }

    if (!schemaExists) {
      // Create prisma directory and basic schema
      await fs.mkdir(path.join(projectDir, 'prisma'), { recursive: true });

      const basicSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

`;
      await fs.writeFile(schemaPath, basicSchema, 'utf8');
      console.log(`✅ Created prisma/schema.prisma`);
    }

    // Add model to schema
    await addModelToSchema(schemaPath, featureName);

    // Create or update .env file
    await ensureDatabaseUrl(projectDir);

    // Run Prisma commands automatically
    await runPrismaCommands(projectDir);

    console.log(`✅ Database integration completed for ${featureName}`);

  } catch (error) {
    console.error(`❌ Failed to setup database integration: ${error.message}`);
    throw error;
  }
}

/**
 * Add model to Prisma schema
 */
async function addModelToSchema(schemaPath, featureName) {
  try {
    // Read existing schema
    const schemaContent = await fs.readFile(schemaPath, 'utf8');

    // Read model template
    const templatePath = path.join(__dirname, '../templates/feature-db/schema-addition.prisma.template');
    const modelTemplate = await fs.readFile(templatePath, 'utf8');

    // Replace template variables
    const modelContent = modelTemplate
      .replace(/\{\{featureName\}\}/g, featureName)
      .replace(/\{\{FeatureName\}\}/g, featureName.charAt(0).toUpperCase() + featureName.slice(1));

    // Append model to schema
    const updatedSchema = schemaContent + '\n' + modelContent + '\n';

    await fs.writeFile(schemaPath, updatedSchema, 'utf8');
    console.log(`✅ Added ${featureName.charAt(0).toUpperCase() + featureName.slice(1)} model to schema.prisma`);

  } catch (error) {
    console.error(`❌ Failed to add model to schema: ${error.message}`);
    throw error;
  }
}

/**
 * Ensure DATABASE_URL exists in .env
 */
async function ensureDatabaseUrl(projectDir) {
  const envPath = path.join(projectDir, '.env');

  try {
    // Check if .env exists
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch {
      // .env doesn't exist, will create it
    }

    // Check if DATABASE_URL already exists
    if (!envContent.includes('DATABASE_URL=')) {
      const databaseUrl = '\nDATABASE_URL="file:./dev.db"\n';
      envContent += databaseUrl;
      await fs.writeFile(envPath, envContent, 'utf8');
      console.log(`✅ Added DATABASE_URL to .env`);
    }

  } catch (error) {
    console.error(`❌ Failed to setup .env file: ${error.message}`);
    throw error;
  }
}

/**
 * Run Prisma commands automatically
 */
async function runPrismaCommands(projectDir) {
  const { spawn } = await import('child_process');

  try {
    console.log(`🔄 Running Prisma database setup...`);

    // Run prisma db push
    await new Promise((resolve, reject) => {
      const dbPush = spawn('npx', ['prisma', 'db', 'push'], {
        cwd: projectDir,
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      dbPush.stdout?.on('data', (data) => {
        output += data.toString();
      });

      dbPush.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      dbPush.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Database schema applied`);
          resolve(undefined);
        } else {
          console.error(`❌ prisma db push failed: ${errorOutput}`);
          reject(new Error(`prisma db push failed with code ${code}`));
        }
      });
    });

    // Run prisma generate
    await new Promise((resolve, reject) => {
      const generate = spawn('npx', ['prisma', 'generate'], {
        cwd: projectDir,
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      generate.stdout?.on('data', (data) => {
        output += data.toString();
      });

      generate.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      generate.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Prisma client generated`);
          resolve(undefined);
        } else {
          console.error(`❌ prisma generate failed: ${errorOutput}`);
          reject(new Error(`prisma generate failed with code ${code}`));
        }
      });
    });

  } catch (error) {
    console.error(`❌ Failed to run Prisma commands: ${error.message}`);
    throw error;
  }
}