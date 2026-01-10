# pdfleaf

Official Python SDK for PDF Leaf - the developer-friendly HTML to PDF converter with native TailwindCSS support.

## Features

- **Sync and Async** support with httpx
- Full type hints and dataclasses
- Webhook support with signature verification
- Context manager support for clean resource handling

## Installation

```bash
pip install pdfleaf
```

## Quick Start

```python
from pdfleaf import PDFLeaf

client = PDFLeaf(api_key="pk_live_...")

# Simple conversion
pdf = client.convert("<h1>Hello World</h1>")

# Save to file
with open("output.pdf", "wb") as f:
    f.write(pdf)
```

## Usage Examples

### Basic Conversion

```python
pdf = client.convert("<h1>Hello World</h1>")
```

### With TailwindCSS

TailwindCSS is automatically included:

```python
pdf = client.convert("""
    <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
        <h1 class="text-4xl font-bold text-white">Hello TailwindCSS!</h1>
        <p class="text-white/80 mt-4">Beautiful PDFs with utility-first CSS</p>
    </div>
""")
```

### With Options

```python
from pdfleaf import PDFLeaf, PDFOptions

client = PDFLeaf(api_key="pk_live_...")

pdf = client.convert(
    "<h1>Report</h1>",
    options=PDFOptions(
        page_size="Letter",
        orientation="landscape",
        margin_top="1in",
        margin_bottom="1in",
    )
)
```

### Headers and Footers

```python
pdf = client.convert(
    "<h1>Contract</h1><p>Terms...</p>",
    options=PDFOptions(
        header_html='<div class="text-sm text-gray-500">ACME Corp</div>',
        footer_html='<div class="text-center text-xs">Page <span class="page-number"></span></div>',
        header_height="2cm",
        footer_height="1.5cm",
        exclude_header_pages="1",  # No header on first page
    )
)
```

### Async Usage

```python
import asyncio
from pdfleaf import PDFLeaf

async def main():
    async with PDFLeaf(api_key="pk_live_...") as client:
        pdf = await client.convert_async("<h1>Hello Async!</h1>")

        with open("output.pdf", "wb") as f:
            f.write(pdf)

asyncio.run(main())
```

### Manual Job Control

For more control over the conversion process:

```python
# Submit the job
job = client.submit("<h1>Large Document</h1>")
print(f"Job ID: {job.job_id}")

# Check status
status = client.get_status(job.job_id)
print(f"Status: {status.status}")

# Wait for completion
final_status = client.wait_for_completion(job.job_id)

# Download when ready
if final_status.status == "completed":
    pdf = client.download(job.job_id)
```

## Webhooks

Set up webhooks to receive notifications when jobs complete:

### Create a Webhook

```python
from pdfleaf import WebhookConfig

webhook = client.create_webhook(WebhookConfig(
    url="https://yourapp.com/webhooks/pdfleaf",
    events=["job.completed", "job.failed"]
))

print(f"Webhook ID: {webhook.id}")
print(f"Secret: {webhook.secret}")  # Save this!
```

### Verify Webhook Signatures

```python
# Flask example
from flask import Flask, request
from pdfleaf import PDFLeaf

app = Flask(__name__)

@app.route('/webhooks/pdfleaf', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-PDFLeaf-Signature', '')

    if not PDFLeaf.verify_webhook_signature(
        request.data.decode(),
        signature,
        'your-webhook-secret'
    ):
        return 'Invalid signature', 401

    data = request.json
    print(f"Event: {data['event']}")
    print(f"Job ID: {data['job_id']}")

    return 'OK', 200
```

### List and Delete Webhooks

```python
# List all webhooks
webhooks = client.list_webhooks()
for wh in webhooks:
    print(f"{wh.id}: {wh.url}")

# Delete a webhook
client.delete_webhook(webhooks[0].id)
```

## API Reference

### PDFLeaf Class

#### Constructor

```python
PDFLeaf(
    api_key: str,
    base_url: str = "https://htmltopdf.buscarid.com",
    timeout: float = 30.0
)
```

#### Sync Methods

| Method | Description |
|--------|-------------|
| `convert(html, options?)` | Convert HTML to PDF (waits for completion) |
| `submit(html, options?)` | Submit conversion job |
| `get_status(job_id)` | Get job status |
| `download(job_id)` | Download completed PDF |
| `wait_for_completion(job_id, poll_interval?, max_wait?)` | Wait for job to complete |
| `create_webhook(config)` | Create a webhook |
| `list_webhooks()` | List all webhooks |
| `delete_webhook(webhook_id)` | Delete a webhook |

#### Async Methods

All sync methods have async variants with `_async` suffix:
- `convert_async()`
- `submit_async()`
- `get_status_async()`
- `download_async()`
- `wait_for_completion_async()`
- `create_webhook_async()`
- `list_webhooks_async()`
- `delete_webhook_async()`

#### Static Methods

| Method | Description |
|--------|-------------|
| `PDFLeaf.verify_webhook_signature(payload, signature, secret)` | Verify webhook signature |

### PDFOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `page_size` | str | `'A4'` | Page size |
| `orientation` | str | `'portrait'` | Page orientation |
| `margin_top` | str | `'2cm'` | Top margin |
| `margin_bottom` | str | `'2cm'` | Bottom margin |
| `margin_left` | str | `'2cm'` | Left margin |
| `margin_right` | str | `'2cm'` | Right margin |
| `include_page_numbers` | bool | `False` | Add page numbers |
| `header_html` | str | `None` | Custom header HTML |
| `footer_html` | str | `None` | Custom footer HTML |
| `header_height` | str | `'2cm'` | Header height |
| `footer_height` | str | `'2cm'` | Footer height |
| `exclude_header_pages` | str | `None` | Pages without header |
| `exclude_footer_pages` | str | `None` | Pages without footer |

## Error Handling

```python
from pdfleaf import PDFLeaf, PDFLeafError

try:
    pdf = client.convert("<h1>Hello</h1>")
except PDFLeafError as e:
    print(f"Error: {e.message}")
    print(f"Status: {e.status}")
    print(f"Details: {e.data}")
```

## Requirements

- Python 3.8+
- httpx

## License

MIT
