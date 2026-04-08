import React, { useEffect, useState } from 'react';
import { fetchUserBoardsWithMembers } from '../services/memberService';
import './TeamsPage.css';

const TeamsPage: React.FC = () => {
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      const fetchBoards = async () => {
        try {
          const data = await fetchUserBoardsWithMembers(token);
          setBoards(data);
        } catch (err: any) {
          console.error('Error fetching boards:', err);
          setError(err.message);
        }
      };

      fetchBoards();
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <div className="teams-page">
      <h1>Équipes</h1>
      {isAuthenticated ? (
        error ? (
          <p className="error-message">Erreur : {error}</p>
        ) : boards.length > 0 ? (
          <div className="teams-list">
            {boards.map((board: any, boardIndex: number) => (
              <div key={board.id || `board-${boardIndex}`} className="board-section">
                <h2>{board.title}</h2>
                <ul className="members-list">
                  {board.members.map((member: any, memberIndex: number) => (
                    <li key={member.id || `member-${boardIndex}-${memberIndex}`} className="member-item">
                      <span>{member.first_name} {member.last_name}</span>
                      <span className="role">{member.role}</span>
                      <button className="edit-role-button" disabled={member.isSelf}>Modifier Rôle</button>
                    </li>
                  ))}
                </ul>
                <button className="add-member-button">Ajouter un membre</button>
              </div>
            ))}
          </div>
        ) : (
          <p>Aucun board trouvé.</p>
        )
      ) : (
        <>
          <p>Veuillez vous connecter pour voir vos équipes.</p>
        </>
      )}
    </div>
  );
};

export default TeamsPage;