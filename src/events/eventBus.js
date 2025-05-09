/**
 * @voilajs/appkit - Event bus implementation
 * @module @voilajs/appkit/events/eventBus
 */

import { MemoryStore } from './stores/memory.js';

// Singleton event bus instance
let eventStore = null;
const listeners = new Map();

// Initialize with default memory store
function getEventStore() {
  if (!eventStore) {
    eventStore = new MemoryStore();
  }
  return eventStore;
}

/**
 * Subscribes to an event
 * @param {string} event - Event name
 * @param {Function} callback - Event handler function
 * @returns {Function} Unsubscribe function
 */
export function subscribe(event, callback) {
  if (!event || typeof event !== 'string') {
    throw new Error('Event name must be a non-empty string');
  }
  
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }

  listeners.get(event).add(callback);

  // Return unsubscribe function
  return () => unsubscribe(event, callback);
}

/**
 * Unsubscribes from an event
 * @param {string} event - Event name
 * @param {Function} callback - Event handler function to remove
 */
export function unsubscribe(event, callback) {
  if (!listeners.has(event)) {
    return;
  }

  const eventListeners = listeners.get(event);
  eventListeners.delete(callback);

  // Clean up empty listener sets
  if (eventListeners.size === 0) {
    listeners.delete(event);
  }
}

/**
 * Publishes an event
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export function publish(event, data) {
  if (!event || typeof event !== 'string') {
    throw new Error('Event name must be a non-empty string');
  }

  // Store event in history
  const store = getEventStore();
  store.addEvent({
    event,
    data,
    timestamp: new Date(),
    id: generateEventId()
  });

  // Notify all listeners
  if (listeners.has(event)) {
    const eventListeners = listeners.get(event);
    eventListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }

  // Notify wildcard listeners
  if (listeners.has('*')) {
    const wildcardListeners = listeners.get('*');
    wildcardListeners.forEach(callback => {
      try {
        callback({ event, data });
      } catch (error) {
        console.error(`Error in wildcard event handler:`, error);
      }
    });
  }
}

/**
 * Gets event history
 * @param {Object} [filters] - Filter options
 * @param {string} [filters.event] - Filter by event name
 * @param {Date} [filters.since] - Filter events since date
 * @returns {Array<Object>} Array of event records
 */
export function getEventHistory(filters = {}) {
  const store = getEventStore();
  let events = store.getEvents();

  // Apply filters
  if (filters.event) {
    events = events.filter(e => e.event === filters.event);
  }

  if (filters.since && filters.since instanceof Date) {
    events = events.filter(e => e.timestamp >= filters.since);
  }

  return events;
}

/**
 * Clears event history
 */
export function clearEventHistory() {
  const store = getEventStore();
  store.clearEvents();
}

/**
 * Generates unique event ID
 * @private
 * @returns {string} Event ID
 */
function generateEventId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}