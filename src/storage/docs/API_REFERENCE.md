# Storage Module API Reference

## Overview

The `@voilajsx/appkit/storage` module provides a unified interface for file
storage operations across different providers including local filesystem and AWS
S3. It offers essential file operations with automatic optimizations and
consistent error handling.

## Installation

```bash
npm install @voilajsx/appkit
```

## Quick Start

```javascript
import { initStorage, getStorage } from '@voilajsx/appkit/storage';

// Initialize storage
await initStorage('local', { basePath: './uploads' });
const storage = getStorage();

// Use storage
const result = await storage.upload(fileBuffer, 'documents/file.pdf');
```

## API Reference

### Storage Manager Functions

#### initStorage(provider, config)

Initializes a storage provider instance.

##### Parameters

| Name       | Type     | Required | Default | Description                             |
| ---------- | -------- | -------- | ------- | --------------------------------------- |
| `provider` | `string` | Yes      | -       | Provider type ('local' or 's3')         |
| `config`   | `Object` | No       | `{}`    | Provider-specific configuration options |

##### Returns

- `Promise<StorageProvider>` - The initialized storage provider instance

##### Throws

- `Error` - If provider is already initialized
- `Error` - If provider type is unknown
- `Error` - If provider initialization fails

##### Example

```javascript
// Local storage
await initStorage('local', {
  basePath: './app-data',
  baseUrl: '/files',
});

// S3 storage
await initStorage('s3', {
  bucket: 'my-app-storage',
  region: 'us-west-2',
});
```

---

#### getStorage()

Gets the current storage instance.

##### Returns

- `StorageProvider` - The current storage provider instance

##### Throws

- `Error` - If storage is not initialized

##### Example

```javascript
const storage = getStorage();
await storage.upload(data, 'file.txt');
```

---

### StorageProvider Methods

#### initialize()

Initializes the storage provider (called automatically by `initStorage`).

##### Returns

- `Promise<void>`

##### Throws

- `Error` - If initialization fails (e.g., missing bucket for S3)

---

#### upload(file, path, options, onProgress)

Uploads a file with automatic optimization for large files.

##### Parameters

| Name         | Type                     | Required | Default | Description                                 |
| ------------ | ------------------------ | -------- | ------- | ------------------------------------------- |
| `file`       | `Buffer\|Stream\|string` | Yes      | -       | File content, stream, or path to local file |
| `path`       | `string`                 | Yes      | -       | Storage path for the file                   |
| `options`    | `Object`                 | No       | `{}`    | Upload options                              |
| `onProgress` | `Function`               | No       | `null`  | Progress callback (percent: number) => void |

##### Options Object

| Name          | Type      | Required | Default                      | Description                      |
| ------------- | --------- | -------- | ---------------------------- | -------------------------------- |
| `contentType` | `string`  | No       | `'application/octet-stream'` | MIME type of the file            |
| `metadata`    | `Object`  | No       | -                            | Custom metadata (S3 only)        |
| `public`      | `boolean` | No       | `false`                      | Make file publicly readable      |
| `fileSize`    | `number`  | No       | -                            | File size (required for streams) |

##### Returns

- `Promise<{url: string, size: number, etag: string|null}>` - Upload result

##### Throws

- `Error` - If file parameter is invalid
- `Error` - If upload fails
- `Error` - If file size is required but not provided for streams

##### Example

```javascript
// Upload Buffer
const result = await storage.upload(fileBuffer, 'documents/report.pdf', {
  contentType: 'application/pdf',
});

// Upload with progress tracking
await storage.upload(
  largeFileBuffer,
  'videos/movie.mp4',
  { contentType: 'video/mp4' },
  (percent) => console.log(`Upload: ${percent}%`)
);

// Upload from file path
const result = await storage.upload('/tmp/image.jpg', 'images/photo.jpg');
```

---

#### get(path)

Gets a file's content and returns it as a Buffer.

##### Parameters

