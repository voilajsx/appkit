/**
 * @voilajs/appkit - Database queue adapter
 * @module @voilajs/appkit/queue/adapters/database
 */

import { QueueAdapter } from './base.js';
import pg from 'pg';
import mysql from 'mysql2/promise';

/**
 * Helper for generating SQL with proper placeholders
 * @private
 * @param {string} dbType - Database type ('postgres' or 'mysql')
 * @param {string} sql - SQL query with ? placeholders
 * @returns {string} SQL with database-specific placeholders
 */
function formatSql(dbType, sql) {
  if (dbType !== 'postgres') {
    return sql;
  }

  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

/**
 * Database queue adapter (PostgreSQL/MySQL)
 * @extends QueueAdapter
 */
export class DatabaseAdapter extends QueueAdapter {
  constructor(config = {}) {
    super(config);
    this.dbType = config.type || 'postgres';
    this.connectionString = config.connectionString;
    this.connectionPool = config.connectionPool || {};
    this.connection = null;
    this.processors = new Map();
    this.processing = false;
    this.pollInterval = config.pollInterval || 1000;
    this.maxConcurrency = config.maxConcurrency || 10;
    this.tableName = config.tableName || 'jobs';
  }

  /**
   * Initializes the database connection and creates tables
   * @returns {Promise<void>}
   */
  async initialize() {
    await super.initialize();

    try {
      // Connect to database
      if (this.dbType === 'postgres') {
        const { Pool } = pg;
        this.connection = new Pool({
          connectionString: this.connectionString,
          max: this.connectionPool.max || 10,
          idleTimeoutMillis: this.connectionPool.idleTimeoutMillis || 30000,
          connectionTimeoutMillis:
            this.connectionPool.connectionTimeoutMillis || 5000,
        });

        // Test connection
        const client = await this.connection.connect();
        client.release();
      } else if (this.dbType === 'mysql') {
        this.connection = await mysql.createPool({
          uri: this.connectionString,
          connectionLimit: this.connectionPool.max || 10,
          ...this.connectionPool,
        });

        // Test connection
        await this.connection.query('SELECT 1');
      } else {
        throw new Error(`Unsupported database type: ${this.dbType}`);
      }

      // Create jobs table if not exists
      await this.createJobsTable();
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  /**
   * Creates the jobs table
   * @private
   * @returns {Promise<void>}
   */
  async createJobsTable() {
    const createTableSql =
      this.dbType === 'postgres'
        ? `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id SERIAL PRIMARY KEY,
        queue VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        options JSONB DEFAULT '{}',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        priority INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        error TEXT,
        result TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        process_after TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        failed_at TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_${this.tableName}_queue_status 
      ON ${this.tableName}(queue, status, process_after, priority);
    `
        : `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        queue VARCHAR(255) NOT NULL,
        data JSON NOT NULL,
        options JSON DEFAULT '{}',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        priority INT DEFAULT 0,
        attempts INT DEFAULT 0,
        max_attempts INT DEFAULT 3,
        error TEXT,
        result TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        process_after TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        failed_at TIMESTAMP NULL,
        INDEX idx_${this.tableName}_queue_status (queue, status, process_after, priority)
      );
    `;

    await this.query(createTableSql);
  }

  /**
   * Executes a query
   * @private
   * @param {string} sql - SQL query
   * @param {Array} [params] - Query parameters
   * @returns {Promise<Object>} Query result
   */
  async query(sql, params = []) {
    try {
      if (this.dbType === 'postgres') {
        const result = await this.connection.query(sql, params);
        return { rows: result.rows, fields: result.fields };
      } else {
        const [rows, fields] = await this.connection.execute(sql, params);
        return { rows, fields };
      }
    } catch (error) {
      throw new Error(`Database query failed: ${error.message}`);
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
    super.addJob(queue, data, options); // Validation

    const delay = options.delay || 0;
    const processAfter = new Date(Date.now() + delay);

    const sql = formatSql(
      this.dbType,
      `
      INSERT INTO ${this.tableName} (queue, data, options, priority, max_attempts, process_after)
      VALUES (?, ?, ?, ?, ?, ?)
      ${this.dbType === 'postgres' ? 'RETURNING id, queue, status' : ''}
    `
    );

    const params = [
      queue,
      JSON.stringify(data),
      JSON.stringify(options),
      options.priority || 0,
      options.maxAttempts || 3,
      processAfter,
    ];

    try {
      const result = await this.query(sql, params);

      let jobId;
      if (this.dbType === 'postgres') {
        jobId = result.rows[0].id;
      } else {
        jobId = result.rows.insertId;
      }

      // Trigger processing
      this.startProcessing();

      return {
        id: jobId.toString(),
        queue,
        status: 'pending',
      };
    } catch (error) {
      throw new Error(`Failed to add job: ${error.message}`);
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

    this.processors.set(queue, {
      processor,
      concurrency: Math.min(options.concurrency || 1, this.maxConcurrency),
      options,
    });

    this.startProcessing();
  }

  /**
   * Gets a specific job by ID
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Job data
   */
  async getJob(queue, jobId) {
    super.getJob(queue, jobId); // Validation

    const sql = formatSql(
      this.dbType,
      `
      SELECT * FROM ${this.tableName} 
      WHERE queue = ? AND id = ?
    `
    );

    try {
      const result = await this.query(sql, [queue, parseInt(jobId, 10)]);

      if (!result.rows.length) {
        return null;
      }

      const job = result.rows[0];
      return this.formatJob(job);
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

    const sets = [];
    const values = [];

    Object.entries(update).forEach(([key, value]) => {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );

      // Handle special cases
      if (key === 'data' || key === 'options') {
        value = JSON.stringify(value);
      }

      sets.push(`${snakeKey} = ?`);
      values.push(value);
    });

    values.push(queue, parseInt(jobId, 10));

    const sql = formatSql(
      this.dbType,
      `
      UPDATE ${this.tableName} 
      SET ${sets.join(', ')}
      WHERE queue = ? AND id = ?
    `
    );

    try {
      const result = await this.query(sql, values);
      return result.rows.affectedRows > 0 || result.rows.rowCount > 0;
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

    const sql = formatSql(
      this.dbType,
      `
      DELETE FROM ${this.tableName} 
      WHERE queue = ? AND id = ?
    `
    );

    try {
      const result = await this.query(sql, [queue, parseInt(jobId, 10)]);
      return result.rows.affectedRows > 0 || result.rows.rowCount > 0;
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

    const now = this.dbType === 'postgres' ? 'NOW()' : 'NOW()';

    const sql = formatSql(
      this.dbType,
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'pending' AND process_after > ${now} THEN 1 ELSE 0 END) as delayed
      FROM ${this.tableName}
      WHERE queue = ?
    `
    );

    try {
      const result = await this.query(sql, [queue]);
      const stats = result.rows[0];

      return {
        name: queue,
        total: parseInt(stats.total, 10) || 0,
        pending: parseInt(stats.pending, 10) || 0,
        processing: parseInt(stats.processing, 10) || 0,
        completed: parseInt(stats.completed, 10) || 0,
        failed: parseInt(stats.failed, 10) || 0,
        delayed: parseInt(stats.delayed, 10) || 0,
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

    const sql = formatSql(
      this.dbType,
      `DELETE FROM ${this.tableName} WHERE queue = ?`
    );

    try {
      await this.query(sql, [queue]);
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
    this.processing = false;
    this.processors.clear();

    if (this.connection) {
      try {
        await this.connection.end();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }

    this.isInitialized = false;
  }

  /**
   * Starts the processing loop
   * @private
   */
  startProcessing() {
    if (this.processing) return;

    this.processing = true;
    this.processLoop();
  }

  /**
   * Main processing loop
   * @private
   */
  async processLoop() {
    while (this.processing && this.processors.size > 0) {
      try {
        await this.processNextBatch();
      } catch (error) {
        console.error('Error in process loop:', error);
        // Add delay after error to prevent CPU spinning
        await new Promise((resolve) =>
          setTimeout(resolve, this.pollInterval * 2)
        );
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
    }
  }

  /**
   * Processes the next batch of jobs
   * @private
   */
  async processNextBatch() {
    for (const [queueName, config] of this.processors.entries()) {
      const { processor, concurrency } = config;

      // Get available jobs
      try {
        const jobs = await this.getNextJobs(queueName, concurrency);

        // Process jobs concurrently
        if (jobs.length > 0) {
          const promises = jobs.map((job) => this.processJob(job, processor));
          await Promise.allSettled(promises);
        }
      } catch (error) {
        console.error(`Error processing batch for queue ${queueName}:`, error);
      }
    }
  }

  /**
   * Gets the next available jobs
   * @private
   * @param {string} queue - Queue name
   * @param {number} limit - Number of jobs to get
   * @returns {Promise<Array>} Jobs
   */
  async getNextJobs(queue, limit) {
    // Select and lock jobs for processing
    if (this.dbType === 'postgres') {
      const sql = `
        UPDATE ${this.tableName}
        SET status = 'processing', started_at = NOW()
        WHERE id IN (
          SELECT id FROM ${this.tableName}
          WHERE queue = $1 
            AND status = 'pending' 
            AND process_after <= NOW()
          ORDER BY priority DESC, created_at ASC
          LIMIT $2
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *
      `;

      const result = await this.query(sql, [queue, limit]);
      return result.rows.map((job) => this.formatJob(job));
    } else {
      // For MySQL, use a transaction to select and update
      let conn;
      try {
        conn = await this.connection.getConnection();
        await conn.beginTransaction();

        // First, select the jobs with a lock
        const selectSql = `
          SELECT id FROM ${this.tableName}
          WHERE queue = ? 
            AND status = 'pending' 
            AND process_after <= NOW()
          ORDER BY priority DESC, created_at ASC
          LIMIT ?
          FOR UPDATE
        `;

        const [rows] = await conn.execute(selectSql, [queue, limit]);

        if (rows.length === 0) {
          await conn.commit();
          conn.release();
          return [];
        }

        const ids = rows.map((row) => row.id);

        // Then update them
        const updateSql = `
          UPDATE ${this.tableName}
          SET status = 'processing', started_at = NOW()
          WHERE id IN (${ids.map(() => '?').join(',')})
        `;

        await conn.execute(updateSql, ids);

        // Finally, select the updated jobs
        const finalSql = `
          SELECT * FROM ${this.tableName}
          WHERE id IN (${ids.map(() => '?').join(',')})
        `;

        const [updatedRows] = await conn.execute(finalSql, ids);
        await conn.commit();
        conn.release();

        return updatedRows.map((job) => this.formatJob(job));
      } catch (error) {
        if (conn) {
          try {
            await conn.rollback();
            conn.release();
          } catch (rollbackError) {
            console.error('Error rolling back transaction:', rollbackError);
          }
        }
        throw error;
      }
    }
  }

  /**
   * Processes a single job
   * @private
   * @param {Object} job - Job data
   * @param {Function} processor - Job processor function
   */
  async processJob(job, processor) {
    try {
      job.attempts++;

      const result = await processor(job);

      // Mark as completed
      await this.updateJob(job.queue, job.id, {
        status: 'completed',
        completed_at: new Date(),
        result:
          typeof result === 'object' ? JSON.stringify(result) : String(result),
      });
    } catch (error) {
      // Mark as failed
      await this.updateJob(job.queue, job.id, {
        status: 'failed',
        failed_at: new Date(),
        error: error.message,
        attempts: job.attempts,
      });

      // Check if should retry
      if (job.attempts < job.maxAttempts) {
        const retryDelay = this._calculateRetryDelay(job.attempts, job.options);
        const processAfter = new Date(Date.now() + retryDelay);

        await this.updateJob(job.queue, job.id, {
          status: 'pending',
          process_after: processAfter,
        });
      }
    }
  }

  /**
   * Formats a job from database row
   * @private
   * @param {Object} row - Database row
   * @returns {Object} Formatted job
   */
  formatJob(row) {
    return this._standardizeJob({
      id: row.id.toString(),
      queue: row.queue,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
      options:
        typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      status: row.status,
      priority: row.priority,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      error: row.error,
      result: row.result,
      createdAt: row.created_at,
      processAfter: row.process_after,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      failedAt: row.failed_at,
    });
  }

  /**
   * Additional database-specific methods
   */

  /**
   * Gets failed jobs
   * @param {string} queue - Queue name
   * @param {number} [limit=10] - Number of jobs to retrieve
   * @returns {Promise<Array>} Failed jobs
   */
  async getFailedJobs(queue, limit = 10) {
    this._validateQueue(queue); // Validation

    const sql = formatSql(
      this.dbType,
      `
      SELECT * FROM ${this.tableName}
      WHERE queue = ? AND status = 'failed'
      ORDER BY failed_at DESC
      LIMIT ?
    `
    );

    try {
      const result = await this.query(sql, [queue, limit]);
      return result.rows.map((job) => this.formatJob(job));
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

    const now = this.dbType === 'postgres' ? 'NOW()' : 'NOW()';

    const sql = formatSql(
      this.dbType,
      `
      UPDATE ${this.tableName}
      SET status = 'pending', 
          attempts = 0,
          error = NULL,
          failed_at = NULL,
          process_after = ${now}
      WHERE queue = ? AND id = ? AND status = 'failed'
    `
    );

    try {
      const result = await this.query(sql, [queue, parseInt(jobId, 10)]);

      if (result.rows.affectedRows > 0 || result.rows.rowCount > 0) {
        this.startProcessing();
        return true;
      }

      return false;
    } catch (error) {
      throw new Error(`Failed to retry job: ${error.message}`);
    }
  }

  /**
   * Gets jobs by status
   * @param {string} queue - Queue name
   * @param {string} status - Job status
   * @param {number} [limit=10] - Number of jobs to retrieve
   * @returns {Promise<Array>} Jobs
   */
  async getJobsByStatus(queue, status, limit = 10) {
    this._validateQueue(queue); // Validation

    if (!status) {
      throw new Error('Status is required');
    }

    const sql = formatSql(
      this.dbType,
      `
      SELECT * FROM ${this.tableName}
      WHERE queue = ? AND status = ?
      ORDER BY created_at DESC
      LIMIT ?
    `
    );

    try {
      const result = await this.query(sql, [queue, status, limit]);
      return result.rows.map((job) => this.formatJob(job));
    } catch (error) {
      throw new Error(`Failed to get jobs by status: ${error.message}`);
    }
  }

  /**
   * Cleans up old completed jobs
   * @param {string} queue - Queue name
   * @param {number} [daysOld=7] - Age of jobs to remove
   * @returns {Promise<number>} Number of jobs removed
   */
  async cleanupOldJobs(queue, daysOld = 7) {
    this._validateQueue(queue); // Validation

    let sql;
    let params;

    if (this.dbType === 'postgres') {
      sql = `
        DELETE FROM ${this.tableName}
        WHERE queue = $1 
          AND status IN ('completed', 'failed')
          AND completed_at < NOW() - INTERVAL '${daysOld} days'
      `;
      params = [queue];
    } else {
      sql = `
        DELETE FROM ${this.tableName}
        WHERE queue = ? 
          AND status IN ('completed', 'failed')
          AND completed_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `;
      params = [queue, daysOld];
    }

    try {
      const result = await this.query(sql, params);
      return result.rows.affectedRows || result.rows.rowCount || 0;
    } catch (error) {
      throw new Error(`Failed to cleanup old jobs: ${error.message}`);
    }
  }

  /**
   * Gets job counts grouped by status
   * @param {string} queue - Queue name
   * @returns {Promise<Object>} Job counts by status
   */
  async getJobCountsByStatus(queue) {
    this._validateQueue(queue); // Validation

    const sql = formatSql(
      this.dbType,
      `
      SELECT 
        status,
        COUNT(*) as count
      FROM ${this.tableName}
      WHERE queue = ?
      GROUP BY status
    `
    );

    try {
      const result = await this.query(sql, [queue]);

      // Transform to object with status keys
      const counts = { total: 0 };
      result.rows.forEach((row) => {
        counts[row.status] = parseInt(row.count, 10);
        counts.total += parseInt(row.count, 10);
      });

      // Ensure all statuses have counts
      const statuses = [
        'pending',
        'processing',
        'completed',
        'failed',
        'delayed',
      ];
      statuses.forEach((status) => {
        if (counts[status] === undefined) {
          counts[status] = 0;
        }
      });

      return counts;
    } catch (error) {
      throw new Error(`Failed to get job counts by status: ${error.message}`);
    }
  }

  /**
   * Updates many jobs at once
   * @param {string} queue - Queue name
   * @param {Object} filter - Filter conditions
   * @param {Object} update - Update data
   * @returns {Promise<number>} Number of jobs updated
   */
  async updateJobs(queue, filter, update) {
    this._validateQueue(queue); // Validation

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be an object');
    }

    if (!update || typeof update !== 'object') {
      throw new Error('Update must be an object');
    }

    // Build where conditions
    const conditions = ['queue = ?'];
    const params = [queue];

    Object.entries(filter).forEach(([key, value]) => {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      conditions.push(`${snakeKey} = ?`);
      params.push(value);
    });

    // Build update sets
    const sets = [];

    Object.entries(update).forEach(([key, value]) => {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );

      // Handle special cases
      if (key === 'data' || key === 'options') {
        value = JSON.stringify(value);
      }

      sets.push(`${snakeKey} = ?`);
      params.push(value);
    });

    if (sets.length === 0) {
      throw new Error('No update fields provided');
    }

    const sql = formatSql(
      this.dbType,
      `
      UPDATE ${this.tableName}
      SET ${sets.join(', ')}
      WHERE ${conditions.join(' AND ')}
    `
    );

    try {
      const result = await this.query(sql, params);
      return result.rows.affectedRows || result.rows.rowCount || 0;
    } catch (error) {
      throw new Error(`Failed to update jobs: ${error.message}`);
    }
  }

  /**
   * Reschedules a job to run at a specific time
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @param {Date} processAfter - When to process the job
   * @returns {Promise<boolean>} Success status
   */
  async rescheduleJob(queue, jobId, processAfter) {
    this._validateQueue(queue); // Validation
    this._validateJobId(jobId); // Validation

    if (!(processAfter instanceof Date)) {
      throw new Error('processAfter must be a Date object');
    }

    return this.updateJob(queue, jobId, {
      status: 'pending',
      process_after: processAfter,
    });
  }

  /**
   * Gets jobs scheduled to run in the future
   * @param {string} queue - Queue name
   * @param {number} [limit=10] - Maximum number of jobs to return
   * @returns {Promise<Array>} Scheduled jobs
   */
  async getScheduledJobs(queue, limit = 10) {
    this._validateQueue(queue); // Validation

    const now = this.dbType === 'postgres' ? 'NOW()' : 'NOW()';

    const sql = formatSql(
      this.dbType,
      `
      SELECT * FROM ${this.tableName}
      WHERE queue = ? 
        AND status = 'pending'
        AND process_after > ${now}
      ORDER BY process_after ASC
      LIMIT ?
    `
    );

    try {
      const result = await this.query(sql, [queue, limit]);
      return result.rows.map((job) => this.formatJob(job));
    } catch (error) {
      throw new Error(`Failed to get scheduled jobs: ${error.message}`);
    }
  }

  /**
   * Gets total job count across all queues
   * @returns {Promise<number>} Total job count
   */
  async getTotalJobCount() {
    const sql = formatSql(
      this.dbType,
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );

    try {
      const result = await this.query(sql);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw new Error(`Failed to get total job count: ${error.message}`);
    }
  }

  /**
   * Gets available queues
   * @returns {Promise<Array>} Array of queue names
   */
  async getQueues() {
    const sql = formatSql(
      this.dbType,
      `
      SELECT DISTINCT queue 
      FROM ${this.tableName}
      ORDER BY queue
    `
    );

    try {
      const result = await this.query(sql);
      return result.rows.map((row) => row.queue);
    } catch (error) {
      throw new Error(`Failed to get queues: ${error.message}`);
    }
  }

  /**
   * Gets job processing metrics
   * @param {string} queue - Queue name
   * @param {number} [timeSpan=86400000] - Time span in milliseconds (default: 24 hours)
   * @returns {Promise<Object>} Processing metrics
   */
  async getProcessingMetrics(queue, timeSpan = 86400000) {
    this._validateQueue(queue); // Validation

    let timeCondition;
    let params = [queue];

    if (this.dbType === 'postgres') {
      timeCondition = `completed_at > NOW() - INTERVAL '${timeSpan / 1000} seconds'`;
    } else {
      timeCondition = 'completed_at > DATE_SUB(NOW(), INTERVAL ? SECOND)';
      params.push(timeSpan / 1000);
    }

    const sql = formatSql(
      this.dbType,
      `
      SELECT 
        COUNT(*) as total_processed,
        AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000) as avg_processing_time,
        MIN(EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000) as min_processing_time,
        MAX(EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000) as max_processing_time
      FROM ${this.tableName}
      WHERE queue = ?
        AND status = 'completed'
        AND ${timeCondition}
    `
    );

    try {
      const result = await this.query(sql, params);
      const metrics = result.rows[0];

      return {
        totalProcessed: parseInt(metrics.total_processed, 10) || 0,
        avgProcessingTime: parseFloat(metrics.avg_processing_time) || 0,
        minProcessingTime: parseFloat(metrics.min_processing_time) || 0,
        maxProcessingTime: parseFloat(metrics.max_processing_time) || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get processing metrics: ${error.message}`);
    }
  }

  /**
   * Create a recurring job
   * @param {string} queue - Queue name
   * @param {Object} data - Job data
   * @param {Object} options - Job options
   * @param {string} cronExpression - Cron expression for scheduling
   * @returns {Promise<Object>} Job info
   */
  async createRecurringJob(queue, data, options = {}, cronExpression) {
    this._validateQueue(queue); // Validation

    if (!cronExpression) {
      throw new Error('Cron expression is required');
    }

    // Add metadata to identify this as a recurring job template
    const recurringOptions = {
      ...options,
      recurring: true,
      cronExpression,
      lastScheduled: null,
    };

    const sql = formatSql(
      this.dbType,
      `
      INSERT INTO ${this.tableName} (
        queue, 
        data, 
        options, 
        status,
        priority, 
        process_after
      )
      VALUES (?, ?, ?, 'recurring', ?, NOW())
      ${this.dbType === 'postgres' ? 'RETURNING id, queue, status' : ''}
    `
    );

    const params = [
      queue,
      JSON.stringify(data),
      JSON.stringify(recurringOptions),
      options.priority || 0,
    ];

    try {
      const result = await this.query(sql, params);

      let jobId;
      if (this.dbType === 'postgres') {
        jobId = result.rows[0].id;
      } else {
        jobId = result.rows.insertId;
      }

      return {
        id: jobId.toString(),
        queue,
        status: 'recurring',
        cronExpression,
      };
    } catch (error) {
      throw new Error(`Failed to create recurring job: ${error.message}`);
    }
  }
}
