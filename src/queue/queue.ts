/**
 * Core queuing class with automatic transport management and job processing
 * @module @voilajsx/appkit/queue
 * @file src/queue/queue.ts
 * 
 * @llm-rule WHEN: Building queue instances - called via queueClass.get(), not directly
 * @llm-rule AVOID: Creating QueueClass directly - always use queueClass.get() for proper setup
 * @llm-rule NOTE: Auto-detects and switches between Memory, Redis, Database transports
 */

import { randomUUID } from 'crypto';
import { MemoryTransport } from './transports/memory.js';
import { RedisTransport } from './transports/redis.js';
import { DatabaseTransport } from './transports/database.js';
import type { QueueConfig } from './defaults.js';
import type { JobData, JobOptions, JobHandler, Queue, QueueStats, JobInfo, JobStatus } from './index.js';

export interface Transport {
  add(id: string, jobType: string, data: JobData, options: JobOptions): Promise<void>;
   process(jobType: string, handler: JobHandler<JobData>): void;  // Keep as JobData
  schedule(id: string, jobType: string, data: JobData, delay: number): Promise<void>;
  pause(jobType?: string): Promise<void>;
  resume(jobType?: string): Promise<void>;
  getStats(jobType?: string): Promise<QueueStats>;
  getJobs(status: JobStatus, jobType?: string): Promise<JobInfo[]>;
  retry(jobId: string): Promise<void>;
  remove(jobId: string): Promise<void>;
  clean(status: JobStatus, grace?: number): Promise<void>;
  getHealth(): { status: 'healthy' | 'degraded' | 'unhealthy'; message?: string };
  close(): Promise<void>;
}

/**
 * Core queuing class with automatic transport management
 */
export class QueueClass implements Queue {
  private config: QueueConfig;
  private transport: Transport;
  private transportType: string;
  private isClosing = false;

  constructor(config: QueueConfig) {
    this.config = config;
    this.transportType = config.transport;
    this.transport = this.initializeTransport();
    
    // Setup graceful shutdown
    this.setupGracefulShutdown();
  }

  /**
   * Initialize transport based on configuration
   * @llm-rule WHEN: QueueClass construction - sets up appropriate transport
   * @llm-rule AVOID: Manual transport selection - config determines transport type
   */
  private initializeTransport(): Transport {
    try {
      switch (this.config.transport) {
        case 'redis':
          if (!this.config.redis.url) {
            console.warn('Redis transport selected but REDIS_URL not available, falling back to memory');
            return new MemoryTransport(this.config);
          }
          return new RedisTransport(this.config);

        case 'database':
          if (!this.config.database.url) {
            console.warn('Database transport selected but DATABASE_URL not available, falling back to memory');
            return new MemoryTransport(this.config);
          }
          return new DatabaseTransport(this.config);

        case 'memory':
        default:
          return new MemoryTransport(this.config);
      }
    } catch (error) {
      console.error(`Failed to initialize ${this.config.transport} transport:`, (error as Error).message);
      console.log('Falling back to memory transport');
      this.transportType = 'memory';
      return new MemoryTransport(this.config);
    }
  }

  /**
   * Add job to queue with automatic ID generation and validation
   * @llm-rule WHEN: Adding background jobs for processing
   * @llm-rule AVOID: Direct transport calls - this handles ID generation and validation
   */
  async add<T = JobData>(jobType: string, data: T, options: JobOptions = {}): Promise<string> {
    this.validateJobType(jobType);
    this.validateJobData(data);

    const jobId = randomUUID();
    const jobOptions: JobOptions = {
      priority: options.priority ?? this.config.defaultPriority,
      delay: options.delay ?? 0,
      attempts: options.attempts ?? this.config.maxAttempts,
      backoff: options.backoff ?? this.config.retryBackoff,
      removeOnComplete: options.removeOnComplete ?? this.config.removeOnComplete,
      removeOnFail: options.removeOnFail ?? this.config.removeOnFail,
    };

    try {
      if (jobOptions.delay && jobOptions.delay > 0) {
        await this.transport.schedule(jobId, jobType, data as JobData, jobOptions.delay);
      } else {
        await this.transport.add(jobId, jobType, data as JobData, jobOptions);
      }
      
      return jobId;
    } catch (error) {
      throw new Error(`Failed to add job: ${(error as Error).message}`);
    }
  }

