import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '@/components/ui/CodeBlock';
import { useLocation } from 'react-router-dom';
import Mermaid from 'react-mermaid2';

/**
 * Auth Module Overview page for @voilajsx/appkit documentation
 * Provides detailed information about the Auth module with enhanced UX and accessibility
 */
function AuthOverview() {
  const [activeSection, setActiveSection] = useState('introduction');
  const location = useLocation();

  // Define sections with display names and corresponding IDs
  const sections = [
    { name: 'Introduction', id: 'introduction' },
    { name: 'Module Overview', id: 'module-overview' },
    { name: 'Features', id: 'features' },
    { name: 'Installation', id: 'installation' },
    { name: 'Quick Start', id: 'quick-start' },
    { name: 'JWT Management', id: 'jwt-management' },
    { name: 'Password Security', id: 'password-security' },
    { name: 'Middleware', id: 'middleware' },
    { name: 'Configuration Options', id: 'configuration' },
    { name: 'Common Use Cases', id: 'use-cases' },
    { name: 'Code Generation', id: 'code-generation' },
    { name: 'Example Code', id: 'example-code' },
    { name: 'Security Best Practices', id: 'security-practices' },
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
          <span className="text-4xl mr-4" aria-hidden="true">🔐</span>
          <h1 className="text-4xl font-bold">Auth Module</h1>
        </header>

        <div className="flex space-x-2 mb-8">
          <a
            href="https://www.npmjs.com/package/@voilajsx/appkit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View @voilajsx/appkit on npm"
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

        {/* Introduction section */}
        <section id="introduction" className="mb-12 scroll-mt-20">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded mb-6">
            <p className="text-blue-800 dark:text-blue-200 text-lg font-medium">
              Secure, simple, and flexible authentication utilities for Node.js applications
            </p>
          </div>
          <p className="mb-4">
            The Auth module of <code>@voilajsx/appkit</code> provides robust tools for
            securing Node.js applications. It simplifies JWT token management, password hashing
            with bcrypt, and route protection with customizable middleware, making it ideal
            for APIs, web apps, and microservices.
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
            The Auth module offers a complete set of tools for modern authentication,
            seamlessly integrating with frameworks like Express, Fastify, and Koa. Whether
            you're building a REST API or a microservice, it provides secure, easy-to-use
            utilities.
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
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">JWT Management</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Create and verify secure tokens</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>generateToken()</code>, <code>verifyToken()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Password Security</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Hash and verify passwords safely</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>hashPassword()</code>, <code>comparePassword()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Route Protection</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Secure API endpoints with middleware</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>createAuthMiddleware()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Role-Based Access</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Control access based on user roles</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>createAuthorizationMiddleware()</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Authentication Flow</h3>
            <Mermaid
              chart={`
                sequenceDiagram
                  participant User
                  participant Client
                  participant Server
                  User->>Client: Enter credentials
                  Client->>Server: POST /login
                  Server->>Server: Verify with comparePassword()
                  Server->>Server: Generate JWT with generateToken()
                  Server->>Client: Return JWT
                  Client->>Server: Request with JWT (Authorization header)
                  Server->>Server: Verify with createAuthMiddleware()
                  Server->>Client: Protected resource
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
                emoji: '🔑',
                title: 'JWT Token Management',
                desc: 'Generate and verify JWT tokens with customizable expiration for secure, stateless authentication.',
              },
              {
                emoji: '🔒',
                title: 'Password Security',
                desc: 'Hash and compare passwords using bcrypt with configurable salt rounds for strong security.',
              },
              {
                emoji: '🛡️',
                title: 'Route Protection',
                desc: 'Middleware for authenticating requests and protecting API endpoints with minimal configuration.',
              },
              {
                emoji: '👥',
                title: 'Role-Based Access',
                desc: 'Control access based on user roles, limiting features based on permissions and authorization level.',
              },
              {
                emoji: '🎯',
                title: 'Framework Agnostic',
                desc: 'Works with Express, Fastify, Koa, and more. Adaptable to any Node.js framework with middleware support.',
              },
              {
                emoji: '⚡',
                title: 'Simple API',
                desc: 'Get started with just a few lines of code. Clear, concise API with sensible defaults and flexible customization.',
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
          <CodeBlock code="npm install @voilajsx/appkit" language="bash" showCopyButton={true} />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Requires Node.js 14+ and supports both CommonJS and ES Modules.
          </p>
          <p className="mt-2">
            See the{' '}
            <a
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
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
            Import only the functions you need and start securing your application in minutes.
            The Auth module’s simple API lets you add authentication to any Node.js app with
            minimal setup.
          </p>
          <CodeBlock
            code={`
import {
  generateToken,
  verifyToken,
  hashPassword,
  createAuthMiddleware,
} from '@voilajsx/appkit/auth';

// Generate a JWT token
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key' }
);

// Protect your routes
const auth = createAuthMiddleware({ secret: 'your-secret-key' });
app.get('/dashboard', auth, (req, res) => {
  res.json({ userId: req.user.userId });
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="mt-4">
            <a
              href="#example-code"
              onClick={() => scrollToSection('example-code')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Explore more examples
            </a>{' '}
            to see the Auth module in action, or check the{' '}
            <a
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for advanced configurations.
          </p>
        </section>

        {/* JWT Management section */}
        <section id="jwt-management" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔑 JWT Token Management</h2>
          <p className="mb-4">
            JSON Web Tokens (JWTs) are compact, secure tokens used to authenticate users or
            services without server-side sessions. The Auth module simplifies generating and
            verifying JWTs, making it ideal for APIs, mobile apps, or microservices. Use these
            functions to issue tokens on login or verify them for protected resources.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Function
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Purpose
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    When to Use
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>generateToken()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Creates a JWT token from a payload</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">After successful login, API token generation</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>verifyToken()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Verifies and decodes a JWT token</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Before allowing access to protected resources</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 className="text-lg font-semibold mb-2">Examples</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium mb-1">Basic Token Generation and Verification</h4>
              <CodeBlock
                code={`
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key', expiresIn: '24h' }
);

try {
  const payload = verifyToken(token, { secret: 'your-secret-key' });
  console.log(payload.userId); // '123'
} catch (error) {
  console.log('Invalid token');
}
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h4 className="text-md font-medium mb-1">Token Refresh</h4>
              <CodeBlock
                code={`
const accessToken = generateToken(
  { userId: '123' },
  { secret: 'your-secret-key', expiresIn: '15m' }
);
const refreshToken = generateToken(
  { userId: '123', type: 'refresh' },
  { secret: 'your-refresh-secret', expiresIn: '7d' }
);

// On refresh request
try {
  const payload = verifyToken(refreshToken, { secret: 'your-refresh-secret' });
  const newAccessToken = generateToken(
    { userId: payload.userId },
    { secret: 'your-secret-key', expiresIn: '15m' }
  );
} catch (error) {
  console.log('Invalid refresh token');
}
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h4 className="text-md font-medium mb-1">Microservice Authentication</h4>
              <CodeBlock
                code={`
const serviceToken = generateToken(
  { serviceId: 'payment-api', env: 'prod' },
  { secret: 'microservice-secret', expiresIn: '1h' }
);

// In another service
try {
  const payload = verifyToken(serviceToken, { secret: 'microservice-secret' });
  console.log(payload.serviceId); // 'payment-api'
} catch (error) {
  console.log('Unauthorized service');
}
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
          </div>
          <p className="mt-4">
            See the{' '}
            <a
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for advanced JWT configurations.
          </p>
        </section>

        {/* Password Security section */}
        <section id="password-security" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔒 Password Security</h2>
          <p className="mb-4">
            Storing passwords securely is critical to protect user accounts from breaches. The
            Auth module uses bcrypt to create strong password hashes and verify user logins,
            safeguarding against attacks like brute forcing. These functions are perfect for
            user registration, login, and password resets.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Function
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Purpose
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    When to Use
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>hashPassword()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Hashes a password using bcrypt</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">During user registration, password reset</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>comparePassword()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Verifies a password against a hash</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">During user login, password verification</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 className="text-lg font-semibold mb-2">Examples</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium mb-1">Basic Password Hashing and Verification</h4>
              <CodeBlock
                code={`
const hash = await hashPassword('myPassword123', 12);
const isValid = await comparePassword('myPassword123', hash);
console.log(isValid); // true
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h4 className="text-md font-medium mb-1">User Registration</h4>
              <CodeBlock
                code={`
const password = 'userPassword123';
const hash = await hashPassword(password, 10);
// Store in database
await db.users.insert({ email: 'user@example.com', password: hash });
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h4 className="text-md font-medium mb-1">Password Reset</h4>
              <CodeBlock
                code={`
const resetToken = generateToken(
  { userId: '123', action: 'reset' },
  { secret: 'reset-secret', expiresIn: '1h' }
);
// Send resetToken via email

// On reset request
const newPassword = 'newPassword456';
const newHash = await hashPassword(newPassword, 10);
await db.users.update({ id: '123' }, { password: newHash });
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
          </div>
          <p className="mt-4">
            See the{' '}
            <a
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for advanced password security tips.
          </p>
        </section>

        {/* Middleware section */}
        <section id="middleware" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🛡️ Middleware</h2>
          <p className="mb-4">
            Middleware acts as a gatekeeper for your API routes, ensuring only authorized
            users can access protected resources. The Auth module provides simple middleware
            to verify JWTs and enforce access rules, integrating seamlessly with frameworks
            like Express, Fastify, or Koa.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Function
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Purpose
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    When to Use
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>createAuthMiddleware()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Creates JWT verification middleware</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Protecting API routes, securing endpoints</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>createAuthorizationMiddleware()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Creates role-based access middleware</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Admin panels, premium features</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 className="text-lg font-semibold mb-2">Examples</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium mb-1">Basic Route Protection</h4>
              <CodeBlock
                code={`
const auth = createAuthMiddleware({ secret: 'your-secret-key' });
app.get('/profile', auth, (req, res) => {
  res.json({ user: req.user });
});
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h4 className="text-md font-medium mb-1">Custom Token Extraction</h4>
              <CodeBlock
                code={`
const auth = createAuthMiddleware({
  secret: 'your-secret-key',
  getToken: (req) => req.cookies.token,
});
app.get('/dashboard', auth, (req, res) => {
  res.json({ userId: req.user.userId });
});
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h4 className="text-md font-medium mb-1">Fastify Integration</h4>
              <CodeBlock
                code={`
const fastify = require('fastify')();
const auth = createAuthMiddleware({ secret: 'your-secret-key' });

fastify.get('/secure', { preHandler: auth }, (req, reply) => {
  reply.send({ userId: req.user.userId });
});
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
          </div>
          <p className="mt-4">
            See the{' '}
            <a
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for advanced middleware customization.
          </p>
        </section>

        {/* Configuration Options section */}
        <section id="configuration" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔧 Configuration Options</h2>
          <p className="mb-4">
            Customize token generation and middleware behavior to suit your application’s
            needs. These options provide flexibility while maintaining security.
          </p>
          <h3 className="text-lg font-semibold mb-3">Token Generation Options</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Option
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Description
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Default
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Example
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>secret</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Secret key for signing tokens</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <em>Required</em>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'your-secret-key'</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>expiresIn</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Token expiration time</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'7d'</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'1h'</code>, <code>'7d'</code>, <code>'30d'</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>algorithm</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">JWT signing algorithm</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'HS256'</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'HS256'</code>, <code>'HS384'</code>, <code>'HS512'</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <CodeBlock
            code={`
generateToken(payload, {
  secret: 'your-secret-key',
  expiresIn: '7d',
  algorithm: 'HS256',
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <h3 className="text-lg font-semibold mb-3 mt-8">Auth Middleware Options</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Option
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Description
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Default
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                    Example
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>secret</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Secret key for verifying tokens</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <em>Required</em>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>'your-secret-key'</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>getToken</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Custom function to extract token</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Checks headers, cookies, query</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Function that returns token</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>onError</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Custom error handling</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Returns 401 responses</td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">Function that handles errors</td>
                </tr>
              </tbody>
            </table>
          </div>
          <CodeBlock
            code={`
createAuthMiddleware({
  secret: 'your-secret-key',
  getToken: (req) => req.headers['x-api-key'],
  onError: (error, req, res) => {
    res.status(401).json({ error: error.message });
  },
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="mt-4">
            See the{' '}
            <a
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>{' '}
            for more configuration options.
          </p>
        </section>

        {/* Use Cases section */}
        <section id="use-cases" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">💡 Common Use Cases</h2>
          <p className="mb-4">
            The Auth module supports a wide range of authentication scenarios, from user
            management to securing APIs and controlling access.
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
                    category: 'User Management',
                    useCase: 'User Registration',
                    desc: 'Securely store user credentials during signup',
                    components: '<code>hashPassword()</code>',
                  },
                  {
                    category: 'User Management',
                    useCase: 'User Login',
                    desc: 'Authenticate users and generate tokens',
                    components: '<code>comparePassword()</code>, <code>generateToken()</code>',
                  },
                  {
                    category: 'User Management',
                    useCase: 'Password Reset',
                    desc: 'Securely handle password reset flows',
                    components: '<code>hashPassword()</code>, <code>generateToken()</code>',
                  },
                  {
                    category: 'API Security',
                    useCase: 'API Authentication',
                    desc: 'Secure API endpoints with token verification',
                    components: '<code>createAuthMiddleware()</code>',
                  },
                  {
                    category: 'API Security',
                    useCase: 'Microservices',
                    desc: 'Secure service-to-service communication',
                    components: '<code>generateToken()</code>, <code>verifyToken()</code>',
                  },
                  {
                    category: 'API Security',
                    useCase: 'Mobile API Backends',
                    desc: 'Authenticate mobile app clients',
                    components: '<code>generateToken()</code>, <code>createAuthMiddleware()</code>',
                  },
                  {
                    category: 'Access Control',
                    useCase: 'Admin Dashboards',
                    desc: 'Restrict sensitive admin features to authorized users',
                    components: '<code>createAuthMiddleware()</code>, <code>createAuthorizationMiddleware()</code>',
                  },
                  {
                    category: 'Access Control',
                    useCase: 'Premium Features',
                    desc: 'Limit access to paid features based on subscription',
                    components: '<code>createAuthorizationMiddleware()</code>',
                  },
                  {
                    category: 'Access Control',
                    useCase: 'Multi-tenant Apps',
                    desc: 'Ensure users can only access their own data',
                    components: '<code>createAuthMiddleware()</code>, custom role checks',
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
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
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
            Leverage AI tools like ChatGPT or Claude to generate authentication code using
            the{' '}
            <a
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              PROMPT_REFERENCE.md
            </a>{' '}
            guide. These prompts help you quickly build secure authentication flows.
          </p>
          {[
            {
              title: 'Basic Auth Setup',
              prompt: `
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then create a complete authentication system for an Express app using @voilajsx/appkit/auth with the following features:
- User registration with password hashing
- Login with JWT token generation
- Middleware for protected routes
- Role-based access control for admin routes
              `,
            },
            {
              title: 'Custom Authentication Flow',
              prompt: `
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then implement a secure authentication flow for a React Native mobile app using @voilajsx/appkit/auth that includes:
- Token storage in secure storage
- Token refresh mechanism
- Biometric authentication integration
- Protection against common mobile auth vulnerabilities
              `,
            },
            {
              title: 'Complex Authorization',
              prompt: `
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then implement a complex authorization system using @voilajsx/appkit/auth with:
- Hierarchical role structure (admin > manager > user)
- Resource-based permissions (users can only access their own data)
- Team-based access control
- Audit logging for all authentication and authorization events
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
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
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
            Explore practical examples to see how the Auth module works in real applications:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              {
                title: 'Password Basics',
                desc: 'How to securely hash and verify passwords using bcrypt.',
                url: 'https://github.com/voilajsx/appkit/blob/main/src/auth/examples/01-password-basics.js',
              },
              {
                title: 'JWT Basics',
                desc: 'Working with JWT tokens, including generation and verification.',
                url: 'https://github.com/voilajsx/appkit/blob/main/src/auth/examples/02-jwt-basics.js',
              },
              {
                title: 'Simple Middleware',
                desc: 'How to protect routes with authentication middleware.',
                url: 'https://github.com/voilajsx/appkit/blob/main/src/auth/examples/03-simple-middleware.js',
              },
              {
                title: 'Complete Demo App',
                desc: 'A fully functional authentication system with registration, login, and protected routes.',
                url: 'https://github.com/voilajsx/appkit/blob/main/src/auth/examples/auth-demo-app',
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

        {/* Security Best Practices section */}
<section id="security-practices" className="mb-12 scroll-mt-20">
  <h2 className="text-2xl font-bold mb-4">🛡️ Security Best Practices</h2>
  <p className="mb-4">
    Follow these practices to ensure your authentication system remains secure:
  </p>
  <ul className="space-y-4 mb-6 list-disc pl-0 m-0">
    {[
      {
        title: 'Environment Variables',
        desc: 'Store JWT secrets in environment variables to prevent exposure in source control.',
      },
      {
        title: 'HTTPS',
        desc: 'Use HTTPS in production to protect tokens in transit and prevent interception.',
      },
      {
        title: 'Token Expiration',
        desc: 'Use short-lived tokens (hours or days) to minimize risks if tokens are compromised.',
      },
      {
        title: 'Password Requirements',
        desc: 'Enforce strong password policies with minimum length and complexity checks.',
      },
      {
        title: 'Salt Rounds',
        desc: 'Use 10-12 bcrypt rounds for secure password hashing, balancing security and performance.',
      },
      {
        title: 'Error Messages',
        desc: 'Use generic error messages to avoid leaking sensitive information to attackers.',
      },
    ].map((practice, index) => (
      <li key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border list-none  border-gray-200 dark:border-gray-700">
        <span className="font-semibold">{practice.title}:</span> {practice.desc}
      </li>
    ))}
  </ul>
  <p className="mt-4">
    See the{' '}
    <a
      href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      Developer Reference
    </a>{' '}
    for advanced security guidelines.
  </p>
</section>

{/* Performance Considerations section */}
<section id="performance" className="mb-12 scroll-mt-20">
  <h2 className="text-2xl font-bold mb-4">📊 Performance Considerations</h2>
  <p className="mb-4">
    Optimize your authentication system with these performance tips:
  </p>
  <ul className="space-y-4 mb-6 list-disc pl-0">
    {[
      {
        title: 'Bcrypt Rounds',
        desc: 'Use 10-12 rounds for a balance of security and performance.',
      },
      {
        title: 'Token Size',
        desc: 'Keep JWT payloads minimal to reduce request overhead.',
      },
      {
        title: 'Caching',
        desc: 'Cache verified tokens to reduce verification overhead in high-traffic APIs.',
      },
      {
        title: 'Async/Await',
        desc: 'Use async/await properly to avoid blocking the event loop.',
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
      href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
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
            Handle errors gracefully to provide a robust user experience while maintaining
            security.
          </p>
          <CodeBlock
            code={`
try {
  const payload = verifyToken(token, { secret: 'your-secret-key' });
} catch (error) {
  if (error.message === 'Token has expired') {
    // Prompt user to log in again
  } else if (error.message === 'Invalid token') {
    // Handle tampering or invalid token
  } else {
    // Log unexpected errors
  }
}
            `}
            language="javascript"
            showCopyButton={true}
          />
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 rounded">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Best Practice:</strong> Avoid exposing internal error details in
              production to prevent information leakage.
            </p>
          </div>
          <p className="mt-4">
            See the{' '}
            <a
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
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
                url: 'https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md',
              },
              {
                emoji: '📗',
                title: 'API Reference',
                desc: 'Complete API documentation with parameters, returns, and error details',
                url: 'https://github.com/voilajsx/appkit/blob/main/src/auth/docs/API_REFERENCE.md',
              },
              {
                emoji: '📙',
                title: 'LLM Code Generation',
                desc: 'Guide for using AI tools to generate authentication code',
                url: 'https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md',
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
              Join our community to improve <code>@voilajsx/appkit</code> by fixing bugs,
              enhancing docs, or adding features.
            </p>
            <a
              href="https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md"
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

export default AuthOverview;