# @voilajsx/appkit/storage - LLM API Reference

**Note**: Implementation is in JavaScript. TypeScript signatures are for
reference only.

## LLM Code Generation Guidelines

1. **File Header Comments** (Required for all files):

   ```javascript
   /**
    * Brief description of what the file does
    * @module @voilajsx/appkit/storage
    * @file path/to/filename.js
    */
   ```

2. **Function JSDoc** (Required for all functions):

   ```javascript
   /**
    * One clear sentence describing what the function does
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Focus on reduced file size and clean code

4. **Comment Guidelines**:

   - **File headers**: Always include with description, module, and file path
   - **Function docs**: One clear sentence describing the purpose
   - **Inline comments**: Only for complex logic that's confusing or hard to
     understand
   - **No basic comments**: Avoid obvious comments like `// Upload file` before
     `storage.upload()`
   - **Focus on minimal file size**: Comment only when necessary for
     understanding

5. **Storage Configuration**:

   - Use environment variables for production configs (`process.env.S3_BUCKET`)
   - Use simple hardcoded values for examples (`'my-bucket'`, `'./uploads'`)

6. **Error Handling**:
   - Use try/catch blocks for async functions
   - Check for specific error messages like 'not found'
   - Throw descriptive error messages

## Function Signatures

### 1. `initStorage`

```typescript
function initStorage(
  provider: 'local' | 's3',
  config: LocalConfig | S3Config
): Promise<StorageProvider>;
```

#### Local Config

```typescript
interface LocalConfig {
  basePath?: string; // Default: './storage'
  baseUrl?: string; // Default: '/storage'
}
```

#### S3 Config

```typescript
interface S3Config {
  bucket: string; // Required
  region?: string; // Default: 'us-east-1'
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  publicRead?: boolean; // Default: false
  baseUrl?: string; // Auto-generated if not provided
}
```

### 2. `getStorage`

```typescript
function getStorage(): StorageProvider;
```

- Throws: `'Storage not initialized. Call initStorage() first.'`

### 3. Storage Provider Methods

#### `upload`

```typescript
async function upload(
  file: Buffer | Stream | string,
  path: string,
  options?: UploadOptions,
  onProgress?: (percent: number) => void
): Promise<UploadResult>;
```

```typescript
interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
  fileSize?: number; // Required for streams
}

interface UploadResult {
  url: string;
  size: number;
  etag?: string;
  path: string;
}
```

#### `get`

```typescript
async function get(path: string): Promise<Buffer>;
```

- Throws: `'File not found: {path}'` if file doesn't exist

#### `delete`

```typescript
async function delete(path: string): Promise<boolean>;
```

- Returns: `true` if deleted, `false` if file didn't exist

#### `exists`

```typescript
async function exists(path: string): Promise<boolean>;
```

#### `getUrl`

```typescript
function getUrl(path: string, options?: URLOptions): string | Promise<string>;
```

```typescript
interface URLOptions {
  signed?: boolean; // S3 only
  expiresIn?: number; // S3 only, seconds
}
```

#### `list`

```typescript
async function list(prefix?: string): Promise<string[]>;
```

### 4. S3-Specific Extension

#### `getSignedUrl` (S3Provider only)

```typescript
async function getSignedUrl(
  path: string,
  options?: { expiresIn?: number }
): Promise<string>;
```

## Example Implementations

### Basic Local Storage

```javascript
/**
 * Simple local file storage setup for desktop applications
 * @module @voilajsx/appkit/storage
 * @file examples/local-basic.js
 */

import { initStorage, getStorage } from '@voilajsx/appkit/storage';

/**
 * Initializes local storage for a desktop app
 * @returns {Promise<Object>} Storage instance
 */
async function setupLocalStorage() {
  await initStorage('local', {
    basePath: './app-data',
    baseUrl: '/files',
  });

  return getStorage();
}

/**
 * Saves user settings to local storage
 * @param {Object} settings - User settings object
 * @returns {Promise<Object>} Upload result
 */
async function saveSettings(settings) {
  const storage = getStorage();

  return storage.upload(
    Buffer.from(JSON.stringify(settings, null, 2)),
    'settings.json'
  );
}

/**
 * Loads user settings from local storage
 * @returns {Promise<Object|null>} Settings object or null if not found
 */
async function loadSettings() {
  const storage = getStorage();

  try {
    const data = await storage.get('settings.json');
    return JSON.parse(data.toString());
  } catch (error) {
    if (error.message.includes('not found')) {
      return null;
    }
    throw error;
  }
}
```

