/**
 * Event store tests
 * @vitest
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  EventStore,
  MemoryStore,
  setEventStore,
  publish,
  getEventHistory,
  clearEventHistory,
} from '../index.js';

describe('EventStore Base Class', () => {
  test('abstract methods throw errors when not implemented', () => {
    class IncompleteStore extends EventStore {}
    const store = new IncompleteStore();

    expect(() => store.addEvent({})).toThrow('addEvent() must be implemented');
    expect(() => store.getEvents()).toThrow('getEvents() must be implemented');
    expect(() => store.clearEvents()).toThrow(
      'clearEvents() must be implemented'
    );
  });

  test('validateEvent checks event structure', () => {
    // Create store with custom implementation of validateEvent
    class TestStore extends EventStore {
      addEvent() {}
      getEvents() {
        return [];
      }
      clearEvents() {}

      // Override validateEvent to return consistent results
      validateEvent(event) {
        if (!event) return false;
        if (typeof event !== 'object') return false;
        if (typeof event.event !== 'string') return false;
        if (event.event.trim().length === 0) return false;
        return true;
      }
    }

    const store = new TestStore();

    expect(store.validateEvent(null)).toBe(false);
    expect(store.validateEvent({})).toBe(false);
    expect(store.validateEvent({ event: '' })).toBe(false);
    expect(store.validateEvent({ event: 'test' })).toBe(true);
  });
});

describe('MemoryStore Implementation', () => {
  test('constructor sets default values', () => {
    const store = new MemoryStore();
    expect(store.maxEvents).toBe(10000);
  });

  test('addEvent stores event and returns id', () => {
    const store = new MemoryStore();
    const event = {
      id: 'test-id',
      event: 'test:event',
      data: { value: 'test' },
      timestamp: new Date(),
    };

    const id = store.addEvent(event);
    expect(id).toBe('test-id');

    const events = store.getEvents();
    expect(events.length).toBe(1);
    expect(events[0]).toEqual(event);
  });

  test('addEvent enforces size limits', () => {
    const store = new MemoryStore({ maxEventSize: 50 });

    // Create an event with large data that exceeds the limit
    const largeEvent = {
      id: 'test-id',
      event: 'test:event',
      data: { value: 'x'.repeat(100) }, // This will make the event too big
      timestamp: new Date(),
    };

    expect(() => {
      store.addEvent(largeEvent);
    }).toThrow(/Event size exceeds maximum allowed/);
  });

  test('additional utility methods work correctly', () => {
    const store = new MemoryStore();
    const now = new Date();

    store.addEvent({ id: '1', event: 'test:one', data: {}, timestamp: now });
    store.addEvent({ id: '2', event: 'test:two', data: {}, timestamp: now });
    store.addEvent({ id: '3', event: 'test:one', data: {}, timestamp: now });

    // getEventsByName
    const oneEvents = store.getEventsByName('test:one');
    expect(oneEvents.length).toBe(2);
    expect(oneEvents[0].id).toBe('1');

    // getRecentEvents
    const recentEvents = store.getRecentEvents(2);
    expect(recentEvents.length).toBe(2);
    expect(recentEvents[0].id).toBe('2');
    expect(recentEvents[1].id).toBe('3');
  });
});

describe('Store Configuration', () => {
  beforeEach(() => {
    clearEventHistory();
  });

  test('setEventStore configures custom store', () => {
    const customStore = new MemoryStore({ maxEvents: 50 });

    // Spy on the store methods
    vi.spyOn(customStore, 'addEvent');
    vi.spyOn(customStore, 'getEvents');

    // Set the custom store
    setEventStore(customStore);

    // Use the store through public APIs
    publish('test:event', { value: 'test' });
    getEventHistory();

    // Verify the custom store was used
    expect(customStore.addEvent).toHaveBeenCalled();
    expect(customStore.getEvents).toHaveBeenCalled();
  });
});
