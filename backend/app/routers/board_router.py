from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text, func, union_all, select
from typing import List
from ..database import get_db
from ..models import Board, BoardMember, Card, List, Comment, Label
from ..utils.auth import get_current_user
from ..schemas.board import BoardCreate, CommentCreate
from ..schemas.label import LabelCreate, LabelResponse

router = APIRouter(tags=["Boards"])

# --- HELPERS (FONCTIONS SQL PUR) ---

def fetch_board_members(board_id: int, db: Session):
    query = text("""
        SELECT u.user_id, u.first_name, u.last_name, bm.role
        FROM board_members bm
        JOIN users u ON bm.user_id = u.user_id
        WHERE bm.board_id = :board_id
    """)
    result = db.execute(query, {"board_id": board_id})
    return [dict(row._mapping) for row in result]

def fetch_board_tags(board_id: int, db: Session):
    # Correction : On récupère tous les labels liés au board, pas seulement ceux utilisés sur des cartes
    query = text("""
        SELECT label_id, title, color
        FROM labels
        WHERE board_id = :board_id
    """)
    result = db.execute(query, {"board_id": board_id})
    return [dict(row._mapping) for row in result]

def fetch_board_lists(board_id: int, db: Session):
    # La requête complexe avec json_agg pour récupérer l'arborescence complète
    query = text("""
        SELECT l.list_id, l.title, l.color, l.position,
            (
                SELECT json_agg(card_data)
                FROM (
                    SELECT c.card_id, c.title, c.description, c.position,
                        (SELECT json_agg(cl.label_id) FROM card_labels cl WHERE cl.card_id = c.card_id) AS labels,
                        (SELECT json_agg(cm.user_id) FROM card_members cm WHERE cm.card_id = c.card_id) AS members,
                        (
                            SELECT json_agg(com_data)
                            FROM (
                                SELECT com.comment_id, com.content, com.created_at, com.modified_at, com.user_id AS author
                                FROM comments com
                                WHERE com.card_id = c.card_id
                                ORDER BY com.created_at ASC
                            ) com_data
                        ) AS comments
                    FROM cards c
                    WHERE c.list_id = l.list_id
                    ORDER BY c.position ASC
                ) card_data
            ) AS cards
        FROM lists l
        WHERE l.board_id = :board_id
        ORDER BY l.position ASC
    """)
    result = db.execute(query, {"board_id": board_id})
    return [dict(row._mapping) for row in result]

# --- ROUTES ---

@router.get("/boards")
def get_user_boards(current_user: int = Depends(get_current_user), db: Session = Depends(get_db)):
    # Utilisation de l'ORM pour plus de clarté
    boards = db.query(Board).join(BoardMember).filter(BoardMember.user_id == current_user).all()
    if not boards:
        return []
    return {"user_id": current_user, "boards": boards}

@router.get("/boards/stats")
def get_boards_stats( current_user: int = Depends(get_current_user), db: Session = Depends(get_db)):
    user_boards = (
        db.query(Board).join(BoardMember).filter(BoardMember.user_id == current_user).all()
    )
    if not user_boards:
        raise HTTPException(status_code=404, detail="Aucun board trouvé")

    stats = []
    for board in user_boards:
        # KPI BASE
        total_cards = (
            db.query(func.count(Card.card_id)).join(List, Card.list_id == List.list_id)
            .filter(List.board_id == board.board_id).scalar()
        ) or 0

        total_comments = (
            db.query(func.count(Comment.comment_id)).join(Card, Comment.card_id == Card.card_id)
            .join(List, Card.list_id == List.list_id).filter(List.board_id == board.board_id).scalar()
        ) or 0

        avg_comments = (
            total_comments / total_cards if total_cards else 0
        )

        last_card_activity = (
            db.query(func.max(Card.created_at)).join(List, Card.list_id == List.list_id)
            .filter(List.board_id == board.board_id).scalar()
        )

        last_comment_activity = (
            db.query(func.max(Comment.created_at)).join(Card, Comment.card_id == Card.card_id)
            .join(List, Card.list_id == List.list_id).filter(List.board_id == board.board_id).scalar()
        )

        last_activity = max(
            (d for d in [last_card_activity, last_comment_activity] if d),
            default=None
        )

        cards_events = (
            db.query(
                func.date(Card.created_at).label("date"), func.count(Card.card_id).label("value")
            )
            .join(List, Card.list_id == List.list_id).filter(List.board_id == board.board_id)
            .group_by(func.date(Card.created_at))
        )

        comments_events = (
            db.query(
                func.date(Comment.created_at).label("date"), func.count(Comment.comment_id).label("value")
            )
            .join(Card, Comment.card_id == Card.card_id).join(List, Card.list_id == List.list_id)
            .filter(List.board_id == board.board_id).group_by(func.date(Comment.created_at))
        )
        union = cards_events.union_all(comments_events).subquery()
        activity_over_time = (
            db.query(
                union.c.date, func.sum(union.c.value).label("count")
            )
            .group_by(union.c.date).order_by(union.c.date).all()
        )
        cards_per_list = (
            db.query(
                List.list_id,
                List.title.label("list_title"),
                func.count(Card.card_id).label("card_count")
            )
            .outerjoin(Card, Card.list_id == List.list_id).filter(List.board_id == board.board_id)
            .group_by(List.list_id).order_by(List.position).all()
        )

        total_cards_in_board = total_cards

        stats.append({
            "board_id": board.board_id,
            "board_title": board.title,
            # KPI
            "total_cards": total_cards,
            "total_comments": total_comments,
            "avg_comments_per_card": round(avg_comments, 2),
            "last_activity": last_activity,
            "cards_over_time": [
                {"date": str(row.date), "count": row.count}
                for row in activity_over_time
            ],
            "cards_per_list": [
                {
                    "list_id": row.list_id,
                    "list_title": row.list_title,
                    "card_count": row.card_count,
                    "percentage": round(
                        (row.card_count / total_cards_in_board) * 100, 2
                    ) if total_cards_in_board else 0
                }
                for row in cards_per_list
            ]
        })

    return stats

