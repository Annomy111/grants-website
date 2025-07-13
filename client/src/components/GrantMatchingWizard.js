import React, { useState, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { smartGrantMatching, callGeminiForAnalysis } from '../utils/grantMatchingService';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDocument, rgb } from 'pdf-lib';
import { 
  BuildingLibraryIcon, 
  HeartIcon, 
  ScaleIcon, 
  GlobeEuropeAfricaIcon, 
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const GrantMatchingWizard = () => {
  const { t, i18n } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const [step, setStep] = useState(1);
  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { 
      geographicRegion: 'Ukraine',
      focusArea: '',
      fundingAmount: '',
      timeline: '',
      grantType: '',
      additionalDetails: '',
      email: ''
    }
  });
  const [matches, setMatches] = useState([]);
  const [aiInsights, setAiInsights] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch grants focused on Ukraine
  const { data: grants, isLoading } = useQuery(
    'ukraine-grants-wizard',
    async () => {
      const { data, error } = await supabase
        .from('grants')
        .select('*')
        .eq('status', 'active')
        .or(`geographic_focus.ilike.%Ukraine%,geographic_focus.ilike.%Eastern Europe%,geographic_focus.ilike.%Global%`)
        .order('application_deadline', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    { 
      staleTime: 15 * 60 * 1000,
      cacheTime: 30 * 60 * 1000
    }
  );

  // AI mutation for analysis
  const analyzeMutation = useMutation(async (answers) => {
    setIsAnalyzing(true);
    try {
      const message = `${Object.entries(answers)
        .filter(([key]) => key !== 'email')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')} Ukrainian CSO 2025 grants search`;
      
      const [aiResponse, scoredGrants] = await Promise.all([
        callGeminiForAnalysis(message, i18n.language),
        smartGrantMatching(grants || [], answers, i18n.language)
      ]);
      
      setMatches(scoredGrants.slice(0, 10));
      setAiInsights(aiResponse);
      setShowSignup(true);
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback to just scoring without AI
      const scoredGrants = smartGrantMatching(grants || [], answers, i18n.language);
      setMatches(scoredGrants.slice(0, 10));
      setAiInsights(t('wizard.aiUnavailable'));
    } finally {
      setIsAnalyzing(false);
    }
  });

  const onSubmit = (data) => {
    analyzeMutation.mutate(data);
  };

  // Define wizard questions based on research
  const questions = [
    { 
      id: 'focusArea',
      question: t('wizard.focusArea', "What is your CSO's primary focus area?"),
      subtitle: t('wizard.focusAreaSubtitle', 'Select the area that best describes your main work'),
      options: [
        { 
          value: 'human-rights', 
          label: t('wizard.humanRights', 'Human Rights & War Crimes Documentation'),
          icon: ScaleIcon,
          description: t('wizard.humanRightsDesc', 'Legal aid, war crimes documentation, victim support')
        },
        { 
          value: 'post-war-recovery', 
          label: t('wizard.postWarRecovery', 'Post-War Recovery & Reconstruction'),
          icon: BuildingLibraryIcon,
          description: t('wizard.postWarRecoveryDesc', 'Infrastructure, IDP support, community rebuilding')
        },
        { 
          value: 'gender-equality', 
          label: t('wizard.genderEquality', 'Gender Equality & Women\'s Rights'),
          icon: HeartIcon,
          description: t('wizard.genderEqualityDesc', 'CRSV support, women\'s empowerment, gender-based violence prevention')
        },
        { 
          value: 'eu-integration', 
          label: t('wizard.euIntegration', 'EU Integration & Anti-Corruption'),
          icon: GlobeEuropeAfricaIcon,
          description: t('wizard.euIntegrationDesc', 'Democratic reforms, anti-corruption, EU standards')
        },
        { 
          value: 'social-cohesion', 
          label: t('wizard.socialCohesion', 'Social Cohesion & Veteran Support'),
          icon: ShieldCheckIcon,
          description: t('wizard.socialCohesionDesc', 'Veteran rehabilitation, psychosocial support, community dialogue')
        },
        { 
          value: 'other', 
          label: t('wizard.other', 'Other (Education, Environment, Culture)'),
          description: t('wizard.otherDesc', 'Education, environmental protection, cultural preservation')
        }
      ]
    },
    { 
      id: 'geographicRegion',
      question: t('wizard.geographicRegion', 'What is your primary geographic focus?'),
      subtitle: t('wizard.geographicRegionSubtitle', 'Where does your organization primarily work?'),
      options: [
        { value: 'Ukraine', label: t('wizard.ukraine', 'Ukraine (National or Regional)') },
        { value: 'Eastern Europe', label: t('wizard.easternEurope', 'Eastern Europe (Including Ukraine)') },
        { value: 'EU', label: t('wizard.eu', 'EU Countries (Diaspora/Advocacy)') },
        { value: 'Global', label: t('wizard.global', 'Global/International') }
      ]
    },
    { 
      id: 'fundingAmount',
      question: t('wizard.fundingAmount', 'What funding range do you need?'),
      subtitle: t('wizard.fundingAmountSubtitle', 'Based on typical 2025 grant sizes'),
      options: [
        { 
          value: 'small', 
          label: t('wizard.smallGrant', 'Small Grants'),
          description: '< €25,000',
          examples: t('wizard.smallGrantExamples', 'Pilot projects, emergency response')
        },
        { 
          value: 'medium', 
          label: t('wizard.mediumGrant', 'Medium Grants'),
          description: '€25,000 - €100,000',
          examples: t('wizard.mediumGrantExamples', 'Annual programs, capacity building')
        },
        { 
          value: 'large', 
          label: t('wizard.largeGrant', 'Large Grants'),
          description: '> €100,000',
          examples: t('wizard.largeGrantExamples', 'Multi-year projects, infrastructure')
        }
      ]
    },
    { 
      id: 'timeline',
      question: t('wizard.timeline', 'When do you need the funding?'),
      subtitle: t('wizard.timelineSubtitle', 'How urgent is your funding need?'),
      options: [
        { value: 'urgent', label: t('wizard.urgent', 'Urgent (< 3 months)') },
        { value: 'medium', label: t('wizard.medium', 'Medium-term (3-6 months)') },
        { value: 'long', label: t('wizard.long', 'Long-term (> 6 months)') }
      ]
    },
    { 
      id: 'grantType',
      question: t('wizard.grantType', 'What type of support do you need?'),
      subtitle: t('wizard.grantTypeSubtitle', 'Select the primary type of funding'),
      options: [
        { value: 'project', label: t('wizard.projectBased', 'Project-Based Funding') },
        { value: 'operational', label: t('wizard.operational', 'Operational/Core Support') },
        { value: 'capacity', label: t('wizard.capacity', 'Capacity Building & Training') },
        { value: 'emergency', label: t('wizard.emergency', 'Emergency/Humanitarian Aid') }
      ]
    },
    { 
      id: 'additionalDetails',
      question: t('wizard.additionalDetails', 'Any additional details to help us match you better?'),
      subtitle: t('wizard.additionalDetailsSubtitle', 'E.g., specific challenges, target groups, partnerships'),
      isText: true
    }
  ];

  const currentQuestion = questions[step - 1];
  const totalSteps = questions.length;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const exportToPDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    
    // Title
    page.drawText('Grant Matching Results', {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0)
    });
    
    // Date
    page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: height - 80,
      size: 12,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // AI Insights
    if (aiInsights) {
      page.drawText('AI Analysis:', {
        x: 50,
        y: height - 120,
        size: 14,
        color: rgb(0, 0, 0)
      });
      
      // Word wrap for insights
      const words = aiInsights.split(' ');
      let line = '';
      let y = height - 140;
      
      words.forEach((word) => {
        const testLine = line + word + ' ';
        if (testLine.length > 80) {
          page.drawText(line.trim(), {
            x: 50,
            y,
            size: 11,
            color: rgb(0.2, 0.2, 0.2)
          });
          line = word + ' ';
          y -= 15;
        } else {
          line = testLine;
        }
      });
      
      if (line.trim()) {
        page.drawText(line.trim(), {
          x: 50,
          y,
          size: 11,
          color: rgb(0.2, 0.2, 0.2)
        });
      }
    }
    
    // Grants list
    let yPosition = height - 250;
    page.drawText('Matched Grants:', {
      x: 50,
      y: yPosition,
      size: 14,
      color: rgb(0, 0, 0)
    });
    
    yPosition -= 20;
    
    matches.forEach((grant, index) => {
      if (yPosition < 100) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([595, 842]);
        yPosition = height - 50;
      }
      
      page.drawText(`${index + 1}. ${grant.name}`, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0.8)
      });
      
      yPosition -= 15;
      
      page.drawText(`   Organization: ${grant.organization}`, {
        x: 50,
        y: yPosition,
        size: 10,
        color: rgb(0.3, 0.3, 0.3)
      });
      
      yPosition -= 12;
      
      page.drawText(`   Amount: €${grant.grant_size_min?.toLocaleString() || 'N/A'} - €${grant.grant_size_max?.toLocaleString() || 'N/A'}`, {
        x: 50,
        y: yPosition,
        size: 10,
        color: rgb(0.3, 0.3, 0.3)
      });
      
      yPosition -= 12;
      
      page.drawText(`   Deadline: ${grant.application_deadline ? new Date(grant.application_deadline).toLocaleDateString() : 'Rolling'}`, {
        x: 50,
        y: yPosition,
        size: 10,
        color: rgb(0.3, 0.3, 0.3)
      });
      
      yPosition -= 20;
    });
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grant-matches-${new Date().toISOString().split('T')[0]}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const subscribeToUpdates = async (email) => {
    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .insert([
          { 
            email, 
            subscription_type: 'grant_alerts',
            created_at: new Date().toISOString()
          }
        ]);
      
      if (error) throw error;
      alert(t('wizard.subscriptionSuccess', 'Successfully subscribed to grant alerts!'));
    } catch (error) {
      console.error('Subscription error:', error);
      alert(t('wizard.subscriptionError', 'Could not subscribe. Please try again.'));
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        className="flex items-center justify-center min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
            {t('wizard.loadingGrants', 'Loading grant opportunities...')}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={clsx(
        'max-w-4xl mx-auto p-6 md:p-8 rounded-2xl shadow-xl',
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
          {t('wizard.title', 'Grant Matching Wizard')}
        </h1>
        <p className={clsx('text-lg', darkMode ? 'text-gray-300' : 'text-gray-600')}>
          {t('wizard.subtitle', 'Find the perfect grants for your Ukrainian civil society organization')}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">
            {t('wizard.step', 'Step')} {step} {t('wizard.of', 'of')} {totalSteps}
          </span>
          <span className="text-sm font-medium">
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>
        <div className={clsx('w-full rounded-full h-3', darkMode ? 'bg-gray-700' : 'bg-gray-200')}>
          <motion.div 
            className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-yellow-500"
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Form */}
      {!analyzeMutation.isSuccess ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.subtitle && (
                  <p className={clsx('text-sm mb-6', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                    {currentQuestion.subtitle}
                  </p>
                )}

                {currentQuestion.isText ? (
                  <Controller
                    name={currentQuestion.id}
                    control={control}
                    rules={{ 
                      minLength: { 
                        value: 10, 
                        message: t('wizard.detailsMinLength', 'Please provide at least 10 characters') 
                      }
                    }}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        className={clsx(
                          'w-full p-4 rounded-lg border transition-colors',
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                        )}
                        rows={5}
                        placeholder={t('wizard.detailsPlaceholder', 'Describe your specific needs, challenges, or any additional information...')}
                      />
                    )}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option) => {
                      const Icon = option.icon;
                      const value = option.value || option;
                      const label = option.label || option;
                      
                      return (
                        <Controller
                          key={value}
                          name={currentQuestion.id}
                          control={control}
                          rules={{ required: t('wizard.required', 'Please select an option') }}
                          render={({ field }) => (
                            <motion.button
                              type="button"
                              onClick={() => {
                                field.onChange(value);
                                if (step < totalSteps) {
                                  setTimeout(nextStep, 300);
                                }
                              }}
                              className={clsx(
                                'p-4 rounded-lg border-2 transition-all text-left',
                                field.value === value
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                  : darkMode
                                  ? 'border-gray-700 hover:border-gray-600 bg-gray-800 hover:bg-gray-700'
                                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start">
                                {Icon && (
                                  <Icon className={clsx(
                                    'h-6 w-6 mr-3 flex-shrink-0 mt-0.5',
                                    field.value === value ? 'text-blue-600' : darkMode ? 'text-gray-400' : 'text-gray-500'
                                  )} />
                                )}
                                <div className="flex-1">
                                  <div className={clsx(
                                    'font-medium',
                                    field.value === value && 'text-blue-600 dark:text-blue-400'
                                  )}>
                                    {label}
                                  </div>
                                  {option.description && (
                                    <div className={clsx(
                                      'text-sm mt-1',
                                      darkMode ? 'text-gray-400' : 'text-gray-600'
                                    )}>
                                      {option.description}
                                    </div>
                                  )}
                                  {option.examples && (
                                    <div className={clsx(
                                      'text-xs mt-1 italic',
                                      darkMode ? 'text-gray-500' : 'text-gray-500'
                                    )}>
                                      {option.examples}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          )}
                        />
                      );
                    })}
                  </div>
                )}

                {errors[currentQuestion.id] && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors[currentQuestion.id]?.message}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <motion.button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className={clsx(
                'px-6 py-3 rounded-lg font-medium transition-colors',
                step === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              )}
              whileHover={step !== 1 ? { scale: 1.05 } : {}}
              whileTap={step !== 1 ? { scale: 0.95 } : {}}
            >
              {t('wizard.back', 'Back')}
            </motion.button>

            {step === totalSteps ? (
              <motion.button
                type="submit"
                disabled={isAnalyzing}
                className={clsx(
                  'px-8 py-3 rounded-lg font-medium transition-colors',
                  'bg-gradient-to-r from-blue-600 to-yellow-500 text-white',
                  isAnalyzing && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={!isAnalyzing ? { scale: 1.05 } : {}}
                whileTap={!isAnalyzing ? { scale: 0.95 } : {}}
              >
                {isAnalyzing ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('wizard.analyzing', 'Analyzing...')}
                  </span>
                ) : (
                  t('wizard.getRecommendations', 'Get Recommendations')
                )}
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('wizard.next', 'Next')}
              </motion.button>
            )}
          </div>
        </form>
      ) : (
        /* Results Section */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6">
            {t('wizard.resultsTitle', 'Your Personalized Grant Matches')}
          </h2>

          {/* AI Insights */}
          {aiInsights && (
            <motion.div
              className={clsx(
                'p-6 rounded-lg mb-8',
                darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">
                {t('wizard.aiInsights', 'AI Analysis & Recommendations')}
              </h3>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {aiInsights}
              </p>
            </motion.div>
          )}

          {/* Matched Grants */}
          {matches.length > 0 ? (
            <div className="space-y-6">
              {matches.map((grant, index) => (
                <motion.div
                  key={grant.id}
                  className={clsx(
                    'p-6 rounded-lg border transition-all',
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                      {grant.name || grant.name_en}
                    </h3>
                    {grant.match_score && (
                      <span className={clsx(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        grant.match_score > 80 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : grant.match_score > 60
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      )}>
                        {grant.match_score}% {t('wizard.match', 'match')}
                      </span>
                    )}
                  </div>

                  <div className={clsx('space-y-2 text-sm', darkMode ? 'text-gray-300' : 'text-gray-600')}>
                    <p>
                      <strong>{t('wizard.organization', 'Organization')}:</strong> {grant.organization}
                    </p>
                    <p>
                      <strong>{t('wizard.focusAreas', 'Focus Areas')}:</strong> {grant.focus_areas || grant.focus_areas_en}
                    </p>
                    <p>
                      <strong>{t('wizard.amount', 'Amount')}:</strong> €{grant.grant_size_min?.toLocaleString() || '0'} - €{grant.grant_size_max?.toLocaleString() || 'N/A'}
                    </p>
                    <p>
                      <strong>{t('wizard.deadline', 'Deadline')}:</strong> {
                        grant.application_deadline 
                          ? new Date(grant.application_deadline).toLocaleDateString(i18n.language === 'uk' ? 'uk-UA' : 'en-US')
                          : t('wizard.rolling', 'Rolling basis')
                      }
                    </p>
                    {(grant.description || grant.description_en) && (
                      <p className="mt-3 italic">
                        {(grant.description || grant.description_en).substring(0, 200)}...
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {grant.website && (
                      <a
                        href={grant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {t('wizard.viewDetails', 'View Details')} →
                      </a>
                    )}
                    {grant.application_url && (
                      <a
                        href={grant.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
                      >
                        {t('wizard.apply', 'Apply Now')} →
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className={clsx(
                'p-8 rounded-lg text-center',
                darkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className={clsx('mb-4', darkMode ? 'text-yellow-300' : 'text-yellow-800')}>
                {t('wizard.noMatches', 'No exact matches found based on your criteria.')}
              </p>
              <p className={clsx('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                {t('wizard.noMatchesSuggestion', 'Consider broadening your search criteria or exploring these resources:')}
              </p>
              <div className="mt-4 space-y-2">
                <a href="https://www.undp.org/ukraine" target="_blank" rel="noopener noreferrer" 
                   className="block text-blue-600 hover:underline dark:text-blue-400">
                  UNDP Ukraine - Recovery Grants up to $100K
                </a>
                <a href="https://commission.europa.eu/ukraine-facility" target="_blank" rel="noopener noreferrer"
                   className="block text-blue-600 hover:underline dark:text-blue-400">
                  EU Ukraine Facility - €50B for Recovery
                </a>
                <a href="https://wphfund.org" target="_blank" rel="noopener noreferrer"
                   className="block text-blue-600 hover:underline dark:text-blue-400">
                  Women's Peace & Humanitarian Fund
                </a>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {matches.length > 0 && (
              <motion.button
                onClick={exportToPDF}
                className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                {t('wizard.exportPDF', 'Export to PDF')}
              </motion.button>
            )}

            {showSignup && (
              <div className="flex items-center">
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <div className="flex">
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...field}
                          type="email"
                          placeholder={t('wizard.emailPlaceholder', 'Email for grant alerts')}
                          className={clsx(
                            'pl-10 pr-4 py-3 rounded-l-lg border',
                            darkMode
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          )}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => field.value && subscribeToUpdates(field.value)}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg font-medium transition-colors"
                      >
                        {t('wizard.subscribe', 'Subscribe')}
                      </button>
                    </div>
                  )}
                />
              </div>
            )}

            <motion.button
              onClick={() => window.location.reload()}
              className={clsx(
                'px-6 py-3 rounded-lg font-medium transition-colors',
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('wizard.startOver', 'Start New Search')}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GrantMatchingWizard;