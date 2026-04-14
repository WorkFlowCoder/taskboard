from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..utils.auth import get_current_user
from ..database import get_db
from ..models.board_member import BoardMember
from ..models.board import Board
from ..models.user import User
from ..schemas.member import UpdateRoleRequest  # Import the schema from the new location
from pydantic import BaseModel, validator

router = APIRouter(prefix="/members", tags=["Members"])

class UpdateRoleRequest(BaseModel):
    new_role: str

    @validator("new_role")
    def validate_role(cls, value):
        if value not in ["admin", "member", "owner"]:
            raise ValueError("Invalid role. Role must be 'admin', 'member', or 'owner'.")
        return value

@router.put("/{board_id}/member/{user_id}/role", status_code=200)
def update_member_role(
    board_id: int,
    user_id: int,
    request: UpdateRoleRequest,  # Use the Pydantic model for validation
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """
    Update the role of a member on a board. Only admins or the board owner can perform this action.
    """
    new_role = request.new_role  # Extract the validated role
    logger.info(f"Request data: board_id={board_id}, user_id={user_id}, new_role={new_role}")

    # Check if the board exists and the current user has the right permissions
    board = db.query(Board).filter(Board.board_id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found.")

    board_member = (
        db.query(BoardMember)
        .filter(BoardMember.board_id == board_id, BoardMember.user_id == current_user)
        .first()
    )

    if not board_member:
        raise HTTPException(status_code=404, detail="Board not found or access denied.")

    # Rule: A member cannot make modifications
    if board_member.role == "member":
        raise HTTPException(status_code=403, detail="Members cannot modify roles.")

    # Ensure the user being updated exists
    member_to_update = (
        db.query(BoardMember)
        .filter(BoardMember.board_id == board_id, BoardMember.user_id == user_id)
        .first()
    )

    if not member_to_update:
        raise HTTPException(status_code=404, detail="Member not found.")

    # Rule: Only the board owner can assign the owner role
    if new_role == "owner" and board.user_id != current_user:
        raise HTTPException(status_code=403, detail="Only the board owner can assign the owner role.")

    # Rule: Only the board owner can demote an admin to member
    if member_to_update.role == "admin" and new_role == "member" and board.user_id != current_user:
        raise HTTPException(status_code=403, detail="Only the board owner can demote an admin to member.")

    # Rule: An admin cannot demote another admin to member
    if board_member.role == "admin" and member_to_update.role == "admin" and new_role == "member":
        raise HTTPException(status_code=403, detail="Admins cannot demote other admins to member.")

    # If the new role is 'owner', transfer ownership without changing the previous owner's role
    if new_role == "owner":
        board.user_id = user_id  # Transfer ownership to the new user
        new_role = "admin"  # Set the new owner's role as admin

    # Ensure the new role is either 'admin' or 'member'
    if new_role not in ["admin", "member"]:
        raise HTTPException(status_code=400, detail="Invalid role. Role must be 'admin' or 'member'.")

    # Update the role
    member_to_update.role = new_role
    db.commit()

    return {"message": "Member role updated successfully."}

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
    logger.info(f"Removing member: {user_id} from board: {board_id}")
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