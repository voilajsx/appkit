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

/**
 * Config Module Documentation
 * A comprehensive, developer-friendly guide to using @voilajsx/appkit's Config module.
 */
function ConfigOverview() {
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
      { name: 'Accessing Configs', id: 'accessing-configs' },
      { name: 'Schema Validation', id: 'schema-validation' },
      { name: 'Common Use Cases', id: 'use-cases' },
      { name: 'Advanced Features', id: 'advanced-features' },
      { name: 'Performance Tips', id: 'performance-tips' },
      { name: 'Best Practices', id: 'best-practices' },
      { name: 'Error Handling', id: 'error-handling' },
      { name: 'Futher Reading', id: 'further-reading' },
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="w-full lg:w-3/4 p-8 lg:pr-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3" aria-hidden="true">🔧</span> Config Module
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Simplify and secure your Node.js application’s configuration management.
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
            The <code>@voilajsx/appkit</code> Config module is your go-to tool for managing settings in Node.js applications. Whether you’re setting up a small API or a complex microservices system, this module makes it easy to load, validate, and access configurations from various sources like JSON files, environment variables, or JavaScript objects. It’s designed to be as intuitive as possible, with a simple configuration system, with flexibility for advanced use cases.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Why use the Config module? It saves you from the headache of juggling settings across development, staging, and production environments. It ensures your configs are valid before your app starts, supports dynamic updates during development, and integrates seamlessly with environment variables for secure secret management.
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Load configs from multiple formats (JSON, YAML, .env).</li>
            <li>Validate settings with JSON schemas to prevent errors.</li>
            <li>Override configs with environment variables for flexibility.</li>
            <li>Enable auto-reload for rapid development.</li>
            <li>Use dot-notation for easy access to nested settings.</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300">
            Ready to dive in?{' '}
            <button
              onClick={() => scrollToSection('installation')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Start with Installation
            </button>
            .
          </p>
        </section>

        {/* Core Concepts */}
        <section id="core-concepts" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Core Concepts</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Before diving into the code, let’s cover the essential ideas behind the Config module. Grasping these will help you manage your app’s settings with ease:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              {
                title: 'Centralized Settings',
                desc: 'The Config module keeps all your app’s settings, like database or API details, in one place. This makes it simple to access and update them without digging through your code.',
              },
              {
                title: 'Environment Flexibility',
                desc: 'Your app may need different settings for development, testing, or production. The module uses environment variables to adapt settings based on where your app is running.',
              },
              {
                title: 'Dynamic Updates',
                desc: 'Need to change a setting while your app is live? The Config module lets you update settings on the fly, offering flexibility for real-time adjustments.',
              },
              {
                title: 'Safe Defaults',
                desc: 'Missing a setting? The module provides default values to keep your app running smoothly, preventing crashes due to undefined configurations.',
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
            These concepts make configuration management straightforward and reliable. In the next sections, we’ll show you how to apply them with practical examples.
          </p>
        </section>
        {/* Installation */}
        <section id="installation" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Installation</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Setting up the Config module is straightforward. You’ll need Node.js 14 or higher and a package manager like npm, yarn, or pnpm. Follow these steps to get started.
          </p>
          <div className="">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Step 1: Install the Package</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Run the following command in your project directory:
            </p>
            <CodeBlock
              code="npm install @voilajsx/appkit"
              language="bash"
              showCopyButton={true}
            />
          </div>
          <div className="">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Step 2: Import the Module</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Import the Config module in your JavaScript or TypeScript file:
            </p>
            <CodeBlock
              code="import { loadConfig, getConfig } from '@voilajsx/appkit/config';"
              language="javascript"
              showCopyButton={true}
            />
           <p className="text-gray-700 dark:text-gray-300 mt-2">
  For CommonJS, use:{' '}
  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm">
    const &#123; loadConfig, getConfig &#125; = require('@voilajsx/appkit/config');
  </code>
</p>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Step 3: Prepare Your Config</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Create a configuration file (e.g., <code>config.json</code>) or use environment variables to store your settings. We’ll cover this in the next section.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            That’s all you need to start! Let’s move on to using the module.
          </p>
        </section>

        {/* Basic Usage */}
        <section id="basic-usage" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Basic Usage</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Let’s walk through a simple example to load a configuration file and access its values. This is perfect for getting started and understanding the core features of the Config module.
          </p>
          <div className="">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Step 1: Create a Config File</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Create a file named <code>config.json</code> in your project root:
            </p>
            <CodeBlock
              code={`
{
  "server": {
    "host": "localhost",
    "port": 3000
  },
  "database": {
    "url": "mysql://user:pass@localhost/db",
    "pool": 10
  }
}
              `}
              language="json"
              showCopyButton={true}
            />
          </div>
          <div className="">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Step 2: Load the Config</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Load the config file and set defaults or required fields:
            </p>
            <CodeBlock
              code={`
import { loadConfig, getConfig } from '@voilajsx/appkit/config';

// Load the configuration
await loadConfig('./config.json', {
  defaults: {
    server: { port: 8080, host: '0.0.0.0' }
  },
  required: ['database.url']
});

// Access values
const port = getConfig('server.port'); // 3000
const dbUrl = getConfig('database.url');
console.log(\`Server running on \${port}, DB: \${dbUrl}\`);
              `}
              language="javascript"
              showCopyButton={true}
            />
          </div>
          <div className="">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">What’s Happening?</h3>
            <p className="text-gray-700 dark:text-gray-300">
              The <code>loadConfig</code> function reads <code>config.json</code>, merges it with defaults, and checks for required fields. If <code>database.url</code> is missing, it throws an error. The <code>getConfig</code> function retrieves values using dot-notation, making it easy to access nested settings.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            This is the foundation of the Config module. Next, we’ll explore how to customize its behavior.
          </p>
        </section>

        {/* Configuration Options */}
        <section id="configuration-options" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Configuration Options</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The Config module is highly customizable. You can load configs from multiple sources, override settings with environment variables, and enable features like auto-reload. Here’s a detailed look at the options available for <code>loadConfig</code>.
          </p>
          <div className="">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Available Options</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Option</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Default</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>defaults</code></td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Fallback values for missing settings</td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>{JSON.stringify({  }, null, 2)}</code></td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>{JSON.stringify({ server: { port: 8080, host: '0.0.0.0' } }, null, 2)}</code></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>required</code></td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Settings that must exist</td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>[]</code></td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>['database.url']</code></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>env</code></td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Enable environment variable overrides</td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>true</code></td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>false</code></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>watch</code></td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Reload configs on file changes</td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>false</code></td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>true</code></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>interpolate</code></td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Enable variable interpolation</td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>true</code></td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>false</code></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"><code>schema</code></td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Schema for validation</td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>undefined</code></td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300"><code>'app'</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Example: Custom Configuration</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Load a config with all options:
            </p>
            <CodeBlock
              code={`
import { loadConfig } from '@voilajsx/appkit/config';

await loadConfig('./config.json', {
  defaults: {
    server: { port: 3000, host: 'localhost' },
    logging: { level: 'info' }
  },
  required: ['database.url', 'api.key'],
  env: true,
  watch: process.env.NODE_ENV === 'development',
  interpolate: true,
  schema: 'app'
});
              `}
              language="javascript"
              showCopyButton={true}
            />
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            These options let you tailor the Config module to your needs, from simple apps to complex systems.
          </p>
        </section>

        {/* Accessing Configs */}
        <section id="accessing-configs" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Accessing Configs</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Once your configs are loaded, accessing them is a breeze with dot-notation. The module provides several functions to retrieve settings, check their existence, or fetch environment variables directly.
          </p>
          <div className="">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Key Functions</h3>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li><code>getConfig(path, default)</code>: Get a config value, with an optional fallback.</li>
              <li><code>hasConfig(path)</code>: Check if a config path exists.</li>
              <li><code>getEnv(name, default)</code>: Get an environment variable, with a fallback.</li>
            </ul>
          </div>
          <div className="">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Example: Accessing Settings</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Here’s how to use these functions:
            </p>
            <CodeBlock
              code={`
import { getConfig, hasConfig, getEnv } from '@voilajsx/appkit/config';

// Get a single value
const port = getConfig('server.port', 3000); // 3000 or fallback

// Get a nested object
const db = getConfig('database'); // { url: '...', pool: 10 }

// Check for a setting (great for feature flags)
if (hasConfig('features.darkMode') && getConfig('features.darkMode')) {
  enableDarkMode();
}

// Get an environment variable
const nodeEnv = getEnv('NODE_ENV', 'development');
              `}
              language="javascript"
              showCopyButton={true}
            />
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Dot-notation simplifies accessing nested settings, and fallbacks ensure your app doesn’t crash if a value is missing. Use <code>hasConfig</code> for conditional logic, like enabling optional features.
          </p>
        </section>

        {/* Schema Validation */}
        <section id="schema-validation" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Schema Validation</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Schema validation ensures your configs are correct before your app runs. This prevents runtime errors from missing or invalid settings, like a missing database URL or an invalid port number. 
          </p>
          <div className="">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How It Works</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Define a schema using <code>defineSchema</code>, then pass it to <code>loadConfig</code>. The module checks your config against the schema and throws an error if it doesn’t match.
            </p>
            <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300">
              <li>Define a schema with types, required fields, and constraints.</li>
              <li>Load your config with the schema.</li>
              <li>Handle validation errors if needed.</li>
            </ol>
          </div>
          <div className="">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Example: Validating a Config</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Here’s a schema for a server and database config:
            </p>
            <CodeBlock
              code={`
import { defineSchema, loadConfig } from '@voilajsx/appkit/config';

// Define the schema
defineSchema('app', {
  type: 'object',
  required: ['server.port', 'database.url'],
  properties: {
    server: {
      type: 'object',
      properties: {
        port: { type: 'number', minimum: 1024, maximum: 65535 },
        host: { type: 'string', default: 'localhost' }
      }
    },
    database: {
      type: 'object',
      properties: {
        url: { type: 'string', format: 'uri' },
        pool: { type: 'number', minimum: 1, maximum: 100 }
      }
    }
  }
});

// Load with validation
try {
  await loadConfig('./config.json', { schema: 'app' });
  console.log('Config is valid!');
} catch (error) {
  console.error('Validation failed:', error.details.errors);
}
              `}
              language="javascript"
              showCopyButton={true}
            />
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Validation ensures your app starts with correct settings. Use it for critical configs like database connections or API endpoints.
          </p>
        </section>

        {/* Common Use Cases */}
        <section id="use-cases" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Common Use Cases</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The Config module shines in real-world scenarios. Here are detailed examples to help you apply it effectively.
          </p>
          <div className="space-y-6">
            <div className="">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Multi-Environment Configurations</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Manage different settings for development, staging, and production environments, ensuring you have env-specific configs.
              </p>
              <CodeBlock
                code={`
import { loadConfig } from '@voilajsx/appkit/config';

const env = process.env.NODE_ENV || 'development';
await loadConfig([
  './config/base.json', // Shared settings
  \`./config/\${env}.json\` // Environment-specific overrides
], {
  defaults: { server: { port: 3000 } },
  required: ['database.url'],
  env: true
});
                `}
                language="javascript"
                showCopyButton={true}
              />
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                This loads a base config and overlays environment-specific settings, ensuring flexibility across environments.
              </p>
            </div>
            <div className="">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Feature Flags</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Toggle features dynamically without code changes, like feature flags.
              </p>
              <CodeBlock
                code={`
import { getConfig, hasConfig } from '@voilajsx/appkit/config';

// config.json: { "features": { "darkMode": true, "beta": false } }
if (hasConfig('features.darkMode') && getConfig('features.darkMode')) {
  enableDarkMode();
}

if (hasConfig('features.beta') && getConfig('features.beta')) {
  enableBetaFeatures();
}
                `}
                language="javascript"
                showCopyButton={true}
              />
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                Use feature flags to roll out new features gradually or test them in specific environments.
              </p>
            </div>
            <div className="">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Secret Management</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Securely handle sensitive data like API keys using environment variables.
              </p>
              <CodeBlock
                code={`
import { loadConfig, getEnv } from '@voilajsx/appkit/config';

// .env: API_KEY=your-secret-key
await loadConfig('./config.json', {
  env: true, // Maps API_KEY to api.key
  required: ['api.key']
});

const apiKey = getEnv('API_KEY', 'default-key');
                `}
                language="javascript"
                showCopyButton={true}
              />
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                Keep secrets out of version control by using <code>.env</code> files, and validate their presence.
              </p>
            </div>
            <div className="">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">TypeScript Integration</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Use TypeScript for type-safe config access, enhancing developer experience.
              </p>
              <CodeBlock
                code={`
import { loadConfig, getConfig } from '@voilajsx/appkit/config';

interface AppConfig {
  server: { port: number; host: string };
  database: { url: string; pool: number };
}

await loadConfig<AppConfig>('./config.json');

const port = getConfig('server.port'); // Type: number
const db = getConfig('database'); // Type: { url: string; pool: number }
              `}
                language="typescript"
                showCopyButton={true}
              />
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                TypeScript ensures your config matches the expected structure, reducing errors and improving IDE support.
              </p>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section id="advanced-features" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Advanced Features</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            For advanced users, the Config module offers powerful features to handle complex scenarios.
          </p>
          <div className="space-y-6">
            <div className="">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Variable Interpolation</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Reference values within your config.
              </p>
              <CodeBlock
                code={`
{
  "baseUrl": "https://api.example.com",
  "endpoint": "\${baseUrl}/v1/users",
  "timeout": 5000,
  "retryUrl": "\${endpoint}?retry=\${timeout}"
}
              `}
                language="json"
                showCopyButton={true}
              />
              <CodeBlock
                code={`
import { loadConfig, getConfig } from '@voilajsx/appkit/config';

await loadConfig('./config.json', { interpolate: true });
const endpoint = getConfig('endpoint'); // https://api.example.com/v1/users
                `}
                language="javascript"
                showCopyButton={true}
              />
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                Interpolation simplifies dynamic configs, but disable it (<code>interpolate: false</code>) if you don’t need it to improve performance.
              </p>
            </div>
            <div className="">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Dynamic Config Updates</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Update configs at runtime without restarting your app.
              </p>
              <CodeBlock
                code={`
import { setConfig, reloadConfig } from '@voilajsx/appkit/config';

// Update a single value
setConfig('logging.level', 'debug');

// Reload from file
await reloadConfig('./config.json');
                `}
                language="javascript"
                showCopyButton={true}
              />
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                Use <code>setConfig</code> for temporary changes and <code>reloadConfig</code> to refresh from the source. Be cautious with runtime updates in production.
              </p>
            </div>
            <div className="">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Code Generation with LLMs</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Use AI tools like Grok to generate Config module code. Refer to the{' '}
                <a
                  href="https://github.com/voilajsx/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  PROMPT_REFERENCE.md
                </a>.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Example prompt: “Generate a Node.js config system using @voilajsx/appkit with environment-specific settings and schema validation.”
              </p>
            </div>
          </div>
        </section>

        {/* Performance Tips */}
        <section id="performance-tips" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Performance Tips</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Optimize your use of the Config module to keep your app running smoothly, especially in high-performance environments.
          </p>
          <div className="">
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li><strong>Cache Values:</strong> Store frequently accessed configs in variables to avoid repeated <code>getConfig</code> calls.</li>
              <li><strong>Disable Watching in Production:</strong> Set <code>watch: false</code> to avoid file system overhead.</li>
              <li><strong>Simplify Schemas:</strong> Use minimal validation rules for non-critical settings to speed up loading.</li>
              <li><strong>Profile Load Time:</strong> Measure config loading during startup to identify bottlenecks.</li>
            </ul>
            <CodeBlock
              code={`
import { getConfig } from '@voilajsx/appkit/config';

// Cache a value
const port = getConfig('server.port', 3000);
// Use port directly instead of calling getConfig repeatedly
              `}
              language="javascript"
              showCopyButton={true}
            />
          </div>
        </section>

        {/* Best Practices */}
        <section id="best-practices" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Best Practices</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Follow these guidelines to keep your configuration system secure, maintainable, and efficient.
          </p>
          <div className="">
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li><strong>Use Environment Variables for Secrets:</strong> Store API keys and database credentials in <code>.env</code> files.</li>
              <li><strong>Validate Critical Settings:</strong> Use schemas to ensure required fields are present and correct.</li>
              <li><strong>Separate Environments:</strong> Maintain separate config files for each environment to prevent mix-ups.</li>
              <li><strong>Keep Configs Shallow:</strong> Limit nesting to 2-3 levels for easier access and maintenance.</li>
              <li><strong>Document Settings:</strong> Include comments or a README explaining each config option.</li>
              <li><strong>Test Config Loading:</strong> Verify configs load correctly in all environments during CI/CD.</li>
            </ul>
          </div>
        </section>

        {/* Error Handling */}
        <section id="error-handling" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Error Handling</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Encountering issues? Here are solutions to common problems, with detailed steps to resolve them.
          </p>
          <div className="space-y-6">
            <div className="">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Config File Not Found</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                If <code>loadConfig</code> can’t find your config file, check the path and handle the error:
              </p>
              <CodeBlock
                code={`
import { loadConfig } from '@voilajsx/appkit/config';

try {
  await loadConfig('./config.json');
} catch (error) {
  if (error.code === 'FILE_NOT_FOUND') {
    console.error('Config file not found:', error.message);
    // Fallback to defaults or exit
  }
}
              `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div className="">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Validation Errors</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                If validation fails, inspect the error details:
              </p>
              <CodeBlock
                code={`
import { loadConfig } from '@voilajsx/appkit/config';

try {
  await loadConfig('./config.json', { schema: 'app' });
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('Invalid config:', error.details.errors);
  }
}
              `}
              language="javascript"
              showCopyButton={true}
            />
            </div>
            <div className="">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Missing Required Fields</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Ensure all required fields are present:
              </p>
              <CodeBlock
                code={`
import { loadConfig } from '@voilajsx/appkit/config';

try {
  await loadConfig('./config.json', { required: ['database.url'] });
} catch (error) {
  if (error.code === 'MISSING_REQUIRED_FIELDS') {
    console.error('Missing fields:', error.details.missing);
  }
}
              `}
              language="javascript"
              showCopyButton={true}
            />
          </div>
          </div>
        </section>

        

        {/* Further Reading */}
        <section id="further-reading" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Further Reading</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Want to learn more? Check out these resources for deeper insights:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Developer Reference',
                desc: 'Detailed guide with advanced configurations and examples',
                url: 'https://github.com/voilajsx/appkit/blob/main/src/config/docs/DEVELOPER_REFERENCE.md',
              },
              {
                title: 'API Reference',
                desc: 'Complete documentation of all Auth module functions and options',
                url: 'https://github.com/voilajsx/appkit/blob/main/src/config/docs/API_REFERENCE.md',
              },
              
            ].map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{link.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{link.desc}</p>
              </a>
            ))}
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
  );
}

export default ConfigOverview;