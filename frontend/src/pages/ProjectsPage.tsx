import React, { useEffect, useState } from 'react';
import './ProjectsPage.css';
import { getBoardStats } from '../services/boardService';
import { useAuth } from '../components/auth/AuthContext';
import type { BoardStats } from '../types/boardStats';
import BoardStatsLayout from '../components/stats/BoardStatsLayout';

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
        }
      } catch (error) {
        console.log("Erreur stats:", error);
      }
    };

    fetchStats();
  }, [authToken]);

  if (!authToken) {
    return (
      <div className="projects-page">
        <h1>Projets</h1>
        <div className="basic-message">Vous devez être connecté</div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <h1>Projets</h1>

      {boards.map((board) => (
          <BoardStatsLayout key={board.board_id} {...board} />
      ))}
    </div>
  );
};

export default ProjectsPage;