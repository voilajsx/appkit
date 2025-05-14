/**
 * Job Options - @voilajs/appkit Queue Module
 *
 * Simple example showing job options like priority and delay
 * No external dependencies needed - just run it!
 *
 * Run: node 02-job-options.js
 */

import { initQueue, getQueue, closeQueue } from '@voilajs/appkit/queue';

async function demo() {
  console.log('=== Job Options Demo ===\n');

  // Initialize the queue
  console.log('1. Initializing queue...');
  await initQueue('memory');
  const queue = getQueue();
  console.log('Queue initialized');
  console.log('');

  // Set up job processor
  console.log('2. Setting up job processor...');
  queue.processJobs('emails', async (job) => {
    console.log(`Sending email to: ${job.data.to}`);
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`Email sent to: ${job.data.to}`);
    return { sent: true };
  });
  console.log('');

  // Add a standard job
  console.log('3. Adding a standard job...');
  await queue.addJob('emails', {
    to: 'user@example.com',
    subject: 'Hello',
  });
  console.log('');

  // Add a high priority job
  console.log('4. Adding a high priority job...');
  await queue.addJob(
    'emails',
    {
      to: 'important@example.com',
      subject: 'Urgent',
    },
    {
      priority: 10, // Higher number = higher priority
    }
  );
  console.log('');

  // Add a delayed job
  console.log('5. Adding a delayed job...');
  await queue.addJob(
    'emails',
    {
      to: 'delayed@example.com',
      subject: 'Later',
    },
    {
      delay: 3000, // 3 second delay
    }
  );
  console.log('Delayed job will process after 3 seconds');
  console.log('');

  // Wait for jobs to process
  console.log('6. Watching jobs process...');
  console.log('(Notice high priority job runs first)');
  console.log('');

  // Wait for all jobs including the delayed one
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Clean up
  console.log('7. Closing queue...');
  await closeQueue();
  console.log('Queue closed');
}

demo().catch(console.error);
