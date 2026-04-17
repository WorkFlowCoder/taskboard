from pydantic import BaseModel
from typing import Optional

class CardMove(BaseModel):
    new_list_id: int
    new_position: int

class CardCreate(BaseModel):
    list_id: int
    title: str
    description: str

class CardUpdate(BaseModel):
    title: str
    description: str

class CardResponse(BaseModel):
    card_id: int
    title: str
    description: str
    position: int

    class Config:
        from_attributes = True  # Compatible avec SQLAlchemy (Pydantic v2)