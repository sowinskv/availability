"""
Allocation API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID
from datetime import datetime

from ..models import Allocation, Task
from ..services.smart_allocator_service import SmartAllocatorService
from ..exceptions import AllocationException
from ..database import get_db
from ..dependencies import get_smart_allocator

router = APIRouter(prefix="/allocations", tags=["allocations"])


from pydantic import BaseModel


class AllocationRequest(BaseModel):
    task_ids: List[UUID]
    team_capacity: Dict[str, float]  # user_id -> available_hours


class AllocationSuggestion(BaseModel):
    task_id: str
    user_id: str
    confidence_score: float
    reason: str
    alternatives: List[Dict[str, Any]]


class AllocationResponse(BaseModel):
    id: str
    task_id: str
    user_id: str
    reason: str | None
    confidence_score: float
    accepted_at: datetime | None
    rejected_at: datetime | None

    class Config:
        from_attributes = True


@router.post("/suggest", response_model=List[AllocationSuggestion])
async def suggest_allocations(
    request: AllocationRequest,
    db: Session = Depends(get_db),
    allocator_service: SmartAllocatorService = Depends(get_smart_allocator)
):
    """Get allocation suggestions for tasks."""
    try:
        # Fetch tasks
        tasks = db.query(Task).filter(Task.id.in_(request.task_ids)).all()

        if len(tasks) != len(request.task_ids):
            raise HTTPException(status_code=404, detail="Some tasks not found")

        # Convert to dict format for allocator
        task_dicts = [
            {
                "id": str(task.id),
                "title": task.title,
                "estimated_hours": task.estimated_hours,
                "required_skills": task.required_skills,
                "dependencies": [str(d) for d in task.dependencies]
            }
            for task in tasks
        ]

        # Get suggestions
        suggestions = await allocator_service.allocate_tasks(
            task_dicts,
            request.team_capacity
        )

        return suggestions

    except AllocationException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{task_id}/accept", response_model=AllocationResponse)
async def accept_allocation(
    task_id: UUID,
    user_id: UUID,
    reason: str,
    confidence_score: float,
    db: Session = Depends(get_db)
):
    """Accept allocation suggestion."""
    # Create allocation record
    allocation = Allocation(
        task_id=task_id,
        user_id=user_id,
        reason=reason,
        confidence_score=confidence_score,
        accepted_at=datetime.utcnow()
    )

    # Update task assignment
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        task.assigned_to = user_id

    db.add(allocation)
    db.commit()
    db.refresh(allocation)

    return allocation


@router.post("/{task_id}/reject")
async def reject_allocation(
    task_id: UUID,
    user_id: UUID,
    reason: str,
    db: Session = Depends(get_db)
):
    """Reject allocation suggestion."""
    allocation = Allocation(
        task_id=task_id,
        user_id=user_id,
        reason=reason,
        confidence_score=0,
        rejected_at=datetime.utcnow()
    )

    db.add(allocation)
    db.commit()

    return {"status": "rejected"}


@router.get("/", response_model=List[AllocationResponse])
async def list_allocations(
    task_id: UUID = None,
    user_id: UUID = None,
    db: Session = Depends(get_db)
):
    """List allocations."""
    query = db.query(Allocation)

    if task_id:
        query = query.filter(Allocation.task_id == task_id)
    if user_id:
        query = query.filter(Allocation.user_id == user_id)

    return query.order_by(Allocation.created_at.desc()).all()
