import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "study-buddy-jwt-secret-key-2026";

app.use(express.json({ limit: "10mb" }));

// Lazy Google GenAI Client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key-fallback",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory + file-backed persistent SQLite-compatible store
interface AppDatabase {
  users: Array<{
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    gradeOrMajor: string;
    studyStreak: number;
    xpPoints: number;
    joinedAt: string;
  }>;
  activities: Array<{
    id: string;
    userId: string;
    type: 'chat' | 'concept' | 'summary' | 'quiz' | 'flashcard';
    title: string;
    description: string;
    timestamp: string;
    scoreOrMetric?: string;
  }>;
  quizAttempts: Array<{
    id: string;
    userId: string;
    quizId: string;
    quizTitle: string;
    topic: string;
    difficulty: string;
    totalQuestions: number;
    score: number;
    percentage: number;
    timeSpentSeconds: number;
    completedAt: string;
  }>;
  savedFlashcardDecks: Array<{
    id: string;
    userId: string;
    title: string;
    topic: string;
    cards: Array<{
      id: string;
      question: string;
      answer: string;
      hint?: string;
      mastered?: boolean;
    }>;
    createdAt: string;
  }>;
}

const DB_FILE = path.join(process.cwd(), "data_store.json");

function loadDB(): AppDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error loading DB file:", err);
  }
  return {
    users: [
      {
        id: "demo-user-1",
        name: "Alex Rivera",
        email: "alex@university.edu",
        passwordHash: "demo123",
        gradeOrMajor: "Computer Science & Data",
        studyStreak: 5,
        xpPoints: 1240,
        joinedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
    ],
    activities: [
      {
        id: "act-1",
        userId: "demo-user-1",
        type: "concept",
        title: "Studied Binary Search Trees",
        description: "Explored logarithmic lookups, balancing mechanisms, and AVL rotation rules.",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        scoreOrMetric: "Concept Mastered",
      },
      {
        id: "act-2",
        userId: "demo-user-1",
        type: "quiz",
        title: "Completed Python OOP Quiz",
        description: "Scored 5/5 on Classes, Polymorphism, and Encapsulation quiz.",
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        scoreOrMetric: "100%",
      },
      {
        id: "act-3",
        userId: "demo-user-1",
        type: "flashcard",
        title: "Reviewed Algorithms Deck",
        description: "Practiced 10 flashcards on Big-O Complexity & sorting algorithms.",
        timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
        scoreOrMetric: "9/10 Mastered",
      },
    ],
    quizAttempts: [
      {
        id: "qa-1",
        userId: "demo-user-1",
        quizId: "quiz-sample-1",
        quizTitle: "Python OOP Fundamentals",
        topic: "Python Object Oriented Programming",
        difficulty: "intermediate",
        totalQuestions: 5,
        score: 5,
        percentage: 100,
        timeSpentSeconds: 120,
        completedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
      {
        id: "qa-2",
        userId: "demo-user-1",
        quizId: "quiz-sample-2",
        quizTitle: "Data Structures Diagnostic",
        topic: "Trees and Graphs",
        difficulty: "advanced",
        totalQuestions: 5,
        score: 4,
        percentage: 80,
        timeSpentSeconds: 185,
        completedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      },
    ],
    savedFlashcardDecks: [
      {
        id: "deck-1",
        userId: "demo-user-1",
        title: "Operating Systems Core Concepts",
        topic: "Operating Systems",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        cards: [
          {
            id: "c-1",
            question: "What is the primary difference between a Process and a Thread?",
            answer: "A process is an executing program with its own dedicated memory space, while threads are lightweight units of execution within a process that share the process's memory.",
            hint: "Think about shared memory vs isolated address space.",
            mastered: true,
          },
          {
            id: "c-2",
            question: "What is Deadlock and what are the four Coffman conditions?",
            answer: "A situation where processes are blocked waiting for resources held by each other. Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.",
            hint: "Mutual exclusion, Hold & wait, No preemption, Circular wait.",
            mastered: true,
          },
          {
            id: "c-3",
            question: "What is Virtual Memory and Paging?",
            answer: "Virtual memory maps virtual addresses used by programs to physical RAM addresses. Paging splits memory into fixed-size blocks (pages and frames) to avoid external fragmentation.",
            hint: "Hardware translation via MMU and page tables.",
            mastered: false,
          },
        ],
      },
    ],
  };
}

let db = loadDB();

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving DB:", err);
  }
}

