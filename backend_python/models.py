"""
SQLAlchemy ORM Models for AI Study Buddy
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    grade_or_major = Column(String, default="General Studies")
    study_streak = Column(Integer, default=1)
    xp_points = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")
    flashcard_decks = relationship("FlashcardDeck", back_populates="user", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String, nullable=False)  # chat, concept, summary, quiz, flashcard
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    metric = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activities")


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    quiz_title = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    difficulty = Column(String, default="intermediate")
    total_questions = Column(Integer, nullable=False)
    score = Column(Integer, nullable=False)
    percentage = Column(Integer, nullable=False)
    time_spent_seconds = Column(Integer, default=60)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quiz_results")


class FlashcardDeck(Base):
    __tablename__ = "flashcard_decks"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    cards = relationship("Flashcard", back_populates="deck", cascade="all, delete-orphan")
    user = relationship("User", back_populates="flashcard_decks")


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(String, primary_key=True, index=True)
    deck_id = Column(String, ForeignKey("flashcard_decks.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    hint = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    is_mastered = Column(Boolean, default=False)

    deck = relationship("FlashcardDeck", back_populates="cards")


class NoteSummary(Base):
    __tablename__ = "note_summaries"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    raw_content = Column(Text, nullable=False)
    summary_json = Column(Text, nullable=False)  # JSON-encoded summary details
    created_at = Column(DateTime, default=datetime.utcnow)
