/**
 * Async Events - @voilajs/appkit Events Module
 *
 * Example demonstrating asynchronous event handling
 * No external dependencies needed - just run it!
 *
 * Run: node 03-async-events.js
 */

import {
  subscribe,
  subscribeAsync,
  publish,
  waitForEvent,
} from '@voilajs/appkit/events';

// Simulated async function
async function processData(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Processing complete for data ID: ${data.id}`);
      resolve({ id: data.id, status: 'processed' });
    }, data.processTime || 1000);
  });
}

async function demo() {
  console.log('=== Async Events Demo ===\n');

  // 1. Set up a regular subscription for reference
  console.log('1. Setting up regular subscription...');
  subscribe('data:received', (data) => {
    console.log(`Data received: ${data.id} (sync handler)`);
    // We should not do long operations in a sync handler
  });
  console.log('Regular subscription complete\n');

  // 2. Set up an async subscription
  console.log('2. Setting up async subscription...');
  subscribeAsync('data:received', async (data) => {
    console.log(`Starting to process data: ${data.id} (async handler)`);
    try {
      // This won't block the event loop
      const result = await processData(data);
      // Publish completion event
      publish('data:processed', result);
    } catch (error) {
      console.error(`Error processing data ${data.id}:`, error);
      publish('data:error', { id: data.id, error: error.message });
    }
  });
  console.log('Async subscription complete\n');

  // 3. Publish an event
  console.log('3. Publishing data:received event...');
  publish('data:received', {
    id: 'data-123',
    content: 'Sample data',
    processTime: 2000, // Will take 2 seconds to process
  });
  console.log('Event published. Processing will happen in the background.');
  console.log(
    'Notice how this log appears immediately, not waiting for processing!\n'
  );

  // 4. Wait for an event (Promise-based approach)
  console.log('4. Waiting for data:processed event...');
  try {
    const result = await waitForEvent('data:processed', {
      timeout: 3000,
      filter: (data) => data.id === 'data-123',
    });
    console.log('Data processed event received:', result);
  } catch (error) {
    console.error('Timeout waiting for data processing:', error);
  }

  // 5. Publish multiple events quickly
  console.log('\n5. Publishing multiple events rapidly...');
  for (let i = 1; i <= 3; i++) {
    publish('data:received', {
      id: `data-${200 + i}`,
      content: `Quick data ${i}`,
      processTime: 500, // Each takes 500ms to process
    });
    console.log(`Published quick data ${i}`);
  }

  // Wait for all processing to complete
  console.log('\nWaiting for all processing to complete...');
  await new Promise((resolve) => setTimeout(resolve, 2500));

  console.log('\nDemo complete!');
}

demo();
