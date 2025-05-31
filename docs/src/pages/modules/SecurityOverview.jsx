import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '@/components/ui/CodeBlock';
import { useLocation } from 'react-router-dom';

/**
 * Security Module Overview page for @voilajsx/appkit documentation
 * A clear guide to securing Node.js apps with practical examples
 */
function SecurityReference() {
  const [activeSection, setActiveSection] = useState('introduction');
  const location = useLocation();

  // Table of Contents sections
  const sections = [
    { name: 'Getting Started', id: 'getting-started' },
    { name: 'Core Features', id: 'core-features' },
    { name: 'Setup', id: 'setup' },
    { name: 'CSRF Protection', id: 'csrf-protection' },
    { name: 'Rate Limiting', id: 'rate-limiting' },
    { name: 'Input Sanitization', id: 'input-sanitization' },
    { name: 'Data Encryption', id: 'data-encryption' },
    { name: 'Common Use Cases', id: 'common-use-cases' },
    { name: 'Best Practices', id: 'best-practices' },
    { name: 'Error Handling', id: 'error-handling' },
    { name: 'Further Reading', id: 'further-reading' },
  ];

  // Debounced scroll handler
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Update active section on scroll
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
            <span className="mr-3" aria-hidden="true">🔒</span> Security Module
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Defend your Node.js apps with simple, robust security tools
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
                The <code>@voilajsx/appkit</code> Security module helps you safeguard your application from common web threats like CSRF, XSS, brute-force attacks, and data exposure. It works seamlessly with Express, Fastify, and Koa, and is designed to make security implementation simple—without compromising on best practices.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                With built-in support for CSRF protection, request rate limiting, input sanitization, and AES-256-GCM encryption, this module makes it easier to enforce secure defaults across your routes, forms, and APIs. It’s especially useful when handling user input, file uploads, and any sensitive information.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                Whether you're working on a hobby project or deploying a full-scale production app, this guide will walk you through essential features, setup instructions, and real-world examples to help you secure your app effectively.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                Ready to get started?{' '}
                <a
                href="#installation"
                onClick={() => scrollToSection('installation')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                Let’s begin
                </a>.
            </p>
            </section>

       

        {/* Core Features */}
        <section id="core-features" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Core Features</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The Security Module provides four key tools to protect your app:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              {
                title: 'CSRF Protection',
                desc: 'Uses secure tokens to verify form submissions, preventing malicious requests from other sites.',
              },
              {
                title: 'Rate Limiting',
                desc: 'Controls request frequency to block brute force and DoS attacks on your APIs.',
              },
              {
                title: 'Input Sanitization',
                desc: 'Cleans user inputs to stop XSS and injection attacks, ensuring safe data handling.',
              },
              {
                title: 'Data Encryption',
                desc: 'Secures sensitive data with AES-256-GCM encryption for confidentiality and integrity.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            These features form a solid defense. Let’s dive into each one next.
          </p>
        </section>

        {/* Setup */}
        <section id="setup" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Setup</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Setting up the Security Module is quick and straightforward. Follow these steps to get started:
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Install the package</strong>: Add the module to your project:
              <CodeBlock
                code="npm install @voilajsx/appkit express express-session"
                language="bash"
                showCopyButton={true}
              />
            </li>
            <li>
              <strong>Import security functions</strong>: Use ES Modules to access the tools:
              <CodeBlock
                code={`
import { generateCsrfToken, createCsrfMiddleware, createRateLimiter, sanitizeHtml, encrypt } from '@voilajsx/appkit/security';
                `}
                language="javascript"
                showCopyButton={true}
              />
            </li>
            <li>
              <strong>Configure your app</strong>: Set up Express with session middleware for CSRF protection.
            </li>
          </ol>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The module supports Node.js 14+ and works with ES Modules or CommonJS (use <code>require</code> for CommonJS).
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            For more details, see the{' '}
            <a
              href="https://github.com/voilajs/appkit/blob/main/src/security/docs/DEVELOPER_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Developer Reference
            </a>.
          </p>
        </section>

        {/* CSRF Protection */}
        <section id="csrf-protection" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">CSRF Protection</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Cross-site request forgery (CSRF) protection acts like a gatekeeper, ensuring form submissions come from your app. The Security Module uses cryptographically secure tokens to verify requests.
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Configure session middleware for stateful CSRF.</li>
            <li>Apply <code>createCsrfMiddleware</code> to POST/PUT/DELETE routes.</li>
            <li>Generate tokens with <code>generateCsrfToken</code> for forms.</li>
          </ol>
          <CodeBlock
            code={`
import express from 'express';
import session from 'express-session';
import { generateCsrfToken, createCsrfMiddleware } from '@voilajsx/appkit/security';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-super-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'Lax' }
}));
app.use(createCsrfMiddleware());

app.get('/form', (req, res) => {
  const csrfToken = generateCsrfToken(req.session);
  res.send(\`
    <form method="POST" action="/submit">
      <input type="hidden" name="_csrf" value="\${csrfToken}">
      <input name="message" required>
      <button>Submit</button>
    </form>
  \`);
});

app.post('/submit', (req, res) => {
  res.json({ message: 'Form submitted successfully' });
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Invalid tokens trigger a 403 error, covered in <a href="#error-handling" onClick={() => scrollToSection('error-handling')} className="text-blue-600 dark:text-blue-400 hover:underline">Error Handling</a>.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mt-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Pro Tip</strong>: Use the <code>headerField</code> option to send CSRF tokens via headers for API requests.
            </p>
          </div>
        </section>

        {/* Rate Limiting */}
        <section id="rate-limiting" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Rate Limiting</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Rate limiting protects your APIs from abuse, like a bouncer at a club. It restricts how many requests a client can make in a time window, preventing brute force or DoS attacks.
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Create a limiter with <code>createRateLimiter</code>.</li>
            <li>Apply it to specific routes or globally.</li>
            <li>Handle 429 errors for exceeded limits.</li>
          </ol>
          <CodeBlock
            code={`
import express from 'express';
import { createRateLimiter } from '@voilajsx/appkit/security';

const app = express();
const limiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later'
});

app.use('/api', limiter);
app.get('/api/data', (req, res) => {
  res.json({ data: 'Protected endpoint' });
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            This limits clients to 100 requests every 15 minutes per IP.
          </p>
        </section>

        {/* Input Sanitization */}
        <section id="input-sanitization" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Input Sanitization</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Input sanitization acts like a filter, cleaning user inputs to prevent XSS and injection attacks. The Security Module provides tools to safely handle text, HTML, and filenames.
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Use <code>escapeString</code> for plain text display.</li>
            <li>Use <code>sanitizeHtml</code> for limited HTML (e.g., comments).</li>
            <li>Use <code>sanitizeFilename</code> for safe file uploads.</li>
          </ol>
          <CodeBlock
            code={`
import express from 'express';
import { escapeString, sanitizeHtml, sanitizeFilename } from '@voilajsx/appkit/security';

const app = express();
app.use(express.json());

app.post('/comment', (req, res) => {
  const { comment, username, filename } = req.body;
  const safeComment = sanitizeHtml(comment || '', {
    allowedTags: ['p', 'b', 'i', 'a'],
    allowedAttributes: { 'a': ['href'] }
  });
  const safeUsername = escapeString(username?.trim() || '');
  const safeFilename = sanitizeFilename(filename || '');

  // Save to database
  // await db.comments.insert({ username: safeUsername, comment: safeComment, file: safeFilename });
  res.json({ username: safeUsername, comment: safeComment, file: safeFilename });
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mt-4">
  <strong>Output</strong>: Input <code>username: "&lt;script&gt;alert('xss')&lt;/script&gt;"</code>, <code>comment: "&lt;p&gt;Hello&lt;/p&gt;"</code>, <code>filename: "../../etc/passwd"</code> becomes:
</p>
<pre className="bg-gray-100 dark:bg-gray-800 text-sm rounded p-4 mt-2 overflow-x-auto text-gray-800 dark:text-gray-200">
  <code>{`{
  "username": "<script>alert('xss')</script>",
  "comment": "<p>Hello</p>",
  "file": "etc_passwd"
}`}</code>
</pre>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mt-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Gotcha</strong>: Always sanitize inputs before validation to catch malicious content early.
            </p>
          </div>
        </section>

        {/* Data Encryption */}
        <section id="data-encryption" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Data Encryption</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Data encryption is like a vault, securing sensitive information (e.g., emails, SSNs) with AES-256-GCM for confidentiality and integrity.
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Generate or load a secure encryption key.</li>
            <li>Encrypt data with <code>encrypt</code>, optionally using associated data (AAD).</li>
            <li>Decrypt data with <code>decrypt</code> when needed.</li>
          </ol>
          <CodeBlock
            code={`
import express from 'express';
import { generateEncryptionKey, encrypt, decrypt } from '@voilajsx/appkit/security';

const app = express();
app.use(express.json());
const key = process.env.ENCRYPTION_KEY || generateEncryptionKey();

app.post('/user', async (req, res) => {
  const { ssn } = req.body;
  const encryptedSSN = encrypt(ssn, key, 'user_data');
  // Save to database
  // await db.users.insert({ id: 'userId', ssn: encryptedSSN });
  res.json({ message: 'Data saved' });
});

app.get('/user', async (req, res) => {
  // Fetch from database
  const user = { ssn: encryptedSSN }; // Example
  try {
    const ssn = decrypt(user.ssn, key, 'user_data');
    res.json({ ssn });
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mt-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Pro Tip</strong>: Use associated data (AAD) to bind encrypted data to a specific context, like a user ID.
            </p>
          </div>
        </section>

        {/* Common Use Cases */}
        <section id="common-use-cases" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Common Use Cases</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Here are practical examples to secure your app in real-world scenarios:
          </p>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Securing a Contact Form</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Prevent forged form submissions with CSRF protection:
              </p>
              <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
                <li>Generate a CSRF token.</li>
                <li>Apply CSRF middleware.</li>
                <li>Process valid submissions.</li>
              </ol>
              <CodeBlock
                code={`
import express from 'express';
import session from 'express-session';
import { generateCsrfToken, createCsrfMiddleware } from '@voilajsx/appkit/security';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: false }));
app.use(createCsrfMiddleware());

app.get('/contact', (req, res) => {
  const csrfToken = generateCsrfToken(req.session);
  res.send(\`
    <form method="POST" action="/contact">
      <input type="hidden" name="_csrf" value="\${csrfToken}">
      <input name="message" required>
      <button>Send</button>
    </form>
  \`);
});

app.post('/contact', (req, res) => {
  res.json({ message: 'Message received' });
});
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Protecting a Public API</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Limit API requests to prevent abuse:
              </p>
              <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
                <li>Configure a rate limiter.</li>
                <li>Apply it to API routes.</li>
                <li>Return data for valid requests.</li>
              </ol>
              <CodeBlock
                code={`
import express from 'express';
import { createRateLimiter } from '@voilajsx/appkit/security';

const app = express();
const limiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: 'Too many requests'
});

app.use('/api', limiter);
app.get('/api/data', (req, res) => {
  res.json({ data: 'Protected data' });
});
                `}
                language="javascript"
                showCopyButton={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Encrypting Sensitive Data</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Securely store sensitive user data:
              </p>
              <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
                <li>Encrypt data with a key.</li>
                <li>Store the encrypted data.</li>
                <li>Decrypt when needed.</li>
              </ol>
              <CodeBlock
                code={`
import express from 'express';
import { generateEncryptionKey, encrypt, decrypt } from '@voilajsx/appkit/security';

const app = express();
app.use(express.json());
const key = process.env.ENCRYPTION_KEY || generateEncryptionKey();

app.post('/user', async (req, res) => {
  const { email } = req.body;
  const encryptedEmail = encrypt(email, key, 'user_profile');
  // Save to database
  // await db.users.insert({ id: 'userId', email: encryptedEmail });
  res.json({ message: 'Data saved' });
});

app.get('/user', async (req, res) => {
  // Fetch from database
  const user = { email: encryptedEmail }; // Example
  try {
    const email = decrypt(user.email, key, 'user_profile');
    res.json({ email });
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});
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
            Follow these tips to keep your app secure, like maintaining a fortified vault:
          </p>
          <ul className="space-y-3 list-disc pl-5 text-gray-700 dark:text-gray-300">
            <li><strong>Use HTTPS</strong>: Enable HTTPS in production to protect data in transit.</li>
            <li><strong>Secure Secrets</strong>: Store encryption keys and session secrets in environment variables.</li>
            <li><strong>Layered Defense</strong>: Combine CSRF, rate limiting, and sanitization for robust protection.</li>
            <li><strong>Server-Side Validation</strong>: Always validate inputs on the server.</li>
            <li><strong>Stay Updated</strong>: Keep dependencies patched for security fixes.</li>
            <li><strong>Generic Errors</strong>: Avoid leaking implementation details in error messages.</li>
          </ul>
        </section>

        {/* Error Handling */}
        <section id="error-handling" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Handle security errors gracefully to maintain security and user trust. The Security Module provides clear error codes for common issues:
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Catch errors from middleware or functions.</li>
            <li>Check error codes like <code>EBADCSRFTOKEN</code> or 429.</li>
            <li>Return vague, user-friendly messages.</li>
          </ol>
          <CodeBlock
            code={`
import express from 'express';
import session from 'express-session';
import { createCsrfMiddleware, createRateLimiter } from '@voilajsx/appkit/security';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: false }));
app.use(createCsrfMiddleware());
app.use('/api', createRateLimiter({ windowMs: 60 * 60 * 1000, max: 100 }));

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid form submission. Please try again.' });
  }
  if (err.code === 'ENOSESSION') {
    return res.status(500).json({ error: 'Server error: Session not configured.' });
  }
  if (err.statusCode === 429) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }
  next(err);
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mt-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Gotcha</strong>: Log errors internally for debugging, but keep user-facing messages generic.
            </p>
          </div>
        </section>

        {/* Further Reading */}
        <section id="further-reading" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Further Reading</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Dive deeper with these resources:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Developer Reference',
                desc: 'Detailed implementation guide with examples',
                url: 'https://github.com/voilajs/appkit/blob/main/src/security/docs/DEVELOPER_REFERENCE.md',
              },
              {
                title: 'API Reference',
                desc: 'Complete documentation of Security Module functions',
                url: 'https://github.com/voilajs/appkit/blob/main/src/security/docs/API_REFERENCE.md',
              },
              {
                title: 'LLM Prompt Reference',
                desc: 'Guide for AI-assisted secure code generation',
                url: 'https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md',
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
          <p className="text-gray-700 dark:text-gray-300 text-center mt-6">
            Built with ❤️ in India by the{' '}
            <a
              href="https://github.com/orgs/voilajsx/people"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              VoilaJSX Team
            </a>
          </p>
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

export default SecurityReference;