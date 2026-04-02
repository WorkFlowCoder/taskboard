import React from 'react';

const ProjectsPage: React.FC = () => {
  return (
    <div className="projects-page">
      <h1>Projets</h1>
      <p>Suivez l'avancement de vos projets et atteignez vos objectifs.</p>
      <ul>
        <li>Créer un nouveau projet</li>
        <li>Voir les projets en cours</li>
        <li>Analyser les performances des projets terminés</li>
      </ul>
    </div>
  );
};

export default ProjectsPage;