from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..utils.auth import get_current_user
from ..database import get_db
from ..models.board_member import BoardMember
from ..models.board import Board
from ..models.user import User

router = APIRouter(prefix="/members", tags=["Members"])

@router.get("", response_model=list)
def get_user_boards(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)  # Adjusted to receive only user_id
):
    """
    Retrieve all boards the current user is working on, along with members and their roles.
    """
    boards = (
        db.query(Board)
        .join(BoardMember, Board.board_id == BoardMember.board_id)
        .filter(BoardMember.user_id == current_user)  # Updated to use user_id directly
        .all()
    )

    if not boards:
        raise HTTPException(status_code=404, detail="No boards found for the user.")

    result = []
    for board in boards:
        members = (
            db.query(BoardMember, User)
            .join(User, User.user_id == BoardMember.user_id)
            .filter(BoardMember.board_id == board.board_id)
            .all()
        )

        board_info = {
            "board_id": board.board_id,
            "title": board.title,
            "members": [
                {
                    "user_id": member.User.user_id,
                    "first_name": member.User.first_name,
                    "last_name": member.User.last_name,
                    "role": member.BoardMember.role
                }
                for member in members
            ],
        }
        result.append(board_info)

    return result