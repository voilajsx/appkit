/**
 * @voilajs/appkit/queue - Database Adapter Example
 *
 * This example demonstrates:
 * - Using the Database adapter (PostgreSQL)
 * - Creating recurring jobs
 * - Getting processing metrics
 * - Cleaning up old jobs
 * - Handling job failures and retries
 *
 * Prerequisites:
 * - PostgreSQL installed and running
 * - Database created with appropriate permissions
 * - pg package installed: npm install pg
 */

import { initQueue, getQueue, closeQueue } from '@voilajs/appkit/queue';

async function main() {
  try {
    // Initialize the queue with Database adapter
    console.log('Initializing queue with PostgreSQL adapter...');

    // Connection details - update these to match your PostgreSQL setup
    const connectionString =
      'postgresql://postgres:postgres@localhost:5432/appkit_queue_demo';

    await initQueue('database', {
      databaseType: 'postgres',
      connectionString,
      tableName: 'job_queue', // Table will be created automatically
      pollInterval: 1000, // Check for new jobs every second
      maxConcurrency: 5, // Maximum concurrent jobs
    });

    const queue = getQueue();

    // Set up a processor for report generation jobs
    queue.processJobs('reports', async (job) => {
      console.log(
        `\nGenerating report: ${job.data.type} for ${job.data.period}`
      );

      // Simulate report generation work
      try {
        // Artificial failure for demo purposes (only for monthly reports)
        if (
          job.data.type === 'monthly' &&
          Math.random() < 0.5 &&
          job.attempts === 1
        ) {
          throw new Error('Temporary database connection error');
        }

        console.log(`Gathering data for ${job.data.type} report...`);
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log(`Compiling ${job.data.type} report...`);
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log(`Report "${job.data.type}" generated successfully`);

        // Return report details
        return {
          reportUrl: `https://reports.example.com/${job.data.type}/${job.data.period}`,
          generatedAt: new Date().toISOString(),
          recordCount: Math.floor(Math.random() * 1000) + 500,
        };
      } catch (error) {
        console.error(
          `Error generating ${job.data.type} report:`,
          error.message
        );
        // This will trigger retry with backoff based on job options
        throw error;
      }
    });

    // Add some standard jobs
    console.log('Adding report generation jobs...');

    await queue.addJob('reports', {
      type: 'daily',
      period: '2023-06-15',
      format: 'pdf',
    });

    await queue.addJob('reports', {
      type: 'weekly',
      period: '2023-W24',
      format: 'excel',
    });

    await queue.addJob(
      'reports',
      {
        type: 'monthly',
        period: '2023-05',
        format: 'pdf',
        sections: ['summary', 'details', 'trends'],
      },
      {
        maxAttempts: 5, // More retries for important reports
        backoff: {
          type: 'exponential',
          delay: 2000,
          maxDelay: 30000,
        },
      }
    );

    // Create a recurring job (database adapter specific)
    console.log('\nCreating recurring job for daily summary report...');
    await queue.createRecurringJob(
      'reports',
      {
        type: 'daily-summary',
        format: 'pdf',
        recipients: ['team@example.com'],
      },
      { priority: 5 },
      '0 7 * * *' // Run daily at 7:00 AM
    );

    // Wait for jobs to process
    console.log('\nWaiting for jobs to be processed...');
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Get jobs by status (database adapter specific)
    const pendingJobs = await queue.getJobsByStatus('reports', 'pending', 10);
    console.log(`\nPending jobs: ${pendingJobs.length}`);

    const completedJobs = await queue.getJobsByStatus(
      'reports',
      'completed',
      10
    );
    console.log(`Completed jobs: ${completedJobs.length}`);

    const failedJobs = await queue.getFailedJobs('reports', 10);
    console.log(`Failed jobs: ${failedJobs.length}`);

    // If there are failed jobs, retry one of them
    if (failedJobs.length > 0) {
      console.log(`\nRetrying failed job ${failedJobs[0].id}...`);
      await queue.retryJob('reports', failedJobs[0].id);
    }

    // Get processing metrics (database adapter specific)
    const metrics = await queue.getProcessingMetrics('reports');
    console.log('\nProcessing metrics:');
    console.log(`- Total processed: ${metrics.totalProcessed || 0}`);
    console.log(
      `- Average processing time: ${metrics.avgProcessingTime || 0}ms`
    );
    console.log(`- Min processing time: ${metrics.minProcessingTime || 0}ms`);
    console.log(`- Max processing time: ${metrics.maxProcessingTime || 0}ms`);

    // Clean up old jobs (database adapter specific)
    console.log('\nCleaning up old jobs...');
    const removed = await queue.cleanupOldJobs('reports', 7); // Remove jobs older than 7 days
    console.log(`Removed ${removed} old jobs`);

    // Get final queue information
    const queueInfo = await queue.getQueueInfo('reports');
    console.log('\nFinal queue statistics:');
    console.log(`- Total jobs: ${queueInfo.total}`);
    console.log(`- Pending: ${queueInfo.pending}`);
    console.log(`- Completed: ${queueInfo.completed}`);
    console.log(`- Failed: ${queueInfo.failed}`);

    // Close the queue when finished
    await closeQueue();
    console.log('\nQueue closed');
  } catch (error) {
    console.error('Error:', error.message);

    // Provide helpful message for common database connection issues
    if (error.message.includes('connect')) {
      console.error(
        '\nDatabase connection error. Make sure PostgreSQL is running and the connection details are correct.'
      );
      console.error(
        'You may need to create a database first with: CREATE DATABASE appkit_queue_demo;'
      );
    }
  }
}

// Run the example
main().catch(console.error);
