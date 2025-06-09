# Import Missing Grants Script

## Overview
This script (`import-missing-grants.js`) imports grants that were identified as missing in the grant import verification report. These grants were found in the RTF document but were not present in the database.

## Missing Grants Being Imported

1. **Embassy of Finland's Fund for Local Cooperation** (EXPIRED)
   - Focus: Good governance, rule of law, human rights, gender equality
   - Amount: €75,000 - €100,000

2. **US Embassy's Democracy Small Grants Program** (EXPIRED)
   - Focus: Democracy promotion, human rights, veteran support
   - Amount: $5,000 - $24,000

3. **UNEP Hazardous Waste Management Initiative** (ACTIVE)
   - Focus: Environmental recovery, hazardous waste management
   - Partner: Japan

4. **Pact Institutional and Project Grants** (EXPIRED)
   - Focus: Civil society strengthening, organizational development
   - Amount: Up to $100,000

5. **Ukrainian Women's Fund** (ACTIVE)
   - Focus: Women's rights, gender equality
   - Amount: Small grants up to ₴150,000

6. **Nova Ukraine Emergency Bridge Financing** (ACTIVE)
   - Focus: Emergency humanitarian assistance
   - Type: Rolling basis

7. **SPIRIT Program (UK)** (ACTIVE)
   - Focus: Social recovery, community resilience
   - Funder: UK Government

8. **World Bank Recovery Programs** (ACTIVE)
   - Focus: Infrastructure reconstruction, economic recovery
   - Type: Large-scale funding

9. **German Marshall Fund U3R Program** (ACTIVE)
   - Focus: Relief, Resilience, Recovery
   - Amount: Up to $25,000
   - Note: This is in addition to other GMF programs already in database

## Usage

```bash
# Make sure environment variables are set
export REACT_APP_SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the import
node scripts/import-missing-grants.js
```

## Features

- Automatically extracts program type from grant names
- Converts grant amounts to EUR with currency detection
- Generates searchable keywords
- Includes all required fields from latest database schema
- Supports Ukrainian translation fields (to be populated later)
- Verifies each import and reports status

## Notes

- Some grants are marked as EXPIRED based on the RTF document
- Ukrainian translations will need to be added in a separate process
- Logo URLs will need to be fetched separately using the logo fetching scripts
- The German Marshall Fund U3R program is a specific program different from other GMF grants in the database