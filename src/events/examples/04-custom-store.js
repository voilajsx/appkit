/**
 * Custom Store - @voilajs/appkit Events Module
 *
 * Example demonstrating custom event store implementation
 * No external dependencies needed - just run it!
 *
 * Run: node 04-custom-store.js
 */

import {
  EventStore,
  setEventStore,
  publish,
  subscribe,
  getEventHistory,
} from '@voilajs/appkit/events';

/**
 * Simple file-like store that keeps events in a JSON structure
 * This simulates a persistent storage mechanism
 */
class JsonFileStore extends EventStore {
  constructor(options = {}) {
    super();
    this.events = [];
    this.filename = options.filename || 'events.json';
    this.maxEvents = options.maxEvents || 1000;
    console.log(`JsonFileStore initialized with file: ${this.filename}`);
  }

  /**
   * Add an event to the store
   * @param {Object} event - Event record to add
   * @returns {string} - Event ID
   */
  addEvent(event) {
    if (!this.validateEvent(event)) {
      throw new Error('Invalid event structure');
    }

    // In a real implementation, we would append to a file here
    console.log(
      `[JsonFileStore] Writing event to ${this.filename}: ${event.event}`
    );

    // Add event to our in-memory representation
    this.events.push(event);

    // Keep events under the maximum limit
    if (this.events.length > this.maxEvents) {
      const overflow = this.events.length - this.maxEvents;
      this.events = this.events.slice(overflow);
      console.log(
        `[JsonFileStore] Trimmed ${overflow} old events to stay under limit`
      );
    }

    return event.id;
  }

  /**
   * Get all events from the store
   * @returns {Array} - Array of event records
   */
  getEvents() {
    // In a real implementation, we would read from a file here
    console.log(`[JsonFileStore] Reading all events from ${this.filename}`);
    return [...this.events];
  }

  /**
   * Clear all events from the store
   */
  clearEvents() {
    // In a real implementation, we would clear or recreate the file
    console.log(`[JsonFileStore] Clearing all events from ${this.filename}`);
    this.events = [];
  }

  /**
   * Custom method to get statistics about events
   * @returns {Object} - Statistics object
   */
  getStats() {
    const eventTypes = {};

    this.events.forEach((event) => {
      eventTypes[event.event] = (eventTypes[event.event] || 0) + 1;
    });

    return {
      totalEvents: this.events.length,
      uniqueEventTypes: Object.keys(eventTypes).length,
      eventTypeCounts: eventTypes,
    };
  }
}

function demo() {
  console.log('=== Custom Event Store Demo ===\n');

  // 1. Create and set a custom store
  console.log('1. Creating and configuring a custom JsonFileStore...');
  const customStore = new JsonFileStore({
    filename: 'demo-events.json',
    maxEvents: 100,
  });

  // Set as the active event store
  setEventStore(customStore);
  console.log('Custom store configured\n');

  // 2. Subscribe to some events
  console.log('2. Setting up subscriptions...');
  subscribe('app:started', () => {
    console.log('Application started event received');
  });

  subscribe('user:action', (data) => {
    console.log(`User action: ${data.action} by user ${data.userId}`);
  });
  console.log('Subscriptions complete\n');

  // 3. Publish events
  console.log('3. Publishing events...');
  publish('app:started', { timestamp: new Date() });

  publish('user:action', {
    userId: 'user-123',
    action: 'login',
    timestamp: new Date(),
  });

  publish('user:action', {
    userId: 'user-456',
    action: 'view-profile',
    timestamp: new Date(),
  });

  publish('system:status', {
    status: 'healthy',
    metrics: {
      cpu: '23%',
      memory: '512MB',
    },
    timestamp: new Date(),
  });
  console.log('Events published\n');

  // 4. Get event history (which uses our custom store)
  console.log('4. Getting event history from custom store...');
  const history = getEventHistory();
  console.log(`Retrieved ${history.length} events from the custom store`);
  console.log('');

  // 5. Use a custom method from our store
  console.log('5. Using custom store method (getStats)...');
  const stats = customStore.getStats();
  console.log('Event Statistics:');
  console.log(`- Total Events: ${stats.totalEvents}`);
  console.log(`- Unique Event Types: ${stats.uniqueEventTypes}`);
  console.log('- Event Counts by Type:');
  Object.entries(stats.eventTypeCounts).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });
}

demo();
