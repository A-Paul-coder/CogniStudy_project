import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Loader2, 
  Clock, 
  Award, 
  Check, 
  ChevronRight, 
  BookOpen,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz, QuizQuestion, DifficultyLevel } from '../types';

interface QuizGeneratorProps {
  initialTopic?: string;
  initialNotesContext?: string;
  onEarnXp?: (points: number) => void;
  onQuizCompleted?: () => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  initialTopic = '',
  initialNotesContext = '',
  onEarnXp,
  onQuizCompleted,
}) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [notesContext, setNotesContext] = useState(initialNotesContext || '');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);

  // Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>({
    id: 'sample-quiz-1',
    title: 'Python OOP & Design Patterns Quiz',
    topic: 'Python Object Oriented Programming',
    difficulty: 'intermediate',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 1,
        question: 'Which method in a Python class serves as the constructor to initialize newly created object attributes?',
        options: ['__init__()', '__new__()', '__construct__()', '__build__()'],
        correctAnswerIndex: 0,
        explanation: 'In Python, __init__() is the initializer method called automatically after the instance has been created by __new__(). It binds initial state and attributes to self.',
      },
      {
        id: 2,
        question: 'What is the purpose of the `super()` function in Python class inheritance?',
        options: [
          'To create a global singleton instance',
          'To delegate method calls to the parent (super) class in the Method Resolution Order (MRO)',
          'To override private variables in child classes',
          'To enforce strict static type checking',
        ],
        correctAnswerIndex: 1,
        explanation: 'super() returns a proxy object that delegates method calls to a parent or sibling class based on Python’s C3 Linearization / MRO.',
      },
      {
        id: 3,
        question: 'Which decorator is used to define a method that operates on the class itself rather than an instance of the class?',
        options: ['@property', '@staticmethod', '@classmethod', '@abstractmethod'],
        correctAnswerIndex: 2,
        explanation: '@classmethod receives the class (cls) as its first implicit argument, allowing access and modification of class-level state.',
      },
      {
        id: 4,
        question: 'In Python, what is Duck Typing fundamentally based on?',
        options: [
          'Explicit inheritance from Abstract Base Classes (ABCs)',
          'Strict compile-time static type analysis',
          'The presence of specific methods and behaviors at runtime ("if it walks like a duck...")',
          'Encapsulating all class members as private with double underscores',
        ],
        correctAnswerIndex: 2,
        explanation: 'Duck typing prioritizes an object’s actual interface (methods/attributes) over its explicit type or class hierarchy.',
      },
      {
        id: 5,
        question: 'What does the `@property` decorator achieve in a Python class?',
        options: [
          'Encrypts attributes in memory',
          'Allows a method to be accessed like an attribute, enabling custom getters, setters, and validation',
          'Forces the class to be immutable and frozen',
          'Makes the attribute directly accessible without class instantiation',
        ],
        correctAnswerIndex: 1,
        explanation: 'The @property decorator turns a method into a getter attribute, allowing clean, Pythonic encapsulation and dynamic validation.',
      },
    ],
  });

  // Test Taking State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !isSubmitted) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted]);

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialNotesContext) setNotesContext(initialNotesContext);
  }, [initialTopic, initialNotesContext]);

  const handleGenerateQuiz = async () => {
    if ((!topic.trim() && !notesContext.trim()) || isLoading) return;

    setIsLoading(true);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setElapsedSeconds(0);
    setIsTimerRunning(true);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim() || 'Custom Topic',
          notesContext,
          difficulty,
          questionCount,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate quiz');

      const data: Quiz = await res.json();
      setActiveQuiz(data);
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optionIdx,
    }));
  };

  const calculateScore = () => {
    if (!activeQuiz) return { score: 0, total: 0, percentage: 0 };
    let correct = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correct++;
      }
    });
    const total = activeQuiz.questions.length;
    const percentage = Math.round((correct / total) * 100);
    return { score: correct, total, percentage };
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || isSubmitted) return;
    setIsSubmitted(true);
    setIsTimerRunning(false);

    const { score, total, percentage } = calculateScore();

    // Trigger confetti on good score!
    if (percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    try {
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          quizTitle: activeQuiz.title,
          topic: activeQuiz.topic,
          difficulty: activeQuiz.difficulty,
          totalQuestions: total,
          score,
          timeSpentSeconds: elapsedSeconds,
        }),
      });
      if (onEarnXp) onEarnXp(score * 20 + 30);
      if (onQuizCompleted) onQuizCompleted();
    } catch (err) {
      console.error('Failed to submit quiz score:', err);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setIsSubmitted(false);
    setElapsedSeconds(0);
    setIsTimerRunning(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const sampleTopics = [
    'Python OOP & Decorators',
    'Data Structures: Trees & Hash Maps',
    'Operating Systems: Paging & Deadlocks',
    'Cellular Respiration & Glycolysis',
    'Macroeconomics: Fiscal Policy',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Quiz Creation Panel */}
      <div className="bg-[#131926] p-6 rounded-3xl border border-[#1E293B] shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-800/40">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            Adaptive Quiz Generator
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
            Test Your Knowledge with Instant Feedback
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Generate multiple choice questions with explanations based on any topic or pasted lecture notes.
          </p>
        </div>

        {/* Form Controls */}
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[#94A3B8]">Quiz Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Operating Systems, Calculus Derivatives, Python..."
                className="w-full bg-[#161F30] border border-[#26354D] rounded-2xl px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#94A3B8]">Question Count</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-[#161F30] border border-[#26354D] rounded-2xl px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                <option value={3}>3 Questions (Quick Check)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={8}>8 Questions (Comprehensive)</option>
                <option value={10}>10 Questions (Mastery Test)</option>
              </select>
            </div>

          </div>

          {/* Difficulty and Generate Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#94A3B8]">Difficulty:</span>
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all border ${
                    difficulty === lvl
                      ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
                      : 'bg-[#182030] text-[#94A3B8] border-[#222F46] hover:bg-[#202C40] hover:text-[#F8FAFC]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGenerateQuiz}
              disabled={(!topic.trim() && !notesContext.trim()) || isLoading}
              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing MCQs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate New Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Topic Chips */}
        <div className="pt-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-[#94A3B8] shrink-0">Try quizzes on:</span>
          {sampleTopics.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTopic(t);
              }}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-[#182030] text-[#CBD5E1] hover:bg-[#202C40] hover:text-emerald-300 border border-[#222F46] transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Active Quiz Test Area */}
      {activeQuiz && (
        <div className="bg-[#131926] rounded-3xl border border-[#1E293B] shadow-xs overflow-hidden">
          
          {/* Header Bar: Title, Timer, Progress */}
          <div className="p-5 border-b border-[#1E293B] bg-[#101522] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/40">
                {activeQuiz.difficulty} Quiz
              </span>
              <h3 className="text-base font-bold text-[#F8FAFC] mt-1">{activeQuiz.title}</h3>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-[#CBD5E1]">
              <div className="flex items-center gap-1.5 bg-[#182030] px-3 py-1.5 rounded-xl border border-[#222F46] shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
              <div className="bg-[#182030] px-3 py-1.5 rounded-xl border border-[#222F46] shadow-xs">
                <span>Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}</span>
              </div>
            </div>
          </div>

          {/* Question Stepper Indicator */}
          <div className="px-6 pt-4">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {activeQuiz.questions.map((q, idx) => {
                const isCurrent = currentQuestionIdx === idx;
                const isAnswered = selectedAnswers[idx] !== undefined;
                let bgClass = 'bg-[#182030] text-[#94A3B8]';

                if (isSubmitted) {
                  const isCorrect = selectedAnswers[idx] === q.correctAnswerIndex;
                  bgClass = isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white';
                } else if (isCurrent) {
                  bgClass = 'bg-[#10B981] text-white ring-2 ring-emerald-500/40';
                } else if (isAnswered) {
                  bgClass = 'bg-[#334155] text-white';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Body */}
          {activeQuiz.questions[currentQuestionIdx] && (
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Question Text */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Question #{currentQuestionIdx + 1}
                </span>
                <h4 className="text-base sm:text-lg font-semibold text-[#F8FAFC] leading-snug">
                  {activeQuiz.questions[currentQuestionIdx].question}
                </h4>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3">
                {activeQuiz.questions[currentQuestionIdx].options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                  const isCorrect = activeQuiz.questions[currentQuestionIdx].correctAnswerIndex === optIdx;

                  let optionStyle = 'bg-[#182030] hover:bg-[#1E293B] border-[#222F46] text-[#F8FAFC]';

                  if (isSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                    } else {
                      optionStyle = 'bg-[#182030] opacity-50 border-[#222F46] text-[#64748B]';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-[#102319] border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-start justify-between gap-3 ${optionStyle}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isSelected ? 'bg-[#10B981] text-white' : 'bg-[#253248] text-[#CBD5E1]'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </div>

                      {isSubmitted && (
                        <div>
                          {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                          {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card (Revealed upon submit) */}
              {isSubmitted && (
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-amber-200 space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Answer Explanation</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed pl-1">
                    {activeQuiz.questions[currentQuestionIdx].explanation}
                  </p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
                <button
                  type="button"
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:bg-[#182030] disabled:opacity-30 transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIdx((p) => Math.min(activeQuiz.questions.length - 1, p + 1))}
                      className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#26354D] text-white text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : !isSubmitted ? (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Submit Answers</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Results Summary Box when Quiz is Submitted */}
          {isSubmitted && (
            <div className="p-6 bg-[#0E1E15] text-white border-t border-emerald-900/40">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <Award className="w-4 h-4" /> Quiz Completed
                  </span>
                  <h4 className="text-xl font-bold">
                    You scored {calculateScore().score} out of {calculateScore().total} ({calculateScore().percentage}%)
                  </h4>
                  <p className="text-xs text-emerald-200/80">
                    Completed in {formatTime(elapsedSeconds)} • Earned +{calculateScore().score * 20 + 30} XP
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRetake}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                  <button
                    onClick={handleGenerateQuiz}
                    className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>New Topic Quiz</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
