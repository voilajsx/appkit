# @voilajs/appkit/events - LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Always include JSDoc comments for functions

2. **JSDoc Format** (Required for all functions):

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error Handling**:

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Throw descriptive error messages

4. **Framework Agnostic**:
   - Code should work with any Node.js framework
   - Avoid dependencies on specific frameworks or libraries

## Function Signatures

### 1. `subscribe`

```typescript
function subscribe(event: string, callback: (data: any) => void): () => void;
```

- Throws: `'Event name must be a non-empty string'` or
  `'Callback must be a function'`
- Returns: Unsubscribe function

### 2. `subscribeAsync`

```typescript
function subscribeAsync(
  event: string,
  callback: (data: any) => Promise<void> | void
): () => void;
```

- Throws: `'Event name must be a non-empty string'` or
  `'Callback must be a function'`
- Returns: Unsubscribe function

### 3. `unsubscribe`

```typescript
function unsubscribe(event: string, callback: (data: any) => void): void;
```

### 4. `unsubscribeAsync`

```typescript
function unsubscribeAsync(
  event: string,
  callback: (data: any) => Promise<void> | void
): void;
```

### 5. `publish`

```typescript
function publish(event: string, data?: any): string;
```

- Throws: `'Event name must be a non-empty string'`
- Returns: Event ID (string)

### 6. `publishBatch`

```typescript
function publishBatch(events: Array<{ event: string; data?: any }>): string[];
```

- Throws: `'Events must be an array'` or
  `'Event name must be a non-empty string'`
- Returns: Array of event IDs

### 7. `getEventHistory`

```typescript
function getEventHistory(filters?: {
  event?: string;
  since?: Date;
  limit?: number;
}): Array<{
  id: string;
  event: string;
  data: any;
  timestamp: Date;
}>;
```

### 8. `clearEventHistory`

```typescript
function clearEventHistory(): void;
```

### 9. `setEventStore`

```typescript
function setEventStore(store: EventStore): void;
```

- Throws: `'Store must implement EventStore interface'`

### 10. `waitForEvent`

```typescript
function waitForEvent(
  eventName: string,
  options?: {
    timeout?: number;
    filter?: (data: any) => boolean;
  }
): Promise<any>;
```

- Throws: `'Event name must be a non-empty string'` or
  `'Timeout waiting for event "{eventName}"'`
- Returns: Promise that resolves with event data

### 11. Base `EventStore` class

```typescript
abstract class EventStore {
  abstract addEvent(event: {
    id: string;
    event: string;
    data: any;
    timestamp: Date;
  }): string;

  abstract getEvents(): Array<{
    id: string;
    event: string;
    data: any;
    timestamp: Date;
  }>;

  abstract clearEvents(): void;

  getCount(): number;

  validateEvent(event: any): boolean;
}
```

### 12. `MemoryStore` class

```typescript
class MemoryStore extends EventStore {
  constructor(options?: { maxEvents?: number; maxEventSize?: number });

  addEvent(event: {
    id: string;
    event: string;
    data: any;
    timestamp: Date;
  }): string;

  getEvents(): Array<{
    id: string;
    event: string;
    data: any;
    timestamp: Date;
  }>;

  clearEvents(): void;

  getEventsByName(eventName: string): Array<{
    id: string;
    event: string;
    data: any;
    timestamp: Date;
  }>;

  getEventsSince(since: Date): Array<{
    id: string;
    event: string;
    data: any;
    timestamp: Date;
  }>;

  getRecentEvents(count?: number): Array<{
    id: string;
    event: string;
    data: any;
    timestamp: Date;
  }>;

  addEvents(
    events: Array<{
      id: string;
      event: string;
      data: any;
      timestamp: Date;
    }>
  ): string[];
}
```

## Example Implementations

### Basic Event Subscription

```javascript
/**
 * Sets up event handlers for user-related events
 * @param {Object} options - Configuration options
 * @param {Function} options.onUserCreated - Handler for user creation
 * @param {Function} options.onUserUpdated - Handler for user updates
 * @returns {Function} Cleanup function to unsubscribe all handlers
 */
function setupUserEventHandlers({ onUserCreated, onUserUpdated }) {
  // Validate parameters
  if (typeof onUserCreated !== 'function') {
    throw new Error('onUserCreated must be a function');
  }

  if (typeof onUserUpdated !== 'function') {
    throw new Error('onUserUpdated must be a function');
  }

  // Subscribe to events
  const unsubscribeCreated = subscribe('user:created', onUserCreated);
  const unsubscribeUpdated = subscribe('user:updated', onUserUpdated);

  // Return cleanup function
  return () => {
    unsubscribeCreated();
    unsubscribeUpdated();
  };
}
```

