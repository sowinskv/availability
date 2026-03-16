"""
Task decomposition service using Claude API.
"""
import anthropic
from typing import List, Dict, Any
from ..exceptions import MalformedResponseError, TokenLimitError, LLMTimeoutError


class TaskDecomposerService:
    """Service for decomposing requirements into tasks."""

    def __init__(self, api_key: str, prompt_template: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.prompt_template = prompt_template
        self.model = "claude-sonnet-4-6"

    async def decompose_requirements(self, requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Decompose requirements into granular tasks.

        Args:
            requirements: Structured requirements dictionary

        Returns:
            List of task dictionaries with title, description, estimated_hours, etc.

        Raises:
            MalformedResponseError: If LLM response is unparseable
            TokenLimitError: If input exceeds token limit
            LLMTimeoutError: If request times out
        """
        try:
            import json
            requirements_json = json.dumps(requirements, indent=2)
            prompt = self.prompt_template.format(requirements=requirements_json)

            message = self.client.messages.create(
                model=self.model,
                max_tokens=8192,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                timeout=90.0
            )

            response_text = message.content[0].text

            # Parse response - expecting JSON array
            try:
                tasks = json.loads(response_text)
            except json.JSONDecodeError:
                # Try to extract JSON from markdown code block
                if "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    json_text = response_text[json_start:json_end].strip()
                    tasks = json.loads(json_text)
                else:
                    raise MalformedResponseError("Could not parse tasks response as JSON")

            # Validate tasks
            if not isinstance(tasks, list):
                raise MalformedResponseError("Tasks response must be an array")

            required_fields = ["title", "description", "estimated_hours"]
            for task in tasks:
                for field in required_fields:
                    if field not in task:
                        raise MalformedResponseError(f"Task missing required field: {field}")

            return tasks

        except anthropic.APITimeoutError as e:
            raise LLMTimeoutError(f"Task decomposition timed out: {str(e)}")
        except anthropic.BadRequestError as e:
            if "maximum context length" in str(e).lower():
                raise TokenLimitError(f"Input exceeds token limit: {str(e)}")
            raise MalformedResponseError(f"Invalid request: {str(e)}")
        except Exception as e:
            raise MalformedResponseError(f"Task decomposition failed: {str(e)}")
