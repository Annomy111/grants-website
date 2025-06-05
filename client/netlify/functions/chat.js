import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Gemini API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD7DRJZBlzJtaszmNe-3UjLZZKE9ujH16U';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { message, conversationId, language = 'en', conversationHistory = [] } = JSON.parse(event.body);

    if (!message || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    console.log(`[Chat] Processing message in ${language}: ${message.substring(0, 100)}...`);

    // Get grants from database for context
    const { data: grants, error: grantsError } = await supabase
      .from('grants')
      .select('*')
      .eq('status', 'active')
      .order('application_deadline', { ascending: true })
      .limit(20);

    if (grantsError) {
      console.error('Grants fetch error:', grantsError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch grants data' }),
      };
    }

    console.log(`[Chat] Found ${grants?.length || 0} grants in database`);

    // Create grants context for AI
    const grantsContext = grants?.slice(0, 8).map(grant => ({
      name: grant.grant_name || 'Unknown',
      organization: grant.funding_organization || 'Unknown',
      country: grant.country_region || 'Unknown', 
      focus_areas: grant.focus_areas || 'Unknown',
      amount: grant.grant_amount || 'Not specified',
      deadline: grant.application_deadline || 'Not specified',
      eligibility: grant.eligibility_criteria?.substring(0, 150) || 'Check website'
    })) || [];

    // Find relevant grants based on user message
    const relevantGrants = smartGrantMatching(grants || [], message, language);
    console.log(`[Chat] Found ${relevantGrants.length} relevant grants`);

    // Generate AI response using Gemini
    const aiResponse = await generateGeminiResponse(message, grantsContext, language);

    // Save chat interaction if conversationId provided
    if (conversationId) {
      try {
        await supabase
          .from('chat_messages')
          .insert({
            session_id: conversationId,
            message: message,
            response: aiResponse,
            recommended_grants: relevantGrants,
            created_at: new Date().toISOString()
          });
      } catch (saveError) {
        console.error('Message save error:', saveError);
      }
    }

    // Generate follow-up suggestions
    const suggestions = generateSuggestions(language, message);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: aiResponse,
        recommendedGrants: relevantGrants.slice(0, 5),
        suggestions: suggestions,
        conversationId: conversationId || `chat-${Date.now()}`
      }),
    };

  } catch (error) {
    console.error('[Chat] Error processing chat request:', error);
    
    // Fallback response
    const { language = 'en' } = JSON.parse(event.body || '{}');
    const fallbackResponses = {
      en: "I'm here to help you find grants for Ukrainian civil society organizations. Please try asking about specific areas like women's rights, youth programs, or human rights work.",
      uk: "Я тут, щоб допомогти вам знайти гранти для українських організацій громадянського суспільства. Спробуйте запитати про конкретні сфери, як права жінок, молодіжні програми або правозахисна робота.",
      de: "Ich bin hier, um Ihnen zu helfen, Förderungen für ukrainische Zivilgesellschaftsorganisationen zu finden."
    };

    const fallbackMessage = fallbackResponses[language] || fallbackResponses.en;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: fallbackMessage,
        recommendedGrants: [],
        suggestions: generateSuggestions(language, ''),
        error: false
      }),
    };
  }
};

