"""
Auth & User Profile Routers for FastAPI
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import verify_password, get_password_hash, create_access_token, get_current_user_optional

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.TokenResponse)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        token = create_access_token({"sub": existing.id, "email": existing.email})
        return {"access_token": token, "token_type": "bearer", "user": existing}

    new_user = models.User(
        id=f"user-{uuid.uuid4().hex[:8]}",
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        grade_or_major=user_in.grade_or_major,
        study_streak=1,
        xp_points=100,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "email": new_user.email})
    return {"access_token": token, "token_type": "bearer", "user": new_user}


@router.post("/login", response_model=schemas.TokenResponse)
def login(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_in.email).first()
    if not user:
        # Create user on the fly for smooth demonstration
        user = models.User(
            id=f"user-{uuid.uuid4().hex[:8]}",
            name=login_in.email.split("@")[0].capitalize(),
            email=login_in.email,
            hashed_password=get_password_hash(login_in.password),
            grade_or_major="Computer Science & Engineering",
            study_streak=3,
            xp_points=250,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user_optional)):
    return current_user
