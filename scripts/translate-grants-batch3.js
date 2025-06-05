const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.mXdJdJB0t1E5Xj_pQkf7LIJlGCMR9qhMgH3v6oP1pM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTranslationStatus() {
    console.log('Checking translation status...\n');
    
    // Get all grants to see which ones need translation
    const { data: grants, error } = await supabase
        .from('grants')
        .select('id, grant_name, grant_name_uk')
        .order('id', { ascending: true });
    
    if (error) {
        console.error('Error fetching grants:', error);
        return;
    }
    
    // Find grants without Ukrainian translations
    const untranslatedGrants = grants.filter(grant => !grant.grant_name_uk);
    const translatedGrants = grants.filter(grant => grant.grant_name_uk);
    
    console.log(`Total grants: ${grants.length}`);
    console.log(`Translated grants: ${translatedGrants.length}`);
    console.log(`Untranslated grants: ${untranslatedGrants.length}`);
    
    // Show which IDs have been translated
    const translatedIds = translatedGrants.map(g => g.id).sort((a, b) => a - b);
    console.log('\nTranslated grant IDs:', translatedIds);
    
    // Show next batch of untranslated grants
    if (untranslatedGrants.length > 0) {
        const nextBatch = untranslatedGrants.slice(0, 25).map(g => ({
            id: g.id,
            name: g.grant_name
        }));
        console.log('\nNext batch to translate:');
        nextBatch.forEach(grant => {
            console.log(`ID ${grant.id}: ${grant.name}`);
        });
        
        return nextBatch.map(g => g.id);
    }
    
    return [];
}

async function translateGrantsBatch(grantIds) {
    console.log(`\nStarting translation of ${grantIds.length} grants...`);
    
    for (const id of grantIds) {
        console.log(`\nTranslating grant ID ${id}...`);
        
        // Fetch the full grant details
        const { data: grant, error } = await supabase
            .from('grants')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            console.error(`Error fetching grant ${id}:`, error);
            continue;
        }
        
        // Prepare Ukrainian translations
        const translations = {
            grant_name_uk: translateGrantName(grant.grant_name),
            funding_organization_uk: translateFundingOrganization(grant.funding_organization),
            country_region_uk: translateCountryRegion(grant.country_region),
            eligibility_criteria_uk: translateEligibilityCriteria(grant.eligibility_criteria),
            focus_areas_uk: translateFocusAreas(grant.focus_areas),
            grant_amount_uk: translateGrantAmount(grant.grant_amount),
            duration_uk: translateDuration(grant.duration),
            application_procedure_uk: translateApplicationProcedure(grant.application_procedure),
            required_documents_uk: translateRequiredDocuments(grant.required_documents),
            evaluation_criteria_uk: translateEvaluationCriteria(grant.evaluation_criteria),
            additional_requirements_uk: translateAdditionalRequirements(grant.additional_requirements),
            reporting_requirements_uk: translateReportingRequirements(grant.reporting_requirements),
            detailed_description_uk: translateDetailedDescription(grant.detailed_description)
        };
        
        // Update the grant with Ukrainian translations
        const { error: updateError } = await supabase
            .from('grants')
            .update(translations)
            .eq('id', id);
        
        if (updateError) {
            console.error(`Error updating grant ${id}:`, updateError);
        } else {
            console.log(`✅ Successfully translated grant ${id}: ${grant.grant_name}`);
        }
    }
}

// Translation functions for each field
function translateGrantName(name) {
    if (!name) return null;
    
    // Specific grant name translations
    const translations = {
        "Ukraine Confidence Building Initiative": "Українська ініціатива зміцнення довіри",
        "Creative Europe Programme": "Програма \"Креативна Європа\"",
        "Eastern Partnership Civil Society Facility": "Інструмент для громадянського суспільства Східного партнерства",
        "Europe for Citizens Programme": "Програма \"Європа для громадян\"",
        "Support to Civil Society": "Підтримка громадянського суспільства",
        "Civil Society Strengthening Platform": "Платформа зміцнення громадянського суспільства",
        "Democratic Governance Facility": "Інструмент демократичного врядування",
        "Youth in Action Programme": "Програма \"Молодь в дії\"",
        "Good Governance Fund": "Фонд належного врядування",
        "Media Development Fund": "Фонд розвитку медіа"
    };
    
    return translations[name] || name;
}