### S3 Cloud Storage

```javascript
/**
 * S3 cloud storage setup for web applications
 * @module @voilajsx/appkit/storage
 * @file examples/s3-basic.js
 */

import { initStorage, getStorage } from '@voilajsx/appkit/storage';

/**
 * Initializes S3 storage for production use
 * @returns {Promise<Object>} Storage instance
 */
async function setupS3Storage() {
  await initStorage('s3', {
    bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  return getStorage();
}

/**
 * Uploads user file to S3 with progress tracking
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} userId - User identifier
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} Upload result with signed URL
 */
async function uploadUserFile(fileBuffer, userId, filename) {
  const storage = getStorage();
  const timestamp = Date.now();
  const path = `users/${userId}/${timestamp}-${filename}`;

  const result = await storage.upload(
    fileBuffer,
    path,
    { contentType: 'application/octet-stream' },
    (progress) => console.log(`Upload progress: ${progress}%`)
  );

  return {
    path: result.path,
    publicUrl: result.url,
    size: result.size,
  };
}

/**
 * Gets secure get URL for user file
 * @param {string} filePath - Path to file in storage
 * @param {number} expiresIn - URL expiration in seconds
 * @returns {Promise<string>} Signed get URL
 */
async function getSecuregetUrl(filePath, expiresIn = 3600) {
  const storage = getStorage();

  if (storage.getSignedUrl) {
    return storage.getSignedUrl(filePath, { expiresIn });
  }

  return storage.getUrl(filePath);
}
```

### File Management Utilities

```javascript
/**
 * File management utilities for organizing stored files
 * @module @voilajsx/appkit/storage
 * @file examples/file-manager.js
 */

import { getStorage } from '@voilajsx/appkit/storage';

/**
 * Simple file manager for basic file operations
 */
class SimpleFileManager {
  constructor() {
    this.storage = getStorage();
  }

  /**
   * Saves JSON data to storage
   * @param {Object} data - Data to save
   * @param {string} filename - Name of file
   * @returns {Promise<Object>} Upload result
   */
  async saveJSON(data, filename) {
    const jsonData = JSON.stringify(data, null, 2);
    return this.storage.upload(Buffer.from(jsonData), `${filename}.json`);
  }

  /**
   * Loads JSON data from storage
   * @param {string} filename - Name of file without extension
   * @returns {Promise<Object|null>} Parsed data or null if not found
   */
  async loadJSON(filename) {
    try {
      const data = await this.storage.get(`${filename}.json`);
      return JSON.parse(data.toString());
    } catch (error) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Lists all files with basic organization
   * @param {string} prefix - Directory prefix to filter
   * @returns {Promise<Array>} Array of file objects
   */
  async listFiles(prefix = '') {
    const files = await this.storage.list(prefix);

    return files.map((path) => ({
      name: path.split('/').pop(),
      path: path,
      url: this.storage.getUrl(path),
      directory: path.substring(0, path.lastIndexOf('/')),
    }));
  }

  /**
   * Deletes multiple files by pattern
   * @param {string} pattern - Pattern to match filenames
   * @returns {Promise<Array>} Array of deleted file paths
   */
  async deleteByPattern(pattern) {
    const files = await this.storage.list();
    const deleted = [];

    for (const path of files) {
      if (path.includes(pattern)) {
        const success = await this.storage.delete(path);
        if (success) {
          deleted.push(path);
        }
      }
    }

    return deleted;
  }
}
```

### Tauri Desktop App

