"""
Requirements API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ..models import Requirement, RequirementStatus, RequirementSource
from ..services.requirements_generator_service import RequirementsGeneratorService
from ..exceptions import MalformedResponseError, TokenLimitError
from ..database import get_db
from ..dependencies import get_requirements_generator

router = APIRouter(prefix="/requirements", tags=["requirements"])


from pydantic import BaseModel


class RequirementCreate(BaseModel):
    title: str
    description: str | None = None
    source: str = "manual"


class RequirementVoiceCreate(BaseModel):
    input_text: str


class RequirementResponse(BaseModel):
    id: str
    title: str
    description: str | None
    author_id: str
    status: str
    source: str
    functional_reqs: dict
    non_functional_reqs: dict
    technical_reqs: dict

    class Config:
        from_attributes = True


@router.post("/", response_model=RequirementResponse)
async def create_requirement(
    requirement: RequirementCreate,
    author_id: UUID,
    db: Session = Depends(get_db)
):
    """Create new requirement manually."""
    new_req = Requirement(
        title=requirement.title,
        description=requirement.description,
        author_id=author_id,
        source=RequirementSource(requirement.source),
        status=RequirementStatus.DRAFT
    )

    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    return new_req


@router.post("/generate", response_model=RequirementResponse)
async def generate_requirement(
    input_data: RequirementVoiceCreate,
    author_id: UUID,
    db: Session = Depends(get_db),
    generator_service: RequirementsGeneratorService = Depends(get_requirements_generator)
):
    """Generate requirements from natural language input."""
    try:
        # Generate requirements using LLM
        generated = await generator_service.generate_requirements(input_data.input_text)

        # Create requirement record
        new_req = Requirement(
            title=input_data.input_text[:200],  # First 200 chars as title
            description=input_data.input_text,
            author_id=author_id,
            source=RequirementSource.VOICE,
            status=RequirementStatus.DRAFT,
            functional_reqs=generated["functional_reqs"],
            non_functional_reqs=generated["non_functional_reqs"],
            technical_reqs=generated["technical_reqs"],
            transcript=input_data.input_text
        )

        db.add(new_req)
        db.commit()
        db.refresh(new_req)

        return new_req

    except (MalformedResponseError, TokenLimitError) as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[RequirementResponse])
async def list_requirements(
    status: str = None,
    author_id: UUID = None,
    db: Session = Depends(get_db)
):
    """List requirements."""
    query = db.query(Requirement)

    if status:
        query = query.filter(Requirement.status == RequirementStatus(status))
    if author_id:
        query = query.filter(Requirement.author_id == author_id)

    return query.order_by(Requirement.created_at.desc()).all()


@router.get("/{requirement_id}", response_model=RequirementResponse)
async def get_requirement(
    requirement_id: UUID,
    db: Session = Depends(get_db)
):
    """Get requirement by ID."""
    req = db.query(Requirement).filter(Requirement.id == requirement_id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    return req


@router.patch("/{requirement_id}/approve")
async def approve_requirement(
    requirement_id: UUID,
    db: Session = Depends(get_db)
):
    """Approve requirement."""
    req = db.query(Requirement).filter(Requirement.id == requirement_id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    req.status = RequirementStatus.APPROVED
    db.commit()

    return {"status": "approved"}
