FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including Tesseract OCR
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Remove any conflicting app/main.py
RUN if [ -f app/main.py ]; then mv app/main.py app/_old_main.py; fi

# Create a non-root user to run the application
RUN adduser --disabled-password --gecos "" appuser
USER appuser

# Set production environment
ENV ENVIRONMENT=production
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Expose port
EXPOSE ${PORT}

# Run the application in production mode (no reload)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
