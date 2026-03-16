"""
Tasks API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ..models import Task, TaskStatus, TaskPriority
from ..services.task_decomposer_service import TaskDecomposerService
from ..exceptions import MalformedResponseError
from ..database import get_db
from ..dependencies import get_task_decomposer

router = APIRouter(prefix="/tasks", tags=["tasks"])


from pydantic import BaseModel


class TaskCreate(BaseModel):
    requirement_id: UUID
    title: str
    description: str | None = None
    estimated_hours: float | None = None
    priority: str = "p2"


class TaskUpdate(BaseModel):
    status: str | None = None
    actual_hours: float | None = None
    assigned_to: UUID | None = None


class TaskResponse(BaseModel):
    id: str
    requirement_id: str
    title: str
    description: str | None
    acceptance_criteria: str | None
    estimated_hours: float | None
    actual_hours: float | None
    status: str
    priority: str
    assigned_to: str | None
    dependencies: List[str]
    required_skills: List[str]

    class Config:
        from_attributes = True


@router.post("/", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db)
):
    """Create new task."""
    new_task = Task(
        requirement_id=task.requirement_id,
        title=task.title,
        description=task.description,
        estimated_hours=task.estimated_hours,
        priority=TaskPriority(task.priority),
        status=TaskStatus.BACKLOG
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@router.post("/decompose/{requirement_id}", response_model=List[TaskResponse])
async def decompose_requirement(
    requirement_id: UUID,
    db: Session = Depends(get_db),
    decomposer_service: TaskDecomposerService = Depends(get_task_decomposer)
):
    """Decompose requirement into tasks."""
    from ..models import Requirement

    req = db.query(Requirement).filter(Requirement.id == requirement_id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    try:
        # Build requirements dict from stored data
        requirements = {
            "functional_reqs": req.functional_reqs,
            "non_functional_reqs": req.non_functional_reqs,
            "technical_reqs": req.technical_reqs
        }

        # Decompose using LLM
        generated_tasks = await decomposer_service.decompose_requirements(requirements)

        # Create task records
        created_tasks = []
        for task_data in generated_tasks:
            new_task = Task(
                requirement_id=requirement_id,
                title=task_data["title"],
                description=task_data["description"],
                acceptance_criteria=task_data.get("acceptance_criteria"),
                estimated_hours=task_data["estimated_hours"],
                priority=TaskPriority(task_data.get("priority", "p2")),
                status=TaskStatus.BACKLOG,
                required_skills=task_data.get("required_skills", []),
                dependencies=task_data.get("dependencies", [])
            )

            db.add(new_task)
            created_tasks.append(new_task)

        db.commit()

        for task in created_tasks:
            db.refresh(task)

        return created_tasks

    except MalformedResponseError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    requirement_id: UUID = None,
    status: str = None,
    assigned_to: UUID = None,
    db: Session = Depends(get_db)
):
    """List tasks."""
    query = db.query(Task)

    if requirement_id:
        query = query.filter(Task.requirement_id == requirement_id)
    if status:
        query = query.filter(Task.status == TaskStatus(status))
    if assigned_to:
        query = query.filter(Task.assigned_to == assigned_to)

    return query.order_by(Task.priority, Task.created_at).all()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    db: Session = Depends(get_db)
):
    """Get task by ID."""
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    update: TaskUpdate,
    db: Session = Depends(get_db)
):
    """Update task."""
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if update.status:
        task.status = TaskStatus(update.status)
    if update.actual_hours is not None:
        task.actual_hours = update.actual_hours
    if update.assigned_to is not None:
        task.assigned_to = update.assigned_to

    # Increment version for optimistic locking
    task.version += 1

    db.commit()
    db.refresh(task)

    return task
