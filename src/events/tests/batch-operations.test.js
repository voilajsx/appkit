/**
 * Batch operations tests
 * @vitest
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  subscribe,
  publishBatch,
  getEventHistory,
  clearEventHistory,
} from '../index.js';

// Clean state before each test
beforeEach(() => {
  clearEventHistory();
});

describe('Batch Operations', () => {
  test('publishBatch publishes multiple events at once', () => {
    const mockHandler = vi.fn();
    subscribe('test:event', mockHandler);

    const events = [
      { event: 'test:event', data: { id: 1 } },
      { event: 'test:event', data: { id: 2 } },
      { event: 'other:event', data: { id: 3 } },
    ];

    const eventIds = publishBatch(events);

    // Should return an array of event IDs
    expect(Array.isArray(eventIds)).toBe(true);
    expect(eventIds.length).toBe(3);

    // The handler should be called for each matching event
    expect(mockHandler).toHaveBeenCalledTimes(2);
    expect(mockHandler).toHaveBeenNthCalledWith(1, { id: 1 });
    expect(mockHandler).toHaveBeenNthCalledWith(2, { id: 2 });

    // Check event history
    const history = getEventHistory();
    expect(history.length).toBe(3);
  });

  test('publishBatch handles empty array', () => {
    const eventIds = publishBatch([]);
    expect(Array.isArray(eventIds)).toBe(true);
    expect(eventIds.length).toBe(0);
  });

  test('publishBatch validates input', () => {
    expect(() => {
      publishBatch('not an array');
    }).toThrow('Events must be an array');

    expect(() => {
      publishBatch([
        { event: 'valid:event', data: {} },
        { event: '', data: {} }, // Invalid event name
      ]);
    }).toThrow('Event name must be a non-empty string');
  });

  test('publishBatch continues after handler errors', () => {
    // First handler throws an error
    subscribe('first:event', () => {
      throw new Error('Handler error');
    });

    // Second handler is normal
    const secondHandler = vi.fn();
    subscribe('second:event', secondHandler);

    // Mock console.error to prevent error logs during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const events = [
      { event: 'first:event', data: { id: 1 } },
      { event: 'second:event', data: { id: 2 } },
    ];

    // Should not throw despite handler error
    expect(() => {
      publishBatch(events);
    }).not.toThrow();

    // Second handler should still be called
    expect(secondHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledWith({ id: 2 });

    // Both events should be in history
    const history = getEventHistory();
    expect(history.length).toBe(2);

    vi.restoreAllMocks();
  });
});
