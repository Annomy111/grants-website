const https = require('https');
const fs = require('fs');
const path = require('path');

// Most reliable direct URLs for remaining organizations
const directUrls = {
  'article-19': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Article_19_logo.svg',
  'council-of-europe': 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Council_of_Europe_logo_%282013_revised_version%29.svg',
  'finnish-ministry-for-foreign-affairs': 'https://flagcdn.com/fi.svg',
  'german-marshall-fund-gmf-black-sea-trust': 'https://www.gmfus.org/sites/default/files/styles/large/public/2021-04/gmf-logo-primary.png',
  'giz-german-government': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Deutsche_Gesellschaft_f%C3%BCr_Internationale_Zusammenarbeit_%28GIZ%29_logo.svg',
  'global-fund-for-women': 'https://www.globalfundforwomen.org/wp-content/uploads/2017/01/gfw-logo.png',
  'heinrich-boll-foundation': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Heinrich-B%C3%B6ll-Stiftung_Logo.svg',
  'international-renaissance-foundation': 'https://upload.wikimedia.org/wikipedia/en/d/d8/International_Renaissance_Foundation_logo.svg',
  'international-visegrad-fund': 'https://upload.wikimedia.org/wikipedia/commons/6/68/Visegrad_Group_logo.svg',
  'king-baudouin-foundation': 'https://upload.wikimedia.org/wikipedia/commons/9/98/King_Baudouin_Foundation_logo.svg',
  'lithuanian-ministry-foreign-affairs': 'https://flagcdn.com/lt.svg',
  'national-endowment-for-democracy-ned': 'https://upload.wikimedia.org/wikipedia/commons/7/77/National_Endowment_for_Democracy_logo.svg',
  'nordic-council-of-ministers': 'https://upload.wikimedia.org/wikipedia/commons/6/68/Nordic_Council_and_Nordic_Council_of_Ministers_logos.svg',
  'osce-project-coordinator-in-ukraine': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/OSCE_logo.svg',
  'reporters-sans-fronti-res-rsf': 'https://upload.wikimedia.org/wikipedia/commons/6/67/Reporters_Without_Borders_logo.svg',
  'robert-bosch-stiftung': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Robert_Bosch_Stiftung_logo.svg',
  'sdc': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Swiss_Agency_for_Development_and_Cooperation_logo.svg',
  'sida-norad': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Sida_logo.svg',
  'swiss-agency-for-development-and-cooperation-deza': 'https://flagcdn.com/ch.svg',
  'uk-government': 'https://upload.wikimedia.org/wikipedia/commons/f/f5/HM_Government_logo.svg',
  'un-women': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/UN_Women_logo.svg',
  'un-women-eca': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/UN_Women_logo.svg',
  'undp-denmark': 'https://upload.wikimedia.org/wikipedia/commons/f/f4/UNDP_logo.svg',
  'undp-ukraine': 'https://upload.wikimedia.org/wikipedia/commons/f/f4/UNDP_logo.svg',
  'unicef-ukraine': 'https://upload.wikimedia.org/wikipedia/commons/4/47/UNICEF_Logo.svg'
};

function downloadLogo(slug, url) {
  return new Promise((resolve) => {
    const logoDir = path.join(__dirname, '../client/public/images/logos');
    const mappingPath = path.join(__dirname, '../client/public/data/organization-logos.json');
    
    const ext = url.includes('.svg') ? '.svg' : '.png';
    const filename = `${slug}${ext}`;
    const filepath = path.join(logoDir, filename);
    
    console.log(`Downloading ${slug}...`);
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          
          // Check file size
          const stats = fs.statSync(filepath);
          if (stats.size > 1000) {
            // Remove old placeholder
            try {
              fs.unlinkSync(path.join(logoDir, `${slug}.svg`));
            } catch {}
            
            // Update mapping
            try {
              const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
              mapping[slug] = `/images/logos/${filename}`;
              
              const sorted = {};
              Object.keys(mapping).sort().forEach(key => {
                sorted[key] = mapping[key];
              });
              
              fs.writeFileSync(mappingPath, JSON.stringify(sorted, null, 2));
            } catch {}
            
            console.log(`✅ ${slug} (${(stats.size/1024).toFixed(2)} KB)`);
            resolve(true);
          } else {
            fs.unlinkSync(filepath);
            console.log(`❌ ${slug} - file too small`);
            resolve(false);
          }
        });
      } else {
        file.close();
        try { fs.unlinkSync(filepath); } catch {}
        console.log(`❌ ${slug} - Status ${response.statusCode}`);
        resolve(false);
      }
    }).on('error', () => {
      file.close();
      try { fs.unlinkSync(filepath); } catch {}
      console.log(`❌ ${slug} - Network error`);
      resolve(false);
    });
  });
}

async function downloadAll() {
  console.log('📥 MANUAL LOGO DOWNLOADER');
  console.log('=========================\n');
  
  let success = 0;
  let failed = 0;
  
  for (const [slug, url] of Object.entries(directUrls)) {
    const result = await downloadLogo(slug, url);
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    // Small delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 RESULTS');
  console.log('===========');
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${success + failed}`);
}

downloadAll().catch(console.error);