"""
Vercel Serverless Function Entry Point for FastAPI Backend.

This file exposes the FastAPI `app` object to Vercel's Python Serverless Runtime (@vercel/python).
"""

import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

# Vercel serverless handler
handler = app
