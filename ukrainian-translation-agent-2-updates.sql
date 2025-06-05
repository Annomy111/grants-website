-- Ukrainian Translation Agent 2 - Database Update Script
-- Generated on: 2025-06-05T14:08:37.894Z
-- Target: Grants 178-203 (25 grants)
-- Agent: Ukrainian Translation Agent 2

-- Begin transaction
BEGIN;

UPDATE grants SET
    grant_name_uk = 'Гранти Чорноморського Трасту Регіонального Співробітництва',
    funding_organization_uk = 'Німецький фонд Маршалла (GMF) - Чорноморський траст',
    country_region_uk = 'Чорноморський регіон',
    eligibility_criteria_uk = 'Organizations in Black Sea region countries (Armenia, Azerbaijan, Bulgaria, Georgia, Moldova, Romania, Turkey, Україна), громадянське суспільство groups',
    focus_areas_uk = 'Democratic development, Regional cooperation, громадянське суспільство strengthening, Conflict resolution, Cross-border ties',
    grant_amount_uk = 'Contact BST for фінансування amounts',
    duration_uk = 'Project-based',
    application_procedure_uk = 'Contact Black Sea Trust directly through GMF website contact page or email for грант заявка procedures',
    required_documents_uk = 'Contact BST for document вимоги',
    evaluation_criteria_uk = 'Projects addressing демократія, regional cooperation, громадянське суспільство strengthening, and social advancement in Black Sea region',
    additional_requirements_uk = 'Focus on regional cooperation in Black Sea region including Україна. Contact BST directly for current opportunities.',
    reporting_requirements_uk = 'Standard BST звітність вимоги apply',
    detailed_description_uk = 'Black Sea Trust promotes regional cooperation and громадянське суспільство development. Contact directly for грант opportunities and заявка procedures.'
WHERE id = 178;

UPDATE grants SET
    grant_name_uk = 'Гранти Європейського Фонду Демократії',
    funding_organization_uk = 'Європейський фонд демократії (EED)',
    country_region_uk = 'ЄС/Міжнародний',
    eligibility_criteria_uk = 'Organizations promoting демократія in EU neighborhood and beyond',
    focus_areas_uk = 'демократія promotion, громадянське суспільство support, медіа freedom',
    grant_amount_uk = 'Flexible фінансування',
    duration_uk = 'Varies',
    application_procedure_uk = 'Contact European Endowment for демократія directly for грант заявка procedures and current opportunities',
    additional_requirements_uk = 'Focus on демократія support, громадянське суспільство development, democratic institutions.',
    detailed_description_uk = 'European Endowment for демократія supports democratic development. Contact foundation directly for грант opportunities and заявка procedures.'
WHERE id = 179;

UPDATE grants SET
    grant_name_uk = 'Гранти Міжнародного Фонду Відродження',
    funding_organization_uk = 'МФВ/Відкрите суспільство',
    country_region_uk = 'Україна/Міжнародний',
    eligibility_criteria_uk = 'громадянське суспільство organizations working in areas of EU integration, anti-corruption, права людини, social services, veterans support. Organizations must demonstrate прозорість and reliability.',
    focus_areas_uk = 'EU integration, anti-corruption, права людини, social services, veterans support',
    grant_amount_uk = 'Variable amounts based on program and project scope',
    duration_uk = 'Varies by program',
    application_procedure_uk = 'Download заявка form from IRF website, Submit online via https://contests.irf.ua/index.php. заявкаs reviewed by Expert Councils consisting of independent experts in specific fields. Board of the Fund makes final determination.',
    required_documents_uk = 'заявка form (available for download from website), Project proposal, Organizational documentation, Annual reports demonstrating organizational прозорість and openness',
    evaluation_criteria_uk = 'Projects evaluated by Expert Councils of independent experts in specific fields. Criteria include project relevance, organizational capacity, прозорість, and alignment with IRF priorities (EU integration, anti-corruption, права людини, social services, veterans support).',
    additional_requirements_uk = 'Organizations encouraged to publish annual reports demonstrating openness and reliability. Decisions are final and cannot be reviewed. Grounds for support/rejection are not reported.',
    reporting_requirements_uk = 'Standard project звітність and annual organizational reports encouraged for прозорість'
