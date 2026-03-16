"""
Main FastAPI application for Atlas.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .api import availability_routes, requirements_routes, tasks_routes, allocation_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management for the application."""
    # Startup
    print("🚀 Atlas API starting up...")
    yield
    # Shutdown
    print("👋 Atlas API shutting down...")


app = FastAPI(
    title="Atlas API",
    description="AI Project Planning Engine",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(availability_routes.router)
app.include_router(requirements_routes.router)
app.include_router(tasks_routes.router)
app.include_router(allocation_routes.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Atlas API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
