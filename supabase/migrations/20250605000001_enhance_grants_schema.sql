-- Enhance grants table with detailed fields
-- Migration to add missing detailed information fields

-- First, let's add the new detailed fields
ALTER TABLE grants 
ADD COLUMN IF NOT EXISTS detailed_description TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS application_procedure TEXT,
ADD COLUMN IF NOT EXISTS required_documents TEXT,
ADD COLUMN IF NOT EXISTS additional_requirements TEXT,
ADD COLUMN IF NOT EXISTS program_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS target_beneficiaries TEXT,
ADD COLUMN IF NOT EXISTS geographical_scope TEXT,
ADD COLUMN IF NOT EXISTS language_requirements TEXT,
ADD COLUMN IF NOT EXISTS partnership_requirements BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS renewable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS application_fee TEXT,
ADD COLUMN IF NOT EXISTS reporting_requirements TEXT,
ADD COLUMN IF NOT EXISTS evaluation_criteria TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for search optimization
CREATE INDEX IF NOT EXISTS idx_grants_program_type ON grants(program_type);
CREATE INDEX IF NOT EXISTS idx_grants_keywords ON grants USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_grants_target_beneficiaries ON grants USING GIN(to_tsvector('english', target_beneficiaries));
CREATE INDEX IF NOT EXISTS idx_grants_detailed_description ON grants USING GIN(to_tsvector('english', detailed_description));
CREATE INDEX IF NOT EXISTS idx_grants_geographical_scope ON grants(geographical_scope);

-- Add trigger to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_grants_modified_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_grants_modtime ON grants;
CREATE TRIGGER update_grants_modtime 
    BEFORE UPDATE ON grants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_grants_modified_time();

-- Add comments for documentation
COMMENT ON COLUMN grants.detailed_description IS 'Extended detailed description of the grant program';
COMMENT ON COLUMN grants.contact_email IS 'Primary contact email for inquiries';
COMMENT ON COLUMN grants.contact_phone IS 'Contact phone number';
COMMENT ON COLUMN grants.contact_person IS 'Named contact person';
COMMENT ON COLUMN grants.application_procedure IS 'Step-by-step application process';
COMMENT ON COLUMN grants.required_documents IS 'List of required documents for application';
COMMENT ON COLUMN grants.additional_requirements IS 'Additional specific requirements';
COMMENT ON COLUMN grants.program_type IS 'Type of grant program (e.g., Fellowship, Project Grant, etc.)';
COMMENT ON COLUMN grants.target_beneficiaries IS 'Intended beneficiaries of the grant';
COMMENT ON COLUMN grants.geographical_scope IS 'Geographic limitations or focus areas';
COMMENT ON COLUMN grants.language_requirements IS 'Language requirements for applications';
COMMENT ON COLUMN grants.partnership_requirements IS 'Whether partnerships are required';
COMMENT ON COLUMN grants.renewable IS 'Whether the grant can be renewed';
COMMENT ON COLUMN grants.application_fee IS 'Application fee information';
COMMENT ON COLUMN grants.reporting_requirements IS 'Required reporting and compliance';
COMMENT ON COLUMN grants.evaluation_criteria IS 'How applications are evaluated';
COMMENT ON COLUMN grants.keywords IS 'Searchable keywords for the grant';
COMMENT ON COLUMN grants.last_updated IS 'Timestamp of last update to this record';