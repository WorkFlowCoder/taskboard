import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { validateToken } from '../../services/userService';

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  isAuthenticated: boolean;
  authToken: string | null;
  initials: string | null;
  srcImg: string;
  loading: boolean;
  login: (token: string, initials: string) => void;
  logout: () => void;
  updateProfile: (newInitials: string, newToken: string) => void;
  isTokenValid: (token: string | null) => Promise<boolean>;
}

// Créer le contexte d'authentification
const AuthContext = createContext<AuthContextType  | null>(null);

// Fournisseur du contexte d'authentification
// Permet de partager l'état d'authentification et les fonctions de connexion/déconnexion dans toute l'application
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Déclaration des états avec useState
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // État pour suivre si l'utilisateur est connecté
  const [authToken, setAuthToken] = useState<string | null>(null); // État pour stocker le token d'authentification
  const [initials, setInitials] = useState<string>(""); // État pour stocker les initiales
  const [srcImg, setSrcImg] = useState<string>(""); // État pour stocker l'URL de l'image de profil
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken'); // Récupère le token du stockage local
    const storedInitials = localStorage.getItem('initials'); // Récupère les initiales du stockage local
    if (storedToken && storedInitials) {
      const valid = isTokenValid(storedToken);
      if (!valid) {
        logout(); // Déconnecter l'utilisateur si le token est invalide
      } else {
        setAuthToken(storedToken);
        setInitials(storedInitials);
        setIsAuthenticated(true);
        setSrcImg(`https://ui-avatars.com/api/?name=${encodeURIComponent(storedInitials)}&background=6a0dad&color=ffffff`); // Génère l'URL de l'image de profil
      }
    }
    setLoading(false);
  }, []); // Exécuté une seule fois au montage du composant

  // Fonction pour connecter un utilisateur
  const login = (token: string | null, initials: string) => {
    setIsAuthenticated(true);
    setAuthToken(token);
    setInitials(initials);
    localStorage.setItem('authToken', token!); // Stocke le token dans le stockage local
    localStorage.setItem('initials', initials!); // Stocke les initiales dans le stockage local
    setSrcImg(`https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6a0dad&color=ffffff`);
    
    window.location.reload(); // Rafraîchissement de la page après la connexion
  };

  // Fonction pour déconnecter un utilisateur
  const logout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    setInitials("");
    setSrcImg("");
    localStorage.removeItem('authToken'); // Supprime le token du stockage local
    localStorage.removeItem('initials'); // Supprime les initiales du stockage local

    window.location.reload(); // Rafraîchissement de la page après la déconnexion
  };

  // Fonction pour mettre à jour les initiales
  const updateProfile = (newInitials: string, newToken: string) => {
    setInitials(newInitials);
    setAuthToken(newToken);
    setSrcImg(`https://ui-avatars.com/api/?name=${encodeURIComponent(newInitials)}&background=6a0dad&color=ffffff`);
    localStorage.setItem('initials', newInitials); // Met à jour les initiales dans le stockage local
    localStorage.setItem('authToken', newToken); // Met à jour le token dans le stockage local
  };

  const isTokenValid = async (token: string | null): Promise<boolean> => {
    if (token!=null) {
      const valid = await validateToken(token);
      if (valid) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, authToken, initials, srcImg, loading, login, logout, updateProfile, isTokenValid }}>
      {children} {/* Fournit le contexte aux composants enfants */}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  }
  return context;
};