const fs = require('fs');
const path = require('path');

// Map of organization names to their logo files
const organizationLogoMappings = {
  // Organizations with logos already in directory
  "Adessium Foundation": "adessium-foundation.svg",
  "AFD": "afd-french-development-agency.svg",
  "Article 19": "article-19.svg",
  "Austrian Development Agency": "austrian-development-agency.png",
  "AWID": "awid.png",
  "Belgian Development Agency": "belgian-development-agency.svg",
  "British Council": "british-council.svg",
  "The Carter Center": "carter-center.png",
  "Charles Stewart Mott Foundation": "charles-stewart-mott-foundation.svg",
  "CPJ": "cpj.png",
  "Czech Development Agency": "czech-development-agency.png",
  "Deutsche Welle Akademie": "deutsche-welle-akademie.svg",
  "European Bank for Reconstruction and Development": "ebrd.svg",
  "Embassy of Japan in Ukraine": "embassy-of-japan-ukraine.svg",
  "Estonian Ministry of Foreign Affairs": "estonian-ministry-foreign-affairs.svg",
  "European Commission": "european-commission.svg",
  "FJS": "fondation-jean-jaures.svg",
  "Food and Agriculture Organization": "food-and-agriculture-organization.svg",
  "Freedom House": "freedom-house.svg",
  "Friedrich Ebert Stiftung": "friedrich-ebert-stiftung.svg",
  "Global Affairs Canada": "global-affairs-canada.svg",
  "Global Fund for Women": "global-fund-for-women.svg",
  "Global Innovation Fund": "global-innovation-fund.svg",
  "Goethe Institute": "goethe-institute.svg",
  "Heinrich Böll Foundation": "heinrich-boll-foundation.svg",
  "International IDEA": "international-idea.svg",
  "International Organization for Migration": "international-organization-for-migration.png",
  "IRF/Open Society": "international-renaissance-foundation.svg",
  "Internews": "internews.svg",
  "IREX": "irex.svg",
  "IRI": "iri.svg",
  "Joseph Rowntree Charitable Trust": "joseph-rowntree-charitable-trust.png",
  "King Baudouin Foundation": "king-baudouin-foundation.svg",
  "Konrad Adenauer Stiftung": "konrad-adenauer-stiftung.png",
  "Ministry of Foreign Affairs Latvia": "latvia-mfa.svg",
  "Lithuanian Ministry of Foreign Affairs": "lithuanian-ministry-foreign-affairs.svg",
  "Luminate": "luminate.svg",
  "MacArthur Foundation": "macarthur-foundation-primary.svg",
  "Mama Cash": "mama-cash.svg",
  "MDIF": "mdif.svg",
  "Ministry for Foreign Affairs Finland": "ministry-for-foreign-affairs-finland.png",
  "NDI": "ndi.svg",
  "Netherlands Ministry of Foreign Affairs": "netherlands-ministry-foreign-affairs.svg",
  "NIMD": "nimd.svg",
  "Norwegian Helsinki Committee": "norwegian-helsinki-committee.svg",
  "Oak Foundation": "oak-foundation.svg",
  "OIF": "oif.png",
  "OSCE": "osce.svg",
  "Pivot": "pivot.svg",
  "Polish Ministry of Foreign Affairs": "polish-ministry-of-foreign-affairs.png",
  "Porticus": "porticus-blue.svg",
  "Robert Bosch Stiftung": "robert-bosch-stiftung.svg",
  "Rockefeller Brothers Fund": "rockefeller-brothers-fund.svg",
  "Swiss Agency for Development and Cooperation": "sdc.svg",
  "Sigrid Rausing Trust": "sigrid-rausing-trust.svg",
  "Slovak Agency for International Development": "slovak-agency-international-development.svg",
  "Stefan Batory Foundation": "stefan-batory-foundation.png",
  "UNICEF": "unicef.svg",
  "V-Dem Institute": "v-dem-institute.svg",
  "World Health Organization": "world-health-organization.svg"
};

// Load existing organization-logos.json
const existingLogosPath = path.join(__dirname, 'client/public/data/organization-logos.json');
const existingLogos = JSON.parse(fs.readFileSync(existingLogosPath, 'utf8'));

// Create slug from organization name
function createSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate new mappings
const updatedLogos = { ...existingLogos };

Object.entries(organizationLogoMappings).forEach(([orgName, logoFile]) => {
  const slug = createSlug(orgName);
  
  // Only add if not already in the file
  if (!updatedLogos[slug]) {
    updatedLogos[slug] = {
      name: orgName,
      logo: `/images/logos/${logoFile}`,
      website: "", // Would need to be filled in manually
      hasLogo: true
    };
    console.log(`Added mapping for: ${orgName} -> ${slug}`);
  }
});

// Sort the object by keys
const sortedLogos = {};
Object.keys(updatedLogos).sort().forEach(key => {
  sortedLogos[key] = updatedLogos[key];
});

// Write updated file
const outputPath = path.join(__dirname, 'client/public/data/organization-logos-updated.json');
fs.writeFileSync(outputPath, JSON.stringify(sortedLogos, null, 2));

console.log(`\nUpdated logo mappings saved to: ${outputPath}`);
console.log(`Total mappings: ${Object.keys(sortedLogos).length}`);
console.log(`New mappings added: ${Object.keys(sortedLogos).length - Object.keys(existingLogos).length}`);

// List organizations that still need logos
const missingOrgs = [
  "Anna Lindh Foundation",
  "BBC Media Action",
  "Caritas Internationalis", 
  "Comic Relief",
  "Danish Ministry of Foreign Affairs",
  "EU/GIZ",
  "EU/Network 100 percent life Rivne",
  "Open Government Partnership",
  "People in Need",
  "RSF",
  "Urgent Action Fund",
  "WFD",
  "Wellspring"
];

console.log("\nOrganizations that still need logo files:");
missingOrgs.forEach(org => {
  console.log(`- ${org}`);
});