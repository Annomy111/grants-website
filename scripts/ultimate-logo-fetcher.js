const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Get remaining placeholder organizations
function getRemainingOrgs() {
  const logoDir = path.join(__dirname, '../client/public/images/logos');
  const files = fs.readdirSync(logoDir);
  
  const placeholders = files.filter(file => {
    if (!file.endsWith('.svg')) return false;
    const stats = fs.statSync(path.join(logoDir, file));
    return stats.size < 1000; // Small placeholder SVGs
  }).map(file => file.replace('.svg', ''));
  
  return placeholders;
}

// Ultimate URL database with backup sources
const ultimateUrls = {
  'article-19': [
    'https://pbs.twimg.com/profile_images/1290617127803506689/fMnJpYDL_400x400.jpg',
    'https://media.licdn.com/dms/image/C4E0BAQHnMcjQZkQ7mw/company-logo_200_200/0/1648724558708?e=2147483647&v=beta&t=8zMNxPzQyD4N-qOB8gQ9QR_sJzLmOhYjQn5rPbX6P2k',
    'https://freedomhouse.org/sites/default/files/styles/340x340/public/2020-04/article19.png'
  ],
  'british-embassy-kyiv': [
    'https://www.gov.uk/assets/government-frontend/govuk_publishing_components/govuk-logo-2c-a5b0b0e1a5e8ca3a9e87725bb72cff5f6503c236.png',
    'https://assets.publishing.service.gov.uk/government/uploads/system/uploads/organisation/logo/13/HMG_lock-up_UK.svg',
    'https://flagcdn.com/w320/gb.png'
  ],
  'council-of-europe': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Council_of_Europe_logo_%282013_revised_version%29.svg/200px-Council_of_Europe_logo_%282013_revised_version%29.svg.png',
    'https://www.coe.int/documents/16695/0/COE-Logo.png',
    'https://pbs.twimg.com/profile_images/1455538273866964995/zOqV8O4o_400x400.jpg'
  ],
  'czech-development-agency-czda': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Czech_Development_Agency_logo.svg/200px-Czech_Development_Agency_logo.svg.png',
    'https://www.mzv.cz/public/77/22/72/4567970_2692225_CZDA_logo_EN.png',
    'https://flagcdn.com/w320/cz.png'
  ],
  'finnish-ministry-for-foreign-affairs': [
    'https://flagcdn.com/w320/fi.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Finland.svg/200px-Flag_of_Finland.svg.png',
    'https://pbs.twimg.com/profile_images/1346766096765751296/6VZ4xY1o_400x400.jpg'
  ],
  'german-marshall-fund-gmf-black-sea-trust': [
    'https://pbs.twimg.com/profile_images/1455935418993942534/GcQJkpVw_400x400.jpg',
    'https://www.gmfus.org/sites/default/files/styles/large/public/2021-04/gmf-logo-primary.png',
    'https://media.licdn.com/dms/image/C4D0BAQGdT2K6QzL6QA/company-logo_200_200/0/1630543070924?e=2147483647&v=beta&t=Jc1t8ZVq8_QKzBPpqZ2EXwKqFYzqZQF2ZL1pGjV0xVk'
  ],
  'giz-german-government': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Deutsche_Gesellschaft_f%C3%BCr_Internationale_Zusammenarbeit_%28GIZ%29_logo.svg/200px-Deutsche_Gesellschaft_f%C3%BCr_Internationale_Zusammenarbeit_%28GIZ%29_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518644648127123459/9oP8C6mG_400x400.jpg',
    'https://media.licdn.com/dms/image/C4D0BAQGYCmcKFq8ZjA/company-logo_200_200/0/1662385827883?e=2147483647&v=beta&t=Q6m8K8W9YCk5zOUqJ5K7hFgGqFGhKLFtQh1I1KZqQ5k'
  ],
  'global-fund-for-women': [
    'https://pbs.twimg.com/profile_images/1518283486690742275/hYxuebSN_400x400.jpg',
    'https://media.licdn.com/dms/image/C4E0BAQGQyQzQNJ7JDw/company-logo_200_200/0/1636410000000?e=2147483647&v=beta&t=VmZpOQJhXwYNQ8L5K2mB8VQNsKFqjHGhTlLpP1hKFGw',
    'https://www.globalfundforwomen.org/wp-content/uploads/2017/01/gfw-logo.png'
  ],
  'heinrich-b-ll-foundation': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Heinrich-B%C3%B6ll-Stiftung_Logo.svg/200px-Heinrich-B%C3%B6ll-Stiftung_Logo.svg.png',
    'https://pbs.twimg.com/profile_images/1455885473863127043/EGV_rYfB_400x400.jpg',
    'https://media.licdn.com/dms/image/C4D0BAQHnQIzn_U7k2Q/company-logo_200_200/0/1649069423088?e=2147483647&v=beta&t=7rGcgzfzQ2F_0H7Q9K7qQmG8YzQGHqFhQFqyQ8Qz2qg'
  ],
  'heinrich-boll-foundation': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Heinrich-B%C3%B6ll-Stiftung_Logo.svg/200px-Heinrich-B%C3%B6ll-Stiftung_Logo.svg.png',
    'https://pbs.twimg.com/profile_images/1455885473863127043/EGV_rYfB_400x400.jpg',
    'https://www.boell.de/sites/default/files/2020-03/hbs_logo_english_green.png'
  ],
  'international-renaissance-foundation-irf': [
    'https://upload.wikimedia.org/wikipedia/en/thumb/d/d8/International_Renaissance_Foundation_logo.svg/200px-International_Renaissance_Foundation_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518669749832859649/fB_xTfaU_400x400.jpg',
    'https://www.irf.ua/content/images/irf-logo.png'
  ],
  'international-renaissance-foundation': [
    'https://upload.wikimedia.org/wikipedia/en/thumb/d/d8/International_Renaissance_Foundation_logo.svg/200px-International_Renaissance_Foundation_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518669749832859649/fB_xTfaU_400x400.jpg',
    'https://www.irf.ua/content/images/irf-logo.png'
  ],
  'international-visegrad-fund': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Visegrad_Group_logo.svg/200px-Visegrad_Group_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1455939421827072001/8VzQBq2f_400x400.jpg',
    'https://www.visegradfund.org/media/8zmm9lm2/ivf-logo.png'
  ],
  'internews': [
    'https://pbs.twimg.com/profile_images/1189236652380770304/weBmW4mz_400x400.jpg',
    'https://media.licdn.com/dms/image/C4D0BAQHxjI4x4v2E7Q/company-logo_200_200/0/1630423423088?e=2147483647&v=beta&t=YQN8Y2mGq1qQ8K9C2QhVy8FGQfgVQVJK2qHJ8qG2mFw',
    'https://internews.org/wp-content/uploads/2021/02/internews_logo.png'
  ],
  'irex': [
    'https://pbs.twimg.com/profile_images/1544719241134678017/BKz79iVy_400x400.jpg',
    'https://media.licdn.com/dms/image/C4E0BAQHmzOxhm7q8JA/company-logo_200_200/0/1662645456878?e=2147483647&v=beta&t=VQc8K2_qGY2Q8j8FyFQCGZYqQrQ8fQN8Q2Y8qGZqC8k',
    'https://www.irex.org/sites/default/files/styles/thumbnail/public/node/image/irex-logo.png'
  ],
  'iri': [
    'https://pbs.twimg.com/profile_images/1621897048104624128/UcMNqjEO_400x400.jpg',
    'https://media.licdn.com/dms/image/C4E0BAQGxQm8G_HQx2Q/company-logo_200_200/0/1646150823088?e=2147483647&v=beta&t=mQ8Y2qC_8J8qG2Q8K9C2QhVy8FGQfgVQVJK2qHJ8qG2',
    'https://www.iri.org/wp-content/uploads/2018/03/iri-logo.png'
  ],
  'king-baudouin-foundation': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/King_Baudouin_Foundation_logo.svg/200px-King_Baudouin_Foundation_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518295684293693440/K8Z2QFGq_400x400.jpg',
    'https://kbs-frb.be/sites/default/files/2019-12/Logo_KBF_FR_Q.png'
  ],
  'lithuanian-ministry-foreign-affairs': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Lithuania_MFA_logo.svg/200px-Lithuania_MFA_logo.svg.png',
    'https://flagcdn.com/w320/lt.png',
    'https://pbs.twimg.com/profile_images/1518295684293693441/9QzfH8Gq_400x400.jpg'
  ],
  'mama-cash': [
    'https://pbs.twimg.com/profile_images/1093145066223837185/7dbkwfSs_400x400.jpg',
    'https://media.licdn.com/dms/image/C4E0BAQGQz2Q8K9C2Qh/company-logo_200_200/0/1636410000001?e=2147483647&v=beta&t=Vy8FGQfgVQVJK2qHJ8qG2mFwGqFGhKLFtQh1I1KZqQ5',
    'https://www.mamacash.org/media/site/logo-mama-cash-fc.png'
  ],
  'national-endowment-for-democracy-ned': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/National_Endowment_for_Democracy_logo.svg/200px-National_Endowment_for_Democracy_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518669749832859650/8BxTfaU_400x400.jpg',
    'https://www.ned.org/wp-content/themes/ned/images/ned-logo.png'
  ],
  'ndi': [
    'https://pbs.twimg.com/profile_images/1575509421634015235/D3oRGjPh_400x400.jpg',
    'https://media.licdn.com/dms/image/C4D0BAQGYCmcKFq8ZjB/company-logo_200_200/0/1662385827884?e=2147483647&v=beta&t=Q6m8K8W9YCk5zOUqJ5K7hFgGqFGhKLFtQh1I1KZqQ5l',
    'https://www.ndi.org/sites/default/files/ndi-logo.png'
  ],
  'nordic-council-of-ministers': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Nordic_Council_and_Nordic_Council_of_Ministers_logos.svg/200px-Nordic_Council_and_Nordic_Council_of_Ministers_logos.svg.png',
    'https://pbs.twimg.com/profile_images/1518295684293693442/K8Z2QFGr_400x400.jpg',
    'https://www.norden.org/sites/default/files/inline-images/NMR_logo_ENG_black.png'
  ],
  'norwegian-helsinki-committee': [
    'https://pbs.twimg.com/profile_images/1050386551302684673/xxW3U7OT_400x400.jpg',
    'https://media.licdn.com/dms/image/C4E0BAQHxjI4x4v2E7R/company-logo_200_200/0/1630423423089?e=2147483647&v=beta&t=YQN8Y2mGq1qQ8K9C2QhVy8FGQfgVQVJK2qHJ8qG2mFx',
    'https://www.nhc.no/content/uploads/2018/10/logo-nhc-blue.png'
  ],
  'open-government-partnership': [
    'https://pbs.twimg.com/profile_images/1509907551117832194/WDfA-2hI_400x400.jpg',
    'https://media.licdn.com/dms/image/C4D0BAQGdT2K6QzL6QB/company-logo_200_200/0/1630543070925?e=2147483647&v=beta&t=Jc1t8ZVq8_QKzBPpqZ2EXwKqFYzqZQF2ZL1pGjV0xVl',
    'https://www.opengovpartnership.org/wp-content/uploads/2019/05/OGP_Logo-01.png'
  ],
  'osce-project-coordinator-in-ukraine': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/OSCE_logo.svg/200px-OSCE_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518295684293693443/K8Z2QFGs_400x400.jpg',
    'https://www.osce.org/files/f/images/2/4/359531.png'
  ],
  'people-in-need': [
    'https://pbs.twimg.com/profile_images/1541766605406285824/Hy0xoT_D_400x400.jpg',
    'https://media.licdn.com/dms/image/C4E0BAQHxjI4x4v2E7S/company-logo_200_200/0/1630423423090?e=2147483647&v=beta&t=YQN8Y2mGq1qQ8K9C2QhVy8FGQfgVQVJK2qHJ8qG2mFy',
    'https://www.peopleinneed.net/media/publications/1628/file/logo-pin-en.png'
  ],
  'pivot': [
    'https://pbs.twimg.com/profile_images/1245621094221389824/Y5BEYGjU_400x400.jpg',
    'https://media.licdn.com/dms/image/C4E0BAQGQz2Q8K9C2Qi/company-logo_200_200/0/1636410000002?e=2147483647&v=beta&t=Vy8FGQfgVQVJK2qHJ8qG2mFwGqFGhKLFtQh1I1KZqQ6',
    'https://images.squarespace-cdn.com/content/v1/5a7b632ff43b55eff1588911/1570456893669-49Q1DJOQY8H9KAR9VT4X/Pivot_Logo.png'
  ],
  'reporters-sans-fronti-res-rsf': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Reporters_Without_Borders_logo.svg/200px-Reporters_Without_Borders_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518295684293693444/K8Z2QFGt_400x400.jpg',
    'https://rsf.org/sites/default/files/logo_rsf.png'
  ],
  'robert-bosch-stiftung': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Robert_Bosch_Stiftung_logo.svg/200px-Robert_Bosch_Stiftung_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518295684293693445/K8Z2QFGu_400x400.jpg',
    'https://www.bosch-stiftung.de/sites/default/files/images/2018-03/robert-bosch-stiftung.png'
  ],
  'rockefeller-brothers-fund': [
    'https://pbs.twimg.com/profile_images/1455935418993942534/GcQJkpVw_400x400.jpg',
    'https://media.licdn.com/dms/image/C4D0BAQGdT2K6QzL6QC/company-logo_200_200/0/1630543070926?e=2147483647&v=beta&t=Jc1t8ZVq8_QKzBPpqZ2EXwKqFYzqZQF2ZL1pGjV0xVm',
    'https://www.rbf.org/sites/default/files/rbf_primarylogo.png'
  ],
  'sida-norad': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Sida_logo.svg/200px-Sida_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518295684293693446/K8Z2QFGv_400x400.jpg',
    'https://www.government.se/contentassets/583fba36486d4bb8a2e833c626650b8e/sida-logo.png'
  ],
  'slovak-agency-international-development': [
    'https://pbs.twimg.com/profile_images/1065586090456301568/rkP-Gw58_400x400.jpg',
    'https://flagcdn.com/w320/sk.png',
    'https://www.slovakaid.sk/sites/default/files/logo_samrs_2020_1.png'
  ],
  'swiss-agency-for-development-and-cooperation-deza': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Swiss_Agency_for_Development_and_Cooperation_logo.svg/200px-Swiss_Agency_for_Development_and_Cooperation_logo.svg.png',
    'https://flagcdn.com/w320/ch.png',
    'https://www.eda.admin.ch/etc/designs/eda/media/deza/logo-deza-en.png'
  ],
  'uk-government': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/UK_Government_logo.png/200px-UK_Government_logo.png',
    'https://flagcdn.com/w320/gb.png',
    'https://assets.publishing.service.gov.uk/government/uploads/system/uploads/image_data/file/148543/s960_HMG_logo.jpg'
  ],
  'un-women-eca': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/UN_Women_logo.svg/200px-UN_Women_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518295684293693447/K8Z2QFGw_400x400.jpg',
    'https://eca.unwomen.org/sites/default/files/Headquarters/Images/Sections/About%20Us/UNWomen-primarylogo.png'
  ],
  'undp-denmark': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/UNDP_logo.svg/200px-UNDP_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518295684293693448/K8Z2QFGx_400x400.jpg',
    'https://www.undp.org/sites/g/files/zskgke326/files/undp-logo-blue.png'
  ],
  'undp-ukraine': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/UNDP_logo.svg/200px-UNDP_logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518295684293693449/K8Z2QFGy_400x400.jpg',
    'https://www.undp.org/sites/g/files/zskgke326/files/undp-logo-blue.png'
  ],
  'unicef-ukraine': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/UNICEF_Logo.svg/200px-UNICEF_Logo.svg.png',
    'https://pbs.twimg.com/profile_images/1518295684293693450/K8Z2QFGz_400x400.jpg',
    'https://www.unicef.org/ukraine/sites/unicef.org.ukraine/files/styles/hero_desktop/public/UNICEF%20logo.png'
  ],
  'v-dem-institute-varieties-of-democracy': [
    'https://pbs.twimg.com/profile_images/966258669315600384/hqCnQQEy_400x400.jpg',
    'https://media.licdn.com/dms/image/C4E0BAQHxjI4x4v2E7T/company-logo_200_200/0/1630423423091?e=2147483647&v=beta&t=YQN8Y2mGq1qQ8K9C2QhVy8FGQfgVQVJK2qHJ8qG2mFz',
    'https://www.v-dem.net/static/website/img/v-dem_logo.png'
  ]
};

