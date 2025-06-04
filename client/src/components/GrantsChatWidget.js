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
  ExclamationTriangleIcon
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
        text: "Hi! I'm your grants assistant. I can help you find suitable funding opportunities for Ukrainian civil society organizations. Ask me about eligibility, deadlines, or specific grant programs!",
        suggestions: [
          "Show me grants for NGOs",
          "What grants are available for human rights work?",
          "Which grants have upcoming deadlines?"
        ]
      },
      uk: {
        text: "Привіт! Я ваш помічник з грантів. Можу допомогти знайти підходящі можливості фінансування для українських організацій громадянського суспільства. Запитайте мене про критерії, терміни або конкретні грантові програми!",
        suggestions: [
          "Покажіть гранти для НГО",
          "Які гранти доступні для правозахисної роботи?",
          "Які гранти мають найближчі терміни?"
        ]
      },
      de: {
        text: "Hallo! Ich bin Ihr Grants-Assistent. Ich kann Ihnen helfen, geeignete Finanzierungsmöglichkeiten für ukrainische Zivilgesellschaftsorganisationen zu finden. Fragen Sie mich nach Berechtigung, Fristen oder spezifischen Förderprogrammen!",
        suggestions: [
          "Zeigen Sie mir Förderungen für NGOs",
          "Welche Förderungen gibt es für Menschenrechtsarbeit?",
          "Welche Förderungen haben bevorstehende Fristen?"
        ]
      }
    };
    return welcomeMessages[language] || welcomeMessages.en;
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = getWelcomeMessage();
      setMessages([{
        id: 1,
        type: 'bot',
        content: welcome.text,
        suggestions: welcome.suggestions,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = useCallback(async (messageText = inputValue) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await axios.post('/.netlify/functions/chat', {
        message: messageText.trim(),
        language: language,
        conversationHistory: messages.slice(-5) // Send last 5 messages for context
      }, {
        timeout: 30000 // 30 second timeout
      });

      setIsTyping(false);

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        grants: response.data.recommendedGrants || [],
        suggestions: response.data.suggestions || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      setIsTyping(false);
      console.error('Chat error:', error);
      
      const errorMessages = {
        en: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        uk: "Вибачте, у мене проблеми з підключенням. Спробуйте ще раз через хвилину.",
        de: "Es tut mir leid, ich habe gerade Verbindungsprobleme. Bitte versuchen Sie es in einem Moment erneut."
      };

      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMessages[language] || errorMessages.en,
        error: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages, language]);

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  const formatTimestamp = (timestamp) => {
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
        <div className={`fixed bottom-24 right-6 z-40 w-96 h-96 max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)] rounded-lg shadow-xl border transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          
          {/* Chat Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-blue-50'
          } rounded-t-lg`}>
            <div className="flex items-center space-x-2">
              <SparklesIcon className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('chat.title', 'Grants Assistant')}
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-full hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 h-64 ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.error
                    ? `${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`
                    : `${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'} shadow-sm`
                }`}>
                  <div 
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  
                  {/* Display recommended grants */}
                  {message.grants && message.grants.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('chat.recommendedGrants', 'Recommended Grants')}:
                      </div>
                      {message.grants.slice(0, 3).map((grant, idx) => (
                        <div key={idx} className={`p-2 rounded border ${
                          darkMode ? 'border-gray-600 bg-gray-600' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="font-medium text-sm">{grant.grant_name}</div>
                          <div className="text-xs opacity-75">{grant.funding_organization}</div>
                          {grant.application_deadline && (
                            <div className="text-xs opacity-75">
                              {t('chat.deadline', 'Deadline')}: {grant.application_deadline}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Display suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`block w-full text-left text-xs p-2 rounded border transition-colors ${
                            darkMode 
                              ? 'border-gray-600 hover:bg-gray-600 text-gray-300' 
                              : 'border-gray-200 hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className={`text-xs mt-1 opacity-50 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`} style={{animationDelay: '0.1s'}}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`} style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`border-t p-3 ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} rounded-b-lg`}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('chat.placeholder', 'Ask about grants...')}
                disabled={isLoading}
                className={`flex-1 p-2 text-sm rounded-lg border resize-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50`}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  !inputValue.trim() || isLoading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GrantsChatWidget;