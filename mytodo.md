- make the availability logging actually work
- notion mcp/api and graph api for teams (adding OOO in teams for approved vacation)
- track birthdays
- creating tasks and assigning based on availability and skill -> sending them to notion/pulling them from notion
- what are allocations? is it dead code or actually useful?
- add architecture diagram in mermaid or something based on the description showed on the project page, ready to download
- add ui mock-up - i dunno how though - maybe describe + inspo pics?

plan for projects/requirements:


╭────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Plan to implement                                                                                          │
│                                                                                                            │
│ FAST Process Tool - Projects Section with Interactive Requirements Collection                              │
│                                                                                                            │
│ Context                                                                                                    │
│                                                                                                            │
│ This plan implements a new Projects section in the FAST Process Tool with an interactive, AI-powered       │
│ requirements collection feature. The goal is to streamline the process of gathering software requirements  │
│ by:                                                                                                        │
│                                                                                                            │
│ 1. Organizing requirements under projects - Requirements currently exist independently; we need project    │
│ context                                                                                                    │
│ 2. Multi-step wizard interface - Breaking down the complex requirements template into digestible steps     │
│ 3. LLM-powered suggestions - Auto-suggesting values for optional fields while letting users fill critical  │
│ fields manually                                                                                            │
│ 4. Template-based structure - Following software requirements best practices (FR/NFR/TR separation)        │
│                                                                                                            │
│ Why this is needed:                                                                                        │
│ - Current RequirementsPage only generates requirements from freeform text                                  │
│ - No way to associate requirements with specific projects/clients                                          │
│ - No structured form following the company's requirements template                                         │
│ - Users need guidance on what makes a good requirement (LLM helps)                                         │
│                                                                                                            │
│ User Flow:                                                                                                 │
│ 1. Click "Projects" in sidebar → Shows "Requirements Collection" subsection                                │
│ 2. Start wizard → Step 1: Select/create project (name, type, client)                                       │
│ 3. Step 2-4: Fill FR, NFR, TR forms with LLM suggestions for optional fields                               │
│ 4. Submit → Creates project + structured requirements in database                                          │
│                                                                                                            │
│ ---                                                                                                        │
│ Implementation Plan                                                                                        │
│                                                                                                            │
│ Phase 1: Database Schema Changes                                                                           │
│                                                                                                            │
│ 1.1 Migration: Add Project Fields & Requirements FK                                                        │
│                                                                                                            │
│ New File: /backend/db/migrations/010_add_project_fields_and_requirements_fk.sql                            │
│                                                                                                            │
│ -- Add project type enum                                                                                   │
│ CREATE TYPE project_type AS ENUM ('web_app', 'mobile_app', 'desktop', 'api', 'other');                     │
│                                                                                                            │
│ -- Add columns to projects table                                                                           │
│ ALTER TABLE projects ADD COLUMN project_type project_type;                                                 │
│ ALTER TABLE projects ADD COLUMN description TEXT;                                                          │
│ ALTER TABLE projects ADD COLUMN client VARCHAR(255);                                                       │
│                                                                                                            │
│ -- Add project_id foreign key to requirements table (nullable for backwards compatibility)                 │
│ ALTER TABLE requirements ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;            │
│ CREATE INDEX idx_requirements_project_id ON requirements(project_id);                                      │
│                                                                                                            │
│ 1.2 Update Backend Models                                                                                  │
│                                                                                                            │
│ Modify: /backend/app/models/project.py                                                                     │
│                                                                                                            │
│ Add fields:                                                                                                │
│ from sqlalchemy import Column, String, Text, Date, Enum                                                    │
│ from sqlalchemy.dialects.postgresql import UUID                                                            │
│ from sqlalchemy.orm import relationship                                                                    │
│                                                                                                            │
│ class ProjectType(enum.Enum):                                                                              │
│     WEB_APP = "web_app"                                                                                    │
│     MOBILE_APP = "mobile_app"                                                                              │
│     DESKTOP = "desktop"                                                                                    │
│     API = "api"                                                                                            │
│     OTHER = "other"                                                                                        │
│                                                                                                            │
│ class Project(Base, TimestampMixin):                                                                       │
│     __tablename__ = "projects"                                                                             │
│                                                                                                            │
│     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)                                  │
│     name = Column(String(255), nullable=False, index=True)                                                 │
│     project_type = Column(Enum(ProjectType), nullable=False)                                               │
│     description = Column(Text)                                                                             │
│     client = Column(String(255))                                                                           │
│     deadline = Column(Date)                                                                                │
│     priority = Column(Enum(ProjectPriority), nullable=False, default=ProjectPriority.MEDIUM)               │
│     status = Column(Enum(ProjectStatus), nullable=False, default=ProjectStatus.PLANNING, index=True)       │
│                                                                                                            │
│     # Relationships                                                                                        │
│     requirements = relationship("Requirement", back_populates="project")                                   │
│                                                                                                            │
│ Modify: /backend/app/models/requirement.py                                                                 │
│                                                                                                            │
│ Add:                                                                                                       │
│ project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True,     │
│ index=True)                                                                                                │
│ project = relationship("Project", back_populates="requirements")                                           │
│                                                                                                            │
│ ---                                                                                                        │
│ Phase 2: Backend API Implementation                                                                        │
│                                                                                                            │
│ 2.1 Create Project Routes                                                                                  │
│                                                                                                            │
│ New File: /backend/app/api/project_routes.py                                                               │
│                                                                                                            │
│ Endpoints:                                                                                                 │
│ - POST /projects/ - Create new project                                                                     │
│ - GET /projects/ - List projects (filters: status, project_type)                                           │
│ - GET /projects/{project_id} - Get project details                                                         │
│ - GET /projects/{project_id}/requirements - Get project's requirements                                     │
│ - PATCH /projects/{project_id} - Update project                                                            │
│ - DELETE /projects/{project_id} - Delete project (sets requirements.project_id to NULL)                    │
│                                                                                                            │
│ Pydantic Schemas:                                                                                          │
│ class ProjectCreate(BaseModel):                                                                            │
│     name: str                                                                                              │
│     project_type: str                                                                                      │
│     description: Optional[str]                                                                             │
│     client: Optional[str]                                                                                  │
│     deadline: Optional[date]                                                                               │
│     priority: str = "medium"                                                                               │
│                                                                                                            │
│ class ProjectResponse(BaseModel):                                                                          │
│     id: UUID                                                                                               │
│     name: str                                                                                              │
│     project_type: str                                                                                      │
│     description: Optional[str]                                                                             │
│     client: Optional[str]                                                                                  │
│     status: str                                                                                            │
│     priority: str                                                                                          │
│     requirement_count: int                                                                                 │
│     created_at: datetime                                                                                   │
│                                                                                                            │
│ 2.2 Create Field Suggestion Service                                                                        │
│                                                                                                            │
│ New File: /backend/app/services/field_suggestion_service.py                                                │
│                                                                                                            │
│ Service for generating LLM suggestions for specific fields:                                                │
│ class FieldSuggestionService:                                                                              │
│     """Service for generating field-level suggestions using Gemini."""                                     │
│                                                                                                            │
│     def __init__(self, api_key: str, prompt_template: str):                                                │
│         self.client = genai.GenerativeModel('gemini-pro')                                                  │
│         self.prompt_template = prompt_template                                                             │
│                                                                                                            │
│     async def suggest_acceptance_criteria(self, title: str, description: str) -> List[str]:                │
│         """Suggest acceptance criteria for FR given title and description."""                              │
│         prompt = f"""Given this functional requirement:                                                    │
│ Title: {title}                                                                                             │
│ Description: {description}                                                                                 │
│                                                                                                            │
│ Generate 3-5 specific, testable acceptance criteria. Return as JSON array.                                 │
│ """                                                                                                        │
│         # Call Gemini API, parse response                                                                  │
│         return criteria_list                                                                               │
│                                                                                                            │
│     async def suggest_nfr_metric(self, category: str, description: str) -> str:                            │
│         """Suggest metric for NFR given category and description."""                                       │
│         # Similar pattern                                                                                  │
│                                                                                                            │
│     async def suggest_tr_dependencies(self, technology: str, description: str) -> List[str]:               │
│         """Suggest dependencies for TR given technology and description."""                                │
│         # Similar pattern                                                                                  │
│                                                                                                            │
│ New File: /backend/app/prompts/field_suggestions_v1.txt                                                    │
│                                                                                                            │
│ Prompt templates for each field type.                                                                      │
│                                                                                                            │
│ Update: /backend/app/dependencies.py                                                                       │
│                                                                                                            │
│ Add:                                                                                                       │
│ def get_field_suggestion_service(db: Session = Depends(get_db)) -> FieldSuggestionService:                 │
│     return FieldSuggestionService(api_key=settings.GEMINI_API_KEY, prompt_template=load_prompt())          │
│                                                                                                            │
│ 2.3 Enhance Requirements Routes                                                                            │
│                                                                                                            │
│ Update: /backend/app/api/requirements_routes.py                                                            │
│                                                                                                            │
│ Add new endpoints:                                                                                         │
│ @router.post("/requirements/wizard")                                                                       │
│ async def create_requirements_via_wizard(                                                                  │
│     data: RequirementWizardCreate,                                                                         │
│     db: Session = Depends(get_db)                                                                          │
│ ):                                                                                                         │
│     """Create structured requirements from wizard submission."""                                           │
│     # Create single Requirement record with all FR/NFR/TR data                                             │
│     requirement = Requirement(                                                                             │
│         title=f"{project.name} Requirements",                                                              │
│         project_id=data.project_id,                                                                        │
│         author_id=data.author_id,                                                                          │
│         functional_reqs=data.functional_reqs,                                                              │
│         non_functional_reqs=data.non_functional_reqs,                                                      │
│         technical_reqs=data.technical_reqs,                                                                │
│         status=RequirementStatus.DRAFT,                                                                    │
│         source=RequirementSource.MANUAL                                                                    │
│     )                                                                                                      │
│     db.add(requirement)                                                                                    │
│     db.commit()                                                                                            │
│     return requirement                                                                                     │
│                                                                                                            │
│ @router.post("/requirements/suggest-field")                                                                │
│ async def suggest_field_value(                                                                             │
│     request: FieldSuggestionRequest,                                                                       │
│     service: FieldSuggestionService = Depends(get_field_suggestion_service)                                │
│ ):                                                                                                         │
│     """Get LLM suggestion for specific field."""                                                           │
│     if request.field_type == "fr_acceptance_criteria":                                                     │
│         return await service.suggest_acceptance_criteria(                                                  │
│             request.context["title"],                                                                      │
│             request.context["description"]                                                                 │
│         )                                                                                                  │
│     # Handle other field types                                                                             │
│                                                                                                            │
│ Schemas:                                                                                                   │
│ class RequirementWizardCreate(BaseModel):                                                                  │
│     project_id: UUID                                                                                       │
│     functional_reqs: List[Dict[str, Any]]                                                                  │
│     non_functional_reqs: List[Dict[str, Any]]                                                              │
│     technical_reqs: List[Dict[str, Any]]                                                                   │
│     author_id: UUID                                                                                        │
│                                                                                                            │
│ class FieldSuggestionRequest(BaseModel):                                                                   │
│     field_type: str  # "fr_acceptance_criteria", "nfr_metric", "tr_dependencies"                           │
│     context: Dict[str, Any]                                                                                │
│                                                                                                            │
│ 2.4 Register Routes                                                                                        │
│                                                                                                            │
│ Update: /backend/app/main.py                                                                               │
│                                                                                                            │
│ from .api import project_routes                                                                            │
│ app.include_router(project_routes.router, prefix="/api", tags=["projects"])                                │
│                                                                                                            │
│ ---                                                                                                        │
│ Phase 3: Frontend State Management                                                                         │
│                                                                                                            │
│ 3.1 Create Projects Hook                                                                                   │
│                                                                                                            │
│ New File: /frontend/src/hooks/useProjects.ts                                                               │
│                                                                                                            │
│ export const useProjects = (filters?: { status?: string; project_type?: string }) => {                     │
│   const queryClient = useQueryClient();                                                                    │
│                                                                                                            │
│   // Query: list projects                                                                                  │
│   const { data: projects, isLoading } = useQuery({                                                         │
│     queryKey: ['projects', filters],                                                                       │
│     queryFn: async () => {                                                                                 │
│       const params = new URLSearchParams(filters);                                                         │
│       const response = await axios.get(`${API_BASE}/projects/?${params}`);                                 │
│       return response.data;                                                                                │
│     },                                                                                                     │
│   });                                                                                                      │
│                                                                                                            │
│   // Mutation: create project                                                                              │
│   const createProject = useMutation({                                                                      │
│     mutationFn: async (data: ProjectCreate) => {                                                           │
│       const response = await axios.post(`${API_BASE}/projects/`, data);                                    │
│       return response.data;                                                                                │
│     },                                                                                                     │
│     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),                            │
│   });                                                                                                      │
│                                                                                                            │
│   // Similar for updateProject, deleteProject                                                              │
│                                                                                                            │
│   return { projects, isLoading, createProject, updateProject, deleteProject };                             │
│ };                                                                                                         │
│                                                                                                            │
│ 3.2 Create Requirements Wizard Hook                                                                        │
│                                                                                                            │
│ New File: /frontend/src/hooks/useRequirementsWizard.ts                                                     │
│                                                                                                            │
│ interface WizardState {                                                                                    │
│   currentStep: 1 | 2 | 3 | 4;                                                                              │
│   projectSelection: 'existing' | 'new';                                                                    │
│   selectedProjectId?: string;                                                                              │
│   newProject?: ProjectFormData;                                                                            │
│   functionalReqs: FRFormData[];                                                                            │
│   nonFunctionalReqs: NFRFormData[];                                                                        │
│   technicalReqs: TRFormData[];                                                                             │
│   suggestions: Map<string, any>; // Cache suggestions                                                      │
│ }                                                                                                          │
│                                                                                                            │
│ export const useRequirementsWizard = () => {                                                               │
│   const [state, setState] = useState<WizardState>({                                                        │
│     currentStep: 1,                                                                                        │
│     projectSelection: 'new',                                                                               │
│     functionalReqs: [{ title: '', description: '', acceptance_criteria: [] }],                             │
│     nonFunctionalReqs: [{ category: '', description: '', metric: '' }],                                    │
│     technicalReqs: [{ technology: '', description: '', dependencies: [] }],                                │
│     suggestions: new Map(),                                                                                │
│   });                                                                                                      │
│                                                                                                            │
│   const nextStep = () => setState(s => ({ ...s, currentStep: (s.currentStep + 1) as any }));               │
│   const prevStep = () => setState(s => ({ ...s, currentStep: (s.currentStep - 1) as any }));               │
│                                                                                                            │
│   const updateField = (step: string, index: number, field: string, value: any) => {                        │
│     // Update specific field in state                                                                      │
│   };                                                                                                       │
│                                                                                                            │
│   // LLM suggestion methods                                                                                │
│   const requestSuggestion = useMutation({                                                                  │
│     mutationFn: async ({ fieldType, context }: any) => {                                                   │
│       return axios.post(`${API_BASE}/requirements/suggest-field`, {                                        │
│         field_type: fieldType,                                                                             │
│         context,                                                                                           │
│       });                                                                                                  │
│     },                                                                                                     │
│     onSuccess: (data, variables) => {                                                                      │
│       // Cache suggestion in state                                                                         │
│       setState(s => ({                                                                                     │
│         ...s,                                                                                              │
│         suggestions: new Map(s.suggestions).set(variables.fieldType, data),                                │
│       }));                                                                                                 │
│     },                                                                                                     │
│   });                                                                                                      │
│                                                                                                            │
│   const submitWizard = useMutation({                                                                       │
│     mutationFn: async () => {                                                                              │
│       // First create project if new                                                                       │
│       let projectId = state.selectedProjectId;                                                             │
│       if (state.projectSelection === 'new' && state.newProject) {                                          │
│         const projectResponse = await axios.post(`${API_BASE}/projects/`, state.newProject);               │
│         projectId = projectResponse.data.id;                                                               │
│       }                                                                                                    │
│                                                                                                            │
│       // Then create requirements                                                                          │
│       return axios.post(`${API_BASE}/requirements/wizard`, {                                               │
│         project_id: projectId,                                                                             │
│         functional_reqs: state.functionalReqs,                                                             │
│         non_functional_reqs: state.nonFunctionalReqs,                                                      │
│         technical_reqs: state.technicalReqs,                                                               │
│         author_id: user.id,                                                                                │
│       });                                                                                                  │
│     },                                                                                                     │
│   });                                                                                                      │
│                                                                                                            │
│   return { state, nextStep, prevStep, updateField, requestSuggestion, submitWizard };                      │
│ };                                                                                                         │
│                                                                                                            │
│ ---                                                                                                        │
│ Phase 4: Frontend Components                                                                               │
│                                                                                                            │
│ 4.1 Wizard Container                                                                                       │
│                                                                                                            │
│ New File: /frontend/src/components/wizard/WizardContainer.tsx                                              │
│                                                                                                            │
│ export const WizardContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {                │
│   const { state, nextStep, prevStep } = useRequirementsWizard();                                           │
│                                                                                                            │
│   return (                                                                                                 │
│     <div className="h-full bg-white">                                                                      │
│       {/* Progress indicator */}                                                                           │
│       <div className="border-b border-[#e5e5e5] px-12 py-4">                                               │
│         <div className="flex items-center gap-2">                                                          │
│           {[1, 2, 3, 4].map(step => (                                                                      │
│             <div                                                                                           │
│               key={step}                                                                                   │
│               className={`flex-1 h-1 ${                                                                    │
│                 step <= state.currentStep ? 'bg-[#000000]' : 'bg-[#e5e5e5]'                                │
│               }`}                                                                                          │
│             />                                                                                             │
│           ))}                                                                                              │
│         </div>                                                                                             │
│         <div className="text-xs text-[#999999] mt-2 uppercase tracking-wide">                              │
│           Step {state.currentStep} of 4                                                                    │
│         </div>                                                                                             │
│       </div>                                                                                               │
│                                                                                                            │
│       {/* Content */}                                                                                      │
│       <div className="px-12 py-8 max-w-3xl mx-auto">                                                       │
│         {children}                                                                                         │
│       </div>                                                                                               │
│                                                                                                            │
│       {/* Navigation */}                                                                                   │
│       <div className="border-t border-[#e5e5e5] px-12 py-6 flex justify-between">                          │
│         <button                                                                                            │
│           onClick={prevStep}                                                                               │
│           disabled={state.currentStep === 1}                                                               │
│           className="px-6 py-2 text-sm text-[#666666] hover:text-[#000000] disabled:opacity-30 uppercase   │
│ tracking-wide"                                                                                             │
│         >                                                                                                  │
│           Back                                                                                             │
│         </button>                                                                                          │
│         <button                                                                                            │
│           onClick={state.currentStep === 4 ? submitWizard : nextStep}                                      │
│           className="px-6 py-2 bg-[#000000] text-white text-sm hover:opacity-90 uppercase tracking-wide"   │
│         >                                                                                                  │
│           {state.currentStep === 4 ? 'Submit' : 'Next'}                                                    │
│         </button>                                                                                          │
│       </div>                                                                                               │
│     </div>                                                                                                 │
│   );                                                                                                       │
│ };                                                                                                         │
│                                                                                                            │
│ 4.2 Project Selection Step                                                                                 │
│                                                                                                            │
│ New File: /frontend/src/components/wizard/ProjectStep.tsx                                                  │
│                                                                                                            │
│ export const ProjectStep: React.FC = () => {                                                               │
│   const { state, updateField } = useRequirementsWizard();                                                  │
│   const { projects } = useProjects();                                                                      │
│                                                                                                            │
│   return (                                                                                                 │
│     <div className="space-y-8">                                                                            │
│       <div>                                                                                                │
│         <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-4">             │
│           Project Selection                                                                                │
│         </div>                                                                                             │
│                                                                                                            │
│         {/* Radio buttons */}                                                                              │
│         <div className="space-y-3">                                                                        │
│           <label className="flex items-center gap-3 cursor-pointer">                                       │
│             <input                                                                                         │
│               type="radio"                                                                                 │
│               checked={state.projectSelection === 'existing'}                                              │
│               onChange={() => updateField('projectSelection', 0, '', 'existing')}                          │
│               className="w-4 h-4"                                                                          │
│             />                                                                                             │
│             <span className="text-sm">Select Existing Project</span>                                       │
│           </label>                                                                                         │
│           <label className="flex items-center gap-3 cursor-pointer">                                       │
│             <input                                                                                         │
│               type="radio"                                                                                 │
│               checked={state.projectSelection === 'new'}                                                   │
│               onChange={() => updateField('projectSelection', 0, '', 'new')}                               │
│               className="w-4 h-4"                                                                          │
│             />                                                                                             │
│             <span className="text-sm">Create New Project</span>                                            │
│           </label>                                                                                         │
│         </div>                                                                                             │
│       </div>                                                                                               │
│                                                                                                            │
│       {/* Conditional content */}                                                                          │
│       {state.projectSelection === 'existing' ? (                                                           │
│         <div>                                                                                              │
│           <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2">   │
│             Select Project                                                                                 │
│           </label>                                                                                         │
│           <select className="w-full px-4 py-3 border border-[#e5e5e5] text-sm">                            │
│             <option value="">Choose a project...</option>                                                  │
│             {projects?.map(p => (                                                                          │
│               <option key={p.id} value={p.id}>{p.name}</option>                                            │
│             ))}                                                                                            │
│           </select>                                                                                        │
│         </div>                                                                                             │
│       ) : (                                                                                                │
│         <div className="space-y-6">                                                                        │
│           <div>                                                                                            │
│             <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2"> │
│               Project Name *                                                                               │
│             </label>                                                                                       │
│             <input                                                                                         │
│               type="text"                                                                                  │
│               required                                                                                     │
│               className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] focus:border-[#000000]" │
│             />                                                                                             │
│           </div>                                                                                           │
│           <div>                                                                                            │
│             <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2"> │
│               Project Type *                                                                               │
│             </label>                                                                                       │
│             <select className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5]">                 │
│               <option value="web_app">Web Application</option>                                             │
│               <option value="mobile_app">Mobile Application</option>                                       │
│               <option value="desktop">Desktop Application</option>                                         │
│               <option value="api">API</option>                                                             │
│               <option value="other">Other</option>                                                         │
│             </select>                                                                                      │
│           </div>                                                                                           │
│           <div>                                                                                            │
│             <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2"> │
│               Description                                                                                  │
│             </label>                                                                                       │
│             <textarea                                                                                      │
│               rows={3}                                                                                     │
│               className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5] resize-none"            │
│             />                                                                                             │
│           </div>                                                                                           │
│           <div>                                                                                            │
│             <label className="block text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-2"> │
│               Client                                                                                       │
│             </label>                                                                                       │
│             <input                                                                                         │
│               type="text"                                                                                  │
│               className="w-full px-0 py-2 bg-transparent border-b border-[#e5e5e5]"                        │
│             />                                                                                             │
│           </div>                                                                                           │
│         </div>                                                                                             │
│       )}                                                                                                   │
│     </div>                                                                                                 │
│   );                                                                                                       │
│ };                                                                                                         │
│                                                                                                            │
│ 4.3 Functional Requirements Step                                                                           │
│                                                                                                            │
│ New File: /frontend/src/components/wizard/FunctionalReqStep.tsx                                            │
│                                                                                                            │
│ export const FunctionalReqStep: React.FC = () => {                                                         │
│   const { state, updateField, requestSuggestion } = useRequirementsWizard();                               │
│                                                                                                            │
│   const addFR = () => {                                                                                    │
│     // Add new empty FR to state                                                                           │
│   };                                                                                                       │
│                                                                                                            │
│   const removeFR = (index: number) => {                                                                    │
│     // Remove FR from state                                                                                │
│   };                                                                                                       │
│                                                                                                            │
│   return (                                                                                                 │
│     <div className="space-y-8">                                                                            │
│       <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">                    │
│         Functional Requirements                                                                            │
│       </div>                                                                                               │
│                                                                                                            │
│       {state.functionalReqs.map((fr, index) => (                                                           │
│         <div key={index} className="p-6 border border-[#e5e5e5] space-y-4">                                │
│           <div className="flex justify-between items-start">                                               │
│             <div className="text-sm font-medium">FR #{index + 1}</div>                                     │
│             {state.functionalReqs.length > 1 && (                                                          │
│               <button                                                                                      │
│                 onClick={() => removeFR(index)}                                                            │
│                 className="text-xs text-[#666666] hover:text-red-600 uppercase"                            │
│               >                                                                                            │
│                 Remove                                                                                     │
│               </button>                                                                                    │
│             )}                                                                                             │
│           </div>                                                                                           │
│                                                                                                            │
│           <div>                                                                                            │
│             <label className="block text-[10px] text-[#999999] uppercase mb-2">                            │
│               Title *                                                                                      │
│             </label>                                                                                       │
│             <input                                                                                         │
│               type="text"                                                                                  │
│               value={fr.title}                                                                             │
│               onChange={(e) => updateField('functionalReqs', index, 'title', e.target.value)}              │
│               required                                                                                     │
│               className="w-full px-0 py-2 border-b border-[#e5e5e5]"                                       │
│             />                                                                                             │
│           </div>                                                                                           │
│                                                                                                            │
│           <div>                                                                                            │
│             <label className="block text-[10px] text-[#999999] uppercase mb-2">                            │
│               Description *                                                                                │
│             </label>                                                                                       │
│             <textarea                                                                                      │
│               value={fr.description}                                                                       │
│               onChange={(e) => updateField('functionalReqs', index, 'description', e.target.value)}        │
│               required                                                                                     │
│               rows={3}                                                                                     │
│               className="w-full px-0 py-2 border-b border-[#e5e5e5] resize-none"                           │
│             />                                                                                             │
│           </div>                                                                                           │
│                                                                                                            │
│           <div>                                                                                            │
│             <div className="flex justify-between items-center mb-2">                                       │
│               <label className="text-[10px] text-[#999999] uppercase">                                     │
│                 Acceptance Criteria                                                                        │
│               </label>                                                                                     │
│               <button                                                                                      │
│                 onClick={() => requestSuggestion.mutate({                                                  │
│                   fieldType: 'fr_acceptance_criteria',                                                     │
│                   context: { title: fr.title, description: fr.description }                                │
│                 })}                                                                                        │
│                 disabled={!fr.title || !fr.description}                                                    │
│                 className="text-xs text-[#666666] hover:text-[#000000] uppercase tracking-wide"            │
│               >                                                                                            │
│                 Suggest with AI                                                                            │
│               </button>                                                                                    │
│             </div>                                                                                         │
│                                                                                                            │
│             <FieldSuggestion                                                                               │
│               fieldKey={`fr_${index}_acceptance_criteria`}                                                 │
│               isLoading={requestSuggestion.isLoading}                                                      │
│               suggestion={state.suggestions.get(`fr_${index}_acceptance_criteria`)}                        │
│               onAccept={(value) => updateField('functionalReqs', index, 'acceptance_criteria', value)}     │
│             />                                                                                             │
│                                                                                                            │
│             {/* Manual input for acceptance criteria */}                                                   │
│             <textarea                                                                                      │
│               value={fr.acceptance_criteria?.join('\n') || ''}                                             │
│               onChange={(e) => updateField('functionalReqs', index, 'acceptance_criteria',                 │
│ e.target.value.split('\n'))}                                                                               │
│               rows={3}                                                                                     │
│               placeholder="One criterion per line"                                                         │
│               className="w-full px-0 py-2 border-b border-[#e5e5e5] resize-none"                           │
│             />                                                                                             │
│           </div>                                                                                           │
│         </div>                                                                                             │
│       ))}                                                                                                  │
│                                                                                                            │
│       <button                                                                                              │
│         onClick={addFR}                                                                                    │
│         className="text-sm text-[#666666] hover:text-[#000000] uppercase tracking-wide"                    │
│       >                                                                                                    │
│         + Add Another FR                                                                                   │
│       </button>                                                                                            │
│     </div>                                                                                                 │
│   );                                                                                                       │
│ };                                                                                                         │
│                                                                                                            │
│ 4.4 Field Suggestion Component                                                                             │
│                                                                                                            │
│ New File: /frontend/src/components/wizard/FieldSuggestion.tsx                                              │
│                                                                                                            │
│ interface FieldSuggestionProps {                                                                           │
│   fieldKey: string;                                                                                        │
│   isLoading: boolean;                                                                                      │
│   suggestion: any;                                                                                         │
│   onAccept: (value: any) => void;                                                                          │
│ }                                                                                                          │
│                                                                                                            │
│ export const FieldSuggestion: React.FC<FieldSuggestionProps> = ({                                          │
│   isLoading,                                                                                               │
│   suggestion,                                                                                              │
│   onAccept,                                                                                                │
│ }) => {                                                                                                    │
│   if (!isLoading && !suggestion) return null;                                                              │
│                                                                                                            │
│   if (isLoading) {                                                                                         │
│     return (                                                                                               │
│       <div className="my-3 px-4 py-3 bg-[#fafafa] border border-[#e5e5e5]">                                │
│         <div className="text-xs text-[#999999]">Generating suggestion...</div>                             │
│       </div>                                                                                               │
│     );                                                                                                     │
│   }                                                                                                        │
│                                                                                                            │
│   return (                                                                                                 │
│     <div className="my-3 px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] space-y-3">                        │
│       <div className="text-[10px] text-[#999999] uppercase tracking-wide">AI Suggestion</div>              │
│       <div className="text-sm text-[#666666]">                                                             │
│         {Array.isArray(suggestion) ? (                                                                     │
│           <ul className="list-disc ml-4 space-y-1">                                                        │
│             {suggestion.map((item, i) => <li key={i}>{item}</li>)}                                         │
│           </ul>                                                                                            │
│         ) : (                                                                                              │
│           <p>{suggestion}</p>                                                                              │
│         )}                                                                                                 │
│       </div>                                                                                               │
│       <div className="flex gap-2">                                                                         │
│         <button                                                                                            │
│           onClick={() => onAccept(suggestion)}                                                             │
│           className="px-4 py-1.5 bg-[#000000] text-white text-xs uppercase tracking-wide hover:opacity-90" │
│         >                                                                                                  │
│           Accept                                                                                           │
│         </button>                                                                                          │
│         <button                                                                                            │
│           onClick={() => {/* Clear suggestion */}}                                                         │
│           className="px-4 py-1.5 text-[#666666] text-xs uppercase tracking-wide hover:text-[#000000]"      │
│         >                                                                                                  │
│           Reject                                                                                           │
│         </button>                                                                                          │
│       </div>                                                                                               │
│     </div>                                                                                                 │
│   );                                                                                                       │
│ };                                                                                                         │
│                                                                                                            │
│ 4.5 Similar Components for NFR & TR Steps                                                                  │
│                                                                                                            │
│ New Files:                                                                                                 │
│ - /frontend/src/components/wizard/NonFunctionalReqStep.tsx - Similar structure to FR, fields: category*    │
│ (dropdown), description*, metric (with AI suggestion)                                                      │
│ - /frontend/src/components/wizard/TechnicalReqStep.tsx - Fields: technology*, description*, dependencies   │
│ (array with AI suggestion)                                                                                 │
│                                                                                                            │
│ ---                                                                                                        │
│ Phase 5: Pages & Navigation                                                                                │
│                                                                                                            │
│ 5.1 Projects Overview Page                                                                                 │
│                                                                                                            │
│ New File: /frontend/src/pages/ProjectsPage.tsx                                                             │
│                                                                                                            │
│ export const ProjectsPage: React.FC = () => {                                                              │
│   const { projects, isLoading } = useProjects();                                                           │
│   const navigate = useNavigate();                                                                          │
│                                                                                                            │
│   return (                                                                                                 │
│     <div className="h-full bg-white">                                                                      │
│       <div className="border-b border-[#e5e5e5] px-12 py-6">                                               │
│         <div className="flex items-center justify-between">                                                │
│           <div>                                                                                            │
│             <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">         │
│               Planning                                                                                     │
│             </div>                                                                                         │
│             <h1 className="text-2xl font-normal text-[#000000]">Projects</h1>                              │
│           </div>                                                                                           │
│           <button                                                                                          │
│             onClick={() => navigate('/app/projects/wizard')}                                               │
│             className="px-6 py-2 bg-[#000000] text-white text-sm uppercase tracking-wide"                  │
│           >                                                                                                │
│             + New Project                                                                                  │
│           </button>                                                                                        │
│         </div>                                                                                             │
│       </div>                                                                                               │
│                                                                                                            │
│       <div className="px-12 py-8">                                                                         │
│         {projects?.length === 0 ? (                                                                        │
│           <div className="py-16 text-center text-[#999999]">                                               │
│             No projects yet                                                                                │
│           </div>                                                                                           │
│         ) : (                                                                                              │
│           <div className="grid grid-cols-2 gap-6">                                                         │
│             {projects?.map(project => (                                                                    │
│               <div                                                                                         │
│                 key={project.id}                                                                           │
│                 onClick={() => navigate(`/app/projects/${project.id}`)}                                    │
│                 className="p-6 border border-[#e5e5e5] hover:border-[#000000] cursor-pointer               │
│ transition-colors"                                                                                         │
│               >                                                                                            │
│                 <h3 className="text-lg font-medium mb-2">{project.name}</h3>                               │
│                 <div className="text-xs text-[#999999] uppercase mb-3">                                    │
│                   {project.project_type} • {project.status}                                                │
│                 </div>                                                                                     │
│                 <div className="text-sm text-[#666666]">                                                   │
│                   {project.requirement_count} requirements                                                 │
│                 </div>                                                                                     │
│               </div>                                                                                       │
│             ))}                                                                                            │
│           </div>                                                                                           │
│         )}                                                                                                 │
│       </div>                                                                                               │
│     </div>                                                                                                 │
│   );                                                                                                       │
│ };                                                                                                         │
│                                                                                                            │
│ 5.2 Requirements Wizard Page                                                                               │
│                                                                                                            │
│ New File: /frontend/src/pages/RequirementsWizardPage.tsx                                                   │
│                                                                                                            │
│ export const RequirementsWizardPage: React.FC = () => {                                                    │
│   const { state } = useRequirementsWizard();                                                               │
│                                                                                                            │
│   return (                                                                                                 │
│     <WizardContainer>                                                                                      │
│       {state.currentStep === 1 && <ProjectStep />}                                                         │
│       {state.currentStep === 2 && <FunctionalReqStep />}                                                   │
│       {state.currentStep === 3 && <NonFunctionalReqStep />}                                                │
│       {state.currentStep === 4 && <TechnicalReqStep />}                                                    │
│     </WizardContainer>                                                                                     │
│   );                                                                                                       │
│ };                                                                                                         │
│                                                                                                            │
│ 5.3 Update Sidebar                                                                                         │
│                                                                                                            │
│ Modify: /frontend/src/components/Sidebar.tsx                                                               │
│                                                                                                            │
│ Add Projects section between Workspace and Settings:                                                       │
│                                                                                                            │
│ // Import folder icon                                                                                      │
│ import { Folder } from 'lucide-react';                                                                     │
│                                                                                                            │
│ // Add to expandedSection state type                                                                       │
│ const [expandedSection, setExpandedSection] = useState<'availability' | 'settings' | 'projects' |          │
│ null>(null);                                                                                               │
│                                                                                                            │
│ // Add Projects section in JSX                                                                             │
│ <div>                                                                                                      │
│   {!isCollapsed && (                                                                                       │
│     <div className="px-2 mb-2">                                                                            │
│       <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase">Planning</div>      │
│     </div>                                                                                                 │
│   )}                                                                                                       │
│   <div className="space-y-0.5">                                                                            │
│     <button                                                                                                │
│       onClick={() => toggleSection('projects')}                                                            │
│       className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded transition-colors   │
│ focus:outline-none ${                                                                                      │
│         location.pathname.startsWith('/app/projects')                                                      │
│           ? 'text-[#000000] font-medium'                                                                   │
│           : 'text-[#666666] hover:text-[#000000]'                                                          │
│       }`}                                                                                                  │
│     >                                                                                                      │
│       <div className="flex items-center gap-3">                                                            │
│         <div className="w-5 h-5 flex items-center justify-center">                                         │
│           <Folder size={18} className="text-current" />                                                    │
│         </div>                                                                                             │
│         {!isCollapsed && <span>PROJECTS</span>}                                                            │
│       </div>                                                                                               │
│     </button>                                                                                              │
│   </div>                                                                                                   │
│ </div>                                                                                                     │
│                                                                                                            │
│ // Add to secondary sidebar                                                                                │
│ {expandedSection === 'projects' && (                                                                       │
│   <div className="flex-1 py-6 px-4">                                                                       │
│     <div className="px-2 mb-4">                                                                            │
│       <div className="text-[10px] text-[#999999] font-medium tracking-wider uppercase mb-1">PROJECTS</div> │
│       <div className="text-xs text-[#666666]">Manage projects & requirements</div>                         │
│     </div>                                                                                                 │
│     <div className="space-y-1">                                                                            │
│       <Link                                                                                                │
│         to="/app/projects"                                                                                 │
│         onClick={() => setExpandedSection(null)}                                                           │
│         className={`block px-3 py-2.5 text-sm rounded transition-colors ${                                 │
│           isActive('/app/projects') ? 'text-[#000000] font-medium' : 'text-[#666666] hover:text-[#000000]' │
│         }`}                                                                                                │
│       >                                                                                                    │
│         All Projects                                                                                       │
│       </Link>                                                                                              │
│       <Link                                                                                                │
│         to="/app/projects/wizard"                                                                          │
│         onClick={() => setExpandedSection(null)}                                                           │
│         className={`block px-3 py-2.5 text-sm rounded transition-colors ${                                 │
│           isActive('/app/projects/wizard') ? 'text-[#000000] font-medium' : 'text-[#666666]                │
│ hover:text-[#000000]'                                                                                      │
│         }`}                                                                                                │
│       >                                                                                                    │
│         Requirements Collection                                                                            │
│       </Link>                                                                                              │
│     </div>                                                                                                 │
│   </div>                                                                                                   │
│ )}                                                                                                         │
│                                                                                                            │
│ 5.4 Update App Routes                                                                                      │
│                                                                                                            │
│ Modify: /frontend/src/App.tsx                                                                              │
│                                                                                                            │
│ Add routes:                                                                                                │
│ <Route path="/projects" element={<ProjectsPage />} />                                                      │
│ <Route path="/projects/wizard" element={<RequirementsWizardPage />} />                                     │
│ <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />                                     │
│                                                                                                            │
│ ---                                                                                                        │
│ Implementation Sequence                                                                                    │
│                                                                                                            │
│ Week 1: Backend Foundation                                                                                 │
│                                                                                                            │
│ Day 1-2: Database & Models                                                                                 │
│ 1. Create migration 010_add_project_fields_and_requirements_fk.sql                                         │
│ 2. Run migration on dev database                                                                           │
│ 3. Update project.py model (add fields, enum, relationship)                                                │
│ 4. Update requirement.py model (add project_id FK)                                                         │
│ 5. Test models in Python shell                                                                             │
│                                                                                                            │
│ Day 2-3: Project API                                                                                       │
│ 6. Create project_routes.py with CRUD endpoints                                                            │
│ 7. Create Pydantic schemas                                                                                 │
│ 8. Test endpoints with Postman                                                                             │
│ 9. Register routes in main.py                                                                              │
│                                                                                                            │
│ Day 3-4: Field Suggestion Service                                                                          │
│ 10. Create field_suggestion_service.py                                                                     │
│ 11. Create prompt template field_suggestions_v1.txt                                                        │
│ 12. Add service to dependencies.py                                                                         │
│ 13. Add /requirements/suggest-field endpoint to requirements_routes                                        │
│ 14. Test suggestion API with various contexts                                                              │
│                                                                                                            │
│ Week 2: Frontend Components                                                                                │
│                                                                                                            │
│ Day 5-6: Hooks & State                                                                                     │
│ 15. Create useProjects.ts hook                                                                             │
│ 16. Create useRequirementsWizard.ts hook with wizard state                                                 │
│ 17. Test hooks in isolation                                                                                │
│                                                                                                            │
│ Day 6-8: Wizard Components                                                                                 │
│ 18. Create WizardContainer.tsx (navigation shell)                                                          │
│ 19. Create ProjectStep.tsx (Step 1)                                                                        │
│ 20. Create FunctionalReqStep.tsx (Step 2)                                                                  │
│ 21. Create NonFunctionalReqStep.tsx (Step 3)                                                               │
│ 22. Create TechnicalReqStep.tsx (Step 4)                                                                   │
│ 23. Create FieldSuggestion.tsx (reusable suggestion UI)                                                    │
│ 24. Test wizard flow with mock data                                                                        │
│                                                                                                            │
│ Day 8-9: Pages & Navigation                                                                                │
│ 25. Create ProjectsPage.tsx                                                                                │
│ 26. Create RequirementsWizardPage.tsx                                                                      │
│ 27. Update Sidebar.tsx (add Projects section)                                                              │
│ 28. Update App.tsx (add routes)                                                                            │
│ 29. Test navigation end-to-end                                                                             │
│                                                                                                            │
│ Week 3: Integration & Polish                                                                               │
│                                                                                                            │
│ Day 10-11: Integration                                                                                     │
│ 30. Connect wizard to real API                                                                             │
│ 31. Test project creation flow                                                                             │
│ 32. Test requirements creation flow                                                                        │
│ 33. Test LLM suggestion flow                                                                               │
│ 34. Add error handling and validation                                                                      │
│                                                                                                            │
│ Day 11-12: Polish & Testing                                                                                │
│ 35. Add loading states                                                                                     │
│ 36. Add form validation messages                                                                           │
│ 37. Polish UI (spacing, transitions)                                                                       │
│ 38. Test on different screen sizes                                                                         │
│ 39. Test edge cases (empty forms, network errors)                                                          │
│                                                                                                            │
│ Day 12-13: Documentation                                                                                   │
│ 40. Update README with Projects section                                                                    │
│ 41. Document API endpoints                                                                                 │
│ 42. Create user guide for wizard                                                                           │
│                                                                                                            │
│ ---                                                                                                        │
│ Critical Files Reference                                                                                   │
│                                                                                                            │
│ Backend:                                                                                                   │
│ - /backend/app/models/project.py - Add project_type, description, client, requirements relationship        │
│ - /backend/app/models/requirement.py - Add project_id FK, project relationship                             │
│ - /backend/app/api/project_routes.py - NEW: CRUD endpoints for projects                                    │
│ - /backend/app/services/field_suggestion_service.py - NEW: LLM field suggestions                           │
│ - /backend/app/api/requirements_routes.py - ADD: wizard endpoint, suggest-field endpoint                   │
│ - /backend/app/main.py - Register project_routes                                                           │
│ - /backend/db/migrations/010_add_project_fields_and_requirements_fk.sql - NEW: Migration                   │
│                                                                                                            │
│ Frontend:                                                                                                  │
│ - /frontend/src/hooks/useProjects.ts - NEW: React Query hook for projects                                  │
│ - /frontend/src/hooks/useRequirementsWizard.ts - NEW: Wizard state management                              │
│ - /frontend/src/components/wizard/WizardContainer.tsx - NEW: Wizard shell                                  │
│ - /frontend/src/components/wizard/ProjectStep.tsx - NEW: Step 1                                            │
│ - /frontend/src/components/wizard/FunctionalReqStep.tsx - NEW: Step 2                                      │
│ - /frontend/src/components/wizard/NonFunctionalReqStep.tsx - NEW: Step 3                                   │
│ - /frontend/src/components/wizard/TechnicalReqStep.tsx - NEW: Step 4                                       │
│ - /frontend/src/components/wizard/FieldSuggestion.tsx - NEW: AI suggestion UI                              │
│ - /frontend/src/pages/ProjectsPage.tsx - NEW: Projects overview                                            │
│ - /frontend/src/pages/RequirementsWizardPage.tsx - NEW: Wizard page                                        │
│ - /frontend/src/components/Sidebar.tsx - MODIFY: Add Projects section                                      │
│ - /frontend/src/App.tsx - MODIFY: Add routes                                                               │
│                                                                                                            │
│ ---                                                                                                        │
│ Design Decisions                                                                                           │
│                                                                                                            │
│ Multi-Step Wizard (vs Single Page)                                                                         │
│                                                                                                            │
│ Decision: Multi-step wizard with 4 steps                                                                   │
│ Rationale: Reduces cognitive load, allows progressive disclosure, better mobile UX, follows modern         │
│ patterns                                                                                                   │
│                                                                                                            │
│ On-Demand LLM Suggestions (vs Automatic)                                                                   │
│                                                                                                            │
│ Decision: User clicks "Suggest with AI" button                                                             │
│ Rationale: User control, cost efficiency, clear loading state, avoids overwhelming users                   │
│                                                                                                            │
│ Optional Project Association                                                                               │
│                                                                                                            │
│ Decision: Requirement.project_id is nullable                                                               │
│ Rationale: Backwards compatibility with existing requirements, flexibility for ad-hoc requirements         │
│                                                                                                            │
│ JSONB Storage for Requirements                                                                             │
│                                                                                                            │
│ Decision: Keep functional_reqs, non_functional_reqs, technical_reqs as JSONB                               │
│ Rationale: Consistent with existing pattern, flexible schema, easy wizard submission                       │
│                                                                                                            │
│ Field-Level Suggestions                                                                                    │
│                                                                                                            │
│ Decision: Suggest specific fields (acceptance criteria, metrics, dependencies) vs full requirement         │
│ Rationale: More precise, faster, gives users control over structure, better context usage                  │
│                                                                                                            │
│ ---                                                                                                        │
│ Verification Steps                                                                                         │
│                                                                                                            │
│ Backend Testing                                                                                            │
│                                                                                                            │
│ - Run migration successfully                                                                               │
│ - Create project via API                                                                                   │
│ - List projects with filters                                                                               │
│ - Get project by ID                                                                                        │
│ - Create requirements with project_id via wizard endpoint                                                  │
│ - Get field suggestion for FR acceptance criteria                                                          │
│ - Get field suggestion for NFR metric                                                                      │
│ - Get field suggestion for TR dependencies                                                                 │
│                                                                                                            │
│ Frontend Testing                                                                                           │
│                                                                                                            │
│ - Projects page loads and displays projects                                                                │
│ - Click "New Project" opens wizard                                                                         │
│ - Step 1: Select/create project works                                                                      │
│ - Step 2: Add/remove FR works                                                                              │
│ - Step 3: Add/remove NFR works                                                                             │
│ - Step 4: Add/remove TR works                                                                              │
│ - "Suggest with AI" button works                                                                           │
│ - Accept/reject suggestion works                                                                           │
│ - Navigation (Back/Next) preserves state                                                                   │
│ - Final submission creates project + requirements                                                          │
│ - Success redirects to projects page                                                                       │
│                                                                                                            │
│ Integration Testing                                                                                        │
│                                                                                                            │
│ - Complete wizard flow with new project                                                                    │
│ - Complete wizard flow with existing project                                                               │
│ - Wizard with multiple FRs/NFRs/TRs                                                                        │
│ - LLM suggestions with various contexts                                                                    │
│ - Form validation (required fields)                                                                        │
│ - Error handling (network failure, API errors)                                                             │
│                                                                                                            │
│ ---                                                                                                        │
│ Future Enhancements (Post-MVP)                                                                             │
│                                                                                                            │
│ 1. Edit Mode - Edit existing requirements through wizard                                                   │
│ 2. Draft Saving - Save wizard progress as draft                                                            │
│ 3. Templates - Pre-filled templates for common project types                                               │
│ 4. Bulk Import - Import requirements from CSV/JSON                                                         │
│ 5. AI Chat Interface - Conversational requirement refinement                                               │
│ 6. Export to PDF/Word - Export requirements document                                                       │
│ 7. Requirement Dependencies - Link requirements together                                                   │
│ 8. Version Control - Track requirement changes                                                             │
│ 9. Team Comments - Collaboration on requirements                                                           │
│ 10. Smart Defaults - Learn from past projects    

