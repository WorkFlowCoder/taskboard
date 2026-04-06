from pydantic import BaseModel
from datetime import datetime

# Modèle Pydantic pour structurer les réponses liées aux tableaux
class BoardResponse(BaseModel):
    board_id: int
    title: str
    description: str | None
    user_id: int
    created_at: datetime
    modified_at: datetime

    class Config:
        from_attributes = True  # Permet de mapper les champs SQLAlchemy aux champs Pydantic

    # Méthode pour convertir les dates en format ISO dans les réponses
    def dict(self, *args, **kwargs):
        data = super().dict(*args, **kwargs)
        data['created_at'] = data['created_at'].isoformat()
        data['modified_at'] = data['modified_at'].isoformat()
        return data

# Schéma pour la création d'un board
class BoardCreate(BaseModel):
    title: str
    description: str