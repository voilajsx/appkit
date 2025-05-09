/**
 * @voilajs/appkit - Email module
 * @module @voilajs/appkit/email
 */

export { initEmail, sendEmail, sendTemplatedEmail } from './manager.js';
export { renderTemplate } from './templates.js';
export { EmailProvider } from './providers/base.js';
export { SMTPProvider } from './providers/smtp.js';
export { SESProvider } from './providers/ses.js';
export { SendGridProvider } from './providers/sendgrid.js';
export { MailgunProvider } from './providers/mailgun.js';
export { MailtrapProvider } from './providers/mailtrap.js';
export { MailhogProvider } from './providers/mailhog.js';
