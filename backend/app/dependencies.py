"""
Dependency injection for FastAPI routes.
"""
from fastapi import Depends
from sqlalchemy.orm import Session
from redis import Redis
from .database import get_db
from .config import get_settings
from .services.voice_transcription_service import VoiceTranscriptionService
from .services.requirements_generator_service import RequirementsGeneratorService
from .services.task_decomposer_service import TaskDecomposerService
from .services.smart_allocator_service import SmartAllocatorService

settings = get_settings()


def get_redis() -> Redis:
    """Get Redis client."""
    return Redis.from_url(settings.REDIS_URL, decode_responses=True)


def get_transcription_service() -> VoiceTranscriptionService:
    """Get voice transcription service."""
    return VoiceTranscriptionService(api_key=settings.OPENAI_API_KEY)


def get_requirements_generator(db: Session = Depends(get_db)) -> RequirementsGeneratorService:
    """Get requirements generator service."""
    # Load active prompt from database
    from .models import Prompt
    import os

    prompt = db.query(Prompt).filter(
        Prompt.name == "requirements_generation",
        Prompt.is_active == True
    ).first()

    if not prompt:
        # Fallback to default prompt
        prompt_path = os.path.join(os.path.dirname(__file__), "prompts", "requirements_generation_v1.txt")
        try:
            with open(prompt_path, "r") as f:
                prompt_text = f.read()
        except FileNotFoundError:
            # Use inline default if file not found
            prompt_text = "Generate structured requirements from the following input:\n{input_text}"
    else:
        prompt_text = prompt.content

    return RequirementsGeneratorService(
        api_key=settings.GEMINI_API_KEY,
        prompt_template=prompt_text
    )


def get_task_decomposer(db: Session = Depends(get_db)) -> TaskDecomposerService:
    """Get task decomposer service."""
    from .models import Prompt
    import os

    prompt = db.query(Prompt).filter(
        Prompt.name == "task_decomposition",
        Prompt.is_active == True
    ).first()

    if not prompt:
        prompt_path = os.path.join(os.path.dirname(__file__), "prompts", "task_decomposition_v1.txt")
        try:
            with open(prompt_path, "r") as f:
                prompt_text = f.read()
        except FileNotFoundError:
            # Use inline default if file not found
            prompt_text = "Decompose the following requirements into tasks:\n{requirements}"
    else:
        prompt_text = prompt.content

    return TaskDecomposerService(
        api_key=settings.ANTHROPIC_API_KEY,
        prompt_template=prompt_text
    )


def get_smart_allocator(
    db: Session = Depends(get_db),
    redis: Redis = Depends(get_redis)
) -> SmartAllocatorService:
    """Get smart allocator service."""
    return SmartAllocatorService(
        db_session=db,
        redis_client=redis,
        claude_api_key=settings.ANTHROPIC_API_KEY
    )
