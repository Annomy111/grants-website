const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Simple but intelligent chat endpoint that works without external AI
router.post('/grants', async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[Chat] Processing: "${message}" in ${language}`);

    // Get all active grants
    const grants = await db.all(`
      SELECT * FROM grants 
      WHERE application_deadline > date('now') OR application_deadline IS NULL
      ORDER BY application_deadline ASC
    `);

    // Smart grant matching
    const relevantGrants = smartMatch(grants, message);
    
    // Generate intelligent response
    const response = generateResponse(message, relevantGrants, language);
    
    // Generate suggestions
    const suggestions = getSuggestions(language, message);

    console.log(`[Chat] Found ${relevantGrants.length} relevant grants`);

    res.json({
      response: response,
      recommendedGrants: relevantGrants.slice(0, 3),
      suggestions: suggestions,
      language: language
    });

  } catch (error) {
    console.error('[Chat] Error:', error);
    res.status(500).json({
      response: "I'm experiencing technical difficulties. Please try again.",
      recommendedGrants: [],
      suggestions: [],
      error: true
    });
  }
});

function smartMatch(grants, message) {
  const msg = message.toLowerCase();
  
  // Keyword scoring system
  const keywords = {
    women: { terms: ['women', 'жінки', 'frauen', 'gender', 'гендер', 'feminist'], score: 3 },
    youth: { terms: ['youth', 'молодь', 'jugend', 'young', 'student'], score: 3 },
    rights: { terms: ['rights', 'права', 'rechte', 'human rights', 'justice'], score: 3 },
    media: { terms: ['media', 'медіа', 'medien', 'journalism', 'press'], score: 2 },
    education: { terms: ['education', 'освіта', 'bildung', 'school', 'university'], score: 2 },
    democracy: { terms: ['democracy', 'демократія', 'demokratie', 'governance'], score: 2 },
    health: { terms: ['health', 'здоров\'я', 'gesundheit', 'medical'], score: 2 },
    culture: { terms: ['culture', 'культура', 'kultur', 'arts', 'мистецтво'], score: 2 },
    ngo: { terms: ['ngo', 'нго', 'organization', 'organisation', 'society'], score: 1 }
  };

  return grants.map(grant => {
    let score = 0;
    const grantText = `${grant.grant_name} ${grant.funding_organization} ${grant.focus_areas} ${grant.eligibility_criteria}`.toLowerCase();
    
    // Check keywords
    for (const [category, config] of Object.entries(keywords)) {
      const msgHasKeyword = config.terms.some(term => msg.includes(term));
      const grantHasKeyword = config.terms.some(term => grantText.includes(term));
      
      if (msgHasKeyword && grantHasKeyword) {
        score += config.score;
      }
    }
    
    // Direct word matches
    const msgWords = msg.split(' ').filter(w => w.length > 3);
    msgWords.forEach(word => {
      if (grantText.includes(word)) score += 1;
    });
    
    // Deadline bonus
    if (grant.application_deadline) {
      const deadline = new Date(grant.application_deadline);
      const now = new Date();
      const days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      if (days > 0 && days <= 60) score += 1;
    }
    
    return { ...grant, score };
  })
  .filter(g => g.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 8);
}

function generateResponse(message, grants, language) {
  const msg = message.toLowerCase();
  
  // Response templates
  const templates = {
    en: {
      greeting: "Hello! I help Ukrainian civil society organizations find grants.",
      women: "I found grants specifically for women's organizations and gender equality work.",
      youth: "Here are grant opportunities for youth and student organizations.",
      rights: "I've found grants supporting human rights and justice work.",
      deadlines: "Here are grants with upcoming application deadlines.",
      general: "I found grants matching your query for Ukrainian organizations."
    },
    uk: {
      greeting: "Привіт! Я допомагаю українським організаціям знаходити гранти.",
      women: "Я знайшов гранти для жіночих організацій та гендерної рівності.",
      youth: "Ось грантові можливості для молодіжних організацій.",
      rights: "Я знайшов гранти для правозахисної роботи.",
      deadlines: "Ось гранти з найближчими термінами подання.",
      general: "Я знайшов гранти за вашим запитом для українських організацій."
    }
  };

  const t = templates[language] || templates.en;
  
  // Detect intent
  let intent = 'general';
  if (['hello', 'hi', 'hey', 'привіт'].some(w => msg.includes(w))) intent = 'greeting';
  else if (['women', 'жінки', 'gender', 'гендер'].some(w => msg.includes(w))) intent = 'women';
  else if (['youth', 'молодь', 'young'].some(w => msg.includes(w))) intent = 'youth';
  else if (['rights', 'права', 'justice'].some(w => msg.includes(w))) intent = 'rights';
  else if (['deadline', 'when', 'термін', 'коли'].some(w => msg.includes(w))) intent = 'deadlines';

  let response = t[intent] || t.general;
  
  if (grants.length > 0) {
    response += `\n\n${grants.slice(0, 3).map((g, i) => 
      `${i + 1}. **${g.grant_name}** by ${g.funding_organization}
   Amount: ${g.grant_amount || 'Not specified'}
   Deadline: ${g.application_deadline || 'Not specified'}`
    ).join('\n\n')}`;
    
    if (grants.length > 3) {
      response += language === 'uk' 
        ? `\n\nТа ще ${grants.length - 3} інших можливостей.`
        : `\n\nAnd ${grants.length - 3} more opportunities.`;
    }
  } else {
    response += language === 'uk' 
      ? '\n\nНа жаль, не знайшов точних відповідностей, але є загальні можливості.'
      : '\n\nI didn\'t find exact matches, but there are general opportunities available.';
  }

  return response;
}

function getSuggestions(language, message) {
  const suggestions = {
    en: [
      "Show me grants for women's organizations",
      "What grants support human rights work?", 
      "Which grants have upcoming deadlines?",
      "Tell me about youth funding opportunities",
      "Show me grants for media organizations",
      "What grants support education projects?"
    ],
    uk: [
      "Покажіть гранти для жіночих організацій",
      "Які гранти підтримують правозахисну роботу?",
      "Які гранти мають найближчі терміни?",
      "Розкажіть про можливості для молоді",
      "Покажіть гранти для медіа-організацій",
      "Які гранти підтримують освітні проекти?"
    ]
  };

  const s = suggestions[language] || suggestions.en;
  return s.filter(suggestion => 
    !message.toLowerCase().includes(suggestion.toLowerCase().substring(0, 10))
  ).sort(() => 0.5 - Math.random()).slice(0, 3);
}

module.exports = router;