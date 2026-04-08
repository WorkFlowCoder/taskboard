import React from 'react';
import './Footer.css';

interface FooterProps {
  isDark: boolean;
}

// Composant Footer pour afficher le pied de page de l'application
// Change de style en fonction du thème (clair ou sombre)

const Footer: React.FC<FooterProps> = ({ isDark }) => {
  return (
    <footer className={`homepage-footer ${isDark ? 'dark' : 'light'}`}>
      <p>&copy; 2026 Trello-Like. Tous droits réservés.</p>
    </footer>
  );
};

export default Footer;