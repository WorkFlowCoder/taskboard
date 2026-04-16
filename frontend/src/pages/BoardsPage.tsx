import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { fetchAllBoards, deleteBoard, updateBoard } from '../services/boardService';
import { useNavigate } from 'react-router-dom';
import CreateBoardModal from '../components/modals/CreateBoardModal';
import './BoardsPage.css';
import { Edit3, Trash2, XCircle, CheckCircle, ArrowRight } from 'lucide-react';
import type { Board } from '../types/board';

// Page BoardsPage pour afficher tous les tableaux de l'utilisateur
const BoardsPage: React.FC = () => {
  const { isAuthenticated, authToken, loading } = useAuth(); // Vérifie l'état d'authentification et récupère le token
  const [boards, setBoards] = useState<Board[]>([]); // État pour stocker les tableaux
  const [id, setId] = useState(null); // État pour stocker son ID
  const [error, setError] = useState(null); // État pour gérer les erreurs
  const navigate = useNavigate(); // Permet de rediriger l'utilisateur
  const [isModalOpen, setIsModalOpen] = useState(false); // État pour gérer l'ouverture de la modal
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null); // État pour suivre le board en cours d'édition
  const [editedBoard, setEditedBoard] = useState({ title: '', description: '' }); // État pour les modifications

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      const fetchBoards = async () => {
        try {
          if (!authToken) throw new Error('Utilisateur non authentifié.');
          const data = await fetchAllBoards(authToken);
          setBoards(data.boards);
          setId(data.user_id);
        } catch (err: any) {
          console.error('Erreur lors de la récupération des boards:', err);
          setError(err.message);
        }
      };

      fetchBoards();
    }
  }, [isAuthenticated, authToken]);

  const handleBoardClick = (boardId: number) => {
     // Redirige vers la page du tableau sélectionné
    navigate(`/boards/${boardId}`);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateBoard = () => {
    setIsModalOpen(false);
  };

  const handleDeleteBoard = async (boardId: number) => {
    try {
      if (authToken === null) throw new Error('Utilisateur non authentifié.');
      await deleteBoard(boardId, authToken);
      setBoards((prevBoards) => prevBoards.filter((board) => board.board_id !== boardId));
    } catch (error) {
      console.error('Erreur lors de la suppression du board:', error);
    }
  };

  const handleEditBoard = (board: Board) => {
    setEditingBoardId(board.board_id);
    setEditedBoard({ title: board.title, description: board.description });
  };

  const handleCancelEdit = () => {
    setEditingBoardId(null);
    setEditedBoard({ title: '', description: '' });
  };

  const handleSaveEdit = async (boardId: number) => {
    try {
      if (authToken === null) throw new Error('Utilisateur non authentifié.');
      await updateBoard(boardId, editedBoard.title, editedBoard.description, authToken);
      setEditingBoardId(null);
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
            {boards.map((board) => (
              <li key={board.board_id} className={editingBoardId === board.board_id ? 'editing' : ''}>
                <div className="board-item relative">
                  <div>
                    {editingBoardId === board.board_id && id === board.user_id ? (
                      <input
                        type="text"
                        value={editedBoard.title}
                        onChange={(e) => setEditedBoard((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className="editable-title"
                      />
                    ) : (
                      <h3
                        onClick={() => !editingBoardId && handleBoardClick(board.board_id)}
                        className={editingBoardId ? 'disabled' : 'h3-clickable'}
                      >
                        {board.title || 'Sans titre'}
                      </h3>
                    )}
                    {editingBoardId === board.board_id && id === board.user_id ? (
                      <textarea
                        value={editedBoard.description}
                        onChange={(e) => setEditedBoard((prev) => ({ ...prev, description: e.target.value }))
                        }
                        className="editable-description"
                      />
                    ) : (
                      <p>{board.description || 'Aucune description'}</p>
                    )}
                    <p className="small">
                      Créé le : {new Date(board.created_at).toLocaleDateString()}
                    </p>
                    <p className="small">
                      Dernière modification : {new Date(board.modified_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="button-group">
                    {(editingBoardId === board.board_id && id === board.user_id) ? (
                      <>
                        <button
                          onClick={handleCancelEdit}
                          className="cancel"
                        >
                          <XCircle />
                        </button>
                        <button
                          onClick={() => handleSaveEdit(board.board_id)}
                          className="save"
                        >
                          <CheckCircle />
                        </button>
                      </>
                    ) : (
                      <>
                        {id === board.user_id && (
                          <>
                            <button
                              onClick={() => handleEditBoard(board)}
                              className="edit"
                            >
                              <Edit3 />
                            </button>
                            <button
                              className="delete"
                              onClick={() => handleDeleteBoard(board.board_id)}
                            >
                              <Trash2 />
                            </button>
                          </>
                        )}
                        <button
                          className="redirect"
                          onClick={() => handleBoardClick(board.board_id)}
                        >
                          <ArrowRight />
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