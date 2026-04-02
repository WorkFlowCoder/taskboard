import React from 'react';
import './Footer.css';

interface FooterProps {
  isDark: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDark }) => {
  return (
    <footer className={`homepage-footer da-color ${isDark ? 'dark' : 'light'}`}>
      <p>&copy; 2026 Trello-Like. Tous droits réservés.</p>
    </footer>
  );
};

export default Footer;