"""
Voice transcription service using OpenAI Whisper API.
"""
import httpx
from typing import Tuple
from ..exceptions import LLMException, LLMTimeoutError


class VoiceTranscriptionService:
    """Service for transcribing voice recordings to text."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openai.com/v1/audio/transcriptions"

    async def transcribe(self, audio_file_path: str) -> Tuple[str, float]:
        """
        Transcribe audio file to text.

        Args:
            audio_file_path: Path to audio file

        Returns:
            Tuple of (transcription_text, confidence_score)

        Raises:
            LLMException: If transcription fails
            LLMTimeoutError: If request times out
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                with open(audio_file_path, "rb") as audio_file:
                    files = {"file": audio_file}
                    data = {
                        "model": "whisper-1",
                        "response_format": "verbose_json"
                    }
                    headers = {"Authorization": f"Bearer {self.api_key}"}

                    response = await client.post(
                        self.base_url,
                        files=files,
                        data=data,
                        headers=headers
                    )
                    response.raise_for_status()

                    result = response.json()
                    text = result.get("text", "")

                    # Calculate confidence from segments if available
                    segments = result.get("segments", [])
                    if segments:
                        avg_confidence = sum(s.get("no_speech_prob", 0) for s in segments) / len(segments)
                        confidence = 1.0 - avg_confidence  # Convert no_speech_prob to confidence
                    else:
                        confidence = 0.95  # Default high confidence if no segments

                    return text, confidence

        except httpx.TimeoutException as e:
            raise LLMTimeoutError(f"Transcription request timed out: {str(e)}")
        except httpx.HTTPStatusError as e:
            raise LLMException(f"Transcription API error: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            raise LLMException(f"Transcription failed: {str(e)}")