  /**
   * Register job processor for specific job type
   * @llm-rule WHEN: Setting up job handlers for background processing
   * @llm-rule AVOID: Multiple processors for same job type - causes conflicts
   */
  process<T = JobData>(jobType: string, handler: JobHandler<T>): void {
    this.validateJobType(jobType);
    this.validateHandler(handler as JobHandler<any>); 

    // Wrap handler with error handling and retry logic
    const wrappedHandler = this.wrapHandler<T>(handler);
    
    try {
        this.transport.process(jobType, wrappedHandler as JobHandler<JobData>);
    } catch (error) {
        throw new Error(`Failed to register processor for ${jobType}: ${(error as Error).message}`);
    }
    }

  /**
   * Schedule job for future execution
   * @llm-rule WHEN: Need to delay job execution (reminders, notifications, etc.)
   * @llm-rule AVOID: Using setTimeout - this persists across app restarts
   */
  async schedule<T = JobData>(jobType: string, data: T, delay: number): Promise<string> {
    this.validateJobType(jobType);
    this.validateJobData(data);
    this.validateDelay(delay);

    const jobId = randomUUID();
    
    try {
      await this.transport.schedule(jobId, jobType, data as JobData, delay);
      return jobId;
    } catch (error) {
      throw new Error(`Failed to schedule job: ${(error as Error).message}`);
    }
  }

  /**
   * Pause queue processing
   * @llm-rule WHEN: Maintenance mode or controlled shutdown
   * @llm-rule AVOID: Pausing without resume plan - jobs will accumulate
   */
  async pause(jobType?: string): Promise<void> {
    try {
      await this.transport.pause(jobType);
    } catch (error) {
      throw new Error(`Failed to pause queue: ${(error as Error).message}`);
    }
  }

  /**
   * Resume queue processing
   * @llm-rule WHEN: Resuming after maintenance or pause
   * @llm-rule AVOID: Resuming without checking system health
   */
  async resume(jobType?: string): Promise<void> {
    try {
      await this.transport.resume(jobType);
    } catch (error) {
      throw new Error(`Failed to resume queue: ${(error as Error).message}`);
    }
  }

  /**
   * Get queue statistics for monitoring
   * @llm-rule WHEN: Health checks, monitoring dashboards, debugging
   * @llm-rule AVOID: Frequent polling - can be expensive for some transports
   */
  async getStats(jobType?: string): Promise<QueueStats> {
    try {
      return await this.transport.getStats(jobType);
    } catch (error) {
      throw new Error(`Failed to get stats: ${(error as Error).message}`);
    }
  }

  /**
   * Get jobs by status for debugging and monitoring
   * @llm-rule WHEN: Debugging failed jobs or monitoring queue health
   * @llm-rule AVOID: Getting large result sets - use pagination for big queues
   */
  async getJobs(status: JobStatus, jobType?: string): Promise<JobInfo[]> {
    try {
      return await this.transport.getJobs(status, jobType);
    } catch (error) {
      throw new Error(`Failed to get jobs: ${(error as Error).message}`);
    }
  }

  /**
   * Retry failed job by ID
   * @llm-rule WHEN: Manual retry of failed jobs from admin interface
   * @llm-rule AVOID: Retrying jobs that failed due to code errors without fixing code
   */
  async retry(jobId: string): Promise<void> {
    this.validateJobId(jobId);
    
    try {
      await this.transport.retry(jobId);
    } catch (error) {
      throw new Error(`Failed to retry job ${jobId}: ${(error as Error).message}`);
    }
  }

  /**
   * Remove job from queue
   * @llm-rule WHEN: Canceling scheduled jobs or cleaning up specific jobs
   * @llm-rule AVOID: Removing active jobs - let them complete naturally
   */
  async remove(jobId: string): Promise<void> {
    this.validateJobId(jobId);
    
    try {
      await this.transport.remove(jobId);
    } catch (error) {
      throw new Error(`Failed to remove job ${jobId}: ${(error as Error).message}`);
    }
  }

