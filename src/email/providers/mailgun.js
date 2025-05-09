/**
 * @voilajs/appkit - Mailgun email provider
 * @module @voilajs/appkit/email/providers/mailgun
 */

import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { EmailProvider } from './base.js';

/**
 * Mailgun email provider
 * @extends EmailProvider
 */
export class MailgunProvider extends EmailProvider {
  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('Mailgun API key is required');
    }
    if (!this.config.domain) {
      throw new Error('Mailgun domain is required');
    }
  }

  async initialize() {
    const mailgun = new Mailgun(formData);
    this.client = mailgun.client({
      username: 'api',
      key: this.config.apiKey,
      url: this.config.url || 'https://api.mailgun.net',
    });
  }

  /**
   * Sends an email via Mailgun
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async send(options) {
    this.validateEmailOptions(options);

    const messageData = {
      from: options.from || this.config.defaultFrom,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc
        ? Array.isArray(options.cc)
          ? options.cc.join(', ')
          : options.cc
        : undefined,
      bcc: options.bcc
        ? Array.isArray(options.bcc)
          ? options.bcc.join(', ')
          : options.bcc
        : undefined,
      'h:Reply-To': options.replyTo,
      attachment: options.attachments?.map((att) => ({
        data: att.content,
        filename: att.filename,
      })),
      'o:tag': options.tags,
      'o:tracking': options.tracking !== false,
      'o:tracking-clicks': options.trackingClicks,
      'o:tracking-opens': options.trackingOpens,
    };

    // Add custom headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        messageData[`h:${key}`] = value;
      });
    }

    // Add custom variables
    if (options.variables) {
      Object.entries(options.variables).forEach(([key, value]) => {
        messageData[`v:${key}`] = value;
      });
    }

    try {
      const result = await this.client.messages.create(
        this.config.domain,
        messageData
      );

      return {
        success: true,
        messageId: result.id,
        response: result,
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
