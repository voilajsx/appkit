/**
 * Test setup and utilities for logging module tests
 */

import { vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Global timeout for all tests
    testTimeout: 30000, // 30 seconds
    // Other global test configuration
    globals: true,
    environment: 'node',
  },
});

// Mock console methods
export const mockConsole = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
};

// Test log directory
export const TEST_LOG_DIR = 'test-logs';

// Clean up test logs
export async function cleanupTestLogs() {
  try {
    await fs.rm(TEST_LOG_DIR, { recursive: true, force: true });
  } catch (error) {
    // Directory doesn't exist, that's fine
  }
}

// Read log file content
export async function readLogFile(filename) {
  const filePath = path.join(TEST_LOG_DIR, filename);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
  } catch (error) {
    return [];
  }
}

// Wait for async operations
export function waitForAsync(ms = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Create test logger options
export function createTestLoggerOptions(overrides = {}) {
  return {
    dirname: TEST_LOG_DIR,
    filename: 'test.log',
    ...overrides,
  };
}
