# @voilajsx/appkit - Email Module 📧

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple email sending that just works - One function, automatic provider
> detection, zero configuration

**One function** returns an email object with automatic strategy selection. Zero
configuration needed, production-ready sending by default, with built-in
template system and development preview.

## 🚀 Why Choose This?

- **⚡ One Function** - Just `emailing.get()`, everything else is automatic
- **🎯 Auto-Strategy** - RESEND_API_KEY = Resend, SMTP_HOST = SMTP, default =
  Console
- **🔧 Zero Configuration** - Smart defaults for everything
- **📄 Built-in Templates** - Welcome, reset password templates included
- **🎨 Development Preview** - See emails in console with beautiful formatting
- **🛡️ Production Ready** - Retry logic, error handling, graceful shutdown
- **🤖 AI-Ready** - Optimized for LLM code generation

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

### 1. Basic Setup (Console Preview)

```typescript
import { emailing } from '@voilajsx/appkit/email';

const email = emailing.get();

// Send email (shows in console during development)
await email.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  text: 'Hello world!',
});

// Even simpler
await emailing.sendText('user@example.com', 'Hi', 'Hello!');
```

### 2. Production Setup (Resend)

```bash
# Just set API key - automatic Resend strategy
export RESEND_API_KEY=re_your_api_key_here
```

```typescript
import { emailing } from '@voilajsx/appkit/email';

// Same code, now sends real emails!
await emailing.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello!</h1><p>Welcome to our app!</p>',
});
```

**That's it!** No configuration, no setup, just works everywhere.

## 🧠 Mental Model

### **Automatic Strategy Selection**

The email module **automatically detects** what you need:

| Environment Variable       | Strategy | Use Case                           |
| -------------------------- | -------- | ---------------------------------- |
| `RESEND_API_KEY=re_...`    | Resend   | Modern production (recommended)    |
| `SMTP_HOST=smtp.gmail.com` | SMTP     | Universal (Gmail, Outlook, custom) |
| _No email env vars_        | Console  | Development (shows in terminal)    |

### **Development → Production**

```typescript
// Same code works everywhere
await emailing.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  text: 'Hello!',
});

// Development: Beautiful console preview
// Production: Real email via Resend/SMTP
```

## 📖 Complete API

### Core Function

```typescript
const email = emailing.get(); // One function, everything you need
```

### Email Operations

```typescript
// Full email
await email.send({
  to: 'user@example.com',
  subject: 'Subject',
  text: 'Plain text',
  html: '<h1>HTML content</h1>',
});

// Simple text
await email.sendText('user@example.com', 'Subject', 'Text');

// HTML email
await email.sendHtml('user@example.com', 'Subject', '<h1>HTML</h1>');

// Template email
await email.sendTemplate('welcome', {
  to: 'user@example.com',
  name: 'John',
  appName: 'MyApp',
});

// Batch emails
await email.sendBatch([email1, email2, email3]);
```

### Utility Methods

```typescript
// Debugging
email.getStrategy(); // 'resend', 'smtp', or 'console'
emailing.hasResend(); // true if RESEND_API_KEY set
emailing.hasSmtp(); // true if SMTP_HOST set

// Convenience
await emailing.send(emailData); // Direct send without get()
```

## 💡 Simple Examples

### **User Registration Email**

```typescript
import { emailing } from '@voilajsx/appkit/email';

async function sendWelcomeEmail(user) {
  await emailing.send({
    to: user.email,
    subject: `Welcome to ${process.env.APP_NAME}!`,
    html: `
      <h1>Welcome ${user.name}!</h1>
      <p>Thanks for joining us. We're excited to have you!</p>
      <a href="${process.env.APP_URL}/dashboard">Get Started</a>
    `,
    text: `Welcome ${user.name}! Thanks for joining us. Visit ${process.env.APP_URL}/dashboard to get started.`,
  });
}
```

### **Password Reset**

```typescript
import { emailing } from '@voilajsx/appkit/email';

async function sendPasswordReset(user, resetToken) {
  const resetUrl = `${process.env.APP_URL}/reset?token=${resetToken}`;

  await emailing.send({
    to: user.email,
    subject: 'Reset your password',
    html: `
      <h2>Reset your password</h2>
      <p>Hi ${user.name},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `Reset your password: ${resetUrl} (expires in 1 hour)`,
  });
}
```

### **Order Confirmation**

```typescript
import { emailing } from '@voilajsx/appkit/email';

async function sendOrderConfirmation(order) {
  await emailing.send({
    to: order.customerEmail,
    subject: `Order Confirmation #${order.id}`,
    html: `
      <h1>Order Confirmed!</h1>
      <p>Thanks for your order, ${order.customerName}!</p>
      <h3>Order Details:</h3>
      <ul>
        ${order.items.map((item) => `<li>${item.name} x${item.quantity} - $${item.price}</li>`).join('')}
      </ul>
      <p><strong>Total: $${order.total}</strong></p>
      <p>We'll send you tracking information when your order ships.</p>
    `,
  });
}
```

### **Built-in Templates**

```typescript
import { emailing } from '@voilajsx/appkit/email';

// Welcome template
await emailing.get().sendTemplate('welcome', {
  to: 'user@example.com',
  name: 'John',
  appName: 'MyApp',
});

