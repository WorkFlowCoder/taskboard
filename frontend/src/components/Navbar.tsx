import React from 'react';
import { Settings, LogIn, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme }) => {
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
        <li><Link to="/board">Tableaux</Link></li>
        <li><Link to="/projets">Projets</Link></li>
      </ul>
      <div className="navbar-options">
        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        <Settings size={24} className="lucide-icon" />
        <LogIn size={24} className="lucide-icon" />
      </div>
    </nav>
  );
};

export default Navbar;