import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 hover:bg-gray-100 rounded-full"
      style={{ outline: 'none', border: 'none', background: 'transparent' }}>
      {isDark ? <Sun size={24} className="lucide-icon" /> : <Moon size={24} className="lucide-icon" />}
    </button>
  );
};

export default ThemeToggle;