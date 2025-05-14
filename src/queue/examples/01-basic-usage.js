/**
 * @voilajs/appkit/queue - Basic Usage Example
 *
 * This example demonstrates how to:
 * - Initialize a queue with the memory adapter
 * - Add jobs to a queue
 * - Process jobs with a simple processor
 * - Handle job completion and failure
 *
 * Run: node 01-basic-usage.js
 */

import { initQueue, getQueue, closeQueue } from '@voilajs/appkit/queue';

async function main() {
  try {
    // Initialize the queue with in-memory adapter (good for development)
    await initQueue('memory');
    console.log('Queue initialized with memory adapter');

    const queue = getQueue();

    // Set up a processor for email jobs
    queue.processJobs('emails', async (job) => {
      console.log(`Processing email to: ${job.data.to}`);
      console.log(`Subject: ${job.data.subject}`);

      // Simulate email sending (successful)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Return a result (will be stored with the job)
      return {
        sent: true,
        timestamp: new Date().toISOString(),
      };
    });

    // Add some jobs to the queue
    console.log('Adding jobs to the queue...');

    const job1 = await queue.addJob('emails', {
      to: 'user1@example.com',
      subject: 'Welcome to our platform!',
      body: 'Thank you for signing up...',
    });
    console.log(`Job added with ID: ${job1.id}`);

    const job2 = await queue.addJob('emails', {
      to: 'user2@example.com',
      subject: 'Your monthly report',
      body: 'Here is your activity summary...',
    });
    console.log(`Job added with ID: ${job2.id}`);

    // Add a job that will fail
    const job3 = await queue.addJob('emails', {
      to: null, // This will cause an error in the processor
      subject: 'This will fail',
      body: 'Error handling example',
    });
    console.log(`Job added with ID: ${job3.id} (this one will fail)`);

    // Wait for jobs to be processed
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check job statuses
    const jobInfo1 = await queue.getJob('emails', job1.id);
    console.log(`\nJob ${job1.id} status: ${jobInfo1.status}`);
    console.log('Result:', jobInfo1.result);

    const jobInfo3 = await queue.getJob('emails', job3.id);
    console.log(`\nJob ${job3.id} status: ${jobInfo3.status}`);
    console.log('Error:', jobInfo3.error);

    // Get queue information
    const queueInfo = await queue.getQueueInfo('emails');
    console.log('\nQueue statistics:');
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
