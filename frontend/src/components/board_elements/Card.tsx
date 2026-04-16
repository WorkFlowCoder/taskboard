import React from 'react';
import Comments from './Comments';
import { addComment } from '../../services/boardService';
import { useAuth } from '../auth/AuthContext'; // Import du contexte d'authentification
import TagBox from './TagBox';
import './Card.css';

interface CardProps {
  card: any;
  board: any;
  members: any[];
}

const Card: React.FC<CardProps> = ({ card, board, members }) => {
  const { authToken } = useAuth(); // Récupération du token d'authentification
  const [showTagBox, setShowTagBox] = React.useState(false);

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

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-name">{card.title}</h2>
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
          <p className="card-description">{card.description || 'Pas de description'}</p>
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