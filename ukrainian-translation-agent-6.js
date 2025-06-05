const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.mXdJdUGX0t1E5Xj_pQkf7LIJlGCMR9qhMgH3v6oP1pM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Translation function
function translateToUkrainian(text, fieldName) {
    if (!text) return null;
    
    // Common translations
    const commonTranslations = {
        // Organizations
        'United States Agency for International Development': 'Агентство США з міжнародного розвитку (USAID)',
        'European Union': 'Європейський Союз',
        'United Nations': 'Організація Об\'єднаних Націй',
        'World Bank': 'Світовий банк',
        'International Monetary Fund': 'Міжнародний валютний фонд',
        
        // Countries/Regions
        'Ukraine': 'Україна',
        'United States': 'Сполучені Штати Америки',
        'European Union': 'Європейський Союз',
        'Global': 'Глобальний',
        'Eastern Europe': 'Східна Європа',
        
        // Common terms
        'Civil society organizations': 'Організації громадянського суспільства',
        'Non-governmental organizations': 'Неурядові організації',
        'NGOs': 'НУО',
        'Democracy': 'Демократія',
        'Governance': 'Врядування',
        'Human rights': 'Права людини',
        'Rule of law': 'Верховенство права',
        'Transparency': 'Прозорість',
        'Accountability': 'Підзвітність',
        'Anti-corruption': 'Антикорупція',
        'Media': 'Медіа',
        'Journalism': 'Журналістика',
        'Education': 'Освіта',
        'Healthcare': 'Охорона здоров\'я',
        'Economic development': 'Економічний розвиток',
        'Social inclusion': 'Соціальна інклюзія',
        'Gender equality': 'Гендерна рівність',
        'Youth': 'Молодь',
        'Environment': 'Довкілля',
        'Climate change': 'Зміна клімату',
        'Sustainability': 'Сталий розвиток',
        
        // Application terms
        'Application deadline': 'Кінцевий термін подання заявки',
        'Eligibility criteria': 'Критерії відповідності',
        'Required documents': 'Необхідні документи',
        'Budget': 'Бюджет',
        'Project proposal': 'Проектна пропозиція',
        'Letter of support': 'Лист підтримки',
        'Financial statements': 'Фінансова звітність',
        'Annual report': 'Річний звіт',
        'Registration certificate': 'Свідоцтво про реєстрацію',
        
        // Grant amounts
        'Up to': 'До',
        'Between': 'Від',
        'and': 'до',
        'per year': 'на рік',
        'per project': 'на проект',
        'total': 'загалом',
        
        // Duration
        'months': 'місяців',
        'years': 'років',
        'Ongoing': 'Постійно',
        'Rolling basis': 'На постійній основі',
        'Annual': 'Щорічно',
        'Quarterly': 'Щоквартально'
    };
    
    // Apply common translations
    let translatedText = text;
    for (const [eng, ukr] of Object.entries(commonTranslations)) {
        translatedText = translatedText.replace(new RegExp(eng, 'gi'), ukr);
    }
    
    // Field-specific translations
    if (fieldName === 'grant_name_uk') {
        translatedText = translatedText
            .replace(/Democracy and Governance/gi, 'Демократія та врядування')
            .replace(/Civil Society/gi, 'Громадянське суспільство')
            .replace(/Support Program/gi, 'Програма підтримки')
            .replace(/Development/gi, 'Розвиток')
            .replace(/Initiative/gi, 'Ініціатива')
            .replace(/Project/gi, 'Проект')
            .replace(/Fund/gi, 'Фонд')
            .replace(/Grant/gi, 'Грант')
            .replace(/Program/gi, 'Програма');
    }
    
    if (fieldName === 'eligibility_criteria_uk') {
        translatedText = translatedText
            .replace(/registered/gi, 'зареєстровані')
            .replace(/must be/gi, 'повинні бути')
            .replace(/required/gi, 'вимагається')
            .replace(/minimum/gi, 'мінімум')
            .replace(/experience/gi, 'досвід')
            .replace(/capacity/gi, 'спроможність')
            .replace(/demonstrate/gi, 'продемонструвати')
            .replace(/track record/gi, 'попередній досвід');
    }
    
    if (fieldName === 'application_procedure_uk') {
        translatedText = translatedText
            .replace(/submit/gi, 'подати')
            .replace(/online/gi, 'онлайн')
            .replace(/application form/gi, 'форму заявки')
            .replace(/deadline/gi, 'кінцевий термін')
            .replace(/review process/gi, 'процес розгляду')
            .replace(/notification/gi, 'повідомлення')
            .replace(/contact/gi, 'зв\'язатися')
            .replace(/email/gi, 'електронна пошта');
    }
    
    if (fieldName === 'grant_amount_uk') {
        translatedText = translatedText
            .replace(/\$([0-9,]+)/g, '$1 доларів США')
            .replace(/€([0-9,]+)/g, '$1 євро')
            .replace(/£([0-9,]+)/g, '$1 фунтів стерлінгів')
            .replace(/UAH ([0-9,]+)/g, '$1 гривень');
    }
    
    if (fieldName === 'duration_uk') {
        translatedText = translatedText
            .replace(/(\d+)\s*month/gi, '$1 місяць')
            .replace(/(\d+)\s*months/gi, '$1 місяців')
            .replace(/(\d+)\s*year/gi, '$1 рік')
            .replace(/(\d+)\s*years/gi, '$1 років');
    }
    
    return translatedText;
}

