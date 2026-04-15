from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List as ListType
from ..database import get_db
from ..models import Board, BoardMember, User
from ..schemas.member import UpdateRoleRequest, AddMemberRequest, AddedMemberResponse
from ..utils.auth import get_current_user

router = APIRouter(prefix="/members", tags=["Members"])

@router.put("/{board_id}/member/{user_id}/role")
def update_member_role(
    board_id: int,
    user_id: int,
    request: UpdateRoleRequest,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """
    Met à jour le rôle d'un membre. 
    Seul le propriétaire ou un admin peut modifier les rôles.
    """
    # 1. Vérifier l'existence du board
    board = db.query(Board).filter(Board.board_id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Tableau introuvable.")

    # 2. Vérifier les permissions de celui qui fait la requête
    requester = db.query(BoardMember).filter(
        BoardMember.board_id == board_id, 
        BoardMember.user_id == current_user
    ).first()

    if not requester or requester.role == "member":
        raise HTTPException(status_code=403, detail="Permissions insuffisantes.")

    # 3. Récupérer le membre à modifier
    member_to_update = db.query(BoardMember).filter(
        BoardMember.board_id == board_id, 
        BoardMember.user_id == user_id
    ).first()

    if not member_to_update:
        raise HTTPException(status_code=404, detail="Le membre à modifier n'existe pas dans ce tableau.")

    # --- LOGIQUE DES RÈGLES ---
    
    # Seul le propriétaire (celui défini dans board.user_id) peut nommer un nouveau propriétaire
    if request.new_role == "owner":
        if board.user_id != current_user:
            raise HTTPException(status_code=403, detail="Seul le propriétaire peut transférer la propriété.")
        
        # Transfert de propriété : 
        # L'ancien owner devient admin, le nouveau devient owner (dans la table Board)
        # Et les deux sont admin dans la table board_members
        board.user_id = user_id
        member_to_update.role = "admin"
        requester.role = "admin" # Assure que l'ancien reste admin
    
    else:
        # Un admin ne peut pas rétrograder un autre admin (seul le propriétaire le peut)
        if requester.role == "admin" and member_to_update.role == "admin" and board.user_id != current_user:
             raise HTTPException(status_code=403, detail="Un admin ne peut pas rétrograder un autre admin.")
        
        member_to_update.role = request.new_role

    try:
        db.commit()
        return {"message": "Rôle mis à jour avec succès."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour.")

@router.delete("/{board_id}/member/{user_id}", status_code=204)
def delete_board_member(
    board_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """
    Supprime un membre du tableau.
    """
    board = db.query(Board).filter(Board.board_id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Tableau introuvable.")

    requester = db.query(BoardMember).filter(
        BoardMember.board_id == board_id, 
        BoardMember.user_id == current_user
    ).first()

    # Seuls les admins ou le propriétaire peuvent supprimer
    if not requester or requester.role == "member":
        raise HTTPException(status_code=403, detail="Action non autorisée.")

    # On ne peut pas supprimer le propriétaire du tableau
    if board.user_id == user_id:
        raise HTTPException(status_code=403, detail="Impossible de supprimer le propriétaire du tableau.")

    member_to_remove = db.query(BoardMember).filter(
        BoardMember.board_id == board_id, 
        BoardMember.user_id == user_id
    ).first()

    if not member_to_remove:
        raise HTTPException(status_code=404, detail="Membre introuvable.")

    # Un admin ne peut pas supprimer un autre admin (seul le owner peut)
    if requester.role == "admin" and member_to_remove.role == "admin" and board.user_id != current_user:
        raise HTTPException(status_code=403, detail="Un administrateur ne peut pas supprimer un autre administrateur.")

    db.delete(member_to_remove)
    db.commit()
    return None

@router.post("/{board_id}/member/", status_code=201)
def add_board_member(
    board_id: int,
    request: AddMemberRequest,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """
    Ajoute un membre au tableau.
    """
    # Récupérer le board
    board = db.query(Board).filter(Board.board_id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Tableau introuvable.")

    requester = db.query(BoardMember).filter(
        BoardMember.board_id == board_id,
        BoardMember.user_id == current_user
    ).first()

    # Seuls les admins ou le propriétaire peuvent ajouter
    if not requester or requester.role == "member":
        raise HTTPException(status_code=403, detail="Action non autorisée.")

    new_user = db.query(User).filter(User.email == request.email).first()
    if not new_user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    # Vérification du rôle
    if request.role not in ["member", "admin"]:
        raise HTTPException(status_code=400, detail="Rôle non valide.")

    # Vérifier que l'utilisateur n'est pas déjà membre
    is_present = db.query(BoardMember).filter(
        BoardMember.board_id == board_id,
        BoardMember.user_id == new_user.user_id
    ).first()

    if is_present:
        raise HTTPException(status_code=400, detail="Membre déjà présent sur le board.")

    # Ajout du membre
    new_member = BoardMember(
        board_id=board_id,
        user_id=new_user.user_id,
        role=request.role
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return AddedMemberResponse(
        user_id=new_user.user_id,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        role=new_member.role
    )


@router.get("", response_model=ListType[dict])
def get_user_boards_with_members(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """
    Récupère tous les tableaux de l'utilisateur avec la liste des membres.
    """
    # Récupérer les boards où l'utilisateur est présent
    boards = db.query(Board).join(BoardMember).filter(BoardMember.user_id == current_user).all()

    if not boards:
        return []

    result = []
    for board in boards:
        # Récupérer les membres et leurs infos utilisateur
        members_data = db.query(BoardMember, User).join(User, User.user_id == BoardMember.user_id).filter(
            BoardMember.board_id == board.board_id
        ).all()

        # Identifier le rôle de celui qui fait la requête
        requester_role = next((m.BoardMember.role for m in members_data if m.User.user_id == current_user), "member")

        result.append({
            "board_id": board.board_id,
            "title": board.title,
            "owner_id": board.user_id,
            "requester_user_id": current_user,
            "requester_role": requester_role,
            "members": [
                {
                    "user_id": m.User.user_id,
                    "first_name": m.User.first_name,
                    "last_name": m.User.last_name,
                    "role": m.BoardMember.role
                } for m in members_data
            ]
        })

    return result