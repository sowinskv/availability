-- Migration: Create availability table
-- Created: 2026-03-16

CREATE TYPE availability_status AS ENUM ('pending', 'approved', 'declined');
CREATE TYPE availability_type AS ENUM ('vacation', 'sick', 'partial', 'available');

CREATE TABLE availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hours_per_day FLOAT NOT NULL DEFAULT 8.0,
    status availability_status NOT NULL DEFAULT 'pending',
    type availability_type NOT NULL DEFAULT 'available',
    voice_recording_url VARCHAR(500),
    transcription_text TEXT,
    transcription_confidence FLOAT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_availabilities_user_id ON availabilities(user_id);
CREATE INDEX idx_availabilities_start_date ON availabilities(start_date);
CREATE INDEX idx_availabilities_end_date ON availabilities(end_date);
CREATE INDEX idx_availabilities_status ON availabilities(status);

CREATE TRIGGER update_availabilities_updated_at
    BEFORE UPDATE ON availabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
