# @voilajs/appkit/queue - API Reference

## Overview

The `@voilajs/appkit/queue` module provides a flexible, robust job queue system
for Node.js applications with support for multiple backends (in-memory, Redis,
and database). It offers consistent interfaces for job management across
different adapters, making it easy to switch between backends as your
application scales.

## Installation

```bash
npm install @voilajs/appkit
```

## Quick Start

```javascript
import { initQueue, getQueue, QUEUE_ADAPTERS } from '@voilajs/appkit/queue';

// Initialize with in-memory adapter (for development)
await initQueue(QUEUE_ADAPTERS.MEMORY);

// Add a job to a queue
const job = await getQueue().addJob('email-queue', {
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome-email',
});

// Process jobs in the queue
getQueue().processJobs('email-queue', async (job) => {
  // Process the job data
  await sendEmail(job.data);
  return { sent: true, timestamp: new Date() };
});
```

## API Reference

### Core Functions

#### initQueue(adapter, config)

Initializes a queue adapter instance.

##### Parameters

| Name      | Type     | Required | Default | Description                                               |
| --------- | -------- | -------- | ------- | --------------------------------------------------------- |
| `adapter` | `string` | Yes      | -       | Adapter type ('memory', 'redis', 'database')              |
| `config`  | `Object` | No       | `{}`    | Configuration options specific to the chosen adapter type |

##### Returns

- `Promise<QueueAdapter>` - The initialized queue adapter instance

##### Throws

- `Error` - If queue is already initialized
- `Error` - If adapter type is invalid or unsupported

##### Example

```javascript
// In-memory adapter (for development/testing)
await initQueue('memory');

// Redis adapter (for production)
await initQueue('redis', {
  redis: 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
  },
});

// Database adapter (PostgreSQL)
await initQueue('database', {
  databaseType: 'postgres',
  connectionString: 'postgresql://user:password@localhost/dbname',
  pollInterval: 1000,
});

// Database adapter (MySQL)
await initQueue('database', {
  databaseType: 'mysql',
  connectionString: 'mysql://user:password@localhost/dbname',
  tableName: 'job_queue',
});
```

---

#### getQueue()

Gets the initialized queue adapter instance.

##### Returns

- `QueueAdapter` - The initialized queue adapter instance

##### Throws

- `Error` - If queue is not initialized

##### Example

```javascript
const queue = getQueue();
await queue.addJob('emails', { to: 'user@example.com' });
```

---

#### closeQueue()

Stops all queue processing and closes connections.

##### Returns

- `Promise<void>`

##### Example

```javascript
// When shutting down your application
await closeQueue();
```

---

### QueueAdapter Interface

The `QueueAdapter` class is the base interface implemented by all queue
adapters. It defines the following methods:

#### addJob(queue, data, options)

Adds a job to a queue.

##### Parameters

| Name      | Type     | Required | Default | Description                                         |
| --------- | -------- | -------- | ------- | --------------------------------------------------- |
| `queue`   | `string` | Yes      | -       | Queue name                                          |
| `data`    | `Object` | Yes      | -       | Job data (will be passed to the processor function) |
| `options` | `Object` | No       | `{}`    | Job options (see job options table below)           |

##### Job Options

| Name               | Type      | Default   | Description                                                   |
| ------------------ | --------- | --------- | ------------------------------------------------------------- |
| `priority`         | `number`  | `0`       | Job priority (higher numbers run first)                       |
| `delay`            | `number`  | `0`       | Delay in milliseconds before the job becomes available        |
| `maxAttempts`      | `number`  | `3`       | Maximum number of retry attempts if the job fails             |
| `backoff`          | `Object`  | See below | Retry backoff configuration                                   |
| `removeOnComplete` | `boolean` | `true`    | Whether to remove the job when completed (Redis adapter only) |
| `removeOnFail`     | `boolean` | `true`    | Whether to remove the job when failed (Redis adapter only)    |

Default backoff configuration:

```javascript
{
  type: 'exponential', // 'exponential', 'fixed', or 'linear'
  delay: 1000,         // Base delay in milliseconds
  maxDelay: 30000      // Maximum delay in milliseconds
}
```