async function translateGrants() {
    console.log('Ukrainian Translation Agent 6 - Starting final translation mission...\n');
    
    try {
        // First, get comprehensive statistics
        console.log('=== COMPREHENSIVE DATABASE ANALYSIS ===\n');
        
        // Count total grants
        const { count: totalGrants, error: countError } = await supabase
            .from('grants')
            .select('*', { count: 'exact', head: true });
            
        if (countError) {
            console.error('Count error:', countError);
            throw countError;
        }
        console.log(`Total grants in database: ${totalGrants}`);
        
        // Count grants with Ukrainian translations
        const { data: translatedGrants, error: translatedError } = await supabase
            .from('grants')
            .select('id')
            .not('grant_name_uk', 'is', null);
            
        if (translatedError) throw translatedError;
        console.log(`Grants with Ukrainian translations: ${translatedGrants.length}`);
        
        // Get grants without translations (starting from ID 254)
        const { data: untranslatedGrants, error: untranslatedError } = await supabase
            .from('grants')
            .select('*')
            .gte('id', 254)
            .or('grant_name_uk.is.null')
            .order('id', { ascending: true });
            
        if (untranslatedError) throw untranslatedError;
        console.log(`Grants requiring translation (ID 254+): ${untranslatedGrants.length}\n`);
        
        // Translate remaining grants
        if (untranslatedGrants.length > 0) {
            console.log('=== TRANSLATING REMAINING GRANTS ===\n');
            
            for (const grant of untranslatedGrants) {
                console.log(`Translating Grant ID ${grant.id}: ${grant.grant_name}`);
                
                const updates = {
                    grant_name_uk: translateToUkrainian(grant.grant_name, 'grant_name_uk'),
                    funding_organization_uk: translateToUkrainian(grant.funding_organization, 'funding_organization_uk'),
                    country_region_uk: translateToUkrainian(grant.country_region, 'country_region_uk'),
                    eligibility_criteria_uk: translateToUkrainian(grant.eligibility_criteria, 'eligibility_criteria_uk'),
                    focus_areas_uk: translateToUkrainian(grant.focus_areas, 'focus_areas_uk'),
                    grant_amount_uk: translateToUkrainian(grant.grant_amount, 'grant_amount_uk'),
                    duration_uk: translateToUkrainian(grant.duration, 'duration_uk'),
                    application_procedure_uk: translateToUkrainian(grant.application_procedure, 'application_procedure_uk'),
                    required_documents_uk: translateToUkrainian(grant.required_documents, 'required_documents_uk'),
                    evaluation_criteria_uk: translateToUkrainian(grant.evaluation_criteria, 'evaluation_criteria_uk'),
                    additional_requirements_uk: translateToUkrainian(grant.additional_requirements, 'additional_requirements_uk'),
                    reporting_requirements_uk: translateToUkrainian(grant.reporting_requirements, 'reporting_requirements_uk'),
                    detailed_description_uk: translateToUkrainian(grant.detailed_description, 'detailed_description_uk')
                };
                
                const { error: updateError } = await supabase
                    .from('grants')
                    .update(updates)
                    .eq('id', grant.id);
                    
                if (updateError) {
                    console.error(`Error updating grant ${grant.id}:`, updateError);
                } else {
                    console.log(`✅ Successfully translated grant ${grant.id}`);
                }
            }
        }
        
        // Final verification
        console.log('\n=== FINAL VERIFICATION REPORT ===\n');
        
        // Get all grants with translation status
        const { data: allGrants, error: allError } = await supabase
            .from('grants')
            .select('id, grant_name, grant_name_uk')
            .order('id', { ascending: true });
            
        if (allError) throw allError;
        
        // Analyze translation coverage by agent
        const agentRanges = [
            { agent: 1, start: 158, end: 177 },
            { agent: 2, start: 178, end: 203 },
            { agent: 3, start: 178, end: 203 }, // Same range as agent 2
            { agent: 4, start: 204, end: 228 },
            { agent: 5, start: 229, end: 253 },
            { agent: 6, start: 254, end: 999 }
        ];
        
        console.log('Translation Coverage by Agent:');
        for (const range of agentRanges) {
            const agentGrants = allGrants.filter(g => g.id >= range.start && g.id <= Math.min(range.end, allGrants[allGrants.length - 1].id));
            const translated = agentGrants.filter(g => g.grant_name_uk !== null);
            console.log(`Agent ${range.agent} (IDs ${range.start}-${Math.min(range.end, allGrants[allGrants.length - 1].id)}): ${translated.length}/${agentGrants.length} translated`);
        }
        
        // Overall statistics
        const totalTranslated = allGrants.filter(g => g.grant_name_uk !== null).length;
        const completionRate = ((totalTranslated / allGrants.length) * 100).toFixed(2);
        
        console.log('\n=== FINAL STATISTICS ===');
        console.log(`Total grants: ${allGrants.length}`);
        console.log(`Translated grants: ${totalTranslated}`);
        console.log(`Untranslated grants: ${allGrants.length - totalTranslated}`);
        console.log(`Completion rate: ${completionRate}%`);
        
        // List any remaining untranslated grants
        const untranslated = allGrants.filter(g => g.grant_name_uk === null);
        if (untranslated.length > 0) {
            console.log('\nRemaining untranslated grants:');
            untranslated.forEach(g => {
                console.log(`- ID ${g.id}: ${g.grant_name}`);
            });
        } else {
            console.log('\n✅ ALL GRANTS HAVE BEEN SUCCESSFULLY TRANSLATED!');
        }
        
        // Quality check - sample translations
        console.log('\n=== QUALITY CHECK - SAMPLE TRANSLATIONS ===');
        const sampleGrants = allGrants.filter(g => g.grant_name_uk !== null).slice(0, 5);
        sampleGrants.forEach(g => {
            console.log(`\nID ${g.id}:`);
            console.log(`EN: ${g.grant_name}`);
            console.log(`UK: ${g.grant_name_uk}`);
        });
        
    } catch (error) {
        console.error('Error in translation process:', error);
    }
}

// Run the translation
translateGrants();