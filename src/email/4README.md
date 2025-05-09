# Email Module

The email module provides a unified interface for sending emails across multiple
providers, including SMTP, AWS SES, SendGrid, Mailgun, and MailHog for local
testing. It offers a consistent API with template support, making it easy to
switch between providers without changing your application code.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Email Providers](#email-providers)
  - [Template System](#template-system)
  - [Testing Emails](#testing-emails)
- [Basic Usage](#basic-usage)
  - [Initialization](#initialization)
  - [Sending Emails](#sending-emails)
  - [Using Templates](#using-templates)
  - [Attachments](#attachments)
- [Provider Configuration](#provider-configuration)
  - [SMTP](#smtp)
  - [AWS SES](#aws-ses)
  - [SendGrid](#sendgrid)
  - [Mailgun](#mailgun)
  - [MailHog (Testing)](#mailhog-testing)
- [Advanced Features](#advanced-features)
  - [Custom Headers](#custom-headers)
  - [CC and BCC](#cc-and-bcc)
  - [Reply-To](#reply-to)
  - [Bulk Sending](#bulk-sending)
- [Template System](#template-system-1)
  - [Basic Variables](#basic-variables)
  - [Nested Objects](#nested-objects)
  - [Conditionals](#conditionals)
  - [Loops](#loops)
- [Testing Strategies](#testing-strategies)
  - [Local Development](#local-development)
  - [CI/CD](#cicd)
  - [Integration Testing](#integration-testing)
- [Integration Patterns](#integration-patterns)
  - [Express Integration](#express-integration)
  - [Queue Integration](#queue-integration)
  - [Email Verification](#email-verification)
  - [Password Reset](#password-reset)
- [Best Practices](#best-practices)
- [Real-World Examples](#real-world-examples)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Introduction

The email module addresses common email sending challenges:

- **Provider Agnostic**: Switch between email providers without changing code
- **Template Support**: Built-in template engine with variables and logic
- **Testing Ready**: MailHog integration for local development
- **Error Handling**: Consistent error messages across providers
- **Type Safety**: Full TypeScript support
- **Extensible**: Easy to add custom providers

## Installation

```bash
npm install @voilajs/appkit
```

For specific providers, install their dependencies:

```bash
# For SES
npm install @aws-sdk/client-ses

# For SendGrid
npm install @sendgrid/mail

# For Mailgun
npm install mailgun.js form-data

# For SMTP (including MailHog)
npm install nodemailer
```

## Quick Start

```javascript
import { initEmail, sendEmail } from '@voilajs/appkit/email';

// Initialize email provider
await initEmail('smtp', {
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password',
  },
});

// Send an email
await sendEmail(
  'recipient@example.com',
  'Welcome!',
  '<h1>Welcome to our service!</h1>'
);
```

## Core Concepts

### Email Providers

The module supports multiple email providers:

- **SMTP**: Universal protocol, works with any email server
- **AWS SES**: Amazon's email service, cost-effective at scale
- **SendGrid**: Popular email API with advanced features
- **Mailgun**: Developer-friendly email service
- **MailHog**: Local email testing server

### Template System

Built-in template engine supporting:

- Variable substitution: `{{variable}}`
- Nested objects: `{{user.name}}`
- Conditionals: `{{#if condition}}...{{/if}}`
- Loops: `{{#each items}}...{{/each}}`

### Testing Emails

MailHog integration for local development:

- Catches all emails locally
- Web UI to view emails
- No external services needed
- Perfect for development and testing

## Basic Usage

### Initialization

```javascript
import { initEmail } from '@voilajs/appkit/email';

// SMTP (Gmail, Outlook, etc.)
await initEmail('smtp', {
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'email@gmail.com',
    pass: 'app-password',
  },
});

// AWS SES
await initEmail('ses', {
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// SendGrid
await initEmail('sendgrid', {
  apiKey: process.env.SENDGRID_API_KEY,
});

// Mailgun
await initEmail('mailgun', {
  apiKey: process.env.MAILGUN_API_KEY,
  domain: 'your-domain.com',
});

// MailHog (for testing)
await initEmail('mailhog');
```

### Sending Emails

```javascript
import { sendEmail } from '@voilajs/appkit/email';

// Simple HTML email
await sendEmail(
  'user@example.com',
  'Welcome to Our Service',
  '<h1>Welcome!</h1><p>Thanks for signing up.</p>'
);

// With additional options
await sendEmail(
  'user@example.com',
  'Your Order Confirmation',
  '<h1>Order #12345</h1>',
  {
    from: 'orders@mycompany.com',
    replyTo: 'support@mycompany.com',
    cc: 'manager@mycompany.com',
    attachments: [
      {
        filename: 'invoice.pdf',
        content: invoiceBuffer,
      },
    ],
  }
);

// Plain text email
await sendEmail('user@example.com', 'Password Reset', null, {
  text: 'Click here to reset your password: https://...',
});
```

### Using Templates

```javascript
import { sendTemplatedEmail } from '@voilajs/appkit/email';

const template = `
  <h1>Welcome, {{name}}!</h1>
  <p>Your account has been created.</p>
  
  {{#if isPremium}}
    <p>Thank you for choosing our premium plan!</p>
  {{/if}}
  
  <h2>Your subscription includes:</h2>
  <ul>
  {{#each features}}
    <li>{{this}}</li>
  {{/each}}
  </ul>
`;

await sendTemplatedEmail(
  'user@example.com',
  'Welcome to Our Service',
  template,
  {
    name: 'John Doe',
    isPremium: true,
    features: ['Unlimited storage', '24/7 support', 'Advanced analytics'],
  }
);
```

### Attachments

```javascript
// File attachment
await sendEmail(
  'user@example.com',
  'Invoice',
  'Please find attached invoice.',
  {
    attachments: [
      {
        filename: 'invoice.pdf',
        content: fs.readFileSync('./invoice.pdf'),
        contentType: 'application/pdf',
      },
    ],
  }
);

// String as attachment
await sendEmail('user@example.com', 'Report', 'Please find attached report.', {
  attachments: [
    {
      filename: 'report.txt',
      content: 'This is the report content',
      contentType: 'text/plain',
    },
  ],
});

// Base64 attachment
await sendEmail('user@example.com', 'Image', 'Please find attached image.', {
  attachments: [
    {
      filename: 'image.png',
      content: base64ImageData,
      encoding: 'base64',
      contentType: 'image/png',
    },
  ],
});
```

## Provider Configuration

### SMTP

Works with any SMTP server including Gmail, Outlook, Yahoo, and custom servers.

```javascript
await initEmail('smtp', {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password', // Use app-specific password
  },
  // Optional settings
  pool: true, // Use connection pooling
  maxConnections: 5, // Maximum simultaneous connections
  maxMessages: 100, // Maximum messages per connection
  tls: {
    rejectUnauthorized: true, // Verify server certificate
  },
});

// Common SMTP configurations
const configs = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    auth: { user: 'email@gmail.com', pass: 'app-password' },
  },
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    auth: { user: 'email@outlook.com', pass: 'password' },
  },
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 587,
    auth: { user: 'email@yahoo.com', pass: 'app-password' },
  },
  custom: {
    host: 'mail.company.com',
    port: 587,
    auth: { user: 'user@company.com', pass: 'password' },
  },
};
```

### AWS SES

```javascript
await initEmail('ses', {
  region: 'us-east-1',

  // Optional: Explicit credentials (uses AWS SDK defaults if not provided)
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

  // Optional: Custom endpoint for testing
  endpoint: 'https://ses.us-east-1.amazonaws.com',

  // Optional: Default sender
  defaultFrom: 'noreply@yourdomain.com',
});
```

### SendGrid

```javascript
await initEmail('sendgrid', {
  apiKey: process.env.SENDGRID_API_KEY,

  // Optional: Default sender
  defaultFrom: 'noreply@yourdomain.com',

  // Optional: IP Pool name for dedicated IPs
  ipPoolName: 'marketing',

  // Optional: Sandbox mode (no actual sending)
  sandboxMode: process.env.NODE_ENV === 'test',
});
```

### Mailgun

```javascript
await initEmail('mailgun', {
  apiKey: process.env.MAILGUN_API_KEY,
  domain: 'mg.yourdomain.com',

  // Optional: EU region
  url: 'https://api.eu.mailgun.net',

  // Optional: Default sender
  defaultFrom: 'noreply@yourdomain.com',

  // Optional: Tracking settings
  tracking: true,
  trackingClicks: true,
  trackingOpens: true,
});
```

### MailHog (Testing)

```javascript
// Default configuration (localhost:1025)
await initEmail('mailhog');

// Custom host/port
await initEmail('mailhog', {
  host: 'mailhog.local',
  port: 1025,
});

// Start MailHog with Docker
// docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog

// View emails at http://localhost:8025
```

## Advanced Features

### Custom Headers

```javascript
await sendEmail('user@example.com', 'Custom Headers', 'Content', {
  headers: {
    'X-Priority': '1',
    'X-Campaign-ID': 'summer-sale',
    'List-Unsubscribe': '<mailto:unsubscribe@example.com>',
  },
});
```

### CC and BCC

```javascript
await sendEmail('primary@example.com', 'Team Update', 'Content', {
  cc: ['manager@example.com', 'lead@example.com'],
  bcc: ['archive@example.com', 'compliance@example.com'],
});

// Single recipient
await sendEmail('user@example.com', 'Subject', 'Content', {
  cc: 'copy@example.com',
  bcc: 'hidden@example.com',
});
```

### Reply-To

```javascript
await sendEmail('customer@example.com', 'Order Confirmation', 'Content', {
  from: 'orders@shop.com',
  replyTo: 'support@shop.com',
});

// Multiple reply-to addresses
await sendEmail('user@example.com', 'Subject', 'Content', {
  replyTo: ['support@example.com', 'sales@example.com'],
});
```

### Bulk Sending

```javascript
// Send to multiple recipients
const recipients = [
  'user1@example.com',
  'user2@example.com',
  'user3@example.com',
];

// Option 1: All in To field
await sendEmail(recipients, 'Newsletter', '<h1>Latest News</h1>');

// Option 2: Individual sends (better for personalization)
for (const recipient of recipients) {
  await sendEmail(recipient, 'Newsletter', '<h1>Latest News</h1>', {
    // Personalized content
  });
}

// Option 3: Using BCC for privacy
await sendEmail(
  'newsletter@company.com',
  'Newsletter',
  '<h1>Latest News</h1>',
  {
    bcc: recipients,
  }
);
```

## Template System

### Basic Variables

```javascript
const template = `
  <h1>Hello, {{name}}!</h1>
  <p>Your email is: {{email}}</p>
  <p>Account type: {{accountType}}</p>
`;

await sendTemplatedEmail('user@example.com', 'Welcome', template, {
  name: 'John Doe',
  email: 'john@example.com',
  accountType: 'Premium',
});
```

### Nested Objects

```javascript
const template = `
  <h1>Hello, {{user.name}}!</h1>
  <p>Email: {{user.email}}</p>
  <p>Address: {{user.address.street}}, {{user.address.city}}</p>
`;

await sendTemplatedEmail('user@example.com', 'Profile', template, {
  user: {
    name: 'John Doe',
    email: 'john@example.com',
    address: {
      street: '123 Main St',
      city: 'New York',
    },
  },
});
```

### Conditionals

```javascript
const template = `
  <h1>Order Confirmation</h1>
  
  {{#if express}}
    <p>🚀 Express shipping - delivery in 1-2 days</p>
  {{/if}}
  
  {{#if discount}}
    <p>🎉 You saved {{discount}}%!</p>
  {{/if}}
  
  {{#if items}}
    <h2>Your items:</h2>
  {{/if}}
`;

await sendTemplatedEmail('user@example.com', 'Order', template, {
  express: true,
  discount: 20,
  items: true,
});
```

### Loops

```javascript
const template = `
  <h1>Your Order</h1>
  
  <table>
    <tr>
      <th>Item</th>
      <th>Price</th>
    </tr>
    {{#each items}}
    <tr>
      <td>{{name}}</td>
      <td>${{ price }}</td>
    </tr>
    {{/each}}
  </table>
  
  <p>Total: ${{ total }}</p>
`;

await sendTemplatedEmail('user@example.com', 'Receipt', template, {
  items: [
    { name: 'Product A', price: 29.99 },
    { name: 'Product B', price: 39.99 },
    { name: 'Product C', price: 19.99 },
  ],
  total: 89.97,
});
```

## Testing Strategies

### Local Development

```javascript
// Use MailHog for local development
if (process.env.NODE_ENV === 'development') {
  await initEmail('mailhog');
} else {
  await initEmail('ses', {
    /* production config */
  });
}

// All emails will be caught by MailHog
// View them at http://localhost:8025
```

### CI/CD

```javascript
// Mock email sending in tests
class MockEmailProvider extends EmailProvider {
  constructor() {
    super({});
    this.sentEmails = [];
  }

  async send(options) {
    this.sentEmails.push(options);
    return { success: true, messageId: 'mock-' + Date.now() };
  }
}

// In tests
const mockProvider = new MockEmailProvider();
await initEmail('mock', {}, mockProvider);

// Verify emails were sent
expect(mockProvider.sentEmails).toHaveLength(1);
expect(mockProvider.sentEmails[0].to).toBe('test@example.com');
```

### Integration Testing

```javascript
// Test with real SMTP server
describe('Email Integration', () => {
  beforeAll(async () => {
    await initEmail('mailhog');
  });

  test('sends welcome email', async () => {
    const result = await sendEmail(
      'test@example.com',
      'Welcome',
      '<h1>Welcome!</h1>'
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();

    // Verify in MailHog UI or API
    // const response = await fetch('http://localhost:8025/api/v2/messages');
  });
});
```

## Integration Patterns

### Express Integration

```javascript
import express from 'express';
import { initEmail, sendTemplatedEmail } from '@voilajs/appkit/email';

const app = express();

// Initialize email on startup
app.listen(3000, async () => {
  await initEmail('smtp', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('Server started with email support');
});

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    // Create user...
    const user = await createUser(req.body);

    // Send welcome email
    await sendTemplatedEmail(
      user.email,
      'Welcome to Our Service',
      welcomeTemplate,
      {
        name: user.name,
        verificationUrl: `https://example.com/verify/${user.verificationToken}`,
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});
```

### Queue Integration

```javascript
import { getQueue } from '@voilajs/appkit/queue';
import { sendTemplatedEmail } from '@voilajs/appkit/email';

// Setup email job processor
const queue = getQueue();

queue.processJobs('send-email', async (job) => {
  const { to, subject, template, data, options } = job.data;

  await sendTemplatedEmail(to, subject, template, data, options);
});

// Queue emails for background processing
app.post('/newsletter', async (req, res) => {
  const subscribers = await getSubscribers();

  for (const subscriber of subscribers) {
    await queue.addJob('send-email', {
      to: subscriber.email,
      subject: 'Monthly Newsletter',
      template: newsletterTemplate,
      data: {
        name: subscriber.name,
        month: 'January',
      },
    });
  }

  res.json({ queued: subscribers.length });
});
```

### Email Verification

```javascript
import crypto from 'crypto';
import { sendTemplatedEmail } from '@voilajs/appkit/email';

const verificationTemplate = `
  <h1>Verify Your Email</h1>
  <p>Hi {{name}},</p>
  <p>Please click the link below to verify your email address:</p>
  <a href="{{verificationUrl}}">Verify Email</a>
  <p>This link will expire in 24 hours.</p>
`;

async function sendVerificationEmail(user) {
  const token = crypto.randomBytes(32).toString('hex');

  // Save token to database
  await saveVerificationToken(user.id, token);

  await sendTemplatedEmail(
    user.email,
    'Verify Your Email',
    verificationTemplate,
    {
      name: user.name,
      verificationUrl: `https://example.com/verify?token=${token}`,
    }
  );
}

// Verification endpoint
app.get('/verify', async (req, res) => {
  const { token } = req.query;

  const user = await verifyToken(token);
  if (!user) {
    return res.status(400).send('Invalid or expired token');
  }

  await markEmailVerified(user.id);
  res.send('Email verified successfully!');
});
```

### Password Reset

```javascript
const resetTemplate = `
  <h1>Password Reset Request</h1>
  <p>Hi {{name}},</p>
  <p>You requested a password reset. Click the link below to set a new password:</p>
  <a href="{{resetUrl}}">Reset Password</a>
  <p>This link will expire in 1 hour.</p>
  <p>If you didn't request this, please ignore this email.</p>
`;

async function sendPasswordResetEmail(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour

  // Save reset token
  await saveResetToken(user.id, token, expiresAt);

  await sendTemplatedEmail(
    user.email,
    'Password Reset Request',
    resetTemplate,
    {
      name: user.name,
      resetUrl: `https://example.com/reset-password?token=${token}`,
    }
  );
}

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await findUserByEmail(email);

  if (user) {
    await sendPasswordResetEmail(user);
  }

  // Always return success to prevent email enumeration
  res.json({
    message: 'If an account exists, a reset link has been sent.',
  });
});
```

## Best Practices

### 1. Use Environment Variables

```javascript
// .env file
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

// Initialize from environment
await initEmail(process.env.EMAIL_PROVIDER, {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

### 2. Handle Errors Gracefully

```javascript
async function sendUserEmail(to, subject, content) {
  try {
    const result = await sendEmail(to, subject, content);
    console.log(`Email sent successfully: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);

    // Log to monitoring service
    await logError('email_failure', {
      to,
      subject,
      error: error.message,
    });

    // Don't expose internal errors to users
    throw new Error('Failed to send email. Please try again later.');
  }
}
```

### 3. Implement Retry Logic

```javascript
async function sendEmailWithRetry(to, subject, content, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await sendEmail(to, subject, content);
    } catch (error) {
      lastError = error;
      console.error(`Email attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
```

### 4. Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

// Limit email sending endpoints
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 emails per window
  message: 'Too many emails sent, please try again later',
});

app.post('/send-email', emailLimiter, async (req, res) => {
  // Send email logic
});
```

### 5. Validate Email Addresses

```javascript
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function sendValidatedEmail(to, subject, content) {
  if (!isValidEmail(to)) {
    throw new Error('Invalid email address');
  }

  return sendEmail(to, subject, content);
}
```

### 6. Use Templates for Consistency

```javascript
// email-templates.js
export const templates = {
  welcome: `
    <h1>Welcome, {{name}}!</h1>
    <p>Thank you for joining us.</p>
  `,

  passwordReset: `
    <h1>Password Reset</h1>
    <p>Click <a href="{{resetUrl}}">here</a> to reset your password.</p>
  `,

  orderConfirmation: `
    <h1>Order #{{orderId}} Confirmed</h1>
    <p>Thank you for your order!</p>
  `,
};

// Usage
import { templates } from './email-templates.js';

await sendTemplatedEmail('user@example.com', 'Welcome!', templates.welcome, {
  name: 'John',
});
```

### 7. Track Email Metrics

```javascript
async function trackEmail(type, to, result) {
  await db.emailLog.create({
    type,
    to,
    sentAt: new Date(),
    success: result.success,
    messageId: result.messageId,
    provider: getCurrentProvider(),
  });
}

async function sendTrackedEmail(to, subject, content, type) {
  const result = await sendEmail(to, subject, content);
  await trackEmail(type, to, result);
  return result;
}
```

## Real-World Examples

### Complete Email Service

```javascript
import { initEmail, sendTemplatedEmail } from '@voilajs/appkit/email';
import { createLogger } from '@voilajs/appkit/logging';

class EmailService {
  constructor() {
    this.logger = createLogger({ defaultMeta: { service: 'email' } });
    this.initialized = false;
  }

  async initialize() {
    try {
      const provider = process.env.EMAIL_PROVIDER || 'smtp';

      await initEmail(provider, {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        defaultFrom: process.env.DEFAULT_FROM_EMAIL,
      });

      this.initialized = true;
      this.logger.info('Email service initialized', { provider });
    } catch (error) {
      this.logger.error('Failed to initialize email service', { error });
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    this.ensureInitialized();

    const template = await this.loadTemplate('welcome');

    try {
      const result = await sendTemplatedEmail(
        user.email,
        'Welcome to Our Platform!',
        template,
        {
          name: user.name,
          verificationUrl: this.generateVerificationUrl(user),
        }
      );

      this.logger.info('Welcome email sent', {
        userId: user.id,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to send welcome email', {
        userId: user.id,
        error: error.message,
      });
      throw error;
    }
  }

  async sendPasswordReset(user) {
    this.ensureInitialized();

    const token = await this.generateResetToken(user);
    const template = await this.loadTemplate('password-reset');

    try {
      const result = await sendTemplatedEmail(
        user.email,
        'Password Reset Request',
        template,
        {
          name: user.name,
          resetUrl: `${process.env.APP_URL}/reset-password?token=${token}`,
          expiresIn: '1 hour',
        }
      );

      this.logger.info('Password reset email sent', {
        userId: user.id,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to send password reset email', {
        userId: user.id,
        error: error.message,
      });
      throw error;
    }
  }

  async sendOrderConfirmation(order) {
    this.ensureInitialized();

    const template = await this.loadTemplate('order-confirmation');

    try {
      const result = await sendTemplatedEmail(
        order.customer.email,
        `Order Confirmation #${order.id}`,
        template,
        {
          orderId: order.id,
          customerName: order.customer.name,
          items: order.items,
          total: order.total,
          shippingAddress: order.shippingAddress,
          trackingUrl: order.trackingUrl,
        },
        {
          attachments: [
            {
              filename: `invoice-${order.id}.pdf`,
              content: await this.generateInvoicePDF(order),
            },
          ],
        }
      );

      this.logger.info('Order confirmation sent', {
        orderId: order.id,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to send order confirmation', {
        orderId: order.id,
        error: error.message,
      });
      throw error;
    }
  }

  async sendBulkNewsletter(subscribers, content) {
    this.ensureInitialized();

    const template = await this.loadTemplate('newsletter');
    const results = [];
    const errors = [];

    for (const subscriber of subscribers) {
      try {
        const result = await sendTemplatedEmail(
          subscriber.email,
          content.subject,
          template,
          {
            name: subscriber.name,
            content: content.body,
            unsubscribeUrl: this.generateUnsubscribeUrl(subscriber),
          },
          {
            headers: {
              'List-Unsubscribe': `<${this.generateUnsubscribeUrl(subscriber)}>`,
            },
          }
        );

        results.push({
          email: subscriber.email,
          success: true,
          messageId: result.messageId,
        });
      } catch (error) {
        this.logger.error('Failed to send newsletter', {
          email: subscriber.email,
          error: error.message,
        });

        errors.push({
          email: subscriber.email,
          error: error.message,
        });
      }

      // Rate limiting
      await this.delay(100); // 100ms between emails
    }

    this.logger.info('Bulk newsletter complete', {
      total: subscribers.length,
      success: results.length,
      errors: errors.length,
    });

    return { results, errors };
  }

  async sendTransactionalEmail(type, recipient, data) {
    this.ensureInitialized();

    const template = await this.loadTemplate(type);
    const subject = this.getSubjectForType(type, data);

    try {
      const result = await sendTemplatedEmail(
        recipient,
        subject,
        template,
        data,
        {
          headers: {
            'X-Email-Type': type,
            'X-Transaction-ID': data.transactionId,
          },
        }
      );

      // Track transactional emails
      await this.trackEmail({
        type,
        recipient,
        messageId: result.messageId,
        transactionId: data.transactionId,
        sentAt: new Date(),
      });

      return result;
    } catch (error) {
      this.logger.error('Transactional email failed', {
        type,
        recipient,
        error: error.message,
      });
      throw error;
    }
  }

  // Helper methods

  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Email service not initialized');
    }
  }

  async loadTemplate(name) {
    // Load from file system or database
    const templatePath = path.join(__dirname, 'templates', `${name}.html`);
    return fs.promises.readFile(templatePath, 'utf-8');
  }

  generateVerificationUrl(user) {
    const token = crypto.randomBytes(32).toString('hex');
    // Save token to database...
    return `${process.env.APP_URL}/verify-email?token=${token}`;
  }

  async generateResetToken(user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await db.passwordResets.create({
      userId: user.id,
      token,
      expiresAt,
    });

    return token;
  }

  generateUnsubscribeUrl(subscriber) {
    const token = this.generateUnsubscribeToken(subscriber.id);
    return `${process.env.APP_URL}/unsubscribe?token=${token}`;
  }

  getSubjectForType(type, data) {
    const subjects = {
      invoice: `Invoice #${data.invoiceId}`,
      receipt: `Receipt for your payment`,
      shipping: `Your order has shipped!`,
      reminder: data.subject || 'Reminder',
      notification: data.subject || 'Notification',
    };

    return subjects[type] || 'Notification';
  }

  async trackEmail(data) {
    try {
      await db.emailTracking.create(data);
    } catch (error) {
      this.logger.error('Failed to track email', { error });
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Usage
const emailService = new EmailService();
await emailService.initialize();

// In your application
app.post('/register', async (req, res) => {
  const user = await createUser(req.body);
  await emailService.sendWelcomeEmail(user);
  res.json({ success: true });
});
```

### Multi-tenant Email System

```javascript
class MultiTenantEmailService {
  constructor() {
    this.tenantConfigs = new Map();
    this.logger = createLogger();
  }

  async configureTenant(tenantId, config) {
    this.tenantConfigs.set(tenantId, config);
    this.logger.info('Tenant email configured', { tenantId });
  }

  async sendTenantEmail(tenantId, to, subject, template, data) {
    const config = this.tenantConfigs.get(tenantId);

    if (!config) {
      throw new Error(`Email not configured for tenant: ${tenantId}`);
    }

    // Initialize provider for tenant
    await initEmail(config.provider, config.settings);

    // Add tenant branding
    const brandedData = {
      ...data,
      companyName: config.companyName,
      companyLogo: config.logoUrl,
      companyWebsite: config.websiteUrl,
      supportEmail: config.supportEmail,
    };

    // Use tenant's sender
    const options = {
      from: config.fromEmail || `noreply@${config.domain}`,
    };

    try {
      const result = await sendTemplatedEmail(
        to,
        subject,
        template,
        brandedData,
        options
      );

      this.logger.info('Tenant email sent', {
        tenantId,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      this.logger.error('Tenant email failed', {
        tenantId,
        error: error.message,
      });
      throw error;
    }
  }
}

// Usage
const multiTenantEmail = new MultiTenantEmailService();

// Configure tenants
await multiTenantEmail.configureTenant('tenant-1', {
  provider: 'smtp',
  settings: {
    host: 'smtp.gmail.com',
    port: 587,
    auth: { user: 'tenant1@gmail.com', pass: 'password' },
  },
  companyName: 'Company A',
  domain: 'companya.com',
  fromEmail: 'support@companya.com',
});

// Send email for specific tenant
await multiTenantEmail.sendTenantEmail(
  'tenant-1',
  'customer@example.com',
  'Welcome!',
  welcomeTemplate,
  { name: 'John' }
);
```

### Email Campaign Manager

```javascript
class EmailCampaignManager {
  constructor(emailService, analytics) {
    this.emailService = emailService;
    this.analytics = analytics;
    this.logger = createLogger();
  }

  async createCampaign(campaign) {
    const campaignId = generateId();

    await db.campaigns.create({
      id: campaignId,
      ...campaign,
      status: 'draft',
      createdAt: new Date(),
    });

    return campaignId;
  }

  async scheduleCampaign(campaignId, scheduleTime) {
    await db.campaigns.update(campaignId, {
      status: 'scheduled',
      scheduledFor: scheduleTime,
    });

    // Schedule job
    await this.scheduleJob(campaignId, scheduleTime);
  }

  async executeCampaign(campaignId) {
    const campaign = await db.campaigns.findById(campaignId);
    const segments = await this.getSegments(campaign.segments);
    const recipients = await this.getRecipients(segments);

    this.logger.info('Starting campaign', {
      campaignId,
      recipientCount: recipients.length,
    });

    const results = [];
    let sent = 0;
    let failed = 0;

    for (const batch of this.batchRecipients(recipients, 100)) {
      const batchResults = await Promise.allSettled(
        batch.map((recipient) => this.sendCampaignEmail(campaign, recipient))
      );

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          sent++;
          results.push(result.value);
        } else {
          failed++;
          this.logger.error('Campaign email failed', {
            campaignId,
            error: result.reason,
          });
        }
      }

      // Update progress
      await this.updateCampaignProgress(campaignId, {
        sent,
        failed,
        total: recipients.length,
      });

      // Rate limiting
      await this.delay(1000);
    }

    await this.completeCampaign(campaignId, results);
  }

  async sendCampaignEmail(campaign, recipient) {
    const personalizedContent = await this.personalizeContent(
      campaign.content,
      recipient
    );

    const trackingPixel = this.generateTrackingPixel(campaign.id, recipient.id);
    const trackedLinks = this.trackLinks(
      campaign.content,
      campaign.id,
      recipient.id
    );

    const result = await this.emailService.sendTemplatedEmail(
      recipient.email,
      campaign.subject,
      campaign.template,
      {
        ...personalizedContent,
        trackingPixel,
        unsubscribeUrl: this.generateUnsubscribeUrl(recipient.id, campaign.id),
      },
      {
        headers: {
          'X-Campaign-ID': campaign.id,
          'X-Recipient-ID': recipient.id,
          'List-Unsubscribe': `<${this.generateUnsubscribeUrl(recipient.id, campaign.id)}>`,
        },
      }
    );

    // Record send
    await db.campaignSends.create({
      campaignId: campaign.id,
      recipientId: recipient.id,
      email: recipient.email,
      messageId: result.messageId,
      sentAt: new Date(),
    });

    return result;
  }

  async trackOpen(campaignId, recipientId) {
    await db.campaignOpens.create({
      campaignId,
      recipientId,
      openedAt: new Date(),
    });

    await this.analytics.track({
      event: 'email_opened',
      campaignId,
      recipientId,
    });
  }

  async trackClick(campaignId, recipientId, linkId) {
    await db.campaignClicks.create({
      campaignId,
      recipientId,
      linkId,
      clickedAt: new Date(),
    });

    await this.analytics.track({
      event: 'email_link_clicked',
      campaignId,
      recipientId,
      linkId,
    });
  }

  async getCampaignStats(campaignId) {
    const stats = await db.query(
      `
      SELECT 
        COUNT(DISTINCT s.id) as sent,
        COUNT(DISTINCT o.recipient_id) as opened,
        COUNT(DISTINCT c.recipient_id) as clicked,
        COUNT(DISTINCT u.recipient_id) as unsubscribed
      FROM campaign_sends s
      LEFT JOIN campaign_opens o ON s.campaign_id = o.campaign_id 
        AND s.recipient_id = o.recipient_id
      LEFT JOIN campaign_clicks c ON s.campaign_id = c.campaign_id 
        AND s.recipient_id = c.recipient_id
      LEFT JOIN campaign_unsubscribes u ON s.campaign_id = u.campaign_id 
        AND s.recipient_id = u.recipient_id
      WHERE s.campaign_id = ?
    `,
      [campaignId]
    );

    return {
      sent: stats.sent,
      opened: stats.opened,
      clicked: stats.clicked,
      unsubscribed: stats.unsubscribed,
      openRate: (stats.opened / stats.sent) * 100,
      clickRate: (stats.clicked / stats.sent) * 100,
      unsubscribeRate: (stats.unsubscribed / stats.sent) * 100,
    };
  }

  generateTrackingPixel(campaignId, recipientId) {
    const trackingUrl = `${process.env.APP_URL}/track/open/${campaignId}/${recipientId}`;
    return `<img src="${trackingUrl}" width="1" height="1" style="display:none;" />`;
  }

  trackLinks(content, campaignId, recipientId) {
    return content.replace(/href="([^"]+)"/g, (match, url) => {
      const trackingUrl = `${process.env.APP_URL}/track/click/${campaignId}/${recipientId}?url=${encodeURIComponent(url)}`;
      return `href="${trackingUrl}"`;
    });
  }

  *batchRecipients(recipients, batchSize) {
    for (let i = 0; i < recipients.length; i += batchSize) {
      yield recipients.slice(i, i + batchSize);
    }
  }
}
```

## API Reference

### initEmail(provider, config)

Initializes the email module with a specific provider.

**Parameters:**

- `provider` (string): Provider type ('smtp', 'ses', 'sendgrid', 'mailgun',
  'mailhog')
- `config` (Object): Provider-specific configuration

**Returns:** Promise<EmailProvider>

```javascript
await initEmail('smtp', {
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'email@gmail.com', pass: 'password' },
});
```

### sendEmail(to, subject, html, options?)

Sends an email.

**Parameters:**

- `to` (string|Array<string>): Recipient email address(es)
- `subject` (string): Email subject
- `html` (string): HTML content
- `options` (Object, optional):
  - `from` (string): Sender email
  - `text` (string): Plain text content
  - `cc` (string|Array<string>): CC recipients
  - `bcc` (string|Array<string>): BCC recipients
  - `replyTo` (string): Reply-to address
  - `attachments` (Array): File attachments
  - `headers` (Object): Custom headers

**Returns:** Promise<{success: boolean, messageId: string, ...}>

```javascript
const result = await sendEmail(
  'user@example.com',
  'Subject',
  '<h1>Content</h1>',
  { from: 'sender@example.com' }
);
```

### sendTemplatedEmail(to, subject, template, data?, options?)

Sends an email using a template.

**Parameters:**

- `to` (string|Array<string>): Recipient email address(es)
- `subject` (string): Email subject
- `template` (string): Template string
- `data` (Object, optional): Template data
- `options` (Object, optional): Same as sendEmail options

**Returns:** Promise<{success: boolean, messageId: string, ...}>

```javascript
await sendTemplatedEmail('user@example.com', 'Welcome', 'Hello {{name}}!', {
  name: 'John',
});
```

### renderTemplate(template, data?)

Renders a template with data.

**Parameters:**

- `template` (string): Template string
- `data` (Object, optional): Template data

**Returns:** Promise<string>

```javascript
const html = await renderTemplate('Hello {{name}}!', { name: 'John' });
```

## Error Handling

### Common Errors

```javascript
try {
  await sendEmail(to, subject, html);
} catch (error) {
  if (error.message.includes('authentication failed')) {
    // Invalid credentials
  } else if (error.message.includes('connection timeout')) {
    // Network issues
  } else if (error.message.includes('recipient address rejected')) {
    // Invalid recipient
  } else if (error.message.includes('message rejected')) {
    // Content filtering/spam detection
  } else {
    // Unknown error
  }
}
```

### Provider-Specific Errors

```javascript
// SES errors
if (error.name === 'MessageRejected') {
  // Email content rejected
} else if (error.name === 'MailFromDomainNotVerified') {
  // Sender domain not verified
}

// SendGrid errors
if (error.code === 401) {
  // Invalid API key
} else if (error.code === 413) {
  // Payload too large
}

// Mailgun errors
if (error.status === 401) {
  // Authentication failed
} else if (error.status === 400) {
  // Invalid parameters
}
```

## Performance Considerations

### Connection Pooling

```javascript
// SMTP connection pooling
await initEmail('smtp', {
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
});
```

### Batch Processing

```javascript
// Process emails in batches
async function sendBulkEmails(recipients, template) {
  const batchSize = 50;
  let sent = 0;

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    await Promise.all(
      batch.map((recipient) =>
        sendTemplatedEmail(
          recipient.email,
          'Subject',
          template,
          recipient
        ).catch((error) => {
          console.error(`Failed to send to ${recipient.email}:`, error);
        })
      )
    );

    sent += batch.length;
    console.log(`Sent ${sent}/${recipients.length} emails`);

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
```

### Template Caching

```javascript
const templateCache = new Map();

async function getCachedTemplate(name) {
  if (!templateCache.has(name)) {
    const template = await loadTemplate(name);
    templateCache.set(name, template);
  }
  return templateCache.get(name);
}
```

## Security

### Email Validation

```javascript
function validateEmail(email) {
  // Basic validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Additional checks
  if (email.length > 254) {
    throw new Error('Email too long');
  }

  // Check for dangerous characters
  if (email.includes('<') || email.includes('>')) {
    throw new Error('Invalid characters in email');
  }

  return true;
}
```

### Content Sanitization

```javascript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtmlContent(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'p',
      'a',
      'ul',
      'ol',
      'li',
      'strong',
      'em',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target'],
  });
}

async function sendSanitizedEmail(to, subject, html) {
  const sanitizedHtml = sanitizeHtmlContent(html);
  return sendEmail(to, subject, sanitizedHtml);
}
```

### Rate Limiting

```javascript
const emailRateLimiter = new Map();

async function rateLimitedSend(to, subject, html) {
  const key = to.toLowerCase();
  const now = Date.now();
  const limit = emailRateLimiter.get(key) || [];

  // Remove old entries (older than 1 hour)
  const recentSends = limit.filter((time) => now - time < 3600000);

  if (recentSends.length >= 5) {
    throw new Error('Too many emails sent to this address');
  }

  const result = await sendEmail(to, subject, html);

  recentSends.push(now);
  emailRateLimiter.set(key, recentSends);

  return result;
}
```

## Troubleshooting

### Common Issues

#### 1. SMTP Connection Issues

```javascript
// Test SMTP connection
async function testSmtpConnection() {
  try {
    await initEmail('smtp', {
      host: 'smtp.gmail.com',
      port: 587,
      auth: { user: 'test@gmail.com', pass: 'password' },
    });
    console.log('SMTP connection successful');
  } catch (error) {
    console.error('SMTP connection failed:', error);

    if (error.code === 'ECONNREFUSED') {
      console.log('Check if the SMTP server is running');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('Connection timeout - check firewall settings');
    }
  }
}
```

#### 2. Authentication Failures

```javascript
// Gmail specific issues
if (error.message.includes('Invalid login')) {
  console.log('For Gmail:');
  console.log('1. Enable 2-factor authentication');
  console.log('2. Generate an app-specific password');
  console.log('3. Use the app password instead of your regular password');
}
```

#### 3. Email Delivery Issues

```javascript
// Check spam score
async function checkEmailSpamScore(html) {
  // Use a service like SpamAssassin or Mail-Tester
  const score = await spamChecker.check(html);

  if (score > 5) {
    console.warn('High spam score:', score);
    console.log('Tips:');
    console.log('- Avoid excessive links');
    console.log('- Balance text and images');
    console.log('- Include unsubscribe link');
    console.log('- Authenticate your domain (SPF, DKIM)');
  }
}
```

#### 4. Template Rendering Issues

```javascript
// Debug template rendering
async function debugTemplate(template, data) {
  try {
    const rendered = await renderTemplate(template, data);
    console.log('Rendered successfully:', rendered);
  } catch (error) {
    console.error('Template error:', error);

    // Common issues
    if (error.message.includes('undefined')) {
      console.log('Check if all template variables exist in data');
    }
  }
}
```

### Development Tips

#### 1. Use MailHog for Testing

```bash
# Start MailHog with Docker
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Configure your app
await initEmail('mailhog');

# View emails at http://localhost:8025
```

#### 2. Email Preview

```javascript
// Preview emails before sending
app.get('/email-preview/:template', async (req, res) => {
  const template = await loadTemplate(req.params.template);
  const sampleData = getSampleData(req.params.template);

  const html = await renderTemplate(template, sampleData);

  res.send(html);
});
```

#### 3. Test Different Providers

```javascript
// Easy provider switching for testing
const provider = process.env.EMAIL_PROVIDER || 'mailhog';

await initEmail(provider, {
  // Provider-specific config
});
```

## Support

For issues and feature requests, visit our
[GitHub repository](https://github.com/voilajs/appkit).
