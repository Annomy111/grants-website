const express = require('express');
const db = require('../database/db');
const axios = require('axios');

const router = express.Router();

// AI Chat endpoint for grants assistance
router.post('/grants', async (req, res) => {
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[Chat] Processing message in ${language}: ${message.substring(0, 100)}...`);

    // Fetch relevant grants from database
    const grants = await db.all('SELECT * FROM grants ORDER BY application_deadline ASC LIMIT 5');
    console.log(`[Chat] Found ${grants.length} grants in database`);

    // Create very simple context (minimal to avoid API issues)
    const grantsContext = grants.slice(0, 3).map(grant => ({
      name: grant.grant_name || 'Unknown',
      organization: grant.funding_organization || 'Unknown',
      amount: grant.grant_amount || 'Not specified',
      deadline: grant.application_deadline || 'Not specified'
    }));

    // Find relevant grants based on user message
    const relevantGrants = searchRelevantGrants(grants, message, language);
    console.log(`[Chat] Found ${relevantGrants.length} relevant grants`);

    // Prepare system prompt based on language
    const systemPrompts = {
      en: `You help find grants for Ukrainian organizations. Available grants: ${JSON.stringify(grantsContext)}. Question: ${message}`,

      uk: `Ви експерт з грантів для українських організацій громадянського суспільства. Ви допомагаєте користувачам знаходити та розуміти грантові можливості.

Контекст доступних грантів: ${JSON.stringify(grantsContext, null, 2)}

Інструкції:
- Відповідайте українською мовою
- Будьте корисними та інформативними щодо грантів
- Надавайте конкретні рекомендації грантів, коли це доречно
- Тримайте відповіді стислими, але вичерпними
- Включайте критерії відбору та терміни, коли це доречно
- Якщо запитують про конкретні сфери діяльності, згадуйте відповідні гранти
- Будьте заохочувальними та підтримуючими

Запитання користувача: ${message}`,

      de: `Sie sind ein Experte für Fördermittel für ukrainische Zivilgesellschaftsorganisationen. Sie helfen Benutzern dabei, Fördermöglichkeiten zu finden und zu verstehen.

Verfügbarer Förderkontext: ${JSON.stringify(grantsContext, null, 2)}

Anweisungen:
- Antworten Sie auf Deutsch
- Seien Sie hilfreich und informativ über Fördermittel
- Geben Sie spezifische Förderempfehlungen, wenn relevant
- Halten Sie Antworten prägnant aber umfassend
- Fügen Sie Berechtigung und Fristen ein, wenn relevant
- Bei Fragen zu bestimmten Fokusbereichen erwähnen Sie relevante Förderungen
- Seien Sie ermutigend und unterstützend

Benutzerfrage: ${message}`
    };

    const systemPrompt = systemPrompts[language] || systemPrompts.en;

    // Call DeepSeek API for AI response with retry logic
    let deepseekResponse;
    let lastError;
    
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Chat] Attempt ${attempt} to call DeepSeek API`);
        
        deepseekResponse = await axios.post('https://api.deepseek.com/v1/chat/completions', {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            ...conversationHistory.slice(-2).map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // Reduced timeout
        });
        
        console.log(`[Chat] DeepSeek API success on attempt ${attempt}`);
        break; // Success, exit retry loop
        
      } catch (apiError) {
        console.log(`[Chat] DeepSeek API failed on attempt ${attempt}:`, apiError.message);
        lastError = apiError;
        
        if (attempt === 2) {
          throw lastError; // Final attempt failed, throw error
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const aiResponse = deepseekResponse.data.choices[0].message.content;
    console.log(`[Chat] Generated AI response: ${aiResponse.substring(0, 100)}...`);

    // Generate follow-up suggestions based on language
    const suggestions = generateSuggestions(language, message);

    // Prepare response
    const response = {
      response: aiResponse,
      recommendedGrants: relevantGrants.slice(0, 3), // Top 3 most relevant grants
      suggestions: suggestions,
      language: language
    };

    console.log(`[Chat] Sending response with ${response.recommendedGrants.length} grant recommendations`);
    res.json(response);

  } catch (error) {
    console.error('[Chat] Error processing chat request:', error.message);
    console.error('[Chat] Error details:', {
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Intelligent rule-based response system
    console.log('[Chat] Using intelligent fallback system');
    
    const allGrants = await db.all('SELECT * FROM grants WHERE application_deadline > date("now") ORDER BY application_deadline ASC').catch(() => []);
    
    // Smart grant filtering based on user message
    const smartGrants = smartGrantMatching(allGrants, message, language);
    
    // Generate intelligent response based on user query
    const intelligentResponse = generateIntelligentResponse(message, smartGrants, language);
    
    // Generate contextual suggestions
    const suggestions = generateSuggestions(language, message);

    res.json({
      response: intelligentResponse,
      recommendedGrants: smartGrants.slice(0, 3),
      suggestions: suggestions,
      error: false
    });
  }
});

// Helper function to search for relevant grants
function searchRelevantGrants(grants, message, language) {
  const messageLower = message.toLowerCase();
  
  // Define search keywords in different languages
  const keywords = {
    ngo: ['ngo', 'нго', 'організація', 'organization', 'verein', 'organisation'],
    humanRights: ['human rights', 'права людини', 'menschenrechte', 'rights', 'правa'],
    education: ['education', 'освіта', 'bildung', 'навчання', 'learning'],
    democracy: ['democracy', 'демократія', 'demokratie', 'democratic'],
    media: ['media', 'медіа', 'medien', 'journalism', 'журналістика'],
    youth: ['youth', 'молодь', 'jugend', 'young'],
    women: ['women', 'жінки', 'frauen', 'gender', 'гендер'],
    culture: ['culture', 'культура', 'kultur', 'cultural', 'культурний']
  };

  return grants.filter(grant => {
    // Check if grant matches message content
    const grantText = `${grant.grant_name} ${grant.funding_organization} ${grant.focus_areas} ${grant.eligibility_criteria}`.toLowerCase();
    
    // Direct text match
    if (grantText.includes(messageLower) || messageLower.split(' ').some(word => grantText.includes(word) && word.length > 3)) {
      return true;
    }

    // Keyword category matching
    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      const messageHasKeyword = categoryKeywords.some(keyword => messageLower.includes(keyword));
      const grantHasKeyword = categoryKeywords.some(keyword => grantText.includes(keyword));
      
      if (messageHasKeyword && grantHasKeyword) {
        return true;
      }
    }

    return false;
  }).slice(0, 5); // Return top 5 matches
}