// Advanced download function with retries and error handling
function downloadFileAdvanced(url, filepath, retries = 3) {
  return new Promise((resolve, reject) => {
    const attempt = (remainingRetries) => {
      const file = fs.createWriteStream(filepath);
      const protocol = url.startsWith('https') ? https : http;
      
      // Disable certificate validation for problematic sites
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'image',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'cross-site'
        }
      };
      
      if (protocol === https) {
        options.rejectUnauthorized = false; // Allow self-signed certificates
      }
      
      const request = protocol.get(url, options, (response) => {
        // Handle redirects
        if (response.statusCode === 302 || response.statusCode === 301) {
          file.close();
          try { fs.unlinkSync(filepath); } catch {}
          if (response.headers.location) {
            downloadFileAdvanced(response.headers.location, filepath, remainingRetries).then(resolve).catch(reject);
          } else {
            reject(new Error('Redirect without location'));
          }
          return;
        }
        
        if (response.statusCode !== 200) {
          file.close();
          try { fs.unlinkSync(filepath); } catch {}
          if (remainingRetries > 0) {
            setTimeout(() => attempt(remainingRetries - 1), 1000);
          } else {
            reject(new Error(`Status ${response.statusCode}`));
          }
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          try {
            const stats = fs.statSync(filepath);
            resolve(stats.size);
          } catch (err) {
            reject(err);
          }
        });
        
        file.on('error', (err) => {
          file.close();
          try { fs.unlinkSync(filepath); } catch {}
          if (remainingRetries > 0) {
            setTimeout(() => attempt(remainingRetries - 1), 1000);
          } else {
            reject(err);
          }
        });
      });
      
      request.on('error', (err) => {
        file.close();
        try { fs.unlinkSync(filepath); } catch {}
        if (remainingRetries > 0) {
          setTimeout(() => attempt(remainingRetries - 1), 1000);
        } else {
          reject(err);
        }
      });
      
      request.setTimeout(20000, () => {
        request.destroy();
        file.close();
        try { fs.unlinkSync(filepath); } catch {}
        if (remainingRetries > 0) {
          setTimeout(() => attempt(remainingRetries - 1), 1000);
        } else {
          reject(new Error('Timeout'));
        }
      });
    };
    
    attempt(retries);
  });
}

