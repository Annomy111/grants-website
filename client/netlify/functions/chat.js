import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    const { message, sessionId, language = 'en' } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Get or create chat session
    let session = null;
    if (sessionId) {
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      session = data;
    }

    if (!session) {
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          session_data: { language, created_at: new Date().toISOString() }
        })
        .select()
        .single();
      
      if (sessionError) {
        console.error('Session creation error:', sessionError);
      } else {
        session = newSession;
      }
    }

    // Get grants from database for context
    const { data: grants, error: grantsError } = await supabase
      .from('grants')
      .select('*')
      .eq('status', 'active')
      .order('application_deadline', { ascending: true });

    if (grantsError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch grants data' }),
      };
    }

    // Get chat history for context
    let chatHistory = [];
    if (session) {
      const { data: history } = await supabase
        .from('chat_messages')
        .select('message, response')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true })
        .limit(5); // Last 5 messages for context
      
      chatHistory = history || [];
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(message, grants, chatHistory, language);

    // Save chat message to database
    let chatMessageId = null;
    if (session) {
      const { data: savedMessage, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          message: message,
          response: aiResponse.response,
          recommended_grants: aiResponse.recommendedGrants
        })
        .select()
        .single();

      if (messageError) {
        console.error('Message save error:', messageError);
      } else {
        chatMessageId = savedMessage.id;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: aiResponse.response,
        recommendedGrants: aiResponse.recommendedGrants,
        suggestions: aiResponse.suggestions,
        sessionId: session?.id,
        messageId: chatMessageId
      }),
    };

  } catch (error) {
    console.error('Chat function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
    };
  }
};

async function generateAIResponse(userMessage, grants, chatHistory, language) {
  const isUkrainian = language === 'uk';
  
  // Analyze user message for grant matching
  const keywords = userMessage.toLowerCase().split(/\s+/);
  const recommendedGrants = [];

  // Simple keyword matching for grant recommendations
  grants.forEach(grant => {
    let relevanceScore = 0;
    const grantText = `${grant.grant_name} ${grant.funding_organization} ${grant.focus_areas} ${grant.eligibility_criteria}`.toLowerCase();
    
    keywords.forEach(keyword => {
      if (grantText.includes(keyword)) {
        relevanceScore += 1;
      }
    });

    // Boost score for exact matches
    if (grant.focus_areas && keywords.some(k => grant.focus_areas.toLowerCase().includes(k))) {
      relevanceScore += 2;
    }
    if (grant.funding_organization && keywords.some(k => grant.funding_organization.toLowerCase().includes(k))) {
      relevanceScore += 2;
    }

    if (relevanceScore > 0) {
      recommendedGrants.push({
        ...grant,
        relevanceScore
      });
    }
  });

  // Sort by relevance and take top 5
  recommendedGrants.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const topGrants = recommendedGrants.slice(0, 5);

  // Generate contextual response
  let response = '';
  const suggestions = [];

  if (topGrants.length > 0) {
    if (isUkrainian) {
      response = `Я знайшов ${topGrants.length} грантів, які можуть вас зацікавити:\n\n`;
      topGrants.forEach((grant, index) => {
        response += `${index + 1}. **${grant.grant_name}**\n`;
        response += `   Організація: ${grant.funding_organization}\n`;
        response += `   Сума: ${grant.grant_amount || 'Не вказано'}\n`;
        response += `   Дедлайн: ${grant.application_deadline || 'Не вказано'}\n\n`;
      });
      response += 'Чи хотіли б ви дізнатися більше про якийсь конкретний грант?';
      
      suggestions.push(
        'Розкажіть більше про перший грант',
        'Які є гранти для молодіжних організацій?',
        'Покажіть гранти з найближчими дедлайнами'
      );
    } else {
      response = `I found ${topGrants.length} grants that might interest you:\n\n`;
      topGrants.forEach((grant, index) => {
        response += `${index + 1}. **${grant.grant_name}**\n`;
        response += `   Organization: ${grant.funding_organization}\n`;
        response += `   Amount: ${grant.grant_amount || 'Not specified'}\n`;
        response += `   Deadline: ${grant.application_deadline || 'Not specified'}\n\n`;
      });
      response += 'Would you like to know more about any specific grant?';
      
      suggestions.push(
        'Tell me more about the first grant',
        'What grants are available for youth organizations?',
        'Show me grants with upcoming deadlines'
      );
    }
  } else {
    // No direct matches, provide general guidance
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      if (isUkrainian) {
        response = 'Привіт! Я ваш помічник з пошуку грантів для громадянського суспільства. Я можу допомогти вам знайти підходящі гранти за вашими потребами. Просто опишіть свою організацію та цілі!';
        suggestions.push(
          'Покажіть усі доступні гранти',
          'Які є гранти для правозахисних організацій?',
          'Гранти для жіночих організацій'
        );
      } else {
        response = 'Hello! I\'m your civil society grants assistant. I can help you find suitable grants for your organization. Just describe your organization and goals!';
        suggestions.push(
          'Show me all available grants',
          'What grants are available for human rights organizations?',
          'Grants for women\'s organizations'
        );
      }
    } else {
      if (isUkrainian) {
        response = `Я не знайшов грантів, які точно відповідають вашому запиту "${userMessage}". Спробуйте використати більш загальні терміни або перегляньте всі доступні гранти.`;
        suggestions.push(
          'Покажіть усі доступні гранти',
          'Гранти для освітніх організацій',
          'Гранти від ЄС'
        );
      } else {
        response = `I couldn't find grants that exactly match your query "${userMessage}". Try using more general terms or browse all available grants.`;
        suggestions.push(
          'Show me all available grants',
          'Grants for educational organizations',
          'EU grants'
        );
      }
    }
  }

  return {
    response,
    recommendedGrants: topGrants.map(g => ({
      id: g.id,
      grant_name: g.grant_name,
      funding_organization: g.funding_organization,
      grant_amount: g.grant_amount,
      application_deadline: g.application_deadline,
      focus_areas: g.focus_areas
    })),
    suggestions
  };
}