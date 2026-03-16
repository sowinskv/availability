"""
Unit tests for voice transcription service.
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock
from backend.app.services.voice_transcription_service import VoiceTranscriptionService
from backend.app.exceptions import LLMException, LLMTimeoutError


@pytest.fixture
def transcription_service():
    return VoiceTranscriptionService(api_key="test_key")


@pytest.mark.asyncio
async def test_transcribe_success(transcription_service):
    """Test successful transcription."""
    with patch('httpx.AsyncClient') as mock_client:
        # Mock response
        mock_response = Mock()
        mock_response.json.return_value = {
            "text": "I'll be on vacation from April 1st to April 5th",
            "segments": [
                {"no_speech_prob": 0.05}
            ]
        }
        mock_response.raise_for_status = Mock()

        mock_client.return_value.__aenter__.return_value.post = AsyncMock(
            return_value=mock_response
        )

        text, confidence = await transcription_service.transcribe("test.wav")

        assert text == "I'll be on vacation from April 1st to April 5th"
        assert confidence > 0.9


@pytest.mark.asyncio
async def test_transcribe_timeout(transcription_service):
    """Test transcription timeout."""
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(
            side_effect=Exception("Timeout")
        )

        with pytest.raises(LLMException):
            await transcription_service.transcribe("test.wav")


@pytest.mark.asyncio
async def test_transcribe_invalid_file(transcription_service):
    """Test transcription with invalid file."""
    with pytest.raises(LLMException):
        await transcription_service.transcribe("nonexistent.wav")
