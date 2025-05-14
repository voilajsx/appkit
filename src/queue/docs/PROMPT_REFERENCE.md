# @voilajs/appkit/queue - LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Always include JSDoc comments for functions
   - Prefer async/await over callbacks or raw promises

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
   - Handle adapter-specific errors gracefully

4. **Framework Agnostic**:
   - Code should work with any Node.js framework
   - Avoid dependencies on specific frameworks like Express

## Function Signatures

### 1. Core Functions

#### `initQueue`

```typescript
async function initQueue(
  adapter: string,
  config?: {
    // Memory adapter options
    // Redis adapter options
    redis?:
      | string
      | {
          host?: string;
          port?: number;
          password?: string;
          tls?: boolean;
        };
    defaultJobOptions?: {
      priority?: number;
      delay?: number;
      attempts?: number;
      backoff?: {
        type: 'exponential' | 'fixed' | 'linear';
        delay: number;
        maxDelay?: number;
      };
      removeOnComplete?: boolean;
      removeOnFail?: boolean;
    };
    // Database adapter options
    type?: 'postgres' | 'mysql';
    connectionString?: string;
    connectionPool?: {
      max?: number;
      idleTimeoutMillis?: number;
    };
    tableName?: string;
    pollInterval?: number;
  }
): Promise<QueueAdapter>;
```

#### `getQueue`

```typescript
function getQueue(): QueueAdapter;
```

#### `closeQueue`

```typescript
async function closeQueue(): Promise<void>;
```

### 2. QueueAdapter Interface Methods

#### `addJob`

```typescript
async function addJob<T = any>(
  queue: string,
  data: T,
  options?: {
    priority?: number;
    delay?: number;
    maxAttempts?: number;
    backoff?: {
      type: 'exponential' | 'fixed' | 'linear';
      delay: number;
      maxDelay?: number;
    };
    removeOnComplete?: boolean;
    removeOnFail?: boolean;
  }
): Promise<{
  id: string;
  queue: string;
  status: string;
}>;
```

#### `processJobs`

```typescript
async function processJobs<T = any>(
  queue: string,
  processor: (job: {
    id: string;
    queue: string;
    data: T;
    options: any;
    status: string;
    attempts: number;
    maxAttempts: number;
    [key: string]: any;
  }) => Promise<any>,
  options?: {
    concurrency?: number;
    onCompleted?: (jobId: string, result: any) => void;
    onFailed?: (jobId: string, error: Error) => void;
    onProgress?: (jobId: string, progress: number) => void;
  }
): Promise<void>;
```

#### `getJob`

```typescript
async function getJob(
  queue: string,
  jobId: string
): Promise<{
  id: string;
  queue: string;
  data: any;
  options: any;
  status: string;
  attempts: number;
  maxAttempts: number;
  progress?: number;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
} | null>;
```

#### `updateJob`

```typescript
async function updateJob(
  queue: string,
  jobId: string,
  update: Record<string, any>
): Promise<boolean>;
```

#### `removeJob`

```typescript
async function removeJob(queue: string, jobId: string): Promise<boolean>;
```

#### `getQueueInfo`

```typescript
async function getQueueInfo(queue: string): Promise<{
  name: string;
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  delayed: number;
}>;
```

#### `clearQueue`

```typescript
async function clearQueue(queue: string): Promise<boolean>;
```

#### `stop`

```typescript
async function stop(): Promise<void>;
```

### 3. Memory Adapter Specific Methods

#### `getJobsByStatus`

```typescript
async function getJobsByStatus(
  queue: string,
  status: string,
  limit?: number
): Promise<any[]>;
```

#### `retryJob`

```typescript
async function retryJob(queue: string, jobId: string): Promise<boolean>;
```

### 4. Redis Adapter Specific Methods

#### `pauseQueue`

```typescript
async function pauseQueue(queue: string, isLocal?: boolean): Promise<void>;
```

#### `resumeQueue`

```typescript
async function resumeQueue(queue: string, isLocal?: boolean): Promise<void>;
```

#### `getFailedJobs`

```typescript
async function getFailedJobs(
  queue: string,
  start?: number,
  end?: number
): Promise<any[]>;
```

#### `getJobs`

```typescript
async function getJobs(
  queue: string,
  type: 'active' | 'waiting' | 'delayed' | 'completed' | 'failed',
  start?: number,
  end?: number
): Promise<any[]>;
```

#### `cleanUp`

```typescript
async function cleanUp(
  queue: string,
  grace?: number,
  status?: 'completed' | 'failed' | 'all',
  limit?: number
): Promise<number>;
```

### 5. Database Adapter Specific Methods

#### `getFailedJobs`

```typescript
async function getFailedJobs(queue: string, limit?: number): Promise<any[]>;
```

#### `getJobsByStatus`

```typescript
async function getJobsByStatus(
  queue: string,
  status: string,
  limit?: number
): Promise<any[]>;
```

#### `cleanupOldJobs`

```typescript
async function cleanupOldJobs(queue: string, daysOld?: number): Promise<number>;
```

#### `getJobCountsByStatus`

```typescript
async function getJobCountsByStatus(
  queue: string
): Promise<Record<string, number>>;
```

#### `getProcessingMetrics`

```typescript
async function getProcessingMetrics(
  queue: string,
  timeSpan?: number
): Promise<{
  totalProcessed: number;
  avgProcessingTime: number;
  minProcessingTime: number;
  maxProcessingTime: number;
}>;
```

#### `createRecurringJob`

```typescript
async function createRecurringJob(
  queue: string,
  data: any,
  options: Record<string, any>,
  cronExpression: string
): Promise<{
  id: string;
  queue: string;
  status: string;
  cronExpression: string;
}>;
```

## Example Implementations

### Example 1: Basic Queue Setup

