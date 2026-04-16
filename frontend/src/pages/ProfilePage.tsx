import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, deleteUserAccount, updateUserAccount } from '../services/userService';
import { useAuth } from '../components/auth/AuthContext';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { isAuthenticated, authToken, srcImg, logout, updateProfile, loading } = useAuth() || {};
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ first_name: string; last_name: string; email: string; initials: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ first_name: '', last_name: '', email: '' });

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/'); // Redirect to homepage if not authenticated
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(authToken);
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        //navigate('/'); // Redirect to homepage on error
      }
    };

    fetchProfile();
  }, [authToken, navigate]);

  const handleDeleteAccount = async () => {
    if (!authToken) return;
    try {
      await deleteUserAccount(authToken);
      logout(); // Nettoie l'état local après suppression
      navigate('/'); // Redirige vers la page d'accueil après suppression
    } catch (error) {
      alert('Une erreur est survenue lors de la suppression de votre compte.');
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedProfile({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile({ first_name: '', last_name: '', email: '' });
  };

  const handleSaveEdit = async () => {
    if (!authToken) return;
    try {
      const updatedData = await updateUserAccount(authToken, editedProfile.first_name, editedProfile.last_name, editedProfile.email);
      setProfile(updatedData);
      setIsEditing(false);
      updateProfile(updatedData.initials, updatedData.access_token); // Met à jour les initiales dans le contexte
    } catch (error) {
      alert('Une erreur est survenue lors de la mise à jour de votre profil.');
    }
  };

  if (!profile) {
    return <p>Loading...</p>; // Show loading state while fetching data
  }

  return (
    <div className="profile-page">
      <h1>Mon Profil</h1>
      <div className="profile-card">
        <img
          src={srcImg}
          alt="Avatar"
          className="profile-avatar"
        />
        {isEditing ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <input
                type="text"
                value={editedProfile.first_name}
                onChange={(e) => setEditedProfile((prev) => ({ ...prev, first_name: e.target.value }))}
                placeholder="Prénom"
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  border: 'none',
                  color: 'orange',
                  background: 'transparent',
                  outline: 'none',
                  textAlign: 'center',
                  width: '100%',
                }}
              />
              <input
                type="text"
                value={editedProfile.last_name}
                onChange={(e) => setEditedProfile((prev) => ({ ...prev, last_name: e.target.value }))}
                placeholder="Nom"
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  border: 'none',
                  color: 'orange',
                  background: 'transparent',
                  outline: 'none',
                  textAlign: 'center',
                  width: '100%',
                }}
              />
              <input
                type="email"
                value={editedProfile.email}
                onChange={(e) => setEditedProfile((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                style={{
                  fontSize: '1rem',
                  fontWeight: 'normal',
                  border: 'none',
                  color: 'orange',
                  background: 'transparent',
                  outline: 'none',
                  textAlign: 'center',
                  width: '100%',
                }}
              />
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={handleCancelEdit}
                style={{
                  fontSize: '1rem',
                  color: 'white',
                  backgroundColor: 'red',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  borderRadius: '5px',
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  fontSize: '1rem',
                  color: 'white',
                  backgroundColor: 'green',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  borderRadius: '5px',
                }}
              >
                Enregistrer
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>{`${profile.first_name} ${profile.last_name}`}</h2>
            <p>Email: {profile.email}</p>
          </>
        )}
        {!isEditing && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={handleEditClick}
              style={{
                fontSize: '1rem',
                color: 'white',
                backgroundColor: 'orange',
                border: 'none',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
            >
              Modifier
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                fontSize: '1rem',
                color: 'white',
                backgroundColor: 'red',
                border: 'none',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
            >
              Supprimer
            </button>
          </div>
        )}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Êtes-vous sûr de vouloir supprimer votre compte ?</h2>
              <p>Cette action est irréversible.</p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                <button className="confirm-button" onClick={handleDeleteAccount}>Oui, supprimer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;