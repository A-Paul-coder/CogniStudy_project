import React from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  FileText, 
  Bot, 
  Flame, 
  Award, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3,
  Calendar
} from 'lucide-react';
import { User, StudentStats, ActivityItem, ActiveTab } from '../types';

interface DashboardProps {
  user: User;
  stats: StudentStats;
  activities: ActivityItem[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectTopicForExplainer: (topic: string) => void;
  onSelectTopicForQuiz: (topic: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  stats,
  activities,
  setActiveTab,
  onSelectTopicForExplainer,
  onSelectTopicForQuiz,
}) => {
  const quickActions = [
    {
      id: 'tutor' as ActiveTab,
      title: 'Ask AI Tutor',
      desc: 'Get step-by-step academic explanations tailored to your level',
      icon: Bot,
      color: 'from-[#7C8B6D] to-[#5F6F52]',
      badge: 'Interactive Q&A',
    },
    {
      id: 'explainer' as ActiveTab,
      title: 'Explain a Concept',
      desc: 'Generate intuitive definitions, analogies, and revision checklists',
      icon: Sparkles,
      color: 'from-[#6E8260] to-[#4E6142]',
      badge: 'Deep Dive',
    },
    {
      id: 'summarizer' as ActiveTab,
      title: 'Summarize Notes',
      desc: 'Extract key takeaways, vocabulary, and exam points from lecture notes',
      icon: FileText,
      color: 'from-[#8C7A60] to-[#6E5D46]',
      badge: 'High Yield',
    },
    {
      id: 'quiz' as ActiveTab,
      title: 'Practice Quiz',
      desc: 'Test your understanding with adaptive multiple choice questions',
      icon: HelpCircle,
      color: 'from-[#A87B51] to-[#8C5E35]',
      badge: 'Active Recall',
    },
    {
      id: 'flashcards' as ActiveTab,
      title: 'Review Flashcards',
      desc: 'Flip interactive study decks to solidify long-term memory',
      icon: Layers,
      color: 'from-[#7A8778] to-[#556353]',
      badge: 'Spaced Repetition',
    },
  ];

  const popularTopics = [
    { topic: 'Binary Search Trees & AVL Rotations', subject: 'Data Structures' },
    { topic: 'Photosynthesis & Calvin Cycle', subject: 'Biology' },
    { topic: 'Supply & Demand Elasticity', subject: 'Economics' },
    { topic: 'Newtonian Dynamics & Work-Energy Theorem', subject: 'Physics' },
    { topic: 'RESTful API Design & HTTP Status Codes', subject: 'Software Eng' },
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'chat':
        return <Bot className="w-4 h-4 text-emerald-400" />;
      case 'concept':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'summary':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-sky-400" />;
      case 'flashcard':
        return <Layers className="w-4 h-4 text-teal-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F291E] via-[#133A29] to-[#0A2016] text-white p-6 sm:p-8 shadow-sm border border-[#1C4D35]">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Academic Learning System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            Welcome back, {user.name}! 📚
          </h1>
          <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
            Ready to master new concepts today? Ask your AI Tutor, break down tough topics, summarize lecture notes, or take an adaptive practice quiz.
          </p>

          {/* Quick Stats in Banner */}
          <div className="pt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#F1F5F9] font-medium">
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span><strong>{stats.streakDays} Day</strong> Study Streak</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Award className="w-4 h-4 text-emerald-400" />
              <span><strong>{stats.xpPoints}</strong> XP Points</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-sky-400" />
              <span><strong>{stats.studyTimeMinutes} min</strong> Total Study Time</span>
            </div>
          </div>
        </div>

        {/* Decorative background subtle organic shapes */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-24 bottom-0 w-48 h-48 bg-emerald-700/15 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Topics Explored */}
        <div className="bg-[#131926] p-5 rounded-2xl border border-[#1E293B] shadow-xs hover:border-[#2B3E58] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Topics Explored</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 flex items-center justify-center text-emerald-400 border border-emerald-800/40">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#F8FAFC] mt-2">{stats.topicsExploredCount}</p>
          <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Core concepts mastered
          </p>
        </div>

        {/* Metric 2: Quizzes Completed */}
        <div className="bg-[#131926] p-5 rounded-2xl border border-[#1E293B] shadow-xs hover:border-[#2B3E58] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Quizzes Taken</span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/60 flex items-center justify-center text-amber-400 border border-amber-800/40">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#F8FAFC] mt-2">{stats.quizzesCompletedCount}</p>
          <p className="text-xs text-amber-400 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {stats.averageQuizScore}% Average Score
          </p>
        </div>

        {/* Metric 3: Flashcards Mastered */}
        <div className="bg-[#131926] p-5 rounded-2xl border border-[#1E293B] shadow-xs hover:border-[#2B3E58] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Cards Mastered</span>
            <div className="w-8 h-8 rounded-xl bg-teal-950/60 flex items-center justify-center text-teal-400 border border-teal-800/40">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#F8FAFC] mt-2">
            {stats.flashcardsMasteredCount} <span className="text-sm font-normal text-[#64748B]">/ {stats.totalFlashcardsCount}</span>
          </p>
          <div className="w-full bg-[#1E293B] rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-[#10B981] h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, (stats.flashcardsMasteredCount / Math.max(1, stats.totalFlashcardsCount)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Academic Study Level */}
        <div className="bg-[#131926] p-5 rounded-2xl border border-[#1E293B] shadow-xs hover:border-[#2B3E58] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Current Level</span>
            <div className="w-8 h-8 rounded-xl bg-sky-950/60 flex items-center justify-center text-sky-400 border border-sky-800/40">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#F8FAFC] mt-2">Level {Math.floor(stats.xpPoints / 250) + 1}</p>
          <p className="text-xs text-sky-400 font-medium mt-1">
            {250 - (stats.xpPoints % 250)} XP to Next Rank
          </p>
        </div>

      </div>

      {/* Feature Navigation Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#F8FAFC]">Study Modules</h2>
            <p className="text-xs text-[#94A3B8]">Select a study tool to start your academic session</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => setActiveTab(action.id)}
                className="group text-left p-5 rounded-2xl bg-[#131926] border border-[#1E293B] hover:border-[#10B981] hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#1A2438] border border-[#2A3B54] text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                      {action.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#F8FAFC] group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                      {action.title}
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{action.desc}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Section: Popular Quick Explanations & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Popular Topics & Quick Starters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#131926] p-5 rounded-2xl border border-[#1E293B] shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Quick Concept Starters
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">One-click academic breakdowns & quizzes</p>
            </div>

            <div className="space-y-2">
              {popularTopics.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#182030] hover:bg-[#1C2638] border border-[#222F46] hover:border-[#2C3E5A] transition-all text-left space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/40">
                      {item.subject}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#F8FAFC] line-clamp-1">{item.topic}</p>
                  
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onSelectTopicForExplainer(item.topic)}
                      className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-[#131926] px-2.5 py-1 rounded-lg border border-[#222F46] hover:border-emerald-500/50 transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Explain
                    </button>
                    <button
                      onClick={() => onSelectTopicForQuiz(item.topic)}
                      className="text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-[#131926] px-2.5 py-1 rounded-lg border border-[#222F46] hover:border-amber-500/50 transition-all flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3" /> Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Recall Strategy Card */}
          <div className="bg-[#10241A] text-[#F1F5F9] p-5 rounded-3xl shadow-xs space-y-3 border border-[#1B422F]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-300" /> Learning Technique
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 rounded-md font-semibold">
                Feynman Method
              </span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Use the <strong>AI Tutor</strong> or <strong>Concept Explainer</strong> to break complex topics down into plain-English analogies, then test yourself with a 5-question adaptive quiz.
            </p>
            <button
              onClick={() => setActiveTab('tutor')}
              className="w-full py-2.5 px-3 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Start Session with AI Tutor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#131926] p-5 rounded-2xl border border-[#1E293B] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#94A3B8]" />
                  Recent Study Activity
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">Chronological record of your learning journey</p>
              </div>
              <span className="text-xs font-medium text-[#64748B]">
                {activities.length} Recorded Sessions
              </span>
            </div>

            {activities.length === 0 ? (
              <div className="py-12 text-center text-[#64748B] space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-[#334155]" />
                <p className="text-sm text-[#94A3B8]">No study activity yet today.</p>
                <p className="text-xs">Ask a question or explain a concept to record your first session!</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1E293B]">
                {activities.map((act) => (
                  <div key={act.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#182030] border border-[#222F46] flex items-center justify-center shrink-0 mt-0.5">
                      {getActivityIcon(act.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-[#F8FAFC] truncate">
                          {act.title}
                        </h4>
                        {act.scoreOrMetric && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 shrink-0">
                            {act.scoreOrMetric}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-1">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
