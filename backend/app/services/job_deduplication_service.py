"""
Job deduplication service for idempotent background jobs.
"""
import hashlib
from typing import Optional


class JobDeduplicationService:
    """Service for creating unique job IDs and ensuring idempotency."""

    @staticmethod
    def generate_job_id(job_type: str, params: dict) -> str:
        """
        Generate unique job ID from job type and parameters.

        Args:
            job_type: Type of job
            params: Job parameters

        Returns:
            Unique job ID hash
        """
        # Sort params for consistent hashing
        sorted_params = sorted(params.items())
        param_str = str(sorted_params)

        # Create hash
        content = f"{job_type}:{param_str}"
        job_id = hashlib.sha256(content.encode()).hexdigest()[:32]

        return job_id

    @staticmethod
    async def check_job_exists(db_session, job_id: str) -> Optional[dict]:
        """
        Check if job already exists.

        Args:
            db_session: Database session
            job_id: Job ID to check

        Returns:
            Job data if exists, None otherwise
        """
        from ..models import JobProgress

        job = db_session.query(JobProgress).filter(
            JobProgress.job_id == job_id
        ).first()

        if job:
            return {
                "id": str(job.id),
                "job_id": job.job_id,
                "status": job.status,
                "progress": {
                    "total": job.total_items,
                    "processed": job.processed_items,
                    "failed": job.failed_items
                }
            }

        return None

    @staticmethod
    async def should_resume_job(job_data: dict) -> bool:
        """
        Determine if job should be resumed.

        Args:
            job_data: Existing job data

        Returns:
            True if job should be resumed
        """
        status = job_data.get("status")

        # Resume if job failed or is stuck in running state
        if status in ["failed", "running"]:
            return True

        return False
