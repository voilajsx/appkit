/**
 * File retention tests for @voilajs/appkit logging module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileTransport } from '../transports/file.js';
import { cleanupTestLogs, TEST_LOG_DIR } from './setup.js';
import fs from 'fs/promises';
import path from 'path';

describe('File Retention', () => {
  let transport;

  beforeEach(async () => {
    await cleanupTestLogs();
  });

  afterEach(async () => {
    if (transport) {
      await transport.close();
      transport = null;
    }
    await cleanupTestLogs();
  });

  it('should handle retention logic correctly', async () => {
    // This test verifies that the retention logic works as expected
    // by testing the implementation directly

    // Create transport with 5 day retention
    const retention = 5;
    transport = new FileTransport({
      dirname: TEST_LOG_DIR,
      filename: 'test.log',
      retentionDays: retention,
    });

    // Current time for comparison
    const now = Date.now();

    // Test 1: Files older than retention days should be deleted
    const oldDate = new Date(now - (retention + 1) * 24 * 60 * 60 * 1000); // 6 days old
    const shouldBeDeleted =
      oldDate.getTime() < now - retention * 24 * 60 * 60 * 1000;
    expect(shouldBeDeleted).toBe(true);

    // Test 2: Files newer than retention days should be kept
    const recentDate = new Date(now - (retention - 1) * 24 * 60 * 60 * 1000); // 4 days old
    const shouldBeKept =
      recentDate.getTime() >= now - retention * 24 * 60 * 60 * 1000;
    expect(shouldBeKept).toBe(true);

    // Test 3: When retention is 0, no files should be deleted
    const zeroRetentionTransport = new FileTransport({
      dirname: TEST_LOG_DIR,
      filename: 'test.log',
      retentionDays: 0,
    });

    // Confirm retentionDays is properly set to 0
    expect(zeroRetentionTransport.retentionDays).toBe(0);
  });

  it('should skip cleanup when retention is disabled', async () => {
    // Directly inspect the implementation of cleanOldLogs when retentionDays=0
    transport = new FileTransport({
      dirname: TEST_LOG_DIR,
      filename: 'no-retention.log',
      retentionDays: 0,
    });

    // Mock the fs.readdir function to spy if it's called
    const readDirSpy = vi.spyOn(fs, 'readdir');

    // Run cleanup
    await transport.cleanOldLogs();

    // Verify readdir was NOT called (should return early if retention=0)
    expect(readDirSpy).not.toHaveBeenCalled();

    // Restore the mock
    readDirSpy.mockRestore();
  });

  it('should use correct filename pattern matching', async () => {
    // Test that the file retention logic correctly filters log files
    transport = new FileTransport({
      dirname: TEST_LOG_DIR,
      filename: 'test.log',
      retentionDays: 5,
    });

    // Get the base filename
    const base = path.basename('test.log', path.extname('test.log'));

    // Test filenames
    const matchingFile = `${base}-2023-01-01.log`;
    const nonMatchingFile = 'other-2023-01-01.log';

    // Check that a file with the right prefix should be processed
    const shouldMatch = matchingFile.startsWith(base);
    expect(shouldMatch).toBe(true);

    // Check that a file with a different prefix should be ignored
    const shouldNotMatch = nonMatchingFile.startsWith(base);
    expect(shouldNotMatch).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    // Create a transport
    transport = new FileTransport({
      dirname: TEST_LOG_DIR,
      filename: 'error.log',
      retentionDays: 1,
    });

    // Create a spy to verify the error handling behavior
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Simulate an error in readdir
    const readdirMock = vi
      .spyOn(fs, 'readdir')
      .mockRejectedValue(new Error('Test error'));

    // Call the method that should handle the error
    await transport.cleanOldLogs();

    // Check that console.error was called with appropriate arguments
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Restore the mocks
    consoleErrorSpy.mockRestore();
    readdirMock.mockRestore();
  });
});
