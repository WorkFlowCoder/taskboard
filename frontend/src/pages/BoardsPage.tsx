import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { fetchAllBoards, deleteBoard, updateBoard } from '../services/boardService';
import { useNavigate } from 'react-router-dom';
import CreateBoardModal from '../components/CreateBoardModal'; // Import du nouveau composant CreateBoardModal
import './BoardsPage.css';
import { Edit3 } from 'lucide-react';

// Page BoardsPage pour afficher tous les tableaux de l'utilisateur

const BoardsPage: React.FC = () => {
  const { isAuthenticated, authToken } = useAuth(); // Vérifie l'état d'authentification et récupère le token
  const [boards, setBoards] = useState([]); // État pour stocker les tableaux
  const [error, setError] = useState(null); // État pour gérer les erreurs
  const navigate = useNavigate(); // Permet de rediriger l'utilisateur
  const [isModalOpen, setIsModalOpen] = useState(false); // État pour gérer l'ouverture de la modal
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null); // État pour suivre le board en cours d'édition
  const [editedBoard, setEditedBoard] = useState({ title: '', description: '' }); // État pour les modifications

  useEffect(() => {
    if (isAuthenticated && authToken) {
      const fetchBoards = async () => {
        try {
          const data = await fetchAllBoards(authToken); // Récupère les tableaux via le service
          setBoards(data);
          //console.log(data);
        } catch (err: any) {
          console.error('Erreur lors de la récupération des boards:', err);
          setError(err.message); // Gère les erreurs lors de la récupération des données
        }
      };

      fetchBoards();
    }
  }, [isAuthenticated, authToken]);

  const handleBoardClick = (boardId: string) => {
    navigate(`/boards/${boardId}`); // Redirige vers la page du tableau sélectionné
  };

  const handleOpenModal = () => {
    setIsModalOpen(true); // Ouvre la modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Ferme la modal
  };

  const handleCreateBoard = (boardData) => {
    setIsModalOpen(false); // Ferme la modal après la création
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      await deleteBoard(boardId, authToken); // Appel à la fonction de suppression
      setBoards((prevBoards) => prevBoards.filter((board) => board.board_id !== boardId)); // Mise à jour de la liste des boards
    } catch (error) {
      console.error('Erreur lors de la suppression du board:', error);
    }
  };

  const handleEditBoard = (board) => {
    setEditingBoardId(board.board_id); // Active le mode édition pour le board sélectionné
    setEditedBoard({ title: board.title, description: board.description }); // Pré-remplit les champs avec les données actuelles
  };

  const handleCancelEdit = () => {
    setEditingBoardId(null); // Désactive le mode édition
    setEditedBoard({ title: '', description: '' }); // Réinitialise les champs
  };

  const handleSaveEdit = async (boardId) => {
    try {
      await updateBoard(boardId, editedBoard.title, editedBoard.description, authToken);
      console.log('Board updated successfully');
      setEditingBoardId(null); // Quitte le mode édition
      const updatedBoards = boards.map((board) =>
        board.board_id === boardId
          ? { ...board, title: editedBoard.title, description: editedBoard.description, modified_at: new Date().toISOString() }
          : board
      );
      setBoards(updatedBoards);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du board:', error);
    }
  };

  return (
    <div className="boards-page">
      <div className="boards-page-header">
        <h1>Mes Boards</h1>
        {isAuthenticated && (
          <button onClick={handleOpenModal} className="create-board-button">
            Créer un Board
          </button>
        )}
      </div>
      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreateBoard}
      />
      {error && <p className="error-message">{error}</p>}
      {isAuthenticated ? (
        boards.length > 0 ? (
          <ul>
            {boards.map((board, index) => (
              <li
                key={board.board_id || index}
                className={editingBoardId === board.board_id ? 'editing' : ''}
              >
                <div className="board-item relative">
                  {editingBoardId === board.board_id && (
                    <div className="editing-indicator" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <Edit3 /> En cours de modification
                    </div>
                  )}
                  <div>
                    {editingBoardId === board.board_id ? (
                      <h3
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          setEditedBoard((prev) => ({ ...prev, title: e.target.textContent || '' }))
                        }
                        className="editable-title"
                      >
                        <Edit3 /> {editedBoard.title || 'Sans titre'}
                      </h3>
                    ) : (
                      <h3
                        onClick={() => !editingBoardId && handleBoardClick(board.board_id)}
                        className={editingBoardId ? 'disabled' : 'h3-clickable'}
                      >
                        {board.title || 'Sans titre'}
                      </h3>
                    )}
                    {editingBoardId === board.board_id ? (
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          setEditedBoard((prev) => ({ ...prev, description: e.target.textContent || '' }))
                        }
                        className="editable-description"
                      >
                        <Edit3 /> {editedBoard.description || 'Aucune description'}
                      </p>
                    ) : (
                      <p>{board.description || 'Aucune description'}</p>
                    )}
                    <p className="small">
                      Créé le : {new Date(board.created_at).toLocaleDateString()}
                    </p>
                    <p className="small">
                      Dernière modification : {new Date(board.modified_at).toLocaleDateString()}
                    </p>
                    {editingBoardId === board.board_id ? (
                      <>
                        <button
                          onClick={handleCancelEdit}
                          className="cancel"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleSaveEdit(board.board_id)}
                          className="save"
                        >
                          Sauvegarder
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditBoard(board)}
                          className="edit"
                        >
                          Modifier
                        </button>
                        <button
                          className="delete"
                          onClick={() => handleDeleteBoard(board.board_id)}
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun board trouvé.</p>
        )
      ) : (
        <p>Veuillez vous connecter pour voir vos boards.</p>
      )}
    </div>
  );
};

export default BoardsPage;