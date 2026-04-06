from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from ..database import Base
from pydantic import BaseModel
from datetime import datetime

# Modèle SQLAlchemy pour représenter la table "boards" dans la base de données
class Board(Base):
    __tablename__ = "boards"  # Nom de la table

    # Colonnes principales : identifiant, titre, description, utilisateur associé, dates de création et modification
    board_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    modified_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())