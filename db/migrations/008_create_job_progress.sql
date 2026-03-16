-- Migration: Create job_progress table
-- Created: 2026-03-16

CREATE TABLE job_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR(64) NOT NULL UNIQUE,
    job_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_progress_job_id ON job_progress(job_id);
CREATE INDEX idx_job_progress_job_type ON job_progress(job_type);
CREATE INDEX idx_job_progress_status ON job_progress(status);

CREATE TRIGGER update_job_progress_updated_at
    BEFORE UPDATE ON job_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
