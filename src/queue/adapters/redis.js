/**
 * @voilajs/appkit - Redis queue adapter (uses Bull)
 * @module @voilajs/appkit/queue/adapters/redis
 */

import Bull from 'bull';
import { QueueAdapter } from './base.js';

/**
 * Redis queue adapter using Bull
 * @extends QueueAdapter
 */
export class RedisAdapter extends QueueAdapter {
  constructor(config = {}) {
    super(config);
    this.queues = new Map();
    this.redisConfig = this.parseRedisConfig(
      config.redis || 'redis://localhost:6379'
    );
    this.defaultJobOptions = config.defaultJobOptions || {};
    this.prefix = config.prefix || 'appkit';
  }

  /**
   * Parses Redis connection configuration
   * @private
   * @param {string|Object} redisConfig - Redis configuration
   * @returns {string|Object} Parsed configuration
   */
  parseRedisConfig(redisConfig) {
    if (typeof redisConfig === 'string') {
      return redisConfig;
    }

    // Already an object, ensure it has required properties
    if (typeof redisConfig === 'object' && redisConfig !== null) {
      return {
        host: redisConfig.host || 'localhost',
        port: redisConfig.port || 6379,
        db: redisConfig.db || 0,
        password: redisConfig.password,
        tls: redisConfig.tls,
        ...redisConfig,
      };
    }

    return 'redis://localhost:6379';
  }

  /**
   * Initializes the Redis adapter
   * @returns {Promise<void>}
   */
  async initialize() {
    await super.initialize();
    // No initialization needed until queues are accessed
  }

  /**
   * Gets or creates a Bull queue
   * @private
   * @param {string} name - Queue name
   * @returns {Bull.Queue} Bull queue instance
   */
  getOrCreateQueue(name) {
    if (!this.queues.has(name)) {
      try {
        const queue = new Bull(name, {
          redis: this.redisConfig,
          prefix: this.prefix,
        });
        this.queues.set(name, queue);
      } catch (error) {
        throw new Error(`Failed to create Redis queue: ${error.message}`);
      }
    }
    return this.queues.get(name);
  }

