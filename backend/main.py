from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import bleach
import uuid
from datetime import datetime
from typing import Optional
from .pdf_service import generate_pdf_from_html
from .redis_client import set_job_status, get_job_status, get_pdf
from .tasks import generate_pdf_task
from .supabase_client import (
    track_conversion,
    hash_api_key,
    validate_api_key,
    check_user_quota
)

# Constantes de segurança
MAX_HTML_SIZE = 2 * 1024 * 1024  # 2MB

# Tags HTML permitidas para sanitização
ALLOWED_TAGS = [
    'html', 'head', 'body', 'title', 'style', 'meta', 'link',
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'a', 'img', 'br', 'hr', 'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup',
    'blockquote', 'pre', 'code', 'header', 'footer', 'main',
    'section', 'article', 'aside', 'nav', 'figure', 'figcaption',
    'address', 'time', 'mark', 'small', 'abbr', 'cite', 'q',
    'details', 'summary', 'data', 'var', 'samp', 'kbd'
]

# Atributos permitidos por tag
ALLOWED_ATTRIBUTES = {
    '*': ['class', 'id', 'style', 'lang', 'dir', 'title'],
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height', 'loading'],
    'meta': ['charset', 'name', 'content', 'http-equiv'],
    'link': ['rel', 'href', 'type', 'media'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan', 'scope'],
    'col': ['span'],
    'colgroup': ['span'],
    'time': ['datetime'],
    'data': ['value'],
    'q': ['cite'],
    'blockquote': ['cite']
}

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


def get_api_key_from_request(request: Request) -> Optional[str]:
    """Extract API key from Authorization header or X-API-Key header."""
    # Try Authorization: Bearer <key>
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]

    # Try X-API-Key header
    api_key = request.headers.get("X-API-Key")
    if api_key:
        return api_key

    return None


def sanitize_html(html: str) -> str:
    """Remove elementos HTML potencialmente perigosos."""
    return bleach.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )


def validate_html(html: str) -> tuple[bool, str]:
    """Valida o conteúdo HTML básico."""
    if not html:
        return False, "HTML não pode estar vazio"

    stripped = html.strip()
    if not stripped:
        return False, "HTML não pode estar vazio"

    if len(stripped) < 10:
        return False, "HTML muito curto (mínimo 10 caracteres)"

    return True, ""

