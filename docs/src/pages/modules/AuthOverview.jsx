import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '@/components/ui/CodeBlock';

/**
 * Auth Module Overview page for @voilajsx/appkit documentation
 * Provides detailed information about the Auth module
 */
function AuthOverview() {
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
        'jwt-management',
        'password-security',
        'middleware',
        'configuration',
        'use-cases',
        'code-generation',
        'example-code',
        'security-practices',
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
          <span className="text-4xl mr-4">🔐</span>
          <h1 className="text-4xl font-bold">Auth Module</h1>
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
              Secure, simple, and flexible authentication utilities for Node.js applications
            </p>
          </div>
          
          <p className="mb-4">
            The Auth module of <code>@voilajsx/appkit</code> provides robust authentication utilities
            including JWT token management, password hashing with bcrypt, and customizable
            middleware for protecting routes and enforcing role-based access control (RBAC).
          </p>
        </section>

        {/* Module Overview section */}
        <section id="module-overview" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Module Overview</h2>
          
          <p className="mb-6">
            The Auth module provides everything you need for modern authentication:
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
        </section>

        {/* Features section */}
        <section id="features" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🚀 Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🔑</span>
                JWT Token Management
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Generate and verify JWT tokens with customizable expiration for 
                secure, stateless authentication.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🔒</span>
                Password Security
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Hash and compare passwords using bcrypt with configurable salt rounds
                for strong security.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🛡️</span>
                Route Protection
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Middleware for authenticating requests and protecting API 
                endpoints with minimal configuration.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">👥</span>
                Role-Based Access
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Control access based on user roles, limiting features based on
                permissions and authorization level.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                Framework Agnostic
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Works with Express, Fastify, Koa, and more. Adaptable to any
                Node.js framework with middleware support.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                Simple API
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get started with just a few lines of code. Clear, concise API with
                sensible defaults and flexible customization.
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
            Import only the functions you need and start using them right away. Each
            function is designed to work independently, so you can pick and choose what you
            need for your application.
          </p>
          
          <CodeBlock 
            code={`import {
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
});`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* JWT Management section */}
        <section id="jwt-management" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">JWT Token Management</h2>
          
          <p className="mb-4">
            These utilities enable you to create secure, signed tokens for authenticating
            requests and transmitting sensitive information. JWTs are perfect for stateless
            authentication in APIs and microservices.
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
                    <code>generateToken()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Creates a JWT token from a payload
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    After successful login, API token generation
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>verifyToken()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Verifies and decodes a JWT token
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Before allowing access to protected resources
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Generate a token
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key', expiresIn: '24h' }
);