// Helper function to generate conversation suggestions
function generateSuggestions(language, message) {
  const suggestionSets = {
    en: [
      "Show me grants for NGOs",
      "What grants support human rights work?",
      "Which grants have upcoming deadlines?",
      "Tell me about education funding",
      "What grants support women's organizations?",
      "Show me grants for media projects"
    ],
    uk: [
      "Покажіть гранти для НГО",
      "Які гранти підтримують правозахисну роботу?",
      "Які гранти мають найближчі терміни?",
      "Розкажіть про фінансування освіти",
      "Які гранти підтримують жіночі організації?",
      "Покажіть гранти для медіа-проектів"
    ],
    de: [
      "Zeigen Sie mir Förderungen für NGOs",
      "Welche Förderungen unterstützen Menschenrechtsarbeit?",
      "Welche Förderungen haben bevorstehende Fristen?",
      "Erzählen Sie mir über Bildungsfinanzierung",
      "Welche Förderungen unterstützen Frauenorganisationen?",
      "Zeigen Sie mir Förderungen für Medienprojekte"
    ]
  };

  const suggestions = suggestionSets[language] || suggestionSets.en;
  
  // Return 3 random suggestions, excluding any that are too similar to current message
  const filtered = suggestions.filter(suggestion => 
    !message.toLowerCase().includes(suggestion.toLowerCase().substring(0, 10))
  );
  
  return filtered.sort(() => 0.5 - Math.random()).slice(0, 3);
}

