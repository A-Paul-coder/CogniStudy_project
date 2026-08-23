# AI Study Buddy - Python & FastAPI Backend

This is the complete, modular Python backend for the **AI Study Buddy** web application.

## 🚀 Key Features

1. **AI Tutor Chat**: Academic Q&A with dynamic difficulty level scaling (Beginner, Intermediate, Advanced) and step-by-step reasoning.
2. **Concept Explainer**: Structural concept breakdown, real-world analogies, core key points, and revision checklists.
3. **Notes Summarizer**: Multi-tier study notes distillation, vocabulary glossary generation, and high-yield exam takeaways.
4. **AI Quiz Generator**: Real-time MCQ generator with customized question counts, instant scoring, and educational rationales.
5. **Flashcard Deck Generator**: Spaced repetition flashcards with interactive front/back flip and mastery tracking.
6. **Student Dashboard & Analytics**: SQLite persistence for study streaks, XP points, quiz histories, and learning logs.
7. **Secure Auth**: JWT Bearer token authentication with password hashing via passlib/bcrypt.

---

## 🛠️ Project Structure

```
backend_python/
├── database.py              # SQLite + SQLAlchemy session setup
├── models.py                # Relational DB models (Users, Quizzes, Flashcards, Activities)
├── schemas.py               # Pydantic request/response validation schemas
├── auth.py                  # JWT authentication & security helpers
├── ai_service.py            # Gemini API integration via google-genai
├── routers/
│   ├── auth_routes.py       # User registration, login, and profile
│   └── feature_routes.py    # Tutor, Explainer, Summarizer, Quiz, Flashcards, Dashboard
├── main.py                  # FastAPI entrypoint and CORS middleware
├── requirements.txt         # Python dependencies
└── README.md                # Documentation & Setup guide
```

---

## ⚙️ Quickstart Setup

### 1. Create and activate a Python virtual environment
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure your API key
Set your Gemini API key:
```bash
export GEMINI_API_KEY="your-gemini-api-key"
# On Windows PowerShell:
$env:GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Run the FastAPI server
```bash
uvicorn main:app --reload --port 8000
```

### 5. Interactive Swagger API Documentation
Open your browser to:
`http://localhost:8000/docs` or `http://localhost:8000/redoc`
