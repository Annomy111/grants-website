const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Ukrainian translations mapping for grants 158-177 (first 20 grants)
const ukrainianTranslations = {
  // Grant 158 - MacArthur Foundation Freedom of Expression Grant
  158: {
    grant_name_uk: "Грант Фонду МакАртура на свободу вираження поглядів",
    funding_organization_uk: "Фонд МакАртура (MacArthur Foundation)",
    country_region_uk: "Україна, Східна Європа",
    eligibility_criteria_uk: "Незалежні медіа-організації, журналісти, організації громадянського суспільства, що працюють у сфері свободи слова та медіа",
    focus_areas_uk: "Свобода слова, незалежна журналістика, медіа-грамотність, боротьба з дезінформацією",
    grant_amount_uk: "$50,000 - $200,000 (1,850,000 - 7,400,000 грн)",
    duration_uk: "12-24 місяці",
    application_procedure_uk: "Онлайн-подання через офіційний портал фонду, попередня реєстрація організації, подання концептуальної записки",
    required_documents_uk: "Заявка проекту, бюджет, реєстраційні документи організації, CV ключових учасників, рекомендаційні листи",
    evaluation_criteria_uk: "Інноваційність підходу, потенційний вплив, стійкість проекту, професійність команди, відповідність місії фонду",
    additional_requirements_uk: "Досвід роботи в медіа-сфері не менше 3 років, наявність зареєстрованої організації",
    reporting_requirements_uk: "Квартальні звіти про прогрес, фінансові звіти, підсумковий звіт з оцінкою впливу",
    detailed_description_uk: "Грант спрямований на підтримку незалежних медіа та журналістських ініціатив в Україні. Фонд МакАртура підтримує проекти, які сприяють розвитку свободи слова, медіа-грамотності та боротьби з дезінформацією. Особлива увага приділяється інноваційним підходам до журналістики та медіа-освіти."
  },
  
  // Grant 159 - European Union Civil Society Support Program
  159: {
    grant_name_uk: "Програма підтримки громадянського суспільства Європейського Союзу",
    funding_organization_uk: "Європейський Союз (European Union)",
    country_region_uk: "Україна, країни Східного партнерства",
    eligibility_criteria_uk: "НГО, організації громадянського суспільства, правозахисні організації з досвідом роботи не менше 2 років",
    focus_areas_uk: "Демократичне врядування, верховенство права, права людини, громадянська участь",
    grant_amount_uk: "€25,000 - €150,000 (1,100,000 - 6,600,000 грн)",
    duration_uk: "18-36 місяців",
    application_procedure_uk: "Подання через EU Funding Portal, попередня кваліфікація організації, двоетапний процес відбору",
    required_documents_uk: "Детальна заявка, організаційний профіль, аудиторський звіт, статут організації, партнерські угоди",
    evaluation_criteria_uk: "Відповідність цілям ЄС, технічна якість проекту, фінансова стійкість, досвід команди",
    additional_requirements_uk: "Реєстрація в країні-бенефіціарі, відповідність стандартам ЄС щодо прозорості",
    reporting_requirements_uk: "Щомісячні фінансові звіти, проміжні звіти кожні 6 місяців, підсумковий звіт з аудитом",
    detailed_description_uk: "Програма ЄС спрямована на зміцнення громадянського суспільства в країнах Східного партнерства, включаючи Україну. Підтримуються ініціативи, що сприяють демократичним реформам, захисту прав людини та розвитку громадянської участі в управлінні державою."
  },
  
  // Grant 160 - International Renaissance Foundation Democracy Grant
  160: {
    grant_name_uk: "Грант демократії Міжнародного фонду \"Відродження\"",
    funding_organization_uk: "Міжнародний фонд \"Відродження\" (International Renaissance Foundation)",
    country_region_uk: "Україна",
    eligibility_criteria_uk: "Українські НГО, ініціативні групи, дослідницькі організації",
    focus_areas_uk: "Демократичні інституції, електоральні процеси, громадянська освіта, політична участь",
    grant_amount_uk: "$10,000 - $75,000 (370,000 - 2,775,000 грн)",
    duration_uk: "6-18 місяців",
    application_procedure_uk: "Онлайн-заявка через сайт фонду, попередня консультація з програмними менеджерами",
    required_documents_uk: "Заявка проекту, бюджетна калькуляція, довідка про державну реєстрацію, звіт про попередню діяльність",
    evaluation_criteria_uk: "Актуальність проблеми, ефективність методології, потенціал для масштабування, локальна підтримка",
    additional_requirements_uk: "Офіційна реєстрація в Україні, досвід реалізації проектів",
    reporting_requirements_uk: "Проміжний звіт на 50% виконання, підсумковий наративний та фінансовий звіт",
    detailed_description_uk: "Програма підтримує українські організації у розвитку демократичних процесів та інституцій. Особливий акцент на громадянській освіті, підвищенні політичної участі та зміцненні демократичної культури в українському суспільстві."
  },
  
  // Grant 161 - Heinrich Böll Foundation Civil Society Program
  161: {
    grant_name_uk: "Програма громадянського суспільства Фонду Генріха Бьолля",
    funding_organization_uk: "Фонд Генріха Бьолля (Heinrich Böll Foundation)",
    country_region_uk: "Україна, Східна Європа",
    eligibility_criteria_uk: "Екологічні організації, феміністські рухи, правозахисні НГО",
    focus_areas_uk: "Екологія, гендерна рівність, демократія, права людини",
    grant_amount_uk: "€15,000 - €80,000 (660,000 - 3,520,000 грн)",
    duration_uk: "12-24 місяці",
    application_procedure_uk: "Концептуальна записка, повна заявка після попереднього схвалення, співбесіда з експертами",
    required_documents_uk: "Проектна пропозиція, організаційний профіль, рекомендації партнерів, план оцінки впливу",
    evaluation_criteria_uk: "Інноваційність підходу, гендерна чутливість, екологічна доцільність, сталий розвиток",
    additional_requirements_uk: "Демонстрація приверженості цінностям фонду, досвід роботи в тематичних сферах",
    reporting_requirements_uk: "Квартальні звіти про прогрес, річний звіт з оцінкою впливу, фінансова звітність",
    detailed_description_uk: "Фонд Генріха Бьолля підтримує прогресивні організації громадянського суспільства, що працюють у сферах екології, демократії та прав людини. Особлива увага приділяється гендерним питанням та сталому розвитку."
  },
  
  // Grant 162 - Open Society Foundations Justice Initiative
  162: {
    grant_name_uk: "Ініціатива правосуддя Фондів відкритого суспільства",
    funding_organization_uk: "Фонди відкритого суспільства (Open Society Foundations)",
    country_region_uk: "Україна, Центральна та Східна Європа",
    eligibility_criteria_uk: "Правозахисні організації, юридичні клініки, адвокатські об'єднання",
    focus_areas_uk: "Правосуддя, права людини, боротьба з корупцією, верховенство права",
    grant_amount_uk: "$20,000 - $150,000 (740,000 - 5,550,000 грн)",
    duration_uk: "12-36 місяців",
    application_procedure_uk: "Онлайн-заявка через портал OSF, багатоетапний процес відбору, експертна оцінка",
    required_documents_uk: "Детальна заявка, бюджет проекту, статут організації, аудиторські звіти, CV команди",
    evaluation_criteria_uk: "Потенціал для системних змін, професійність команди, інноваційність підходу, стратегічне значення",
    additional_requirements_uk: "Досвід роботи в правовій сфері, відповідність принципам відкритого суспільства",
    reporting_requirements_uk: "Піврічні наративні звіти, щоквартальні фінансові звіти, підсумковий звіт з оцінкою впливу",
    detailed_description_uk: "Ініціатива спрямована на зміцнення системи правосуддя та захист прав людини. Підтримуються проекти, що сприяють судовій реформі, боротьбі з корупцією та розвитку правової культури в українському суспільстві."
  },
  
  // Grant 163 - Friedrich Ebert Foundation Social Democracy Program
  163: {
    grant_name_uk: "Програма соціальної демократії Фонду Фрідріха Еберта",
    funding_organization_uk: "Фонд Фрідріха Еберта (Friedrich Ebert Foundation)",
    country_region_uk: "Україна, Східна Європа",
    eligibility_criteria_uk: "Профспілки, соціально-демократичні організації, дослідницькі центри",
    focus_areas_uk: "Соціальна політика, трудові права, економічна демократія, соціальна справедливість",
    grant_amount_uk: "€12,000 - €60,000 (528,000 - 2,640,000 грн)",
    duration_uk: "12-18 місяців",
    application_procedure_uk: "Подання заявки через регіональні офіси, попередні консультації, експертна оцінка проекту",
    required_documents_uk: "Проектна заявка, організаційний статут, фінансовий план, референс-листи",
    evaluation_criteria_uk: "Відповідність цінностям соціальної демократії, практична реалізованість, потенціал впливу",
    additional_requirements_uk: "Приверженість принципам соціальної демократії, досвід роботи в соціальній сфері",
    reporting_requirements_uk: "Щомісячні звіти про діяльність, півроку фінансові звіти, підсумковий аналітичний звіт",
    detailed_description_uk: "Програма підтримує розвиток соціально-демократичних цінностей та інститутів в Україні. Фокус на трудових правах, соціальній політиці та економічній справедливості для побудови більш рівного суспільства."
  },
  
  // Grant 164 - Council of Europe Human Rights Grant
  164: {
    grant_name_uk: "Грант з прав людини Ради Європи",
    funding_organization_uk: "Рада Європи (Council of Europe)",
    country_region_uk: "Україна, країни-члени Ради Європи",
    eligibility_criteria_uk: "Правозахисні НГО, освітні заклади, громадські організації",
    focus_areas_uk: "Права людини, демократія, верховенство права, міноритарні права",
    grant_amount_uk: "€20,000 - €100,000 (880,000 - 4,400,000 грн)",
    duration_uk: "18-24 місяці",
    application_procedure_uk: "Конкурсний відбір через офіційний сайт, двоетапна процедура оцінки",
    required_documents_uk: "Заявка проекту, організаційні документи, попередні звіти діяльності, партнерські угоди",
    evaluation_criteria_uk: "Відповідність стандартам Ради Європи, інноваційність, потенціал для реплікації",
    additional_requirements_uk: "Відповідність європейським стандартам прав людини, досвід міжнародного співробітництва",
    reporting_requirements_uk: "Квартальні звіти про прогрес, річні фінансові звіти, підсумковий звіт з рекомендаціями",
    detailed_description_uk: "Програма Ради Європи спрямована на зміцнення захисту прав людини та демократичних інститутів. Підтримуються ініціативи, що сприяють імплементації європейських стандартів прав людини в Україні."
  },
  
  // Grant 165 - USAID Democracy and Governance Program
  165: {
    grant_name_uk: "Програма демократії та управління USAID",
    funding_organization_uk: "Агентство США з міжнародного розвитку (USAID)",
    country_region_uk: "Україна",
    eligibility_criteria_uk: "Американські та українські НГО, навчальні заклади, дослідницькі інститути",
    focus_areas_uk: "Демократичне врядування, децентралізація, електоральні процеси, громадська участь",
    grant_amount_uk: "$25,000 - $300,000 (925,000 - 11,100,000 грн)",
    duration_uk: "12-48 місяців",
    application_procedure_uk: "Конкурсна процедура через grants.gov, багатоетапна оцінка, технічна та фінансова експертиза",
    required_documents_uk: "Технічна пропозиція, детальний бюджет, організаційні документи, аудиторські звіти",
    evaluation_criteria_uk: "Технічна досконалість, управлінська спроможність, вартість-ефективність, стратегічний вплив",
    additional_requirements_uk: "Відповідність вимогам USAID, реєстрація в SAM.gov (для американських організацій)",
    reporting_requirements_uk: "Щомісячні звіти про прогрес, квартальні фінансові звіти, річні оцінки результативності",
    detailed_description_uk: "Програма USAID підтримує демократичні реформи та розвиток громадянського суспільства в Україні. Фокус на зміцненні демократичних інститутів, покращенні врядування та підвищенні громадської участі."
  },
  
  // Grant 166 - UK Foreign Office Conflict Prevention Fund
  166: {
    grant_name_uk: "Фонд запобігання конфліктам Міністерства закордонних справ Великобританії",
    funding_organization_uk: "Міністерство закордонних справ Великобританії (UK Foreign Office)",
    country_region_uk: "Україна, регіони конфлікту",
    eligibility_criteria_uk: "Організації миробудування, НГО з досвідом роботи в конфліктних зонах",
    focus_areas_uk: "Запобігання конфліктам, миробудування, примирення, постконфліктне відновлення",
    grant_amount_uk: "£15,000 - £100,000 (740,000 - 4,940,000 грн)",
    duration_uk: "6-24 місяці",
    application_procedure_uk: "Онлайн-подання через GOV.UK портал, попередній скринінг, експертна панель",
    required_documents_uk: "Проектна заявка, ризик-аналіз, план моніторингу, організаційна акредитація",  
    evaluation_criteria_uk: "Потенціал для запобігання конфлікту, досвід роботи в регіоні, стійкість результатів",
    additional_requirements_uk: "Досвід роботи в конфліктних зонах, розуміння локального контексту",
    reporting_requirements_uk: "Місячні звіти про безпеку, квартальні звіти про прогрес, підсумковий звіт з оцінкою",
    detailed_description_uk: "Фонд підтримує ініціативи запобігання конфліктам та миробудування в Україні. Особлива увага приділяється проектам у зонах конфлікту та постконфліктному відновленню громад."
  },
  
  // Grant 167 - Swedish International Development Agency Civil Society Support
  167: {
    grant_name_uk: "Підтримка громадянського суспільства Шведського агентства міжнародного розвитку",
    funding_organization_uk: "Шведське агентство міжнародного розвитку (SIDA)",
    country_region_uk: "Україна, Східна Європа",
    eligibility_criteria_uk: "Шведські та місцеві НГО, організації громадянського суспільства",
    focus_areas_uk: "Демократія, права людини, гендерна рівність, сталий розвиток",
    grant_amount_uk: "SEK 200,000 - 2,000,000 (740,000 - 7,400,000 грн)",
    duration_uk: "24-48 місяців",
    application_procedure_uk: "Подання через SIDA портал, попередня кваліфікація, експертна оцінка",
    required_documents_uk: "Детальна заявка, логічна рамка проекту, бюджет, організаційний профіль",
    evaluation_criteria_uk: "Відповідність шведській політиці розвитку, гендерна інтеграція, результативність",
    additional_requirements_uk: "Партнерство з шведською організацією (бажано), гендерний підхід",
    reporting_requirements_uk: "Піврічні наративні звіти, річні фінансові звіти, зовнішня оцінка (для великих грантів)",
    detailed_description_uk: "SIDA підтримує розвиток громадянського суспільства в Україні з акцентом на демократичні цінності, права людини та гендерну рівність. Програма сприяє довгостроковому демократичному розвитку."
  },
  
  // Grant 168 - Norwegian Ministry of Foreign Affairs Democracy Support
  168: {
    grant_name_uk: "Підтримка демократії Міністерства закордонних справ Норвегії",
    funding_organization_uk: "Міністерство закордонних справ Норвегії (Norwegian MFA)",
    country_region_uk: "Україна, Північна Європа",
    eligibility_criteria_uk: "Норвезькі та українські НГО, дослідницькі інститути",
    focus_areas_uk: "Демократичні інститути, громадська участь, медіа-свобода, антикорупція",
    grant_amount_uk: "NOK 500,000 - 5,000,000 (1,850,000 - 18,500,000 грн)",
    duration_uk: "12-36 місяців",
    application_procedure_uk: "Заявка через норвезьке посольство або онлайн-портал, багатоетапна оцінка",
    required_documents_uk: "Проектна пропозиція, партнерська угода, бюджетна калькуляція, CV команди",
    evaluation_criteria_uk: "Стратегічна важливість, потенціал впливу, партнерський підхід, фінансова ефективність",
    additional_requirements_uk: "Партнерство з норвезькою організацією, відповідність норвезьким цінностям",
    reporting_requirements_uk: "Щомісячні звіти про прогрес, піврічні фінансові звіти, підсумковий звіт з рекомендаціями",
    detailed_description_uk: "Норвегія підтримує демократичний розвиток в Україні через партнерські проекти. Акцент на зміцненні демократичних інститутів, медіа-свободі та боротьбі з корупцією."
  },
  
  // Grant 169 - Netherlands Ministry of Foreign Affairs Civil Society Fund
  169: {
    grant_name_uk: "Фонд громадянського суспільства Міністерства закордонних справ Нідерландів",
    funding_organization_uk: "Міністерство закордонних справ Нідерландів (Netherlands MFA)",
    country_region_uk: "Україна, Східна Європа",
    eligibility_criteria_uk: "Голландські та місцеві НГО, правозахисні організації",
    focus_areas_uk: "Права людини, верховенство права, соціальна справедливість, інклюзивність",
    grant_amount_uk: "€30,000 - €250,000 (1,320,000 - 11,000,000 грн)",
    duration_uk: "18-36 місяців",
    application_procedure_uk: "Конкурсний відбір через голландське посольство, двоетапна процедура",
    required_documents_uk: "Заявка проекту, теорія змін, бюджетний план, організаційна спроможність",
    evaluation_criteria_uk: "Інноваційність підходу, потенціал масштабування, партнерський характер, сталість",
    additional_requirements_uk: "Голландське партнерство, відповідність політиці розвитку Нідерландів",
    reporting_requirements_uk: "Квартальні звіти про результати, піврічні фінансові звіти, зовнішня оцінка",
    detailed_description_uk: "Нідерланди підтримують громадянське суспільство України через довгострокові партнерські програми. Фокус на правах людини, верховенстві права та соціальній справедливості."
  },
  
  // Grant 170 - German Federal Foreign Office Civil Society Cooperation
  170: {
    grant_name_uk: "Співробітництво з громадянським суспільством Федерального міністерства закордонних справ Німеччини",
    funding_organization_uk: "Федеральне міністерство закордонних справ Німеччини (German Federal Foreign Office)",
    country_region_uk: "Україна, Центральна Європа",
    eligibility_criteria_uk: "Німецькі та українські НГО, культурні організації, освітні заклади",
    focus_areas_uk: "Культурний діалог, освіта, демократичні цінності, міжнародне співробітництво",
    grant_amount_uk: "€20,000 - €150,000 (880,000 - 6,600,000 грн)",
    duration_uk: "12-24 місяці",
    application_procedure_uk: "Подання через німецькі культурні інститути, експертна комісія, багатоетапна оцінка",
    required_documents_uk: "Концептуальна записка, детальний план, партнерські угоди, кваліфікація команди",
    evaluation_criteria_uk: "Культурна цінність, освітній потенціал, німецько-українське партнерство, довгостроковий вплив",
    additional_requirements_uk: "Німецько-український компонент, культурно-освітня спрямованість",
    reporting_requirements_uk: "Проміжні звіти про діяльність, фінансові звіти, підсумковий звіт з оцінкою впливу",
    detailed_description_uk: "Програма німецького МЗС сприяє культурному та освітньому співробітництву між Німеччиною та Україною. Підтримка демократичних цінностей через культурний діалог та освітні ініціативи."
  },
  
  // Grant 171 - European Bank for Reconstruction and Development Civil Society Program
  171: {
    grant_name_uk: "Програма громадянського суспільства Європейського банку реконструкції та розвитку",
    funding_organization_uk: "Європейський банк реконструкції та розвитку (EBRD)",
    country_region_uk: "Україна, країни ЄБРР",
    eligibility_criteria_uk: "НГО в галузі економічного розвитку, екологічні організації, соціальні підприємства",
    focus_areas_uk: "Економічний розвиток, екологічна стійкість, соціальне підприємництво, інновації",
    grant_amount_uk: "€15,000 - €100,000 (660,000 - 4,400,000 грн)",
    duration_uk: "12-18 місяців",
    application_procedure_uk: "Онлайн-заявка через портал ЄБРР, технічна оцінка, комітет з відбору",
    required_documents_uk: "Бізнес-план проекту, фінансові прогнози, організаційний статут, аудиторські звіти",
    evaluation_criteria_uk: "Економічна доцільність, екологічна відповідальність, соціальний вплив, фінансова стійкість",
    additional_requirements_uk: "Відповідність політиці ЄБРР, потенціал для комерціалізації",
    reporting_requirements_uk: "Квартальні фінансові звіти, піврічні звіти про прогрес, незалежний аудит",
    detailed_description_uk: "ЄБРР підтримує організації громадянського суспільства, що сприяють економічному розвитку та екологічній стійкості. Акцент на соціальному підприємництві та інноваційних рішеннях."
  },
  
  // Grant 172 - World Bank Civil Society Engagement Program
  172: {
    grant_name_uk: "Програма залучення громадянського суспільства Світового банку",
    funding_organization_uk: "Світовий банк (World Bank)",
    country_region_uk: "Україна, глобально",
    eligibility_criteria_uk: "Міжнародні та місцеві НГО, дослідницькі інститути, аналітичні центри",
    focus_areas_uk: "Економічний розвиток, боротьба з бідністю, соціальні послуги, інституційний розвиток",
    grant_amount_uk: "$30,000 - $200,000 (1,110,000 - 7,400,000 грн)",
    duration_uk: "18-36 місяців",
    application_procedure_uk: "Конкурсна процедура через портал Світового банку, багатоетапна оцінка",
    required_documents_uk: "Проектна заявка, логічна рамка, бюджет, інституційна спроможність, план моніторингу",
    evaluation_criteria_uk: "Відповідність стратегії Світового банку, технічна якість, потенціал впливу, стійкість",
    additional_requirements_uk: "Досвід співпраці з міжнародними організаціями, відповідність стандартам Світового банку",
    reporting_requirements_uk: "Піврічні звіти про прогрес, щорічні фінансові звіти, незалежна оцінка результатів",
    detailed_description_uk: "Світовий банк підтримує громадянське суспільство в Україні для сприяння економічному розвитку та скороченню бідності. Фокус на системних змінах та інституційному розвитку."
  },
  
  // Grant 173 - OSCE Democracy and Human Rights Program
  173: {
    grant_name_uk: "Програма демократії та прав людини ОБСЄ",
    funding_organization_uk: "Організація з безпеки і співробітництва в Європі (OSCE)",
    country_region_uk: "Україна, регіон ОБСЄ",
    eligibility_criteria_uk: "Правозахисні НГО, організації моніторингу виборів, медіа-організації",
    focus_areas_uk: "Демократичні процеси, права людини, медіа-свобода, електоральний моніторинг",
    grant_amount_uk: "€10,000 - €75,000 (440,000 - 3,300,000 грн)",
    duration_uk: "6-18 місяців",
    application_procedure_uk: "Заявка через офіси ОБСЄ, експертна оцінка, координація з місією ОБСЄ",
    required_documents_uk: "Заявка проекту, CV команди, організаційні документи, план безпеки",
    evaluation_criteria_uk: "Відповідність мандату ОБСЄ, експертність команди, локальна актуальність, безпека",
    additional_requirements_uk: "Досвід роботи в сфері ОБСЄ, розуміння безпекової ситуації",
    reporting_requirements_uk: "Місячні звіти про активності, підсумковий аналітичний звіт, фінансова звітність",
    detailed_description_uk: "ОБСЄ підтримує демократичні процеси та захист прав людини в Україні. Особливий акцент на електоральному моніторингу, медіа-свободі та конфлікт-сенситивному підході."
  },
  
  // Grant 174 - UN Democracy Fund (UNDEF)
  174: {
    grant_name_uk: "Фонд демократії ООН (UNDEF)",
    funding_organization_uk: "Організація Об'єднаних Націй - Фонд демократії (UN Democracy Fund)",
    country_region_uk: "Україна, глобально",
    eligibility_criteria_uk: "НГО громадянського суспільства, низові організації, молодіжні рухи",
    focus_areas_uk: "Демократичні інститути, громадянська участь, верховенство права, права людини",
    grant_amount_uk: "$50,000 - $300,000 (1,850,000 - 11,100,000 грн)",
    duration_uk: "24-36 місяців",
    application_procedure_uk: "Річний конкурсний цикл, онлайн-подання, багатоетапна міжнародна оцінка",
    required_documents_uk: "Детальна заявка, логічна рамка, бюджет, організаційна спроможність, план стійкості",
    evaluation_criteria_uk: "Інноваційність підходу, потенціал для демократичного впливу, участь громадянського суспільства, стійкість",
    additional_requirements_uk: "Реєстрація як НГО, низовий характер організації, відсутність політичної афіліації",
    reporting_requirements_uk: "Піврічні наративні звіти, щорічні фінансові звіти, підсумковий звіт з оцінкою впливу",
    detailed_description_uk: "UNDEF підтримує низові демократичні ініціативи в Україні. Фонд сприяє розвитку громадянського суспільства, демократичної участі та зміцненню демократичних інститутів."
  },
  
  // Grant 175 - Freedom House Emergency Fund
  175: {
    grant_name_uk: "Екстрений фонд Freedom House",
    funding_organization_uk: "Freedom House",
    country_region_uk: "Україна, глобально",
    eligibility_criteria_uk: "Правозахисники, журналісти, активісти громадянського суспільства під загрозою",
    focus_areas_uk: "Свобода слова, права людини, захист активістів, демократичні свободи",
    grant_amount_uk: "$2,000 - $25,000 (74,000 - 925,000 грн)",
    duration_uk: "3-12 місяців",
    application_procedure_uk: "Швидка процедура подання, оцінка ризиків, експрес-рішення",
    required_documents_uk: "Коротка заявка, підтвердження загрози, рекомендаційні листи, план безпеки",
    evaluation_criteria_uk: "Рівень загрози, важливість діяльності, потенціал для продовження роботи",
    additional_requirements_uk: "Документована загроза безпеці, активна правозахисна діяльність",
    reporting_requirements_uk: "Короткі місячні звіти, підсумковий звіт про використання коштів",
    detailed_description_uk: "Екстрений фонд Freedom House надає швидку підтримку українським правозахисникам та журналістам, які перебувають під загрозою. Фокус на забезпеченні безпеки та продовженні важливої правозахисної роботи."
  },
  
  // Grant 176 - European Endowment for Democracy Core Support
  176: {
    grant_name_uk: "Основна підтримка Європейського фонду демократії",
    funding_organization_uk: "Європейський фонд демократії (European Endowment for Democracy)",
    country_region_uk: "Україна, Східне партнерство",
    eligibility_criteria_uk: "Нові демократичні рухи, незалежні медіа, молодіжні організації",
    focus_areas_uk: "Демократичний транзит, незалежна журналістика, політична освіта, громадянська активність",
    grant_amount_uk: "€5,000 - €50,000 (220,000 - 2,200,000 грн)",
    duration_uk: "6-24 місяці",
    application_procedure_uk: "Гнучка процедура подання, швидке рішення, мінімальна бюрократія",
    required_documents_uk: "Проста заявка, опис організації, план діяльності, базовий бюджет",
    evaluation_criteria_uk: "Демократичний потенціал, інноваційність, швидкість впливу, низова підтримка",
    additional_requirements_uk: "Демократична орієнтація, незалежність від влади",
    reporting_requirements_uk: "Прості звіти про діяльність, фінансова звітність, оцінка результатів",
    detailed_description_uk: "EED надає гнучку підтримку молодим демократичним рухам та ініціативам в Україні. Фонд характеризується мінімальною бюрократією та швидким прийняттям рішень для підтримки демократичних змін."
  },
  
  // Grant 177 - Visegrad Fund Standard Grant
  177: {
    grant_name_uk: "Стандартний грант Вишеградського фонду",
    funding_organization_uk: "Вишеградський фонд (Visegrad Fund)",
    country_region_uk: "Україна, регіон V4+",
    eligibility_criteria_uk: "НГО з країн V4 та України, культурні організації, освітні заклади",
    focus_areas_uk: "Регіональне співробітництво, культурний обмін, освіта, демократичні цінності",
    grant_amount_uk: "€8,000 - €35,000 (352,000 - 1,540,000 грн)",
    duration_uk: "6-12 місяців",
    application_procedure_uk: "Онлайн-заявка, тематичні дедлайни, експертна оцінка країн V4",
    required_documents_uk: "Заявка проекту, бюджетний план, партнерські угоди, CV організаторів",
    evaluation_criteria_uk: "Вишеградський компонент, культурна цінність, освітній потенціал, регіональне співробітництво",
    additional_requirements_uk: "Участь мінімум двох країн V4+, культурно-освітня спрямованість",
    reporting_requirements_uk: "Проміжний звіт, підсумковий звіт з результатами, фінансова звітність",
    detailed_description_uk: "Вишеградський фонд підтримує регіональне співробітництво між країнами V4 (Польща, Чехія, Словаччина, Угорщина) та Україною. Фокус на культурних, освітніх та демократичних ініціативах."
  }
};

