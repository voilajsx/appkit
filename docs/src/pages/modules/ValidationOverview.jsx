import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '@/components/ui/CodeBlock';
import { useLocation } from 'react-router-dom';

/**
 * Validation Module Overview for @voilajsx/appkit
 * A clear, practical guide to validating and sanitizing data in Node.js apps
 */
function ValidationOverview() {
  const [activeSection, setActiveSection] = useState('introduction');
  const location = useLocation();

  // Table of Contents (unchanged for consistency with Auth module)
  const sections = [
    { name: 'Introduction', id: 'introduction' },
    { name: 'Getting Started', id: 'getting-started' },
    { name: 'Core Concepts', id: 'core-concepts' },
    { name: 'Installation', id: 'installation' },
    { name: 'Data Validation', id: 'data-validation' },
    { name: 'Data Sanitization', id: 'data-sanitization' },
    { name: 'Schema Management', id: 'schema-management' },
    { name: 'Error Handling', id: 'error-handling' },
    { name: 'Best Practices', id: 'best-practices' },
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
            <span className="mr-3" aria-hidden="true">✅</span> Validation Module
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Safeguard your Node.js app’s data with simple, powerful validation tools
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

        {/* Introduction */}
        <section id="introduction" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Welcome to the Validation Module</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The <code>@voilajsx/appkit</code> Validation module is like a gatekeeper for your Node.js app, ensuring that data entering your system—whether from web forms, APIs, or file uploads—is correct, safe, and reliable. It helps you avoid errors, protect against security threats, and keep your app running smoothly.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Imagine you’re building a signup form or an API endpoint. This module lets you check if emails are valid, passwords are strong, or numbers are within range, all with minimal code. It works seamlessly with frameworks like Express, Fastify, or Koa, making it a great fit for any Node.js project, whether you’re just starting out or scaling up.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            With features like data validation, sanitization, and reusable schemas, you’ll save time and build confidence in your app’s data. This guide will walk you through setup, key features, and practical examples to get you started.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Let’s make your data rock-solid! Begin with{' '}
            <a
              href="#getting-started"
              onClick={() => scrollToSection('getting-started')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Getting Started
            </a>.
          </p>
        </section>

        {/* Getting Started */}
        <section id="getting-started" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The Validation module, part of <code>@voilajsx/appkit</code>, is your toolkit for checking and cleaning data in Node.js apps. Whether you’re validating user registrations, API payloads, or form inputs, it’s designed to be straightforward and effective, like a trusty filter for your data.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To start, you’ll need:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Node.js 14 or higher (run <code>node -v</code> to check).</li>
            <li>A Node.js project set up with npm or yarn.</li>
            <li>Basic JavaScript knowledge (objects, functions).</li>
            <li>Optional: A framework like Express for handling inputs.</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Here’s a quick example to validate a user signup form with email and password:
          </p>
          <CodeBlock
            code={`
import { validate } from '@voilajsx/appkit/validation';

const userSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', email: true },
    password: { type: 'string', minLength: 6 },
  },
  required: ['email', 'password'],
};

const userData = { email: 'user@example.com', password: 'secure123' };
const result = validate(userData, userSchema);

console.log(result.valid ? 'Ready to sign up!' : result.errors);
            `}
            language="javascript"
            showCopyButton={true}
          />
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Pro Tip</strong>: Validate data early, like when it enters your app, to catch issues before they cause problems.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Ready to install? Head to the{' '}
            <a
              href="#installation"
              onClick={() => scrollToSection('installation')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Installation
            </a>{' '}
            section.
          </p>
        </section>

        {/* Core Concepts (unchanged) */}
        <section id="core-concepts" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Core Concepts</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Before diving into the code, let’s explore the key ideas behind the Validation module. Understanding these will help you keep your app’s data safe and reliable:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              {
                title: 'Data Validation',
                desc: 'Validation checks if your data follows the rules, like ensuring an email is valid or a password is strong. It’s like a bouncer making sure only the right data gets into your app.',
              },
              {
                title: 'Data Sanitization',
                desc: 'Sanitization cleans up data by removing harmful content, like rogue HTML or extra spaces. Think of it as a filter that keeps your data safe and tidy.',
              },
              {
                title: 'Schema Management',
                desc: 'Schemas are reusable blueprints that define how data should look. They ensure consistent validation across your app, like a recipe for perfect data every time.',
              },
              {
                title: 'Error Handling',
                desc: 'When data doesn’t pass validation, clear error messages guide users to fix issues. It’s like a friendly coach helping you correct mistakes.',
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
            These concepts make data validation simple and secure. In the next sections, we’ll show you how to apply them with practical examples.
          </p>
        </section>

        {/* Installation */}
        <section id="installation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Installing the Validation module is like adding a sturdy lock to your Node.js app’s data. It takes just a few steps to get started, and it works with any Node.js project, including those using Express or other frameworks.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Here’s how to set it up:
          </p>
          <ol className="list-decimal pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>
              Install the package:
              <CodeBlock
                code="npm install @voilajsx/appkit"
                language="bash"
                showCopyButton={true}
              />
            </li>
            <li>
              Import the validation tools:
              <CodeBlock
                code="import { validate, sanitize, createSchema } from '@voilajsx/appkit/validation';"
                language="javascript"
                showCopyButton={true}
              />
            </li>
            <li>
              Optional: If using Express, add middleware to parse JSON inputs:
              <CodeBlock
                code="app.use(express.json());"
                language="javascript"
                showCopyButton={true}
              />
            </li>
          </ol>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To confirm it’s working, try this test:
          </p>
          <CodeBlock
            code={`
import { validate } from '@voilajsx/appkit/validation';
const result = validate('test@example.com', { type: 'string', email: true });
console.log(result.valid ? 'Success!' : result.errors);
            `}
            language="javascript"
            showCopyButton={true}
          />
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Gotcha</strong>: Ensure Node.js is version 14 or higher, or you may see compatibility errors.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Now you’re set! Explore{' '}
            <a
              href="#data-validation"
              onClick={() => scrollToSection('data-validation')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Data Validation
            </a>{' '}
            to start checking your data.
          </p>
        </section>

        {/* Data Validation */}
        <section id="data-validation" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Data Validation</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Data validation is like a checkpoint that ensures user inputs, such as form submissions or API requests, follow your app’s rules. It’s essential for keeping your app secure and reliable, whether you’re validating emails, numbers, or custom formats.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Here’s how to validate a user form in an Express app, ensuring a valid email and strong password:
          </p>
          <CodeBlock
            code={`
import express from 'express';
import { validate } from '@voilajsx/appkit/validation';

const app = express();
app.use(express.json());

const userSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', email: true },
    password: { type: 'string', minLength: 8 },
  },
  required: ['email', 'password'],
};

app.post('/signup', (req, res) => {
  const result = validate(req.body, userSchema);
  if (result.valid) {
    res.json({ message: 'User validated!', data: result.value });
  } else {
    res.status(400).json({ errors: result.errors });
  }
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            This checks the form data and returns errors if the email is invalid or the password is too short, making it easy to protect your signup endpoint.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Pro Tip</strong>: Validate data at your app’s entry points, like API routes, to catch issues early.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Next, clean your data with{' '}
            <a
              href="#data-sanitization"
              onClick={() => scrollToSection('data-sanitization')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Data Sanitization
            </a>.
          </p>
        </section>

        {/* Data Sanitization */}
        <section id="data-sanitization" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Data Sanitization</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Sanitization is like a filter that cleans up user inputs to remove harmful or unwanted content, such as malicious HTML or extra spaces. It’s a key step to protect your app from security risks and ensure data consistency.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            For example, when users submit a profile form, you can clean their name and bio to keep the data safe and tidy:
          </p>
          <CodeBlock
            code={`
import { sanitize } from '@voilajsx/appkit/validation';

const rawInput = {
  name: '  John <script>Doe</script>  ',
  bio: ' Loves coding!!  ',
};

const cleanInput = sanitize(rawInput, {
  name: { trim: true, stripTags: true },
  bio: { trim: true, stripTags: true },
});

console.log(cleanInput);
// { name: 'John Doe', bio: 'Loves coding!!' }
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            This removes harmful tags and extra spaces, making the data safe for storage or display.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Gotcha</strong>: Always sanitize before validating to ensure you’re checking clean data.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Want to reuse validation rules? Check out{' '}
            <a
              href="#schema-management"
              onClick={() => scrollToSection('schema-management')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Schema Management
            </a>.
          </p>
        </section>

        {/* Schema Management */}
        <section id="schema-management" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Schema Management</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Schemas are like blueprints that define how your data should look, making it easy to validate consistently across your app. They’re perfect for reusing rules, such as for user profiles or product entries.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Here’s how to create a schema for a user profile:
          </p>
          <CodeBlock
            code={`
import { createSchema } from '@voilajsx/appkit/validation';

const profileSchema = createSchema({
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 20 },
    age: { type: 'number', minimum: 18 },
  },
  required: ['username'],
});

const profile = { username: 'john_doe', age: 25 };
const result = validate(profile, profileSchema);

console.log(result.valid ? 'Profile valid!' : result.errors);
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            This schema ensures usernames are valid and ages are appropriate, saving you time by reusing the rules elsewhere.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Pro Tip</strong>: Save schemas in a separate file (e.g., <code>schemas.js</code>) to share them across your app.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Learn how to handle issues in{' '}
            <a
              href="#error-handling"
              onClick={() => scrollToSection('error-handling')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Error Handling
            </a>.
          </p>
        </section>

        {/* Error Handling */}
        <section id="error-handling" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            When data fails validation, the module provides clear error messages to help users fix their inputs, like a friendly guide pointing out mistakes. This is crucial for creating a smooth user experience in forms or APIs.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Here’s how to handle errors in an Express API for a signup form:
          </p>
          <CodeBlock
            code={`
import express from 'express';
import { validate } from '@voilajsx/appkit/validation';

const app = express();
app.use(express.json());

const schema = {
  type: 'object',
  properties: {
    email: { type: 'string', email: true },
  },
  required: ['email'],
};

app.post('/signup', (req, res) => {
  const result = validate(req.body, schema);
  if (!result.valid) {
    const errors = result.errors.map(err => ({
      field: err.path,
      message: err.message,
    }));
    return res.status(400).json({ errors });
  }
  res.json({ message: 'Valid email!' });
});
            `}
            language="javascript"
            showCopyButton={true}
          />
          <p className="text-gray-700 dark:text-gray-300 mb-4">
  This returns a user-friendly error like{' '}
  <code>
    &#123;&quot;errors&quot;: [&#123;&quot;field&quot;: &quot;email&quot;, &quot;message&quot;: &quot;must be a valid email address&quot;&#125;]&#125;
  </code>
  , helping users correct their input.
</p>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Pro Tip</strong>: Use clear error messages to guide users, like “Please enter a valid email.”
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Improve your validation with{' '}
            <a
              href="#best-practices"
              onClick={() => scrollToSection('best-practices')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Best Practices
            </a>.
          </p>
        </section>

        {/* Best Practices */}
        <section id="best-practices" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To get the most out of the Validation module, follow these tips to keep your app secure, efficient, and user-friendly, like a well-oiled machine.
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li><strong>Sanitize First</strong>: Clean data before validating to avoid processing unsafe inputs.</li>
            <li><strong>Use Simple Schemas</strong>: Create focused schemas for specific tasks, like signups or updates.</li>
            <li><strong>Validate Early</strong>: Check data at entry points, such as API routes or forms, to catch errors fast.</li>
            <li><strong>Make Errors Clear</strong>: Provide user-friendly error messages to help users fix issues.</li>
            <li><strong>Test Your Schemas</strong>: Try sample data to ensure your schemas catch the right errors.</li>
          </ul>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Gotcha</strong>: Overly strict schemas can frustrate users, so balance rules with flexibility.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Dive deeper with{' '}
            <a
              href="#further-reading"
              onClick={() => scrollToSection('further-reading')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Further Reading
            </a>.
          </p>
        </section>

        {/* Further Reading */}
        <section id="further-reading" className="mb-12 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Further Reading</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Ready to level up? These resources offer more insights into the Validation module and its features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Developer Reference',
                desc: 'A detailed guide with examples for using the Validation module effectively.',
                url: 'https://github.com/voilajsx/appkit/blob/main/src/validation/docs/DEVELOPER_REFERENCE.md',
              },
              {
                title: 'API Reference',
                desc: 'Complete documentation of all functions and their options.',
                url: 'https://github.com/voilajsx/appkit/blob/main/src/validation/docs/API_REFERENCE.md',
              },
              {
                title: 'GitHub Repository',
                desc: 'Explore the source code and find additional examples for @voilajsx/appkit.',
                url: 'https://github.com/voilajsx/appkit',
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

export default ValidationOverview;