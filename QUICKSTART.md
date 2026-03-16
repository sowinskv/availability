# Our process tool - Quick Start Guide

Get Our process tool up and running in 5 minutes!

## Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Make (optional, but recommended)

## Step 1: Clone & Setup

```bash
cd /Users/asia/Developer/SELF/AVAILABILITY

# Copy environment file
cp docker/.env.example docker/.env
cp backend/.env.example backend/.env
```

## Step 2: Add API Keys

Edit `docker/.env` and add your API keys:

```bash
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

Get keys from:
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys

## Step 3: Start Backend Services

```bash
# Using Make (recommended)
make start

# Or using Docker Compose directly
cd docker && docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 8000)

## Step 4: Run Database Migrations

```bash
# Using Make
make db-migrate

# Or manually
for file in db/migrations/*.sql; do
    docker exec processtool-db psql -U atlas -d atlas -f /docker-entrypoint-initdb.d/$(basename $file)
done
```

## Step 5: Start Frontend

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Frontend will be available at: http://localhost:3000

## Step 6: Verify Installation

```bash
# Using Make
make health

# Or using the verification script
./scripts/verify.sh

# Or manually check
curl http://localhost:8000/health
```

## 🎉 You're Ready!

Access points:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432 (user: atlas, password: atlas_dev_password)

## Common Commands

```bash
# Start services
make start

# Stop services
make stop

# View logs
make logs

# Restart services
make restart

# Run tests
make test

# Reset database (⚠️ deletes all data)
make db-reset

# Full dev mode (backend + frontend)
make dev-full
```

## Testing the System

### 1. Test Availability Tracking

1. Go to http://localhost:3000/availability
2. Click "Record Availability"
3. Click the microphone button and speak: "I'll be on vacation from April 1st to April 5th"
4. The system will transcribe and create an availability entry

### 2. Test Requirements Generation

1. Go to http://localhost:3000/requirements
2. Click "Generate with AI"
3. Enter: "We need a user authentication system with OAuth and 2FA support"
4. Click "Generate Requirements"
5. Our process tool will create structured requirements

### 3. Test Task Decomposition

1. Go to http://localhost:3000/tasks
2. Select an approved requirement
3. Click "Generate Tasks"
4. Our process tool will break it down into actionable tasks

## Troubleshooting

### API won't start
```bash
# Check logs
docker logs processtool-api

# Restart
docker restart processtool-api
```

### Database connection error
```bash
# Check if database is running
docker ps | grep processtool-db

# Check database logs
docker logs processtool-db

# Restart database
docker restart processtool-db
```

### Frontend errors
```bash
# Clear and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Change ports in docker-compose.yml
# Or stop conflicting services
lsof -ti:8000 | xargs kill  # Stop service on port 8000
lsof -ti:5432 | xargs kill  # Stop service on port 5432
```

## Next Steps

- Read [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design
- Check [API.md](docs/API.md) for endpoint documentation
- Explore the code in `backend/app/` and `frontend/src/`

## Need Help?

- Check logs: `make logs`
- Run verification: `./scripts/verify.sh`
- Check health: `make health`

Happy building! 🚀
