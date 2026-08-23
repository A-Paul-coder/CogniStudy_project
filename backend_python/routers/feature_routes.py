"""
Feature Routers for AI Study Buddy (Tutor, Explainer, Summarizer, Quiz, Flashcards, Dashboard)
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user_optional
import ai_service

# 1. Tutor Router
tutor_router = APIRouter(prefix="/api/tutor", tags=["AI Tutor"])

@tutor_router.post("/chat", response_model=schemas.TutorChatResponse)
async def tutor_chat(
    req: schemas.TutorChatRequest,
    current_user: models.User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    try:
        result = await ai_service.generate_tutor_response(
            message=req.message,
            difficulty=req.difficulty or "intermediate",
            subject=req.subject or "General Academics",
            history=req.conversation_history
        )
        # Log activity
        act = models.Activity(
            id=f"act-{uuid.uuid4().hex[:8]}",
            user_id=current_user.id,
            activity_type="chat",
            title=f"Asked Tutor: {req.message[:30]}...",
            description=f"Received {req.difficulty} guidance on {req.subject}.",
            metric="Tutor Q&A"
        )
        current_user.xp_points += 25
        db.add(act)
        db.commit()

        return {
            "role": "assistant",
            "content": result.get("content", ""),
            "keyTakeaway": result.get("keyTakeaway", ""),
            "suggestedFollowUps": result.get("suggestedFollowUps", []),
            "difficulty": req.difficulty or "intermediate"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 2. Explainer Router
explainer_router = APIRouter(prefix="/api/explainer", tags=["Concept Explainer"])

@explainer_router.post("/generate", response_model=schemas.ExplainerResponse)
async def explain_concept(
    req: schemas.ExplainerRequest,
    current_user: models.User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    try:
        result = await ai_service.generate_concept_explanation(
            topic=req.topic,
            subject=req.subject or "General",
            difficulty=req.difficulty or "intermediate"
        )
        act = models.Activity(
            id=f"act-{uuid.uuid4().hex[:8]}",
            user_id=current_user.id,
            activity_type="concept",
            title=f"Explored Concept: {req.topic}",
            description=f"Generated deep explanation & revision checklist for {req.subject}.",
            metric="Concept Mastered"
        )
        current_user.xp_points += 40
        db.add(act)
        db.commit()

        return {
            "topic": req.topic,
            "subject": req.subject or "General",
            "difficulty": req.difficulty or "intermediate",
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 3. Summarizer Router
summarizer_router = APIRouter(prefix="/api/summarizer", tags=["Notes Summarizer"])

@summarizer_router.post("/summarize", response_model=schemas.SummarizerResponse)
async def summarize_notes(
    req: schemas.SummarizerRequest,
    current_user: models.User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    try:
        result = await ai_service.generate_notes_summary(
            content=req.content,
            title=req.title or "Study Notes",
            summary_length=req.summaryLength or "standard"
        )
        act = models.Activity(
            id=f"act-{uuid.uuid4().hex[:8]}",
            user_id=current_user.id,
            activity_type="summary",
            title=f"Summarized: {req.title}",
            description=f"Distilled material into executive takeaways and exam points.",
            metric="Notes Distilled"
        )
        current_user.xp_points += 30
        db.add(act)
        db.commit()

        return {
            "title": req.title or "Study Notes",
            "rawTextLength": len(req.content),
            "createdAt": datetime.utcnow().isoformat(),
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 4. Quiz Router
quiz_router = APIRouter(prefix="/api/quiz", tags=["Quiz Generator"])

@quiz_router.post("/generate", response_model=schemas.QuizResponse)
async def generate_quiz(
    req: schemas.QuizGenerateRequest
):
    try:
        result = await ai_service.generate_quiz_questions(
            topic=req.topic or "Study Topic",
            notes_context=req.notesContext or "",
            difficulty=req.difficulty or "intermediate",
            count=req.questionCount or 5
        )
        quiz_id = f"quiz-{uuid.uuid4().hex[:8]}"
        return {
            "id": quiz_id,
            "title": result.get("title", f"{req.topic} Quiz"),
            "topic": req.topic or "Custom",
            "difficulty": req.difficulty or "intermediate",
            "questions": result.get("questions", []),
            "createdAt": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@quiz_router.post("/submit")
def submit_quiz(
    req: schemas.QuizSubmitRequest,
    current_user: models.User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    percentage = round((req.score / req.totalQuestions) * 100) if req.totalQuestions > 0 else 0
    res = models.QuizResult(
        id=f"qr-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        quiz_title=req.quizTitle,
        topic=req.topic,
        difficulty=req.difficulty,
        total_questions=req.totalQuestions,
        score=req.score,
        percentage=percentage,
        time_spent_seconds=req.timeSpentSeconds or 60
    )
    act = models.Activity(
        id=f"act-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        activity_type="quiz",
        title=f"Completed Quiz: {req.quizTitle}",
        description=f"Scored {req.score}/{req.totalQuestions} ({percentage}%).",
        metric=f"{percentage}%"
    )
    current_user.xp_points += req.score * 20 + 30
    db.add(res)
    db.add(act)
    db.commit()
    return {"success": True, "score": req.score, "percentage": percentage}


# 5. Flashcards Router
flashcard_router = APIRouter(prefix="/api/flashcards", tags=["Flashcards"])

@flashcard_router.post("/generate", response_model=schemas.FlashcardDeckResponse)
async def generate_flashcards_deck(
    req: schemas.FlashcardGenerateRequest,
    current_user: models.User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    try:
        result = await ai_service.generate_flashcards(
            topic=req.topic or "Key Terms",
            notes_context=req.notesContext or "",
            count=req.cardCount or 6
        )
        deck_id = f"deck-{uuid.uuid4().hex[:8]}"
        deck = models.FlashcardDeck(
            id=deck_id,
            user_id=current_user.id,
            title=result.get("title", f"{req.topic} Flashcards"),
            topic=req.topic or "General"
        )
        db.add(deck)
        
        cards_list = []
        for idx, c in enumerate(result.get("cards", [])):
            card = models.Flashcard(
                id=f"card-{deck_id}-{idx+1}",
                deck_id=deck_id,
                question=c.get("question", ""),
                answer=c.get("answer", ""),
                hint=c.get("hint", ""),
                category=c.get("category", req.topic),
                is_mastered=False
            )
            db.add(card)
            cards_list.append({
                "id": card.id,
                "question": card.question,
                "answer": card.answer,
                "hint": card.hint,
                "category": card.category,
                "mastered": False
            })

        act = models.Activity(
            id=f"act-{uuid.uuid4().hex[:8]}",
            user_id=current_user.id,
            activity_type="flashcard",
            title=f"Deck: {deck.title}",
            description=f"Created {len(cards_list)} spaced-repetition flashcards.",
            metric=f"{len(cards_list)} Cards"
        )
        current_user.xp_points += 35
        db.add(act)
        db.commit()

        return {
            "id": deck.id,
            "title": deck.title,
            "topic": deck.topic,
            "cards": cards_list,
            "createdAt": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@flashcard_router.post("/update-mastery")
def update_mastery(
    req: schemas.FlashcardMasteryUpdate,
    db: Session = Depends(get_db)
):
    card = db.query(models.Flashcard).filter(models.Flashcard.id == req.cardId).first()
    if card:
        card.is_mastered = req.mastered
        db.commit()
    return {"success": True}


# 6. Dashboard Router
dashboard_router = APIRouter(prefix="/api/dashboard", tags=["Student Dashboard"])

@dashboard_router.get("/stats")
def get_dashboard_stats(
    current_user: models.User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    quizzes = db.query(models.QuizResult).filter(models.QuizResult.user_id == current_user.id).all()
    activities = db.query(models.Activity).filter(models.Activity.user_id == current_user.id).order_by(models.Activity.created_at.desc()).all()
    decks = db.query(models.FlashcardDeck).filter(models.FlashcardDeck.user_id == current_user.id).all()

    total_q = sum(q.total_questions for q in quizzes)
    total_score = sum(q.score for q in quizzes)
    avg_score = round((total_score / total_q) * 100) if total_q > 0 else 88

    total_cards = sum(len(d.cards) for d in decks)
    mastered_cards = sum(sum(1 for c in d.cards if c.is_mastered) for d in decks)

    study_minutes = sum(round(q.time_spent_seconds / 60) for q in quizzes) + len(activities) * 8

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "gradeOrMajor": current_user.grade_or_major,
            "studyStreak": current_user.study_streak,
            "xpPoints": current_user.xp_points,
            "joinedAt": current_user.created_at.isoformat()
        },
        "stats": {
            "topicsExploredCount": len([a for a in activities if a.activity_type in ["concept", "summary"]]) + 4,
            "quizzesCompletedCount": len(quizzes),
            "averageQuizScore": avg_score,
            "flashcardsMasteredCount": mastered_cards,
            "totalFlashcardsCount": max(total_cards, 10),
            "studyTimeMinutes": max(study_minutes, 45),
            "streakDays": current_user.study_streak,
            "xpPoints": current_user.xp_points
        },
        "recentActivities": [
            {
                "id": a.id,
                "type": a.activity_type,
                "title": a.title,
                "description": a.description,
                "timestamp": a.created_at.isoformat(),
                "scoreOrMetric": a.metric
            }
            for a in activities[:10]
        ]
    }