// Enhanced smart grant matching with scoring
function smartGrantMatching(grants, message, language) {
  const messageLower = message.toLowerCase();
  
  // Enhanced keyword categories with scoring weights
  const keywordCategories = {
    // Organization types
    ngo: { 
      keywords: ['ngo', 'нго', 'organisation', 'organization', 'verein', 'organisation', 'society', 'товариство'],
      weight: 2 
    },
    // Focus areas
    humanRights: { 
      keywords: ['human rights', 'права людини', 'menschenrechte', 'rights', 'правa', 'justice', 'справедливість'],
      weight: 3 
    },
    women: { 
      keywords: ['women', 'жінки', 'frauen', 'gender', 'гендер', 'feminist', 'феміністський'],
      weight: 3 
    },
    youth: { 
      keywords: ['youth', 'молодь', 'jugend', 'young', 'students', 'студенти'],
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
    }
  };

  // Score each grant
  const scoredGrants = grants.map(grant => {
    let score = 0;
    const grantText = `${grant.grant_name} ${grant.funding_organization} ${grant.focus_areas} ${grant.eligibility_criteria}`.toLowerCase();
    
    // Direct keyword matching with weights
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
    
    // Deadline proximity bonus (prefer grants with nearer deadlines)
    if (grant.application_deadline) {
      const deadline = new Date(grant.application_deadline);
      const now = new Date();
      const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeadline > 0 && daysUntilDeadline <= 90) {
        score += 1; // Bonus for upcoming deadlines
      }
    }
    
    return { ...grant, score };
  });

  // Sort by score and return top matches
  return scoredGrants
    .filter(grant => grant.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// Generate intelligent response based on context
function generateIntelligentResponse(message, grants, language) {
  const messageLower = message.toLowerCase();
  
  const responses = {
    en: {
      greeting: ['hello', 'hi', 'hey', 'good', 'morning', 'afternoon'],
      help: ['help', 'assist', 'support'],
      women: ['women', 'gender', 'feminist'],
      youth: ['youth', 'young', 'students'],
      humanRights: ['human rights', 'rights', 'justice'],
      deadlines: ['deadline', 'when', 'time', 'urgent'],
      amount: ['how much', 'amount', 'money', 'funding']
    },
    uk: {
      greeting: ['привіт', 'добрий', 'день', 'ранок'],
      help: ['допомога', 'підтримка', 'допоможіть'],
      women: ['жінки', 'гендер', 'жіночі'],
      youth: ['молодь', 'молоді', 'студенти'],
      humanRights: ['права людини', 'права', 'справедливість'],
      deadlines: ['термін', 'коли', 'час', 'терміново'],
      amount: ['скільки', 'сума', 'гроші', 'фінансування']
    }
  };

  const userResponses = responses[language] || responses.en;
  
  // Determine response type based on message content
  let responseType = 'general';
  
  if (userResponses.greeting.some(word => messageLower.includes(word))) {
    responseType = 'greeting';
  } else if (userResponses.women.some(word => messageLower.includes(word))) {
    responseType = 'women';
  } else if (userResponses.youth.some(word => messageLower.includes(word))) {
    responseType = 'youth';
  } else if (userResponses.humanRights.some(word => messageLower.includes(word))) {
    responseType = 'humanRights';
  } else if (userResponses.deadlines.some(word => messageLower.includes(word))) {
    responseType = 'deadlines';
  } else if (userResponses.amount.some(word => messageLower.includes(word))) {
    responseType = 'amount';
  }

  // Generate contextual response
  const templates = {
    en: {
      greeting: `Hello! I'm here to help you find grants for Ukrainian civil society organizations. ${grants.length > 0 ? `I found ${grants.length} relevant opportunities for you.` : 'Let me know what type of funding you\'re looking for.'}`,
      women: `I found ${grants.length} grants specifically relevant to women's organizations and gender equality work.`,
      youth: `Here are ${grants.length} grant opportunities focused on youth and student organizations.`,
      humanRights: `I've identified ${grants.length} grants supporting human rights and justice work.`,
      deadlines: `Based on upcoming deadlines, here are ${grants.length} grants you should consider applying to soon.`,
      amount: `Here are ${grants.length} grants with different funding amounts available.`,
      general: `I found ${grants.length} grants that match your query for Ukrainian civil society organizations.`
    },
    uk: {
      greeting: `Привіт! Я тут, щоб допомогти вам знайти гранти для українських організацій громадянського суспільства. ${grants.length > 0 ? `Я знайшов ${grants.length} відповідних можливостей для вас.` : 'Дайте мені знати, який тип фінансування ви шукаєте.'}`,
      women: `Я знайшов ${grants.length} грантів, що стосуються жіночих організацій та роботи з гендерної рівності.`,
      youth: `Ось ${grants.length} грантових можливостей, орієнтованих на молодіжні та студентські організації.`,
      humanRights: `Я визначив ${grants.length} грантів, що підтримують роботу з прав людини та справедливості.`,
      deadlines: `На основі найближчих термінів, ось ${grants.length} грантів, на які варто подавати заявки найближчим часом.`,
      amount: `Ось ${grants.length} грантів з різними доступними сумами фінансування.`,
      general: `Я знайшов ${grants.length} грантів, що відповідають вашому запиту для українських організацій громадянського суспільства.`
    }
  };

  const responseTemplates = templates[language] || templates.en;
  let response = responseTemplates[responseType] || responseTemplates.general;

  // Add grant details if found
  if (grants.length > 0) {
    const grantsList = grants.slice(0, 3).map((grant, i) => {
      const amount = grant.grant_amount || (language === 'uk' ? 'Не вказано' : language === 'de' ? 'Nicht angegeben' : 'Not specified');
      const deadline = grant.application_deadline || (language === 'uk' ? 'Не вказано' : language === 'de' ? 'Nicht angegeben' : 'Not specified');
      
      return `${i + 1}. **${grant.grant_name}** by ${grant.funding_organization}
   Amount: ${amount}
   Deadline: ${deadline}`;
    }).join('\n\n');

    response += `\n\n${grantsList}`;
    
    if (grants.length > 3) {
      const moreText = language === 'uk' ? `\n\nТа ще ${grants.length - 3} інших можливостей.` 
                    : language === 'de' ? `\n\nUnd ${grants.length - 3} weitere Möglichkeiten.`
                    : `\n\nAnd ${grants.length - 3} more opportunities.`;
      response += moreText;
    }
  } else {
    const noResultsText = language === 'uk' ? '\n\nНа жаль, я не знайшов конкретних грантів за вашим запитом, але ось деякі загальні можливості:'
                        : language === 'de' ? '\n\nLeider habe ich keine spezifischen Förderungen für Ihre Anfrage gefunden, aber hier sind einige allgemeine Möglichkeiten:'
                        : '\n\nI didn\'t find specific grants for your query, but here are some general opportunities:';
    response += noResultsText;
  }

  return response;
}

module.exports = router;