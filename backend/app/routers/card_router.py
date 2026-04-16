from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Card as CardModel, List as ListModel, BoardMember
from ..schemas.card import CardMove
from ..utils.auth import get_current_user

router = APIRouter(prefix="/cards", tags=["Cards"])

@router.put("/{card_id}/move")
def move_card(
    card_id: int,
    payload: CardMove,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Récupérer la card
    card = db.query(CardModel).filter(CardModel.card_id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card introuvable")

    old_list_id = card.list_id
    old_position = card.position

    new_list_id = payload.new_list_id
    new_position = payload.new_position

    # 2. Si rien ne change → exit
    if old_list_id == new_list_id and old_position == new_position:
        return card

    # 3. Vérification droits (via board de la list)
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

    # 4. Sécuriser position cible
    max_position = db.query(CardModel).filter(
        CardModel.list_id == new_list_id
    ).count()

    new_position = max(0, min(new_position, max_position))

    try:
        # =========================================================
        # CAS 1 : même liste → reorder interne
        # =========================================================
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

        # =========================================================
        # CAS 2 : changement de liste
        # =========================================================
        else:
            # 2.1 retirer de l'ancienne liste
            db.query(CardModel).filter(
                CardModel.list_id == old_list_id,
                CardModel.position > old_position
            ).update(
                {CardModel.position: CardModel.position - 1},
                synchronize_session=False
            )

            # 2.2 décaler la nouvelle liste
            db.query(CardModel).filter(
                CardModel.list_id == new_list_id,
                CardModel.position >= new_position
            ).update(
                {CardModel.position: CardModel.position + 1},
                synchronize_session=False
            )

            # 2.3 changer la liste
            card.list_id = new_list_id

        # =========================================================
        # CAS COMMUN : placement final
        # =========================================================
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