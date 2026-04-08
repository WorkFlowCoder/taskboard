from fastapi import APIRouter, HTTPException, Depends, Header
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from jose.exceptions import JWTError

# Contexte pour le hashage des mots de passe
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
SECRET_KEY = "your_secret_key_here"  # Clé secrète pour signer les tokens JWT
ALGORITHM = "HS256"  # Algorithme utilisé pour les tokens JWT
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Durée de validité des tokens d'accès

# Fonction pour hasher un mot de passe
# Utilise le contexte défini pour sécuriser les mots de passe

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Fonction pour vérifier un mot de passe en clair contre un mot de passe hashé

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Fonction pour créer un token JWT
# Ajoute une date d'expiration au token

def create_access_token(data: dict):
    to_encode = data.copy()
    if "user_id" in data:
        to_encode["sub"] = str(data["user_id"])  # Assurez-vous que sub contient user_id
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Function to get the current user from the token
def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Schéma d'authentification invalide")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email: str = payload.get("sub")
        if user_email is None:
            raise HTTPException(status_code=401, detail="Token invalide")

        # Recherche de l'utilisateur dans la base de données
        user = db.query(User).filter(User.email == user_email).first()
        if user is None:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

        return user.user_id  # Retourne l'identifiant de l'utilisateur
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")
    except ValueError:
        raise HTTPException(status_code=401, detail="En-tête Authorization mal formé")