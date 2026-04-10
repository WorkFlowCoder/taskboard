from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..utils.auth import get_current_user
from ..database import get_db
from ..models.board_member import BoardMember
from ..models.board import Board
from ..models.user import User

router = APIRouter(prefix="/members", tags=["Members"])

@router.delete("/{board_id}/member/{user_id}", status_code=204)
def delete_board_member(
    board_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """
    Delete a member from a board. Only admins or the board owner can perform this action.
    """

    # Check if the board exists and the current user has the right permissions
    board_member = (
        db.query(BoardMember)
        .filter(BoardMember.board_id == board_id, BoardMember.user_id == current_user)
        .first()
    )

    if not board_member:
        raise HTTPException(status_code=404, detail="Board not found or access denied.")

    if board_member.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to remove members.")

    # Ensure the user being removed is not the board owner
    board = db.query(Board).filter(Board.board_id == board_id).first()
    if board.user_id == user_id:
        raise HTTPException(status_code=403, detail="Cannot remove the board owner.")

    # Prevent admins from removing other admins, except the owner
    member_to_remove = (
        db.query(BoardMember)
        .filter(BoardMember.board_id == board_id, BoardMember.user_id == user_id)
        .first()
    )

    if not member_to_remove:
        raise HTTPException(status_code=404, detail="Member not found.")

    if member_to_remove.role == "admin" and board_member.user_id != board.user_id:
        raise HTTPException(status_code=403, detail="Admins cannot remove other admins.")

    # Remove the member
    print(f"Removing member: {user_id} from board: {board_id}")
    db.delete(member_to_remove)
    db.commit()

    return {"message": "Member removed successfully."}

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
            "user_id": board.user_id,
            "requester_user_id": current_user,
            "requester_role": next(
                (member.BoardMember.role for member in members if member.User.user_id == current_user),
                None
            ),  # Added requester_role
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