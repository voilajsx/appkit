/**
 * @voilajs/appkit - SMTP email provider
 * @module @voilajs/appkit/email/providers/smtp
 */

import nodemailer from 'nodemailer';
import { EmailProvider } from './base.js';

/**
 * SMTP email provider
 * @extends EmailProvider
 */
export class SMTPProvider extends EmailProvider {
  validateConfig() {
    if (!this.config.host) {
      throw new Error('SMTP host is required');
    }
    if (!this.config.auth?.user || !this.config.auth?.pass) {
      throw new Error('SMTP authentication credentials are required');
    }
  }

  async initialize() {
    this.transporter = nodemailer.createTransporter({
      host: this.config.host,
      port: this.config.port || 587,
      secure: this.config.secure || false,
      auth: this.config.auth,
      pool: this.config.pool || false,
      maxConnections: this.config.maxConnections || 5,
      tls: this.config.tls || {},
    });

    // Verify connection
    if (this.config.verifyConnection !== false) {
      await this.transporter.verify();
    }
  }

  /**
   * Sends an email via SMTP
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async send(options) {
    this.validateEmailOptions(options);

    const mailOptions = {
      from: options.from || this.config.defaultFrom,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: options.attachments,
      headers: options.headers,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
        response: result.response,
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
