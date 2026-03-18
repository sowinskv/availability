"""
Requirements generation service using Gemini API.
"""
import google.generativeai as genai
import json
from typing import Dict, Any
from ..exceptions import MalformedResponseError, TokenLimitError, LLMTimeoutError


class RequirementsGeneratorService:
    """Service for generating requirements from natural language."""

    def __init__(self, api_key: str, prompt_template: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.prompt_template = prompt_template

    async def generate_requirements(self, input_text: str) -> Dict[str, Any]:
        """
        Generate structured requirements from natural language input.

        Args:
            input_text: Natural language description of feature

        Returns:
            Dictionary with functional_reqs, non_functional_reqs, technical_reqs

        Raises:
            MalformedResponseError: If LLM response is unparseable
            TokenLimitError: If input exceeds token limit
            LLMTimeoutError: If request times out
        """
        try:
            prompt = self.prompt_template.format(input_text=input_text)

            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=8192,
                    temperature=0.3,
                    response_mime_type="application/json",
                )
            )

            response_text = response.text

            # Parse response - check for code blocks first
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
                try:
                    requirements = json.loads(json_text)
                except json.JSONDecodeError as e:
                    raise MalformedResponseError(f"JSON parsing failed: {str(e)}. Response: {response_text[:500]}")
            elif "```" in response_text:
                # Try generic code block
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
                try:
                    requirements = json.loads(json_text)
                except json.JSONDecodeError as e:
                    raise MalformedResponseError(f"JSON parsing failed: {str(e)}. Response: {response_text[:500]}")
            else:
                # Try parsing as raw JSON
                try:
                    requirements = json.loads(response_text)
                except json.JSONDecodeError as e:
                    raise MalformedResponseError(f"Could not parse requirements response as JSON: {str(e)}. Response: {response_text[:500]}")

            # Validate required keys
            required_keys = ["functional_reqs", "non_functional_reqs", "technical_reqs"]
            for key in required_keys:
                if key not in requirements:
                    raise MalformedResponseError(f"Missing required key: {key}")

            return requirements

        except Exception as e:
            error_msg = str(e).lower()
            if "timeout" in error_msg or "deadline" in error_msg:
                raise LLMTimeoutError(f"Requirements generation timed out: {str(e)}")
            elif "quota" in error_msg or "limit" in error_msg:
                raise TokenLimitError(f"Input exceeds token limit: {str(e)}")
            else:
                raise MalformedResponseError(f"Requirements generation failed: {str(e)}")
