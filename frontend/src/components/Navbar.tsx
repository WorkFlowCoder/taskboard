import React, { useState } from 'react';
import { Settings, LogIn, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
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
  const { isAuthenticated, logout, initials } = useAuth(); // Gestion de l'état d'authentification
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // État pour afficher ou masquer la modal d'authentification
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // État pour gérer l'affichage du menu déroulant

  // Fonction pour basculer l'affichage de la modal d'authentification
  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
  };

  // Fonction pour fermer la modal d'authentification
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Fonction pour basculer l'affichage du menu déroulant
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Générer l'URL de l'avatar à partir des initiales
  const getAvatarUrl = (initials: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6a0dad&color=ffffff`;
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
        <li><NavLink to="/teams" className={({ isActive }) => isActive ? 'active-link' : ''}>Équipes</NavLink></li>
        <li><NavLink to="/boards" className={({ isActive }) => isActive ? 'active-link' : ''}>Tableaux</NavLink></li>
        <li><NavLink to="/projects" className={({ isActive }) => isActive ? 'active-link' : ''}>Projets</NavLink></li>
      </ul>
      <div className="navbar-options">
        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} /> {/* Commutateur de thème */}
        <Settings size={24} className="lucide-icon" /> {/* Icône des paramètres */}
        {isAuthenticated ? (
          <div className="auth-info">
            <div className="dropdown" onClick={toggleDropdown}>
              <img
                src={getAvatarUrl(initials)}
                alt="User Avatar"
                className="user-avatar"
              />
              <ChevronDown className="chevron" />
              {isDropdownOpen && (
                <div className="dropdown-menu modern-dropdown">
                  <Link to="/profil" className="dropdown-item">Mon Profil</Link>
                  <div className="dropdown-divider"></div>
                  <span onClick={logout} className="dropdown-item logout-text">Se Déconnecter</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="login-container" onClick={toggleAuthModal}>
            <LogIn size={24} className="lucide-icon" />
            <span className="login-text">Se connecter</span>
          </div>
        )}
      </div>
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />} {/* Modal d'authentification */}
    </nav>
  );
};

export default Navbar;