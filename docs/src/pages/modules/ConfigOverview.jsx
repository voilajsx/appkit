import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '@/components/ui/CodeBlock';

/**
 * Config Module Overview page for @voilajsx/appkit documentation
 * Provides detailed information about the Config module
 */
function ConfigOverview() {
  const [activeSection, setActiveSection] = useState('introduction');

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'introduction',
        'module-overview',
        'features',
        'installation',
        'quick-start',
        'config-loading',
        'config-access',
        'schema-validation',
        'configuration-options',
        'use-cases',
        'code-generation',
        'example-code',
        'best-practices',
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
          <span className="text-4xl mr-4">🔧</span>
          <h1 className="text-4xl font-bold">Config Module</h1>
        </div>
        
        <div className="flex space-x-2 mb-6">
          <a href="https://www.npmjs.com/package/@voilajsx/appkit" target="_blank" rel="noopener noreferrer" className="inline-block">
            <img src="https://img.shields.io/npm/v/@voilajsx/appkit.svg" alt="npm version" />
          </a>
          <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="inline-block">
            <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
          </a>
        </div>

        {/* Introduction section */}
        <section id="introduction" className="mb-12 scroll-mt-20">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded mb-6">
            <p className="text-blue-800 dark:text-blue-200 text-lg font-medium">
              Robust, flexible configuration management for Node.js applications
            </p>
          </div>
          
          <p className="mb-4">
            The Config module of <code>@voilajsx/appkit</code> provides powerful configuration
            management utilities including loading from multiple sources, validation,
            environment variable integration, and real-time configuration updates.
          </p>
        </section>

        {/* Module Overview section */}
        <section id="module-overview" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Module Overview</h2>
          
          <p className="mb-6">
            The Config module provides everything you need for robust application configuration:
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
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Config Loading</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Load configuration from various sources</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>loadConfig()</code>, <code>reloadConfig()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Config Access</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Retrieve configuration values</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>getConfig()</code>, <code>hasConfig()</code>, <code>getEnv()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Schema Validation</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Validate configuration structure</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>validateConfig()</code>, <code>defineSchema()</code>, <code>getConfigSchema()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Config Management</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Update and manage configuration</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>setConfig()</code>, <code>clearConfig()</code>
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
                <span className="text-2xl mr-2">📁</span>
                Multiple Sources
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Load configuration from JSON, JavaScript, or .env files, unifying your 
                config sources.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">✅</span>
                Schema Validation
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Validate your configuration against schemas to ensure correctness and 
                prevent runtime errors.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🔄</span>
                Environment Integration
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Automatically integrate with environment variables to override configuration
                based on environment.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🔍</span>
                Variable Interpolation
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Reference values within your configuration for more dynamic and reusable
                configuration files.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">👀</span>
                Auto-Reload
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Watch for file changes and reload configuration automatically during development.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🛡️</span>
                Type Safety
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Strong typing support with JSDoc annotations for better developer experience
                and fewer errors.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                Framework Agnostic
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Works with any Node.js application, regardless of the framework you're using.
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
            code="npm install @voilajsx/appkit" 
            language="bash"
            showCopyButton={true}
          />
        </section>

        {/* Quick Start section */}
        <section id="quick-start" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🏃‍♂️ Quick Start</h2>
          
          <p className="mb-4">
            Import only the functions you need and start using them right away. The Config
            module provides simple functions for loading and accessing configuration from
            various sources.
          </p>
          
          <CodeBlock 
            code={`import { loadConfig, getConfig } from '@voilajsx/appkit/config';

// Load configuration
const config = await loadConfig('./config.json', {
  defaults: { server: { port: 3000 } },
  required: ['database.url'],
});

// Access configuration values
const port = getConfig('server.port'); // 3000
const dbUrl = getConfig('database.url');
console.log(\`Server running on port \${port}\`);`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Config Loading section */}
        <section id="config-loading" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Configuration Loading</h2>
          
          <p className="mb-4">
            These utilities enable you to load configuration from various sources and
            formats. You can combine configuration from files, objects, and environment
            variables into a single, unified configuration store.
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
                    <code>loadConfig()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Loads configuration from source with options
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Application startup, initial configuration loading
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>setConfig()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Sets configuration directly in memory
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Manual configuration updates, testing
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>reloadConfig()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Reloads configuration from previous file
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Configuration refresh, handling file changes
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>clearConfig()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Clears all configuration
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Testing, resetting application state
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Load from JSON file
const config = await loadConfig('./config.json');

// Load with options
const config = await loadConfig('./config.json', {
  defaults: { server: { port: 3000 } },
  required: ['database.url'],
  schema: 'app',
  env: true,
});

// Set configuration programmatically
setConfig({ server: { port: 4000 } });

// Reload configuration from file
await reloadConfig();

// Clear all configuration
clearConfig();`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Config Access section */}
        <section id="config-access" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Configuration Access</h2>
          
          <p className="mb-4">
            These functions let you retrieve configuration values and check for their
            existence. They provide a simple, dot-notation syntax for accessing nested
            properties.
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
                    <code>getConfig()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Retrieves configuration value by path
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Reading configuration values throughout your app
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>hasConfig()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Checks if configuration path exists
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Feature flags, conditional functionality
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>getEnv()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Gets environment variable with fallback
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Accessing environment-specific settings
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Get a specific value
const port = getConfig('server.port');

// Get with default fallback
const timeout = getConfig('api.timeout', 5000);

// Get a nested section
const database = getConfig('database');

// Check if configuration exists
if (hasConfig('features.darkMode')) {
  enableDarkMode();
}

// Get environment variable
const nodeEnv = getEnv('NODE_ENV', 'development');`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Schema Validation section */}
        <section id="schema-validation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Schema Validation</h2>
          
          <p className="mb-4">
            These utilities provide configuration validation against JSON Schema-like
            definitions. They ensure your configuration meets the expected structure and
            types before your application uses it.
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
                    <code>validateConfig()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Validates configuration against schema
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Ensuring configuration correctness
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>defineSchema()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Defines a named schema for later use
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Creating reusable validation schemas
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>getConfigSchema()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Retrieves a previously defined schema
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Reusing schemas across the application
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Define a schema
defineSchema('server', {
  type: 'object',
  required: ['port'],
  properties: {
    port: {
      type: 'number',
      minimum: 1024,
      maximum: 65535,
    },
    host: {
      type: 'string',
      default: 'localhost',
    },
  },
});

