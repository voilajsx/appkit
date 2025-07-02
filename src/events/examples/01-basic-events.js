/**
 * Basic Events - @voilajs/appkit Events Module
 *
 * Simple example showing event subscription and publishing
 * No external dependencies needed - just run it!
 *
 * Run: node 01-basic-events.js
 */

import { subscribe, publish, unsubscribe } from '@voilajs/appkit/events';

function demo() {
  console.log('=== Basic Events Demo ===\n');

  // 1. Subscribe to events
  console.log('1. Setting up event subscriptions...');

  const unsubscribeUser = subscribe('user:action', (data) => {
    console.log(`User ${data.userId} performed action: ${data.action}`);
  });

  subscribe('notification', (data) => {
    console.log(`NOTIFICATION: ${data.message}`);
  });

  // Wildcard subscription - receives all events
  subscribe('*', ({ event, data }) => {
    console.log(`[LOG] Event "${event}" was triggered with data:`, data);
  });

  console.log('Successfully subscribed to events\n');

  // 2. Publish events
  console.log('2. Publishing events...');

  publish('user:action', {
    userId: '123',
    action: 'login',
    timestamp: new Date(),
  });

  publish('notification', {
    message: 'Welcome to the application!',
    type: 'info',
  });

  publish('user:action', {
    userId: '123',
    action: 'update-profile',
    timestamp: new Date(),
  });

  console.log('');

  // 3. Unsubscribe from an event
  console.log('3. Unsubscribing from user:action...');
  unsubscribeUser();

  console.log('Publishing user:action again (should only appear in logs)');
  publish('user:action', {
    userId: '123',
    action: 'logout',
    timestamp: new Date(),
  });
}

demo();
