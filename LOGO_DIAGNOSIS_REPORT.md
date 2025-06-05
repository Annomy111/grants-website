# Organization Logo Display Diagnosis Report

**Date:** June 5, 2025  
**URL Tested:** https://civil-society-grants-database.netlify.app/grants  
**Diagnosis by:** Puppeteer Debug Agent 1

## Executive Summary

The organization logos are not displaying for most grants on the live website. Out of 97 grant cards analyzed:
- Only **11 grants (11.3%)** have logo containers rendered
- **86 grants (88.7%)** are missing logo containers entirely
- 1 logo is hidden by CSS despite being loaded successfully

## Key Findings

### 1. ✅ Infrastructure is Working
- `organization-logos.json` is being loaded successfully (HTTP 200)
- Logo image files are accessible and loading correctly
- No 404 errors for the logos that are attempted to be displayed

### 2. ❌ Limited Logo Coverage
The `organization-logos.json` file only contains mappings for 15 organizations:
- European Union
- UN Women
- Council of Europe
- USAID
- Open Society Foundations
- National Endowment for Democracy
- GIZ/German Government
- British Embassy Kyiv
- Visegrad Fund
- Stop TB Partnership
- Nordic Council of Ministers
- UNDP/Denmark
- SIDA/NORAD
- German Marshall Fund
- European Endowment for Democracy

### 3. 🔴 Missing Organizations
**71 unique organizations** in the grants database have no logo mappings, including:
- MacArthur Foundation
- V-Dem Institute
- Mama Cash
- European Commission
- Ministry of Foreign Affairs Latvia
- Austrian Development Agency
- Czech Development Agency
- And 64 others...

### 4. ⚠️ CSS Issue
One logo (UN Women) is being hidden by CSS with `display: none`. This is likely due to an error handler in the img tag:
```javascript
onError={(e) => { e.target.style.display = 'none'; }}
```

## Technical Analysis

### Logo Display Logic
The application uses the following logic in `GrantsPage.js`:

1. Loads `organization-logos.json` on page load
2. For each grant, creates a slug from the organization name
3. Checks if the slug exists in the logos JSON
4. Only renders a logo container if a mapping is found
5. If no mapping exists, no logo container is created at all

### Code Location
File: `/client/src/pages/GrantsPage.js`
- Lines 193-204: `getOrganizationLogo` function
- Lines 615-624: Logo container rendering logic

## Root Cause

The primary issue is **incomplete logo mapping data**. The `organization-logos.json` file only contains 15 organization mappings, while the grants database contains over 70 unique organizations.

## Recommendations

### Immediate Actions

1. **Add Missing Logo Mappings**
   - Update `organization-logos.json` with entries for all 71 missing organizations
   - Ensure logo files exist in `/public/images/logos/` directory

2. **Fix CSS Hidden Logo**
   - Remove or modify the `onError` handler that hides failed images
   - Consider showing a placeholder image instead

3. **Verify Logo Files**
   - Check that all logo files referenced in the JSON actually exist
   - Ensure correct file extensions (.svg, .png, etc.)

### Long-term Improvements

1. **Fallback Logo**
   - Implement a default/placeholder logo for organizations without custom logos
   - This ensures visual consistency even when logos are missing

2. **Logo Upload Feature**
   - Add admin functionality to upload organization logos
   - Automatically update the logos JSON when new organizations are added

3. **Error Logging**
   - Log when logo mappings are missing
   - Track which organizations need logos added

## Screenshots Captured

1. **Full Page Screenshot**: `logo-diagnosis-full-1749121974163.png`
2. **Problem Card Screenshot**: `logo-issue-card-1749121976941.png`

## Network Analysis

- Total requests: 250+
- Logo-related requests: 11
- Failed logo requests: 0
- All logo files that were requested loaded successfully

## Conclusion

The logo display system is functioning correctly from a technical standpoint. The issue is simply that most organizations don't have logo mappings in the `organization-logos.json` file. Adding the missing mappings and ensuring the corresponding logo files exist will resolve the display issues for the majority of grants.