app = FastAPI(
    title="PDF Leaf API",
    description="""
## API para conversão de HTML para PDF

Esta API permite converter conteúdo HTML em documentos PDF de alta qualidade usando WeasyPrint.

### 🔐 Autenticação

**A autenticação é obrigatória.** Use uma das opções abaixo:

| Método | Header | Exemplo |
|--------|--------|---------|
| **Bearer Token** | `Authorization` | `Authorization: Bearer pk_live_abc123...` |
| **API Key Header** | `X-API-Key` | `X-API-Key: pk_live_abc123...` |

Para obter sua API key, acesse o [Dashboard](https://htmltopdf.buscarid.com/dashboard) e vá em **API Keys**.

### 📊 Quotas e Limites

Cada plano tem um limite mensal de conversões:

| Plano | Conversões/mês | Preço |
|-------|----------------|-------|
| **Free** | 100 | Grátis |
| **Starter** | 2.000 | $15/mês |
| **Pro** | 10.000 | $49/mês |
| **Enterprise** | 50.000 | $99/mês |

A resposta da API inclui informações de quota:
```json
{
  "job_id": "...",
  "status": "pending",
  "quota": {
    "used": 45,
    "limit": 100,
    "remaining": 55
  }
}
```

### Funcionalidades

| Recurso | Descrição |
|---------|-----------|
| **Preview** | Visualize o PDF diretamente no navegador |
| **Download** | Baixe o PDF como arquivo |
| **Tamanho de Página** | A4, Letter, A3, A5, Legal, B4, B5 ou customizado |
| **Orientação** | Retrato (portrait) ou Paisagem (landscape) |
| **Margens** | Customizáveis em cm, mm ou polegadas |
| **Numeração** | Números de página automáticos no rodapé |
| **Header/Footer** | HTML personalizado para cabeçalho e rodapé |
| **TailwindCSS** | Suporte nativo (injetado automaticamente) |

### Configurações de PDF

```json
{
  "html_content": "<h1>Meu PDF</h1>",
  "action": "download",
  "page_size": "A4",
  "orientation": "portrait",
  "margin_top": "2cm",
  "margin_bottom": "2cm",
  "margin_left": "2cm",
  "margin_right": "2cm",
  "include_page_numbers": false,
  "header_html": "<div>Meu Header</div>",
  "footer_html": "<div>Página {{page}} de {{pages}}</div>"
}
```

### Tamanhos de Página Suportados

- **A3**: 297mm × 420mm
- **A4**: 210mm × 297mm (padrão)
- **A5**: 148mm × 210mm
- **Letter**: 8.5in × 11in
- **Legal**: 8.5in × 14in
- **B4**: 250mm × 353mm
- **B5**: 176mm × 250mm
- **Customizado**: ex: `"210mm 297mm"`

### Segurança

- 🔑 Autenticação obrigatória via API key
- ⏱️ Rate limiting: 30 requisições por minuto por IP
- 📦 Limite de tamanho: 2MB
- 🛡️ Sanitização de HTML (remoção de scripts e elementos perigosos)
- 🔒 Headers de segurança (CSP, X-Frame-Options, etc.)

### Exemplo de Uso

```bash
curl -X POST "https://htmltopdf.buscarid.com/api/convert" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer pk_live_sua_api_key_aqui" \\
  -d '{
    "html_content": "<h1>Hello World</h1>",
    "action": "download",
    "page_size": "A4",
    "orientation": "portrait"
  }' \\
  --output documento.pdf
```

### Fluxo de Conversão (Async)

1. `POST /api/convert` → Retorna `job_id` e `status: pending`
2. `GET /api/jobs/{job_id}` → Polling para verificar status
3. `GET /api/jobs/{job_id}/download` → Baixar o PDF quando `status: completed`

### Links Úteis

- 🌐 [PDF Leaf App](https://htmltopdf.buscarid.com)
- 📖 [Documentação ReDoc](/api/redoc)
- 🔑 [Dashboard - API Keys](https://htmltopdf.buscarid.com/dashboard)
- 💰 [Preços](https://htmltopdf.buscarid.com/pricing)
    """,
    version="1.9.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    contact={
        "name": "Rodrigo Normandia",
        "url": "https://htmltopdf.buscarid.com",
        "email": "contato@buscarid.com"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    }
)

# Configurar rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://htmltopdf.buscarid.com",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000"
    ],
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
)


# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)

    # Skip CSP for API documentation pages (Swagger/ReDoc need external CDN resources)
    if request.url.path in ["/api/docs", "/api/redoc", "/api/openapi.json"]:
        return response

    # Content Security Policy
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' https://cdn.tailwindcss.com 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' http://localhost:* https://*.buscarid.com; "
        "frame-ancestors 'none'"
    )

    # Other security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    # HSTS for HTTPS connections
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response

