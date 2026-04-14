from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User as UserModel
from ..schemas.user import UserCreate, LoginRequest, UserResponse, UserUpdate
from ..utils.auth import (
    get_current_user, 
    hash_password, 
    create_access_token, 
    verify_password
)

router = APIRouter(prefix="/users", tags=["Users"])

# --- HELPERS ---

def get_user_initials(first_name: str, last_name: str) -> str:
    """Calcule les initiales de l'utilisateur."""
    return f"{first_name[0].upper()}{last_name[0].upper()}" if first_name and last_name else ""

# --- ROUTES ---

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Vérifie si l'utilisateur existe déjà
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="L'email existe déjà.")

    # Création de l'utilisateur
    new_user = UserModel(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hash_password(user.password) # Sécurité : mot de passe haché
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Le token contient l'ID (sub) pour les futures requêtes
    token = create_access_token({"sub": str(new_user.user_id)})

    return {
        "user": {
            "id": new_user.user_id,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "email": new_user.email,
            "initials": get_user_initials(new_user.first_name, new_user.last_name),
        },
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/login")
def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == request.email).first()
    
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = create_access_token({"sub": str(user.user_id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "initials": get_user_initials(user.first_name, user.last_name),
        "user_id": user.user_id
    }

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: int = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.user_id == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return {
        "user_id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "initials": get_user_initials(user.first_name, user.last_name)
    }

@router.put("/update-account")
def update_account(
    user_update: UserUpdate, 
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(UserModel).filter(UserModel.user_id == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Mise à jour des champs (seulement s'ils sont fournis dans le schéma)
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    try:
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erreur lors de la mise à jour (email peut-être déjà utilisé)")

    # On régénère un token si l'email a changé (optionnel, mais recommandé)
    token = create_access_token({"sub": str(user.user_id)})

    return {
        "message": "Compte mis à jour",
        "user": {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "initials": get_user_initials(user.first_name, user.last_name)
        },
        "access_token": token
    }

@router.delete("/delete-account", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(current_user: int = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.user_id == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    db.delete(user)
    db.commit()
    return None

@router.post("/auth/validate-token")
def validate_token(current_user: int = Depends(get_current_user)):
    # Si get_current_user ne lève pas d'exception, le token est valide
    return {"status": "success", "message": "Token valide", "user_id": current_user}