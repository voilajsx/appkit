/**
 * Resend email strategy with modern API and automatic retry logic
 * @module @voilajsx/appkit/email
 * @file src/email/strategies/resend.ts
 *
 * @llm-rule WHEN: App has RESEND_API_KEY environment variable for modern email sending
 * @llm-rule AVOID: Manual Resend setup - this handles API calls, retry logic, and error handling
 * @llm-rule NOTE: Modern email provider with excellent deliverability and developer experience
 */
/**
 * Resend email strategy with modern API and reliability features
 */
export class ResendStrategy {
    config;
    apiKey;
    baseURL;
    timeout;
    /**
     * Creates Resend strategy with direct environment access (like auth pattern)
     * @llm-rule WHEN: Email initialization with RESEND_API_KEY detected
     * @llm-rule AVOID: Manual Resend configuration - environment detection handles this
     */
    constructor(config) {
        this.config = config;
        this.apiKey = config.resend.apiKey;
        this.baseURL = config.resend.baseURL;
        this.timeout = config.resend.timeout;
        if (!this.apiKey) {
            throw new Error('Resend API key is required. Set RESEND_API_KEY environment variable.');
        }
    }
    /**
     * Sends email via Resend API with automatic retry and error handling
     * @llm-rule WHEN: Sending emails through Resend service
     * @llm-rule AVOID: Manual API calls - this handles all Resend complexity
     * @llm-rule NOTE: Includes retry logic, proper error handling, and response parsing
     */
    async send(data) {
        try {
            // Convert to Resend API format
            const resendPayload = this.convertToResendFormat(data);
            // Send via Resend API with retry logic
            const result = await this.sendWithRetry(resendPayload);
            return {
                success: true,
                messageId: result.id,
            };
        }
        catch (error) {
            const errorMessage = this.parseResendError(error);
            if (this.config.environment.isDevelopment) {
                console.error(`[AppKit] Resend error:`, errorMessage);
            }
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    /**
     * Disconnects Resend strategy (no-op for HTTP API)
     * @llm-rule WHEN: App shutdown or email cleanup
     * @llm-rule AVOID: Expecting cleanup behavior - Resend is stateless HTTP API
     */
    async disconnect() {
        // Resend is HTTP API, no persistent connection to close
        return Promise.resolve();
    }
    // Private helper methods
    /**
     * Converts EmailData to Resend API format
     */
    convertToResendFormat(data) {
        const payload = {
            from: this.formatEmailAddress(data.from),
            to: this.formatEmailAddresses(data.to),
            subject: data.subject,
        };
        // Add content
        if (data.html) {
            payload.html = data.html;
        }
        if (data.text) {
            payload.text = data.text;
        }
        // Add optional fields
        if (data.replyTo) {
            payload.reply_to = this.formatEmailAddress(data.replyTo);
        }
        if (data.cc) {
            payload.cc = this.formatEmailAddresses(data.cc);
        }
        if (data.bcc) {
            payload.bcc = this.formatEmailAddresses(data.bcc);
        }
        // Add attachments
        if (data.attachments && data.attachments.length > 0) {
            payload.attachments = this.formatAttachments(data.attachments);
        }
        return payload;
    }
    /**
     * Formats single email address for Resend API
     */
    formatEmailAddress(address) {
        if (typeof address === 'string') {
            return address;
        }
        if (address.name) {
            return `${address.name} <${address.email}>`;
        }
        return address.email;
    }
    /**
     * Formats multiple email addresses for Resend API
     */
    formatEmailAddresses(addresses) {
        const addressArray = Array.isArray(addresses) ? addresses : [addresses];
        return addressArray.map(addr => this.formatEmailAddress(addr));
    }
    /**
     * Formats attachments for Resend API
     */
    formatAttachments(attachments) {
        return attachments.map(attachment => ({
            filename: attachment.filename,
            content: this.encodeAttachmentContent(attachment.content),
            type: attachment.contentType || this.guessContentType(attachment.filename),
        }));
    }
    /**
     * Encodes attachment content for Resend API
     */
    encodeAttachmentContent(content) {
        if (Buffer.isBuffer(content)) {
            return content.toString('base64');
        }
        return Buffer.from(content).toString('base64');
    }
    /**
     * Guesses content type from filename
     */
    guessContentType(filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeTypes = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            txt: 'text/plain',
            html: 'text/html',
            css: 'text/css',
            js: 'application/javascript',
            json: 'application/json',
            zip: 'application/zip',
        };
        return mimeTypes[ext || ''] || 'application/octet-stream';
    }
    /**
     * Sends email with retry logic and exponential backoff
     */
    async sendWithRetry(payload, maxRetries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.makeResendRequest(payload);
            }
            catch (error) {
                lastError = error;
                // Don't retry on client errors (4xx)
                if (error.status && error.status >= 400 && error.status < 500) {
                    throw error;
                }
                if (attempt < maxRetries) {
                    const delay = 1000 * Math.pow(2, attempt - 1); // Exponential backoff
                    console.warn(`[AppKit] Resend attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
                    await this.sleep(delay);
                }
            }
        }
        throw lastError;
    }
    /**
     * Makes HTTP request to Resend API
     */
    async makeResendRequest(payload) {
        const url = `${this.baseURL}/emails`;
        const response = await this.fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'VoilaJSX-AppKit-Email/1.0.0',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Resend API error (${response.status}): ${errorData.message || response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Fetch with timeout support
     */
    async fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Resend API request timeout after ${this.timeout}ms`);
            }
            throw error;
        }
    }
    /**
     * Parses Resend API errors into user-friendly messages
     */
    parseResendError(error) {
        if (error.message) {
            // Extract useful error information
            const message = error.message.toLowerCase();
            if (message.includes('unauthorized') || message.includes('invalid api key')) {
                return 'Invalid Resend API key. Check RESEND_API_KEY environment variable.';
            }
            if (message.includes('rate limit')) {
                return 'Resend API rate limit exceeded. Please try again later.';
            }
            if (message.includes('quota') || message.includes('usage limit')) {
                return 'Resend API quota exceeded. Check your account limits.';
            }
            if (message.includes('domain') || message.includes('verify')) {
                return 'Email domain not verified in Resend. Please verify your sending domain.';
            }
            if (message.includes('timeout')) {
                return 'Resend API request timeout. Please try again.';
            }
            if (message.includes('network') || message.includes('connection')) {
                return 'Network error connecting to Resend API. Please check your internet connection.';
            }
            return error.message;
        }
        return 'Unknown Resend API error occurred';
    }
    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=resend.js.map