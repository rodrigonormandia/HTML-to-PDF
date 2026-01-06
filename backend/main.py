from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import bleach
from .pdf_service import generate_pdf_from_html

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
    title="PDF Gravity API",
    description="""
## API para conversão de HTML para PDF

Esta API permite converter conteúdo HTML em documentos PDF de alta qualidade.

### Funcionalidades:
- **Preview**: Visualize o PDF diretamente no navegador
- **Download**: Baixe o PDF como arquivo

### Segurança:
- Rate limiting: 30 requisições por minuto por IP
- Limite de tamanho: 2MB
- Sanitização de HTML (remoção de scripts e elementos perigosos)

### Uso:
Envie seu conteúdo HTML para o endpoint `/api/convert` e receba o PDF gerado.
O TailwindCSS é injetado automaticamente para estilização.
    """,
    version="1.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
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
    allow_headers=["Content-Type"],
)


# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)

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
    """Modelo de requisição para conversão de HTML para PDF."""

    html_content: str = Field(
        ...,
        description="Conteúdo HTML a ser convertido em PDF. Pode ser HTML completo ou apenas um fragmento. Máximo 2MB.",
        json_schema_extra={
            "example": "<h1>Meu Documento</h1><p>Este é um exemplo de conteúdo HTML.</p>"
        }
    )
    action: str = Field(
        default="preview",
        description="Ação a ser realizada: 'preview' para visualizar inline ou 'download' para baixar o arquivo.",
        json_schema_extra={
            "example": "preview"
        }
    )
    page_size: str = Field(
        default="A4",
        description="Tamanho da página: A4, Letter, A3, A5 ou dimensões customizadas (ex: '210mm 297mm').",
        json_schema_extra={
            "example": "A4"
        }
    )
    orientation: str = Field(
        default="portrait",
        description="Orientação da página: 'portrait' (retrato) ou 'landscape' (paisagem).",
        json_schema_extra={
            "example": "portrait"
        }
    )
    margin_top: str = Field(
        default="2cm",
        description="Margem superior (ex: '2cm', '1in', '20mm').",
        json_schema_extra={
            "example": "2cm"
        }
    )
    margin_bottom: str = Field(
        default="2cm",
        description="Margem inferior.",
        json_schema_extra={
            "example": "2cm"
        }
    )
    margin_left: str = Field(
        default="2cm",
        description="Margem esquerda.",
        json_schema_extra={
            "example": "2cm"
        }
    )
    margin_right: str = Field(
        default="2cm",
        description="Margem direita.",
        json_schema_extra={
            "example": "2cm"
        }
    )
    include_page_numbers: bool = Field(
        default=False,
        description="Se True, adiciona números de página no rodapé (Página X de Y).",
        json_schema_extra={
            "example": False
        }
    )

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

@app.post(
    "/api/convert",
    summary="Converter HTML para PDF",
    description="""
Converte conteúdo HTML em um documento PDF.

**Comportamento:**
- Se o HTML não contiver tags `<html>` ou `<body>`, será automaticamente encapsulado em um documento HTML válido
- O TailwindCSS CDN é injetado automaticamente para permitir uso de classes utilitárias
- O PDF é gerado usando WeasyPrint com suporte completo a CSS
- O HTML é sanitizado para remover scripts e elementos perigosos

**Segurança:**
- Rate limit: 30 requisições por minuto por IP
- Tamanho máximo: 2MB
- Sanitização automática de HTML

**Ações disponíveis:**
- `preview`: Retorna o PDF para visualização inline no navegador
- `download`: Retorna o PDF com header para download (Content-Disposition: attachment)
    """,
    response_description="Documento PDF gerado",
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "PDF gerado com sucesso"
        },
        400: {
            "description": "HTML inválido",
            "content": {
                "application/json": {
                    "example": {"detail": "HTML não pode estar vazio"}
                }
            }
        },
        429: {
            "description": "Rate limit excedido",
            "content": {
                "application/json": {
                    "example": {"detail": "Rate limit exceeded: 30 per 1 minute"}
                }
            }
        },
        500: {
            "description": "Erro ao gerar o PDF",
            "content": {
                "application/json": {
                    "example": {"detail": "Erro ao processar o HTML"}
                }
            }
        }
    },
    tags=["Conversão"]
)
@limiter.limit("30/minute")
async def convert_html_to_pdf(request: Request, pdf_request: PDFRequest):
    # 1. Validar HTML
    is_valid, error_msg = validate_html(pdf_request.html_content)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # 2. Sanitizar HTML
    clean_html = sanitize_html(pdf_request.html_content)

    # 3. Gerar PDF
    try:
        pdf_bytes = generate_pdf_from_html(
            html=clean_html,
            page_size=pdf_request.page_size,
            orientation=pdf_request.orientation,
            margin_top=pdf_request.margin_top,
            margin_bottom=pdf_request.margin_bottom,
            margin_left=pdf_request.margin_left,
            margin_right=pdf_request.margin_right,
            include_page_numbers=pdf_request.include_page_numbers
        )

        headers = {
            "Content-Type": "application/pdf",
        }

        if pdf_request.action == "download":
            headers["Content-Disposition"] = 'attachment; filename="document.pdf"'
        else:
            headers["Content-Disposition"] = 'inline; filename="preview.pdf"'

        return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail="Erro ao gerar o PDF")

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