  /**
   * Clean old jobs by status
   * @llm-rule WHEN: Periodic cleanup to prevent queue storage growth
   * @llm-rule AVOID: Aggressive cleanup - keep some completed jobs for debugging
   */
  async clean(status: JobStatus, grace: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      await this.transport.clean(status, grace);
    } catch (error) {
      throw new Error(`Failed to clean ${status} jobs: ${(error as Error).message}`);
    }
  }

  /**
   * Gracefully close queue and cleanup resources
   * @llm-rule WHEN: App shutdown or testing cleanup
   * @llm-rule AVOID: Abrupt shutdown - can cause job loss
   */
  async close(): Promise<void> {
    if (this.isClosing) {
      return; // Already closing
    }
    
    this.isClosing = true;
    
    try {
      // Pause processing first
      await this.transport.pause();
      
      // Wait for current jobs to complete (with timeout)
      await this.waitForActiveJobs();
      
      // Close transport
      await this.transport.close();
    } catch (error) {
      console.error('Error during graceful shutdown:', (error as Error).message);
    }
  }

  /**
   * Get active transport type for debugging
   * @llm-rule WHEN: Debugging transport selection or health checks
   * @llm-rule AVOID: Using for business logic - transport is implementation detail
   */
  getActiveTransport(): string {
    return this.transportType;
  }

  /**
   * Check if specific transport is active
   * @llm-rule WHEN: Feature detection based on transport capabilities
   * @llm-rule AVOID: Complex transport-specific logic - keep handlers generic
   */
  hasTransport(name: string): boolean {
    return this.transportType === name;
  }

  /**
   * Get current configuration for debugging
   * @llm-rule WHEN: Debugging configuration or health checks
   * @llm-rule AVOID: Using for runtime decisions - config is set at startup
   */
  getConfig(): QueueConfig {
    return this.config;
  }

  /**
   * Get health status of queue system
   * @llm-rule WHEN: Health checks or monitoring
   * @llm-rule AVOID: Frequent health checks - can impact performance
   */
  getHealth(): { status: 'healthy' | 'degraded' | 'unhealthy'; transport: string; message?: string } {
    try {
      const transportHealth = this.transport.getHealth();
      return {
        ...transportHealth,
        transport: this.transportType,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        transport: this.transportType,
        message: `Health check failed: ${(error as Error).message}`,
      };
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Wrap job handler with error handling and retry logic
   */
  private wrapHandler<T = JobData>(handler: JobHandler<T>): JobHandler<T> {
    return async (data: T): Promise<any> => {
      try {
        const result = await handler(data);
        return result;
      } catch (error) {
        // Re-throw error for transport to handle retry logic
        throw error;
      }
    };
  }

  /**
   * Wait for active jobs to complete with timeout
   */
  private async waitForActiveJobs(): Promise<void> {
    const timeout = this.config.worker.gracefulShutdownTimeout;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const stats = await this.transport.getStats();
        if (stats.active === 0) {
          return; // No active jobs
        }
        
        // Wait a bit before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        // If we can't check stats, just wait the timeout
        break;
      }
    }
    
    console.warn(`Graceful shutdown timeout (${timeout}ms) exceeded, forcing close`);
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const handleShutdown = async (signal: string) => {
      console.log(`Received ${signal}, starting graceful shutdown...`);
      await this.close();
      process.exit(0);
    };

    process.once('SIGTERM', () => handleShutdown('SIGTERM'));
    process.once('SIGINT', () => handleShutdown('SIGINT'));
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  private validateJobType(jobType: string): void {
    if (!jobType || typeof jobType !== 'string') {
      throw new Error('Job type must be a non-empty string');
    }
    
    if (jobType.length > 100) {
      throw new Error('Job type must be 100 characters or less');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(jobType)) {
      throw new Error('Job type can only contain letters, numbers, underscores, and hyphens');
    }
  }

  private validateJobData(data: any): void {
    if (data === null || data === undefined) {
      throw new Error('Job data cannot be null or undefined');
    }
    
    try {
      JSON.stringify(data);
    } catch (error) {
      throw new Error('Job data must be JSON serializable');
    }
  }

  private validateHandler(handler: JobHandler): void {
    if (typeof handler !== 'function') {
      throw new Error('Job handler must be a function');
    }
  }

  private validateDelay(delay: number): void {
    if (typeof delay !== 'number' || delay < 0) {
      throw new Error('Delay must be a positive number (milliseconds)');
    }
    
    if (delay > 365 * 24 * 60 * 60 * 1000) {
      throw new Error('Delay cannot exceed 1 year');
    }
  }

  private validateJobId(jobId: string): void {
    if (!jobId || typeof jobId !== 'string') {
      throw new Error('Job ID must be a non-empty string');
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      throw new Error('Job ID must be a valid UUID');
    }
  }
}