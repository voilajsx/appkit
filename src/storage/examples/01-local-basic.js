/**
 * Basic Local Storage - @voilajsx/appkit
 * @file 01-local-basic.js
 * Simple example showing local file storage operations
 *
 * Run: node 01-local-basic.js
 */

import { initStorage, getStorage } from '../index.js';

// Initialize local storage
await initStorage('local', {
  basePath: './storage-demo',
  baseUrl: '/files',
});

const storage = getStorage();

// Save a text file
await storage.upload(Buffer.from('Hello World!'), 'documents/hello.txt');

// Save JSON data
const userData = { name: 'John', age: 30 };
await storage.upload(
  Buffer.from(JSON.stringify(userData, null, 2)),
  'users/john.json'
);

// Read files back
const textContent = await storage.get('documents/hello.txt');
const jsonData = await storage.get('users/john.json');

console.log('Text file:', textContent.toString());
console.log('JSON data:', JSON.parse(jsonData.toString()));

// List all files
const files = await storage.list();
console.log('All files:', files);

// Check if file exists
const exists = await storage.exists('users/john.json');
console.log('User file exists:', exists);

// Get file URLs
files.forEach((path) => {
  console.log(`${path} -> ${storage.getUrl(path)}`);
});

console.log('\n✅ Files saved to the "storage-demo" folder');