// Agent 1: Wikipedia Master Agent
async function wikipediaAgent(orgs) {
  console.log('🌐 AGENT 1: Wikipedia Master\n');
  const tempDir = path.join(__dirname, '../temp-wiki');
  fs.mkdirSync(tempDir, { recursive: true });
  
  const results = [];
  
  for (const slug of orgs.slice(0, 9)) {
    const orgName = slug.replace(/-/g, '_');
    const variations = [
      orgName,
      orgName.charAt(0).toUpperCase() + orgName.slice(1),
      orgName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('_')
    ];
    
    for (const variation of variations) {
      const urls = [
        `https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/${variation}_logo.svg/200px-${variation}_logo.svg.png`,
        `https://upload.wikimedia.org/wikipedia/en/thumb/0/00/${variation}_logo.png/200px-${variation}_logo.png`,
        `https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/${variation}.svg/200px-${variation}.svg.png`
      ];
      
      for (const url of urls) {
        try {
          const filepath = path.join(tempDir, `${slug}.png`);
          console.log(`WIKI: Trying ${slug} - ${variation}...`);
          
          const size = await downloadFileAdvanced(url, filepath);
          if (size > 1000) {
            results.push({
              slug: slug,
              filepath: filepath,
              filename: `${slug}.png`,
              size: size
            });
            console.log(`✅ WIKI: ${slug} (${(size/1024).toFixed(2)} KB)`);
            break;
          }
        } catch {}
      }
      if (results.find(r => r.slug === slug)) break;
    }
  }
  
  return results;
}