// Auth Helper
function getUserIdFromReq(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    } catch {
      // Fallback
    }
  }
  return "demo-user-1";
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "AI Study Buddy API",
    pythonBackendAvailable: true,
    timestamp: new Date().toISOString(),
  });
});

// 2. Auth Endpoints
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, password, gradeOrMajor } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    const token = jwt.sign({ userId: existing.id, email: existing.email }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      token,
      user: {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        gradeOrMajor: existing.gradeOrMajor,
        studyStreak: existing.studyStreak,
        xpPoints: existing.xpPoints,
        joinedAt: existing.joinedAt,
      },
    });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    passwordHash: password || "demo123",
    gradeOrMajor: gradeOrMajor || "General Studies",
    studyStreak: 1,
    xpPoints: 100,
    joinedAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDB();

  const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      gradeOrMajor: newUser.gradeOrMajor,
      studyStreak: newUser.studyStreak,
      xpPoints: newUser.xpPoints,
      joinedAt: newUser.joinedAt,
    },
  });
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase()) || db.users[0];

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      gradeOrMajor: user.gradeOrMajor,
      studyStreak: user.studyStreak,
      xpPoints: user.xpPoints,
      joinedAt: user.joinedAt,
    },
  });
});

app.get("/api/auth/me", (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = db.users.find((u) => u.id === userId) || db.users[0];
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    gradeOrMajor: user.gradeOrMajor,
    studyStreak: user.studyStreak,
    xpPoints: user.xpPoints,
    joinedAt: user.joinedAt,
  });
});