### Event Publishing with Error Handling

```javascript
/**
 * Publishes user activity events
 * @param {string} userId - User ID
 * @param {string} action - Action performed
 * @param {Object} data - Additional event data
 * @returns {string} Event ID
 * @throws {Error} If parameters are invalid
 */
function publishUserActivity(userId, action, data = {}) {
  // Validate parameters
  if (!userId || typeof userId !== 'string') {
    throw new Error('userId must be a non-empty string');
  }

  if (!action || typeof action !== 'string') {
    throw new Error('action must be a non-empty string');
  }

  // Create event payload
  const payload = {
    userId,
    action,
    ...data,
    timestamp: new Date(),
  };

  try {
    // Publish the event
    return publish(`user:${action}`, payload);
  } catch (error) {
    console.error('Failed to publish user activity:', error);
    throw new Error(`Failed to publish activity: ${error.message}`);
  }
}
```

### Custom Event Store Integration

```javascript
/**
 * Initializes event system with persistence
 * @param {Object} options - Initialization options
 * @param {string} options.storageType - 'memory' or 'persistent'
 * @param {number} options.maxEvents - Maximum events to store
 * @returns {Object} Event system API
 */
function initializeEventSystem({ storageType = 'memory', maxEvents = 10000 }) {
  // Create appropriate store
  let store;

  if (storageType === 'memory') {
    store = new MemoryStore({ maxEvents });
  } else if (storageType === 'persistent') {
    // This would be implemented by the user
    throw new Error('Persistent storage not implemented in this example');
  } else {
    throw new Error(`Unknown storage type: ${storageType}`);
  }

  // Set as the active store
  setEventStore(store);

  // Return public API
  return {
    publish,
    subscribe,
    getEvents: getEventHistory,
    clearEvents: clearEventHistory,
  };
}
```

### Async Event Processing

```javascript
/**
 * Processes data changes with async event handling
 * @param {Object} data - Changed data
 * @returns {Promise<string>} Event ID
 */
async function processDataChange(data) {
  try {
    // Pre-process data
    const processedData = await validateData(data);

    // Set up listener for completion event
    const processingComplete = waitForEvent('processing:complete', {
      timeout: 5000,
      filter: (result) => result.dataId === data.id,
    });

    // Publish the event
    const eventId = publish('data:changed', processedData);

    // Wait for processing to complete
    await processingComplete;

    return eventId;
  } catch (error) {
    console.error('Data processing failed:', error);
    throw new Error(`Failed to process data: ${error.message}`);
  }
}

/**
 * Sets up async data processors
 */
function setupDataProcessors() {
  subscribeAsync('data:changed', async (data) => {
    try {
      // Perform async processing
      const result = await processDataAsync(data);

      // Notify of completion
      publish('processing:complete', {
        dataId: data.id,
        result,
      });
    } catch (error) {
      console.error('Processing error:', error);

      // Publish error event
      publish('processing:error', {
        dataId: data.id,
        error: error.message,
      });
    }
  });
}
```

## Event Bus Integration Example

```javascript
/**
 * Creates a reusable message bus for application components
 * @returns {Object} Message bus interface
 */
function createMessageBus() {
  // Track all subscriptions for cleanup
  const subscriptions = [];

  /**
   * Subscribe to a message
   * @param {string} message - Message to subscribe to
   * @param {Function} handler - Message handler
   */
  function onMessage(message, handler) {
    const unsubscribe = subscribe(message, handler);
    subscriptions.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Send a message
   * @param {string} message - Message to send
   * @param {any} data - Message data
   * @returns {string} Message ID
   */
  function sendMessage(message, data) {
    return publish(message, data);
  }

  /**
   * Cleanup all subscriptions
   */
  function dispose() {
    subscriptions.forEach((unsubscribe) => unsubscribe());
    subscriptions.length = 0;
  }

  return {
    onMessage,
    sendMessage,
    dispose,
  };
}
```

## Code Generation Rules

1. **Always use parameter validation** for public functions
2. **Create clear return values** from all functions when appropriate
3. **Document error cases** and handle errors gracefully
4. **Follow functional programming patterns** where appropriate
5. **Ensure thread safety** in async event handlers
6. **Provide cleanup mechanisms** for subscriptions to prevent memory leaks

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
