const API_BASE_URL = 'http://localhost:8000';

export const fetchBoardById = async (id: string, authToken: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du board');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchAllBoards = async (authToken: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des boards');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createBoard = async (
  title: string,
  description: string,
  authToken: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du board');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteBoard = async (boardId: string, authToken: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du board');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};