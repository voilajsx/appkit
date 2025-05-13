# @voilajs/appkit/events - API Reference

## Overview

The `@voilajs/appkit/events` module provides a lightweight, flexible event bus
implementation for Node.js applications. It includes features for event
subscription, publishing, history tracking, and customizable event storage.

## Installation

```bash
npm install @voilajs/appkit
```

## Quick Start

```javascript
import { subscribe, publish } from '@voilajs/appkit/events';

// Subscribe to an event
const unsubscribe = subscribe('user:created', (data) => {
  console.log(`New user created: ${data.name}`);
});

// Publish an event
publish('user:created', { id: '123', name: 'John Doe' });

// Unsubscribe when done
unsubscribe();
```

## API Reference

### Event Subscription

#### subscribe(event, callback)

Subscribes to an event with a synchronous callback function.

##### Parameters

| Name       | Type       | Required | Default | Description                                                                           |
| ---------- | ---------- | -------- | ------- | ------------------------------------------------------------------------------------- |
| `event`    | `string`   | Yes      | -       | The event name to subscribe to. Use `'*'` to subscribe to all events.                 |
| `callback` | `Function` | Yes      | -       | Function called when the event is published. Receives the event data as its argument. |

##### Returns

- `Function` - Unsubscribe function that can be called to remove the
  subscription.

##### Throws

- `Error` - If event name is not a non-empty string.
- `Error` - If callback is not a function.

##### Example

```javascript
// Subscribe to a specific event
const unsubscribe = subscribe('user:login', (userData) => {
  console.log(`User logged in: ${userData.username}`);
});

// Subscribe to all events
subscribe('*', ({ event, data }) => {
  console.log(`Event "${event}" occurred with data:`, data);
});
```

---

#### subscribeAsync(event, callback)

Subscribes to an event with an asynchronous callback function that won't block
the event publishing.

##### Parameters

| Name       | Type       | Required | Default | Description                                                                                 |
| ---------- | ---------- | -------- | ------- | ------------------------------------------------------------------------------------------- |
| `event`    | `string`   | Yes      | -       | The event name to subscribe to. Use `'*'` to subscribe to all events.                       |
| `callback` | `Function` | Yes      | -       | Async function called when the event is published. Receives the event data as its argument. |

##### Returns

- `Function` - Unsubscribe function that can be called to remove the
  subscription.

##### Throws

- `Error` - If event name is not a non-empty string.
- `Error` - If callback is not a function.

##### Example

```javascript
// Subscribe with an async handler
const unsubscribe = subscribeAsync('data:received', async (data) => {
  try {
    await processDataAsync(data);
    await saveToDatabase(data);
  } catch (error) {
    console.error('Failed to process data:', error);
  }
});
```

---

#### unsubscribe(event, callback)

Removes a subscription for a specific event and callback.

##### Parameters

| Name       | Type       | Required | Default | Description                         |
| ---------- | ---------- | -------- | ------- | ----------------------------------- |
| `event`    | `string`   | Yes      | -       | The event name to unsubscribe from. |
| `callback` | `Function` | Yes      | -       | The callback function to remove.    |

##### Example

```javascript
function handleUserCreated(data) {
  console.log(`User created: ${data.name}`);
}

// Subscribe
subscribe('user:created', handleUserCreated);

// Later, unsubscribe
unsubscribe('user:created', handleUserCreated);
```

---

#### unsubscribeAsync(event, callback)

Removes an asynchronous subscription for a specific event and callback.

##### Parameters

| Name       | Type       | Required | Default | Description                            |
| ---------- | ---------- | -------- | ------- | -------------------------------------- |
| `event`    | `string`   | Yes      | -       | The event name to unsubscribe from.    |
| `callback` | `Function` | Yes      | -       | The async callback function to remove. |

##### Example

```javascript
async function handleDataAsync(data) {
  await processData(data);
}

// Subscribe
subscribeAsync('data:received', handleDataAsync);

// Later, unsubscribe
unsubscribeAsync('data:received', handleDataAsync);
```

---

#### waitForEvent(eventName, options)

Returns a Promise that resolves when a specific event occurs.

##### Parameters

| Name              | Type       | Required | Default | Description                                                                                       |
| ----------------- | ---------- | -------- | ------- | ------------------------------------------------------------------------------------------------- |
| `eventName`       | `string`   | Yes      | -       | The event name to wait for.                                                                       |
| `options`         | `Object`   | No       | `{}`    | Configuration options.                                                                            |
| `options.timeout` | `number`   | No       | -       | Timeout in milliseconds. If provided, promise will reject after this time if event doesn't occur. |
| `options.filter`  | `Function` | No       | -       | Function to filter events. Return true to accept the event, false to continue waiting.            |

