// Service pour gérer les requêtes liées aux utilisateurs
const API_BASE_URL = 'http://localhost:8000/users'; // Ajout du préfixe /users défini dans FastAPI

/**
 * Enregistre un nouvel utilisateur
 */
export const registerUser = async (firstName: string, lastName: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Une erreur est survenue lors de l\'enregistrement.');
    }

    return response.json();
};

/**
 * Connecte un utilisateur
 */
export const loginUser = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Email ou mot de passe incorrect.');
    }

    return response.json();
};

/**
 * Récupère le profil de l'utilisateur actuel
 */
export const getUserProfile = async (token: string | null) => {
    if (!token) {
        throw new Error('Token non fourni.');
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Impossible de récupérer le profil.');
    }

    return response.json();
};

/**
 * Supprime le compte de l'utilisateur
 */
export const deleteUserAccount = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/delete-account`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Une erreur est survenue lors de la suppression.');
    }

    // Pour un status 204 No Content, on ne fait pas .json()
    if (response.status === 204) return { success: true };
    return response.json();
};

/**
 * Met à jour les informations du compte
 */
export const updateUserAccount = async (token: string, firstName: string, lastName: string, email: string) => {
    const response = await fetch(`${API_BASE_URL}/update-account`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la mise à jour du compte.');
    }

    return response.json();
};

/**
 * Valide si le token est toujours actif
 */
export const validateToken = async (token: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        return response.ok; 
    } catch (error) {
        console.error('Erreur réseau lors de la validation du token:', error);
        return false;
    }
};