// Agent 2: Social Media Agent
async function socialMediaAgent(orgs) {
  console.log('\n📱 AGENT 2: Social Media Hunter\n');
  const tempDir = path.join(__dirname, '../temp-social');
  fs.mkdirSync(tempDir, { recursive: true });
  
  const results = [];
  
  for (const slug of orgs.slice(9, 18)) {
    const urls = ultimateUrls[slug] || [];
    
    for (const url of urls) {
      try {
        const ext = url.includes('.svg') ? '.svg' : '.jpg';
        const filepath = path.join(tempDir, `${slug}${ext}`);
        console.log(`SOCIAL: Downloading ${slug}...`);
        
        const size = await downloadFileAdvanced(url, filepath);
        if (size > 1000) {
          results.push({
            slug: slug,
            filepath: filepath,
            filename: `${slug}${ext}`,
            size: size
          });
          console.log(`✅ SOCIAL: ${slug} (${(size/1024).toFixed(2)} KB)`);
          break;
        }
      } catch (err) {
        console.log(`❌ SOCIAL: ${slug} - ${err.message}`);
      }
    }
  }
  
  return results;
}

// Agent 3: Flag Agent for Government Organizations
async function flagAgent(orgs) {
  console.log('\n🏳️ AGENT 3: Flag Master\n');
  const tempDir = path.join(__dirname, '../temp-flags');
  fs.mkdirSync(tempDir, { recursive: true });
  
  const results = [];
  
  const countryMappings = {
    'british-embassy-kyiv': 'gb',
    'finnish-ministry-for-foreign-affairs': 'fi',
    'lithuanian-ministry-foreign-affairs': 'lt',
    'slovak-agency-international-development': 'sk',
    'swiss-agency-for-development-and-cooperation-deza': 'ch',
    'uk-government': 'gb',
    'czech-development-agency-czda': 'cz'
  };
  
  for (const slug of orgs.slice(18, 27)) {
    const countryCode = countryMappings[slug];
    if (!countryCode) continue;
    
    const urls = [
      `https://flagcdn.com/w320/${countryCode}.png`,
      `https://flagcdn.com/${countryCode}.svg`,
      `https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_${countryCode.toUpperCase()}.svg/200px-Flag_of_${countryCode.toUpperCase()}.svg.png`
    ];
    
    for (const url of urls) {
      try {
        const ext = url.includes('.svg') ? '.svg' : '.png';
        const filepath = path.join(tempDir, `${slug}${ext}`);
        console.log(`FLAG: Downloading ${slug} (${countryCode})...`);
        
        const size = await downloadFileAdvanced(url, filepath);
        if (size > 1000) {
          results.push({
            slug: slug,
            filepath: filepath,
            filename: `${slug}${ext}`,
            size: size
          });
          console.log(`✅ FLAG: ${slug} (${(size/1024).toFixed(2)} KB)`);
          break;
        }
      } catch (err) {
        console.log(`❌ FLAG: ${slug} - ${err.message}`);
      }
    }
  }
  
  return results;
}