class PDFRequest(BaseModel):
    """
    Modelo de requisição para conversão de HTML para PDF.

    Todos os parâmetros de configuração do PDF são opcionais e possuem valores padrão.
    Apenas o campo `html_content` é obrigatório.
    """

    html_content: str = Field(
        ...,
        description="Conteúdo HTML a ser convertido em PDF. Pode ser um documento HTML completo ou apenas um fragmento. O TailwindCSS é injetado automaticamente. Máximo: 2MB.",
        min_length=10,
        json_schema_extra={
            "example": """<!DOCTYPE html>
<html>
<head>
    <title>Meu Documento</title>
    <style>
        body { font-family: Arial, sans-serif; }
        h1 { color: #3b82f6; }
    </style>
</head>
<body>
    <h1>Relatório Mensal</h1>
    <p>Este é um exemplo de documento PDF gerado pelo PDF Gravity.</p>
    <table class="w-full border-collapse">
        <tr class="bg-gray-100">
            <th class="border p-2">Item</th>
            <th class="border p-2">Valor</th>
        </tr>
        <tr>
            <td class="border p-2">Produto A</td>
            <td class="border p-2">R$ 100,00</td>
        </tr>
    </table>
</body>
</html>"""
        }
    )
    action: str = Field(
        default="preview",
        description="Ação a ser realizada. Use 'preview' para abrir o PDF no navegador ou 'download' para baixar como arquivo.",
        json_schema_extra={
            "example": "download",
            "enum": ["preview", "download"]
        }
    )
    page_size: str = Field(
        default="A4",
        description="Tamanho da página. Valores aceitos: A3, A4, A5, Letter, Legal, B4, B5, ou dimensões customizadas (ex: '210mm 297mm').",
        json_schema_extra={
            "example": "A4",
            "enum": ["A3", "A4", "A5", "Letter", "Legal", "B4", "B5"]
        }
    )
    orientation: str = Field(
        default="portrait",
        description="Orientação da página. Use 'portrait' para retrato (vertical) ou 'landscape' para paisagem (horizontal).",
        json_schema_extra={
            "example": "portrait",
            "enum": ["portrait", "landscape"]
        }
    )
    margin_top: str = Field(
        default="2cm",
        description="Margem superior. Aceita valores em cm (centímetros), mm (milímetros) ou in (polegadas). Exemplos: '2cm', '20mm', '0.5in'.",
        json_schema_extra={
            "example": "2cm"
        }
    )
    margin_bottom: str = Field(
        default="2cm",
        description="Margem inferior. Aceita valores em cm, mm ou in.",
        json_schema_extra={
            "example": "2cm"
        }
    )
    margin_left: str = Field(
        default="2cm",
        description="Margem esquerda. Aceita valores em cm, mm ou in.",
        json_schema_extra={
            "example": "2cm"
        }
    )
    margin_right: str = Field(
        default="2cm",
        description="Margem direita. Aceita valores em cm, mm ou in.",
        json_schema_extra={
            "example": "2cm"
        }
    )
    include_page_numbers: bool = Field(
        default=False,
        description="Quando True, adiciona numeração de páginas no rodapé de cada página no formato 'Página X de Y'.",
        json_schema_extra={
            "example": True
        }
    )
    header_html: str | None = Field(
        default=None,
        description="HTML personalizado para o cabeçalho de cada página. Suporta HTML completo com estilos inline.",
        json_schema_extra={
            "example": "<div style='text-align:center; font-size:12pt;'><strong>Minha Empresa</strong></div>"
        }
    )
    footer_html: str | None = Field(
        default=None,
        description="HTML personalizado para o rodapé de cada página. Suporta HTML completo com estilos inline.",
        json_schema_extra={
            "example": "<div style='text-align:center; font-size:10pt;'>Documento Confidencial</div>"
        }
    )
    header_height: str = Field(
        default="2cm",
        description="Altura do cabeçalho. Aceita valores em cm, mm ou in. Exemplos: '2cm', '20mm', '0.5in'.",
        json_schema_extra={
            "example": "2cm"
        }
    )
    footer_height: str = Field(
        default="2cm",
        description="Altura do rodapé. Aceita valores em cm, mm ou in.",
        json_schema_extra={
            "example": "2cm"
        }
    )
    exclude_header_pages: str | None = Field(
        default=None,
        description="Números de páginas onde o cabeçalho NÃO deve aparecer, separados por vírgula. Ex: '1, 3, 5'.",
        json_schema_extra={
            "example": "1"
        }
    )
    exclude_footer_pages: str | None = Field(
        default=None,
        description="Números de páginas onde o rodapé NÃO deve aparecer, separados por vírgula. Ex: '1, 3, 5'.",
        json_schema_extra={
            "example": "1"
        }
    )
    user_id: str | None = Field(
        default=None,
        description="ID do usuário autenticado (para conversões via frontend). Alternativa ao uso de API key no header.",
        json_schema_extra={
            "example": "550e8400-e29b-41d4-a716-446655440000"
        }
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "html_content": "<h1>Documento Simples</h1><p>Conteúdo do documento.</p>",
                    "action": "preview"
                },
                {
                    "html_content": "<h1>Relatório Completo</h1><p>Com todas as configurações.</p>",
                    "action": "download",
                    "page_size": "A4",
                    "orientation": "landscape",
                    "margin_top": "1.5cm",
                    "margin_bottom": "1.5cm",
                    "margin_left": "2cm",
                    "margin_right": "2cm",
                    "include_page_numbers": True
                }
            ]
        }
    }

    @field_validator('html_content')
    @classmethod
    def validate_html_size(cls, v: str) -> str:
        """Valida o tamanho do HTML (máximo 2MB)."""
        if len(v.encode('utf-8')) > MAX_HTML_SIZE:
            raise ValueError(f'HTML excede o limite de 2MB')
        return v

    @field_validator('orientation')
    @classmethod
    def validate_orientation(cls, v: str) -> str:
        """Valida a orientação da página."""
        if v.lower() not in ['portrait', 'landscape']:
            raise ValueError("Orientação deve ser 'portrait' ou 'landscape'")
        return v.lower()

    @field_validator('page_size')
    @classmethod
    def validate_page_size(cls, v: str) -> str:
        """Valida o tamanho da página."""
        valid_sizes = ['A3', 'A4', 'A5', 'Letter', 'Legal', 'B4', 'B5']
        if v.upper() in [s.upper() for s in valid_sizes]:
            return v
        # Permite tamanhos customizados no formato "NNNmm NNNmm"
        if 'mm' in v or 'cm' in v or 'in' in v:
            return v
        raise ValueError(f"Tamanho de página inválido. Use: {', '.join(valid_sizes)} ou dimensões customizadas.")

    @field_validator('header_height', 'footer_height')
    @classmethod
    def validate_height(cls, v: str) -> str:
        """Valida o formato da altura (número + unidade cm/mm/in)."""
        import re
        v = v.strip()
        if not re.match(r'^[\d.]+\s*(cm|mm|in)$', v):
            raise ValueError("Altura deve ser um número seguido de cm, mm ou in. Exemplos: '2cm', '20mm', '0.5in'")
        return v

    @field_validator('exclude_header_pages', 'exclude_footer_pages')
    @classmethod
    def validate_page_exclusion(cls, v: str | None) -> str | None:
        """Valida o formato de exclusão de páginas (números inteiros positivos separados por vírgula)."""
        if v is None:
            return None
        v = v.strip()
        if not v:
            return None
        pages = [p.strip() for p in v.split(',')]
        for page in pages:
            if not page.isdigit() or int(page) < 1:
                raise ValueError("Números de páginas devem ser inteiros positivos separados por vírgula. Exemplo: '1, 3, 5'")
        return v