WHERE id = 180;

UPDATE grants SET
    grant_name_uk = 'Підтримка України від Фонду Стефана Баторія',
    funding_organization_uk = 'Фонд Стефана Баторія',
    country_region_uk = 'Польща/Україна',
    eligibility_criteria_uk = 'український and Polish CSOs working on Україна issues',
    focus_areas_uk = 'Democratic development, громадянське суспільство support, Polish-український cooperation',
    grant_amount_uk = 'Varies',
    duration_uk = 'Project-based',
    application_procedure_uk = 'Contact foundation directly for заявка procedures. Україна Solidarity Fund provides institutional support to social organizations.',
    required_documents_uk = 'Contact foundation for specific document вимоги',
    additional_requirements_uk = 'Focus on гуманітарний assistance, medical support, legal and psychological aid, long-term support for people fleeing war in Україна',
    detailed_description_uk = 'Україна Solidarity Fund offers institutional support including direct гуманітарний assistance, medical support, legal and psychological aid, accommodation, employment, child care, and adaptation support.'
WHERE id = 181;

UPDATE grants SET
    grant_name_uk = 'Малі гранти Посольства Нідерландів',
    funding_organization_uk = 'Міністерство закордонних справ Нідерландів',
    country_region_uk = 'Нідерланди/Україна',
    eligibility_criteria_uk = 'український CSOs and local organizations',
    focus_areas_uk = 'права людини, rule of law, громадянське суспільство development',
    grant_amount_uk = 'Small грантs program',
    duration_uk = 'Project-based',
    application_procedure_uk = 'Contact Netherlands Embassy in Україна directly for small грантs заявка procedures',
    additional_requirements_uk = 'Embassy-administered грантs program. Direct contact with embassy required for критерії відповідності and заявка details.',
    detailed_description_uk = 'Netherlands Embassy small грантs program. Contact embassy directly for заявка procedures, критерії відповідності criteria, and current opportunities.'
WHERE id = 182;

UPDATE grants SET
    grant_name_uk = 'Програма України Французького Агентства Розвитку',
    funding_organization_uk = 'AFD (Французьке агентство розвитку)',
    country_region_uk = 'Франція/Україна',
    eligibility_criteria_uk = 'український CSOs and municipalities',
    focus_areas_uk = 'Urban development, energy transition, управління, громадянське суспільство support',
    grant_amount_uk = 'Varies by project',
    duration_uk = 'Multi-year',
    application_procedure_uk = 'Contact AFD (Agence Française de Développement) directly for Україна program заявкаs and фінансування opportunities',
    additional_requirements_uk = 'French development cooperation focus. Contact local or regional office for specific opportunities.',
    detailed_description_uk = 'AFD provides development cooperation and фінансування programs. Contact directly for Україна-specific opportunities and заявка procedures.'
WHERE id = 183;

UPDATE grants SET
    grant_name_uk = 'Ініціатива ЄБРР для Громад',
    funding_organization_uk = 'Європейський банк реконструкції та розвитку',
    country_region_uk = 'Міжнародний',
    eligibility_criteria_uk = 'CSOs in EBRD countries of operation including Україна',
    focus_areas_uk = 'Community development, economic inclusion, довкілляal sustainability',
    grant_amount_uk = 'до 50000 євро',
    duration_uk = 'до 2 років',
    application_procedure_uk = 'Contact EBRD directly for Community Initiative грантs and громадянське суспільство фінансування opportunities',
    additional_requirements_uk = 'Focus on громадянське суспільство initiatives and community development projects.',
    detailed_description_uk = 'EBRD Community Initiative supports громадянське суспільство organizations. Contact EBRD for заявка procedures and current opportunities.'
WHERE id = 184;

