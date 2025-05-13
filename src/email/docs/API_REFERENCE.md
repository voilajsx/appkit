# @voilajs/appkit - Email Module API Reference

## Overview

The `@voilajs/appkit/email` module provides a unified interface for sending
emails through various providers including SMTP, SendGrid, AWS SES, Mailgun, and
testing providers like MailHog and Mailtrap. It offers features such as template
rendering, attachment handling, and provider-specific options.

## Installation

```bash
npm install @voilajs/appkit
```

## Quick Start

```javascript
import {
  initEmail,
  sendEmail,
  sendTemplatedEmail,
  closeEmail,
} from '@voilajs/appkit/email';

// Initialize provider
await initEmail('smtp', {
  host: 'smtp.example.com',
  port: 587,
  auth: {
    user: 'username',
    pass: 'password',
  },
  defaultFrom: 'sender@example.com',
});

// Send email
await sendEmail(
  'recipient@example.com',
  'Hello World',
  '<p>This is a test email</p>'
);

// Clean up
await closeEmail();
```

## API Reference

### Main Functions

#### initEmail(provider, config)

Initializes an email provider for sending emails.

##### Parameters

| Name                 | Type     | Required | Default | Description                                                                 |
| -------------------- | -------- | -------- | ------- | --------------------------------------------------------------------------- |
| `provider`           | `string` | Yes      | -       | Provider type ('smtp', 'ses', 'sendgrid', 'mailgun', 'mailhog', 'mailtrap') |
| `config`             | `Object` | No       | `{}`    | Provider-specific configuration options                                     |
| `config.defaultFrom` | `string` | No       | -       | Default sender email address                                                |

##### Returns

- `Promise<Object>` - The initialized provider instance

##### Throws

- `Error` - If provider type is invalid
- `Error` - If required configuration is missing
- `Error` - If initialization fails

##### Example

```javascript
// Initialize SMTP provider
await initEmail('smtp', {
  host: 'smtp.example.com',
  port: 587,
  auth: {
    user: 'username',
    pass: 'password',
  },
  defaultFrom: 'sender@example.com',
});

// Initialize SendGrid provider
await initEmail('sendgrid', {
  apiKey: 'your-sendgrid-api-key',
  defaultFrom: 'sender@example.com',
});

// Initialize AWS SES provider
await initEmail('ses', {
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'your-access-key',
    secretAccessKey: 'your-secret-key',
  },
  defaultFrom: 'sender@example.com',
});

// Initialize Mailgun provider
await initEmail('mailgun', {
  apiKey: 'your-mailgun-api-key',
  domain: 'mg.yourdomain.com',
  defaultFrom: 'sender@yourdomain.com',
});

// Initialize MailHog for testing (local development)
await initEmail('mailhog', {
  host: 'localhost',
  port: 1025,
  defaultFrom: 'test@example.com',
});
```

---

#### closeEmail()

Closes the current email provider connection and releases resources.

##### Parameters

_None_

##### Returns

- `Promise<void>`

##### Throws

_None_

##### Example

```javascript
// Close the active email provider
await closeEmail();
```

---

#### getEmailProvider()

Gets the current email provider instance.

##### Parameters

_None_

##### Returns

- `Object` - The current email provider instance

##### Throws

- `Error` - If no provider has been initialized

##### Example

```javascript
// Get the current provider
const provider = getEmailProvider();
console.log(provider.constructor.name); // "SMTPProvider"
```

---

#### sendEmail(to, subject, html, options)

Sends an email using the initialized provider.

##### Parameters

| Name                  | Type               | Required | Default | Description                      |
| --------------------- | ------------------ | -------- | ------- | -------------------------------- |
| `to`                  | `string\|string[]` | Yes      | -       | Recipient email address(es)      |
| `subject`             | `string`           | Yes      | -       | Email subject                    |
| `html`                | `string`           | Yes      | -       | HTML content                     |
| `options`             | `Object`           | No       | `{}`    | Additional email options         |
| `options.from`        | `string`           | No       | -       | Sender email (overrides default) |
| `options.text`        | `string`           | No       | -       | Plain text version               |
| `options.cc`          | `string\|string[]` | No       | -       | CC recipients                    |
| `options.bcc`         | `string\|string[]` | No       | -       | BCC recipients                   |
| `options.replyTo`     | `string`           | No       | -       | Reply-to address                 |
| `options.attachments` | `Object[]`         | No       | -       | Email attachments                |
| `options.headers`     | `Object`           | No       | -       | Custom email headers             |

##### Attachment Object

