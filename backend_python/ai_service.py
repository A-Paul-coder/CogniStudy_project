"""
AI Service Layer for AI Study Buddy (Google Gemini API via google-genai)
"""
import os
import json
from google import genai
from google.genai import types

# Initialize client lazily with environment variable
def get_ai_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")
    return genai.Client(api_key=api_key)


async def generate_tutor_response(
    message: str, difficulty: str = "intermediate", subject: str = "General Academics", history: list = None
) -> dict:
    client = get_ai_client()
    
    difficulty_guide = {
        "beginner": "Explain simply with intuitive analogies, minimal jargon, and focus on foundational intuition.",
        "intermediate": "Provide structured academic explanation with clear definitions, practical examples, and step-by-step logic.",
        "advanced": "Provide rigorous deep-dive explanations with nuanced mechanisms, mathematical/formal logic, and edge cases.",
    }.get(difficulty, "Provide a balanced academic explanation.")

    system_instruction = f"""You are an elite, empathetic AI Academic Tutor and Study Buddy.
Subject: {subject}
Student Level: {difficulty.upper()}

Guidelines:
1. {difficulty_guide}
2. Format the response cleanly in Markdown (use bolding, bullet points, numbered steps).
3. Conclude with 2-3 engaging follow-up questions the student can ask next.
4. Provide a single 1-sentence 'keyTakeaway'."""

    prompt = f"Student Question: {message}\n"
    if history:
        prompt += "\nChat History:\n" + "\n".join([f"{h.get('role', 'user')}: {h.get('content', '')}" for h in history[-4:]])

    response = client.models.generate_content(
        model="gemini-3.7-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
        ),
    )

    try:
        return json.loads(response.text)
    except Exception:
        return {
            "content": response.text,
            "keyTakeaway": "Mastering the core fundamentals unlocks complex problem-solving.",
            "suggestedFollowUps": [
                "Can you show a step-by-step example?",
                "What are common mistakes students make with this?",
                "How does this connect to other topics?",
            ],
        }


async def generate_concept_explanation(topic: str, subject: str = "General", difficulty: str = "intermediate") -> dict:
    client = get_ai_client()
    prompt = f"""Explain the topic '{topic}' in subject '{subject}' for a '{difficulty}' level student.
Return structured JSON with:
- shortDefinition (str): 1-2 sentence core definition
- deepExplanation (str): thorough conceptual explanation
- analogyOrExample (str): real-world analogy or practical example
- keyPoints (list[str]): 4-6 essential bullet points
- commonMisconceptions (list[str]): 2-3 common traps or misconceptions
- revisionChecklist (list[str]): 4-5 quick review items
- suggestedQuizQuestions (list[str]): 3 self-test questions"""

    response = client.models.generate_content(
        model="gemini-3.7-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    return json.loads(response.text)


async def generate_notes_summary(content: str, title: str = "Study Notes", summary_length: str = "standard") -> dict:
    client = get_ai_client()
    prompt = f"""Analyze the study notes and create a high-yield exam summary:
Title: {title}
Depth: {summary_length}

Material:
\"\"\"
{content}
\"\"\"

Return JSON with:
- executiveSummary (str)
- keyTakeaways (list[str])
- coreDefinitions (list of objects with 'term' and 'definition')
- importantExamPoints (list[str])
- suggestedReviewQuestions (list[str])"""

    response = client.models.generate_content(
        model="gemini-3.7-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    return json.loads(response.text)


async def generate_quiz_questions(topic: str, notes_context: str = "", difficulty: str = "intermediate", count: int = 5) -> dict:
    client = get_ai_client()
    prompt = f"""Generate a {count}-question multiple choice quiz on '{topic}'.
Difficulty: {difficulty}
Context: {notes_context}

Return JSON with:
- title (str)
- questions (list of objects with: id (int), question (str), options (list of 4 strings), correctAnswerIndex (int: 0-3), explanation (str))"""

    response = client.models.generate_content(
        model="gemini-3.7-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    return json.loads(response.text)


async def generate_flashcards(topic: str, notes_context: str = "", count: int = 6) -> dict:
    client = get_ai_client()
    prompt = f"""Generate {count} active-recall study flashcards on '{topic}'.
Context: {notes_context}

Return JSON with:
- title (str)
- cards (list of objects with: question (str), answer (str), hint (str), category (str))"""

    response = client.models.generate_content(
        model="gemini-3.7-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    return json.loads(response.text)
