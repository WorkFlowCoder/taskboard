import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

// Composant ThemeToggle pour basculer entre les thèmes clair et sombre
const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  return (
    <button 
      onClick={toggleTheme} // Appelle la fonction pour changer de thème
      className="p-2 hover:bg-gray-100 rounded-full" // Style du bouton
      style={{ outline: 'none', border: 'none', background: 'transparent' }}> {/* Bouton transparent */}
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