/**
 * Event history tests
 * @vitest
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { publish, getEventHistory, clearEventHistory } from '../index.js';

// Clean state before each test
beforeEach(() => {
  clearEventHistory();
});

describe('Event History', () => {
  test('getEventHistory returns all published events', () => {
    publish('test:one', { id: 1 });
    publish('test:two', { id: 2 });

    const history = getEventHistory();

    expect(history.length).toBe(2);
    expect(history[0].event).toBe('test:one');
    expect(history[1].event).toBe('test:two');
  });

  test('clearEventHistory removes all events', () => {
    publish('test:one', { id: 1 });
    publish('test:two', { id: 2 });

    let history = getEventHistory();
    expect(history.length).toBe(2);

    clearEventHistory();

    history = getEventHistory();
    expect(history.length).toBe(0);
  });

  test('events include metadata and data', () => {
    const data = { id: '123', name: 'Test' };
    const eventId = publish('test:event', data);

    const history = getEventHistory();
    const event = history[0];

    expect(event.id).toBe(eventId);
    expect(event.event).toBe('test:event');
    expect(event.data).toEqual(data);
    expect(event.timestamp).toBeInstanceOf(Date);
  });
});

describe('Event History Filtering', () => {
  beforeEach(() => {
    // Set up test data
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 3600000);

    publish('user:login', { id: 'user1', timestamp: hourAgo });
    publish('user:action', { id: 'user1', action: 'view' });
    publish('system:status', { status: 'ok' });
  });

  test('filter by event name', () => {
    const loginEvents = getEventHistory({ event: 'user:login' });

    expect(loginEvents.length).toBe(1);
    expect(loginEvents[0].event).toBe('user:login');
  });

  test('filter by limit', () => {
    const limitedEvents = getEventHistory({ limit: 2 });

    expect(limitedEvents.length).toBe(2);
    expect(limitedEvents[0].event).toBe('user:action');
    expect(limitedEvents[1].event).toBe('system:status');
  });
});
