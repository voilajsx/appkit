/**
 * @voilajs/appkit - Mailtrap email provider (for testing)
 * @module @voilajs/appkit/email/providers/mailtrap
 */

import { SMTPProvider } from './smtp.js';

/**
 * Mailtrap email provider for testing
 * @extends SMTPProvider
 */
export class MailtrapProvider extends SMTPProvider {
  constructor(config = {}) {
    // Set Mailtrap SMTP defaults
    const mailtrapConfig = {
      host: 'smtp.mailtrap.io',
      port: config.port || 2525,
      auth: {
        user: config.auth?.user || config.username,
        pass: config.auth?.pass || config.password,
      },
      ...config,
    };

    super(mailtrapConfig);
  }

  validateConfig() {
    if (!this.config.auth?.user || !this.config.auth?.pass) {
      throw new Error('Mailtrap username and password are required');
    }
  }

  /**
   * Sends an email via Mailtrap
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async send(options) {
    // Add test mode indicator
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['X-Mailtrap-Test'] = 'true';

    const result = await super.send(options);

    return {
      ...result,
      testMode: true,
      info: 'Email sent to Mailtrap inbox for testing',
    };
  }
}
