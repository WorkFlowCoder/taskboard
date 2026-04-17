const API_BASE_URL = 'http://localhost:8000';

/**
 * Récupère les détails complets d'un tableau (listes, cartes, membres, tags)
 */
export const fetchBoardById = async (id: number| undefined, authToken: string) => {
  if (id === undefined) throw new Error('Id non fourni.');
  try {
    const response = await fetch(`${API_BASE_URL}/boards/${id}/details`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur lors de la récupération du board');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère la liste de tous les tableaux auxquels l'utilisateur a accès
 */
export const fetchAllBoards = async (authToken: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur lors de la récupération des boards');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Crée un nouveau tableau
 */
export const createBoard = async (
  title: string,
  description: string,
  authToken: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur lors de la création du board');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Supprime un tableau (Action réservée au propriétaire dans le backend)
 */
export const deleteBoard = async (boardId: number, authToken: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur lors de la suppression du board');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Met à jour les informations d'un tableau
 */
export const updateBoard = async (
  boardId: number,
  title: string,
  description: string,
  authToken: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur lors de la mise à jour du board');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les statistiques d'utilisation des tableaux
 */
export const getBoardStats = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur lors de la récupération des statistiques');
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur stats:", error);
    throw error;
  }
};

/**
 * Ajoute un commentaire sur une carte
 */
export const addComment = async (cardId: number, content: string, authToken: string) => {
  try {
    // Note: Le router FastAPI pour les commentaires n'a pas forcément de préfixe /boards
    // Il utilise directement /comments selon ta mise à jour précédente.
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        card_id: cardId, 
        content: content 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur lors de la publication du commentaire');
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur addComment:", error);
    throw error;
  }
};

/**
 * Ajouter un nouveau label sur un board
 */
export const createLabel = async ( boardId: number, title: string, color: string, authToken: string | null ) => {
  if (!authToken) throw new Error('Token non fourni.');
  try {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/labels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        color,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || 'Erreur lors de la création du label'
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur service createLabel:', error);
    throw error;
  }
};