/**
 * Event History - @voilajs/appkit Events Module
 *
 * Example demonstrating event history tracking and querying
 * No external dependencies needed - just run it!
 *
 * Run: node 02-event-history.js
 */

import {
  subscribe,
  publish,
  getEventHistory,
  clearEventHistory,
} from '@voilajs/appkit/events';

function demo() {
  console.log('=== Event History Demo ===\n');

  // Clear any previous history to start fresh
  clearEventHistory();

  // 1. Subscribe to events
  console.log('1. Setting up event subscriptions...');
  subscribe('user:login', (user) => {
    console.log(`User logged in: ${user.name} (${user.id})`);
  });

  subscribe('user:logout', (user) => {
    console.log(`User logged out: ${user.id}`);
  });
  console.log('Successfully subscribed to events\n');

  // 2. Publish some events
  console.log('2. Publishing a series of events...');

  // Login events
  publish('user:login', { id: '101', name: 'Alice', timestamp: new Date() });
  publish('user:login', { id: '102', name: 'Bob', timestamp: new Date() });

  // Wait a bit
  console.log('Waiting 1 second...');
  const startTime = new Date();
  while (new Date() - startTime < 1000) {
    /* wait */
  }

  // More events
  publish('user:login', { id: '103', name: 'Charlie', timestamp: new Date() });
  publish('user:logout', { id: '101', timestamp: new Date() });
  publish('user:logout', { id: '102', timestamp: new Date() });

  console.log('All events published\n');

  // 3. Get all event history
  console.log('3. Getting all event history:');
  const allEvents = getEventHistory();
  console.log(`Total events: ${allEvents.length}`);
  allEvents.forEach((event, index) => {
    console.log(
      `[${index + 1}] ${event.event} at ${event.timestamp.toISOString()}`
    );
  });
  console.log('');

  // 4. Filter by event type
  console.log('4. Getting only login events:');
  const loginEvents = getEventHistory({ event: 'user:login' });
  loginEvents.forEach((event, index) => {
    console.log(
      `[${index + 1}] ${event.data.name} (${event.data.id}) logged in`
    );
  });
  console.log('');

  // 5. Filter by date
  const timeThreshold = new Date(startTime.getTime() + 500);
  console.log(`5. Getting events after ${timeThreshold.toISOString()}:`);
  const recentEvents = getEventHistory({ since: timeThreshold });
  recentEvents.forEach((event, index) => {
    console.log(
      `[${index + 1}] ${event.event} - ${JSON.stringify(event.data)}`
    );
  });
  console.log('');

  // 6. Clear history
  console.log('6. Clearing event history...');
  clearEventHistory();
  const eventsAfterClear = getEventHistory();
  console.log(`Events after clearing: ${eventsAfterClear.length}`);
}

demo();
