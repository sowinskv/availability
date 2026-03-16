# Our process tool

ai-powered project planning engine. transforms spoken ideas into structured requirements, tasks, and smart team allocations.

voice input → requirements → task breakdown → intelligent assignment.

---

## 00 — contents

```
00    contents
01    architecture
02    structure
03    features
04    usage
05    configuration
06    deployment
```

---

## 01 — architecture

3 phases:

**01.1 — team intelligence**
availability tracking via voice or manual input. skill matrix with proficiency levels.
velocity tracking from historical task completion. real-time capacity calculation.

**01.2 — requirements generation**
Claude Sonnet 4.6 transforms natural language into structured requirements.
functional, non-functional, and technical requirements auto-generated.
version-controlled prompts with evaluation framework.

**01.3 — smart allocation**
parallel batch processing (100 tasks/worker). topological sort for dependencies.
allocation score = (skill_match × 0.4) + (availability × 0.3) + (velocity × 0.3).
optimistic locking prevents race conditions. Redis caching (1h TTL).

**01.4 — architecture patterns**
event-driven for decoupling. CQRS for read/write separation.
plugin system for integrations (Google Calendar, Outlook, Notion, Azure DevOps).

---

## 02 — structure

```
backend/
    app/
        api/            REST endpoints (availability, requirements, tasks, allocations)
        models/         SQLAlchemy models (10 tables with relationships)
        services/       business logic (voice, LLM, allocator, security)
        prompts/        version-controlled LLM prompts
        exceptions/     custom exception hierarchy

frontend/
    src/
        pages/          React pages (availability, requirements, tasks)
        components/     UI components (voice recorder, forms)
        hooks/          React Query hooks for API

db/
    migrations/         9 SQL migrations with indexes

docker/                 Dockerfile, compose files, env templates
tests/                  unit, integration, security tests
```

---

## 03 — features

**03.1 — availability tracking**
voice transcription via OpenAI Whisper.
calendar sync (Google, Outlook) with OAuth.
approval workflow for managers.
conflict detection across team.

**03.2 — requirements generation**
speak or type feature description.
Claude generates structured requirements document.
includes acceptance criteria, priorities, dependencies.
iterative refinement with follow-up questions.

**03.3 — task decomposition**
requirements → granular tasks (1-5 days each).
effort estimates with complexity scoring.
skill requirements and dependencies extracted.
acceptance criteria per task.

**03.4 — smart allocation**
topological sort handles task dependencies.
skill matching against team matrix.
availability and velocity considered.
shows alternatives with confidence scores.
learning loop improves estimates over time.

---

## 04 — usage

```
make dev                start everything (frontend + backend + db + worker)
make start              start backend only (PostgreSQL, Redis, API)
make stop               stop all services
make logs               view backend logs
make logs-dev           view all service logs
make db-migrate         run database migrations
make test               run test suite
make docker-test        automated setup test
```

access:
- frontend: http://localhost:3000
- API: http://localhost:8000
- API docs: http://localhost:8000/docs

---

## 05 — configuration

everything in `docker/.env`:

```
ANTHROPIC_API_KEY       Claude API key for requirements/tasks
OPENAI_API_KEY          Whisper API key for voice transcription
DATABASE_URL            PostgreSQL connection
REDIS_URL               Redis for caching and jobs
```

optional:
```
GOOGLE_CLIENT_ID        Google Calendar OAuth
MICROSOFT_CLIENT_ID     Outlook Calendar OAuth
AZURE_CONTENT_SAFETY    content moderation
```

feature flags:
```
REQUIREMENTS_GENERATION_ENABLED=true
SMART_ALLOCATION_ENABLED=true
```

---

## 06 — deployment

production stack:
- Azure (eu-central-1 region)
- PostgreSQL 15
- Redis 7
- Docker containers
- GitHub Actions for CI/CD

build:
```
docker build -t atlas-api -f docker/Dockerfile .
```

push:
```
docker push registry/atlas-api:latest
```

database migrations run automatically on startup.
feature flags allow instant rollback.

---

## 07 — security

**07.1 — secret scanning**
regex patterns detect API keys, passwords, private keys in all text input.
blocks commits containing secrets (GitHub push protection).

**07.2 — content safety**
Azure Content Safety API checks all user input.
categories: hate, self-harm, sexual, violence.
severity threshold: 4/6 (high).

**07.3 — authentication**
MSAL (Microsoft Authentication Library) for Accenture accounts.
OAuth 2.0 for calendar integrations.
role-based access: dev, manager, BA, client.

**07.4 — data protection**
SQL injection prevention via parameterized queries.
optimistic locking on task assignment.
input validation at API boundaries.

---

## 08 — tech stack

backend:
- Python 3.11, FastAPI, SQLAlchemy, PostgreSQL, Redis, Celery

frontend:
- React 18, TypeScript, Vite, TailwindCSS, React Query

AI/ML:
- Claude Sonnet 4.6 (requirements, tasks, justifications)
- OpenAI Whisper (voice transcription)
- scikit-learn (velocity prediction)

infrastructure:
- Docker, Azure, GitHub Actions, Datadog

---
