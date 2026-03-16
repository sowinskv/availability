-- Migration: Create requirements table
-- Created: 2026-03-16

CREATE TYPE requirement_status AS ENUM ('draft', 'review', 'approved');
CREATE TYPE requirement_source AS ENUM ('voice', 'manual', 'imported');

CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    author_id UUID NOT NULL REFERENCES users(id),
    status requirement_status NOT NULL DEFAULT 'draft',
    source requirement_source NOT NULL DEFAULT 'manual',
    functional_reqs JSONB DEFAULT '{}',
    non_functional_reqs JSONB DEFAULT '{}',
    technical_reqs JSONB DEFAULT '{}',
    audio_url VARCHAR(500),
    transcript TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requirements_author_id ON requirements(author_id);
CREATE INDEX idx_requirements_status ON requirements(status);

CREATE TRIGGER update_requirements_updated_at
    BEFORE UPDATE ON requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
