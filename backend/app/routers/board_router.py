from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Board, User, BoardMember
from ..utils.auth import SECRET_KEY, ALGORITHM, get_current_user
from fastapi.logger import logger
from ..schemas.board import BoardCreate
from sqlalchemy.sql import func
from sqlalchemy import text

router = APIRouter()

# Route pour récupérer tous les tableaux d'un utilisateur
@router.get("/boards")
def get_user_boards(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    boards = db.query(Board).join(BoardMember, Board.board_id == BoardMember.board_id).filter(BoardMember.user_id == current_user).all()
    if not boards:
        raise HTTPException(status_code=404, detail="Aucun board trouvé pour cet utilisateur")
    return {"user_id": current_user, "boards": boards}

# Route pour récupérer les statistiques de tous les boards de l'utilisateur
@router.get("/boards/stats")
def get_boards_stats(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    # Récupérer tous les boards où l'utilisateur est membre
    logger.info(f"Récupération des statistiques pour user_id: {current_user}")
    boards = db.query(Board).join(BoardMember, Board.board_id == BoardMember.board_id).filter(BoardMember.user_id == current_user).all()
    logger.info(f"Boards trouvés: {len(boards)} pour user_id: {current_user}")
    if not boards:
        raise HTTPException(status_code=404, detail="Aucun board trouvé pour cet utilisateur")

    stats = []

    for board in boards:
        # Récupérer le nombre total de cartes sur le board
        total_cards = db.execute(
            text(
                """
                SELECT COUNT(*) AS total_cards
                FROM cards c
                JOIN lists l ON c.list_id = l.list_id
                WHERE l.board_id = :board_id
                """
            ),
            {"board_id": board.board_id}
        ).scalar()

        # Récupérer le nombre de cartes par liste
        cards_per_list = db.execute(
            text(
                """
                SELECT l.list_id AS list_id, l.title AS list_title, COUNT(c.card_id) AS card_count
                FROM lists l
                LEFT JOIN cards c ON l.list_id = c.list_id
                WHERE l.board_id = :board_id
                GROUP BY l.list_id, l.title
                ORDER BY l.position ASC
                """
            ),
            {"board_id": board.board_id}
        ).fetchall()

        # Transformer les résultats en dictionnaires
        cards_per_list_dict = [dict(row._mapping) for row in cards_per_list]

        stats.append({
            "board_id": board.board_id,
            "board_title": board.title,
            "total_cards": total_cards,
            "cards_per_list": cards_per_list_dict
        })

    return stats

# Route pour récupérer un board par son ID
@router.get("/boards/{board_id}")
def get_board_by_id(board_id: str, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    board = db.query(Board).join(BoardMember, Board.board_id == BoardMember.board_id).filter(Board.board_id == board_id, BoardMember.user_id == current_user).first()
    if not board:
        logger.warning(f"Board not found or does not belong to user_id: {current_user}")
        raise HTTPException(status_code=404, detail="Board introuvable ou non autorisé")
    return board

# Fonction pour récupérer les membres d'un board
def fetch_board_members(board_id: str, db: Session):
    members = db.execute(
        text(
            """
            SELECT u.user_id AS user_id, u.first_name AS first_name, u.last_name AS last_name, bm.role AS role
            FROM board_members bm
            JOIN users u ON bm.user_id = u.user_id
            WHERE bm.board_id = :board_id
            """
        ),
        {"board_id": board_id}
    ).fetchall()
    return [dict(row._mapping) for row in members]

# Fonction pour récupérer les tags d'un board
def fetch_board_tags(board_id: str, db: Session):
    tags = db.execute(
        text(
            """
            SELECT lbl.label_id AS label_id, lbl.title AS title, lbl.color AS color
            FROM labels lbl
            JOIN card_labels cl ON lbl.label_id = cl.label_id
            JOIN cards c ON cl.card_id = c.card_id
            JOIN lists l ON c.list_id = l.list_id
            WHERE l.board_id = :board_id
            GROUP BY lbl.label_id, lbl.title, lbl.color
            """
        ),
        {"board_id": board_id}
    ).fetchall()
    return [dict(row._mapping) for row in tags]

# Fonction pour récupérer les listes d'un board
def fetch_board_lists(board_id: str, db: Session):
    lists = db.execute(
        text(
            """
            SELECT l.list_id AS list_id, l.title AS title, l.color AS color, l.position AS position,
                (
                    SELECT json_agg(
                        json_build_object(
                            'card_id', c.card_id,
                            'title', c.title,
                            'description', c.description,
                            'position', c.position,
                            'labels', (
                                SELECT json_agg(cl.label_id)
                                FROM card_labels cl
                                WHERE cl.card_id = c.card_id
                            ),
                            'members', (
                                SELECT json_agg(cm.user_id)
                                FROM card_members cm
                                WHERE cm.card_id = c.card_id
                            ),
                            'comments', (
                                SELECT json_agg(
                                    json_build_object(
                                        'comment_id', com.comment_id,
                                        'content', com.content,
                                        'created_at', com.created_at,
                                        'modified_at', com.modified_at,
                                        'author', com.user_id
                                    )
                                    ORDER BY com.created_at ASC
                                )
                                FROM comments com
                                WHERE com.card_id = c.card_id
                            )
                        )
                        ORDER BY c.position ASC
                    )
                    FROM cards c
                    WHERE c.list_id = l.list_id
                ) AS cards
            FROM lists l
            WHERE l.board_id = :board_id
            ORDER BY l.position ASC
            """
        ),
        {"board_id": board_id}
    ).fetchall()
    return [dict(row._mapping) for row in lists]

# Route pour récupérer un board avec tous ses détails
@router.get("/boards/{board_id}/details")
def get_board_details(board_id: str, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.board_id == board_id, Board.user_id == current_user).first()
    if not board:
        logger.warning(f"Board not found or does not belong to user_id: {current_user}")
        raise HTTPException(status_code=404, detail="Board introuvable ou non autorisé")

    members_dict = fetch_board_members(board_id, db)
    tags_dict = fetch_board_tags(board_id, db)
    lists_dict = fetch_board_lists(board_id, db)

    return {
        "board_id": board.board_id,
        "title": board.title,
        "description": board.description,
        "created_at": board.created_at,
        "modified_at": board.modified_at,
        "members": members_dict,
        "tags": tags_dict,
        "lists": lists_dict
    }

# Route pour créer un nouveau board
@router.post("/boards")
def create_board(
    board_data: BoardCreate,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Création d'un nouvel objet Board
    new_board = Board(
        title=board_data.title,
        description=board_data.description,
        user_id=current_user,
    )
    db.add(new_board)
    db.commit()
    db.refresh(new_board)

    # Ajouter l'utilisateur comme membre du tableau avec le rôle d'administrateur
    admin_member = BoardMember(
        board_id=new_board.board_id,
        user_id=current_user,
        role="admin"
    )
    db.add(admin_member)
    db.commit()

    return {"message": "Board créé avec succès", "board": new_board}

# Route pour supprimer un board par son ID
@router.delete("/boards/{board_id}")
def delete_board(
    board_id: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(Board).filter(Board.board_id == board_id, Board.user_id == current_user).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board introuvable ou non autorisé")

    db.delete(board)
    db.commit()
    return {"message": "Board supprimé avec succès"}

# Route pour mettre à jour un board
@router.put("/boards/{board_id}")
def update_board(
    board_id: str,
    board_data: BoardCreate,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logger.info(f"Requête PUT reçue pour board_id: {board_id} par user_id: {current_user}")
    logger.info(f"Données reçues: {board_data}")

    board = db.query(Board).filter(Board.board_id == board_id, Board.user_id == current_user).first()
    if not board:
        logger.error(f"Board introuvable ou non autorisé pour board_id: {board_id}")
        raise HTTPException(status_code=404, detail="Board introuvable ou non autorisé")

    # Mise à jour des champs
    board.title = board_data.title
    board.description = board_data.description
    board.modified_at = func.now()  # Met à jour la date de modification

    try:
        db.commit()
        db.refresh(board)
        logger.info(f"Board mis à jour avec succès: {board}")
        return {"message": "Board mis à jour avec succès", "board": board}
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du board: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour du board")