UPDATE grants SET
    grant_name_uk = 'Гранти Фонду Конрада Аденауера для України',
    funding_organization_uk = 'Фонд Конрада Аденауера',
    country_region_uk = 'Німеччина/Україна',
    eligibility_criteria_uk = 'український think tanks and громадянське суспільство organizations',
    focus_areas_uk = 'Political освіта, демократія promotion, rule of law, European integration',
    grant_amount_uk = 'Project-based фінансування',
    duration_uk = 'Varies',
    application_procedure_uk = 'Apply through KAS Scholarship Portal (VIBESA) at https://campus.kas.de/. Contact Kyiv office for specific program заявкаs.',
    required_documents_uk = 'Contact office for specific вимоги based on program type',
    additional_requirements_uk = 'Scholarships, internships, and Young Leaders in Politics program available. Digital learning through Adenauer Campus.',
    detailed_description_uk = 'Offers scholarships through VIBESA portal, internships in Kyiv and Kharkiv offices, Young Leaders in Politics program, and digital learning opportunities through Adenauer Campus.'
WHERE id = 185;

UPDATE grants SET
    grant_name_uk = 'Підтримка України від Фонду Фрідріха Еберта',
    funding_organization_uk = 'Фонд Фрідріха Еберта',
    country_region_uk = 'Німеччина/Україна',
    eligibility_criteria_uk = 'Trade unions and громадянське суспільство organizations',
    focus_areas_uk = 'Social демократія, labor rights, social justice, political participation',
    grant_amount_uk = 'Project грантs',
    duration_uk = 'Project-based',
    application_procedure_uk = 'Contact Україна office directly for заявка procedures and current opportunities',
    additional_requirements_uk = 'Contact office for specific program вимоги and критерії відповідності criteria'
WHERE id = 186;

UPDATE grants SET
    grant_name_uk = 'Програма України Фонду Генріха Бьолля',
    funding_organization_uk = 'Фонд Генріха Бьолля',
    country_region_uk = 'Німеччина/Україна',
    eligibility_criteria_uk = 'довкілляal and права людини CSOs',
    focus_areas_uk = 'Green transformation, демократія, гендерна рівність, права людини',
    grant_amount_uk = 'Small to medium грантs',
    duration_uk = 'Varies',
    application_procedure_uk = 'Contact Україна office directly for заявка procedures. Focus on демократія, climate/energy, and gender issues.',
    additional_requirements_uk = 'Programs focus on демократія building, climate and energy issues, and гендерна рівність initiatives',
    detailed_description_uk = 'Works in areas of демократія, climate/energy, and gender issues. Contact office directly for фінансування opportunities and заявка procedures.'
WHERE id = 187;

UPDATE grants SET
    grant_name_uk = 'Програма ЦСЄ Фонду Чарльза Стюарта Мотта',
    funding_organization_uk = 'Фонд Чарльза Стюарта Мотта',
    country_region_uk = 'США/Міжнародний',
    eligibility_criteria_uk = 'CSOs in Central and Eastern Europe including Україна',
    focus_areas_uk = 'громадянське суспільство strengthening, community foundations, philanthropy development',
    grant_amount_uk = '500000 доларів США-2 доларів США million',
    duration_uk = 'Multi-year',
    application_procedure_uk = 'Visit Mott Foundation грантs Database or contact foundation for Central and Eastern Europe program заявкаs',
    additional_requirements_uk = 'Focus on громадянське суспільство, democratic foundations, and regional cooperation.',
    detailed_description_uk = 'Mott Foundation supports громадянське суспільство and democratic institutions in Central and Eastern Europe. Check грантs Database for current opportunities.'
WHERE id = 188;

UPDATE grants SET
    grant_name_uk = 'Фонд Роберта Боша для Східної Європи',
    funding_organization_uk = 'Фонд Роберта Боша',
    country_region_uk = 'Німеччина/Міжнародний',
    eligibility_criteria_uk = 'CSOs promoting German-український cooperation',
    focus_areas_uk = 'освіта, громадянське суспільство, international understanding, conflict transformation',
    grant_amount_uk = 'Project грантs',
    duration_uk = 'Varies',
    application_procedure_uk = 'Contact Robert Bosch Stiftung for Eastern Europe program заявкаs and фінансування opportunities',
    additional_requirements_uk = 'Focus on Eastern European initiatives and громадянське суспільство development.',
    detailed_description_uk = 'Robert Bosch Stiftung supports Eastern European programs. Contact foundation for specific opportunities and заявка procedures.'
