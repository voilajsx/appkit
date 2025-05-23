import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '@/components/ui/CodeBlock';
import { useLocation } from 'react-router-dom';
import Mermaid from 'react-mermaid2';

/**
 * Cache Module Overview page for @voilajs/appkit documentation
 * Provides detailed information about the Cache module with enhanced UX and accessibility
 */
function CacheOverview() {
  const [activeSection, setActiveSection] = useState('introduction');
  const location = useLocation();

  // Define sections with display names and corresponding IDs
  const sections = [
    { name: 'Introduction', id: 'introduction' },
    { name: 'Module Overview', id: 'module-overview' },
    { name: 'Features', id: 'features' },
    { name: 'Installation', id: 'installation' },
    { name: 'Quick Start', id: 'quick-start' },
    { name: 'Cache Creation', id: 'cache-creation' },
    { name: 'Basic Operations', id: 'basic-operations' },
    { name: 'Batch Operations', id: 'batch-operations' },
    { name: 'Advanced Features', id: 'advanced-features' },
    { name: 'Configuration Options', id: 'configuration' },
    { name: 'Common Use Cases', id: 'use-cases' },
    { name: 'Code Generation', id: 'code-generation' },
    { name: 'Example Code', id: 'example-code' },
    { name: 'Caching Best Practices', id: 'caching-practices' },
    { name: 'Performance Considerations', id: 'performance' },
    { name: 'Error Handling', id: 'error-handling' },
    { name: 'Documentation Links', id: 'documentation' },
  ];

  // Debounced scroll handler for performance
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Update active section based on scroll position
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
    []
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Handle hash-based navigation on page load
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      scrollToSection(sectionId);
    }
  }, [location.hash]);

  // Scroll to section with smooth behavior
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Main content area */}
      <div className="w-full lg:w-3/4 p-6 lg:pr-16">
        {/* Page header */}
        <header className="flex items-center mb-6">
          <span className="text-4xl mr-4" aria-hidden="true">🚀</span>
          <h1 className="text-4xl font-bold">Cache Module</h1>
        </header>

        <div className="flex space-x-2 mb-8">
          <a
            href="https://www.npmjs.com/package/@voilajs/appkit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View @voilajs/appkit on npm"
          >
            <img src="https://img.shields.io/npm/v/@voilajs/appkit.svg" alt="npm version" />
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

        {/* Introduction section */}
        <section id="introduction" className="mb-12 scroll-mt-20">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded mb-6">
            <p className="text-blue-800 dark:text-blue-200 text-lg font-medium">
              A unified caching interface to boost application performance
            </p>
          </div>
          <p className="mb-4">
            The Cache module of <code>@voilajs/appkit</code> provides a flexible and powerful caching solution for Node.js applications. It supports in-memory, Redis, and Memcached backends with a consistent API for storing, retrieving, and managing cached data, complete with automatic serialization and TTL management.
          </p>
          <p className="mb-4">
            <a
              href="#quick-start"
              onClick={() => scrollToSection('quick-start')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Jump to Quick Start
            </a>{' '}
            or explore the{' '}
            <a
              href="#features"
              onClick={() => scrollToSection('features')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              key features
            </a>{' '}
            below.
          </p>
        </section>

        {/* Module Overview section */}
        <section id="module-overview" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Module Overview</h2>
          <p className="mb-6">
            The Cache module offers a unified interface for caching in Node.js applications, supporting multiple backends like in-memory, Redis, and Memcached. It’s designed for performance and ease of use, making it ideal for APIs, web apps, and microservices.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Feature
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Description
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Main Functions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Cache Creation</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Initialize caches with different backends</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>createCache()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Basic Operations</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Store and retrieve cached values</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>get()</code>, <code>set()</code>, <code>has()</code>, <code>delete()</code>, <code>clear()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Batch Operations</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Manage multiple cache entries efficiently</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>getMany()</code>, <code>setMany()</code>, <code>deleteMany()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Smart Patterns</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Implement common caching patterns</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>getOrSet()</code>, <code>namespace()</code>, <code>deletePattern()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">TTL Management</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Control cache expiration</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>expire()</code>, <code>ttl()</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Caching Flow</h3>
            <Mermaid
              chart={`
                sequenceDiagram
                  participant Client
                  participant App
                  participant Cache
                  participant DB
                  Client->>App: Request data
                  App->>Cache: Check cache (get)
                  alt Cache Hit
                    Cache-->>App: Return cached data
                    App-->>Client: Send data
                  else Cache Miss
                    Cache-->>App: Null
                    App->>DB: Query database
                    DB-->>App: Return data
                    App->>Cache: Store data (set)
                    App-->>Client: Send data
                  end
              `}
            />
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🚀 Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              {
                emoji: '💾',
                title: 'Multiple Backend Support',
                desc: 'Supports in-memory, Redis, and Memcached backends with a consistent API.',
              },
              {
                emoji: '⏱️',
                title: 'TTL Management',
                desc: 'Automatic expiration of cached items with flexible TTL settings.',
              },
              {
                emoji: '🗂️',
                title: 'Namespaces',
                desc: 'Organize cache keys with logical grouping for better management.',
              },
              {
                emoji: '🔄',
                title: 'Batch Operations',
                desc: 'Efficiently manage multiple cache entries with bulk operations.',
              },
              {
                emoji: '🧠',
                title: 'Smart Patterns',
                desc: 'Built-in cache-aside pattern with getOrSet for simplified caching.',
              },
              {
                emoji: '🔍',
                title: 'Pattern Matching',
                desc: 'Find and delete keys using glob patterns for advanced cache management.',
              },
              {
                emoji: '🧩',
                title: 'Consistent API',
                desc: 'Unified interface across all backends for seamless integration.',
              },
              {
                emoji: '🔌',
                title: 'Framework Agnostic',
                desc: 'Works with any Node.js framework, including Express, Fastify, and Koa.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="text-xl font-semibold mb-2 flex items-center">
                  <span className="text-2xl mr-2" aria-hidden="true">{feature.emoji}</span>
                  {feature.title}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Installation section */}
        <section id="installation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📦 Installation</h2>
          <p className="mb-4">Install the package using your preferred package manager:</p>
          <CodeBlock
            code={`
npm install @voilajs/appkit

# Optional: Install backend-specific dependencies
npm install redis       # For Redis support
npm install memcached   # For Memcached support
            `}
            language="bash"
            showCopyButton={true}
          />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Requires Node.js 14+ and supports both CommonJS and ES Modules.
          </p>
          <p className="mt-2">
            See the{' '}
            <a
              href="https://github.com/voilajs/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for advanced setup options.
          </p>
        </section>

        {/* Quick Start section */}
        <section id="quick-start" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🏃‍♂️ Quick Start</h2>
          <p className="mb-4">
            Get started with caching in just a few lines. The Cache module works the same way whether you use in-memory, Redis, or Memcached, so you can switch backends without changing your code.
          </p>
          <CodeBlock
            code={`
import { createCache } from '@voilajs/appkit/cache';

// Set up a memory cache
const cache = await createCache({ strategy: 'memory' });

// Save a user with a 1-hour expiration
await cache.set('user:1', { name: 'Alice', role: 'admin' }, 3600);

// Get the user
const user = await cache.get('user:1');
console.log(user.name); // Alice
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="mt-4">
            Want to cache database queries? Try the cache-aside pattern:
          </p>
          <CodeBlock
            code={`
const user = await cache.getOrSet('user:1', async () => {
  return await db.findUser(1); // Only runs if cache is empty
}, 3600);
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="mt-4">
            Check out{' '}
            <a
              href="#basic-operations"
              onClick={() => scrollToSection('basic-operations')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Basic Operations
            </a>{' '}
            for more examples or the{' '}
            <a
              href="https://github.com/voilajs/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for details.
          </p>
        </section>

        {/* Cache Creation section */}
        <section id="cache-creation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔨 Cache Creation</h2>
          <p className="mb-4">
            Set up your cache with the backend that fits your app. Use in-memory for quick development, Redis for production, or Memcached for simple, high-speed caching.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Memory Cache</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Great for testing or small apps. Stores data in your Node.js process.
              </p>
              <CodeBlock
                code={`
const cache = await createCache({
  strategy: 'memory',
  maxItems: 1000, // Limit to 1000 items
});
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Redis Cache</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Perfect for production. Shares cache across servers.
              </p>
              <CodeBlock
                code={`
const cache = await createCache({
  strategy: 'redis',
  url: 'redis://localhost:6379',
});
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Namespaced Cache</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Group related keys with a prefix to keep things organized.
              </p>
              <CodeBlock
                code={`
const userCache = cache.namespace('user');
await userCache.set('1', { name: 'Alice' }); // Saves as 'user:1'
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
          </div>
          <p className="mt-4">
            See{' '}
            <a
              href="#configuration"
              onClick={() => scrollToSection('configuration')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Configuration Options
            </a>{' '}
            for more setup details.
          </p>
        </section>

        {/* Basic Operations section */}
        <section id="basic-operations" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔄 Basic Operations</h2>
          <p className="mb-4">
            Use these simple methods to store, fetch, and remove cached data. They work the same across all backends.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Save and Fetch Data</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Store data with <code>set</code> and retrieve it with <code>get</code>.
              </p>
              <CodeBlock
                code={`
await cache.set('post:1', { title: 'My Post', views: 100 }, 3600);
const post = await cache.get('post:1');
console.log(post.title); // My Post
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Check If Data Exists</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Use <code>has</code> to see if a key is in the cache.
              </p>
              <CodeBlock
                code={`
const exists = await cache.has('post:1');
console.log(exists); // true or false
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Remove Data</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Delete a single key with <code>delete</code> or clear everything with <code>clear</code>.
              </p>
              <CodeBlock
                code={`
await cache.delete('post:1'); // Remove one post
await cache.clear(); // Remove all data
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
          </div>
          <p className="mt-4">
            Need to cache multiple items at once? Check out{' '}
            <a
              href="#batch-operations"
              onClick={() => scrollToSection('batch-operations')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Batch Operations
            </a>.
          </p>
        </section>

        {/* Batch Operations section */}
        <section id="batch-operations" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📚 Batch Operations</h2>
          <p className="mb-4">
            Work with multiple cache entries at once to save time and reduce network calls.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Fetch Multiple Items</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Get several values in one go with <code>getMany</code>.
              </p>
              <CodeBlock
                code={`
const posts = await cache.getMany(['post:1', 'post:2']);
console.log(posts); // [{ title: 'Post 1' }, { title: 'Post 2' }]
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Save Multiple Items</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Store multiple values with <code>setMany</code>.
              </p>
              <CodeBlock
                code={`
await cache.setMany({
  'post:1': { title: 'Post 1', views: 100 },
  'post:2': { title: 'Post 2', views: 50 }
}, 3600);
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Delete Multiple Items</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Remove several keys at once with <code>deleteMany</code>.
              </p>
              <CodeBlock
                code={`
await cache.deleteMany(['post:1', 'post:2']);
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
          </div>
          <p className="mt-4">
            For more advanced caching, see{' '}
            <a
              href="#advanced-features"
              onClick={() => scrollToSection('advanced-features')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Advanced Features
            </a>.
          </p>
        </section>

        {/* Advanced Features section */}
        <section id="advanced-features" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🧠 Advanced Features</h2>
          <p className="mb-4">
            Use these tools for smarter caching, like automatic data fetching or clearing groups of keys.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Cache-Aside Pattern</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                <code>getOrSet</code> fetches data or loads it if missing, perfect for database queries.
              </p>
              <CodeBlock
                code={`
const post = await cache.getOrSet('post:1', async () => {
  return await db.findPost(1);
}, 3600);
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Clear Keys by Pattern</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Remove related keys with <code>deletePattern</code> using wildcards.
              </p>
              <CodeBlock
                code={`
await cache.deletePattern('post:1:*'); // Clears all keys like post:1:comments
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Manage Expiration</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Check or update how long a key lives with <code>ttl</code> and <code>expire</code>.
              </p>
              <CodeBlock
                code={`
const timeLeft = await cache.ttl('post:1'); // Seconds remaining
await cache.expire('post:1', 7200); // Extend to 2 hours
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
          </div>
          <p className="mt-4">
            See the{' '}
            <a
              href="https://github.com/voilajs/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for more advanced options.
          </p>
        </section>

        {/* Configuration Options section */}
        <section id="configuration" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔧 Configuration Options</h2>
          <p className="mb-4">
            Tweak your cache setup to match your app’s needs, like setting expiration times or adding key prefixes.
          </p>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Setup</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Choose a backend and add a prefix to keep keys organized.
              </p>
              <CodeBlock
                code={`
const cache = await createCache({
  strategy: 'redis',
  keyPrefix: 'app:', // All keys start with 'app:'
  defaultTTL: 3600 // Default 1-hour expiration
});
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Memory Cache Limits</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Control how much data the memory cache holds.
              </p>
              <CodeBlock
                code={`
const cache = await createCache({
  strategy: 'memory',
  maxItems: 500, // Max 500 items
  maxSize: 52428800 // 50MB limit
});
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Redis Connection</h3>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                Connect to Redis with a URL and custom settings.
              </p>
              <CodeBlock
                code={`
const cache = await createCache({
  strategy: 'redis',
  url: 'redis://localhost:6379',
  options: { connectTimeout: 5000 }
});
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
          </div>
          <p className="mt-4">
            Check the{' '}
            <a
              href="https://github.com/voilajs/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for all configuration options.
          </p>
        </section>

        {/* Common Use Cases section */}
        <section id="use-cases" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">💡 Common Use Cases</h2>
          <p className="mb-4">
            The Cache module supports a variety of caching scenarios to improve performance and scalability.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Category
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Use Case
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Description
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Components Used
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  {
                    category: 'Database Layer',
                    useCase: 'Query Results',
                    desc: 'Cache expensive database query results',
                    components: '<code>getOrSet()</code>, TTL management',
                  },
                  {
                    category: 'Database Layer',
                    useCase: 'Object Hydration',
                    desc: 'Cache fully hydrated objects from database',
                    components: '<code>set()</code>, <code>get()</code>, namespaces',
                  },
                  {
                    category: 'API Integrations',
                    useCase: 'External API Responses',
                    desc: 'Cache responses from third-party APIs',
                    components: '<code>getOrSet()</code> with appropriate TTL',
                  },
                  {
                    category: 'API Integrations',
                    useCase: 'Rate Limit Tracking',
                    desc: 'Track API usage limits and quotas',
                    components: '<code>set()</code> with TTL, <code>expire()</code>',
                  },
                  {
                    category: 'Web Applications',
                    useCase: 'HTTP Response Caching',
                    desc: 'Cache rendered pages or API responses',
                    components: '<code>set()</code> with varying TTLs',
                  },
                  {
                    category: 'Web Applications',
                    useCase: 'Session Storage',
                    desc: 'Store user session data',
                    components: 'Namespaces, <code>expire()</code>',
                  },
                  {
                    category: 'Application Logic',
                    useCase: 'Computed Values',
                    desc: 'Cache results of expensive calculations',
                    components: '<code>getOrSet()</code> with appropriate TTL',
                  },
                  {
                    category: 'Application Logic',
                    useCase: 'Feature Flags',
                    desc: 'Store and share feature flag settings',
                    components: '<code>get()</code> with defaults, short TTL',
                  },
                ].map((row, index) => (
                  <tr key={index}>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">{row.category}</td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">{row.useCase}</td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">{row.desc}</td>
                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: row.components }} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4">
            See the{' '}
            <a
              href="https://github.com/voilajs/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for more use cases.
          </p>
        </section>

        {/* Code Generation section */}
        <section id="code-generation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🤖 Code Generation with LLMs</h2>
          <p className="mb-6">
            Use AI tools like ChatGPT or Claude to generate caching code with the{' '}
            <a
              href="https://github.com/voilajs/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              PROMPT_REFERENCE.md
            </a>{' '}
            guide. These prompts help you quickly build optimized caching solutions.
          </p>
          {[
            {
              title: 'Basic Database Caching',
              prompt: `
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md and then create a caching layer for database queries using @voilajs/appkit/cache with the following features:
- Redis cache configuration for production
- Memory cache fallback for development
- Cache-aside pattern for common queries
- Automatic cache invalidation on data updates
- Type-safe functions for TypeScript projects
              `,
            },
            {
              title: 'API Response Caching',
              prompt: `
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md and then implement an Express middleware for caching API responses using @voilajs/appkit/cache that includes:
- Configurable TTL based on route
- Cache bypass for authenticated requests
- Vary cache by query parameters
- Cache status in response headers
- Batch invalidation for related resources
              `,
            },
            {
              title: 'Advanced Caching Patterns',
              prompt: `
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md and then implement advanced caching patterns using @voilajs/appkit/cache with:
- Write-through and write-behind caching
- Two-level caching (memory + Redis)
- Circuit breaker for cache backend failures
- Stampede protection for high-traffic keys
- Cache warming for predictable access patterns
              `,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6"
            >
              <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
                {item.prompt.trim().split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(item.prompt.trim())}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center mt-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy to clipboard
              </button>
            </div>
          ))}
          <p className="mt-4">
            See the{' '}
            <a
              href="https://github.com/voilajs/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for more LLM prompt examples.
          </p>
        </section>

        {/* Example Code section */}
        <section id="example-code" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📋 Example Code</h2>
          <p className="mb-6">
            Explore practical examples to see how the Cache module works in real applications:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              {
                title: 'Cache Basics',
                desc: 'Basic cache operations and configuration.',
                url: 'https://github.com/voilajs/appkit/blob/main/src/cache/examples/01-cache-basics.js',
              },
              {
                title: 'Redis Cache',
                desc: 'Working with Redis as a cache backend.',
                url: 'https://github.com/voilajs/appkit/blob/main/src/cache/examples/02-redis-cache.js',
              },
              {
                title: 'Cache Patterns',
                desc: 'Common caching patterns and techniques.',
                url: 'https://github.com/voilajs/appkit/blob/main/src/cache/examples/03-cache-patterns.js',
              },
              {
                title: 'API Caching',
                desc: 'Caching API responses for improved performance.',
                url: 'https://github.com/voilajs/appkit/blob/main/src/cache/examples/04-api-caching.js',
              },
              {
                title: 'Rate Limiting',
                desc: 'Using caching for API rate limiting.',
                url: 'https://github.com/voilajs/appkit/blob/main/src/cache/examples/05-rate-limiting.js',
              },
            ].map((example, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{example.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{example.desc}</p>
                <a
                  href={example.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
                >
                  View example
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Caching Best Practices section */}
        <section id="caching-practices" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🛡️ Caching Best Practices</h2>
          <p className="mb-4">
            Follow these practices to ensure your caching system is effective and efficient:
          </p>
          <ul className="space-y-4 mb-6 list-disc pl-0">
            {[
              {
                title: 'Choose the Right TTL',
                desc: 'Set expiration times based on data volatility and freshness requirements.',
              },
              {
                title: 'Design Good Cache Keys',
                desc: 'Use consistent, hierarchical naming patterns (e.g., user:123:profile).',
              },
              {
                title: 'Implement Proper Invalidation',
                desc: 'Update or delete cached data when the source changes.',
              },
              {
                title: 'Handle Cache Misses Gracefully',
                desc: 'Always have a fallback when data isn’t in cache.',
              },
              {
                title: 'Monitor Cache Performance',
                desc: 'Track hit rates, miss rates, and memory usage.',
              },
              {
                title: 'Use Namespaces',
                desc: 'Organize related cache keys to simplify management and invalidation.',
              },
              {
                title: 'Set Cache Size Limits',
                desc: 'Configure appropriate limits to prevent memory issues.',
              },
            ].map((practice, index) => (
              <li key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border list-none border-gray-200 dark:border-gray-700">
                <span className="font-semibold">{practice.title}:</span> {practice.desc}
              </li>
            ))}
          </ul>
          <p className="mt-4">
            See the{' '}
            <a
              href="https://github.com/voilajs/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for advanced caching guidelines.
          </p>
        </section>

        {/* Performance Considerations section */}
        <section id="performance" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📊 Performance Considerations</h2>
          <p className="mb-4">
            Optimize your caching system with these performance tips:
          </p>
          <ul className="space-y-4 mb-6 list-disc pl-0">
            {[
              {
                title: 'Use Batch Operations',
                desc: 'Leverage getMany and setMany to reduce network round-trips.',
              },
              {
                title: 'Choose Appropriate Serialization',
                desc: 'Optimize for complex objects or binary data.',
              },
              {
                title: 'Implement Two-Level Caching',
                desc: 'Combine memory and distributed caches for frequently accessed data.',
              },
              {
                title: 'Limit Large Values',
                desc: 'Avoid storing oversized values in distributed caches.',
              },
              {
                title: 'Consider Compression',
                desc: 'Compress large textual or JSON data to save space.',
              },
            ].map((item, index) => (
              <li key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border list-none border-gray-200 dark:border-gray-700">
                <span className="font-semibold">{item.title}:</span> {item.desc}
              </li>
            ))}
          </ul>
          <p className="mt-4">
            See the{' '}
            <a
              href="https://github.com/voilajs/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for more performance optimizations.
          </p>
        </section>

        {/* Error Handling section */}
        <section id="error-handling" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔍 Error Handling</h2>
          <p className="mb-4">
            Handle errors gracefully to ensure application resilience when cache operations fail.
          </p>
          <CodeBlock
            code={`
try {
  const result = await cache.get('important-data');
} catch (error) {
  console.error('Cache operation failed:', error.message);
  const result = await fetchDataFromOriginalSource();
  try {
    await cache.set('important-data', result);
  } catch (cacheError) {
    console.warn('Failed to restore cache:', cacheError.message);
  }
}
            `}
            language="javascript"
            showCopyButton={true}
          />
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 rounded">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Best Practice:</strong> Always provide a fallback to the original data source and avoid exposing cache errors to users.
            </p>
          </div>
          <p className="mt-4">
            See the{' '}
            <a
              href="https://github.com/voilajs/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for advanced error handling strategies.
          </p>
        </section>

        {/* Documentation Links section */}
        <section id="documentation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📚 Documentation Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                emoji: '📘',
                title: 'Developer Reference',
                desc: 'Detailed implementation guide with examples and best practices',
                url: 'https://github.com/voilajs/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md',
              },
              {
                emoji: '📗',
                title: 'API Reference',
                desc: 'Complete API documentation with parameters and error details',
                url: 'https://github.com/voilajs/appkit/blob/main/src/cache/docs/API_REFERENCE.md',
              },
              {
                emoji: '📙',
                title: 'LLM Code Generation',
                desc: 'Guide for using AI tools to generate caching code',
                url: 'https://github.com/voilajs/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md',
              },
            ].map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="text-lg font-semibold mb-2 flex items-center">
                  <span className="text-2xl mr-2" aria-hidden="true">{link.emoji}</span>
                  {link.title}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{link.desc}</p>
              </a>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3">Contributing</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Join our community to improve <code>@voilajs/appkit</code> by fixing bugs, enhancing docs, or adding features.
            </p>
            <a
              href="https://github.com/voilajs/appkit/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center"
            >
              View Contributing Guide
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </section>
      </div>

      {/* TOC column */}
      <aside className="hidden lg:block lg:w-1/4">
        <div className="sticky top-20">
          <nav className="toc" aria-label="Table of contents">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">On this page</h2>
            <ul className="space-y-2 text-sm">
              {sections.map((section, index) => (
                <li key={index} className="list-none">
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    aria-current={activeSection === section.id ? 'true' : 'false'}
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

export default CacheOverview;