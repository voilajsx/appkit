/**
 * Email Attachments - @voilajs/appkit Email Module
 *
 * Example showing how to send emails with various types of attachments
 *
 * Run: node 03-attachments.js
 */

import { initEmail, sendEmail, closeEmail } from '@voilajs/appkit/email';
import fs from 'fs';
import path from 'path';

async function demo() {
  console.log('=== Email Attachments Demo ===\n');

  try {
    // Initialize provider (using MailHog for local development)
    console.log('1. Initializing email provider...');
    await initEmail('mailhog', {
      defaultFrom: 'sender@example.com',
    });
    console.log('Email provider initialized\n');

    // Create some example files for attachments
    console.log('2. Preparing attachment files...');

    // Create a text file
    const textFilePath = path.join(process.cwd(), 'example-text.txt');
    fs.writeFileSync(textFilePath, 'This is a sample text file attachment.');

    // Create a simple JSON file
    const jsonFilePath = path.join(process.cwd(), 'example-data.json');
    fs.writeFileSync(
      jsonFilePath,
      JSON.stringify(
        {
          name: 'Example Data',
          values: [1, 2, 3, 4, 5],
          active: true,
        },
        null,
        2
      )
    );

    console.log('Sample files created\n');

    // Send email with file attachments
    console.log('3. Sending email with file attachments...');
    await sendEmail(
      'recipient@example.com',
      'Email with File Attachments',
      `
        <h1>Email with Attachments</h1>
        <p>This email contains multiple file attachments:</p>
        <ul>
          <li>A text file</li>
          <li>A JSON data file</li>
        </ul>
      `,
      {
        attachments: [
          {
            filename: 'example-text.txt',
            content: fs.readFileSync(textFilePath),
          },
          {
            filename: 'example-data.json',
            content: fs.readFileSync(jsonFilePath),
            type: 'application/json',
          },
        ],
      }
    );
    console.log('Email with file attachments sent\n');

    // Send email with in-memory buffer attachment
    console.log('4. Sending email with buffer attachment...');

    // Create a buffer with CSV data
    const csvData = 'id,name,value\n1,Item 1,100\n2,Item 2,200\n3,Item 3,300';
    const csvBuffer = Buffer.from(csvData);

    await sendEmail(
      'recipient@example.com',
      'Email with Buffer Attachment',
      `
        <h1>Email with Buffer Attachment</h1>
        <p>This email contains a CSV file generated in memory:</p>
        <p>The CSV contains sample product data.</p>
      `,
      {
        attachments: [
          {
            filename: 'products.csv',
            content: csvBuffer,
            type: 'text/csv',
          },
        ],
      }
    );
    console.log('Email with buffer attachment sent\n');

    // Send email with multiple attachments
    console.log('5. Sending email with multiple attachments...');

    // Create an HTML attachment
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>HTML Attachment</title>
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { color: #4285f4; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Sample HTML Document</h1>
        <p>This is an HTML file attached to an email.</p>
        <table>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Item 1</td>
            <td>$100</td>
          </tr>
          <tr>
            <td>Item 2</td>
            <td>$200</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail(
      'recipient@example.com',
      'Email with Multiple Attachments',
      `
        <h1>Email with Multiple Attachments</h1>
        <p>This email contains multiple types of attachments:</p>
        <ul>
          <li>Text file</li>
          <li>JSON file</li>
          <li>CSV file</li>
          <li>HTML file</li>
        </ul>
      `,
      {
        text: 'This email contains multiple attachments.',
        attachments: [
          {
            filename: 'example-text.txt',
            content: fs.readFileSync(textFilePath),
          },
          {
            filename: 'example-data.json',
            content: fs.readFileSync(jsonFilePath),
            type: 'application/json',
          },
          {
            filename: 'products.csv',
            content: csvBuffer,
            type: 'text/csv',
          },
          {
            filename: 'sample.html',
            content: htmlContent,
            type: 'text/html',
          },
        ],
      }
    );
    console.log('Email with multiple attachments sent\n');

    // Clean up
    console.log('6. Cleaning up...');
    await closeEmail();

    // Remove the sample files
    fs.unlinkSync(textFilePath);
    fs.unlinkSync(jsonFilePath);

    console.log('Email provider connection closed');
    console.log('Sample files deleted');
    console.log('Check emails at: http://localhost:8025\n');
  } catch (error) {
    console.error('Error in attachment demo:', error);
  }
}

// Run the demo
if (require.main === module) {
  demo().catch(console.error);
}
