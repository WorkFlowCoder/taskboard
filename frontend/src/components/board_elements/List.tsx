import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from './Card';
import './List.css';
import { Trash2 } from 'lucide-react';
import { deleteList } from '../../services/listService';
import SortableCard from './SortableCard';

interface ListProps {
  list: any;
  board: any;
}

const List: React.FC<ListProps> = ({ list, board }) => {

  const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable(
      { id: list.list_id,
        data: {
          type: 'list',
        },
       }
    );

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

  const [isDeleted, setIsDeleted] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  if (isDeleted) return null;

  const handleDeleteList = async (listId: number) => {
    try {
      const authToken = localStorage.getItem('authToken'); // Retrieve the auth token from local storage
      if (!authToken) {
        throw new Error('Utilisateur non authentifié');
      }

      await deleteList(listId, authToken);
      setIsDeleted(true); // Mark the list as deleted
    } catch (error) {
      console.error('Erreur lors de la suppression de la liste:', error);
    }
  };

  return (
    <div
      className={`list ${isDeleted ? 'hidden' : ''}`}
      ref={setNodeRef}
      style={style}
    >
      <div className="list-header">
        <div className="list-title-wrapper">
          <div
            className="drag-handle"
            {...listeners}
            {...attributes}
          >
            ☰
          </div>
          <h4 className="list-title">
            {list.title}
          </h4>
        </div>
        <Trash2 className="delete-icon" onClick={() => handleDeleteList(list.list_id)} />
      </div>
      <SortableContext
        items={(list.cards ?? []).map((card: { card_id: string }) => card.card_id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="cards-container">
          {list.cards?.map((card: { card_id: string; title: string }) => (
            <SortableCard key={card.card_id} card={card} onClick={() => setSelectedCard(card)} />
          ))}
        </div>
      </SortableContext>
      {selectedCard && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedCard(null)}></div>
          <div className="card-modal">
            <Card
              card={selectedCard}
              board={board}
              members={board.members}
            />
            <button className="closebutton" onClick={() => setSelectedCard(null)}>Fermer</button>
          </div>
        </>
      )}
    </div>
  );
};

export default List;