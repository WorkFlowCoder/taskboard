from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Card as CardModel, List as ListModel, BoardMember, Label
from ..schemas.card import CardMove, CardCreate, CardResponse, CardUpdate
from ..utils.auth import get_current_user

router = APIRouter(prefix="/cards", tags=["Cards"])

@router.put("/{card_id}/move")
def move_card( card_id: int, payload: CardMove, current_user: int = Depends(get_current_user), db: Session = Depends(get_db) ):
    # Récupérer la card
    card = db.query(CardModel).filter(CardModel.card_id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card introuvable")

    old_list_id = card.list_id
    old_position = card.position

    new_list_id = payload.new_list_id
    new_position = payload.new_position

    # Si rien ne change → exit
    if old_list_id == new_list_id and old_position == new_position:
        return card

    # Vérification droits (via board de la list)
    old_list = db.query(ListModel).filter(ListModel.list_id == old_list_id).first()
    new_list = db.query(ListModel).filter(ListModel.list_id == new_list_id).first()

    if not old_list or not new_list:
        raise HTTPException(status_code=404, detail="Liste introuvable")

    is_member = db.query(BoardMember).filter(
        BoardMember.board_id == old_list.board_id,
        BoardMember.user_id == current_user
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Accès refusé")

    # Sécuriser position cible
    max_position = db.query(CardModel).filter(
        CardModel.list_id == new_list_id
    ).count()

    new_position = max(0, min(new_position, max_position))

    try:
        # CAS 1 : même liste → reorder interne
        if old_list_id == new_list_id:

            if new_position > old_position:
                db.query(CardModel).filter(
                    CardModel.list_id == old_list_id,
                    CardModel.position > old_position,
                    CardModel.position <= new_position
                ).update(
                    {CardModel.position: CardModel.position - 1},
                    synchronize_session=False
                )
            else:
                db.query(CardModel).filter(
                    CardModel.list_id == old_list_id,
                    CardModel.position >= new_position,
                    CardModel.position < old_position
                ).update(
                    {CardModel.position: CardModel.position + 1},
                    synchronize_session=False
                )
        # CAS 2 : changement de liste
        else:
            # retirer de l'ancienne liste
            db.query(CardModel).filter(
                CardModel.list_id == old_list_id,
                CardModel.position > old_position
            ).update(
                {CardModel.position: CardModel.position - 1},
                synchronize_session=False
            )

            # décaler la nouvelle liste
            db.query(CardModel).filter(
                CardModel.list_id == new_list_id,
                CardModel.position >= new_position
            ).update(
                {CardModel.position: CardModel.position + 1},
                synchronize_session=False
            )

            # changer la liste
            card.list_id = new_list_id
        # CAS COMMUN : placement final
        card.position = new_position

        db.commit()
        db.refresh(card)
        return card

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erreur move card: {str(e)}"
        )

@router.post("/", response_model=CardResponse, status_code=201)
def create_card( payload: CardCreate, current_user: int = Depends(get_current_user), db: Session = Depends(get_db) ):
    # Vérifier que la liste existe
    target_list = db.query(ListModel).filter(
        ListModel.list_id == payload.list_id
    ).first()

    if not target_list:
        raise HTTPException(status_code=404, detail="Liste introuvable")

    # Vérifier que l'utilisateur est membre du board
    is_member = db.query(BoardMember).filter(
        BoardMember.board_id == target_list.board_id,
        BoardMember.user_id == current_user
    ).first()

    if not is_member:
        raise HTTPException(status_code=403, detail="Accès refusé")

    # Calculer la position de la nouvelle carte (fin de liste)
    max_position = db.query(CardModel).filter(
        CardModel.list_id == payload.list_id
    ).count()

    # Créer la carte
    new_card = CardModel(
        title=payload.title,
        description=payload.description,
        list_id=payload.list_id,
        position=max_position
    )

    db.add(new_card)
    db.commit()
    db.refresh(new_card)

    return new_card

@router.delete("/{card_id}")
def delete_card( card_id: int, current_user: int = Depends(get_current_user), db: Session = Depends(get_db) ):
    card = db.query(CardModel).filter(CardModel.card_id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card introuvable")
    list_id = card.list_id
    position = card.position
    
    target_list = db.query(ListModel).filter(
        ListModel.list_id == list_id
    ).first()

    if not target_list:
        raise HTTPException(status_code=404, detail="Liste introuvable")

    is_member = db.query(BoardMember).filter(
        BoardMember.board_id == target_list.board_id,
        BoardMember.user_id == current_user
    ).first()

    if not is_member:
        raise HTTPException(status_code=403, detail="Accès refusé")

    try:
        # RÉAJUSTEMENT DES POSITIONS (AVANT DELETE)
        db.query(CardModel).filter(
            CardModel.list_id == list_id,
            CardModel.position > position
        ).update(
            {CardModel.position: CardModel.position - 1},
            synchronize_session=False
        )
        db.delete(card)
        db.commit()

        return { "message": "Card supprimée avec succès", "card_id": card_id, "list_id": list_id}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erreur delete card: {str(e)}"
        )

@router.put("/{card_id}", response_model=CardResponse)
def update_card( card_id: int, payload: CardUpdate, current_user: int = Depends(get_current_user), db: Session = Depends(get_db) ):
    card = db.query(CardModel).filter(CardModel.card_id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card introuvable")
    
    target_list = db.query(ListModel).filter(
        ListModel.list_id == card.list_id
    ).first()
    if not target_list:
        raise HTTPException(status_code=404, detail="Liste introuvable")
    
    is_member = db.query(BoardMember).filter(
        BoardMember.board_id == target_list.board_id,
        BoardMember.user_id == current_user
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Accès refusé")

    try:
        card.title = payload.title
        card.description = payload.description
        db.commit()
        db.refresh(card)
        return card

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erreur update card: {str(e)}"
        )

@router.post("/{card_id}/labels/{label_id}")
def add_label_to_card( card_id: int, label_id: int, current_user: int = Depends(get_current_user), db: Session = Depends(get_db) ):
    card = db.query(CardModel).filter(CardModel.card_id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card introuvable")

    label = db.query(Label).filter(Label.label_id == label_id).first()
    if not label:
        raise HTTPException(status_code=404, detail="Label introuvable")

    target_list = db.query(ListModel).filter(
        ListModel.list_id == card.list_id
    ).first()

    if label.board_id != target_list.board_id:
        raise HTTPException(status_code=400, detail="Label incompatible avec la card")

    is_member = db.query(BoardMember).filter(
        BoardMember.board_id == target_list.board_id,
        BoardMember.user_id == current_user
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Accès refusé")

    already_exists = any(l.label_id == label_id for l in card.labels)

    if already_exists:
        raise HTTPException(
            status_code=409,
            detail="Label déjà assigné à la card"
        )
    card.labels.append(label)
    db.commit()

    return {
        "message": "Label ajouté",
        "card_id": card_id,
        "label_id": label_id
    }

@router.delete("/{card_id}/labels/{label_id}")
def remove_label_from_card( card_id: int, label_id: int, current_user: int = Depends(get_current_user), db: Session = Depends(get_db) ):
    card = db.query(CardModel).filter(CardModel.card_id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card introuvable")

    label = db.query(Label).filter(Label.label_id == label_id).first()
    if not label:
        raise HTTPException(status_code=404, detail="Label introuvable")

    target_list = db.query(ListModel).filter(
        ListModel.list_id == card.list_id
    ).first()

    is_member = db.query(BoardMember).filter(
        BoardMember.board_id == target_list.board_id,
        BoardMember.user_id == current_user
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Accès refusé")

    already_exists = any(l.label_id == label_id for l in card.labels)

    if not already_exists:
        raise HTTPException(
            status_code=404,
            detail="Label non assigné à la card"
        )
    card.labels.remove(label)
    db.commit()

    return {
        "message": "Label retiré",
        "card_id": card_id,
        "label_id": label_id
    }