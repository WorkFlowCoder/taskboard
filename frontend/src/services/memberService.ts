const API_URL = 'http://localhost:8000';

/**
 * Fetch all boards the user is working on, along with members and their roles.
 * @param token - The user's authentication token.
 * @returns A promise resolving to the list of boards with members and roles.
 */
export const fetchUserBoardsWithMembers = async (token: string) => {
  const response = await fetch(`${API_URL}/members`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error fetching user boards with members:', errorData);
    throw new Error(errorData.detail || 'Failed to fetch user boards with members.');
  }

  return response.json();
};

export const deleteBoardMember = async (token: string, boardId: number, memberId: number) => {
  const response = await fetch(`${API_URL}/members/${boardId}/member/${memberId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error deleting board member:', errorData);
    throw new Error(errorData.detail || 'Failed to delete board member.');
  }

  // Handle 204 No Content response
  if (response.status === 204) {
    return null; // No content to parse
  }

  return response.json();
};

export const updateMemberRole = async (boardId: number, userId: number, newRole: string, token: string) => {
  // Ensure the new role is valid before making the request
  if (!["admin", "member","owner"].includes(newRole)) {
    throw new Error("Invalid role. Role must be 'admin', 'member', or 'owner'.");
  }

  const response = await fetch(`${API_URL}/members/${boardId}/member/${userId}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Include the token in the Authorization header
    },
    body: JSON.stringify({ new_role: newRole }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Erreur du backend :", errorData); // Log the backend error for debugging
    throw new Error(errorData.detail || "Failed to update member role.");
  }

  return await response.json();
};