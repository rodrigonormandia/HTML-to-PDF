import time
from .celery_app import celery_app
from .pdf_service import generate_pdf_from_html
from .redis_client import store_pdf, set_job_status
from .supabase_client import update_conversion_status


@celery_app.task(bind=True)
def generate_pdf_task(self, job_id: str, html: str, options: dict):
    """
    Celery task to generate PDF asynchronously.

    Args:
        job_id: Unique identifier for the job
        html: Sanitized HTML content
        options: PDF generation options (page_size, margins, etc.)
    """
    start_time = time.time()

    try:
        # Update status to processing
        set_job_status(job_id, {"status": "processing"})

        # Generate PDF
        pdf_bytes = generate_pdf_from_html(html=html, **options)

        # Store PDF in Redis
        store_pdf(job_id, pdf_bytes)

        # Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)

        # Update status to completed
        set_job_status(job_id, {
            "status": "completed",
            "size": len(pdf_bytes),
        })

        # Update conversion tracking in Supabase (non-blocking)
        try:
            update_conversion_status(
                job_id=job_id,
                status="completed",
                file_size_bytes=len(pdf_bytes),
                processing_time_ms=processing_time_ms
            )
        except Exception:
            pass  # Don't fail if tracking update fails

        return {"status": "completed", "size": len(pdf_bytes)}

    except Exception as e:
        # Update status to failed
        set_job_status(job_id, {
            "status": "failed",
            "error": str(e)
        })

        # Update conversion tracking in Supabase (non-blocking)
        try:
            update_conversion_status(job_id=job_id, status="failed")
        except Exception:
            pass

        raise
