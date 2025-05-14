/**
 * Queue Monitoring - @voilajs/appkit Queue Module
 *
 * Example showing queue monitoring
 *
 * Run: node 05-queue-monitoring.js
 */

import { initQueue, getQueue, closeQueue } from '@voilajs/appkit/queue';

async function runExample() {
  try {
    // Initialize the queue with memory adapter
    console.log('Initializing queue...');
    await initQueue('memory');

    const queue = getQueue();
    console.log('Queue initialized successfully');

    // Monitoring example
    // Uncomment when implementation is complete
    /*
    // Add several jobs
    console.log('Adding test jobs...');
    const jobCount = 10;
    
    for (let i = 1; i <= jobCount; i++) {
      await queue.addJob('tasks', {
        name: `Task ${i}`,
        priority: i % 3 === 0 ? 'high' : 'normal'
      });
    }
    
    console.log(`Added ${jobCount} jobs to the queue`);
    
    // Setup a monitoring interval
    console.log('Setting up queue monitoring...');
    
    const monitorInterval = setInterval(async () => {
      // Get queue stats
      const stats = await queue.getQueueInfo('tasks');
      
      // Print current queue state
      console.log('\nQueue Status:', new Date().toISOString());
      console.log('-----------------------------------');
      console.log(`Total Jobs: ${stats.total}`);
      console.log(`Pending: ${stats.pending}`);
      console.log(`Processing: ${stats.processing}`);
      console.log(`Completed: ${stats.completed}`);
      console.log(`Failed: ${stats.failed}`);
      console.log('-----------------------------------');
      
      // Stop monitoring when all jobs are done
      if (stats.pending === 0 && stats.processing === 0) {
        console.log('All jobs processed');
        clearInterval(monitorInterval);
      }
    }, 1000);
    
    // Process jobs with artificial delay
    console.log('Starting job processing...');
    
    queue.processJobs('tasks', async (job) => {
      console.log(`Processing: ${job.data.name}`);
      
      // Simulate varying processing times
      const delay = Math.random() * 2000 + 500;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Occasionally fail jobs
      if (Math.random() < 0.2) {
        throw new Error('Random job failure');
      }
      
      console.log(`Completed: ${job.data.name}`);
      return { success: true, processingTime: delay };
    }, {
      concurrency: 2 // Process 2 jobs simultaneously
    });
    
    // Let monitoring run for a while
    console.log('Monitoring queue for 15 seconds...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Clean up monitoring
    clearInterval(monitorInterval);
    */

    console.log(
      'Queue monitoring functionality will be available when the implementation is complete'
    );

    // Close the queue
    console.log('Closing queue...');
    await closeQueue();
    console.log('Queue closed successfully');
  } catch (error) {
    console.error('Error:', error);
    try {
      await closeQueue();
    } catch (err) {
      // Ignore cleanup errors
    }
  }
}

// Run the example
runExample();
