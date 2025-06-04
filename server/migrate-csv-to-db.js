const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const db = require('./database/db');

const migrateData = async () => {
  const grants = [];
  
  // Read CSV file
  fs.createReadStream(path.join(__dirname, '../Ukraine_Civil_Society_Grants.csv'))
    .pipe(csv())
    .on('data', (data) => grants.push(data))
    .on('end', async () => {
      console.log(`Found ${grants.length} grants to migrate`);
      
      // Insert grants into database
      for (const grant of grants) {
        try {
          await db.run(
            `INSERT INTO grants (
              grant_name, funding_organization, country_region, 
              eligibility_criteria, focus_areas, grant_amount, 
              application_deadline, duration, website_link
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              grant['Grant Name'],
              grant['Funding Organization'],
              grant['Country/Region'],
              grant['Eligibility Criteria'],
              grant['Focus Areas'],
              grant['Grant Amount'],
              grant['Application Deadline'],
              grant['Duration'],
              grant['Website Link']
            ]
          );
        } catch (error) {
          console.error('Error inserting grant:', grant['Grant Name'], error);
        }
      }
      
      console.log('Migration completed');
      
      // Create some default blog categories
      const categories = [
        { name: 'Grant News', name_uk: 'Новини грантів', slug: 'grant-news', description: 'Latest updates about grants and funding opportunities' },
        { name: 'Success Stories', name_uk: 'Історії успіху', slug: 'success-stories', description: 'Stories from successful grant recipients' },
        { name: 'Tips & Guides', name_uk: 'Поради та посібники', slug: 'tips-guides', description: 'How to write winning grant applications' },
        { name: 'Announcements', name_uk: 'Оголошення', slug: 'announcements', description: 'Important announcements and updates' }
      ];
      
      for (const category of categories) {
        try {
          await db.run(
            'INSERT INTO blog_categories (name, name_uk, slug, description) VALUES (?, ?, ?, ?)',
            [category.name, category.name_uk, category.slug, category.description]
          );
        } catch (error) {
          console.error('Error inserting category:', category.name, error);
        }
      }
      
      console.log('Categories created');
      process.exit(0);
    });
};

migrateData();