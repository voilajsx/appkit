/**
 * @voilajs/appkit - Base queue adapter
 * @module @voilajs/appkit/queue/adapters/base
 */

/**
 * Base queue adapter interface
 */
export class QueueAdapter {
  constructor(config = {}) {
    this.config = config;
    this.isInitialized = false;
  }

  /**
   * Initializes the queue adapter
   * @returns {Promise<void>}
   */
  async initialize() {
    this.isInitialized = true;
  }

  /**
   * Validates that the adapter is initialized
   * @private
   * @throws {Error} If the adapter is not initialized
   */
  _validateInitialized() {
    if (!this.isInitialized) {
      throw new Error(
        'Queue adapter not initialized. Call initialize() first.'
      );
    }
  }

  /**
   * Validates queue name
   * @private
   * @param {string} queue - Queue name to validate
   * @throws {Error} If queue name is invalid
   */
  _validateQueue(queue) {
    if (!queue) {
      throw new Error('Queue name is required');
    }
    if (typeof queue !== 'string') {
      throw new Error('Queue name must be a string');
    }
  }

  /**
   * Validates job ID
   * @private
   * @param {string} jobId - Job ID to validate
   * @throws {Error} If job ID is invalid
   */
  _validateJobId(jobId) {
    if (!jobId) {
      throw new Error('Job ID is required');
    }
    if (typeof jobId !== 'string') {
      throw new Error('Job ID must be a string');
    }
  }

  /**
   * Adds a job to a queue
   * @param {string} queue - Queue name
   * @param {Object} data - Job data
   * @param {Object} [options] - Job options
   * @returns {Promise<Object>} Job info
   */
  async addJob(queue, data, options = {}) {
    this._validateInitialized();
    this._validateQueue(queue);
    if (data === undefined || data === null) {
      throw new Error('Job data is required');
    }
    throw new Error('addJob() must be implemented by subclass');
  }

  /**
   * Processes jobs from a queue
   * @param {string} queue - Queue name
   * @param {Function} processor - Job processor function
   * @param {Object} [options] - Processing options
   * @returns {void}
   */
  async processJobs(queue, processor, options = {}) {
    this._validateInitialized();
    this._validateQueue(queue);
    if (typeof processor !== 'function') {
      throw new Error('Job processor must be a function');
    }
    throw new Error('processJobs() must be implemented by subclass');
  }

  /**
   * Gets a specific job by ID
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Job data
   */
  async getJob(queue, jobId) {
    this._validateInitialized();
    this._validateQueue(queue);
    this._validateJobId(jobId);
    throw new Error('getJob() must be implemented by subclass');
  }

  /**
   * Updates a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @param {Object} update - Update data
   * @returns {Promise<boolean>} Success status
   */
  async updateJob(queue, jobId, update) {
    this._validateInitialized();
    this._validateQueue(queue);
    this._validateJobId(jobId);
    if (!update || typeof update !== 'object') {
      throw new Error('Update data must be an object');
    }
    throw new Error('updateJob() must be implemented by subclass');
  }

  /**
   * Removes a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async removeJob(queue, jobId) {
    this._validateInitialized();
    this._validateQueue(queue);
    this._validateJobId(jobId);
    throw new Error('removeJob() must be implemented by subclass');
  }

  /**
   * Gets queue information
   * @param {string} queue - Queue name
   * @returns {Promise<Object>} Queue statistics
   */
  async getQueueInfo(queue) {
    this._validateInitialized();
    this._validateQueue(queue);
    throw new Error('getQueueInfo() must be implemented by subclass');
  }

  /**
   * Clears a queue
   * @param {string} queue - Queue name
   * @returns {Promise<boolean>} Success status
   */
  async clearQueue(queue) {
    this._validateInitialized();
    this._validateQueue(queue);
    throw new Error('clearQueue() must be implemented by subclass');
  }

  /**
   * Stops processing jobs
   * @returns {Promise<void>}
   */
  async stop() {
    throw new Error('stop() must be implemented by subclass');
  }

  /**
   * Standardizes a job object format
   * @protected
   * @param {Object} job - Job data to standardize
   * @returns {Object} Standardized job object
   */
  _standardizeJob(job) {
    return {
      id: job.id.toString(),
      queue: job.queue,
      data: job.data || {},
      options: job.options || {},
      status: job.status || 'pending',
      priority: job.priority || 0,
      attempts: job.attempts || 0,
      maxAttempts: job.maxAttempts || job.options?.maxAttempts || 3,
      result: job.result || null,
      error: job.error || null,
      createdAt: job.createdAt || new Date(),
      processAfter: job.processAfter || job.createdAt || new Date(),
      startedAt: job.startedAt || null,
      completedAt: job.completedAt || null,
      failedAt: job.failedAt || null,
    };
  }

  /**
   * Calculates retry delay using exponential backoff
   * @protected
   * @param {number} attempts - Current attempt count
   * @param {Object} options - Job options
   * @returns {number} Delay in milliseconds
   */
  _calculateRetryDelay(attempts, options = {}) {
    const backoff = options.backoff || { type: 'exponential', delay: 1000 };
    const maxDelay = backoff.maxDelay || 30000;

    if (backoff.type === 'exponential') {
      return Math.min(backoff.delay * Math.pow(2, attempts - 1), maxDelay);
    } else if (backoff.type === 'fixed') {
      return backoff.delay || 1000;
    } else if (backoff.type === 'linear') {
      return Math.min(backoff.delay * attempts, maxDelay);
    }

    return 1000; // Default to 1 second
  }
}
