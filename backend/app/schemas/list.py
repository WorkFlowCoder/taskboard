from pydantic import BaseModel

class ListCreate(BaseModel):
    title: str
    color: str
    board_id: int

class ListUpdate(BaseModel):
    title: str | None = None
    color: str | None = None
    position: int | None = None  # Allow updating the position

class ListResponse(BaseModel):
    list_id: int
    title: str
    color: str
    position: int
    board_id: int