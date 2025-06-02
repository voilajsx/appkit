/**
 * Storage module for file operations across different providers
 * @module @voilajsx/storage
 * @file src/storage/index.js
 */

export { initStorage, getStorage } from './manager.js';
export { StorageProvider } from './providers/base.js';
export { LocalProvider } from './providers/local.js';
export { S3Provider } from './providers/s3.js';
