# @voilajsx/appkit - Event Module 🚀

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple event-driven architecture that just works with automatic
> Redis/Memory strategy

**One function** returns an event system with automatic Redis detection. Zero
configuration needed, production-ready distribution by default, with built-in
wildcard patterns and event history.

## 🚀 Why Choose This?

- **⚡ One Function** - Just `eventing.get()`, everything else is automatic
- **🔄 Auto Strategy** - REDIS_URL → Distributed, No Redis → Memory
- **🔧 Zero Configuration** - Smart defaults for everything
- **🌟 Wildcard Events** - Listen to `user.*` patterns automatically
- **📚 Event History** - Built-in replay and debugging
- **⚖️ Scales Perfectly** - Development → Production with no code changes
- **🤖 AI-Ready** - Optimized for LLM code generation

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

### Basic Events (Memory Strategy)

```typescript
import { eventing } from '@voilajsx/appkit/event';

const events = eventing.get();

// Listen to events
events.on('user.signup', (data) => {
  console.log('New user:', data.email);
});

// Emit events
await events.emit('user.signup', {
  email: 'john@example.com',
  userId: 123,
});
```

### Distributed Events (Redis Strategy)

```bash
# Just set Redis URL - everything else is automatic
REDIS_URL=redis://localhost:6379
```

```typescript
import { eventing } from '@voilajsx/appkit/event';

const events = eventing.get();

// Same code - now distributed across all servers!
events.on('order.completed', (data) => {
  console.log('Order completed:', data.orderId);
});

await events.emit('order.completed', {
  orderId: 'order-123',
  amount: 99.99,
});
```

**That's it!** Events automatically work across all your servers.

## 🧠 Mental Model

### **Strategy Auto-Detection**

This is the core innovation. Environment variables determine strategy:

```bash
# Development/Single Server
# (no Redis URL)
→ Memory Strategy: Fast local events

# Production/Multi-Server
REDIS_URL=redis://localhost:6379
→ Redis Strategy: Distributed events across all servers
```

### **Namespace Isolation**

```typescript
// Different parts of your app can use separate event channels
const userEvents = eventing.get('users'); // users:*
const orderEvents = eventing.get('orders'); // orders:*
const emailEvents = eventing.get('emails'); // emails:*

// Events don't interfere with each other
userEvents.emit('created', data); // → users:created
orderEvents.emit('created', data); // → orders:created
```

## 📖 Complete API Reference

### Core Function

```typescript
const events = eventing.get(namespace?); // One function, everything you need
```

### Event Methods

```typescript
// Listen to events
events.on('event.name', (data) => {
  /* handler */
});
events.once('event.name', (data) => {
  /* one-time handler */
});

// Emit events
await events.emit('event.name', { key: 'value' });
await events.emitBatch([
  { event: 'user.created', data: { userId: 1 } },
  { event: 'user.created', data: { userId: 2 } },
]);

// Remove listeners
events.off('event.name'); // Remove all listeners
events.off('event.name', handler); // Remove specific listener

// Wildcard patterns
events.on('user.*', (eventName, data) => {
  console.log(`User event: ${eventName}`, data);
});
```

### Utility Methods

```typescript
// Get event history for debugging
const history = await events.history('user.created', 10); // Last 10 events

// Get current listeners
const listeners = events.getListeners('user.*');

// Get strategy info
const strategy = events.getStrategy(); // 'redis' or 'memory'
const config = events.getConfig();

// Cleanup
await events.disconnect();
```

### Global Methods

```typescript
// System-wide operations
eventing.getStrategy(); // Current strategy
eventing.getActiveNamespaces(); // All active namespaces
eventing.hasRedis(); // Check if Redis available

// Broadcast to all namespaces (use sparingly)
await eventing.broadcast('system.shutdown');

// Cleanup for testing
await eventing.clear();
await eventing.reset(newConfig);
```

## 🎯 Usage Examples

### **Express API with Events**

