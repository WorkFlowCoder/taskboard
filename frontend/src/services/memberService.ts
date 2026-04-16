const API_URL = 'http://localhost:8000';

/**
 * Récupère tous les tableaux sur lesquels l'utilisateur travaille, 
 * incluant la liste des membres et leurs rôles respectifs.
 */
export const fetchUserBoardsWithMembers = async (token: string) => {
  const response = await fetch(`${API_URL}/members`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Error fetching user boards with members:', errorData);
    throw new Error(errorData.detail || 'Impossible de récupérer les tableaux et membres.');
  }

  return response.json();
};

/**
 * Supprime un membre d'un tableau spécifique.
 */
export const deleteBoardMember = async (token: string, boardId: number, userId: number) => {
  const response = await fetch(`${API_URL}/members/${boardId}/member/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Error deleting board member:', errorData);
    throw new Error(errorData.detail || 'Erreur lors de la suppression du membre.');
  }
  if (response.status === 204) {
    return { success: true }; 
  }

  return response.json();
};

/**
 * Ajoute un membre dans un tableau spécifique.
 */
export const addBoardMember = async (token: string | null, boardId: number, email: string, role: string) => {
  if (!token) throw new Error('Token non fourni.');
  const response = await fetch(`${API_URL}/members/${boardId}/member`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, role }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Erreur lors de l\'ajout du membre.');
  }
  if(response.status === 204) {
    return { success: true };
  }
  return response.json();
};


/**
 * Met à jour le rôle d'un membre (admin, member, ou transfert d'owner).
 */
export const updateMemberRole = async (boardId: number, userId: number, newRole: string, token: string) => {
  // Validation côté client avant l'envoi
  const validRoles = ["admin", "member", "owner"];
  if (!validRoles.includes(newRole)) {
    throw new Error(`Rôle invalide. Les rôles autorisés sont : ${validRoles.join(", ")}`);
  }

  const response = await fetch(`${API_URL}/members/${boardId}/member/${userId}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ new_role: newRole }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Erreur backend lors du changement de rôle :", errorData);
    throw new Error(errorData.detail || "Impossible de mettre à jour le rôle du membre.");
  }

  return await response.json();
};