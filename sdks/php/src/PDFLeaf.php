<?php

declare(strict_types=1);

namespace PDFLeaf;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;

/**
 * PDF Leaf SDK for PHP
 *
 * Official SDK for the PDF Leaf HTML-to-PDF conversion API.
 *
 * @example
 * ```php
 * use PDFLeaf\PDFLeaf;
 *
 * $client = new PDFLeaf('pk_live_...');
 * $pdf = $client->convert('<h1>Hello World</h1>');
 * file_put_contents('output.pdf', $pdf);
 * ```
 */
class PDFLeaf
{
    private const DEFAULT_BASE_URL = 'https://htmltopdf.buscarid.com';
    private const DEFAULT_TIMEOUT = 30.0;
    private const SDK_VERSION = '1.0.0';

    private string $apiKey;
    private string $baseUrl;
    private float $timeout;
    private ?Client $client = null;

    /**
     * Create a new PDFLeaf client.
     *
     * @param string $apiKey Your API key (starts with 'pk_')
     * @param string $baseUrl API base URL
     * @param float $timeout Request timeout in seconds
     *
     * @throws PDFLeafException If API key is invalid
     */
    public function __construct(
        string $apiKey,
        string $baseUrl = self::DEFAULT_BASE_URL,
        float $timeout = self::DEFAULT_TIMEOUT
    ) {
        if (empty($apiKey)) {
            throw new PDFLeafException('API key is required');
        }

        if (!str_starts_with($apiKey, 'pk_')) {
            throw new PDFLeafException('Invalid API key format. API keys should start with "pk_"');
        }

        $this->apiKey = $apiKey;
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->timeout = $timeout;
    }

    /**
     * Get the HTTP client.
     */
    private function getClient(): Client
    {
        if ($this->client === null) {
            $this->client = new Client([
                'base_uri' => $this->baseUrl,
                'timeout' => $this->timeout,
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                    'X-SDK-Version' => self::SDK_VERSION,
                    'X-SDK-Platform' => 'php',
                ],
            ]);
        }

