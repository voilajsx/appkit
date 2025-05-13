// src/email/examples/02-template-email.js
/**
 * Template Email Example
 *
 * This example demonstrates how to:
 * 1. Initialize an email provider
 * 2. Send emails using templates with variable substitution
 * 3. Use conditionals in templates
 * 4. Use loops in templates
 * 5. Access nested object properties in templates
 */

import {
  initEmail,
  sendTemplatedEmail,
  closeEmail,
} from '@voilajs/appkit/email';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Run the example
async function main() {
  try {
    console.log('Initializing email provider...');

    // Initialize provider (using MailHog for local development)
    await initEmail('mailhog', {
      defaultFrom: 'example@test.com',
    });

    // Example 1: Simple variable substitution
    console.log('Sending template with simple variable substitution...');

    const simpleTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Hello, {{name}}!</h1>
        <p>Welcome to {{companyName}}. We're glad to have you on board.</p>
        <p>Your account has been created with email: {{email}}</p>
      </div>
    `;

    await sendTemplatedEmail(
      'user@example.com',
      'Welcome to Our Service',
      simpleTemplate,
      {
        name: 'John Doe',
        companyName: 'Example Company',
        email: 'user@example.com',
      }
    );

    console.log('Simple template email sent!');

    // Example 2: Conditionals
    console.log('Sending template with conditionals...');

    const conditionalTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Subscription Update</h1>
        <p>Hello {{name}},</p>
        
        {{#if isActive}}
          <p style="color: green;">Your subscription is currently <strong>active</strong>.</p>
          <p>Your subscription will renew on {{renewalDate}}.</p>
        {{/if}}
        
        {{#if isPending}}
          <p style="color: orange;">Your subscription is currently <strong>pending activation</strong>.</p>
          <p>Please complete the payment process to activate your subscription.</p>
        {{/if}}
        
        {{#if isExpired}}
          <p style="color: red;">Your subscription has <strong>expired</strong>.</p>
          <p>Please renew your subscription to continue using our services.</p>
          <p><a href="{{renewalLink}}">Click here to renew</a></p>
        {{/if}}
        
        <p>Thank you for choosing our service!</p>
      </div>
    `;

    await sendTemplatedEmail(
      'user@example.com',
      'Your Subscription Status',
      conditionalTemplate,
      {
        name: 'Jane Smith',
        isActive: true,
        isPending: false,
        isExpired: false,
        renewalDate: 'June 15, 2025',
        renewalLink: 'https://example.com/renew',
      }
    );

    console.log('Conditional template email sent!');

    // Example 3: Loops
    console.log('Sending template with loops...');

    const loopTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Your Order Confirmation</h1>
        <p>Hello {{name}},</p>
        <p>Thank you for your order! Here's a summary of the items you purchased:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
            <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Quantity</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
          </tr>
          {{#each items}}
            <tr>
              <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">{{name}}</td>
              <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">{{quantity}}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${{ price }}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${{ total }}</td>
            </tr>
          {{/each}}
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>Grand Total:</strong></td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>${{ grandTotal }}</strong></td>
          </tr>
        </table>
        
        <p>Your order will be shipped to the address below:</p>
        <p>
          {{address.street}}<br>
          {{address.city}}, {{address.state}} {{address.zip}}<br>
          {{address.country}}
        </p>
        
        <p>Thank you for shopping with us!</p>
      </div>
    `;

    await sendTemplatedEmail(
      'customer@example.com',
      'Order Confirmation #12345',
      loopTemplate,
      {
        name: 'Alex Johnson',
        items: [
          {
            name: 'Wireless Headphones',
            quantity: 1,
            price: '99.99',
            total: '99.99',
          },
          {
            name: 'Phone Case',
            quantity: 2,
            price: '19.99',
            total: '39.98',
          },
          {
            name: 'Charging Cable',
            quantity: 3,
            price: '9.99',
            total: '29.97',
          },
        ],
        grandTotal: '169.94',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
          country: 'United States',
        },
      }
    );

    console.log('Loop template email sent!');

    // Example 4: Nested properties with conditionals and loops
    console.log(
      'Sending template with nested properties, conditionals, and loops...'
    );

    const complexTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Account Summary</h1>
        <p>Hello {{user.name}},</p>
        
        <h2>Your Profile</h2>
        <p><strong>Email:</strong> {{user.email}}</p>
        <p><strong>Member Since:</strong> {{user.memberSince}}</p>
        
        <h2>Subscription</h2>
        {{#if user.subscription.active}}
          <p style="color: green;">Your {{user.subscription.plan}} subscription is active.</p>
          <p>Next billing date: {{user.subscription.nextBillingDate}}</p>
          
          <h3>Subscription Features</h3>
          <ul>
            {{#each user.subscription.features}}
              <li>{{this}}</li>
            {{/each}}
          </ul>
        {{/if}}
        
        {{#if user.hasRecentOrders}}
          <h2>Recent Orders</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Order ID</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Date</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Status</th>
            </tr>
            {{#each user.recentOrders}}
              <tr>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">#{{id}}</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">{{date}}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${{ total }}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">
                  {{#if isDelivered}}
                    <span style="color: green;">Delivered</span>
                  {{/if}}
                  {{#if isShipped}}
                    <span style="color: blue;">Shipped</span>
                  {{/if}}
                  {{#if isProcessing}}
                    <span style="color: orange;">Processing</span>
                  {{/if}}
                </td>
              </tr>
            {{/each}}
          </table>
        {{/if}}
        
        <p>Thank you for being a valued customer!</p>
      </div>
    `;

    await sendTemplatedEmail(
      'premium@example.com',
      'Your Account Summary',
      complexTemplate,
      {
        user: {
          name: 'Sam Wilson',
          email: 'premium@example.com',
          memberSince: 'January 15, 2024',
          subscription: {
            active: true,
            plan: 'Premium',
            nextBillingDate: 'July 15, 2025',
            features: [
              'Unlimited Access',
              'Priority Support',
              'Cloud Storage (100GB)',
              'Advanced Analytics',
              'Custom Exports',
            ],
          },
          hasRecentOrders: true,
          recentOrders: [
            {
              id: '12345',
              date: 'May 1, 2025',
              total: '129.99',
              isDelivered: true,
              isShipped: false,
              isProcessing: false,
            },
            {
              id: '12346',
              date: 'May 5, 2025',
              total: '79.95',
              isDelivered: false,
              isShipped: true,
              isProcessing: false,
            },
            {
              id: '12347',
              date: 'May 10, 2025',
              total: '249.50',
              isDelivered: false,
              isShipped: false,
              isProcessing: true,
            },
          ],
        },
      }
    );

    console.log('Complex template email sent!');
    console.log('Check all emails at: http://localhost:8025'); // MailHog web interface

    // Clean up
    await closeEmail();
    console.log('Email provider connection closed.');
  } catch (error) {
    console.error('Error in template email example:', error);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
