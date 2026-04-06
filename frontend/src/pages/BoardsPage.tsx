import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { fetchAllBoards, deleteBoard } from '../services/boardService';
import { useNavigate } from 'react-router-dom';
import CreateBoardModal from '../components/CreateBoardModal'; // Import du nouveau composant CreateBoardModal

// Page BoardsPage pour afficher tous les tableaux de l'utilisateur

const BoardsPage: React.FC = () => {
  const { isAuthenticated, authToken } = useAuth(); // Vérifie l'état d'authentification et récupère le token
  const [boards, setBoards] = useState([]); // État pour stocker les tableaux
  const [error, setError] = useState(null); // État pour gérer les erreurs
  const navigate = useNavigate(); // Permet de rediriger l'utilisateur
  const [isModalOpen, setIsModalOpen] = useState(false); // État pour gérer l'ouverture de la modal

  useEffect(() => {
    if (isAuthenticated && authToken) {
      const fetchBoards = async () => {
        try {
          const data = await fetchAllBoards(authToken); // Récupère les tableaux via le service
          setBoards(data);
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
    // Logique pour créer un nouveau board avec les données de boardData
    console.log('Création du board:', boardData);
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
              <li key={board.board_id || index}>
                <div className="board-item">
                  <div onClick={() => handleBoardClick(board.board_id)}>
                    <h3>{board.title || "Sans titre"}</h3>
                    <p>Description : {board.description || "Aucune description"}</p>
                    <p>Créé le : {new Date(board.created_at).toLocaleDateString()}</p>
                    <p>Dernière modification : {new Date(board.modified_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    className="delete-board-button"
                    onClick={() => handleDeleteBoard(board.board_id)}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun board trouvé.</p> // Message si aucun tableau n'est disponible
        )
      ) : (
        <p>Veuillez vous connecter pour voir vos boards.</p>
      )}
    </div>
  );
};

export default BoardsPage;