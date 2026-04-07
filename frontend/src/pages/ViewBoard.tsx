import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './ViewBoard.css';
import { fetchBoardById } from '../services/boardService';

const ViewBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, authToken } = useAuth();
  const [board, setBoard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
        console.log(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchBoard();
  }, [id, isAuthenticated, navigate]);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!board) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="board-page">
      <h1>{board.title || 'Sans titre'}</h1>
      <p>Description : {board.description || 'Aucune description'}</p>
      <p>Créé le : {new Date(board.created_at).toLocaleDateString()}</p>
      <p>Dernière modification : {new Date(board.modified_at).toLocaleDateString()}</p>
      <div className="kanban-container">
        {board.lists?.map((list: any) => (
          <div key={list.list_id} className="list">
            <h2 className="list-title">{list.title}</h2>
            <div className="cards-container">
              {list.cards?.map((card: any) => (
                <div key={card.card_id} className="card">
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-description">{card.description || 'Pas de description'}</p>
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
                  <div className="card-comments">
                    <h4>Commentaires :</h4>
                    {card.comments?.map((comment: any) => (
                      <p key={comment.comment_id} className="card-comment">
                        {comment.content}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewBoard;