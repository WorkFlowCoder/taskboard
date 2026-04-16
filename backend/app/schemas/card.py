from pydantic import BaseModel

class CardMove(BaseModel):
    new_list_id: int
    new_position: int