##### Returns

- `Promise<any>` - Promise that resolves with event data when the event occurs.

##### Throws

- `Error` - If event name is not a non-empty string.
- `Error` - If timeout is reached before the event occurs.

##### Example

```javascript
// Wait for a specific event
try {
  const userData = await waitForEvent('user:login', {
    timeout: 5000,
    filter: (data) => data.role === 'admin',
  });
  console.log('Admin user logged in:', userData);
} catch (error) {
  console.error('Timed out waiting for admin login');
}
```

### Event Publishing

#### publish(event, data)

Publishes an event with associated data.

##### Parameters

| Name    | Type     | Required | Default | Description                     |
| ------- | -------- | -------- | ------- | ------------------------------- |
| `event` | `string` | Yes      | -       | The event name to publish.      |
| `data`  | `any`    | No       | -       | Data to pass to event handlers. |

##### Returns

- `string` - The generated event ID.

##### Throws

- `Error` - If event name is not a non-empty string.

##### Example

```javascript
// Publish an event with data
const eventId = publish('notification:sent', {
  userId: '123',
  message: 'Hello world!',
  timestamp: new Date(),
});

console.log(`Published event with ID: ${eventId}`);
```

---

#### publishBatch(events)

Publishes multiple events at once.

##### Parameters

| Name             | Type            | Required | Default | Description                     |
| ---------------- | --------------- | -------- | ------- | ------------------------------- |
| `events`         | `Array<Object>` | Yes      | -       | Array of events to publish.     |
| `events[].event` | `string`        | Yes      | -       | The event name to publish.      |
| `events[].data`  | `any`           | No       | -       | Data to pass to event handlers. |

##### Returns

- `Array<string>` - Array of generated event IDs.

##### Throws

- `Error` - If events is not an array.
- `Error` - If any event name is not a non-empty string.

##### Example

```javascript
// Publish multiple events
const eventIds = publishBatch([
  { event: 'user:created', data: { id: '123', name: 'John' } },
  { event: 'notification:sent', data: { userId: '123', message: 'Welcome!' } },
]);

console.log(`Published ${eventIds.length} events`);
```

### Event History

#### getEventHistory(filters)

Retrieves event history with optional filtering.

##### Parameters

| Name            | Type     | Required | Default | Description                          |
| --------------- | -------- | -------- | ------- | ------------------------------------ |
| `filters`       | `Object` | No       | `{}`    | Filter criteria for events.          |
| `filters.event` | `string` | No       | -       | Filter by event name.                |
| `filters.since` | `Date`   | No       | -       | Filter events since this date.       |
| `filters.limit` | `number` | No       | -       | Limit the number of events returned. |

##### Returns

- `Array<Object>` - Array of event objects matching the filter criteria.

##### Example

```javascript
// Get all events
const allEvents = getEventHistory();

// Get recent login events
const loginEvents = getEventHistory({
  event: 'user:login',
  since: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
  limit: 10, // Only most recent 10 events
});
```

---

#### clearEventHistory()

Clears all stored events from history.

##### Example

```javascript
// Clear all event history
clearEventHistory();
```

### Event Store Management

#### setEventStore(store)

Sets a custom event store implementation.

##### Parameters

| Name    | Type         | Required | Default | Description                                                                 |
| ------- | ------------ | -------- | ------- | --------------------------------------------------------------------------- |
| `store` | `EventStore` | Yes      | -       | Custom event store implementation that extends the `EventStore` base class. |

##### Throws

- `Error` - If store doesn't implement the `EventStore` interface.

##### Example

```javascript
import { setEventStore, EventStore } from '@voilajs/appkit/events';
import { MongoDbStore } from './my-mongo-store.js';

// Configure a custom MongoDB-backed event store
const mongoStore = new MongoDbStore({
  url: 'mongodb://localhost:27017',
  collection: 'events',
});

setEventStore(mongoStore);
```

### Store Base Class

#### EventStore

Abstract base class for event stores.

##### Methods

| Method                 | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| `addEvent(event)`      | Adds an event to the store. Must be implemented by subclasses.        |
| `getEvents()`          | Returns all events from the store. Must be implemented by subclasses. |
| `clearEvents()`        | Clears all events from the store. Must be implemented by subclasses.  |
| `getCount()`           | Returns the number of events in the store.                            |
| `validateEvent(event)` | Validates event structure.                                            |

