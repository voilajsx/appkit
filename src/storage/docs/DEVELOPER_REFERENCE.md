# Storage Module - Developer REFERENCE 🛠️

The storage module provides unified file operations across different storage
providers with automatic optimizations and a clean, minimalist API. Whether
you're building Tauri desktop apps, web applications, or Node.js backends, this
module offers consistent file handling with smart defaults.

This module follows the principle of essentialism - providing only the core
functionality you actually need, with intelligent automation for complex
operations like multipart uploads and directory management.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📁 [Local File Storage](#local-file-storage)
- ☁️ [S3 Cloud Storage](#s3-cloud-storage)
- 📤 [File Upload Patterns](#file-upload-patterns)
- 📥 [File get & Management](#file-get--management)
- 🎯 [Tauri Integration](#tauri-integration)
- 🌐 [Web Application Integration](#web-application-integration)
- 🚀 [Complete Integration Example](#complete-integration-example)
- 📚 [Additional Resources](#additional-resources)
- 💡 [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @voilajsx/appkit
```

### Basic Import

```javascript
import { initStorage, getStorage } from '@voilajsx/appkit/storage';
```

## Local File Storage

Local storage is perfect for Tauri apps, development environments, and
applications that need fast, direct file access.

### Basic Setup

Set up local file storage with automatic directory creation:

```javascript
import { initStorage, getStorage } from '@voilajsx/appkit/storage';

// Initialize local storage
await initStorage('local', {
  basePath: './app-data',
  baseUrl: '/files',
});

const storage = getStorage();

// Upload a file
const result = await storage.upload(
  Buffer.from('Hello World!'),
  'documents/hello.txt'
);
console.log('File saved:', result.url);
```

**When to use:**

- **Tauri Desktop Apps**: Store user data and app settings
- **Development**: Quick setup without cloud dependencies
- **Offline Applications**: Apps that work without internet

### File Operations

Basic file operations with automatic optimizations:

```javascript
// Save JSON data
const userData = { name: 'John', age: 30 };
await storage.upload(Buffer.from(JSON.stringify(userData)), 'users/john.json');

// Load JSON data
const data = await storage.get('users/john.json');
const user = JSON.parse(data.toString());

// Check if file exists
if (await storage.exists('users/john.json')) {
  console.log('User file found');
}

// List all user files
const files = await storage.list('users/');
console.log('User files:', files);
```

### Complete Local Example

Here's a simple document manager for a Tauri app:

```javascript
import { initStorage, getStorage } from '@voilajsx/appkit/storage';

class SimpleDocumentManager {
  constructor() {
    this.storage = null;
  }

  async init() {
    await initStorage('local', {
      basePath: './documents',
      baseUrl: '/docs',
    });
    this.storage = getStorage();
  }

  async saveDocument(name, content) {
    const doc = {
      name: name,
      content: content,
      createdAt: new Date().toISOString(),
    };

    const result = await this.storage.upload(
      Buffer.from(JSON.stringify(doc, null, 2)),
      `${name}.json`
    );

    return result;
  }

  async loadDocument(name) {
    try {
      const data = await this.storage.get(`${name}.json`);
      return JSON.parse(data.toString());
    } catch (error) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async listDocuments() {
    const files = await this.storage.list();
    return files.map((file) => file.replace('.json', ''));
  }

  async deleteDocument(name) {
    return this.storage.delete(`${name}.json`);
  }
}

// Usage
const docManager = new SimpleDocumentManager();
await docManager.init();

await docManager.saveDocument('my-note', 'This is my note content');
const note = await docManager.loadDocument('my-note');
const docs = await docManager.listDocuments();
```

**When to implement:**

- **Note-taking Apps**: Simple document storage
- **Settings Management**: App configuration files
- **User Data**: Profile and preference storage

## S3 Cloud Storage

S3 storage is ideal for web applications and when you need global file access.

### Configuration

Set up S3 storage with automatic multipart upload handling:

```javascript
import { initStorage, getStorage } from '@voilajsx/appkit/storage';

// Production S3 setup
await initStorage('s3', {
  bucket: 'my-app-files',
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = getStorage();

// Upload to S3
const result = await storage.upload(imageBuffer, 'images/photo.jpg', {
  contentType: 'image/jpeg',
});
console.log('Uploaded to S3:', result.url);
```

### Upload Strategies

The module automatically optimizes uploads based on file size:

```javascript
// Small files - fast upload
const doc = await storage.upload(pdfBuffer, 'documents/contract.pdf', {
  contentType: 'application/pdf',
});

// Large files - automatic multipart upload with progress
const video = await storage.upload(
  videoBuffer,
  'videos/movie.mp4',
  { contentType: 'video/mp4' },
  (progress) => console.log(`Upload: ${progress}%`)
);
```

### Complete S3 Example

Here's a simple file service for web apps:

```javascript
import { initStorage, getStorage } from '@voilajsx/appkit/storage';

class SimpleFileService {
  constructor() {
    this.storage = null;
  }

  async init() {
    await initStorage('s3', {
      bucket: process.env.S3_BUCKET,
      region: process.env.AWS_REGION,
    });
    this.storage = getStorage();
  }

  async uploadUserFile(userId, fileBuffer, filename) {
    const path = `users/${userId}/${Date.now()}-${filename}`;

    const result = await this.storage.upload(fileBuffer, path);

    return {
      id: path,
      url: result.url,
      size: result.size,
    };
  }

  async getUserFiles(userId) {
    const files = await this.storage.list(`users/${userId}/`);
    return files.map((path) => ({
      id: path,
      name: path.split('/').pop(),
      url: this.storage.getUrl(path),
    }));
  }

  async deleteUserFile(userId, fileId) {
    if (fileId.startsWith(`users/${userId}/`)) {
      return this.storage.delete(fileId);
    }
    throw new Error('Access denied');
  }
}

// Usage
const fileService = new SimpleFileService();
await fileService.init();

const uploaded = await fileService.uploadUserFile(
  'user123',
  imageBuffer,
  'photo.jpg'
);
const userFiles = await fileService.getUserFiles('user123');
```

**When to use:**

- **Web Applications**: User file uploads
- **Content Delivery**: Global file access
- **Backup Systems**: Reliable cloud storage

## File Upload Patterns

Handle different types of file uploads with progress tracking.

### Simple Uploads

Basic upload patterns for common file types:

```javascript
// Text files
await storage.upload(Buffer.from('Configuration data'), 'config/settings.txt');

// Images with content type
await storage.upload(imageBuffer, 'images/photo.jpg', {
  contentType: 'image/jpeg',
});

// JSON data
const data = { user: 'john', preferences: {} };
await storage.upload(
  Buffer.from(JSON.stringify(data)),
  'users/john-prefs.json'
);
```

### Progress Tracking

Simple progress tracking for large files:

```javascript
async function uploadWithProgress(file, path) {
  console.log('Starting upload...');

  const result = await storage.upload(file, path, {}, (progress) => {
    console.log(`Progress: ${progress}%`);
    // Update your UI progress bar here
  });

  console.log('Upload complete!');
  return result;
}

// Usage
await uploadWithProgress(largeVideoBuffer, 'videos/presentation.mp4');
```

### Complete Upload Example

Here's a simple upload manager:

```javascript
class SimpleUploadManager {
  constructor(storage) {
    this.storage = storage;
  }

  async uploadFile(file, category = 'general') {
    const timestamp = Date.now();
    const path = `${category}/${timestamp}-${file.name}`;

    console.log(`Uploading ${file.name}...`);

    const result = await this.storage.upload(
      file.buffer,
      path,
      { contentType: file.type },
      (progress) => {
        if (progress % 25 === 0) {
          // Log every 25%
          console.log(`${file.name}: ${progress}%`);
        }
      }
    );

    console.log(`${file.name} uploaded successfully!`);
    return result;
  }

  async uploadMultiple(files) {
    const results = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file);
        results.push({ success: true, file: result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }
}

// Usage
const uploader = new SimpleUploadManager(storage);
const results = await uploader.uploadMultiple([file1, file2, file3]);
```

## File get & Management

Efficiently retrieve and manage your stored files.

### get Operations

Handle different get scenarios:

```javascript
// get file content
const fileData = await storage.get('documents/report.pdf');

// get with error handling
async function safeget(path) {
  try {
    return await storage.get(path);
  } catch (error) {
    if (error.message.includes('not found')) {
      console.log('File not found');
      return null;
    }
    throw error;
  }
}

// get JSON data
const userData = await storage.get('users/john.json');
const user = JSON.parse(userData.toString());
```

### File Listing

Organize and discover files:

```javascript
// List all files
const allFiles = await storage.list();

// List files in specific directory
const userFiles = await storage.list('users/');

// Organize files by type
const files = await storage.list('documents/');
const organized = {
  pdfs: files.filter((f) => f.endsWith('.pdf')),
  images: files.filter((f) => f.match(/\.(jpg|png|gif)$/)),
  others: files.filter((f) => !f.match(/\.(pdf|jpg|png|gif)$/)),
};
```

### Complete Management Example

Here's a simple file browser:

```javascript
class SimpleFileBrowser {
  constructor(storage) {
    this.storage = storage;
  }

  async browse(directory = '') {
    const files = await this.storage.list(directory);

    return files.map((path) => ({
      name: path.split('/').pop(),
      path: path,
      url: this.storage.getUrl(path),
      type: path.split('.').pop(),
    }));
  }

  async search(searchTerm) {
    const allFiles = await this.storage.list();

    return allFiles
      .filter((path) => path.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((path) => ({
        name: path.split('/').pop(),
        path: path,
        url: this.storage.getUrl(path),
      }));
  }

  async cleanup(olderThanDays = 30) {
    const files = await this.storage.list();
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    const deleted = [];

    for (const path of files) {
      // Extract timestamp from filename
      const match = path.match(/(\d{13})/);
      if (match && parseInt(match[1]) < cutoffTime) {
        await this.storage.delete(path);
        deleted.push(path);
      }
    }

    return deleted;
  }
}

// Usage
const browser = new SimpleFileBrowser(storage);

const files = await browser.browse('documents/');
const searchResults = await browser.search('report');
const cleaned = await browser.cleanup(7); // Delete files older than 7 days
```

## Tauri Integration

Perfect integration for desktop applications built with Tauri.

### Desktop App Setup

Set up storage for a Tauri application:

```javascript
import { initStorage, getStorage } from '@voilajsx/appkit/storage';

// Initialize Tauri app storage
async function setupTauriStorage() {
  await initStorage('local', {
    basePath: './app-data',
    baseUrl: '/app-files',
  });

  return getStorage();
}

// Simple app data manager
class TauriAppData {
  constructor() {
    this.storage = null;
  }

  async init() {
    this.storage = await setupTauriStorage();
  }

  async saveSettings(settings) {
    return this.storage.upload(
      Buffer.from(JSON.stringify(settings, null, 2)),
      'settings.json'
    );
  }

  async loadSettings() {
    try {
      const data = await this.storage.get('settings.json');
      return JSON.parse(data.toString());
    } catch (error) {
      // Return default settings if file doesn't exist
      return {
        theme: 'dark',
        language: 'en',
        autoSave: true,
      };
    }
  }

  async saveUserFile(filename, content) {
    const path = `user-files/${filename}`;
    return this.storage.upload(Buffer.from(content), path);
  }

  async getUserFiles() {
    const files = await this.storage.list('user-files/');
    return files.map((path) => ({
      name: path.replace('user-files/', ''),
      path: path,
      url: this.storage.getUrl(path),
    }));
  }
}

// Usage in Tauri app
const appData = new TauriAppData();
await appData.init();

// Save app settings
await appData.saveSettings({
  theme: 'dark',
  language: 'en',
  notifications: true,
});

// Load settings
const settings = await appData.loadSettings();
console.log('App settings:', settings);
```

### Complete Tauri Example

Here's a complete Tauri app with file storage:

```javascript
import { initStorage, getStorage } from '@voilajsx/appkit/storage';

class SimpleTauriApp {
  constructor() {
    this.storage = null;
    this.settings = null;
  }

  async init() {
    // Setup storage
    await initStorage('local', {
      basePath: './my-app-data',
      baseUrl: '/files',
    });
    this.storage = getStorage();

    // Load settings
    this.settings = await this.loadSettings();

    console.log('Tauri app initialized!');
  }

  async loadSettings() {
    try {
      const data = await this.storage.get('app-settings.json');
      return JSON.parse(data.toString());
    } catch (error) {
      const defaults = {
        theme: 'system',
        autoSave: true,
        backupEnabled: true,
      };
      await this.saveSettings(defaults);
      return defaults;
    }
  }

  async saveSettings(settings) {
    this.settings = settings;
    return this.storage.upload(
      Buffer.from(JSON.stringify(settings, null, 2)),
      'app-settings.json'
    );
  }

  async createDocument(name, content) {
    const doc = {
      name: name,
      content: content,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };

    return this.storage.upload(
      Buffer.from(JSON.stringify(doc, null, 2)),
      `documents/${name}.json`
    );
  }

  async getDocuments() {
    const files = await this.storage.list('documents/');
    const documents = [];

    for (const path of files) {
      try {
        const data = await this.storage.get(path);
        const doc = JSON.parse(data.toString());
        documents.push({
          ...doc,
          id: path.replace('documents/', '').replace('.json', ''),
        });
      } catch (error) {
        console.warn(`Failed to load document: ${path}`);
      }
    }

    return documents.sort(
      (a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt)
    );
  }
}

// Initialize app
const app = new SimpleTauriApp();
await app.init();

// Create a document
await app.createDocument('my-note', 'This is my note content');

// Get all documents
const docs = await app.getDocuments();
console.log('Documents:', docs);
```

## Web Application Integration

Seamless integration with web frameworks for file upload and get.

### Express.js Setup

Set up file storage for a web application:

```javascript
import express from 'express';
import multer from 'multer';
import { initStorage, getStorage } from '@voilajsx/appkit/storage';

const app = express();

// Initialize storage
await initStorage('local', {
  basePath: './uploads',
  baseUrl: '/files',
});

const storage = getStorage();

// Setup file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Simple file upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const result = await storage.upload(
      req.file.buffer,
      `uploads/${Date.now()}-${req.file.originalname}`
    );

    res.json({
      success: true,
      file: {
        name: req.file.originalname,
        url: result.url,
        size: result.size,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// List files endpoint
app.get('/files', async (req, res) => {
  try {
    const files = await storage.list('uploads/');

    res.json({
      files: files.map((path) => ({
        name: path.split('/').pop(),
        url: storage.getUrl(path),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Complete Web App Example

Here's a simple file sharing web app:

```javascript
import express from 'express';
import multer from 'multer';
import { initStorage, getStorage } from '@voilajsx/appkit/storage';

class SimpleFileApp {
  constructor() {
    this.app = express();
    this.storage = null;
  }

  async init() {
    // Setup storage
    await initStorage('local', {
      basePath: './file-uploads',
      baseUrl: '/gets',
    });
    this.storage = getStorage();

    // Setup routes
    this.setupRoutes();
  }

  setupRoutes() {
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    });

    this.app.use(express.static('public'));
    this.app.use(express.json());

    // Upload file
    this.app.post('/api/upload', upload.single('file'), async (req, res) => {
      try {
        const filename = `${Date.now()}-${req.file.originalname}`;

        const result = await this.storage.upload(req.file.buffer, filename, {
          contentType: req.file.mimetype,
        });

        res.json({
          success: true,
          file: {
            id: filename,
            name: req.file.originalname,
            size: result.size,
            url: result.url,
            type: req.file.mimetype,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // List files
    this.app.get('/api/files', async (req, res) => {
      try {
        const files = await this.storage.list();

        const fileList = files.map((path) => ({
          id: path,
          name: path.split('-').slice(1).join('-'), // Remove timestamp
          url: this.storage.getUrl(path),
          uploadedAt: new Date(parseInt(path.split('-')[0])),
        }));

        res.json({ files: fileList });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Delete file
    this.app.delete('/api/files/:fileId', async (req, res) => {
      try {
        const deleted = await this.storage.delete(req.params.fileId);

        res.json({
          success: deleted,
          message: deleted ? 'File deleted' : 'File not found',
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`File sharing app running on port ${port}`);
    });
  }
}

// Start the app
const app = new SimpleFileApp();
await app.init();
app.start();
```

## Complete Integration Example

Here's a production-ready example combining all features:

```javascript
import { initStorage, getStorage } from '@voilajsx/appkit/storage';

class UniversalFileManager {
  constructor() {
    this.storage = null;
    this.isWeb = typeof window !== 'undefined';
    this.isTauri = this.isWeb && window.__TAURI__;
  }

  async init() {
    if (this.isTauri) {
      // Tauri app - use local storage
      await initStorage('local', {
        basePath: './app-files',
        baseUrl: '/files',
      });
    } else if (process.env.NODE_ENV === 'production') {
      // Production web app - use S3
      await initStorage('s3', {
        bucket: process.env.S3_BUCKET,
        region: process.env.AWS_REGION,
      });
    } else {
      // Development - use local storage
      await initStorage('local', {
        basePath: './dev-uploads',
        baseUrl: '/uploads',
      });
    }

    this.storage = getStorage();
    console.log('File manager initialized for:', this.getEnvironment());
  }

  getEnvironment() {
    if (this.isTauri) return 'Tauri Desktop App';
    if (process.env.NODE_ENV === 'production') return 'Production Web App';
    return 'Development Environment';
  }

  async saveFile(content, filename, category = 'general') {
    const timestamp = Date.now();
    const path = `${category}/${timestamp}-${filename}`;

    const buffer = typeof content === 'string' ? Buffer.from(content) : content;

    return this.storage.upload(buffer, path);
  }

  async loadFile(path) {
    try {
      return await this.storage.get(path);
    } catch (error) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async listFiles(category = '') {
    const files = await this.storage.list(category);

    return files.map((path) => ({
      id: path,
      name: this.extractOriginalName(path),
      path: path,
      url: this.storage.getUrl(path),
      category: path.split('/')[0],
    }));
  }

  async deleteFile(path) {
    return this.storage.delete(path);
  }

  extractOriginalName(path) {
    const filename = path.split('/').pop();
    return filename.split('-').slice(1).join('-');
  }

  async getStats() {
    const files = await this.storage.list();

    const stats = {
      totalFiles: files.length,
      categories: {},
      environment: this.getEnvironment(),
    };

    files.forEach((path) => {
      const category = path.split('/')[0];
      stats.categories[category] = (stats.categories[category] || 0) + 1;
    });

    return stats;
  }
}

// Usage - works everywhere!
const fileManager = new UniversalFileManager();
await fileManager.init();

// Save a file
await fileManager.saveFile('Hello World!', 'greeting.txt', 'messages');

// List files
const files = await fileManager.listFiles();
console.log('All files:', files);

// Get statistics
const stats = await fileManager.getStats();
console.log('Storage stats:', stats);
```

## Additional Resources

- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/storage/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajsx/appkit/blob/main/src/storage/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## Best Practices

### 🔐 Security

- Validate file types before upload
- Use signed URLs for sensitive content (S3)
- Implement proper access controls
- Never trust user-provided file paths

### 🏗️ Architecture

- Initialize storage once at app startup
- Use environment variables for configuration
- Handle errors gracefully with fallbacks
- Keep file paths organized and predictable

### 🚀 Performance

- Use progress callbacks for large uploads
- Implement caching for frequently accessed files
- Clean up temporary files regularly
- Consider file size limits

### 👥 User Experience

- Show upload progress for large files
- Provide clear error messages
- Implement retry logic for failed operations
- Cache file lists for better responsiveness

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
