# Atlas: AI Project Planning Engine

Atlas is an AI-powered project planning engine that dramatically reduces planning overhead and improves task allocation quality.

## Features

### Phase 1: Team Intelligence Layer ✅
- **Availability Tracking**: Voice or manual input with approval workflow
- **Skill Matrix**: Developer skills, proficiency levels, velocity tracking
- **Team Capacity Engine**: Real-time capacity calculation with conflict detection

### Phase 2: Requirements & Task Generation 🚧
- **Requirements Generator**: Natural language → structured requirements
- **Task Decomposer**: Requirements → granular tasks with estimates
- **Prompt Management**: Version-controlled prompts with A/B testing

### Phase 3: Smart Allocation 📋
- **Smart Allocator**: AI-powered task allocation based on skills, availability, velocity
- **Delivery Tracker**: Real-time sync with GitHub/Azure DevOps
- **Learning Loop**: Velocity model improves over time

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL 15
- Redis 7

### Environment Setup

1. Copy environment file:
```bash
cp docker/.env.example docker/.env
```

2. Add your API keys to `docker/.env`:
```
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

### Start with Docker

```bash
cd docker
docker-compose up
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 8000)
- Celery worker

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

### Database Migrations

Run migrations in order:

```bash
docker exec -it atlas-db psql -U atlas -d atlas -f /docker-entrypoint-initdb.d/001_create_users.sql
docker exec -it atlas-db psql -U atlas -d atlas -f /docker-entrypoint-initdb.d/002_create_availability.sql
# ... continue with remaining migrations
```

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── models/           # Database models
│   │   ├── services/         # Business logic
│   │   ├── prompts/          # LLM prompts
│   │   ├── exceptions/       # Custom exceptions
│   │   └── main.py           # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom hooks
│   │   └── App.tsx
│   └── package.json
├── db/
│   └── migrations/           # SQL migration files
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example
├── docs/
│   ├── ARCHITECTURE.md       # System architecture
│   └── API.md                # API documentation
└── tests/
    ├── unit/                 # Unit tests
    ├── integration/          # Integration tests
    └── security/             # Security tests
```

## API Endpoints

### Availability
- `POST /availability` - Create availability entry
- `POST /availability/voice` - Create from voice recording
- `GET /availability` - List availability entries
- `PATCH /availability/{id}/approve` - Approve request
- `PATCH /availability/{id}/decline` - Decline request

### Requirements
- `POST /requirements` - Create requirement
- `POST /requirements/generate` - Generate from natural language
- `GET /requirements` - List requirements
- `PATCH /requirements/{id}/approve` - Approve requirement

### Tasks
- `POST /tasks` - Create task
- `POST /tasks/decompose/{requirement_id}` - Decompose requirement
- `GET /tasks` - List tasks
- `PATCH /tasks/{id}` - Update task

### Allocations
- `POST /allocations/suggest` - Get allocation suggestions
- `POST /allocations/{task_id}/accept` - Accept allocation
- `POST /allocations/{task_id}/reject` - Reject allocation
- `GET /allocations` - List allocations

## Development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm run dev
```

### Run Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## Configuration

### Environment Variables

See `docker/.env.example` for all available configuration options.

Key variables:
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - OpenAI Whisper API key
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

## Deployment

### Production Deployment

1. Build Docker images:
```bash
docker build -t atlas-api -f docker/Dockerfile .
```

2. Push to container registry
3. Deploy to Azure (see CI/CD pipeline)

### Feature Flags

Feature flags in environment:
- `REQUIREMENTS_GENERATION_ENABLED` - Enable requirements generation
- `SMART_ALLOCATION_ENABLED` - Enable smart allocation

## Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit PR

## License

Proprietary - Accenture Internal

## Support

For issues or questions:
- GitHub Issues: https://github.com/your-org/atlas/issues
- Slack: #atlas-support
