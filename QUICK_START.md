# Quick Start Guide - Projects & Requirements Wizard

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL database
- Gemini API key (for AI suggestions)

---

## 1️⃣ Database Setup

### Option A: Run Migration (Recommended for existing database)

```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Run the migration
\i backend/db/migrations/010_add_project_fields_and_requirements_fk.sql

# Verify the changes
\d projects
\d requirements
```

### Option B: Recreate Tables (For development)

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate

# This will create all tables with the new schema
python init_db.py
```

---

## 2️⃣ Backend Setup

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install/update dependencies (if needed)
pip install google-generativeai

# Ensure .env has GEMINI_API_KEY
echo "GEMINI_API_KEY=your_gemini_api_key_here" >> .env

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend should now be running at `http://localhost:8000`

### Verify Backend

Open `http://localhost:8000/docs` in your browser to see the API documentation.

You should see new endpoints:
- `/api/projects/` (GET, POST)
- `/api/projects/{project_id}` (GET, PATCH, DELETE)
- `/requirements/wizard` (POST)
- `/requirements/suggest-field` (POST)

---

## 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Start the development server
npm run dev
```

The frontend should now be running at `http://localhost:5173` (or similar)

---

## 4️⃣ Testing the Feature

### Step 1: Login
1. Navigate to `http://localhost:5173`
2. Log in with your test credentials

### Step 2: Access Projects
1. Click **"PROJECTS"** in the left sidebar
2. You should see the Projects page (empty if no projects exist)

### Step 3: Create a Project via Wizard
1. Click **"+ NEW PROJECT"** or **"Requirements Collection"** in the sidebar
2. You should see Step 1 of the wizard

#### Step 1: Project Selection
- Choose **"Create New Project"**
- Fill in:
  - **Project Name:** "E-commerce Platform"
  - **Project Type:** "Web Application"
  - **Description:** "Online shopping platform with cart and checkout"
  - **Client:** "Acme Corp"
  - **Priority:** "High"
- Click **"NEXT"**

#### Step 2: Functional Requirements
- **FR #1:**
  - **Title:** "User Authentication"
  - **Description:** "Users should be able to create accounts, log in, and manage their profiles"
  - Click **"✨ SUGGEST WITH AI"** for acceptance criteria
  - Wait for AI suggestion (should appear in ~3-5 seconds)
  - Review the suggested criteria
  - Click **"ACCEPT"** if they look good, or edit manually
- Click **"+ ADD ANOTHER FUNCTIONAL REQUIREMENT"** to add more (optional)
- Click **"NEXT"**

#### Step 3: Non-Functional Requirements
- **NFR #1:**
  - **Category:** "Performance"
  - **Description:** "The system should handle 1000 concurrent users without degradation"
  - Click **"✨ SUGGEST WITH AI"** for metric
  - Accept or edit the suggestion
- Add more NFRs if desired
- Click **"NEXT"**

#### Step 4: Technical Requirements
- **TR #1:**
  - **Technology:** "React"
  - **Description:** "Frontend framework for building the user interface"
  - Click **"✨ SUGGEST WITH AI"** for dependencies
  - Accept or edit the suggestions (should include React Router, Axios, etc.)
- Add more TRs if desired
- Click **"SUBMIT"**

### Step 4: Verify Creation
- You should be redirected to `/app/projects`
- You should see your new project card with:
  - Project name
  - Project type
  - Status (Planning)
  - Requirement count (1 requirement)

---

## 5️⃣ Verify in Database

```sql
-- Check projects
SELECT id, name, project_type, description, client, status FROM projects;

-- Check requirements
SELECT id, title, project_id, functional_reqs, non_functional_reqs, technical_reqs
FROM requirements
WHERE project_id IS NOT NULL;
```

---

## 🧪 Testing Scenarios

### Scenario 1: Existing Project
1. Create a project via wizard
2. Start a new wizard
3. Choose **"Select Existing Project"**
4. Select your project from dropdown
5. Complete the wizard
6. Verify the project now has 2 requirements

### Scenario 2: Multiple Requirements per Step
1. Start wizard
2. In Step 2, add 3 functional requirements
3. In Step 3, add 2 non-functional requirements
4. In Step 4, add 2 technical requirements
5. Submit and verify all requirements are saved

### Scenario 3: AI Suggestions
1. Test each suggestion type:
   - FR acceptance criteria
   - NFR metrics
   - TR dependencies
2. Verify suggestions are contextually relevant
3. Test accept/reject functionality

### Scenario 4: Validation
1. Try to proceed from Step 1 without filling project name → Should be disabled
2. Try to proceed from Step 2 without at least one FR → Should be disabled
3. Verify "NEXT" button is disabled when validation fails

---

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'google.generativeai'"
```bash
cd backend
source venv/bin/activate
pip install google-generativeai
```

### "Cannot find module 'lucide-react'"
```bash
cd frontend
npm install lucide-react
```

### "API endpoint not found"
- Verify backend is running: `curl http://localhost:8000/health`
- Check main.py has `app.include_router(project_routes.router)`
- Restart backend server

### "Wizard not loading"
- Check browser console for errors
- Verify routes are registered in App.tsx
- Check that all wizard components are properly exported

### "AI suggestions not working"
- Verify `GEMINI_API_KEY` is set in backend/.env
- Check backend logs for API errors
- Ensure you have Gemini API quota available

### "Database errors"
- Check migration ran successfully
- Verify project_type enum exists: `\dT project_type` in psql
- Check requirements table has project_id column: `\d requirements` in psql

---

## 📊 API Testing with cURL

### Create a Project
```bash
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "project_type": "web_app",
    "description": "Test description",
    "priority": "medium"
  }'
```

### List Projects
```bash
curl http://localhost:8000/api/projects/
```

### Get Field Suggestion
```bash
curl -X POST http://localhost:8000/requirements/suggest-field \
  -H "Content-Type: application/json" \
  -d '{
    "field_type": "fr_acceptance_criteria",
    "context": {
      "title": "User Authentication",
      "description": "Users can log in with email and password"
    }
  }'
```

---

## 🎯 Success Criteria

✅ Backend server starts without errors
✅ Frontend compiles and runs
✅ Projects page loads
✅ Wizard opens and displays Step 1
✅ Can create new project through wizard
✅ Can navigate between wizard steps
✅ AI suggestions work for all field types
✅ Requirements are saved to database
✅ Projects list shows created projects

---

## 📞 Support

If you encounter issues:
1. Check the console logs (browser and terminal)
2. Verify all environment variables are set
3. Ensure database migrations ran successfully
4. Check API documentation at `/docs`

---

**Last Updated:** March 18, 2026
