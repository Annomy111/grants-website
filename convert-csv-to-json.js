const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Output paths
const grantsOutputPath = path.join(__dirname, 'client/public/data/grants.json');
const filtersOutputPath = path.join(__dirname, 'client/public/data/filters.json');

// Global grants data
let grantsData = [];

// Process the grants data and extract filters
const processData = () => {
  // Extract unique filter values
  const filters = {
    organizations: [],
    countries: [],
    focusAreas: []
  };

  // Extract unique values for filters
  grantsData.forEach(grant => {
    // Organizations
    if (grant['Funding Organization'] && !filters.organizations.includes(grant['Funding Organization'])) {
      filters.organizations.push(grant['Funding Organization']);
    }

    // Countries
    if (grant['Country/Region'] && !filters.countries.includes(grant['Country/Region'])) {
      filters.countries.push(grant['Country/Region']);
    }

    // Focus Areas - these might be comma-separated
    if (grant['Focus Areas']) {
      const areas = grant['Focus Areas'].split(',').map(area => area.trim());
      areas.forEach(area => {
        if (!filters.focusAreas.includes(area)) {
          filters.focusAreas.push(area);
        }
      });
    }
  });

  // Sort filter values alphabetically
  filters.organizations.sort();
  filters.countries.sort();
  filters.focusAreas.sort();

  // Save grants data to JSON file
  fs.writeFileSync(grantsOutputPath, JSON.stringify(grantsData, null, 2));
  console.log(`✅ Grants data saved to ${grantsOutputPath}`);

  // Save filters to JSON file
  fs.writeFileSync(filtersOutputPath, JSON.stringify(filters, null, 2));
  console.log(`✅ Filters data saved to ${filtersOutputPath}`);
};

// Load grants data from CSV
console.log('Loading grants data from CSV...');
fs.createReadStream(path.join(__dirname, 'Ukraine_Civil_Society_Grants.csv'))
  .pipe(csv())
  .on('data', (data) => grantsData.push(data))
  .on('end', () => {
    console.log(`✅ Loaded ${grantsData.length} grants`);
    processData();
  });
