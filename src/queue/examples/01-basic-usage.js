/**
 * Basic Usage - @voilajs/appkit Queue Module
 *
 * Simple example showing queue initialization, job adding and processing
 * No external dependencies needed - just run it!
 *
 * Run: node 01-basic-usage.js
 */

import { initQueue, getQueue, closeQueue } from '@voilajs/appkit/queue';

async function demo() {
  console.log('=== Basic Queue Demo ===\n');

  // Initialize the queue with memory adapter
  console.log('1. Initializing queue...');
  await initQueue('memory');
  const queue = getQueue();
  console.log('Queue initialized with memory adapter');
  console.log('');

  // Set up job processor
  console.log('2. Setting up job processor...');
  queue.processJobs('tasks', async (job) => {
    console.log(`Processing: ${job.data.name}`);
    // Simulate work
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`Completed: ${job.data.name}`);
    return { success: true };
  });
  console.log('Job processor ready');
  console.log('');

  // Add a job to the queue
  console.log('3. Adding a job...');
  const job = await queue.addJob('tasks', {
    name: 'Example Task',
    data: { value: 42 },
  });
  console.log(`Job added with ID: ${job.id}`);
  console.log('');

  // Wait for job to complete
  console.log('4. Waiting for job to process...');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('');

  // Get job information
  console.log('5. Getting job information...');
  const jobInfo = await queue.getJob('tasks', job.id);
  console.log('Job status:', jobInfo.status);
  console.log('Job result:', jobInfo.result);
  console.log('');

  // Cleanup
  console.log('6. Closing queue...');
  await closeQueue();
  console.log('Queue closed');
}

demo().catch(console.error);