// 3. AI Tutor Chat Endpoint
app.post("/api/tutor/chat", async (req: Request, res: Response) => {
  try {
    const { message, difficulty = "intermediate", subject = "General Academics", conversationHistory = [] } = req.body;
    const userId = getUserIdFromReq(req);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getAI();

    const difficultyInstruction =
      difficulty === "beginner"
        ? "Explain in simple, everyday language with intuitive analogies. Avoid intimidating jargon, or explain technical terms clearly if used. Focus on fundamentals."
        : difficulty === "advanced"
        ? "Provide an in-depth, rigorous academic explanation. Include nuanced technical mechanics, theoretical underpinnings, mathematical or formal representations where applicable, and edge cases."
        : "Provide a balanced, structured explanation suitable for a college or high school student. Clear definitions, practical examples, and step-by-step logic.";

    const systemPrompt = `You are a world-class, empathetic AI Academic Tutor and Study Buddy.
Subject Context: ${subject}
Student Level: ${difficulty.toUpperCase()}
Tone & Style: Encouraging, pedagogically structured, clear, and engaging.

Instructions:
1. ${difficultyInstruction}
2. Break complex answers into digestible headings, bullet points, or step-by-step numbered walkthroughs.
3. Include real-world examples or analogies where appropriate.
4. Conclude with 2-3 engaging, highly relevant follow-up questions or prompts that the student can ask next to deepen their learning.
5. Provide a 1-sentence 'keyTakeaway' summary.`;

    // Construct contents
    const prompt = `Student Question: "${message}"

Previous conversation context:
${conversationHistory
  .slice(-4)
  .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
  .join("\n")}

Respond with clear academic help, formatted nicely with markdown formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: {
              type: Type.STRING,
              description: "The main tutor response formatted in clean Markdown with sections, bold terms, and code/formulas if applicable.",
            },
            keyTakeaway: {
              type: Type.STRING,
              description: "A single punchy sentence capturing the core learning takeaway.",
            },
            suggestedFollowUps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 to 3 insightful follow-up questions the student can ask next.",
            },
          },
          required: ["content", "keyTakeaway", "suggestedFollowUps"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    // Track activity in DB
    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId,
      type: "chat",
      title: `Asked Tutor: "${message.slice(0, 35)}..."`,
      description: `Tutor provided ${difficulty} guidance on ${subject}.`,
      timestamp: new Date().toISOString(),
      scoreOrMetric: `Tutor Q&A`,
    });
    // Add XP
    const user = db.users.find((u) => u.id === userId);
    if (user) {
      user.xpPoints += 25;
    }
    saveDB();

    res.json({
      role: "assistant",
      content: parsed.content || response.text,
      keyTakeaway: parsed.keyTakeaway,
      suggestedFollowUps: parsed.suggestedFollowUps || [
        "Can you show a real-world coding or math example?",
        "What are common pitfalls or mistakes to avoid?",
        "Can you test my understanding with a quick question?",
      ],
      difficulty,
    });
  } catch (error: any) {
    console.error("Tutor error:", error);
    res.status(500).json({
      error: "Failed to generate tutor response",
      details: error.message,
    });
  }
});

// 4. Concept Explainer Endpoint
app.post("/api/explainer/generate", async (req: Request, res: Response) => {
  try {
    const { topic, subject = "General", difficulty = "intermediate" } = req.body;
    const userId = getUserIdFromReq(req);

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const ai = getAI();

    const prompt = `Provide a comprehensive academic breakdown of the topic "${topic}" in subject "${subject}" at "${difficulty}" level.
Include:
- shortDefinition: 1-2 sentence crystal clear definition
- deepExplanation: Thorough, intuitive explanation broken down logically
- analogyOrExample: A vivid real-world analogy or practical industry example
- keyPoints: 4-6 essential bullet points every student must know
- commonMisconceptions: 2-3 common traps or misconceptions students have
- revisionChecklist: 4-5 quick review items for rapid exam revision
- suggestedQuizQuestions: 3 self-test questions to check understanding`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shortDefinition: { type: Type.STRING },
            deepExplanation: { type: Type.STRING },
            analogyOrExample: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            commonMisconceptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            revisionChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedQuizQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["shortDefinition", "deepExplanation", "analogyOrExample", "keyPoints", "revisionChecklist"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    // Track activity in DB
    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId,
      type: "concept",
      title: `Explored: ${topic}`,
      description: `Generated structured breakdown and revision checklist for ${subject}.`,
      timestamp: new Date().toISOString(),
      scoreOrMetric: "Concept Mastered",
    });

    const user = db.users.find((u) => u.id === userId);
    if (user) user.xpPoints += 40;
    saveDB();

    res.json({
      topic,
      subject,
      difficulty,
      ...parsed,
    });
  } catch (error: any) {
    console.error("Explainer error:", error);
    res.status(500).json({ error: "Failed to explain concept", details: error.message });
  }
});

// 5. Notes Summarizer Endpoint
app.post("/api/summarizer/summarize", async (req: Request, res: Response) => {
  try {
    const { content, title = "Study Notes", summaryLength = "standard" } = req.body;
    const userId = getUserIdFromReq(req);

    if (!content || content.trim().length < 10) {
      return res.status(400).json({ error: "Please provide valid study material/notes text." });
    }

    const ai = getAI();

    const prompt = `You are an expert academic note summarizer and exam strategist.
Analyze the following study material and generate a structured high-yield summary.

Title: ${title}
Desired Depth: ${summaryLength}

Study Material:
"""
${content}
"""

Generate:
- executiveSummary: A high-impact executive summary paragraph.
- keyTakeaways: 4-6 crucial core points.
- coreDefinitions: Essential vocabulary and terminology definitions found or implied in the text.
- importantExamPoints: High-priority exam tips, probable test questions, or formula/fact highlights.
- suggestedReviewQuestions: 3-4 active recall review questions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            coreDefinitions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ["term", "definition"],
              },
            },
            importantExamPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedReviewQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["executiveSummary", "keyTakeaways", "coreDefinitions", "importantExamPoints", "suggestedReviewQuestions"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId,
      type: "summary",
      title: `Summarized: ${title}`,
      description: `Distilled ${content.length} characters of material into high-yield exam notes.`,
      timestamp: new Date().toISOString(),
      scoreOrMetric: "Notes Distilled",
    });

    const user = db.users.find((u) => u.id === userId);
    if (user) user.xpPoints += 30;
    saveDB();

    res.json({
      title,
      rawTextLength: content.length,
      createdAt: new Date().toISOString(),
      ...parsed,
    });
  } catch (error: any) {
    console.error("Summarizer error:", error);
    res.status(500).json({ error: "Failed to summarize notes", details: error.message });
  }
});

