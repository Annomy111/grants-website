const { createClient } = require('@supabase/supabase-js');

// Correct Supabase credentials from .env.supabase
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndTranslateGrants() {
    console.log('Ukrainian Translation Agent 4 - Starting mission...');
    console.log('Checking grants starting from ID 204...\n');
    
    try {
        // Get grants starting from ID 204
        const { data: grants, error } = await supabase
            .from('grants')
            .select('*')
            .gte('id', 204)
            .order('id', { ascending: true })
            .limit(30);
            
        if (error) {
            console.error('Error fetching grants:', error);
            return;
        }
        
        console.log(`Found ${grants.length} grants starting from ID 204`);
        
        // Check which grants need translation
        const grantsNeedingTranslation = grants.filter(grant => 
            !grant.grant_name_uk || 
            !grant.funding_organization_uk || 
            !grant.country_region_uk
        );
        
        console.log(`${grantsNeedingTranslation.length} grants need translation\n`);
        
        // Display the grants we'll translate (limit to 25)
        const grantsToTranslate = grantsNeedingTranslation.slice(0, 25);
        
        console.log('Grants to translate in this batch:');
        grantsToTranslate.forEach((grant, index) => {
            console.log(`\n${index + 1}. ID: ${grant.id}`);
            console.log(`   Grant Name: ${grant.grant_name}`);
            console.log(`   Organization: ${grant.funding_organization}`);
            console.log(`   Country/Region: ${grant.country_region}`);
        });
        
        // Create translations
        console.log('\n\nStarting translation process...\n');
        
        const translations = [];
        
        for (const grant of grantsToTranslate) {
            console.log(`\nTranslating Grant ID ${grant.id}: ${grant.grant_name}`);
            
            const translation = {
                id: grant.id,
                grant_name_uk: translateGrantName(grant.grant_name),
                funding_organization_uk: translateOrganization(grant.funding_organization),
                country_region_uk: translateCountryRegion(grant.country_region),
                eligibility_criteria_uk: translateEligibility(grant.eligibility_criteria),
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
            
            translations.push(translation);
        }
        
        // Generate SQL script
        generateSQLScript(translations);
        
        return translations;
        
    } catch (err) {
        console.error('Error:', err);
    }
}

// Translation functions
function translateGrantName(name) {
    if (!name) return null;
    
    const translations = {
        // Common grant types
        'Grant': 'Грант',
        'Fund': 'Фонд',
        'Program': 'Програма',
        'Programme': 'Програма',
        'Initiative': 'Ініціатива',
        'Support': 'Підтримка',
        'Fellowship': 'Стипендія',
        'Award': 'Премія',
        'Competition': 'Конкурс',
        'Call': 'Конкурс',
        'Opportunity': 'Можливість',
        
        // Common terms
        'Democracy': 'Демократія',
        'Civil Society': 'Громадянське суспільство',
        'Human Rights': 'Права людини',
        'Media': 'Медіа',
        'Development': 'Розвиток',
        'Governance': 'Урядування',
        'Transparency': 'Прозорість',
        'Innovation': 'Інновації',
        'Education': 'Освіта',
        'Youth': 'Молодь',
        'Women': 'Жінки',
        'Gender': 'Гендер',
        'Environment': 'Довкілля',
        'Culture': 'Культура',
        'Arts': 'Мистецтво',
        'Research': 'Дослідження',
        'Capacity Building': 'Розбудова спроможності',
        'Ukraine': 'Україна',
        'Ukrainian': 'Український',
        'Regional': 'Регіональний',
        'Local': 'Місцевий',
        'National': 'Національний',
        'International': 'Міжнародний',
        'Small': 'Малий',
        'Emergency': 'Екстрена',
        'Rapid': 'Швидка',
        'Response': 'Відповідь',
        'Resilience': 'Стійкість',
        'Recovery': 'Відновлення',
        'Reform': 'Реформа',
        'Justice': 'Правосуддя',
        'Peace': 'Мир',
        'Security': 'Безпека',
        'Protection': 'Захист',
        'Advocacy': 'Адвокація',
        'Community': 'Громада',
        'Organization': 'Організація',
        'NGO': 'НУО',
        'Network': 'Мережа',
        'Partnership': 'Партнерство',
        'Collaboration': 'Співпраця',
        'Strengthening': 'Зміцнення',
        'Building': 'Розбудова',
        'Supporting': 'Підтримка',
        'Promoting': 'Сприяння',
        'Advancing': 'Просування',
        'Empowering': 'Розширення можливостей',
        'Enabling': 'Забезпечення',
        'Fostering': 'Сприяння',
        'Enhancing': 'Покращення'
    };
    
    let translated = name;
    
    // Replace known terms
    for (const [eng, ukr] of Object.entries(translations)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateOrganization(org) {
    if (!org) return null;
    
    // Keep original name and add Ukrainian translation if needed
    const orgTranslations = {
        'European Union': 'Європейський Союз',
        'United Nations': 'Організація Об\'єднаних Націй',
        'World Bank': 'Світовий банк',
        'Council of Europe': 'Рада Європи',
        'USAID': 'USAID (Агентство США з міжнародного розвитку)',
        'British Council': 'Британська Рада',
        'German Government': 'Уряд Німеччини',
        'Swiss Agency for Development and Cooperation': 'Швейцарська агенція розвитку та співробітництва',
        'Swedish International Development Agency': 'Шведська агенція міжнародного розвитку',
        'Ministry of Foreign Affairs': 'Міністерство закордонних справ',
        'Embassy': 'Посольство',
        'Foundation': 'Фонд',
        'Institute': 'Інститут',
        'Agency': 'Агенція',
        'Department': 'Департамент',
        'Commission': 'Комісія'
    };
    
    // Check if we have a direct translation
    for (const [eng, ukr] of Object.entries(orgTranslations)) {
        if (org.toLowerCase().includes(eng.toLowerCase())) {
            return `${org} (${ukr})`;
        }
    }
    
    // Keep original for most organization names
    return org;
}

function translateCountryRegion(country) {
    if (!country) return null;
    
    const countryTranslations = {
        'Ukraine': 'Україна',
        'Global': 'Глобальний',
        'Europe': 'Європа',
        'Eastern Europe': 'Східна Європа',
        'Central Europe': 'Центральна Європа',
        'European Union': 'Європейський Союз',
        'United States': 'Сполучені Штати',
        'USA': 'США',
        'United Kingdom': 'Велика Британія',
        'UK': 'Велика Британія',
        'Germany': 'Німеччина',
        'France': 'Франція',
        'Netherlands': 'Нідерланди',
        'Belgium': 'Бельгія',
        'Switzerland': 'Швейцарія',
        'Sweden': 'Швеція',
        'Norway': 'Норвегія',
        'Denmark': 'Данія',
        'Finland': 'Фінляндія',
        'Poland': 'Польща',
        'Czech Republic': 'Чехія',
        'Slovakia': 'Словаччина',
        'Hungary': 'Угорщина',
        'Romania': 'Румунія',
        'Bulgaria': 'Болгарія',
        'Lithuania': 'Литва',
        'Latvia': 'Латвія',
        'Estonia': 'Естонія',
        'Austria': 'Австрія',
        'International': 'Міжнародний',
        'Regional': 'Регіональний',
        'Multiple countries': 'Кілька країн'
    };
    
    return countryTranslations[country] || country;
}

function translateEligibility(criteria) {
    if (!criteria) return null;
    
    // Common eligibility terms translations
    const terms = {
        'Civil society organizations': 'Організації громадянського суспільства',
        'NGOs': 'НУО',
        'Non-profit organizations': 'Неприбуткові організації',
        'Registered': 'Зареєстровані',
        'Legal entity': 'Юридична особа',
        'At least': 'Принаймні',
        'years of experience': 'років досвіду',
        'Track record': 'Досвід роботи',
        'Financial capacity': 'Фінансова спроможність',
        'Operational capacity': 'Операційна спроможність',
        'Based in': 'Розташовані в',
        'Working in': 'Працюють в',
        'Focus on': 'Фокус на',
        'Required': 'Вимагається',
        'Preferred': 'Бажано',
        'Must have': 'Повинні мати',
        'Consortium': 'Консорціум',
        'Partnership': 'Партнерство',
        'Lead applicant': 'Головний заявник',
        'Co-applicants': 'Співзаявники',
        'Minimum budget': 'Мінімальний бюджет',
        'Annual turnover': 'Річний оборот'
    };
    
    let translated = criteria;
    for (const [eng, ukr] of Object.entries(terms)) {
        const regex = new RegExp(eng, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateFocusAreas(areas) {
    if (!areas) return null;
    
    const areaTranslations = {
        'Democracy': 'Демократія',
        'Human Rights': 'Права людини',
        'Good Governance': 'Належне врядування',
        'Rule of Law': 'Верховенство права',
        'Anti-corruption': 'Боротьба з корупцією',
        'Transparency': 'Прозорість',
        'Accountability': 'Підзвітність',
        'Civil Society': 'Громадянське суспільство',
        'Media Freedom': 'Свобода медіа',
        'Freedom of Expression': 'Свобода вираження поглядів',
        'Gender Equality': 'Гендерна рівність',
        'Women\'s Rights': 'Права жінок',
        'Youth': 'Молодь',
        'Education': 'Освіта',
        'Environment': 'Довкілля',
        'Climate Change': 'Зміна клімату',
        'Sustainable Development': 'Сталий розвиток',
        'Social Innovation': 'Соціальні інновації',
        'Community Development': 'Розвиток громад',
        'Capacity Building': 'Розбудова спроможності',
        'Advocacy': 'Адвокація',
        'Research': 'Дослідження',
        'Public Policy': 'Публічна політика',
        'Reform': 'Реформи',
        'Justice': 'Правосуддя',
        'Peacebuilding': 'Миробудування',
        'Conflict Resolution': 'Вирішення конфліктів',
        'Social Cohesion': 'Соціальна згуртованість',
        'Integration': 'Інтеграція',
        'Inclusion': 'Інклюзія',
        'Diversity': 'Різноманіття',
        'Cultural Heritage': 'Культурна спадщина',
        'Arts and Culture': 'Мистецтво та культура'
    };
    
    let translated = areas;
    for (const [eng, ukr] of Object.entries(areaTranslations)) {
        const regex = new RegExp(eng, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateGrantAmount(amount) {
    if (!amount) return null;
    
    const amountTerms = {
        'Up to': 'До',
        'Between': 'Між',
        'and': 'та',
        'Minimum': 'Мінімум',
        'Maximum': 'Максимум',
        'Average': 'В середньому',
        'Approximately': 'Приблизно',
        'per project': 'на проект',
        'per year': 'на рік',
        'total budget': 'загальний бюджет',
        'available': 'доступно',
        'million': 'мільйон',
        'thousand': 'тисяч'
    };
    
    let translated = amount;
    for (const [eng, ukr] of Object.entries(amountTerms)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    // Keep currency symbols and numbers as is
    return translated;
}

function translateDuration(duration) {
    if (!duration) return null;
    
    const durationTerms = {
        'months': 'місяців',
        'month': 'місяць',
        'years': 'років',
        'year': 'рік',
        'weeks': 'тижнів',
        'week': 'тиждень',
        'days': 'днів',
        'day': 'день',
        'Up to': 'До',
        'Minimum': 'Мінімум',
        'Maximum': 'Максимум',
        'Between': 'Між',
        'and': 'та',
        'Approximately': 'Приблизно',
        'Project duration': 'Тривалість проекту',
        'Implementation period': 'Період реалізації'
    };
    
    let translated = duration;
    for (const [eng, ukr] of Object.entries(durationTerms)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateApplicationProcedure(procedure) {
    if (!procedure) return null;
    
    const procedureTerms = {
        'Online application': 'Онлайн заявка',
        'Submit': 'Подати',
        'Application form': 'Форма заявки',
        'Deadline': 'Кінцевий термін',
        'Two-stage process': 'Двоетапний процес',
        'Concept note': 'Концептуальна записка',
        'Full proposal': 'Повна пропозиція',
        'Letter of Intent': 'Лист про наміри',
        'Expression of Interest': 'Вираження зацікавленості',
        'Registration': 'Реєстрація',
        'Required documents': 'Необхідні документи',
        'Template': 'Шаблон',
        'Guidelines': 'Інструкції',
        'Portal': 'Портал',
        'Platform': 'Платформа',
        'Email': 'Електронна пошта',
        'Website': 'Вебсайт',
        'Download': 'Завантажити',
        'Upload': 'Завантажити',
        'Complete': 'Заповнити',
        'Review': 'Огляд',
        'Selection': 'Відбір',
        'Notification': 'Повідомлення',
        'Results': 'Результати'
    };
    
    let translated = procedure;
    for (const [eng, ukr] of Object.entries(procedureTerms)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateRequiredDocuments(documents) {
    if (!documents) return null;
    
    const documentTerms = {
        'Registration certificate': 'Свідоцтво про реєстрацію',
        'Statutes': 'Статут',
        'Charter': 'Статут',
        'Financial statements': 'Фінансова звітність',
        'Audit report': 'Аудиторський звіт',
        'Annual report': 'Річний звіт',
        'Budget': 'Бюджет',
        'Project proposal': 'Проектна пропозиція',
        'Work plan': 'Робочий план',
        'Timeline': 'Графік',
        'CV': 'Резюме',
        'Resume': 'Резюме',
        'Letter of support': 'Лист підтримки',
        'Partnership agreement': 'Угода про партнерство',
        'Bank statement': 'Банківська виписка',
        'Tax certificate': 'Податкова довідка',
        'Legal documents': 'Юридичні документи',
        'Proof of': 'Підтвердження',
        'Certificate': 'Сертифікат',
        'License': 'Ліцензія',
        'Permit': 'Дозвіл',
        'Authorization': 'Авторизація',
        'Declaration': 'Декларація',
        'Signed': 'Підписаний',
        'Certified': 'Засвідчений',
        'Notarized': 'Нотаріально засвідчений',
        'Original': 'Оригінал',
        'Copy': 'Копія',
        'Translation': 'Переклад'
    };
    
    let translated = documents;
    for (const [eng, ukr] of Object.entries(documentTerms)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateEvaluationCriteria(criteria) {
    if (!criteria) return null;
    
    const evaluationTerms = {
        'Relevance': 'Відповідність',
        'Impact': 'Вплив',
        'Sustainability': 'Сталість',
        'Innovation': 'Інноваційність',
        'Feasibility': 'Здійсненність',
        'Cost-effectiveness': 'Економічна ефективність',
        'Technical quality': 'Технічна якість',
        'Methodology': 'Методологія',
        'Experience': 'Досвід',
        'Expertise': 'Експертиза',
        'Capacity': 'Спроможність',
        'Track record': 'Попередні досягнення',
        'Partnership': 'Партнерство',
        'Collaboration': 'Співпраця',
        'Risk management': 'Управління ризиками',
        'Monitoring': 'Моніторинг',
        'Evaluation': 'Оцінка',
        'Results': 'Результати',
        'Outcomes': 'Результати',
        'Outputs': 'Продукти',
        'Indicators': 'Індикатори',
        'Measurable': 'Вимірюваний',
        'Achievable': 'Досяжний',
        'Realistic': 'Реалістичний',
        'Time-bound': 'Обмежений у часі',
        'Quality': 'Якість',
        'Excellence': 'Досконалість'
    };
    
    let translated = criteria;
    for (const [eng, ukr] of Object.entries(evaluationTerms)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateAdditionalRequirements(requirements) {
    if (!requirements) return null;
    
    const requirementTerms = {
        'Co-funding': 'Співфінансування',
        'Match funding': 'Паритетне фінансування',
        'Own contribution': 'Власний внесок',
        'In-kind contribution': 'Натуральний внесок',
        'Percentage': 'Відсоток',
        'Minimum': 'Мінімум',
        'Required': 'Вимагається',
        'Mandatory': 'Обов\'язково',
        'Optional': 'За бажанням',
        'Recommended': 'Рекомендовано',
        'Preferred': 'Бажано',
        'Experience': 'Досвід',
        'Previous projects': 'Попередні проекти',
        'Similar activities': 'Подібна діяльність',
        'Geographic coverage': 'Географічне охоплення',
        'Target groups': 'Цільові групи',
        'Beneficiaries': 'Бенефіціари',
        'Stakeholders': 'Зацікавлені сторони',
        'Partners': 'Партнери',
        'Consortium': 'Консорціум',
        'Network': 'Мережа',
        'Visibility': 'Видимість',
        'Communication': 'Комунікація',
        'Dissemination': 'Поширення',
        'Publicity': 'Публічність',
        'Branding': 'Брендинг',
        'Logo': 'Логотип',
        'Acknowledgment': 'Визнання'
    };
    
    let translated = requirements;
    for (const [eng, ukr] of Object.entries(requirementTerms)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateReportingRequirements(reporting) {
    if (!reporting) return null;
    
    const reportingTerms = {
        'Progress report': 'Звіт про прогрес',
        'Final report': 'Фінальний звіт',
        'Financial report': 'Фінансовий звіт',
        'Narrative report': 'Описовий звіт',
        'Quarterly': 'Щоквартально',
        'Monthly': 'Щомісяця',
        'Annual': 'Щорічно',
        'Semi-annual': 'Піврічний',
        'Bi-annual': 'Двічі на рік',
        'Upon completion': 'Після завершення',
        'Within': 'Протягом',
        'days': 'днів',
        'months': 'місяців',
        'after': 'після',
        'Template': 'Шаблон',
        'Format': 'Формат',
        'Guidelines': 'Інструкції',
        'Requirements': 'Вимоги',
        'Documentation': 'Документація',
        'Evidence': 'Докази',
        'Verification': 'Верифікація',
        'Audit': 'Аудит',
        'Monitoring': 'Моніторинг',
        'Evaluation': 'Оцінка',
        'Indicators': 'Індикатори',
        'Milestones': 'Етапи',
        'Deliverables': 'Результати',
        'Outputs': 'Продукти',
        'Outcomes': 'Результати',
        'Impact': 'Вплив',
        'Lessons learned': 'Отримані уроки',
        'Best practices': 'Найкращі практики'
    };
    
    let translated = reporting;
    for (const [eng, ukr] of Object.entries(reportingTerms)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function translateDetailedDescription(description) {
    if (!description) return null;
    
    // For detailed descriptions, we'll apply comprehensive translation
    let translated = description;
    
    // Apply all translation dictionaries
    const allTerms = {
        // Grant-related terms
        'grant': 'грант',
        'funding': 'фінансування',
        'support': 'підтримка',
        'program': 'програма',
        'programme': 'програма',
        'initiative': 'ініціатива',
        'project': 'проект',
        'activity': 'діяльність',
        'implementation': 'впровадження',
        'development': 'розвиток',
        'capacity building': 'розбудова спроможності',
        'technical assistance': 'технічна допомога',
        'training': 'навчання',
        'workshop': 'семінар',
        'conference': 'конференція',
        'research': 'дослідження',
        'analysis': 'аналіз',
        'study': 'дослідження',
        'assessment': 'оцінка',
        'evaluation': 'оцінювання',
        'monitoring': 'моніторинг',
        'reporting': 'звітування',
        
        // Organizational terms
        'organization': 'організація',
        'institution': 'установа',
        'foundation': 'фонд',
        'association': 'асоціація',
        'network': 'мережа',
        'coalition': 'коаліція',
        'partnership': 'партнерство',
        'consortium': 'консорціум',
        'stakeholder': 'зацікавлена сторона',
        'beneficiary': 'бенефіціар',
        'recipient': 'отримувач',
        'applicant': 'заявник',
        'grantee': 'грантоотримувач',
        
        // Democratic and governance terms
        'democracy': 'демократія',
        'democratic': 'демократичний',
        'governance': 'врядування',
        'good governance': 'належне врядування',
        'transparency': 'прозорість',
        'accountability': 'підзвітність',
        'rule of law': 'верховенство права',
        'human rights': 'права людини',
        'civil society': 'громадянське суспільство',
        'civic': 'громадянський',
        'citizen': 'громадянин',
        'participation': 'участь',
        'engagement': 'залучення',
        'empowerment': 'розширення можливостей',
        'advocacy': 'адвокація',
        'policy': 'політика',
        'reform': 'реформа',
        'change': 'зміна',
        'transformation': 'трансформація',
        
        // Focus areas
        'education': 'освіта',
        'health': 'охорона здоров\'я',
        'environment': 'довкілля',
        'climate': 'клімат',
        'sustainability': 'сталість',
        'sustainable': 'сталий',
        'gender': 'гендер',
        'equality': 'рівність',
        'inclusion': 'інклюзія',
        'diversity': 'різноманіття',
        'youth': 'молодь',
        'women': 'жінки',
        'vulnerable': 'вразливий',
        'marginalized': 'маргіналізований',
        'community': 'громада',
        'local': 'місцевий',
        'regional': 'регіональний',
        'national': 'національний',
        'international': 'міжнародний',
        
        // Action terms
        'strengthen': 'зміцнювати',
        'support': 'підтримувати',
        'promote': 'сприяти',
        'develop': 'розвивати',
        'implement': 'впроваджувати',
        'establish': 'встановлювати',
        'create': 'створювати',
        'build': 'будувати',
        'enhance': 'покращувати',
        'improve': 'поліпшувати',
        'increase': 'збільшувати',
        'expand': 'розширювати',
        'facilitate': 'сприяти',
        'enable': 'уможливлювати',
        'empower': 'надавати можливості',
        'foster': 'сприяти',
        'encourage': 'заохочувати',
        'advance': 'просувати',
        
        // Time-related terms
        'deadline': 'кінцевий термін',
        'duration': 'тривалість',
        'period': 'період',
        'phase': 'фаза',
        'stage': 'етап',
        'timeline': 'графік',
        'schedule': 'розклад',
        'annual': 'річний',
        'monthly': 'місячний',
        'quarterly': 'квартальний',
        'ongoing': 'поточний',
        'continuous': 'безперервний',
        'temporary': 'тимчасовий',
        'permanent': 'постійний',
        
        // Geographic terms
        'Ukraine': 'Україна',
        'Ukrainian': 'український',
        'Europe': 'Європа',
        'European': 'європейський',
        'region': 'регіон',
        'area': 'область',
        'territory': 'територія',
        'district': 'район',
        'municipality': 'муніципалітет',
        'city': 'місто',
        'town': 'містечко',
        'village': 'село',
        'rural': 'сільський',
        'urban': 'міський'
    };
    
    // Apply translations with word boundaries to avoid partial replacements
    for (const [eng, ukr] of Object.entries(allTerms)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, ukr);
    }
    
    return translated;
}

function generateSQLScript(translations) {
    console.log('\n\nGenerating SQL update script...\n');
    
    const sqlStatements = [];
    
    for (const trans of translations) {
        const fields = [];
        
        if (trans.grant_name_uk) fields.push(`grant_name_uk = '${trans.grant_name_uk.replace(/'/g, "''")}'`);
        if (trans.funding_organization_uk) fields.push(`funding_organization_uk = '${trans.funding_organization_uk.replace(/'/g, "''")}'`);
        if (trans.country_region_uk) fields.push(`country_region_uk = '${trans.country_region_uk.replace(/'/g, "''")}'`);
        if (trans.eligibility_criteria_uk) fields.push(`eligibility_criteria_uk = '${trans.eligibility_criteria_uk.replace(/'/g, "''")}'`);
        if (trans.focus_areas_uk) fields.push(`focus_areas_uk = '${trans.focus_areas_uk.replace(/'/g, "''")}'`);
        if (trans.grant_amount_uk) fields.push(`grant_amount_uk = '${trans.grant_amount_uk.replace(/'/g, "''")}'`);
        if (trans.duration_uk) fields.push(`duration_uk = '${trans.duration_uk.replace(/'/g, "''")}'`);
        if (trans.application_procedure_uk) fields.push(`application_procedure_uk = '${trans.application_procedure_uk.replace(/'/g, "''")}'`);
        if (trans.required_documents_uk) fields.push(`required_documents_uk = '${trans.required_documents_uk.replace(/'/g, "''")}'`);
        if (trans.evaluation_criteria_uk) fields.push(`evaluation_criteria_uk = '${trans.evaluation_criteria_uk.replace(/'/g, "''")}'`);
        if (trans.additional_requirements_uk) fields.push(`additional_requirements_uk = '${trans.additional_requirements_uk.replace(/'/g, "''")}'`);
        if (trans.reporting_requirements_uk) fields.push(`reporting_requirements_uk = '${trans.reporting_requirements_uk.replace(/'/g, "''")}'`);
        if (trans.detailed_description_uk) fields.push(`detailed_description_uk = '${trans.detailed_description_uk.replace(/'/g, "''")}'`);
        
        if (fields.length > 0) {
            sqlStatements.push(`UPDATE grants SET ${fields.join(', ')} WHERE id = ${trans.id};`);
        }
    }
    
    const sqlScript = `-- Ukrainian Translation Agent 4 - Batch Update Script
-- Generated on ${new Date().toISOString()}
-- Translating grants from ID 204 onwards

BEGIN;

${sqlStatements.join('\n\n')}

COMMIT;`;
    
    // Save SQL script
    const fs = require('fs');
    fs.writeFileSync('ukrainian-translation-agent-4-updates.sql', sqlScript);
    console.log('SQL script saved to: ukrainian-translation-agent-4-updates.sql');
    
    return sqlScript;
}

// Run the main function
checkAndTranslateGrants();