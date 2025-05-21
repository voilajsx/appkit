import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '@/components/ui/CodeBlock';

/**
 * Overview page for @voilajsx/appkit documentation
 * Highlights the available modules and their features
 */
function Overview() {
  const [activeSection, setActiveSection] = useState('introduction');

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'introduction',
        'core-modules',
        'auth-module',
        'cache-module',
        'config-module',
        'email-module',
        'error-module',
        'events-module',
        'logging-module',
        'queue-module',
        'security-module',
        'storage-module',
        'tenantdb-module',
        'validation-module',
        'utils-module',
        'example-integration',
        'next-steps'
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
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-4">@voilajsx/appkit Overview</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            A comprehensive toolkit for building robust Node.js applications with integrated modules
            for authentication, caching, error handling, and more.
          </p>
        </div>
        {/* Introduction section */}
        <section id="introduction" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Introduction</h2>
          <p className="mb-4">
            @voilajsx/appkit is a modular, framework-agnostic library designed to simplify common Node.js 
            application development tasks. It provides a collection of well-designed, thoroughly tested modules 
            that work seamlessly together while remaining independently usable.
          </p>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-xl font-semibold mb-3">Key Features</h3>
            <ul className="space-y-2 list-disc pl-6">
              <li>Modular design with consistent APIs across all modules</li>
              <li>Framework-agnostic, works with Express, Fastify, Koa, NestJS, and more</li>
              <li>Follows modern Node.js best practices and patterns</li>
              <li>Fully typed with TypeScript for improved developer experience</li>
              <li>Comprehensive documentation and examples</li>
              <li>Built with security and performance in mind</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded">
            <p className="text-blue-800 dark:text-blue-200">
              <strong>Designed for Production:</strong> @voilajsx/appkit is built for real-world application development,
              with a focus on reliability, security, and maintainability. Each module includes sensible defaults while
              allowing extensive customization.
            </p>
          </div>
        </section>

        {/* Core Modules section */}
        <section id="core-modules" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-6">Core Modules</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Auth Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🔐</span>
                Auth
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                JWT token management, password hashing, and authentication middleware.
              </p>
              <button 
                onClick={() => scrollToSection('auth-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* Cache Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                Cache
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Flexible caching with support for memory, Redis, and custom cache strategies.
              </p>
              <button 
                onClick={() => scrollToSection('cache-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {/* Config Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">⚙️</span>
                Config
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Environment-aware configuration management with validation and watching.
              </p>
              <button 
                onClick={() => scrollToSection('config-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* Email Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📧</span>
                Email
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Send emails with various providers, templates, and attachments.
              </p>
              <button 
                onClick={() => scrollToSection('email-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* Error Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">❌</span>
                Error
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Structured error handling with typed errors and middleware.
              </p>
              <button 
                onClick={() => scrollToSection('error-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* Events Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🔔</span>
                Events
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Publish-subscribe event system with async support and history.
              </p>
              <button 
                onClick={() => scrollToSection('events-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {/* Logging Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📝</span>
                Logging
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Structured logging with multiple transports and contextual loggers.
              </p>
              <button 
                onClick={() => scrollToSection('logging-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* Queue Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Queue
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Background job processing with retries, priorities, and monitoring.
              </p>
              <button 
                onClick={() => scrollToSection('queue-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* Security Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🛡️</span>
                Security
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                CSRF protection, rate limiting, and input sanitization.
              </p>
              <button 
                onClick={() => scrollToSection('security-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {/* Storage Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">💾</span>
                Storage
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                File storage with local and cloud provider support.
              </p>
              <button 
                onClick={() => scrollToSection('storage-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* TenantDB Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🏢</span>
                TenantDB
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Multi-tenant database management for SaaS applications.
              </p>
              <button 
                onClick={() => scrollToSection('tenantdb-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* Validation Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">✅</span>
                Validation
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Input validation with schema support and custom rules.
              </p>
              <button 
                onClick={() => scrollToSection('validation-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* Utils Module Card */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🔧</span>
                Utils
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Helper functions for common operations like string handling and date manipulation.
              </p>
              <button 
                onClick={() => scrollToSection('utils-module')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </section>
        {/* Auth Module section */}
        <section id="auth-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🔐</span>
            <h2 className="text-2xl font-bold">Auth Module</h2>
          </div>
          
          <p className="mb-4">
            The Auth module provides secure, flexible authentication utilities for Node.js applications, including
            JWT token management, password hashing, and middleware for protecting routes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>JWT token generation and verification</li>
                <li>Secure password hashing with bcrypt</li>
                <li>Framework-agnostic authentication middleware</li>
                <li>Role-based access control</li>
                <li>Customizable token sources and error handling</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>User authentication in web applications</li>
                <li>Protecting API routes</li>
                <li>Securing admin panels and sensitive operations</li>
                <li>Token-based authentication for SPAs and mobile apps</li>
                <li>Implementing role-based permissions</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { 
  generateToken, 
  verifyToken, 
  hashPassword, 
  comparePassword,
  createAuthMiddleware 
} from '@voilajsx/appkit/auth';

// Generate a JWT token
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: process.env.JWT_SECRET, expiresIn: '1d' }
);

// Verify a token
try {
  const payload = verifyToken(token, { secret: process.env.JWT_SECRET });
  console.log(payload.userId); // '123'
} catch (error) {
  console.log('Invalid token');
}

// Hash a password
const hash = await hashPassword('myPassword123');

// Verify a password
const isValid = await comparePassword('myPassword123', hash);

// Create middleware to protect routes
const auth = createAuthMiddleware({ secret: process.env.JWT_SECRET });
app.get('/profile', auth, (req, res) => {
  // req.user contains the decoded token payload
  res.json({ user: req.user });
});
`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/auth" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Auth
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        {/* Auth Module section */}
        <section id="auth-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🔐</span>
            <h2 className="text-2xl font-bold">Auth Module</h2>
          </div>
          
          <p className="mb-4">
            The Auth module provides secure, flexible authentication utilities for Node.js applications, including
            JWT token management, password hashing, and middleware for protecting routes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>JWT token generation and verification</li>
                <li>Secure password hashing with bcrypt</li>
                <li>Framework-agnostic authentication middleware</li>
                <li>Role-based access control</li>
                <li>Customizable token sources and error handling</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>User authentication in web applications</li>
                <li>Protecting API routes</li>
                <li>Securing admin panels and sensitive operations</li>
                <li>Token-based authentication for SPAs and mobile apps</li>
                <li>Implementing role-based permissions</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { 
  generateToken, 
  verifyToken, 
  hashPassword, 
  comparePassword,
  createAuthMiddleware 
} from '@voilajsx/appkit/auth';

// Generate a JWT token
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: process.env.JWT_SECRET, expiresIn: '1d' }
);

// Verify a token
try {
  const payload = verifyToken(token, { secret: process.env.JWT_SECRET });
  console.log(payload.userId); // '123'
} catch (error) {
  console.log('Invalid token');
}

// Hash a password
const hash = await hashPassword('myPassword123');

// Verify a password
const isValid = await comparePassword('myPassword123', hash);

// Create middleware to protect routes
const auth = createAuthMiddleware({ secret: process.env.JWT_SECRET });
app.get('/profile', auth, (req, res) => {
  // req.user contains the decoded token payload
  res.json({ user: req.user });
});
`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/auth" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Auth
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        {/* Cache Module section */}
        <section id="cache-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">⚡</span>
            <h2 className="text-2xl font-bold">Cache Module</h2>
          </div>
          
          <p className="mb-4">
            The Cache module provides a flexible, easy-to-use caching system that supports multiple storage
            strategies including in-memory, Redis, and more, with a consistent API.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Multiple cache storage adapters (memory, Redis, Memcached)</li>
                <li>Consistent API across different adapters</li>
                <li>TTL support for cache expiration</li>
                <li>Namespaces for organizing cached data</li>
                <li>Pattern-based key management</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Caching database queries and API responses</li>
                <li>Rate limiting and request throttling</li>
                <li>Session storage for web applications</li>
                <li>Distributed locks and semaphores</li>
                <li>Memoization for expensive operations</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { createCache } from '@voilajsx/appkit/cache';

// Create a cache instance
const cache = await createCache({
  strategy: 'redis',
  url: process.env.REDIS_URL,
  defaultTTL: 3600, // 1 hour
});

// Store a value
await cache.set('user:123', { id: '123', name: 'John Doe' });

// Retrieve a value
const user = await cache.get('user:123');
if (user) {
  console.log(user.name); // John Doe
}

// Cache with namespaces
const userCache = cache.namespace('users');
await userCache.set('123', { id: '123', name: 'John Doe' });
// Key is stored as 'users:123'

// Cache-aside pattern with getOrSet
const posts = await cache.getOrSet(
  'posts:recent',
  async () => {
    // This function is only called on cache miss
    return await fetchRecentPosts();
  },
  1800 // 30 minutes TTL
);`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/cache" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Cache
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        {/* Config Module section */}
        <section id="config-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">⚙️</span>
            <h2 className="text-2xl font-bold">Config Module</h2>
          </div>
          
          <p className="mb-4">
            The Config module provides a unified approach to application configuration, supporting multiple
            file formats, environment variables, validation, and real-time config updates.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Support for JSON, YAML, and JS config files</li>
                <li>Environment variable integration</li>
                <li>Schema-based validation</li>
                <li>Real-time config watching</li>
                <li>Hierarchical configuration with dot notation</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Application settings management</li>
                <li>Environment-specific configurations</li>
                <li>Feature flags and toggles</li>
                <li>Centralized configuration for microservices</li>
                <li>Validation of application settings</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { loadConfig, getConfig, validateConfig } from '@voilajsx/appkit/config';

// Define a schema for validation
const schema = {
  server: {
    type: 'object',
    required: ['port'],
    properties: {
      host: { type: 'string', default: 'localhost' },
      port: { type: 'number', minimum: 1, maximum: 65535 }
    }
  },
  database: {
    type: 'object',
    required: ['url'],
    properties: {
      url: { type: 'string' },
      pool: {
        type: 'object',
        properties: {
          min: { type: 'number', default: 2 },
          max: { type: 'number', default: 10 }
        }
      }
    }
  }
};

// Load configuration from file with defaults and validation
await loadConfig('./config.json', {
  defaults: {
    server: {
      host: 'localhost',
      port: 3000
    }
  },
  required: ['database.url'],
  schema,
  env: true, // Allow environment variables to override
  watch: true // Watch for changes
});

// Get configuration values
const port = getConfig('server.port'); // 3000
const dbUrl = getConfig('database.url');

// Listen for config changes
process.on('config:changed', (changes) => {
  console.log('Configuration changed:', changes);
});`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/config" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Config
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        {/* Email Module section */}
        <section id="email-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">📧</span>
            <h2 className="text-2xl font-bold">Email Module</h2>
          </div>
          
          <p className="mb-4">
            The Email module provides a unified API for sending emails with various providers, including
            templates, attachments, and HTML content support.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Support for multiple email providers (SMTP, SendGrid, SES)</li>
                <li>Templated emails with variable substitution</li>
                <li>HTML and plain text email bodies</li>
                <li>File attachments</li>
                <li>Email queue integration</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Welcome and onboarding emails</li>
                <li>Password reset and account verification</li>
                <li>Transactional emails (order confirmations, receipts)</li>
                <li>Notification emails</li>
                <li>Newsletter and marketing campaigns</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { initEmail, sendEmail, sendTemplatedEmail } from '@voilajsx/appkit/email';

// Initialize email provider
await initEmail('smtp', {
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  defaultFrom: 'noreply@example.com'
});

// Send a simple email
await sendEmail(
  'user@example.com',
  'Welcome to our platform!',
  '<h1>Welcome!</h1><p>Thank you for signing up.</p>',
  {
    text: 'Welcome! Thank you for signing up.',
    replyTo: 'support@example.com'
  }
);

// Send a templated email
const template = \`
  <h1>Hello, {{name}}!</h1>
  <p>Your account has been created successfully.</p>
  {{#if verificationRequired}}
    <p>Please verify your email by clicking <a href="{{verificationUrl}}">here</a>.</p>
  {{/if}}
\`;

await sendTemplatedEmail(
  'user@example.com',
  'Account Created',
  template,
  {
    name: 'John Doe',
    verificationRequired: true,
    verificationUrl: 'https://example.com/verify?token=abc123'
  },
  {
    attachments: [
      {
        filename: 'welcome.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  }
);`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/email" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Email
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        {/* Error Module section */}
        <section id="error-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">❌</span>
            <h2 className="text-2xl font-bold">Error Module</h2>
          </div>
          
          <p className="mb-4">
            The Error module provides structured error handling with typed errors, middleware for API error
            responses, and utilities for common error patterns.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Standardized error types with status codes</li>
                <li>Error middleware for Express and other frameworks</li>
                <li>Async error handling utilities</li>
                <li>Typed error factories for common scenarios</li>
                <li>Structured error responses for APIs</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Consistent API error responses</li>
                <li>Safe handling of async route handlers</li>
                <li>Request validation errors</li>
                <li>Authentication and authorization errors</li>
                <li>Global error handling in web applications</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { 
  AppError, 
  validationError, 
  notFoundError,
  createErrorHandler,
  asyncHandler
} from '@voilajsx/appkit/error';

// Create custom error
const paymentError = new AppError(
  'PAYMENT_ERROR',
  'Payment processing failed',
  { orderId: '123' },
  402 // status code
);

// Use error factories for common errors
const userNotFound = notFoundError('User', '123');
const invalidInput = validationError({
  email: 'Invalid email format',
  password: 'Password too short'
});

// Create Express error handler middleware
const errorHandler = createErrorHandler({
  logger: console.error,
  includeStack: process.env.NODE_ENV !== 'production'
});

// Setup Express routes with error handling
const app = express();

// Wrap async route handlers
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await findUser(req.params.id);
  
  if (!user) {
    throw notFoundError('User', req.params.id);
  }
  
  res.json(user);
}));

// Add error handling middleware
app.use(errorHandler);

// Handle uncaught exceptions and rejections
handleUncaughtExceptions();
handleUnhandledRejections();`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/error" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Error
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        {/* Events Module section */}
        <section id="events-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🔔</span>
            <h2 className="text-2xl font-bold">Events Module</h2>
          </div>
          
          <p className="mb-4">
            The Events module provides a flexible publish-subscribe system with support for
            synchronous and asynchronous event handling, event history, and custom event stores.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Synchronous and asynchronous event handling</li>
                <li>Event history and replay</li>
                <li>Custom event stores</li>
                <li>Filtered event subscriptions</li>
                <li>Wait for specific events with timeouts</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Application events and notifications</li>
                <li>Inter-module communication</li>
                <li>Audit logging</li>
                <li>Event-driven architecture</li>
                <li>Workflow state transitions</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { 
  subscribe, 
  subscribeAsync, 
  publish, 
  publishBatch,
  waitForEvent
} from '@voilajsx/appkit/events';

// Subscribe to an event
const unsubscribe = subscribe('user:created', (data) => {
  console.log('New user created:', data.id);
});

// Subscribe to an event with async handler
subscribeAsync('order:created', async (order) => {
  // Process order asynchronously
  await processOrder(order);
  await sendOrderConfirmation(order);
});

// Publish an event
const eventId = publish('user:created', { 
  id: '123',
  email: 'user@example.com',
  createdAt: new Date()
});

// Publish multiple events
publishBatch([
  { event: 'user:created', data: { id: '123' } },
  { event: 'email:sent', data: { userId: '123', type: 'welcome' } }
]);

// Wait for an event with timeout
try {
  const result = await waitForEvent('order:processed', {
    timeout: 5000,
    filter: (data) => data.orderId === '123'
  });
  
  console.log('Order processed:', result);
} catch (error) {
  console.error('Timeout waiting for order processing');
}

// Clean up subscription when no longer needed
unsubscribe();`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/events" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Events
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        
        {/* Logging Module section */}
        <section id="logging-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">📝</span>
            <h2 className="text-2xl font-bold">Logging Module</h2>
          </div>
          
          <p className="mb-4">
            The Logging module provides structured logging with support for multiple transports,
            log levels, and contextual logging for Node.js applications.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Multiple log transports (console, file, custom)</li>
                <li>Log levels with granular control</li>
                <li>Structured JSON logging</li>
                <li>Child loggers for request context</li>
                <li>Log rotation and retention policies</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Application event logging</li>
                <li>Request logging in web applications</li>
                <li>Error tracking and debugging</li>
                <li>Audit logging for compliance</li>
                <li>Performance monitoring</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { createLogger } from '@voilajsx/appkit/logging';

// Create a logger instance
const logger = createLogger({
  level: 'info', // log level (error, warn, info, debug)
  defaultMeta: {
    service: 'api',
    environment: process.env.NODE_ENV
  },
  enableFileLogging: true,
  dirname: 'logs',
  filename: 'app.log',
  retentionDays: 7
});

// Log at different levels
logger.info('Server started', { port: 3000 });
logger.debug('Debug information', { config: { db: 'connected' } });
logger.warn('Resource running low', { resource: 'memory', usage: '85%' });
logger.error('Failed to connect to database', { 
  error: err.message,
  stack: err.stack
});

// Create child logger with context
function handleRequest(req, res, next) {
  // Create request-specific logger
  req.logger = logger.child({
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  req.logger.info('Request received');
  
  // Log response
  res.on('finish', () => {
    req.logger.info('Request completed', {
      statusCode: res.statusCode,
      responseTime: Date.now() - req.startTime
    });
  });
  
  next();
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down');
  await logger.flush();
  await logger.close();
  process.exit(0);
});`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/logging" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Logging
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        {/* Queue Module section */}
        <section id="queue-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">📊</span>
            <h2 className="text-2xl font-bold">Queue Module</h2>
          </div>
          
          <p className="mb-4">
            The Queue module provides background job processing with support for different adapters,
            job priorities, retries, and monitoring capabilities.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Multiple queue adapters (memory, Redis, database)</li>
                <li>Job priorities and scheduling</li>
                <li>Automatic retries with backoff</li>
                <li>Concurrency control for job processing</li>
                <li>Job progress tracking and monitoring</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Email sending and notifications</li>
                <li>Report generation and data processing</li>
                <li>File uploads and image processing</li>
                <li>API integrations and webhooks</li>
                <li>Scheduled tasks and maintenance</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { initQueue, getQueue } from '@voilajsx/appkit/queue';

// Initialize queue with Redis adapter
await initQueue('redis', {
  redis: process.env.REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true
  }
});

const queue = getQueue();

// Add a job to the queue
await queue.addJob('emails', {
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome',
  data: { name: 'John' }
}, {
  priority: 10, // higher priority
  delay: 5000 // delay in ms
});

// Process jobs from the queue
await queue.processJobs('emails', async (job) => {
  console.log(\`Processing email job \${job.id}\`);
  // Send email implementation
  await sendEmail(job.data.to, job.data.subject, job.data.template, job.data.data);
  return { sent: true, timestamp: new Date() };
}, {
  concurrency: 5, // Process 5 jobs at once
  onCompleted: (jobId, result) => {
    console.log(\`Job \${jobId} completed\`, result);
  },
  onFailed: (jobId, error) => {
    console.error(\`Job \${jobId} failed\`, error);
  }
});

// Get queue stats
const stats = await queue.getQueueInfo('emails');
console.log(\`Queue stats: \${stats.pending} pending, \${stats.processing} processing, \${stats.completed} completed, \${stats.failed} failed\`);

// Clean up old jobs
await queue.cleanUp('emails', 24 * 60 * 60 * 1000, 'completed');`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/queue" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Queue
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Security Module section */}
        <section id="security-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🛡️</span>
            <h2 className="text-2xl font-bold">Security Module</h2>
          </div>
          
          <p className="mb-4">
            The Security module provides essential web security utilities including CSRF protection,
            rate limiting, and input sanitization for Node.js applications.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>CSRF token generation and validation</li>
                <li>Rate limiting middleware with custom stores</li>
                <li>Input sanitization and escaping</li>
                <li>Filename and path sanitization</li>
                <li>Security headers configuration</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Web form protection against CSRF</li>
                <li>API rate limiting and throttling</li>
                <li>User input sanitization</li>
                <li>Preventing brute force attacks</li>
                <li>Secure file uploads and downloads</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { 
  generateCsrfToken, 
  validateCsrfToken,
  createCsrfMiddleware,
  createRateLimiter,
  escapeString,
  sanitizeHtml,
  sanitizeFilename
} from '@voilajsx/appkit/security';

// CSRF Protection
app.use(session()); // Requires session middleware

// Generate CSRF token for a form
app.get('/form', (req, res) => {
  const csrfToken = generateCsrfToken(req.session);
  res.render('form', { csrfToken });
});

// Validate CSRF token on form submission
app.post('/form', (req, res) => {
  const isValid = validateCsrfToken(req.body._csrf, req.session);
  if (!isValid) {
    return res.status(403).send('Invalid CSRF token');
  }
  // Process form...
});

// Or use the CSRF middleware
const csrf = createCsrfMiddleware();
app.use(csrf);

// Rate limiting
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 login attempts per IP per 15 minutes
  message: 'Too many login attempts, please try again later'
});

app.post('/login', loginLimiter, (req, res) => {
  // Login logic...
});

// Input sanitization
function sanitizeUserInput(input) {
  return {
    username: escapeString(input.username),
    bio: sanitizeHtml(input.bio, {
      allowedTags: ['p', 'b', 'i', 'a', 'ul', 'ol', 'li']
    }),
    profileImage: sanitizeFilename(input.profileImage)
  };
}`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/security" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Security
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        {/* Storage Module section */}
        <section id="storage-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">💾</span>
            <h2 className="text-2xl font-bold">Storage Module</h2>
          </div>
          
          <p className="mb-4">
            The Storage module provides a unified API for file storage with support for local and
            cloud storage providers, streaming, and file management.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
              <li>Multiple storage providers (local, S3, custom)</li>
                <li>Streaming uploads and downloads</li>
                <li>File metadata and content type handling</li>
                <li>Directory operations and path management</li>
                <li>Large file uploads with progress tracking</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>User file uploads and management</li>
                <li>Media file storage and streaming</li>
                <li>Document and asset management</li>
                <li>Backup and archiving</li>
                <li>Content distribution and static files</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { initStorage, getStorage } from '@voilajsx/appkit/storage';

// Initialize storage with local provider
await initStorage('local', {
  basePath: './uploads',
  baseUrl: '/files'
});

// Or with S3 provider
await initStorage('s3', {
  bucket: 'my-app-files',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  publicRead: true
});

const storage = getStorage();

// Upload a file
const result = await storage.upload(
  fileBuffer, // Buffer or Stream
  'users/123/profile.jpg',
  {
    contentType: 'image/jpeg',
    metadata: {
      userId: '123',
      uploadedAt: new Date().toISOString()
    },
    public: true
  },
  (percent) => {
    console.log(\`Upload progress: \${percent}%\`);
  }
);

console.log(\`File uploaded: \${result.url}\`);

// Download a file
const fileContent = await storage.download('users/123/profile.jpg');

// Stream a file
const fileStream = await storage.downloadStream('videos/intro.mp4');
fileStream.pipe(res);

// List files in a directory
const files = await storage.list('users/123', { recursive: true });

// Check if file exists
const exists = await storage.exists('users/123/profile.jpg');

// Get file metadata
const metadata = await storage.getMetadata('users/123/profile.jpg');
console.log(\`File size: \${metadata.size}, Modified: \${metadata.modified}\`);

// Get public URL
const url = storage.getUrl('users/123/profile.jpg');

// Get signed URL (for private files)
const signedUrl = await storage.getUrl('private/report.pdf', {
  signed: true,
  expiresIn: 3600 // seconds
});`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/storage" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Storage
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        {/* TenantDB Module section */}
        <section id="tenantdb-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🏢</span>
            <h2 className="text-2xl font-bold">TenantDB Module</h2>
          </div>
          
          <p className="mb-4">
            The TenantDB module provides multi-tenant database management for SaaS applications,
            with support for different tenant isolation strategies and middleware integration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Multiple tenant isolation strategies (row, schema, database)</li>
                <li>Tenant-aware database connections</li>
                <li>Tenant provisioning and management</li>
                <li>Request-scoped tenant context</li>
                <li>Framework agnostic middleware</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>SaaS applications with multi-tenant architecture</li>
                <li>White-labeled products for multiple clients</li>
                <li>Enterprise applications with division/department isolation</li>
                <li>Marketplace platforms with vendor separation</li>
                <li>Isolated environments for development/testing</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { createDb, createMiddleware, createTenantContext } from '@voilajsx/appkit/tenantdb';

// Create a multi-tenant database instance
const db = createDb({
  url: process.env.DATABASE_URL,
  strategy: 'schema', // 'row', 'schema', or 'database'
  adapter: 'prisma', // 'prisma', 'mongoose', 'knex', or 'typeorm'
  pooling: {
    max: 10,
    min: 2
  },
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000 // 5 minutes
  }
});

// Create tenant middleware for Express
const tenantMiddleware = createMiddleware(db, {
  // Extract tenant ID from request
  getTenantId: (req) => {
    return req.headers['x-tenant-id'] || 
           req.query.tenant || 
           req.subdomain;
  },
  // Handle errors
  onError: (error, req, res) => {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: 'Tenant not found' });
    } else {
      res.status(400).json({ error: error.message });
    }
  },
  required: true // Require valid tenant
});

// Apply middleware to routes
app.use('/api', tenantMiddleware);

// Create a new tenant
await db.createTenant('acme-corp', {
  runMigrations: true,
  template: 'default'
});

// Access tenant-specific database
app.get('/api/users', async (req, res) => {
  // req.db is set by middleware to tenant-specific connection
  const users = await req.db.user.findMany();
  res.json(users);
});

// Create tenant context for background jobs
const tenantContext = createTenantContext(db);

// Run function in tenant context
await tenantContext.run('acme-corp', async () => {
  const db = tenantContext.getDb();
  await db.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@acme-corp.example.com',
      role: 'ADMIN'
    }
  });
});`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/tenantdb" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about TenantDB
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        {/* Validation Module section */}
        <section id="validation-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">✅</span>
            <h2 className="text-2xl font-bold">Validation Module</h2>
          </div>
          
          <p className="mb-4">
            The Validation module provides schema-based input validation with support for custom
            rules, async validation, and middleware integration for Express and other frameworks.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Schema-based validation with rules</li>
                <li>Custom validation rules and formatters</li>
                <li>Async validation support</li>
                <li>Nested object validation</li>
                <li>Express middleware integration</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>API request validation</li>
                <li>Form input validation</li>
                <li>User registration and profile data</li>
                <li>Configuration validation</li>
                <li>Business rule enforcement</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import { 
  createValidator, 
  createValidationMiddleware 
} from '@voilajsx/appkit/validation';

// Create a validator instance
const validator = createValidator({
  strict: true, // Reject unknown fields
  customRules: {
    isSlug: (value) => {
      return typeof value === 'string' && /^[a-z0-9-]+$/.test(value);
    },
    isUniqueEmail: async (value) => {
      const user = await db.user.findUnique({ where: { email: value } });
      return !user; // Return true if email is unique
    }
  },
  errorFormatter: (field, rule, params) => {
    if (rule === 'isSlug') {
      return \`\${field} must contain only lowercase letters, numbers, and hyphens\`;
    }
    // Default formatting for other rules
    return \`\${field} failed \${rule} validation\`;
  }
});

// Define a validation schema
const userSchema = {
  username: {
    rules: ['required', 'string', 'minLength:3', 'maxLength:20', 'isSlug'],
    optional: false,
  },
  email: {
    rules: ['required', 'email', 'isUniqueEmail'],
    optional: false,
  },
  age: {
    rules: ['integer', 'min:18', 'max:120'],
    optional: true,
    transform: (value) => (value ? parseInt(value, 10) : value),
  },
  profile: {
    rules: ['object'],
    optional: true,
  },
  'profile.bio': {
    rules: ['string', 'maxLength:500'],
    optional: true,
  }
};

// Validate data
const result = validator.validate(userData, userSchema);
if (!result.isValid) {
  console.error('Validation errors:', result.errors);
} else {
  console.log('Valid data:', result.validatedData);
}

// Async validation
const asyncResult = await validator.validateAsync(userData, userSchema);

// Create Express validation middleware
const validateUser = createValidationMiddleware(userSchema, {
  validator,
  throwOnError: true,
  errorStatus: 400,
  errorFormatter: (errors) => ({
    error: 'Validation failed',
    details: errors.map((e) => ({
      field: e.field,
      message: e.message,
    })),
  }),
});

// Apply middleware to routes
app.post('/api/users', validateUser, async (req, res) => {
  // req.body contains validated data
  const user = await createUser(req.body);
  res.status(201).json(user);
});`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/validation" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Validation
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        {/* Utils Module section */}
        <section id="utils-module" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🔧</span>
            <h2 className="text-2xl font-bold">Utils Module</h2>
          </div>
          
          <p className="mb-4">
            The Utils module provides a collection of helper functions for common operations
            like string manipulation, date handling, object operations, and asynchronous utilities.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>String utilities (casing, slugs, templates)</li>
                <li>Date and time manipulation</li>
                <li>Object and array operations</li>
                <li>Async helpers (retry, timeout, parallel)</li>
                <li>ID and UUID generation</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Common Use Cases</h3>
              <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>Data formatting and transformation</li>
                <li>URL slug generation</li>
                <li>Complex object manipulation</li>
                <li>Resilient API calls with retries</li>
                <li>Performance optimization with debounce/throttle</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Example</h3>
          <CodeBlock 
            code={`import {
  // String utilities
  camelCase, snakeCase, kebabCase, pascalCase, capitalize,
  slugify, truncate, template, maskString,
  
  // Object utilities
  pick, omit, deepMerge, deepClone, get, set,
  flatten, unflatten, isEqual, isEmpty,
  
  // Date utilities
  formatDate, parseDate, addDays, subDays, dateDiff,
  
  // ID utilities
  generateId, generateUuid,
  
  // Async utilities
  sleep, retry, timeout, parallel, debounce, throttle
} from '@voilajsx/appkit/utils';

// String utilities
const slug = slugify('Hello World Example'); // hello-world-example
const truncated = truncate('This is a long text', 10); // This is...
const masked = maskString('user@example.com', { showFirst: 2, showLast: 4 }); // us****@example.com

// String templating
const greeting = template(
  'Hello, {{name}}! Welcome to {{company}}.',
  { name: 'John', company: 'Acme Inc.' }
); // Hello, John! Welcome to Acme Inc.

// Object utilities
const user = {
  id: 123,
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret',
  meta: { lastLogin: '2023-01-01' }
};

const publicUser = pick(user, ['id', 'name', 'email']); // Omits password
const withoutMeta = omit(user, ['meta']); // Remove meta
const merged = deepMerge({ name: 'Jane' }, { email: 'jane@example.com' });
const nested = get(user, 'meta.lastLogin'); // '2023-01-01'

// Date utilities
const today = new Date();
const formatted = formatDate(today, 'YYYY-MM-DD');
const tomorrow = addDays(today, 1);
const lastWeek = subDays(today, 7);
const daysBetween = dateDiff(lastWeek, tomorrow, 'days');

// ID generation
const randomId = generateId(8); // e.g., '3f9a2b7c'
const uuid = generateUuid(); // e.g., '34c9eb34-419f-4835-b234-exampleuuid'

// Async utilities
const fetchWithRetry = async (url) => {
  return retry(
    async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(\`Status: \${response.status}\`);
      return response.json();
    },
    {
      attempts: 3,
      delay: 1000,
      factor: 2 // Exponential backoff
    }
  );
};

// Run tasks in parallel with concurrency limit
const results = await parallel(
  [fetchUsers, fetchProducts, fetchOrders],
  2 // Run 2 tasks at once
);

// Debounce a function call
const debouncedSearch = debounce(
  (query) => searchAPI(query),
  300 // Wait 300ms after last call
);

// Usage
debouncedSearch('hello'); // Called immediately
debouncedSearch('hello world'); // Only this one actually calls searchAPI`} 
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-4 text-right">
            <Link to="/docs/utils" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-end">
              Learn more about Utils
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        {/* Example Integration section */}
        <section id="example-integration" className="mb-12 scroll-mt-20">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🔄</span>
            <h2 className="text-2xl font-bold">Example Integration</h2>
          </div>
          
          <p className="mb-4">
            Here's an example of how multiple @voilajsx/appkit modules can work together
            to create a robust Express API with authentication, validation, logging, and error handling.
          </p>
          
          <CodeBlock 
            code={`import express from 'express';
import {
  // Auth module
  generateToken, createAuthMiddleware,
  // Validation module
  createValidator, createValidationMiddleware,
  // Logging module
  createLogger,
  // Error module
  createErrorHandler, asyncHandler, notFoundHandler,
  notFoundError, validationError,
  // Config module
  loadConfig, getConfig
} from '@voilajsx/appkit';

// Load application configuration
await loadConfig('./config.json', {
  env: true,
  required: ['jwt.secret', 'database.url']
});

// Create logger
const logger = createLogger({
  level: 'info',
  defaultMeta: {
    service: 'api',
    environment: process.env.NODE_ENV
  }
});

// Create Express app
const app = express();
app.use(express.json());

// Create validator
const validator = createValidator();

// User schema
const userSchema = {
  email: {
    rules: ['required', 'email'],
    optional: false
  },
  password: {
    rules: ['required', 'string', 'minLength:8'],
    optional: false
  }
};

// Authentication middleware
const auth = createAuthMiddleware({
  secret: getConfig('jwt.secret')
});

// Setup routes
app.post(
  '/api/login',
  createValidationMiddleware(userSchema, { validator }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    // Find user and verify password (implementation omitted)
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password))) {
      logger.warn('Failed login attempt', { email });
      throw validationError({ 
        _error: 'Invalid email or password' 
      });
    }
    
    // Generate token
    const token = generateToken(
      { userId: user.id, email: user.email, role: user.role },
      { 
        secret: getConfig('jwt.secret'),
        expiresIn: getConfig('jwt.expiresIn', '1d')
      }
    );
    
    logger.info('User logged in', { userId: user.id });
    res.json({ token, user: { id: user.id, email: user.email } });
  })
);

// Protected route
app.get(
  '/api/profile',
  auth,
  asyncHandler(async (req, res) => {
    const user = await findUserById(req.user.userId);
    
    if (!user) {
      throw notFoundError('User', req.user.userId);
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  })
);

// Error handling
app.use(notFoundHandler());
app.use(createErrorHandler({
  logger: (error) => {
    logger.error('Request error', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });
  },
  includeStack: process.env.NODE_ENV !== 'production'
}));

// Start server
const port = getConfig('server.port', 3000);
app.listen(port, () => {
  logger.info(\`Server started on port \${port}\`);
});`} 
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Next Steps section */}
        <section id="next-steps" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-6">Next Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Ready to start using @voilajsx/appkit? Follow our getting started guide
                to set up your first application.
              </p>
              <Link to="/docs/getting-started" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center">
                View Getting Started Guide
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Example Projects</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Explore complete example projects that demonstrate how to use @voilajsx/appkit
                in real-world applications.
              </p>
              <Link to="/docs/examples" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center">
                View Example Projects
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">API Reference</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Explore the detailed API reference for all @voilajsx/appkit modules
                to learn about available functions and options.
              </p>
              <Link to="/docs/api-reference" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center">
                View API Reference
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">GitHub Repository</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Visit the GitHub repository to contribute, report issues,
                or explore the source code.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center"
              >
                Visit GitHub Repository
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
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
                    }`}>
                    Introduction
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('core-modules')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'core-modules' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Core Modules
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('auth-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'auth-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Auth Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('cache-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'cache-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Cache Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('config-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'config-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Config Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('email-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'email-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Email Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('error-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'error-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Error Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('events-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'events-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Events Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('logging-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'logging-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Logging Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('queue-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'queue-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Queue Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('security-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'security-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Security Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('storage-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'storage-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Storage Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('tenantdb-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'tenantdb-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    TenantDB Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('validation-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'validation-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Validation Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('utils-module')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'utils-module' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Utils Module
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('example-integration')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'example-integration' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Example Integration
                  </button>
                </li>
                <li className="list-none">
                  <button 
                    onClick={() => scrollToSection('next-steps')}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      activeSection === 'next-steps' 
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Next Steps
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

export default Overview;