/**
 * @fileoverview AppKit Create Command - Backend API project scaffolding
 * @description Creates new backend API projects with FBCA structure using AppKit modules
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Copy directory recursively with template processing
 */
async function copyDirectory(src, dest, projectName, excludeFiles = []) {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    // Skip excluded files
    if (excludeFiles.includes(entry.name)) {
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, projectName, excludeFiles);
    } else {
      let content = await fs.readFile(srcPath, 'utf8');

      // Process template variables
      content = content.replace(/{{projectName}}/g, projectName);

      // Remove .template extension
      const finalDestPath = destPath.endsWith('.template')
        ? destPath.slice(0, -9)
        : destPath;

      await fs.writeFile(finalDestPath, content);
    }
  }
}

/**
 * Install dependencies
 */
function installDependencies(projectPath) {
  return new Promise((resolve, reject) => {
    console.log('📦 Installing dependencies...');

    const npm = spawn('npm', ['install'], {
      cwd: projectPath,
      stdio: 'inherit'
    });

    npm.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Dependencies installed');
        resolve();
      } else {
        reject(new Error(`npm install failed with code ${code}`));
      }
    });
  });
}

/**
 * Create a new AppKit backend project
 */
export async function createProject(name, options) {
  try {
    const projectPath = path.resolve(process.cwd(), name);
    const srcApiPath = path.join(projectPath, 'src', 'api');
    const templatesPath = path.join(__dirname, '..', 'templates', 'backend');

    // Check if we're in existing project with src/api
    const existingApiPath = path.join(process.cwd(), 'src', 'api');
    const isExistingProject = await fs.access(existingApiPath).then(() => true).catch(() => false);

    if (isExistingProject) {
      console.log('🔍 Detected existing src/api folder, adding features only...\n');

      // Just copy features to existing project
      const featuresTemplatePath = path.join(templatesPath, 'features');
      const existingFeaturesPath = path.join(existingApiPath, 'features');

      await copyDirectory(featuresTemplatePath, existingFeaturesPath, name);
      console.log('✅ Features added to existing project');

      // Update package.json dependencies
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      try {
        const packageContent = await fs.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageContent);

        // Add backend dependencies
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.dependencies['@voilajsx/appkit'] = '^1.0.0';
        packageJson.dependencies['express'] = '^4.18.2';
        packageJson.dependencies['cors'] = '^2.8.5';

        packageJson.devDependencies = packageJson.devDependencies || {};
        packageJson.devDependencies['nodemon'] = '^3.0.1';

        // Add scripts if they don't exist
        packageJson.scripts = packageJson.scripts || {};
        if (!packageJson.scripts['dev:api']) {
          packageJson.scripts['dev:api'] = 'nodemon src/api/server.js';
        }
        if (!packageJson.scripts['start:api']) {
          packageJson.scripts['start:api'] = 'node src/api/server.js';
        }

        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Updated package.json with backend dependencies');

        // Install dependencies
        await installDependencies(process.cwd());

      } catch (error) {
        console.warn('⚠️  Could not update package.json automatically');
      }

    } else {
      console.log(`🚀 Creating new AppKit backend project "${name}"...\n`);

      // Validate project name
      if (!name || !/^[a-zA-Z0-9-_]+$/.test(name)) {
        console.error('❌ Invalid project name. Use only letters, numbers, hyphens, and underscores.');
        process.exit(1);
      }

      // Check if directory exists
      try {
        await fs.access(projectPath);
        console.error(`❌ Directory "${name}" already exists.`);
        process.exit(1);
      } catch {
        // Directory doesn't exist, good to proceed
      }

      // Create full backend project
      await fs.mkdir(projectPath, { recursive: true });
      console.log(`✅ Created ${name}/`);

      // Copy all templates except package.json.template and .env.template (handled separately)
      await copyDirectory(templatesPath, path.join(projectPath, 'src', 'api'), name, ['package.json.template', '.env.template']);

      // Copy package.json to project root
      const packageTemplatePath = path.join(templatesPath, 'package.json.template');
      const packageContent = await fs.readFile(packageTemplatePath, 'utf8');
      const processedPackage = packageContent.replace(/{{projectName}}/g, name);
      await fs.writeFile(path.join(projectPath, 'package.json'), processedPackage);

      // Copy .env to project root
      const envTemplatePath = path.join(templatesPath, '.env.template');
      const envContent = await fs.readFile(envTemplatePath, 'utf8');
      const processedEnv = envContent.replace(/{{projectName}}/g, name);
      await fs.writeFile(path.join(projectPath, '.env'), processedEnv);

      console.log('✅ Generated backend API structure');
      console.log('✅ Generated .env configuration file');

      // Install dependencies
      await installDependencies(projectPath);
    }

    console.log('\\n🎉 Backend project ready!');
    console.log('\\n📋 Next steps:');

    if (isExistingProject) {
      console.log('   npm run dev:api     # Start the API server');
    } else {
      console.log(`   cd ${name}`);
      console.log('   npm run dev         # Start the API server');
    }

    console.log('\\n📚 Available endpoints:');
    console.log('   GET  /health        # Health check');
    console.log('   GET  /api/users     # Users API');
    console.log('   GET  /api/auth      # Auth API');

  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    process.exit(1);
  }
}