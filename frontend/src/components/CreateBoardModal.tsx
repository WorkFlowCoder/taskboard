import React, { useState } from 'react';
import './CreateBoardModal.css';
import { createBoard } from '../services/boardService'; // Import de la fonction createBoard
import { useAuth } from '../components/AuthContext'; // Import du contexte d'authentification
import { useNavigate } from 'react-router-dom'; // Import pour redirection ou rafraîchissement

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (boardData: { title: string; description?: string }) => void;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ isOpen, onClose, onCreate }) => {
  const { authToken } = useAuth(); // Récupération du token d'authentification
  const navigate = useNavigate(); // Hook pour redirection ou rafraîchissement
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    const newErrors: { [key: string]: string } = {};

    if (!title) {
      newErrors.title = 'Le titre est requis.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const newBoard = await createBoard(title, description, authToken); // Appel à la requête de création
        onCreate(newBoard); // Passe le board créé au parent
        onClose();
        navigate(0); // Rafraîchit la page après une création réussie
      } catch (error: any) {
        setErrors({ api: error.message }); // Gestion des erreurs de l'API
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-board-modal-overlay">
      <div className="create-board-modal">
        <button className="create-board-modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Créer un nouveau Board</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre</label>
            <input type="text" id="title" name="title" />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" />
          </div>
          <button type="submit" className="create-board-submit-button">
            Créer
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;