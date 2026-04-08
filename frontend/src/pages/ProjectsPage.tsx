import React, { useEffect, useState } from 'react';
import './ProjectsPage.css';

const ProjectsPage: React.FC = () => {
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        // Simulated API call to fetch boards with lists and cards
        const data = [
          {
            id: 1,
            title: 'Board Alpha',
            totalCards: 100,
            lists: [
              { name: 'À faire', cards: 25 },
              { name: 'En cours', cards: 50 },
              { name: 'Terminé', cards: 25 },
            ],
          },
          {
            id: 2,
            title: 'Board Beta',
            totalCards: 50,
            lists: [
              { name: 'À faire', cards: 10 },
              { name: 'En cours', cards: 20 },
              { name: 'Terminé', cards: 20 },
            ],
          },
        ];
        setBoards(data);
      } catch (err: any) {
        console.error('Error fetching boards:', err);
        setError(err.message);
      }
    };

    fetchBoards();
  }, []);

  return (
    <div className="projects-page">
      <h1>Projets</h1>
      {error ? (
        <p className="error-message">Erreur : {error}</p>
      ) : (
        <div className="projects-list">
          {boards.map((board) => (
            <div key={board.id} className="board-section">
              <h2>{board.title}</h2>
              <ul className="lists-details">
                {board.lists.map((list, index) => {
                  const progress = (list.cards / board.totalCards) * 100;
                  return (
                    <li key={index} className="list-item">
                      <span>{list.name} : {list.cards} cartes</span>
                      <div className="progress-bar">
                        <div
                          className="progress"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;