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