# Atlas Architecture

## Overview

Atlas is an AI-powered project planning engine built with event-driven architecture, CQRS pattern, and plugin system for integrations.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Avail.   │  │ Req.     │  │ Tasks    │  │ Alloc.   │   │
│  │ Page     │  │ Page     │  │ Page     │  │ Page     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/WebSocket
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (FastAPI)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes (REST)                       │   │
│  │  /availability  /requirements  /tasks  /allocations │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Services Layer                      │   │
│  │  • Voice Transcription    • Req Generation           │   │
│  │  • Task Decomposition     • Smart Allocator          │   │
│  │  • Calendar Integration   • Security Services        │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Models (SQLAlchemy)                 │   │
│  │  User, Availability, Skill, Requirement, Task, etc.  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
┌───────────────┐                    ┌─────────────────┐
│  PostgreSQL   │                    │  Redis Cache    │
│   Database    │                    │  + Job Queue    │
└───────────────┘                    └─────────────────┘
```

## Core Patterns

### 1. Event-Driven Architecture

Actions generate events that trigger workers:

```
User Action → Event → Message Queue → Worker → Event → ...
```

Example: Availability recorded → Transcription job → Parsing → Notification

### 2. CQRS (Command Query Responsibility Segregation)

- **Commands**: Write operations (create, update, delete)
- **Queries**: Read operations (list, get, search)
- Separate models for write (normalized) and read (denormalized views)

### 3. Plugin System

External integrations use a common interface:

```python
class Integration(ABC):
    @abstractmethod
    def connect(self, credentials): ...
    @abstractmethod
    def sync(self, data): ...
```

## Data Flow

### Phase 1: Availability Tracking

```
Voice Input → Whisper API → Transcription → Parse Dates → DB → Approval Workflow
```

### Phase 2: Requirements Generation

```
Natural Language → Claude API → Structured Requirements → DB → Task Decomposition
```

### Phase 3: Smart Allocation

```
Tasks + Team Data → Allocator Service → Score Candidates → Suggest Allocations → Accept/Reject
```

## Technology Stack

### Backend
- Python 3.11+
- FastAPI (async API framework)
- SQLAlchemy (ORM)
- PostgreSQL 15 (database)
- Redis (cache + queue)
- Celery (background jobs)

### Frontend
- React 18
- TypeScript
- TailwindCSS
- React Query (server state)
- Zustand (client state)

### AI/ML
- Claude Sonnet 4.6 (requirements, tasks, justifications)
- OpenAI Whisper (voice transcription)
- Scikit-learn (velocity prediction)

### Infrastructure
- Docker + Docker Compose
- Azure (hosting)
- GitHub Actions (CI/CD)

## Security

### Authentication
- MSAL (Microsoft Authentication Library)
- OAuth 2.0 for calendar access

### Data Protection
- Secrets scanning (regex patterns)
- Content safety (Azure Content Safety API)
- Input validation at API boundaries
- SQL injection prevention (parameterized queries)

### Authorization
- Role-based access control (dev, manager, BA, client)
- Resource ownership checks
- API key rotation

## Performance

### Optimization Strategies

1. **Caching**: Redis for team capacity (1h TTL)
2. **Batch Processing**: 100 tasks per worker (parallel)
3. **Indexing**: Database indexes on foreign keys and query fields
4. **Pre-computation**: Velocity models updated nightly
5. **Connection Pooling**: SQLAlchemy pool for DB connections

### Target Metrics

- API response time: <500ms p95
- Allocation time: <60s for 1000 tasks
- Voice transcription: <10s
- Requirements generation: <10s
- Task decomposition: <30s

## Observability

### Metrics
- Availability transcription success rate
- Requirements generation time
- Task decomposition accuracy
- Allocation acceptance rate
- Velocity prediction error

### Logs
- All LLM calls (prompt, response, latency)
- All voice transcriptions (file, transcript, confidence)
- All allocations (task, user, reason, result)

### Alerts
- LLM error rate >5% → PagerDuty
- Transcription service down → Slack
- Database connection pool exhausted → PagerDuty

## Deployment

### Environments
- **Development**: Docker Compose (local)
- **Staging**: Azure (eu-central-1)
- **Production**: Azure (eu-central-1)

### CI/CD Pipeline
1. Code push → GitHub
2. Run tests (unit, integration)
3. Build Docker images
4. Deploy to staging
5. Smoke tests
6. Deploy to production (manual approval)

### Rollback Strategy
- Feature flags for instant disable
- Previous version in staging for quick rollback
- Database migrations are backward-compatible
