/**
 * @voilajs/appkit - MailHog email provider (for testing)
 * @module @voilajs/appkit/email/providers/mailhog
 */

import { SMTPProvider } from './smtp.js';

/**
 * MailHog email provider for local testing
 * @extends SMTPProvider
 */
export class MailHogProvider extends SMTPProvider {
  constructor(config = {}) {
    // Set MailHog SMTP defaults
    const mailhogConfig = {
      host: config.host || 'localhost',
      port: config.port || 1025,
      secure: false,
      auth: undefined, // MailHog doesn't require auth
      tls: {
        rejectUnauthorized: false,
      },
      ...config,
    };

    super(mailhogConfig);
  }

  validateConfig() {
    // MailHog doesn't require any specific configuration
    // Host and port have defaults
  }

  /**
   * Sends an email to MailHog
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async send(options) {
    const result = await super.send(options);

    return {
      ...result,
      testMode: true,
      info: 'Email sent to MailHog for testing',
      webUI: `http://${this.config.host || 'localhost'}:8025`,
    };
  }
}
