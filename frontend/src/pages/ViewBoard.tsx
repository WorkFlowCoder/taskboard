import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './ViewBoard.css';
import { fetchBoardById } from '../services/boardService';
import { createList } from '../services/listService';
import List from '../components/List';

const ViewBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, authToken } = useAuth();
  const [board, setBoard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newList, setNewList] = useState({ title: '', color: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/boards');
      return;
    }

    const fetchBoard = async () => {
      try {
        if (!isAuthenticated) {
          throw new Error('Utilisateur non authentifié');
        }

        const data = await fetchBoardById(id!, authToken);
        setBoard(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchBoard();
  }, [id, isAuthenticated, navigate]);

  const handleCreateList = async () => {
    try {
      const createdList = await createList({ ...newList, board_id: board.board_id }, authToken);
      setBoard((prevBoard: any) => ({
        ...prevBoard,
        lists: [...prevBoard.lists, createdList],
      }));
      setShowPopup(false);
      setNewList({ title: '', color: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!board) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="board-page">
      <header className="board-header">
        <h3 className="board-title">{board.title || 'Sans titre'}</h3>
        <p className="board-description">{board.description || 'Aucune description'}</p>
      </header>
      <div className="kanban-container">
        {board.lists?.map((list: any) => (
          <List key={list.list_id} list={list} board={board} members={board.members} />
        ))}
        <div className="add-list-button" onClick={() => setShowPopup(true)}>
          + Ajouter une liste
        </div>
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h4>Créer une nouvelle liste</h4>
            <input
              type="text"
              placeholder="Titre"
              value={newList.title}
              onChange={(e) => setNewList({ ...newList, title: e.target.value })}
            />
            <input
              type="color"
              value={newList.color}
              onChange={(e) => setNewList({ ...newList, color: e.target.value })}
            />
            <button onClick={handleCreateList}>Créer</button>
            <button onClick={() => setShowPopup(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBoard;