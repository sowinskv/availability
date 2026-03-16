# Docker Setup - Ready to Run! 🐳

## ✅ What's Fixed

1. **Created Celery app** (`backend/app/celery_app.py`)
2. **Fixed prompt file paths** (now uses absolute paths)
3. **Added .dockerignore** (faster builds)
4. **Created minimal docker-compose** (API + DB + Redis only)
5. **Added test script** (`scripts/docker-test.sh`)

## 🚀 Quick Start (2 Methods)

### Method 1: Minimal Setup (Recommended for Testing)

```bash
# 1. Add API keys (optional for basic testing)
cp docker/.env.example docker/.env
# Edit docker/.env if you want to test AI features

# 2. Test Docker setup
./scripts/docker-test.sh

# 3. Access the API
open http://localhost:8000/docs
```

### Method 2: Full Setup (With Celery Worker)

```bash
# 1. Add API keys
cp docker/.env.example docker/.env
# Edit docker/.env

# 2. Start all services
cd docker
docker-compose up -d

# 3. Check logs
docker-compose logs -f
```

## 🔍 Verify It's Working

```bash
# Check API health
curl http://localhost:8000/health

# Check database
docker exec atlas-db psql -U atlas -d atlas -c "SELECT 1;"

# Check Redis
docker exec atlas-redis redis-cli ping

# View API logs
docker logs atlas-api

# Interactive API docs
open http://localhost:8000/docs
```

## 📋 Services Overview

| Service | Port | Container Name | Purpose |
|---------|------|----------------|---------|
| API | 8000 | atlas-api | FastAPI backend |
| Database | 5432 | atlas-db | PostgreSQL 15 |
| Redis | 6379 | atlas-redis | Cache + Queue |
| Worker | - | atlas-worker | Background jobs (optional) |

## 🐛 Troubleshooting

### API won't start

```bash
# Check logs
docker logs atlas-api

# Rebuild
cd docker
docker-compose build --no-cache api
docker-compose up -d api
```

### Port already in use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill

# Or change port in docker-compose.yml:
# ports: - "8001:8000"
```

### Database connection error

```bash
# Check database is running
docker ps | grep atlas-db

# Check connection
docker exec atlas-db psql -U atlas -d atlas -c "SELECT version();"

# Restart database
docker restart atlas-db
```

### "Module not found" errors

```bash
# Rebuild with no cache
cd docker
docker-compose build --no-cache
docker-compose up -d
```

## 📊 What Works Without API Keys

Without API keys, you can still test:
- ✅ API health endpoints
- ✅ Database connections
- ✅ Manual availability entry
- ✅ Manual requirement creation
- ✅ Task CRUD operations
- ✅ API documentation

With API keys, you can test:
- ✅ Voice transcription (needs OPENAI_API_KEY)
- ✅ AI requirements generation (needs ANTHROPIC_API_KEY)
- ✅ Task decomposition (needs ANTHROPIC_API_KEY)

## 🎯 Next Steps After Docker is Running

1. **Run database migrations:**
   ```bash
   make db-migrate
   # Or manually:
   for file in db/migrations/*.sql; do
       docker exec atlas-db psql -U atlas -d atlas -f /docker-entrypoint-initdb.d/$(basename $file)
   done
   ```

2. **Test the API:**
   ```bash
   # Visit interactive docs
   open http://localhost:8000/docs

   # Try health check
   curl http://localhost:8000/health
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Visit http://localhost:3000
   ```

## 🔧 Common Commands

```bash
# Start services
cd docker && docker-compose -f docker-compose.minimal.yml up -d

# Stop services
cd docker && docker-compose -f docker-compose.minimal.yml down

# View logs (all)
cd docker && docker-compose -f docker-compose.minimal.yml logs -f

# View logs (API only)
docker logs -f atlas-api

# Rebuild API
cd docker && docker-compose -f docker-compose.minimal.yml build api

# Restart API
docker restart atlas-api

# Shell into API container
docker exec -it atlas-api bash

# Check running containers
docker ps

# Clean everything (⚠️ deletes data)
cd docker && docker-compose down -v
```

## ✨ API Endpoints Available

Once running, check these endpoints:

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API docs (ReDoc)

Full API routes:
- `/availability/*` - Availability management
- `/requirements/*` - Requirements management
- `/tasks/*` - Task management
- `/allocations/*` - Allocation management

## 🎉 Success Indicators

You know it's working when:
- ✅ `docker ps` shows 3 running containers (api, db, redis)
- ✅ `curl http://localhost:8000/health` returns `{"status":"healthy"}`
- ✅ http://localhost:8000/docs loads the Swagger UI
- ✅ Database has 10+ tables after migrations

**Docker setup is ready! 🚀**
