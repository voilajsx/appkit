/**
 * Redis Adapter - @voilajs/appkit Queue Module
 *
 * Example showing Redis adapter usage
 * Requires Redis server running on localhost:6379
 *
 * Run: node 05-redis-adapter.js
 */

import { initQueue, getQueue, closeQueue } from '@voilajs/appkit/queue';

async function demo() {
  console.log('=== Redis Adapter Demo ===\n');
  console.log(
    'NOTE: This example requires a Redis server running on localhost:6379'
  );
  console.log('');

  try {
    // Initialize the queue with Redis adapter
    console.log('1. Initializing Redis queue...');
    await initQueue('redis', {
      redis: 'redis://localhost:6379',
    });
    const queue = getQueue();
    console.log('Redis queue initialized');
    console.log('');

    // Set up job processor
    console.log('2. Setting up job processor...');
    queue.processJobs('notifications', async (job) => {
      console.log(`Sending notification: ${job.data.message}`);
      // Simulate work
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(`Notification sent: ${job.data.message}`);
      return { sent: true, timestamp: new Date() };
    });
    console.log('');

    // Add a job
    console.log('3. Adding a job...');
    const job = await queue.addJob('notifications', {
      userId: '123',
      message: 'Hello from Redis queue!',
    });
    console.log(`Job added with ID: ${job.id}`);
    console.log('');

    // Pause the queue (Redis specific feature)
    console.log('4. Pausing the queue...');
    await queue.pauseQueue('notifications');
    console.log('Queue paused');
    console.log('');

    // Add another job (will not process while paused)
    console.log('5. Adding another job while paused...');
    await queue.addJob('notifications', {
      userId: '456',
      message: 'This will wait until resumed',
    });
    console.log("Job added but won't process yet");
    console.log('');

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Resume the queue
    console.log('6. Resuming the queue...');
    await queue.resumeQueue('notifications');
    console.log('Queue resumed - jobs will now process');
    console.log('');

    // Wait for processing
    console.log('7. Waiting for jobs to complete...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('');

    // Get queue info
    console.log('8. Getting queue information...');
    const info = await queue.getQueueInfo('notifications');
    console.log(`Total jobs: ${info.total}`);
    console.log(`Completed: ${info.completed}`);
    console.log('');

    // Clean up (important for Redis adapter)
    console.log('9. Closing queue...');
    await closeQueue();
    console.log('Queue closed');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('');
    console.log(
      'Is Redis running? Make sure you have a Redis server on localhost:6379'
    );

    // Try to close queue even on error
    try {
      await closeQueue();
    } catch (err) {
      // Ignore errors during cleanup
    }
  }
}

demo();
