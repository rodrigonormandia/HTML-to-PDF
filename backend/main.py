from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .pdf_service import generate_pdf_from_html

app = FastAPI(title="PDF Gravity API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PDFRequest(BaseModel):
    html_content: str
    action: str = "preview"  # "preview" or "download"

@app.post("/api/convert")
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

@app.get("/health")
async def health_check():
    return {"status": "ok"}
