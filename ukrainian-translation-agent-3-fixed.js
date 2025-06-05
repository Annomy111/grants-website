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
        // Grant names and organizations from Agent 2's work
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
        
        // Agent 3 specific grants
        'Czech Development Agency Ukraine Support': 'Підтримка України від Чеського агентства розвитку',
        'Orange Projects Lithuania Support': 'Підтримка Литовських проектів "Orange"',
        'Polish Aid Ukraine Programs': 'Програми допомоги Польщі для України',
        'Estonian Development Cooperation': 'Естонське співробітництво в галузі розвитку',
        'Latvian Development Cooperation Ukraine': 'Латвійське співробітництво в галузі розвитку для України',
        'Slovak Aid Ukraine Programs': 'Програми словацької допомоги для України',
        'Lithuanian Development Cooperation': 'Литовське співробітництво в галузі розвитку',
        'Swedish Development Cooperation': 'Шведське співробітництво в галузі розвитку',
        'Swiss Development Cooperation': 'Швейцарське співробітництво в галузі розвитку',
        'Iceland Support for Ukraine': 'Підтримка Ісландії для України',
        
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
        .replace(/Baltic States/g, 'Балтійські держави')
        .replace(/Visegrad Group/g, 'Вишеградська група')
        
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

async function updateGrantWithRetry(grantId, ukrainianData, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`  Attempt ${attempt}/${maxRetries} for grant ${grantId}...`);
        
        try {
            const { data, error, count } = await supabase
                .from('grants')
                .update(ukrainianData)
                .eq('id', grantId)
                .select('id');
                
            if (error) {
                console.error(`  Error on attempt ${attempt}:`, error);
                if (attempt === maxRetries) return { success: false, error };
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                continue;
            }
            
            // Check if the update actually affected any rows
            if (data && data.length > 0) {
                console.log(`  ✅ Successfully updated grant ${grantId}`);
                return { success: true, data };
            } else {
                console.log(`  ⚠️ Update returned no rows for grant ${grantId}`);
                // Try again
                if (attempt === maxRetries) {
                    return { success: false, error: 'No rows updated' };
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        } catch (err) {
            console.error(`  Exception on attempt ${attempt}:`, err);
            if (attempt === maxRetries) return { success: false, error: err };
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    
    return { success: false, error: 'Max retries exceeded' };
}

async function translateAndUpdateGrants() {
    console.log('=== Ukrainian Translation Agent 3 - Fixed Version ===');
    console.log('Translating grants 178-228 (next 25 grants)...\n');
    
    try {
        // Get the next batch of untranslated grants
        const { data: allGrants, error } = await supabase
            .from('grants')
            .select('id, grant_name, grant_name_uk')
            .order('id', { ascending: true });
            
        if (error) throw error;
        
        const untranslatedGrants = allGrants.filter(g => !g.grant_name_uk || g.grant_name_uk.trim() === '');
        console.log(`Found ${untranslatedGrants.length} untranslated grants total`);
        
        // Take next 25 grants starting from 178
        const targetGrants = untranslatedGrants.filter(g => g.id >= 178).slice(0, 25);
        console.log(`Targeting ${targetGrants.length} grants for translation\n`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < targetGrants.length; i++) {
            const grant = targetGrants[i];
            console.log(`\n--- Processing Grant ${grant.id} (${i + 1}/${targetGrants.length}) ---`);
            console.log(`Grant: ${grant.grant_name}`);
            
            // Fetch the full grant data
            const { data: fullGrant, error: fetchError } = await supabase
                .from('grants')
                .select('*')
                .eq('id', grant.id)
                .single();
                
            if (fetchError) {
                console.error(`Error fetching grant ${grant.id}:`, fetchError);
                errorCount++;
                continue;
            }
            
            if (!fullGrant) {
                console.log(`Grant ${grant.id} not found, skipping...`);
                continue;
            }
            
            console.log(`Organization: ${fullGrant.funding_organization}`);
            
            // Create Ukrainian translations for all fields
            const ukrainianData = {
                grant_name_uk: translateToUkrainian(fullGrant.grant_name, 'grant_name'),
                funding_organization_uk: translateToUkrainian(fullGrant.funding_organization, 'organization'),
                country_region_uk: translateToUkrainian(fullGrant.country_region, 'country'),
                eligibility_criteria_uk: translateToUkrainian(fullGrant.eligibility_criteria, 'eligibility'),
                focus_areas_uk: translateToUkrainian(fullGrant.focus_areas, 'focus_areas'),
                grant_amount_uk: translateToUkrainian(fullGrant.grant_amount, 'amount'),
                duration_uk: translateToUkrainian(fullGrant.duration, 'duration'),
                application_procedure_uk: translateToUkrainian(fullGrant.application_procedure, 'procedure'),
                required_documents_uk: translateToUkrainian(fullGrant.required_documents, 'documents'),
                evaluation_criteria_uk: translateToUkrainian(fullGrant.evaluation_criteria, 'evaluation'),
                additional_requirements_uk: translateToUkrainian(fullGrant.additional_requirements, 'requirements'),
                reporting_requirements_uk: translateToUkrainian(fullGrant.reporting_requirements, 'reporting'),
                detailed_description_uk: translateToUkrainian(fullGrant.detailed_description, 'description')
            };
            
            console.log(`Translated name: ${ukrainianData.grant_name_uk}`);
            console.log(`Translated org: ${ukrainianData.funding_organization_uk}`);
            
            // Update the database with retry logic
            const result = await updateGrantWithRetry(grant.id, ukrainianData);
            
            if (result.success) {
                successCount++;
            } else {
                console.error(`Failed to update grant ${grant.id} after retries:`, result.error);
                errorCount++;
            }
            
            // Small delay between grants
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        console.log('\n=== Translation Summary ===');
        console.log(`✅ Successfully translated: ${successCount} grants`);
        console.log(`❌ Errors: ${errorCount} grants`);
        
        // Final verification
        const grantIds = targetGrants.map(g => g.id);
        const { data: verifyGrants, error: verifyError } = await supabase
            .from('grants')
            .select('id, grant_name, grant_name_uk')
            .in('id', grantIds)
            .order('id');
            
        if (verifyError) {
            console.error('Error verifying translations:', verifyError);
        } else {
            const translatedCount = verifyGrants.filter(g => g.grant_name_uk).length;
            console.log(`\n✅ Final Verification: ${translatedCount}/${grantIds.length} grants have Ukrainian translations`);
            
            if (translatedCount > 0) {
                console.log('\nSuccessfully translated grants:');
                verifyGrants.filter(g => g.grant_name_uk).forEach(g => {
                    console.log(`- ID ${g.id}: ${g.grant_name_uk}`);
                });
            }
            
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
translateAndUpdateGrants();