##### Returns

- `Promise<Object>` - Job information
  - `id` - Unique job ID
  - `queue` - Queue name
  - `status` - Initial job status ('pending' or 'delayed')

##### Throws

- `Error` - If queue name is not a string
- `Error` - If job data is null or undefined
- `Error` - If adapter-specific errors occur

##### Example

```javascript
// Basic job
const job = await queue.addJob('emails', {
  to: 'user@example.com',
  subject: 'Hello',
  body: 'Welcome to our platform!',
});

// Job with options
const priorityJob = await queue.addJob(
  'emails',
  {
    to: 'vip@example.com',
    subject: 'VIP Welcome',
    body: 'Welcome to our premium service!',
  },
  {
    priority: 10,
    maxAttempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
      maxDelay: 60000,
    },
  }
);

// Delayed job
const scheduledJob = await queue.addJob(
  'reminders',
  {
    userId: '123',
    message: 'Appointment in 1 hour',
  },
  {
    delay: 60 * 60 * 1000, // 1 hour
  }
);
```

---

#### processJobs(queue, processor, options)

Processes jobs from a queue.

##### Parameters

| Name        | Type       | Required | Default | Description                                         |
| ----------- | ---------- | -------- | ------- | --------------------------------------------------- |
| `queue`     | `string`   | Yes      | -       | Queue name                                          |
| `processor` | `Function` | Yes      | -       | Job processor function that receives the job object |
| `options`   | `Object`   | No       | `{}`    | Processing options                                  |

##### Processing Options

| Name          | Type       | Default | Description                                           |
| ------------- | ---------- | ------- | ----------------------------------------------------- |
| `concurrency` | `number`   | `1`     | Number of jobs to process concurrently                |
| `onCompleted` | `Function` | -       | Callback when a job is completed (Redis adapter only) |
| `onFailed`    | `Function` | -       | Callback when a job fails (Redis adapter only)        |
| `onProgress`  | `Function` | -       | Callback for job progress (Redis adapter only)        |

##### Processor Function

The processor function receives a job object with the following properties:

| Property      | Type     | Description                                   |
| ------------- | -------- | --------------------------------------------- |
| `id`          | `string` | Job ID                                        |
| `queue`       | `string` | Queue name                                    |
| `data`        | `Object` | Job data (as provided when the job was added) |
| `options`     | `Object` | Job options                                   |
| `attempts`    | `number` | Current attempt number (starting from 1)      |
| `maxAttempts` | `number` | Maximum number of attempts                    |
| `status`      | `string` | Current job status                            |

The processor function must return a Promise. If the Promise resolves, the job
is marked as completed. If it rejects, the job is marked as failed and may be
retried depending on its `maxAttempts` setting.

##### Returns

- `Promise<void>`

##### Throws

- `Error` - If queue name is not a string
- `Error` - If processor is not a function
- `Error` - If adapter-specific errors occur

##### Example

```javascript
// Basic processing
queue.processJobs('emails', async (job) => {
  console.log(`Processing email to: ${job.data.to}`);
  await emailService.send(job.data);
  return { sent: true };
});

// With concurrency
queue.processJobs(
  'image-processing',
  async (job) => {
    return await imageProcessor.resize(job.data.image, job.data.size);
  },
  {
    concurrency: 5,
  }
);

// With event callbacks (Redis adapter)
queue.processJobs(
  'notifications',
  async (job) => {
    return await notificationService.send(job.data);
  },
  {
    concurrency: 10,
    onCompleted: (jobId, result) => {
      console.log(`Job ${jobId} completed with result:`, result);
    },
    onFailed: (jobId, error) => {
      console.error(`Job ${jobId} failed:`, error);
    },
  }
);
```

---

#### getJob(queue, jobId)

Gets a specific job by ID.

##### Parameters

| Name    | Type     | Required | Default | Description |
| ------- | -------- | -------- | ------- | ----------- |
| `queue` | `string` | Yes      | -       | Queue name  |
| `jobId` | `string` | Yes      | -       | Job ID      |

##### Returns

- `Promise<Object>` - Job object with details, or `null` if not found