async function translateGrants() {
  console.log('🔄 Starting Ukrainian translation for grants 158-177 (first 20 grants)...');
  
  try {
    // First, fetch any grants to see table structure
    console.log('🔍 Checking grants table structure...');
    const { data: sampleGrant, error: sampleError } = await supabase
      .from('grants')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleGrant) {
      console.log('📋 Available columns:', Object.keys(sampleGrant));
    }
    
    // Check what grants exist
    console.log('📊 Checking available grants...');
    const { data: allGrants, error: allError } = await supabase
      .from('grants')
      .select('id, grant_name')
      .order('id');
    
    if (allGrants) {
      console.log(`Found ${allGrants.length} total grants. IDs: ${allGrants.map(g => g.id).join(', ')}`);
    }
    
    // Fetch the first 20 grants (actual IDs: 158-177)
    const { data: grants, error: fetchError } = await supabase
      .from('grants')
      .select('*')
      .gte('id', 158)
      .lte('id', 177)
      .order('id');

    if (fetchError) {
      console.error('❌ Error fetching grants:', fetchError);
      return;
    }

    console.log(`📊 Found ${grants.length} grants to translate`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each grant
    for (const grant of grants) {
      const grantId = grant.id;
      const translation = ukrainianTranslations[grantId];

      if (!translation) {
        console.log(`⚠️  No translation available for grant ID ${grantId}`);
        errorCount++;
        errors.push(`No translation for grant ID ${grantId}`);
        continue;
      }

      try {
        // Update the grant with Ukrainian translations
        const { error: updateError } = await supabase
          .from('grants')
          .update(translation)
          .eq('id', grantId);

        if (updateError) {
          console.error(`❌ Error updating grant ${grantId}:`, updateError);
          errorCount++;
          errors.push(`Grant ${grantId}: ${updateError.message}`);
        } else {
          console.log(`✅ Successfully translated grant ${grantId}: ${translation.grant_name_uk}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception updating grant ${grantId}:`, err);
        errorCount++;
        errors.push(`Grant ${grantId}: ${err.message}`);
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final report
    console.log('\n' + '='.repeat(50));
    console.log('📋 UKRAINIAN TRANSLATION SUMMARY REPORT');
    console.log('='.repeat(50));
    console.log(`✅ Successfully translated: ${successCount} grants`);
    console.log(`❌ Errors encountered: ${errorCount} grants`);
    console.log(`📊 Total processed: ${successCount + errorCount} grants`);
    
    if (errors.length > 0) {
      console.log('\n🚨 ERRORS ENCOUNTERED:');
      errors.forEach(error => console.log(`   • ${error}`));
    }

    // Verify the translations
    console.log('\n🔍 Verifying translations...');
    const { data: verifyGrants, error: verifyError } = await supabase
      .from('grants')
      .select('id, grant_name, grant_name_uk, funding_organization, funding_organization_uk')
      .gte('id', 158)
      .lte('id', 177)
      .order('id');

    if (verifyError) {
      console.error('❌ Error verifying translations:', verifyError);
    } else {
      console.log('\n📋 TRANSLATION VERIFICATION:');
      verifyGrants.forEach(grant => {
        const hasUkrainianName = grant.grant_name_uk && grant.grant_name_uk.trim() !== '';
        const hasUkrainianOrg = grant.funding_organization_uk && grant.funding_organization_uk.trim() !== '';
        console.log(`${hasUkrainianName && hasUkrainianOrg ? '✅' : '❌'} Grant ${grant.id}: ${grant.grant_name_uk || 'NO TRANSLATION'}`);
      });
    }

    console.log('\n🎯 Translation process completed!');

  } catch (error) {
    console.error('❌ Fatal error in translation process:', error);
  }
}

// Run the translation
translateGrants();