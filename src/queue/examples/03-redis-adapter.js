/**
 * @voilajs/appkit/queue - Redis Adapter Example
 *
 * This example demonstrates:
 * - Using the Redis adapter for production use
 * - Processing jobs with concurrency
 * - Redis-specific features (pause/resume queue)
 * - Job progress tracking
 * - Cleaning up old jobs
 */

import { initQueue, getQueue, closeQueue } from '@voilajs/appkit/queue';

async function main() {
  try {
    // Initialize the queue with Redis adapter
    // Note: Make sure Redis is running on localhost:6379 or update the URL
    console.log('Initializing queue with Redis adapter...');
    await initQueue('redis', {
      redis: 'redis://localhost:6379',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true, // Automatically remove completed jobs
        removeOnFail: false, // Keep failed jobs for inspection
      },
      prefix: 'appkit-example', // Namespace for Redis keys
    });

    const queue = getQueue();

    // Set up a processor for image processing jobs with concurrency
    queue.processJobs(
      'image-processing',
      async (job) => {
        console.log(`\nProcessing image: ${job.data.filename}`);
        const totalSteps = 5;

        // Simulate multi-step processing with progress updates
        for (let step = 1; step <= totalSteps; step++) {
          // Update job progress (0-100)
          const progress = Math.floor((step / totalSteps) * 100);
          await queue.updateJob('image-processing', job.id, { progress });

          console.log(
            `Image "${job.data.filename}" - Step ${step}/${totalSteps} (${progress}%)`
          );

          // Simulate processing time
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        console.log(`Image "${job.data.filename}" processing complete`);
        return {
          processedUrl: `https://cdn.example.com/processed/${job.data.filename}`,
          dimensions: {
            width: job.data.width,
            height: job.data.height,
          },
        };
      },
      {
        concurrency: 2, // Process up to 2 jobs simultaneously
        // Optional event handlers (Redis adapter specific)
        onCompleted: (jobId, result) => {
          console.log(`Job ${jobId} completed with result:`, result);
        },
        onFailed: (jobId, error) => {
          console.error(`Job ${jobId} failed:`, error.message);
        },
        onProgress: (jobId, progress) => {
          console.log(`Job ${jobId} progress: ${progress}%`);
        },
      }
    );

    // Add multiple image processing jobs
    console.log('Adding image processing jobs...');

    const imageJobs = [];
    for (let i = 1; i <= 5; i++) {
      const job = await queue.addJob('image-processing', {
        filename: `image${i}.jpg`,
        width: 800,
        height: 600,
        effects: ['resize', 'optimize', i % 2 === 0 ? 'grayscale' : 'sharpen'],
      });
      imageJobs.push(job);
      console.log(`Added job ${job.id} for image${i}.jpg`);
    }

    // Demonstrate pausing and resuming the queue (Redis adapter specific)
    console.log('\nPausing the queue...');
    await queue.pauseQueue('image-processing');

    // Add one more job while queue is paused
    await queue.addJob(
      'image-processing',
      {
        filename: 'important-image.jpg',
        width: 1200,
        height: 800,
        effects: ['resize', 'enhance', 'watermark'],
      },
      {
        priority: 10, // This will be processed first when queue resumes
      }
    );
    console.log('Added high-priority job while queue is paused');

    // Get queue information while paused
    const pausedInfo = await queue.getQueueInfo('image-processing');
    console.log('\nQueue statistics while paused:');
    console.log(`- Total jobs: ${pausedInfo.total}`);
    console.log(`- Pending: ${pausedInfo.pending}`);
    console.log(`- Processing: ${pausedInfo.processing}`);
    console.log(`- Paused: ${pausedInfo.paused || 0}`);

    // Wait a bit then resume the queue
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('\nResuming the queue...');
    await queue.resumeQueue('image-processing');

    // Wait for all jobs to complete
    console.log('\nWaiting for all jobs to complete...');
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Clean up old completed jobs (Redis adapter specific)
    console.log('\nCleaning up old completed jobs...');
    const removed = await queue.cleanUp(
      'image-processing',
      60 * 60 * 1000, // 1 hour (normally would be longer in production)
      'completed',
      100
    );
    console.log(`Removed ${removed} old completed jobs`);

    // Get final queue information
    const finalInfo = await queue.getQueueInfo('image-processing');
    console.log('\nFinal queue statistics:');
    console.log(`- Completed: ${finalInfo.completed}`);
    console.log(`- Failed: ${finalInfo.failed}`);
    console.log(
      `- Remaining: ${finalInfo.total - finalInfo.completed - finalInfo.failed}`
    );

    // Close the queue when finished
    await closeQueue();
    console.log('\nQueue closed');
  } catch (error) {
    console.error('Error:', error.message);
    // If Redis connection fails, provide a helpful message
    if (error.message.includes('Redis connection')) {
      console.error(
        '\nMake sure Redis is running on localhost:6379 or update the connection URL in the example.'
      );
    }
  }
}

// Run the example
main().catch(console.error);