| Name       | Type             | Required | Description                       |
| ---------- | ---------------- | -------- | --------------------------------- |
| `filename` | `string`         | Yes      | Name of the attachment            |
| `content`  | `Buffer\|string` | Yes      | Attachment content                |
| `type`     | `string`         | No       | MIME type, e.g. 'application/pdf' |

##### Returns

- `Promise<Object>` - Send result with status and provider-specific info

##### Throws

- `Error` - If provider not initialized
- `Error` - If required parameters are missing
- `Error` - If send fails

##### Example

```javascript
// Send a simple email
const result = await sendEmail(
  'recipient@example.com',
  'Hello World',
  '<p>This is a test email</p>'
);

// Send to multiple recipients with attachments
const fs = require('fs');
const result = await sendEmail(
  ['user1@example.com', 'user2@example.com'],
  'Monthly Report',
  '<p>Please find the report attached.</p>',
  {
    from: 'reports@company.com',
    cc: 'manager@company.com',
    bcc: ['archive@company.com', 'backup@company.com'],
    replyTo: 'no-reply@company.com',
    text: 'Please find the report attached.',
    attachments: [
      {
        filename: 'report.pdf',
        content: fs.readFileSync('./reports/may-2025.pdf'),
        type: 'application/pdf',
      },
      {
        filename: 'data.xlsx',
        content: fs.readFileSync('./reports/may-2025-data.xlsx'),
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
    headers: {
      'X-Priority': '1',
      'X-Report-Type': 'Monthly',
    },
  }
);
```

---

#### sendTemplatedEmail(to, subject, template, data, options)

Sends an email using a template with variable substitution.

##### Parameters

| Name       | Type               | Required | Default | Description                                  |
| ---------- | ------------------ | -------- | ------- | -------------------------------------------- |
| `to`       | `string\|string[]` | Yes      | -       | Recipient email address(es)                  |
| `subject`  | `string`           | Yes      | -       | Email subject                                |
| `template` | `string`           | Yes      | -       | HTML template with variables                 |
| `data`     | `Object`           | No       | `{}`    | Template data for variable replacement       |
| `options`  | `Object`           | No       | `{}`    | Additional email options (same as sendEmail) |

##### Template Syntax

The template engine supports:

- Variable substitution with `{{variableName}}`
- Nested object access with `{{user.name}}`
- Conditionals with `{{#if condition}}content{{/if}}`
- Loops with `{{#each items}}{{this}} or {{property}}{{/each}}`

##### Returns

- `Promise<Object>` - Send result with status and provider-specific info

##### Throws

- `Error` - If provider not initialized
- `Error` - If required parameters are missing
- `Error` - If template rendering fails
- `Error` - If send fails

##### Example

