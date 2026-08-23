"""
Pydantic Schemas for AI Study Buddy (Request & Response validation)
"""
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    grade_or_major: Optional[str] = "General Studies"


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(UserBase):
    id: str
    study_streak: int
    xp_points: int
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# AI Tutor Chat Schemas
class TutorChatRequest(BaseModel):
    message: str
    difficulty: Optional[str] = "intermediate"  # beginner, intermediate, advanced
    subject: Optional[str] = "General Academics"
    conversation_history: Optional[List[Dict[str, str]]] = []


class TutorChatResponse(BaseModel):
    role: str = "assistant"
    content: str
    keyTakeaway: str
    suggestedFollowUps: List[str]
    difficulty: str


# Concept Explainer Schemas
class ExplainerRequest(BaseModel):
    topic: str
    subject: Optional[str] = "General"
    difficulty: Optional[str] = "intermediate"


class ExplainerResponse(BaseModel):
    topic: str
    subject: str
    difficulty: str
    shortDefinition: str
    deepExplanation: str
    analogyOrExample: str
    keyPoints: List[str]
    commonMisconceptions: Optional[List[str]] = []
    revisionChecklist: List[str]
    suggestedQuizQuestions: Optional[List[str]] = []


# Notes Summarizer Schemas
class SummarizerRequest(BaseModel):
    title: Optional[str] = "Study Notes"
    content: str
    summaryLength: Optional[str] = "standard"


class DefinitionItem(BaseModel):
    term: str
    definition: str


class SummarizerResponse(BaseModel):
    title: str
    rawTextLength: int
    executiveSummary: str
    keyTakeaways: List[str]
    coreDefinitions: List[DefinitionItem]
    importantExamPoints: List[str]
    suggestedReviewQuestions: List[str]
    createdAt: str


# Quiz Schemas
class QuizGenerateRequest(BaseModel):
    topic: Optional[str] = None
    notesContext: Optional[str] = None
    difficulty: Optional[str] = "intermediate"
    questionCount: Optional[int] = 5


class QuizQuestionItem(BaseModel):
    id: int
    question: str
    options: List[str]
    correctAnswerIndex: int
    explanation: str


class QuizResponse(BaseModel):
    id: str
    title: str
    topic: str
    difficulty: str
    questions: List[QuizQuestionItem]
    createdAt: str


class QuizSubmitRequest(BaseModel):
    quizId: str
    quizTitle: str
    topic: str
    difficulty: str
    totalQuestions: int
    score: int
    timeSpentSeconds: Optional[int] = 60


# Flashcard Schemas
class FlashcardGenerateRequest(BaseModel):
    topic: Optional[str] = None
    notesContext: Optional[str] = None
    cardCount: Optional[int] = 6


class FlashcardItem(BaseModel):
    id: str
    question: str
    answer: str
    hint: Optional[str] = None
    category: Optional[str] = None
    mastered: Optional[bool] = False


class FlashcardDeckResponse(BaseModel):
    id: str
    title: str
    topic: str
    cards: List[FlashcardItem]
    createdAt: str


class FlashcardMasteryUpdate(BaseModel):
    deckId: str
    cardId: str
    mastered: bool


# Dashboard Schemas
class StudentStats(BaseModel):
    topicsExploredCount: int
    quizzesCompletedCount: int
    averageQuizScore: int
    flashcardsMasteredCount: int
    totalFlashcardsCount: int
    studyTimeMinutes: int
    streakDays: int
    xpPoints: int


class ActivityResponse(BaseModel):
    id: str
    type: str
    title: str
    description: str
    timestamp: str
    scoreOrMetric: Optional[str] = None
