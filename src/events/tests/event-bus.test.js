/**
 * Event bus basic functionality tests
 * @vitest
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
  subscribe,
  unsubscribe,
  publish,
  clearEventHistory,
} from '../index.js';

// Clean state before each test
beforeEach(() => {
  clearEventHistory();
});

describe('Event Subscription', () => {
  test('subscribe registers handlers and publish triggers them', () => {
    const mockHandler = vi.fn();
    subscribe('test:event', mockHandler);

    publish('test:event', { data: 'test' });

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith({ data: 'test' });
  });

  test('unsubscribe removes event handler', () => {
    const mockHandler = vi.fn();
    subscribe('test:event', mockHandler);

    publish('test:event', { data: 'first' });
    expect(mockHandler).toHaveBeenCalledTimes(1);

    unsubscribe('test:event', mockHandler);
    publish('test:event', { data: 'second' });
    expect(mockHandler).toHaveBeenCalledTimes(1); // No additional calls
  });

  test('wildcard subscription receives all events', () => {
    const mockHandler = vi.fn();
    subscribe('*', mockHandler);

    publish('test:one', { id: 1 });
    publish('test:two', { id: 2 });

    expect(mockHandler).toHaveBeenCalledTimes(2);
    expect(mockHandler).toHaveBeenNthCalledWith(1, {
      event: 'test:one',
      data: { id: 1 },
    });
    expect(mockHandler).toHaveBeenNthCalledWith(2, {
      event: 'test:two',
      data: { id: 2 },
    });
  });
});

describe('Input Validation', () => {
  test('subscribe and publish validate inputs', () => {
    expect(() => {
      subscribe('', () => {});
    }).toThrow('Event name must be a non-empty string');

    expect(() => {
      subscribe('test:event', 'not a function');
    }).toThrow('Callback must be a function');

    expect(() => {
      publish('', { data: 'test' });
    }).toThrow('Event name must be a non-empty string');
  });
});
