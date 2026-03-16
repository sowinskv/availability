# Process Tool API Documentation

Base URL: `http://localhost:8000`

## Authentication

All endpoints require authentication via Microsoft Azure AD (MSAL).

Include access token in Authorization header:
```
Authorization: Bearer {access_token}
```

## Endpoints

### Health Check

#### GET /health

Check API health status.

**Response:**
```json
{
  "status": "healthy"
}
```

---

## Availability

### Create Availability

#### POST /availability

Create new availability entry manually.

**Request Body:**
```json
{
  "start_date": "2026-04-01",
  "end_date": "2026-04-05",
  "hours_per_day": 0,
  "type": "vacation"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "start_date": "2026-04-01",
  "end_date": "2026-04-05",
  "hours_per_day": 0,
  "status": "pending",
  "type": "vacation"
}
```

### Create Availability from Voice

#### POST /availability/voice

Create availability from voice recording.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `audio_file` (WAV format)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "start_date": "2026-04-01",
  "end_date": "2026-04-05",
  "status": "pending",
  "type": "vacation",
  "transcription_text": "I'll be on vacation from April 1st to April 5th",
  "transcription_confidence": 0.95
}
```

### List Availability

#### GET /availability

List availability entries with optional filters.

**Query Parameters:**
- `user_id` (optional): Filter by user
- `status` (optional): Filter by status (pending, approved, declined)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "start_date": "2026-04-01",
    "end_date": "2026-04-05",
    "hours_per_day": 0,
    "status": "pending",
    "type": "vacation"
  }
]
```

### Approve Availability

#### PATCH /availability/{availability_id}/approve

Approve availability request.

**Response:** `200 OK`
```json
{
  "status": "approved"
}
```

---

## Requirements

### Create Requirement

#### POST /requirements

Create requirement manually.

**Request Body:**
```json
{
  "title": "User Authentication Feature",
  "description": "Need OAuth and 2FA support",
  "source": "manual"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "User Authentication Feature",
  "description": "Need OAuth and 2FA support",
  "author_id": "uuid",
  "status": "draft",
  "source": "manual",
  "functional_reqs": {},
  "non_functional_reqs": {},
  "technical_reqs": {}
}
```

### Generate Requirements

#### POST /requirements/generate

Generate requirements from natural language.

**Request Body:**
```json
{
  "input_text": "We need a user authentication feature with OAuth and 2FA support. It should be secure and fast."
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "We need a user authentication feature...",
  "status": "draft",
  "source": "voice",
  "functional_reqs": {
    "items": [
      {
        "id": "FR-001",
        "title": "OAuth Integration",
        "description": "Support OAuth 2.0 authentication",
        "priority": "high"
      }
    ]
  },
  "non_functional_reqs": {
    "items": [
      {
        "id": "NFR-001",
        "title": "Authentication Performance",
        "description": "Authentication should complete within 2 seconds",
        "category": "performance"
      }
    ]
  },
  "technical_reqs": {
    "items": [
      {
        "id": "TR-001",
        "title": "OAuth Library",
        "description": "Use industry-standard OAuth library",
        "category": "architecture"
      }
    ]
  }
}
```

---

## Tasks

### Decompose Requirements

#### POST /tasks/decompose/{requirement_id}

Decompose requirement into tasks.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "requirement_id": "uuid",
    "title": "Implement OAuth Flow",
    "description": "Set up OAuth 2.0 authentication flow",
    "acceptance_criteria": "User can authenticate via Google OAuth",
    "estimated_hours": 16,
    "status": "backlog",
    "priority": "p1",
    "required_skills": ["Python", "OAuth", "Security"]
  },
  {
    "id": "uuid",
    "requirement_id": "uuid",
    "title": "Add 2FA Support",
    "description": "Implement two-factor authentication",
    "acceptance_criteria": "User can enable 2FA on their account",
    "estimated_hours": 12,
    "status": "backlog",
    "priority": "p1",
    "required_skills": ["Python", "Security"]
  }
]
```

### List Tasks

#### GET /tasks

List tasks with optional filters.

**Query Parameters:**
- `requirement_id` (optional): Filter by requirement
- `status` (optional): Filter by status
- `assigned_to` (optional): Filter by assignee

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "requirement_id": "uuid",
    "title": "Implement OAuth Flow",
    "estimated_hours": 16,
    "status": "backlog",
    "priority": "p1",
    "assigned_to": null
  }
]
```

---

## Allocations

### Suggest Allocations

#### POST /allocations/suggest

Get AI-powered allocation suggestions.

**Request Body:**
```json
{
  "task_ids": ["uuid1", "uuid2"],
  "team_capacity": {
    "user_uuid_1": 40,
    "user_uuid_2": 30
  }
}
```

**Response:** `200 OK`
```json
[
  {
    "task_id": "uuid1",
    "user_id": "user_uuid_1",
    "confidence_score": 0.85,
    "reason": "Szymon is an excellent fit for this API development task due to his expert-level Python skills (95% match) and strong track record (1.3x velocity). He has 40 hours available.",
    "alternatives": [
      {
        "user_id": "user_uuid_2",
        "score": 0.70,
        "skill_match": 0.80,
        "availability": 30
      }
    ]
  }
]
```

### Accept Allocation

#### POST /allocations/{task_id}/accept

Accept allocation suggestion.

**Request Body:**
```json
{
  "user_id": "uuid",
  "reason": "Best skill match",
  "confidence_score": 0.85
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "task_id": "uuid",
  "user_id": "uuid",
  "reason": "Best skill match",
  "confidence_score": 0.85,
  "accepted_at": "2026-03-16T10:30:00Z"
}
```

---

## Error Responses

All endpoints may return error responses:

### 400 Bad Request
```json
{
  "error": "ValidationException",
  "message": "Invalid date format",
  "details": {}
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "InternalServerError",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limits

- 1000 requests per hour per user
- 100 requests per minute per user
- LLM endpoints: 10 requests per minute per user

Rate limit headers included in response:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1678934400
```