WHERE id = 189;

UPDATE grants SET
    grant_name_uk = 'Канадський фонд місцевих ініціатив для України',
    funding_organization_uk = 'Глобальні справи Канади',
    country_region_uk = 'Канада/Україна',
    eligibility_criteria_uk = 'український CSOs and community organizations',
    focus_areas_uk = 'права людини, демократія, rule of law, гендерна рівність',
    grant_amount_uk = 'CAD 10,000-50,000',
    duration_uk = 'до 12 місяців',
    application_procedure_uk = 'Contact Canadian Embassy in Україна for Canada Fund for Local Initiatives (CFLI) заявка procedures',
    additional_requirements_uk = 'Embassy-administered fund supporting local initiatives. Direct embassy contact required.',
    detailed_description_uk = 'Canada Fund for Local Initiatives supports grassroots projects in Україна. Contact Canadian Embassy for заявка procedures and критерії відповідності вимоги.'
WHERE id = 190;

UPDATE grants SET
    grant_name_uk = 'Японська програма грантів для народних ініціатив',
    funding_organization_uk = 'Посольство Японії в Україні',
    country_region_uk = 'Японія/Україна',
    eligibility_criteria_uk = 'Non-profit organizations and local authorities',
    focus_areas_uk = 'Basic human needs, освіта, health, community development',
    grant_amount_uk = 'до 90000 доларів США',
    duration_uk = '1 year',
    application_procedure_uk = 'Contact Japanese Embassy in Україна for Grassroots грант Program заявка procedures',
    evaluation_criteria_uk = 'Projects evaluated on: community impact, sustainability, human security contribution, local ownership, and project feasibility.',
    additional_requirements_uk = 'Embassy-administered grassroots грантs. Direct embassy contact required for заявка details.',
    reporting_requirements_uk = 'Regular progress and final reports required with emphasis on community-level outcomes and beneficiary impact.',
    detailed_description_uk = 'Japan Grassroots грант Program supports community-level projects. Contact Japanese Embassy in Україна for заявка procedures and критерії відповідності criteria.'
WHERE id = 191;

UPDATE grants SET
    grant_name_uk = 'Підтримка України від Норвезького Гельсінського Комітету',
    funding_organization_uk = 'Норвезький Гельсінський комітет',
    country_region_uk = 'Норвегія/Україна',
    eligibility_criteria_uk = 'права людини organizations in Україна',
    focus_areas_uk = 'права людини моніторинг, legal aid, адвокація, documentation',
    grant_amount_uk = 'Small to medium грантs',
    duration_uk = 'Project-based',
    application_procedure_uk = 'Contact organization directly for заявка procedures and current фінансування opportunities',
    evaluation_criteria_uk = 'Projects evaluated on: права людини impact, documentation quality, підзвітність contribution, and democratic development outcomes.',
    additional_requirements_uk = 'Focus on права людини work and campaigns. Contact for Україна-specific support programs.',
    reporting_requirements_uk = 'Regular звітність on права людини outcomes and documentation according to NHC standards.',
    detailed_description_uk = 'Norwegian права людини organization working on campaigns and права людини initiatives. Direct contact recommended for Україна support programs.'
WHERE id = 192;