##### Throws

- `Error` - If queue name is not a string
- `Error` - If job ID is not a string
- `Error` - If adapter-specific errors occur

##### Example

```javascript
const job = await queue.getJob('emails', '12345');
if (job) {
  console.log(`Job status: ${job.status}`);
  console.log(`Job data:`, job.data);
}
```

---

#### updateJob(queue, jobId, update)

Updates a job.

##### Parameters

| Name     | Type     | Required | Default | Description      |
| -------- | -------- | -------- | ------- | ---------------- |
| `queue`  | `string` | Yes      | -       | Queue name       |
| `jobId`  | `string` | Yes      | -       | Job ID           |
| `update` | `Object` | Yes      | -       | Fields to update |

##### Returns

- `Promise<boolean>` - `true` if successful, `false` if job not found

##### Throws

- `Error` - If queue name is not a string
- `Error` - If job ID is not a string
- `Error` - If update is not an object
- `Error` - If adapter-specific errors occur

##### Example

```javascript
// Update job data
const updated = await queue.updateJob('emails', '12345', {
  data: { ...job.data, priority: 'high' },
});

// Update job status (database adapter)
await queue.updateJob('emails', '12345', {
  status: 'pending',
  processAfter: new Date(Date.now() + 60000),
});
```

---

#### removeJob(queue, jobId)

Removes a job from the queue.

##### Parameters

| Name    | Type     | Required | Default | Description |
| ------- | -------- | -------- | ------- | ----------- |
| `queue` | `string` | Yes      | -       | Queue name  |
| `jobId` | `string` | Yes      | -       | Job ID      |

##### Returns

- `Promise<boolean>` - `true` if successful, `false` if job not found

##### Throws

- `Error` - If queue name is not a string
- `Error` - If job ID is not a string
- `Error` - If adapter-specific errors occur

##### Example

```javascript
const removed = await queue.removeJob('emails', '12345');
console.log(removed ? 'Job removed' : 'Job not found');
```

---

#### getQueueInfo(queue)

Gets information and statistics about a queue.

##### Parameters

| Name    | Type     | Required | Default | Description |
| ------- | -------- | -------- | ------- | ----------- |
| `queue` | `string` | Yes      | -       | Queue name  |

##### Returns

- `Promise<Object>` - Queue statistics
  - `name` - Queue name
  - `total` - Total number of jobs
  - `pending` - Number of pending jobs
  - `processing` - Number of jobs currently being processed
  - `completed` - Number of completed jobs
  - `failed` - Number of failed jobs
  - `delayed` - Number of delayed jobs

##### Throws

- `Error` - If queue name is not a string
- `Error` - If adapter-specific errors occur

##### Example

```javascript
const stats = await queue.getQueueInfo('emails');
console.log(`Queue: ${stats.name}`);
console.log(`Total jobs: ${stats.total}`);
console.log(`Pending: ${stats.pending}`);
console.log(`Processing: ${stats.processing}`);
```

---

#### clearQueue(queue)

Clears all jobs from a queue.

##### Parameters

| Name    | Type     | Required | Default | Description |
| ------- | -------- | -------- | ------- | ----------- |
| `queue` | `string` | Yes      | -       | Queue name  |

##### Returns

- `Promise<boolean>` - `true` if successful

##### Throws

- `Error` - If queue name is not a string
- `Error` - If adapter-specific errors occur

##### Example

```javascript
await queue.clearQueue('emails');
console.log('Queue cleared');
```

---

#### stop()

Stops processing jobs and releases resources.

##### Returns

- `Promise<void>`

##### Example

```javascript
await queue.stop();
console.log('Queue stopped');
```

---

### Adapter-Specific Methods

Each adapter has additional methods specific to its backend.

#### MemoryAdapter

##### getJobsByStatus(queue, status, limit)

Gets jobs with a specific status.

###### Parameters

| Name     | Type     | Required | Default | Description                        |
| -------- | -------- | -------- | ------- | ---------------------------------- |
| `queue`  | `string` | Yes      | -       | Queue name                         |
| `status` | `string` | Yes      | -       | Job status                         |
| `limit`  | `number` | No       | `100`   | Maximum number of jobs to retrieve |

