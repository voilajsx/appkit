/**
 * Error Handling - @voilajs/appkit Queue Module
 *
 * Simple example showing error handling and retries
 * No external dependencies needed - just run it!
 *
 * Run: node 03-error-handling.js
 */

import { initQueue, getQueue, closeQueue } from '@voilajs/appkit/queue';

async function demo() {
  console.log('=== Error Handling Demo ===\n');

  // Initialize the queue
  console.log('1. Initializing queue...');
  await initQueue('memory');
  const queue = getQueue();
  console.log('Queue initialized');
  console.log('');

  // Set up job processor with error handling
  console.log('2. Setting up job processor with error handling...');
  queue.processJobs('uploads', async (job) => {
    console.log(`Processing file: ${job.data.filename}`);

    // Simulate an error for certain files
    if (job.data.filename.includes('error')) {
      console.log(`Error processing ${job.data.filename}`);
      throw new Error('File processing failed');
    }

    // Simulate successful processing
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`Successfully processed ${job.data.filename}`);
    return { processed: true };
  });
  console.log('');

  // Add a job that will succeed
  console.log('3. Adding a job that will succeed...');
  const goodJob = await queue.addJob('uploads', {
    filename: 'good-file.jpg',
    size: 1024,
  });
  console.log(`Job added with ID: ${goodJob.id}`);
  console.log('');

  // Add a job that will fail and retry
  console.log('4. Adding a job that will fail and retry...');
  const errorJob = await queue.addJob(
    'uploads',
    {
      filename: 'error-file.jpg',
      size: 2048,
    },
    {
      maxAttempts: 3, // Will retry up to 3 times
      backoff: {
        type: 'fixed',
        delay: 1000, // 1 second between retries
      },
    }
  );
  console.log(`Job added with ID: ${errorJob.id}`);
  console.log('This job will fail but retry 3 times');
  console.log('');

  // Wait for processing to complete
  console.log('5. Watching jobs process...');
  console.log('');

  // Wait for all retries to happen
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Check the status of the error job
  console.log('6. Checking failed job status...');
  const jobInfo = await queue.getJob('uploads', errorJob.id);
  console.log('Error job status:', jobInfo.status);
  console.log('Error job attempts:', jobInfo.attempts);
  console.log('Error message:', jobInfo.error);
  console.log('');

  // Clean up
  console.log('7. Closing queue...');
  await closeQueue();
  console.log('Queue closed');
}

demo().catch(console.error);
