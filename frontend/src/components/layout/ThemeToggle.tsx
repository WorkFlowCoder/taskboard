import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, setIsDark }) => {

  const handleToggleTheme = () => {
    const root = document.documentElement;
    const newTheme = !isDark;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme ? 'dark' : 'light');
    setIsDark(newTheme);
  };

  return (
    <button className="toggleThemeButton" onClick={handleToggleTheme}>
      {isDark ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
};

export default ThemeToggle;