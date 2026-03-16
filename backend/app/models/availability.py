"""
Availability model for Atlas.
"""
from sqlalchemy import Column, String, Float, Enum, ForeignKey, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from .base import Base, TimestampMixin


class AvailabilityStatus(enum.Enum):
    """Availability status enumeration."""
    PENDING = "pending"
    APPROVED = "approved"
    DECLINED = "declined"


class AvailabilityType(enum.Enum):
    """Availability type enumeration."""
    VACATION = "vacation"
    SICK = "sick"
    PARTIAL = "partial"
    AVAILABLE = "available"


class Availability(Base, TimestampMixin):
    """Availability model for tracking user availability."""
    __tablename__ = "availabilities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False, index=True)
    hours_per_day = Column(Float, nullable=False, default=8.0)

    status = Column(Enum(AvailabilityStatus), nullable=False, default=AvailabilityStatus.PENDING, index=True)
    type = Column(Enum(AvailabilityType), nullable=False, default=AvailabilityType.AVAILABLE)

    # Voice transcription fields
    voice_recording_url = Column(String(500))
    transcription_text = Column(Text)
    transcription_confidence = Column(Float)

    # Relationships
    user = relationship("User", back_populates="availabilities")

    def __repr__(self):
        return f"<Availability user={self.user_id} {self.start_date} to {self.end_date} ({self.type.value})>"
