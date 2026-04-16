const API_URL = 'http://localhost:8000';

/**
 * Crée une nouvelle liste dans un tableau.
 * La position est gérée automatiquement par le backend.
 */
export const createList = async (
  listData: { title: string; color: string; board_id: number }, 
  authToken: string
) => {
  try {
    const response = await fetch(`${API_URL}/lists/`, { // Ajout du slash final pour matcher le router
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur lors de la création de la liste');
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur service createList:", error);
    throw error;
  }
};

/**
 * Supprime une liste par son ID.
 */
export const deleteList = async (listId: number, authToken: string) => {
  try {
    const response = await fetch(`${API_URL}/lists/${listId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur lors de la suppression de la liste');
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur service deleteList:", error);
    throw error;
  }
};

/**
 * Met à jour le titre, la couleur ou le board d'une liste.
 */
export const updateList = async (
  listId: number, 
  updateData: { title?: string; color?: string; board_id?: number }, 
  authToken: string
) => {
  try {
    const response = await fetch(`${API_URL}/lists/${listId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur lors de la mise à jour de la liste');
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur service updateList:", error);
    throw error;
  }
};

/**
 * Met à jour la position d'une liste dans un tableau.
 * Le backend se charge de réorganiser les autres listes.
 */
export const updateListPosition = async (
  listId: number,
  newPosition: number,
  authToken: string
) => {
  try {
    const response = await fetch(
      `${API_URL}/lists/${listId}/position`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_position: newPosition,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
        'Erreur lors de la mise à jour de la position de la liste'
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur service updateListPosition:", error);
    throw error;
  }
};