const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// High-confidence direct URLs for remaining organizations
const directUrls = {
  'british-embassy-kyiv': 'https://assets.publishing.service.gov.uk/static/govuk-logo-2x-ab0c23cb88233e1919f43f6d11ce3f86c10db74f5bd8bc63b00b20278e21ab91.png',
  'council-of-europe': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Council_of_Europe_logo_%282013_revised_version%29.svg/200px-Council_of_Europe_logo_%282013_revised_version%29.svg.png',
  'giz-german-government': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Deutsche_Gesellschaft_f%C3%BCr_Internationale_Zusammenarbeit_%28GIZ%29_logo.svg/200px-Deutsche_Gesellschaft_f%C3%BCr_Internationale_Zusammenarbeit_%28GIZ%29_logo.svg.png',
  'global-fund-for-women': 'https://pbs.twimg.com/profile_images/1518283486690742275/hYxuebSN_400x400.jpg',
  'heinrich-boll-foundation': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Heinrich-B%C3%B6ll-Stiftung_Logo.svg/200px-Heinrich-B%C3%B6ll-Stiftung_Logo.svg.png',
  'international-renaissance-foundation': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d8/International_Renaissance_Foundation_logo.svg/200px-International_Renaissance_Foundation_logo.svg.png',
  'internews': 'https://pbs.twimg.com/profile_images/1189236652380770304/weBmW4mz_400x400.jpg',
  'irex': 'https://pbs.twimg.com/profile_images/1544719241134678017/BKz79iVy_400x400.jpg',
  'iri': 'https://pbs.twimg.com/profile_images/1621897048104624128/UcMNqjEO_400x400.jpg',
  'king-baudouin-foundation': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/King_Baudouin_Foundation_logo.svg/200px-King_Baudouin_Foundation_logo.svg.png',
  'lithuanian-ministry-foreign-affairs': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Lithuania_MFA_logo.svg/200px-Lithuania_MFA_logo.svg.png',
  'mama-cash': 'https://pbs.twimg.com/profile_images/1093145066223837185/7dbkwfSs_400x400.jpg',
  'ndi': 'https://pbs.twimg.com/profile_images/1575509421634015235/D3oRGjPh_400x400.jpg',
  'nordic-council-of-ministers': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Nordic_Council_and_Nordic_Council_of_Ministers_logos.svg/200px-Nordic_Council_and_Nordic_Council_of_Ministers_logos.svg.png',
  'norwegian-helsinki-committee': 'https://pbs.twimg.com/profile_images/1050386551302684673/xxW3U7OT_400x400.jpg',
  'open-government-partnership': 'https://pbs.twimg.com/profile_images/1509907551117832194/WDfA-2hI_400x400.jpg',
  'people-in-need': 'https://pbs.twimg.com/profile_images/1541766605406285824/Hy0xoT_D_400x400.jpg',
  'pivot': 'https://pbs.twimg.com/profile_images/1245621094221389824/Y5BEYGjU_400x400.jpg',
  'robert-bosch-stiftung': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Robert_Bosch_Stiftung_logo.svg/200px-Robert_Bosch_Stiftung_logo.svg.png',
  'rockefeller-brothers-fund': 'https://pbs.twimg.com/profile_images/1455935418993942534/GcQJkpVw_400x400.jpg',
  'sida-norad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Sida_logo.svg/200px-Sida_logo.svg.png',
  'slovak-agency-international-development': 'https://pbs.twimg.com/profile_images/1065586090456301568/rkP-Gw58_400x400.jpg',
  'undp-denmark': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/UNDP_logo.svg/200px-UNDP_logo.svg.png',
  'uk-government': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/UK_Government_logo.png/200px-UK_Government_logo.png',
  'undp-ukraine': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/UNDP_logo.svg/200px-UNDP_logo.svg.png',
  'unicef-ukraine': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/UNICEF_Logo.svg/200px-UNICEF_Logo.svg.png',
  'un-women-eca': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/UN_Women_logo.svg/200px-UN_Women_logo.svg.png',
  'v-dem-institute-varieties-of-democracy': 'https://pbs.twimg.com/profile_images/966258669315600384/hqCnQQEy_400x400.jpg',
  'network-100-percent-life-rivne-eu-funded': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/200px-Flag_of_Europe.svg.png'
};

async function fastFetchLogos() {
  console.log('⚡ FAST LOGO FETCHER\n');
  
  const tempDir = path.join(__dirname, '../temp-fast-logos');
  await fs.mkdir(tempDir, { recursive: true });
  
  const logoDir = path.join(__dirname, '../client/public/images/logos');
  const mappingPath = path.join(__dirname, '../client/public/data/organization-logos.json');
  
  let mapping = JSON.parse(await fs.readFile(mappingPath, 'utf8'));
  
  let downloaded = 0;
  let failed = 0;
  
  for (const [slug, url] of Object.entries(directUrls)) {
    try {
      const ext = path.extname(url.split('?')[0]) || '.png';
      const filename = `${slug}${ext}`;
      const tempPath = path.join(tempDir, filename);
      const finalPath = path.join(logoDir, filename);
      
      console.log(`Downloading ${slug}...`);
      
      // Download
      await execAsync(`curl -L -s -o "${tempPath}" --fail --max-time 20 "${url}"`);
      
      // Validate
      const stats = await fs.stat(tempPath);
      if (stats.size > 500) {
        // Remove old placeholder
        try {
          await fs.unlink(path.join(logoDir, `${slug}.svg`));
        } catch {}
        
        // Move to final location
        await fs.copyFile(tempPath, finalPath);
        
        // Update mapping
        mapping[slug] = `/images/logos/${filename}`;
        
        console.log(`✅ ${slug} (${(stats.size/1024).toFixed(2)} KB)`);
        downloaded++;
      } else {
        failed++;
      }
    } catch (err) {
      console.log(`❌ ${slug}`);
      failed++;
    }
  }
  
  // Sort and save mapping
  const sorted = {};
  Object.keys(mapping).sort().forEach(key => {
    sorted[key] = mapping[key];
  });
  await fs.writeFile(mappingPath, JSON.stringify(sorted, null, 2));
  
  // Clean up
  try {
    const files = await fs.readdir(tempDir);
    for (const file of files) {
      await fs.unlink(path.join(tempDir, file));
    }
    await fs.rmdir(tempDir);
  } catch {}
  
  console.log(`\n✅ Downloaded: ${downloaded}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total mappings: ${Object.keys(sorted).length}`);
}

fastFetchLogos().catch(console.error);