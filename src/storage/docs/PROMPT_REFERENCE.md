# @voilajs/appkit/storage - LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Always include JSDoc comments for functions

2. **JSDoc Format** (Required for all functions):

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error Handling**:

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Throw descriptive error messages

4. **Framework Agnostic**:
   - Code should work in any Node.js environment
   - Avoid dependencies on specific frameworks

## Function Signatures

### Core Functions

#### initStorage(provider, config)

```typescript
function initStorage(
  provider: 'local' | 's3',
  config?: Record<string, any>
): Promise<StorageProvider>;
```

- Throws: `'Storage already initialized'`, `'Unknown storage provider'`

#### getStorage()

```typescript
function getStorage(): StorageProvider;
```

- Throws: `'Storage not initialized'`

### StorageProvider Interface

#### StorageProvider.initialize()

```typescript
function initialize(): Promise<void>;
```

#### StorageProvider.upload(file, path, options, onProgress)

```typescript
function upload(
  file: Buffer | Stream,
  path: string,
  options?: {
    contentType?: string;
    metadata?: Record<string, string>;
    cacheControl?: string;
    public?: boolean;
    [key: string]: any;
  },
  onProgress?: (percent: number) => void
): Promise<{
  url: string;
  size: number;
  etag?: string;
  path?: string;
  contentType?: string;
}>;
```

#### StorageProvider.uploadLarge(file, path, options, onProgress)

```typescript
function uploadLarge(
  file: Buffer | Stream | string,
  path: string,
  options?: {
    contentType?: string;
    metadata?: Record<string, string>;
    cacheControl?: string;
    public?: boolean;
    chunkSize?: number;
    fileSize?: number;
    [key: string]: any;
  },
  onProgress?: (percent: number) => void
): Promise<{
  url: string;
  size: number;
  etag?: string;
  path?: string;
  contentType?: string;
}>;
```

#### StorageProvider.download(path)

```typescript
function download(path: string): Promise<Buffer>;
```

- Throws: `'File not found'`

#### StorageProvider.downloadStream(path)

```typescript
function downloadStream(path: string): Promise<Stream>;
```

- Throws: `'File not found'`

#### StorageProvider.delete(path)

```typescript
function delete(path: string): Promise<boolean>;
```

#### StorageProvider.getUrl(path, options)

```typescript
function getUrl(
  path: string,
  options?: {
    signed?: boolean;
    expiresIn?: number;
    [key: string]: any;
  }
): string | Promise<string>;
```

#### StorageProvider.exists(path)

```typescript
function exists(path: string): Promise<boolean>;
```

#### StorageProvider.list(prefix, options)

```typescript
function list(
  prefix?: string,
  options?: {
    recursive?: boolean;
    limit?: number;
    delimiter?: string;
    [key: string]: any;
  }
): Promise<
  Array<{
    path: string;
    size: number;
    modified: Date;
  }>
>;
```

#### StorageProvider.getMetadata(path)

```typescript
function getMetadata(path: string): Promise<{
  size: number;
  modified: Date;
  contentType?: string;
  etag?: string;
}>;
```

- Throws: `'File not found'`

#### StorageProvider.copy(source, destination)

```typescript
function copy(source: string, destination: string): Promise<boolean>;
```

- Throws: `'Source file not found'`

#### StorageProvider.move(source, destination)

```typescript
function move(source: string, destination: string): Promise<boolean>;
```

- Throws: `'Source file not found'`

#### StorageProvider.createDirectory(path)

```typescript
function createDirectory(path: string): Promise<boolean>;
```

### Provider-Specific Implementations

#### LocalProvider

```typescript
class LocalProvider extends StorageProvider {
  constructor(config?: { basePath?: string; baseUrl?: string });
}
```

- Default `basePath`: `'./storage'`
- Default `baseUrl`: `'/storage'`

#### S3Provider

```typescript
class S3Provider extends StorageProvider {
  constructor(config?: {
    bucket: string;
    region?: string;
    credentials?: {
      accessKeyId: string;
      secretAccessKey: string;
    };
    endpoint?: string;
    forcePathStyle?: boolean;
    publicRead?: boolean;
    baseUrl?: string;
  });
}
```

