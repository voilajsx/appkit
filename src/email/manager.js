/**
 * @voilajs/appkit - Email manager
 * @module @voilajs/appkit/email/manager
 */

import { SMTPProvider } from './providers/smtp.js';
import { SESProvider } from './providers/ses.js';
import { SendGridProvider } from './providers/sendgrid.js';
import { MailgunProvider } from './providers/mailgun.js';
import { MailtrapProvider } from './providers/mailtrap.js';
import { MailHogProvider } from './providers/mailhog.js';
import { renderTemplate } from './templates.js';

let emailInstance = null;

const PROVIDERS = {
  smtp: SMTPProvider,
  ses: SESProvider,
  sendgrid: SendGridProvider,
  mailgun: MailgunProvider,
  mailhog: MailHogProvider,
};

/**
 * Initializes email provider
 * @param {string} provider - Provider type ('smtp', 'ses', 'sendgrid', 'mailgun', 'mailtrap')
 * @param {Object} config - Provider configuration
 * @returns {Promise<EmailProvider>} Email provider instance
 * @throws {Error} If provider is already initialized or invalid
 */
export async function initEmail(provider, config = {}) {
  if (emailInstance) {
    throw new Error('Email already initialized');
  }

  const ProviderClass = PROVIDERS[provider];
  if (!ProviderClass) {
    throw new Error(`Unknown email provider: ${provider}`);
  }

  emailInstance = new ProviderClass(config);
  await emailInstance.initialize();
  return emailInstance;
}

/**
 * Gets current email instance
 * @returns {EmailProvider} Email provider instance
 * @throws {Error} If email is not initialized
 */
export function getEmail() {
  if (!emailInstance) {
    throw new Error('Email not initialized. Call initEmail() first.');
  }
  return emailInstance;
}

/**
 * Sends an email
 * @param {string|Array<string>} to - Recipient email address(es)
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {Object} [options] - Email options
 * @returns {Promise<Object>} Send result
 */
export async function sendEmail(to, subject, html, options = {}) {
  const email = getEmail();
  return email.send({
    to,
    subject,
    html,
    ...options,
  });
}

/**
 * Sends a templated email
 * @param {string|Array<string>} to - Recipient email address(es)
 * @param {string} subject - Email subject
 * @param {string} template - Template string
 * @param {Object} [data] - Template data
 * @param {Object} [options] - Email options
 * @returns {Promise<Object>} Send result
 */
export async function sendTemplatedEmail(
  to,
  subject,
  template,
  data = {},
  options = {}
) {
  const html = await renderTemplate(template, data);
  return sendEmail(to, subject, html, options);
}
