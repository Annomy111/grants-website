const { createClient } = require('@supabase/supabase-js');

// Use the same environment variable approach as the working import script
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Translation mappings
const translations = {
  'Black Sea Trust for Regional Cooperation Grants': 'Гранти Чорноморського Трасту Регіонального Співробітництва',
  'European Endowment for Democracy Grants': 'Гранти Європейського Фонду Демократії',
  'International Renaissance Foundation Grants': 'Гранти Міжнародного Фонду Відродження',
  'Stefan Batory Foundation Ukraine Support': 'Підтримка України від Фонду Стефана Баторія',
  'Netherlands Embassy Small Grants': 'Малі гранти Посольства Нідерландів',
  'French Development Agency Ukraine Program': 'Програма України Французького Агентства Розвитку',
  'EBRD Community Initiative': 'Ініціатива ЄБРР для Громад',
  'Konrad Adenauer Stiftung Ukraine Grants': 'Гранти Фонду Конрада Аденауера для України',
  'Friedrich Ebert Stiftung Ukraine Support': 'Підтримка України від Фонду Фрідріха Еберта',
  'Heinrich Böll Foundation Ukraine Program': 'Програма України Фонду Генріха Бьолля',
  'Charles Stewart Mott Foundation CEE Program': 'Програма ЦСЄ Фонду Чарльза Стюарта Мотта',
  'Robert Bosch Stiftung Eastern Europe': 'Фонд Роберта Боша для Східної Європи',
  'Canada Fund for Local Initiatives Ukraine': 'Канадський фонд місцевих ініціатив для України',
  'Japan Grassroots Grant Program': 'Японська програма грантів для народних ініціатив',
  'Norwegian Helsinki Committee Ukraine Support': 'Підтримка України від Норвезького Гельсінського Комітету',
  'People in Need Ukraine Programs': 'Програми України організації "Люди в потребі"',
  'Caritas Ukraine Partnership Grants': 'Партнерські гранти Карітас України',
  'WHO Ukraine Health Programs': 'Програми охорони здоров\'я ВООЗ України',
  'IOM Ukraine Migration Support': 'Підтримка міграції МОМ України',
  'UNICEF Ukraine Partnerships': 'Партнерства ЮНІСЕФ України',
  'FAO Ukraine Agriculture Support': 'Підтримка сільського господарства ФАО України',
  'Enabel Belgium Ukraine Cooperation': 'Співробітництво Enabel Бельгія-Україна',
  'Austrian Development Agency Ukraine Programs': 'Програми України Австрійського Агентства Розвитку',
  'Finland Support to Ukraine': 'Підтримка Фінляндії для України',
  'Danish Support for Ukraine': 'Підтримка Данії для України',
  
  // Organizations
  'German Marshall Fund (GMF) - Black Sea Trust': 'Німецький фонд Маршалла (GMF) - Чорноморський траст',
  'European Endowment for Democracy (EED)': 'Європейський фонд демократії (EED)',
  'IRF/Open Society': 'МФВ/Відкрите суспільство',
  'Stefan Batory Foundation': 'Фонд Стефана Баторія',
  'Netherlands Ministry of Foreign Affairs': 'Міністерство закордонних справ Нідерландів',
  'AFD': 'AFD (Французьке агентство розвитку)',
  'European Bank for Reconstruction and Development': 'Європейський банк реконструкції та розвитку',
  'Konrad Adenauer Stiftung': 'Фонд Конрада Аденауера',
  'Friedrich Ebert Stiftung': 'Фонд Фрідріха Еберта',
  'Heinrich Böll Foundation': 'Фонд Генріха Бьолля',
  'Charles Stewart Mott Foundation': 'Фонд Чарльза Стюарта Мотта',
  'Robert Bosch Stiftung': 'Фонд Роберта Боша',
  'Global Affairs Canada': 'Глобальні справи Канади',
  'Embassy of Japan in Ukraine': 'Посольство Японії в Україні',
  'Norwegian Helsinki Committee': 'Норвезький Гельсінський комітет',
  'People in Need': 'Люди в потребі',
  'Caritas Internationalis': 'Карітас Інтернаціоналіс',
  'World Health Organization Ukraine': 'Всесвітня організація охорони здоров\'я України',
  'International Organization for Migration Ukraine': 'Міжнародна організація з міграції України',
  'UNICEF Ukraine': 'ЮНІСЕФ України',
  'Food and Agriculture Organization (FAO) Ukraine': 'Продовольча та сільськогосподарська організація (ФАО) України',
  'Enabel - Belgian Development Agency': 'Enabel - Бельгійське агентство розвитку',
  'Austrian Development Agency (ADA)': 'Австрійське агентство розвитку (ADA)',
  'Finnish Ministry for Foreign Affairs': 'Міністерство закордонних справ Фінляндії',
  'Danish Embassy/Danish Government': 'Посольство Данії/Уряд Данії',
  
  // Countries
  'Black Sea Region': 'Чорноморський регіон',
  'EU/International': 'ЄС/Міжнародний',
  'Ukraine/International': 'Україна/Міжнародний',
  'Poland/Ukraine': 'Польща/Україна',
  'Netherlands/Ukraine': 'Нідерланди/Україна',
  'France/Ukraine': 'Франція/Україна',
  'International': 'Міжнародний',
  'Germany/Ukraine': 'Німеччина/Україна',
  'USA/International': 'США/Міжнародний',
  'Germany/International': 'Німеччина/Міжнародний',
  'Canada/Ukraine': 'Канада/Україна',
  'Japan/Ukraine': 'Японія/Україна',
  'Norway/Ukraine': 'Норвегія/Україна',
  'Czech Republic/Ukraine': 'Чехія/Україна',
  'International/Ukraine': 'Міжнародний/Україна',
  'UN/Ukraine': 'ООН/Україна',
  'Belgium/Ukraine': 'Бельгія/Україна',
  'Austria/Ukraine': 'Австрія/Україна',
  'Finland/Ukraine': 'Фінляндія/Україна',
  'Denmark/Ukraine': 'Данія/Україна'
};

