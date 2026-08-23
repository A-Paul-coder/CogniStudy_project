import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Bot, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  Layers, 
  Flame, 
  Award, 
  ChevronRight,
  Settings,
  X
} from 'lucide-react';
import { ActiveTab, User, StudentStats } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User;
  stats: StudentStats;
  onOpenAuth: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  stats,
  onOpenAuth,
  isOpen,
  onClose,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; description: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & learning stats' },
    { id: 'tutor', label: 'AI Tutor', icon: Bot, description: 'Personal academic assistant' },
    { id: 'explainer', label: 'Concept Explainer', icon: Sparkles, description: 'Deep-dive definitions & analogies' },
    { id: 'summarizer', label: 'Notes Summarization', icon: FileText, description: 'Distill lecture passages' },
    { id: 'quiz', label: 'Quiz Generator', icon: HelpCircle, description: 'Adaptive MCQ knowledge checks' },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, description: 'Active recall spaced decks' },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#131926] border-r border-[#1E293B] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding & Close button for mobile */}
        <div className="p-5 border-b border-[#1E293B]">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => handleSelectTab('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#10B981] flex items-center justify-center text-white shadow-xs group-hover:bg-[#059669] transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#F8FAFC] text-lg tracking-tight">StudyBuddy</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-800/40">AI</span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">Academic Study Hub</p>
              </div>
            </button>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A2234] rounded-xl transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 scrollbar-none">
          <div className="px-3 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Study Modules
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all group ${
                    isActive
                      ? 'bg-[#1C2638] text-[#F8FAFC] font-semibold border border-[#2B3A52] shadow-xs'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#182030]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive 
                      ? 'bg-[#10B981] text-white shadow-xs' 
                      : 'bg-[#182030] text-[#94A3B8] group-hover:bg-[#202C40] group-hover:text-[#F8FAFC]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">{item.label}</p>
                    <p className={`text-[10px] truncate ${isActive ? 'text-emerald-400' : 'text-[#64748B]'}`}>
                      {item.description}
                    </p>
                  </div>

                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Learning Progress Widget */}
          <div className="pt-5 px-1">
            <div className="bg-[#101522] border border-[#1E293B] rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#94A3B8]">
                <span>Today's Momentum</span>
                <span className="text-[11px] text-emerald-400 font-bold">Active</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#161F30] p-2.5 rounded-xl border border-[#24334A] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#94A3B8] leading-none">Streak</p>
                    <p className="text-xs font-bold text-[#F8FAFC] mt-0.5">{stats.streakDays} Days</p>
                  </div>
                </div>

                <div className="bg-[#161F30] p-2.5 rounded-xl border border-[#24334A] flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#94A3B8] leading-none">Points</p>
                    <p className="text-xs font-bold text-[#F8FAFC] mt-0.5">{stats.xpPoints} XP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer User Profile & Settings Trigger */}
        <div className="p-3.5 border-t border-[#1E293B] bg-[#101522]">
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#182030] transition-all text-left border border-transparent hover:border-[#26354D] group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#10B981] text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
              {user.name.charAt(0)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#F8FAFC] truncate">{user.name}</p>
              <p className="text-[10px] text-[#94A3B8] truncate">{user.gradeOrMajor}</p>
            </div>

            <Settings className="w-4 h-4 text-[#64748B] group-hover:text-[#F8FAFC] shrink-0 transition-colors" />
          </button>
        </div>
      </aside>
    </>
  );
};