- Default `region`: `'us-east-1'`
- Default `forcePathStyle`: `false`
- Default `publicRead`: `false`
- Default `baseUrl`: `'https://{bucket}.s3.{region}.amazonaws.com'`

## Example Implementations

### Basic File Storage

```javascript
/**
 * Sets up file storage and provides utility functions
 * @param {Object} config - Storage configuration
 * @returns {Object} Storage utilities
 */
async function setupStorage(config) {
  const { initStorage } = require('@voilajs/appkit/storage');

  // Initialize storage with appropriate provider
  const storage = await initStorage(config.provider, {
    // Local provider config
    basePath: config.basePath || './uploads',
    baseUrl: config.baseUrl || '/files',

    // S3 provider config
    bucket: config.bucket,
    region: config.region,
    credentials: config.credentials,
    endpoint: config.endpoint,
    publicRead: config.public || false,
  });

  return {
    /**
     * Uploads a file with proper error handling
     * @param {Buffer|Stream} fileContent - File to upload
     * @param {string} fileName - Name for the file
     * @param {Object} options - Upload options
     * @returns {Promise<string>} File URL
     */
    async uploadFile(fileContent, fileName, options = {}) {
      try {
        // Generate a unique file path
        const timestamp = Date.now();
        const path = `${options.folder || 'uploads'}/${timestamp}-${fileName}`;

        // Upload with progress callback
        const result = await storage.upload(
          fileContent,
          path,
          {
            contentType: options.contentType,
            metadata: options.metadata,
            public: options.public || false,
          },
          options.onProgress
        );

        return result.url;
      } catch (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
      }
    },

    /**
     * Downloads a file by path
     * @param {string} filePath - Path to file
     * @returns {Promise<Buffer>} File content
     */
    async downloadFile(filePath) {
      try {
        return await storage.download(filePath);
      } catch (error) {
        if (error.message.includes('not found')) {
          throw new Error(`File not found: ${filePath}`);
        }
        throw new Error(`Failed to download file: ${error.message}`);
      }
    },

    /**
     * Lists files in a directory
     * @param {string} folder - Folder path
     * @param {boolean} recursive - Include subfolders
     * @returns {Promise<Array>} List of files
     */
    async listFiles(folder = '', recursive = false) {
      try {
        const files = await storage.list(folder, { recursive });
        return files.map((file) => ({
          name: file.path.split('/').pop(),
          path: file.path,
          size: file.size,
          modified: file.modified,
          url: storage.getUrl(file.path),
        }));
      } catch (error) {
        throw new Error(`Failed to list files: ${error.message}`);
      }
    },
  };
}
```

### Large File Upload with Progress

```javascript
/**
 * Uploads a large file with progress tracking
 * @param {string|Buffer|Stream} file - File content or path
 * @param {string} destination - Destination path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
async function uploadLargeFile(file, destination, options = {}) {
  const { getStorage } = require('@voilajs/appkit/storage');

  try {
    const storage = getStorage();

    // Setup progress tracking
    let lastReportedProgress = 0;
    const progressTracker = (percent) => {
      // Only report when progress changes by at least 5%
      if (percent >= lastReportedProgress + 5 || percent === 100) {
        lastReportedProgress = percent;
        console.log(`Upload progress: ${percent}%`);

        if (options.onProgress) {
          options.onProgress(percent);
        }
      }
    };

    console.log('Starting large file upload...');

    // Use uploadLarge for automatic chunking and progress reporting
    const result = await storage.uploadLarge(
      file,
      destination,
      {
        contentType: options.contentType,
        metadata: options.metadata,
        public: options.public,
        chunkSize: options.chunkSize || 10 * 1024 * 1024, // 10MB chunks
        fileSize: options.fileSize,
      },
      progressTracker
    );

    console.log(`Upload complete: ${result.url}`);
    return result;
  } catch (error) {
    console.error('Upload failed:', error.message);
    throw error;
  }
}
```

### Streaming Media File

