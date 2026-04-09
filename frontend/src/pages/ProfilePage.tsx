import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../components/AuthContext';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { isAuthenticated, authToken } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ first_name: string; last_name: string; email: string; initials: string } | null>(null);
  useEffect(() => {
    if (!isAuthenticated || !authToken) {
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
  }, [isAuthenticated, authToken, navigate]);

  if (!profile) {
    return <p>Loading...</p>; // Show loading state while fetching data
  }

  return (
    <div className="profile-page">
      <h1>Mon Profil</h1>
      <div className="profile-card">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.initials)}&background=6a0dad&color=ffffff`}
          alt="Avatar"
          className="profile-avatar"
        />
        <h2>{`${profile.first_name} ${profile.last_name}`}</h2>
        <p>Email: {profile.email}</p>
        <button className="edit-profile-button">Modifier le profil</button>
      </div>
    </div>
  );
};

export default ProfilePage;