import { useState, useEffect } from "react";
import { processMarkdown, extractMetadata } from "@/utils/markdownUtils";

/**
 * Hook to load and process documentation content
 *
 * @param {string} moduleName - Module name/slug (e.g., 'auth', 'logging', 'general')
 * @param {string} docName - Document name/slug (e.g., 'api-reference', 'examples')
 * @returns {Object} Object containing:
 *   - content: Processed markdown content
 *   - metadata: Extracted frontmatter metadata
 *   - isLoading: Loading state
 *   - error: Error message if loading failed
 */
function useDocContent(moduleName, docName) {
  const [content, setContent] = useState("");
  const [metadata, setMetadata] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      setError(null);

      try {
        // In a production environment, this would dynamically import
        // markdown files or fetch them from an API

        // For now, we'll simulate loading with mock content for specific paths
        let markdownContent = "";

        if (moduleName === "general") {
          switch (docName) {
            case "getting-started":
              markdownContent = getGettingStartedContent();
              break;
            case "installation":
              markdownContent = getInstallationContent();
              break;
            case "contributing":
              markdownContent = getContributingContent();
              break;
            default:
              throw new Error(
                `Document '${docName}' not found in 'general' module`,
              );
          }
        } else if (moduleName === "auth") {
          switch (docName) {
            case null:
            case undefined:
            case "index":
              markdownContent = getAuthIndexContent();
              break;
            case "api-reference":
              markdownContent = getAuthApiReferenceContent();
              break;
            case "examples":
              markdownContent = getAuthExamplesContent();
              break;
            default:
              throw new Error(
                `Document '${docName}' not found in 'auth' module`,
              );
          }
        } else if (moduleName === "logging") {
          switch (docName) {
            case null:
            case undefined:
            case "index":
              markdownContent = getLoggingIndexContent();
              break;
            case "api-reference":
              markdownContent = getLoggingApiReferenceContent();
              break;
            case "examples":
              markdownContent = getLoggingExamplesContent();
              break;
            default:
              throw new Error(
                `Document '${docName}' not found in 'logging' module`,
              );
          }
        } else {
          throw new Error(`Module '${moduleName}' not found`);
        }

        // Process markdown content
        const processedContent = processMarkdown(markdownContent);

        // Extract metadata from frontmatter
        const extractedMetadata = extractMetadata(markdownContent);

        setContent(processedContent);
        setMetadata(extractedMetadata);
      } catch (err) {
        console.error("Error loading documentation content:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, [moduleName, docName]);

  return { content, metadata, isLoading, error };
}

// Mock content functions - Part 1
// In a real implementation, these would be replaced with imports or API calls

function getGettingStartedContent() {
  return `---
title: Getting Started
description: Quick introduction to @voilajsx/appkit
order: 1
---

# Getting Started with @voilajsx/appkit

Welcome to the @voilajsx/appkit documentation! This guide will help you get started with the library and introduce you to its main features.

## What is @voilajsx/appkit?

@voilajsx/appkit is a collection of utilities and tools for building Node.js applications. It provides a set of modules for common tasks like authentication, logging, configuration management, and more.

## Installation

You can install @voilajsx/appkit via npm or yarn:

\`\`\`bash
npm install @voilajsx/appkit
\`\`\`

Or with yarn:

\`\`\`bash
yarn add @voilajsx/appkit
\`\`\`

## Key Features

- 🔐 **Auth Module**: JWT tokens, password hashing, and authentication middleware
- 📊 **Logging Module**: Structured logging with multiple transports
- ⚙️ **Config Module**: Configuration management with environment variables
- 🌐 **HTTP Module**: HTTP utilities for building and consuming APIs

## Next Steps

- Check out the [Installation Guide](/docs/installation) for detailed installation instructions
- Explore the [Auth Module](/docs/auth) for authentication utilities
- Learn about structured logging with the [Logging Module](/docs/logging)
`;
}

function getInstallationContent() {
  return `---
title: Installation
description: Detailed installation instructions for @voilajsx/appkit
order: 2
---

# Installation Guide

This guide provides detailed instructions for installing and setting up @voilajsx/appkit in your project.

## Prerequisites

- Node.js 14.x or later
- npm 6.x or later (or yarn 1.x)

## Basic Installation

You can install the entire @voilajsx/appkit package:

\`\`\`bash
npm install @voilajsx/appkit
\`\`\`

## Module-Specific Installation

If you only need specific modules, you can import them individually:

\`\`\`javascript
// Only import what you need
import { generateToken, verifyToken } from '@voilajsx/appkit/auth';
import { createLogger } from '@voilajsx/appkit/logging';
\`\`\`

## Setting Up Environment Variables

Some modules require environment variables to be set. Create a \`.env\` file in your project root:

\`\`\`
JWT_SECRET=your-secret-key
LOG_LEVEL=info
\`\`\`

## Verifying Installation

You can verify your installation with this simple test:

\`\`\`javascript
import { createLogger } from '@voilajsx/appkit/logging';

const logger = createLogger({ name: 'test' });
logger.info('Installation successful!');
\`\`\`

If you see the log message, everything is working correctly!
`;
}

function getContributingContent() {
  return `---
title: Contributing
description: Guidelines for contributing to @voilajsx/appkit
order: 3
---

# Contributing to @voilajsx/appkit

We welcome contributions to @voilajsx/appkit! This guide will help you get started with the development process.

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies

\`\`\`bash
git clone https://github.com/your-username/appkit.git
cd appkit
npm install
\`\`\`

## Running Tests

We use Jest for testing. Run the test suite with:

\`\`\`bash
npm test
\`\`\`

## Code Style

We use ESLint and Prettier to maintain code quality. Format your code with:

\`\`\`bash
npm run format
\`\`\`

## Pull Request Process

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Add tests for your changes
4. Run the test suite to ensure everything passes
5. Submit a pull request

## Documentation

Please update the documentation for any new features or changes. We use JSDoc for API documentation and Markdown for guides.

## License

By contributing to @voilajsx/appkit, you agree that your contributions will be licensed under the MIT License.
`;
}

// Mock content functions - Part 2

function getAuthIndexContent() {
  return `---
  title: Auth Module
  description: Authentication utilities for Node.js applications
  icon: 🔐
  order: 1
  ---
  
  # Auth Module
  
  The Auth module provides secure authentication utilities for Node.js applications. It offers JWT token generation and verification, password hashing with bcrypt, and customizable middleware for protecting routes.
  
  ## Features
  
  - **JWT Token Management**: Generate and verify JWT tokens
  - **Password Security**: Hash and compare passwords using bcrypt
  - **Authentication Middleware**: Protect routes with JWT verification
  - **Role-Based Access Control**: Control access based on user roles
  
  ## Installation
  
  \`\`\`bash
  npm install @voilajsx/appkit
  \`\`\`
  
  ## Quick Start
  
  \`\`\`javascript
  import {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    createAuthMiddleware,
  } from '@voilajsx/appkit/auth';
  
  // Generate a JWT token
  const token = generateToken(
    { userId: '123', email: 'user@example.com' },
    { secret: 'your-secret-key' }
  );
  
  // Verify a token
  const payload = verifyToken(token, { secret: 'your-secret-key' });
  
  // Hash a password
  const hash = await hashPassword('myPassword123');
  
  // Verify a password
  const isValid = await comparePassword('myPassword123', hash);
  
  // Protect routes with middleware
  app.get('/profile', createAuthMiddleware({ secret: 'your-secret-key' }), (req, res) => {
    res.json({ user: req.user });
  });
  \`\`\`
  
  ## Documentation
  
  - [API Reference](/docs/auth/api-reference)
  - [Examples](/docs/auth/examples)
  `;
}

function getAuthApiReferenceContent() {
  return `---
  title: Auth API Reference
  description: Complete API documentation for the Auth module
  order: 2
  ---
  
  # Auth API Reference
  
  This reference documents all functions and parameters in the Auth module.
  
  ## JWT Functions
  
  ### generateToken(payload, options)
  
  Generates a JWT token with the specified payload and options.
  
  #### Parameters
  
  | Name | Type | Required | Default | Description |
  | ---- | ---- | -------- | ------- | ----------- |
  | \`payload\` | \`Object\` | Yes | - | The payload to encode in the JWT token |
  | \`options\` | \`Object\` | Yes | - | Configuration options |
  | \`options.secret\` | \`string\` | Yes | - | Secret key used to sign the JWT token |
  | \`options.expiresIn\` | \`string\` | No | \`'7d'\` | Token expiration time (e.g., '1h', '7d') |
  | \`options.algorithm\` | \`string\` | No | \`'HS256'\` | JWT signing algorithm |
  
  #### Returns
  
  - \`string\` - The generated JWT token
  
  #### Example
  
  \`\`\`javascript
  const token = generateToken(
    { userId: '123', email: 'user@example.com' },
    { secret: 'your-secret-key', expiresIn: '24h' }
  );
  \`\`\`
  
  ### verifyToken(token, options)
  
  Verifies and decodes a JWT token.
  
  #### Parameters
  
  | Name | Type | Required | Default | Description |
  | ---- | ---- | -------- | ------- | ----------- |
  | \`token\` | \`string\` | Yes | - | JWT token to verify |
  | \`options\` | \`Object\` | Yes | - | Verification options |
  | \`options.secret\` | \`string\` | Yes | - | Secret key used to verify the JWT token |
  | \`options.algorithms\` | \`string[]\` | No | \`['HS256']\` | Array of allowed algorithms |
  
  #### Returns
  
  - \`Object\` - The decoded token payload
  
  #### Example
  
  \`\`\`javascript
  try {
    const payload = verifyToken(token, { secret: 'your-secret-key' });
    console.log(payload.userId); // '123'
  } catch (error) {
    console.error('Invalid token');
  }
  \`\`\`
  
  ## Password Functions
  
  ### hashPassword(password, rounds)
  
  Hashes a password using bcrypt.
  
  #### Parameters
  
  | Name | Type | Required | Default | Description |
  | ---- | ---- | -------- | ------- | ----------- |
  | \`password\` | \`string\` | Yes | - | Password to hash |
  | \`rounds\` | \`number\` | No | \`10\` | Number of salt rounds for bcrypt |
  
  #### Returns
  
  - \`Promise<string>\` - The hashed password
  
  #### Example
  
  \`\`\`javascript
  const hashedPassword = await hashPassword('myPassword123', 12);
  \`\`\`
  
  ### comparePassword(password, hash)
  
  Compares a plain text password with a bcrypt hash.
  
  #### Parameters
  
  | Name | Type | Required | Description |
  | ---- | ---- | -------- | ----------- |
  | \`password\` | \`string\` | Yes | Plain text password to compare |
  | \`hash\` | \`string\` | Yes | Bcrypt hash to compare against |
  
  #### Returns
  
  - \`Promise<boolean>\` - \`true\` if password matches the hash, \`false\` otherwise
  
  #### Example
  
  \`\`\`javascript
  const isValid = await comparePassword('myPassword123', hashedPassword);
  if (isValid) {
    // Password is correct
  }
  \`\`\`
  
  ## Middleware Functions
  
  ### createAuthMiddleware(options)
  
  Creates an authentication middleware that verifies JWT tokens.
  
  #### Parameters
  
  | Name | Type | Required | Default | Description |
  | ---- | ---- | -------- | ------- | ----------- |
  | \`options\` | \`Object\` | Yes | - | Middleware configuration |
  | \`options.secret\` | \`string\` | Yes | - | JWT secret key |
  | \`options.getToken\` | \`Function\` | No | See docs | Custom function to extract token from request |
  | \`options.onError\` | \`Function\` | No | See docs | Custom error handler |
  
  #### Returns
  
  - \`Function\` - Express middleware function
  
  #### Example
  
  \`\`\`javascript
  const auth = createAuthMiddleware({
    secret: process.env.JWT_SECRET,
    getToken: (req) => req.headers['x-api-key'],
    onError: (error, req, res) => {
      res.status(401).json({ error: error.message });
    },
  });
  
  app.get('/profile', auth, (req, res) => {
    // req.user contains the JWT payload
    res.json({ userId: req.user.userId });
  });
  \`\`\`
  
  ### createAuthorizationMiddleware(allowedRoles, options)
  
  Creates middleware for role-based access control.
  
  #### Parameters
  
  | Name | Type | Required | Default | Description |
  | ---- | ---- | -------- | ------- | ----------- |
  | \`allowedRoles\` | \`string[]\` | Yes | - | Array of roles that are allowed access |
  | \`options\` | \`Object\` | No | \`{}\` | Middleware options |
  | \`options.getRoles\` | \`Function\` | No | See docs | Custom function to extract roles from request |
  
  #### Returns
  
  - \`Function\` - Express middleware function
  
  #### Example
  
  \`\`\`javascript
  const adminOnly = createAuthorizationMiddleware(['admin']);
  
  app.get('/admin', auth, adminOnly, (req, res) => {
    res.json({ message: 'Admin access granted' });
  });
  \`\`\`
  `;
}

function getAuthExamplesContent() {
  return `---
  title: Auth Examples
  description: Usage examples for the Auth module
  order: 3
  ---
  
  # Auth Module Examples
  
  This page provides practical examples of using the Auth module in various scenarios.
  
  ## User Registration and Login
  
  This example shows how to implement user registration and login with password hashing and JWT tokens.
  
  \`\`\`javascript
  import { hashPassword, comparePassword, generateToken } from '@voilajsx/appkit/auth';
  
  // User Registration
  async function registerUser(email, password) {
    // 1. Validate password strength (your logic)
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
  
    // 2. Hash the password
    const hashedPassword = await hashPassword(password);
  
    // 3. Save to database (your implementation)
    const user = await db.createUser({
      email,
      password: hashedPassword,
    });
  
    // 4. Return user (without password)
    return { id: user.id, email: user.email };
  }
  
  // User Login
  async function loginUser(email, password) {
    // 1. Find user by email
    const user = await db.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
  
    // 2. Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
  
    // 3. Generate JWT token
    const token = generateToken(
      { userId: user.id, email: user.email },
      { secret: process.env.JWT_SECRET }
    );
  
    // 4. Return token and user info
    return {
      token,
      user: { id: user.id, email: user.email }
    };
  }
  \`\`\`
  
  ## Protected API Routes
  
  This example demonstrates how to protect API routes using the authentication middleware.
  
  \`\`\`javascript
  import express from 'express';
  import { createAuthMiddleware, createAuthorizationMiddleware } from '@voilajsx/appkit/auth';
  
  const app = express();
  app.use(express.json());
  
  // Create middleware
  const auth = createAuthMiddleware({
    secret: process.env.JWT_SECRET,
  });
  
  // Role-based middleware
  const adminOnly = createAuthorizationMiddleware(['admin']);
  const editorAccess = createAuthorizationMiddleware(['editor', 'admin']);
  
  // Public routes
  app.post('/auth/login', loginHandler);
  app.post('/auth/register', registerHandler);
  
  // Protected routes - any authenticated user
  app.get('/api/profile', auth, (req, res) => {
    // req.user contains the decoded token payload
    res.json({ user: req.user });
  });
  
  // Admin only routes
  app.get('/api/admin/users', auth, adminOnly, (req, res) => {
    // Only accessible by admin users
    res.json({ message: 'Admin dashboard' });
  });
  
  // Editor access routes
  app.put('/api/content', auth, editorAccess, (req, res) => {
    // Accessible by editors and admins
    res.json({ message: 'Content updated' });
  });
  
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
  \`\`\`
  `;
}

function getLoggingIndexContent() {
  return `---
  title: Logging Module
  description: Structured logging system for Node.js applications
  icon: 📊
  order: 1
  ---
  
  # Logging Module
  
  The Logging module provides a structured logging system for Node.js applications with multiple transports, log levels, and context management.
  
  ## Features
  
  - **Structured Logging**: JSON-formatted logs for easy parsing and analysis
  - **Multiple Transports**: Console, file, and custom transports
  - **Log Levels**: DEBUG, INFO, WARN, ERROR, etc. with proper filtering
  - **Context Tracking**: Attach and track context through async operations
  - **Performance Metrics**: Built-in support for timing and metric reporting
  
  ## Installation
  
  \`\`\`bash
  npm install @voilajsx/appkit
  \`\`\`
  
  ## Quick Start
  
  \`\`\`javascript
  import { createLogger } from '@voilajsx/appkit/logging';
  
  // Create a logger
  const logger = createLogger({
    name: 'my-app',
    level: 'info',
    transports: ['console'],
  });
  
  // Basic logging
  logger.info('Application started');
  logger.warn('Deprecated feature used', { feature: 'oldApi' });
  logger.error('Failed to connect to database', { error: err });
  
  // With context
  const requestLogger = logger.withContext({ requestId: '123' });
  requestLogger.info('Processing request');
  
  // Performance tracking
  const timer = logger.startTimer();
  // ... do some work ...
  timer.done({ message: 'Operation completed' });
  \`\`\`
  
  ## Documentation
  
  - [API Reference](/docs/logging/api-reference)
  - [Examples](/docs/logging/examples)
  `;
}

function getLoggingApiReferenceContent() {
  return `---
  title: Logging API Reference
  description: Complete API documentation for the Logging module
  order: 2
  ---
  
  # Logging API Reference
  
  This reference documents all functions and parameters in the Logging module.
  
  ## Core Functions
  
  ### createLogger(options)
  
  Creates a new logger instance with the specified options.
  
  #### Parameters
  
  | Name | Type | Required | Default | Description |
  | ---- | ---- | -------- | ------- | ----------- |
  | \`options\` | \`Object\` | Yes | - | Logger configuration options |
  | \`options.name\` | \`string\` | Yes | - | Name of the logger (appears in logs) |
  | \`options.level\` | \`string\` | No | \`'info'\` | Minimum log level to output |
  | \`options.transports\` | \`Array\` | No | \`['console']\` | Array of transport names or objects |
  | \`options.format\` | \`Function\` | No | \`null\` | Custom format function |
  | \`options.context\` | \`Object\` | No | \`{}\` | Default context for all log entries |
  
  #### Returns
  
  - \`Object\` - Logger instance with logging methods
  
  #### Example
  
  \`\`\`javascript
  const logger = createLogger({
    name: 'api-server',
    level: 'debug',
    transports: ['console', { type: 'file', filename: 'app.log' }],
    context: { environment: 'production' }
  });
  \`\`\`
  
  ## Logger Methods
  
  ### logger.log(level, message, context)
  
  Logs a message at the specified level.
  
  #### Parameters
  
  | Name | Type | Required | Description |
  | ---- | ---- | -------- | ----------- |
  | \`level\` | \`string\` | Yes | Log level (debug, info, warn, error) |
  | \`message\` | \`string\` | Yes | Message to log |
  | \`context\` | \`Object\` | No | Additional context for this log entry |
  
  #### Example
  
  \`\`\`javascript
  logger.log('info', 'User logged in', { userId: '123' });
  \`\`\`
  `;
}

function getLoggingExamplesContent() {
  return `---
  title: Logging Examples
  description: Usage examples for the Logging module
  order: 3
  ---
  
  # Logging Module Examples
  
  This page provides practical examples of using the Logging module in various scenarios.
  
  ## Basic Logging
  
  Simple example of creating a logger and using different log levels.
  
  \`\`\`javascript
  import { createLogger } from '@voilajsx/appkit/logging';
  
  // Create a basic logger
  const logger = createLogger({
    name: 'example-app',
    level: 'info',
  });
  
  // Log at different levels
  logger.debug('This is a debug message'); // Won't be output (below 'info' level)
  logger.info('Application started');
  logger.info('User registered', { userId: '123', email: 'user@example.com' });
  logger.warn('API rate limit approaching', { current: 80, limit: 100 });
  logger.error('Failed to process payment', { orderId: 'ORD-123', error: 'Insufficient funds' });
  \`\`\`
  
  ## Performance Monitoring
  
  Example of using timers for performance monitoring.
  
  \`\`\`javascript
  import { createLogger } from '@voilajsx/appkit/logging';
  
  const logger = createLogger({ name: 'performance-monitor' });
  
  async function processData(data) {
    // Start a timer
    const timer = logger.startTimer();
    
    logger.info('Starting data processing', { dataSize: data.length });
    
    // Phase 1
    const phase1Timer = logger.startTimer();
    await doPhase1(data);
    phase1Timer.done({ message: 'Phase 1 completed' });
    
    // Phase 2
    const phase2Timer = logger.startTimer();
    await doPhase2(data);
    phase2Timer.done({ message: 'Phase 2 completed' });
    
    // Overall time
    timer.done({ 
      message: 'Data processing completed',
      dataSize: data.length,
      operation: 'process-data'
    });
  }
  
  // Example usage
  processData(largeDataset)
    .catch(err => logger.error('Data processing failed', { error: err.message }));
  \`\`\`
  `;
}

export default useDocContent;
