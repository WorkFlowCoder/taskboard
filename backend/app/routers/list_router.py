from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..schemas.list import ListCreate, ListUpdate, ListResponse
from ..models import List as ListModel, BoardMember
from ..utils.auth import get_current_user

router = APIRouter(prefix="/lists", tags=["Lists"])

@router.post("/", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
def create_list(
    list_data: ListCreate, 
    current_user: int = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # 1. Vérifier si l'utilisateur est membre du board
    is_member = db.query(BoardMember).filter(
        BoardMember.board_id == list_data.board_id, 
        BoardMember.user_id == current_user
    ).first()
    
    if not is_member:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à modifier ce tableau.")

    # 2. Calculer la position suivante de manière atomique (plus propre que order_by().first())
    max_pos = db.query(func.max(ListModel.position)).filter(ListModel.board_id == list_data.board_id).scalar()
    next_position = (max_pos + 1) if max_pos is not None else 1

    new_list = ListModel(
        title=list_data.title,
        position=next_position,
        color=list_data.color,
        board_id=list_data.board_id
    )
    
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list

@router.put("/{list_id}", response_model=ListResponse)
def update_list(
    list_id: int, 
    list_data: ListUpdate, 
    current_user: int = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Correction : Utilisation de list_id (ton PK SQL) au lieu de .id
    list_to_update = db.query(ListModel).filter(ListModel.list_id == list_id).first()
    if not list_to_update:
        raise HTTPException(status_code=404, detail="Liste introuvable.")

    # Vérification des droits sur le board actuel
    is_member = db.query(BoardMember).filter(
        BoardMember.board_id == list_to_update.board_id, 
        BoardMember.user_id == current_user
    ).first()
    
    if not is_member:
        raise HTTPException(status_code=403, detail="Accès refusé.")

    # Logique de changement de board (si applicable)
    if list_data.board_id and list_data.board_id != list_to_update.board_id:
        # Vérifier si l'utilisateur est membre du NOUVEAU board
        new_board_member = db.query(BoardMember).filter(
            BoardMember.board_id == list_data.board_id, 
            BoardMember.user_id == current_user
        ).first()
        if not new_board_member:
            raise HTTPException(status_code=403, detail="Vous ne pouvez pas déplacer la liste vers ce tableau.")
            
        max_pos = db.query(func.max(ListModel.position)).filter(ListModel.board_id == list_data.board_id).scalar()
        list_to_update.position = (max_pos + 1) if max_pos is not None else 1

    # Mise à jour dynamique des champs
    update_data = list_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(list_to_update, key, value)

    db.commit()
    db.refresh(list_to_update)
    return list_to_update

@router.delete("/{list_id}")
def delete_list(
    list_id: int, 
    current_user: int = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    list_to_delete = db.query(ListModel).filter(ListModel.list_id == list_id).first()
    if not list_to_delete:
        raise HTTPException(status_code=404, detail="Liste introuvable.")

    # Vérifier les droits (Seuls les admins ou membres peuvent supprimer)
    is_member = db.query(BoardMember).filter(
        BoardMember.board_id == list_to_delete.board_id, 
        BoardMember.user_id == current_user
    ).first()
    
    if not is_member:
        raise HTTPException(status_code=403, detail="Suppression non autorisée.")

    db.delete(list_to_delete)
    db.commit()
    return {"message": "Liste supprimée avec succès"}