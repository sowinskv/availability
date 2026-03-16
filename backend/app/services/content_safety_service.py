"""
Content safety service using Azure Content Safety API.
"""
import httpx
from typing import Dict, List, Any
from ..exceptions import ContentPolicyError


class ContentSafetyService:
    """Service for checking content safety."""

    def __init__(self, api_key: str, endpoint: str):
        self.api_key = api_key
        self.endpoint = endpoint

    async def check_content(self, text: str) -> Dict[str, Any]:
        """
        Check if content is safe.

        Args:
            text: Text to check

        Returns:
            Dictionary with safety scores

        Raises:
            ContentPolicyError: If content violates policy
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {
                    "Ocp-Apim-Subscription-Key": self.api_key,
                    "Content-Type": "application/json"
                }
                data = {
                    "text": text,
                    "categories": ["Hate", "SelfHarm", "Sexual", "Violence"]
                }

                response = await client.post(
                    f"{self.endpoint}/contentsafety/text:analyze?api-version=2023-10-01",
                    json=data,
                    headers=headers
                )
                response.raise_for_status()

                result = response.json()

                # Check if any category exceeds threshold
                categories = result.get("categoriesAnalysis", [])
                violations = [
                    cat for cat in categories
                    if cat.get("severity", 0) >= 4  # Severity 4-6 is high
                ]

                if violations:
                    violation_types = ", ".join([v["category"] for v in violations])
                    raise ContentPolicyError(
                        f"Content violates safety policy: {violation_types}",
                        details={"violations": violations}
                    )

                return result

        except httpx.HTTPStatusError as e:
            # Don't raise ContentPolicyError for API errors
            raise Exception(f"Content safety API error: {e.response.status_code}")
        except ContentPolicyError:
            raise
        except Exception as e:
            # Log error but don't block - fail open for availability
            print(f"Content safety check failed: {str(e)}")
            return {"status": "error", "message": str(e)}
