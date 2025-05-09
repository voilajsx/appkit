/**
 * @voilajs/appkit - Base event store interface
 * @module @voilajs/appkit/events/stores/base
 */

/**
 * Base event store interface
 * @abstract
 */
export class EventStore {
    /**
     * Adds event to store
     * @abstract
     * @param {Object} event - Event record
     */
    addEvent(event) {
      throw new Error('addEvent() must be implemented by store');
    }
  
    /**
     * Gets all events
     * @abstract
     * @returns {Array<Object>} Array of events
     */
    getEvents() {
      throw new Error('getEvents() must be implemented by store');
    }
  
    /**
     * Clears all events
     * @abstract
     */
    clearEvents() {
      throw new Error('clearEvents() must be implemented by store');
    }
  
    /**
     * Gets events count
     * @returns {number} Number of events
     */
    getCount() {
      return this.getEvents().length;
    }
  }