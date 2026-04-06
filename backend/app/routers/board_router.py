from fastapi import APIRouter, Depends, HTTPException, Header
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Board, User
from ..utils.auth import SECRET_KEY, ALGORITHM
from fastapi.logger import logger
from ..schemas.board import BoardCreate

router = APIRouter()

# Fonction pour récupérer l'utilisateur actuel à partir du token JWT
# Cette fonction vérifie le schéma d'authentification, décode le token et récupère l'utilisateur associé
# En cas d'erreur, une exception HTTP est levée

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Schéma d'authentification invalide")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email: str = payload.get("sub")
        if user_email is None:
            raise HTTPException(status_code=401, detail="Token invalide")

        # Recherche de l'utilisateur dans la base de données
        user = db.query(User).filter(User.email == user_email).first()
        if user is None:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

        return user.user_id  # Retourne l'identifiant de l'utilisateur
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")
    except ValueError:
        raise HTTPException(status_code=401, detail="En-tête Authorization mal formé")

# Route pour récupérer tous les tableaux d'un utilisateur
@router.get("/boards")
def get_user_boards(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    boards = db.query(Board).filter(Board.user_id == current_user).all()
    if not boards:
        raise HTTPException(status_code=404, detail="Aucun board trouvé pour cet utilisateur")
    return boards

# Route pour récupérer un board par son ID
@router.get("/boards/{board_id}")
def get_board_by_id(board_id: str, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.board_id == board_id, Board.user_id == current_user).first()
    if not board:
        logger.warning(f"Board not found or does not belong to user_id: {current_user}")
        raise HTTPException(status_code=404, detail="Board introuvable ou non autorisé")
    return board

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