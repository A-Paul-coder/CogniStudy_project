import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Trash2, 
  BookOpen, 
  ArrowRight, 
  Lightbulb, 
  GraduationCap,
  Loader2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { ChatMessage, DifficultyLevel } from '../types';

interface TutorChatProps {
  onEarnXp?: (points: number) => void;
  onSelectConceptForExplainer?: (concept: string) => void;
}

export const TutorChat: React.FC<TutorChatProps> = ({
  onEarnXp,
  onSelectConceptForExplainer
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I'm your **AI Academic Tutor & Study Buddy** 🎓

I can help you understand complex academic concepts, solve homework problems step-by-step, review exam topics, or break down difficult theories.

**How can I assist your learning today?** Choose your preferred explanation difficulty above or try one of the prompt starters below!`,
      timestamp: new Date().toISOString(),
      difficulty: 'intermediate',
      keyTakeaway: 'Select your subject and difficulty level to receive tailored step-by-step guidance.',
      suggestedFollowUps: [
        'Explain how Binary Search Tree balancing works with a simple analogy',
        'Walk me through solving quadratic equations using the quadratic formula',
        'What is the difference between Mitosis and Meiosis?',
        'How does Keynesian economics explain inflation and fiscal policy?',
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [subject, setSubject] = useState('Computer Science');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const subjects = [
    'Computer Science',
    'Mathematics & Calculus',
    'Physics',
    'Biology & Medicine',
    'Chemistry',
    'Economics & Finance',
    'History & Social Sciences',
    'Philosophy & Literature',
  ];

  const difficultyLevels: { id: DifficultyLevel; label: string; desc: string; color: string }[] = [
    { id: 'beginner', label: 'Beginner', desc: 'Simple everyday analogies, plain language', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/40' },
    { id: 'intermediate', label: 'Intermediate', desc: 'Balanced academic depth & practical examples', color: 'text-amber-300 bg-amber-950/60 border-amber-800/40' },
    { id: 'advanced', label: 'Advanced', desc: 'Rigorous theoretical mechanics & edge cases', color: 'text-rose-300 bg-rose-950/60 border-rose-800/40' },
  ];

  const quickPrompts = [
    'Explain Gradient Descent like I am 12',
    'How does the TCP 3-Way Handshake establish a connection?',
    'What is the central dogma of molecular biology?',
    'Explain the Law of Diminishing Marginal Returns with an example',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage.trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
      difficulty,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          difficulty,
          subject,
          conversationHistory: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get tutor response');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        difficulty,
        keyTakeaway: data.keyTakeaway,
        suggestedFollowUps: data.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (onEarnXp) onEarnXp(25);
    } catch (err) {
      console.error('Tutor chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your request. Please try again or rephrase your question.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for clearer text to speech
    const cleanText = text.replace(/[*#`_\[\]()]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear this tutor conversation?')) {
      setMessages([
        {
          id: 'welcome-msg-reset',
          role: 'assistant',
          content: 'Conversation reset. What academic topic would you like to explore next?',
          timestamp: new Date().toISOString(),
          difficulty,
          suggestedFollowUps: quickPrompts,
        },
      ]);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      
      {/* Controls Bar: Subject & Difficulty */}
      <div className="bg-[#131926] p-4 rounded-2xl border border-[#1E293B] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Subject Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider shrink-0">
              Subject:
            </span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs font-medium bg-[#182030] border border-[#26354D] rounded-xl px-3 py-1.5 text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Level Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mr-1">
              Level:
            </span>
            {difficultyLevels.map((lvl) => {
              const isSelected = difficulty === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setDifficulty(lvl.id)}
                  title={lvl.desc}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? `${lvl.color} shadow-xs font-bold`
                      : 'text-[#94A3B8] bg-[#182030] border-[#222F46] hover:bg-[#202C40] hover:text-[#F8FAFC]'
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}

            {/* Clear Button */}
            <button
              onClick={handleClearChat}
              title="Clear Conversation"
              className="p-1.5 text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-[#131926] rounded-3xl border border-[#1E293B] shadow-xs flex flex-col min-h-[500px] overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Box */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 space-y-3 ${
                    isUser
                      ? 'bg-[#10B981] text-white rounded-tr-xs shadow-xs'
                      : 'bg-[#182030] text-[#F1F5F9] rounded-tl-xs border border-[#222F46] shadow-xs'
                  }`}
                >
                  {/* Difficulty Tag if Assistant */}
                  {!isUser && msg.difficulty && (
                    <div className="flex items-center justify-between gap-2 border-b border-[#222F46] pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                        {msg.difficulty} Explanation
                      </span>
                      <span className="text-[10px] text-[#64748B]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* Main Content Body */}
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'text-white' : 'text-[#F1F5F9]'}`}>
                    {msg.content}
                  </div>

                  {/* Key Takeaway Callout */}
                  {!isUser && msg.keyTakeaway && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/30 text-amber-200 text-xs flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-amber-300">Key Takeaway:</strong>{' '}
                        <span>{msg.keyTakeaway}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Bar for Assistant Message */}
                  {!isUser && (
                    <div className="flex items-center justify-between pt-1 text-[#94A3B8] border-t border-[#222F46]">
                      <div className="flex items-center gap-2">
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-emerald-400 transition-colors p-1 rounded-lg hover:bg-[#1E293B]"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {/* Read Aloud Button */}
                        <button
                          onClick={() => handleSpeak(msg.content, msg.id)}
                          className="flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-emerald-400 transition-colors p-1 rounded-lg hover:bg-[#1E293B]"
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                              <span className="text-rose-400">Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Read Aloud</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-Ups Pills */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#222F46]">
                      <p className="text-[11px] font-semibold text-[#94A3B8] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Suggested Follow-Up Questions:
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {msg.suggestedFollowUps.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(prompt)}
                            disabled={isLoading}
                            className="text-left text-xs text-emerald-300 bg-[#131926] hover:bg-[#1C2638] border border-[#222F46] hover:border-emerald-500/50 p-2.5 rounded-xl transition-all flex items-center justify-between group"
                          >
                            <span>{prompt}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#334155] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 text-xs font-bold">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#182030] border border-[#222F46] rounded-2xl rounded-tl-xs p-4 space-y-2 max-w-[70%]">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Tutor is preparing your {difficulty} explanation...</span>
                </div>
                <div className="space-y-1.5">
                  <div className="w-48 h-2.5 bg-[#253248] rounded animate-pulse" />
                  <div className="w-36 h-2.5 bg-[#253248] rounded animate-pulse" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#101522] border-t border-[#1E293B] space-y-2">
          
          {/* Quick prompt chips if few messages */}
          {messages.length <= 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-semibold text-[#94A3B8] shrink-0">Try asking:</span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-[#182030] text-[#CBD5E1] border border-[#222F46] hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask an academic question in ${subject} (${difficulty} level)...`}
                rows={2}
                className="w-full bg-[#161F30] border border-[#26354D] rounded-2xl px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="h-11 px-5 rounded-2xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-white font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Ask</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
