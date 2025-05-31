import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import CodeBlock from '@/components/ui/CodeBlock';

// Debounce utility for scroll handling
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Error Boundary Component
class LoggingErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="my-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            An error occurred while rendering the documentation. Please check the console for details or try refreshing the page.
          </p>
          <p className="text-gray-700 dark:text-gray-300">Error: {this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Logging Module Documentation
 * A comprehensive guide to using @voilajsx/appkit's Logging module, designed for clarity and practicality.
 */
function LoggingOverview() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const location = useLocation();

  // Table of Contents
  const sections = useMemo(
    () => [
      { name: 'Getting Started', id: 'getting-started' },
      { name: 'Core Concepts', id: 'core-concepts' },
      { name: 'Installation', id: 'installation' },
      { name: 'Basic Usage', id: 'basic-usage' },
      { name: 'Configuration Options', id: 'configuration-options' },
      { name: 'Logging Methods', id: 'logging-methods' },
      { name: 'Child Loggers', id: 'child-loggers' },
      { name: 'Common Use Cases', id: 'use-cases' },
      { name: 'Advanced Features', id: 'advanced-features' },
      { name: 'Performance Tips', id: 'performance-tips' },
      { name: 'Best Practices', id: 'best-practices' },
      { name: 'Troubleshooting', id: 'troubleshooting' },
      { name: 'API Reference', id: 'api-reference' },
    ],
    []
  );

  // Scroll handler for TOC highlighting
  const handleScroll = useCallback(
    debounce(() => {
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          setActiveSection(section.id);
          window.history.replaceState(null, '', `#${section.id}`);
          break;
        }
      }
    }, 100),
    [sections]
  );

  // Smooth scroll to section
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
      window.history.replaceState(null, '', `#${sectionId}`);
    }
  }, []);

  // Handle hash navigation
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      scrollToSection(sectionId);
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.hash, handleScroll, scrollToSection]);

  return (
    <LoggingErrorBoundary>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Main Content */}
        <div className="w-full lg:w-3/4 p-8 lg:pr-16">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3" aria-hidden="true">📝</span> Logging Module
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Structured logging for Node.js with file storage and retention policies.
            </p>
            <div className="flex space-x-3 mt-4">
              <a
                href="https://www.npmjs.com/package/@voilajsx/appkit"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="npm package"
              >
                <img src="https://img.shields.io/npm/v/@voilajsx/appkit.svg" alt="npm version" />
              </a>
              <a
                href="https://opensource.org/licenses/MIT"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MIT License"
              >
                <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
              </a>
            </div>
          </header>

          {/* Getting Started */}
          <section id="getting-started" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Getting Started</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The <code>@voilajsx/appkit</code> Logging module provides a robust, structured logging system for Node.js applications. It simplifies logging with features like multiple log levels, file rotation, retention policies, and contextual logging via child loggers. Whether you’re debugging a small app or monitoring a microservices architecture, this module ensures your logs are organized, searchable, and efficient.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              With zero-configuration defaults, you can start logging immediately, while advanced options let you customize storage, formatting, and behavior. The module supports console output, file storage, and integration with log aggregation systems, making it versatile for development and production environments.
            </p>
            <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
              <li>Multiple log levels: error, warn, info, debug.</li>
              <li>Automatic file rotation and retention management.</li>
              <li>Contextual logging with child loggers for request or operation tracing.</li>
              <li>Pretty console output for development.</li>
              <li>Customizable formats for machine-readable logs.</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Ready to start logging?{' '}
              <button
                onClick={() => scrollToSection('installation')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Jump to Installation
              </button>
              .
            </p>
          </section>
          {/* Core Concepts */}
          <section id="core-concepts" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">Core Concepts</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Before exploring the code, let’s understand the key ideas behind the Logging module. These concepts will help you make sense of how logging works in your app:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                {
                  title: 'Structured Logging',
                  desc: 'The Logging module organizes logs as clear, structured data, like a detailed journal. This makes it easy to find and analyze information when debugging or monitoring your app.',
                },
                {
                  title: 'Log Levels',
                  desc: 'Logs are categorized by importance, from critical errors to minor debug details. This lets you focus on what matters most, like fixing issues or tracking app behavior.',
                },
                {
                  title: 'File Rotation',
                  desc: 'To keep logs manageable, the module automatically splits them into smaller files over time, like daily journals. Old logs are cleaned up to save space.',
                },
                {
                  title: 'Contextual Logging',
                  desc: 'Add extra details to logs, like user IDs or request info, to track specific actions. It’s like adding sticky notes to your journal for better context.',
                },
              ].map((concept, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-semibold mb-2">{concept.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{concept.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              These concepts make logging powerful and organized. In the next sections, we’ll show you how to put them to work with practical examples.
            </p>
          </section>

          {/* Installation */}
          <section id="installation" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Installation</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Installing the Logging module is straightforward. You’ll need Node.js 14 or higher and a package manager like npm, yarn, or pnpm. Follow these steps to add it to your project.
            </p>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Step 1: Install the Package</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Run this command in your project directory:
              </p>
              <CodeBlock
                code="npm install @voilajsx/appkit"
                language="bash"
                showCopyButton={true}
              />
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                Verify the package is installed by checking your <code>package.json</code>.
              </p>
            </div>
            <div className="my-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Step 2: Import the Module</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Import the Logging module in your JavaScript or TypeScript file:
              </p>
              <CodeBlock
                code="import { createLogger } from '@voilajsx/appkit/logging';"
                language="javascript"
                showCopyButton={true}
              />
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                For CommonJS: <code>  const &#123; createLogger &#125; = require('@voilajsx/appkit/logging');</code>
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              You’re ready to start logging. If you run into issues, see the{' '}
              <button
                onClick={() => scrollToSection('troubleshooting')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Troubleshooting
              </button>{' '}
              section.
            </p>
          </section>

          {/* Basic Usage */}
          <section id="basic-usage" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Basic Usage</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Let’s create a logger and log messages at different levels. This example uses default settings, but you can customize them later.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Note:</strong> The following code examples are for illustration. Copy them into your application, ensuring <code>@voilajsx/appkit/logging</code> is installed and imported.
            </p>
            <div className="">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Create and Use a Logger</h3>
              <CodeBlock
                code={`
import { createLogger } from '@voilajsx/appkit/logging';

// Create a logger with default settings
const logger = createLogger();

// Log messages at different levels
logger.info('Application started successfully');
logger.warn('API rate limit approaching', { current: 950, limit: 1000 });
logger.error('Database connection failed', { error: 'Timeout' });
logger.debug('Processing user data', { userId: '123' });
                `}
                language="javascript"
                showCopyButton={true}
              />
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                This creates a logger that writes to <code>logs/app.log</code> with daily rotation and outputs to the console in development.
              </p>
            </div>
          </section>

          {/* Configuration Options */}
          <section id="configuration-options" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Configuration Options</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Customize your logger with options for log levels, file storage, rotation, and formatting. Here’s a detailed overview of <code>createLogger</code> options.
            </p>
            <div className="my-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Available Options</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Option</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Default</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>level</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Minimum log level to record</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>'info'</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>'debug'</code></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>dirname</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Directory for log files</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>'logs'</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>'/var/log/app'</code></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>filename</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Base name for log files</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>'app.log'</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>'server.log'</code></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>retentionDays</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Days to keep log files</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>7</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>30</code></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>maxSize</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Max file size before rotation (bytes)</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>10485760</code> (10MB)</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>52428800</code> (50MB)</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>enableFileLogging</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Write logs to files</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>true</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>false</code></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>customFormat</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Custom log formatter function</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>undefined</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto text-xs">
    <code>(info) =&gt; &#96;${'{'}info.level{'}'}: ${'{'}info.message{'}'}&#96;</code>
  </pre>
</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="my-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Example: Custom Logger</h3>
          <CodeBlock
  code={`import { createLogger } from '@voilajsx/appkit/logging';

// Create a logger with custom options
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  dirname: 'logs',
  filename: 'application.log',
  retentionDays: 30,
  maxSize: 52428800, // 50MB
  enableFileLogging: true,
  customFormat: (info) => \\\`$\{info.timestamp} [$\{info.level.toUpperCase()}] $\{info.message}\\\`
});`}
  language="javascript"
  showCopyButton={true}
/>
            </div>
          </section>

          {/* Logging Methods */}
          <section id="logging-methods" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Logging Methods</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The logger provides methods for different severity levels, allowing you to categorize messages based on importance.
            </p>
            <div className="my-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Available Methods</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Method</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Purpose</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">When to Use</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>logger.error()</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Logs critical issues</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Exceptions, security breaches</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>logger.warn()</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Logs potential problems</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Rate limits, deprecations</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>logger.info()</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Logs operational info</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Startup, user actions</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>logger.debug()</code></td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Logs detailed debug info</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Troubleshooting, development</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="my-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Example: Logging Levels</h3>
              <CodeBlock
                code={`
const logger = createLogger();

logger.error('Database connection failed', {
  error: 'Timeout',
  host: 'db.example.com'
});
logger.warn('Memory usage high', {
  usage: '85%',
  threshold: '90%'
});
logger.info('User logged in', {
  userId: '123',
  timestamp: new Date()
});
logger.debug('Query executed', {
  query: 'SELECT * FROM users',
  duration: '50ms'
});
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
          </section>

          {/* Child Loggers */}
          <section id="child-loggers" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Child Loggers</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Child loggers add context to logs, making it easier to trace requests or operations across your application.
            </p>
            <div className="my-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Example: Request Logging</h3>
              <CodeBlock
                code={`
import { createLogger } from '@voilajsx/appkit/logging';

const logger = createLogger();

// Create a child logger for a request
const requestLogger = logger.child({
  requestId: 'req-123',
  userId: 'user-456'
});

requestLogger.info('Processing API request');
requestLogger.error('Request failed', { error: 'Invalid input' });
                `}
                language="javascript"
                showCopyButton={true}
              />
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                The child logger includes <code>requestId</code> and <code>userId</code> in all logs, improving traceability.
              </p>
            </div>
          </section>

          {/* Common Use Cases */}
          <section id="use-cases" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Common Use Cases</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Logging module supports various scenarios. Here are practical examples.
            </p>
            <div className="space-y-6">
              <div className="my-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">API Request Logging</h3>
                <CodeBlock
                  code={`
import { createLogger } from '@voilajsx/appkit/logging';

const logger = createLogger();

app.use((req, res, next) => {
  const requestLogger = logger.child({
    requestId: crypto.randomUUID(),
    method: req.method,
    path: req.path
  });
  requestLogger.info('Received request');
  req.logger = requestLogger;
  next();
});
                `}
                  language="javascript"
                showCopyButton={true}
              />
              </div>
              <div className="my-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Tracking</h3>
                <CodeBlock
                  code={`
try {
  await db.connect();
} catch (error) {
  logger.error('Database error', {
    error: error.message,
    stack: error.stack,
    connection: db.config
  });
}
                `}
                language="javascript"
                showCopyButton={true}
              />
              </div>
              <div className="my-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Performance Monitoring</h3>
                <CodeBlock
                  code={`
const start = Date.now();
await processHeavyTask();
logger.info('Task completed', {
  duration: \`\${Date.now() - start}ms\`
});
                `}
                language="javascript"
                showCopyButton={true}
              />
              </div>
            </div>
          </section>

          {/* Advanced Features */}
          <section id="advanced-features" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Advanced Features</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Explore advanced capabilities for complex logging needs.
            </p>
            <div className="space-y-6">
              <div className="my-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Custom Formatting</h3>
                <CodeBlock
                  code={`
const logger = createLogger({
  customFormat: (info) => {
    return JSON.stringify({
      timestamp: info.timestamp,
      level: info.level,
      message: info.message,
      ...info.meta
    });
  }
});
                `}
                language="javascript"
                showCopyButton={true}
              />
              </div>
              <div className="my-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Log Aggregation</h3>
                <CodeBlock
                  code={`
const logger = createLogger({
  customFormat: (info) => {
    return JSON.stringify({
      '@timestamp': info.timestamp,
      level: info.level,
      message: info.message,
      service: 'my-app',
      ...info.meta
    });
  }
});
                `}
                language="javascript"
                showCopyButton={true}
              />
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                This format is compatible with ELK Stack for centralized logging.
              </p>
              </div>
            </div>
          </section>

          {/* Performance Tips */}
          <section id="performance-tips" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Performance Tips</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Optimize logging for high-performance applications.
            </p>
            <div className="my-4">
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                <li>Use <code>info</code> or <code>warn</code> in production to reduce log volume.</li>
                <li>Reuse child loggers instead of creating new ones per request.</li>
                <li>Configure reasonable <code>maxSize</code> to avoid disk I/O bottlenecks.</li>
                <li>Consider async logging for high-throughput apps.</li>
              </ul>
            </div>
          </section>

          {/* Best Practices */}
          <section id="best-practices" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Best Practices</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Follow these guidelines for effective logging.
            </p>
            <div className="my-4">
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                <li>Avoid logging sensitive data (e.g., passwords, API keys).</li>
                <li>Use structured metadata for searchable logs.</li>
                <li>Implement retention policies to comply with regulations.</li>
                <li>Standardize log formats across services.</li>
              </ul>
            </div>
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Troubleshooting</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Common issues and solutions for the Logging module.
            </p>
            <div className="space-y-6">
              <div className="my-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Module Not Found</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  If you see <code>createLogger is not defined</code>:
                </p>
                <CodeBlock
                  code="npm install @voilajsx/appkit"
                  language="bash"
                  showCopyButton={true}
                />
                <p className="text-gray-700 dark:text-gray-300 mt-2">
  Verify the import:{' '}
  <code>
    import &#123; createLogger &#125; from '@voilajsx/appkit/logging';
  </code>
</p>
              </div>
              <div className="my-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">File Permission Errors</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  If logs aren’t written to the <code>logs</code> directory:
                </p>
                <CodeBlock
                  code={`
import { createLogger } from '@voilajsx/appkit/logging';

try {
  const logger = createLogger({ dirname: 'logs' });
} catch (error) {
  if (error.code === 'EACCES') {
    console.error('Permission denied for log directory:', error.message);
  }
}
                  `}
                  language="javascript"
                  showCopyButton={true}
                />
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  Ensure the app has write permissions for the log directory.
                </p>
              </div>
              <div className="my-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Logs in Production</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  If logs aren’t appearing, check the log level:
                </p>
                <CodeBlock
                  code={`
const logger = createLogger({
  level: 'info' // Ensure this isn’t set to 'error' in production
});
                `}
                  language="javascript"
                  showCopyButton={true}
                />
              </div>
            </div>
          </section>

          {/* API Reference */}
          <section id="api-reference" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">API Reference</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For complete details, see the{' '}
              <a
                href="https://github.com/voilajsx/appkit/blob/main/src/logging/docs/API_REFERENCE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                API Reference
              </a>.
            </p>
            <div className="my-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Core Functions</h3>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                <li><code>createLogger(options)</code>: Create a logger instance.</li>
                <li><code>logger.child(meta)</code>: Create a child logger with context.</li>
                <li><code>logger.error(message, meta)</code>: Log an error.</li>
                <li><code>logger.warn(message, meta)</code>: Log a warning.</li>
                <li><code>logger.info(message, meta)</code>: Log info.</li>
                <li><code>logger.debug(message, meta)</code>: Log debug info.</li>
              </ul>
            </div>
          </section>
        </div>

        {/* TOC */}
        <aside className="hidden lg:block lg:w-1/4 p-8">
          <div className="sticky top-20">
            <nav className="toc" aria-label="Table of contents" role="navigation">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">On This Page</h2>
              <ul className="space-y-1 text-sm">
                {sections.map((section) => (
                  <li key={section.id} className="list-none">
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        activeSection === section.id
                          ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                      aria-current={activeSection === section.id ? 'true' : 'false'}
                      aria-label={`Go to ${section.name} section`}
                    >
                      {section.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    </LoggingErrorBoundary>
  );
}

export default LoggingOverview;