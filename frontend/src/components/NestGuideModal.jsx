import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Globe, 
  Loader2, 
  ChevronRight, 
  HelpCircle,
  FileCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function NestGuideModal({ scholarshipContext = null }) {
  const { user, student } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('English');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm NestGuide, your AI Scholarship Advisor. Ask me anything about eligibility criteria, required certificates, or application procedures. You can switch my language between English, Telugu, and Hindi anytime!`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await aiAPI.askNestGuide(
        textToSend,
        scholarshipContext,
        messages.slice(-5),
        language
      );

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'NestGuide encountered an issue processing your query. Please try again.' },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to reach NestGuide service right now. Please ensure your backend server is active.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    {
      text: scholarshipContext
        ? `Why does ${scholarshipContext.name?.slice(0, 24)}... match me?`
        : 'What scholarships am I eligible for?',
      icon: Sparkles,
    },
    {
      text: scholarshipContext
        ? `What documents are required for this scholarship?`
        : 'What essential documents do I need to prepare?',
      icon: FileCheck,
    },
    {
      text: scholarshipContext
        ? `How do I apply for this scholarship officially?`
        : 'How do application timelines work?',
      icon: Layers,
    },
    {
      text: 'Explain eligibility in simple terms',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-sky-500/30 transition-all transform hover:-translate-y-0.5"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Ask NestGuide</span>
        </button>
      )}

      {/* Slide-out AI Assistant Drawer / Card */}
      {isOpen && (
        <div className="w-[380px] sm:w-[440px] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
          
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5 leading-none">
                  NestGuide AI
                  <span className="text-[10px] uppercase font-semibold bg-sky-500/30 text-sky-300 px-1.5 py-0.5 rounded">
                    Advisor
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Powered by Google Gemini (Backend)
                </div>
              </div>
            </div>

            {/* Language Toggle & Close */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs">
                {['English', 'Telugu', 'Hindi'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      language === lang
                        ? 'bg-sky-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'English' ? 'EN' : lang === 'Telugu' ? 'తెలుగు' : 'हिंदी'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Context Banner if active */}
          {scholarshipContext && (
            <div className="px-4 py-2 bg-sky-50 border-b border-sky-100 flex items-center gap-2 text-xs text-sky-900">
              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
              <span className="truncate">
                Context: <strong>{scholarshipContext.name}</strong>
              </span>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-sky-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-500 text-xs py-2">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-2 text-slate-600">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  <span>NestGuide is thinking in {language}...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.text)}
                disabled={isLoading}
                className="shrink-0 text-[11px] bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200/60 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <q.icon className="w-3 h-3 text-sky-600" />
                <span>{q.text}</span>
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  language === 'Telugu'
                    ? 'ఇక్కడ మీ సందేహాన్ని అడగండి...'
                    : language === 'Hindi'
                    ? 'यहाँ अपना प्रश्न पूछें...'
                    : 'Ask NestGuide about this scholarship...'
                }
                className="flex-1 bg-slate-100 border-none rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-40 transition-colors shrink-0 shadow-sm shadow-sky-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
