# @pdfleaf/sdk

Official TypeScript/JavaScript SDK for PDF Leaf - the developer-friendly HTML to PDF converter with native TailwindCSS support.

## Features

- Works in both **Browser** and **Node.js** environments
- Full TypeScript support with type definitions
- Async/await API
- Webhook support for async notifications
- Zero dependencies (uses native `fetch`)

## Installation

```bash
npm install @pdfleaf/sdk
# or
yarn add @pdfleaf/sdk
# or
pnpm add @pdfleaf/sdk
```

## Quick Start

```typescript
import { PDFLeaf } from '@pdfleaf/sdk';

const client = new PDFLeaf({ apiKey: 'pk_live_...' });

// Simple conversion
const pdf = await client.convert('<h1>Hello World</h1>');

// Save to file (Node.js)
import { writeFileSync } from 'fs';
writeFileSync('output.pdf', Buffer.from(pdf));

// Download in browser
const blob = new Blob([pdf], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);
window.open(url);
```

## Usage Examples

### Basic Conversion

```typescript
const pdf = await client.convert('<h1>Hello World</h1>');
```

### With TailwindCSS

TailwindCSS is automatically included - just use Tailwind classes:

```typescript
const pdf = await client.convert(`
  <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
    <h1 class="text-4xl font-bold text-white">Hello TailwindCSS!</h1>
    <p class="text-white/80 mt-4">Beautiful PDFs with utility-first CSS</p>
  </div>
`);
```

### Custom Page Size and Margins

```typescript
const pdf = await client.convert('<h1>Report</h1>', {
  pageSize: 'Letter',
  orientation: 'landscape',
  marginTop: '1in',
  marginBottom: '1in',
  marginLeft: '0.75in',
  marginRight: '0.75in',
});
```

### Headers and Footers

```typescript
const pdf = await client.convert('<h1>Contract</h1><p>Terms...</p>', {
  headerHtml: `
    <div class="flex justify-between text-sm text-gray-500">
      <span>ACME Corp</span>
      <span>Confidential</span>
    </div>
  `,
  footerHtml: `
    <div class="text-center text-xs text-gray-400">
      Page <span class="page-number"></span> of <span class="total-pages"></span>
    </div>
  `,
  headerHeight: '2cm',
  footerHeight: '1.5cm',
  excludeHeaderPages: '1', // No header on first page
});
```

### Async Job Submission

For long-running conversions, you can submit and poll separately:

```typescript
// Submit the job
const job = await client.submit('<h1>Large Document</h1>');
console.log('Job ID:', job.jobId);

// Check status
const status = await client.getStatus(job.jobId);
console.log('Status:', status.status);

// Wait for completion
const finalStatus = await client.waitForCompletion(job.jobId);

// Download when ready
if (finalStatus.status === 'completed') {
  const pdf = await client.download(job.jobId);
}
```

## Webhooks

Set up webhooks to receive notifications when jobs complete:

### Create a Webhook

```typescript
const webhook = await client.createWebhook({
  url: 'https://yourapp.com/webhooks/pdfleaf',
  events: ['job.completed', 'job.failed'],
});

console.log('Webhook ID:', webhook.id);
console.log('Secret:', webhook.secret); // Save this!
```

### Verify Webhook Signatures

```typescript
// Express.js example
import express from 'express';
import { PDFLeaf } from '@pdfleaf/sdk';

app.post('/webhooks/pdfleaf', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-pdfleaf-signature'] as string;

  const isValid = await PDFLeaf.verifyWebhookSignatureAsync(
    req.body.toString(),
    signature,
    'your-webhook-secret'
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const payload = JSON.parse(req.body);
  console.log('Event:', payload.event);
  console.log('Job ID:', payload.jobId);

  if (payload.event === 'job.completed') {
    console.log('PDF size:', payload.data.size);
  }

  res.sendStatus(200);
});
```

### List and Delete Webhooks

```typescript
// List all webhooks
const webhooks = await client.listWebhooks();

// Delete a webhook
await client.deleteWebhook(webhooks[0].id);
```

## API Reference

### PDFLeaf Class

#### Constructor

```typescript
new PDFLeaf(config: PDFLeafConfig)
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiKey` | string | Yes | Your API key (starts with `pk_`) |
| `baseUrl` | string | No | API base URL (default: `https://htmltopdf.buscarid.com`) |
| `timeout` | number | No | Request timeout in ms (default: 30000) |

#### Methods

| Method | Description |
|--------|-------------|
| `convert(html, options?)` | Convert HTML to PDF (waits for completion) |
| `submit(html, options?)` | Submit conversion job (returns immediately) |
| `getStatus(jobId)` | Get job status |
| `download(jobId)` | Download completed PDF |
| `waitForCompletion(jobId, pollInterval?, maxWait?)` | Wait for job to complete |
| `createWebhook(config)` | Create a webhook |
| `listWebhooks()` | List all webhooks |
| `deleteWebhook(webhookId)` | Delete a webhook |

#### Static Methods

| Method | Description |
|--------|-------------|
| `PDFLeaf.verifyWebhookSignature(payload, signature, secret)` | Verify webhook signature (Node.js only) |
| `PDFLeaf.verifyWebhookSignatureAsync(payload, signature, secret)` | Verify webhook signature (Browser & Node.js) |

### PDFOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pageSize` | `'A4'` \| `'Letter'` \| `'A3'` \| `'A5'` \| `'Legal'` | `'A4'` | Page size |
| `orientation` | `'portrait'` \| `'landscape'` | `'portrait'` | Page orientation |
| `marginTop` | string | `'2cm'` | Top margin (CSS units) |
| `marginBottom` | string | `'2cm'` | Bottom margin (CSS units) |
| `marginLeft` | string | `'2cm'` | Left margin (CSS units) |
| `marginRight` | string | `'2cm'` | Right margin (CSS units) |
| `includePageNumbers` | boolean | `false` | Add page numbers |
| `headerHtml` | string | - | Custom header HTML |
| `footerHtml` | string | - | Custom footer HTML |
| `headerHeight` | string | `'2cm'` | Header height (CSS units) |
| `footerHeight` | string | `'2cm'` | Footer height (CSS units) |
| `excludeHeaderPages` | string | - | Pages without header (e.g., `'1,2'`) |
| `excludeFooterPages` | string | - | Pages without footer (e.g., `'1'`) |

## Error Handling

```typescript
import { PDFLeaf, PDFLeafError } from '@pdfleaf/sdk';

try {
  const pdf = await client.convert('<h1>Hello</h1>');
} catch (error) {
  if (error instanceof PDFLeafError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Details:', error.data);
  }
}
```

## Requirements

- Node.js 16+ or modern browser with `fetch` support
- API key from [PDF Leaf](https://htmltopdf.buscarid.com)

## License

MIT