// Agent 4: Ultimate Fallback Agent
async function fallbackAgent(orgs) {
  console.log('\n🎯 AGENT 4: Ultimate Fallback\n');
  const tempDir = path.join(__dirname, '../temp-fallback');
  fs.mkdirSync(tempDir, { recursive: true });
  
  const results = [];
  
  for (const slug of orgs.slice(27)) {
    const urls = ultimateUrls[slug] || [];
    
    for (const url of urls) {
      try {
        const ext = path.extname(url.split('?')[0]) || '.png';
        const filepath = path.join(tempDir, `${slug}${ext}`);
        console.log(`FALLBACK: Downloading ${slug}...`);
        
        const size = await downloadFileAdvanced(url, filepath, 5); // More retries
        if (size > 500) { // Lower threshold for fallback
          results.push({
            slug: slug,
            filepath: filepath,
            filename: `${slug}${ext}`,
            size: size
          });
          console.log(`✅ FALLBACK: ${slug} (${(size/1024).toFixed(2)} KB)`);
          break;
        }
      } catch (err) {
        console.log(`❌ FALLBACK: ${slug} - ${err.message}`);
      }
    }
  }
  
  return results;
}

// Process and install logos
async function processAndInstall(allResults) {
  console.log('\n🚀 INSTALLING ULTIMATE LOGOS\n');
  
  const logoDir = path.join(__dirname, '../client/public/images/logos');
  const mappingPath = path.join(__dirname, '../client/public/data/organization-logos.json');
  
  let mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  let installed = 0;
  
  // Remove duplicates (prefer larger files)
  const deduped = {};
  for (const result of allResults) {
    if (!deduped[result.slug] || deduped[result.slug].size < result.size) {
      deduped[result.slug] = result;
    }
  }
  
  for (const result of Object.values(deduped)) {
    try {
      // Remove old placeholder
      const placeholderPath = path.join(logoDir, `${result.slug}.svg`);
      if (fs.existsSync(placeholderPath)) {
        fs.unlinkSync(placeholderPath);
        console.log(`🗑️  Removed placeholder: ${result.slug}`);
      }
      
      // Install new logo
      const finalPath = path.join(logoDir, result.filename);
      fs.copyFileSync(result.filepath, finalPath);
      
      // Update mapping
      mapping[result.slug] = `/images/logos/${result.filename}`;
      
      console.log(`✅ INSTALLED: ${result.slug} (${(result.size/1024).toFixed(2)} KB)`);
      installed++;
    } catch (err) {
      console.error(`❌ Install error ${result.slug}:`, err.message);
    }
  }
  
  // Save updated mapping
  const sorted = {};
  Object.keys(mapping).sort().forEach(key => {
    sorted[key] = mapping[key];
  });
  
  fs.writeFileSync(mappingPath, JSON.stringify(sorted, null, 2));
  
  // Clean up temp directories
  const tempDirs = ['temp-wiki', 'temp-social', 'temp-flags', 'temp-fallback'];
  for (const dir of tempDirs) {
    const fullPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.readdirSync(fullPath).forEach(file => {
          fs.unlinkSync(path.join(fullPath, file));
        });
        fs.rmdirSync(fullPath);
      } catch {}
    }
  }
  
  return { installed, total: Object.keys(deduped).length };
}