###### Returns

- `Promise<Array>` - Array of job objects

###### Example

```javascript
const failedJobs = await queue.getJobsByStatus('emails', 'failed', 10);
```

##### retryJob(queue, jobId)

Retries a failed job.

###### Parameters

| Name    | Type     | Required | Default | Description |
| ------- | -------- | -------- | ------- | ----------- |
| `queue` | `string` | Yes      | -       | Queue name  |
| `jobId` | `string` | Yes      | -       | Job ID      |

###### Returns

- `Promise<boolean>` - `true` if successful, `false` if job not found or not
  failed

###### Example

```javascript
await queue.retryJob('emails', '12345');
```

#### RedisAdapter

##### pauseQueue(queue, isLocal)

Pauses a queue.

###### Parameters

| Name      | Type      | Required | Default | Description                 |
| --------- | --------- | -------- | ------- | --------------------------- |
| `queue`   | `string`  | Yes      | -       | Queue name                  |
| `isLocal` | `boolean` | No       | `false` | If true, pause only locally |

###### Returns

- `Promise<void>`

###### Example

```javascript
await queue.pauseQueue('emails');
```

##### resumeQueue(queue, isLocal)

Resumes a paused queue.

###### Parameters

| Name      | Type      | Required | Default | Description                  |
| --------- | --------- | -------- | ------- | ---------------------------- |
| `queue`   | `string`  | Yes      | -       | Queue name                   |
| `isLocal` | `boolean` | No       | `false` | If true, resume only locally |

###### Returns

- `Promise<void>`

###### Example

```javascript
await queue.resumeQueue('emails');
```

##### getFailedJobs(queue, start, end)

Gets failed jobs.

###### Parameters

| Name    | Type     | Required | Default | Description                       |
| ------- | -------- | -------- | ------- | --------------------------------- |
| `queue` | `string` | Yes      | -       | Queue name                        |
| `start` | `number` | No       | `0`     | Start index (pagination)          |
| `end`   | `number` | No       | `-1`    | End index, -1 means all remaining |

###### Returns

- `Promise<Array>` - Array of failed job objects

###### Example

```javascript
const failedJobs = await queue.getFailedJobs('emails', 0, 9);
```

##### retryJob(queue, jobId)

Retries a failed job.

###### Parameters

| Name    | Type     | Required | Default | Description |
| ------- | -------- | -------- | ------- | ----------- |
| `queue` | `string` | Yes      | -       | Queue name  |
| `jobId` | `string` | Yes      | -       | Job ID      |

###### Returns

- `Promise<boolean>` - `true` if successful, `false` if job not found or not
  failed

###### Example

```javascript
await queue.retryJob('emails', '12345');
```

##### getJobs(queue, type, start, end)

Gets jobs of a specific type.

###### Parameters

| Name    | Type     | Required | Default | Description                                                      |
| ------- | -------- | -------- | ------- | ---------------------------------------------------------------- |
| `queue` | `string` | Yes      | -       | Queue name                                                       |
| `type`  | `string` | Yes      | -       | Job type ('active', 'waiting', 'delayed', 'completed', 'failed') |
| `start` | `number` | No       | `0`     | Start index (pagination)                                         |
| `end`   | `number` | No       | `-1`    | End index, -1 means all remaining                                |

###### Returns

- `Promise<Array>` - Array of job objects

###### Example

```javascript
const activeJobs = await queue.getJobs('emails', 'active', 0, 9);
```

##### cleanUp(queue, grace, status, limit)

Cleans up old jobs.

###### Parameters

| Name     | Type     | Required | Default       | Description                                           |
| -------- | -------- | -------- | ------------- | ----------------------------------------------------- |
| `queue`  | `string` | Yes      | -             | Queue name                                            |
| `grace`  | `number` | No       | `3600000`     | Grace period in milliseconds (1 hour)                 |
| `status` | `string` | No       | `'completed'` | Job status to clean up ('completed', 'failed', 'all') |
| `limit`  | `number` | No       | `1000`        | Maximum number of jobs to clean up                    |

