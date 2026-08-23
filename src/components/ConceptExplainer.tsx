import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Copy, 
  Check, 
  ArrowRight, 
  Loader2, 
  Layers, 
  BookmarkCheck,
  Share2
} from 'lucide-react';
import { ConceptExplanation, DifficultyLevel } from '../types';

interface ConceptExplainerProps {
  initialTopic?: string;
  onGenerateQuizFromTopic: (topic: string) => void;
  onGenerateFlashcardsFromTopic: (topic: string) => void;
  onEarnXp?: (points: number) => void;
}

export const ConceptExplainer: React.FC<ConceptExplainerProps> = ({
  initialTopic = '',
  onGenerateQuizFromTopic,
  onGenerateFlashcardsFromTopic,
  onEarnXp,
}) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [subject, setSubject] = useState('Computer Science');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const [explanation, setExplanation] = useState<ConceptExplanation | null>({
    topic: 'Binary Search Trees (BST)',
    subject: 'Computer Science',
    difficulty: 'intermediate',
    shortDefinition: 'A Binary Search Tree is a hierarchical, node-based binary tree data structure where each node has at most two children, and the key in each node is greater than all keys in its left subtree and smaller than all keys in its right subtree.',
    deepExplanation: 'Binary Search Trees provide an efficient way to store sorted collections of data. When searching for an element, you compare the target value with the current root. If it is smaller, you recurse into the left child; if larger, you recurse into the right child. This halves the remaining search space at each step, yielding average O(log n) time complexity for lookup, insertion, and deletion. However, if keys are inserted in sorted order without balancing (such as in an AVL or Red-Black Tree), the tree can degenerate into a linked list with O(n) worst-case time complexity.',
    analogyOrExample: 'Think of looking up a word in a physical printed dictionary. You open the book near the middle: if your word comes alphabetically before the current page, you discard the entire right half of the book and repeat the search only on the left half.',
    keyPoints: [
      'BST Invariant: Left Subtree Keys < Root Key < Right Subtree Keys.',
      'In-Order Traversal (Left -> Root -> Right) always yields keys in strictly ascending sorted order.',
      'Average Time Complexity: O(log n) for Search, Insert, and Delete operations.',
      'Worst-Case Time Complexity: O(n) when the tree degenerates into a linear chain (skewed tree).',
      'Self-Balancing Variants: AVL Trees (balance factor -1, 0, 1) and Red-Black Trees (color invariants) prevent skewing.',
    ],
    commonMisconceptions: [
      'Assuming BST lookups are always O(log n) — without balancing mechanisms, an unbalanced tree becomes O(n).',
      'Confusing a Binary Tree (any tree with max 2 children per node) with a Binary Search Tree (which strictly enforces ordering).',
      'Assuming duplicates are forbidden — duplicates can be stored by defining a consistent convention (e.g. duplicates always go to the right subtree or in a frequency count).',
    ],
    revisionChecklist: [
      'Verify BST ordering property at every node recursively',
      'Remember In-Order traversal = Sorted order',
      'State time complexity: Average O(log n), Worst O(n)',
      'Explain deletion cases: leaf node, 1 child, 2 children (replace with in-order successor)',
      'Differentiate standard BST from AVL / Red-Black self-balancing trees',
    ],
    suggestedQuizQuestions: [
      'What is the time complexity of searching an unbalanced BST with n nodes?',
      'Which tree traversal order produces sorted output from a BST?',
      'When deleting a node with two children, which node is used as the replacement?',
    ],
  });

  const subjects = [
    'Computer Science',
    'Mathematics & Calculus',
    'Physics',
    'Biology & Medicine',
    'Chemistry',
    'Economics & Finance',
    'History & Social Sciences',
    'Psychology & Neuroscience',
  ];

  const presetTopics = [
    'Binary Search Trees',
    'Quantum Superposition',
    'Supply and Demand Elasticity',
    'Mitochondrial ATP Synthesis',
    'Recursion and Call Stack',
    'Bayes Theorem & Probability',
  ];

  const handleExplain = async (customTopic?: string) => {
    const topicToUse = customTopic || topic.trim();
    if (!topicToUse || isLoading) return;

    setTopic(topicToUse);
    setIsLoading(true);

    try {
      const res = await fetch('/api/explainer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse,
          subject,
          difficulty,
        }),
      });

      if (!res.ok) throw new Error('Failed to explain concept');

      const data: ConceptExplanation = await res.json();
      setExplanation(data);
      if (onEarnXp) onEarnXp(40);
    } catch (err) {
      console.error('Explainer error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyChecklist = () => {
    if (!explanation) return;
    const text = `**${explanation.topic} - Quick Revision Notes**\n\n` +
      `Definition: ${explanation.shortDefinition}\n\n` +
      `Key Points:\n${explanation.keyPoints.map((p) => `- ${p}`).join('\n')}\n\n` +
      `Revision Checklist:\n${explanation.revisionChecklist.map((c) => `[ ] ${c}`).join('\n')}`;
    
    navigator.clipboard.writeText(text);
    setCopiedSection('checklist');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header & Input Card */}
      <div className="bg-[#131926] p-6 rounded-3xl border border-[#1E293B] shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-800/40">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            AI Concept Explainer
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
            Deconstruct & Master Any Academic Concept
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Generate intuitive definitions, practical analogies, high-yield key points, and exam revision checklists.
          </p>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExplain();
          }}
          className="space-y-4 pt-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Topic Input */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[#94A3B8]">Topic or Concept Name</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Dynamic Programming, Photosynthesis, Elasticity..."
                className="w-full bg-[#161F30] border border-[#26354D] rounded-2xl px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Subject Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#94A3B8]">Subject Field</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#161F30] border border-[#26354D] rounded-2xl px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Difficulty and Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#94A3B8]">Depth:</span>
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
              type="submit"
              disabled={!topic.trim() || isLoading}
              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Concept...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explain Concept</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preset Topic Chips */}
        <div className="pt-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-[#94A3B8] shrink-0">Try exploring:</span>
          {presetTopics.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleExplain(p)}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-[#182030] text-[#CBD5E1] hover:bg-[#202C40] hover:text-emerald-300 border border-[#222F46] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation Results Display */}
      {explanation && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Action Ribbon at Top of Results */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#102319] border border-[#1C4731] p-4 rounded-2xl">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Concept</span>
              <h3 className="text-lg font-bold text-[#F8FAFC]">{explanation.topic}</h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopyChecklist}
                className="px-3 py-1.5 bg-[#182030] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#26354D] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                {copiedSection === 'checklist' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Notes!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Revision Notes</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onGenerateFlashcardsFromTopic(explanation.topic)}
                className="px-3 py-1.5 bg-[#182030] text-amber-300 hover:bg-[#202C40] border border-amber-800/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Create Flashcards</span>
              </button>

              <button
                onClick={() => onGenerateQuizFromTopic(explanation.topic)}
                className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Quiz Me on This</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Section 1: Definition Card */}
          <div className="bg-[#131926] p-6 rounded-3xl border border-[#1E293B] shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <BookOpen className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Crystal Clear Definition</h4>
            </div>
            <p className="text-base font-semibold text-[#F8FAFC] leading-relaxed pl-1">
              {explanation.shortDefinition}
            </p>
          </div>

          {/* Section 2: Intuitive Analogy / Real-World Example */}
          <div className="bg-amber-950/20 p-6 rounded-3xl border border-amber-800/30 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Real-World Intuition & Analogy</h4>
            </div>
            <p className="text-sm text-amber-100/90 leading-relaxed">
              {explanation.analogyOrExample}
            </p>
          </div>

          {/* Section 3: Deep-Dive Explanation */}
          <div className="bg-[#131926] p-6 rounded-3xl border border-[#1E293B] shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Comprehensive Deep Dive</h4>
            <div className="text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-wrap">
              {explanation.deepExplanation}
            </div>
          </div>

          {/* Section 4: Key Points & Misconceptions in 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Essential Key Points */}
            <div className="bg-[#131926] p-6 rounded-3xl border border-[#1E293B] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <BookmarkCheck className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Core Key Takeaways</h4>
              </div>
              <ul className="space-y-2.5">
                {explanation.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#CBD5E1]">
                    <span className="w-5 h-5 rounded-full bg-emerald-950/60 text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-emerald-800/40">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Traps & Misconceptions */}
            {explanation.commonMisconceptions && explanation.commonMisconceptions.length > 0 && (
              <div className="bg-rose-950/20 p-6 rounded-3xl border border-rose-800/30 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Common Traps to Avoid</h4>
                </div>
                <ul className="space-y-2.5">
                  {explanation.commonMisconceptions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Section 5: Rapid Exam Revision Checklist */}
          <div className="bg-[#131926] p-6 rounded-3xl border border-[#1E293B] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                  Rapid Exam Revision Checklist
                </h4>
              </div>
              <span className="text-xs text-[#94A3B8]">Active Recall Prompt List</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {explanation.revisionChecklist.map((item, idx) => (
                <label 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#182030] hover:bg-[#1E293B] border border-[#222F46] hover:border-emerald-500/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 border-[#26354D] bg-[#161F30] accent-emerald-500"
                  />
                  <span className="text-xs text-[#CBD5E1] font-medium leading-relaxed">{item}</span>
                </label>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
