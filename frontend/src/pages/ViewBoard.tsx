import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './ViewBoard.css';
import { fetchBoardById } from '../services/boardService';

// Page ViewBoard pour afficher les détails d'un tableau spécifique

const ViewBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Récupère l'identifiant du tableau depuis l'URL
  const navigate = useNavigate(); // Permet de rediriger l'utilisateur
  const { isAuthenticated, authToken } = useAuth(); // Récupère l'état d'authentification et le token
  const [board, setBoard] = useState<any>(null); // État pour stocker les données du tableau
  const [error, setError] = useState<string | null>(null); // État pour gérer les erreurs

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/board'); // Redirige vers BoardsPage si l'utilisateur n'est pas connecté
      return;
    }

    const fetchBoard = async () => {
      try {
        if (!isAuthenticated) {
          throw new Error('Utilisateur non authentifié');
        }

        const data = await fetchBoardById(id!, authToken); // Récupère les données du tableau via le service
        setBoard(data);
      } catch (err: any) {
        setError(err.message); // Gère les erreurs lors de la récupération des données
      }
    };

    fetchBoard();
  }, [id, isAuthenticated, navigate]);

  if (error) {
    return <p className="error-message">{error}</p>; // Affiche un message d'erreur si nécessaire
  }

  if (!board) {
    return <p>Chargement...</p>; // Affiche un message de chargement si les données ne sont pas encore disponibles
  }

  return (
    <div className="board-page">
      <h1>{board.title || 'Sans titre'}</h1> {/* Affiche le titre du tableau */}
      <p>Description : {board.description || 'Aucune description'}</p> {/* Affiche la description */}
      <p>Créé le : {new Date(board.created_at).toLocaleDateString()}</p> {/* Affiche la date de création */}
      <p>Dernière modification : {new Date(board.modified_at).toLocaleDateString()}</p> {/* Affiche la dernière modification */}
    </div>
  );
};

export default ViewBoard;