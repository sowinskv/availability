"""
Job progress model for tracking background jobs.
"""
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid

from .base import Base, TimestampMixin


class JobProgress(Base, TimestampMixin):
    """Job progress tracking for idempotent background jobs."""
    __tablename__ = "job_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(String(64), nullable=False, unique=True, index=True)  # Unique hash for job
    job_type = Column(String(100), nullable=False, index=True)

    status = Column(String(20), nullable=False, default="pending", index=True)  # pending, running, completed, failed

    total_items = Column(Integer, default=0)
    processed_items = Column(Integer, default=0)
    failed_items = Column(Integer, default=0)

    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    error_message = Column(Text)

    def __repr__(self):
        return f"<JobProgress {self.job_type} {self.status} {self.processed_items}/{self.total_items}>"