```typescript
import express from 'express';
import { eventing } from '@voilajsx/appkit/event';

const app = express();
const events = eventing.get('api');

// Listen to user events
events.on('user.created', async (user) => {
  console.log('📧 Sending welcome email to:', user.email);
  await sendWelcomeEmail(user);
});

events.on('user.*', (eventName, data) => {
  console.log(`👤 User event: ${eventName}`, data);
});

// User registration endpoint
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Create user
    const user = await createUser({ email, password });

    // Emit event - triggers welcome email automatically
    await events.emit('user.created', {
      userId: user.id,
      email: user.email,
      source: 'registration',
    });

    res.json({ success: true, userId: user.id });
  } catch (error) {
    await events.emit('user.registration.failed', {
      email,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 Server started with events:', events.getStrategy());
});
```

### **Microservices Communication**

```typescript
// User Service
import { eventing } from '@voilajsx/appkit/event';

const userEvents = eventing.get('users');

export class UserService {
  async createUser(userData) {
    const user = await this.db.create(userData);

    // Notify other services
    await userEvents.emit('user.created', {
      userId: user.id,
      email: user.email,
      plan: user.plan,
      createdAt: user.createdAt,
    });

    return user;
  }
}
```

```typescript
// Email Service (separate server/container)
import { eventing } from '@voilajsx/appkit/event';

const emailEvents = eventing.get('emails');
const userEvents = eventing.get('users'); // Same namespace, distributed

// Listen to user events from User Service
userEvents.on('user.created', async (userData) => {
  await emailEvents.emit('send.welcome', {
    to: userData.email,
    userId: userData.userId,
    plan: userData.plan,
  });
});

// Process email queue
emailEvents.on('send.*', async (eventName, emailData) => {
  const emailType = eventName.split('.')[1]; // 'welcome', 'reset', etc.
  await sendEmail(emailType, emailData);
});
```

### **Real-time Features**

```typescript
import { eventing } from '@voilajsx/appkit/event';

const chatEvents = eventing.get('chat');
const notificationEvents = eventing.get('notifications');

// Chat message handling
chatEvents.on('message.sent', async (message) => {
  // Store message
  await saveMessage(message);

  // Notify all room participants
  await notificationEvents.emit('room.activity', {
    roomId: message.roomId,
    type: 'new_message',
    userId: message.userId,
    preview: message.text.slice(0, 50),
  });
});

// Real-time notifications
notificationEvents.on('room.*', (eventName, data) => {
  // Send to WebSocket clients
  io.to(`room-${data.roomId}`).emit('notification', {
    type: eventName,
    data,
  });
});

// Typing indicators
chatEvents.on('user.typing', (data) => {
  // Broadcast to room (excluding sender)
  io.to(`room-${data.roomId}`).except(data.socketId).emit('typing', {
    userId: data.userId,
    isTyping: data.isTyping,
  });
});
```

### **Background Jobs & Queues**

```typescript
import { eventing } from '@voilajsx/appkit/event';

const jobEvents = eventing.get('jobs');

// Job processor
class JobProcessor {
  constructor() {
    // Listen to different job types
    jobEvents.on('job.email.*', this.processEmailJob.bind(this));
    jobEvents.on('job.image.*', this.processImageJob.bind(this));
    jobEvents.on('job.report.*', this.processReportJob.bind(this));
  }

  async processEmailJob(eventName, jobData) {
    const jobType = eventName.split('.')[2]; // 'welcome', 'reset', etc.

    try {
      await this.sendEmail(jobType, jobData);
      await jobEvents.emit('job.completed', {
        jobId: jobData.jobId,
        type: 'email',
        completedAt: new Date().toISOString(),
      });
    } catch (error) {
      await jobEvents.emit('job.failed', {
        jobId: jobData.jobId,
        error: error.message,
        retryCount: jobData.retryCount || 0,
      });
    }
  }
}

// Job scheduler
export async function scheduleEmail(type, data) {
  await jobEvents.emit(`job.email.${type}`, {
    jobId: crypto.randomUUID(),
    type,
    data,
    scheduledAt: new Date().toISOString(),
  });
}

// Usage
await scheduleEmail('welcome', {
  email: 'user@example.com',
  name: 'John',
});
```

