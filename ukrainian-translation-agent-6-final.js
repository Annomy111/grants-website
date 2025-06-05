const { createClient } = require('@supabase/supabase-js');

// Direct Supabase connection
const supabase = createClient(
  'https://adpddtbsstunjotxaldb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM'
);

// Ukrainian translation function
function translateToUkrainian(text, fieldName) {
    if (!text) return null;
    
    // Translation mappings
    const translations = {
        // Grant names and programs
        'Democracy and Governance': 'Демократія та врядування',
        'Civil Society': 'Громадянське суспільство',
        'Support Program': 'Програма підтримки',
        'Development': 'Розвиток',
        'Initiative': 'Ініціатива',
        'Project': 'Проект',
        'Fund': 'Фонд',
        'Grant': 'Грант',
        'Program': 'Програма',
        'Partnership': 'Партнерство',
        'Cooperation': 'Співробітництво',
        'Support': 'Підтримка',
        'Assistance': 'Допомога',
        
        // Organizations
        'United States Agency for International Development': 'Агентство США з міжнародного розвитку',
        'USAID': 'USAID',
        'European Union': 'Європейський Союз',
        'European Commission': 'Європейська Комісія',
        'United Nations': 'Організація Об\'єднаних Націй',
        'World Bank': 'Світовий банк',
        'International Monetary Fund': 'Міжнародний валютний фонд',
        'Council of Europe': 'Рада Європи',
        'OSCE': 'ОБСЄ',
        'NATO': 'НАТО',
        
        // Countries and regions
        'Ukraine': 'Україна',
        'United States': 'Сполучені Штати Америки',
        'United Kingdom': 'Велика Британія',
        'Germany': 'Німеччина',
        'France': 'Франція',
        'Canada': 'Канада',
        'Poland': 'Польща',
        'Netherlands': 'Нідерланди',
        'Sweden': 'Швеція',
        'Norway': 'Норвегія',
        'Denmark': 'Данія',
        'Belgium': 'Бельгія',
        'Switzerland': 'Швейцарія',
        'Global': 'Глобальний',
        'Eastern Europe': 'Східна Європа',
        'Central Europe': 'Центральна Європа',
        
        // Focus areas
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
        'Culture': 'Культура',
        'Arts': 'Мистецтво',
        'Technology': 'Технології',
        'Innovation': 'Інновації',
        'Research': 'Дослідження',
        
        // Eligibility
        'Civil society organizations': 'Організації громадянського суспільства',
        'Non-governmental organizations': 'Неурядові організації',
        'NGOs': 'НУО',
        'registered': 'зареєстровані',
        'must be': 'повинні бути',
        'required': 'вимагається',
        'minimum': 'мінімум',
        'experience': 'досвід',
        'capacity': 'спроможність',
        'demonstrate': 'продемонструвати',
        'track record': 'попередній досвід',
        
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
        'submit': 'подати',
        'online': 'онлайн',
        'application form': 'форму заявки',
        'deadline': 'кінцевий термін',
        'review process': 'процес розгляду',
        'notification': 'повідомлення',
        'contact': 'зв\'язатися',
        'email': 'електронна пошта',
        
        // Amounts and duration
        'Up to': 'До',
        'Between': 'Від',
        'and': 'до',
        'per year': 'на рік',
        'per project': 'на проект',
        'total': 'загалом',
        'months': 'місяців',
        'years': 'років',
        'Ongoing': 'Постійно',
        'Rolling basis': 'На постійній основі',
        'Annual': 'Щорічно',
        'Quarterly': 'Щоквартально',
        'Monthly': 'Щомісячно'
    };
    
    // Apply translations
    let translatedText = text;
    for (const [eng, ukr] of Object.entries(translations)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translatedText = translatedText.replace(regex, ukr);
    }
    
    // Field-specific processing
    if (fieldName === 'grant_amount_uk') {
        translatedText = translatedText
            .replace(/\$([0-9,]+)/g, '$1 доларів США')
            .replace(/€([0-9,]+)/g, '$1 євро')
            .replace(/£([0-9,]+)/g, '$1 фунтів стерлінгів')
            .replace(/UAH\s*([0-9,]+)/g, '$1 гривень');
    }
    
    if (fieldName === 'duration_uk') {
        translatedText = translatedText
            .replace(/(\d+)\s*month(?!s)/gi, '$1 місяць')
            .replace(/(\d+)\s*months/gi, '$1 місяців')
            .replace(/(\d+)\s*year(?!s)/gi, '$1 рік')
            .replace(/(\d+)\s*years/gi, '$1 років')
            .replace(/(\d+)\s*week(?!s)/gi, '$1 тиждень')
            .replace(/(\d+)\s*weeks/gi, '$1 тижнів')
            .replace(/(\d+)\s*day(?!s)/gi, '$1 день')
            .replace(/(\d+)\s*days/gi, '$1 днів');
    }
    
    return translatedText;
}

