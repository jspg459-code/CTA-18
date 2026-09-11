'use client';

export default function Home() {
  return (
    <main className="site">
      <header className="top">
        <div className="wrap navWrap">
          <a className="brand" href="#home"><span className="shield">18</span><span>CTA <b>18</b></span></a>
          <nav>
            <a className="active" href="#home">Accueil</a>
            <a href="#game">Le jeu</a>
            <a href="#news">Actualités</a>
            <a href="#ranking">Classement</a>
            <a href="#community">Communauté</a>
          </nav>
          <div className="account"><button>Connexion</button><a className="signup" href="#game">Inscription</a></div>
        </div>
      </header>

      <section className="welcome" id="home">
        <div className="wrap">
          <div className="crumb">ACCUEIL <span>/</span> BIENVENUE SUR CTA 18</div>
          <div className="welcomeGrid">
            <div>
              <span className="tag">JEU DE GESTION DE SECOURS</span>
              <h1>Bienvenue sur <span>CTA 18</span></h1>
              <p>Créez votre centre de secours, gérez vos équipes et intervenez face aux situations d'urgence.</p>
              <div className="welcomeButtons"><a className="play" href="#game">▶ COMMENCER À JOUER</a><a className="how" href="#game">Comment jouer ?</a></div>
            </div>
            <div className="dispatchPreview">
              <div className="dispatchHead"><strong>🚨 CENTRE DE SECOURS</strong><span>EN SERVICE</span></div>
              <div className="dispatchBody">
                <div className="station"><div className="stationIcon">🚒</div><div><b>CIS CTA 18</b><small>Centre opérationnel</small></div><em>●</em></div>
                <div className="miniStats"><div><b>08</b><span>ENGINS</span></div><div><b>24</b><span>EFFECTIFS</span></div><div><b>00</b><span>ALERTES</span></div></div>
              </div>
              <div className="dispatchFoot">PRÊT POUR LA PROCHAINE ALERTE</div>
            </div>
          </div>
        </div>
      </section>

      <section className="content wrap" id="game">
        <div className="mainColumn">
          <div className="sectionTitle"><div><h2>Actualités</h2><p>Les dernières informations de CTA 18</p></div><a href="#news">VOIR TOUTES LES ACTUALITÉS →</a></div>
          <div className="newsGrid" id="news">
            <article className="news featuredNews"><div className="newsImage"><span>🚒</span></div><div className="newsText"><small>MISE À JOUR</small><h3>CTA 18 ouvre bientôt ses portes</h3><p>Découvrez un nouveau jeu de gestion dédié à l'univers des secours et des interventions.</p><span className="date">Aujourd'hui</span></div></article>
            <article className="news"><div className="newsText"><small>COMMUNAUTÉ</small><h3>Construisez votre futur centre de secours</h3><p>Développez votre caserne, vos équipes et votre flotte.</p><span className="date">À venir</span></div></article>
          </div>

          <div className="sectionTitle gameTitle"><div><h2>Votre aventure commence ici</h2><p>Les grandes étapes de votre progression</p></div></div>
          <div className="steps">
            <div className="step"><span>1</span><div className="stepIcon">🏢</div><h3>Créez votre centre</h3><p>Choisissez votre départ et construisez votre organisation.</p></div>
            <div className="step"><span>2</span><div className="stepIcon">👨‍🚒</div><h3>Formez vos équipes</h3><p>Recrutez et préparez vos sapeurs-pompiers.</p></div>
            <div className="step"><span>3</span><div className="stepIcon">🚨</div><h3>Partez en intervention</h3><p>Répondez aux alertes et engagez les moyens.</p></div>
          </div>
        </div>

        <aside className="sidebar">
          <div className="sideCard loginCard"><h3>Déjà membre ?</h3><p>Connectez-vous pour retrouver votre centre.</p><button>SE CONNECTER</button></div>
          <div className="sideCard" id="ranking"><div className="sideHead"><h3>🏆 Classement</h3><a href="#ranking">Voir +</a></div><ol><li><span>1</span><b>CIS Alpha</b><em>12 450 XP</em></li><li><span>2</span><b>Secours Nord</b><em>10 820 XP</em></li><li><span>3</span><b>CTA Rhône</b><em>9 670 XP</em></li></ol></div>
          <div className="sideCard community" id="community"><h3>💬 Communauté</h3><p>Rejoignez les futurs joueurs de CTA 18.</p><a href="#community">EN SAVOIR PLUS →</a></div>
        </aside>
      </section>

      <footer><div className="wrap footerWrap"><span>© 2026 CTA 18</span><span>Jeu de gestion et de simulation</span></div></footer>
    </main>
  );
}