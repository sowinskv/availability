"""
Requirements API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Union
from uuid import UUID

from ..models import Requirement, RequirementStatus, RequirementSource
from ..services.requirements_generator_service import RequirementsGeneratorService
from ..exceptions import MalformedResponseError, TokenLimitError
from ..database import get_db
from ..dependencies import get_requirements_generator

router = APIRouter(prefix="/requirements", tags=["requirements"])


from pydantic import BaseModel, model_validator


class RequirementCreate(BaseModel):
    title: str
    description: str | None = None
    source: str = "manual"


class RequirementVoiceCreate(BaseModel):
    input_text: str


class RequirementResponse(BaseModel):
    id: Union[str, UUID]
    title: str
    description: str | None
    author_id: Union[str, UUID]
    status: str
    source: str
    functional_reqs: list
    non_functional_reqs: list
    technical_reqs: list

    @model_validator(mode='before')
    @classmethod
    def convert_uuids(cls, data):
        if isinstance(data, dict):
            if 'id' in data and isinstance(data['id'], UUID):
                data['id'] = str(data['id'])
            if 'author_id' in data and isinstance(data['author_id'], UUID):
                data['author_id'] = str(data['author_id'])
        else:
            # For ORM objects
            if hasattr(data, 'id') and isinstance(data.id, UUID):
                data.id = str(data.id)
            if hasattr(data, 'author_id') and isinstance(data.author_id, UUID):
                data.author_id = str(data.author_id)
        return data

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
    author_id: UUID = None,
    db: Session = Depends(get_db),
    generator_service: RequirementsGeneratorService = Depends(get_requirements_generator)
):
    """Generate requirements from natural language input."""
    # Use default test user if no author_id provided
    if author_id is None:
        from uuid import uuid4
        author_id = UUID("00000000-0000-0000-0000-000000000001")

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


@router.delete("/{requirement_id}")
async def delete_requirement(
    requirement_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete requirement."""
    req = db.query(Requirement).filter(Requirement.id == requirement_id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    db.delete(req)
    db.commit()

    return {"status": "deleted", "id": str(requirement_id)}
