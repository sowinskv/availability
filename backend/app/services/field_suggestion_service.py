"""
Field Suggestion Service - Generate LLM suggestions for specific requirement fields.
"""
import os
import json
from typing import List, Dict, Any, Optional
import google.generativeai as genai


class FieldSuggestionService:
    """Service for generating field-level suggestions using Gemini."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize the field suggestion service."""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    async def suggest_acceptance_criteria(
        self,
        title: str,
        description: str
    ) -> List[str]:
        """
        Suggest acceptance criteria for a functional requirement.

        Args:
            title: The FR title
            description: The FR description

        Returns:
            List of acceptance criteria strings
        """
        prompt = f"""Given this functional requirement:

Title: {title}
Description: {description}

Generate 3-5 specific, testable acceptance criteria. Each criterion should:
- Be clear and unambiguous
- Be testable/verifiable
- Focus on user-facing behavior
- Use active voice

Return ONLY a JSON array of strings. Example format:
["User can successfully log in with valid credentials", "System displays error for invalid password"]

JSON array:"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()

            # Extract JSON from response
            if text.startswith("```json"):
                text = text.split("```json")[1].split("```")[0].strip()
            elif text.startswith("```"):
                text = text.split("```")[1].split("```")[0].strip()

            criteria = json.loads(text)
            return criteria if isinstance(criteria, list) else []

        except Exception as e:
            print(f"Error generating acceptance criteria: {e}")
            return []

    async def suggest_nfr_metric(
        self,
        category: str,
        description: str
    ) -> str:
        """
        Suggest a metric for a non-functional requirement.

        Args:
            category: NFR category (performance, security, scalability, etc.)
            description: The NFR description

        Returns:
            Suggested metric string
        """
        prompt = f"""Given this non-functional requirement:

Category: {category}
Description: {description}

Suggest a specific, measurable metric for this requirement. The metric should:
- Be quantifiable
- Include target values or thresholds
- Be realistic and achievable
- Be relevant to the category

Return ONLY the metric as a plain string, not JSON. Example:
"Response time < 200ms for 95th percentile of requests"

Metric:"""

        try:
            response = self.model.generate_content(prompt)
            metric = response.text.strip()

            # Remove quotes if present
            metric = metric.strip('"\'')

            return metric

        except Exception as e:
            print(f"Error generating NFR metric: {e}")
            return ""

    async def suggest_tr_dependencies(
        self,
        technology: str,
        description: str
    ) -> List[str]:
        """
        Suggest dependencies for a technical requirement.

        Args:
            technology: The technology/framework mentioned
            description: The TR description

        Returns:
            List of dependency strings
        """
        prompt = f"""Given this technical requirement:

Technology: {technology}
Description: {description}

Suggest 2-5 specific technical dependencies or libraries needed. Each dependency should:
- Be a real, commonly used library/tool
- Be relevant to the technology mentioned
- Include version constraints if applicable

Return ONLY a JSON array of strings. Example format:
["React ^18.0.0", "Axios ^1.0.0", "React Query ^4.0.0"]

JSON array:"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()

            # Extract JSON from response
            if text.startswith("```json"):
                text = text.split("```json")[1].split("```")[0].strip()
            elif text.startswith("```"):
                text = text.split("```")[1].split("```")[0].strip()

            dependencies = json.loads(text)
            return dependencies if isinstance(dependencies, list) else []

        except Exception as e:
            print(f"Error generating TR dependencies: {e}")
            return []

    async def suggest_field(
        self,
        field_type: str,
        context: Dict[str, Any]
    ) -> Any:
        """
        Generic method to suggest a field value based on type.

        Args:
            field_type: Type of field (fr_acceptance_criteria, nfr_metric, tr_dependencies)
            context: Context data needed for the suggestion

        Returns:
            Suggested value (type depends on field_type)
        """
        if field_type == "fr_acceptance_criteria":
            return await self.suggest_acceptance_criteria(
                context.get("title", ""),
                context.get("description", "")
            )
        elif field_type == "nfr_metric":
            return await self.suggest_nfr_metric(
                context.get("category", ""),
                context.get("description", "")
            )
        elif field_type == "tr_dependencies":
            return await self.suggest_tr_dependencies(
                context.get("technology", ""),
                context.get("description", "")
            )
        else:
            raise ValueError(f"Unknown field type: {field_type}")
