import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import axios from 'axios';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const GrantsChatWidget = () => {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial welcome message based on language
  const getWelcomeMessage = () => {
    const welcomeMessages = {
      en: {
        text: "👋 Hello! I'm your AI-powered grants assistant specializing in funding opportunities for Ukrainian civil society organizations.\n\n🎯 I can help you with:\n• Finding grants that match your organization's focus\n• Understanding eligibility criteria and requirements\n• Tracking application deadlines and timelines\n• Discovering funding amounts and program details\n\n💡 Try asking me about specific areas like women's rights, youth programs, education, or human rights work!",
        suggestions: [
          '🏛️ Show me EU funding opportunities',
          "👩‍⚖️ What grants support women's organizations?",
          '⏰ Which grants have deadlines this month?',
          '🎓 Find education and youth funding',
          '💰 Show grants under €50,000',
        ],
      },
      uk: {
        text: '👋 Привіт! Я ваш AI-помічник з грантів, що спеціалізується на можливостях фінансування для українських організацій громадянського суспільства.\n\n🎯 Я можу допомогти вам з:\n• Пошуком грантів, що відповідають фокусу вашої організації\n• Розумінням критеріїв відбору та вимог\n• Відстеженням термінів подачі заявок\n• Виявленням сум фінансування та деталей програм\n\n💡 Спробуйте запитати мене про конкретні сфери, як права жінок, молодіжні програми, освіта або правозахисна робота!',
        suggestions: [
          '🏛️ Покажіть можливості фінансування від ЄС',
          '👩‍⚖️ Які гранти підтримують жіночі організації?',
          '⏰ Які гранти мають терміни цього місяця?',
          '🎓 Знайдіть фінансування освіти та молоді',
          '💰 Покажіть гранти до €50,000',
        ],
      },
      de: {
        text: '👋 Hallo! Ich bin Ihr KI-gestützter Förderungsassistent, spezialisiert auf Finanzierungsmöglichkeiten für ukrainische Zivilgesellschaftsorganisationen.\n\n🎯 Ich kann Ihnen helfen bei:\n• Finden von Förderungen, die zu Ihrer Organisation passen\n• Verstehen von Berechtigung und Anforderungen\n• Verfolgen von Bewerbungsfristen\n• Entdecken von Förderbeträgen und Programmdetails\n\n💡 Fragen Sie mich gerne nach spezifischen Bereichen wie Frauenrechte, Jugendprogramme, Bildung oder Menschenrechtsarbeit!',
        suggestions: [
          '🏛️ Zeigen Sie mir EU-Fördermöglichkeiten',
          '👩‍⚖️ Welche Förderungen unterstützen Frauenorganisationen?',
          '⏰ Welche Förderungen haben Fristen diesen Monat?',
          '🎓 Finden Sie Bildungs- und Jugendförderung',
          '💰 Zeigen Sie Förderungen unter €50.000',
        ],
      },
    };
    return welcomeMessages[language] || welcomeMessages.en;
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = getWelcomeMessage();
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: welcome.text,
          suggestions: welcome.suggestions,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = useCallback(
    async (messageText = inputValue) => {
      if (!messageText.trim() || isLoading) return;

      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: messageText.trim(),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);
      setIsTyping(true);

      try {
        const response = await axios.post(
          '/.netlify/functions/chat',
          {
            message: messageText.trim(),
            language: language,
            conversationHistory: messages.slice(-5), // Send last 5 messages for context
          },
          {
            timeout: 30000, // 30 second timeout
          }
        );

        setIsTyping(false);

        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data.response || 'No response received',
          grants: response.data.recommendedGrants || [],
          suggestions: response.data.suggestions || [],
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        setIsTyping(false);
        console.error('Chat error:', error);

        const errorMessages = {
          en: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          uk: 'Вибачте, у мене проблеми з підключенням. Спробуйте ще раз через хвилину.',
          de: 'Es tut mir leid, ich habe gerade Verbindungsprobleme. Bitte versuchen Sie es in einem Moment erneut.',
        };

        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: errorMessages[language] || errorMessages.en,
          error: true,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue, isLoading, messages, language]
  );

  const handleSuggestionClick = suggestion => {
    handleSendMessage(suggestion);
  };

  const formatMessage = content => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  const formatTimestamp = timestamp => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          darkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        } ${isOpen ? 'scale-95' : 'scale-100 hover:scale-110'}`}
        aria-label={t('chat.toggle')}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 md:right-6 z-40 w-[calc(100vw-3rem)] md:w-96 h-[calc(100vh-12rem)] md:h-[32rem] max-w-[calc(100vw-3rem)] md:max-w-[24rem] max-h-[calc(100vh-8rem)] rounded-xl shadow-2xl border backdrop-blur-sm transition-all duration-300 transform ${
            darkMode ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'
          } 
        /* Mobile adjustments */
        left-6 md:left-auto right-6`}
        >
          {/* Chat Header */}
          <div
            className={`flex items-center justify-between p-4 border-b ${
              darkMode
                ? 'border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80'
                : 'border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80'
            } rounded-t-xl backdrop-blur-sm`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${darkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'} animate-pulse`}
              >
                <SparklesIcon
                  className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🤖 AI Grants Assistant
                </h3>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Powered by Gemini AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-full hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 h-80 ${
              darkMode
                ? 'bg-gradient-to-b from-gray-800/50 to-gray-900/50'
                : 'bg-gradient-to-b from-gray-50/50 to-white/50'
            } backdrop-blur-sm`}
          >
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[90%] rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : message.error
                        ? `${darkMode ? 'bg-red-900/80 text-red-200' : 'bg-red-100/80 text-red-800'} shadow-md`
                        : `${darkMode ? 'bg-gray-700/80 text-gray-100 border border-gray-600/30' : 'bg-white/80 text-gray-800 border border-gray-200/30'} shadow-md backdrop-blur-sm`
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />

                  {/* Display recommended grants */}
                  {message.grants && message.grants.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div
                        className={`text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}
                      >
                        🎯 {t('chat.recommendedGrants', 'Recommended Grants')}
                      </div>
                      {message.grants.slice(0, 3).map((grant, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                            darkMode
                              ? 'border-gray-500/30 bg-gray-600/30 hover:bg-gray-600/50'
                              : 'border-blue-200/50 bg-blue-50/30 hover:bg-blue-50/50'
                          }`}
                        >
                          <div className="font-semibold text-sm mb-1 flex items-start gap-2">
                            <span className="text-yellow-500">💰</span>
                            {grant.grant_name}
                          </div>
                          <div
                            className={`text-xs mb-1 flex items-center gap-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            <span>🏛️</span>
                            {grant.funding_organization}
                          </div>
                          {grant.application_deadline && (
                            <div
                              className={`text-xs flex items-center gap-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}
                            >
                              <span>⏰</span>
                              {t('chat.deadline', 'Deadline')}: {grant.application_deadline}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Display suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div
                        className={`text-sm font-semibold flex items-center gap-2 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}
                      >
                        💡 Quick suggestions:
                      </div>
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`block w-full text-left text-sm p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                            darkMode
                              ? 'border-purple-500/30 bg-purple-900/20 hover:bg-purple-800/30 text-purple-200'
                              : 'border-purple-200/50 bg-purple-50/30 hover:bg-purple-100/50 text-purple-700'
                          }`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-xs mt-1 opacity-50 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className={`rounded-lg p-3 ${darkMode ? 'bg-gray-700' : 'bg-white shadow-sm'}`}
                >
                  <div className="flex space-x-1">
                    <div
                      className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}
                    ></div>
                    <div
                      className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className={`border-t p-4 ${darkMode ? 'border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80' : 'border-gray-200/50 bg-gradient-to-r from-white/80 to-gray-50/80'} rounded-b-xl backdrop-blur-sm`}
          >
            <div className="flex space-x-3 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !isLoading && handleSendMessage()}
                  placeholder={t('chat.placeholder', '💬 Ask about grants, funding, deadlines...')}
                  disabled={isLoading}
                  className={`w-full p-3 text-sm rounded-xl border-2 transition-all duration-200 ${
                    darkMode
                      ? 'bg-gray-700/80 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-400/50 focus:bg-gray-700'
                      : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-blue-500/50 focus:bg-white'
                  } focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 backdrop-blur-sm`}
                />
                {isLoading && (
                  <div
                    className={`text-xs mt-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    <div className="animate-pulse">🤖</div>
                    AI is thinking...
                  </div>
                )}
              </div>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  !inputValue.trim() || isLoading
                    ? 'bg-gray-300/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg'
                } text-white`}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <PaperAirplaneIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GrantsChatWidget;
