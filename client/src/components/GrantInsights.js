import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import { 
  LightBulbIcon, ChartBarIcon, CalendarIcon, 
  ExclamationTriangleIcon, CheckCircleIcon, ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';
import axios from 'axios';

const GrantInsights = ({ grant }) => {
  const { darkMode } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (grant) {
      generateInsights();
    }
  }, [grant]);

  const generateInsights = async () => {
    try {
      // Generate local insights first
      const localInsights = analyzeGrant(grant);
      setInsights(localInsights);

      // If AI is available, enhance with AI insights
      if (process.env.REACT_APP_GOOGLE_GEMINI_API_KEY) {
        const aiInsights = await getAIInsights(grant);
        if (aiInsights) {
          setInsights({ ...localInsights, ...aiInsights });
        }
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeGrant = (grant) => {
    const insights = {
      deadline: analyzeDeadline(grant.application_deadline),
      competition: analyzeCompetition(grant),
      fundingSize: analyzeFundingSize(grant.grant_amount),
      complexity: analyzeComplexity(grant),
      recommendations: generateRecommendations(grant),
      strengths: identifyStrengths(grant),
      warnings: identifyWarnings(grant)
    };

    return insights;
  };

  const analyzeDeadline = (deadline) => {
    if (!deadline) return { status: 'unknown', urgency: 'low' };

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntil = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      return { status: 'expired', urgency: 'none', daysUntil };
    } else if (daysUntil <= 7) {
      return { status: 'urgent', urgency: 'critical', daysUntil };
    } else if (daysUntil <= 30) {
      return { status: 'soon', urgency: 'high', daysUntil };
    } else if (daysUntil <= 90) {
      return { status: 'upcoming', urgency: 'medium', daysUntil };
    } else {
      return { status: 'future', urgency: 'low', daysUntil };
    }
  };

  const analyzeCompetition = (grant) => {
    // Estimate competition based on various factors
    let competitionScore = 50; // Base score

    // Popular organizations tend to have more competition
    const popularOrgs = ['European Union', 'USAID', 'UN', 'World Bank'];
    if (popularOrgs.some(org => grant.funding_organization?.includes(org))) {
      competitionScore += 20;
    }

    // Larger grants attract more competition
    if (grant.grant_amount?.includes('million') || grant.grant_amount?.includes('M')) {
      competitionScore += 15;
    }

    // Broad focus areas have more competition
    if (grant.focus_areas?.split(',').length > 5) {
      competitionScore -= 10; // Less focused = easier
    }

    // View count indicates popularity
    if (grant.view_count > 100) {
      competitionScore += 10;
    }

    return {
      level: competitionScore > 70 ? 'high' : competitionScore > 40 ? 'medium' : 'low',
      score: competitionScore
    };
  };

  const analyzeFundingSize = (grantAmount) => {
    if (!grantAmount) return { category: 'unknown' };

    const amount = grantAmount.toLowerCase();
    
    if (amount.includes('million') || amount.includes('m€') || amount.includes('m$')) {
      return { category: 'large', suitable: ['established-orgs', 'consortiums'] };
    } else if (amount.includes('k€') || amount.includes('k$') || 
               (amount.match(/\d+/) && parseInt(amount.match(/\d+/)[0]) > 50000)) {
      return { category: 'medium', suitable: ['established-orgs', 'growing-orgs'] };
    } else {
      return { category: 'small', suitable: ['startups', 'small-orgs', 'individuals'] };
    }
  };

  const analyzeComplexity = (grant) => {
    let complexityScore = 0;

    // Check required documents
    if (grant.required_documents) {
      const docCount = grant.required_documents.split(',').length;
      complexityScore += docCount * 5;
    }

    // Check evaluation criteria
    if (grant.evaluation_criteria) {
      complexityScore += 15;
    }

    // Check reporting requirements
    if (grant.reporting_requirements?.includes('monthly') || 
        grant.reporting_requirements?.includes('quarterly')) {
      complexityScore += 20;
    }

    // Partnership requirements add complexity
    if (grant.partnership_requirements) {
      complexityScore += 25;
    }

    return {
      level: complexityScore > 50 ? 'high' : complexityScore > 25 ? 'medium' : 'low',
      score: complexityScore,
      timeEstimate: complexityScore > 50 ? '2-4 weeks' : complexityScore > 25 ? '1-2 weeks' : '3-7 days'
    };
  };

  const generateRecommendations = (grant) => {
    const recommendations = [];

    // Deadline-based recommendations
    const deadline = analyzeDeadline(grant.application_deadline);
    if (deadline.urgency === 'critical') {
      recommendations.push({
        type: 'urgent',
        text: t('insights.startImmediately'),
        priority: 'high'
      });
    }

    // Complexity-based recommendations
    const complexity = analyzeComplexity(grant);
    if (complexity.level === 'high') {
      recommendations.push({
        type: 'preparation',
        text: t('insights.startEarly'),
        priority: 'medium'
      });
    }

    // Partnership recommendations
    if (grant.partnership_requirements) {
      recommendations.push({
        type: 'partnership',
        text: t('insights.findPartners'),
        priority: 'high'
      });
    }

    return recommendations;
  };

  const identifyStrengths = (grant) => {
    const strengths = [];

    if (grant.renewable) {
      strengths.push(t('insights.renewableGrant'));
    }

    if (!grant.application_fee) {
      strengths.push(t('insights.noApplicationFee'));
    }

    if (grant.language_requirements?.includes('English') && 
        grant.language_requirements?.includes('Ukrainian')) {
      strengths.push(t('insights.multilingualSupport'));
    }

    return strengths;
  };

  const identifyWarnings = (grant) => {
    const warnings = [];

    const deadline = analyzeDeadline(grant.application_deadline);
    if (deadline.status === 'expired') {
      warnings.push({
        type: 'critical',
        text: t('insights.grantExpired')
      });
    } else if (deadline.urgency === 'critical') {
      warnings.push({
        type: 'urgent',
        text: t('insights.deadlineSoon', { days: deadline.daysUntil })
      });
    }

    if (grant.application_fee) {
      warnings.push({
        type: 'info',
        text: t('insights.applicationFeeRequired', { fee: grant.application_fee })
      });
    }

    return warnings;
  };

  const getAIInsights = async (grant) => {
    try {
      const prompt = `Analyze this grant and provide strategic insights:
        Name: ${grant.grant_name}
        Organization: ${grant.funding_organization}
        Focus: ${grant.focus_areas}
        Amount: ${grant.grant_amount}
        Eligibility: ${grant.eligibility_criteria}
        
        Provide brief insights on:
        1. Key success factors for this grant
        2. Common mistakes to avoid
        3. Strategic positioning tips`;

      const response = await axios.post('/.netlify/functions/chat', {
        message: prompt,
        context: 'grant_analysis'
      });

      if (response.data.insights) {
        return response.data.insights;
      }
    } catch (error) {
      console.error('AI insights failed:', error);
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center mb-6">
        <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('insights.title')}
        </h3>
      </div>

      {/* Warnings */}
      {insights.warnings && insights.warnings.length > 0 && (
        <div className="mb-6">
          {insights.warnings.map((warning, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg mb-2 flex items-start ${
                warning.type === 'critical' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : warning.type === 'urgent'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}
            >
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{warning.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center mb-2">
            <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('insights.deadline')}
            </span>
          </div>
          <p className={`text-lg font-bold ${
            insights.deadline.urgency === 'critical' ? 'text-red-500' :
            insights.deadline.urgency === 'high' ? 'text-yellow-500' :
            'text-green-500'
          }`}>
            {insights.deadline.status === 'expired' ? t('insights.expired') :
             insights.deadline.daysUntil === 0 ? t('insights.today') :
             insights.deadline.daysUntil === 1 ? t('insights.tomorrow') :
             t('insights.daysRemaining', { days: insights.deadline.daysUntil })}
          </p>
        </div>

        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center mb-2">
            <ChartBarIcon className="h-5 w-5 mr-2 text-purple-500" />
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('insights.competition')}
            </span>
          </div>
          <p className={`text-lg font-bold ${
            insights.competition.level === 'high' ? 'text-red-500' :
            insights.competition.level === 'medium' ? 'text-yellow-500' :
            'text-green-500'
          }`}>
            {t(`insights.competition${insights.competition.level.charAt(0).toUpperCase() + insights.competition.level.slice(1)}`)}
          </p>
        </div>

        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center mb-2">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-green-500" />
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('insights.complexity')}
            </span>
          </div>
          <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {insights.complexity.timeEstimate}
          </p>
        </div>
      </div>

      {/* Strengths */}
      {insights.strengths && insights.strengths.length > 0 && (
        <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-green-900' : 'bg-green-50'}`}>
          <h4 className={`font-semibold mb-2 flex items-center ${darkMode ? 'text-green-200' : 'text-green-800'}`}>
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {t('insights.strengths')}
          </h4>
          <ul className={`list-disc list-inside space-y-1 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
            {insights.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div>
          <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('insights.recommendations')}
          </h4>
          <div className="space-y-2">
            {insights.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg flex items-start ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full mt-1.5 mr-3 ${
                  rec.priority === 'high' ? 'bg-red-500' :
                  rec.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></span>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {rec.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GrantInsights;