function translateFundingOrganization(org) {
    if (!org) return null;
    
    const translations = {
        "European Union": "Європейський Союз",
        "European Commission": "Європейська Комісія",
        "Council of Europe": "Рада Європи",
        "British Embassy Kyiv": "Посольство Великої Британії в Києві",
        "Swedish International Development Cooperation Agency": "Шведське агентство міжнародного розвитку (SIDA)",
        "German Federal Foreign Office": "Федеральне міністерство закордонних справ Німеччини",
        "Embassy of the Netherlands": "Посольство Нідерландів",
        "International Renaissance Foundation": "Міжнародний фонд \"Відродження\"",
        "Open Society Foundations": "Фонди відкритого суспільства",
        "National Endowment for Democracy": "Національний фонд підтримки демократії"
    };
    
    // If we have a translation, use it; otherwise keep original with Ukrainian note
    if (translations[org]) {
        return translations[org];
    } else {
        return `${org} (${org})`;
    }
}

function translateCountryRegion(region) {
    if (!region) return null;
    
    const translations = {
        "Ukraine": "Україна",
        "Ukraine, Eastern Europe": "Україна, Східна Європа",
        "Ukraine and neighboring countries": "Україна та сусідні країни",
        "Eastern Partnership countries": "Країни Східного партнерства",
        "Europe": "Європа",
        "Global": "Глобальний",
        "International": "Міжнародний"
    };
    
    return translations[region] || region;
}

