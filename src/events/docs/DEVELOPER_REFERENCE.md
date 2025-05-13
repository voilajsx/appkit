# Event Bus Module - Developer REFERENCE 🛠️

The event bus module provides a lightweight, flexible system for implementing
the publisher-subscriber pattern in Node.js applications. It offers simple event
subscription, publishing, and history tracking - all with sensible defaults to
get you started quickly.

Whether you need basic event handling or a complete event system with history
tracking, this module provides flexible, composable utilities that work with any
Node.js application.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📢 [Event Subscription](#event-subscription)
  - [Basic Subscription](#basic-subscription)
  - [Unsubscribing](#unsubscribing)
  - [Complete Subscription Example](#complete-subscription-example)
- 📣 [Event Publishing](#event-publishing)
  - [Publishing Events](#publishing-events)
  - [Event Data](#event-data)
  - [Complete Publishing Example](#complete-publishing-example)
- 🔄 [Asynchronous Events](#asynchronous-events)
  - [Async Handlers](#async-handlers)
  - [Waiting for Events](#waiting-for-events)
  - [Complete Async Example](#complete-async-example)
- 📚 [Event History](#event-history)
  - [Retrieving History](#retrieving-history)
  - [Filtering Events](#filtering-events)
  - [Complete History Example](#complete-history-example)
- 💾 [Event Storage](#event-storage)
  - [Memory Store](#memory-store)
  - [Custom Stores](#custom-stores)
  - [Complete Store Example](#complete-store-example)
- 🚀 [Complete Integration Example](#complete-integration-example)
- 💡 [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @voilajs/appkit
```

### Basic Import

```javascript
import {
  subscribe,
  unsubscribe,
  publish,
  getEventHistory,
  clearEventHistory,
} from '@voilajs/appkit/events';
```

## Event Subscription

The subscription utilities allow components to listen for specific events.

### Basic Subscription

Use `subscribe` to register event handlers:

```javascript
import { subscribe } from '@voilajs/appkit/events';

// Subscribe to a specific event
const unsubscribe = subscribe('user:login', (userData) => {
  console.log(`User logged in: ${userData.username}`);
});

// Subscribe to all events with wildcard
subscribe('*', ({ event, data }) => {
  console.log(`Event occurred: ${event}`, data);
});
```

**Expected Output:**

```
// When 'user:login' event is published
User logged in: john_doe

// When any event is published (via wildcard)
Event occurred: user:login { username: 'john_doe', timestamp: 2023-06-15T14:30:00.000Z }
```

**When to use:**

- **Component Communication**: When different parts of your application need to
  communicate
- **UI Updates**: To update different UI components when data changes
- **Event Logging**: For logging or monitoring system events
- **Decoupled Architecture**: To maintain separation between components

### Unsubscribing

To clean up subscriptions and prevent memory leaks:

```javascript
import { subscribe, unsubscribe } from '@voilajs/appkit/events';

// Method 1: Using the returned unsubscribe function
const unsubscribe = subscribe('notification:new', handleNotification);
// Later, when done
unsubscribe();

// Method 2: Using explicit unsubscribe
function handleUserUpdate(data) {
  console.log('User updated:', data);
}

subscribe('user:updated', handleUserUpdate);
// Later, when done
unsubscribe('user:updated', handleUserUpdate);
```

**When to use:**

- **Component Unmounting**: When UI components are removed
- **Feature Toggles**: When temporarily disabling features
- **Cleanup**: When closing or resetting parts of your application
- **Dynamic Subscribers**: When subscribers change frequently

### Complete Subscription Example

Here's a real-world example with multiple subscriptions:

```javascript
import { subscribe } from '@voilajs/appkit/events';

// Set up notification handlers
function setupNotifications() {
  // Store unsubscribe functions
  const cleanup = [];

  // Subscribe to different notification types
  cleanup.push(
    subscribe('notification:info', (data) => {
      showInfoNotification(data.message);
    })
  );

  cleanup.push(
    subscribe('notification:error', (data) => {
      showErrorNotification(data.message, data.details);
    })
  );

  cleanup.push(
    subscribe('notification:success', (data) => {
      showSuccessNotification(data.message);
    })
  );

  // Return a single cleanup function
  return () => cleanup.forEach((unsubscribe) => unsubscribe());
}

// Use in an application
const unsubscribeAll = setupNotifications();

// Later, when shutting down
unsubscribeAll();
```

**When to implement:**

- **Notification Systems**: For displaying different types of alerts
- **Multi-channel Communication**: When listening to various event sources
- **Feature Modules**: When initializing self-contained application modules
- **Testing**: For intercepting and verifying events during tests

## Event Publishing

Event publishing allows components to broadcast events to all interested
subscribers.

### Publishing Events

Use `publish` to emit events:

```javascript
import { publish } from '@voilajs/appkit/events';

// Publish a simple event
publish('app:initialized');

// Publish an event with data
publish('user:created', {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
});
```

**When to use:**

- **State Changes**: When important application state changes
- **User Actions**: In response to user interactions
- **System Events**: For lifecycle events (startup, shutdown)
- **Async Operations**: When async operations complete

### Event Data

Event data can be any JavaScript value:

```javascript
// Object data (most common)
publish('product:added', {
  id: 'prod-123',
  name: 'Wireless Headphones',
  price: 79.99,
});

// Array data
publish('tags:updated', ['javascript', 'node', 'event-driven']);

// Primitive data
publish('count:changed', 42);
```

**Best practices for event data:**

- Keep event data small and focused
- Include IDs for entity references
- Include timestamps for time-sensitive events
- Make data immutable (don't modify after publishing)

### Complete Publishing Example

Here's a practical example of event-driven user actions:

```javascript
import { publish } from '@voilajs/appkit/events';

// User service with events
const userService = {
  async createUser(userData) {
    try {
      // Create user logic...
      const newUser = await db.createUser(userData);

      // Publish success event
      publish('user:created', {
        id: newUser.id,
        name: newUser.name,
        timestamp: new Date(),
      });

      return newUser;
    } catch (error) {
      // Publish error event
      publish('user:error', {
        action: 'create',
        error: error.message,
        timestamp: new Date(),
      });

      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      // Delete user logic...
      await db.deleteUser(userId);

      // Publish deletion event
      publish('user:deleted', {
        id: userId,
        timestamp: new Date(),
      });
    } catch (error) {
      // Publish error event
      publish('user:error', {
        action: 'delete',
        userId,
        error: error.message,
        timestamp: new Date(),
      });

      throw error;
    }
  },
};
```

**When to implement:**

- **Service Modules**: For domain services that need to notify about changes
- **API Endpoints**: To broadcast changes from API actions
- **Form Submissions**: To notify about user-submitted data
- **Background Tasks**: For notifying about background operation results

## Asynchronous Events

The module supports asynchronous event handling for non-blocking operations.

### Async Handlers

Use `subscribeAsync` for handlers that perform async operations:

```javascript
import { subscribeAsync } from '@voilajs/appkit/events';

// Subscribe with an async handler
subscribeAsync('data:received', async (data) => {
  // Process data asynchronously
  await processData(data);

  // Save to database
  await saveToDatabase(data);

  console.log('Data processing complete');
});
```

**When to use:**

- **Database Operations**: When handlers need to read/write to databases
- **API Requests**: When handlers make network requests
- **File Operations**: When handlers need to read/write files
- **Heavy Processing**: For CPU-intensive operations that shouldn't block

### Waiting for Events

Use `waitForEvent` to convert event-based code to promise-based:

```javascript
import { publish, waitForEvent } from '@voilajs/appkit/events';

async function processUserLogin(credentials) {
  // Start the login process
  startLoginProcess(credentials);

  try {
    // Wait for login completion event (with timeout)
    const result = await waitForEvent('auth:login-complete', {
      timeout: 5000,
      filter: (data) => data.username === credentials.username,
    });

    console.log('Login successful:', result);
    return result;
  } catch (error) {
    console.error('Login timeout or error');
    throw new Error('Login failed or timed out');
  }
}
```

**When to use:**

- **Sequential Operations**: When you need to wait for an event before
  continuing
- **Testing**: To make event-based code testable with async/await
- **Timeouts**: When you need timeout behavior for events
- **Event Coordination**: For coordinating between different async processes

### Complete Async Example

Here's a complete example with async processing:

```javascript
import { publish, subscribeAsync, waitForEvent } from '@voilajs/appkit/events';

// Setup async processor
function setupImageProcessor() {
  // Process images when uploaded
  subscribeAsync('image:uploaded', async (image) => {
    try {
      // Resize the image
      const resizedImage = await resizeImage(image);

      // Publish completion event
      publish('image:processed', {
        id: image.id,
        url: resizedImage.url,
        dimensions: resizedImage.dimensions,
      });
    } catch (error) {
      // Publish error event
      publish('image:process-error', {
        id: image.id,
        error: error.message,
      });
    }
  });
}

// Use in image upload flow
async function uploadAndProcessImage(file) {
  // Generate image ID
  const imageId = generateId();

  // Upload the image
  publish('image:uploaded', {
    id: imageId,
    data: file,
    uploadedAt: new Date(),
  });

  try {
    // Wait for processing to complete
    const processedImage = await waitForEvent('image:processed', {
      timeout: 10000,
      filter: (result) => result.id === imageId,
    });

    return processedImage;
  } catch (error) {
    throw new Error('Image processing failed or timed out');
  }
}
```

**When to implement:**

- **Media Processing**: For handling image/video uploads and processing
- **Data Import/Export**: For long-running data operations
- **Batch Processing**: For processing items in batches
- **Workflow Systems**: For multi-step asynchronous workflows

## Event History

Event history allows you to track and query past events.

### Retrieving History

Use `getEventHistory` to access past events:

```javascript
import { getEventHistory } from '@voilajs/appkit/events';

// Get all events
const allEvents = getEventHistory();
console.log(`Total events: ${allEvents.length}`);

// Get recent user events
const userEvents = getEventHistory({
  event: 'user:login',
  limit: 10,
});
console.log(`Recent logins: ${userEvents.length}`);
```

**When to use:**

- **Debugging**: To understand the sequence of events
- **Auditing**: For tracking user actions
- **Analytics**: To analyze event patterns
- **Recovery**: To reconstruct state after errors

### Filtering Events

Filter events by type, date range, or custom criteria:

```javascript
import { getEventHistory } from '@voilajs/appkit/events';

// Events from the last hour
const recentEvents = getEventHistory({
  since: new Date(Date.now() - 60 * 60 * 1000),
});

// Specific event type with limit
const lastOrders = getEventHistory({
  event: 'order:created',
  limit: 5,
});
```

**Filtering options:**

- `event`: Filter by exact event name
- `since`: Filter events after a specific date
- `limit`: Limit the number of events returned

### Complete History Example

Here's an example with event history for analytics:

```javascript
import { publish, getEventHistory } from '@voilajs/appkit/events';

// Track user actions
function trackUserAction(userId, action, details = {}) {
  publish('user:action', {
    userId,
    action,
    details,
    timestamp: new Date(),
  });
}

// Get user activity report
function getUserActivityReport(userId, since = null) {
  // Set default date range to last 7 days if not specified
  const sinceDate = since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get filtered events
  const events = getEventHistory({
    event: 'user:action',
    since: sinceDate,
  });

  // Filter for specific user
  const userEvents = events.filter((event) => event.data.userId === userId);

  // Group by action
  const actionCounts = {};
  userEvents.forEach((event) => {
    const action = event.data.action;
    actionCounts[action] = (actionCounts[action] || 0) + 1;
  });

  return {
    userId,
    period: {
      start: sinceDate,
      end: new Date(),
    },
    totalActions: userEvents.length,
    actionCounts,
    events: userEvents,
  };
}
```

**When to implement:**

- **User Activity Tracking**: For monitoring user behavior
- **System Diagnostics**: For capturing system activity
- **Error Analysis**: For capturing events leading up to errors
- **Reporting**: For generating activity reports

## Event Storage

The module provides flexible event storage options.

### Memory Store

The default `MemoryStore` keeps events in memory:

```javascript
import { MemoryStore } from '@voilajs/appkit/events';

// Create a custom memory store
const store = new MemoryStore({
  maxEvents: 5000, // Store up to 5000 events (default: 10000)
  maxEventSize: 512000, // Max 500KB per event (default: 1MB)
});
```

**Configuration options:**

- `maxEvents`: Maximum events to keep in memory
- `maxEventSize`: Maximum size of an event in bytes

### Custom Stores

Create custom stores by extending the `EventStore` base class:

```javascript
import { EventStore, setEventStore } from '@voilajs/appkit/events';

// Create a simple localStorage store for browser environments
class LocalStorageStore extends EventStore {
  constructor(options = {}) {
    super();
    this.storageKey = options.storageKey || 'app_events';
    this.maxEvents = options.maxEvents || 1000;
  }

  addEvent(event) {
    if (!this.validateEvent(event)) {
      throw new Error('Invalid event structure');
    }

    // Get current events
    const events = this.getEvents();

    // Add new event
    events.push(event);

    // Limit size
    const limitedEvents = events.slice(-this.maxEvents);

    // Save to localStorage
    localStorage.setItem(this.storageKey, JSON.stringify(limitedEvents));

    return event.id;
  }

  getEvents() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  clearEvents() {
    localStorage.removeItem(this.storageKey);
  }
}

// Use the custom store
const browserStore = new LocalStorageStore({
  storageKey: 'my_app_events',
  maxEvents: 500,
});

setEventStore(browserStore);
```

**When to create custom stores:**

- **Persistence**: To store events in databases or files
- **Remote Storage**: To send events to remote services
- **Filtering**: To filter or transform events before storage
- **Special Environments**: For platform-specific storage (browser, mobile)

### Complete Store Example

Here's a complete example with a custom store:

```javascript
import { EventStore, setEventStore } from '@voilajs/appkit/events';

// Create a store that keeps events in a database
class DbEventStore extends EventStore {
  constructor(options = {}) {
    super();
    this.db = options.db;
    this.collectionName = options.collection || 'events';
  }

  async addEvent(event) {
    if (!this.validateEvent(event)) {
      throw new Error('Invalid event structure');
    }

    // Insert event into database
    await this.db.collection(this.collectionName).insertOne(event);
    return event.id;
  }

  async getEvents() {
    // Retrieve all events from database
    return await this.db
      .collection(this.collectionName)
      .find({})
      .sort({ timestamp: 1 })
      .toArray();
  }

  async clearEvents() {
    // Clear all events
    await this.db.collection(this.collectionName).deleteMany({});
  }

  // Custom method for this store
  async getEventsByName(eventName) {
    return await this.db
      .collection(this.collectionName)
      .find({ event: eventName })
      .sort({ timestamp: 1 })
      .toArray();
  }
}

// Initialize with database connection
function initEventSystem(db) {
  const eventStore = new DbEventStore({
    db,
    collection: 'app_events',
  });

  setEventStore(eventStore);

  return {
    // Return public API
    subscribe,
    publish,
    getEventHistory,
  };
}
```

**When to implement:**

- **Production Applications**: For storing events in databases
- **Distributed Systems**: For sharing events between services
- **Audit Requirements**: When audit logs need persistence
- **High-throughput Systems**: For optimized event storage

## Complete Integration Example

Here's a simple but complete example showing the major features:

```javascript
import {
  subscribe,
  subscribeAsync,
  publish,
  getEventHistory,
  clearEventHistory,
} from '@voilajs/appkit/events';

// Initialize application with event-based architecture
function initApp() {
  // Set up event handlers
  const unsubscribers = [
    // Log all events
    subscribe('*', ({ event, data }) => {
      console.log(`[EVENT] ${event}`, data);
    }),

    // Handle user actions
    subscribe('user:login', (user) => {
      updateUIForLoggedInUser(user);
    }),

    subscribe('user:logout', () => {
      updateUIForLoggedOutUser();
    }),

    // Process data asynchronously
    subscribeAsync('data:import', async (importData) => {
      try {
        await processImportData(importData);
        publish('data:import-complete', { success: true });
      } catch (error) {
        publish('data:import-error', { error: error.message });
      }
    }),
  ];

  // Return app control methods
  return {
    // Method to start the app
    start() {
      publish('app:started', { timestamp: new Date() });
    },

    // Method to shut down the app
    shutdown() {
      // Unsubscribe all handlers
      unsubscribers.forEach((unsub) => unsub());

      // Publish shutdown event
      publish('app:shutdown', { timestamp: new Date() });

      // Generate final report
      const events = getEventHistory();
      console.log(`App shutting down. ${events.length} events occurred.`);

      // Clear history if needed
      clearEventHistory();
    },
  };
}

// Usage
const app = initApp();
app.start();

// Later when shutting down
app.shutdown();
```

**When to implement this comprehensive approach:**

- **Single-page Applications**: For managing application state and UI updates
- **Backend Services**: For loosely coupled service architecture
- **Workflow Applications**: For complex multi-step processes
- **Real-time Applications**: For responding to real-time events

## Best Practices

### 🔐 Security

- Don't store sensitive information in events that shouldn't be broadly
  accessible
- Validate event data before processing it
- Consider access control for historical events
- Be mindful of event retention policies for sensitive information

### 🏗️ Architecture

- Keep events granular and specific
- Use consistent naming patterns (`entity:action`)
- Design with failure tolerance in mind
- Consider using event schemas or types

### 🚀 Performance

- Keep event payloads small
- Unsubscribe handlers when they're no longer needed
- Use batch operations for high-volume events
- Be careful with wildcard subscribers that process all events

### 👥 User Experience

- Use events to update UI in response to data changes
- Consider debouncing frequent events
- Handle errors gracefully in event handlers
- Use events to coordinate complex workflows

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
