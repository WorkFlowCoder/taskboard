import React, { useState } from 'react';
import { Settings, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import ThemeToggle from "./ThemeToggle";
import AuthModal from "./AuthModal";
import { useAuth } from "./AuthContext";

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

// Composant Navbar pour la barre de navigation principale de l'application
// Permet de naviguer entre les différentes sections et de gérer les options utilisateur

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme }) => {
  const { isAuthenticated, logout } = useAuth(); // Gestion de l'état d'authentification
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // État pour afficher ou masquer la modal d'authentification

  // Fonction pour basculer l'affichage de la modal d'authentification
  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
  };

  // Fonction pour fermer la modal d'authentification
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <LayoutDashboard size={32} className="lucide-icon" />
        </Link>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 className="navbar-title">Trello-Like</h1>
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/teams">Équipes</Link></li>
        <li><Link to="/boards">Tableaux</Link></li>
        <li><Link to="/projects">Projets</Link></li>
      </ul>
      <div className="navbar-options">
        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} /> {/* Commutateur de thème */}
        <Settings size={24} className="lucide-icon" /> {/* Icône des paramètres */}
        {isAuthenticated ? (
          <LogOut size={24} className="lucide-icon" onClick={logout} /> // Icône pour se déconnecter
        ) : (
          <LogIn size={24} className="lucide-icon" onClick={toggleAuthModal} /> // Icône pour se connecter
        )}
      </div>
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />} {/* Modal d'authentification */}
    </nav>
  );
};

export default Navbar;