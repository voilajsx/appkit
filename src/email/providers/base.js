/**
 * @voilajs/appkit - Base email provider
 * @module @voilajs/appkit/email/providers/base
 */

/**
 * Base email provider interface
 */
export class EmailProvider {
  constructor(config = {}) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validates provider configuration
   * @throws {Error} If configuration is invalid
   */
  validateConfig() {
    // Override in subclasses
  }

  /**
   * Initializes the email provider
   * @returns {Promise<void>}
   */
  async initialize() {
    // Override in subclasses if needed
  }

  /**
   * Sends an email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async send(options) {
    throw new Error('send() must be implemented by subclass');
  }

  /**
   * Validates email options
   * @param {Object} options - Email options
   * @throws {Error} If options are invalid
   */
  validateEmailOptions(options) {
    if (!options.to) {
      throw new Error('Recipient email is required');
    }

    if (!options.subject) {
      throw new Error('Email subject is required');
    }

    if (!options.html && !options.text) {
      throw new Error('Email content (html or text) is required');
    }
  }

  /**
   * Normalizes email addresses
   * @param {string|Array<string>} emails - Email address(es)
   * @returns {Array<string>} Normalized email array
   */
  normalizeEmails(emails) {
    if (typeof emails === 'string') {
      return [emails];
    }
    if (Array.isArray(emails)) {
      return emails;
    }
    throw new Error('Invalid email format');
  }
}