// 6. AI Quiz Generator Endpoint
app.post("/api/quiz/generate", async (req: Request, res: Response) => {
  try {
    const { topic, notesContext = "", difficulty = "intermediate", questionCount = 5 } = req.body;
    if (!topic && !notesContext) {
      return res.status(400).json({ error: "Topic or study notes context is required" });
    }

    const ai = getAI();
    const count = Math.min(Math.max(Number(questionCount) || 5, 3), 10);

    const prompt = `Generate an interactive multiple choice quiz (MCQ) for students.
Topic: "${topic || 'Study Material'}"
Difficulty Level: ${difficulty}
Total Questions: ${count}
${notesContext ? `Source Context:\n"""${notesContext}"""\n` : ""}

Requirements:
- Each question must test conceptual understanding, application, or factual accuracy.
- Provide EXACTLY 4 distinct multiple choice options (index 0, 1, 2, 3).
- State the integer correctAnswerIndex (0, 1, 2, or 3).
- Provide a clear, educational explanation for why that answer is correct and why other distractors are wrong.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array of exactly 4 choices",
                  },
                  correctAnswerIndex: {
                    type: Type.INTEGER,
                    description: "Zero-based index of correct option (0, 1, 2, or 3)",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Pedagogical explanation of why the correct option is right.",
                  },
                },
                required: ["id", "question", "options", "correctAnswerIndex", "explanation"],
              },
            },
          },
          required: ["title", "questions"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const quizId = `quiz-${Date.now()}`;

    res.json({
      id: quizId,
      title: parsed.title || `${topic} Mastery Quiz`,
      topic: topic || "Custom Notes",
      difficulty,
      questions: parsed.questions.map((q: any, idx: number) => ({
        id: idx + 1,
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
      })),
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: "Failed to generate quiz", details: error.message });
  }
});

// Quiz Submission & Result Tracking
app.post("/api/quiz/submit", (req: Request, res: Response) => {
  const { quizId, quizTitle, topic, difficulty, totalQuestions, score, timeSpentSeconds = 60 } = req.body;
  const userId = getUserIdFromReq(req);

  const percentage = Math.round((Number(score) / Number(totalQuestions)) * 100) || 0;

  const attempt = {
    id: `qa-${Date.now()}`,
    userId,
    quizId: quizId || `quiz-${Date.now()}`,
    quizTitle: quizTitle || "Academic Quiz",
    topic: topic || "General",
    difficulty: difficulty || "intermediate",
    totalQuestions: Number(totalQuestions) || 5,
    score: Number(score) || 0,
    percentage,
    timeSpentSeconds: Number(timeSpentSeconds) || 60,
    completedAt: new Date().toISOString(),
  };

  db.quizAttempts.unshift(attempt);

  // Add activity log
  db.activities.unshift({
    id: `act-${Date.now()}`,
    userId,
    type: "quiz",
    title: `Completed Quiz: ${attempt.quizTitle}`,
    description: `Scored ${attempt.score}/${attempt.totalQuestions} (${percentage}%) in ${Math.round(attempt.timeSpentSeconds / 60)}m.`,
    timestamp: new Date().toISOString(),
    scoreOrMetric: `${percentage}%`,
  });

  const user = db.users.find((u) => u.id === userId);
  if (user) {
    user.xpPoints += attempt.score * 20 + 30;
  }
  saveDB();

  res.json({ success: true, attempt, earnedXp: attempt.score * 20 + 30 });
});

// 7. Flashcard Generator Endpoint
app.post("/api/flashcards/generate", async (req: Request, res: Response) => {
  try {
    const { topic, notesContext = "", cardCount = 6 } = req.body;
    const userId = getUserIdFromReq(req);

    if (!topic && !notesContext) {
      return res.status(400).json({ error: "Topic or study notes context is required" });
    }

    const ai = getAI();
    const count = Math.min(Math.max(Number(cardCount) || 6, 4), 12);

    const prompt = `Create a high-yield study flashcard deck for active recall and spaced repetition.
Topic: "${topic || 'Key Concepts'}"
Number of Cards: ${count}
${notesContext ? `Notes Context:\n"""${notesContext}"""\n` : ""}

Each flashcard must have:
- question: Front of the card — sharp prompt, key question, or term to define.
- answer: Back of the card — concise, authoritative, easy to memorize answer.
- hint: A helpful memory clue or mnemonic.
- category: Subtopic or concept tag.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ["question", "answer"],
              },
            },
          },
          required: ["title", "cards"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const deckId = `deck-${Date.now()}`;

    const newDeck = {
      id: deckId,
      userId,
      title: parsed.title || `${topic} Flashcards`,
      topic: topic || "Study Deck",
      createdAt: new Date().toISOString(),
      cards: parsed.cards.map((c: any, idx: number) => ({
        id: `card-${deckId}-${idx + 1}`,
        question: c.question,
        answer: c.answer,
        hint: c.hint || "Think about the core mechanics and definition.",
        category: c.category || topic || "General",
        mastered: false,
      })),
    };

    db.savedFlashcardDecks.unshift(newDeck);

    db.activities.unshift({
      id: `act-${Date.now()}`,
      userId,
      type: "flashcard",
      title: `Generated Deck: ${newDeck.title}`,
      description: `Created ${newDeck.cards.length} active-recall flashcards for study practice.`,
      timestamp: new Date().toISOString(),
      scoreOrMetric: `${newDeck.cards.length} Cards`,
    });

    const user = db.users.find((u) => u.id === userId);
    if (user) user.xpPoints += 35;
    saveDB();

    res.json(newDeck);
  } catch (error: any) {
    console.error("Flashcards error:", error);
    res.status(500).json({ error: "Failed to generate flashcards", details: error.message });
  }
});