### **Event Debugging & Monitoring**

```typescript
import { eventing } from '@voilajsx/appkit/event';

// Debug helper
function setupEventDebugging() {
  const events = eventing.get('debug');

  // Log all events in development
  if (process.env.NODE_ENV === 'development') {
    events.on('*', (eventName, data) => {
      console.log(`🔍 [DEBUG] Event: ${eventName}`, {
        data,
        timestamp: new Date().toISOString(),
        namespace: 'debug',
      });
    });
  }

  // Monitor system events
  events.on('system.*', (eventName, data) => {
    console.log(`⚡ [SYSTEM] ${eventName}:`, data);
  });
}

// Health check endpoint
app.get('/health/events', (req, res) => {
  const stats = eventing.getStats();
  const config = eventing.getConfig();

  res.json({
    status: 'healthy',
    strategy: config.strategy,
    activeNamespaces: config.activeNamespaces,
    totalListeners: stats.totalListeners,
    connected: stats.connected,
    redis: eventing.hasRedis(),
  });
});

// Event replay for debugging
app.get('/admin/events/:namespace/history', async (req, res) => {
  const { namespace } = req.params;
  const { event, limit = 50 } = req.query;

  const events = eventing.get(namespace);
  const history = await events.history(event, parseInt(limit));

  res.json({
    namespace,
    event: event || 'all',
    count: history.length,
    events: history,
  });
});
```

## 🌍 Environment Variables

### Basic Configuration

```bash
# Strategy selection (auto-detected)
REDIS_URL=redis://localhost:6379        # Enables Redis strategy
# No REDIS_URL = Memory strategy

# Service identification
VOILA_SERVICE_NAME=my-app               # Used in namespacing
VOILA_EVENT_NAMESPACE=production        # Custom namespace

# Event history
VOILA_EVENT_HISTORY_ENABLED=true       # Default: true
VOILA_EVENT_HISTORY_SIZE=100           # Default: 100
```

### Redis Configuration (Advanced)

```bash
# Redis connection
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Redis event settings
VOILA_EVENT_REDIS_RETRIES=3            # Default: 3
VOILA_EVENT_REDIS_RETRY_DELAY=1000     # Default: 1000ms
VOILA_EVENT_REDIS_CONNECT_TIMEOUT=10000 # Default: 10s
VOILA_EVENT_REDIS_COMMAND_TIMEOUT=5000  # Default: 5s
VOILA_EVENT_REDIS_PREFIX=events        # Default: events
```

### Memory Configuration (Advanced)

```bash
# Memory strategy settings
VOILA_EVENT_MEMORY_MAX_LISTENERS=1000  # Default: 1000
VOILA_EVENT_MEMORY_HISTORY=100         # Default: 100
VOILA_EVENT_MEMORY_CHECK_INTERVAL=30000 # Default: 30s
VOILA_EVENT_MEMORY_GC=true             # Default: true
```

## 🎨 Event Patterns

### **Naming Conventions**

```typescript
// ✅ Good event names
'user.created'; // entity.action
'order.payment.failed'; // entity.context.action
'email.sent'; // service.action
'notification.push.delivered'; // service.type.action

// ❌ Avoid these patterns
'userCreated'; // Use dots for hierarchy
'USER_CREATED'; // Use lowercase
'created'; // Too generic
'user-created'; // Use dots, not dashes
```

### **Wildcard Patterns**

```typescript
// Listen to patterns
events.on('user.*', handler);          // All user events
events.on('*.created', handler);       // All creation events
events.on('order.*.failed', handler);  // All order failures

// Event hierarchy examples
'user.created'           → Matches: user.*
'user.updated.profile'   → Matches: user.*, user.updated.*
'order.payment.failed'   → Matches: order.*, order.payment.*, *.failed
```

