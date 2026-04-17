import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import './ViewBoard.css';
import { fetchBoardById } from '../services/boardService';
import { createList, updateListPosition } from '../services/listService';
import { createCard, deleteCard, moveCard, updateCard } from '../services/cardService';
import List from '../components/board_elements/List';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy  } from '@dnd-kit/sortable';
import { DragOverlay } from '@dnd-kit/core';
import { pointerWithin , closestCorners } from '@dnd-kit/core';
import type { CollisionDetection } from '@dnd-kit/core';

const ViewBoard: React.FC = () => {
  const { id } = useParams<{id:string}>();
  const boardId = Number(id);
  const navigate = useNavigate();
  const { isAuthenticated, authToken, loading } = useAuth();
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
  if (loading) return;

  if (!isAuthenticated) {
    navigate('/boards');
    return;
  }

    const fetchBoard = async () => {
      try {
        if (!authToken) throw new Error('Utilisateur non authentifié.');
        const data = await fetchBoardById(boardId, authToken);
        setBoard(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchBoard();
  }, [id, isAuthenticated, navigate]);

  const customCollisionStrategy : CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return closestCorners(args);
  };

  const handleCreateList = async () => {
    try {
      if (authToken === null) throw new Error('Utilisateur non authentifié.');
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

  const handleCreateCard = async ( listId: number, title: string, description: string ) => {
    try {
      const newCard = await createCard( listId, title, description, authToken );
      setBoard((prevBoard: any) => ({
        ...prevBoard,
        lists: prevBoard.lists.map((list: any) =>
          list.list_id === listId
            ? { ...list, cards: [...list.cards, newCard] } : list
        ),
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const onDeleteCard = async (cardId: number) => {
    try {
      const response = await deleteCard(cardId, authToken);

      const { list_id } = response;

      setBoard((prevBoard: any) => ({
        ...prevBoard,
        lists: prevBoard.lists.map((list: any) =>
          list.list_id === list_id
            ? {
                ...list,
                cards: list.cards.filter(
                  (card: any) => card.card_id !== cardId
                ),
              }
            : list
        ),
      }));
    } catch (error) {
      console.error("Erreur delete card:", error);
    }
  };

  const onUpdateCard = async (cardId: number, title: string, description: string) => {
    try {
      await updateCard(cardId, title, description, authToken);

      setBoard((prevBoard: any) => ({
        ...prevBoard,
        lists: prevBoard.lists.map((list: any) => ({
          ...list,
          cards: list.cards.map((card: any) =>
            card.card_id === cardId
              ? { ...card, title, description }
              : card
          ),
        })),
      }));
      return true;
    } catch (error) {
      console.error("Erreur update card:", error);
    }
    return false;
  }

  const findListByCardId = (cardId: number) => {
    return board.lists.find((list: any) =>
      list.cards.some((card: any) => card.card_id === cardId)
    );
  };

  const handleDragStart = ({ active }: any) => {
    const type = active.data.current?.type;
    if (type === 'card') {
      const sourceList = findListByCardId(active.id);

      if (sourceList) {
        const card = sourceList.cards.find(
          (c: any) => c.card_id === active.id
        );
        setActiveCard(card);
      }
    }
  };

  const syncListPosition = async ( listId: number, newIndex: number, previousLists: any[]) => {
    try {
      if (!authToken) {
        throw new Error("Utilisateur non authentifié.");
      }
      await updateListPosition(listId, newIndex, authToken);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la position de la liste :", error);
      // Rollback en cas d'échec
      setBoard((prev: any) => ({...prev, lists: previousLists}));
    }
  };

  const syncCardPosition = async ( cardId: number, newListId: number, newIndex: number, previousBoard: any) => {
    try {
      if (!authToken) {
        throw new Error("Utilisateur non authentifié.");
      }
      await moveCard(cardId, { new_list_id: newListId, new_position: newIndex }, authToken);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la position de la card :",error);
      // Rollback complet du board
      setBoard((prev: any) => ({...prev, lists: previousBoard.lists}));
    }
  };

  const normalizeListPositions = (lists: any[]) => {
    return lists.map((list, index) => ({
      ...list,
      position: index
    }));
  };

  const normalizeCardPositions = (cards: any[]) => {
    return cards.map((card, index) => ({
      ...card,
      position: index
    }));
  };

  const handleDragEnd = async ({ active, over }: any) => {
    setActiveCard(null);
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
        const previousLists = [...board.lists];
        const reordered = arrayMove(previousLists, oldIndex, newIndex);
        const normalized = normalizeListPositions(reordered);
        setBoard((prev: any) => ({
          ...prev,
          lists: normalized,
        }));
        const realIndex = normalized.findIndex(
          (l: any) => l.list_id === activeId
        );
        // Synchronisation avec le backend
        await syncListPosition(activeId, realIndex, previousLists);
      }
      return;
    }

    // --- LOGIQUE POUR LES CARTES ---
    const sourceList = findListByCardId(activeId);
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
      insertIndex = 0; 
    } else {
      insertIndex = targetCards.findIndex((c: any) => c.card_id === overId);
    }

    const movedCard = sourceCards[activeIndex];

    if (!movedCard) return;

    if (sourceList.list_id === targetList.list_id) {
      if (activeIndex === insertIndex) return;

      const updated = arrayMove(sourceCards, activeIndex, insertIndex);
      const normalized = normalizeCardPositions(updated);
      const previousBoard = { ...board };

      setBoard((prev: any) => ({
        ...prev, lists: prev.lists.map((l: any) =>
          l.list_id === sourceList.list_id ? { ...l, cards: normalized } : l
        ),
      }));
      await syncCardPosition(activeId, sourceList.list_id, insertIndex, previousBoard );
      return;
    }
    // Cross list move
    const [moved] = sourceCards.splice(activeIndex, 1);
    targetCards.splice(insertIndex, 0, moved);

    const normalizedSource = normalizeCardPositions(sourceCards);
    const normalizedTarget = normalizeCardPositions(targetCards);

    const previousBoard = { ...board };

    setBoard((prev: any) => ({
      ...prev,
      lists: prev.lists.map((l: any) => {
        if (l.list_id === sourceList.list_id) {
          return { ...l, cards: normalizedSource };
        }
        if (l.list_id === targetList.list_id) {
          return { ...l, cards: normalizedTarget };
        }
        return l;
      }),
    }));

    await syncCardPosition( activeId, targetList.list_id, insertIndex, previousBoard);
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
              <List key={list.list_id} list={list} board={board} handleCreateCard={handleCreateCard} onDeleteCard={onDeleteCard} onUpdateCard={onUpdateCard}/>
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
            <button className="popup-content-cancel" onClick={() => setShowPopup(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBoard;