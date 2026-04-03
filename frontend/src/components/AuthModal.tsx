import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './AuthModal.css';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password: string) => {
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const uppercaseRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;

    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (!specialCharRegex.test(password)) {
      return 'Le mot de passe doit contenir au moins un symbole spécial.';
    }
    if (!uppercaseRegex.test(password)) {
      return 'Le mot de passe doit contenir au moins une majuscule.';
    }
    if (!numberRegex.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre.';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;

    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'L\'email est requis.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'L\'email n\'est pas valide.';
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis.';
    } else {
      const passwordError = validatePassword(password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!isLogin && !username) {
      newErrors.username = 'Le nom d\'utilisateur est requis.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Formulaire valide:', { email, password, username });
    }
  };

  const toggleAuthMode = () => setIsLogin(!isLogin);
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>{isLogin ? 'Connexion' : 'Créer un compte'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input type="text" id="username" name="username" />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
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