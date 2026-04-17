from pydantic import BaseModel

class LabelCreate(BaseModel):
    title: str
    color: str


class LabelResponse(BaseModel):
    label_id: int
    title: str
    color: str
    board_id: int

    class Config:
        from_attributes = True