import React, { useState } from 'react';
import Card from './Card';
import './List.css';
import { Trash2 } from 'lucide-react';
import { deleteList } from '../services/listService';

interface ListProps {
  list: any;
  board: any;
}

const List: React.FC<ListProps> = ({ list, board }) => {
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDeleteList = async (listId: string) => {
    try {
      const authToken = localStorage.getItem('authToken'); // Retrieve the auth token from local storage
      if (!authToken) {
        throw new Error('Utilisateur non authentifié');
      }

      await deleteList(listId, authToken);
      setIsDeleted(true); // Remove the list from the UI
    } catch (error) {
      console.error('Erreur lors de la suppression de la liste:', error);
    }
  };

  if (isDeleted) return null; // Do not render the list if it is deleted

  return (
    <div className="list">
      <div className="list-header">
        <h4 className="list-title">
            {list.title}
            <Trash2 className="delete-icon" onClick={() => handleDeleteList(list.list_id)} />
        </h4>
      </div>
      <div className="cards-container">
        {list.cards?.map((card: any) => (
          <Card key={card.card_id} card={card} board={board} members={board.members} />
        ))}
      </div>
    </div>
  );
};

export default List;