/**
 * PDF Leaf SDK for TypeScript/JavaScript
 *
 * Official SDK for the PDF Leaf HTML-to-PDF conversion API.
 * Works in both Browser and Node.js environments.
 *
 * @example
 * ```typescript
 * import { PDFLeaf } from '@pdfleaf/sdk';
 *
 * const client = new PDFLeaf({ apiKey: 'pk_live_...' });
 *
 * // Simple conversion
 * const pdf = await client.convert('<h1>Hello World</h1>');
 *
 * // With options
 * const pdf = await client.convert('<h1>Hello</h1>', {
 *   pageSize: 'Letter',
 *   orientation: 'landscape'
 * });
 * ```
 *
 * @packageDocumentation
 */

import type {
  PDFLeafConfig,
  PDFOptions,
  ConversionResponse,
  JobStatus,
  WebhookConfig,
  WebhookResponse,
} from './types';

// Re-export types
export * from './types';

/**
 * Default API base URL
 */
const DEFAULT_BASE_URL = 'https://htmltopdf.buscarid.com';

/**
 * Default request timeout in milliseconds
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Check if we're running in a browser environment
 */
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/**
 * PDFLeaf client for HTML to PDF conversion
 */
export class PDFLeaf {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  /**
   * Create a new PDFLeaf client
   *
   * @param config - Client configuration
   * @throws Error if API key is not provided
   *
   * @example
   * ```typescript
   * const client = new PDFLeaf({ apiKey: 'pk_live_...' });
   * ```
   */
  constructor(config: PDFLeafConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    if (!config.apiKey.startsWith('pk_')) {
      throw new Error('Invalid API key format. API keys should start with "pk_"');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }

  /**
   * Make an HTTP request to the API
   */
  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-SDK-Version': '1.0.0',
      'X-SDK-Platform': isBrowser ? 'browser' : 'node',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new PDFLeafError(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof PDFLeafError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new PDFLeafError('Request timeout', 408);
        }
        throw new PDFLeafError(error.message, 0);
      }

