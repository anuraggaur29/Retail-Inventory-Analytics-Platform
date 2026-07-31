# 🚀 10: Production Deployment Handbook

## 1. Objective
Understand how StockPulse is deployed across Supabase (PostgreSQL), Hugging Face Spaces (Dockerized Backend), and Vercel (React Frontend).

---

## 2. Big Picture Architecture

```
[ Vercel (Frontend SPA) ] ──(HTTPS)──> [ Hugging Face Spaces (Backend Docker) ] ──(SSL)──> [ Supabase (PostgreSQL) ]
```

---

## 3. Deployment Configurations

### A. Database (Supabase PostgreSQL)
- **Connection URI**: `postgresql://postgres.[REF]:[PASS]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
- **Commands**:
  ```bash
  alembic upgrade head
  python -m app.scripts.seed
  ```

### B. Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.10-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

### C. Frontend Vercel Config (`frontend/vercel.json`)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 4. Key Takeaways
- **Supabase** handles managed database pooling.
- **HF Spaces Docker SDK** serves backend API on port 7860.
- **Vercel** serves SPA with client-side route rewrites.
- Proceed to [`11_CODE_WALKTHROUGH.md`](./11_CODE_WALKTHROUGH.md).
