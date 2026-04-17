import React, { useEffect, useRef, useState } from 'react';
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
  onUpdateCard: (cardId: number, title: string, description: string) => Promise<boolean>;
  onCreateTag: (title: string, color: string) => void;
  onAssignTag: (tagId: number, cardId: number) => void;
  onRemoveTag: (tagId: number, cardId: number) => void;
}

const Card: React.FC<CardProps> = ({ card, board, members, onDeleteCard, onUpdateCard, onCreateTag, onAssignTag, onRemoveTag }) => {
  const { authToken } = useAuth();
  const tagBoxRef = useRef<HTMLDivElement>(null);
  const [showTagBox, setShowTagBox] = React.useState(false);
  const [onEditMode, setOnEditMode] = useState(false); // État pour gérer le mode édition
  const [editedCard, setEditedCard] = useState({ title: card.title, description: card.description }); // État pour les modifications

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagBoxRef.current &&
        !tagBoxRef.current.contains(event.target as Node)
      ) {
        setShowTagBox(false);
      }
    };
    if (showTagBox) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTagBox]);

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
  };

  const cancelModifications = () => {
    setEditedCard({ title: card.title, description: card.description });
    setOnEditMode(false);
  }

  const saveModifications = async () => {
    const success = await onUpdateCard(card.card_id, editedCard.title, editedCard.description);
    if (success) {
      card.title = editedCard.title;
      card.description = editedCard.description;
      cancelModifications();
    }
  }

  const handleAddTag = (tag_id: number) => {
    onAssignTag(tag_id,card.card_id);
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
              if (!label) return null;
              return (
                <span key={label.label_id} className="card-label" style={{ backgroundColor: label.color }}>
                  {label.title}
                  <span
                    className="remove-label"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTag(label.label_id, card.card_id);
                    }}
                  >
                    ×
                  </span>
                </span>
              );
            })}
          </div>
          <div className="add-tag-circle" onClick={(e) => { e.stopPropagation(); setShowTagBox(true); }}>+</div>
        </div>
        {showTagBox && (
          <div ref={tagBoxRef}> 
            <TagBox
              tags={board.tags}
              cardLabels={card.labels}
              onClose={() => setShowTagBox(false)}
              onCreateTag={onCreateTag}
              onAssignTag={handleAddTag}
            />
          </div>
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