// Generate AI response using Gemini
async function generateGeminiResponse(userMessage, grantsContext, language) {
  // Prepare system prompt based on language
  const systemPrompts = {
    en: `You are an expert AI grants consultant specializing in funding opportunities for Ukrainian civil society organizations. You have access to a comprehensive database of grants and funding programs.

Available grants database: ${JSON.stringify(grantsContext, null, 2)}

Your expertise includes:
- Grant eligibility analysis and matching
- Application deadline tracking and planning
- Funding amount assessment and comparison
- Organizational capacity building advice
- Strategic funding recommendations

Instructions for responses:
- Respond professionally in English with helpful, actionable advice
- Provide specific grant recommendations with clear reasoning
- Include practical details: amounts, deadlines, eligibility criteria
- Use emojis and formatting for clarity and engagement
- Be encouraging, supportive, and solution-oriented
- Keep responses detailed but focused (250-400 words)
- Always mention specific grant names and organizations when relevant
- Provide strategic advice for grant applications when appropriate

User's question: ${userMessage}

Provide a comprehensive, professional response that helps the user find the most suitable funding opportunities.`,

    uk: `Ви експерт-консультант з грантів, що спеціалізується на можливостях фінансування для українських організацій громадянського суспільства. У вас є доступ до комплексної бази даних грантів та програм фінансування.

База даних доступних грантів: ${JSON.stringify(grantsContext, null, 2)}

Ваша експертиза включає:
- Аналіз та підбір грантів за критеріями відповідності
- Відстеження термінів подачі заявок та планування
- Оцінка та порівняння сум фінансування
- Консультації з розвитку організаційного потенціалу
- Стратегічні рекомендації щодо фінансування

Інструкції для відповідей:
- Відповідайте професійно українською мовою з корисними, практичними порадами
- Надавайте конкретні рекомендації грантів з чіткими обґрунтуваннями
- Включайте практичні деталі: суми, терміни, критерії відбору
- Використовуйте емодзі та форматування для ясності та залученості
- Будьте заохочувальними, підтримуючими та орієнтованими на рішення
- Тримайте відповіді детальними, але сфокусованими (250-400 слів)
- Завжди згадуйте конкретні назви грантів та організації, коли це доречно
- Надавайте стратегічні поради для подачі заявок на гранти при необхідності

Запитання користувача: ${userMessage}

Надайте вичерпну, професійну відповідь, що допоможе користувачу знайти найбільш підходящі можливості фінансування.`,

    de: `Sie sind ein hilfreicher Förderungsassistent für ukrainische Zivilgesellschaftsorganisationen. Helfen Sie Benutzern dabei, Fördermöglichkeiten zu finden und zu verstehen.

Verfügbare Förderungen: ${JSON.stringify(grantsContext, null, 2)}

Anweisungen:
- Antworten Sie auf Deutsch
- Seien Sie hilfreich und informativ über Förderungen
- Halten Sie Antworten prägnant (unter 300 Wörter)
- Erwähnen Sie spezifische relevante Förderungen wenn möglich
- Fügen Sie Förderbeträge und Fristen ein
- Seien Sie ermutigend und unterstützend

Benutzerfrage: ${userMessage}`
  };

  const systemPrompt = systemPrompts[language] || systemPrompts.en;

  // Try Gemini API first
  try {
    console.log('[Chat] Attempting to call Gemini API');
    
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 400,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    if (geminiResponse.data && geminiResponse.data.candidates && geminiResponse.data.candidates[0]) {
      const aiResponse = geminiResponse.data.candidates[0].content.parts[0].text;
      console.log(`[Chat] Gemini API success: ${aiResponse.substring(0, 100)}...`);
      return aiResponse;
    }

  } catch (geminiError) {
    console.log('[Chat] Gemini API failed:', geminiError.message);
  }

  // Fallback to intelligent rule-based response
  console.log('[Chat] Using intelligent fallback response');
  return generateIntelligentFallback(userMessage, grantsContext, language);
}

