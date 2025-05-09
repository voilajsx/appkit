# Events Module

The events module provides a simple yet powerful event bus for implementing publish/subscribe patterns in your Node.js applications. It enables decoupled communication between different parts of your application through event-driven architecture.

## Table of Contents

- [What is Event-Driven Architecture?](#what-is-event-driven-architecture)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Publishers and Subscribers](#publishers-and-subscribers)
  - [Event Naming](#event-naming)
  - [Event History](#event-history)
- [Basic Usage](#basic-usage)
  - [Subscribing to Events](#subscribing-to-events)
  - [Publishing Events](#publishing-events)
  - [Unsubscribing](#unsubscribing)
- [Advanced Patterns](#advanced-patterns)
  - [Wildcard Subscriptions](#wildcard-subscriptions)
  - [Event Namespaces](#event-namespaces)
  - [Async Event Handlers](#async-event-handlers)
- [Event History](#event-history-1)
  - [Tracking Events](#tracking-events)
  - [Filtering History](#filtering-history)
  - [History Management](#history-management)
- [Common Use Cases](#common-use-cases)
  - [User Activity Tracking](#user-activity-tracking)
  - [Cache Invalidation](#cache-invalidation)
  - [Notifications](#notifications)
  - [Audit Logging](#audit-logging)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)
- [Performance Considerations](#performance-considerations)
- [Error Handling](#error-handling)
- [Troubleshooting](#troubleshooting)

## What is Event-Driven Architecture?

Event-driven architecture is a design pattern where components communicate by emitting and responding to events. Instead of direct function calls, components publish events when something happens, and other components subscribe to these events to react accordingly.

### Benefits

1. **Loose Coupling**: Components don't need to know about each other
2. **Scalability**: Easy to add new event handlers without modifying existing code
3. **Flexibility**: Can add/remove functionality by subscribing/unsubscribing
4. **Separation of Concerns**: Business logic is separated from side effects

### Example Scenario

```javascript
// Without events - tightly coupled
async function createUser(userData) {
  const user = await db.users.create(userData);
  await sendWelcomeEmail(user);
  await updateAnalytics('user.created', user);
  await notifyAdmins(user);
  return user;
}

// With events - loosely coupled
async function createUser(userData) {
  const user = await db.users.create(userData);
  publish('user:created', user);
  return user;
}

// Handlers can be added independently
subscribe('user:created', sendWelcomeEmail);
subscribe('user:created', updateAnalytics);
subscribe('user:created', notifyAdmins);
```

## Installation

```bash
npm install @voilajs/appkit
```

## Quick Start

```javascript
import { subscribe, publish } from '@voilajs/appkit/events';

// Subscribe to an event
const unsubscribe = subscribe('user:login', (data) => {
  console.log('User logged in:', data.userId);
});

// Publish an event
publish('user:login', { 
  userId: 123, 
  timestamp: new Date() 
});

// Clean up when done
unsubscribe();
```

## Core Concepts

### Publishers and Subscribers

- **Publishers**: Emit events when something happens
- **Subscribers**: Listen for events and react to them
- **Event Bus**: Manages the connections between publishers and subscribers

```javascript
// Publisher
function login(username, password) {
  const user = authenticate(username, password);
  publish('auth:login:success', { userId: user.id });
  return user;
}

// Subscriber
subscribe('auth:login:success', ({ userId }) => {
  console.log(`User ${userId} logged in`);
});
```

### Event Naming

Use consistent naming patterns for events:

```javascript
// Resource:action
'user:created'
'user:updated'
'user:deleted'

// Module:resource:action
'auth:session:created'
'payment:invoice:sent'

// Domain:status
'order:completed'
'subscription:expired'
```

### Event History

The module automatically tracks all published events, allowing you to:
- Debug event flows
- Analyze system behavior
- Implement audit logs

## Basic Usage

### Subscribing to Events

```javascript
import { subscribe } from '@voilajs/appkit/events';

// Basic subscription
subscribe('product:viewed', (data) => {
  console.log(`Product ${data.productId} viewed`);
});

// Multiple handlers for same event
subscribe('order:created', sendConfirmationEmail);
subscribe('order:created', updateInventory);
subscribe('order:created', notifyWarehouse);

// Store unsubscribe function
const unsubscribe = subscribe('user:updated', handleUserUpdate);

// Unsubscribe later
unsubscribe();
```

### Publishing Events

```javascript
import { publish } from '@voilajs/appkit/events';

// Simple event
publish('app:started', { version: '1.0.0' });

// Event with data
publish('user:registered', {
  userId: 123,
  email: 'user@example.com',
  plan: 'premium'
});

// Error event
publish('payment:failed', {
  orderId: 456,
  reason: 'Insufficient funds',
  amount: 99.99
});
```

### Unsubscribing

```javascript
import { subscribe, unsubscribe } from '@voilajs/appkit/events';

// Method 1: Use returned function
const unsub = subscribe('event:name', handler);
unsub(); // Unsubscribe

// Method 2: Use unsubscribe function
subscribe('event:name', handler);
unsubscribe('event:name', handler); // Must pass same handler reference

// Clean up all handlers on shutdown
const handlers = [];
handlers.push(subscribe('event1', handler1));
handlers.push(subscribe('event2', handler2));

process.on('SIGTERM', () => {
  handlers.forEach(unsub => unsub());
});
```

## Advanced Patterns

### Wildcard Subscriptions

Subscribe to all events using the wildcard pattern:

```javascript
// Listen to all events
subscribe('*', ({ event, data }) => {
  console.log(`Event: ${event}`, data);
  
  // Log to monitoring system
  monitor.track(event, data);
});

// Useful for:
// - Debugging
// - Logging
// - Analytics
// - Monitoring
```

### Event Namespaces

Organize events by domain or module:

```javascript
// User domain events
const userEvents = {
  created: 'user:created',
  updated: 'user:updated',
  deleted: 'user:deleted',
  login: 'user:login',
  logout: 'user:logout'
};

// Order domain events
const orderEvents = {
  created: 'order:created',
  paid: 'order:paid',
  shipped: 'order:shipped',
  delivered: 'order:delivered',
  cancelled: 'order:cancelled'
};

// Subscribe to all user events
Object.values(userEvents).forEach(event => {
  subscribe(event, (data) => {
    auditLog.record(event, data);
  });
});
```

### Async Event Handlers

Handle asynchronous operations in event handlers:

```javascript
// Async handler
subscribe('image:uploaded', async (data) => {
  try {
    // Generate thumbnails
    await generateThumbnails(data.imageId);
    
    // Update metadata
    await updateImageMetadata(data.imageId);
    
    // Notify completion
    publish('image:processed', { imageId: data.imageId });
  } catch (error) {
    publish('image:processing:failed', { 
      imageId: data.imageId, 
      error: error.message 
    });
  }
});

// Chain events
subscribe('order:paid', async (order) => {
  await processPayment(order);
  publish('order:processing', order);
});

subscribe('order:processing', async (order) => {
  await allocateInventory(order);
  publish('order:ready', order);
});
```

## Event History

### Tracking Events

All published events are automatically stored in memory:

```javascript
import { getEventHistory } from '@voilajs/appkit/events';

// Get all events
const history = getEventHistory();
console.log(`Total events: ${history.length}`);

// Each event record contains:
// {
//   id: 'unique-event-id',
//   event: 'event:name',
//   data: { ... },
//   timestamp: Date
// }
```

### Filtering History

```javascript
import { getEventHistory } from '@voilajs/appkit/events';

// Filter by event name
const userEvents = getEventHistory({ 
  event: 'user:created' 
});

// Filter by time
const recentEvents = getEventHistory({ 
  since: new Date(Date.now() - 3600000) // Last hour
});

// Combine filters
const recentUserEvents = getEventHistory({
  event: 'user:created',
  since: new Date('2024-01-01')
});
```

### History Management

```javascript
import { clearEventHistory, getEventHistory } from '@voilajs/appkit/events';

// Monitor history size
setInterval(() => {
  const history = getEventHistory();
  if (history.length > 10000) {
    console.warn('Event history growing large');
    // Keep only recent events
    const cutoff = new Date(Date.now() - 86400000); // 24 hours
    const recentEvents = getEventHistory({ since: cutoff });
    clearEventHistory();
    // Re-publish recent events if needed
  }
}, 3600000); // Check every hour

// Clear history on demand
app.post('/admin/clear-events', (req, res) => {
  clearEventHistory();
  res.json({ message: 'Event history cleared' });
});
```

## Common Use Cases

### User Activity Tracking

```javascript
// Track user activities
const activities = [
  'user:login',
  'user:logout',
  'user:profile:viewed',
  'user:profile:updated',
  'user:password:changed'
];

activities.forEach(event => {
  subscribe(event, async (data) => {
    await db.activities.create({
      userId: data.userId,
      event,
      data,
      timestamp: new Date()
    });
  });
});

// Track page views
subscribe('page:viewed', ({ userId, page, referrer }) => {
  analytics.pageView(userId, page, referrer);
});

// Session tracking
subscribe('user:login', ({ userId }) => {
  sessions.create(userId);
});

subscribe('user:logout', ({ userId }) => {
  sessions.end(userId);
});
```

### Cache Invalidation

```javascript
// Invalidate cache on data changes
subscribe('product:updated', async ({ productId }) => {
  await cache.delete(`product:${productId}`);
  await cache.delete(`product:${productId}:reviews`);
  await cache.deletePattern(`category:*:products`);
});

subscribe('user:profile:updated', async ({ userId }) => {
  await cache.delete(`user:${userId}`);
  await cache.delete(`user:${userId}:profile`);
  await cache.delete(`user:${userId}:preferences`);
});

// Invalidate related caches
subscribe('order:completed', async ({ orderId, userId }) => {
  await cache.delete(`user:${userId}:orders`);
  await cache.delete(`order:${orderId}`);
  await cache.delete(`user:${userId}:stats`);
});
```

### Notifications

```javascript
// Email notifications
subscribe('user:created', async (user) => {
  await emailService.send({
    to: user.email,
    template: 'welcome',
    data: user
  });
});

subscribe('order:shipped', async (order) => {
  await emailService.send({
    to: order.customerEmail,
    template: 'order-shipped',
    data: order
  });
});

// Push notifications
subscribe('message:received', async ({ userId, message }) => {
  await pushService.notify(userId, {
    title: 'New Message',
    body: message.preview,
    data: { messageId: message.id }
  });
});

// SMS notifications
subscribe('appointment:reminder', async (appointment) => {
  await smsService.send({
    to: appointment.phoneNumber,
    message: `Reminder: Your appointment is tomorrow at ${appointment.time}`
  });
});
```

### Audit Logging

```javascript
// Audit all data changes
const auditEvents = [
  'user:created',
  'user:updated',
  'user:deleted',
  'role:assigned',
  'permission:granted',
  'data:exported'
];

auditEvents.forEach(event => {
  subscribe(event, async (data) => {
    await db.auditLogs.create({
      event,
      actor: data.actorId || 'system',
      subject: data.subjectId,
      changes: data.changes,
      metadata: data,
      timestamp: new Date(),
      ip: data.ip,
      userAgent: data.userAgent
    });
  });
});

// Compliance tracking
subscribe('user:data:accessed', async ({ userId, accessedBy, reason }) => {
  await complianceLog.record({
    event: 'data_access',
    subject: userId,
    accessor: accessedBy,
    reason,
    timestamp: new Date()
  });
});
```

## Best Practices

### 1. Event Naming Conventions

```javascript
// Use consistent patterns
const EVENT_PATTERNS = {
  // Resource lifecycle
  created: (resource) => `${resource}:created`,
  updated: (resource) => `${resource}:updated`, 
  deleted: (resource) => `${resource}:deleted`,
  
  // State changes
  status: (resource, status) => `${resource}:${status}`,
  
  // Actions
  action: (resource, action) => `${resource}:${action}`,
  
  // Errors
  error: (resource, action) => `${resource}:${action}:failed`
};

// Usage
publish(EVENT_PATTERNS.created('user'), userData);
publish(EVENT_PATTERNS.status('order', 'shipped'), orderData);
publish(EVENT_PATTERNS.error('payment', 'process'), errorData);
```

### 2. Event Data Structure

```javascript
// Include essential information
publish('order:created', {
  // Identifiers
  orderId: order.id,
  userId: order.userId,
  
  // Timestamps
  createdAt: new Date(),
  
  // Relevant data (avoid sensitive info)
  total: order.total,
  itemCount: order.items.length,
  
  // Context
  source: 'web',
  version: '2.0'
});

// Avoid including sensitive data
// Bad: publish('user:created', { password: '...' })
// Good: publish('user:created', { userId: user.id })
```

### 3. Error Handling

```javascript
// Wrap handlers in try-catch
subscribe('risky:operation', async (data) => {
  try {
    await riskyOperation(data);
  } catch (error) {
    console.error('Handler failed:', error);
    
    // Publish error event
    publish('risky:operation:failed', {
      originalData: data,
      error: error.message,
      stack: error.stack
    });
  }
});

// Global error handler
subscribe('*', ({ event, data }) => {
  try {
    // Global logging/monitoring
  } catch (error) {
    console.error(`Global handler failed for ${event}:`, error);
  }
});
```

### 4. Memory Management

```javascript
// Store references to unsubscribe functions
class EventManager {
  constructor() {
    this.subscriptions = [];
  }
  
  subscribe(event, handler) {
    const unsubscribe = subscribe(event, handler);
    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  }
  
  cleanup() {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
  }
}

// Clean up on application shutdown
const eventManager = new EventManager();

process.on('SIGTERM', () => {
  eventManager.cleanup();
  process.exit(0);
});
```

### 5. Testing Events

```javascript
import { subscribe, publish, clearEventHistory } from '@voilajs/appkit/events';

describe('User Events', () => {
  beforeEach(() => {
    clearEventHistory();
  });
  
  test('publishes user:created on registration', async () => {
    const handler = jest.fn();
    subscribe('user:created', handler);
    
    await userService.register({
      email: 'test@example.com',
      password: 'password'
    });
    
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com'
      })
    );
  });
});
```

## API Reference

### Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `subscribe(event, callback)` | Subscribe to an event | `event: string`, `callback: Function` | `Function` (unsubscribe) |
| `unsubscribe(event, callback)` | Unsubscribe from an event | `event: string`, `callback: Function` | `void` |
| `publish(event, data)` | Publish an event | `event: string`, `data: any` | `void` |
| `getEventHistory(filters?)` | Get event history | `filters?: {event?: string, since?: Date}` | `Array<Object>` |
| `clearEventHistory()` | Clear event history | None | `void` |

### Event Record Structure

```javascript
{
  id: string,          // Unique event identifier
  event: string,       // Event name
  data: any,          // Event data
  timestamp: Date     // When the event occurred
}
```

## Performance Considerations

### Memory Usage

```javascript
// Event history is stored in memory
// Default limit: 10,000 events
// Each event: ~100-500 bytes
// Total memory: ~1-5 MB

// Monitor memory usage
setInterval(() => {
  const history = getEventHistory();
  const memoryUsage = process.memoryUsage();
  
  console.log({
    eventCount: history.length,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
  });
}, 60000);
```

### Performance Tips

1. **Keep event data small**: Don't pass large objects
2. **Avoid blocking operations**: Use async handlers
3. **Limit history size**: Clear old events periodically
4. **Batch operations**: Group related events when possible

```javascript
// Bad: Large data in events
publish('file:uploaded', { 
  content: largeFileBuffer // Don't do this
});

// Good: Reference to data
publish('file:uploaded', { 
  fileId: 'abc123',
  size: file.size,
  type: file.type
});
```

## Error Handling

Event handlers are automatically wrapped in try-catch blocks:

```javascript
// Errors in handlers are caught
subscribe('test:event', () => {
  throw new Error('Handler error');
});

// Doesn't crash the application
publish('test:event', {}); // Error is logged

// Access error events
subscribe('*', ({ event, data }) => {
  try {
    // Your handler
  } catch (error) {
    // Publish error event
    publish('handler:error', {
      originalEvent: event,
      error: error.message
    });
  }
});
```

## Troubleshooting

### Common Issues

1. **Handler not being called**
```javascript
// Check event name matches exactly
subscribe('user:created', handler);  // lowercase
publish('User:Created', data);       // Won't trigger!

// Check handler reference
const handler = () => console.log('called');
subscribe('event', handler);
unsubscribe('event', () => console.log('called')); // Different reference!
```

2. **Memory leaks**
```javascript
// Forgetting to unsubscribe
function component() {
  subscribe('event', () => {
    // Handler
  });
  // Memory leak - subscription persists!
}

// Correct approach
function component() {
  const unsubscribe = subscribe('event', () => {
    // Handler
  });
  
  // Cleanup
  return () => unsubscribe();
}
```

3. **Event history growing too large**
```javascript
// Implement automatic cleanup
setInterval(() => {
  const history = getEventHistory();
  if (history.length > 5000) {
    // Keep only recent events
    const recentEvents = getEventHistory({
      since: new Date(Date.now() - 3600000) // Last hour
    });
    
    clearEventHistory();
    // Optionally republish recent critical events
  }
}, 300000); // Every 5 minutes
```

### Debug Mode

```javascript
// Enable debug logging
if (process.env.NODE_ENV === 'development') {
  subscribe('*', ({ event, data }) => {
    console.log(`[EVENT] ${event}`, data);
  });
}

// Track handler execution time
function timedHandler(handler) {
  return (data) => {
    const start = performance.now();
    const result = handler(data);
    const duration = performance.now() - start;
    
    if (duration > 100) {
      console.warn(`Slow handler: ${duration}ms`);
    }
    
    return result;
  };
}

subscribe('heavy:task', timedHandler(heavyHandler));
```

## Support

For issues and feature requests, visit our [GitHub repository](https://github.com/voilajs/appkit).