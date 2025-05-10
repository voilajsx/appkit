// src/email/index.js
import { SMTPProvider } from './providers/smtp.js';
import { SESProvider } from './providers/ses.js';
import { SendGridProvider } from './providers/sendgrid.js';
import { MailgunProvider } from './providers/mailgun.js';

let currentProvider = null;

export async function initEmail(provider, config = {}) {
  try {
    let providerInstance;

    switch (provider.toLowerCase()) {
      case 'mailhog':
        // MailHog is an SMTP server with predefined settings
        providerInstance = new SMTPProvider({
          host: config.host || 'localhost',
          port: config.port || 1025,
          secure: false,
          ignoreTLS: true,
          auth: false, // MailHog doesn't require authentication
        });
        break;

      case 'smtp':
        providerInstance = new SMTPProvider(config);
        break;

      case 'ses':
        providerInstance = new SESProvider(config);
        break;

      case 'sendgrid':
        providerInstance = new SendGridProvider(config);
        break;

      case 'mailgun':
        providerInstance = new MailgunProvider(config);
        break;

      default:
        throw new Error(`Unknown email provider: ${provider}`);
    }

    currentProvider = providerInstance;
    return providerInstance;
  } catch (error) {
    throw new Error(`Failed to initialize email provider: ${error.message}`);
  }
}

export async function sendEmail(to, subject, html, options = {}) {
  if (!currentProvider) {
    throw new Error('Email provider not initialized. Call initEmail() first.');
  }

  return currentProvider.send({
    to,
    subject,
    html,
    ...options,
  });
}

export async function sendTemplatedEmail(
  to,
  subject,
  template,
  data,
  options = {}
) {
  if (!currentProvider) {
    throw new Error('Email provider not initialized. Call initEmail() first.');
  }

  // Render template with data (implement your template rendering logic)
  const html = renderTemplate(template, data);

  return currentProvider.send({
    to,
    subject,
    html,
    ...options,
  });
}

function renderTemplate(template, data) {
  // Simple template rendering (you might want to use a proper template engine)
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}

export function getProvider() {
  if (!currentProvider) {
    throw new Error('Email provider not initialized');
  }
  return currentProvider;
}
