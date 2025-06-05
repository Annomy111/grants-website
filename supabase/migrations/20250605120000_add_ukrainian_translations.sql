-- Add Ukrainian translation columns to grants table
ALTER TABLE grants 
ADD COLUMN IF NOT EXISTS grant_name_uk TEXT,
ADD COLUMN IF NOT EXISTS funding_organization_uk TEXT,
ADD COLUMN IF NOT EXISTS country_region_uk TEXT,
ADD COLUMN IF NOT EXISTS eligibility_criteria_uk TEXT,
ADD COLUMN IF NOT EXISTS focus_areas_uk TEXT,
ADD COLUMN IF NOT EXISTS grant_amount_uk TEXT,
ADD COLUMN IF NOT EXISTS duration_uk TEXT,
ADD COLUMN IF NOT EXISTS application_procedure_uk TEXT,
ADD COLUMN IF NOT EXISTS required_documents_uk TEXT,
ADD COLUMN IF NOT EXISTS evaluation_criteria_uk TEXT,
ADD COLUMN IF NOT EXISTS additional_requirements_uk TEXT,
ADD COLUMN IF NOT EXISTS reporting_requirements_uk TEXT,
ADD COLUMN IF NOT EXISTS detailed_description_uk TEXT;

-- Add comments for Ukrainian columns
COMMENT ON COLUMN grants.grant_name_uk IS 'Ukrainian translation of grant name';
COMMENT ON COLUMN grants.funding_organization_uk IS 'Ukrainian translation of funding organization';
COMMENT ON COLUMN grants.country_region_uk IS 'Ukrainian translation of country/region';
COMMENT ON COLUMN grants.eligibility_criteria_uk IS 'Ukrainian translation of eligibility criteria';
COMMENT ON COLUMN grants.focus_areas_uk IS 'Ukrainian translation of focus areas';
COMMENT ON COLUMN grants.grant_amount_uk IS 'Ukrainian translation of grant amount';
COMMENT ON COLUMN grants.duration_uk IS 'Ukrainian translation of duration';
COMMENT ON COLUMN grants.application_procedure_uk IS 'Ukrainian translation of application procedure';
COMMENT ON COLUMN grants.required_documents_uk IS 'Ukrainian translation of required documents';
COMMENT ON COLUMN grants.evaluation_criteria_uk IS 'Ukrainian translation of evaluation criteria';
COMMENT ON COLUMN grants.additional_requirements_uk IS 'Ukrainian translation of additional requirements';
COMMENT ON COLUMN grants.reporting_requirements_uk IS 'Ukrainian translation of reporting requirements';
COMMENT ON COLUMN grants.detailed_description_uk IS 'Ukrainian translation of detailed description';