###### Returns

- `Promise<number>` - Number of jobs removed

###### Example

```javascript
// Clean up completed jobs older than 1 day
const removed = await queue.cleanUp('emails', 24 * 60 * 60 * 1000, 'completed');
console.log(`Removed ${removed} old completed jobs`);
```

#### DatabaseAdapter

##### getFailedJobs(queue, limit)

Gets failed jobs.

###### Parameters

| Name    | Type     | Required | Default | Description                        |
| ------- | -------- | -------- | ------- | ---------------------------------- |
| `queue` | `string` | Yes      | -       | Queue name                         |
| `limit` | `number` | No       | `10`    | Maximum number of jobs to retrieve |

###### Returns

- `Promise<Array>` - Array of failed job objects

###### Example

```javascript
const failedJobs = await queue.getFailedJobs('emails', 20);
```

##### retryJob(queue, jobId)

Retries a failed job.

###### Parameters

| Name    | Type     | Required | Default | Description |
| ------- | -------- | -------- | ------- | ----------- |
| `queue` | `string` | Yes      | -       | Queue name  |
| `jobId` | `string` | Yes      | -       | Job ID      |

###### Returns

- `Promise<boolean>` - `true` if successful, `false` if job not found or not
  failed

###### Example

```javascript
await queue.retryJob('emails', '12345');
```

##### getJobsByStatus(queue, status, limit)

Gets jobs with a specific status.

###### Parameters

| Name     | Type     | Required | Default | Description                        |
| -------- | -------- | -------- | ------- | ---------------------------------- |
| `queue`  | `string` | Yes      | -       | Queue name                         |
| `status` | `string` | Yes      | -       | Job status                         |
| `limit`  | `number` | No       | `10`    | Maximum number of jobs to retrieve |

###### Returns

- `Promise<Array>` - Array of job objects

###### Example

```javascript
const pendingJobs = await queue.getJobsByStatus('emails', 'pending', 20);
```

##### cleanupOldJobs(queue, daysOld)

Cleans up old completed and failed jobs.

###### Parameters

| Name      | Type     | Required | Default | Description                           |
| --------- | -------- | -------- | ------- | ------------------------------------- |
| `queue`   | `string` | Yes      | -       | Queue name                            |
| `daysOld` | `number` | No       | `7`     | Minimum age of jobs to remove in days |

###### Returns

- `Promise<number>` - Number of jobs removed

###### Example

```javascript
// Remove completed/failed jobs older than 30 days
const removed = await queue.cleanupOldJobs('emails', 30);
console.log(`Removed ${removed} old jobs`);
```

##### getJobCountsByStatus(queue)

Gets job counts grouped by status.

###### Parameters

| Name    | Type     | Required | Default | Description |
| ------- | -------- | -------- | ------- | ----------- |
| `queue` | `string` | Yes      | -       | Queue name  |

###### Returns

- `Promise<Object>` - Job counts by status

###### Example

```javascript
const counts = await queue.getJobCountsByStatus('emails');
console.log(counts); // { total: 100, pending: 50, processing: 10, completed: 35, failed: 5 }
```

##### getProcessingMetrics(queue, timeSpan)

Gets job processing metrics.

###### Parameters

| Name       | Type     | Required | Default    | Description                          |
| ---------- | -------- | -------- | ---------- | ------------------------------------ |
| `queue`    | `string` | Yes      | -          | Queue name                           |
| `timeSpan` | `number` | No       | `86400000` | Time span in milliseconds (24 hours) |

###### Returns

- `Promise<Object>` - Processing metrics
  - `totalProcessed` - Number of jobs processed in the time span
  - `avgProcessingTime` - Average processing time in milliseconds
  - `minProcessingTime` - Minimum processing time in milliseconds
  - `maxProcessingTime` - Maximum processing time in milliseconds

###### Example

```javascript
// Get metrics for the last hour
const metrics = await queue.getProcessingMetrics('emails', 60 * 60 * 1000);
console.log(`Processed ${metrics.totalProcessed} jobs`);
console.log(`Average time: ${metrics.avgProcessingTime}ms`);
```

