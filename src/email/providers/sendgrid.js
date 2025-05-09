/**
 * @voilajs/appkit - SendGrid email provider
 * @module @voilajs/appkit/email/providers/sendgrid
 */

import sgMail from '@sendgrid/mail';
import { EmailProvider } from './base.js';

/**
 * SendGrid email provider
 * @extends EmailProvider
 */
export class SendGridProvider extends EmailProvider {
  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key is required');
    }
  }

  async initialize() {
    sgMail.setApiKey(this.config.apiKey);
  }

  /**
   * Sends an email via SendGrid
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async send(options) {
    this.validateEmailOptions(options);

    const msg = {
      from: options.from || this.config.defaultFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: options.attachments?.map((att) => ({
        content: att.content.toString('base64'),
        filename: att.filename,
        type: att.type || 'application/octet-stream',
        disposition: att.disposition || 'attachment',
      })),
      headers: options.headers,
      customArgs: options.customArgs,
      categories: options.categories,
    };

    try {
      const [response] = await sgMail.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'],
        statusCode: response.statusCode,
        response: response.body,
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
