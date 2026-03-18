"""
Project API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from uuid import UUID
from pydantic import BaseModel

from ..database import get_db
from ..models.project import Project, ProjectType, ProjectStatus, ProjectPriority
from ..models.requirement import Requirement

router = APIRouter(prefix="/api/projects", tags=["projects"])


# Pydantic Schemas
class ProjectCreate(BaseModel):
    """Schema for creating a new project."""
    name: str
    project_type: str
    description: Optional[str] = None
    client: Optional[str] = None
    deadline: Optional[date] = None
    priority: str = "medium"


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""
    name: Optional[str] = None
    project_type: Optional[str] = None
    description: Optional[str] = None
    client: Optional[str] = None
    deadline: Optional[date] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    """Schema for project response."""
    id: UUID
    name: str
    project_type: Optional[str]
    description: Optional[str]
    client: Optional[str]
    deadline: Optional[date]
    status: str
    priority: str
    requirement_count: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# Routes
@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db)
):
    """Create a new project."""
    try:
        # Convert string enums to enum types (handle both uppercase and lowercase input)
        project_type_enum = ProjectType(project_data.project_type) if project_data.project_type else None
        priority_enum = ProjectPriority(project_data.priority.upper())

        project = Project(
            name=project_data.name,
            project_type=project_type_enum,
            description=project_data.description,
            client=project_data.client,
            deadline=project_data.deadline,
            priority=priority_enum,
            status=ProjectStatus.PLANNING
        )

        db.add(project)
        db.commit()
        db.refresh(project)

        # Get requirement count
        requirement_count = db.query(func.count(Requirement.id)).filter(
            Requirement.project_id == project.id
        ).scalar()

        return ProjectResponse(
            id=project.id,
            name=project.name,
            project_type=project.project_type.value if project.project_type else None,
            description=project.description,
            client=project.client,
            deadline=project.deadline,
            status=project.status.value,
            priority=project.priority.value,
            requirement_count=requirement_count,
            created_at=project.created_at.isoformat(),
            updated_at=project.updated_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid enum value: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    status_filter: Optional[str] = None,
    project_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all projects with optional filters."""
    query = db.query(Project)

    # Apply filters
    if status_filter:
        try:
            status_enum = ProjectStatus(status_filter)
            query = query.filter(Project.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status_filter}"
            )

    if project_type:
        try:
            type_enum = ProjectType(project_type)
            query = query.filter(Project.project_type == type_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid project type: {project_type}"
            )

    projects = query.order_by(Project.created_at.desc()).all()

    # Build response with requirement counts
    result = []
    for project in projects:
        requirement_count = db.query(func.count(Requirement.id)).filter(
            Requirement.project_id == project.id
        ).scalar()

        result.append(ProjectResponse(
            id=project.id,
            name=project.name,
            project_type=project.project_type.value if project.project_type else None,
            description=project.description,
            client=project.client,
            deadline=project.deadline,
            status=project.status.value,
            priority=project.priority.value,
            requirement_count=requirement_count,
            created_at=project.created_at.isoformat(),
            updated_at=project.updated_at.isoformat()
        ))

    return result


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a specific project by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    requirement_count = db.query(func.count(Requirement.id)).filter(
        Requirement.project_id == project.id
    ).scalar()

    return ProjectResponse(
        id=project.id,
        name=project.name,
        project_type=project.project_type.value if project.project_type else None,
        description=project.description,
        client=project.client,
        deadline=project.deadline,
        status=project.status.value,
        priority=project.priority.value,
        requirement_count=requirement_count,
        created_at=project.created_at.isoformat(),
        updated_at=project.updated_at.isoformat()
    )


@router.get("/{project_id}/requirements")
async def get_project_requirements(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all requirements for a specific project."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    requirements = db.query(Requirement).filter(
        Requirement.project_id == project_id
    ).order_by(Requirement.created_at.desc()).all()

    return requirements


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db)
):
    """Update a project."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    try:
        # Update fields
        if project_data.name is not None:
            project.name = project_data.name
        if project_data.project_type is not None:
            project.project_type = ProjectType(project_data.project_type)
        if project_data.description is not None:
            project.description = project_data.description
        if project_data.client is not None:
            project.client = project_data.client
        if project_data.deadline is not None:
            project.deadline = project_data.deadline
        if project_data.priority is not None:
            project.priority = ProjectPriority(project_data.priority.upper())
        if project_data.status is not None:
            project.status = ProjectStatus(project_data.status.upper())

        db.commit()
        db.refresh(project)

        requirement_count = db.query(func.count(Requirement.id)).filter(
            Requirement.project_id == project.id
        ).scalar()

        return ProjectResponse(
            id=project.id,
            name=project.name,
            project_type=project.project_type.value if project.project_type else None,
            description=project.description,
            client=project.client,
            deadline=project.deadline,
            status=project.status.value,
            priority=project.priority.value,
            requirement_count=requirement_count,
            created_at=project.created_at.isoformat(),
            updated_at=project.updated_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid enum value: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update project: {str(e)}"
        )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete a project (sets requirements.project_id to NULL)."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    try:
        # The ON DELETE SET NULL will automatically handle requirements
        db.delete(project)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete project: {str(e)}"
        )
