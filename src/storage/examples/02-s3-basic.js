/**
 * Basic S3 Storage - @voilajsx/appkit
 * @file 02-s3-basic.js
 * Simple example showing S3 cloud storage operations
 *
 * Run: AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=xxx node 02-s3-basic.js
 */

import { initStorage, getStorage } from '../index.js';

// Initialize S3 storage
await initStorage('s3', {
  bucket: 'my-bucket-name', // Replace with your S3 bucket name
  region: 'us-east-1', // Replace with your S3 region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = getStorage();

// Upload a file
const result = await storage.upload(
  Buffer.from('Hello from S3!'),
  'demo/hello-s3.txt'
);

console.log('File uploaded:', result.url);

// Upload with progress tracking
const largeData = Buffer.alloc(10 * 1024 * 1024); // 10MB
await storage.upload(largeData, 'demo/large-file.bin', {}, (progress) =>
  console.log(`Progress: ${progress}%`)
);

// Get file content back
const content = await storage.get('demo/hello-s3.txt');
console.log('File content:', content.toString());

// Get signed URL for secure access
if (storage.getSignedUrl) {
  const signedUrl = await storage.getSignedUrl('demo/hello-s3.txt', {
    expiresIn: 3600, // 1 hour
  });
  console.log('Signed URL:', signedUrl);
}

// List files
const files = await storage.list('demo/');
console.log('Demo files:', files);

console.log('\n✅ Files uploaded to S3 bucket');
