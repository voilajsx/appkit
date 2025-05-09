/**
 * @voilajs/appkit - AWS SES email provider
 * @module @voilajs/appkit/email/providers/ses
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { EmailProvider } from './base.js';

/**
 * AWS SES email provider
 * @extends EmailProvider
 */
export class SESProvider extends EmailProvider {
  validateConfig() {
    if (!this.config.region) {
      throw new Error('AWS region is required');
    }
  }

  async initialize() {
    const clientConfig = {
      region: this.config.region,
    };

    if (this.config.credentials) {
      clientConfig.credentials = this.config.credentials;
    }

    if (this.config.endpoint) {
      clientConfig.endpoint = this.config.endpoint;
    }

    this.client = new SESClient(clientConfig);
  }

  /**
   * Sends an email via AWS SES
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async send(options) {
    this.validateEmailOptions(options);

    const toAddresses = this.normalizeEmails(options.to);
    const ccAddresses = options.cc
      ? this.normalizeEmails(options.cc)
      : undefined;
    const bccAddresses = options.bcc
      ? this.normalizeEmails(options.bcc)
      : undefined;

    const params = {
      Source: options.from || this.config.defaultFrom,
      Destination: {
        ToAddresses: toAddresses,
        CcAddresses: ccAddresses,
        BccAddresses: bccAddresses,
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8',
        },
        Body: {},
      },
      ReplyToAddresses: options.replyTo
        ? this.normalizeEmails(options.replyTo)
        : undefined,
    };

    if (options.html) {
      params.Message.Body.Html = {
        Data: options.html,
        Charset: 'UTF-8',
      };
    }

    if (options.text) {
      params.Message.Body.Text = {
        Data: options.text,
        Charset: 'UTF-8',
      };
    }

    try {
      const command = new SendEmailCommand(params);
      const result = await this.client.send(command);

      return {
        success: true,
        messageId: result.MessageId,
        result: result,
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