UPDATE grants SET
    grant_name_uk = 'Програми України організації "Люди в потребі"',
    funding_organization_uk = 'Люди в потребі',
    country_region_uk = 'Чехія/Україна',
    eligibility_criteria_uk = 'Local CSOs and community organizations',
    focus_areas_uk = 'гуманітарний aid, resilience building, social cohesion, clean energy transition',
    grant_amount_uk = 'Varies by program',
    duration_uk = 'Varies',
    application_procedure_uk = 'Contact organization directly through their contact page for partnership and collaboration opportunities',
    evaluation_criteria_uk = 'Projects evaluated on: гуманітарний impact, community resilience building, громадянське суспільство strengthening, and organizational capacity.',
    additional_requirements_uk = 'International гуманітарний organization. Works with donors including Swiss Agency for Development, Україна гуманітарний Fund, European Commission, Czech MFA, USAID.',
    reporting_requirements_uk = 'Regular звітність on гуманітарний outcomes and громадянське суспільство development metrics.',
    detailed_description_uk = 'International гуманітарний organization with multiple donor partnerships. Contact directly for specific partnership and фінансування opportunities.'
WHERE id = 193;

UPDATE grants SET
    grant_name_uk = 'Партнерські гранти Карітас України',
    funding_organization_uk = 'Карітас Інтернаціоналіс',
    country_region_uk = 'Міжнародний/Україна',
    eligibility_criteria_uk = 'Local faith-based and secular CSOs',
    focus_areas_uk = 'гуманітарний assistance, social services, community support, winterization',
    grant_amount_uk = 'Partnership-based',
    duration_uk = 'Varies',
    application_procedure_uk = 'Contact Caritas Україна directly for partnership and фінансування opportunities. Focus on гуманітарний assistance and social programs.',
    evaluation_criteria_uk = 'Projects evaluated on: гуманітарний impact, community benefit, alignment with Caritas mission, and organizational capacity.',
    additional_requirements_uk = 'Organizations should align with Caritas values and have experience in гуманітарний or social programming.',
    reporting_requirements_uk = 'Regular звітність on гуманітарний outcomes and community impact according to Caritas standards.',
    detailed_description_uk = 'Caritas Україна provides partnership грантs for гуманітарний and social programs, focusing on supporting vulnerable populations and community development initiatives.'
WHERE id = 194;

UPDATE grants SET
    grant_name_uk = 'Програми охорони здоров''я ВООЗ України',
    funding_organization_uk = 'Всесвітня організація охорони здоров''я України',
    country_region_uk = 'ООН/Україна',
    eligibility_criteria_uk = 'Health-focused CSOs and organizations',
    focus_areas_uk = 'Health sector support, COVID-19 response, health system strengthening',
    grant_amount_uk = 'Varies',
    duration_uk = 'надзвичайна ситуація/project-based',
    application_procedure_uk = 'Contact WHO Country Office in Україна directly for health грант and фінансування information',
    required_documents_uk = 'Health project proposal, organizational health expertise, budget, partnership agreements',
    evaluation_criteria_uk = 'Health sector relevance, technical capacity, community impact, sustainability',
    additional_requirements_uk = 'Focus on health programs and initiatives. Contact country office for specific opportunities.',
    reporting_requirements_uk = 'Health outcome reports, financial statements, моніторинг data',
    detailed_description_uk = 'WHO Country Office provides health programs and initiatives. Direct contact recommended for фінансування opportunities and partnerships.'
WHERE id = 196;

UPDATE grants SET
    grant_name_uk = 'Підтримка міграції МОМ України',
    funding_organization_uk = 'Міжнародна організація з міграції України',
    country_region_uk = 'ООН/Україна',
    eligibility_criteria_uk = 'CSOs working with displaced populations',
    focus_areas_uk = 'Migration Management, криза Response, International Cooperation and Partnerships',
    grant_amount_uk = 'Small to medium грантs',
    duration_uk = '6-12 місяців',
    application_procedure_uk = 'Contact IOM Україна office directly for community stabilization грантs and фінансування opportunities',
    required_documents_uk = 'Project proposal, organizational documents, migration expertise evidence, partnership letters',
    evaluation_criteria_uk = 'Migration focus relevance, technical capacity, local partnerships, sustainability',
    additional_requirements_uk = 'Focus on community відновлення efforts including Україна Community відновлення Fund initiatives.',
    reporting_requirements_uk = 'Monthly/quarterly reports, beneficiary data, impact assessment',
    detailed_description_uk = 'International Organization for Migration working on community відновлення efforts. Contact Kyiv office at 8 Mykhailivska Street for specific грант opportunities.'
