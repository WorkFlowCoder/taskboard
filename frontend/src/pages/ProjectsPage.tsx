import React from 'react';
import { useAuth } from '../components/AuthContext';
import './ProjectsPage.css';

const ProjectsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="projects-page">
      {isAuthenticated ? (
        <div>
          <h1>Bienvenue dans la gestion des projets !</h1>
          <p>En travaux !</p>
        </div>
      ) : (
        <div>
          <h1>Veuillez vous connecter pour accéder aux projets.</h1>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;