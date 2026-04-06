import React from 'react';
import { useAuth } from '../components/AuthContext';

const ProjectsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="projects-page">
      {isAuthenticated ? (
        <div>
          <h1>Bienvenue dans la gestion des projets !</h1>
          <p>Voici un aperçu de vos projets :</p>
          <table border="1" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Nom du Projet</th>
                <th>Description</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Projet Alpha</td>
                <td>Un projet innovant pour améliorer la productivité.</td>
                <td>En cours</td>
              </tr>
              <tr>
                <td>Projet Beta</td>
                <td>Un projet de recherche sur les nouvelles technologies.</td>
                <td>Terminé</td>
              </tr>
              <tr>
                <td>Projet Gamma</td>
                <td>Un projet pour développer une application mobile.</td>
                <td>À venir</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <h1>Bienvenue dans la gestion des projets</h1>
          <p>Veuillez vous connecter pour accéder à vos projets.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;