# Email Module - Developer REFERENCE 🛠️

The email module provides a unified interface for sending emails through various
providers (SMTP, SendGrid, AWS SES, Mailgun), with additional testing providers
(MailHog, Mailtrap). It offers simple yet powerful features like template
rendering, attachment handling, and provider-specific options to simplify email
delivery in your Node.js applications.

Whether you need to send transactional emails, marketing communications, or
system notifications, this module provides flexible, composable utilities that
work with any Node.js framework.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📧 [Sending Emails](#sending-emails)
  - [Basic Emails](#basic-emails)
  - [HTML Emails](#html-emails)
  - [Adding Attachments](#adding-attachments)
  - [Multiple Recipients](#multiple-recipients)
  - [Complete Email Example](#complete-email-example)
- 📝 [Email Templates](#email-templates)
  - [Simple Variable Substitution](#simple-variable-substitution)
  - [Conditionals](#conditionals)
  - [Loops](#loops)
  - [Nested Objects](#nested-objects)

## Getting Started

### Installation

```bash
npm install @voilajs/appkit
```

### Basic Import

```javascript
import {
  initEmail,
  sendEmail,
  sendTemplatedEmail,
  closeEmail,
  getEmailProvider,
} from '@voilajs/appkit/email';
```

### Initialization

Before sending emails, you need to initialize a provider:

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

// Or SendGrid
await initEmail('sendgrid', {
  apiKey: 'your-sendgrid-api-key',
  defaultFrom: 'sender@example.com',
});

// Or MailHog for local development
await initEmail('mailhog', {
  defaultFrom: 'test@example.com',
});
```

**Expected Output:**

No return value, but initializes the provider for sending emails. If
initialization fails, an error will be thrown with a descriptive message.

**When to use:**

- **Application Startup**: Initialize the email provider when your application
  starts
- **Environment-Specific Config**: Different environments can use different
  providers
- **Feature Initialization**: When a feature that requires email is first
  accessed

💡 **Tip**: Store configuration in environment variables for better security.
Also, if your application uses dependency injection, you might want to create an
email service class that wraps these functions.

## Sending Emails

### Basic Emails

Use `sendEmail` to send simple emails:

```javascript
const result = await sendEmail(
  'recipient@example.com',
  'Hello World',
  '<p>This is a test email</p>'
);

console.log('Email sent with ID:', result.messageId);
```

**Expected Output:**

```
Email sent with ID: <1234567890@example.com>
```

The actual result object will vary based on the provider, but all providers will
return an object with at least:

- `success`: boolean indicating success
- `messageId`: string containing a unique message identifier

**When to use:**

- **Transactional Emails**: Order confirmations, account notifications, etc.
- **System Alerts**: Sending notifications to administrators
- **User Communications**: Password resets, welcome emails, etc.
- **Simple Notifications**: When you don't need complex templating

### HTML Emails

You can send rich HTML emails with CSS styling:

```javascript
const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    .header { background-color: #4285f4; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to Our Service</h1>
  </div>
  <div class="content">
    <p>Hello John,</p>
    <p>Thank you for signing up! We're excited to have you on board.</p>
    <p><strong>Your account is now active.</strong></p>
    <p>
      <a href="https://example.com/dashboard" style="background-color: #4285f4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
        Visit Your Dashboard
      </a>
    </p>
  </div>
  <div class="footer">
    <p>© 2025 Example Company. All rights reserved.</p>
    <p>If you didn't create this account, please <a href="https://example.com/contact">contact us</a>.</p>
  </div>
</body>
</html>
`;

await sendEmail('john@example.com', 'Welcome to Our Service', html, {
  text: 'Welcome to Our Service! Your account is now active. Visit your dashboard at https://example.com/dashboard',
});
```

**When to use:**

- **Marketing Emails**: Rich visual content for marketing campaigns
- **Newsletters**: Formatted content with images and styling
- **Welcome Emails**: Making a good first impression with styled content
- **Any Email**: When you want to provide a better user experience than plain
  text

💡 **Tip**: Always include a plain text version (`text` option) for clients that
don't support HTML and for better deliverability.

### Adding Attachments

Add files as attachments to your emails:

```javascript
import fs from 'fs';

await sendEmail(
  'recipient@example.com',
  'Monthly Report',
  '<p>Please find the monthly report attached.</p>',
  {
    attachments: [
      {
        filename: 'report.pdf',
        content: fs.readFileSync('./reports/may-2025.pdf'),
      },
      {
        filename: 'data.xlsx',
        content: fs.readFileSync('./data/may-2025.xlsx'),
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
  }
);
```

**When to use:**

- **Reports**: Sending PDF reports or Excel spreadsheets
- **Invoices**: Attaching PDF invoices to order confirmations
- **Contracts**: Sending legal documents for signatures
- **Resources**: Providing downloadable resources mentioned in the email

💡 **Tip**: Be mindful of attachment sizes. Most email servers reject emails
with attachments over 10MB. For large files, consider including download links
instead.

### Multiple Recipients

Send to multiple recipients and use CC/BCC:

```javascript
await sendEmail(
  ['primary@example.com', 'secondary@example.com'],
  'Team Update',
  '<p>Here is the latest team update...</p>',
  {
    cc: 'manager@example.com',
    bcc: ['records@example.com', 'archive@example.com'],
    replyTo: 'team-updates@example.com',
  }
);
```

**When to use:**

- **Team Communications**: When multiple team members need the same information
- **Group Notifications**: Event invites, group announcements
- **Reporting**: Including managers in CC for visibility
- **Record Keeping**: Using BCC for archiving or compliance purposes

### Complete Email Example

Here's a comprehensive example showing various email features:

```javascript
import fs from 'fs';

async function sendMonthlyReport(userEmail, userName, reportMonth, reportData) {
  try {
    // Create HTML content with inline CSS
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
          <h1>Monthly Report: ${reportMonth}</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p>Hello ${userName},</p>
          
          <p>Please find attached your monthly report for ${reportMonth}.</p>
          
          <h3>Key Highlights:</h3>
          <ul>
            <li>Revenue: $${reportData.revenue.toLocaleString()}</li>
            <li>New Customers: ${reportData.newCustomers}</li>
            <li>Customer Satisfaction: ${reportData.satisfaction}%</li>
          </ul>
          
          <p style="margin-top: 30px;">
            <a href="https://dashboard.example.com/reports/${reportData.id}" 
               style="background-color: #3498db; color: white; padding: 10px 15px; 
                      text-decoration: none; border-radius: 4px;">
              View Full Report Online
            </a>
          </p>
        </div>
        
        <div style="text-align: center; padding: 15px; font-size: 12px; color: #7f8c8d;">
          <p>© 2025 Example Company Inc. All rights reserved.</p>
          <p>
            <a href="https://example.com/unsubscribe?email=${encodeURIComponent(userEmail)}">
              Unsubscribe
            </a> | 
            <a href="https://example.com/preferences?email=${encodeURIComponent(userEmail)}">
              Update Preferences
            </a>
          </p>
        </div>
      </div>
    `;

    // Plain text alternative
    const text = `
      Monthly Report: ${reportMonth}
      
      Hello ${userName},
      
      Please find attached your monthly report for ${reportMonth}.
      
      Key Highlights:
      - Revenue: $${reportData.revenue.toLocaleString()}
      - New Customers: ${reportData.newCustomers}
      - Customer Satisfaction: ${reportData.satisfaction}%
      
      View the full report online at: https://dashboard.example.com/reports/${reportData.id}
      
      © 2025 Example Company Inc. All rights reserved.
      Unsubscribe: https://example.com/unsubscribe?email=${encodeURIComponent(userEmail)}
      Update Preferences: https://example.com/preferences?email=${encodeURIComponent(userEmail)}
    `;

    // Generate PDF report (hypothetical function)
    const reportBuffer = await generateReportPDF(reportData);

    // Send the email
    const result = await sendEmail(
      userEmail,
      `Your ${reportMonth} Business Report`,
      html,
      {
        text,
        from: 'reports@example.com',
        replyTo: 'support@example.com',
        attachments: [
          {
            filename: `${reportMonth.toLowerCase().replace(' ', '-')}-report.pdf`,
            content: reportBuffer,
            type: 'application/pdf',
          },
        ],
        headers: {
          'X-Report-ID': reportData.id,
          'X-Report-Month': reportMonth,
        },
      }
    );

    console.log(
      `Report email sent to ${userEmail} with ID: ${result.messageId}`
    );
    return result;
  } catch (error) {
    console.error(`Failed to send report email: ${error.message}`);
    throw new Error(`Report email failed: ${error.message}`);
  }
}

// Usage
await sendMonthlyReport('jane@example.com', 'Jane Smith', 'May 2025', {
  id: 'REP-2025-05',
  revenue: 128750,
  newCustomers: 34,
  satisfaction: 94,
});
```

**When to implement:**

- **Business Reports**: Monthly statements, analytics reports
- **Marketing Campaigns**: Promotional emails with tracking and styling
- **Personalized Notifications**: Custom user communications with personal data
- **Transactional Emails**: Order confirmations, shipping notifications, etc.

## Email Templates

The email module includes a simple but powerful template engine that supports
variable substitution, conditionals, and loops.

### Simple Variable Substitution

Replace variables in your templates:

```javascript
const template = `
  <h1>Hello {{name}}!</h1>
  <p>Welcome to {{companyName}}.</p>
`;

await sendTemplatedEmail('user@example.com', 'Welcome', template, {
  name: 'John',
  companyName: 'Acme Inc',
});
```

**Expected Output:**

The rendered email will contain:

```html
<h1>Hello John!</h1>
<p>Welcome to Acme Inc.</p>
```

**When to use:**

- **Personalized Emails**: Adding user names and other personal data
- **Dynamic Content**: Inserting dynamic values like dates, prices, etc.
- **Reusable Templates**: Creating standardized email templates with
  placeholders

### Conditionals

Show content conditionally:

```javascript
const template = `
  <h1>Order #{{orderId}}</h1>
  
  {{#if isShipped}}
    <p>Your order has been shipped and will arrive on {{deliveryDate}}.</p>
    <p>Tracking number: {{trackingNumber}}</p>
  {{/if}}
  
  {{#if isPending}}
    <p>Your order is being processed. We'll notify you when it ships.</p>
  {{/if}}
`;

await sendTemplatedEmail('customer@example.com', 'Order Update', template, {
  orderId: '12345',
  isShipped: true,
  deliveryDate: 'May 15, 2025',
  trackingNumber: 'TRK-987654321',
  isPending: false,
});
```

**Expected Output:**

```html
<h1>Order #12345</h1>

<p>Your order has been shipped and will arrive on May 15, 2025.</p>
<p>Tracking number: TRK-987654321</p>
```

**When to use:**

- **Status-Dependent Content**: Show different content based on order status,
  subscription tier, etc.
- **Feature Announcements**: Show feature announcements only to eligible users
- **Optional Content**: Include sections only when certain data is available
- **User-Specific Information**: Show different content based on user
  preferences or history

### Loops

Iterate over arrays:

```javascript
const template = `
  <h1>Your Shopping Cart</h1>
  
  <table>
    <tr>
      <th>Product</th>
      <th>Quantity</th>
      <th>Price</th>
    </tr>
    {{#each items}}
      <tr>
        <td>{{name}}</td>
        <td>{{quantity}}</td>
        <td>${{ price }}</td>
      </tr>
    {{/each}}
  </table>
  
  <p><strong>Total: ${{ total }}</strong></p>
`;

await sendTemplatedEmail('shopper@example.com', 'Your Cart Summary', template, {
  items: [
    { name: 'Wireless Headphones', quantity: 1, price: 79.99 },
    { name: 'Phone Case', quantity: 2, price: 19.99 },
    { name: 'Charging Cable', quantity: 3, price: 9.99 },
  ],
  total: 149.94,
});
```

**Expected Output:**

A table with three rows containing the product information and a total at the
bottom.

**When to use:**

- **Product Lists**: Orders, shopping carts, wish lists
- **Event Schedules**: Listing event sessions or schedules
- **Activity Summaries**: Showing recent activities or notifications
- **Feature Lists**: Displaying features included in a subscription

### Nested Objects

Access nested properties:

```javascript
const template = `
  <h1>Account Summary</h1>
  
  <h2>Personal Information</h2>
  <p>Name: {{user.name}}</p>
  <p>Email: {{user.email}}</p>
  
  <h2>Subscription Details</h2>
  <p>Plan: {{user.subscription.plan}}</p>
  <p>Status: {{user.subscription.status}}</p>
  <p>Next billing date: {{user.subscription.nextBillingDate}}</p>
`;

await sendTemplatedEmail('member@example.com', 'Account Summary', template, {
  user: {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    subscription: {
      plan: 'Professional',
      status: 'Active',
      nextBillingDate: 'June 15, 2025',
    },
  },
});
```

**When to use:**

- **Complex Data Structures**: When your data has nested objects
- **User Profiles**: Displaying user profile information
- **Account Summaries**: Showing account details with hierarchical data
- **Product Information**: Displaying product details with nested attributes

---

## Complete Template Example

This example combines variables, conditionals, and loops to create a
comprehensive order confirmation email:

```javascript
async function sendOrderConfirmation(order) {
  const template = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
        <h1>Order Confirmation</h1>
        <p>Order #{{orderId}}</p>
      </div>
      
      <div style="padding: 20px;">
        <p>Hello {{customer.name}},</p>
        
        <p>Thank you for your order! We've received your payment and are processing your order.</p>
        
        <h2>Order Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f2f2f2;">
            <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Item</th>
            <th style="text-align: center; padding: 8px; border: 1px solid #ddd;">Qty</th>
            <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Price</th>
            <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Total</th>
          </tr>
          {{#each items}}
          <tr>
            <td style="text-align: left; padding: 8px; border: 1px solid #ddd;">{{name}}</td>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">{{quantity}}</td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${{ price }}</td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${{ total }}</td>
          </tr>
          {{/each}}
          <tr>
            <td colspan="3" style="text-align: right; padding: 8px; border: 1px solid #ddd;"><strong>Subtotal:</strong></td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${{ subtotal }}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right; padding: 8px; border: 1px solid #ddd;"><strong>Tax:</strong></td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${{ tax }}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right; padding: 8px; border: 1px solid #ddd;"><strong>Shipping:</strong></td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${{ shipping }}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right; padding: 8px; border: 1px solid #ddd;"><strong>Total:</strong></td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;"><strong>${{ total }}</strong></td>
          </tr>
        </table>
        
        <h2>Shipping Information</h2>
        <p>
          {{customer.name}}<br>
          {{shipping.address.street}}<br>
          {{shipping.address.city}}, {{shipping.address.state}} {{shipping.address.zip}}<br>
          {{shipping.address.country}}
        </p>
        
        {{#if shipping.trackingNumber}}
        <p>
          <strong>Tracking Number:</strong> {{shipping.trackingNumber}}<br>
          <a href="{{shipping.trackingUrl}}">Track Your Package</a>
        </p>
        {{/if}}
        
        <h2>Payment Information</h2>
        <p>
          <strong>Payment Method:</strong> {{payment.method}}<br>
          {{#if payment.isCard}}
          <strong>Card:</strong> {{payment.cardType}} ending in {{payment.last4}}<br>
          {{/if}}
          <strong>Payment Status:</strong> {{payment.status}}
        </p>
        
        {{#if estimatedDelivery}}
        <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
        {{/if}}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>If you have any questions about your order, please <a href="mailto:support@example.com">contact our support team</a>.</p>
        </div>
      </div>
      
      <div style="background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 12px;">
        <p>© 2025 Your Company. All rights reserved.</p>
        <p>123 Commerce St, Example City, EX 12345</p>
      </div>
    </div>
  `;

  await sendTemplatedEmail(
    order.customer.email,
    `Order Confirmation #${order.orderId}`,
    template,
    {
      orderId: order.orderId,
      customer: order.customer,
      items: order.items.map((item) => ({
        ...item,
        total: (item.price * item.quantity).toFixed(2),
      })),
      subtotal: order.subtotal.toFixed(2),
      tax: order.tax.toFixed(2),
      shipping: order.shipping.toFixed(2),
      total: order.total.toFixed(2),
      shipping: order.shipping,
      payment: {
        ...order.payment,
        isCard: order.payment.method === 'Credit Card',
      },
      estimatedDelivery: order.estimatedDelivery,
    }
  );
}

// Usage example
await sendOrderConfirmation({
  orderId: 'ORD-12345',
  customer: {
    name: 'John Smith',
    email: 'john@example.com',
  },
  items: [
    { name: 'Wireless Earbuds', quantity: 1, price: 99.99 },
    { name: 'Phone Case', quantity: 2, price: 19.99 },
  ],
  subtotal: 139.97,
  tax: 11.2,
  shipping: 5.99,
  total: 157.16,
  shipping: {
    method: 'Standard Shipping',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
      country: 'United States',
    },
    trackingNumber: 'TRK-987654321',
    trackingUrl: 'https://example.com/track/TRK-987654321',
  },
  payment: {
    method: 'Credit Card',
    cardType: 'Visa',
    last4: '4567',
    status: 'Paid',
  },
  estimatedDelivery: 'May 18-20, 2025',
});
```

**When to implement:**

- **Transactional Emails**: Order confirmations, receipts, shipping
  notifications
- **Reports**: Financial reports, activity summaries
- **Marketing Templates**: Promotional emails with dynamic content
- **Notifications**: Alert templates that adapt to different scenarios

## Email Providers

The module supports multiple email providers that can be selected based on your
needs.

### SMTP

SMTP is the standard protocol for sending emails and works with any SMTP server:

```javascript
await initEmail('smtp', {
  host: 'smtp.example.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'username',
    pass: 'password',
  },
  defaultFrom: 'sender@example.com',

  // Optional settings
  pool: true, // use pooled connections
  maxConnections: 5, // limit concurrent connections
  tls: {
    rejectUnauthorized: true, // reject unauthorized TLS/SSL certificates
  },
  verifyConnection: true, // verify connection configuration
});
```

**When to use:**

- **General Purpose**: Most common email sending method
- **Self-Hosted**: If you run your own mail server
- **High Control**: If you need fine-grained control over email delivery
- **Email Service Integration**: Works with Gmail, Outlook, and other SMTP
  services

💡 **Tip**: If you use Google Workspace or Gmail, you may need to create an App
Password rather than using your regular password. For high-volume sending,
consider using a dedicated email service (SendGrid, SES, etc.) instead of SMTP.

### SendGrid

SendGrid is a cloud-based email service that offers high deliverability and
analytics:

```javascript
await initEmail('sendgrid', {
  apiKey: 'your-sendgrid-api-key',
  defaultFrom: 'sender@example.com',
  timeout: 30000, // optional timeout in milliseconds
});
```

**When to use:**

- **High Volume**: Sending thousands or millions of emails
- **Marketing Campaigns**: For promotional and marketing emails
- **Deliverability Focus**: When email delivery rates are critical
- **Analytics Needs**: If you need detailed email analytics
- **Transactional Emails**: Order confirmations, password resets, etc.

💡 **Tip**: SendGrid allows you to use templates defined in their dashboard. To
use these templates, see the SendGrid-specific options in the API Reference.

### AWS SES

Amazon Simple Email Service (SES) is a cost-effective email service with high
reliability:

```javascript
await initEmail('ses', {
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'your-access-key',
    secretAccessKey: 'your-secret-key',
  },
  defaultFrom: 'sender@example.com',
  configurationSet: 'your-config-set', // optional
});
```

**When to use:**

- **AWS Integration**: If your app already uses AWS services
- **Cost Efficiency**: One of the most affordable options for high volume
- **High Throughput**: Capable of handling very high sending rates
- **Transactional Emails**: Excellent for system notifications and transactional
  emails

💡 **Tip**: Remember to verify your sending domains and email addresses in the
AWS SES console before sending emails in production.

### Mailgun

Mailgun is a transactional email API service with powerful features:

```javascript
await initEmail('mailgun', {
  apiKey: 'your-mailgun-api-key',
  domain: 'mg.yourdomain.com',
  defaultFrom: 'sender@yourdomain.com',
  url: 'https://api.mailgun.net', // default API endpoint
});
```

**When to use:**

- **High Deliverability**: When email delivery is critical
- **Developer Focus**: API-first approach for developers
- **Email Validation**: If you need email validation features
- **Detailed Logs**: For tracking and troubleshooting
- **Transactional Emails**: Order confirmations, welcome emails, etc.

### MailHog (Testing)

MailHog is a development tool that captures emails for testing:

```javascript
await initEmail('mailhog', {
  host: 'localhost', // default
  port: 1025, // default SMTP port
  webPort: 8025, // default web UI port
  defaultFrom: 'test@example.com',
});
```

**When to use:**

- **Local Development**: Test email sending without delivering to real
  recipients
- **Visual Testing**: MailHog provides a web UI to view sent emails
- **Integration Testing**: Capture and verify emails in automated tests
- **Team Development**: Share a MailHog instance among development team

💡 **Tip**: You need to have MailHog running locally or in a container. Download
from https://github.com/mailhog/MailHog.

### Mailtrap (Testing)

Mailtrap is a safe testing environment for email notifications:

```javascript
await initEmail('mailtrap', {
  auth: {
    user: 'your-mailtrap-username',
    pass: 'your-mailtrap-password',
  },
  port: 2525, // default Mailtrap port
  defaultFrom: 'test@example.com',
  inboxId: 'your-inbox-id', // optional, for URL generation
});
```

**When to use:**

- **Team Testing**: Share test inbox with your team
- **CI/CD Integration**: Use in continuous integration pipelines
- **Staging Environments**: Test emails in staging environments
- **Visual Testing**: View HTML emails in a safe environment

## Testing Emails

Proper email testing is essential to ensure your emails look good and function
correctly.

### Local Development Testing

For local development, use MailHog:

```javascript
async function setupTestEnv() {
  await initEmail('mailhog', {
    defaultFrom: 'test@example.com',
  });

  // Test sending various emails
  await sendEmail(
    'recipient@example.com',
    'Test Email',
    '<p>This is a test email.</p>'
  );

  console.log('Check email in MailHog UI: http://localhost:8025');
}
```

**Expected Output:**

The email will be captured by MailHog and viewable in its web interface at
http://localhost:8025.

**When to use:**

- **Daily Development**: During regular development work
- **Initial Testing**: First-pass testing of email templates
- **Rapid Iteration**: When you need to quickly test changes
- **Offline Development**: When working without internet connection

### Staging Environment Testing

For staging environments, use Mailtrap:

```javascript
async function setupStagingEnv() {
  await initEmail('mailtrap', {
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD,
    },
    inboxId: process.env.MAILTRAP_INBOX_ID,
    defaultFrom: 'staging@example.com',
  });

  // Test sending with real templates
  await sendTemplatedEmail(
    'test@example.com',
    'Staging Test',
    orderConfirmationTemplate,
    testOrderData
  );

  console.log('Check email in Mailtrap inbox');
}
```

**When to use:**

- **Team Testing**: When multiple team members need to review emails
- **QA Testing**: For formal quality assurance testing
- **Cross-Client Testing**: Mailtrap shows how emails look in different clients
- **CI/CD Integration**: For automated testing in continuous integration

### Test Environment Setup

Create a testing utility for your application:

```javascript
// test-utils/email.js
import { initEmail, closeEmail, sendEmail } from '@voilajs/appkit/email';

/**
 * Sets up the email testing environment
 * @param {string} env - Environment name ('local', 'ci', 'staging')
 * @returns {Promise<void>}
 */
export async function setupEmailTesting(env = 'local') {
  // Close any existing provider
  try {
    await closeEmail();
  } catch (error) {
    // Ignore errors during close
  }

  // Initialize appropriate provider
  if (env === 'local') {
    return initEmail('mailhog', {
      defaultFrom: 'test@example.com',
    });
  }

  if (env === 'ci') {
    return initEmail('mailtrap', {
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
      inboxId: process.env.MAILTRAP_INBOX_ID,
      defaultFrom: 'ci-test@example.com',
    });
  }

  if (env === 'staging') {
    return initEmail('sendgrid', {
      apiKey: process.env.SENDGRID_API_KEY,
      defaultFrom: 'staging@example.com',
    });
  }

  throw new Error(`Unknown environment: ${env}`);
}

/**
 * Captures an email for testing
 * @param {Function} emailFn - Function that sends an email
 * @returns {Promise<Object>} Email result
 */
export async function captureEmail(emailFn) {
  // Setup test environment
  await setupEmailTesting('local');

  // Execute the email function
  const result = await emailFn();

  console.log(`Email captured: ${result.messageId}`);
  console.log(`View at http://localhost:8025`);

  return result;
}
```

**When to implement:**

- **Automated Testing**: For integration tests that verify email sending
- **Developer Utilities**: To make it easy for developers to test emails
- **CI/CD Pipelines**: For consistent email testing in CI/CD

## Complete Integration Example

Here's a complete example showing how to integrate email functionality into an
application:

```javascript
import express from 'express';
import dotenv from 'dotenv';
import {
  initEmail,
  sendEmail,
  sendTemplatedEmail,
  closeEmail,
} from '@voilajs/appkit/email';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Create express app
const app = express();
app.use(express.json());

// Initialize email based on environment
async function initializeApp() {
  const NODE_ENV = process.env.NODE_ENV || 'development';

  try {
    // Initialize email provider based on environment
    if (NODE_ENV === 'production') {
      await initEmail('ses', {
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        defaultFrom: process.env.EMAIL_FROM,
      });
      console.log('Email initialized with AWS SES for production');
    } else if (NODE_ENV === 'staging') {
      await initEmail('sendgrid', {
        apiKey: process.env.SENDGRID_API_KEY,
        defaultFrom: process.env.EMAIL_FROM,
      });
      console.log('Email initialized with SendGrid for staging');
    } else {
      await initEmail('mailhog', {
        defaultFrom: process.env.EMAIL_FROM || 'dev@example.com',
      });
      console.log('Email initialized with MailHog for development');
    }
  } catch (error) {
    console.error('Failed to initialize email:', error);
    process.exit(1);
  }
}

// Load email templates
const templates = {
  welcome: fs.readFileSync(
    path.join(__dirname, 'templates/welcome.html'),
    'utf8'
  ),
  passwordReset: fs.readFileSync(
    path.join(__dirname, 'templates/password-reset.html'),
    'utf8'
  ),
  orderConfirmation: fs.readFileSync(
    path.join(__dirname, 'templates/order-confirmation.html'),
    'utf8'
  ),
};

// Email service
const emailService = {
  async sendWelcomeEmail(user) {
    return sendTemplatedEmail(
      user.email,
      'Welcome to Example App',
      templates.welcome,
      {
        name: user.name,
        activationLink: `https://example.com/activate?token=${user.activationToken}`,
      }
    );
  },

  async sendPasswordResetEmail(user, resetToken) {
    return sendTemplatedEmail(
      user.email,
      'Password Reset Request',
      templates.passwordReset,
      {
        name: user.name,
        resetLink: `https://example.com/reset-password?token=${resetToken}`,
        expiresIn: '1 hour',
      }
    );
  },

  async sendOrderConfirmation(order) {
    return sendTemplatedEmail(
      order.customer.email,
      `Order Confirmation #${order.id}`,
      templates.orderConfirmation,
      {
        orderId: order.id,
        customer: order.customer,
        items: order.items.map((item) => ({
          ...item,
          total: (item.price * item.quantity).toFixed(2),
        })),
        subtotal: order.subtotal.toFixed(2),
        tax: order.tax.toFixed(2),
        shipping: order.shipping.toFixed(2),
        total: order.total.toFixed(2),
        shipping: order.shipping,
        payment: order.payment,
      }
    );
  },
};

// API routes
app.post('/api/users', async (req, res) => {
  try {
    const user = req.body;

    // Create user in database (not shown)

    // Send welcome email
    await emailService.sendWelcomeEmail(user);

    res.status(201).json({
      message: 'User created successfully',
      userId: user.id,
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user (not shown)
    const user = { name: 'Test User', email };

    // Generate reset token (not shown)
    const resetToken = 'test-reset-token';

    // Send password reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.json({
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = req.body;

    // Create order in database (not shown)

    // Send order confirmation email
    await emailService.sendOrderConfirmation(order);

    res.status(201).json({
      message: 'Order created successfully',
      orderId: order.id,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await closeEmail();
    console.log('Email connections closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
async function startServer() {
  await initializeApp();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});
```

**When to implement:**

- **New Web Applications**: When building a new application that requires email
  functionality
- **API Services**: For backend services that send notifications
- **Microservices**: As a dedicated email service in a microservice architecture
- **Express Applications**: For Node.js Express applications with email
  capabilities

## Additional Resources

- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/email/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajs/appkit/blob/main/src/email/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation
- 📘 [Nodemailer Documentation](https://nodemailer.com/) - Documentation for the
  underlying SMTP library
- 📕
  [SendGrid API Documentation](https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api) -
  SendGrid API reference
- 📗
  [AWS SES Documentation](https://docs.aws.amazon.com/ses/latest/dg/Welcome.html) -
  AWS SES developer guide

## Best Practices

### 🔐 Security

1. **Environment Variables**: Store all email provider credentials in
   environment variables, never in code
2. **Verification Links**: Use signed tokens for email verification links to
   prevent tampering
3. **HTML Sanitization**: Sanitize user-provided content before including it in
   HTML emails
4. **Rate Limiting**: Implement rate limiting for password reset and
   verification emails to prevent abuse
5. **DKIM/SPF/DMARC**: Configure proper email authentication records for your
   domains
6. **Encrypted Connections**: Always use secure connections (TLS/SSL) when
   sending emails

### 🏗️ Architecture

1. **Service Abstraction**: Create a service layer that abstracts email
   functionality
2. **Template Management**: Store email templates in separate files, not in code
3. **Error Handling**: Implement proper error handling and logging for email
   failures
4. **Queue System**: For production systems, consider using a queue for email
   sending
5. **Graceful Shutdown**: Properly close email connections when shutting down
   your application
6. **Provider Fallback**: Consider implementing fallback providers for critical
   emails

### 🚀 Performance

1. **Connection Pooling**: Use connection pooling for SMTP to improve
   performance
2. **Template Caching**: Cache compiled templates to avoid repeated parsing
3. **Batch Sending**: Use batch sending for large volumes of similar emails
4. **Asynchronous Sending**: Send emails asynchronously to avoid blocking the
   main thread
5. **Provider Selection**: Choose the right provider based on volume and
   delivery requirements

### 👥 User Experience

1. **Plain Text Alternative**: Always include a plain text version of HTML
   emails
2. **Responsive Design**: Make your emails responsive for mobile devices
3. **Test Across Clients**: Test emails in various email clients before sending
4. **Unsubscribe Links**: Include unsubscribe links in marketing emails
5. **Consistent Branding**: Maintain consistent branding across all email
   templates
6. **Minimal Attachments**: Avoid large attachments when possible

### 📧 Email Design

1. **Inline CSS**: Use inline CSS for better compatibility across email clients
2. **Simple Layouts**: Keep email layouts simple for better compatibility
3. **Image Hosting**: Host images on a CDN for better performance
4. **Alt Text**: Always include alt text for images
5. **Testing First**: Always test emails before sending to real users
6. **Preview Text**: Include preview text for better inbox view

### 🧪 Testing

1. **Local Testing**: Use MailHog for local development testing
2. **Staging Testing**: Use Mailtrap for staging environment testing
3. **Automated Testing**: Implement automated tests for email sending
4. **Cross-Client Testing**: Test emails in various email clients
5. **Content Testing**: Test emails with different content scenarios
6. **Edge Cases**: Test error handling and edge cases

### 📈 Monitoring

1. **Delivery Tracking**: Implement tracking for email delivery
2. **Bounce Handling**: Handle bounced emails appropriately
3. **Error Logging**: Log email sending errors for troubleshooting
4. **Performance Monitoring**: Monitor email sending performance
5. **Queue Monitoring**: If using a queue, monitor queue health
6. **Provider Status**: Monitor email provider status

### 🌐 Internationalization

1. **Localized Templates**: Support multiple languages in email templates
2. **Character Encoding**: Ensure proper character encoding for international
   content
3. **Time Zones**: Account for time zones in date/time display
4. **Language Selection**: Allow users to select their preferred language
5. **Cultural Considerations**: Be aware of cultural differences in email design
6. **Translation Management**: Implement a system for managing translations

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
