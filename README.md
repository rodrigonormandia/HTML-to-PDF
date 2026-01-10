# PDF Leaf

The developer-friendly HTML to PDF converter with native TailwindCSS support.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.14.0-green.svg)](https://github.com/rodrigonormandia/HTML-to-PDF)

## Features

- **TailwindCSS Native Support** - Use Tailwind classes directly in your HTML
- **Custom Headers & Footers** - Full HTML support with page exclusion options
- **Page Break Control** - CSS classes for precise page breaks
- **Async Processing** - Queue-based PDF generation with job status tracking
- **Webhooks** - Get notified when your PDFs are ready
- **No Watermark** - Clean PDFs on all plans
- **No Expiration** - Your PDFs never expire

## Quick Start

### Using the API

```bash
curl -X POST "https://htmltopdf.buscarid.com/api/v1/convert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"html_content": "<h1 class=\"text-blue-500\">Hello TailwindCSS!</h1>"}'
```

### Using SDKs

**TypeScript/JavaScript:**
```typescript
import { PDFLeaf } from '@pdfleaf/sdk';

const client = new PDFLeaf({ apiKey: 'pk_live_...' });
const pdf = await client.convert('<h1 class="text-blue-500">Hello!</h1>');
```

**Python:**
```python
from pdfleaf import PDFLeaf

client = PDFLeaf(api_key="pk_live_...")
pdf = client.convert('<h1 class="text-blue-500">Hello!</h1>')
```

**PHP:**
```php
use PDFLeaf\PDFLeaf;

$client = new PDFLeaf('pk_live_...');
$pdf = $client->convert('<h1 class="text-blue-500">Hello!</h1>');
```

## Installation

### SDKs

| Language | Installation |
|----------|--------------|
| TypeScript/JavaScript | `npm install @pdfleaf/sdk` |
| Python | `pip install pdfleaf` |
| PHP | `composer require pdfleaf/sdk` |

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/convert` | Convert HTML to PDF |
| GET | `/api/v1/jobs/{job_id}` | Check job status |
| GET | `/api/v1/jobs/{job_id}/download` | Download PDF |
| POST | `/api/v1/webhooks` | Create webhook |
| GET | `/api/v1/webhooks` | List webhooks |
| DELETE | `/api/v1/webhooks/{id}` | Delete webhook |

### PDF Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `page_size` | string | `A4` | A3, A4, A5, Letter, Legal, B4, B5 |
| `orientation` | string | `portrait` | portrait or landscape |
| `margin_top` | string | `2cm` | Top margin (cm, mm, in) |
| `margin_bottom` | string | `2cm` | Bottom margin |
| `margin_left` | string | `2cm` | Left margin |
| `margin_right` | string | `2cm` | Right margin |
| `header_html` | string | null | Custom header HTML |
| `footer_html` | string | null | Custom footer HTML |
| `include_page_numbers` | boolean | false | Add page numbers |

## Documentation

- [API Docs (Swagger)](https://htmltopdf.buscarid.com/api/docs)
- [API Docs (ReDoc)](https://htmltopdf.buscarid.com/api/redoc)
- [TailwindCSS to PDF Guide](https://htmltopdf.buscarid.com/guide/tailwind-to-pdf)

## Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### Running Locally

```bash
# Clone the repository
git clone https://github.com/rodrigonormandia/HTML-to-PDF.git
cd HTML-to-PDF

# Start with Docker Compose
docker compose up

# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

### Project Structure

```
├── frontend/          # React + Vite + TypeScript
├── backend/           # Python + FastAPI + WeasyPrint
├── sdks/
│   ├── typescript/    # @pdfleaf/sdk
│   ├── python/        # pdfleaf
│   └── php/           # pdfleaf/sdk
└── supabase/          # Database migrations
```

## Pricing

| Plan | PDFs/month | Price |
|------|------------|-------|
| Free | 100 | $0 |
| Starter | 2,000 | $15/mo |
| Pro | 10,000 | $49/mo |
| Enterprise | 50,000 | $99/mo |

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Rodrigo Normandia** - [buscarid.com](https://buscarid.com)
