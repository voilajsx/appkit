import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '@/components/ui/CodeBlock';

/**
 * Cache Module Overview page for @voilajsx/appkit documentation
 * Provides detailed information about the Cache module
 */
function CacheOverview() {
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
        'cache-creation',
        'basic-operations',
        'batch-operations',
        'advanced-features',
        'configuration',
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
          <span className="text-4xl mr-4">🚀</span>
          <h1 className="text-4xl font-bold">Cache Module</h1>
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
              A unified caching interface with support for multiple backends to boost application performance
            </p>
          </div>
          
          <p className="mb-4">
            The Cache module of <code>@voilajsx/appkit</code> provides a flexible and powerful caching
            solution for Node.js applications, supporting in-memory, Redis, and Memcached backends.
            It offers a consistent API for storing, retrieving, and managing cached data with automatic
            serialization and TTL management.
          </p>
        </section>

        {/* Module Overview section */}
        <section id="module-overview" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Module Overview</h2>
          
          <p className="mb-6">
            The Cache module provides everything you need for effective application caching:
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
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Efficiently manage multiple cache entries</td>
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
        </section>

        {/* Features section */}
        <section id="features" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🚀 Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">💾</span>
                Multiple Backend Support
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Supports in-memory, Redis, and Memcached backends for flexible caching solutions.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">⏱️</span>
                TTL Management
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Automatic expiration of cached items with customizable time-to-live settings.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🗂️</span>
                Namespaces
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Organize cache keys with logical grouping for better management.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🔄</span>
                Batch Operations
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Efficiently manage multiple cache entries with bulk operations.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🧠</span>
                Smart Patterns
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Built-in cache-aside pattern with <code>getOrSet</code> for simplified caching logic.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🔌</span>
                Framework Agnostic
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Works with any Node.js application, including Express, Fastify, and Koa.
              </p>
            </div>
          </div>
        </section>

        {/* Installation section */}
        <section id="installation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📦 Installation</h2>
          
          <p className="mb-4">
            Install the package and optional backend dependencies using your preferred package manager:
          </p>
          
          <CodeBlock 
            code={`npm install @voilajsx/appkit
# Optional: Install backend-specific dependencies
npm install redis       # For Redis support
npm install memcached   # For Memcached support`}
            language="bash"
            showCopyButton={true}
          />
        </section>

        {/* Quick Start section */}
        <section id="quick-start" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🏃‍♂️ Quick Start</h2>
          
          <p className="mb-4">
            Import only the functions you need and start caching right away. The Cache module provides a consistent API across all implementations.
          </p>
          
          <CodeBlock 
            code={`import { createCache } from '@voilajsx/appkit/cache';

// Create a cache instance
const cache = await createCache({
  strategy: 'memory', // or 'redis', 'memcached'
});

// Store a value (with optional TTL)
await cache.set('user:123', { name: 'Alice', role: 'admin' }, 3600); // 1 hour TTL

// Retrieve a value
const user = await cache.get('user:123');
console.log(user.name); // 'Alice'

// Use cache-aside pattern
const product = await cache.getOrSet(
  'product:3',
  async () => {
    // This only runs on cache miss
    return { name: 'Tablet', price: 499 };
  },
  1800 // 30 minutes TTL
);`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Cache Creation section */}
        <section id="cache-creation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Cache Creation</h2>
          
          <p className="mb-4">
            These utilities let you create and configure cache instances with different backends, choosing the one that best fits your application's needs.
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
                    <code>createCache()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Creates a new cache instance with options
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Application startup, configuring caching strategy
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>cache.namespace()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Creates a namespaced cache instance
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Organizing caches for different data types
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Create cache with memory backend
const memoryCache = await createCache({
  strategy: 'memory',
  maxItems: 1000,
});

// Create cache with Redis backend
const redisCache = await createCache({
  strategy: 'redis',
  url: 'redis://localhost:6379',
});

// Create a namespaced cache
const userCache = cache.namespace('user');
await userCache.set('123', userData); // Stored as 'user:123'`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Basic Operations section */}
        <section id="basic-operations" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Basic Operations</h2>
          
          <p className="mb-4">
            These methods provide the fundamental operations for any caching system, allowing you to store, retrieve, check, and invalidate cached data.
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
                    <code>cache.get()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Retrieves a value from cache
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Fetching cached user data, API responses
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>cache.set()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Stores a value in cache with expiration
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Caching database query results, API responses
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>cache.has()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Checks if a key exists in cache
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Verifying cache state before operations
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>cache.delete()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Removes a key from cache
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Invalidating data after updates
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>cache.clear()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Removes all keys from cache
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Clearing cache during deployments
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Check if key exists
const exists = await cache.has('user:123');

// Get a value with default fallback
const user = await cache.get('user:123', { guest: true });

// Set a value with 1 hour TTL
await cache.set('user:123', userData, 3600);

// Delete a key
await cache.delete('user:123');

// Clear entire cache or namespace
await cache.clear();`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Batch Operations section */}
        <section id="batch-operations" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Batch Operations</h2>
          
          <p className="mb-4">
            These methods provide efficient operations on multiple cache entries at once, reducing network round-trips and improving performance.
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
                    <code>cache.getMany()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Retrieves multiple values at once
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Loading related data in a single request
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>cache.setMany()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Stores multiple values at once
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Caching collections of items
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>cache.deleteMany()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Removes multiple keys at once
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Batch invalidation after updates
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Retrieve multiple values
const results = await cache.getMany(['user:123', 'user:456']);

// Store multiple values
await cache.setMany(
  {
    'product:1': { name: 'Laptop', price: 999 },
    'product:2': { name: 'Phone', price: 699 },
  },
  3600
); // All with 1 hour TTL

// Delete multiple keys
await cache.deleteMany(['user:123', 'user:456']);`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Advanced Features section */}
        <section id="advanced-features" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Advanced Features</h2>
          
          <p className="mb-4">
            These methods implement sophisticated caching patterns and management features for greater control and efficiency.
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
                    <code>cache.getOrSet()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Gets a value or calculates it if not cached
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Implementing cache-aside pattern
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>cache.deletePattern()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Deletes all keys matching a pattern
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Invalidating groups of related cache entries
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>cache.keys()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Finds keys matching a pattern
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Discovering cache keys for debugging
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>cache.ttl()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Gets remaining time-to-live for a key
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Checking when cache entries will expire
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>cache.expire()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Updates expiration time for a key
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Extending TTL for active sessions
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Cache-aside pattern
const userData = await cache.getOrSet(
  'user:123',
  async () => {
    return await database.findUser(123); // Only called on cache miss
  },
  3600 // 1 hour TTL
);