##### createRecurringJob(queue, data, options, cronExpression)

Creates a recurring job using a cron expression.

###### Parameters

| Name             | Type     | Required | Default | Description                    |
| ---------------- | -------- | -------- | ------- | ------------------------------ |
| `queue`          | `string` | Yes      | -       | Queue name                     |
| `data`           | `Object` | Yes      | -       | Job data                       |
| `options`        | `Object` | No       | `{}`    | Job options                    |
| `cronExpression` | `string` | Yes      | -       | Cron expression for scheduling |

###### Returns

- `Promise<Object>` - Job info

###### Example

```javascript
// Run a job every day at midnight
const recurringJob = await queue.createRecurringJob(
  'reports',
  { type: 'daily-summary' },
  { priority: 5 },
  '0 0 * * *'
);
```

## Error Handling

All functions in the queue module can throw errors that should be handled
appropriately:

```javascript
try {
  await queue.addJob('emails', { to: 'user@example.com' });
} catch (error) {
  console.error('Failed to add job:', error.message);
}
```

Common error types:

- Initialization errors: "Queue already initialized", "Unknown queue adapter"
- Validation errors: "Queue name is required", "Job data is required"
- Connection errors: "Redis connection failed", "Database connection failed"
- Operation errors: "Failed to add job", "Failed to process job"

## Constants

The module exports the following constants for convenience:

### QUEUE_ADAPTERS

Enum for adapter types:

```javascript
const QUEUE_ADAPTERS = {
  MEMORY: 'memory',
  REDIS: 'redis',
  DATABASE: 'database',
};
```

### JOB_STATUS

Enum for job statuses:

```javascript
const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DELAYED: 'delayed',
  RECURRING: 'recurring',
};
```

## TypeScript Support

Although this module is written in JavaScript, it provides comprehensive type
definitions for TypeScript users:

```typescript
import {
  initQueue,
  getQueue,
  QueueAdapter,
  QUEUE_ADAPTERS,
  JOB_STATUS,
} from '@voilajs/appkit/queue';

interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

// Initialize with a typed config
await initQueue(QUEUE_ADAPTERS.MEMORY);

// Add a typed job
const job = await getQueue().addJob<EmailJobData>('emails', {
  to: 'user@example.com',
  subject: 'Hello',
  body: 'This is a test email',
});

// Process with a typed processor
getQueue().processJobs<EmailJobData>('emails', async (job) => {
  // TypeScript knows that job.data has the EmailJobData shape
  console.log(`Sending email to ${job.data.to}`);
  // Process the job...
  return { sent: true };
});
```

## Security Considerations

1. **Redis Security**: When using the RedisAdapter, ensure your Redis instance
   is properly secured. Use authentication and consider enabling TLS for
   production environments.

2. **Database Security**: When using the DatabaseAdapter, use a database user
   with limited permissions and ensure connection strings are stored securely
   (e.g., in environment variables).

3. **Job Data**: Be cautious about what you store in job data, as it might
   contain sensitive information. Consider encrypting sensitive fields if
   necessary.

4. **Concurrency Control**: Set appropriate concurrency limits to avoid
   overwhelming your resources or external services.

5. **Retry Limits**: Always set reasonable max attempt limits to prevent
   infinite retry loops for jobs that can never succeed.

## Performance Tips

1. **Choose the Right Adapter**: For development or low-volume applications, the
   MemoryAdapter is suitable. For production or high-volume applications, use
   the RedisAdapter. The DatabaseAdapter is best for applications that require
   job persistence or already have database infrastructure.

2. **Concurrency Tuning**: Adjust concurrency based on your application's needs
   and resources. Start with a low value and increase as needed.

3. **Job Cleanup**: Regularly clean up completed and failed jobs to prevent the
   queue from growing too large. The Redis and Database adapters have built-in
   methods for this.

4. **Monitoring**: Use the `getQueueInfo` and adapter-specific metrics methods
   to monitor queue performance and identify bottlenecks.

5. **Optimized Job Processing**: Keep job processors efficient and focused on a
   single task. For complex workflows, consider splitting into multiple smaller
   jobs.

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
