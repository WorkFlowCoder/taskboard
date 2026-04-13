from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, LoginRequest, UserResponse, UserUpdate
from app.models.user import User as UserModel
from app.utils.database import get_db
from app.utils.auth import get_current_user, hash_password, create_access_token, verify_password

# Routeur FastAPI pour gérer les utilisateurs
router = APIRouter(tags=["Users"])

# Route pour enregistrer un nouvel utilisateur
@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Vérifie si l'utilisateur existe déjà
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="L'email existe déjà.")

    # Hashage du mot de passe et création de l'utilisateur
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

    # Génère un token JWT pour l'utilisateur
    token = create_access_token({"sub": new_user.email})

    # Calcule les initiales de l'utilisateur
    initials = f"{new_user.first_name[0].upper()}{new_user.last_name[0].upper()}"

    # Retourne les informations de l'utilisateur créé avec un token JWT et les initiales
    return {
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "email": new_user.email,
        "initials": initials,
        "access_token": token,
        "token_type": "bearer"
    }

# Route pour connecter un utilisateur
@router.post("/login")
def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    # Vérifie les informations d'identification
    user = db.query(UserModel).filter(UserModel.email == request.email).first()
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Génère un token JWT pour l'utilisateur
    token = create_access_token({"sub": user.email})

    # Calcule les initiales de l'utilisateur
    initials = f"{user.first_name[0].upper()}{user.last_name[0].upper()}"

    return {
        "access_token": token,
        "token_type": "bearer",
        "initials": initials
    }

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    # Retrieve the user from the database
    user = db.query(UserModel).filter(UserModel.user_id == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Calculate initials
    initials = f"{user.first_name[0].upper()}{user.last_name[0].upper()}"

    return {
        "id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "initials": initials
    }

# Route pour supprimer un compte utilisateur à partir d'un token
@router.delete("/delete-account")
def delete_account(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    # Récupère l'utilisateur actuel
    user = db.query(UserModel).filter(UserModel.user_id == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Supprime l'utilisateur de la base de données
    db.delete(user)
    db.commit()

    return {"message": "Compte supprimé avec succès"}

# Route pour modifier un compte utilisateur
@router.put("/update-account")
def update_account(
    user_update: UserUpdate,  # Utilisation d'un schéma Pydantic pour les données JSON
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Récupère l'utilisateur actuel
    user = db.query(UserModel).filter(UserModel.user_id == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Met à jour les informations de l'utilisateur
    user.first_name = user_update.first_name
    user.last_name = user_update.last_name
    user.email = user_update.email
    db.commit()
    db.refresh(user)

    # Calcule les initiales de l'utilisateur
    initials = f"{user.first_name[0].upper()}{user.last_name[0].upper()}"

    token = create_access_token({"sub": user.email})

    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "initials": initials,
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/auth/validate-token")
def validate_token(current_user: str = Depends(get_current_user)):
    try:
        # Si le token est valide, retourne un message de succès
        return {"message": "Token valide."}
    except HTTPException as e:
        # Si le token est invalide, retourne une erreur
        raise HTTPException(status_code=401, detail="Token invalide ou expiré.")