import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '@/components/ui/CodeBlock';
import { useLocation } from 'react-router-dom';

/**
 * Auth Module Overview page for @voilajsx/appkit documentation
 * A detailed yet simple guide to using the Auth module with practical examples
 */
function AuthOverview() {
  const [activeSection, setActiveSection] = useState('introduction');
  const location = useLocation();

  // Table of Contents sections
  const sections = [
    { name: 'Getting Started', id: 'getting-started' },
    { name: 'Core Concepts', id: 'core-concepts' },
    { name: 'Installation', id: 'installation' },
    { name: 'User Authentication', id: 'user-authentication' },
    { name: 'Protecting Routes', id: 'protecting-routes' },
    { name: 'Role-Based Access', id: 'role-based-access' },
    { name: 'Configuration', id: 'configuration' },
    { name: 'Common Scenarios', id: 'common-scenarios' },
    { name: 'Best Practices', id: 'best-practices' },
    { name: 'Error Handling', id: 'error-handling' },
    { name: 'Further Reading', id: 'further-reading' },
  ];

  // Debounced scroll handler for smooth navigation
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Update active section based on scroll
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
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Handle hash-based navigation
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      scrollToSection(sectionId);
    }
  }, [location.hash]);

  // Smooth scroll to section
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
      {/* Main content */}
      <div className="w-full lg:w-3/4 p-6 lg:pr-16">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold flex items-center">
            <span className="mr-3" aria-hidden="true">🔐</span> Authentication Module
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Secure your Node.js apps with simple, powerful authentication tools
          </p>
          <div className="flex space-x-3 mt-4">
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
        </header>

        {/* Getting Started */}
        <section id="getting-started" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The <code>@voilajsx/appkit</code> Auth module is your go-to tool for adding secure authentication to Node.js applications. Whether you’re building a blog, an e-commerce API, or a dashboard, this module helps you manage user logins, protect routes, and control access with ease. It works smoothly with popular frameworks like Express, Fastify, and Koa, and it’s designed to be both beginner-friendly and powerful for advanced use cases.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Why use this module? It handles the heavy lifting of authentication—things like securely storing passwords, generating tokens, and checking user permissions—so you can focus on building your app. In this guide, we’ll walk you through everything from setup to advanced scenarios, with plenty of examples you can copy and paste.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Ready to secure your app?{' '}
            <a
              href="#installation"
              onClick={() => scrollToSection('installation')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Let’s dive in
            </a>.
          </p>
        </section>

        

        {/* Core Concepts */}
        <section id="core-concepts" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Core Concepts</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Before we jump into coding, let’s explore the key ideas behind the Auth module. Understanding these will help you use it effectively:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              {
                title: 'JWT Tokens',
                desc: 'JWTs (JSON Web Tokens) let you securely send user data between the client and server without storing session data on the server. They’re perfect for APIs and apps that need to scale.',
              },
              {
                title: 'Password Hashing',
                desc: 'Passwords are stored as secure hashes using bcrypt, which protects them even if your database is compromised. The module handles hashing and verification for you.',
              },
              {
                title: 'Middleware',
                desc: 'Middleware functions check if a user is authenticated or has the right permissions before allowing access to a route. Think of them as gatekeepers for your app.',
              },
              {
                title: 'Role-Based Access',
                desc: 'Control what users can do based on their roles (e.g., admin, editor, guest). This makes it easy to restrict sensitive features to authorized users.',
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
            These concepts work together to make authentication secure and flexible. In the next sections, we’ll show you how to put them into practice with real code.
          </p>
        </section>

        {/* Installation */}
        <section id="installation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Setting up the Auth module is quick and straightforward. Follow these steps to get started:
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Install the package</strong>: Run the following command in your project directory:
              <CodeBlock
                code="npm install @voilajsx/appkit"
                language="bash"
                showCopyButton={true}
              />
            </li>
            <li>
              <strong>Import the module</strong>: Use ES Modules to import the Auth functions you need:
              <CodeBlock
                code={`
import { generateToken, verifyToken, hashPassword, createAuthMiddleware } from '@voilajsx/appkit/auth';
                `}
                language="javascript"
                showCopyButton={true}
              />
            </li>
            <li>
              <strong>Prepare your app</strong>: Ensure your Node.js app uses a framework like Express and has a database (e.g., MongoDB, PostgreSQL) for storing user data.
            </li>
          </ol>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The module supports Node.js 14+ and works with both ES Modules and CommonJS. If you’re using CommonJS, replace <code>import</code> with <code>require</code>.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Need more setup help? Check the{' '}
            <a
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>.
          </p>
        </section>

        {/* User Authentication */}
        <section id="user-authentication" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">User Authentication</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Let’s build a secure user authentication system for registering and logging in users. The Auth module makes this easy by handling password hashing and JWT creation. Here’s how to set it up.
          </p>
          <h3 className="text-lg font-semibold mb-3">Registering a User</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            When a user signs up, you need to securely store their password. The <code>hashPassword()</code> function uses bcrypt to create a secure hash. Here’s the process:
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Collect the user’s email and password from your signup form.</li>
            <li>Hash the password using <code>hashPassword()</code>.</li>
            <li>Save the email and hashed password in your database.</li>
          </ol>
          <CodeBlock
            code={`
import { hashPassword } from '@voilajsx/appkit/auth';

async function registerUser(email, password) {
  // Hash the password with 10 salt rounds
  const hashedPassword = await hashPassword(password, 10);
  // Save to database (example uses a generic db)
  await db.users.insert({ email, password: hashedPassword });
  return { success: true, message: 'User registered successfully' };
}
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The <code>10</code> salt rounds provide a good balance of security and speed. For higher security, you can increase this number, but it will slow down the hashing process.
          </p>
          <h3 className="text-lg font-semibold mb-3">Logging In a User</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            For login, verify the user’s password and issue a JWT for authenticated requests. Here’s how:
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Find the user by email in your database.</li>
            <li>Check the password with <code>comparePassword()</code>.</li>
            <li>Generate a JWT with <code>generateToken()</code> if the password is correct.</li>
          </ol>
          <CodeBlock
            code={`
import { comparePassword, generateToken } from '@voilajsx/appkit/auth';

async function loginUser(email, password) {
  // Find user in database
  const user = await db.users.findOne({ email });
  if (!user) throw new Error('User not found');

  // Verify password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) throw new Error('Invalid credentials');

  // Generate JWT
  const token = generateToken(
    { userId: user.id, email: user.email },
    { secret: 'your-secret-key', expiresIn: '24h' }
  );
  return { token };
}
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            The JWT can be sent to the client and stored securely (e.g., in an HTTP-only cookie). Use it in the <code>Authorization</code> header for protected requests.
          </p>
        </section>

        {/* Protecting Routes */}
        <section id="protecting-routes" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Protecting Routes</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To secure your API routes, use middleware to check for valid JWTs. The <code>createAuthMiddleware()</code> function ensures only authenticated users can access protected routes. Here’s how it works:
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Create the middleware with your secret key.</li>
            <li>Apply it to routes you want to protect.</li>
            <li>The middleware verifies the JWT and attaches user data to <code>req.user</code>.</li>
          </ol>
          <CodeBlock
            code={`
import { createAuthMiddleware } from '@voilajsx/appkit/auth';
import express from 'express';

const app = express();
const auth = createAuthMiddleware({ secret: 'your-secret-key' });

// Protect the dashboard route
app.get('/dashboard', auth, (req, res) => {
  res.json({ message: 'Welcome to the dashboard', user: req.user });
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            The middleware expects a JWT in the <code>Authorization</code> header (e.g., <code>Bearer your-token</code>). If the token is invalid or missing, it returns a 401 error.
          </p>
          <h3 className="text-lg font-semibold my-3">Custom Token Extraction</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            By default, the middleware looks for tokens in the <code>Authorization</code> header. To use cookies or custom headers, customize the <code>getToken</code> function:
          </p>
          <CodeBlock
            code={`
import { createAuthMiddleware } from '@voilajsx/appkit/auth';

const auth = createAuthMiddleware({
  secret: 'your-secret-key',
  getToken: (req) => req.cookies.token || req.headers['x-api-key'],
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            This flexibility lets you adapt the middleware to your app’s needs, like supporting API keys or session cookies.
          </p>
        </section>

        {/* Role-Based Access */}
        <section id="role-based-access" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Role-Based Access</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Control what users can do based on their roles (e.g., admin, user). The <code>createAuthorizationMiddleware()</code> function restricts routes to specific roles. Here’s how to set it up:
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Include the user’s role in the JWT payload during login.</li>
            <li>Create middleware to allow only specific roles.</li>
            <li>Apply the middleware to restricted routes.</li>
          </ol>
          <CodeBlock
            code={`
import { generateToken, createAuthorizationMiddleware } from '@voilajsx/appkit/auth';
import express from 'express';

const app = express();

// Generate token with role
const token = generateToken(
  { userId: '123', role: 'admin' },
  { secret: 'your-secret-key' }
);

// Restrict to admins
const adminOnly = createAuthorizationMiddleware({ roles: ['admin'] });
app.get('/admin', adminOnly, (req, res) => {
  res.json({ message: 'Admin access granted' });
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Users without the required role will get a 403 error. You can also allow multiple roles by listing them in the <code>roles</code> array.
          </p>
        </section>

        {/* Configuration */}
        <section id="configuration" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Configuration</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The Auth module is highly customizable. You can tweak token generation, middleware behavior, and more to fit your app. Here are the key options:
          </p>
          <h3 className="text-lg font-semibold mb-3">Token Generation</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Control how JWTs are created with these options:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li><strong>secret</strong>: A secret key for signing tokens (required, keep it secure).</li>
            <li><strong>expiresIn</strong>: How long the token is valid (e.g., '24h' for 24 hours, default: '7d').</li>
            <li><strong>algorithm</strong>: The signing algorithm (e.g., 'HS256', default: 'HS256').</li>
          </ul>
          <CodeBlock
            code={`
import { generateToken } from '@voilajsx/appkit/auth';

const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  {
    secret: 'your-secret-key',
    expiresIn: '24h',
    algorithm: 'HS256',
  }
);
            `}
            language="javascript"
            showCopyButton={true}
          />
          <h3 className="text-lg font-semibold mb-3 mt-6">Middleware</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Customize middleware behavior with these options:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li><strong>secret</strong>: The key for verifying tokens (required).</li>
            <li><strong>getToken</strong>: A function to extract tokens from requests (default: checks headers, cookies, query).</li>
            <li><strong>onError</strong>: A custom error handler (default: returns 401 with JSON error).</li>
          </ul>
          <CodeBlock
            code={`
import { createAuthMiddleware } from '@voilajsx/appkit/auth';

const auth = createAuthMiddleware({
  secret: 'your-secret-key',
  getToken: (req) => req.headers['x-api-key'],
  onError: (error, req, res) => {
    res.status(401).json({ error: 'Please authenticate' });
  },
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            For advanced options, see the{' '}
            <a
              href="https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>.
          </p>
        </section>

        {/* Common Scenarios */}
        <section id="common-scenarios" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Common Scenarios</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Here are detailed examples for everyday authentication tasks you’ll likely need in your app:
          </p>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Password Reset</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Allow users to reset their password securely with a time-limited token:
              </p>
              <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
                <li>Generate a reset token and send it via email.</li>
                <li>Verify the token when the user submits a new password.</li>
                <li>Update the password in the database.</li>
              </ol>
              <CodeBlock
                code={`
import { generateToken, hashPassword } from '@voilajsx/appkit/auth';

async function requestPasswordReset(email) {
  const user = await db.users.findOne({ email });
  if (!user) throw new Error('User not found');

  const resetToken = generateToken(
    { userId: user.id, action: 'reset' },
    { secret: 'reset-secret-key', expiresIn: '1h' }
  );
  // Send resetToken to user via email (use a service like SendGrid)
  await sendEmail(user.email, resetToken', resetToken);
}

async function resetPassword(userId, newPassword) {
  const hashedPassword = await hashPassword(newPassword, 10);
  await db.users.update({ id: 'userId', password: hashedPassword });
}
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Token Refresh</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Keep users logged in by refreshing their access tokens using a long-lived refresh token:
              </p>
              <ol className="list-decimal pl-5 mb-4 text-gray-700 text-dark-gray-300 dark:text-gray-300">
                <li>Verify the refresh token.</li>
                <li>Generate a new access token.</li>
                <li>Return the new token to the client.</li>
              </ol>
              <CodeBlock
                code={`
import { generateToken, verifyToken } from '@voilajsx/appkit/auth';

async function refreshToken(refreshToken) {
  try {
    // Verify refresh token
    const payload = await verifyToken(refreshToken, { secret: 'your-refresh-secret' });
    // Generate new access token
    const newAccessToken = generateToken(
      { userId: payload.userId },
      { secret: 'your-secret-key', expiresIn: '15m' }
    );
    return { accessToken: newAccessToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Email Verification</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Ensure users verify their email before accessing your app:
              </p>
              <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
                <li>Generate a verification token during registration.</li>
                <li>Send the token via email.</li>
                <li>Verify the token when the user clicks the link.</li>
              </ol>
              <CodeBlock
                code={`
import { generateToken, verifyToken } from '@voilajsx/appkit/auth';

async function sendVerificationEmail(email) {
  const user = await db.users.findOne({ email });
  if (!user) throw new Error('User not found');

  const verificationToken = generateToken(
    { userId: user.id, action: 'verify-email' },
    { secret: 'verify-secret-key', expiresIn: '1d' }
  );
  // Send email with verification link
  await sendEmail(email, 'Verify your email', \`/verify?token=\${verificationToken}\`);
}

async function verifyEmail(token) {
  try {
    const payload = await verifyToken(token, { secret: 'verify-secret-key' });
    await db.users.update({ id: payload.userId }, { verified: true });
    return { success: true, message: 'Email verified' };
  } catch (error) {
    throw new Error('Invalid verification token');
  }
}
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section id="best-practices" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Follow these tips to keep your authentication system secure and user-friendly:
          </p>
          <ul className="space-y-3 list-disc pl-5 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Store Secrets Safely:</strong> Use environment variables (<code>.env</code> files) for sensitive data like token secrets to prevent accidental exposure in your code.
            </li>
            <li>
              <strong>Use HTTPS:</strong> Always enable HTTPS in production to encrypt data in transit and protect tokens from being intercepted.
            </li>
            <li>
              <strong>Limit Token Lifespan:</strong> Set short expiration times for JWTs (e.g., 24 hours) to reduce the risk if a token is stolen. Use refresh tokens for longer sessions.
            </li>
            <li>
              <strong>Enforce Strong Passwords:</strong> Require passwords to be at least 8 characters with a mix of letters, numbers, and symbols to improve security.
            </li>
            <li>
              <strong>Keep Errors Vague:</strong> Use generic error messages like “Invalid credentials” for failed logins to avoid giving hackers useful information.
            </li>
            <li>
              <strong>Monitor and Log:</strong> Log authentication attempts and errors (without sensitive data) to detect suspicious activity early.
            </li>
          </ul>
        </section>

        {/* Error Handling */}
        <section id="error-handling" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Proper error handling keeps your app secure and improves the user experience. The Auth module throws clear errors for common issues like invalid tokens or incorrect passwords. Here’s how to handle them:
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Catch errors from Auth module functions like <code>verifyToken()</code>.</li>
            <li>Check the error message to identify the issue (e.g., expired token).</li>
            <li>Return user-friendly responses without exposing sensitive details.</li>
          </ol>
          <CodeBlock
            code={`
import { verifyToken } from '@voilajsx/appkit/auth';

try {
  const payload = await verifyToken(token, { secret: 'your-secret-key' });
  // Proceed with request
} catch (error) {
  if (error.message === 'Token has expired') {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
  return res.status(401).json({ error: 'Invalid token. Please authenticate.' });
}
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Always log errors internally for debugging, but keep user-facing messages generic to avoid leaking information.
          </p>
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
                url: 'https://github.com/voilajsx/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md',
              },
              {
                title: 'API Reference',
                desc: 'Complete documentation of all Auth module functions and options',
                url: 'https://github.com/voilajsx/appkit/blob/main/src/auth/docs/API_REFERENCE.md',
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