/**
 * @voilajs/appkit/queue - Advanced Job Options Example
 *
 * This example demonstrates:
 * - Using job priorities
 * - Delayed jobs
 * - Custom retry strategies
 * - Job event handling
 */

import { initQueue, getQueue, closeQueue } from '@voilajs/appkit/queue';

async function main() {
  try {
    // Initialize the queue with in-memory adapter
    await initQueue('memory');
    console.log('Queue initialized with memory adapter');

    const queue = getQueue();

    // Set up a processor for task jobs
    queue.processJobs('tasks', async (job) => {
      console.log(
        `\nProcessing task: ${job.data.name} (priority: ${job.options.priority || 0})`
      );
      console.log(`Attempt: ${job.attempts} of ${job.maxAttempts}`);

      // Simulate task processing
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Simulate a failure for one specific job to demonstrate retries
      if (job.data.name === 'Task that fails initially' && job.attempts < 2) {
        console.log(`Task "${job.data.name}" failed - will retry`);
        throw new Error('Simulated failure for retry demonstration');
      }

      console.log(`Task "${job.data.name}" completed successfully`);
      return {
        completed: true,
        processingTime: Math.random() * 500 + 100,
      };
    });

    // Add jobs with different priorities
    // Higher priority (higher number) jobs will be processed first
    console.log('Adding jobs with different priorities...');

    // Normal priority job (default = 0)
    await queue.addJob('tasks', {
      name: 'Normal priority task',
      description: 'This is a regular task',
    });

    // High priority job
    await queue.addJob(
      'tasks',
      {
        name: 'High priority task',
        description: 'This is an important task',
      },
      {
        priority: 10, // Higher number = higher priority
      }
    );

    // Low priority job
    await queue.addJob(
      'tasks',
      {
        name: 'Low priority task',
        description: 'This is a less important task',
      },
      {
        priority: -5, // Lower number = lower priority
      }
    );

    // Wait a bit to let priority jobs start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Delayed job (will be processed after the specified delay)
    console.log('\nAdding a delayed job (3 second delay)...');
    await queue.addJob(
      'tasks',
      {
        name: 'Delayed task',
        description: 'This task will be processed after a delay',
      },
      {
        delay: 3000, // 3 seconds
      }
    );

    // Job with custom retry strategy
    console.log('\nAdding a job that will retry with exponential backoff...');
    await queue.addJob(
      'tasks',
      {
        name: 'Task that fails initially',
        description:
          'This task will fail on first attempt but succeed after retry',
      },
      {
        maxAttempts: 3,
        backoff: {
          type: 'exponential', // 'exponential', 'fixed', or 'linear'
          delay: 1000, // Base delay in milliseconds
          maxDelay: 10000, // Maximum delay between retries
        },
      }
    );

    // Wait for all jobs to complete
    console.log(
      '\nWaiting for all jobs to complete (including the delayed job)...'
    );
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Get queue information
    const queueInfo = await queue.getQueueInfo('tasks');
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
  }
}

// Run the example
main().catch(console.error);
