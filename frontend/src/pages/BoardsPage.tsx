import React from 'react';

const BoardsPage: React.FC = () => {
  return (
    <div className="boards-page">
      <h1>Tableaux</h1>
      <p>Gérez vos tableaux pour organiser vos tâches et projets.</p>
      <ul>
        <li>Créer un nouveau tableau</li>
        <li>Voir les tableaux existants</li>
        <li>Partager des tableaux avec votre équipe</li>
      </ul>
    </div>
  );
};

export default BoardsPage;