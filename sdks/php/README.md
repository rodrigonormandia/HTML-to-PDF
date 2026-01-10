# pdfleaf/sdk

Official PHP SDK for PDF Leaf - the developer-friendly HTML to PDF converter with native TailwindCSS support.

## Features

- PHP 8.0+ with named arguments and constructor promotion
- Guzzle HTTP client for reliable requests
- Webhook support with signature verification
- Full type declarations

## Installation

```bash
composer require pdfleaf/sdk
```

## Quick Start

```php
<?php

use PDFLeaf\PDFLeaf;

$client = new PDFLeaf('pk_live_...');

// Simple conversion
$pdf = $client->convert('<h1>Hello World</h1>');

// Save to file
file_put_contents('output.pdf', $pdf);
```

## Usage Examples

### Basic Conversion

```php
$pdf = $client->convert('<h1>Hello World</h1>');
```

### With TailwindCSS

TailwindCSS is automatically included:

```php
$pdf = $client->convert('
    <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
        <h1 class="text-4xl font-bold text-white">Hello TailwindCSS!</h1>
        <p class="text-white/80 mt-4">Beautiful PDFs with utility-first CSS</p>
    </div>
');
```

### With Options

```php
use PDFLeaf\PDFLeaf;
use PDFLeaf\PDFOptions;

$client = new PDFLeaf('pk_live_...');

$pdf = $client->convert(
    '<h1>Report</h1>',
    new PDFOptions(
        pageSize: 'Letter',
        orientation: 'landscape',
        marginTop: '1in',
        marginBottom: '1in',
    )
);
```

### Headers and Footers

```php
$pdf = $client->convert(
    '<h1>Contract</h1><p>Terms...</p>',
    new PDFOptions(
        headerHtml: '<div class="text-sm text-gray-500">ACME Corp</div>',
        footerHtml: '<div class="text-center text-xs">Page <span class="page-number"></span></div>',
        headerHeight: '2cm',
        footerHeight: '1.5cm',
        excludeHeaderPages: '1', // No header on first page
    )
);
```

### Manual Job Control

For more control over the conversion process:

```php
// Submit the job
$job = $client->submit('<h1>Large Document</h1>');
echo "Job ID: {$job['job_id']}\n";

// Check status
$status = $client->getStatus($job['job_id']);
echo "Status: {$status['status']}\n";

// Wait for completion
$finalStatus = $client->waitForCompletion($job['job_id']);

// Download when ready
if ($finalStatus['status'] === 'completed') {
    $pdf = $client->download($job['job_id']);
}
```

## Webhooks

Set up webhooks to receive notifications when jobs complete:

### Create a Webhook

```php
$webhook = $client->createWebhook([
    'url' => 'https://yourapp.com/webhooks/pdfleaf',
    'events' => ['job.completed', 'job.failed'],
]);

echo "Webhook ID: {$webhook['id']}\n";
echo "Secret: {$webhook['secret']}\n"; // Save this!
```

### Verify Webhook Signatures

```php
<?php
// webhook-handler.php

use PDFLeaf\PDFLeaf;

$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_PDFLEAF_SIGNATURE'] ?? '';

if (!PDFLeaf::verifyWebhookSignature($payload, $signature, 'your-webhook-secret')) {
    http_response_code(401);
    exit('Invalid signature');
}

$data = json_decode($payload, true);

echo "Event: {$data['event']}\n";
echo "Job ID: {$data['job_id']}\n";

if ($data['event'] === 'job.completed') {
    echo "PDF size: {$data['data']['size']} bytes\n";
}

http_response_code(200);
echo 'OK';
```

### Laravel Example

```php
// routes/web.php
Route::post('/webhooks/pdfleaf', function (Request $request) {
    $payload = $request->getContent();
    $signature = $request->header('X-PDFLeaf-Signature', '');

    if (!PDFLeaf::verifyWebhookSignature($payload, $signature, config('services.pdfleaf.webhook_secret'))) {
        abort(401, 'Invalid signature');
    }

    $data = $request->json()->all();

    // Process the webhook...
    Log::info('PDF Leaf webhook received', $data);

    return response('OK', 200);
});
```

### List and Delete Webhooks

```php
// List all webhooks
$webhooks = $client->listWebhooks();
foreach ($webhooks as $wh) {
    echo "{$wh['id']}: {$wh['url']}\n";
}

// Delete a webhook
$client->deleteWebhook($webhooks[0]['id']);
```

## API Reference

### PDFLeaf Class

#### Constructor

```php
new PDFLeaf(
    string $apiKey,
    string $baseUrl = 'https://htmltopdf.buscarid.com',
    float $timeout = 30.0
)
```

#### Methods

| Method | Description |
|--------|-------------|
| `convert($html, $options?)` | Convert HTML to PDF (waits for completion) |
| `submit($html, $options?)` | Submit conversion job |
| `getStatus($jobId)` | Get job status |
| `download($jobId)` | Download completed PDF |
| `waitForCompletion($jobId, $pollInterval?, $maxWait?)` | Wait for job to complete |
| `createWebhook($config)` | Create a webhook |
| `listWebhooks()` | List all webhooks |
| `deleteWebhook($webhookId)` | Delete a webhook |

#### Static Methods

| Method | Description |
|--------|-------------|
| `PDFLeaf::verifyWebhookSignature($payload, $signature, $secret)` | Verify webhook signature |

### PDFOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `$pageSize` | ?string | `null` | Page size (A4, Letter, etc.) |
| `$orientation` | ?string | `null` | portrait or landscape |
| `$marginTop` | ?string | `null` | Top margin (CSS units) |
| `$marginBottom` | ?string | `null` | Bottom margin |
| `$marginLeft` | ?string | `null` | Left margin |
| `$marginRight` | ?string | `null` | Right margin |
| `$includePageNumbers` | ?bool | `null` | Add page numbers |
| `$headerHtml` | ?string | `null` | Custom header HTML |
| `$footerHtml` | ?string | `null` | Custom footer HTML |
| `$headerHeight` | ?string | `null` | Header height |
| `$footerHeight` | ?string | `null` | Footer height |
| `$excludeHeaderPages` | ?string | `null` | Pages without header |
| `$excludeFooterPages` | ?string | `null` | Pages without footer |

## Error Handling

```php
use PDFLeaf\PDFLeaf;
use PDFLeaf\PDFLeafException;

try {
    $pdf = $client->convert('<h1>Hello</h1>');
} catch (PDFLeafException $e) {
    echo "Error: {$e->getMessage()}\n";
    echo "Status: {$e->status}\n";
    print_r($e->data);
}
```

## Requirements

- PHP 8.0+
- Guzzle 7.0+

## License

MIT