WHERE id = 197;

UPDATE grants SET
    grant_name_uk = 'Партнерства ЮНІСЕФ України',
    funding_organization_uk = 'ЮНІСЕФ України',
    country_region_uk = 'ООН/Україна',
    eligibility_criteria_uk = 'Child-focused organizations',
    focus_areas_uk = 'Child rights, освіта, Health, гуманітарний action and emergencies, надзвичайна ситуація relief and response',
    grant_amount_uk = 'Partnership-based',
    duration_uk = 'Varies',
    application_procedure_uk = 'Visit Partnership with UNICEF section on website or contact directly for partnership and collaboration opportunities',
    required_documents_uk = 'Partnership proposal, organization capacity assessment, child protection policies, budget details',
    evaluation_criteria_uk = 'Child-focused approach, organizational capacity, local community engagement, sustainability',
    additional_requirements_uk = 'Focus on child welfare and освіта programs. Multiple partnership types available.',
    reporting_requirements_uk = 'Detailed progress reports, financial підзвітність, child protection compliance',
    detailed_description_uk = 'UNICEF Україна offers various partnership opportunities. Check Partnership with UNICEF section on website or contact directly for collaboration possibilities.'
WHERE id = 198;

UPDATE grants SET
    grant_name_uk = 'Підтримка сільського господарства ФАО України',
    funding_organization_uk = 'Продовольча та сільськогосподарська організація (ФАО) України',
    country_region_uk = 'ООН/Україна',
    eligibility_criteria_uk = 'Agricultural cooperatives and rural CSOs',
    focus_areas_uk = 'Agriculture, food security, rural development',
    grant_amount_uk = 'Project-based',
    duration_uk = 'Varies',
    application_procedure_uk = 'Contact FAO Україна office directly for agricultural support грантs and фінансування opportunities',
    evaluation_criteria_uk = 'Projects evaluated on: food security impact, agricultural відновлення contribution, rural livelihood improvement, and organizational capacity in agricultural sector.',
    additional_requirements_uk = 'Focus on agricultural and food security programs. Contact local office for specific opportunities.',
    reporting_requirements_uk = 'Regular technical and financial звітність according to FAO standards with emphasis on agricultural outcomes and food security metrics.',
    detailed_description_uk = 'FAO provides agricultural support and food security programs in Україна. Contact local office for грант opportunities and partnership possibilities.'
WHERE id = 199;

UPDATE grants SET
    grant_name_uk = 'Співробітництво Enabel Бельгія-Україна',
    funding_organization_uk = 'Enabel - Бельгійське агентство розвитку',
    country_region_uk = 'Бельгія/Україна',
    eligibility_criteria_uk = 'український CSOs and local organizations',
    focus_areas_uk = 'Climate change & довкілля, Peace and security, Social and economic inequality, Urbanisation, Human mobility, Sustainable agriculture, Digitalisation, освіта and employment, Energy, гендерна рівність, Health, інновації',
    grant_amount_uk = 'Small грантs available',
    duration_uk = 'Project-based',
    application_procedure_uk = 'Contact Enabel directly for Україна program заявкаs and фінансування opportunities',
    required_documents_uk = 'Project concept note, organizational profile, detailed budget, risk assessment',
    evaluation_criteria_uk = 'Strategic alignment with Enabel priorities, technical feasibility, local partnerships',
    additional_requirements_uk = 'Focus on energy and circular construction, health and social protection, освіта and employment in Україна.',
    reporting_requirements_uk = 'Project progress reports, financial звітність, impact оцінювання',
    detailed_description_uk = 'Enabel focuses on key areas such as energy and circular construction, health and social protection, as well as освіта and employment in Україна. Contact directly for specific opportunities.'
WHERE id = 200;

