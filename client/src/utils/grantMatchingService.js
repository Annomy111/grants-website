import axios from 'axios';

const GEMINI_API_KEY = process.env.REACT_APP_GOOGLE_GEMINI_API_KEY;

// Call Gemini AI for grant analysis
export async function callGeminiForAnalysis(message, language = 'en') {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured');
    return getDefaultAIResponse(language);
  }

  try {
    const prompt = language === 'uk' 
      ? `Проаналізуйте для українських ОГС пошук грантів 2025: ${message}. 
         Врахуйте: гранти UNDP до $100K (права людини, соціальна згуртованість, дедлайн травень 2025), 
         EU Facility €50B (ЄС інтеграція, післявоєнне відновлення), скорочення фінансування USAID. 
         Надайте персоналізовані поради, підкажіть 3-5 грантів з причинами. Відповідайте українською.`
      : `Analyze for Ukrainian CSO grant matching 2025: ${message}. 
         Consider: UNDP $100K recovery calls (human rights, social cohesion, deadline May 2025), 
         EU €50B Facility (EU integration, post-war), USAID funding cuts impact. 
         Provide personalized insights, tips like aligning with Victims' Directive, 
         and suggest 3-5 matches with reasons.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ 
          parts: [{ 
            text: prompt
          }] 
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      },
      { 
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text;
    }
    
    return getDefaultAIResponse(language);
  } catch (error) {
    console.error('Gemini API error:', error);
    return getDefaultAIResponse(language);
  }
}

// Default AI response when API fails
function getDefaultAIResponse(language) {
  if (language === 'uk') {
    return 'На основі вашого профілю рекомендуємо звернути увагу на гранти UNDP для відновлення (до $100K, дедлайн травень 2025) та програму EU Ukraine Facility. Зверніть увагу на відповідність критеріям щодо реєстрації та досвіду роботи.';
  }
  return 'Based on your profile, consider UNDP recovery grants (up to $100K, deadline May 2025) and the EU Ukraine Facility program. Focus on meeting eligibility criteria regarding registration and experience requirements.';
}

// Smart grant matching with weighted scoring
export function smartGrantMatching(grants, answers, language = 'en') {
  if (!grants || grants.length === 0) return [];

  // Extract answer values
  const {
    focusArea = '',
    geographicRegion = '',
    fundingAmount = '',
    timeline = '',
    grantType = '',
    additionalDetails = ''
  } = answers;

  // Combine all text for analysis
  const userProfile = `${focusArea} ${geographicRegion} ${fundingAmount} ${timeline} ${grantType} ${additionalDetails}`.toLowerCase();

  // Enhanced keyword categories based on 2025 Ukrainian CSO priorities
  const keywordCategories = {
    humanRights: {
      keywords: [
        'human rights', 'права людини', 'war crimes', 'військові злочини',
        'documentation', 'документування', 'victim support', 'підтримка жертв',
        'justice', 'правосуддя', 'legal aid', 'правова допомога',
        'CRSV', 'conflict-related sexual violence'
      ],
      weight: 6
    },
    postWarRecovery: {
      keywords: [
        'post-war', 'післявоєнний', 'recovery', 'відновлення',
        'reconstruction', 'реконструкція', 'rebuilding', 'відбудова',
        'infrastructure', 'інфраструктура', 'IDP', 'ВПО',
        'internally displaced', 'внутрішньо переміщені', 'veterans', 'ветерани'
      ],
      weight: 5
    },
    euIntegration: {
      keywords: [
        'EU integration', 'ЄС інтеграція', 'European', 'європейський',
        'anti-corruption', 'антикорупція', 'reforms', 'реформи',
        'governance', 'урядування', 'transparency', 'прозорість',
        'democratic', 'демократичний'
      ],
      weight: 5
    },
    socialCohesion: {
      keywords: [
        'social cohesion', 'соціальна згуртованість', 'community', 'громада',
        'civic engagement', 'громадянська участь', 'dialogue', 'діалог',
        'peacebuilding', 'миробудівництво', 'reconciliation', 'примирення'
      ],
      weight: 4
    },
    gender: {
      keywords: [
        'gender', 'гендер', 'women', 'жінки', 'girls', 'дівчата',
        'equality', 'рівність', 'empowerment', 'розширення прав',
        'GBV', 'gender-based violence', 'гендерне насильство'
      ],
      weight: 4
    },
    emergency: {
      keywords: [
        'emergency', 'надзвичайний', 'humanitarian', 'гуманітарний',
        'urgent', 'терміновий', 'crisis', 'криза', 'relief', 'допомога'
      ],
      weight: 3
    }
  };

  // Score each grant
  const scoredGrants = grants.map(grant => {
    let score = 0;
    let matchReasons = [];

    // Create searchable grant text
    const grantText = [
      grant.name || grant.name_en || '',
      grant.organization || '',
      grant.focus_areas || grant.focus_areas_en || '',
      grant.geographic_focus || '',
      grant.description || grant.description_en || '',
      grant.eligibility || grant.eligibility_en || ''
    ].join(' ').toLowerCase();

    // 1. Focus area matching (30% weight)
    Object.entries(keywordCategories).forEach(([category, { keywords, weight }]) => {
      const categoryMatches = keywords.filter(keyword => 
        userProfile.includes(keyword) && grantText.includes(keyword)
      );
      
      if (categoryMatches.length > 0) {
        score += weight * categoryMatches.length;
        matchReasons.push(`${category}: ${categoryMatches.length} keyword matches`);
      }
    });

    // 2. Geographic matching (20% weight)
    const geoScore = calculateGeographicScore(geographicRegion, grant.geographic_focus || '');
    score += geoScore;
    if (geoScore > 0) {
      matchReasons.push(`Geographic match: ${grant.geographic_focus}`);
    }

    // 3. Funding amount matching (15% weight)
    const fundingScore = calculateFundingScore(fundingAmount, grant.grant_size_min, grant.grant_size_max);
    score += fundingScore;
    if (fundingScore > 0) {
      matchReasons.push(`Funding range match`);
    }

    // 4. Timeline/deadline matching (15% weight)
    const deadlineScore = calculateDeadlineScore(timeline, grant.application_deadline);
    score += deadlineScore;
    if (deadlineScore > 0) {
      matchReasons.push(`Timeline compatibility`);
    }

    // 5. Grant type matching (10% weight)
    const typeScore = calculateGrantTypeScore(grantType, grant.type || grantText);
    score += typeScore;
    if (typeScore > 0) {
      matchReasons.push(`Grant type match`);
    }

    // 6. Special bonuses for 2025 priorities
    // Bonus for known good donors
    if (grantText.includes('undp') || grantText.includes('eu') || grantText.includes('usaid')) {
      score += 3;
      matchReasons.push(`Reputable donor`);
    }

    // Bonus for Ukraine-specific
    if (grantText.includes('ukraine') || grantText.includes('україн')) {
      score += 5;
      matchReasons.push(`Ukraine-focused`);
    }

    // Bonus for upcoming deadlines
    const daysToDeadline = grant.application_deadline 
      ? Math.floor((new Date(grant.application_deadline) - new Date()) / (1000 * 60 * 60 * 24))
      : null;
    
    if (daysToDeadline && daysToDeadline > 0 && daysToDeadline < 90) {
      score += 4;
      matchReasons.push(`Deadline approaching (${daysToDeadline} days)`);
    }

    // Calculate match percentage
    const maxPossibleScore = 50; // Approximate maximum score
    const matchPercentage = Math.min(100, Math.round((score / maxPossibleScore) * 100));

    return {
      ...grant,
      match_score: matchPercentage,
      match_reasons: matchReasons,
      raw_score: score
    };
  });

  // Filter and sort
  return scoredGrants
    .filter(grant => grant.match_score > 30) // Minimum 30% match
    .sort((a, b) => b.match_score - a.match_score);
}

// Helper functions for scoring
function calculateGeographicScore(userRegion, grantRegion) {
  const grantRegionLower = grantRegion.toLowerCase();
  const userRegionLower = userRegion.toLowerCase();

  // Exact match
  if (grantRegionLower.includes(userRegionLower)) return 10;

  // Compatible regions
  const regionCompatibility = {
    'ukraine': ['ukraine', 'eastern europe', 'europe', 'global', 'international'],
    'eastern europe': ['eastern europe', 'europe', 'global', 'international'],
    'eu': ['eu', 'europe', 'global', 'international'],
    'global': ['global', 'international']
  };

  const compatibleRegions = regionCompatibility[userRegionLower] || [];
  if (compatibleRegions.some(region => grantRegionLower.includes(region))) {
    return 7;
  }

  return 0;
}

function calculateFundingScore(userAmount, grantMin, grantMax) {
  if (!grantMin && !grantMax) return 5; // Unknown amount, partial score

  const amountRanges = {
    'small': { min: 0, max: 25000 },
    'medium': { min: 25000, max: 100000 },
    'large': { min: 100000, max: Infinity }
  };

  const userRange = amountRanges[userAmount];
  if (!userRange) return 0;

  // Check if grant range overlaps with user's needed range
  const grantMinAmount = grantMin || 0;
  const grantMaxAmount = grantMax || Infinity;

  if (grantMaxAmount >= userRange.min && grantMinAmount <= userRange.max) {
    return 8; // Good match
  }

  return 0;
}

function calculateDeadlineScore(userTimeline, grantDeadline) {
  if (!grantDeadline) return 5; // Rolling deadline, partial score

  const daysToDeadline = Math.floor((new Date(grantDeadline) - new Date()) / (1000 * 60 * 60 * 24));
  
  if (daysToDeadline < 0) return 0; // Deadline passed

  const timelineMap = {
    'urgent': { min: 0, max: 90 },
    'medium': { min: 90, max: 180 },
    'long': { min: 180, max: Infinity }
  };

  const userRange = timelineMap[userTimeline];
  if (!userRange) return 0;

  if (daysToDeadline >= userRange.min && daysToDeadline <= userRange.max) {
    return 8;
  }

  return 3; // Partial score if timeline doesn't match perfectly
}

function calculateGrantTypeScore(userType, grantInfo) {
  const grantInfoLower = grantInfo.toLowerCase();

  const typeKeywords = {
    'project': ['project', 'initiative', 'program', 'implementation'],
    'operational': ['operational', 'core', 'general', 'unrestricted'],
    'capacity': ['capacity', 'training', 'development', 'strengthening'],
    'emergency': ['emergency', 'urgent', 'humanitarian', 'relief']
  };

  const keywords = typeKeywords[userType] || [];
  if (keywords.some(keyword => grantInfoLower.includes(keyword))) {
    return 5;
  }

  return 0;
}

// Export helpful tips based on user profile
export function generateGrantTips(answers, language = 'en') {
  const tips = [];

  if (language === 'uk') {
    tips.push('Переконайтеся, що ваша організація зареєстрована відповідно до українського законодавства');
    tips.push('Підготуйте фінансові звіти за останні 2 роки');
    tips.push('Розробіть чіткий план моніторингу та оцінки проекту');
    
    if (answers.focusArea?.includes('human-rights')) {
      tips.push('Приведіть проект у відповідність до Директиви ЄС про права жертв');
    }
    
    if (answers.fundingAmount === 'large') {
      tips.push('Для великих грантів часто потрібні партнерства з міжнародними організаціями');
    }
  } else {
    tips.push('Ensure your organization is registered according to Ukrainian law');
    tips.push('Prepare financial reports for the last 2 years');
    tips.push('Develop a clear monitoring and evaluation plan');
    
    if (answers.focusArea?.includes('human-rights')) {
      tips.push('Align your project with the EU Victims\' Rights Directive');
    }
    
    if (answers.fundingAmount === 'large') {
      tips.push('Large grants often require partnerships with international organizations');
    }
  }

  return tips;
}