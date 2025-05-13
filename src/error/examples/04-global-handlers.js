/**
 * Global Error Handlers - @voilajs/appkit Error Module
 *
 * This example demonstrates setting up global error handlers
 * for uncaught exceptions and unhandled promise rejections.
 *
 * No external dependencies needed - just run it!
 *
 * Run: node 04-global-handlers.js
 */

import {
  handleUncaughtExceptions,
  handleUnhandledRejections,
} from '@voilajs/appkit/error';

function demo() {
  console.log('=== Global Error Handlers Demo ===\n');

  // Make sure no previous listeners exist
  process.removeAllListeners('uncaughtException');
  process.removeAllListeners('unhandledRejection');

  // 1. Set up global handlers
  console.log('1. Setting up global error handlers:');

  // Handle uncaught exceptions
  handleUncaughtExceptions((error) => {
    console.log(`  [UNCAUGHT EXCEPTION] ${error.message}`);
    console.log(`  Stack: ${error.stack.split('\n')[1].trim()}`);

    // In a real app, you might:
    // 1. Log to a monitoring service
    // 2. Attempt graceful shutdown
    // 3. Exit process

    // Don't exit in this demo so we can continue
    console.log('  (In a real app, would exit here with process.exit(1))');
  });
  console.log('  - Uncaught exception handler registered');

  // Handle unhandled rejections
  handleUnhandledRejections((reason, promise) => {
    console.log(`  [UNHANDLED REJECTION] ${reason?.message || reason}`);
    if (reason?.stack) {
      console.log(`  Stack: ${reason.stack.split('\n')[1].trim()}`);
    }

    // In a real app, you might:
    // 1. Log to a monitoring service
    // 2. Exit in production

    // Don't exit in this demo so we can continue
    console.log('  (In production, might exit with process.exit(1))');
  });
  console.log('  - Unhandled rejection handler registered');
  console.log('');

  // 2. Demonstrate proper error handling (for comparison)
  console.log('2. Proper error handling example:');

  // Synchronous try/catch
  try {
    console.log('  - Throwing error inside try/catch');
    throw new Error('Properly caught synchronous error');
  } catch (error) {
    console.log(`  ✓ Caught synchronously: ${error.message}`);
  }

  // Promise with catch
  console.log('  - Rejecting promise with .catch()');
  Promise.reject(new Error('Properly caught promise rejection')).catch(
    (error) => {
      console.log(`  ✓ Caught with .catch(): ${error.message}`);
    }
  );

  // Async/await with try/catch
  (async function () {
    try {
      console.log('  - Throwing in async function with try/catch');
      await Promise.reject(new Error('Properly caught async error'));
    } catch (error) {
      console.log(`  ✓ Caught with async/await: ${error.message}`);
    }
  })();
  console.log('');

  // 3. Trigger uncaught exception (after a delay)
  console.log('3. Triggering uncaught exception in 1 second:');
  setTimeout(() => {
    console.log('  - About to throw uncaught exception');
    throw new Error('Uncaught synchronous error');
  }, 1000);

  // 4. Trigger unhandled rejection (after a delay)
  console.log('4. Triggering unhandled rejection in 2 seconds:');
  setTimeout(() => {
    console.log('  - About to create unhandled rejection');
    // Create rejected promise with no catch handler
    Promise.reject(new Error('Unhandled promise rejection'));
  }, 2000);

  // 5. Keep the process alive
  console.log('\nWaiting for errors to be triggered...');
}

demo();

/* Expected output:
  === Global Error Handlers Demo ===
  
  1. Setting up global error handlers:
    - Uncaught exception handler registered
    - Unhandled rejection handler registered
  
  2. Proper error handling example:
    - Throwing error inside try/catch
    ✓ Caught synchronously: Properly caught synchronous error
    - Rejecting promise with .catch()
    - Throwing in async function with try/catch
    ✓ Caught with .catch(): Properly caught promise rejection
    ✓ Caught with async/await: Properly caught async error
  
  3. Triggering uncaught exception in 1 second:
  4. Triggering unhandled rejection in 2 seconds:
  
  Waiting for errors to be triggered...
    - About to throw uncaught exception
    [UNCAUGHT EXCEPTION] Uncaught synchronous error
    Stack: at Timeout._onTimeout (/path/to/04-global-handlers.js:79:11)
    (In a real app, would exit here with process.exit(1))
    - About to create unhandled rejection
    [UNHANDLED REJECTION] Unhandled promise rejection
    Stack: at Timeout._onTimeout (/path/to/04-global-handlers.js:86:13)
    (In production, might exit with process.exit(1))
  */
