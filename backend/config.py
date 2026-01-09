import os

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# PDF Storage Configuration
PDF_TTL_SECONDS = int(os.getenv("PDF_TTL_SECONDS", 7200))  # 2 hours default
