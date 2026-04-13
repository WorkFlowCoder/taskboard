import React from 'react';
import Comments from './Comments';
import './Card.css';

interface CardProps {
  card: any;
  board: any;
  members: any[];
}

const Card: React.FC<CardProps> = ({ card, board, members }) => {
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
          <div className="add-tag-circle" onClick={() => console.log('Add tag clicked')}>+</div>
        </div>
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
        <Comments comments={card.comments} members={members} />
      </div>
    </div>
  );
};

export default Card;