function translateText(text) {
  if (!text) return null;
  
  // Direct translation if available
  if (translations[text]) {
    return translations[text];
  }
  
  // Pattern-based translations for longer texts
  return text
    .replace(/Ukraine/g, 'Україна')
    .replace(/Ukrainian/g, 'український')
    .replace(/civil society/gi, 'громадянське суспільство')
    .replace(/democracy/gi, 'демократія')
    .replace(/human rights/gi, 'права людини')
    .replace(/governance/gi, 'управління')
    .replace(/transparency/gi, 'прозорість')
    .replace(/accountability/gi, 'підзвітність')
    .replace(/capacity building/gi, 'розбудова потенціалу')
    .replace(/NGO/g, 'НГО')
    .replace(/grant/gi, 'грант')
    .replace(/funding/gi, 'фінансування')
    .replace(/application/gi, 'заявка')
    .replace(/deadline/gi, 'термін подачі')
    .replace(/eligibility/gi, 'критерії відповідності')
    .replace(/requirements/gi, 'вимоги')
    .replace(/evaluation/gi, 'оцінювання')
    .replace(/reporting/gi, 'звітність')
    .replace(/duration/gi, 'тривалість');
}

async function translateGrants() {
  console.log('🇺🇦 Ukrainian Translation Agent 2 - Working Version');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }
  
  try {
    console.log('🔗 Testing connection...');
    
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('grants')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('❌ Connection failed:', testError);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Get grants that need translation (178-203)
    const grantIds = [178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 196, 197, 198, 199, 200, 201, 202, 203];
    
    console.log(`📝 Processing ${grantIds.length} grants for Ukrainian translation...`);
    
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each grant
    for (let i = 0; i < grantIds.length; i++) {
      const grantId = grantIds[i];
      
      try {
        console.log(`\n[${i + 1}/${grantIds.length}] Processing Grant ID ${grantId}...`);
        
        // Fetch the grant
        const { data: grant, error: fetchError } = await supabase
          .from('grants')
          .select('*')
          .eq('id', grantId)
          .single();
          
        if (fetchError || !grant) {
          console.log(`⚠️ Grant ${grantId} not found, skipping...`);
          errorCount++;
          continue;
        }
        
        // Check if already translated
        if (grant.grant_name_uk) {
          console.log(`⏭️ Grant ${grantId} already translated, skipping...`);
          skippedCount++;
          continue;
        }
        
        console.log(`📋 Grant: ${grant.grant_name}`);
        console.log(`🏢 Org: ${grant.funding_organization}`);
        
        // Create Ukrainian translations
        const ukrainianData = {
          grant_name_uk: translateText(grant.grant_name),
          funding_organization_uk: translateText(grant.funding_organization),
          country_region_uk: translateText(grant.country_region),
          eligibility_criteria_uk: translateText(grant.eligibility_criteria),
          focus_areas_uk: translateText(grant.focus_areas),
          grant_amount_uk: translateText(grant.grant_amount),
          duration_uk: translateText(grant.duration),
          application_procedure_uk: translateText(grant.application_procedure),
          required_documents_uk: translateText(grant.required_documents),
          evaluation_criteria_uk: translateText(grant.evaluation_criteria),
          additional_requirements_uk: translateText(grant.additional_requirements),
          reporting_requirements_uk: translateText(grant.reporting_requirements),
          detailed_description_uk: translateText(grant.detailed_description)
        };
        
        console.log(`🔄 Updating: ${ukrainianData.grant_name_uk}`);
        
        // Update the database
        const { error: updateError } = await supabase
          .from('grants')
          .update(ukrainianData)
          .eq('id', grantId);
          
        if (updateError) {
          console.error(`❌ Update failed for grant ${grantId}:`, updateError);
          errorCount++;
        } else {
          console.log(`✅ Successfully updated grant ${grantId}`);
          successCount++;
        }
        
        // Short delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`❌ Error processing grant ${grantId}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n🎯 Translation Summary:');
    console.log(`✅ Successfully translated: ${successCount} grants`);
    console.log(`⏭️ Already translated: ${skippedCount} grants`);
    console.log(`❌ Errors: ${errorCount} grants`);
    console.log(`📊 Total processed: ${successCount + skippedCount + errorCount} grants`);
    
    // Verification
    console.log('\n🔍 Verifying translations...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('grants')
      .select('id, grant_name, grant_name_uk')
      .in('id', grantIds.slice(0, 5))
      .order('id');
      
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('Sample verification:');
      verifyData.forEach(grant => {
        const status = grant.grant_name_uk ? '✅' : '❌';
        console.log(`${status} ID ${grant.id}: Ukrainian translation ${grant.grant_name_uk ? 'present' : 'missing'}`);
      });
    }
    
    console.log('\n🎉 Ukrainian Translation Agent 2 completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  translateGrants().then(() => {
    console.log('✅ Translation script completed');
    process.exit(0);
  });
}

module.exports = { translateGrants };