        return $this->client;
    }

    /**
     * Make an API request.
     *
     * @param string $method HTTP method
     * @param string $path API path
     * @param array<string, mixed>|null $body Request body
     *
     * @return array<string, mixed> Response data
     * @throws PDFLeafException On API error
     */
    private function request(string $method, string $path, ?array $body = null): array
    {
        try {
            $options = [];
            if ($body !== null) {
                $options['json'] = $body;
            }

            $response = $this->getClient()->request($method, $path, $options);
            $content = $response->getBody()->getContents();

            return json_decode($content, true) ?? [];
        } catch (RequestException $e) {
            $response = $e->getResponse();
            $status = $response ? $response->getStatusCode() : 0;
            $body = $response ? $response->getBody()->getContents() : '';

            $data = json_decode($body, true) ?? [];
            $message = $data['detail'] ?? "HTTP {$status}: {$body}";

            throw new PDFLeafException($message, $status, $data);
        } catch (GuzzleException $e) {
            throw new PDFLeafException($e->getMessage(), 0);
        }
    }

    /**
     * Fetch raw bytes from an endpoint.
     *
     * @param string $path API path
     * @return string Raw response body
     * @throws PDFLeafException On error
     */
    private function fetchBytes(string $path): string
    {
        try {
            $response = $this->getClient()->get($path);
            return $response->getBody()->getContents();
        } catch (RequestException $e) {
            $response = $e->getResponse();
            $status = $response ? $response->getStatusCode() : 0;
            throw new PDFLeafException("HTTP {$status}", $status);
        } catch (GuzzleException $e) {
            throw new PDFLeafException($e->getMessage(), 0);
        }
    }

    /**
     * Convert HTML to PDF.
     *
     * This method submits a job and waits for completion.
     *
     * @param string $html HTML content to convert
     * @param PDFOptions|array<string, mixed>|null $options PDF generation options
     *
     * @return string PDF file as binary string
     *
     * @example
     * ```php
     * $pdf = $client->convert('<h1>Hello World</h1>');
     * file_put_contents('output.pdf', $pdf);
     *
     * // With options
     * $pdf = $client->convert('<h1>Report</h1>', new PDFOptions(
     *     pageSize: 'Letter',
     *     orientation: 'landscape'
     * ));
     * ```
     */
    public function convert(string $html, PDFOptions|array|null $options = null): string
    {
        $job = $this->submit($html, $options);
        $status = $this->waitForCompletion($job['job_id']);

        if ($status['status'] === 'failed') {
            throw new PDFLeafException($status['error'] ?? 'Conversion failed', 500);
        }

        return $this->download($job['job_id']);
    }

    /**
     * Submit an HTML conversion job.
     *
     * @param string $html HTML content to convert
     * @param PDFOptions|array<string, mixed>|null $options PDF generation options
     *
     * @return array{job_id: string, status: string, quota?: array, rate_limit?: array}
     */
    public function submit(string $html, PDFOptions|array|null $options = null): array
    {
        $body = [
            'html_content' => $html,
            'action' => 'download',
        ];

        if ($options !== null) {
            if ($options instanceof PDFOptions) {
                $body = array_merge($body, $options->toArray());
            } else {
                $body = array_merge($body, $options);
            }
        }

        return $this->request('POST', '/api/v1/convert', $body);
    }

    /**
     * Get job status.
     *
     * @param string $jobId The job ID
     *
     * @return array{status: string, size?: int, error?: string}
     */
    public function getStatus(string $jobId): array
    {
        return $this->request('GET', "/api/v1/jobs/{$jobId}");
    }

    /**
     * Download PDF for a completed job.
     *
     * @param string $jobId The job ID
     *
     * @return string PDF file as binary string
     */
    public function download(string $jobId): string
    {
        return $this->fetchBytes("/api/v1/jobs/{$jobId}/download");
    }

    /**
     * Wait for job completion.
     *
     * @param string $jobId The job ID
     * @param float $pollInterval Polling interval in seconds (default: 0.5)
     * @param float $maxWait Maximum wait time in seconds (default: 60)
     *
     * @return array{status: string, size?: int, error?: string}
     * @throws PDFLeafException If timeout is reached
     */
    public function waitForCompletion(
        string $jobId,
        float $pollInterval = 0.5,
        float $maxWait = 60.0
    ): array {
        $startTime = microtime(true);

        while ((microtime(true) - $startTime) < $maxWait) {
            $status = $this->getStatus($jobId);

            if (in_array($status['status'], ['completed', 'failed'], true)) {
                return $status;
            }

            usleep((int) ($pollInterval * 1_000_000));
        }

        throw new PDFLeafException('Timeout waiting for job completion', 408);
    }

    // ============== Webhook Methods ==============

    /**
     * Create a webhook.
     *
     * @param array{url: string, events: string[]} $config Webhook configuration
     *
     * @return array{id: string, url: string, secret: string, events: string[], is_active: bool, created_at: string}
     */
    public function createWebhook(array $config): array
    {
        return $this->request('POST', '/api/v1/webhooks', $config);
    }

    /**
     * List all webhooks.
     *
     * @return array<array{id: string, url: string, secret: string, events: string[], is_active: bool, created_at: string}>
     */
    public function listWebhooks(): array
    {
        return $this->request('GET', '/api/v1/webhooks');
    }

    /**
     * Delete a webhook.
     *
     * @param string $webhookId The webhook ID to delete
     */
    public function deleteWebhook(string $webhookId): void
    {
        $this->request('DELETE', "/api/v1/webhooks/{$webhookId}");
    }

    /**
     * Verify a webhook signature.
     *
     * @param string $payload The raw request body
     * @param string $signature The X-PDFLeaf-Signature header value
     * @param string $secret Your webhook secret
     *
     * @return bool True if the signature is valid
     *
     * @example
     * ```php
     * $payload = file_get_contents('php://input');
     * $signature = $_SERVER['HTTP_X_PDFLEAF_SIGNATURE'] ?? '';
     *
     * if (!PDFLeaf::verifyWebhookSignature($payload, $signature, 'your-secret')) {
     *     http_response_code(401);
     *     exit('Invalid signature');
     * }
     *
     * $data = json_decode($payload, true);
     * // Process webhook...
     * ```
     */
    public static function verifyWebhookSignature(
        string $payload,
        string $signature,
        string $secret
    ): bool {
        if (!str_starts_with($signature, 'sha256=')) {
            return false;
        }

        $providedSignature = substr($signature, 7);
        $expectedSignature = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expectedSignature, $providedSignature);
    }
}
