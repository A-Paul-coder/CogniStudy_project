import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TutorChat } from './components/TutorChat';
import { ConceptExplainer } from './components/ConceptExplainer';
import { NotesSummarizer } from './components/NotesSummarizer';
import { QuizGenerator } from './components/QuizGenerator';
import { FlashcardGenerator } from './components/FlashcardGenerator';
import { User, ActiveTab, StudentStats, ActivityItem } from './types';
import { GraduationCap, Sparkles, X, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Cross-module contextual states
  const [quizTopic, setQuizTopic] = useState<string>('');
  const [quizNotesContext, setQuizNotesContext] = useState<string>('');
  const [flashcardTopic, setFlashcardTopic] = useState<string>('');
  const [flashcardNotesContext, setFlashcardNotesContext] = useState<string>('');
  const [explainerTopic, setExplainerTopic] = useState<string>('');

  // User State
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('studybuddy_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      id: 'demo-user-1',
      name: 'Alex Rivera',
      email: 'alex.rivera@university.edu',
      gradeOrMajor: 'Computer Science & AI',
      studyStreak: 5,
      xpPoints: 1240,
      joinedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    };
  });

  const [stats, setStats] = useState<StudentStats>({
    topicsExploredCount: 8,
    quizzesCompletedCount: 6,
    averageQuizScore: 92,
    flashcardsMasteredCount: 14,
    totalFlashcardsCount: 18,
    studyTimeMinutes: 125,
    streakDays: 5,
    xpPoints: 1240,
  });

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      type: 'concept',
      title: 'Explored: Binary Search Trees',
      description: 'Mastered logarithmic lookups, tree balance factors, and AVL rotations.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      scoreOrMetric: 'Mastered',
    },
    {
      id: 'act-2',
      type: 'quiz',
      title: 'Completed: Python OOP Mastery Quiz',
      description: 'Scored 5/5 on Classes, Polymorphism, and Decorators.',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      scoreOrMetric: '100%',
    },
    {
      id: 'act-3',
      type: 'summary',
      title: 'Summarized: Computer Memory Hierarchy',
      description: 'Extracted caching principles, Locality of Reference, and 3C cache misses.',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      scoreOrMetric: 'Distilled',
    },
    {
      id: 'act-4',
      type: 'flashcard',
      title: 'Practiced: Operating Systems Deck',
      description: 'Reviewed 6 active-recall cards on Paging, Virtual Memory, and Deadlocks.',
      timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
      scoreOrMetric: '5/6 Mastered',
    },
  ]);

  // Fetch initial dashboard stats from API
  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.recentActivities && data.recentActivities.length > 0) {
          setActivities(data.recentActivities);
        }
      })
      .catch((err) => console.log('Using local state cache:', err));
  }, []);

  useEffect(() => {
    localStorage.setItem('studybuddy_user', JSON.stringify(user));
  }, [user]);

  const handleEarnXp = (amount: number) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        xpPoints: prev.xpPoints + amount,
      };
      setStats((s) => ({ ...s, xpPoints: updated.xpPoints }));
      return updated;
    });
  };

  const handleQuizCompleted = () => {
    setStats((prev) => ({
      ...prev,
      quizzesCompletedCount: prev.quizzesCompletedCount + 1,
    }));
  };

  // Cross-navigation handlers
  const handleStartQuizFromTopic = (topic: string) => {
    setQuizTopic(topic);
    setQuizNotesContext('');
    setActiveTab('quiz');
  };

  const handleStartQuizFromNotes = (notes: string, title: string) => {
    setQuizTopic(title);
    setQuizNotesContext(notes);
    setActiveTab('quiz');
  };

  const handleStartFlashcardsFromTopic = (topic: string) => {
    setFlashcardTopic(topic);
    setFlashcardNotesContext('');
    setActiveTab('flashcards');
  };

  const handleStartFlashcardsFromNotes = (notes: string, title: string) => {
    setFlashcardTopic(title);
    setFlashcardNotesContext(notes);
    setActiveTab('flashcards');
  };

  const handleExploreConcept = (concept: string) => {
    setExplainerTopic(concept);
    setActiveTab('explainer');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F1F5F9] flex font-sans selection:bg-[#10B981] selection:text-white">
      
      {/* Left Sidebar Panel */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        stats={stats}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area (offset on desktop by sidebar width) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        
        {/* Top Header Bar */}
        <Navbar
          activeTab={activeTab}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Feature Workspace */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          {activeTab === 'dashboard' && (
            <Dashboard
              user={user}
              stats={stats}
              activities={activities}
              setActiveTab={setActiveTab}
              onSelectTopicForExplainer={handleExploreConcept}
              onSelectTopicForQuiz={handleStartQuizFromTopic}
            />
          )}

          {activeTab === 'tutor' && (
            <TutorChat
              onEarnXp={handleEarnXp}
              onSelectConceptForExplainer={handleExploreConcept}
            />
          )}

          {activeTab === 'explainer' && (
            <ConceptExplainer
              initialTopic={explainerTopic}
              onGenerateQuizFromTopic={handleStartQuizFromTopic}
              onGenerateFlashcardsFromTopic={handleStartFlashcardsFromTopic}
              onEarnXp={handleEarnXp}
            />
          )}

          {activeTab === 'summarizer' && (
            <NotesSummarizer
              onGenerateQuizFromNotes={handleStartQuizFromNotes}
              onGenerateFlashcardsFromNotes={handleStartFlashcardsFromNotes}
              onEarnXp={handleEarnXp}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizGenerator
              initialTopic={quizTopic}
              initialNotesContext={quizNotesContext}
              onEarnXp={handleEarnXp}
              onQuizCompleted={handleQuizCompleted}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardGenerator
              initialTopic={flashcardTopic}
              initialNotesContext={flashcardNotesContext}
              onEarnXp={handleEarnXp}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-[#111622] border-t border-[#1E293B] py-5 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold shadow-xs">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-[#F1F5F9]">StudyBuddy AI</span>
              <span className="text-[#64748B]">• Academic Learning Companion</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Powered by Google Gemini AI
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth / Profile Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#131926] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#222F46] space-y-4 animate-in fade-in zoom-in-95 duration-200 text-[#F1F5F9]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <GraduationCap className="w-5 h-5" />
                <span>Student Profile & Settings</span>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1 text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl hover:bg-[#1C2638] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1A2234] border border-[#26354D]">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-[#F8FAFC] text-base">{user.name}</h4>
                <p className="text-xs text-[#94A3B8]">{user.email}</p>
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/40">
                  {user.gradeOrMajor}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/30">
                <span className="text-[11px] font-semibold text-amber-400 uppercase block">Streak</span>
                <span className="text-xl font-bold text-amber-300">{user.studyStreak} Days</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/30">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase block">Total XP</span>
                <span className="text-xl font-bold text-emerald-300">{user.xpPoints} XP</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="w-full py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl font-semibold text-xs transition-colors shadow-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