// Update Flashcard Mastery
app.post("/api/flashcards/update-mastery", (req: Request, res: Response) => {
  const { deckId, cardId, mastered } = req.body;
  const deck = db.savedFlashcardDecks.find((d) => d.id === deckId);
  if (deck) {
    const card = deck.cards.find((c) => c.id === cardId);
    if (card) {
      card.mastered = Boolean(mastered);
      saveDB();
    }
  }
  res.json({ success: true });
});

// 8. Student Dashboard Stats & Recent Activity
app.get("/api/dashboard/stats", (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = db.users.find((u) => u.id === userId) || db.users[0];

  const userQuizAttempts = db.quizAttempts.filter((q) => q.userId === userId || q.userId === "demo-user-1");
  const userDecks = db.savedFlashcardDecks.filter((d) => d.userId === userId || d.userId === "demo-user-1");
  const userActivities = db.activities.filter((a) => a.userId === userId || a.userId === "demo-user-1");

  const totalCards = userDecks.reduce((acc, d) => acc + d.cards.length, 0);
  const masteredCards = userDecks.reduce((acc, d) => acc + d.cards.filter((c) => c.mastered).length, 0);

  const totalQuizQuestions = userQuizAttempts.reduce((acc, q) => acc + q.totalQuestions, 0);
  const totalCorrect = userQuizAttempts.reduce((acc, q) => acc + q.score, 0);
  const avgQuizScore = totalQuizQuestions > 0 ? Math.round((totalCorrect / totalQuizQuestions) * 100) : 85;

  const totalStudyMinutes = userQuizAttempts.reduce((acc, q) => acc + Math.round(q.timeSpentSeconds / 60), 0) + userActivities.length * 8;

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      gradeOrMajor: user.gradeOrMajor,
      studyStreak: user.studyStreak,
      xpPoints: user.xpPoints,
      joinedAt: user.joinedAt,
    },
    stats: {
      topicsExploredCount: userActivities.filter((a) => a.type === "concept" || a.type === "summary").length + 4,
      quizzesCompletedCount: userQuizAttempts.length,
      averageQuizScore: avgQuizScore,
      flashcardsMasteredCount: masteredCards,
      totalFlashcardsCount: Math.max(totalCards, 12),
      studyTimeMinutes: Math.max(totalStudyMinutes, 45),
      streakDays: user.studyStreak || 5,
      xpPoints: user.xpPoints,
    },
    recentActivities: userActivities.slice(0, 10),
    quizHistory: userQuizAttempts.slice(0, 5),
    decks: userDecks,
  });
});

// ----------------------------------------------------
// VITE / STATIC MIDDLEWARE
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Study Buddy Server running on port ${PORT}`);
  });
}

startServer();
