# @voilajsx/appkit - Storage Module 📁

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple file storage that just works with automatic Local/S3/R2 strategy

**One function** returns a storage system with automatic strategy detection.
Zero configuration needed, production-ready cloud integration by default, with
built-in CDN support and cost optimization.

## 🚀 Why Choose This?

- **⚡ One Function** - Just `store.get()`, everything else is automatic
- **☁️ Auto Strategy** - Cloud env vars → Distributed, No vars → Local
- **🔧 Zero Configuration** - Smart defaults for everything
- **💰 Cost Optimized** - R2 prioritized for zero egress fees
- **🌍 CDN Ready** - Automatic CDN URL generation
- **🔒 Security Built-in** - File type validation, size limits, signed URLs
- **⚖️ Scales Perfectly** - Development → Production with no code changes
- **🤖 AI-Ready** - Optimized for LLM code generation

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

### Local Storage (Development)

```typescript
import { store } from '@voilajsx/appkit/storage';

const storage = store.get();

// Upload files
await storage.put('avatars/user123.jpg', imageBuffer);

// Download files
const imageData = await storage.get('avatars/user123.jpg');

// Get public URL
const url = storage.url('avatars/user123.jpg');
// → /uploads/avatars/user123.jpg

// List files
const files = await storage.list('avatars/');
```

### Cloud Storage (Production)

```bash
# Cloudflare R2 (Recommended - Zero egress fees)
CLOUDFLARE_R2_BUCKET=my-bucket
CLOUDFLARE_ACCOUNT_ID=account123
CLOUDFLARE_R2_ACCESS_KEY_ID=access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=secret_key

# OR AWS S3 / S3-Compatible
AWS_S3_BUCKET=my-bucket
AWS_ACCESS_KEY_ID=access_key
AWS_SECRET_ACCESS_KEY=secret_key
```

```typescript
import { store } from '@voilajsx/appkit/storage';

const storage = store.get();

// Same code - now distributed across CDN!
await storage.put('products/item123.jpg', imageBuffer);
const url = storage.url('products/item123.jpg');
// → https://cdn.example.com/products/item123.jpg
```

**That's it!** Files automatically sync across all your servers.

## 🧠 Mental Model

### **Strategy Auto-Detection**

Environment variables determine storage backend:

```bash
# Development/Single Server
# (no cloud env vars)
→ Local Strategy: ./uploads/ directory

# Production Cloud (Priority: R2 → S3 → Local)
CLOUDFLARE_R2_BUCKET=bucket → R2 (zero egress fees)
AWS_S3_BUCKET=bucket        → S3 (AWS/Wasabi/MinIO)
# No cloud vars              → Local (with warning)
```

### **File Organization**

```typescript
// Organize files with folder structure
await storage.put('users/123/avatar.jpg', imageBuffer);
await storage.put('products/456/gallery/1.jpg', imageBuffer);
await storage.put('documents/contracts/legal.pdf', pdfBuffer);

// List by folder
const userFiles = await storage.list('users/123/');
const productGallery = await storage.list('products/456/gallery/');
```

## 📖 Complete API Reference

### Core Function

```typescript
const storage = store.get(); // One function, everything you need
```

### File Operations

```typescript
// Upload files
await storage.put(key, data, options?);
await storage.put('file.jpg', buffer, {
  contentType: 'image/jpeg',
  metadata: { userId: '123' },
  cacheControl: 'public, max-age=31536000'
});

// Download files
const buffer = await storage.get('file.jpg');

// Delete files
const success = await storage.delete('file.jpg');

// Check existence
const exists = await storage.exists('file.jpg');

// Copy files
await storage.copy('source.jpg', 'backup.jpg');
```

### URL Generation

```typescript
// Public URLs
const url = storage.url('file.jpg');
// Local:  /uploads/file.jpg
// S3:     https://bucket.s3.region.amazonaws.com/file.jpg
// R2:     https://cdn.example.com/file.jpg

// Signed URLs (temporary access)
const signedUrl = await storage.signedUrl('private.pdf', 3600); // 1 hour
```

### File Listing

```typescript
// List all files
const allFiles = await storage.list();

// List with prefix
const images = await storage.list('images/');

// List with limit
const recent = await storage.list('logs/', 10);

// File metadata
files.forEach((file) => {
  console.log(`${file.key}: ${file.size} bytes, ${file.lastModified}`);
});
```

