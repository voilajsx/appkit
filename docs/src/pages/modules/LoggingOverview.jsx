import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '@/components/ui/CodeBlock';

/**
 * Logging Module Overview page for @voilajs/appkit documentation
 * Provides detailed information about the Logging module
 */
function LoggingOverview() {
  const [activeSection, setActiveSection] = useState('introduction');

  // Update active section based on scroll position
  useEffect(() => {
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Updates the active section based on the scroll position.
 * Iterates through a predefined list of sections, checking if each section
 * is currently in view. If a section is found to be in view (based on its
 * bounding rectangle), it updates the active section state to that section.
 * This helps in dynamically highlighting or updating the UI based on which
 * section is currently visible to the user.
 */

/*******  28a28b26-a735-4cfe-9735-5225719f6193  *******/    const handleScroll = () => {
      const sections = [
        'introduction',
        'module-overview',
        'features',
        'installation',
        'quick-start',
        'core-functions',
        'logger-creation',
        'logging-methods',
        'configuration',
        'use-cases',
        'code-generation',
        'example-code',
        'logging-practices',
        'performance',
        'error-handling',
        'documentation'
      ];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle clicking on TOC links
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // Account for header
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Main content area */}
      <div className="w-full lg:w-3/4 p-3 lg:pr-16">
        {/* Page header */}
        <div className="flex items-center mb-2">
          <span className="text-4xl mr-4">📝</span>
          <h1 className="text-4xl font-bold">Logging Module</h1>
        </div>
        
        <div className="flex space-x-2 mb-6">
          <a href="https://www.npmjs.com/package/@voilajs/appkit" target="_blank" rel="noopener noreferrer" className="inline-block">
            <img src="https://img.shields.io/npm/v/@voilajs/appkit.svg" alt="npm version" />
          </a>
          <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="inline-block">
            <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
          </a>
        </div>

        {/* Introduction section */}
        <section id="introduction" className="mb-12 scroll-mt-20">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded mb-6">
            <p className="text-blue-800 dark:text-blue-200 text-lg font-medium">
              Structured logging with file storage and retention for Node.js applications
            </p>
          </div>
          
          <p className="mb-4">
            The Logging module of <code>@voilajs/appkit</code> provides a simple yet powerful logging
            system with automatic file rotation, retention policies, and support for
            contextual logging through child loggers.
          </p>
        </section>

        {/* Module Overview section */}
        <section id="module-overview" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Module Overview</h2>
          
          <p className="mb-6">
            The Logging module provides everything you need for robust application logging:
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Feature
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    What it does
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Main functions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Logger Creation</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Initialize loggers with various options</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>createLogger()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Log Levels</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Log messages at appropriate severity</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>logger.info()</code>, <code>logger.error()</code>, <code>logger.warn()</code>, <code>logger.debug()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Contextual Logging</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Add context to all related log messages</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>logger.child()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">File Management</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Store logs with rotation and retention</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    File storage configuration options
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🚀 Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Multiple Log Levels
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Error, warn, info, and debug levels for appropriate message categorization.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📁</span>
                Automatic File Storage
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Logs saved to files with daily rotation to keep your logs organized.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🔄</span>
                Retention Management
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Automatic cleanup of old log files to prevent disk space issues.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🔗</span>
                Child Loggers
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Add context to logs for requests or operations for better traceability.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🎨</span>
                Pretty Console Output
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Colored and formatted console logs to improve readability during development.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📦</span>
                Zero Configuration
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Works out of the box with sensible defaults for quick implementation.
              </p>
            </div>
          </div>
        </section>

        {/* Installation section */}
        <section id="installation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📦 Installation</h2>
          
          <p className="mb-4">
            Install the package using your preferred package manager:
          </p>
          
          <CodeBlock 
            code="npm install @voilajs/appkit" 
            language="bash"
            showCopyButton={true}
          />
        </section>

        {/* Quick Start section */}
        <section id="quick-start" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🏃‍♂️ Quick Start</h2>
          
          <p className="mb-4">
            Import only the functions you need and start using them right away. The logging
            module provides a simple, fluent API for all your logging needs.
          </p>
          
          <CodeBlock 
            code={`import { createLogger } from '@voilajs/appkit/logging';

// Create a logger with default settings
const logger = createLogger();

// Log messages at different levels
logger.info('Application started');
logger.error('Database connection failed', { error: err.message });
logger.warn('API rate limit approaching', { current: 950, limit: 1000 });
logger.debug('Cache miss', { key: 'user:123' });

// Create child logger with context
const requestLogger = logger.child({ requestId: 'abc123' });
requestLogger.info('Processing request');`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Core Functions section */}
        <section id="core-functions" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📖 Core Functions</h2>
          
          <p className="mb-4">
            The logging module provides a set of core functions to create, customize, and use loggers
            effectively throughout your application.
          </p>
        </section>

        {/* Logger Creation section */}
        <section id="logger-creation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Logger Creation and Management</h2>
          
          <p className="mb-4">
            These utilities enable you to create and configure loggers for your application.
            Loggers handle the details of log formatting, storage, and management so you can
            focus on recording important events.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Function
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Purpose
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    When to use
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>createLogger()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Creates a new logger instance with options
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Application startup, module initialization
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>logger.child()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Creates a child logger with added context
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Request handling, operation tracking
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Create a logger with custom options
const logger = createLogger({
  level: 'info',
  dirname: 'logs',
  filename: 'app.log',
});

// Create a child logger with request context
const requestLogger = logger.child({
  requestId: 'req-123',
  userId: 'user-456',
});`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Logging Methods section */}
        <section id="logging-methods" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Logging Methods</h2>
          
          <p className="mb-4">
            These methods let you log messages at different severity levels, helping you
            categorize information and filter logs based on importance.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Function
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Purpose
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    When to use
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>logger.error()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Logs errors and critical issues
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Exceptions, fatal errors, security breaches
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>logger.warn()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Logs warnings and potential problems
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Deprecation notices, approaching limits
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>logger.info()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Logs normal operational information
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Startup events, normal operations
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>logger.debug()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Logs detailed debugging information
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Development details, troubleshooting
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Log at different levels
logger.error('Failed to connect to database', {
  error: err.message,
  connectionString: 'db://hostname:port/dbname',
});

logger.warn('API rate limit at 80%', {
  current: 800,
  limit: 1000,
});

logger.info('User login successful', {
  userId: 'user-123',
  loginTime: new Date(),
});

logger.debug('Cache operation details', {
  operation: 'set',
  key: 'user:123',
  ttl: 3600,
});`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Configuration Options section */}
        <section id="configuration" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔧 Configuration Options</h2>
          
          <p className="mb-4">
            The examples above show basic usage, but you have much more control over how the
            logging system works. Here are the customization options available:
          </p>
          
          <h4 className="text-xl font-semibold mb-3">Logger Creation Options</h4>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Option
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Description
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Default
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Example
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>level</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Minimum log level to record
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'info'</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'debug'</code>, <code>'info'</code>, <code>'warn'</code>, <code>'error'</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>dirname</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Directory for log files
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'logs'</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'app/logs'</code>, <code>'/var/log/myapp'</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>filename</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Base name for log files
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'app.log'</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'server.log'</code>, <code>'api.log'</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>retentionDays</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Days to keep log files
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>7</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>30</code>, <code>90</code>, <code>365</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>maxSize</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Max file size before rotation
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>10485760</code> (10MB)
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>52428800</code> (50MB)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>enableFileLogging</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Whether to write logs to files
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>true</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>false</code> (console only)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>customFormat</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Custom formatter function
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>undefined</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Function for custom formatting
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Logger with custom configuration
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  dirname: 'logs',
  filename: 'application.log',
  retentionDays: 30,
  maxSize: 52428800, // 50MB
  enableFileLogging: true,
});`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Use Cases section */}
        <section id="use-cases" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">💡 Common Use Cases</h2>
          
          <p className="mb-4">
            Here's where you can apply the logging module's functionality in your
            applications:
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Track database connectivity problems
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>logger.error()</code> with connection info
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white" rowSpan="2">
                    Background Jobs
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Job Execution
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Track background task execution
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>logger.child()</code> with job context
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Scheduled Tasks
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Monitor cron jobs and scheduled operations
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>logger.info()</code> for job completion
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white" rowSpan="2">
                    Security
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Auth Events
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Track login attempts and authentication events
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>logger.info()</code> for success, <code>logger.warn()</code> for failures
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Security Alerts
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Log potential security incidents
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>logger.error()</code> with security context
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white" rowSpan="2">
                    DevOps
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Application Startup
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Log startup configuration and environment details
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>logger.info()</code> with startup details
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Health Checks
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Record results of regular health checks
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>logger.info()</code> or <code>logger.error()</code> based on status
                  </td>
                </tr>
              </thead>
            </table>
          </div>
        </section>

        {/* Code Generation section */}
        <section id="code-generation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🤖 Code Generation with LLMs</h2>
          
          <p className="mb-6">
            You can use large language models (LLMs) like ChatGPT or Claude to generate code
            for common logging scenarios using the <code>@voilajs/appkit/logging</code> module.
            We've created a specialized
            <a 
              href="https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline mx-1"
            >
              PROMPT_REFERENCE.md
            </a>
            document that's designed specifically for LLMs to understand the module's
            capabilities and generate high-quality logging code.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">How to Use LLM Code Generation</h3>
          
          <p className="mb-4">
            Simply copy one of the prompts below and share it with ChatGPT, Claude, or
            another capable LLM. The LLM will read the reference document and generate
            optimized, best-practice logging code tailored to your specific requirements.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">Sample Prompts to Try</h3>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <h4 className="text-xl font-semibold mb-3">Basic Logging Setup</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
              Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md and then create a complete logging system for an Express app using @voilajs/appkit/logging with the following features:
              <br/>- Structured logger initialization with custom retention policies
              <br/>- Request logging middleware with request IDs
              <br/>- Error handling middleware with detailed error logging
              <br/>- Performance monitoring for slow requests
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <h4 className="text-xl font-semibold mb-3">Microservice Logging</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
              Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md and then implement a logging system for a microservice architecture using @voilajs/appkit/logging that includes:
              <br/>- Consistent request ID propagation across services
              <br/>- Correlation IDs for tracing requests
              <br/>- Service-specific context in all logs
              <br/>- Centralized log configuration
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold mb-3">Advanced Logging Patterns</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
              Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md and then implement advanced logging patterns using @voilajs/appkit/logging with:
              <br/>- Hierarchical loggers for different application components
              <br/>- Redaction of sensitive information
              <br/>- Performance profiling with timing measurements
              <br/>- Custom formatting for different environments (dev/staging/prod)
              <br/>- Log aggregation preparation for ELK stack
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>
        </section>

        {/* Example Code section */}
        <section id="example-code" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📋 Example Code</h2>
          
          <p className="mb-6">
            For complete, working examples, check our examples folder:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold mb-2">Basic Logging</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                How to use different log levels and metadata.
              </p>
              <a 
                href="https://github.com/voilajs/appkit/blob/main/src/logging/examples/01-basic-logging.js" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                View example
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold mb-2">Child Loggers</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Creating context-aware child loggers.
              </p>
              <a 
                href="https://github.com/voilajs/appkit/blob/main/src/logging/examples/02-child-logger.js" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                View example
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold mb-2">File Configuration</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Customizing file storage options.
              </p>
              <a 
                href="https://github.com/voilajs/appkit/blob/main/src/logging/examples/03-file-config.js" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                View example
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold mb-2">Express Integration</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Using loggers with Express.js.
              </p>
              <a 
                href="https://github.com/voilajs/appkit/blob/main/src/logging/examples/04-express-basic.js" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                View example
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Logging Best Practices section */}
        <section id="logging-practices" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🛡️ Logging Best Practices</h2>
          
          <p className="mb-4">
            Following these practices will help ensure your logging system remains effective
            and secure:
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">1. Use appropriate log levels</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Only log what's needed at each level to avoid overwhelming logs and making it
                difficult to find important information.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">2. Never log sensitive data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Avoid passwords, API keys, or personal information in logs to prevent
                security breaches if logs are compromised.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">3. Add context to logs</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Include request IDs and relevant metadata for easier troubleshooting
                and tracing of issues across your system.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">4. Implement retention policies</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Delete old logs to comply with data regulations and prevent disk
                space issues on servers.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">5. Structure your logs</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use metadata objects rather than string concatenation to make logs
                more searchable and machine-readable.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">6. Use consistent formats</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Maintain a standard logging pattern across your application for easier
                analysis and aggregation.
              </p>
            </div>
          </div>
        </section>

        {/* Performance Considerations section */}
        <section id="performance" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📊 Performance Considerations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Set appropriate log levels</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use 'info' or 'warn' in production to avoid excessive logging and
                performance impact.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Configure reasonable file sizes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Set appropriate maxSize and rotation settings to avoid disk issues and
                slow write operations.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Use child loggers</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create child loggers rather than new loggers to improve performance
                and reuse resources.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Avoid excessive logging</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Be mindful of logging in high-throughput code paths that could create
                bottlenecks.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Consider log batching</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                For very high-volume logs, consider batching log messages before writing
                to disk.
              </p>
            </div>
          </div>
        </section>

        {/* Error Handling section */}
        <section id="error-handling" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔍 Error Handling</h2>
          
          <p className="mb-4">
            The logging module is designed to help you track errors effectively:
          </p>
          
          <CodeBlock 
            code={`try {
  // Operation that might fail
  await database.connect();
} catch (error) {
  logger.error('Database connection failed', {
    error: error.message,
    stack: error.stack,
    connectionDetails: {
      host: database.host,
      port: database.port,
      database: database.name,
    },
  });

  // Handle the error appropriately
}`}
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 rounded">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Best Practice:</strong> Always include relevant context when logging errors to make
              debugging easier. Include error messages, stack traces, and any relevant application state.
            </p>
          </div>
        </section>

        {/* Documentation Links section */}
        <section id="documentation" className="mb-6 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📚 Documentation Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <a 
              href="https://github.com/voilajs/appkit/blob/main/src/logging/docs/DEVELOPER_REFERENCE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📘</span>
                Developer Reference
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Detailed implementation guide
              </p>
            </a>
            
            <a 
              href="https://github.com/voilajs/appkit/blob/main/src/logging/docs/API_REFERENCE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📗</span>
                API Reference
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Complete API documentation
              </p>
            </a>
            
            <a 
              href="https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📙</span>
                LLM Code Generation Reference
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Guide for AI/LLM code generation
              </p>
            </a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold mb-3">Contributing</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We welcome contributions! Please see our
              <a 
                href="https://github.com/voilajs/appkit/blob/main/CONTRIBUTING.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline mx-1"
              >
                Contributing Guide
              </a>
              for details.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>License:</strong> MIT © <a 
                href="https://github.com/voilajs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                VoilaJS
              </a>
            </p>
          </div>
          
          <div className="mt-8 p-4 text-center text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
            <p>
              Built with ❤️ in India by the 
              <a 
                href="https://github.com/orgs/voilajs/people" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline mx-1"
              >
                VoilaJS Team
              </a> 
              — powering modern web development.
            </p>
          </div>
        </section>
      </div>

      {/* TOC column */}
      <div className="hidden lg:block lg:w-1/4">
        <div className="sticky" style={{ top: "5rem" }}>
          <div className="">
            <div className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">On this page</div>
            <nav className="toc">
              <ul className="space-y-2 text-sm p-0 m-0">
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('introduction')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'introduction' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Introduction
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('module-overview')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'module-overview' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Module Overview
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('features')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'features' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Features
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('installation')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'installation' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Installation
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('quick-start')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'quick-start' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Quick Start
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('core-functions')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'core-functions' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Core Functions
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('logger-creation')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'logger-creation' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Logger Creation
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('logging-methods')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'logging-methods' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Logging Methods
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('configuration')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'configuration' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Configuration Options
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('use-cases')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'use-cases' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Common Use Cases
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('code-generation')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'code-generation' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Code Generation
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('example-code')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'example-code' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Example Code
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('logging-practices')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'logging-practices' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Logging Best Practices
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('performance')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'performance' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Performance Considerations
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('error-handling')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'error-handling' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Error Handling
                </button>
              </li>
              <li className="list-none">
                <button 
                  onClick={() => scrollToSection('documentation')}
                  className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeSection === 'documentation' 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Documentation Links
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
);
}

export default LoggingOverview;