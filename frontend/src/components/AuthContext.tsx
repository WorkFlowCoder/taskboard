import React, { createContext, useContext, useState, useEffect } from 'react';

// Contexte d'authentification pour gérer l'état de connexion des utilisateurs

// Créer le contexte d'authentification
const AuthContext = createContext(null);

// Fournisseur du contexte d'authentification
// Permet de partager l'état d'authentification et les fonctions de connexion/déconnexion dans toute l'application
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // État pour suivre si l'utilisateur est connecté
  const [authToken, setAuthToken] = useState(null); // État pour stocker le token d'authentification
  const [initials, setInitials] = useState(null); // État pour stocker les initiales

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken'); // Récupère le token du stockage local
    const storedInitials = localStorage.getItem('initials'); // Récupère les initiales du stockage local

    if (storedToken) {
      setIsAuthenticated(true);
      setAuthToken(storedToken);
      setInitials(storedInitials);
    }
  }, []); // Exécuté une seule fois au montage du composant

  // Fonction pour connecter un utilisateur
  const login = (token, initials) => {
    setIsAuthenticated(true);
    setAuthToken(token);
    setInitials(initials);
    localStorage.setItem('authToken', token); // Stocke le token dans le stockage local
    localStorage.setItem('initials', initials); // Stocke les initiales dans le stockage local
  };

  // Fonction pour déconnecter un utilisateur
  const logout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    setInitials(null);
    localStorage.removeItem('authToken'); // Supprime le token du stockage local
    localStorage.removeItem('initials'); // Supprime les initiales du stockage local
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, authToken, initials, login, logout }}>
      {children} {/* Fournit le contexte aux composants enfants */}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour accéder facilement au contexte d'authentification
export const useAuth = () => useContext(AuthContext);