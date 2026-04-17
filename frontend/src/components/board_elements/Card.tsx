import React, { useState } from 'react';
import Comments from './Comments';
import { addComment } from '../../services/boardService';
import { useAuth } from '../auth/AuthContext';
import { Edit3, Trash2, XCircle, CheckCircle } from "lucide-react";
import TagBox from './TagBox';
import './Card.css';

interface CardProps {
  card: any;
  board: any;
  members: any[];
  onDeleteCard: (cardId: number) => void;
  onUpdateCard: (cardId: number, title: string, description: string) => boolean;
  onUpdateList: () => void;
}

const Card: React.FC<CardProps> = ({ card, board, members, onDeleteCard, onUpdateCard, onUpdateList }) => {
  const { authToken } = useAuth();
  const [showTagBox, setShowTagBox] = React.useState(false);
  const [onEditMode, setOnEditMode] = useState(false); // État pour gérer le mode édition
  const [editedCard, setEditedCard] = useState({ title: card.title, description: card.description }); // État pour les modifications
  //intégration de la modification de la card (titre et description) à faire
  const handleAddComment = async (content: string) => {

    try {
      if (!authToken) {
        throw new Error('Utilisateur non authentifié');
      }
      await addComment(card.card_id, content, authToken);
      return {"send": true, "message": "ok"};
    } catch (error: any) {
      return {"send": false, "message": error.message};
    }
  };

  const handleDeleteCard = (cardId: number) => {
    onDeleteCard(cardId);
    onUpdateList();
  };

  const cancelModifications = () => {
    setEditedCard({ title: card.title, description: card.description });
    setOnEditMode(false);
  }

  const saveModifications = () => {
    const success = onUpdateCard(card.card_id, editedCard.title, editedCard.description);
    if (success) {
      card.title = editedCard.title;
      card.description = editedCard.description;
      cancelModifications();
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        
        {onEditMode ? (
          <>
            <input
              type="text"
              value={editedCard.title}
              onChange={(e) => setEditedCard((prev) => ({ ...prev, title: e.target.value }))}
              className="editable-card-title"
            />
            <div className="card-cancel-or-save-btns">
              <button
                className="card-cancel-btn" 
                onClick={cancelModifications}
              >
                <XCircle size={24} />
              </button>
              <button
                className="card-save-btn" 
                onClick={saveModifications}
              >
                <CheckCircle size={24} />
              </button>
            </div>
          </>
        ):(
          <>
            <h2 className="card-name">{card.title}</h2>
            <div className="card-edit-or-delete-btns">
              <button
                className="card-edit-btn" 
                onClick={() => setOnEditMode(true)}
              >
                <Edit3 size={24} />
              </button>
              <button
                className="card-delete-btn" 
                onClick={() => handleDeleteCard(card.card_id)}
              >
                <Trash2 size={24} />
              </button>
            </div>
          </>
        )}
        <div className="card-labels-container">
          <div className="card-labels">
            {card.labels?.map((labelId: number) => {
              const label = board.tags?.find((tag: any) => tag.label_id === labelId);
              return label ? (
                <span
                  key={label.label_id}
                  className="card-label"
                  style={{ backgroundColor: label.color }}
                >
                  {label.title}
                </span>
              ) : null;
            })}
          </div>
          <div className="add-tag-circle" onClick={() => setShowTagBox(true)}>+</div>
        </div>
        {showTagBox && (
        <TagBox
          tags={board.tags}
          onClose={() => setShowTagBox(false)}
          onCreateTag={(title) => {
            console.log("CREATE TAG:", title);
            // TODO: call API create tag
          }}
          onAssignTag={(tagId) => {
            console.log("ASSIGN TAG:", tagId, "TO CARD", card.card_id);
            // TODO: call API assign tag
          }}
        />
      )}
      </div>
      <div className="card-body">
        <div className="card-description-container">
          <h3>Description :</h3>
          {onEditMode ? (
            <textarea
              value={editedCard.description}
              onChange={(e) => setEditedCard((prev) => ({ ...prev, description: e.target.value }))}
              className="editable-card-description"
            />
          ):(
            <p className="card-description">{card.description || 'Pas de description'}</p>
          )}
        </div>
        <div className="card-members">
          {card.members?.map((memberId: number) => {
            const member = board.members?.find((m: any) => m.user_id === memberId);
            return member ? (
              <span key={member.user_id} className="card-member">
                {member.first_name} {member.last_name}
              </span>
            ) : null;
          })}
        </div>
      </div>
      <div className="card-footer">
        <h4>Commentaires :</h4>
        <Comments 
          comments={card.comments}
          members={members}
          onAddComment={handleAddComment}
        />
      </div>
    </div>
  );
};

export default Card;