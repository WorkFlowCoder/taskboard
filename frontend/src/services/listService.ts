const API_URL = 'http://localhost:8000';

export const createList = async (listData: { title: string; color: string; board_id: number }, authToken: string) => {
  try {
    const response = await fetch(API_URL+'/lists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la liste');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteList = async (listId: string, authToken: string) => {
  try {
    const response = await fetch(`${API_URL}/lists/${listId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la liste');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};