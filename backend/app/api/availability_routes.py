"""
Availability API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import date

from ..models import Availability, AvailabilityStatus, AvailabilityType
from ..services.voice_transcription_service import VoiceTranscriptionService
from ..exceptions import LLMException
from ..database import get_db
from ..dependencies import get_transcription_service

router = APIRouter(prefix="/availability", tags=["availability"])


# Pydantic models for request/response
from pydantic import BaseModel


class AvailabilityCreate(BaseModel):
    start_date: date
    end_date: date
    hours_per_day: float = 8.0
    type: str = "available"


class AvailabilityResponse(BaseModel):
    id: UUID
    user_id: UUID
    start_date: date
    end_date: date
    hours_per_day: float
    status: str
    type: str
    transcription_text: str | None = None
    transcription_confidence: float | None = None

    class Config:
        from_attributes = True


@router.post("/", response_model=AvailabilityResponse)
async def create_availability(
    availability: AvailabilityCreate,
    user_id: UUID,
    db: Session = Depends(get_db)
):
    """Create new availability entry."""
    new_availability = Availability(
        user_id=user_id,
        start_date=availability.start_date,
        end_date=availability.end_date,
        hours_per_day=availability.hours_per_day,
        type=AvailabilityType(availability.type),
        status=AvailabilityStatus.PENDING
    )

    db.add(new_availability)
    db.commit()
    db.refresh(new_availability)

    return new_availability


@router.post("/voice", response_model=AvailabilityResponse)
async def create_availability_from_voice(
    audio_file: UploadFile = File(...),
    user_id: UUID = Form(...),
    db: Session = Depends(get_db),
    transcription_service: VoiceTranscriptionService = Depends(get_transcription_service)
):
    """Create availability entry from voice recording."""
    try:
        # Save audio file temporarily
        import tempfile
        import os

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_path = temp_file.name

        try:
            # Transcribe
            text, confidence = await transcription_service.transcribe(temp_path)

            # Parse transcription to extract dates (simplified)
            # In production, use NLP or structured prompts
            import re
            dates = re.findall(r'\d{4}-\d{2}-\d{2}', text)

            if len(dates) < 2:
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract start and end dates from transcription"
                )

            start_date = date.fromisoformat(dates[0])
            end_date = date.fromisoformat(dates[1])

            # Determine type from keywords
            availability_type = AvailabilityType.AVAILABLE
            if "vacation" in text.lower() or "holiday" in text.lower():
                availability_type = AvailabilityType.VACATION
            elif "sick" in text.lower():
                availability_type = AvailabilityType.SICK

            new_availability = Availability(
                user_id=user_id,
                start_date=start_date,
                end_date=end_date,
                hours_per_day=0 if availability_type in [AvailabilityType.VACATION, AvailabilityType.SICK] else 8.0,
                type=availability_type,
                status=AvailabilityStatus.PENDING,
                voice_recording_url=f"s3://recordings/{audio_file.filename}",  # Placeholder
                transcription_text=text,
                transcription_confidence=confidence
            )

            db.add(new_availability)
            db.commit()
            db.refresh(new_availability)

            return new_availability

        finally:
            os.unlink(temp_path)

    except LLMException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[AvailabilityResponse])
async def list_availability(
    user_id: UUID = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    """List availability entries."""
    query = db.query(Availability)

    if user_id:
        query = query.filter(Availability.user_id == user_id)
    if status:
        query = query.filter(Availability.status == AvailabilityStatus(status))

    return query.order_by(Availability.start_date).all()


@router.patch("/{availability_id}/approve")
async def approve_availability(
    availability_id: UUID,
    db: Session = Depends(get_db)
):
    """Approve availability request."""
    availability = db.query(Availability).filter(Availability.id == availability_id).first()

    if not availability:
        raise HTTPException(status_code=404, detail="Availability not found")

    availability.status = AvailabilityStatus.APPROVED
    db.commit()

    return {"status": "approved"}


@router.patch("/{availability_id}/decline")
async def decline_availability(
    availability_id: UUID,
    db: Session = Depends(get_db)
):
    """Decline availability request."""
    availability = db.query(Availability).filter(Availability.id == availability_id).first()

    if not availability:
        raise HTTPException(status_code=404, detail="Availability not found")

    availability.status = AvailabilityStatus.DECLINED
    db.commit()

    return {"status": "declined"}
