from pydantic import BaseModel, Field
from typing import Optional

class ListCreate(BaseModel):
    title: str
    color: str
    board_id: int

class ListReorder(BaseModel):
    new_position: int = Field(..., ge=0, description="Nouvelle position de la liste (index basé sur 1)")

class ListUpdate(BaseModel):
    title: str | None = None
    color: str | None = None
    position: int | None = None  # Allow updating the position

class ListResponse(BaseModel):
    list_id: int
    title: str
    color: Optional[str] = None
    position: int
    board_id: int

    class Config:
        orm_mode = True