@router.get("/boards/{board_id}/details")
def get_board_details(board_id: int, current_user: int = Depends(get_current_user), db: Session = Depends(get_db)):
    # Vérification des droits d'accès
    is_member = db.query(BoardMember).filter(BoardMember.board_id == board_id, BoardMember.user_id == current_user).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Accès non autorisé à ce board")

    board = db.query(Board).filter(Board.board_id == board_id).first()
    
    return {
        "board_id": board.board_id,
        "title": board.title,
        "description": board.description,
        "created_at": board.created_at,
        "modified_at": board.modified_at,
        "members": fetch_board_members(board_id, db),
        "tags": fetch_board_tags(board_id, db),
        "lists": fetch_board_lists(board_id, db)
    }

@router.post("/boards", status_code=status.HTTP_201_CREATED)
def create_board(board_data: BoardCreate, current_user: int = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Création du Board
    new_board = Board(
        title=board_data.title,
        description=board_data.description,
        user_id=current_user
    )
    db.add(new_board)
    db.flush() # Flush pour récupérer l'ID avant le commit final

    # 2. Création automatique du créateur comme Admin
    admin_member = BoardMember(
        board_id=new_board.board_id,
        user_id=current_user,
        role="admin"
    )
    db.add(admin_member)
    
    try:
        db.commit()
        db.refresh(new_board)
        return {"message": "Board créé avec succès", "board": new_board}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/boards/{board_id}")
def update_board(board_id: int, board_data: BoardCreate, current_user: int = Depends(get_current_user), db: Session = Depends(get_db)):
    # On vérifie si l'utilisateur est admin du board pour autoriser la modif
    member = db.query(BoardMember).filter(BoardMember.board_id == board_id, BoardMember.user_id == current_user, BoardMember.role == 'admin').first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Seul un administrateur peut modifier le board")

    board = db.query(Board).filter(Board.board_id == board_id).first()
    board.title = board_data.title
    board.description = board_data.description
    # modified_at est géré par 'onupdate' dans le modèle SQLAlchemy automatiquement

    db.commit()
    db.refresh(board)
    return {"message": "Board mis à jour", "board": board}

@router.delete("/boards/{board_id}")
def delete_board(board_id: int, current_user: int = Depends(get_current_user), db: Session = Depends(get_db)):
    # Vérifier que l'utilisateur possède le board (ou est admin)
    board = db.query(Board).filter(Board.board_id == board_id, Board.user_id == current_user).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board non trouvé ou permissions insuffisantes")

    db.delete(board)
    db.commit()
    return {"message": "Board supprimé avec succès"}

@router.post("/comments")
def create_comment(comment_data: CommentCreate, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    # Version ORM plus propre que le SQL pur
    new_comment = Comment(
        content=comment_data.content,
        card_id=comment_data.card_id,
        user_id=current_user
    )
    db.add(new_comment)
    try:
        db.commit()
        db.refresh(new_comment)
        return new_comment
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erreur lors de la création du commentaire")
    
@router.post("/boards/{board_id}/labels", response_model=LabelResponse, status_code=201)
def create_label( board_id: int, payload: LabelCreate, current_user: int = Depends(get_current_user), db: Session = Depends(get_db) ):
    board = db.query(Board).filter(Board.board_id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board introuvable")

    is_member = db.query(BoardMember).filter(
        BoardMember.board_id == board_id,
        BoardMember.user_id == current_user
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Accès refusé")

    existing_label = db.query(Label).filter(
        Label.board_id == board_id,
        Label.title == payload.title
    ).first()
    if existing_label:
        raise HTTPException( status_code=400, detail="Un label avec ce titre existe déjà" )

    try:
        new_label = Label(
            title=payload.title,
            color=payload.color,
            board_id=board_id
        )

        db.add(new_label)
        db.commit()
        db.refresh(new_label)

        return new_label

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erreur création label: {str(e)}"
        )