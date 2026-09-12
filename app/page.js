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
            <a className="signup" href="#discover">Inscription</a>
          </div>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="wrap heroGrid">
          <div className="heroCopy">
            <span className="tag">🚨 SIMULATION OPÉRATIONNELLE</span>
            <h1>Gérez les secours.<br /><span>À l'échelle d'un SDIS.</span></h1>
            <p>
              Prenez le contrôle d'un service départemental d'incendie et de secours,
              coordonnez les centres, engagez vos véhicules et préparez-vous à répondre aux alertes.
            </p>
            <div className="welcomeButtons">
              <a className="play" href="#discover">▶️ COMMENCER À JOUER</a>
              <a className="how" href="#concept">Comment ça fonctionne ?</a>
            </div>
            <div className="heroStats">
              <div><b>🇫🇷</b><span>SDIS français</span></div>
              <div><b>🚒</b><span>Centres réels</span></div>
              <div><b>📍</b><span>Carte en partie</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="concept" id="concept">
        <div className="wrap">
          <div className="sectionIntro">
            <span>LE CONCEPT CTA 18</span>
            <h2>Vous ne gérez pas une caserne.<br />Vous gérez <em>tout un territoire.</em></h2>
            <p>Choisissez un SDIS français et prenez les décisions opérationnelles pour l'ensemble du département.</p>
          </div>
          <div className="conceptGrid">
            <article className="conceptCard">
              <div className="cardNumber">01</div>
              <div className="conceptIcon">🇫🇷</div>
              <h3>Choisissez votre SDIS</h3>
              <p>Jouez sur un département français et pilotez son organisation opérationnelle.</p>
            </article>
            <article className="conceptCard">
              <div className="cardNumber">02</div>
              <div className="conceptIcon">🏢</div>
              <h3>Commandez les centres</h3>
              <p>Gérez les effectifs, les engins et la disponibilité des centres réels.</p>
            </article>
            <article className="conceptCard">
              <div className="cardNumber">03</div>
              <div className="conceptIcon">🚨</div>
              <h3>Engagez les secours</h3>
              <p>Recevez les alertes et choisissez les moyens adaptés à chaque intervention.</p>
            </article>
            <article className="conceptCard accent">
              <div className="cardNumber">04</div>
              <div className="conceptIcon">🗺️</div>
              <h3>Suivez les véhicules</h3>
              <p>Une vraie carte opérationnelle sera disponible une fois votre partie lancée.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="operation" id="discover">
        <div className="wrap operationGrid">
          <div className="operationCopy">
            <span>LE JEU COMMENCE ICI</span>
            <h2>Préparez-vous à prendre le commandement.</h2>
            <p>Créez votre partie, choisissez votre SDIS et entrez dans votre centre de commandement.</p>
            <a className="textLink" href="#home">Découvrir CTA 18 →</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap footerWrap">
          <div><b>CTA 18</b><span>Jeu de gestion et de simulation des secours</span></div>
          <span>© 2026 CTA 18</span>
        </div>
      </footer>
    </main>
  );
}
