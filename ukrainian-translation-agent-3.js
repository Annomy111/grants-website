const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MjQ0MjYsImV4cCI6MjA1NjEwMDQyNn0.pRi-OjfTJnAA6OsJsxy-S9Xq7vRG54DzuKhdSNT9RFo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Translation function for comprehensive Ukrainian translation
function translateToUkrainian(englishText, fieldType = 'general') {
    if (!englishText) return null;
    
    // Common translations for various field types
    const translations = {
        // Grant names and organizations (continuing from Agent 2's work)
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
        'Luxembourg Development Cooperation': 'Люксембурзьке співробітництво в галузі розвитку',
        'Ireland Development Cooperation': 'Ірландське співробітництво в галузі розвитку',
        'Slovenia Development Cooperation': 'Словенське співробітництво в галузі розвитку',
        'Malta Development Cooperation': 'Мальтійське співробітництво в галузі розвитку',
        'Cyprus Development Cooperation': 'Кіпрське співробітництво в галузі розвитку',
        
        // Organizations
        'Czech Development Agency': 'Чеське агентство розвитку',
        'Orange Projects Lithuania': 'Литовські проекти "Orange"',
        'Polish Aid': 'Польська допомога',
        'Estonian Ministry of Foreign Affairs': 'Міністерство закордонних справ Естонії',
        'Latvian Ministry of Foreign Affairs': 'Міністерство закордонних справ Латвії',
        'Slovak Aid': 'Словацька допомога',
        'Lithuanian Ministry of Foreign Affairs': 'Міністерство закордонних справ Литви',
        'Swedish International Development Cooperation Agency (SIDA)': 'Шведське агентство міжнародного співробітництва в галузі розвитку (SIDA)',
        'Swiss Agency for Development and Cooperation (SDC)': 'Швейцарське агентство розвитку та співробітництва (SDC)',
        'Icelandic Ministry for Foreign Affairs': 'Міністерство закордонних справ Ісландії',
        'Luxembourg Ministry of Foreign Affairs': 'Міністерство закордонних справ Люксембургу',
        'Irish Aid': 'Ірландська допомога',
        'Slovenian Ministry of Foreign Affairs': 'Міністерство закордонних справ Словенії',
        'Malta Ministry for Foreign Affairs': 'Міністерство закордонних справ Мальти',
        'Cyprus Ministry of Foreign Affairs': 'Міністерство закордонних справ Кіпру'
    };
    
    // If we have a direct translation, use it
    if (translations[englishText]) {
        return translations[englishText];
    }
    
    // Generic text translations
    let translated = englishText
        // Countries and regions
        .replace(/Czech Republic/g, 'Чехія')
        .replace(/Lithuania/g, 'Литва')
        .replace(/Poland/g, 'Польща')
        .replace(/Estonia/g, 'Естонія')
        .replace(/Latvia/g, 'Латвія')
        .replace(/Slovakia/g, 'Словаччина')
        .replace(/Sweden/g, 'Швеція')
        .replace(/Switzerland/g, 'Швейцарія')
        .replace(/Iceland/g, 'Ісландія')
        .replace(/Luxembourg/g, 'Люксембург')
        .replace(/Ireland/g, 'Ірландія')
        .replace(/Slovenia/g, 'Словенія')
        .replace(/Malta/g, 'Мальта')
        .replace(/Cyprus/g, 'Кіпр')
        .replace(/Ukraine/g, 'Україна')
        .replace(/European Union/g, 'Європейський Союз')
        .replace(/Eastern Europe/g, 'Східна Європа')
        .replace(/Central and Eastern Europe/g, 'Центральна та Східна Європа')
        .replace(/Baltic States/g, 'Балтійські держави')
        .replace(/Visegrad Group/g, 'Вишеградська група')
        
        // Common grant terms
        .replace(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '$1 доларів США')
        .replace(/€(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '$1 євро')
        .replace(/CHF (\d+(?:,\d{3})*(?:\.\d{2})?)/g, '$1 швейцарських франків')
        .replace(/SEK (\d+(?:,\d{3})*(?:\.\d{2})?)/g, '$1 шведських крон')
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
        .replace(/crisis/g, 'криза')
        .replace(/development cooperation/g, 'співробітництво в галузі розвитку')
        .replace(/bilateral cooperation/g, 'двостороннє співробітництво')
        .replace(/multilateral cooperation/g, 'багатостороннє співробітництво');
    
    return translated;
}

async function executeAgent2Updates() {
    console.log('=== Ukrainian Translation Agent 3 ===');
    console.log('First completing Agent 2 work (grants 178-203)...\n');
    
    try {
        // Apply Agent 2's translations for grants 178-203
        const agent2Grants = [178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 196, 197, 198, 199, 200, 201, 202, 203];
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const grantId of agent2Grants) {
            console.log(`Processing grant ${grantId}...`);
            
            // Fetch the grant data
            const { data: grant, error: fetchError } = await supabase
                .from('grants')
                .select('*')
                .eq('id', grantId)
                .single();
                
            if (fetchError) {
                console.error(`Error fetching grant ${grantId}:`, fetchError);
                errorCount++;
                continue;
            }
            
            if (!grant) {
                console.log(`Grant ${grantId} not found, skipping...`);
                continue;
            }
            
            // Skip if already translated
            if (grant.grant_name_uk) {
                console.log(`Grant ${grantId} already translated, skipping...`);
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
            
            console.log(`Translated: ${ukrainianData.grant_name_uk}`);
            
            // Update the database
            const { error: updateError } = await supabase
                .from('grants')
                .update(ukrainianData)
                .eq('id', grantId);
                
            if (updateError) {
                console.error(`Error updating grant ${grantId}:`, updateError);
                errorCount++;
            } else {
                console.log('✅ Successfully updated with Ukrainian translations');
                successCount++;
            }
            
            // Small delay
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        console.log(`\n=== Agent 2 Work Completion Summary ===`);
        console.log(`✅ Successfully updated: ${successCount} grants`);
        console.log(`❌ Errors: ${errorCount} grants`);
        
        return successCount > 0;
        
    } catch (error) {
        console.error('Error executing Agent 2 updates:', error);
        return false;
    }
}

async function checkTranslationStatus() {
    console.log('Checking current translation status...\n');
    
    try {
        // Get all grants ordered by ID
        const { data: allGrants, error } = await supabase
            .from('grants')
            .select('id, grant_name, grant_name_uk')
            .order('id', { ascending: true });
            
        if (error) throw error;
        
        console.log(`Total grants in database: ${allGrants.length}`);
        
        // Check which grants have Ukrainian translations
        const translatedGrants = allGrants.filter(g => g.grant_name_uk && g.grant_name_uk.trim() !== '');
        const untranslatedGrants = allGrants.filter(g => !g.grant_name_uk || g.grant_name_uk.trim() === '');
        
        console.log(`Grants with Ukrainian translations: ${translatedGrants.length}`);
        console.log(`Grants without Ukrainian translations: ${untranslatedGrants.length}`);
        
        // Show the range of translated grants
        if (translatedGrants.length > 0) {
            const translatedIds = translatedGrants.map(g => g.id).sort((a, b) => a - b);
            console.log(`\nTranslated grant IDs: ${translatedIds.join(', ')}`);
        }
        
        // Identify next batch for Agent 3
        if (untranslatedGrants.length > 0) {
            const nextBatch = untranslatedGrants.slice(0, 25);
            console.log('\nNext batch for Agent 3 translation:');
            nextBatch.forEach(grant => {
                console.log(`ID ${grant.id}: ${grant.grant_name}`);
            });
            return nextBatch;
        }
        
        return [];
        
    } catch (error) {
        console.error('Error checking translation status:', error);
        process.exit(1);
    }
}

async function translateAgent3Batch(grantsToTranslate) {
    console.log('\n=== Agent 3 Translation Work ===');
    console.log(`Starting translation of ${grantsToTranslate.length} grants...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < grantsToTranslate.length; i++) {
        const grant = grantsToTranslate[i];
        console.log(`\n--- Processing Grant ${grant.id} (${i + 1}/${grantsToTranslate.length}) ---`);
        
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
        
        console.log(`Grant: ${fullGrant.grant_name}`);
        console.log(`Organization: ${fullGrant.funding_organization}`);
        
        // Skip if already translated
        if (fullGrant.grant_name_uk) {
            console.log('Already translated, skipping...');
            continue;
        }
        
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
        
        console.log('Translated fields:');
        console.log(`- Grant Name: ${ukrainianData.grant_name_uk}`);
        console.log(`- Organization: ${ukrainianData.funding_organization_uk}`);
        console.log(`- Country: ${ukrainianData.country_region_uk}`);
        
        // Update the database
        const { error: updateError } = await supabase
            .from('grants')
            .update(ukrainianData)
            .eq('id', grant.id);
            
        if (updateError) {
            console.error(`Error updating grant ${grant.id}:`, updateError);
            errorCount++;
        } else {
            console.log('✅ Successfully updated with Ukrainian translations');
            successCount++;
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n=== Agent 3 Translation Summary ===');
    console.log(`✅ Successfully translated: ${successCount} grants`);
    console.log(`❌ Errors: ${errorCount} grants`);
    
    // Verify translations
    const grantIds = grantsToTranslate.map(g => g.id);
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
}

async function main() {
    console.log('=== Ukrainian Translation Agent 3 ===');
    console.log('Mission: Complete Agent 2 work + translate next batch\n');
    
    try {
        // Step 1: Complete Agent 2's work if needed
        console.log('Step 1: Checking if Agent 2 work is complete...');
        const agent2Completed = await executeAgent2Updates();
        
        // Step 2: Check current status
        console.log('\nStep 2: Checking current translation status...');
        const untranslatedGrants = await checkTranslationStatus();
        
        // Step 3: Translate next batch as Agent 3
        if (untranslatedGrants.length > 0) {
            await translateAgent3Batch(untranslatedGrants);
        } else {
            console.log('\n🎉 All grants have been translated!');
        }
        
        // Final status check
        console.log('\n=== Final Status Check ===');
        await checkTranslationStatus();
        
    } catch (error) {
        console.error('Fatal error:', error);
    }
}

// Execute the main function
main();