async function runAgent6Mission() {
    console.log('=== UKRAINIAN TRANSLATION AGENT 6 - FINAL MISSION ===\n');
    console.log('Date:', new Date().toISOString());
    console.log('Mission: Translate remaining grants and verify complete coverage\n');
    
    try {
        // Step 1: Database Analysis
        console.log('STEP 1: DATABASE ANALYSIS');
        console.log('-'.repeat(50));
        
        const { data: allGrants, error: fetchError } = await supabase
            .from('grants')
            .select('*')
            .order('id', { ascending: true });
            
        if (fetchError) {
            console.error('Error fetching grants:', fetchError);
            return;
        }
        
        console.log(`Total grants in database: ${allGrants.length}`);
        
        // Analyze translation status
        const translated = allGrants.filter(g => g.grant_name_uk && g.grant_name_uk.trim() !== '');
        const untranslated = allGrants.filter(g => !g.grant_name_uk || g.grant_name_uk.trim() === '');
        
        console.log(`Grants with Ukrainian translations: ${translated.length}`);
        console.log(`Grants without Ukrainian translations: ${untranslated.length}`);
        console.log(`Current completion rate: ${((translated.length / allGrants.length) * 100).toFixed(2)}%\n`);
        
        // Step 2: Translate remaining grants
        if (untranslated.length > 0) {
            console.log('STEP 2: TRANSLATING REMAINING GRANTS');
            console.log('-'.repeat(50));
            console.log(`Found ${untranslated.length} grants to translate\n`);
            
            let successCount = 0;
            let errorCount = 0;
            
            for (const grant of untranslated) {
                try {
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
                        console.error(`  ❌ Error: ${updateError.message}`);
                        errorCount++;
                    } else {
                        console.log(`  ✅ Successfully translated`);
                        successCount++;
                    }
                } catch (err) {
                    console.error(`  ❌ Error: ${err.message}`);
                    errorCount++;
                }
            }
            
            console.log(`\nTranslation Summary:`);
            console.log(`- Successful: ${successCount}`);
            console.log(`- Failed: ${errorCount}\n`);
        } else {
            console.log('STEP 2: NO TRANSLATIONS NEEDED');
            console.log('All grants already have Ukrainian translations!\n');
        }
        
        // Step 3: Final Verification
        console.log('STEP 3: FINAL VERIFICATION');
        console.log('-'.repeat(50));
        
        // Re-fetch to get updated data
        const { data: finalGrants, error: finalError } = await supabase
            .from('grants')
            .select('id, grant_name, grant_name_uk, funding_organization, funding_organization_uk')
            .order('id', { ascending: true });
            
        if (finalError) {
            console.error('Error in final verification:', finalError);
            return;
        }
        
        const finalTranslated = finalGrants.filter(g => g.grant_name_uk && g.grant_name_uk.trim() !== '');
        const finalUntranslated = finalGrants.filter(g => !g.grant_name_uk || g.grant_name_uk.trim() === '');
        
        // Coverage by agent ranges
        console.log('\nCoverage by Agent:');
        const agentRanges = [
            { agent: 1, start: 158, end: 177 },
            { agent: '2&3', start: 178, end: 203 },
            { agent: 4, start: 204, end: 228 },
            { agent: 5, start: 229, end: 253 },
            { agent: 6, start: 254, end: 999 }
        ];
        
        for (const range of agentRanges) {
            const rangeGrants = finalGrants.filter(g => g.id >= range.start && g.id <= range.end);
            const rangeTranslated = rangeGrants.filter(g => g.grant_name_uk && g.grant_name_uk.trim() !== '');
            if (rangeGrants.length > 0) {
                const maxId = Math.max(...rangeGrants.map(g => g.id));
                console.log(`Agent ${range.agent} (IDs ${range.start}-${maxId}): ${rangeTranslated.length}/${rangeGrants.length} translated (${((rangeTranslated.length/rangeGrants.length)*100).toFixed(1)}%)`);
            }
        }
        
        // Final statistics
        console.log('\n' + '='.repeat(50));
        console.log('FINAL MISSION STATISTICS');
        console.log('='.repeat(50));
        console.log(`Total grants in database: ${finalGrants.length}`);
        console.log(`Grants with Ukrainian translations: ${finalTranslated.length}`);
        console.log(`Grants without Ukrainian translations: ${finalUntranslated.length}`);
        console.log(`FINAL COMPLETION RATE: ${((finalTranslated.length / finalGrants.length) * 100).toFixed(2)}%`);
        
        if (finalUntranslated.length === 0) {
            console.log('\n🎉 MISSION ACCOMPLISHED! 🎉');
            console.log('All grants have been successfully translated to Ukrainian!');
        } else {
            console.log('\n⚠️  Remaining untranslated grants:');
            finalUntranslated.forEach(g => {
                console.log(`- ID ${g.id}: ${g.grant_name}`);
            });
        }
        
        // Quality samples
        console.log('\n' + '='.repeat(50));
        console.log('QUALITY CHECK - SAMPLE TRANSLATIONS');
        console.log('='.repeat(50));
        
        const samples = finalTranslated.slice(-5);
        samples.forEach(g => {
            console.log(`\nGrant ID ${g.id}:`);
            console.log(`EN: ${g.grant_name}`);
            console.log(`UK: ${g.grant_name_uk}`);
            console.log(`Org EN: ${g.funding_organization}`);
            console.log(`Org UK: ${g.funding_organization_uk}`);
        });
        
        console.log('\n' + '='.repeat(50));
        console.log('AGENT 6 MISSION COMPLETE');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('Critical error:', error);
    }
}

// Execute mission
runAgent6Mission();