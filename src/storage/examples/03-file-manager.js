/**
 * File Manager - @voilajsx/appkit
 * @file 03-file-manager.js
 * Simple file management operations
 *
 * Run: node 03-file-manager.js
 */

import { initStorage, getStorage } from '../index.js';

// Setup storage
await initStorage('local', { basePath: './file-manager-demo' });
const storage = getStorage();

// Create some demo files
const categories = ['documents', 'images', 'videos'];
for (const category of categories) {
  await storage.upload(
    Buffer.from(`Sample ${category} content`),
    `${category}/sample-${Date.now()}.txt`
  );
}

// List files by category
for (const category of categories) {
  const files = await storage.list(`${category}/`);
  console.log(`${category}:`, files.length, 'files');
}

// Search for files
const allFiles = await storage.list();
const txtFiles = allFiles.filter((path) => path.endsWith('.txt'));
console.log('Text files:', txtFiles);

// Get file content
if (txtFiles.length > 0) {
  const content = await storage.get(txtFiles[0]);
  console.log('First file content:', content.toString());
}

// Check file existence
const exists = await storage.exists('documents/sample.txt');
console.log('Sample exists:', exists);

// Get file URLs
allFiles.forEach((path) => {
  console.log(`${path} -> ${storage.getUrl(path)}`);
});

// Cleanup - delete all files
console.log('\nCleaning up files...');
for (const file of allFiles) {
  await storage.delete(file);
  console.log(`Deleted: ${file}`);
}

console.log('\n✅ File management operations completed');
