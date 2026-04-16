from pydantic import BaseModel

# Schémas Pydantic pour valider et structurer les données utilisateur

# Schéma pour la création d'un utilisateur
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# Schéma pour la mise à jour d'un utilisateur
class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    email: str

# Schéma pour les réponses utilisateur
class UserResponse(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    email: str
    initials: str