| Name   | Type     | Required | Description          |
| ------ | -------- | -------- | -------------------- |
| `path` | `string` | Yes      | Storage path of file |

##### Returns

- `Promise<Buffer>` - File content

##### Throws

- `Error` - With message "File not found: {path}" if file doesn't exist
- `Error` - If get fails

##### Example

```javascript
try {
  const fileData = await storage.get('documents/report.pdf');
  console.log('File size:', fileData.length);
} catch (error) {
  if (error.message.includes('not found')) {
    console.log('File does not exist');
  }
}
```

---

#### delete(path)

Deletes a file from storage.

##### Parameters

| Name   | Type     | Required | Description          |
| ------ | -------- | -------- | -------------------- |
| `path` | `string` | Yes      | Storage path of file |

##### Returns

- `Promise<boolean>` - `true` if deleted, `false` if file didn't exist

##### Throws

- `Error` - If deletion fails (not including file not found)

##### Example

```javascript
const deleted = await storage.delete('temp/cache.dat');
if (deleted) {
  console.log('File deleted successfully');
} else {
  console.log('File did not exist');
}
```

---

#### exists(path)

Checks if a file exists in storage.

##### Parameters

| Name   | Type     | Required | Description          |
| ------ | -------- | -------- | -------------------- |
| `path` | `string` | Yes      | Storage path of file |

##### Returns

- `Promise<boolean>` - `true` if file exists, `false` otherwise

##### Throws

- `Error` - If check fails due to storage errors

##### Example

```javascript
if (await storage.exists('config/settings.json')) {
  const settings = await storage.get('config/settings.json');
  // Process settings
}
```

---

#### getUrl(path, options)

Gets a URL for accessing the file.

##### Parameters

| Name      | Type     | Required | Default | Description            |
| --------- | -------- | -------- | ------- | ---------------------- |
| `path`    | `string` | Yes      | -       | Storage path of file   |
| `options` | `Object` | No       | `{}`    | URL generation options |

##### Options Object (S3 Provider)

| Name        | Type      | Required | Default | Description                              |
| ----------- | --------- | -------- | ------- | ---------------------------------------- |
| `signed`    | `boolean` | No       | `false` | Generate signed URL for temporary access |
| `expiresIn` | `number`  | No       | `3600`  | Expiration time in seconds               |

##### Returns

- `string` - Public URL (for local storage or public S3 files)
- `Promise<string>` - Signed URL (when `options.signed` is true for S3)

##### Example

```javascript
// Get public URL
const url = storage.getUrl('images/photo.jpg');
console.log('Photo URL:', url);

// Get signed URL (S3 only)
if (storage instanceof S3Provider) {
  const signedUrl = await storage.getUrl('private/document.pdf', {
    signed: true,
    expiresIn: 1800, // 30 minutes
  });
}
```

---

#### list(prefix)

Lists files in storage with optional prefix filtering.

##### Parameters

| Name     | Type     | Required | Default | Description                 |
| -------- | -------- | -------- | ------- | --------------------------- |
| `prefix` | `string` | No       | `''`    | Path prefix to filter files |

##### Returns

- `Promise<Array<string>>` - Array of file paths

##### Throws

- `Error` - If listing fails

##### Example

```javascript
// List all files
const allFiles = await storage.list();
console.log('All files:', allFiles);

// List files in specific directory
const userFiles = await storage.list('users/123/');
console.log('User files:', userFiles);
// Output: ['users/123/profile.jpg', 'users/123/document.pdf']
```

---

### S3Provider Extended Methods

#### getSignedUrl(path, options)

Generates a signed URL for temporary access (S3-specific method).

##### Parameters

| Name      | Type     | Required | Default | Description          |
| --------- | -------- | -------- | ------- | -------------------- |
| `path`    | `string` | Yes      | -       | Storage path of file |
| `options` | `Object` | No       | `{}`    | Signed URL options   |

##### Options Object

