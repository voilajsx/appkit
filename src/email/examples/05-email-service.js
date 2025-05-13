/**
 * Email Service - @voilajs/appkit Email Module
 *
 * Example showing how to create a reusable email service
 * with various email templates and functionality
 *
 * Run: node 05-email-service.js
 */

import {
  initEmail,
  sendEmail,
  sendTemplatedEmail,
  closeEmail,
} from '@voilajs/appkit/email';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Email Service class for handling all email functionality
 */
class EmailService {
  /**
   * Initialize the email service
   * @param {Object} options - Configuration options
   * @param {string} options.environment - Environment (development, testing, staging, production)
   * @param {Object} options.config - Provider-specific configuration
   * @param {string} options.templatesDir - Path to email templates directory
   * @returns {Promise<void>}
   */
  async initialize(options = {}) {
    const {
      environment = process.env.NODE_ENV || 'development',
      config = {},
      templatesDir = path.join(process.cwd(), 'templates'),
    } = options;

    this.environment = environment;
    this.templatesDir = templatesDir;

    // Create templates directory if it doesn't exist
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }

    // Initialize sample templates if they don't exist
    this._initializeSampleTemplates();

    // Load all templates
    this.templates = this._loadTemplates();

    // Initialize provider based on environment
    await this._initializeProvider(environment, config);

