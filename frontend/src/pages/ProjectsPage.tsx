import React, { useEffect, useState } from 'react';
import './ProjectsPage.css';
import { getBoardStats } from '../services/boardService';

const ProjectsPage: React.FC = () => {
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Assurez-vous que le token est stocké dans localStorage
        if (token) {
          const stats = await getBoardStats(token);
          setBoards(stats); // Met à jour l'état avec les données des boards
        } else {
          console.error("Aucun token trouvé dans le localStorage");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques des boards:", error);
      }
    };

    fetchStats();
  }, []);

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