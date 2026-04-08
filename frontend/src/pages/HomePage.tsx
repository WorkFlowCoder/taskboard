import React from 'react';
import { ClipboardList, Users, Rocket } from 'lucide-react';
import './HomePage.css';

// Page HomePage pour présenter l'application Trello-Like

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Bienvenue sur Trello-Like</h1>
        <p>Votre outil ultime pour gérer vos projets et collaborer avec vos équipes.</p>
        <button className="cta-button">Commencer Maintenant</button>
      </header>

      <section className="features">
        <div className="feature">
          <ClipboardList size={48} className="lucide-icon" />
          <h3>Organisation Simplifiée</h3>
          <p>Créez, gérez et suivez vos tâches en toute simplicité.</p>
        </div>
        <div className="feature">
          <Users size={48} className="lucide-icon" />
          <h3>Collaboration Efficace</h3>
          <p>Travaillez avec votre équipe en temps réel, où que vous soyez.</p>
        </div>
        <div className="feature">
          <Rocket size={48} className="lucide-icon" />
          <h3>Boostez Votre Productivité</h3>
          <p>Utilisez nos outils avancés pour atteindre vos objectifs plus rapidement.</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;