"""
Requirements generation service using Claude API.
"""
import anthropic
from typing import Dict, Any
from ..exceptions import MalformedResponseError, TokenLimitError, LLMTimeoutError


class RequirementsGeneratorService:
    """Service for generating requirements from natural language."""

    def __init__(self, api_key: str, prompt_template: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.prompt_template = prompt_template
        self.model = "claude-sonnet-4-6"

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

            message = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                timeout=60.0
            )

            response_text = message.content[0].text

            # Parse response - expecting JSON format
            import json
            try:
                requirements = json.loads(response_text)
            except json.JSONDecodeError:
                # Try to extract JSON from markdown code block
                if "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    json_text = response_text[json_start:json_end].strip()
                    requirements = json.loads(json_text)
                else:
                    raise MalformedResponseError("Could not parse requirements response as JSON")

            # Validate required keys
            required_keys = ["functional_reqs", "non_functional_reqs", "technical_reqs"]
            for key in required_keys:
                if key not in requirements:
                    raise MalformedResponseError(f"Missing required key: {key}")

            return requirements

        except anthropic.APITimeoutError as e:
            raise LLMTimeoutError(f"Requirements generation timed out: {str(e)}")
        except anthropic.BadRequestError as e:
            if "maximum context length" in str(e).lower():
                raise TokenLimitError(f"Input exceeds token limit: {str(e)}")
            raise MalformedResponseError(f"Invalid request: {str(e)}")
        except Exception as e:
            raise MalformedResponseError(f"Requirements generation failed: {str(e)}")
