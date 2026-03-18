#!/usr/bin/env python3
"""Initialize the database tables."""
from app.database import init_db

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("✅ Database tables created successfully!")