// Verify a token
try {
  const payload = verifyToken(token, { secret: 'your-secret-key' });
  console.log(payload.userId); // '123'
} catch (error) {
  console.log('Invalid token');
}`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Password Security section */}
        <section id="password-security" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Password Security</h2>
          
          <p className="mb-4">
            These functions enable you to securely store user passwords in your database by
            creating cryptographically strong hashes. Never store plaintext passwords - use
            these utilities to significantly improve your application's security.
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
                    <code>hashPassword()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Hashes a password using bcrypt
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    During user registration, password reset
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>comparePassword()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Verifies a password against a hash
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    During user login, password verification
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Hash a password
const hash = await hashPassword('myPassword123');

// Verify a password
const isValid = await comparePassword('myPassword123', hash);
console.log(isValid); // true or false`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Middleware section */}
        <section id="middleware" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Middleware</h2>
          
          <p className="mb-4">
            Secure your routes with authentication middleware that verifies JWT tokens. For
            more granular control, use role-based middleware to restrict access based on
            user roles (admin, editor, etc.), ensuring users can only access what they're
            authorized to.
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
                    <code>createAuthMiddleware()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Creates JWT verification middleware
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Protecting API routes, securing endpoints
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>createAuthorizationMiddleware()</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Creates role-based access middleware
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Admin panels, premium features
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`// Authentication middleware
const auth = createAuthMiddleware({ secret: 'your-secret-key' });

// Authorization middleware
const adminOnly = createAuthorizationMiddleware(['admin']);

// Apply to routes
app.get('/profile', auth, (req, res) => {
  // Requires valid JWT token
});

app.get('/admin', auth, adminOnly, (req, res) => {
  // Requires valid JWT token with admin role
});`}
            language="javascript"
            showCopyButton={true}
          />
        </section>

        {/* Configuration Options section */}
        <section id="configuration" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔧 Configuration Options</h2>
          
          <p className="mb-4">
            The examples above show basic usage, but you have much more control over how
            these utilities work. Here are the customization options available:
          </p>
          
          <h4 className="text-xl font-semibold mb-3">Token Generation Options</h4>
          
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
                    <code>secret</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Secret key for signing tokens
                  </td>
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
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Token expiration time
                  </td>
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
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    JWT signing algorithm
                  </td>
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
            code={`generateToken(payload, {
  secret: 'your-secret-key',
  expiresIn: '7d',
  algorithm: 'HS256',
});`}
            language="javascript"
            showCopyButton={true}
          />
          
          <h4 className="text-xl font-semibold mb-3 mt-8">Auth Middleware Options</h4>
          
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
                    <code>secret</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Secret key for verifying tokens
                  </td>
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
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Custom function to extract token
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Custom function to extract token
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Checks headers, cookies, query
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Function that returns token
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                    <code>onError</code>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Custom error handling
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Returns 401 responses
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Function that handles errors
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <CodeBlock 
            code={`createAuthMiddleware({
  secret: 'your-secret-key',
  getToken: (req) => req.headers['x-api-key'],
  onError: (error, req, res) => {
    res.status(401).json({ error: error.message });
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
            Here's where you can apply the auth module's functionality in your applications:
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
                    User Management
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    User Registration
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Securely store user credentials during signup
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>hashPassword()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    User Login
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Authenticate users and generate tokens
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>comparePassword()</code>, <code>generateToken()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Password Reset
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Securely handle password reset flows
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>hashPassword()</code>, <code>generateToken()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white" rowSpan="3">
                    API Security
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    API Authentication
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Secure API endpoints with token verification
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>createAuthMiddleware()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Microservices
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Secure service-to-service communication
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>generateToken()</code>, <code>verifyToken()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Mobile API Backends
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Authenticate mobile app clients
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>generateToken()</code>, <code>createAuthMiddleware()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white" rowSpan="3">
                    Access Control
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Admin Dashboards
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Restrict sensitive admin features to authorized users
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>createAuthMiddleware()</code>, <code>createAuthorizationMiddleware()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Premium Features
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Limit access to paid features based on subscription
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>createAuthorizationMiddleware()</code>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Multi-tenant Apps
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    Ensure users can only access their own data
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-300">
                    <code>createAuthMiddleware()</code>, custom role checks
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
            for common authentication scenarios using the <code>@voilajsx/appkit/auth</code> module.
            We've created a specialized
            <a 
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline mx-1"
            >
              PROMPT_REFERENCE.md
            </a>
            document that's designed specifically for LLMs to understand the module's
            capabilities and generate high-quality authentication code.
          </p>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <h4 className="text-xl font-semibold mb-3">Sample Prompt: Basic Auth Setup</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
              Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then create a complete authentication system for an Express app using @voilajsx/appkit/auth with the following features:
              <br/>- User registration with password hashing
              <br/>- Login with JWT token generation
              <br/>- Middleware for protected routes
              <br/>- Role-based access control for admin routes
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <h4 className="text-xl font-semibold mb-3">Sample Prompt: Custom Authentication Flow</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
              Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then implement a secure authentication flow for a React Native mobile app using @voilajsx/appkit/auth that includes:
              <br/>- Token storage in secure storage
              <br/>- Token refresh mechanism
              <br/>- Biometric authentication integration
              <br/>- Protection against common mobile auth vulnerabilities
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold mb-3">Sample Prompt: Complex Authorization</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 mb-2">
              Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then implement a complex authorization system using @voilajsx/appkit/auth with:
              <br/>- Hierarchical role structure (admin : manager : user)
              <br/>- Resource-based permissions (users can only access their own data)
              <br/>- Team-based access control
              <br/>- Audit logging for all authentication and authorization events
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
              <h4 className="text-lg font-semibold mb-2">Password Basics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                How to securely hash and verify passwords using bcrypt.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/auth/examples/01-password-basics.js" 
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
              <h4 className="text-lg font-semibold mb-2">JWT Basics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Working with JWT tokens, including generation and verification.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/auth/examples/02-jwt-basics.js" 
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
              <h4 className="text-lg font-semibold mb-2">Simple Middleware</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                How to protect routes with authentication middleware.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/auth/examples/03-simple-middleware.js" 
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
              <h4 className="text-lg font-semibold mb-2">Complete Demo App</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                A fully functional authentication system with registration, login, and protected routes.
              </p>
              <a 
                href="https://github.com/voilajsx/appkit/blob/main/src/auth/examples/auth-demo-app" 
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

        {/* Security Best Practices section */}
        <section id="security-practices" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🛡️ Security Best Practices</h2>
          
          <p className="mb-4">
            Following these practices will help ensure your authentication system remains
            secure:
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">1. Environment Variables</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Store JWT secrets in environment variables, not in code. This prevents accidental
                exposure through source control.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">2. HTTPS</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Always use HTTPS in production to protect tokens in transit. JWT tokens sent
                over unencrypted connections can be intercepted.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">3. Token Expiration</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use short-lived tokens (hours/days, not months). Long-lived tokens present
                a security risk if compromised.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">4. Password Requirements</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Implement strong password policies. Require minimum length, complexity,
                and check against common password lists.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">5. Salt Rounds</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use at least 10 bcrypt rounds (12 for high security). Higher rounds make
                password cracking computationally expensive.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">6. Error Messages</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Don't reveal sensitive information in error responses. Generic messages
                prevent attackers from gathering information.
              </p>
            </div>
          </div>
        </section>

        {/* Performance Considerations section */}
        <section id="performance" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📊 Performance Considerations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Bcrypt Rounds</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Balance security and performance with appropriate rounds (10-12). Higher
                rounds are more secure but slower.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Token Size</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Keep JWT payloads small to minimize token size. Large tokens increase
                request size and parsing overhead.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Caching</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Consider caching verified tokens to reduce verification overhead,
                especially for high-traffic APIs.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-1">Async/Await</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Use properly with password functions for better performance and to
                avoid blocking the event loop.
              </p>
            </div>
          </div>
        </section>

        {/* Error Handling section */}
        <section id="error-handling" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">🔍 Error Handling</h2>
          
          <p className="mb-4">
            The module provides specific error messages that you should handle
            appropriately:
          </p>
          
          <CodeBlock 
            code={`try {
  const payload = verifyToken(token, { secret });
} catch (error) {
  if (error.message === 'Token has expired') {
    // Handle expired token
  } else if (error.message === 'Invalid token') {
    // Handle invalid token
  } else {
    // Handle other errors
  }
}`}
            language="javascript"
            showCopyButton={true}
          />
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 rounded">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>Best Practice:</strong> Provide user-friendly error messages for your API clients,
              but don't expose internal error details or sensitive information in production.
            </p>
          </div>
        </section>

        {/* Documentation Links section */}
        <section id="documentation" className="mb-6 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">📚 Documentation Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <a 
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-2xl mr-2">📘</span>
                Developer REFERENCE
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Detailed implementation guide with examples and best practices
              </p>
            </a>
            
            <a 
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/API_REFERENCE.md" 
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
                href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="text-xl font-semibold mb-2 flex items-center">
                  <span className="text-2xl mr-2">📙</span>
                  LLM Code Generation
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Guide for using AI tools to generate authentication code
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
                      onClick={() => scrollToSection('jwt-management')}
                      className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        activeSection === 'jwt-management' 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      JWT Management
                    </button>
                  </li>
                  <li className="list-none">
                    <button 
                      onClick={() => scrollToSection('password-security')}
                      className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        activeSection === 'password-security' 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Password Security
                    </button>
                  </li>
                  <li className="list-none">
                    <button 
                      onClick={() => scrollToSection('middleware')}
                      className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        activeSection === 'middleware' 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Middleware
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
                      onClick={() => scrollToSection('security-practices')}
                      className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        activeSection === 'security-practices' 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Security Best Practices
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
  
  export default AuthOverview;