# Export and Reporting Features Documentation

## Overview

This document outlines the export and reporting features implemented in the Civil Society Grants Database application.

## Features Implemented

### 1. CSV Export in Admin Grants Page

**Location**: `/admin/grants`

**Features**:
- Export all grants or filtered grants to CSV format
- Includes all grant fields with proper escaping
- Filename includes current date for versioning
- Respects current search/filter results

**Usage**:
1. Navigate to Admin Dashboard > Grants
2. Optionally filter grants using the search box
3. Click the "Export CSV" button (green button with download icon)
4. CSV file will download automatically

**Fields Exported**:
- ID, Grant Name, Organization, Geographic Focus
- Focus Areas (EN/UK), Description (EN/UK)
- Eligibility (EN/UK), Grant Type
- Grant Size Min/Max, Deadline
- Website, Application URL, Contact Info
- Created At, Updated At

### 2. PDF Export for Grant Details

**Location**: Individual grant detail pages (`/grants/:id`)

**Features**:
- Print-friendly PDF generation using browser print functionality
- Optimized styles for printing (removes navigation, adjusts colors)
- Includes all grant information in a clean format
- Adds generation date to printed document

**Usage**:
1. Navigate to any grant detail page
2. Click the "Export PDF" button (top right)
3. Browser print dialog will open
4. Select "Save as PDF" as destination
5. Save the PDF file

### 3. Analytics Dashboard with Bulk Export

**Location**: `/admin/analytics`

**Features**:
- Comprehensive analytics overview
- Multiple export options:
  - Analytics Report (JSON format)
  - All Grants CSV
  - Upcoming Deadlines CSV (next 30 days)
  - High-Value Grants CSV (€100,000+)

**Analytics Displayed**:
- Total grants count
- Total funding available
- Average grant size
- Grants by geographic focus (top 10)
- Upcoming deadlines (next 30 days)
- Grant distribution insights

**Export Options**:

1. **Analytics Report (JSON)**:
   - Complete analytics summary
   - Grant distribution data
   - Upcoming deadlines list
   - Machine-readable format for further processing

2. **All Grants CSV**:
   - Complete database export
   - All active grants with key fields

3. **Upcoming Deadlines CSV**:
   - Grants with deadlines in next 30 days
   - Sorted by deadline date
   - Includes all relevant grant information

4. **High-Value Grants CSV**:
   - Grants with maximum value ≥ €100,000
   - Useful for organizations seeking larger funding

### 4. Email Digest Feature (Implementation Guide)

**Location**: `/client/netlify/functions/email-digest-template.js`

**Status**: Template/Guide provided for future implementation

**Proposed Features**:
- Weekly/Monthly email digests
- Personalized based on user preferences
- New grants notifications
- Deadline reminders
- Automated scheduling

**Implementation Requirements**:
1. Email service setup (SendGrid/AWS SES)
2. Database tables for subscriptions
3. Scheduled function triggers
4. Email templates
5. Preference management UI

## Security Considerations

1. **Permission Checks**:
   - All export features require admin authentication
   - Exports respect user role permissions
   - No sensitive system data is exposed

2. **Data Sanitization**:
   - CSV exports properly escape quotes and special characters
   - File names are sanitized to prevent path traversal
   - JSON exports are properly formatted

3. **Rate Limiting**:
   - Consider implementing rate limits for bulk exports
   - Prevent abuse of export functionality

## Performance Considerations

1. **Large Dataset Handling**:
   - Current implementation loads all data into memory
   - For larger datasets (10,000+ grants), consider:
     - Streaming CSV generation
     - Pagination for exports
     - Background job processing

2. **Browser Limitations**:
   - CSV exports are limited by browser memory
   - Very large exports may require server-side generation

## Future Enhancements

1. **Scheduled Reports**:
   - Automated weekly/monthly reports
   - Email delivery of reports
   - Customizable report templates

2. **Advanced Filtering**:
   - Export with complex filter combinations
   - Save filter presets for regular exports
   - Export specific date ranges

3. **Format Options**:
   - Excel format support
   - Direct PDF generation (server-side)
   - XML export for data interchange

4. **Audit Trail**:
   - Log all export activities
   - Track who exported what and when
   - Compliance reporting features

## API Endpoints

### Grants Export (via Admin API)
- **Endpoint**: `/.netlify/functions/grants`
- **Method**: GET
- **Headers**: Authorization required
- **Response**: JSON array of grants

### Future Email Digest Endpoint
- **Endpoint**: `/.netlify/functions/email-digest`
- **Method**: POST
- **Body**: Subscription preferences
- **Response**: Success/failure status

## Testing Recommendations

1. **Export Functionality**:
   - Test with various data sizes
   - Verify special character handling
   - Check date format consistency

2. **Performance Testing**:
   - Measure export time for different dataset sizes
   - Monitor memory usage during exports
   - Test concurrent export requests

3. **Cross-Browser Testing**:
   - Verify PDF export works in all major browsers
   - Test CSV download functionality
   - Check file naming compatibility

## Troubleshooting

### Common Issues:

1. **CSV Not Downloading**:
   - Check browser download settings
   - Verify popup blockers aren't interfering
   - Ensure proper MIME type is set

2. **PDF Export Styling Issues**:
   - Clear browser cache
   - Check print preview before saving
   - Verify CSS media queries are correct

3. **Large Export Timeouts**:
   - Consider implementing progress indicators
   - Add chunked processing for large datasets
   - Increase function timeout limits if needed

## Code Examples

### Adding a New Export Format
```javascript
const exportToExcel = (data) => {
  // Implementation would require xlsx library
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Grants");
  XLSX.writeFile(workbook, `grants_${new Date().toISOString().split('T')[0]}.xlsx`);
};
```

### Custom Filter Export
```javascript
const exportCustomFiltered = (grants, filters) => {
  const filtered = grants.filter(grant => {
    return filters.every(filter => {
      switch(filter.type) {
        case 'deadline':
          return new Date(grant.deadline) <= new Date(filter.value);
        case 'amount':
          return grant.grant_size_max >= filter.value;
        case 'country':
          return grant.geographic_focus === filter.value;
        default:
          return true;
      }
    });
  });
  
  return exportToCSV(filtered);
};
```