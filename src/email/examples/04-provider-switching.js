/**
 * Provider Switching - @voilajs/appkit Email Module
 *
 * Example showing how to switch between different email providers
 * for different environments (development, testing, staging, production)
 *
 * Run: node 04-provider-switching.js
 */

import {
  initEmail,
  sendEmail,
  closeEmail,
  getEmailProvider,
} from '@voilajs/appkit/email';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function demo() {
  console.log('=== Email Provider Switching Demo ===\n');

  try {
    // Function to send a test email with the current provider
    async function sendTestEmail(environment) {
      const provider = getEmailProvider();
      console.log(`Sending test email with ${provider.constructor.name}...`);

      await sendEmail(
        'recipient@example.com',
        `Test Email from ${environment} Environment`,
        `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Test Email</h1>
            <p>This is a test email sent from the <strong>${environment}</strong> environment.</p>
            <p>Provider: ${provider.constructor.name}</p>
            <p>Time: ${new Date().toISOString()}</p>
          </div>
        `,
        {
          text: `This is a test email sent from the ${environment} environment.`,
        }
      );

      console.log(`Test email sent from ${environment} environment`);

      // For MailHog and Mailtrap, provide the URL to check emails
      if (provider.constructor.name === 'MailHogProvider') {
        console.log('Check email at: http://localhost:8025');
      } else if (provider.constructor.name === 'MailtrapProvider') {
        console.log('Check email in your Mailtrap inbox');
      }

      console.log('');
    }

    // 1. Development Environment (MailHog)
    console.log('1. Initializing for Development Environment...');
    await initEmail('mailhog', {
      defaultFrom: 'dev@example.com',
    });
    await sendTestEmail('Development');

    // 2. Testing Environment (Mailtrap)
    // Only run if Mailtrap credentials are available
    if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
      console.log('2. Switching to Testing Environment...');
      // Close the previous provider first
      await closeEmail();

      await initEmail('mailtrap', {
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS,
        },
        defaultFrom: 'test@example.com',
      });
      await sendTestEmail('Testing');
    } else {
      console.log(
        '2. Skipping Testing Environment - MAILTRAP_USER and MAILTRAP_PASS not set\n'
      );
    }

    // 3. Staging Environment (SendGrid)
    // Only run if SendGrid API key is available
    if (process.env.SENDGRID_API_KEY) {
      console.log('3. Switching to Staging Environment...');
      // Close the previous provider first
      await closeEmail();

      await initEmail('sendgrid', {
        apiKey: process.env.SENDGRID_API_KEY,
        defaultFrom: 'staging@example.com',
      });
      await sendTestEmail('Staging');
    } else {
      console.log(
        '3. Skipping Staging Environment - SENDGRID_API_KEY not set\n'
      );
    }

    // 4. Production Environment (AWS SES)
    // Only run if AWS credentials are available
    if (
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION
    ) {
      console.log('4. Switching to Production Environment...');
      // Close the previous provider first
      await closeEmail();

      await initEmail('ses', {
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        defaultFrom: 'production@example.com',
      });
      await sendTestEmail('Production');
    } else {
      console.log(
        '4. Skipping Production Environment - AWS credentials not set\n'
      );
    }

    // Clean up
    console.log('5. Cleaning up...');
    await closeEmail();
    console.log('Email provider connection closed\n');

    console.log('Provider switching demo completed');
    console.log('----------------------------------------');
    console.log('To run the full demo with all providers:');
    console.log('1. Set up MailHog locally for development');
    console.log('2. Create a .env file with the following variables:');
    console.log('   MAILTRAP_USER=your_mailtrap_username');
    console.log('   MAILTRAP_PASS=your_mailtrap_password');
    console.log('   SENDGRID_API_KEY=your_sendgrid_api_key');
    console.log('   AWS_ACCESS_KEY_ID=your_aws_access_key');
    console.log('   AWS_SECRET_ACCESS_KEY=your_aws_secret_key');
    console.log('   AWS_REGION=your_aws_region');
  } catch (error) {
    console.error('Error in provider switching demo:', error);
  }
}

// Run the demo
if (require.main === module) {
  demo().catch(console.error);
}
