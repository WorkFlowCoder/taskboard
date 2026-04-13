import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './ViewBoard.css';
import { fetchBoardById } from '../services/boardService';
import { createList } from '../services/listService';
import List from '../components/List';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { DragOverlay } from '@dnd-kit/core';

const ViewBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, authToken } = useAuth();
  const [board, setBoard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newList, setNewList] = useState({ title: '', color: '' });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const [activeCard, setActiveCard] = useState<any>(null);

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

  const findListByCardId = (cardId) => {
    return board?.lists?.find((list) =>
      list.cards.some((card) => card.card_id === cardId)
    );
  };

  const handleDragStart = ({ active }: { active: any }) => {
    const activeId = active.id;
    const sourceList = findListByCardId(activeId);
    if (sourceList) {
      const card = sourceList.cards.find((card) => card.card_id === activeId);
      setActiveCard(card);
    }
  };

  const handleDragEnd = ({ active, over }: { active: any; over: any }) => {
    setActiveCard(null); // Reset the active card after drag ends
    if (!over) {
      console.error('No target detected for drop.');
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const sourceList = findListByCardId(activeId);
    const targetList = findListByCardId(overId);

    if (sourceList && targetList) {
      const sourceCards = [...sourceList.cards];
      const targetCards = [...targetList.cards];

      const activeIndex = sourceCards.findIndex((card) => card.card_id === activeId);
      const overIndex = targetCards.findIndex((card) => card.card_id === overId);
      if (sourceList.list_id === targetList.list_id) {
        const updatedCards = arrayMove(sourceCards, activeIndex, overIndex);
        setBoard((prevBoard: any) => {
          const newBoard = {
            ...prevBoard,
            lists: prevBoard.lists.map((list) =>
              list.list_id === sourceList.list_id
                ? { ...list, cards: updatedCards }
                : list
            )
          };
          return newBoard;
        });
      } else {
        const [movedCard] = sourceCards.splice(activeIndex, 1);
        targetCards.splice(overIndex, 0, movedCard);

        setBoard((prevBoard: any) => {
          const newBoard = {
            ...prevBoard,
            lists: prevBoard.lists.map((list) => {
              if (list.list_id === sourceList.list_id) {
                return { ...list, cards: sourceCards };
              } else if (list.list_id === targetList.list_id) {
                return { ...list, cards: targetCards };
              } else {
                return list;
              }
            })
          };
          return newBoard;
        });
      }
    } else {
      console.error('Source or target list not found.');
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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>

        <div className="kanban-container">
          {board.lists?.map((list: any) => (
            <List key={list.list_id} list={list} board={board}/>
          ))}
          <div className="add-list-button" onClick={() => setShowPopup(true)}>
            + Ajouter une liste
          </div>
        </div>
        <DragOverlay>
          {activeCard ? (
            <div className="card-title" style={{ cursor: 'grabbing' }}>
              {activeCard.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
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