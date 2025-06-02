/**
 * Test setup and configuration for storage module
 * @module @voilajsx/appkit/storage/tests
 * @file src/storage/tests/setup.js
 */

import { vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';

// Test directories - defined as constants
export const TEST_DIRS = {
  local: './test-storage-local',
  temp: './test-temp',
};

// Global cleanup function
async function cleanupTestDirectories() {
  const dirsToClean = [
    ...Object.values(TEST_DIRS),
    './test-local-provider',
    './test-new-dir',
  ];

  for (const dir of dirsToClean) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// Setup before each test
beforeEach(async () => {
  // Clear all mocks
  vi.clearAllMocks();

  // Clean up any existing test directories
  await cleanupTestDirectories();
});

// Cleanup after each test
afterEach(async () => {
  // Clear mocks
  vi.clearAllMocks();

  // Clean up test files
  await cleanupTestDirectories();
});

/**
 * Creates a test buffer with specified size and content
 * @param {number} size - Buffer size in bytes
 * @param {string} content - Content to repeat in buffer
 * @returns {Buffer} Test buffer
 */
export function createTestBuffer(size = 100, content = 'test-data') {
  const buffer = Buffer.alloc(size);
  const contentBuffer = Buffer.from(content);

  for (let i = 0; i < size; i++) {
    buffer[i] = contentBuffer[i % contentBuffer.length];
  }

  return buffer;
}

/**
 * Creates a mock file stream for testing
 * @param {number} size - Stream size
 * @param {string} content - Content to stream
 * @returns {Object} Mock readable stream
 */
export function createMockStream(size = 100, content = 'test-data') {
  const buffer = createTestBuffer(size, content);
  let position = 0;

  return {
    pipe: true,
    headers: { 'content-length': size.toString() },
    on: vi.fn((event, callback) => {
      if (event === 'data') {
        // Simulate streaming data in chunks
        const chunkSize = Math.min(32, size - position);
        if (chunkSize > 0) {
          const chunk = buffer.slice(position, position + chunkSize);
          position += chunkSize;
          setTimeout(() => callback(chunk), 10);
        }
      }
    }),
    read: vi.fn(() => {
      const chunkSize = Math.min(32, size - position);
      if (chunkSize > 0) {
        const chunk = buffer.slice(position, position + chunkSize);
        position += chunkSize;
        return chunk;
      }
      return null;
    }),
    [Symbol.asyncIterator]: async function* () {
      let pos = 0;
      while (pos < size) {
        const chunkSize = Math.min(32, size - pos);
        yield buffer.slice(pos, pos + chunkSize);
        pos += chunkSize;
      }
    },
  };
}

/**
 * Creates test file on filesystem for stream testing
 * @param {string} path - File path
 * @param {number} size - File size
 * @param {string} content - File content
 * @returns {Promise<void>}
 */
export async function createTestFile(path, size = 100, content = 'test-data') {
  const buffer = createTestBuffer(size, content);
  await fs.writeFile(path, buffer);
}

/**
 * Helper to create temporary directory
 * @param {string} dirPath - Directory path
 * @returns {Promise<void>}
 */
export async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Ignore if already exists
  }
}

/**
 * Helper to check if file exists
 * @param {string} filePath - File path to check
 * @returns {Promise<boolean>}
 */
export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to read file size
 * @param {string} filePath - File path
 * @returns {Promise<number>} File size in bytes
 */
export async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}