### Helper Methods

```typescript
// Quick upload with auto-naming
const { key, url } = await store.upload(buffer, {
  folder: 'uploads',
  filename: 'document.pdf',
  contentType: 'application/pdf',
});

// Quick download with content type
const { data, contentType } = await store.download('file.jpg');
```

### Utility Methods

```typescript
// Debug info
store.getStrategy(); // 'local' | 's3' | 'r2'
store.hasCloudStorage(); // true if S3/R2 configured
store.isLocal(); // true if using local storage
store.getConfig(); // Current configuration
store.getStats(); // Usage statistics

// Cleanup
await storage.disconnect();
await store.clear(); // For testing
```

## 🎯 Usage Examples

### **Express File Upload API**

```typescript
import express from 'express';
import multer from 'multer';
import { store } from '@voilajsx/appkit/storage';

const app = express();
const storage = store.get();
const upload = multer({ storage: multer.memoryStorage() });

// Single file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const timestamp = Date.now();
    const key = `uploads/${timestamp}-${req.file.originalname}`;

    await storage.put(key, req.file.buffer, {
      contentType: req.file.mimetype,
      metadata: {
        originalName: req.file.originalname,
        uploadedBy: req.user?.id || 'anonymous',
        uploadedAt: new Date().toISOString(),
      },
    });

    const url = storage.url(key);

    res.json({
      success: true,
      file: {
        key,
        url,
        size: req.file.size,
        contentType: req.file.mimetype,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File download
app.get('/files/:key(*)', async (req, res) => {
  try {
    const key = req.params.key;

    if (!(await storage.exists(key))) {
      return res.status(404).json({ error: 'File not found' });
    }

    const buffer = await storage.get(key);

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${key.split('/').pop()}"`
    );

    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate signed download URL
