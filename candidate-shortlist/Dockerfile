FROM python:3.11-slim

# Limit multi-threading libraries memory usage
ENV OMP_NUM_THREADS=1
ENV MKL_NUM_THREADS=1
ENV OPENBLAS_NUM_THREADS=1
ENV VECLIB_MAXIMUM_THREADS=1
ENV NUMEXPR_NUM_THREADS=1

WORKDIR /app

COPY requirements.txt .

# Install CPU-only PyTorch first to save massive memory and download size
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["sh", "-c", "uvicorn main-db:app --host 0.0.0.0 --port ${PORT:-8000}"]

