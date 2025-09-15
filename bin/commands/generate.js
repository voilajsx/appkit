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
    console.log(`  src/api/features/${name}/${name}.route.ts`);
    console.log(`  src/api/features/${name}/${name}.service.ts`);
    console.log(`  src/api/features/${name}/${name}.types.ts`);

    console.log(`\n🚀 Feature available at: /api/${name}`);
    console.log(`\n💡 Next steps:`);
    console.log(`  1. Update ${name}.types.ts with your data types`);
    console.log(`  2. Implement business logic in ${name}.service.ts`);
    console.log(`  3. Test your API: curl http://localhost:3000/api/${name}`);

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

  // Template paths
  const templatesPath = path.join(__dirname, '../templates/feature');

  try {
    // Generate TypeScript files from templates
    await generateFromTemplate(templatesPath, 'feature.route.ts.template', featurePath, `${name}.route.ts`, name);
    await generateFromTemplate(templatesPath, 'feature.service.ts.template', featurePath, `${name}.service.ts`, name);
    await generateFromTemplate(templatesPath, 'feature.types.ts.template', featurePath, `${name}.types.ts`, name);

    console.log(`✅ Created feature directory: ${name}/`);
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