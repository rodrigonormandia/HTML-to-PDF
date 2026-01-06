from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .pdf_service import generate_pdf_from_html

app = FastAPI(
    title="PDF Gravity API",
    description="""
## API para conversão de HTML para PDF

Esta API permite converter conteúdo HTML em documentos PDF de alta qualidade.

### Funcionalidades:
- **Preview**: Visualize o PDF diretamente no navegador
- **Download**: Baixe o PDF como arquivo

### Uso:
Envie seu conteúdo HTML para o endpoint `/api/convert` e receba o PDF gerado.
O TailwindCSS é injetado automaticamente para estilização.
    """,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PDFRequest(BaseModel):
    """Modelo de requisição para conversão de HTML para PDF."""

    html_content: str = Field(
        ...,
        description="Conteúdo HTML a ser convertido em PDF. Pode ser HTML completo ou apenas um fragmento.",
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

@app.post(
    "/api/convert",
    summary="Converter HTML para PDF",
    description="""
Converte conteúdo HTML em um documento PDF.

**Comportamento:**
- Se o HTML não contiver tags `<html>` ou `<body>`, será automaticamente encapsulado em um documento HTML válido
- O TailwindCSS CDN é injetado automaticamente para permitir uso de classes utilitárias
- O PDF é gerado usando WeasyPrint com suporte completo a CSS

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
async def convert_html_to_pdf(request: PDFRequest):
    try:
        pdf_bytes = generate_pdf_from_html(request.html_content)
        
        headers = {
            "Content-Type": "application/pdf",
        }
        
        if request.action == "download":
            headers["Content-Disposition"] = 'attachment; filename="document.pdf"'
        else:
            headers["Content-Disposition"] = 'inline; filename="preview.pdf"'
            
        return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
        
    except Exception as e:
        # In a real app, log the error
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
