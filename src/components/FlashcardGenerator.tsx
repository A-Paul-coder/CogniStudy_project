import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  Shuffle, 
  HelpCircle, 
  Lightbulb, 
  Loader2, 
  BookOpen,
  Award,
  RefreshCw
} from 'lucide-react';
import { FlashcardDeck, Flashcard } from '../types';

interface FlashcardGeneratorProps {
  initialTopic?: string;
  initialNotesContext?: string;
  onEarnXp?: (points: number) => void;
}

export const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({
  initialTopic = '',
  initialNotesContext = '',
  onEarnXp,
}) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [notesContext, setNotesContext] = useState(initialNotesContext || '');
  const [cardCount, setCardCount] = useState<number>(6);
  const [isLoading, setIsLoading] = useState(false);

  // Deck & Card Review State
  const [deck, setDeck] = useState<FlashcardDeck>({
    id: 'sample-deck-os',
    title: 'Operating Systems Core Mechanisms',
    topic: 'Operating Systems',
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c-1',
        question: 'What is the primary difference between a Process and a Thread?',
        answer: 'A Process is an independent executing program instance with its own private virtual memory address space. A Thread is a lightweight sub-execution stream within a process that shares code, data, and resources with peer threads.',
        hint: 'Consider isolated address space vs shared memory within the same address space.',
        category: 'Concurrency',
        mastered: true,
      },
      {
        id: 'c-2',
        question: 'What are the four Coffman conditions necessary for a Deadlock to occur?',
        answer: '1. Mutual Exclusion (non-shareable resources)\n2. Hold and Wait (holding resources while requesting others)\n3. No Preemption (resources cannot be forcibly taken)\n4. Circular Wait (circular chain of pending requests)',
        hint: 'Mutual exclusion, Hold & wait, No preemption, Circular wait.',
        category: 'Synchronization',
        mastered: false,
      },
      {
        id: 'c-3',
        question: 'How does Virtual Memory Paging work and what is a TLB?',
        answer: 'Paging splits virtual address space into fixed-size Pages mapped to physical RAM Frames via Page Tables. A Translation Lookaside Buffer (TLB) is an on-chip hardware cache that stores recent virtual-to-physical address mappings to avoid page table memory lookups.',
        hint: 'Hardware translation cache inside the Memory Management Unit (MMU).',
        category: 'Memory Management',
        mastered: true,
      },
      {
        id: 'c-4',
        question: 'What is the difference between Preemptive and Non-Preemptive CPU Scheduling?',
        answer: 'Preemptive Scheduling allows the OS to interrupt a currently running process (e.g. Round Robin or Priority) to allocate CPU to another. Non-Preemptive (e.g. FCFS) allows a process to hold the CPU until it terminates or enters a wait state.',
        hint: 'Can the operating system forcibly context switch a running task?',
        category: 'Scheduling',
        mastered: false,
      },
      {
        id: 'c-5',
        question: 'What is a Race Condition and how can it be prevented?',
        answer: 'A Race Condition occurs when multiple threads concurrently read and write shared data, causing the final output to depend on arbitrary execution timing. It is prevented using synchronization primitives like Mutex locks, Semaphores, and Atomic operations.',
        hint: 'Critical sections require mutual exclusion.',
        category: 'Concurrency',
        mastered: false,
      },
      {
        id: 'c-6',
        question: 'What is Thrashing in Virtual Memory?',
        answer: 'Thrashing occurs when the operating system spends more time swapping pages between RAM and disk (page fault handling) than actually executing instructions, causing system throughput to collapse.',
        hint: 'Excessive page faulting when the working set exceeds physical RAM.',
        category: 'Memory Management',
        mastered: true,
      },
    ],
  });

  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleGenerateDeck = async () => {
    if ((!topic.trim() && !notesContext.trim()) || isLoading) return;

    setIsLoading(true);
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIdx(0);

    try {
      const res = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim() || 'Key Concepts',
          notesContext,
          cardCount,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate flashcards');

      const data: FlashcardDeck = await res.json();
      setDeck(data);
      if (onEarnXp) onEarnXp(35);
    } catch (err) {
      console.error('Flashcards error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMastery = async (cardId: string, mastered: boolean) => {
    const updatedCards = deck.cards.map((c) => (c.id === cardId ? { ...c, mastered } : c));
    setDeck({ ...deck, cards: updatedCards });

    try {
      await fetch('/api/flashcards/update-mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId: deck.id,
          cardId,
          mastered,
        }),
      });
    } catch (err) {
      console.error('Failed to update mastery:', err);
    }

    // Auto advance to next card
    if (currentCardIdx < deck.cards.length - 1) {
      setIsFlipped(false);
      setShowHint(false);
      setTimeout(() => setCurrentCardIdx((p) => p + 1), 250);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    setDeck({ ...deck, cards: shuffled });
    setCurrentCardIdx(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleResetMastery = () => {
    const reset = deck.cards.map((c) => ({ ...c, mastered: false }));
    setDeck({ ...deck, cards: reset });
    setCurrentCardIdx(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const currentCard = deck.cards[currentCardIdx];
  const masteredCount = deck.cards.filter((c) => c.mastered).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Creation Header */}
      <div className="bg-[#131926] p-6 rounded-3xl border border-[#1E293B] shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-800/40">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Active Recall Flashcards
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
            Interactive Spaced Repetition Decks
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Generate question-answer study cards with flip animations, hints, and mastery tracking.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateDeck();
          }}
          className="space-y-3 pt-1"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[#94A3B8]">Topic or Subject</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Operating Systems, Biochemistry, Macroeconomics..."
                className="w-full bg-[#161F30] border border-[#26354D] rounded-2xl px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#94A3B8]">Card Count</label>
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="w-full bg-[#161F30] border border-[#26354D] rounded-2xl px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                <option value={4}>4 Flashcards (Quick Review)</option>
                <option value={6}>6 Flashcards (Standard Deck)</option>
                <option value={8}>8 Flashcards (Extended)</option>
                <option value={12}>12 Flashcards (Comprehensive)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748B]">Generates front prompt, back answer & memory hint</span>
            </div>

            <button
              type="submit"
              disabled={(!topic.trim() && !notesContext.trim()) || isLoading}
              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Deck...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Flashcard Deck</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Flashcard Study Stage */}
      {currentCard && (
        <div className="space-y-4">
          
          {/* Deck Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131926] p-4 rounded-2xl border border-[#1E293B] shadow-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/40">
                {deck.topic}
              </span>
              <h3 className="text-base font-bold text-[#F8FAFC] mt-1">{deck.title}</h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Mastery progress */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{masteredCount} of {deck.cards.length} Mastered</span>
              </div>

              {/* Shuffle & Reset */}
              <button
                onClick={handleShuffle}
                title="Shuffle Cards"
                className="p-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#182030] rounded-xl transition-colors border border-[#222F46]"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetMastery}
                title="Reset Deck Mastery"
                className="p-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#182030] rounded-xl transition-colors border border-[#222F46]"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive 3D Flip Card Container */}
          <div className="perspective-1000 min-h-[340px] sm:min-h-[380px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <div 
              className={`relative w-full h-full rounded-3xl transition-transform duration-500 transform-style-3d p-6 sm:p-8 flex flex-col justify-between border shadow-sm min-h-[340px] sm:min-h-[380px] select-none ${
                isFlipped 
                  ? 'bg-[#0E1E15] text-[#F8FAFC] border-emerald-900/50' 
                  : 'bg-[#131926] text-[#F8FAFC] border-[#1E293B]'
              }`}
            >
              
              {/* Card Top Ribbon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    isFlipped 
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' 
                      : 'bg-[#182030] text-emerald-400 border border-[#222F46]'
                  }`}>
                    {isFlipped ? 'ANSWER / EXPLANATION' : 'QUESTION & PROMPT'}
                  </span>
                  {currentCard.category && (
                    <span className={`text-[10px] font-medium hidden sm:inline ${isFlipped ? 'text-emerald-300/70' : 'text-[#94A3B8]'}`}>
                      • {currentCard.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentCard.mastered && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Mastered
                    </span>
                  )}
                  <span className={`text-xs font-semibold ${isFlipped ? 'text-emerald-300/70' : 'text-[#94A3B8]'}`}>
                    Card {currentCardIdx + 1} / {deck.cards.length}
                  </span>
                </div>
              </div>

              {/* Card Core Content */}
              <div className="py-6 space-y-4">
                {!isFlipped ? (
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-2xl font-bold text-[#F8FAFC] leading-snug">
                      {currentCard.question}
                    </h3>

                    {/* Hint Section */}
                    {currentCard.hint && (
                      <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                        {!showHint ? (
                          <button
                            type="button"
                            onClick={() => setShowHint(true)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-800/40 px-3 py-1 rounded-xl transition-colors"
                          >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                            <span>Reveal Memory Hint</span>
                          </button>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200 space-y-1">
                            <strong className="font-semibold flex items-center gap-1 text-amber-400">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Memory Hint:
                            </strong>
                            <p className="text-amber-100/90">{currentCard.hint}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <p className="text-sm sm:text-base text-emerald-50 leading-relaxed whitespace-pre-wrap font-normal">
                      {currentCard.answer}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer Tap Indicator */}
              <div className="flex items-center justify-between text-xs pt-4 border-t border-white/10">
                <span className={`text-[11px] font-medium flex items-center gap-1.5 ${isFlipped ? 'text-emerald-400/80' : 'text-[#64748B]'}`}>
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click anywhere on card to flip {isFlipped ? 'back to question' : 'and reveal answer'}</span>
                </span>
              </div>

            </div>
          </div>

          {/* Action & Mastery Review Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#131926] p-4 rounded-2xl border border-[#1E293B] shadow-xs">
            
            {/* Step navigation */}
            <div className="flex items-center gap-2">
              <button
                disabled={currentCardIdx === 0}
                onClick={() => {
                  setIsFlipped(false);
                  setShowHint(false);
                  setCurrentCardIdx((p) => Math.max(0, p - 1));
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-[#182030] hover:bg-[#202C40] disabled:opacity-30 border border-[#222F46] transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                disabled={currentCardIdx === deck.cards.length - 1}
                onClick={() => {
                  setIsFlipped(false);
                  setShowHint(false);
                  setCurrentCardIdx((p) => Math.min(deck.cards.length - 1, p + 1));
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-[#182030] hover:bg-[#202C40] disabled:opacity-30 border border-[#222F46] transition-colors flex items-center gap-1"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mastery decision buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleMastery(currentCard.id, false)}
                className="px-4 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 text-rose-300 border border-rose-800/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Need Review</span>
              </button>

              <button
                onClick={() => handleToggleMastery(currentCard.id, true)}
                className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mastered!</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
