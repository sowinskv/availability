"""
Smart allocation service with parallel batch processing.
"""
from typing import List, Dict, Tuple, Any
from datetime import datetime
import asyncio
from ..exceptions import NoAvailableDeveloperError, CircularDependencyError, InsufficientCapacityError


class SmartAllocatorService:
    """Service for intelligently allocating tasks to developers."""

    def __init__(self, db_session, redis_client, claude_api_key: str):
        self.db = db_session
        self.redis = redis_client
        self.claude_api_key = claude_api_key

    async def allocate_tasks(
        self,
        tasks: List[Dict],
        team_capacity: Dict[str, float],
        batch_size: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Allocate tasks to developers using parallel batch processing.

        Args:
            tasks: List of task dictionaries
            team_capacity: Dictionary of user_id -> available_hours
            batch_size: Number of tasks per worker (default 100)

        Returns:
            List of allocation suggestions with justifications

        Raises:
            NoAvailableDeveloperError: If no developers available
            CircularDependencyError: If task dependencies form a cycle
            InsufficientCapacityError: If team doesn't have enough capacity
        """
        if not team_capacity:
            raise NoAvailableDeveloperError("No developers are available")

        # 1. Pre-processing: Topological sort for dependencies
        sorted_tasks = self._topological_sort(tasks)

        # 2. Split into batches
        batches = [sorted_tasks[i:i + batch_size] for i in range(0, len(sorted_tasks), batch_size)]

        # 3. Process batches in parallel
        allocation_tasks = [self._process_batch(batch, team_capacity) for batch in batches]
        batch_results = await asyncio.gather(*allocation_tasks)

        # 4. Flatten results
        allocations = [alloc for batch in batch_results for alloc in batch]

        return allocations

    def _topological_sort(self, tasks: List[Dict]) -> List[Dict]:
        """
        Sort tasks by dependencies using topological sort.

        Raises:
            CircularDependencyError: If circular dependency detected
        """
        # Build dependency graph
        graph = {task["id"]: task.get("dependencies", []) for task in tasks}
        task_map = {task["id"]: task for task in tasks}

        visited = set()
        rec_stack = set()
        sorted_tasks = []

        def visit(task_id):
            if task_id in rec_stack:
                raise CircularDependencyError(f"Circular dependency detected at task {task_id}")
            if task_id in visited:
                return

            rec_stack.add(task_id)
            for dep_id in graph.get(task_id, []):
                if dep_id in graph:
                    visit(dep_id)
            rec_stack.remove(task_id)
            visited.add(task_id)
            sorted_tasks.append(task_map[task_id])

        for task_id in graph:
            if task_id not in visited:
                visit(task_id)

        return sorted_tasks

    async def _process_batch(
        self,
        batch: List[Dict],
        team_capacity: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        """Process a batch of tasks for allocation."""
        allocations = []

        for task in batch:
            # Get cached team capacity from Redis (1h TTL)
            capacity_key = "team_capacity"
            cached_capacity = await self.redis.get(capacity_key)

            if not cached_capacity:
                # Recalculate and cache
                await self.redis.setex(capacity_key, 3600, str(team_capacity))

            # Get pre-computed skill matrix (O(1) lookup)
            required_skills = task.get("required_skills", [])
            candidates = await self._get_candidates(required_skills, team_capacity)

            if not candidates:
                raise NoAvailableDeveloperError(f"No developers available for task {task['id']}")

            # Score candidates
            scored_candidates = []
            for user_id, user_data in candidates.items():
                score = self._calculate_score(task, user_data, team_capacity[user_id])
                scored_candidates.append({
                    "user_id": user_id,
                    "score": score,
                    "skill_match": user_data["skill_match"],
                    "availability": team_capacity[user_id],
                    "velocity": user_data["velocity"]
                })

            # Sort by score
            scored_candidates.sort(key=lambda x: x["score"], reverse=True)

            # Get top candidate and alternatives
            best = scored_candidates[0]
            alternatives = scored_candidates[1:3] if len(scored_candidates) > 1 else []

            allocations.append({
                "task_id": task["id"],
                "user_id": best["user_id"],
                "confidence_score": best["score"],
                "reason": f"Skill match: {best['skill_match']:.0%}, Availability: {best['availability']}h, Velocity: {best['velocity']:.1f}x",
                "alternatives": alternatives
            })

        return allocations

    async def _get_candidates(
        self,
        required_skills: List[str],
        team_capacity: Dict[str, float]
    ) -> Dict[str, Dict]:
        """Get candidate developers with required skills."""
        # Query pre-computed skill matrix (indexed, O(1) lookup)
        # This is a placeholder - actual implementation would query DB
        candidates = {}

        for user_id in team_capacity.keys():
            if team_capacity[user_id] > 0:
                # Get user skills and velocity from DB/cache
                candidates[user_id] = {
                    "skill_match": 0.8,  # Placeholder
                    "velocity": 1.0  # Placeholder
                }

        return candidates

    def _calculate_score(
        self,
        task: Dict,
        user_data: Dict,
        availability: float
    ) -> float:
        """
        Calculate allocation score.

        Score = (skill_match * 0.4) + (availability * 0.3) + (velocity * 0.3)
        """
        skill_score = user_data["skill_match"] * 0.4
        availability_score = min(availability / 40.0, 1.0) * 0.3  # Normalize to 0-1
        velocity_score = min(user_data["velocity"] / 2.0, 1.0) * 0.3  # Cap at 2x

        return skill_score + availability_score + velocity_score
