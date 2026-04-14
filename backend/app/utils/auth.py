from fastapi import HTTPException, Depends, Header
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User

# Contexte pour le hashage
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
SECRET_KEY = "your_secret_key_here" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 heures

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    # On standardise : le 'sub' (subject) du JWT DOIT être l'ID de l'utilisateur en string
    if "sub" not in to_encode and "user_id" in to_encode:
        to_encode["sub"] = str(to_encode["user_id"])
    
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    """
    Récupère l'ID de l'utilisateur à partir du token JWT présent dans le Header.
    """
    try:
        # 1. Extraction du token
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(status_code=401, detail="En-tête Authorization mal formé")
        
        token = parts[1]
        
        # 2. Décodage
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Token invalide : identifiant manquant")
        
        user_id = int(user_id_str)

        # 3. Vérification de l'existence (Optionnel mais recommandé pour la sécurité)
        # On vérifie si l'ID existe vraiment en base
        user_exists = db.query(User.user_id).filter(User.user_id == user_id).first()
        if not user_exists:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

        return user_id # Retourne l'INT pour tes filtres de requêtes SQL
        
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")