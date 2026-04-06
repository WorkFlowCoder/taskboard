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