      throw new PDFLeafError('Unknown error', 0);
    }
  }

  /**
   * Fetch raw bytes from a URL
   */
  private async fetchBytes(url: string): Promise<ArrayBuffer> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new PDFLeafError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return response.arrayBuffer();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof PDFLeafError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new PDFLeafError('Request timeout', 408);
        }
        throw new PDFLeafError(error.message, 0);
      }

      throw new PDFLeafError('Unknown error', 0);
    }
  }

  /**
   * Convert HTML to PDF
   *
   * This method submits an HTML conversion job and waits for it to complete.
   * Returns the PDF as an ArrayBuffer.
   *
   * @param html - HTML content to convert
   * @param options - PDF generation options
   * @returns PDF file as ArrayBuffer
   *
   * @example
   * ```typescript
   * // Simple conversion
   * const pdf = await client.convert('<h1>Hello World</h1>');
   *
   * // With TailwindCSS
   * const pdf = await client.convert(`
   *   <div class="bg-blue-500 text-white p-4">
   *     <h1 class="text-2xl font-bold">Hello TailwindCSS!</h1>
   *   </div>
   * `);
   *
   * // With options
   * const pdf = await client.convert('<h1>Report</h1>', {
   *   pageSize: 'Letter',
   *   marginTop: '1in',
   *   marginBottom: '1in'
   * });
   *
   * // Save in Node.js
   * import { writeFileSync } from 'fs';
   * writeFileSync('output.pdf', Buffer.from(pdf));
   *
   * // Download in browser
   * const blob = new Blob([pdf], { type: 'application/pdf' });
   * const url = URL.createObjectURL(blob);
   * window.open(url);
   * ```
   */
  async convert(html: string, options?: PDFOptions): Promise<ArrayBuffer> {
    // Submit the job
    const job = await this.submit(html, options);

    // Poll for completion
    const status = await this.waitForCompletion(job.jobId);

    if (status.status === 'failed') {
      throw new PDFLeafError(status.error || 'Conversion failed', 500);
    }

    // Download the PDF
    return this.download(job.jobId);
  }

  /**
   * Submit an HTML conversion job
   *
   * This method only submits the job and returns immediately.
   * Use getStatus() to check if the job is complete, then download() to get the PDF.
   *
   * @param html - HTML content to convert
   * @param options - PDF generation options
   * @returns Conversion response with job ID
   *
   * @example
   * ```typescript
   * const job = await client.submit('<h1>Hello</h1>');
   * console.log('Job ID:', job.jobId);
   *
   * // Poll for completion
   * let status = await client.getStatus(job.jobId);
   * while (status.status === 'pending' || status.status === 'processing') {
   *   await new Promise(r => setTimeout(r, 500));
   *   status = await client.getStatus(job.jobId);
   * }
   *
   * // Download when complete
   * const pdf = await client.download(job.jobId);
   * ```
   */
  async submit(html: string, options?: PDFOptions): Promise<ConversionResponse> {
    const body: Record<string, unknown> = {
      html_content: html,
      action: 'download',
    };

    if (options) {
      if (options.pageSize) body.page_size = options.pageSize;
      if (options.orientation) body.orientation = options.orientation;
      if (options.marginTop) body.margin_top = options.marginTop;
      if (options.marginBottom) body.margin_bottom = options.marginBottom;
      if (options.marginLeft) body.margin_left = options.marginLeft;
      if (options.marginRight) body.margin_right = options.marginRight;
      if (options.includePageNumbers !== undefined) {
        body.include_page_numbers = options.includePageNumbers;
      }
      if (options.headerHtml) body.header_html = options.headerHtml;
      if (options.footerHtml) body.footer_html = options.footerHtml;
      if (options.headerHeight) body.header_height = options.headerHeight;
      if (options.footerHeight) body.footer_height = options.footerHeight;
      if (options.excludeHeaderPages) body.exclude_header_pages = options.excludeHeaderPages;
      if (options.excludeFooterPages) body.exclude_footer_pages = options.excludeFooterPages;
    }

    const response = await this.request<{
      job_id: string;
      status: 'pending';
      quota?: { used: number; limit: number; remaining: number };
      rate_limit?: { limit: number; remaining: number; reset: number };
    }>('POST', '/api/v1/convert', body);

    return {
      jobId: response.job_id,
      status: response.status,
      quota: response.quota,
      rateLimit: response.rate_limit,
    };
  }

  /**
   * Get the status of a conversion job
   *
   * @param jobId - The job ID returned from submit()
   * @returns Current job status
   *
   * @example
   * ```typescript
   * const status = await client.getStatus('job-123');
   * if (status.status === 'completed') {
   *   console.log('PDF size:', status.size);
   * }
   * ```
   */
  async getStatus(jobId: string): Promise<JobStatus> {
    return this.request<JobStatus>('GET', `/api/v1/jobs/${jobId}`);
  }

  /**
   * Download the PDF for a completed job
   *
   * @param jobId - The job ID returned from submit()
   * @returns PDF file as ArrayBuffer
   *
   * @example
   * ```typescript
   * const pdf = await client.download('job-123');
   * ```
   */
  async download(jobId: string): Promise<ArrayBuffer> {
    const url = `${this.baseUrl}/api/v1/jobs/${jobId}/download`;
    return this.fetchBytes(url);
  }

  /**
   * Wait for a job to complete
   *
   * @param jobId - The job ID to wait for
   * @param pollInterval - Polling interval in milliseconds (default: 500)
   * @param maxWait - Maximum wait time in milliseconds (default: 60000)
   * @returns Final job status
   *
   * @example
   * ```typescript
   * const status = await client.waitForCompletion('job-123');
   * if (status.status === 'completed') {
   *   const pdf = await client.download('job-123');
   * }
   * ```
   */
  async waitForCompletion(
    jobId: string,
    pollInterval: number = 500,
    maxWait: number = 60000
  ): Promise<JobStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      const status = await this.getStatus(jobId);

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new PDFLeafError('Timeout waiting for job completion', 408);
  }

  // ============== Webhook Management ==============

  /**
   * Create a webhook for job notifications
   *
   * @param config - Webhook configuration
   * @returns Created webhook with secret
   *
   * @example
   * ```typescript
   * const webhook = await client.createWebhook({
   *   url: 'https://yourapp.com/webhooks/pdfleaf',
   *   events: ['job.completed', 'job.failed']
   * });
   * console.log('Webhook secret:', webhook.secret);
   * ```
   */
  async createWebhook(config: WebhookConfig): Promise<WebhookResponse> {
    const response = await this.request<{
      id: string;
      url: string;
      secret: string;
      events: string[];
      is_active: boolean;
      created_at: string;
    }>('POST', '/api/v1/webhooks', {
      url: config.url,
      events: config.events,
    });

    return {
      id: response.id,
      url: response.url,
      secret: response.secret,
      events: response.events as ('job.completed' | 'job.failed')[],
      isActive: response.is_active,
      createdAt: response.created_at,
    };
  }

  /**
   * List all webhooks for the current user
   *
   * @returns List of webhook configurations
   *
   * @example
   * ```typescript
   * const webhooks = await client.listWebhooks();
   * webhooks.forEach(wh => console.log(wh.url));
   * ```
   */
  async listWebhooks(): Promise<WebhookResponse[]> {
    const response = await this.request<Array<{
      id: string;
      url: string;
      secret: string;
      events: string[];
      is_active: boolean;
      created_at: string;
    }>>('GET', '/api/v1/webhooks');

    return response.map((wh) => ({
      id: wh.id,
      url: wh.url,
      secret: wh.secret,
      events: wh.events as ('job.completed' | 'job.failed')[],
      isActive: wh.is_active,
      createdAt: wh.created_at,
    }));
  }

  /**
   * Delete a webhook
   *
   * @param webhookId - The webhook ID to delete
   *
   * @example
   * ```typescript
   * await client.deleteWebhook('webhook-123');
   * ```
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    await this.request<{ message: string }>('DELETE', `/api/v1/webhooks/${webhookId}`);
  }

  /**
   * Verify a webhook signature
   *
   * Use this to verify that a webhook request came from PDF Leaf.
   *
   * @param payload - The raw request body as a string
   * @param signature - The X-PDFLeaf-Signature header value
   * @param secret - Your webhook secret
   * @returns true if the signature is valid
   *
   * @example
   * ```typescript
   * // Express.js example
   * app.post('/webhooks/pdfleaf', express.raw({ type: 'application/json' }), (req, res) => {
   *   const signature = req.headers['x-pdfleaf-signature'];
   *   const isValid = PDFLeaf.verifyWebhookSignature(
   *     req.body.toString(),
   *     signature,
   *     'your-webhook-secret'
   *   );
   *
   *   if (!isValid) {
   *     return res.status(401).send('Invalid signature');
   *   }
   *
   *   const payload = JSON.parse(req.body);
   *   console.log('Webhook event:', payload.event);
   *   res.sendStatus(200);
   * });
   * ```
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Signature format: sha256=<hex>
    if (!signature.startsWith('sha256=')) {
      return false;
    }

    const providedSignature = signature.slice(7);

    // In browser, use SubtleCrypto; in Node.js, use crypto module
    if (isBrowser) {
      // Browser implementation would need async, so we provide a sync fallback
      console.warn(
        'PDFLeaf.verifyWebhookSignature: Browser sync verification not supported. ' +
        'Use verifyWebhookSignatureAsync instead.'
      );
      return false;
    }

    // Node.js implementation
    try {
      // Dynamic import for Node.js crypto
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(providedSignature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }

  /**
   * Verify a webhook signature asynchronously (works in browser)
   *
   * @param payload - The raw request body as a string
   * @param signature - The X-PDFLeaf-Signature header value
   * @param secret - Your webhook secret
   * @returns Promise resolving to true if the signature is valid
   */
  static async verifyWebhookSignatureAsync(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    if (!signature.startsWith('sha256=')) {
      return false;
    }

    const providedSignature = signature.slice(7);

    if (isBrowser) {
      // Browser implementation using SubtleCrypto
      try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(secret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );

        const signatureBuffer = await crypto.subtle.sign(
          'HMAC',
          key,
          encoder.encode(payload)
        );

        const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        // Constant-time comparison
        if (providedSignature.length !== expectedSignature.length) {
          return false;
        }

        let result = 0;
        for (let i = 0; i < providedSignature.length; i++) {
          result |= providedSignature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
        }

        return result === 0;
      } catch {
        return false;
      }
    }

    // Node.js - use sync version
    return PDFLeaf.verifyWebhookSignature(payload, signature, secret);
  }
}

/**
 * Error class for PDF Leaf API errors
 */
export class PDFLeafError extends Error {
  /**
   * HTTP status code
   */
  readonly status: number;

  /**
   * Additional error data from the API
   */
  readonly data?: Record<string, unknown>;

  constructor(message: string, status: number, data?: Record<string, unknown>) {
    super(message);
    this.name = 'PDFLeafError';
    this.status = status;
    this.data = data;
  }
}

// Default export for convenience
export default PDFLeaf;