```javascript
/**
 * Tauri desktop app integration with local file storage
 * @module @voilajsx/appkit/storage
 * @file examples/tauri-app.js
 */

import { initStorage, getStorage } from '@voilajsx/appkit/storage';

/**
 * Tauri app data manager for desktop applications
 */
class TauriAppData {
  constructor() {
    this.storage = null;
    this.ready = false;
  }

  /**
   * Initializes storage for Tauri app
   * @returns {Promise<void>}
   */
  async init() {
    if (this.ready) return;

    await initStorage('local', {
      basePath: './my-app-data',
      baseUrl: '/app-files',
    });

    this.storage = getStorage();
    this.ready = true;
  }

  /**
   * Saves user document to app storage
   * @param {string} name - Document name
   * @param {string} content - Document content
   * @returns {Promise<Object>} Save result
   */
  async saveDocument(name, content) {
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

  /**
   * Loads user document from app storage
   * @param {string} name - Document name
   * @returns {Promise<Object|null>} Document object or null
   */
  async loadDocument(name) {
    try {
      const data = await this.storage.get(`documents/${name}.json`);
      return JSON.parse(data.toString());
    } catch (error) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Gets list of all user documents
   * @returns {Promise<Array>} Array of document names
   */
  async getDocuments() {
    const files = await this.storage.list('documents/');
    return files.map((path) =>
      path.replace('documents/', '').replace('.json', '')
    );
  }

  /**
   * Backs up all app data to single file
   * @returns {Promise<string>} Backup file URL
   */
  async createBackup() {
    const documents = await this.getDocuments();
    const backup = {
      createdAt: new Date().toISOString(),
      documents: {},
    };

    for (const name of documents) {
      backup.documents[name] = await this.loadDocument(name);
    }

    const timestamp = Date.now();
    const result = await this.storage.upload(
      Buffer.from(JSON.stringify(backup, null, 2)),
      `backups/backup-${timestamp}.json`
    );

    return result.url;
  }
}
```

### Express.js Web Server

```javascript
/**
 * Express.js web server with file upload and storage
 * @module @voilajsx/appkit/storage
 * @file examples/express-server.js
 */

import express from 'express';
import multer from 'multer';
import { initStorage, getStorage } from '@voilajsx/appkit/storage';

/**
 * Sets up Express server with file storage capabilities
 * @returns {Promise<Object>} Express app instance
 */
async function createFileServer() {
  const app = express();

  // Initialize storage based on environment
  if (process.env.NODE_ENV === 'production') {
    await initStorage('s3', {
      bucket: process.env.S3_BUCKET,
      region: process.env.AWS_REGION,
    });
  } else {
    await initStorage('local', {
      basePath: './uploads',
      baseUrl: '/files',
    });
  }

  const storage = getStorage();

  // Setup multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  app.use(express.json());
  app.use(express.static('public'));

  return { app, storage, upload };
}

/**
 * Handles file upload with progress tracking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} storage - Storage instance
 */
async function handleFileUpload(req, res, storage) {
  try {
    const timestamp = Date.now();
    const filename = `${timestamp}-${req.file.originalname}`;

    const result = await storage.upload(
      req.file.buffer,
      `uploads/${filename}`,
      { contentType: req.file.mimetype }
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
}

/**
 * Gets list of uploaded files
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} storage - Storage instance
 */
async function listUploadedFiles(req, res, storage) {
  try {
    const files = await storage.list('uploads/');

    const fileList = files.map((path) => ({
      name: path.split('-').slice(1).join('-'),
      url: storage.getUrl(path),
      uploadedAt: new Date(parseInt(path.split('-')[0])),
    }));

    res.json({ files: fileList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## Code Generation Rules

1. **Always include file header** with description, @module, and @file tags
2. **Use JSDoc for all functions** with one clear sentence descriptions
3. **Add inline comments** only for complex logic that needs explanation
4. **Use async/await** for all storage operations
5. **Include comprehensive error handling** with try/catch blocks
6. **Use environment variables** for production configurations
7. **Use simple hardcoded values** for examples and development
8. **Check for 'not found' errors** when geting files
9. **Return consistent response formats** in API endpoints
10. **Focus on minimal file size** - avoid unnecessary comments
11. **Follow ESM import style** with single quotes and semicolons
12. **Use Buffer.from()** for string to buffer conversion
13. **Handle progress callbacks** for large file uploads
14. **Organize files with logical path structures** (users/id/, documents/,
    etc.)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