```javascript
// Send a simple templated email
const template = `
  <h1>Hello {{name}}!</h1>
  <p>Thank you for joining {{company}}.</p>
  
  {{#if hasAccount}}
    <p>Your account has been created. Here are your details:</p>
    <ul>
      <li>Username: {{username}}</li>
      <li>Email: {{email}}</li>
    </ul>
  {{/if}}
  
  <h2>Your subscription includes:</h2>
  <ul>
    {{#each features}}
      <li>{{this}}</li>
    {{/each}}
  </ul>
`;

const result = await sendTemplatedEmail(
  'john.doe@example.com',
  'Welcome to Our Service',
  template,
  {
    name: 'John',
    company: 'Amazing Corp',
    hasAccount: true,
    username: 'johndoe',
    email: 'john.doe@example.com',
    features: ['Cloud Storage', 'Premium Support', 'Advanced Analytics'],
  },
  {
    from: 'welcome@amazingcorp.com',
    replyTo: 'support@amazingcorp.com',
  }
);
```

### Provider-Specific Configuration

#### SMTP Provider

```javascript
await initEmail('smtp', {
  host: 'smtp.example.com', // required
  port: 587, // default: 587
  secure: false, // default: false, set to true for port 465
  auth: {
    // required unless auth: false
    user: 'username',
    pass: 'password',
  },
  defaultFrom: 'sender@example.com',
  pool: false, // default: false
  maxConnections: 5, // default: 5
  tls: {
    // TLS options for secure connection
    rejectUnauthorized: true,
  },
  verifyConnection: true, // default: true
});
```

#### AWS SES Provider

```javascript
await initEmail('ses', {
  region: 'us-east-1', // required
  credentials: {
    // optional if using AWS environment credentials
    accessKeyId: 'your-access-key',
    secretAccessKey: 'your-secret-key',
  },
  endpoint: 'https://email.us-east-1.amazonaws.com', // optional custom endpoint
  defaultFrom: 'sender@example.com',
  configurationSet: 'your-config-set-name', // optional
});
```

#### SendGrid Provider

```javascript
await initEmail('sendgrid', {
  apiKey: 'your-sendgrid-api-key', // required
  defaultFrom: 'sender@example.com',
  timeout: 30000, // optional timeout in milliseconds
});
```

#### Mailgun Provider

```javascript
await initEmail('mailgun', {
  apiKey: 'your-mailgun-api-key', // required
  domain: 'mg.yourdomain.com', // required
  url: 'https://api.mailgun.net', // default API endpoint
  defaultFrom: 'sender@yourdomain.com',
});
```

#### MailHog Provider (Testing)

```javascript
await initEmail('mailhog', {
  host: 'localhost', // default: 'localhost'
  port: 1025, // default: 1025
  webPort: 8025, // default: 8025
  defaultFrom: 'test@example.com',
});
```

#### Mailtrap Provider (Testing)

```javascript
await initEmail('mailtrap', {
  auth: {
    // required
    user: 'your-mailtrap-username',
    pass: 'your-mailtrap-password',
  },
  // Or use these alternative properties:
  // username: 'your-mailtrap-username',
  // password: 'your-mailtrap-password',
  port: 2525, // default: 2525
  defaultFrom: 'test@example.com',
  inboxId: 'your-inbox-id', // optional, for URL generation
});
```

## Error Handling

All functions in this module throw descriptive errors that should be caught and
handled appropriately:

```javascript
try {
  await initEmail('smtp', config);
  await sendEmail('recipient@example.com', 'Test', '<p>Test</p>');
} catch (error) {
  console.error('Email error:', error.message);

  // Handle specific error cases
  if (error.message.includes('authentication failed')) {
    console.log('Check your SMTP credentials');
  } else if (error.message.includes('recipient address rejected')) {
    console.log('Invalid recipient email address');
  }
}
```

### Common Error Messages

| Function             | Error Message                    | Cause                      |
| -------------------- | -------------------------------- | -------------------------- |
| `initEmail`          | `Unknown email provider: x`      | Invalid provider name      |
| `initEmail`          | `SMTP host is required`          | Missing SMTP host          |
| `initEmail`          | `SendGrid API key is required`   | Missing SendGrid API key   |
| `getEmailProvider`   | `Email provider not initialized` | No provider initialized    |
| `sendEmail`          | `Recipient email is required`    | Missing recipient          |
| `sendEmail`          | `Email subject is required`      | Missing subject            |
| `sendEmail`          | `Email content is required`      | Missing both html and text |
| `sendTemplatedEmail` | `Template is required`           | Missing template           |
| `sendTemplatedEmail` | `Template rendering failed`      | Invalid template syntax    |

## Security Considerations

1. **Environment Variables**: Store sensitive information like API keys and
   passwords in environment variables
2. **HTTPS**: Always use secure connections for production environments
3. **Input Validation**: Validate email addresses and content before sending
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Logging**: Be careful not to log sensitive information such as email
   content or credentials
6. **Authentication**: Use strong passwords for SMTP and API keys with
   appropriate permissions

## TypeScript Support

While this module is written in JavaScript, it includes JSDoc comments for
better IDE support. For TypeScript projects, you can use JSDoc type annotations
in your code.

```typescript
/**
 * @typedef {Object} EmailOptions
 * @property {string} [from] - Sender email
 * @property {string} [text] - Plain text version
 * @property {string|string[]} [cc] - CC recipients
 * @property {string|string[]} [bcc] - BCC recipients
 * @property {string} [replyTo] - Reply-to address
 * @property {Array<{filename: string, content: Buffer|string, type?: string}>} [attachments] - Attachments
 * @property {Object} [headers] - Custom headers
 */

/**
 * @param {string|string[]} to - Recipients
 * @param {string} subject - Subject
 * @param {string} html - HTML content
 * @param {EmailOptions} [options] - Additional options
 * @returns {Promise<Object>} Send result
 */
```

## Performance Tips

1. **Connection Pooling**: Use connection pooling with SMTP for high-volume
   sending
2. **Batch Sending**: Group multiple recipients using the 'to' array instead of
   sending individual emails
3. **Template Caching**: Cache compiled templates if using the same template
   repeatedly
4. **Provider Selection**: Choose the appropriate provider for your needs:
   - SMTP for low volume or internal emails
   - SendGrid/Mailgun/SES for high volume or transactional emails
5. **Error Handling**: Implement proper error handling and retry logic for
   failed sends

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
