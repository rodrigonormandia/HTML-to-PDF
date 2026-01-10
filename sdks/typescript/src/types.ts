/**
 * PDF Leaf SDK Types
 */

/**
 * Page size options for PDF generation
 */
export type PageSize = 'A4' | 'Letter' | 'A3' | 'A5' | 'Legal';

/**
 * Page orientation
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * PDF generation options
 */
export interface PDFOptions {
  /**
   * Page size (default: 'A4')
   */
  pageSize?: PageSize;

  /**
   * Page orientation (default: 'portrait')
   */
  orientation?: Orientation;

  /**
   * Top margin with CSS units (default: '2cm')
   */
  marginTop?: string;

  /**
   * Bottom margin with CSS units (default: '2cm')
   */
  marginBottom?: string;

  /**
   * Left margin with CSS units (default: '2cm')
   */
  marginLeft?: string;

  /**
   * Right margin with CSS units (default: '2cm')
   */
  marginRight?: string;

  /**
   * Include page numbers (default: false)
   */
  includePageNumbers?: boolean;

  /**
   * Custom header HTML content
   */
  headerHtml?: string;

  /**
   * Custom footer HTML content
   */
  footerHtml?: string;

  /**
   * Header height with CSS units (default: '2cm')
   */
  headerHeight?: string;

  /**
   * Footer height with CSS units (default: '2cm')
   */
  footerHeight?: string;

  /**
   * Comma-separated page numbers to exclude header (e.g., '1,2,3')
   */
  excludeHeaderPages?: string;

  /**
   * Comma-separated page numbers to exclude footer (e.g., '1')
   */
  excludeFooterPages?: string;
}

/**
 * Job status response
 */
export interface JobStatus {
  /**
   * Current job status
   */
  status: 'pending' | 'processing' | 'completed' | 'failed';

  /**
   * PDF file size in bytes (when completed)
   */
  size?: number;

  /**
   * Error message (when failed)
   */
  error?: string;
}

/**
 * Conversion response
 */
export interface ConversionResponse {
  /**
   * Unique job ID for tracking
   */
  jobId: string;

  /**
   * Initial status (always 'pending')
   */
  status: 'pending';

  /**
   * Quota information
   */
  quota?: {
    used: number;
    limit: number;
    remaining: number;
  };

  /**
   * Rate limit information
   */
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

/**
 * SDK configuration options
 */
export interface PDFLeafConfig {
  /**
   * API key for authentication (starts with 'pk_')
   */
  apiKey: string;

  /**
   * Base URL for the API (default: 'https://htmltopdf.buscarid.com')
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds (default: 30000)
   */
  timeout?: number;
}

/**
 * Webhook event types
 */
export type WebhookEvent = 'job.completed' | 'job.failed';

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  /**
   * Webhook endpoint URL (must be HTTPS)
   */
  url: string;

  /**
   * Events to subscribe to
   */
  events: WebhookEvent[];
}

/**
 * Webhook response
 */
export interface WebhookResponse {
  /**
   * Webhook ID
   */
  id: string;

  /**
   * Webhook URL
   */
  url: string;

  /**
   * Webhook secret for signature verification
   */
  secret: string;

  /**
   * Subscribed events
   */
  events: WebhookEvent[];

  /**
   * Whether the webhook is active
   */
  isActive: boolean;

  /**
   * Creation timestamp
   */
  createdAt: string;
}

/**
 * Webhook payload sent to your endpoint
 */
export interface WebhookPayload {
  /**
   * Event type
   */
  event: WebhookEvent;

  /**
   * Job ID this event relates to
   */
  jobId: string;

  /**
   * Event timestamp (ISO 8601)
   */
  timestamp: string;

  /**
   * Event data
   */
  data: {
    status: string;
    size?: number;
    processingTimeMs?: number;
    error?: string;
  };
}
