-- Add missing columns to grants table for complete data structure
ALTER TABLE grants 
ADD COLUMN IF NOT EXISTS grant_size_min NUMERIC,
ADD COLUMN IF NOT EXISTS grant_size_max NUMERIC,
ADD COLUMN IF NOT EXISTS geographic_focus TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS type VARCHAR(50),
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_uk TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS application_url TEXT,
ADD COLUMN IF NOT EXISTS deadline TEXT,
ADD COLUMN IF NOT EXISTS website_status TEXT,
ADD COLUMN IF NOT EXISTS focus_areas_en TEXT,
ADD COLUMN IF NOT EXISTS focus_areas_uk TEXT,
ADD COLUMN IF NOT EXISTS eligibility_criteria_en TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_grants_geographic_focus ON grants(geographic_focus);
CREATE INDEX IF NOT EXISTS idx_grants_type ON grants(type);
CREATE INDEX IF NOT EXISTS idx_grants_grant_size ON grants(grant_size_min, grant_size_max);
CREATE INDEX IF NOT EXISTS idx_grants_website_status ON grants(website_status);

-- Add comments for documentation
COMMENT ON COLUMN grants.grant_size_min IS 'Minimum grant amount in EUR';
COMMENT ON COLUMN grants.grant_size_max IS 'Maximum grant amount in EUR';
COMMENT ON COLUMN grants.geographic_focus IS 'Geographic focus of the grant (e.g., Ukraine, Europe, Global)';
COMMENT ON COLUMN grants.logo_url IS 'URL to organization logo';
COMMENT ON COLUMN grants.type IS 'Type of grant (e.g., Project, Program, Emergency, Institutional)';
COMMENT ON COLUMN grants.description_en IS 'English description of the grant';
COMMENT ON COLUMN grants.description_uk IS 'Ukrainian description of the grant';
COMMENT ON COLUMN grants.website IS 'Organization main website';
COMMENT ON COLUMN grants.application_url IS 'Direct link to application page';
COMMENT ON COLUMN grants.deadline IS 'Application deadline';
COMMENT ON COLUMN grants.website_status IS 'Status of website link (active, broken, etc.)';
COMMENT ON COLUMN grants.focus_areas_en IS 'English version of focus areas';
COMMENT ON COLUMN grants.focus_areas_uk IS 'Ukrainian version of focus areas';
COMMENT ON COLUMN grants.eligibility_criteria_en IS 'English version of eligibility criteria';

-- Migrate existing data to new columns where applicable
UPDATE grants 
SET description_en = COALESCE(detailed_description, ''),
    description_uk = COALESCE(detailed_description_uk, ''),
    focus_areas_en = COALESCE(focus_areas, ''),
    eligibility_criteria_en = COALESCE(eligibility_criteria, ''),
    deadline = COALESCE(application_deadline, 'Rolling')
WHERE description_en IS NULL OR focus_areas_en IS NULL OR eligibility_criteria_en IS NULL;