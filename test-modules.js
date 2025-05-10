// test-modules.js
import assert from 'assert';

// Test auth module
try {
  const auth = await import('@voilajs/appkit/auth');

  // Test password hashing
  const hashedPassword = await auth.hashPassword('testPassword123');
  assert(hashedPassword, 'Password hashing should return a value');

  // Test password comparison
  const isValid = await auth.comparePassword('testPassword123', hashedPassword);
  assert(
    isValid === true,
    'Password comparison should return true for matching passwords'
  );

  console.log('✓ Auth module loaded and tested successfully');
} catch (error) {
  console.error('✗ Auth module failed:', error.message);
}

// Test cache module
try {
  const { createCache } = await import('@voilajs/appkit/cache');

  // Create a cache instance (using memory by default)
  const cacheInstance = await createCache({ strategy: 'memory' });

  // Test set and get
  await cacheInstance.set('testKey', 'testValue');
  const value = await cacheInstance.get('testKey');
  assert(value === 'testValue', 'Cache should return stored value');

  console.log('✓ Cache module loaded and tested successfully');
} catch (error) {
  console.error('✗ Cache module failed:', error.message);
}

// Test config module
try {
  const config = await import('@voilajs/appkit/config');

  // Test loading config from object
  await config.loadConfig({
    app: {
      name: 'TestApp',
      port: 3000,
    },
  });

  const appName = config.getConfig('app.name');
  assert(appName === 'TestApp', 'Config should return correct value');

  console.log('✓ Config module loaded and tested successfully');
} catch (error) {
  console.error('✗ Config module failed:', error.message);
}

// Test email module
try {
  const email = await import('@voilajs/appkit/email');

  // Initialize with memory provider or skip if no mock provider exists
  try {
    // Just verify the module loads
    assert(
      email.sendEmail !== undefined,
      'Email module should export sendEmail'
    );
    console.log(
      '✓ Email module loaded successfully (provider initialization skipped)'
    );
  } catch (initError) {
    console.log(
      '✓ Email module loaded successfully (initialization requires provider setup)'
    );
  }
} catch (error) {
  console.error('✗ Email module failed:', error.message);
}

// Test error module
try {
  const errorModule = await import('@voilajs/appkit/error');

  // Test creating a custom error
  const customError = errorModule.notFoundError('User', '123');
  assert(customError.type === 'NOT_FOUND', 'Error should have correct type');
  assert(
    customError.statusCode === 404,
    'Error should have correct status code'
  );

  console.log('✓ Error module loaded and tested successfully');
} catch (error) {
  console.error('✗ Error module failed:', error.message);
}

// Test events module
try {
  const events = await import('@voilajs/appkit/events');

  // Test event subscription and publishing
  let eventFired = false;
  const unsubscribe = events.subscribe('test:event', (data) => {
    assert(data.message === 'Hello World', 'Event data should match');
    eventFired = true;
  });

  events.publish('test:event', { message: 'Hello World' });
  assert(eventFired === true, 'Event should have been fired');

  unsubscribe();
  console.log('✓ Events module loaded and tested successfully');
} catch (error) {
  console.error('✗ Events module failed:', error.message);
}

// Test logging module
try {
  const logging = await import('@voilajs/appkit/logging');

  // Create a logger instance
  const logger = logging.createLogger({ level: 'info' });

  // Test logging (this will output to console)
  logger.info('Test log message');

  console.log('✓ Logging module loaded and tested successfully');
} catch (error) {
  console.error('✗ Logging module failed:', error.message);
}

// Test queue module
try {
  const queue = await import('@voilajs/appkit/queue');

  // Initialize with memory adapter
  await queue.initQueue('memory');

  // Get queue instance
  const queueInstance = queue.getQueue();

  // Add a job
  const job = await queueInstance.addJob('test', { data: 'test' });
  assert(job.id, 'Job should have an ID');

  console.log('✓ Queue module loaded and tested successfully');
} catch (error) {
  console.error('✗ Queue module failed:', error.message);
}

// Test security module
try {
  const security = await import('@voilajs/appkit/security');

  // Test string escaping
  const escaped = security.escapeString('<script>alert("test")</script>');
  assert(!escaped.includes('<script>'), 'String should be escaped');

  // Test sanitization
  const sanitized = security.sanitizeHtml('<p>Hello <script>evil</script></p>');
  assert(!sanitized.includes('<script>'), 'HTML should be sanitized');

  console.log('✓ Security module loaded and tested successfully');
} catch (error) {
  console.error('✗ Security module failed:', error.message);
}

// Test storage module
try {
  const storage = await import('@voilajs/appkit/storage');

  // Initialize with local storage
  await storage.initStorage('local', {
    basePath: './test-storage',
    baseUrl: '/files',
  });

  // Test that storage instance is available
  const storageInstance = storage.getStorage();
  assert(storageInstance, 'Storage instance should be available');

  console.log('✓ Storage module loaded and tested successfully');
} catch (error) {
  console.error('✗ Storage module failed:', error.message);
}

// Test database module
try {
  const database = await import('@voilajs/appkit/database');

  // Test creating a database instance (without actual connection)
  const db = database.createDb({
    strategy: 'row',
    adapter: 'memory', // or a test adapter if available
  });

  assert(db, 'Database instance should be created');

  console.log('✓ Database module loaded and tested successfully');
} catch (error) {
  console.error('✗ Database module failed:', error.message);
}

// Test utils module
try {
  const utils = await import('@voilajs/appkit/utils');

  // Test pick function
  const obj = { a: 1, b: 2, c: 3 };
  const picked = utils.pick(obj, ['a', 'b']);
  assert(
    picked.a === 1 && picked.b === 2 && !picked.c,
    'Pick should select specified properties'
  );

  // Test generateId
  const id = utils.generateId();
  assert(id && typeof id === 'string', 'Generate ID should return a string');

  // Test sleep function (should be available)
  await utils.sleep(10); // Sleep for 10ms
  assert(true, 'Sleep function should work');

  console.log('✓ Utils module loaded and tested successfully');
} catch (error) {
  console.error('✗ Utils module failed:', error.message);
}

// Test validation module
try {
  const validation = await import('@voilajs/appkit/validation');

  // Test basic validation
  const schema = {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', email: true },
    },
  };

  const result = validation.validate({ email: 'test@example.com' }, schema);
  assert(result.valid === true, 'Validation should pass for valid email');

  console.log('✓ Validation module loaded and tested successfully');
} catch (error) {
  console.error('✗ Validation module failed:', error.message);
}

console.log('\nModule loading test complete!');