```javascript
/**
 * Sets up a job queue with in-memory adapter
 * @returns {Promise<QueueAdapter>} Queue adapter
 */
async function setupQueue() {
  try {
    await initQueue('memory');
    const queue = getQueue();

    // Process jobs
    queue.processJobs(
      'emails',
      async (job) => {
        console.log(`Processing email to: ${job.data.to}`);
        // Send email implementation...
        return { sent: true, timestamp: new Date() };
      },
      {
        concurrency: 3,
      }
    );

    console.log('Queue initialized and processing');
    return queue;
  } catch (error) {
    console.error('Failed to setup queue:', error.message);
    throw error;
  }
}
```

### Example 2: Adding Jobs

```javascript
/**
 * Sends a welcome email by adding it to the queue
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>} Job info
 */
async function queueWelcomeEmail(email, name) {
  if (!email) {
    throw new Error('Email is required');
  }

  try {
    const queue = getQueue();

    const job = await queue.addJob(
      'emails',
      {
        to: email,
        subject: 'Welcome to our platform!',
        template: 'welcome',
        data: { name },
      },
      {
        priority: 10, // High priority
        maxAttempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
          maxDelay: 60000,
        },
      }
    );

    console.log(`Welcome email queued for ${email}, job ID: ${job.id}`);
    return job;
  } catch (error) {
    console.error(`Failed to queue welcome email for ${email}:`, error.message);
    throw error;
  }
}
```

### Example 3: Monitoring Queue Status

```javascript
/**
 * Gets queue statistics and health information
 * @param {string} queueName - Queue name
 * @returns {Promise<Object>} Queue statistics and health info
 */
async function getQueueStats(queueName) {
  if (!queueName) {
    throw new Error('Queue name is required');
  }

  try {
    const queue = getQueue();
    const stats = await queue.getQueueInfo(queueName);

    // Calculate health metrics
    const health = {
      status: stats.failed > stats.total * 0.5 ? 'unhealthy' : 'healthy',
      utilization: stats.processing / (stats.pending + stats.processing + 0.1), // Avoid division by zero
      failureRate: stats.failed / (stats.total || 1),
    };

    return {
      stats,
      health,
    };
  } catch (error) {
    console.error(`Failed to get queue stats for ${queueName}:`, error.message);
    throw error;
  }
}
```

### Example 4: Queue Management Functions

```javascript
/**
 * Sets up a production-ready Redis queue
 * @param {string} redisUrl - Redis connection URL
 * @returns {Promise<QueueAdapter>} Queue adapter
 */
async function setupRedisQueue(redisUrl) {
  if (!redisUrl) {
    throw new Error('Redis URL is required');
  }

  try {
    await initQueue('redis', {
      redis: redisUrl,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      },
    });

    const queue = getQueue();

    // Set up event handlers
    const processingOptions = {
      concurrency: 5,
      onCompleted: (jobId, result) => {
        console.log(`Job ${jobId} completed with result:`, result);
      },
      onFailed: (jobId, error) => {
        console.error(`Job ${jobId} failed:`, error.message);
      },
    };

    // Setup processors for different queues
    queue.processJobs('emails', emailProcessor, processingOptions);
    queue.processJobs(
      'notifications',
      notificationProcessor,
      processingOptions
    );
    queue.processJobs('reports', reportGenerator, {
      ...processingOptions,
      concurrency: 2,
    });

    // Set up periodic cleanup
    setInterval(
      async () => {
        try {
          const removed = await queue.cleanUp(
            'emails',
            24 * 60 * 60 * 1000,
            'completed'
          );
          console.log(`Cleaned up ${removed} completed email jobs`);
        } catch (error) {
          console.error('Cleanup failed:', error.message);
        }
      },
      6 * 60 * 60 * 1000
    ); // Run every 6 hours

    return queue;
  } catch (error) {
    console.error('Failed to setup Redis queue:', error.message);
    throw error;
  }
}
```

### Example 5: Working with Database Queue

```javascript
/**
 * Sets up a database queue with PostgreSQL
 * @param {string} connectionString - Database connection string
 * @returns {Promise<QueueAdapter>} Queue adapter
 */
async function setupDatabaseQueue(connectionString) {
  if (!connectionString) {
    throw new Error('Database connection string is required');
  }

  try {
    await initQueue('database', {
      type: 'postgres',
      connectionString,
      connectionPool: {
        max: 20,
        idleTimeoutMillis: 30000,
      },
      tableName: 'job_queue',
      pollInterval: 1000,
    });

    const queue = getQueue();

    // Process email jobs
    queue.processJobs(
      'emails',
      async (job) => {
        console.log(`Processing email job ${job.id}`);
        // Email sending implementation...

        // Update progress (database adapter supports this)
        await queue.updateJob('emails', job.id, {
          progress: 100,
          result: { sent: true, timestamp: new Date() },
        });

        return { success: true };
      },
      {
        concurrency: 5,
      }
    );

    // Set up recurring job for reports
    await queue.createRecurringJob(
      'reports',
      { type: 'daily-summary' },
      { priority: 5 },
      '0 0 * * *' // Run daily at midnight
    );

    return queue;
  } catch (error) {
    console.error('Failed to setup database queue:', error.message);
    throw error;
  }
}
```

## Code Generation Rules

1. **Always use async/await** for asynchronous operations
2. **Include error handling** with try/catch blocks
3. **Validate parameters** before using them
4. **Include detailed JSDoc comments** for all functions
5. **Use const and let** appropriately, avoid var
6. **Follow function signatures** exactly as provided
7. **Include logging** for important operations and errors
8. **Handle edge cases** like empty queues, missing jobs, etc.
9. **Use environment variables** for sensitive configuration
10. **Prefer named exports** for better import experience

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
