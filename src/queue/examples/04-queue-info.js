/**
 * Queue Info - @voilajs/appkit Queue Module
 *
 * Simple example showing queue monitoring and statistics
 * No external dependencies needed - just run it!
 *
 * Run: node 04-queue-info.js
 */

import { initQueue, getQueue, closeQueue } from '@voilajs/appkit/queue';

async function demo() {
  console.log('=== Queue Info Demo ===\n');

  // Initialize the queue
  console.log('1. Initializing queue...');
  await initQueue('memory');
  const queue = getQueue();
  console.log('Queue initialized');
  console.log('');

  // Set up job processor with artificial delay
  console.log('2. Setting up job processor...');
  queue.processJobs(
    'tasks',
    async (job) => {
      console.log(`Starting task: ${job.data.name}`);
      // Simulate work with varying duration
      const duration = job.data.duration || 500;
      await new Promise((resolve) => setTimeout(resolve, duration));
      console.log(`Completed task: ${job.data.name}`);
      return { success: true };
    },
    {
      concurrency: 2, // Process up to 2 jobs simultaneously
    }
  );
  console.log('');

  // Add several jobs to the queue
  console.log('3. Adding multiple jobs...');
  for (let i = 1; i <= 5; i++) {
    await queue.addJob('tasks', {
      name: `Task ${i}`,
      duration: i * 300, // Each job takes longer
    });
  }
  console.log('5 jobs added');
  console.log('');

  // Check initial queue info
  console.log('4. Initial queue information:');
  let info = await queue.getQueueInfo('tasks');
  printQueueInfo(info);
  console.log('');

  // Wait a short time and check again
  console.log('5. Queue information after 1 second:');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  info = await queue.getQueueInfo('tasks');
  printQueueInfo(info);
  console.log('');

  // Wait longer and check final status
  console.log('6. Queue information after completion:');
  await new Promise((resolve) => setTimeout(resolve, 3000));
  info = await queue.getQueueInfo('tasks');
  printQueueInfo(info);
  console.log('');

  // Clean up
  console.log('7. Closing queue...');
  await closeQueue();
  console.log('Queue closed');
}

// Helper function to print queue info
function printQueueInfo(info) {
  console.log(`Total jobs: ${info.total}`);
  console.log(`Pending: ${info.pending}`);
  console.log(`Processing: ${info.processing}`);
  console.log(`Completed: ${info.completed}`);
  console.log(`Failed: ${info.failed}`);
}

demo().catch(console.error);