##### Example

```javascript
import { EventStore } from '@voilajs/appkit/events';

// Create a custom event store
class RedisEventStore extends EventStore {
  constructor(options) {
    super();
    this.client = createRedisClient(options);
  }

  async addEvent(event) {
    if (!this.validateEvent(event)) {
      throw new Error('Invalid event structure');
    }
    await this.client.lpush('events', JSON.stringify(event));
    return event.id;
  }

  async getEvents() {
    const events = await this.client.lrange('events', 0, -1);
    return events.map((e) => JSON.parse(e));
  }

  async clearEvents() {
    await this.client.del('events');
  }
}
```

### Memory Store Implementation

#### MemoryStore

In-memory implementation of `EventStore` for development and testing.

##### Constructor Parameters

| Name                   | Type     | Required | Default   | Description                                      |
| ---------------------- | -------- | -------- | --------- | ------------------------------------------------ |
| `options`              | `Object` | No       | `{}`      | Configuration options.                           |
| `options.maxEvents`    | `number` | No       | `10000`   | Maximum number of events to store.               |
| `options.maxEventSize` | `number` | No       | `1048576` | Maximum size of an event in bytes (1MB default). |

##### Methods

| Method                       | Description                              |
| ---------------------------- | ---------------------------------------- |
| `addEvent(event)`            | Adds an event to the store.              |
| `getEvents()`                | Returns all events from the store.       |
| `clearEvents()`              | Clears all events from the store.        |
| `getEventsByName(eventName)` | Returns events with the specified name.  |
| `getEventsSince(since)`      | Returns events since the specified date. |
| `getRecentEvents(count)`     | Returns the most recent events.          |
| `addEvents(events)`          | Adds multiple events at once.            |

##### Example

```javascript
import { MemoryStore } from '@voilajs/appkit/events';

// Create a memory store with custom options
const store = new MemoryStore({
  maxEvents: 5000, // Only keep 5000 most recent events
  maxEventSize: 512000, // Limit events to 500KB
});

// Use it with the event bus
setEventStore(store);
```

## Error Handling

All functions in this module throw errors with descriptive messages. It's
recommended to wrap calls in try-catch blocks:

```javascript
try {
  publish('invalid event', data);
} catch (error) {
  console.error('Failed to publish event:', error.message);
}
```

### Common Error Messages

| Function                     | Error Message                               | Cause                    |
| ---------------------------- | ------------------------------------------- | ------------------------ |
| `subscribe`/`subscribeAsync` | "Event name must be a non-empty string"     | Invalid event name       |
| `subscribe`/`subscribeAsync` | "Callback must be a function"               | Invalid callback         |
| `publish`                    | "Event name must be a non-empty string"     | Invalid event name       |
| `publishBatch`               | "Events must be an array"                   | Invalid events parameter |
| `setEventStore`              | "Store must implement EventStore interface" | Invalid store            |
| `MemoryStore.addEvent`       | "Invalid event structure"                   | Malformed event          |
| `MemoryStore.addEvent`       | "Event size exceeds maximum allowed"        | Event too large          |

## Security Considerations

1. **Data Validation**: Always validate event data before publishing, especially
   if events could come from untrusted sources
2. **Memory Management**: Set appropriate `maxEvents` and `maxEventSize` limits
   to prevent memory issues
3. **Sensitive Data**: Be cautious about storing sensitive information in events
   as they persist in the event history
4. **Error Handling**: Ensure event handlers have proper error handling to
   prevent crashes
5. **Event Loop Blocking**: Use `subscribeAsync` for CPU-intensive or I/O
   operations to avoid blocking the event loop

## TypeScript Support

While this module is written in JavaScript, it includes JSDoc comments for
better IDE support. For TypeScript projects, you can create declaration files or
use JSDoc type annotations:

```typescript
// Example type declarations
interface EventData {
  id: string;
  timestamp: Date;
  event: string;
  data: any;
}

interface EventFilters {
  event?: string;
  since?: Date;
  limit?: number;
}

interface EventStoreOptions {
  maxEvents?: number;
  maxEventSize?: number;
}
```

## Performance Tips

1. **Batch Processing**: Use `publishBatch` for publishing multiple related
   events
2. **Event Size**: Keep event payloads small to reduce memory usage and improve
   performance
3. **Event Filtering**: Filter events as early as possible to reduce processing
   overhead
4. **Listener Count**: Monitor the number of listeners and unsubscribe when no
   longer needed
5. **Custom Stores**: Implement specialized stores for high-throughput
   applications

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