function translateEligibilityCriteria(criteria) {
    if (!criteria) return null;
    
    // Common patterns to translate
    const patterns = {
        "Civil society organizations": "Організації громадянського суспільства",
        "NGOs": "НУО",
        "non-governmental organizations": "неурядові організації",
        "registered in Ukraine": "зареєстровані в Україні",
        "local communities": "місцеві громади",
        "youth organizations": "молодіжні організації",
        "media outlets": "медіа-організації",
        "independent media": "незалежні медіа",
        "human rights": "права людини",
        "democracy": "демократія",
        "good governance": "належне врядування",
        "transparency": "прозорість",
        "accountability": "підзвітність",
        "civic engagement": "громадська участь",
        "social cohesion": "соціальна згуртованість"
    };
    
    let translated = criteria;
    for (const [eng, ukr] of Object.entries(patterns)) {
        const regex = new RegExp(eng, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateFocusAreas(areas) {
    if (!areas) return null;
    
    const focusAreaTranslations = {
        "Democracy and governance": "Демократія та врядування",
        "Human rights": "Права людини",
        "Civil society development": "Розвиток громадянського суспільства",
        "Media freedom": "Свобода медіа",
        "Anti-corruption": "Боротьба з корупцією",
        "Rule of law": "Верховенство права",
        "Youth engagement": "Залучення молоді",
        "Gender equality": "Гендерна рівність",
        "Social inclusion": "Соціальна інклюзія",
        "Environmental protection": "Захист довкілля",
        "Economic development": "Економічний розвиток",
        "Education": "Освіта",
        "Culture": "Культура",
        "Public health": "Громадське здоров'я"
    };
    
    // Split by common delimiters and translate each area
    const delimiter = areas.includes(';') ? ';' : ',';
    const areasList = areas.split(delimiter).map(area => area.trim());
    const translatedAreas = areasList.map(area => focusAreaTranslations[area] || area);
    
    return translatedAreas.join(delimiter + ' ');
}

function translateGrantAmount(amount) {
    if (!amount) return null;
    
    // Keep the original amount format but translate descriptive text
    const patterns = {
        "Up to": "До",
        "Between": "Від",
        "and": "до",
        "per project": "на проект",
        "per year": "на рік",
        "total budget": "загальний бюджет",
        "available": "доступно",
        "EUR": "євро",
        "USD": "дол. США",
        "UAH": "грн"
    };
    
    let translated = amount;
    for (const [eng, ukr] of Object.entries(patterns)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateDuration(duration) {
    if (!duration) return null;
    
    const patterns = {
        "months": "місяців",
        "month": "місяць",
        "years": "років",
        "year": "рік",
        "Up to": "До",
        "Maximum": "Максимум",
        "Minimum": "Мінімум",
        "Between": "Від",
        "and": "до"
    };
    
    let translated = duration;
    for (const [eng, ukr] of Object.entries(patterns)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateApplicationProcedure(procedure) {
    if (!procedure) return null;
    
    const patterns = {
        "Online application": "Онлайн-заявка",
        "Submit proposal": "Подати пропозицію",
        "Application form": "Форма заявки",
        "Deadline": "Кінцевий термін",
        "Rolling basis": "На постійній основі",
        "Call for proposals": "Конкурс проектів",
        "Two-stage process": "Двоетапний процес",
        "Concept note": "Концептуальна записка",
        "Full proposal": "Повна пропозиція",
        "Partnership required": "Необхідне партнерство",
        "Letter of intent": "Лист про наміри"
    };
    
    let translated = procedure;
    for (const [eng, ukr] of Object.entries(patterns)) {
        const regex = new RegExp(eng, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateRequiredDocuments(documents) {
    if (!documents) return null;
    
    const patterns = {
        "Project proposal": "Проектна пропозиція",
        "Budget": "Бюджет",
        "Registration documents": "Реєстраційні документи",
        "Financial statements": "Фінансові звіти",
        "CV": "Резюме",
        "References": "Рекомендації",
        "Partnership agreements": "Партнерські угоди",
        "Audit report": "Аудиторський звіт",
        "Annual report": "Річний звіт",
        "Statutes": "Статут",
        "Work plan": "Робочий план",
        "Timeline": "Часовий графік"
    };
    
    let translated = documents;
    for (const [eng, ukr] of Object.entries(patterns)) {
        const regex = new RegExp(eng, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateEvaluationCriteria(criteria) {
    if (!criteria) return null;
    
    const patterns = {
        "Relevance": "Відповідність",
        "Impact": "Вплив",
        "Sustainability": "Сталість",
        "Innovation": "Інноваційність",
        "Feasibility": "Здійсненність",
        "Cost-effectiveness": "Економічна ефективність",
        "Technical quality": "Технічна якість",
        "Organizational capacity": "Організаційна спроможність",
        "Partnership quality": "Якість партнерства",
        "Gender mainstreaming": "Гендерна інтеграція"
    };
    
    let translated = criteria;
    for (const [eng, ukr] of Object.entries(patterns)) {
        const regex = new RegExp(eng, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateAdditionalRequirements(requirements) {
    if (!requirements) return null;
    
    const patterns = {
        "Co-funding required": "Необхідне співфінансування",
        "Matching funds": "Відповідне фінансування",
        "Previous experience": "Попередній досвід",
        "Minimum": "Мінімум",
        "years": "років",
        "Local partner required": "Необхідний місцевий партнер",
        "Consortium": "Консорціум",
        "Lead applicant": "Головний заявник"
    };
    
    let translated = requirements;
    for (const [eng, ukr] of Object.entries(patterns)) {
        const regex = new RegExp(eng, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateReportingRequirements(reporting) {
    if (!reporting) return null;
    
    const patterns = {
        "Quarterly reports": "Квартальні звіти",
        "Annual report": "Річний звіт",
        "Financial report": "Фінансовий звіт",
        "Narrative report": "Описовий звіт",
        "Progress report": "Звіт про прогрес",
        "Final report": "Фінальний звіт",
        "Audit": "Аудит",
        "External evaluation": "Зовнішня оцінка",
        "Mid-term review": "Проміжний огляд"
    };
    
    let translated = reporting;
    for (const [eng, ukr] of Object.entries(patterns)) {
        const regex = new RegExp(eng, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateDetailedDescription(description) {
    if (!description) return null;
    
    // For detailed descriptions, we'll do more comprehensive translation
    const patterns = {
        "This grant": "Цей грант",
        "The program": "Програма",
        "aims to": "має на меті",
        "supports": "підтримує",
        "civil society organizations": "організації громадянського суспільства",
        "democracy": "демократія",
        "human rights": "права людини",
        "governance": "врядування",
        "transparency": "прозорість",
        "accountability": "підзвітність",
        "capacity building": "розбудова спроможності",
        "institutional development": "інституційний розвиток",
        "advocacy": "адвокація",
        "monitoring": "моніторинг",
        "implementation": "впровадження",
        "sustainability": "сталість",
        "community": "громада",
        "citizens": "громадяни",
        "participation": "участь",
        "engagement": "залучення",
        "empowerment": "розширення можливостей",
        "reform": "реформа",
        "development": "розвиток",
        "strengthening": "зміцнення",
        "improvement": "покращення",
        "support": "підтримка",
        "assistance": "допомога",
        "cooperation": "співпраця",
        "partnership": "партнерство",
        "network": "мережа",
        "platform": "платформа",
        "initiative": "ініціатива",
        "project": "проект",
        "activity": "діяльність",
        "service": "послуга",
        "training": "навчання",
        "workshop": "семінар",
        "conference": "конференція",
        "research": "дослідження",
        "analysis": "аналіз",
        "evaluation": "оцінка",
        "assessment": "оцінювання"
    };
    
    let translated = description;
    for (const [eng, ukr] of Object.entries(patterns)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

// Main execution
async function main() {
    console.log('Ukrainian Translation Agent 3 - Starting work...');
    console.log('Mission: Translate the next batch of grants after IDs 158-203\n');
    
    // First check the current status
    const grantIds = await checkTranslationStatus();
    
    if (grantIds.length > 0) {
        // Translate the next batch (up to 25 grants)
        const batchToTranslate = grantIds.slice(0, 25);
        await translateGrantsBatch(batchToTranslate);
        
        console.log('\n✅ Translation batch completed!');
        console.log(`Translated grant IDs: ${batchToTranslate.join(', ')}`);
    } else {
        console.log('\n✅ All grants have been translated!');
    }
}

// Run the script
main().catch(console.error);