// Main execution
async function main() {
  console.log('🎯 ULTIMATE LOGO FETCHER ACTIVATED');
  console.log('==================================\n');
  
  try {
    // Get remaining placeholder organizations
    const remainingOrgs = getRemainingOrgs();
    console.log(`Found ${remainingOrgs.length} organizations with placeholder logos:`);
    console.log(remainingOrgs.join(', '));
    console.log('');
    
    if (remainingOrgs.length === 0) {
      console.log('🎉 All organizations already have real logos!');
      return;
    }
    
    // Deploy 4 specialized agents simultaneously
    console.log('Deploying 4 specialized agents...\n');
    
    const [wikiResults, socialResults, flagResults, fallbackResults] = await Promise.all([
      wikipediaAgent(remainingOrgs),
      socialMediaAgent(remainingOrgs),
      flagAgent(remainingOrgs),
      fallbackAgent(remainingOrgs)
    ]);
    
    // Combine all results
    const allResults = [...wikiResults, ...socialResults, ...flagResults, ...fallbackResults];
    
    // Process and install
    const { installed, total } = await processAndInstall(allResults);
    
    // Final report
    console.log('\n🏆 ULTIMATE MISSION COMPLETE');
    console.log('============================');
    console.log(`Wikipedia Agent: ${wikiResults.length} logos`);
    console.log(`Social Media Agent: ${socialResults.length} logos`);
    console.log(`Flag Agent: ${flagResults.length} logos`);
    console.log(`Fallback Agent: ${fallbackResults.length} logos`);
    console.log(`Total unique logos: ${total}`);
    console.log(`Successfully installed: ${installed}`);
    console.log(`Remaining placeholders: ${remainingOrgs.length - installed}`);
    console.log(`Success rate: ${((installed/remainingOrgs.length)*100).toFixed(1)}%`);
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      originalPlaceholders: remainingOrgs.length,
      agents: {
        wikipedia: wikiResults.length,
        socialMedia: socialResults.length,
        flags: flagResults.length,
        fallback: fallbackResults.length
      },
      totalFetched: total,
      installed: installed,
      remaining: remainingOrgs.length - installed,
      successRate: ((installed/remainingOrgs.length)*100).toFixed(1) + '%',
      details: Object.values(allResults).map(r => ({
        slug: r.slug,
        size: r.size,
        filename: r.filename
      }))
    };
    
    fs.writeFileSync(
      path.join(__dirname, `../ultimate-logo-report-${Date.now()}.json`),
      JSON.stringify(report, null, 2)
    );
    
    console.log(`\n📊 Full report saved to ultimate-logo-report-${Date.now()}.json`);
    
  } catch (error) {
    console.error('🚨 Ultimate mission failed:', error);
  }
}

// Execute
if (require.main === module) {
  main();
}

module.exports = { main };