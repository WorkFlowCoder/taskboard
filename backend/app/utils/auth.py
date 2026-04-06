from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

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
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)