app.get('/files/:key(*)/signed', async (req, res) => {
  try {
    const key = req.params.key;
    const expiresIn = parseInt(req.query.expires as string) || 3600; // 1 hour default

    const signedUrl = await storage.signedUrl(key, expiresIn);

    res.json({
      url: signedUrl,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### **Image Processing Pipeline**

```typescript
import { store } from '@voilajsx/appkit/storage';
import sharp from 'sharp';

const storage = store.get();

export class ImageProcessor {
  async processImage(originalKey: string) {
    // Download original
    const originalBuffer = await storage.get(originalKey);

    // Create different sizes
    const sizes = [
      { name: 'thumb', width: 150, height: 150 },
      { name: 'medium', width: 500, height: 500 },
      { name: 'large', width: 1200, height: 1200 },
    ];

    const results = [];

    for (const size of sizes) {
      // Process with Sharp
      const processedBuffer = await sharp(originalBuffer)
        .resize(size.width, size.height, {
          fit: 'cover',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Generate new key
      const [name, ext] = originalKey.split('.');
      const newKey = `${name}-${size.name}.${ext}`;

      // Upload processed image
      await storage.put(newKey, processedBuffer, {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000', // 1 year cache
      });

      results.push({
        size: size.name,
        key: newKey,
        url: storage.url(newKey),
        dimensions: `${size.width}x${size.height}`,
      });
    }

    return results;
  }

  async cleanupProcessedImages(originalKey: string) {
    const [name] = originalKey.split('.');
    const files = await storage.list(name);

    for (const file of files) {
      if (
        file.key.includes('-thumb.') ||
        file.key.includes('-medium.') ||
        file.key.includes('-large.')
      ) {
        await storage.delete(file.key);
      }
    }
  }
}
```

### **Document Management System**

```typescript
import { store } from '@voilajsx/appkit/storage';

const storage = store.get();

export class DocumentManager {
  async uploadDocument(
    file: Buffer,
    metadata: {
      userId: string;
      category: string;
      filename: string;
      contentType: string;
    }
  ) {
    const { userId, category, filename } = metadata;
    const timestamp = Date.now();
    const key = `documents/${userId}/${category}/${timestamp}-${filename}`;

    await storage.put(key, file, {
      contentType: metadata.contentType,
      metadata: {
        userId,
        category,
        originalName: filename,
        uploadedAt: new Date().toISOString(),
      },
    });

    return {
      documentId: key,
      url: storage.url(key),
      category,
      uploadedAt: new Date(),
    };
  }

  async getUserDocuments(userId: string, category?: string) {
    const prefix = category
      ? `documents/${userId}/${category}/`
      : `documents/${userId}/`;

    const files = await storage.list(prefix);

    return files.map((file) => ({
      documentId: file.key,
      filename: file.key.split('/').pop(),
      category: file.key.split('/')[2],
      size: file.size,
      lastModified: file.lastModified,
      url: storage.url(file.key),
    }));
  }

  async generateShareLink(documentId: string, expiresInHours: number = 24) {
    const expiresIn = expiresInHours * 3600; // Convert to seconds
    const signedUrl = await storage.signedUrl(documentId, expiresIn);

    return {
      url: signedUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      expiresInHours,
    };
  }

  async deleteDocument(documentId: string) {
    return await storage.delete(documentId);
  }
}
```

### **Backup & Sync System**

```typescript
import { store } from '@voilajsx/appkit/storage';

const storage = store.get();

export class BackupManager {
  async createBackup(sourcePrefix: string) {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const backupPrefix = `backups/${timestamp}/`;

    const sourceFiles = await storage.list(sourcePrefix);
    const backupResults = [];

    for (const file of sourceFiles) {
      const relativePath = file.key.replace(sourcePrefix, '');
      const backupKey = backupPrefix + relativePath;

      try {
        await storage.copy(file.key, backupKey);
        backupResults.push({
          original: file.key,
          backup: backupKey,
          status: 'success',
        });
      } catch (error) {
        backupResults.push({
          original: file.key,
          backup: backupKey,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return {
      backupId: timestamp,
      sourcePrefix,
      backupPrefix,
      totalFiles: sourceFiles.length,
      successful: backupResults.filter((r) => r.status === 'success').length,
      failed: backupResults.filter((r) => r.status === 'failed').length,
      results: backupResults,
    };
  }

  async restoreFromBackup(backupId: string, targetPrefix: string) {
    const backupPrefix = `backups/${backupId}/`;
    const backupFiles = await storage.list(backupPrefix);

    for (const file of backupFiles) {
      const relativePath = file.key.replace(backupPrefix, '');
      const targetKey = targetPrefix + relativePath;

      await storage.copy(file.key, targetKey);
    }

    return {
      restored: backupFiles.length,
      targetPrefix,
    };
  }

  async cleanupOldBackups(retentionDays: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const backups = await storage.list('backups/');
    const oldBackups = backups.filter((file) => file.lastModified < cutoffDate);

    for (const backup of oldBackups) {
      await storage.delete(backup.key);
    }

    return {
      deleted: oldBackups.length,
      retentionDays,
    };
  }
}
```

## 🌍 Environment Variables

### Strategy Selection (Auto-detected)

```bash
# Priority order: R2 → S3 → Local

# Cloudflare R2 (Highest priority - zero egress fees)
CLOUDFLARE_R2_BUCKET=my-bucket
CLOUDFLARE_ACCOUNT_ID=account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=secret_key
CLOUDFLARE_R2_CDN_URL=https://cdn.example.com  # Optional CDN

# AWS S3 / S3-Compatible (Second priority)
AWS_S3_BUCKET=my-bucket
AWS_ACCESS_KEY_ID=access_key
AWS_SECRET_ACCESS_KEY=secret_key
AWS_REGION=us-east-1                           # Default: us-east-1

# S3-Compatible Services (Wasabi, MinIO, etc.)
S3_ENDPOINT=https://s3.wasabisys.com           # Custom endpoint
S3_FORCE_PATH_STYLE=true                       # For MinIO

# Local Storage (Fallback - no cloud vars needed)
VOILA_STORAGE_DIR=./uploads                    # Default: ./uploads
VOILA_STORAGE_BASE_URL=/uploads                # Default: /uploads
```

### Security & Limits

```bash
# File validation
VOILA_STORAGE_MAX_SIZE=52428800               # 50MB default
VOILA_STORAGE_ALLOWED_TYPES=image/*,application/pdf,text/*

# Signed URL expiration
VOILA_STORAGE_SIGNED_EXPIRY=3600              # 1 hour default

# CDN configuration
VOILA_STORAGE_CDN_URL=https://cdn.example.com # For any strategy
```

### Provider-Specific Examples

#### **Cloudflare R2**

```bash
# R2 with custom domain
CLOUDFLARE_R2_BUCKET=my-assets
CLOUDFLARE_ACCOUNT_ID=abc123
CLOUDFLARE_R2_ACCESS_KEY_ID=access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=secret_key
CLOUDFLARE_R2_CDN_URL=https://assets.myapp.com
```

#### **AWS S3**

```bash
# Standard AWS S3
AWS_S3_BUCKET=my-app-assets
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=secret...
AWS_REGION=us-west-2
VOILA_STORAGE_CDN_URL=https://d123456.cloudfront.net
```

#### **Wasabi**

```bash
# Wasabi S3-compatible
AWS_S3_BUCKET=my-wasabi-bucket
AWS_ACCESS_KEY_ID=wasabi_key
AWS_SECRET_ACCESS_KEY=wasabi_secret
S3_ENDPOINT=https://s3.us-east-1.wasabisys.com
AWS_REGION=us-east-1
```

#### **MinIO**

```bash
# Self-hosted MinIO
AWS_S3_BUCKET=my-bucket
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true
```

#### **DigitalOcean Spaces**

```bash
# DigitalOcean Spaces
AWS_S3_BUCKET=my-space
AWS_ACCESS_KEY_ID=do_key
AWS_SECRET_ACCESS_KEY=do_secret
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
AWS_REGION=us-east-1
VOILA_STORAGE_CDN_URL=https://my-space.nyc3.cdn.digitaloceanspaces.com
```

## 🔄 Development vs Production

### **Development Mode**

```bash
# No environment variables needed
NODE_ENV=development
```

```typescript
const storage = store.get();
// Strategy: Local filesystem (./uploads/)
// URLs: /uploads/file.jpg
// Features: File type validation, size limits
```

### **Production Mode**

```bash
# Cloud storage required
NODE_ENV=production
CLOUDFLARE_R2_BUCKET=prod-assets
# ... other cloud credentials
```

```typescript
const storage = store.get();
// Strategy: R2 or S3 (distributed)
// URLs: https://cdn.example.com/file.jpg
// Features: CDN delivery, signed URLs, zero egress (R2)
```

### **Scaling Pattern**

```typescript
// Week 1: Local development
// No env vars needed - works immediately

// Month 1: Add cloud storage
// Set CLOUDFLARE_R2_BUCKET - zero code changes

// Year 1: Add CDN
// Set CLOUDFLARE_R2_CDN_URL - automatic CDN delivery
```

## 🧪 Testing

### **Test Setup**

```typescript
import { store } from '@voilajsx/appkit/storage';

describe('File Storage', () => {
  afterEach(async () => {
    // IMPORTANT: Clear storage state between tests
    await store.clear();
  });

  test('should upload and download files', async () => {
    const storage = store.get();

    const testData = Buffer.from('Hello, World!');
    await storage.put('test.txt', testData);

    const downloaded = await storage.get('test.txt');
    expect(downloaded.toString()).toBe('Hello, World!');
  });

  test('should generate public URLs', async () => {
    const storage = store.get();

    await storage.put('image.jpg', Buffer.from('fake image'));
    const url = storage.url('image.jpg');

    expect(url).toMatch(/image\.jpg$/);
  });
});
```

### **Mock Cloud Storage for Tests**

```typescript
// Force local strategy for testing
describe('Storage with Local Strategy', () => {
  beforeEach(() => {
    store.reset({
      strategy: 'local',
      local: {
        dir: './test-uploads',
        baseUrl: '/test-uploads',
        maxFileSize: 1048576, // 1MB for tests
        allowedTypes: ['*'],
        createDirs: true,
      },
    });
  });

  afterEach(async () => {
    await store.clear();
    // Clean up test directory
    await fs.rm('./test-uploads', { recursive: true, force: true });
  });
});
```

## 🤖 LLM Guidelines

### **Essential Patterns**

```typescript
// ✅ ALWAYS use these patterns
import { store } from '@voilajsx/appkit/storage';
const storage = store.get();

// ✅ File operations
await storage.put('folder/file.jpg', buffer);
const data = await storage.get('folder/file.jpg');
await storage.delete('folder/file.jpg');

// ✅ URL generation
const publicUrl = storage.url('file.jpg');
const signedUrl = await storage.signedUrl('private.pdf', 3600);

// ✅ File organization
const files = await storage.list('images/');
const exists = await storage.exists('document.pdf');

// ✅ Helper methods for quick operations
const { key, url } = await store.upload(buffer, {
  folder: 'uploads',
  filename: 'document.pdf',
});
```

### **Anti-Patterns to Avoid**

```typescript
// ❌ DON'T create StorageClass directly
import { StorageClass } from '@voilajsx/appkit/storage';
const storage = new StorageClass(config); // Wrong!

// ❌ DON'T forget to handle async operations
storage.put('file.jpg', buffer); // Missing await!

// ❌ DON'T use invalid keys
await storage.put('/file.jpg', buffer); // Leading slash
await storage.put('folder/../file.jpg', buffer); // Path traversal
await storage.put('folder\\file.jpg', buffer); // Backslashes

// ❌ DON'T ignore file size limits
// Check file size before upload for large files

// ❌ DON'T forget cleanup in tests
test('my test', () => {
  // ... test code
  // Missing: await store.clear();
});

// ❌ DON'T hardcode storage strategy
if (storage.getStrategy() === 'local') {
} // Use storage methods instead
```

### **Common Patterns**

```typescript
// File upload with validation
const maxSize = 10 * 1024 * 1024; // 10MB
if (buffer.length > maxSize) {
  throw new Error('File too large');
}

await storage.put(`uploads/${userId}/${filename}`, buffer, {
  contentType: mimeType,
  metadata: {
    userId,
    uploadedAt: new Date().toISOString(),
  },
});

// Image processing workflow
const originalKey = await storage.put('originals/image.jpg', buffer);
const thumbnailBuffer = await processImage(buffer, { width: 150 });
const thumbnailKey = await storage.put('thumbnails/image.jpg', thumbnailBuffer);

// Document sharing
const signedUrl = await storage.signedUrl('documents/secret.pdf', 3600);
const shareLink = {
  url: signedUrl,
  expiresAt: new Date(Date.now() + 3600 * 1000),
};

// Batch operations
const files = await storage.list('temp/');
for (const file of files) {
  if (file.lastModified < cutoffDate) {
    await storage.delete(file.key);
  }
}
```

## 📈 Performance

- **Local Strategy**: ~1ms per operation (filesystem I/O)
- **S3 Strategy**: ~50-200ms per operation (network + AWS)
- **R2 Strategy**: ~50-200ms per operation (network + Cloudflare)
- **CDN URLs**: ~1ms generation (no network calls)
- **Memory Usage**: <5MB baseline per strategy

## 💰 Cost Comparison

| Provider          | Storage    | Egress   | CDN        | Best For                    |
| ----------------- | ---------- | -------- | ---------- | --------------------------- |
| **Local**         | Free       | Free     | None       | Development, single server  |
| **Cloudflare R2** | $0.015/GB  | **FREE** | Included   | High-bandwidth, global apps |
| **AWS S3**        | $0.023/GB  | $0.09/GB | Extra cost | Enterprise, AWS ecosystem   |
| **Wasabi**        | $0.0059/GB | FREE     | Extra cost | Archive, backup storage     |

## 🔍 TypeScript Support

Full TypeScript support with comprehensive interfaces:

```typescript
import type {
  Storage,
  StorageFile,
  PutOptions,
} from '@voilajsx/appkit/storage';

// Strongly typed storage operations
const storage: Storage = store.get();

const files: StorageFile[] = await storage.list('images/');
const options: PutOptions = {
  contentType: 'image/jpeg',
  metadata: { userId: '123' },
};

await storage.put('image.jpg', buffer, options);
```

## 🆚 Why Not AWS SDK/Google Cloud directly?

**Other approaches:**

```javascript
// AWS SDK: Complex setup, provider-specific
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: 'key',
  secretAccessKey: 'secret',
  region: 'us-east-1',
});

const params = {
  Bucket: 'bucket',
  Key: 'file.jpg',
  Body: buffer,
  ContentType: 'image/jpeg',
};

s3.upload(params, callback);
```

**This library:**

```typescript
// 2 lines, works with any provider
import { store } from '@voilajsx/appkit/storage';
await store.get().put('file.jpg', buffer);
```

**Same features, 90% less code, automatic provider detection.**

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  <strong>Built with ❤️ by the <a href="https://github.com/voilajsx">VoilaJSX Team</a></strong><br>
  Because file storage should be simple, not a vendor nightmare.
</p>