### **Data Structure Conventions**

```typescript
// ✅ Good event data structure
await events.emit('user.created', {
  // Always include entity ID
  userId: 123,

  // Include relevant entity data
  email: 'user@example.com',
  plan: 'premium',

  // Include context
  source: 'registration',
  ip: '192.168.1.1',

  // Include timing
  createdAt: new Date().toISOString(),
});

// ✅ Good error event structure
await events.emit('payment.failed', {
  paymentId: 'pay_123',
  userId: 456,
  amount: 99.99,
  currency: 'USD',

  // Error details
  error: {
    code: 'CARD_DECLINED',
    message: 'Insufficient funds',
    provider: 'stripe',
  },

  // Context for retry logic
  attempt: 1,
  maxAttempts: 3,
  nextRetry: new Date(Date.now() + 5000).toISOString(),
});
```

## 🔄 Development vs Production

### **Development Mode**

```bash
# No Redis URL = Memory strategy
NODE_ENV=development
```

```typescript
// Fast local events, detailed logging
const events = eventing.get();
await events.emit('test.event', { data: 'value' });
// ✅ [AppKit] Event emitted: test.event { data: 'value' }
```

### **Production Mode**

```bash
# Redis URL = Distributed strategy
NODE_ENV=production
REDIS_URL=redis://production-redis:6379
```

```typescript
// Same code - now distributed across all servers
const events = eventing.get();
await events.emit('test.event', { data: 'value' });
// Events work across all server instances automatically
```

### **Scaling Pattern**

```typescript
// Week 1: Single server with memory events
const events = eventing.get();

// Month 1: Add Redis - zero code changes
// Just set REDIS_URL environment variable
// All events now distributed across servers

// Year 1: Multiple services - same simple API
const userEvents = eventing.get('users');
const orderEvents = eventing.get('orders');
// Each service can have isolated event channels
```

## 🧪 Testing

### **Test Setup**

```typescript
import { eventing } from '@voilajsx/appkit/event';

describe('User Events', () => {
  afterEach(async () => {
    // IMPORTANT: Clear event state between tests
    await eventing.clear();
  });

  test('should emit user creation event', async () => {
    const events = eventing.get('test');

    // Setup listener
    const received = [];
    events.on('user.created', (data) => {
      received.push(data);
    });

    // Emit event
    await events.emit('user.created', { userId: 123 });

    // Verify
    expect(received).toHaveLength(1);
    expect(received[0].userId).toBe(123);
  });

  test('should handle wildcard patterns', async () => {
    const events = eventing.get('test');

    const received = [];
    events.on('user.*', (eventName, data) => {
      received.push({ eventName, data });
    });

    await events.emit('user.created', { userId: 1 });
    await events.emit('user.updated', { userId: 1 });

    expect(received).toHaveLength(2);
    expect(received[0].eventName).toBe('user.created');
    expect(received[1].eventName).toBe('user.updated');
  });
});
```

### **Mock Redis for Testing**

```typescript
// Test with memory strategy even if Redis is configured
describe('Events with Memory Strategy', () => {
  beforeEach(async () => {
    await eventing.reset({
      strategy: 'memory',
      namespace: 'test',
    });
  });

  test('should work with memory strategy', async () => {
    const events = eventing.get('test');
    expect(events.getStrategy()).toBe('memory');
    // ... test logic
  });
});
```

## 🤖 LLM Guidelines

### **Essential Patterns**

```typescript
// ✅ ALWAYS use these patterns
import { eventing } from '@voilajsx/appkit/event';
const events = eventing.get('namespace');

// ✅ Event listening
events.on('entity.action', (data) => {
  // Handle event
});

// ✅ Event emitting
await events.emit('entity.action', {
  entityId: 123,
  timestamp: new Date().toISOString(),
});

// ✅ Wildcard patterns
events.on('user.*', (eventName, data) => {
  console.log(`User event: ${eventName}`, data);
});

// ✅ One-time listeners
events.once('app.ready', () => {
  console.log('App is ready');
});

// ✅ Cleanup
events.off('event.name');
events.off('event.name', specificHandler);
```

