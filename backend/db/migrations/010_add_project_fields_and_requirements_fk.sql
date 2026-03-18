-- Migration: Add project fields and requirements foreign key
-- Description: Extends projects table with new fields and creates relationship with requirements

-- Add project type enum
CREATE TYPE project_type AS ENUM ('web_app', 'mobile_app', 'desktop', 'api', 'other');

-- Add columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type project_type;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client VARCHAR(255);

-- Add project_id foreign key to requirements table (nullable for backwards compatibility)
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_requirements_project_id ON requirements(project_id);
