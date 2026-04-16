import React, { useEffect, useState } from 'react';
import './ProjectsPage.css';
import { getBoardStats } from '../services/boardService';
import { useAuth } from '../components/auth/AuthContext';
import type { BoardStats } from '../types/boardStats';


const ProjectsPage: React.FC = () => {
  const { authToken, loading } = useAuth();
  const [boards, setBoards] = useState<BoardStats[]>([]);

  useEffect(() => {
    if (loading) return;

    const fetchStats = async () => {
      try {
        if (authToken) {
          const stats = await getBoardStats(authToken);
          setBoards(stats);
        } else {
          console.log("Aucun token trouvé dans le localStorage");
        }
      } catch (error) {
        console.log("Erreur lors de la récupération des statistiques des boards:", error);
      }
    };

    fetchStats();
  }, [authToken]);

  if (!authToken) {
    return ( 
    <div className="projects-page">
      <h1>Projets</h1>
     <div className="basic-message">Vous devez être connecté pour accéder à cette page.</div>
    </div>
    );
  }

  return (
    <div className="projects-page">
      <h1>Projets</h1>
      {boards.map((board) => (
        <div key={board.board_id} className="board-section">
          <h2>{board.board_title}</h2>
          <p>Total Cards: {board.total_cards}</p>
          <ul>
            {board.cards_per_list.map((list) => (
              <li key={list.list_id} className="list-item">
                <div className="list-progress">
                  <span>{list.list_title}: {list.card_count} cards</span>
                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{ width: `${(list.card_count / board.total_cards) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ProjectsPage;