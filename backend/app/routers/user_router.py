from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, LoginRequest, UserResponse
from app.models.user import User as UserModel
from app.utils.database import get_db
from app.utils.auth import hash_password, create_access_token, verify_password

router = APIRouter(tags=["Users"])

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="L'email existe déjà.")

    hashed_password = hash_password(user.password)
    new_user = UserModel(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse(
        id=new_user.user_id,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        email=new_user.email
    )

@router.post("/login")
def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == request.email).first()
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}