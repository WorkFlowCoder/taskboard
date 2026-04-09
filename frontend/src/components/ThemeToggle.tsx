import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

// Composant ThemeToggle pour basculer entre les thèmes clair et sombre
const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  const themeToggleStyle = {
    padding: "0px",
    paddingTop: "5px",
    paddingBottom: "5px",
    border: "none",
    background: "transparent",
    borderRadius: "50%",
    outline: "none",
  };

  return (
    <button 
      onClick={toggleTheme} // Appelle la fonction pour changer de thème
      style={themeToggleStyle} // Style du bouton
    >
      {isDark ? <Sun size={24} className="lucide-icon" /> : <Moon size={24} className="lucide-icon" />} {/* Affiche une icône selon le thème */}
    </button>
  );
};

export default ThemeToggle;

// Ajout d'une vérification stricte pour protéger --primary-color
const toggleTheme = () => {
  const root = document.documentElement;
  const themeVariables = ['--background-color', '--text-color']; // Liste des variables modifiables

  themeVariables.forEach((variable) => {
    if (variable === '--primary-color') return; // Ignore explicitement --primary-color

    const currentValue = getComputedStyle(root).getPropertyValue(variable).trim();
    root.style.setProperty(variable, currentValue === 'light' ? 'dark' : 'light');
  });
};