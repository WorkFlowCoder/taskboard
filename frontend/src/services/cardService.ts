const API_URL = 'http://localhost:8000';

/**
 * 
 * Déplace une carte vers une nouvelle liste et/ou une nouvelle position.
 */
export const moveCard = async ( cardId: number, data: { new_list_id: number; new_position: number }, authToken: string ) => {
  try {
    const response = await fetch(`${API_URL}/cards/${cardId}/move`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_list_id: data.new_list_id,
        new_position: data.new_position,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || 'Erreur lors du déplacement de la card'
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur service moveCard:", error);
    throw error;
  }
};

/**
 * Crée une nouvelle carte dans une liste.
 */
export const createCard = async ( listId: number, title: string, description: string, authToken: string | null ) => {
  if (!authToken) throw new Error('Token non fourni.');
  try {
    const response = await fetch(`${API_URL}/cards/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        list_id: listId,
        title,
        description,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || 'Erreur lors de la création de la card'
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur service createCard:', error);
    throw error;
  }
};

/**
 * Supprime une carte.
 */
export const deleteCard = async ( cardId: number, authToken: string | null ) => {
  if (!authToken) throw new Error('Token non fourni.');
  try {
    const response = await fetch(`${API_URL}/cards/${cardId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || 'Erreur lors de la suppression de la card'
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur service deleteCard:', error);
    throw error;
  }
};

/**
 * Met à jour une carte (titre + description).
 */
export const updateCard = async ( cardId: number, title: string, description: string, authToken: string | null ) => {
  if (!authToken) throw new Error('Token non fourni.');
  try {
    const response = await fetch(`${API_URL}/cards/${cardId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || 'Erreur lors de la mise à jour de la card'
      );
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur service updateCard:', error);
    throw error;
  }
};

/**
 * Ajoute un label à une carte
 */
export const addLabelToCard = async ( cardId: number, labelId: number, authToken: string | null ) => {
  if (!authToken) throw new Error('Token non fourni.');
  try {
    const response = await fetch(
      `${API_URL}/cards/${cardId}/labels/${labelId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || "Erreur lors de l’ajout du label"
      );
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur addLabelToCard:', error);
    throw error;
  }
};

/**
 * Retire un label d'une carte
 */
export const removeLabelFromCard = async ( cardId: number, labelId: number, authToken: string | null) => {
  if (!authToken) throw new Error('Token non fourni.');
  try {
    const response = await fetch(
      `${API_URL}/cards/${cardId}/labels/${labelId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || 'Erreur lors de la suppression du label'
      );
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur removeLabelFromCard:', error);
    throw error;
  }
};