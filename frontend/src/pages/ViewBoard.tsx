import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './ViewBoard.css';
import { fetchBoardById } from '../services/boardService';
import { createList } from '../services/listService';
import List from '../components/List';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, useSortable, SortableContext, horizontalListSortingStrategy, rectSortingStrategy  } from '@dnd-kit/sortable';
import { DragOverlay } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { pointerWithin , closestCorners} from '@dnd-kit/core';

const ViewBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, authToken } = useAuth();
  const [board, setBoard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newList, setNewList] = useState({ title: '', color: '' });
  const [activeList, setActiveList] = useState<any>(null);
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

  const customCollisionStrategy = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return closestCorners(args);
  };

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

  const handleDragStart = ({ active }: any) => {
    const type = active.data.current?.type; // 🔥 IMPORTANT

    if (type === 'card') {
      const sourceList = findListByCardId(active.id);

      if (sourceList) {
        const card = sourceList.cards.find(
          (c: any) => c.card_id === active.id
        );
        setActiveCard(card);
      }
    }

    if (type === 'list') {
      const list = board.lists.find(
        (l: any) => l.list_id === active.id
      );
      setActiveList(list);
    }
  };

  const handleDragEnd = ({ active, over }: any) => {
    setActiveCard(null);
    setActiveList(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // --- LOGIQUE POUR LES LISTES ---
    if (activeType === 'list') {
      if (activeId !== overId) {
        const oldIndex = board.lists.findIndex((l: any) => l.list_id === activeId);
        const newIndex = board.lists.findIndex((l: any) => l.list_id === overId);
        
        setBoard((prev: any) => ({
          ...prev,
          lists: arrayMove(prev.lists, oldIndex, newIndex),
        }));
      }
      return;
    }

    // --- LOGIQUE POUR LES CARTES ---
    const sourceList = findListByCardId(activeId);
    // Si on survole une carte, targetList est la liste qui la contient.
    // Si on survole le conteneur vide, overId est l'ID de la liste directement.
    const targetList = overType === 'list' 
      ? board.lists.find((l: any) => l.list_id === overId)
      : findListByCardId(overId);

    if (!sourceList || !targetList) return;

    const sourceCards = [...sourceList.cards];
    const targetCards = [...targetList.cards];

    const activeIndex = sourceCards.findIndex((c: any) => c.card_id === activeId);
    
    // CALCUL DE L'INDEX D'INSERTION
    let insertIndex;
    if (overType === 'list') {
      // Si on drop sur la liste elle-même (zone vide ou en-tête)
      insertIndex = 0; 
    } else {
      // Si on drop sur une autre carte
      insertIndex = targetCards.findIndex((c: any) => c.card_id === overId);
    }

    // Empêcher les mutations inutiles si c'est la même position
    if (sourceList.list_id === targetList.list_id && activeIndex === insertIndex) return;

    if (sourceList.list_id === targetList.list_id) {
      // Réorganiser dans la même liste
      const updated = arrayMove(sourceCards, activeIndex, insertIndex);
      setBoard((prev: any) => ({
        ...prev,
        lists: prev.lists.map((l: any) =>
          l.list_id === sourceList.list_id ? { ...l, cards: updated } : l
        ),
      }));
    } else {
      // Déplacement entre deux listes
      const [moved] = sourceCards.splice(activeIndex, 1);
      targetCards.splice(insertIndex, 0, moved);
      setBoard((prev: any) => ({
        ...prev,
        lists: prev.lists.map((l: any) => {
          if (l.list_id === sourceList.list_id) return { ...l, cards: sourceCards };
          if (l.list_id === targetList.list_id) return { ...l, cards: targetCards };
          return l;
        }),
      }));
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
      <DndContext sensors={sensors} collisionDetection={customCollisionStrategy} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="kanban-container">
          <SortableContext
            items={board.lists.map((list: any) => list.list_id)}
            strategy={rectSortingStrategy}
          >
            {board.lists?.map((list: any) => (
              <List key={list.list_id} list={list} board={board}/>
            ))}
          </SortableContext>
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