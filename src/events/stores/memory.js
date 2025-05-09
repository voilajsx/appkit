/**
 * @voilajs/appkit - In-memory event store
 * @module @voilajs/appkit/events/stores/memory
 */

import { EventStore } from './base.js';

/**
 * In-memory event store implementation
 * @extends EventStore
 */
export class MemoryStore extends EventStore {
  constructor(options = {}) {
    super();
    this.events = [];
    this.maxEvents = options.maxEvents || 10000;
  }

  /**
   * Adds event to store
   * @param {Object} event - Event record
   */
  addEvent(event) {
    this.events.push(event);

    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      // Remove oldest events
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * Gets all events
   * @returns {Array<Object>} Array of events
   */
  getEvents() {
    return [...this.events];
  }

  /**
   * Clears all events
   */
  clearEvents() {
    this.events = [];
  }

  /**
   * Gets events by event name
   * @param {string} eventName - Event name to filter by
   * @returns {Array<Object>} Filtered events
   */
  getEventsByName(eventName) {
    return this.events.filter(event => event.event === eventName);
  }

  /**
   * Gets events since timestamp
   * @param {Date} since - Date to filter from
   * @returns {Array<Object>} Filtered events
   */
  getEventsSince(since) {
    return this.events.filter(event => event.timestamp >= since);
  }

  /**
   * Gets recent events
   * @param {number} count - Number of events to return
   * @returns {Array<Object>} Recent events
   */
  getRecentEvents(count = 10) {
    return this.events.slice(-count);
  }
}