// Password reset template
await emailing.get().sendTemplate('reset', {
  to: 'user@example.com',
  name: 'John',
  resetUrl: 'https://myapp.com/reset?token=abc123',
  appName: 'MyApp',
});
```

## 🌍 Environment Variables

### **Resend (Recommended)**

```bash
# Modern email service with great deliverability
RESEND_API_KEY=re_your_api_key_here

# Optional: Custom FROM address
VOILA_EMAIL_FROM_EMAIL=noreply@yourdomain.com
VOILA_EMAIL_FROM_NAME="Your App Name"
```

### **SMTP (Universal)**

```bash
# Works with Gmail, Outlook, custom servers
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: Security settings
SMTP_SECURE=false  # true for port 465, false for 587
```

### **Console (Development)**

```bash
# No configuration needed!
# Automatically used when no email provider is set

# Optional: Customize console output
VOILA_EMAIL_CONSOLE_FORMAT=detailed  # or 'simple'
VOILA_EMAIL_CONSOLE_PREVIEW=true     # Show email content
```

## 🔧 Platform Setup

### **Local Development**

```bash
# No setup needed - beautiful console preview
npm start
```

### **Resend (Recommended)**

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Set `RESEND_API_KEY=re_your_key`
4. Done! ✅

### **Gmail SMTP**

```bash
# Enable 2FA and create App Password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

### **Outlook/Hotmail SMTP**

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### **Custom SMTP Server**

```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

## 🚀 Production Deployment

### **Vercel**

```bash
# Add to Vercel environment variables
RESEND_API_KEY=re_your_api_key
VOILA_EMAIL_FROM_EMAIL=noreply@yourdomain.com
```

### **Railway/Heroku**

```bash
# Add to platform environment variables
RESEND_API_KEY=re_your_api_key
```

### **Docker**

```yaml
# docker-compose.yml
services:
  app:
    image: my-app
    environment:
      RESEND_API_KEY: re_your_api_key
      VOILA_EMAIL_FROM_EMAIL: noreply@yourdomain.com
```

### **AWS/VPS**

```bash
# Add to your deployment script
export RESEND_API_KEY=re_your_api_key
export VOILA_EMAIL_FROM_EMAIL=noreply@yourdomain.com
```

## 🧪 Testing

```typescript
import { emailing } from '@voilajsx/appkit/email';

describe('Email Tests', () => {
  afterEach(async () => {
    await emailing.clear(); // Clean up between tests
  });

  test('should send email', async () => {
    // Force console strategy for tests
    await emailing.reset({
      strategy: 'console',
      from: { name: 'Test App', email: 'test@example.com' },
    });

    const result = await emailing.send({
      to: 'user@example.com',
      subject: 'Test',
      text: 'Test message',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });
});
```

## 🤖 LLM Guidelines

### **Essential Patterns**

```typescript
// ✅ ALWAYS use these patterns
import { emailing } from '@voilajsx/appkit/email';
const email = emailing.get();

// ✅ Basic email sending
await email.send({
  to: 'user@example.com',
  subject: 'Subject',
  text: 'Plain text content',
});

// ✅ HTML email with fallback
await email.send({
  to: 'user@example.com',
  subject: 'Subject',
  html: '<h1>HTML content</h1>',
  text: 'Plain text fallback',
});

// ✅ Convenience methods
await emailing.sendText('user@example.com', 'Subject', 'Message');

// ✅ Template usage
await email.sendTemplate('welcome', {
  to: 'user@example.com',
  name: 'John',
  appName: 'MyApp',
});
```

### **Anti-Patterns to Avoid**

```typescript
// ❌ DON'T create email strategies directly
const resend = new ResendStrategy(); // Use emailing.get() instead

// ❌ DON'T forget error handling
await email.send(data); // Check result.success

// ❌ DON'T send without subject
await email.send({ to: 'user@example.com', text: 'Hi' }); // Missing subject

// ❌ DON'T send without content
await email.send({ to: 'user@example.com', subject: 'Hi' }); // Missing text/html

// ❌ DON'T ignore email validation
await email.send({ to: 'invalid-email', subject: 'Hi', text: 'Hello' });
```

### **Common Patterns**

```typescript
// Email with error handling
const result = await emailing.send({
  to: user.email,
  subject: 'Welcome!',
  text: 'Welcome to our app!',
});

if (!result.success) {
  console.error('Email failed:', result.error);
}

// Conditional email sending
if (emailing.hasProvider()) {
  await emailing.send(emailData);
} else {
  console.log('No email provider configured');
}

// Batch email sending
const emails = users.map((user) => ({
  to: user.email,
  subject: 'Newsletter',
  html: newsletterHtml,
}));

await emailing.get().sendBatch(emails);
```

## 📈 Performance

- **Resend Strategy**: ~100-500ms per email
- **SMTP Strategy**: ~200-1000ms per email (depends on server)
- **Console Strategy**: ~1-5ms (instant logging)
- **Batch Sending**: Processes 10 emails concurrently by default
- **Memory Usage**: <2MB baseline usage

## 🔍 TypeScript Support

```typescript
import type { EmailData, EmailResult } from '@voilajsx/appkit/email';

// Strongly typed email operations
const emailData: EmailData = {
  to: 'user@example.com',
  subject: 'Hello',
  text: 'Hello world!',
};

const result: EmailResult = await emailing.send(emailData);
```

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a>
</p>
