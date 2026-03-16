"""
Notification service for WebSocket and email notifications.
"""
from typing import Dict, List, Any
import asyncio


class NotificationService:
    """Service for sending notifications via WebSocket and email."""

    def __init__(self, websocket_manager, email_service):
        self.ws_manager = websocket_manager
        self.email_service = email_service

    async def notify_job_progress(
        self,
        user_id: str,
        job_id: str,
        status: str,
        progress: Dict[str, Any]
    ):
        """
        Notify user about job progress via WebSocket.

        Args:
            user_id: User to notify
            job_id: Job identifier
            status: Job status (pending, running, completed, failed)
            progress: Progress details
        """
        message = {
            "type": "job_progress",
            "job_id": job_id,
            "status": status,
            "progress": progress
        }

        try:
            await self.ws_manager.send_to_user(user_id, message)
        except Exception as e:
            # WebSocket failed, fall back to email
            if status in ["completed", "failed"]:
                await self._send_email_notification(user_id, job_id, status)

    async def notify_allocation_suggestion(
        self,
        user_ids: List[str],
        task_id: str,
        allocation: Dict[str, Any]
    ):
        """
        Notify users about task allocation suggestion.

        Args:
            user_ids: Users to notify
            task_id: Task identifier
            allocation: Allocation details
        """
        message = {
            "type": "allocation_suggestion",
            "task_id": task_id,
            "allocation": allocation
        }

        for user_id in user_ids:
            try:
                await self.ws_manager.send_to_user(user_id, message)
            except Exception:
                # Silently fail - allocation notifications are not critical
                pass

    async def _send_email_notification(
        self,
        user_id: str,
        job_id: str,
        status: str
    ):
        """Send email notification for job completion."""
        # Get user email from DB
        # Send email using email service
        # This is a placeholder
        pass