    console.log(`Email service initialized for ${environment} environment`);
  }

  /**
   * Close the email service connections
   * @returns {Promise<void>}
   */
  async close() {
    await closeEmail();
    console.log('Email service closed');
  }

  /**
   * Send a welcome email to a new user
   * @param {Object} user - User information
   * @param {string} user.email - User's email address
   * @param {string} user.name - User's name
   * @param {string} user.activationToken - Account activation token
   * @returns {Promise<Object>} Email result
   */
  async sendWelcomeEmail(user) {
    if (!user || !user.email || !user.name) {
      throw new Error('User email and name are required');
    }

    const baseUrl = this._getBaseUrl();
    const activationUrl = `${baseUrl}/activate-account?token=${user.activationToken || 'sample-token'}`;

    return sendTemplatedEmail(
      user.email,
      'Welcome to Our Service',
      this.templates.welcome,
      {
        name: user.name,
        activationUrl,
        company: 'Example Company',
        year: new Date().getFullYear(),
        supportEmail: 'support@example.com',
      }
    );
  }

  /**
   * Send a password reset email
   * @param {Object} user - User information
   * @param {string} user.email - User's email address
   * @param {string} user.name - User's name
   * @param {string} resetToken - Password reset token
   * @param {string} expiration - Token expiration time (e.g., "1 hour")
   * @returns {Promise<Object>} Email result
   */
  async sendPasswordResetEmail(user, resetToken, expiration = '1 hour') {
    if (!user || !user.email) {
      throw new Error('User email is required');
    }

    if (!resetToken) {
      throw new Error('Reset token is required');
    }

    const baseUrl = this._getBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    return sendTemplatedEmail(
      user.email,
      'Password Reset Request',
      this.templates.passwordReset,
      {
        name: user.name || 'Valued Customer',
        resetUrl,
        expiration,
        company: 'Example Company',
        year: new Date().getFullYear(),
        supportEmail: 'support@example.com',
      }
    );
  }

  /**
   * Send an order confirmation email
   * @param {Object} order - Order information
   * @param {string} order.id - Order ID
   * @param {Object} order.customer - Customer information
   * @param {string} order.customer.email - Customer email
   * @param {string} order.customer.name - Customer name
   * @param {Array} order.items - Order items
   * @param {number} order.subtotal - Order subtotal
   * @param {number} order.tax - Order tax
   * @param {number} order.shipping - Order shipping
   * @param {number} order.total - Order total
   * @param {Object} order.shippingAddress - Shipping address
   * @returns {Promise<Object>} Email result
   */
  async sendOrderConfirmationEmail(order) {
    if (!order || !order.customer || !order.customer.email) {
      throw new Error('Order with customer email is required');
    }

    // Prepare items with calculated totals
    const items = (order.items || []).map((item) => ({
      ...item,
      total: ((item.price || 0) * (item.quantity || 1)).toFixed(2),
    }));

    return sendTemplatedEmail(
      order.customer.email,
      `Order Confirmation #${order.id || '12345'}`,
      this.templates.orderConfirmation,
      {
        orderId: order.id || '12345',
        customer: order.customer,
        items,
        subtotal: (order.subtotal || 0).toFixed(2),
        tax: (order.tax || 0).toFixed(2),
        shipping: (order.shipping || 0).toFixed(2),
        total: (order.total || 0).toFixed(2),
        shippingAddress: order.shippingAddress || {},
        orderDate: order.date || new Date().toLocaleDateString(),
        company: 'Example Company',
        year: new Date().getFullYear(),
        supportEmail: 'support@example.com',
      }
    );
  }

  /**
   * Send a custom email
   * @param {string|string[]} to - Recipient email address(es)
   * @param {string} subject - Email subject
   * @param {string} templateName - Name of the template to use
   * @param {Object} data - Template data
   * @param {Object} options - Additional email options
   * @returns {Promise<Object>} Email result
   */
  async sendCustomEmail(to, subject, templateName, data = {}, options = {}) {
    if (!to) {
      throw new Error('Recipient email is required');
    }

    if (!subject) {
      throw new Error('Email subject is required');
    }

    if (!this.templates[templateName]) {
      throw new Error(`Template "${templateName}" not found`);
    }

    return sendTemplatedEmail(
      to,
      subject,
      this.templates[templateName],
      {
        ...data,
        company: 'Example Company',
        year: new Date().getFullYear(),
        supportEmail: 'support@example.com',
      },
      options
    );
  }

  /**
   * Initialize email provider based on environment
   * @param {string} environment - Environment name
   * @param {Object} config - Provider configuration
   * @returns {Promise<void>}
   * @private
   */
  async _initializeProvider(environment, config) {
    // Close any existing connection
    try {
      await closeEmail();
    } catch (error) {
      // Ignore errors on close
    }

    // Initialize appropriate provider based on environment
    switch (environment) {
      case 'production':
        await initEmail('ses', {
          region: config.awsRegion || process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: config.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey:
              config.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
          },
          defaultFrom:
            config.defaultFrom ||
            process.env.EMAIL_FROM ||
            'noreply@example.com',
        });
        break;

      case 'staging':
        await initEmail('sendgrid', {
          apiKey: config.sendgridApiKey || process.env.SENDGRID_API_KEY,
          defaultFrom:
            config.defaultFrom ||
            process.env.EMAIL_FROM ||
            'staging@example.com',
        });
        break;

      case 'testing':
        await initEmail('mailtrap', {
          auth: {
            user: config.mailtrapUser || process.env.MAILTRAP_USER,
            pass: config.mailtrapPass || process.env.MAILTRAP_PASS,
          },
          defaultFrom:
            config.defaultFrom ||
            process.env.EMAIL_FROM ||
            'testing@example.com',
        });
        break;

      case 'development':
      default:
        await initEmail('mailhog', {
          host: config.mailhogHost || 'localhost',
          port: config.mailhogPort || 1025,
          defaultFrom:
            config.defaultFrom || process.env.EMAIL_FROM || 'dev@example.com',
        });
        break;
    }
  }

  /**
   * Load all email templates from the templates directory
   * @returns {Object} Object containing all templates
   * @private
   */
  _loadTemplates() {
    const templates = {};

    // Read all HTML files from the templates directory
    const files = fs.readdirSync(this.templatesDir);

    files.forEach((file) => {
      if (file.endsWith('.html')) {
        const templateName = path.basename(file, '.html');
        const templatePath = path.join(this.templatesDir, file);
        templates[templateName] = fs.readFileSync(templatePath, 'utf8');
      }
    });

    return templates;
  }

  /**
   * Initialize sample email templates if they don't exist
   * @private
   */
  _initializeSampleTemplates() {
    // Create sample welcome email template
    const welcomePath = path.join(this.templatesDir, 'welcome.html');
    if (!fs.existsSync(welcomePath)) {
      fs.writeFileSync(
        welcomePath,
        `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4285f4; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .button { background-color: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
              .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to {{company}}!</h1>
              </div>
              <div class="content">
                <p>Hello {{name}},</p>
                <p>Thank you for signing up! We're excited to have you on board.</p>
                <p>To activate your account, please click the button below:</p>
                <p style="text-align: center;">
                  <a href="{{activationUrl}}" class="button">Activate Account</a>
                </p>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p>{{activationUrl}}</p>
                <p>If you didn't create an account, you can ignore this email.</p>
              </div>
              <div class="footer">
                <p>© {{year}} {{company}}. All rights reserved.</p>
                <p>If you need assistance, please contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
              </div>
            </div>
          </body>
          </html>
        `
      );
    }

    // Create sample password reset email template
    const passwordResetPath = path.join(
      this.templatesDir,
      'passwordReset.html'
    );
    if (!fs.existsSync(passwordResetPath)) {
      fs.writeFileSync(
        passwordResetPath,
        `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .button { background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
              .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello {{name}},</p>
                <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
                <p>To reset your password, please click the button below:</p>
                <p style="text-align: center;">
                  <a href="{{resetUrl}}" class="button">Reset Password</a>
                </p>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p>{{resetUrl}}</p>
                <p>This link will expire in {{expiration}}.</p>
              </div>
              <div class="footer">
                <p>© {{year}} {{company}}. All rights reserved.</p>
                <p>If you need assistance, please contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
              </div>
            </div>
          </body>
          </html>
        `
      );
    }

    // Create sample order confirmation email template
    const orderConfirmationPath = path.join(
      this.templatesDir,
      'orderConfirmation.html'
    );
    if (!fs.existsSync(orderConfirmationPath)) {
      fs.writeFileSync(
        orderConfirmationPath,
        `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4caf50; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .order-table th, .order-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .order-table th { background-color: #f2f2f2; }
              .order-summary { margin-top: 20px; }
              .order-summary td { padding: 5px; }
              .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Confirmation</h1>
                <p>Order #{{orderId}}</p>
              </div>
              <div class="content">
                <p>Hello {{customer.name}},</p>
                <p>Thank you for your order! We've received your payment and are processing your order.</p>
                
                <h2>Order Summary</h2>
                <p><strong>Order Date:</strong> {{orderDate}}</p>
                
                <table class="order-table">
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                  {{#each items}}
                  <tr>
                    <td>{{name}}</td>
                    <td>{{quantity}}</td>
                    <td>${{ price }}</td>
                    <td>${{ total }}</td>
                  </tr>
                  {{/each}}
                </table>
                
                <table class="order-summary" align="right">
                  <tr>
                    <td align="right"><strong>Subtotal:</strong></td>
                    <td align="right">${{ subtotal }}</td>
                  </tr>
                  <tr>
                    <td align="right"><strong>Tax:</strong></td>
                    <td align="right">${{ tax }}</td>
                  </tr>
                  <tr>
                    <td align="right"><strong>Shipping:</strong></td>
                    <td align="right">${{ shipping }}</td>
                  </tr>
                  <tr>
                    <td align="right"><strong>Total:</strong></td>
                    <td align="right"><strong>${{ total }}</strong></td>
                  </tr>
                </table>
                
                <div style="clear: both;"></div>
                
                <h2>Shipping Information</h2>
                <p>
                  {{customer.name}}<br>
                  {{shippingAddress.street}}<br>
                  {{shippingAddress.city}}, {{shippingAddress.state}} {{shippingAddress.zip}}<br>
                  {{shippingAddress.country}}
                </p>
                
                <p>If you have any questions about your order, please contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
              </div>
              <div class="footer">
                <p>© {{year}} {{company}}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      );
    }
  }

  /**
   * Get the base URL for the current environment
   * @returns {string} Base URL
   * @private
   */
  _getBaseUrl() {
    switch (this.environment) {
      case 'production':
        return 'https://example.com';
      case 'staging':
        return 'https://staging.example.com';
      case 'testing':
        return 'https://testing.example.com';
      default:
        return 'http://localhost:3000';
    }
  }
}

/**
 * Run the email service demo
 */
async function demo() {
  console.log('=== Email Service Demo ===\n');

  try {
    // Create email service instance
    const emailService = new EmailService();

    // Initialize service (for development by default)
    await emailService.initialize();

    console.log(
      'Sample email templates created in:',
      path.join(process.cwd(), 'templates')
    );
    console.log('');

    // Example 1: Send welcome email
    console.log('1. Sending welcome email...');
    await emailService.sendWelcomeEmail({
      email: 'user@example.com',
      name: 'John Doe',
      activationToken: 'abc123xyz456',
    });
    console.log('Welcome email sent\n');

    // Example 2: Send password reset email
    console.log('2. Sending password reset email...');
    await emailService.sendPasswordResetEmail(
      {
        email: 'user@example.com',
        name: 'John Doe',
      },
      'reset-token-123',
      '1 hour'
    );
    console.log('Password reset email sent\n');

    // Example 3: Send order confirmation email
    console.log('3. Sending order confirmation email...');
    await emailService.sendOrderConfirmationEmail({
      id: 'ORD-12345',
      date: new Date().toLocaleDateString(),
      customer: {
        name: 'John Doe',
        email: 'user@example.com',
      },
      items: [
        { name: 'Product 1', quantity: 2, price: 19.99 },
        { name: 'Product 2', quantity: 1, price: 49.99 },
      ],
      subtotal: 89.97,
      tax: 7.2,
      shipping: 5.0,
      total: 102.17,
      shippingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        country: 'United States',
      },
    });
    console.log('Order confirmation email sent\n');

    // Close the service
    await emailService.close();

    console.log('Email service demo completed');
    console.log('Check emails at: http://localhost:8025');
  } catch (error) {
    console.error('Error in email service demo:', error);
  }
}

// Run the demo
if (require.main === module) {
  demo().catch(console.error);
}

// Export the EmailService class for use in other modules
export default EmailService;
