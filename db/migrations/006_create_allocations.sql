-- Migration: Create allocations and related tables
-- Created: 2026-03-16

CREATE TABLE allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    confidence_score FLOAT NOT NULL DEFAULT 0.5,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_allocations_task_id ON allocations(task_id);
CREATE INDEX idx_allocations_user_id ON allocations(user_id);

CREATE TABLE velocity_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    avg_velocity_multiplier FLOAT NOT NULL DEFAULT 1.0,
    confidence FLOAT NOT NULL DEFAULT 0.0,
    last_updated TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_velocity_models_user_id ON velocity_models(user_id);
CREATE INDEX idx_velocity_models_skill_id ON velocity_models(skill_id);

CREATE TRIGGER update_allocations_updated_at
    BEFORE UPDATE ON allocations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_velocity_models_updated_at
    BEFORE UPDATE ON velocity_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