// Find keys matching a pattern
const userKeys = await cache.keys('user:*');

// Delete keys matching a pattern
await cache.deletePattern('user:123:*');

// Check remaining TTL
const remainingSeconds = await cache.ttl('session:abc');

// Extend expiration
await cache.expire('session:abc', 3600); // Reset to 1 hour`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Configuration Options section */}
        <section id="configuration" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔧 Configuration Options</h2>
          
          <p className="mb-4">
            The examples above show basic usage, but you have extensive control over how the caching system works. Here are the customization options available:
          </p>
          
          <h4 className="text-xl font-semibold mb-3">Cache Creation Options</h4>
          
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
                    <code>strategy</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Cache backend to use
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'memory'</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'memory'</code>, <code>'redis'</code>, <code>'memcached'</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>keyPrefix</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Prefix for all cache keys
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>''</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'myapp:'</code>, <code>'v2:'</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>defaultTTL</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Default TTL in seconds
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>0</code> (never)
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>3600</code>, <code>86400</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>serializer</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Custom serialization functions
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>undefined</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Function to handle complex objects
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>logger</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Logger for cache operations
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>undefined</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Console or custom logger
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h4 className="text-xl font-semibold mb-3 mt-8">Memory Strategy Options</h4>
          
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
                    <code>maxItems</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Maximum items to store
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>1000</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>10000</code>, <code>100000</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>maxSize</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Maximum cache size in bytes
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>undefined</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>104857600</code> (100MB)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>cloneValues</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Whether to clone values
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>true</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>false</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h4 className="text-xl font-semibold mb-3 mt-8">Redis Strategy Options</h4>
          
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
                    <code>url</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Redis connection URL
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>undefined</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'redis://localhost:6379'</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>client</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Existing Redis client
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>undefined</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Redis client instance
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>options</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Redis client options
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>{}</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Connection and cluster options
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Memory cache with options
const memoryCache = await createCache({
  strategy: 'memory',
  maxItems: 10000,
  defaultTTL: 3600,
  keyPrefix: 'myapp:',
});

