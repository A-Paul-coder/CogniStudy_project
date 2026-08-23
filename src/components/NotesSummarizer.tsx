import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  Copy, 
  Check, 
  ArrowRight, 
  Loader2, 
  ListOrdered, 
  BookmarkCheck, 
  AlertCircle,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { NotesSummary } from '../types';

interface NotesSummarizerProps {
  onGenerateQuizFromNotes: (notesText: string, title: string) => void;
  onGenerateFlashcardsFromNotes: (notesText: string, title: string) => void;
  onEarnXp?: (points: number) => void;
}

export const NotesSummarizer: React.FC<NotesSummarizerProps> = ({
  onGenerateQuizFromNotes,
  onGenerateFlashcardsFromNotes,
  onEarnXp,
}) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [summaryLength, setSummaryLength] = useState<'concise' | 'standard' | 'comprehensive'>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sampleNotes = [
    {
      title: 'Computer Memory Hierarchy & Caching',
      text: `The memory hierarchy in computer architecture separates computer storage based on response time. Since fast memory is expensive, each level in the hierarchy has higher speed, higher cost per bit, but lower capacity.

The typical hierarchy from top to bottom includes:
1. CPU Registers: Smallest (under 1 KB), single clock cycle latency (around 0.5 nanoseconds).
2. L1, L2, and L3 CPU Caches: SRAM memory located on-die with the CPU. Latency ranges from 1 to 20 nanoseconds.
3. Main Memory (DRAM): High capacity (8 GB to 128 GB), latency of 50 to 100 nanoseconds.
4. Secondary Storage (Solid-State Drive SSD / Hard Disk Drive HDD): Non-volatile, capacities in terabytes, latency in microseconds (SSD) or milliseconds (HDD).

Locality of Reference is the fundamental principle that enables caching:
- Temporal Locality: If a particular memory location was accessed recently, it is highly probable it will be accessed again soon (e.g., loops, frequently accessed counters).
- Spatial Locality: If a memory location is accessed, nearby memory addresses are likely to be accessed soon (e.g., sequential array iterations, contiguous code instructions).

Cache Miss types (The 3 Cs):
- Compulsory Miss (Cold miss): First-time access to a memory block that has never been loaded into the cache.
- Capacity Miss: Cache cannot contain all blocks needed during execution of a program.
- Conflict Miss: Multiple memory locations map to the exact same cache set in direct-mapped or set-associative caches.`,
    },
    {
      title: 'Cellular Respiration & ATP Production',
      text: `Cellular respiration is a metabolic pathway that breaks down glucose and produces ATP (Adenosine Triphosphate), the primary energy currency of cells.

The complete aerobic respiration process occurs in four key stages:
1. Glycolysis: Occurs in the cytoplasm. One glucose (6-carbon) molecule is cleaved into two pyruvate (3-carbon) molecules. Yields net 2 ATP and 2 NADH. Does not require oxygen (anaerobic).
2. Pyruvate Oxidation (Link Reaction): Pyruvate enters the mitochondrial matrix, where it is converted into Acetyl-CoA, releasing CO2 and producing 1 NADH per pyruvate (2 NADH per glucose).
3. Citric Acid Cycle (Krebs Cycle): In the mitochondrial matrix. Acetyl-CoA combines with oxaloacetate to form citrate. Through cyclic redox reactions, it generates 2 ATP (or GTP), 6 NADH, 2 FADH2, and 4 CO2 per glucose molecule.
4. Oxidative Phosphorylation & Electron Transport Chain (ETC): Located in the inner mitochondrial membrane (cristae). High-energy electrons from NADH and FADH2 are transferred along protein complexes (Complexes I-IV). This pumps protons (H+) into the intermembrane space, creating an electrochemical proton gradient. Protons flow back down through ATP Synthase (Chemiosmosis) to generate roughly 26-28 ATP.

Total theoretical ATP yield per glucose molecule under ideal conditions is 30 to 32 ATP. Oxygen acts as the terminal electron acceptor in the ETC, reducing to form water (H2O).`,
    },
    {
      title: 'Keynesian Economics & Aggregate Demand',
      text: `Keynesian economics is a macroeconomic economic theory of total spending in the economy (aggregate demand) and its effects on output, employment, and inflation. Developed by John Maynard Keynes during the Great Depression.

Key Principles:
1. Aggregate Demand (AD) is the primary driving force in an economy. AD = C + I + G + (X - M), where C = Consumption, I = Investment, G = Government Spending, and (X - M) = Net Exports.
2. Sticky Wages and Prices: Unlike classical economics which assumes markets clear rapidly, Keynesian theory posits that wages and prices are rigid (sticky downwards) in the short run, preventing automatic return to full employment.
3. The Fiscal Multiplier: An initial increase in government spending (G) leads to a more-than-proportional increase in total national output (GDP) because money circulates through subsequent rounds of consumption. Multiplier = 1 / (1 - Marginal Propensity to Consume).
4. Counter-Cyclical Fiscal Policy: Governments should actively manage economic cycles. During recessions, governments should stimulate demand via expansionary fiscal policy (increased public spending, tax cuts), even if it creates budget deficits. During inflationary booms, governments should pursue contractionary policy to prevent overheating.`,
    },
  ];

  const [summaryResult, setSummaryResult] = useState<NotesSummary | null>({
    title: 'Computer Memory Hierarchy & Caching',
    rawTextLength: 1340,
    createdAt: new Date().toISOString(),
    executiveSummary: 'The memory hierarchy optimizes computer performance by trading off speed, cost, and storage capacity across registers, SRAM caches, DRAM main memory, and secondary storage. The entire caching architecture relies on the Locality of Reference principle (temporal and spatial locality) to achieve near-SRAM speeds on large DRAM capacities.',
    keyTakeaways: [
      'Registers and CPU Caches (L1/L2/L3) provide sub-nanosecond to 20ns latency on-die, while DRAM main memory operates at 50-100ns.',
      'Temporal Locality states recently accessed memory will likely be accessed again shortly (e.g., loops).',
      'Spatial Locality states adjacent memory addresses will likely be accessed sequentially (e.g., array traversals).',
      'The 3 Cs of Cache Misses are Compulsory (cold start), Capacity (cache too small), and Conflict (collision in mapped sets).',
      'Secondary storage (SSD/HDD) provides non-volatile gigabyte-to-terabyte capacity with microsecond to millisecond latency.',
    ],
    coreDefinitions: [
      {
        term: 'Temporal Locality',
        definition: 'The reuse of specific data and resources within a relatively small time duration.',
      },
      {
        term: 'Spatial Locality',
        definition: 'The use of data elements situated within relatively close storage locations.',
      },
      {
        term: 'Compulsory Miss',
        definition: 'A cache miss that occurs on the initial reference to a block of data that has never been loaded.',
      },
      {
        term: 'SRAM vs DRAM',
        definition: 'SRAM (Static RAM) is faster, transistor-based, and used for CPU caches; DRAM (Dynamic RAM) requires periodic capacitor refresh and forms main memory.',
      },
    ],
    importantExamPoints: [
      'High-probability exam question: Differentiate Temporal vs Spatial locality with concrete code examples (e.g., while-loop accumulator vs 1D array traversal).',
      'Memorize the 3 types of cache misses: Compulsory, Capacity, and Conflict.',
      'Remember latency scaling: Registers (<1ns) -> Caches (1-20ns) -> DRAM (50-100ns) -> SSD (10-100μs) -> HDD (5-10ms).',
      'Understand how direct-mapped vs set-associative cache placement impacts conflict misses.',
    ],
    suggestedReviewQuestions: [
      'How does matrix multiplication code order (row-major vs column-major) affect cache hit rates due to spatial locality?',
      'Why can a fully associative cache eliminate conflict misses?',
      'What hardware mechanism enables virtual memory address translation without significant latency penalty?',
    ],
  });

  const handleSummarize = async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/summarizer/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title: title.trim() || 'Lecture Notes Summary',
          summaryLength,
        }),
      });

      if (!res.ok) throw new Error('Failed to summarize notes');

      const data: NotesSummary = await res.json();
      setSummaryResult(data);
      if (onEarnXp) onEarnXp(30);
    } catch (err) {
      console.error('Summarize error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (sample: { title: string; text: string }) => {
    setTitle(sample.title);
    setContent(sample.text);
  };

  const handleCopySummary = () => {
    if (!summaryResult) return;
    const text = `# ${summaryResult.title} - Study Summary\n\n` +
      `## Executive Summary\n${summaryResult.executiveSummary}\n\n` +
      `## Key Takeaways\n${summaryResult.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\n` +
      `## Key Definitions\n${summaryResult.coreDefinitions.map((d) => `**${d.term}**: ${d.definition}`).join('\n')}\n\n` +
      `## High-Yield Exam Points\n${summaryResult.importantExamPoints.map((p) => `- ${p}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Input Header & Form */}
      <div className="bg-[#131926] p-6 rounded-3xl border border-[#1E293B] shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-800/40">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            AI Notes Summarizer
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
            High-Yield Academic Notes Distillation
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Paste lecture notes, textbook passages, or slides to extract executive summaries, core vocabulary, and critical exam points.
          </p>
        </div>

        {/* Preset Sample Notes Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-[#94A3B8] shrink-0">Sample Notes:</span>
          {sampleNotes.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(s)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#182030] hover:bg-[#202C40] text-[#CBD5E1] hover:text-emerald-300 border border-[#222F46] transition-colors font-medium"
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSummarize();
          }}
          className="space-y-4 pt-1"
        >
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#94A3B8]">Subject / Notes Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4: Database Indexing, Cell Biology Lecture 2..."
              className="w-full bg-[#161F30] border border-[#26354D] rounded-2xl px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#94A3B8]">Study Notes Content</label>
              <span className="text-[11px] text-[#64748B]">{content.length} characters</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw notes, textbook excerpt, article, or lecture transcript here..."
              rows={6}
              className="w-full bg-[#161F30] border border-[#26354D] rounded-2xl p-3.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-normal leading-relaxed"
            />
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#94A3B8]">Summary Format:</span>
              {(['concise', 'standard', 'comprehensive'] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setSummaryLength(len)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all border ${
                    summaryLength === len
                      ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
                      : 'bg-[#182030] text-[#94A3B8] border-[#222F46] hover:bg-[#202C40] hover:text-[#F8FAFC]'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {content && (
                <button
                  type="button"
                  onClick={() => {
                    setContent('');
                    setTitle('');
                  }}
                  className="px-3 py-2 text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/30 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                disabled={!content.trim() || isLoading}
                className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Distilling Notes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Summarize Notes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Summary Results */}
      {summaryResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Header Action Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#102319] border border-[#1C4731] p-4 rounded-2xl">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Distilled Summary</span>
              <h3 className="text-lg font-bold text-[#F8FAFC]">{summaryResult.title}</h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopySummary}
                className="px-3 py-1.5 bg-[#182030] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#26354D] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Summary!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Summary</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onGenerateFlashcardsFromNotes(content || summaryResult.executiveSummary, summaryResult.title)}
                className="px-3 py-1.5 bg-[#182030] text-amber-300 hover:bg-[#202C40] border border-amber-800/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Create Flashcards</span>
              </button>

              <button
                onClick={() => onGenerateQuizFromNotes(content || summaryResult.executiveSummary, summaryResult.title)}
                className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Generate Quiz</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="bg-[#131926] p-6 rounded-3xl border border-[#1E293B] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <BookOpen className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Executive TL;DR Summary</h4>
            </div>
            <p className="text-sm sm:text-base text-[#F8FAFC] leading-relaxed font-normal">
              {summaryResult.executiveSummary}
            </p>
          </div>

          {/* Section 2: Core Key Takeaways */}
          <div className="bg-[#131926] p-6 rounded-3xl border border-[#1E293B] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <BookmarkCheck className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">Crucial Key Takeaways</h4>
            </div>
            <ul className="space-y-3">
              {summaryResult.keyTakeaways.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#CBD5E1]">
                  <span className="w-5 h-5 rounded-full bg-emerald-950/60 text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-emerald-800/40">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Core Definitions / Glossary Table */}
          {summaryResult.coreDefinitions && summaryResult.coreDefinitions.length > 0 && (
            <div className="bg-[#131926] p-6 rounded-3xl border border-[#1E293B] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileCheck2 className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">Key Vocabulary & Definitions</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {summaryResult.coreDefinitions.map((def, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl bg-[#182030] border border-[#222F46] space-y-1"
                  >
                    <span className="text-xs font-bold text-emerald-400 block">{def.term}</span>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{def.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: High-Yield Exam Points */}
          <div className="bg-amber-950/20 p-6 rounded-3xl border border-amber-800/30 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">High-Yield Exam Points & Pitfalls</h4>
            </div>

            <ul className="space-y-2.5">
              {summaryResult.importantExamPoints.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-100/90 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}

    </div>
  );
};
