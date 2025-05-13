# @voilajs/appkit/email - LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Always include JSDoc comments for functions
   - Export named functions, not default exports

2. **JSDoc Format** (Required for all functions):

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error Handling**:

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Throw descriptive error messages

4. **Framework Agnostic**:
   - Code should work with any Node.js framework
   - Provider implementations should follow consistent interface

## Function Signatures

### 1. `initEmail`

```typescript
async function initEmail(
  provider: string,
  config?: {
    // Common options
    defaultFrom?: string;

    // SMTP options
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: { user: string; pass: string } | false;

    // SendGrid options
    apiKey?: string;

    // SES options
    region?: string;
    credentials?: {
      accessKeyId: string;
      secretAccessKey: string;
    };

    // Mailgun options
    domain?: string;
    url?: string;

    // MailHog options
    webPort?: number;
  }
): Promise<EmailProvider>;
```

### 2. `closeEmail`

```typescript
async function closeEmail(): Promise<void>;
```

### 3. `getEmailProvider`

```typescript
function getEmailProvider(): EmailProvider;
```

### 4. `sendEmail`

```typescript
async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  options?: {
    from?: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      type?: string;
    }>;
    headers?: Record<string, string>;
  }
): Promise<{
  success: boolean;
  messageId: string;
  [key: string]: any;
}>;
```

### 5. `sendTemplatedEmail`

```typescript
async function sendTemplatedEmail(
  to: string | string[],
  subject: string,
  template: string,
  data?: Record<string, any>,
  options?: {
    // Same options as sendEmail
  }
): Promise<{
  success: boolean;
  messageId: string;
  [key: string]: any;
}>;
```

## Example Implementations

### Basic Email Sending

```javascript
/**
 * Sends a welcome email to a new user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @returns {Promise<Object>} Email send result
 * @throws {Error} If email fails to send
 */
async function sendWelcomeEmail(email, name) {
  try {
    // Validate parameters
    if (!email) {
      throw new Error('Email address is required');
    }

    if (!name) {
      throw new Error('User name is required');
    }

    const html = `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for signing up for our service.</p>
      <p>If you have any questions, please don't hesitate to reach out.</p>
    `;

    const result = await sendEmail(email, 'Welcome to Our Service', html, {
      from: 'welcome@example.com',
      replyTo: 'support@example.com',
    });

    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw new Error(`Welcome email failed: ${error.message}`);
  }
}
```

### Email With Attachments

```javascript
/**
 * Sends an invoice email with PDF attachment
 * @param {string} email - Customer email
 * @param {string} invoiceNumber - Invoice number
 * @param {Buffer} pdfBuffer - Invoice PDF as buffer
 * @returns {Promise<Object>} Email send result
 * @throws {Error} If email fails to send
 */
async function sendInvoiceEmail(email, invoiceNumber, pdfBuffer) {
  try {
    const html = `
      <h1>Invoice #${invoiceNumber}</h1>
      <p>Please find your invoice attached.</p>
      <p>For questions about this invoice, please contact billing@example.com.</p>
    `;

    return await sendEmail(email, `Invoice #${invoiceNumber}`, html, {
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          type: 'application/pdf',
        },
      ],
      bcc: 'billing-archive@example.com',
    });
  } catch (error) {
    throw new Error(`Failed to send invoice email: ${error.message}`);
  }
}
```

### Templated Email

```javascript
/**
 * Sends a password reset email
 * @param {string} email - User's email address
 * @param {string} resetToken - Password reset token
 * @param {string} expiresIn - Human-readable expiration time
 * @returns {Promise<Object>} Email send result
 * @throws {Error} If email fails to send
 */
async function sendPasswordResetEmail(email, resetToken, expiresIn) {
  try {
    const template = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <p><a href="{{resetUrl}}">Reset Your Password</a></p>
      <p>This link will expire in {{expiresIn}}.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    const resetUrl = `https://example.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    return await sendTemplatedEmail(
      email,
      'Password Reset Request',
      template,
      {
        resetUrl,
        expiresIn,
      },
      {
        headers: {
          'X-Priority': '1',
        },
      }
    );
  } catch (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}
```

### Provider Initialization

```javascript
/**
 * Initializes email provider based on environment
 * @param {string} env - Environment name ('development', 'staging', 'production')
 * @returns {Promise<void>}
 * @throws {Error} If initialization fails
 */
async function initEmailForEnvironment(env) {
  try {
    const defaultFrom = 'noreply@example.com';

    switch (env) {
      case 'development':
        // Use MailHog for development
        await initEmail('mailhog', {
          defaultFrom,
        });
        break;

      case 'testing':
        // Use Mailtrap for testing
        await initEmail('mailtrap', {
          auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS,
          },
          defaultFrom,
        });
        break;

      case 'staging':
        // Use SendGrid for staging
        await initEmail('sendgrid', {
          apiKey: process.env.SENDGRID_API_KEY,
          defaultFrom,
        });
        break;

      case 'production':
        // Use AWS SES for production
        await initEmail('ses', {
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
          defaultFrom,
        });
        break;

      default:
        throw new Error(`Unknown environment: ${env}`);
    }

    console.log(`Email initialized for ${env} environment`);
  } catch (error) {
    throw new Error(`Failed to initialize email: ${error.message}`);
  }
}
```

### Complete Email Service

```javascript
/**
 * Email service with common email patterns
 */
class EmailService {
  /**
   * Initializes the email service
   * @param {Object} config - Email configuration
   * @param {string} config.provider - Email provider type
   * @param {Object} config.providerConfig - Provider configuration
   * @param {string} config.defaultFrom - Default from address
   * @returns {Promise<void>}
   * @throws {Error} If initialization fails
   */
  async initialize(config) {
    try {
      this.defaultFrom = config.defaultFrom;
      await initEmail(config.provider, {
        ...config.providerConfig,
        defaultFrom: this.defaultFrom,
      });
    } catch (error) {
      throw new Error(`Failed to initialize email service: ${error.message}`);
    }
  }

  /**
   * Closes the email service
   * @returns {Promise<void>}
   */
  async close() {
    await closeEmail();
  }

  /**
   * Sends a welcome email
   * @param {string} email - User's email address
   * @param {string} name - User's name
   * @returns {Promise<Object>} Email send result
   */
  async sendWelcome(email, name) {
    const template = `
      <h1>Welcome, {{name}}!</h1>
      <p>Thank you for joining our service.</p>
      {{#if hasAccount}}
        <p>You can log in with your email: {{email}}</p>
      {{/if}}
    `;

    return sendTemplatedEmail(email, 'Welcome!', template, {
      name,
      email,
      hasAccount: true,
    });
  }

  /**
   * Sends a notification email
   * @param {string} email - User's email address
   * @param {string} subject - Email subject
   * @param {string} message - Notification message
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object>} Email send result
   */
  async sendNotification(email, subject, message, options = {}) {
    const html = `
      <div style="padding: 20px; background-color: #f7f7f7;">
        <h2>${subject}</h2>
        <p>${message}</p>
        ${options.actionUrl ? `<p><a href="${options.actionUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">${options.actionText || 'View Details'}</a></p>` : ''}
      </div>
    `;

    return sendEmail(email, subject, html, {
      replyTo: options.replyTo,
      headers: options.headers,
    });
  }
}
```

## Code Generation Rules

1. **Always use async/await** for asynchronous operations
2. **Include error handling** in all examples
3. **Use environment variables** for secrets
4. **Follow JSDoc format** exactly as shown
5. **Check for null/undefined** before operations
6. **Include try/catch blocks** for error handling

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