// Redis cache with options
const redisCache = await createCache({
  strategy: 'redis',
  url: 'redis://username:password@redis.example.com:6379',
  defaultTTL: 3600,
  keyPrefix: 'myapp:',
  options: {
    connectTimeout: 10000,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  },
});`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Use Cases section */}
        <section id="use-cases" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">💡 Common Use Cases</h2>
          
          <p className="mb-4">
            Here's where you can apply the cache module's functionality in your applications:
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
                    Database Layer
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Query Results
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Cache expensive database query results
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>getOrSet()</code>, TTL management
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Object Hydration
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Cache fully hydrated objects from database
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>set()</code>, <code>get()</code>, namespaces
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Counters & Aggregates
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Store pre-calculated values for reporting
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>set()</code>, batch operations
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white" rowSpan="3">
                    API Integrations
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    External API Responses
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Cache responses from third-party APIs
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>getOrSet()</code> with appropriate TTL
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Rate Limit Tracking
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Track API usage limits and quotas
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>set()</code> with TTL, <code>expire()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    API Gateway Caching
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Cache responses at the API gateway level
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Middleware with <code>get()</code>, <code>set()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white" rowSpan="3">
                    Web Applications
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    HTTP Response Caching
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Cache rendered pages or API responses
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>set()</code> with varying TTLs
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Session Storage
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Store user session data
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Namespaces, <code>expire()</code> to extend TTL
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    View Fragment Caching
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Cache partial components of web pages
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Namespaced caches for different fragments
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
            for common caching scenarios using the <code>@voilajsx/appkit/cache</code> module.
            We've created a specialized
            <a 
              href="https://github.com/voilajsx/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline mx-1"
            >
              PROMPT_REFERENCE.md
            </a>
            document designed for LLMs to understand the module's capabilities and generate high-quality caching code.
          </p>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <h4 className="text-xl font-semibold mb-3">Sample Prompt: Basic Database Caching</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
              Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md and then create a caching layer for database queries using @voilajsx/appkit/cache with the following features:
              <br/>- Redis cache configuration for production
              <br/>- Memory cache fallback for development
              <br/>- Cache-aside pattern for common queries
              <br/>- Automatic cache invalidation on data updates
              <br/>- Type-safe functions for TypeScript projects
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <h4 className="text-xl font-semibold mb-3">Sample Prompt: API Response Caching</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
              Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md and then implement an Express middleware for caching API responses using @voilajsx/appkit/cache that includes:
              <br/>- Configurable TTL based on route
              <br/>- Cache bypass for authenticated requests
              <br/>- Vary cache by query parameters
              <br/>- Cache status in response headers
              <br/>- Batch invalidation for related resources
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold mb-3">Sample Prompt: Advanced Caching Patterns</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
              Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md and then implement advanced caching patterns using @voilajsx/appkit/cache with:
              <br/>- Write-through and write-behind caching
              <br/>- Two-level caching (memory + Redis)
              <br/>- Circuit breaker for cache backend failures
              <br/>- Stampede protection for high-traffic keys
              <br/>- Cache warming for predictable access patterns
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
              <h4 className="text-lg font-semibold mb-2">Cache Basics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Basic cache operations and configuration.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/cache/examples/01-cache-basics.js" 
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
              <h4 className="text-lg font-semibold mb-2">Redis Cache</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Working with Redis as a cache backend.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/cache/examples/02-redis-cache.js" 
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
              <h4 className="text-lg font-semibold mb-2">Cache Patterns</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Common caching patterns and techniques.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/cache/examples/03-cache-patterns.js" 
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
              <h4 className="text-lg font-semibold mb-2">API Caching</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Caching API responses for improved performance.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/cache/examples/04-api-caching.js" 
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
          <h2 className="text-2xl font-bold mb-4">🛡️ Caching Best Practices</h2>
          
          <p className="mb-4">
            Following these practices will help ensure your caching system remains effective and efficient:
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">1. Choose the Right TTL</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Set expiration times based on data volatility and freshness requirements.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">2. Design Good Cache Keys</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use consistent, hierarchical naming patterns (e.g., <code>user:123:profile</code>).
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">3. Implement Proper Invalidation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Update or delete cached data when the source changes to maintain consistency.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">4. Handle Cache Misses Gracefully</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Always have a fallback when data isn't in cache to ensure application reliability.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">5. Monitor Cache Performance</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Track hit rates, miss rates, and memory usage to optimize cache efficiency.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">6. Use Namespaces</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Organize related cache keys to simplify management and invalidation.
              </p>
            </div>
          </div>
        </section>

        {/* Performance Considerations section */}
        <section id="performance" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📊 Performance Considerations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Batch Operations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use <code>getMany</code>, <code>setMany</code> to reduce network round-trips.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Serialization</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Choose appropriate serialization for complex objects or binary data.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Two-Level Caching</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Combine memory and distributed caching for frequently accessed data.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Compression</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Consider compression for large textual or JSON data to save space.
              </p>
            </div>
          </div>
        </section>

        {/* Error Handling section */}
        <section id="error-handling" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔍 Error Handling</h2>
          
          <p className="mb-4">
            The cache module is designed to be resilient, but you should handle potential errors appropriately:
          </p>
          
          <CodeBlock 
            code={`try {
  const result = await cache.get('important-data');
  // Use the cached data
} catch (error) {
  console.error('Cache operation failed:', error.message);

  // Fallback to original data source
  const result = await fetchDataFromOriginalSource();

  // Optionally try to restore cache
  try {
    await cache.set('important-data', result);
  } catch (cacheError) {
    // Log but don't fail if cache restoration fails
    console.warn('Failed to restore cache:', cacheError.message);
  }
}`}
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 rounded">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Best Practice:</strong> Always implement fallback mechanisms for cache misses or failures to ensure application reliability.
            </p>
          </div>
        </section>

        {/* Documentation Links section */}
        <section id="documentation" className="mb-6 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📚 Documentation Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <a 
              href="https://github.com/voilajsx/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md" 
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
              href="https://github.com/voilajsx/appkit/blob/main/src/cache/docs/API_REFERENCE.md" 
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
              href="https://github.com/voilajsx/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📙</span>
                LLM Code Generation
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Guide for using AI tools to generate caching code
              </p>
            </a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold mb-3">Contributing</h4>
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
        </section>
      </div>

      {/* TOC column */}
        <div className="hidden lg:block lg:w-1/4 p-8 sticky top-20">

        <div className="sticky" style={{ top: "5rem" }}>
        <div className="">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Table of Contents</h3>
          <ul className="space-y-2 text-sm">
            {[
              { id: 'introduction', label: 'Introduction' },
              { id: 'module-overview', label: 'Module Overview' },
              { id: 'features', label: 'Features' },
              { id: 'installation', label: 'Installation' },
              { id: 'quick-start', label: 'Quick Start' },
              { id: 'cache-creation', label: 'Cache Creation' },
              { id: 'basic-operations', label: 'Basic Operations' },
              { id: 'batch-operations', label: 'Batch Operations' },
              { id: 'advanced-features', label: 'Advanced Features' },
              { id: 'configuration', label: 'Configuration Options' },
              { id: 'use-cases', label: 'Common Use Cases' },
              { id: 'code-generation', label: 'Code Generation with LLMs' },
              { id: 'example-code', label: 'Example Code' },
              { id: 'best-practices', label: 'Best Practices' },
              { id: 'performance', label: 'Performance Considerations' },
              { id: 'error-handling', label: 'Error Handling' },
              { id: 'documentation', label: 'Documentation Links' },
            ].map((section) => (
              <li key={section.id} className='list-none'>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left transition-colors duration-200 ${
                    activeSection === section.id
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        </div>
      </div>
    </div>
  );
}

export default CacheOverview;