// Validate configuration
try {
  validateConfig(config, 'server');
  console.log('Configuration is valid');
} catch (error) {
  console.error('Validation failed:', error.details.errors);
}

// Get a defined schema
const serverSchema = getConfigSchema('server');`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Configuration Options section */}
        <section id="configuration-options" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔧 Configuration Options</h2>
          
          <p className="mb-4">
            The examples above show basic usage, but you have much more control over how the
            configuration system works. Here are the customization options available:
          </p>
          
          <h3 className="text-xl font-semibold mb-3">Loading Options</h3>
          
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
                    <code>defaults</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Default values to merge with config
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>{}</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code></code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>required</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Required configuration paths
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>[]</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>['database.url', 'api.key']</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>validate</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Whether to validate configuration
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>true</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>false</code> to skip validation
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>schema</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Schema to validate against
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>undefined</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'app'</code> or schema object
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>env</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Enable environment variable integration
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>true</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>false</code> to disable env integration
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>watch</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Watch for file changes
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>false</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>true</code> to enable auto-reloading
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>interpolate</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Enable variable interpolation
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>true</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>false</code> to disable interpolation
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Configuration with all options
const config = await loadConfig('./config.json', {
  // Provide default values
  defaults: {
    server: {
      port: 3000,
      host: 'localhost',
    },
    logging: {
      level: 'info',
    },
  },

  // Specify required fields
  required: ['database.url', 'api.key'],

  // Enable validation against schema
  validate: true,
  schema: 'app',

  // Enable environment variable integration
  env: true,

  // Enable file watching (for development)
  watch: process.env.NODE_ENV === 'development',

  // Enable variable interpolation
  interpolate: true,
});`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Use Cases section */}
        <section id="use-cases" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">💡 Common Use Cases</h2>
          
          <p className="mb-4">
            Here's where you can apply the config module's functionality in your applications:
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Category
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Use Case
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Description
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Components Used
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white" rowSpan="3">
                    Application Setup
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Environment Configuration
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Load different config per environment
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>loadConfig()</code>, environment integration
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Feature Flags
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Toggle features without code changes
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>getConfig()</code>, <code>hasConfig()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    App Initialization
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Bootstrap application with correct settings
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>loadConfig()</code> with validation
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white" rowSpan="3">
                    Runtime Management
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Dynamic Configuration
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Update configuration during runtime
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>setConfig()</code>, <code>reloadConfig()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Configuration Overrides
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Allow command-line or runtime overrides
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>setConfig()</code> with existing config
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Auto-reload During Development
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Refresh configuration during development
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>loadConfig()</code> with <code>watch: true</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white" rowSpan="3">
                    Security & Validation
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Secret Management
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Securely access sensitive information
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>getEnv()</code> for environment variables
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Schema Validation
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Ensure configuration meets requirements
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>defineSchema()</code>, <code>validateConfig()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Type Safety
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Prevent type errors in configuration
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Schema validation with type constraints
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Code Generation section */}
        <section id="code-generation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🤖 Code Generation with LLMs</h2>
          
          <p className="mb-6">
            You can use large language models (LLMs) like ChatGPT or Claude to generate code
            for common configuration scenarios using the <code>@voilajsx/appkit/config</code> module.
            We've created a specialized
            <a 
              href="https://github.com/voilajsx/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline mx-1"
            >
              PROMPT_REFERENCE.md
            </a>
            document that's designed specifically for LLMs to understand the module's
            capabilities and generate high-quality configuration code.
          </p>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-xl font-semibold mb-3">Sample Prompt: Basic Configuration Setup</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
              Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md and then implement a configuration system for my Express app that includes:
              <br/>- Loading from different files per environment (dev, staging, prod)
              <br/>- Schema validation for required fields
              <br/>- Environment variable integration
              <br/>- Auto-reload during development
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-xl font-semibold mb-3">Sample Prompt: Advanced Configuration System</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
              Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md and then implement an advanced configuration system using @voilajsx/appkit/config with:
              <br/>- Configuration schema with nested validation
              <br/>- Custom validation rules for specific fields
              <br/>- Configuration inspector middleware for Express
              <br/>- Centralized configuration management class
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3">Sample Prompt: Multi-environment Configuration</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
              Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md and then implement a configuration system for a microservice architecture using @voilajsx/appkit/config with:
              <br/>- Base configuration shared across all services
              <br/>- Service-specific configuration overrides
              <br/>- Environment-specific settings (development, staging, production)
              <br/>- Secrets management via environment variables
              <br/>- Configuration validation for all services
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
              <h3 className="text-lg font-semibold mb-2">Basic Usage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Loading and accessing configuration from different sources.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/config/examples/01-basic-usage.js" 
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
              <h3 className="text-lg font-semibold mb-2">Environment Variables</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Integrating with environment variables for configuration.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/config/examples/02-environment-variables.js" 
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
              <h3 className="text-lg font-semibold mb-2">Schema Validation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Validating configuration with JSON Schema-like validation.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/config/examples/03-schema-validation.js" 
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
              <h3 className="text-lg font-semibold mb-2">Dynamic Config</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Updating configuration at runtime with changes and reloading.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/config/examples/04-dynamic-config.js" 
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
              <h3 className="text-lg font-semibold mb-2">Express App</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Complete example of using configuration in an Express application.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/config/examples/express-app.js" 
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

        {/* Best Practices section */}
        <section id="best-practices" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🛡️ Configuration Best Practices</h2>
          
          <p className="mb-4">
            Following these practices will help ensure your configuration system remains
            secure and maintainable:
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-1">1. Store secrets in environment variables</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Never commit sensitive information like API keys, database credentials, or
                other secrets into your configuration files.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-1">2. Use validation schemas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Define schemas for all critical configuration to catch errors early, preventing
                runtime issues caused by misconfiguration.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-1">3. Implement environment-specific configs</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create separate configuration files for different environments (development,
                testing, staging, production) to manage environment-specific settings.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-1">4. Never commit sensitive configuration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use .gitignore to prevent sensitive configuration files from being committed
                to version control. Provide templates instead.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-1">5. Use namespaced configuration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Organize settings logically by grouping related configuration under namespaces
                (e.g., database, server, logging, etc.).
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-1">6. Document your configuration schema</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Provide clear documentation about required settings, formats, and defaults for
                all configuration options.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-1">7. Implement reasonable defaults</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Provide sensible default values for optional configuration to make your application
                work out of the box with minimal setup.
              </p>
            </div>
          </div>
        </section>

        {/* Performance Considerations section */}
        <section id="performance" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📊 Performance Considerations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-1">Cache frequently accessed values</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Rather than calling <code>getConfig()</code> repeatedly for the same value, store
                frequently accessed configuration values in variables.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-1">Only enable file watching in development</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                File watching should only be enabled in development environments to avoid
                unnecessary file system operations in production.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-1">Use appropriate schema complexity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use appropriate schema complexity based on your validation needs. Overly complex 
                schemas can slow down validation unnecessarily.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-1">Consider configuration load time</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Loading and validating configuration contributes to application startup time. 
                Monitor and optimize this process for faster startup.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-1">Be mindful of deep nesting</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Deep nesting in your configuration structure can make access slower and code
                more complex. Keep nesting to a reasonable level.
              </p>
            </div>
          </div>
        </section>

        {/* Error Handling section */}
        <section id="error-handling" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔍 Error Handling</h2>
          
          <p className="mb-4">
            The config module provides specific error types and codes that you should handle
            appropriately:
          </p>
          
          <CodeBlock 
            code={`try {
  await loadConfig('./config.json', {
    required: ['database.url', 'api.key'],
  });
} catch (error) {
  switch (error.code) {
    case 'FILE_NOT_FOUND':
      console.error('Configuration file not found. Please check the path.');
      break;
    case 'MISSING_REQUIRED_FIELDS':
      console.error('Missing required configuration:', error.details.missing);
      break;
    case 'VALIDATION_ERROR':
      console.error('Configuration validation failed:');
      error.details.errors.forEach((err) => {
        console.error(\`- \${err.path}: \${err.message}\`);
      });
      break;
    case 'JSON_PARSE_ERROR':
      console.error('Invalid JSON in configuration file');
      break;
    default:
      console.error('Configuration error:', error.message);
  }

  // Exit or use fallback configuration
  process.exit(1);
}`}
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 rounded">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Best Practice:</strong> Always implement proper error handling for configuration 
              loading and validation to provide clear feedback about configuration issues and prevent 
              your application from starting with invalid configuration.
            </p>
          </div>
        </section>

        {/* Documentation Links section */}
        <section id="documentation" className="mb-6 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📚 Documentation Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <a 
              href="https://github.com/voilajsx/appkit/blob/main/src/config/docs/DEVELOPER_REFERENCE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📘</span>
                Developer Reference
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Detailed implementation guide with examples and best practices
              </p>
            </a>
            
            <a 
              href="https://github.com/voilajsx/appkit/blob/main/src/config/docs/API_REFERENCE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📗</span>
                API Reference
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Complete API documentation with parameters, returns, and error details
              </p>
            </a>
            
            <a 
              href="https://github.com/voilajsx/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📙</span>
                LLM Code Generation
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Guide for using AI tools to generate configuration code
              </p>
            </a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3">Contributing</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We welcome contributions! Whether you're fixing bugs, improving documentation, or 
              proposing new features, your help is appreciated.
            </p>
            <a 
              href="https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center"
            >
              View Contributing Guide
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              MIT © <a href="https://github.com/voilajsx" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">VoilaJS</a>
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
              Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">VoilaJS Team</a> — powering modern web development.
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
                    onClick={() => scrollToSection('config-loading')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'config-loading' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Configuration Loading
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('config-access')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'config-access' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Configuration Access
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('schema-validation')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'schema-validation' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Schema Validation
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('configuration-options')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'configuration-options' 
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
                    onClick={() => scrollToSection('best-practices')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'best-practices' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Configuration Best Practices
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

export default ConfigOverview;