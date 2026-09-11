'use client';

export default function Home() {
  return (
    <main className="site">
      <header className="top">
        <div className="wrap navWrap">
          <a className="brand" href="#home">
            <span className="shield">18</span>
            <span>CTA <b>18</b></span>
          </a>

          <div className="account">
            <button>Connexion</button>
            <a className="signup" href="#game">Inscription</a>
          </div>
        </div>
      </header>

      <section className="welcome" id="home">
        <div className="wrap">
          <div className="crumb">ACCUEIL <span>/</span> BIENVENUE SUR CTA 18</div>

          <div className="welcomeGrid">
            <div>
              <span className="tag">JEU DE GESTION DE SECOURS</span>
              <h1>Bienvenue sur <span>CTA 18</span></h1>
              <p>
                Créez votre centre de secours, gérez vos équipes et intervenez
                face aux situations d'urgence.
              </p>

              <div className="welcomeButtons">
                <a className="play" href="#game">▶ COMMENCER À JOUER</a>
                <a className="how" href="#game">Comment jouer ?</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content wrap" id="game">
        <div className="mainColumn">
          <div className="sectionTitle gameTitle">
            <div>
              <h2>Votre aventure commence ici</h2>
              <p>Les grandes étapes de votre progression</p>
            </div>
          </div>

          <div className="steps">
            <div className="step">
              <span>1</span>
              <div className="stepIcon">🏢</div>
              <h3>Créez votre centre</h3>
              <p>Choisissez votre départ et construisez votre organisation.</p>
            </div>

            <div className="step">
              <span>2</span>
              <div className="stepIcon">👨‍🚒</div>
              <h3>Formez vos équipes</h3>
              <p>Recrutez et préparez vos sapeurs-pompiers.</p>
            </div>

            <div className="step">
              <span>3</span>
              <div className="stepIcon">🚨</div>
              <h3>Partez en intervention</h3>
              <p>Répondez aux alertes et engagez les moyens.</p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap footerWrap">
          <span>© 2026 CTA 18</span>
          <span>Jeu de gestion et de simulation</span>
        </div>
      </footer>
    </main>
  );
}