| Name        | Type     | Required | Default | Description                |
| ----------- | -------- | -------- | ------- | -------------------------- |
| `expiresIn` | `number` | No       | `3600`  | Expiration time in seconds |

##### Returns

- `Promise<string>` - Signed URL

##### Example

```javascript
// Only available for S3Provider
const signedUrl = await s3Storage.getSignedUrl('private/sensitive.pdf', {
  expiresIn: 900, // 15 minutes
});
```

---

## Provider Configuration

### LocalProvider Configuration

| Option     | Type     | Required | Default       | Description                      |
| ---------- | -------- | -------- | ------------- | -------------------------------- |
| `basePath` | `string` | No       | `'./storage'` | Directory path for storing files |
| `baseUrl`  | `string` | No       | `'/storage'`  | URL prefix for serving files     |

### S3Provider Configuration

| Option           | Type      | Required | Default        | Description                            |
| ---------------- | --------- | -------- | -------------- | -------------------------------------- |
| `bucket`         | `string`  | Yes      | -              | S3 bucket name                         |
| `region`         | `string`  | No       | `'us-east-1'`  | AWS region                             |
| `credentials`    | `Object`  | No       | Auto-detect    | AWS credentials                        |
| `endpoint`       | `string`  | No       | -              | Custom S3 endpoint (for S3-compatible) |
| `forcePathStyle` | `boolean` | No       | `false`        | Use path-style URLs                    |
| `publicRead`     | `boolean` | No       | `false`        | Make all uploads publicly readable     |
| `baseUrl`        | `string`  | No       | Auto-generated | Custom base URL for file access        |

---

## Error Handling

All methods throw descriptive errors. Common error patterns:

### File Not Found Errors

```javascript
try {
  await storage.get('missing-file.txt');
} catch (error) {
  if (error.message.includes('File not found')) {
    // Handle missing file
  }
}
```

### Upload Errors

```javascript
try {
  await storage.upload(invalidData, 'file.txt');
} catch (error) {
  if (error.message.includes('File must be')) {
    // Handle invalid file type
  }
}
```

### Common Error Messages

| Operation     | Error Message                               | Cause                               |
| ------------- | ------------------------------------------- | ----------------------------------- |
| `initStorage` | "Storage already initialized"               | Called `initStorage` multiple times |
| `initStorage` | "Unknown storage provider: {type}"          | Invalid provider type               |
| `getStorage`  | "Storage not initialized"                   | Called before `initStorage`         |
| `upload`      | "File must be Buffer, Stream, or file path" | Invalid file parameter              |
| `get`         | "File not found: {path}"                    | File doesn't exist                  |
| S3 operations | "S3 bucket name is required"                | Missing bucket in S3 config         |

---

## Automatic Optimizations

### Large File Handling

- Files over 100MB automatically use multipart uploads (S3)
- Progress tracking available for all upload operations
- Automatic retry logic for failed uploads

### Smart Defaults

- Content-Type detection based on file extension
- Automatic directory creation during uploads
- Efficient streaming for large files

---

## Security Considerations

1. **Path Validation**: Always validate file paths to prevent directory
   traversal
2. **File Type Restrictions**: Implement file type validation before uploads
3. **Access Control**: Use authentication before allowing file operations
4. **Signed URLs**: Use temporary signed URLs for sensitive content (S3)
5. **Environment Variables**: Store AWS credentials in environment variables

## TypeScript Support

While implemented in JavaScript, the module includes comprehensive JSDoc
comments for TypeScript inference:

```typescript
// Example type definitions
interface UploadResult {
  url: string;
  size: number;
  etag?: string;
  path: string;
}

interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
  fileSize?: number;
}
```

## Performance Tips

1. **Batch Operations**: Group multiple file operations when possible
2. **Progress Callbacks**: Use for user feedback on large uploads
3. **File Size Optimization**: Compress files before upload when appropriate
4. **Caching**: Cache file existence checks for better performance

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
