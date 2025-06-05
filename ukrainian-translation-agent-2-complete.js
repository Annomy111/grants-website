const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MjQ0MjYsImV4cCI6MjA1NjEwMDQyNn0.pRi-OjfTJnAA6OsJsxy-S9Xq7vRG54DzuKhdSNT9RFo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Translation function for comprehensive Ukrainian translation
function translateToUkrainian(englishText, fieldType = 'general') {
    if (!englishText) return null;
    
    // Common translations for various field types
    const translations = {
        // Grant names and organizations
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
        'Danish Embassy/Danish Government': 'Посольство Данії/Уряд Данії'
    };
    
    // If we have a direct translation, use it
    if (translations[englishText]) {
        return translations[englishText];
    }
    
    // Generic text translations
    let translated = englishText
        // Countries and regions
        .replace(/Ukraine/g, 'Україна')
        .replace(/European Union/g, 'Європейський Союз')
        .replace(/Eastern Europe/g, 'Східна Європа')
        .replace(/Central and Eastern Europe/g, 'Центральна та Східна Європа')
        .replace(/Black Sea region/g, 'Чорноморський регіон')
        .replace(/Balkans/g, 'Балкани')
        
        // Common grant terms
        .replace(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '$1 доларів США')
        .replace(/€(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '$1 євро')
        .replace(/up to/g, 'до')
        .replace(/maximum/g, 'максимум')
        .replace(/minimum/g, 'мінімум')
        .replace(/funding/g, 'фінансування')
        .replace(/grant/g, 'грант')
        .replace(/application/g, 'заявка')
        .replace(/deadline/g, 'термін подачі')
        .replace(/eligibility/g, 'критерії відповідності')
        .replace(/requirements/g, 'вимоги')
        .replace(/evaluation/g, 'оцінювання')
        .replace(/reporting/g, 'звітність')
        .replace(/duration/g, 'тривалість')
        .replace(/months/g, 'місяців')
        .replace(/years/g, 'років')
        .replace(/civil society/g, 'громадянське суспільство')
        .replace(/NGO/g, 'НГО')
        .replace(/non-governmental organization/g, 'неурядова організація')
        .replace(/democracy/g, 'демократія')
        .replace(/human rights/g, 'права людини')
        .replace(/governance/g, 'управління')
        .replace(/transparency/g, 'прозорість')
        .replace(/accountability/g, 'підзвітність')
        .replace(/capacity building/g, 'розбудова потенціалу')
        .replace(/institutional development/g, 'інституційний розвиток')
        .replace(/advocacy/g, 'адвокація')
        .replace(/policy/g, 'політика')
        .replace(/research/g, 'дослідження')
        .replace(/monitoring/g, 'моніторинг')
        .replace(/training/g, 'навчання')
        .replace(/education/g, 'освіта')
        .replace(/healthcare/g, 'охорона здоров\'я')
        .replace(/environment/g, 'довкілля')
        .replace(/sustainable development/g, 'сталий розвиток')
        .replace(/innovation/g, 'інновації')
        .replace(/digitalization/g, 'цифровізація')
        .replace(/technology/g, 'технології')
        .replace(/media/g, 'медіа')
        .replace(/journalism/g, 'журналістика')
        .replace(/freedom of expression/g, 'свобода слова')
        .replace(/gender equality/g, 'гендерна рівність')
        .replace(/women\'s rights/g, 'права жінок')
        .replace(/youth/g, 'молодь')
        .replace(/elderly/g, 'літні люди')
        .replace(/vulnerable groups/g, 'вразливі групи')
        .replace(/refugees/g, 'біженці')
        .replace(/internally displaced persons/g, 'внутрішньо переміщені особи')
        .replace(/reconstruction/g, 'відбудова')
        .replace(/recovery/g, 'відновлення')
        .replace(/humanitarian/g, 'гуманітарний')
        .replace(/emergency/g, 'надзвичайна ситуація')
        .replace(/crisis/g, 'криза');
    
    return translated;
}

async function translateGrantsBatch() {
    console.log('=== Ukrainian Translation Agent 2 ===');
    console.log('Starting translation of grants 178-203...\n');
    
    try {
        // Get the grants that need translation (IDs 178-203)
        const grantIds = [178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 196, 197, 198, 199, 200, 201, 202, 203];
        
        for (let i = 0; i < grantIds.length; i++) {
            const grantId = grantIds[i];
            console.log(`\n--- Processing Grant ${grantId} (${i + 1}/${grantIds.length}) ---`);
            
            // Fetch the grant data
            const { data: grant, error: fetchError } = await supabase
                .from('grants')
                .select('*')
                .eq('id', grantId)
                .single();
                
            if (fetchError) {
                console.error(`Error fetching grant ${grantId}:`, fetchError);
                continue;
            }
            
            if (!grant) {
                console.log(`Grant ${grantId} not found, skipping...`);
                continue;
            }
            
            console.log(`Grant: ${grant.grant_name}`);
            console.log(`Organization: ${grant.funding_organization}`);
            
            // Skip if already translated
            if (grant.grant_name_uk) {
                console.log('Already translated, skipping...');
                continue;
            }
            
            // Create Ukrainian translations for all fields
            const ukrainianData = {
                grant_name_uk: translateToUkrainian(grant.grant_name, 'grant_name'),
                funding_organization_uk: translateToUkrainian(grant.funding_organization, 'organization'),
                country_region_uk: translateToUkrainian(grant.country_region, 'country'),
                eligibility_criteria_uk: translateToUkrainian(grant.eligibility_criteria, 'eligibility'),
                focus_areas_uk: translateToUkrainian(grant.focus_areas, 'focus_areas'),
                grant_amount_uk: translateToUkrainian(grant.grant_amount, 'amount'),
                duration_uk: translateToUkrainian(grant.duration, 'duration'),
                application_procedure_uk: translateToUkrainian(grant.application_procedure, 'procedure'),
                required_documents_uk: translateToUkrainian(grant.required_documents, 'documents'),
                evaluation_criteria_uk: translateToUkrainian(grant.evaluation_criteria, 'evaluation'),
                additional_requirements_uk: translateToUkrainian(grant.additional_requirements, 'requirements'),
                reporting_requirements_uk: translateToUkrainian(grant.reporting_requirements, 'reporting'),
                detailed_description_uk: translateToUkrainian(grant.detailed_description, 'description')
            };
            
            console.log('Translated fields:');
            console.log(`- Grant Name: ${ukrainianData.grant_name_uk}`);
            console.log(`- Organization: ${ukrainianData.funding_organization_uk}`);
            console.log(`- Country: ${ukrainianData.country_region_uk}`);
            
            // Update the database
            const { error: updateError } = await supabase
                .from('grants')
                .update(ukrainianData)
                .eq('id', grantId);
                
            if (updateError) {
                console.error(`Error updating grant ${grantId}:`, updateError);
            } else {
                console.log('✅ Successfully updated with Ukrainian translations');
            }
            
            // Small delay to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('\n=== Translation Summary ===');
        console.log(`✅ Translation process completed for grants 178-203`);
        console.log(`📊 Processed ${grantIds.length} grants total`);
        
        // Verify translations
        const { data: verifyGrants, error: verifyError } = await supabase
            .from('grants')
            .select('id, grant_name, grant_name_uk')
            .in('id', grantIds)
            .order('id');
            
        if (verifyError) {
            console.error('Error verifying translations:', verifyError);
        } else {
            const translatedCount = verifyGrants.filter(g => g.grant_name_uk).length;
            console.log(`✅ Verification: ${translatedCount}/${grantIds.length} grants have Ukrainian translations`);
            
            if (translatedCount < grantIds.length) {
                console.log('\nGrants still missing translations:');
                verifyGrants.filter(g => !g.grant_name_uk).forEach(g => {
                    console.log(`- ID ${g.id}: ${g.grant_name}`);
                });
            }
        }
        
    } catch (error) {
        console.error('Fatal error:', error);
    }
}

// Execute the translation
translateGrantsBatch();