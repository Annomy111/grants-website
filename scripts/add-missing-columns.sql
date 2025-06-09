-- Add missing columns to grants table
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
ADD COLUMN IF NOT EXISTS deadline TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_grants_geographic_focus ON grants(geographic_focus);
CREATE INDEX IF NOT EXISTS idx_grants_type ON grants(type);
CREATE INDEX IF NOT EXISTS idx_grants_grant_size ON grants(grant_size_min, grant_size_max);

-- Add comments
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