### **Anti-Patterns to Avoid**

```typescript
// ❌ DON'T create EventClass directly
import { EventClass } from '@voilajsx/appkit/event';
const events = new EventClass(config, namespace); // Wrong!

// ❌ DON'T forget to handle async properly
events.emit('event', data); // Missing await!

// ❌ DON'T use bad event names
events.on('userCreated', handler); // Use dots: 'user.created'
events.on('USER_CREATED', handler); // Use lowercase
events.on('created', handler); // Too generic

// ❌ DON'T forget cleanup in tests
test('my test', () => {
  // ... test code
  // Missing: await eventing.clear();
});

// ❌ DON'T access strategy directly
if (events.strategy === 'redis') {
} // Use events.getStrategy()

// ❌ DON'T emit events without data structure
await events.emit('user.created', userId); // Should be object with userId property
```

### **Common Patterns**

```typescript
// Emit with proper data structure
await events.emit('user.created', {
  userId: user.id,
  email: user.email,
  source: 'registration',
  createdAt: new Date().toISOString(),
});

// Handle errors in event listeners
events.on('payment.process', async (payment) => {
  try {
    await processPayment(payment);
    await events.emit('payment.completed', payment);
  } catch (error) {
    await events.emit('payment.failed', {
      ...payment,
      error: error.message,
    });
  }
});

// Use namespaces for organization
const userEvents = eventing.get('users');
const orderEvents = eventing.get('orders');
const emailEvents = eventing.get('emails');

// Batch operations for efficiency
await events.emitBatch([
  { event: 'user.batch.start', data: { batchId: 'batch-123' } },
  { event: 'user.created', data: { userId: 1 } },
  { event: 'user.created', data: { userId: 2 } },
  { event: 'user.batch.complete', data: { batchId: 'batch-123', count: 2 } },
]);
```

## 📈 Performance

- **Memory Strategy**: ~0.01ms per event (local EventEmitter)
- **Redis Strategy**: ~2-5ms per event (network + serialization)
- **Wildcard Matching**: ~0.1ms per pattern check
- **Event History**: <1MB per 1000 events
- **Memory Usage**: <10MB baseline per namespace

## 🔍 TypeScript Support

Full TypeScript support with comprehensive interfaces:

```typescript
import type {
  Event,
  EventHandler,
  WildcardHandler,
  BatchEvent,
  EventHistoryEntry,
} from '@voilajsx/appkit/event';

// Strongly typed event handling
const events: Event = eventing.get('users');

const handler: EventHandler = (data: UserData) => {
  console.log('User created:', data.email);
};

const wildcardHandler: WildcardHandler = (eventName: string, data: any) => {
  console.log(`Event ${eventName}:`, data);
};

events.on('user.created', handler);
events.on('user.*', wildcardHandler);
```

## 🆚 Why Not EventEmitter/Redis directly?

**Other approaches:**

```javascript
// Node.js EventEmitter: Local only, no distribution
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.on('event', handler);
emitter.emit('event', data);

// Redis pub/sub: Manual setup, no wildcard support, no history
const redis = require('redis');
const pub = redis.createClient();
const sub = redis.createClient();
sub.subscribe('channel');
pub.publish('channel', JSON.stringify(data));
```

**This library:**

```typescript
// 2 lines, production ready with Redis auto-detection and wildcards
import { eventing } from '@voilajsx/appkit/event';
const events = eventing.get();
```

**Same features, 90% less code, automatic scaling.**

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  <strong>Built with ❤️ by the <a href="https://github.com/voilajsx">VoilaJSX Team</a></strong><br>
  Because event-driven architecture should be simple, not rocket science.
</p>
