# @voilajsx/appkit - Storage Module 📁

[![npm version](https://img.shields.io/npm/v/@voilajsx.svg)](https://www.npmjs.com/package/@voilajsx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Simple, unified file storage for local filesystem and cloud providers

The Storage module of `@voilajsx` provides a clean, minimalist API for file
operations across different storage providers. Whether you're building a Tauri
desktop app, web application, or Node.js backend, this module offers consistent
file upload, get, and management with automatic optimizations.

## Module Overview

The Storage module provides everything you need for modern file operations:

| Feature                | What it does                        | Main functions                  |
| ---------------------- | ----------------------------------- | ------------------------------- |
| **File Operations**    | Upload, get, and delete files       | `upload()`, `get()`, `delete()` |
| **Storage Management** | Check existence and list files      | `exists()`, `list()`            |
| **URL Generation**     | Get file URLs for web serving       | `getUrl()`                      |
| **Provider Support**   | Local filesystem and AWS S3 support | `LocalProvider`, `S3Provider`   |

## 🚀 Features

- **🔄 Unified API** - Same interface works with local files and cloud storage
- **📦 Auto-optimization** - Automatically handles large files with multipart
  uploads
- **🎯 Framework Agnostic** - Works with Tauri, Electron, Express, and more
- **⚡ Simple Setup** - Get started with just a few lines of code
- **🛡️ Smart Defaults** - Sensible configurations that work out of the box
- **📁 Auto-directories** - Creates directories automatically during uploads

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start

Import only the functions you need and start storing files immediately. The
module automatically handles provider initialization and optimizes uploads based
on file size.

```javascript
import { initStorage, getStorage } from '@voilajsx/appkit/storage';

// Initialize local storage
await initStorage('local', {
  basePath: './uploads',
  baseUrl: '/files',
});

const storage = getStorage();

// Upload a file
const result = await storage.upload(fileBuffer, 'documents/report.pdf');
console.log('File URL:', result.url);

// Get a file
const fileData = await storage.get('documents/report.pdf');
```

## 📖 Core Functions

### File Operations

These utilities handle the fundamental file operations you need in any
application. All operations are async and provide consistent error handling
across different storage providers.

| Function   | Purpose                                  | When to use                                        |
| ---------- | ---------------------------------------- | -------------------------------------------------- |
| `upload()` | Stores files with automatic optimization | File uploads, data persistence, media storage      |
| `get()`    | Retrieves file content as Buffer         | File serving, data retrieval, backup operations    |
| `delete()` | Removes files from storage               | Cleanup, user deletions, temporary file management |

```javascript
// Upload with automatic large file handling
const result = await storage.upload(fileData, 'images/avatar.jpg', {
  contentType: 'image/jpeg',
});

// Get file content
const imageBuffer = await storage.get('images/avatar.jpg');

// Delete when no longer needed
await storage.delete('temp/processed-data.json');
```

### Storage Management

Essential utilities for managing your file storage, checking file existence, and
listing stored files. Perfect for building file browsers, backup systems, or
content management features.

| Function   | Purpose                        | When to use                                    |
| ---------- | ------------------------------ | ---------------------------------------------- |
| `exists()` | Checks if a file exists        | Validation, avoiding overwrites, file checking |
| `list()`   | Gets array of file paths       | File browsers, backup lists, content discovery |
| `getUrl()` | Generates accessible file URLs | Web serving, Get links, media display          |

```javascript
// Check if file exists before processing
if (await storage.exists('config/settings.json')) {
  const settings = await storage.get('config/settings.json');
}

// List all user files
const userFiles = await storage.list('users/123/');
console.log('User files:', userFiles); // ['users/123/profile.jpg', 'users/123/document.pdf']

// Get URL for web serving
const profileUrl = storage.getUrl('users/123/profile.jpg');
```

## 🔧 Configuration Options

The examples above show basic usage, but you have full control over how storage
providers work. Here are the customization options available:

### Local Storage Options

| Option     | Description                  | Default       | Example                  |
| ---------- | ---------------------------- | ------------- | ------------------------ |
| `basePath` | Directory for storing files  | `'./storage'` | `'./uploads'`, `'/data'` |
| `baseUrl`  | URL prefix for serving files | `'/storage'`  | `'/files'`, `'/media'`   |

```javascript
await initStorage('local', {
  basePath: './app-data/files',
  baseUrl: '/api/files',
});
```

### S3 Storage Options

| Option        | Description                  | Default       | Example                            |
| ------------- | ---------------------------- | ------------- | ---------------------------------- |
| `bucket`      | S3 bucket name               | _Required_    | `'my-app-storage'`                 |
| `region`      | AWS region                   | `'us-east-1'` | `'us-west-2'`, `'eu-west-1'`       |
| `credentials` | AWS credentials object       | Auto-detect   | `{ accessKeyId, secretAccessKey }` |
| `publicRead`  | Make files publicly readable | `false`       | `true`                             |

```javascript
await initStorage('s3', {
  bucket: 'my-app-files',
  region: 'us-west-2',
  publicRead: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
```

## 💡 Common Use Cases

Here's where you can apply the storage module's functionality in your
applications:

| Category               | Use Case               | Description                                   | Components Used                      |
| ---------------------- | ---------------------- | --------------------------------------------- | ------------------------------------ |
| **Tauri Desktop Apps** | User Data Storage      | Store app settings, user files, and cache     | `LocalProvider`, `upload()`, `get()` |
|                        | Media Management       | Handle images, documents, and media files     | `upload()`, `list()`, `getUrl()`     |
| **Web Applications**   | File Uploads           | Handle user file uploads with progress        | `upload()` with progress callback    |
|                        | Content Delivery       | Serve static files and user-generated content | `getUrl()`, `get()`                  |
| **API Backends**       | Document Storage       | Store and retrieve documents and attachments  | `upload()`, `get()`, `exists()`      |
|                        | Backup Systems         | Automated file backup and restoration         | `list()`, `upload()`, `get()`        |
| **Cloud Migration**    | Multi-provider Support | Switch between local and cloud storage        | Provider abstraction                 |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common storage scenarios using the `@voilajsx/appkit/storage` module. We've
created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajsx/appkit/blob/main/src/storage/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs to understand the module's
capabilities and generate high-quality storage code.

### How to Use LLM Code Generation

Simply copy one of the prompts below and share it with ChatGPT, Claude, or
another capable LLM. The LLM will read the reference document and generate
clean, efficient storage code tailored to your specific requirements.

### Sample Prompts to Try

#### Basic File Storage System

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/storage/docs/PROMPT_REFERENCE.md and then create a file storage system for a Tauri app using @voilajsx/appkit/storage with the following features:
- Local file storage for user documents
- File upload with progress tracking
- File browser functionality
- Image thumbnail generation and storage
```

#### Cloud Storage Migration

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/storage/docs/PROMPT_REFERENCE.md and then implement a storage system using @voilajsx/appkit/storage that can:
- Start with local storage for development
- Migrate to S3 for production
- Handle large file uploads with progress
- Provide backup and restore functionality
```

#### Multi-tenant File Management

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/storage/docs/PROMPT_REFERENCE.md and then create a multi-tenant file management system using @voilajsx/appkit/storage with:
- Isolated storage per tenant
- File sharing between users
- Automatic file cleanup for expired content
- Integration with authentication system
```

## 📋 Example Code

For complete, working examples, check our examples folder:

- [Basic Local Storage](https://github.com/voilajsx/appkit/blob/main/src/storage/examples/01-local-basic.js) -
  Simple local file operations
- [S3 Storage Setup](https://github.com/voilajsx/appkit/blob/main/src/storage/examples/02-s3-basic.js) -
  AWS S3 configuration and usage
- [File Manager](https://github.com/voilajsx/appkit/blob/main/src/storage/examples/03-file-manager.js) -
  File organization and management operations
- [Express Upload Server](https://github.com/voilajsx/appkit/blob/main/src/storage/examples/04-express-upload.js) -
  Web server with file upload functionality

## 🛡️ Security Best Practices

Following these practices will help ensure your file storage system remains
secure:

1. **Path Validation**: Always validate file paths to prevent directory
   traversal attacks
2. **File Type Restrictions**: Implement file type validation before accepting
   uploads
3. **Size Limits**: Set appropriate file size limits to prevent abuse
4. **Access Control**: Use proper authentication before allowing file operations
5. **Secure URLs**: Use signed URLs for temporary access to sensitive files
6. **Regular Cleanup**: Implement cleanup routines for temporary and unused
   files

## 📊 Performance Considerations

- **Large Files**: Files over 100MB automatically use multipart uploads for
  better reliability
- **Progress Tracking**: Use progress callbacks for user feedback during long
  uploads
- **Batch Operations**: Consider batching multiple small file operations
- **Caching**: Cache file existence checks when building file browsers

## 🔍 Error Handling

The module provides specific error messages that you should handle
appropriately:

```javascript
try {
  const file = await storage.get('missing-file.txt');
} catch (error) {
  if (error.message.includes('not found')) {
    // Handle missing file
    console.log('File does not exist');
  } else {
    // Handle other errors
    console.error('Get failed:', error.message);
  }
}
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajsx/appkit/blob/main/src/storage/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/storage/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajsx/appkit/blob/main/src/storage/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJS](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
