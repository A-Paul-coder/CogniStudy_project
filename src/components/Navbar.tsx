import React from 'react';
import { 
  Menu,
  Flame, 
  Award, 
  ChevronDown,
  LayoutDashboard,
  Bot,
  Sparkles,
  FileText,
  HelpCircle,
  Layers
} from 'lucide-react';
import { ActiveTab, User } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  user: User;
  onOpenAuth: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  user,
  onOpenAuth,
  onToggleSidebar,
}) => {
  const getTabInfo = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return { label: 'Dashboard', icon: LayoutDashboard, subtitle: 'Academic Overview & Analytics' };
      case 'tutor':
        return { label: 'AI Tutor', icon: Bot, subtitle: '24/7 Personalized Academic Guidance' };
      case 'explainer':
        return { label: 'Concept Explainer', icon: Sparkles, subtitle: 'Deep Concept Breakdowns & Analogies' };
      case 'summarizer':
        return { label: 'Notes Summarization', icon: FileText, subtitle: 'High-Yield Notes Distillation' };
      case 'quiz':
        return { label: 'Quiz Generator', icon: HelpCircle, subtitle: 'Adaptive Multiple-Choice Mastery' };
      case 'flashcards':
        return { label: 'Active Recall Flashcards', icon: Layers, subtitle: 'Interactive Spaced Repetition Decks' };
      default:
        return { label: 'Study Hub', icon: LayoutDashboard, subtitle: 'Learning Platform' };
    }
  };

  const currentInfo = getTabInfo(activeTab);
  const Icon = currentInfo.icon;

  return (
    <header className="sticky top-0 z-30 bg-[#131926]/90 backdrop-blur-md border-b border-[#1E293B] h-16">
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Mobile hamburger & Active Page Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A2234] transition-colors border border-[#222F46]"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex w-8 h-8 rounded-xl bg-[#1A2234] text-emerald-400 items-center justify-center border border-[#26354D]">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#F8FAFC] leading-tight flex items-center gap-2">
                <span>{currentInfo.label}</span>
              </h1>
              <p className="text-[11px] text-[#94A3B8] hidden md:block leading-none mt-0.5">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats & Student Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Streak Counter */}
          <div 
            title="Daily Study Streak"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/30 border border-amber-800/30 text-amber-300 text-xs font-semibold"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{user.studyStreak}d Streak</span>
          </div>

          {/* XP Points */}
          <div 
            title="Total XP Earned"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-950/30 border border-emerald-800/30 text-emerald-300 text-xs font-semibold"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>{user.xpPoints} XP</span>
          </div>

          {/* User Profile Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1.5 rounded-2xl border border-[#222F46] hover:border-[#2F3E5A] hover:bg-[#1A2234] transition-all text-left"
          >
            <div className="w-7 h-7 rounded-xl bg-[#10B981] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-[#F8FAFC] leading-tight">{user.name}</p>
              <p className="text-[10px] text-[#94A3B8] leading-tight truncate max-w-[110px]">{user.gradeOrMajor}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden sm:block" />
          </button>
        </div>

      </div>
    </header>
  );
};