UPDATE grants SET
    grant_name_uk = 'Програми України Австрійського Агентства Розвитку',
    funding_organization_uk = 'Австрійське агентство розвитку (ADA)',
    country_region_uk = 'Австрія/Україна',
    eligibility_criteria_uk = 'CSOs promoting Austrian-український cooperation',
    focus_areas_uk = 'освіта, Peacebuilding, гендерна рівність, Good управління, гуманітарний Aid, довкілля and Climate Protection, Water/Energy/Food Security, Private Sector Development',
    grant_amount_uk = 'Co-financing available',
    duration_uk = 'Multi-year possible',
    application_procedure_uk = 'Submit project proposals through annual calls for заявкаs. Focus on projects that promote сталий розвиток and Austrian-український cooperation.',
    required_documents_uk = 'Detailed project proposal, organizational documents, budget breakdown, partnership agreements if applicable',
    evaluation_criteria_uk = 'Project relevance, organizational capacity, sustainability, інновації, гендерна рівність integration',
    additional_requirements_uk = 'Projects must demonstrate clear development impact and promote cooperation between Austrian and український institutions.',
    reporting_requirements_uk = 'Regular progress reports, financial підзвітність, outcome measurements',
    detailed_description_uk = 'Austrian Development Agency provides co-financing and support for projects promoting Austrian-український cooperation in higher освіта, vocational навчання, social services, and regional development.'
WHERE id = 201;

UPDATE grants SET
    grant_name_uk = 'Підтримка Фінляндії для України',
    funding_organization_uk = 'Міністерство закордонних справ Фінляндії',
    country_region_uk = 'Фінляндія/Україна',
    eligibility_criteria_uk = 'Finnish and український CSOs',
    focus_areas_uk = 'криза response, відбудова, громадянське суспільство support, освіта',
    grant_amount_uk = 'Part of broader support',
    duration_uk = 'Varies',
    application_procedure_uk = 'Contact Finnish Ministry of Foreign Affairs or Finnish Embassy in Україна for support program заявкаs',
    evaluation_criteria_uk = 'Projects evaluated on: криза response effectiveness, відбудова impact, громадянське суспільство strengthening, освітаal outcomes, and sustainability.',
    additional_requirements_uk = 'Government-administered support programs. Contact Finnish authorities for критерії відповідності and заявка details.',
    reporting_requirements_uk = 'Regular звітність on project outcomes with emphasis on measurable impact in криза response and відбудова.',
    detailed_description_uk = 'Finland provides support programs for Україна. Contact Ministry of Foreign Affairs or Finnish Embassy for specific opportunities and заявка procedures.'
WHERE id = 202;

UPDATE grants SET
    grant_name_uk = 'Підтримка Данії для України',
    funding_organization_uk = 'Посольство Данії/Уряд Данії',
    country_region_uk = 'Данія/Україна',
    eligibility_criteria_uk = 'CSOs in Україна and neighboring countries',
    focus_areas_uk = 'Democratic development, права людини, green transition, anti-corruption',
    grant_amount_uk = 'Medium to large грантs',
    duration_uk = 'Multi-year',
    application_procedure_uk = 'Contact Danish Embassy in Україна for Neighbourhood Programme заявкаs and procedures',
    evaluation_criteria_uk = 'Projects evaluated based on: democratic impact, права людини advancement, green transition contribution, anti-corruption effectiveness, and organizational capacity.',
    additional_requirements_uk = 'Embassy-administered neighbourhood support program. Direct embassy contact required.',
    reporting_requirements_uk = 'Regular progress reports required with emphasis on measurable democratic and права людини outcomes.',
    detailed_description_uk = 'Danish Neighbourhood Programme supports regional cooperation. Contact Danish Embassy in Україна for заявка procedures and критерії відповідності criteria.'
WHERE id = 203;

-- Commit transaction
COMMIT;

-- Verification query to check results
SELECT id, grant_name, grant_name_uk, funding_organization_uk 
FROM grants 
WHERE id IN (178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 196, 197, 198, 199, 200, 201, 202, 203) 
ORDER BY id;