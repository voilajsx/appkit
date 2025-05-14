# @voilajs/appkit/queue - Developer REFERENCE 🛠️

The queue module provides a flexible, efficient job queue system for Node.js
applications with multiple backend options. It offers a consistent interface for
job management across different adapters, making it easy to switch between
in-memory, Redis, and database backends as your application scales.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🔄 [Job Management](#job-management)
  - [Adding Jobs](#adding-jobs)
  - [Processing Jobs](#processing-jobs)
  - [Job Lifecycle](#job-lifecycle)
  - [Complete Job Management Example](#complete-job-management-example)
- 🧠 [Memory Adapter](#memory-adapter)
  - [When to Use](#when-to-use-memory-adapter)
  - [Configuration](#memory-adapter-configuration)
  - [Example Usage](#memory-adapter-example)
- 🔴 [Redis Adapter](#redis-adapter)
  - [When to Use](#when-to-use-redis-adapter)
  - [Configuration](#redis-adapter-configuration)
  - [Example Usage](#redis-adapter-example)
- 💾 [Database Adapter](#database-adapter)
  - [When to Use](#when-to-use-database-adapter)
  - [Configuration](#database-adapter-configuration)
  - [Example Usage](#database-adapter-example)
- 🌐 [Complete Integration Example](#complete-integration-example)
- 📚 [Additional Resources](#additional-resources)
- 💡 [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @voilajs/appkit
```

### Basic Setup

```javascript
import { initQueue, getQueue, QUEUE_ADAPTERS } from '@voilajs/appkit/queue';

// Initialize with in-memory adapter (for development)
await initQueue(QUEUE_ADAPTERS.MEMORY);

// Add a job to a queue
const job = await getQueue().addJob('emails', {
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome-email',
});

// Process jobs from the queue
getQueue().processJobs('emails', async (job) => {
  console.log(`Processing email to: ${job.data.to}`);
  // Your processing logic here
  return { success: true };
});
```

**Expected Output:**

```
Processing email to: user@example.com
```

**When to use:**

- For simple job queuing in development environments
- For testing queue functionality without external dependencies
- In applications with light workloads that don't require persistence

## Job Management

The queue system is built around the concept of adding jobs to named queues and
processing them asynchronously.

### Adding Jobs

Use `addJob` to enqueue a job for processing:

```javascript
import { getQueue } from '@voilajs/appkit/queue';

const queue = getQueue();

// Basic job
const job = await queue.addJob('emails', {
  to: 'user@example.com',
  subject: 'Welcome!',
});

// Job with options
const priorityJob = await queue.addJob(
  'notifications',
  {
    userId: '123',
    message: 'Your order has shipped!',
  },
  {
    priority: 10, // Higher priority runs first
    delay: 5000, // 5 second delay
    maxAttempts: 3, // Maximum retry attempts
  }
);
```

**Expected Output:**

```javascript
// Basic job result
{
  id: 'job_1_a1b2c3',
  queue: 'emails',
  status: 'pending'
}

// Priority job result
{
  id: 'job_2_d4e5f6',
  queue: 'notifications',
  status: 'delayed' // Because we set a delay
}
```

**When to use:**

- When you need to defer work for later processing
- For handling background tasks without blocking the main application
- When you want to schedule tasks to run at a later time
- To implement retry logic for operations that might fail

### Processing Jobs

Use `processJobs` to define how jobs should be processed:

```javascript
import { getQueue } from '@voilajs/appkit/queue';

const queue = getQueue();

// Simple processor
queue.processJobs('emails', async (job) => {
  console.log(`Sending email to ${job.data.to}`);
  // Email sending logic here
  return { sent: true, timestamp: new Date() };
});

// Processor with concurrency
queue.processJobs(
  'image-processing',
  async (job) => {
    console.log(`Processing image ${job.data.imageId}`);
    // Image processing logic here
    return { processed: true };
  },
  {
    concurrency: 3, // Process up to 3 jobs simultaneously
  }
);
```

**Expected Output:**

```
Sending email to user@example.com
Processing image img_123
Processing image img_456
Processing image img_789
```

**When to use:**

- To define how jobs should be processed asynchronously
- When you need to limit concurrency for resource-intensive operations
- For handling background tasks that don't need to block the main thread
- To process jobs from specific queues differently

### Job Lifecycle

Jobs go through several states during their lifecycle:

1. **Pending**: Job is waiting to be processed
2. **Delayed**: Job is waiting for its delay to expire
3. **Processing**: Job is currently being processed
4. **Completed**: Job has been successfully processed
5. **Failed**: Job processing has failed

You can check job status and information:

```javascript
import { getQueue } from '@voilajs/appkit/queue';

const queue = getQueue();

// Get job by ID
const job = await queue.getJob('emails', 'job_1_a1b2c3');
console.log(`Job status: ${job.status}`);

// Get queue information
const queueInfo = await queue.getQueueInfo('emails');
console.log(`Pending jobs: ${queueInfo.pending}`);
console.log(`Processing jobs: ${queueInfo.processing}`);
console.log(`Completed jobs: ${queueInfo.completed}`);
console.log(`Failed jobs: ${queueInfo.failed}`);
```

**Expected Output:**

```
Job status: completed
Pending jobs: 5
Processing jobs: 2
Completed jobs: 10
Failed jobs: 1
```

**When to use:**

- To monitor the status of specific jobs
- For building dashboards to visualize queue health
- To diagnose issues with job processing
- When implementing job management interfaces

### Complete Job Management Example

Here's a complete example of job management:

```javascript
import { initQueue, getQueue } from '@voilajs/appkit/queue';

async function setupEmailQueue() {
  // Initialize queue
  await initQueue('memory');
  const queue = getQueue();

  // Set up processor
  queue.processJobs(
    'emails',
    async (job) => {
      console.log(`Processing email to ${job.data.to}`);

      try {
        // Simulate email sending
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Return success result
        return { sent: true, timestamp: new Date() };
      } catch (error) {
        // Job will be retried if attempts < maxAttempts
        throw new Error(`Failed to send email: ${error.message}`);
      }
    },
    {
      concurrency: 2,
    }
  );

  // Add some jobs
  await queue.addJob('emails', {
    to: 'user1@example.com',
    subject: 'Welcome!',
  });

  await queue.addJob(
    'emails',
    {
      to: 'user2@example.com',
      subject: 'Password Reset',
    },
    {
      priority: 10, // Higher priority, will be processed first
    }
  );

  // Delayed job
  await queue.addJob(
    'emails',
    {
      to: 'user3@example.com',
      subject: 'Reminder',
    },
    {
      delay: 5000, // 5 second delay
    }
  );

  // Check queue status after 1 second
  setTimeout(async () => {
    const info = await queue.getQueueInfo('emails');
    console.log('Queue status:', info);
  }, 1000);
}

setupEmailQueue().catch(console.error);
```

**Expected Output:**

```
Processing email to user2@example.com
Processing email to user1@example.com
Queue status: {
  name: 'emails',
  total: 3,
  pending: 0,
  processing: 0,
  completed: 2,
  failed: 0,
  delayed: 1
}
Processing email to user3@example.com
```

**When to implement:**

- When building systems that need to process tasks asynchronously
- For applications with background processing requirements
- To implement reliable work queues with retry logic
- When you need to prioritize certain operations

## Memory Adapter

The Memory Adapter stores jobs in memory and is ideal for development, testing,
or applications with light workloads.

### When to Use Memory Adapter

- During development and testing
- For low-volume applications where persistence isn't required
- When simplicity is more important than durability
- For applications running on a single instance

### Memory Adapter Configuration

```javascript
import { initQueue } from '@voilajs/appkit/queue';

await initQueue('memory', {
  // No specific configuration options for memory adapter
});
```

### Memory Adapter Example

```javascript
import { initQueue, getQueue } from '@voilajs/appkit/queue';

async function setupTaskQueue() {
  // Initialize memory queue
  await initQueue('memory');
  const queue = getQueue();

  // Process jobs
  queue.processJobs('tasks', async (job) => {
    console.log(`Executing task: ${job.data.name}`);
    // Task execution logic
    return { completed: true };
  });

  // Add jobs
  for (let i = 1; i <= 5; i++) {
    await queue.addJob('tasks', {
      name: `Task ${i}`,
      priority: i % 2 === 0 ? 'high' : 'normal',
    });
  }

  // Get failed jobs (memory adapter specific)
  const failedJobs = await queue.getJobsByStatus('tasks', 'failed');
  console.log(`Failed jobs: ${failedJobs.length}`);

  // Retry a job if needed
  if (failedJobs.length > 0) {
    await queue.retryJob('tasks', failedJobs[0].id);
  }
}
```

**When to implement:**

- For simple applications without high availability requirements
- During development to test queue functionality
- For prototyping or proof-of-concept projects
- For applications with minimal job processing needs

## Redis Adapter

The Redis Adapter uses Bull queue library with Redis as the backend, providing
persistence, high availability, and advanced features.

### When to Use Redis Adapter

- For production environments
- When job persistence is required
- For distributed applications running on multiple instances
- When you need advanced features like job events and rate limiting

### Redis Adapter Configuration

```javascript
import { initQueue } from '@voilajs/appkit/queue';

await initQueue('redis', {
  // Redis connection options
  redis: 'redis://localhost:6379',
  // or
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'password',
    tls: false,
  },

  // Default job options
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential', // 'exponential', 'fixed', or 'linear'
      delay: 1000, // Base delay in ms
    },
    removeOnComplete: true,
    removeOnFail: false,
  },

  // Optional prefix for queue names
  prefix: 'myapp',
});
```

### Redis Adapter Example

```javascript
import { initQueue, getQueue } from '@voilajs/appkit/queue';

async function setupRedisQueue() {
  // Initialize Redis queue
  await initQueue('redis', {
    redis: 'redis://localhost:6379',
  });

  const queue = getQueue();

  // Process jobs with event handlers
  queue.processJobs(
    'notifications',
    async (job) => {
      console.log(`Sending notification to user ${job.data.userId}`);
      // Notification logic
      return { sent: true };
    },
    {
      concurrency: 5,
      onCompleted: (jobId, result) => {
        console.log(`Job ${jobId} completed:`, result);
      },
      onFailed: (jobId, error) => {
        console.error(`Job ${jobId} failed:`, error.message);
      },
    }
  );

  // Add jobs
  await queue.addJob('notifications', {
    userId: '123',
    message: 'New message received',
  });

  // Redis-specific methods

  // Pause queue
  await queue.pauseQueue('notifications');
  console.log('Queue paused');

  // Resume queue
  await queue.resumeQueue('notifications');
  console.log('Queue resumed');

  // Get failed jobs
  const failedJobs = await queue.getFailedJobs('notifications', 0, 10);
  console.log(`Failed jobs: ${failedJobs.length}`);

  // Clean up old jobs
  const removed = await queue.cleanUp(
    'notifications',
    24 * 60 * 60 * 1000, // 24 hours
    'completed',
    100
  );
  console.log(`Removed ${removed} old completed jobs`);
}
```

**When to implement:**

- For production applications with reliability requirements
- When building distributed systems with multiple worker instances
- For high-volume job processing
- When you need job persistence and monitoring

## Database Adapter

The Database Adapter uses PostgreSQL or MySQL for job storage, providing
durability and integration with existing database infrastructure.

### When to Use Database Adapter

- When you already have a database infrastructure
- For applications requiring strong data consistency
- When you need advanced querying capabilities
- For jobs that need to be stored long-term

### Database Adapter Configuration

```javascript
import { initQueue } from '@voilajs/appkit/queue';

// PostgreSQL
await initQueue('database', {
  databaseType: 'postgres',
  connectionString: 'postgresql://user:password@localhost/dbname',
  connectionPool: {
    max: 10,
    idleTimeoutMillis: 30000,
  },
  tableName: 'job_queue', // Custom table name
  pollInterval: 1000, // How often to check for new jobs (ms)
  maxConcurrency: 10, // Maximum concurrent jobs
});

// MySQL
await initQueue('database', {
  databaseType: 'mysql',
  connectionString: 'mysql://user:password@localhost/dbname',
  // Same other options as PostgreSQL
});
```

### Database Adapter Example

```javascript
import { initQueue, getQueue } from '@voilajs/appkit/queue';

async function setupDatabaseQueue() {
  // Initialize database queue
  await initQueue('database', {
    databaseType: 'postgres',
    connectionString: 'postgresql://user:password@localhost/dbname',
  });

  const queue = getQueue();

  // Process jobs
  queue.processJobs('reports', async (job) => {
    console.log(`Generating report: ${job.data.type}`);
    // Report generation logic
    return { reportUrl: `https://example.com/reports/${job.id}` };
  });

  // Add job
  await queue.addJob('reports', {
    type: 'monthly',
    parameters: {
      month: 5,
      year: 2023,
    },
  });

  // Database-specific methods

  // Get jobs by status
  const pendingJobs = await queue.getJobsByStatus('reports', 'pending', 10);
  console.log(`Pending reports: ${pendingJobs.length}`);

  // Cleanup old jobs
  const removed = await queue.cleanupOldJobs('reports', 30); // 30 days
  console.log(`Removed ${removed} old report jobs`);

  // Get processing metrics
  const metrics = await queue.getProcessingMetrics('reports');
  console.log(`Average processing time: ${metrics.avgProcessingTime}ms`);

  // Create recurring job (cron-based)
  await queue.createRecurringJob(
    'reports',
    { type: 'daily-summary' },
    { priority: 5 },
    '0 0 * * *' // Daily at midnight
  );
}
```

**When to implement:**

- For applications already using a relational database
- When you need transactional consistency with other database operations
- For systems requiring advanced job data querying
- When you want to leverage database replication for high availability

## Complete Integration Example

Here's a production-ready example integrating the queue system with a web
application:

```javascript
import express from 'express';
import { initQueue, getQueue, closeQueue } from '@voilajs/appkit/queue';

async function startServer() {
  // Initialize queue system
  await initQueue('redis', {
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    },
  });

  const queue = getQueue();

  // Set up queue processors
  queue.processJobs('emails', emailProcessor, { concurrency: 5 });
  queue.processJobs('notifications', notificationProcessor, {
    concurrency: 10,
  });
  queue.processJobs('reports', reportProcessor, { concurrency: 2 });

  // Create Express app
  const app = express();
  app.use(express.json());

  // API routes
  app.post('/api/emails', async (req, res) => {
    try {
      const { to, subject, body } = req.body;

      const job = await queue.addJob('emails', {
        to,
        subject,
        body,
      });

      res.status(202).json({
        message: 'Email queued for delivery',
        jobId: job.id,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/jobs/:queue/:id', async (req, res) => {
    try {
      const { queue: queueName, id } = req.params;
      const job = await queue.getJob(queueName, id);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json(job);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/queues/:name', async (req, res) => {
    try {
      const info = await queue.getQueueInfo(req.params.name);
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start server
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    server.close();
    await closeQueue();
    process.exit(0);
  });
}

// Job processors
async function emailProcessor(job) {
  console.log(`Sending email to ${job.data.to}`);
  // Email sending logic
  return { sent: true };
}

async function notificationProcessor(job) {
  console.log(`Sending notification: ${job.data.message}`);
  // Notification logic
  return { delivered: true };
}

async function reportProcessor(job) {
  console.log(`Generating report: ${job.data.type}`);
  // Report generation logic
  return { completed: true };
}

startServer().catch(console.error);
```

**When to implement:**

- For production web applications
- When building APIs that need to handle asynchronous processing
- For systems requiring job monitoring and management
- When you need graceful shutdowns and error handling

## Additional Resources

- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/queue/docs/API_REFERENCE.md) -
  Complete API documentation
- 📘 [GitHub Repository](https://github.com/voilajs/appkit) - Source code and
  examples
- 📙
  [LLM Code Generation Reference](https://github.com/voilajs/appkit/blob/main/src/queue/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## Best Practices

### 🔐 Security

- Store database and Redis connection strings in environment variables
- Use Redis authentication and TLS for production environments
- Sanitize job data before processing to prevent injection attacks
- Implement authorization for job management API endpoints
- Avoid storing sensitive information (passwords, API keys) in job data

### 🏗️ Architecture

- Keep job processing logic separate from application business logic
- Design idempotent job processors that can safely retry operations
- Use different queues for different types of jobs (emails, notifications,
  reports)
- Consider implementing the Circuit Breaker pattern for external service calls
- Split large tasks into smaller subtasks for better reliability and monitoring

### 🚀 Performance

- Adjust concurrency based on resource requirements and available hardware
- Use the appropriate adapter for your use case (memory for development,
  Redis/database for production)
- Enable job result cleanup for completed jobs to save storage space
- Use job batching for high-volume operations
- Implement proper backoff strategies for retry attempts

### 👥 User Experience

- Provide appropriate feedback when jobs are queued (202 Accepted responses)
- Implement webhooks or notifications for job completion
- Create admin interfaces for monitoring queue health
- Log job processing for troubleshooting
- Use job priorities appropriately to ensure important tasks are processed first

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
