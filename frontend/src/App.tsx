import './App.css';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/layout/Footer';
import BoardsPage from './pages/BoardsPage';
import TeamsPage from './pages/TeamsPage';
import ProjectsPage from './pages/ProjectsPage';
import ViewBoard from './pages/ViewBoard';
import ProfilePage from './pages/ProfilePage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // sync DOM + localStorage
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <Router>
      <Navbar isDark={isDark}  setIsDark={setIsDark} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/boards/:id" element={<ViewBoard />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/profil" element={<ProfilePage />} />
      </Routes>
      <Footer isDark={isDark} />
    </Router>
  );
};

export default App;
