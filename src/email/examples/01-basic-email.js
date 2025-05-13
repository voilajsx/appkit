/**
 * Basic Email Sending Example
 *
 * This example demonstrates how to:
 * 1. Initialize an email provider
 * 2. Send a basic email
 * 3. Send HTML email
 * 4. Close the email connection
 */

import { initEmail, sendEmail, closeEmail } from '@voilajs/appkit/email';
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

    console.log('Sending plain text email...');

    // Send a simple plain text email
    const plainResult = await sendEmail(
      'recipient@example.com',
      'Hello from @voilajs/appkit/email',
      '<p>This is a test email sent using the basic example.</p>',
      {
        text: 'This is a test email sent using the basic example.',
      }
    );

    console.log('Plain email sent! ID:', plainResult.messageId);

    console.log('Sending HTML email...');

    // Send an HTML email with more formatting
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .header { background-color: #4285f4; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
          .button { background-color: #4285f4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HTML Email Example</h1>
        </div>
        <div class="content">
          <p>Hello there,</p>
          <p>This is a formatted HTML email sent using <strong>@voilajs/appkit/email</strong>.</p>
          <p>It demonstrates how to send rich HTML emails with styling.</p>
          <p>
            <a href="https://example.com" class="button">Click this button</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Example Company. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const htmlResult = await sendEmail(
      'recipient@example.com',
      'HTML Email Example',
      htmlEmail,
      {
        text: 'This is a formatted email sent using @voilajs/appkit/email. It demonstrates how to send rich HTML emails with styling.',
      }
    );

    console.log('HTML email sent! ID:', htmlResult.messageId);
    console.log('Check emails at: http://localhost:8025'); // MailHog web interface

    // Clean up
    await closeEmail();
    console.log('Email provider connection closed.');
  } catch (error) {
    console.error('Error in basic email example:', error);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