  /**
   * Adds a job to a queue
   * @param {string} queue - Queue name
   * @param {Object} data - Job data
   * @param {Object} [options] - Job options
   * @returns {Promise<Object>} Job info
   */
  async addJob(queue, data, options = {}) {
    super.addJob(queue, data, options); // Validation

    const bullQueue = this.getOrCreateQueue(queue);

    const jobOptions = {
      ...this.defaultJobOptions,
      ...options,
      priority: options.priority || 0,
      delay: options.delay || 0,
      attempts: options.maxAttempts || 3,
      backoff: options.backoff || {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: options.removeOnComplete !== false,
      removeOnFail: options.removeOnFail !== false,
    };

    try {
      const job = await bullQueue.add(data, jobOptions);

      return {
        id: job.id.toString(),
        queue,
        status: await job.getState(),
      };
    } catch (error) {
      throw new Error(`Failed to add job to queue: ${error.message}`);
    }
  }

  /**
   * Processes jobs from a queue
   * @param {string} queue - Queue name
   * @param {Function} processor - Job processor function
   * @param {Object} [options] - Processing options
   */
  async processJobs(queue, processor, options = {}) {
    super.processJobs(queue, processor, options); // Validation

    const bullQueue = this.getOrCreateQueue(queue);
    const concurrency = options.concurrency || 1;

    try {
      bullQueue.process(concurrency, async (job) => {
        // Wrap Bull job to match our interface
        const wrappedJob = {
          id: job.id.toString(),
          queue,
          data: job.data,
          options: job.opts,
          attempts: job.attemptsMade,
          maxAttempts: job.opts.attempts,
        };

        try {
          const result = await processor(this._standardizeJob(wrappedJob));

          // If job has a reportProgress method, call it with 100% on completion
          if (job.progress && typeof job.progress === 'function') {
            await job.progress(100);
          }

          return result;
        } catch (error) {
          // Rethrow to let Bull handle retry logic
          throw error;
        }
      });

      // Set up event handlers
      if (options.onCompleted) {
        bullQueue.on('completed', (job, result) => {
          options.onCompleted(job.id.toString(), result);
        });
      }

      if (options.onFailed) {
        bullQueue.on('failed', (job, error) => {
          options.onFailed(job.id.toString(), error);
        });
      }

      if (options.onProgress) {
        bullQueue.on('progress', (job, progress) => {
          options.onProgress(job.id.toString(), progress);
        });
      }

      // Additional events
      if (options.onStalled) {
        bullQueue.on('stalled', (job) => {
          options.onStalled(job.id.toString());
        });
      }
    } catch (error) {
      throw new Error(`Failed to process queue: ${error.message}`);
    }
  }

  /**
   * Gets a specific job by ID
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Job data
   */
  async getJob(queue, jobId) {
    super.getJob(queue, jobId); // Validation

    const bullQueue = this.getOrCreateQueue(queue);

    try {
      const job = await bullQueue.getJob(jobId);

      if (!job) return null;

      const state = await job.getState();

      return {
        id: job.id.toString(),
        queue,
        data: job.data,
        options: job.opts,
        status: state,
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts,
        progress: job.progress(),
        createdAt: new Date(job.timestamp),
        processedAt: job.processedOn ? new Date(job.processedOn) : null,
        completedAt: job.finishedOn ? new Date(job.finishedOn) : null,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
      };
    } catch (error) {
      throw new Error(`Failed to get job: ${error.message}`);
    }
  }

  /**
   * Updates a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @param {Object} update - Update data
   * @returns {Promise<boolean>} Success status
   */
  async updateJob(queue, jobId, update) {
    super.updateJob(queue, jobId, update); // Validation

    const bullQueue = this.getOrCreateQueue(queue);

    try {
      const job = await bullQueue.getJob(jobId);

      if (!job) return false;

      // Update progress if provided
      if (update.progress !== undefined) {
        await job.progress(update.progress);
      }

      // Update data if provided
      if (update.data) {
        await job.update(update.data);
      }

      // Some updates might require moving to a different state
      if (update.status === 'failed' && update.error) {
        // Manually fail the job
        await job.moveToFailed(new Error(update.error), true);
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }
  }

  /**
   * Removes a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async removeJob(queue, jobId) {
    super.removeJob(queue, jobId); // Validation

    const bullQueue = this.getOrCreateQueue(queue);

    try {
      const job = await bullQueue.getJob(jobId);

      if (!job) return false;

      await job.remove();
      return true;
    } catch (error) {
      throw new Error(`Failed to remove job: ${error.message}`);
    }
  }

  /**
   * Gets queue information
   * @param {string} queue - Queue name
   * @returns {Promise<Object>} Queue statistics
   */
  async getQueueInfo(queue) {
    super.getQueueInfo(queue); // Validation

    const bullQueue = this.getOrCreateQueue(queue);

    try {
      const [waiting, active, completed, failed, delayed, paused] =
        await Promise.all([
          bullQueue.getWaitingCount(),
          bullQueue.getActiveCount(),
          bullQueue.getCompletedCount(),
          bullQueue.getFailedCount(),
          bullQueue.getDelayedCount(),
          bullQueue.getPausedCount(),
        ]);

      return {
        name: queue,
        total: waiting + active + completed + failed + delayed + paused,
        pending: waiting,
        processing: active,
        completed,
        failed,
        delayed,
        paused,
      };
    } catch (error) {
      throw new Error(`Failed to get queue info: ${error.message}`);
    }
  }

  /**
   * Clears a queue
   * @param {string} queue - Queue name
   * @returns {Promise<boolean>} Success status
   */
  async clearQueue(queue) {
    super.clearQueue(queue); // Validation

    const bullQueue = this.getOrCreateQueue(queue);

    try {
      await bullQueue.empty();
      return true;
    } catch (error) {
      throw new Error(`Failed to clear queue: ${error.message}`);
    }
  }

  /**
   * Stops processing jobs
   * @returns {Promise<void>}
   */
  async stop() {
    const closePromises = [];

    for (const [name, queue] of this.queues.entries()) {
      try {
        closePromises.push(queue.close());
      } catch (error) {
        console.error(`Error closing queue ${name}:`, error);
      }
    }

    try {
      await Promise.all(closePromises);
    } catch (error) {
      console.error('Error closing queues:', error);
    } finally {
      this.queues.clear();
      this.isInitialized = false;
    }
  }

  /**
   * Additional Bull-specific methods
   */

  /**
   * Pauses a queue
   * @param {string} queue - Queue name
   * @param {boolean} [isLocal=false] - If true, pause only locally
   * @returns {Promise<void>}
   */
  async pauseQueue(queue, isLocal = false) {
    this._validateQueue(queue); // Validation

    const bullQueue = this.getOrCreateQueue(queue);

    try {
      await bullQueue.pause(isLocal);
    } catch (error) {
      throw new Error(`Failed to pause queue: ${error.message}`);
    }
  }

  /**
   * Resumes a queue
   * @param {string} queue - Queue name
   * @param {boolean} [isLocal=false] - If true, resume only locally
   * @returns {Promise<void>}
   */
  async resumeQueue(queue, isLocal = false) {
    this._validateQueue(queue); // Validation

    const bullQueue = this.getOrCreateQueue(queue);

    try {
      await bullQueue.resume(isLocal);
    } catch (error) {
      throw new Error(`Failed to resume queue: ${error.message}`);
    }
  }

  /**
   * Gets failed jobs
   * @param {string} queue - Queue name
   * @param {number} [start=0] - Start index
   * @param {number} [end=-1] - End index
   * @returns {Promise<Array>} Failed jobs
   */
  async getFailedJobs(queue, start = 0, end = -1) {
    this._validateQueue(queue); // Validation

    const bullQueue = this.getOrCreateQueue(queue);

    try {
      const jobs = await bullQueue.getFailed(start, end);

      return jobs.map((job) => ({
        id: job.id.toString(),
        queue,
        data: job.data,
        options: job.opts,
        status: 'failed',
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts,
        createdAt: new Date(job.timestamp),
        processedAt: job.processedOn ? new Date(job.processedOn) : null,
        failedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      }));
    } catch (error) {
      throw new Error(`Failed to get failed jobs: ${error.message}`);
    }
  }

  /**
   * Retries a failed job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async retryJob(queue, jobId) {
    this._validateQueue(queue); // Validation
    this._validateJobId(jobId); // Validation

    const bullQueue = this.getOrCreateQueue(queue);

    try {
      const job = await bullQueue.getJob(jobId);

      if (!job) return false;

      const state = await job.getState();
      if (state !== 'failed') {
        return false;
      }

      await job.retry();
      return true;
    } catch (error) {
      throw new Error(`Failed to retry job: ${error.message}`);
    }
  }

  /**
   * Gets all jobs of a specific type
   * @param {string} queue - Queue name
   * @param {string} type - Job type (active, waiting, delayed, completed, failed)
   * @param {number} [start=0] - Start index
   * @param {number} [end=-1] - End index
   * @returns {Promise<Array>} Jobs
   */
  async getJobs(queue, type, start = 0, end = -1) {
    this._validateQueue(queue); // Validation

    if (
      !['active', 'waiting', 'delayed', 'completed', 'failed'].includes(type)
    ) {
      throw new Error(
        'Invalid job type. Must be one of: active, waiting, delayed, completed, failed'
      );
    }

    const bullQueue = this.getOrCreateQueue(queue);

    try {
      const jobs = await bullQueue.getJobs([type], start, end);

      return jobs.map((job) =>
        this._standardizeJob({
          id: job.id.toString(),
          queue,
          data: job.data,
          options: job.opts,
          status: type === 'waiting' ? 'pending' : type,
          failedReason: job.failedReason,
          stacktrace: job.stacktrace,
          attempts: job.attemptsMade,
          maxAttempts: job.opts.attempts,
          createdAt: new Date(job.timestamp),
          processedAt: job.processedOn ? new Date(job.processedOn) : null,
          completedAt:
            type === 'completed' && job.finishedOn
              ? new Date(job.finishedOn)
              : null,
          failedAt:
            type === 'failed' && job.finishedOn
              ? new Date(job.finishedOn)
              : null,
        })
      );
    } catch (error) {
      throw new Error(`Failed to get ${type} jobs: ${error.message}`);
    }
  }

  /**
   * Gets job counts
   * @param {string} queue - Queue name
   * @returns {Promise<Object>} Job counts
   */
  async getJobCounts(queue) {
    this._validateQueue(queue); // Validation

    const bullQueue = this.getOrCreateQueue(queue);

    try {
      const counts = await bullQueue.getJobCounts();
      return counts;
    } catch (error) {
      throw new Error(`Failed to get job counts: ${error.message}`);
    }
  }

  /**
   * Cleans up completed jobs
   * @param {string} queue - Queue name
   * @param {number} [grace=3600000] - Grace period in milliseconds
   * @param {string} [status='completed'] - Job status to clean up
   * @param {number} [limit=1000] - Maximum number of jobs to clean up
   * @returns {Promise<number>} Number of jobs removed
   */
  async cleanUp(queue, grace = 3600000, status = 'completed', limit = 1000) {
    this._validateQueue(queue); // Validation

    if (!['completed', 'failed', 'all'].includes(status)) {
      throw new Error('Invalid status. Must be one of: completed, failed, all');
    }

    const bullQueue = this.getOrCreateQueue(queue);

    try {
      const jobs = await bullQueue.clean(grace, status, limit);
      return jobs.length;
    } catch (error) {
      throw new Error(`Failed to clean up jobs: ${error.message}`);
    }
  }
}