```javascript
/**
 * Creates a video streaming endpoint
 * @param {Object} app - Express app instance
 * @param {Object} storage - Storage provider
 */
function setupVideoStreaming(app, storage) {
  /**
   * Video streaming route
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  app.get('/videos/:filename', async (req, res) => {
    const filename = req.params.filename;
    const videoPath = `videos/${filename}`;

    try {
      // Check if file exists
      const exists = await storage.exists(videoPath);
      if (!exists) {
        return res.status(404).send('Video not found');
      }

      // Get file metadata
      const metadata = await storage.getMetadata(videoPath);
      const fileSize = metadata.size;

      // Parse range header
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        // Set response headers
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': metadata.contentType || 'video/mp4',
        });

        // Get stream from storage
        const stream = await storage.downloadStream(videoPath);

        // Pipe the appropriate chunk to response
        stream.pipe(res);
      } else {
        // No range requested, send entire file
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': metadata.contentType || 'video/mp4',
        });

        const stream = await storage.downloadStream(videoPath);
        stream.pipe(res);
      }
    } catch (error) {
      console.error(`Error streaming video: ${error.message}`);
      res.status(500).send('Error streaming video');
    }
  });
}
```

### File Management System

```javascript
/**
 * Creates a file management system
 * @param {Object} config - Configuration options
 * @returns {Object} File management API
 */
async function createFileManager(config) {
  const { initStorage } = require('@voilajs/appkit/storage');

  // Initialize with appropriate provider
  const storage = await initStorage(
    config.provider || 'local',
    config.providerConfig || {}
  );

  return {
    /**
     * Creates a folder structure
     * @param {string} path - Folder path
     * @returns {Promise<boolean>} Success status
     */
    async createFolder(path) {
      try {
        // Normalize path
        const normalizedPath = path.endsWith('/') ? path : `${path}/`;

        // Create directory
        await storage.createDirectory(normalizedPath);
        return true;
      } catch (error) {
        throw new Error(`Failed to create folder: ${error.message}`);
      }
    },

    /**
     * Saves a file to storage
     * @param {Buffer|Stream|string} content - File content or path
     * @param {string} destination - Destination path
     * @param {Object} options - Save options
     * @returns {Promise<Object>} File information
     */
    async saveFile(content, destination, options = {}) {
      try {
        // Determine if we should use large file upload
        const isLargeFile =
          (Buffer.isBuffer(content) && content.length > 5 * 1024 * 1024) || // 5MB for buffers
          options.isLarge ||
          typeof content === 'string'; // Always use large file upload for file paths

        // Use the appropriate upload method
        const uploadMethod = isLargeFile ? 'uploadLarge' : 'upload';

        // Ensure parent directory exists
        const parentDir = destination.split('/').slice(0, -1).join('/');
        if (parentDir) {
          await this.createFolder(parentDir);
        }

        // Upload the file
        const result = await storage[uploadMethod](
          content,
          destination,
          {
            contentType: options.contentType,
            metadata: options.metadata,
            public: options.public,
          },
          options.onProgress
        );

        return {
          path: destination,
          url: result.url,
          size: result.size,
          contentType: result.contentType || options.contentType,
        };
      } catch (error) {
        throw new Error(`Failed to save file: ${error.message}`);
      }
    },

    /**
     * Gets a file for streaming
     * @param {string} path - File path
     * @returns {Promise<Object>} Stream and metadata
     */
    async getFileStream(path) {
      try {
        // Get file metadata
        const metadata = await storage.getMetadata(path);

        // Get file stream
        const stream = await storage.downloadStream(path);

        return {
          stream,
          metadata,
          contentType: metadata.contentType,
          size: metadata.size,
        };
      } catch (error) {
        throw new Error(`Failed to get file stream: ${error.message}`);
      }
    },
  };
}
```

## Code Generation Rules

1. **Always handle file paths carefully** - Normalize paths for consistency
2. **Use streams for large files** - Avoid loading large files into memory
3. **Always check file existence** before operations
4. **Provide progress reporting** for long-running operations
5. **Create intermediate directories** when needed
6. **Set proper content types** for uploads
7. **Always clean up resources** in error handling
8. **Use try/catch blocks** for all async storage operations
9. **Validate inputs** before sending to storage
10. **Respect provider differences** while maintaining consistent API
11. **Use provider-specific optimizations** when available

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
