import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './AuthModal.css';
import { registerUser, loginUser } from '../../services/userService';

interface AuthModalProps {
  onClose: () => void;
}

// Composant React pour gérer l'authentification des utilisateurs
// Permet à un utilisateur de s'enregistrer ou de se connecter
const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // État pour basculer entre connexion et inscription
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // État pour gérer les erreurs de validation
  const [showPassword, setShowPassword] = useState(false); // État pour afficher ou masquer le mot de passe

  // Fonction pour basculer entre les modes connexion et inscription
  const toggleAuthMode = () => setIsLogin(!isLogin);

  // Fonction pour afficher/masquer le mot de passe
  const toggleShowPassword = () => setShowPassword(!showPassword);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;

    const newErrors: { [key: string]: string } = {};

    // Validation des champs du formulaire
    if (!email) {
        newErrors.email = 'L\'email est requis.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'L\'email n\'est pas valide.';
    }

    if (!password) {
        newErrors.password = 'Le mot de passe est requis.';
    }

    if (!isLogin) {
        if (!firstName) {
            newErrors.first_name = 'Le prénom est requis.';
        }
        if (!lastName) {
            newErrors.last_name = 'Le nom est requis.';
        }
        if (!isLogin && firstName === lastName) {
            newErrors.first_name = 'Le prénom et le nom ne peuvent pas être identiques.';
            newErrors.last_name = 'Le prénom et le nom ne peuvent pas être identiques.';
        }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
        try {
            const data = isLogin
              ? await loginUser(email, password)
              : await registerUser(firstName, lastName, email, password);
            // Appeler la méthode login avec le jeton et les informations utilisateur
            login(data.access_token, data.initials);
            // Fermer la modal après succès
            onClose();
        } catch (error: any) {
            setErrors({ api: error.message });
        }
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>{isLogin ? 'Connexion' : 'Créer un compte'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="first_name">Prénom</label>
                <input type="text" id="first_name" name="first_name" />
                {errors.first_name && <span className="error-message">{errors.first_name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Nom</label>
                <input type="text" id="last_name" name="last_name" />
                {errors.last_name && <span className="error-message">{errors.last_name}</span>}
              </div>
            </>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="form-group password-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
              />
              <button
                type="button"
                className="toggle-password-visibility"
                onClick={toggleShowPassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          {errors.api && <span className="error-message">{errors.api}</span>}
          <button type="submit" className="auth-submit-button">
            {isLogin ? 'Se connecter' : 'Créer un compte'}
          </button>
        </form>
        <button onClick={toggleAuthMode} className="auth-toggle-button">
          {isLogin ? 'Créer un compte' : 'Se connecter'}
        </button>
      </div>
    </div>
  );
};

export default AuthModal;