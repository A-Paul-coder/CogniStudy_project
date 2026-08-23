export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ActiveTab = 'dashboard' | 'tutor' | 'explainer' | 'summarizer' | 'quiz' | 'flashcards';

export interface User {
  id: string;
  name: string;
  email: string;
  gradeOrMajor: string;
  studyStreak: number;
  xpPoints: number;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  difficulty?: DifficultyLevel;
  suggestedFollowUps?: string[];
  keyTakeaway?: string;
}

export interface ConceptExplanation {
  topic: string;
  subject: string;
  difficulty: DifficultyLevel;
  shortDefinition: string;
  deepExplanation: string;
  analogyOrExample: string;
  keyPoints: string[];
  commonMisconceptions?: string[];
  revisionChecklist: string[];
  suggestedQuizQuestions?: string[];
}

export interface NotesSummary {
  title: string;
  rawTextLength: number;
  executiveSummary: string;
  keyTakeaways: string[];
  coreDefinitions: { term: string; definition: string }[];
  importantExamPoints: string[];
  suggestedReviewQuestions: string[];
  createdAt: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: DifficultyLevel;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  topic: string;
  difficulty: DifficultyLevel;
  totalQuestions: number;
  score: number;
  percentage: number;
  selectedAnswers: Record<number, number>;
  timeSpentSeconds: number;
  completedAt: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  category?: string;
  mastered?: boolean;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  topic: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'chat' | 'concept' | 'summary' | 'quiz' | 'flashcard';
  title: string;
  description: string;
  timestamp: string;
  scoreOrMetric?: string;
}

export interface StudentStats {
  topicsExploredCount: number;
  quizzesCompletedCount: number;
  averageQuizScore: number;
  flashcardsMasteredCount: number;
  totalFlashcardsCount: number;
  studyTimeMinutes: number;
  streakDays: number;
  xpPoints: number;
}