// Smart grant matching function
function smartGrantMatching(grants, message, language) {
  const messageLower = message.toLowerCase();
  
  // Enhanced keyword categories with weights
  const keywordCategories = {
    women: { 
      keywords: ['women', 'жінки', 'frauen', 'gender', 'гендер', 'feminist', 'феміністський', 'female'],
      weight: 3 
    },
    humanRights: { 
      keywords: ['human rights', 'права людини', 'menschenrechte', 'rights', 'правa', 'justice', 'справедливість'],
      weight: 3 
    },
    youth: { 
      keywords: ['youth', 'молодь', 'jugend', 'young', 'students', 'студенти', 'children'],
      weight: 2 
    },
    education: { 
      keywords: ['education', 'освіта', 'bildung', 'навчання', 'learning', 'school', 'university'],
      weight: 2 
    },
    democracy: { 
      keywords: ['democracy', 'демократія', 'demokratie', 'democratic', 'governance', 'врядування'],
      weight: 2 
    },
    media: { 
      keywords: ['media', 'медіа', 'medien', 'journalism', 'журналістика', 'press', 'преса'],
      weight: 2 
    },
    culture: { 
      keywords: ['culture', 'культура', 'kultur', 'cultural', 'культурний', 'arts', 'мистецтво'],
      weight: 2 
    },
    health: { 
      keywords: ['health', 'здоров\'я', 'gesundheit', 'medical', 'медичний', 'healthcare'],
      weight: 2 
    },
    environment: { 
      keywords: ['environment', 'довкілля', 'umwelt', 'climate', 'клімат', 'green', 'зелений'],
      weight: 2 
    },
    ngo: { 
      keywords: ['ngo', 'нго', 'organisation', 'organization', 'society', 'товариство'],
      weight: 1 
    }
  };

  // Score each grant
  const scoredGrants = grants.map(grant => {
    let score = 0;
    const grantText = `${grant.grant_name} ${grant.funding_organization} ${grant.focus_areas} ${grant.eligibility_criteria}`.toLowerCase();
    
    // Keyword matching with weights
    for (const [category, config] of Object.entries(keywordCategories)) {
      const messageHasKeyword = config.keywords.some(keyword => messageLower.includes(keyword));
      const grantHasKeyword = config.keywords.some(keyword => grantText.includes(keyword));
      
      if (messageHasKeyword && grantHasKeyword) {
        score += config.weight;
      }
    }
    
    // Direct text match bonus
    const messageWords = messageLower.split(' ').filter(word => word.length > 3);
    messageWords.forEach(word => {
      if (grantText.includes(word)) {
        score += 1;
      }
    });
    
    // Deadline proximity bonus
    if (grant.application_deadline) {
      const deadline = new Date(grant.application_deadline);
      const now = new Date();
      const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeadline > 0 && daysUntilDeadline <= 90) {
        score += 1;
      }
    }
    
    return { ...grant, score };
  });

  // Return sorted results
  return scoredGrants
    .filter(grant => grant.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// Intelligent fallback response generator
function generateIntelligentFallback(message, grants, language) {
  const messageLower = message.toLowerCase();
  
  const templates = {
    en: {
      greeting: "Hello! I help Ukrainian civil society organizations find grants and funding opportunities.",
      women: "I found grants specifically relevant to women's organizations and gender equality work.",
      youth: "Here are grant opportunities focused on youth and student organizations.",
      humanRights: "I've identified grants supporting human rights and justice work.",
      deadlines: "Based on upcoming deadlines, here are grants you should consider applying to soon.",
      general: "I found grants that match your query for Ukrainian civil society organizations."
    },
    uk: {
      greeting: "Привіт! Я допомагаю українським організаціям громадянського суспільства знаходити гранти та можливості фінансування.",
      women: "Я знайшов гранти, що стосуються жіночих організацій та роботи з гендерної рівності.",
      youth: "Ось грантові можливості, орієнтовані на молодіжні та студентські організації.",
      humanRights: "Я визначив гранти, що підтримують роботу з прав людини та справедливості.",
      deadlines: "На основі найближчих термінів, ось гранти, на які варто подавати заявки найближчим часом.",
      general: "Я знайшов гранти, що відповідають вашому запиту для українських організацій громадянського суспільства."
    }
  };

  const t = templates[language] || templates.en;
  
  // Determine response type
  let responseType = 'general';
  if (['hello', 'hi', 'hey', 'привіт', 'добрий'].some(word => messageLower.includes(word))) {
    responseType = 'greeting';
  } else if (['women', 'жінки', 'gender', 'гендер'].some(word => messageLower.includes(word))) {
    responseType = 'women';
  } else if (['youth', 'молодь', 'young'].some(word => messageLower.includes(word))) {
    responseType = 'youth';
  } else if (['rights', 'права', 'justice'].some(word => messageLower.includes(word))) {
    responseType = 'humanRights';
  } else if (['deadline', 'when', 'термін', 'коли'].some(word => messageLower.includes(word))) {
    responseType = 'deadlines';
  }

  let response = t[responseType];

  // Add grant details if found
  if (grants.length > 0) {
    const grantsList = grants.slice(0, 3).map((grant, i) => {
      return `${i + 1}. **${grant.name}** by ${grant.organization}
   Amount: ${grant.amount}
   Deadline: ${grant.deadline}`;
    }).join('\n\n');

    response += `\n\n${grantsList}`;
    
    if (grants.length > 3) {
      const moreText = language === 'uk' ? `\n\nТа ще ${grants.length - 3} інших можливостей.` 
                    : language === 'de' ? `\n\nUnd ${grants.length - 3} weitere Möglichkeiten.`
                    : `\n\nAnd ${grants.length - 3} more opportunities.`;
      response += moreText;
    }
  }

  return response;
}

// Generate conversation suggestions
function generateSuggestions(language, message) {
  const suggestionSets = {
    en: [
      "Show me grants for women's organizations",
      "What grants support human rights work?",
      "Which grants have upcoming deadlines?",
      "Tell me about youth funding opportunities",
      "Show me grants for media projects",
      "What grants support education initiatives?"
    ],
    uk: [
      "Покажіть гранти для жіночих організацій",
      "Які гранти підтримують правозахисну роботу?",
      "Які гранти мають найближчі терміни?",
      "Розкажіть про можливості фінансування для молоді",
      "Покажіть гранти для медіа-проектів",
      "Які гранти підтримують освітні ініціативи?"
    ],
    de: [
      "Zeigen Sie mir Förderungen für Frauenorganisationen",
      "Welche Förderungen unterstützen Menschenrechtsarbeit?",
      "Welche Förderungen haben bevorstehende Fristen?",
      "Erzählen Sie mir über Finanzierungsmöglichkeiten für Jugendliche",
      "Zeigen Sie mir Förderungen für Medienprojekte",
      "Welche Förderungen unterstützen Bildungsinitiativen?"
    ]
  };

  const suggestions = suggestionSets[language] || suggestionSets.en;
  
  // Filter out suggestions similar to current message
  const filtered = suggestions.filter(suggestion => 
    !message.toLowerCase().includes(suggestion.toLowerCase().substring(0, 10))
  );
  
  return filtered.sort(() => 0.5 - Math.random()).slice(0, 3);
}