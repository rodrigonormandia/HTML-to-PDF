from .celery_app import celery_app
from .pdf_service import generate_pdf_from_html
from .redis_client import store_pdf, set_job_status


@celery_app.task(bind=True)
def generate_pdf_task(self, job_id: str, html: str, options: dict):
    """
    Celery task to generate PDF asynchronously.

    Args:
        job_id: Unique identifier for the job
        html: Sanitized HTML content
        options: PDF generation options (page_size, margins, etc.)
    """
    try:
        # Update status to processing
        set_job_status(job_id, {"status": "processing"})

        # Generate PDF
        pdf_bytes = generate_pdf_from_html(html=html, **options)

        # Store PDF in Redis
        store_pdf(job_id, pdf_bytes)

        # Update status to completed
        set_job_status(job_id, {
            "status": "completed",
            "size": len(pdf_bytes),
        })

        return {"status": "completed", "size": len(pdf_bytes)}

    except Exception as e:
        # Update status to failed
        set_job_status(job_id, {
            "status": "failed",
            "error": str(e)
        })
        raise
