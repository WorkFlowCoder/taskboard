// Service pour gérer les requêtes liées aux utilisateurs
const API_BASE_URL = 'http://localhost:8000'; // URL de base de l'API

// Fonction pour enregistrer un nouvel utilisateur
export const registerUser = async (firstName: string, lastName: string, email: string, password: string) => {
    const response = await fetch(API_BASE_URL+"/register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }), // Données utilisateur
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Une erreur est survenue lors de l\'enregistrement.'); // Gère les erreurs
    }

    return response.json(); // Retourne les données de la réponse
};

// Fonction pour connecter un utilisateur
export const loginUser = async (email: string, password: string) => {
    const response = await fetch(API_BASE_URL+"/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Données de connexion
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Une erreur est survenue lors de la connexion.'); // Gère les erreurs
    }

    return response.json(); // Retourne les données de la réponse
};

// Fonction pour récupérer le profil de l'utilisateur
export const getUserProfile = async (token: string) => {
  try {
    const response = await fetch(API_BASE_URL+"/profile", {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text(); // Log the response body for debugging
      console.error('Unexpected response format:', text);
      throw new Error('Unexpected response format: Not JSON');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Fonction pour supprimer un compte utilisateur
export const deleteUserAccount = async (token: string) => {
    const response = await fetch(API_BASE_URL + "/delete-account", {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Une erreur est survenue lors de la suppression du compte.');
    }

    return response.json(); // Retourne les données de la réponse
};

// Fonction pour mettre à jour un compte utilisateur
export const updateUserAccount = async (token: string, firstName: string, lastName: string, email: string) => {
    const response = await fetch(API_BASE_URL + "/update-account", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Une erreur est survenue lors de la mise à jour du compte.');
    }

    return response.json(); // Retourne les données de la réponse
};

// Fonction pour valider le token
export const validateToken = async (token: string) => {
  try {
    const response = await fetch(API_BASE_URL + "/auth/validate-token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok; // true si le token est valide, false sinon
  } catch (error) {
    console.error('Erreur lors de la validation du token:', error);
    return false;
  }
};