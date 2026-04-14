from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.list import ListCreate, ListUpdate, ListResponse
from app.models import List, BoardMember
from app.utils.auth import get_current_user
import logging

router = APIRouter(prefix="/lists", tags=["Lists"])

logger = logging.getLogger("uvicorn")

@router.post("/", response_model=ListResponse)
def create_list(list_data: ListCreate, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify if the user is a member of the board
    is_member = db.query(BoardMember).filter(BoardMember.board_id == list_data.board_id, BoardMember.user_id == current_user).first()
    if not is_member:
        logger.warning(f"User {current_user} is not a member of board {list_data.board_id}")
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à modifier ce tableau.")

    # Calculate the next position based on the highest position in the board
    max_position = db.query(List.position).filter(List.board_id == list_data.board_id).order_by(List.position.desc()).first()
    next_position = (max_position[0] + 1) if max_position and max_position[0] is not None else 1

    new_list = List(
        title=list_data.title,
        position=next_position,
        color=list_data.color,
        board_id=list_data.board_id
    )
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list

@router.delete("/{list_id}", response_model=dict)
def delete_list(list_id: int, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    list_to_delete = db.query(List).filter(List.list_id == list_id).first()
    if not list_to_delete:
        raise HTTPException(status_code=404, detail="List not found")

    # Verify if the user is a member of the board
    is_member = db.query(BoardMember).filter(BoardMember.board_id == list_to_delete.board_id, BoardMember.user_id == current_user).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à supprimer cette liste.")

    db.delete(list_to_delete)
    db.commit()
    return {"message": "List deleted successfully"}

@router.put("/{list_id}", response_model=ListResponse)
def update_list(list_id: int, list_data: ListUpdate, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    list_to_update = db.query(List).filter(List.id == list_id).first()
    if not list_to_update:
        raise HTTPException(status_code=404, detail="List not found.")

    # Verify if the user is a member of the board
    is_member = db.query(BoardMember).filter(BoardMember.board_id == list_to_update.board_id, BoardMember.user_id == current_user).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à modifier ce tableau.")

    # If board_id is being updated, recalculate the position
    if list_data.board_id and list_data.board_id != list_to_update.board_id:
        max_position = db.query(List.position).filter(List.board_id == list_data.board_id).order_by(List.position.desc()).first()
        next_position = (max_position[0] + 1) if max_position else 1
        list_to_update.position = next_position

    for key, value in list_data.dict(exclude_unset=True).items():
        if key in ["title", "color", "board_id"]:  # Ensure only valid fields are updated
            setattr(list_to_update, key, value)

    db.commit()
    db.refresh(list_to_update)
    return list_to_update