@app.post(
    "/api/convert",
    summary="Converter HTML para PDF (Async)",
    description="""
Submete conteúdo HTML para conversão assíncrona em PDF.

**Fluxo:**
1. POST /api/convert → Retorna `job_id` e `status: pending`
2. GET /api/jobs/{job_id} → Polling para verificar status
3. GET /api/jobs/{job_id}/download → Baixar o PDF quando pronto

**Comportamento:**
- Se o HTML não contiver tags `<html>` ou `<body>`, será automaticamente encapsulado em um documento HTML válido
- O TailwindCSS CDN é injetado automaticamente para permitir uso de classes utilitárias
- O PDF é gerado usando WeasyPrint com suporte completo a CSS
- O HTML é sanitizado para remover scripts e elementos perigosos
- PDFs ficam disponíveis por 2 horas após geração

**Segurança:**
- Rate limit: 30 requisições por minuto por IP
- Tamanho máximo: 2MB
- Sanitização automática de HTML
    """,
    response_description="Job ID para acompanhamento",
    responses={
        200: {
            "description": "Job criado com sucesso",
            "content": {
                "application/json": {
                    "example": {
                        "job_id": "550e8400-e29b-41d4-a716-446655440000",
                        "status": "pending",
                        "quota": {
                            "used": 46,
                            "limit": 100,
                            "remaining": 54
                        }
                    }
                }
            }
        },
        400: {
            "description": "HTML inválido",
            "content": {
                "application/json": {
                    "example": {"detail": "HTML não pode estar vazio"}
                }
            }
        },
        401: {
            "description": "Autenticação necessária ou API key inválida",
            "content": {
                "application/json": {
                    "examples": {
                        "missing_auth": {
                            "summary": "Sem autenticação",
                            "value": {
                                "detail": {
                                    "error": "authentication_required",
                                    "message": "Authentication required. Please login or provide an API key in the Authorization header (Bearer <key>) or X-API-Key header."
                                }
                            }
                        },
                        "invalid_key": {
                            "summary": "API key inválida",
                            "value": {
                                "detail": {
                                    "error": "invalid_api_key",
                                    "message": "Invalid or expired API key."
                                }
                            }
                        }
                    }
                }
            }
        },
        429: {
            "description": "Rate limit ou quota excedidos",
            "content": {
                "application/json": {
                    "examples": {
                        "rate_limit": {
                            "summary": "Rate limit excedido",
                            "value": {"detail": "Rate limit exceeded: 30 per 1 minute"}
                        },
                        "quota_exceeded": {
                            "summary": "Quota mensal excedida",
                            "value": {
                                "detail": {
                                    "error": "quota_exceeded",
                                    "message": "Monthly quota exceeded. Used 100/100 conversions.",
                                    "quota": {
                                        "used": 100,
                                        "limit": 100,
                                        "remaining": 0
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    tags=["Conversão"],
    openapi_extra={
        "requestBody": {
            "content": {
                "application/json": {
                    "examples": {
                        "simples": {
                            "summary": "Exemplo Simples",
                            "description": "Conversão básica com valores padrão",
                            "value": {
                                "html_content": "<h1>Olá Mundo!</h1><p>Este é um teste simples de conversão HTML para PDF.</p>",
                                "action": "preview"
                            }
                        },
                        "completo": {
                            "summary": "Exemplo Completo",
                            "description": "Conversão com todas as configurações personalizadas",
                            "value": {
                                "html_content": """<!DOCTYPE html>
<html>
<head>
    <title>Relatório de Vendas</title>
    <style>
        body { font-family: Arial, sans-serif; }
        h1 { color: #3b82f6; border-bottom: 2px solid #3b82f6; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #3b82f6; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .total { font-weight: bold; background-color: #e0f2fe; }
    </style>
</head>
<body>
    <h1>📊 Relatório de Vendas - Janeiro 2026</h1>
    <p>Gerado em: 06/01/2026</p>

    <table>
        <thead>
            <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Preço Unit.</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Notebook Dell</td>
                <td>15</td>
                <td>R$ 4.500,00</td>
                <td>R$ 67.500,00</td>
            </tr>
            <tr>
                <td>Monitor LG 27"</td>
                <td>25</td>
                <td>R$ 1.200,00</td>
                <td>R$ 30.000,00</td>
            </tr>
            <tr>
                <td>Teclado Mecânico</td>
                <td>50</td>
                <td>R$ 350,00</td>
                <td>R$ 17.500,00</td>
            </tr>
            <tr class="total">
                <td colspan="3">TOTAL GERAL</td>
                <td>R$ 115.000,00</td>
            </tr>
        </tbody>
    </table>

    <p style="margin-top: 30px; color: #666;">
        <em>Este relatório foi gerado automaticamente pelo PDF Gravity.</em>
    </p>
</body>
</html>""",
                                "action": "download",
                                "page_size": "A4",
                                "orientation": "portrait",
                                "margin_top": "2cm",
                                "margin_bottom": "2cm",
                                "margin_left": "2.5cm",
                                "margin_right": "2.5cm",
                                "include_page_numbers": True
                            }
                        },
                        "landscape": {
                            "summary": "Paisagem com Tabela Larga",
                            "description": "PDF em orientação paisagem para tabelas com muitas colunas",
                            "value": {
                                "html_content": """<html>
<head>
    <style>
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #333; padding: 8px; }
        th { background: #2563eb; color: white; }
    </style>
</head>
<body>
    <h2>Planilha de Funcionários</h2>
    <table>
        <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Cargo</th>
            <th>Departamento</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Admissão</th>
            <th>Salário</th>
        </tr>
        <tr>
            <td>001</td>
            <td>Maria Silva</td>
            <td>Gerente</td>
            <td>Vendas</td>
            <td>maria@empresa.com</td>
            <td>(11) 99999-0001</td>
            <td>15/03/2020</td>
            <td>R$ 12.000</td>
        </tr>
        <tr>
            <td>002</td>
            <td>João Santos</td>
            <td>Analista</td>
            <td>TI</td>
            <td>joao@empresa.com</td>
            <td>(11) 99999-0002</td>
            <td>22/06/2021</td>
            <td>R$ 8.500</td>
        </tr>
    </table>
</body>
</html>""",
                                "action": "download",
                                "page_size": "A4",
                                "orientation": "landscape",
                                "margin_top": "1.5cm",
                                "margin_bottom": "1.5cm",
                                "margin_left": "1cm",
                                "margin_right": "1cm",
                                "include_page_numbers": True
                            }
                        },
                        "tailwind": {
                            "summary": "Com TailwindCSS",
                            "description": "Usando classes TailwindCSS (injetado automaticamente)",
                            "value": {
                                "html_content": """<div class="p-8 max-w-2xl mx-auto">
    <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <h1 class="text-3xl font-bold">PDF Gravity</h1>
        <p class="text-blue-100 mt-2">Converta HTML para PDF com estilo!</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">✨ Funcionalidades</h2>
        <ul class="space-y-2">
            <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Suporte completo a TailwindCSS
            </li>
            <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Tamanhos de página customizáveis
            </li>
            <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Numeração automática de páginas
            </li>
        </ul>
    </div>
</div>""",
                                "action": "preview",
                                "page_size": "A4",
                                "orientation": "portrait"
                            }
                        }
                    }
                }
            }
        }
    }
)
@limiter.limit("30/minute")
async def convert_html_to_pdf(request: Request, pdf_request: PDFRequest):
    # 1. Autenticação - API key ou user_id obrigatório
    api_key = get_api_key_from_request(request)
    user_id = None
    api_key_id = None
    source = "web"

    if api_key:
        # Validação via API key (chamadas de API externa)
        key_hash = hash_api_key(api_key)
        key_info = validate_api_key(key_hash)

        if not key_info or not key_info.get("is_valid"):
            raise HTTPException(
                status_code=401,
                detail={
                    "error": "invalid_api_key",
                    "message": "Invalid or expired API key."
                }
            )

        user_id = key_info["user_id"]
        api_key_id = key_info.get("api_key_id")
        source = "api"

    elif pdf_request.user_id:
        # Usuário logado no frontend
        user_id = pdf_request.user_id
        source = "web"

    else:
        # Sem autenticação = erro
        raise HTTPException(
            status_code=401,
            detail={
                "error": "authentication_required",
                "message": "Authentication required. Please login or provide an API key in the Authorization header (Bearer <key>) or X-API-Key header."
            }
        )

    # 2. Verificar cota ANTES de processar
    quota = check_user_quota(user_id)

    if not quota.get("can_convert", False):
        raise HTTPException(
            status_code=429,
            detail={
                "error": "quota_exceeded",
                "message": f"Monthly quota exceeded. Used {quota['used_this_month']}/{quota['monthly_limit']} conversions.",
                "quota": {
                    "used": quota["used_this_month"],
                    "limit": quota["monthly_limit"],
                    "remaining": 0
                }
            }
        )

    # 3. Validar HTML
    is_valid, error_msg = validate_html(pdf_request.html_content)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # 4. Sanitizar HTML
    clean_html = sanitize_html(pdf_request.html_content)

    # 5. Sanitizar header/footer HTML (se fornecido)
    clean_header = sanitize_html(pdf_request.header_html) if pdf_request.header_html else None
    clean_footer = sanitize_html(pdf_request.footer_html) if pdf_request.footer_html else None

    # 6. Criar job
    job_id = str(uuid.uuid4())
    set_job_status(job_id, {"status": "pending"})

    # 7. Track conversion com user_id e api_key_id
    try:
        ip_address = get_remote_address(request)
        html_size = len(clean_html.encode('utf-8'))
        track_conversion(
            job_id=job_id,
            user_id=user_id,
            api_key_id=api_key_id,
            action=pdf_request.action,
            html_size=html_size,
            status="pending",
            source=source,
            ip_address=ip_address
        )
    except Exception:
        pass  # Don't fail the request if tracking fails

    # 8. Enviar para fila Celery
    generate_pdf_task.delay(
        job_id=job_id,
        html=clean_html,
        options={
            "page_size": pdf_request.page_size,
            "orientation": pdf_request.orientation,
            "margin_top": pdf_request.margin_top,
            "margin_bottom": pdf_request.margin_bottom,
            "margin_left": pdf_request.margin_left,
            "margin_right": pdf_request.margin_right,
            "include_page_numbers": pdf_request.include_page_numbers,
            "header_html": clean_header,
            "footer_html": clean_footer,
            "header_height": pdf_request.header_height,
            "footer_height": pdf_request.footer_height,
            "exclude_header_pages": pdf_request.exclude_header_pages,
            "exclude_footer_pages": pdf_request.exclude_footer_pages,
        }
    )

    # 9. Retornar resposta com info de cota
    return {
        "job_id": job_id,
        "status": "pending",
        "quota": {
            "used": quota["used_this_month"] + 1,
            "limit": quota["monthly_limit"],
            "remaining": max(0, quota["remaining"] - 1)
        }
    }


@app.get(
    "/api/jobs/{job_id}",
    summary="Verificar status do job",
    description="Retorna o status atual de um job de conversão de PDF.",
    responses={
        200: {
            "description": "Status do job",
            "content": {
                "application/json": {
                    "examples": {
                        "pending": {"value": {"job_id": "xxx", "status": "pending"}},
                        "processing": {"value": {"job_id": "xxx", "status": "processing"}},
                        "completed": {"value": {"job_id": "xxx", "status": "completed", "size": 12345}},
                        "failed": {"value": {"job_id": "xxx", "status": "failed", "error": "Error message"}}
                    }
                }
            }
        },
        404: {"description": "Job não encontrado"}
    },
    tags=["Jobs"]
)
async def get_job(job_id: str):
    """Get job status by ID."""
    status = get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, **status}


@app.get(
    "/api/jobs/{job_id}/download",
    summary="Baixar PDF do job",
    description="Baixa o PDF gerado de um job completado.",
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "PDF gerado"
        },
        400: {"description": "PDF ainda não está pronto"},
        404: {"description": "Job não encontrado ou PDF expirado"}
    },
    tags=["Jobs"]
)
async def download_job_pdf(job_id: str, action: str = "download"):
    """Download PDF from completed job."""
    status = get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")

    if status.get("status") != "completed":
        raise HTTPException(status_code=400, detail="PDF not ready")

    pdf_bytes = get_pdf(job_id)
    if not pdf_bytes:
        raise HTTPException(status_code=404, detail="PDF expired")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"pdfLeaf_{timestamp}.pdf"
    disposition = "attachment" if action == "download" else "inline"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'{disposition}; filename="{filename}"'}
    )

@app.get(
    "/health",
    summary="Health Check",
    description="Verifica se a API está funcionando corretamente.",
    response_description="Status da API",
    responses={
        200: {
            "description": "API está funcionando",
            "content": {
                "application/json": {
                    "example": {"status": "ok"}
                }
            }
        }
    },
    tags=["Sistema"]
)
async def health_check():
    """Endpoint para verificação de saúde da API."""
    return {"status": "ok"}


# ============================================
# STRIPE ENDPOINTS
# ============================================

class CheckoutRequest(BaseModel):
    """Request model for creating a Stripe checkout session."""
    plan_id: str = Field(..., description="Plan ID (starter, pro, or enterprise)")
    user_id: str = Field(..., description="User ID from Supabase")
    email: str = Field(default=None, description="User email (optional, fetched from profile if not provided)")


class PortalRequest(BaseModel):
    """Request model for creating a Stripe customer portal session."""
    user_id: str = Field(..., description="User ID from Supabase")


@app.post(
    "/api/stripe/checkout",
    summary="Create Stripe Checkout Session",
    description="Creates a Stripe Checkout session for subscription payment.",
    tags=["Stripe"],
    responses={
        200: {
            "description": "Checkout session created",
            "content": {
                "application/json": {
                    "example": {"checkout_url": "https://checkout.stripe.com/..."}
                }
            }
        },
        400: {"description": "Invalid plan or configuration error"},
        500: {"description": "Stripe API error"}
    }
)
async def create_checkout(request: Request, checkout_request: CheckoutRequest):
    """Create a Stripe checkout session for subscription."""
    try:
        from .stripe_service import create_checkout_session
        from .supabase_client import supabase

        # Get user email if not provided
        email = checkout_request.email
        if not email:
            result = supabase.table("profiles").select("email").eq("id", checkout_request.user_id).single().execute()
            if not result.data:
                # Try auth.users via admin API
                from supabase import Client
                email = f"user_{checkout_request.user_id}@pdfleaf.com"  # Fallback
            else:
                email = result.data.get("email", f"user_{checkout_request.user_id}@pdfleaf.com")

        # Create checkout session
        base_url = str(request.base_url).rstrip("/")
        frontend_url = "http://localhost:5173" if "localhost" in base_url else "https://htmltopdf.buscarid.com"

        checkout_url = create_checkout_session(
            user_id=checkout_request.user_id,
            email=email,
            plan_id=checkout_request.plan_id,
            success_url=f"{frontend_url}/dashboard?checkout=success",
            cancel_url=f"{frontend_url}/pricing?checkout=canceled"
        )

        return {"checkout_url": checkout_url}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")


@app.post(
    "/api/stripe/portal",
    summary="Create Stripe Customer Portal Session",
    description="Creates a Stripe Customer Portal session for managing subscription.",
    tags=["Stripe"],
    responses={
        200: {
            "description": "Portal session created",
            "content": {
                "application/json": {
                    "example": {"portal_url": "https://billing.stripe.com/..."}
                }
            }
        },
        400: {"description": "User has no Stripe customer ID"},
        500: {"description": "Stripe API error"}
    }
)
async def create_portal(request: Request, portal_request: PortalRequest):
    """Create a Stripe customer portal session for subscription management."""
    try:
        from .stripe_service import create_portal_session

        base_url = str(request.base_url).rstrip("/")
        frontend_url = "http://localhost:5173" if "localhost" in base_url else "https://htmltopdf.buscarid.com"

        portal_url = create_portal_session(
            user_id=portal_request.user_id,
            return_url=f"{frontend_url}/dashboard"
        )

        return {"portal_url": portal_url}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")


@app.post(
    "/api/stripe/webhook",
    summary="Stripe Webhook Handler",
    description="Handles Stripe webhook events for subscription lifecycle.",
    tags=["Stripe"],
    include_in_schema=False  # Hide from docs since it's for Stripe only
)
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    try:
        from .stripe_service import handle_webhook_event

        payload = await request.body()
        sig_header = request.headers.get("stripe-signature", "")

        result = handle_webhook_event(payload, sig_header)

        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])

        return {"received": True}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get(
    "/api/stripe/subscription/{user_id}",
    summary="Get Subscription Status",
    description="Get the current subscription status for a user.",
    tags=["Stripe"],
    responses={
        200: {
            "description": "Subscription status",
            "content": {
                "application/json": {
                    "example": {
                        "plan": "pro",
                        "status": "active",
                        "monthly_limit": 10000,
                        "current_period_end": 1704067200
                    }
                }
            }
        }
    }
)
async def get_subscription(user_id: str):
    """Get user's subscription status."""
    try:
        from .stripe_service import get_subscription_status
        return get_subscription_status(user_id)
    except Exception as e:
        # Return default free plan if there's any error (DB not configured, etc.)
        print(f"Error getting subscription: {e}")
        return {
            "plan": "free",
            "status": "active",
            "monthly_limit": 100
        }
