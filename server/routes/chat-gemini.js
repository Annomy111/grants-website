const express = require('express');
const db = require('../database/db');
const axios = require('axios');

const router = express.Router();

// Gemini API key
const GEMINI_API_KEY = 'AIzaSyD7DRJZBlzJtaszmNe-3UjLZZKE9ujH16U';

// Gemini-powered chat endpoint
router.post('/grants', async (req, res) => {
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[Chat] Processing message in ${language}: ${message.substring(0, 100)}...`);

    // Fetch relevant grants from database
    const grants = await db.all('SELECT * FROM grants WHERE application_deadline > date("now") OR application_deadline IS NULL ORDER BY application_deadline ASC LIMIT 10');
    console.log(`[Chat] Found ${grants.length} grants in database`);

    // Create grants context for AI
    const grantsContext = grants.slice(0, 5).map(grant => ({
      name: grant.grant_name || 'Unknown',
      organization: grant.funding_organization || 'Unknown',
      country: grant.country_region || 'Unknown', 
      focus_areas: grant.focus_areas || 'Unknown',
      amount: grant.grant_amount || 'Not specified',
      deadline: grant.application_deadline || 'Not specified',
      eligibility: grant.eligibility_criteria?.substring(0, 150) || 'Check website'
    }));

    // Find relevant grants based on user message
    const relevantGrants = smartGrantMatching(grants, message, language);
    console.log(`[Chat] Found ${relevantGrants.length} relevant grants`);

    // Prepare system prompt based on language
    const systemPrompts = {
      en: `You are a helpful grants assistant for Ukrainian civil society organizations. Help users find and understand grant opportunities.

Available grants: ${JSON.stringify(grantsContext, null, 2)}

Instructions:
- Respond in English
- Be helpful and informative about grants
- Keep responses concise (under 300 words)
- Mention specific relevant grants when possible
- Include grant amounts and deadlines
- Be encouraging and supportive

User's question: ${message}`,

      uk: `Ви помічник з грантів для українських організацій громадянського суспільства. Допомагайте користувачам знаходити та розуміти грантові можливості.

Доступні гранти: ${JSON.stringify(grantsContext, null, 2)}

Інструкції:
- Відповідайте українською мовою
- Будьте корисними та інформативними щодо грантів
- Тримайте відповіді стислими (до 300 слів)
- Згадуйте конкретні відповідні гранти коли можливо
- Включайте суми грантів та терміни
- Будьте заохочувальними та підтримуючими

Запитання користувача: ${message}`,

      de: `Sie sind ein hilfreicher Förderungsassistent für ukrainische Zivilgesellschaftsorganisationen. Helfen Sie Benutzern dabei, Fördermöglichkeiten zu finden und zu verstehen.

Verfügbare Förderungen: ${JSON.stringify(grantsContext, null, 2)}

Anweisungen:
- Antworten Sie auf Deutsch
- Seien Sie hilfreich und informativ über Förderungen
- Halten Sie Antworten prägnant (unter 300 Wörter)
- Erwähnen Sie spezifische relevante Förderungen wenn möglich
- Fügen Sie Förderbeträge und Fristen ein
- Seien Sie ermutigend und unterstützend

Benutzerfrage: ${message}`
    };

    const systemPrompt = systemPrompts[language] || systemPrompts.en;

    // Try Gemini API first
    let aiResponse = null;
    try {
      console.log('[Chat] Attempting to call Gemini API');
      
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
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
        aiResponse = geminiResponse.data.candidates[0].content.parts[0].text;
        console.log(`[Chat] Gemini API success: ${aiResponse.substring(0, 100)}...`);
      }

    } catch (geminiError) {
      console.log('[Chat] Gemini API failed:', geminiError.message);
      
      // Fallback to intelligent rule-based response
      aiResponse = generateIntelligentFallback(message, relevantGrants, language);
      console.log('[Chat] Using intelligent fallback response');
    }

    // Generate follow-up suggestions
    const suggestions = generateSuggestions(language, message);

    // Prepare response
    const response = {
      response: aiResponse,
      recommendedGrants: relevantGrants.slice(0, 3),
      suggestions: suggestions,
      language: language
    };

    console.log(`[Chat] Sending response with ${response.recommendedGrants.length} grant recommendations`);
    res.json(response);

  } catch (error) {
    console.error('[Chat] Error processing chat request:', error.message);
    
    // Final fallback
    const fallbackResponses = {
      en: "I'm here to help you find grants for Ukrainian civil society organizations. Please try asking about specific areas like women's rights, youth programs, or human rights work.",
      uk: "Я тут, щоб допомогти вам знайти гранти для українських організацій громадянського суспільства. Спробуйте запитати про конкретні сфери, як права жінок, молодіжні програми або правозахисна робота.",
      de: "Ich bin hier, um Ihnen zu helfen, Förderungen für ukrainische Zivilgesellschaftsorganisationen zu finden. Versuchen Sie, nach spezifischen Bereichen wie Frauenrechte, Jugendprogramme oder Menschenrechtsarbeit zu fragen."
    };

    const { language = 'en' } = req.body;
    const fallbackMessage = fallbackResponses[language] || fallbackResponses.en;

    res.json({
      response: fallbackMessage,
      recommendedGrants: [],
      suggestions: generateSuggestions(language, ''),
      error: false
    });
  }
});

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
      return `${i + 1}. **${grant.grant_name}** by ${grant.funding_organization}
   Amount: ${grant.grant_amount || 'Not specified'}
   Deadline: ${grant.application_deadline || 'Not specified'}`;
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

module.exports = router;