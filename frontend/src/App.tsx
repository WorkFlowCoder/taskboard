import './App.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import BoardsPage from './pages/BoardsPage';
import TeamsPage from './pages/TeamsPage';
import ProjectsPage from './pages/ProjectsPage';
import ViewBoard from './pages/ViewBoard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Router>
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/boards/:id" element={<ViewBoard />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
      <Footer isDark={isDark} />
    </Router>
  );
};

export default App;
