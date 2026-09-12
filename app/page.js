'use client';

export default function Home() {

  return () => {
      if (timer) clearInterval(timer);
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

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
              coordonnez les centres, engagez vos véhicules et suivez chaque intervention sur une vraie carte.
            </p>

            <div className="welcomeButtons">
              <a className="play" href="#discover">▶️ COMMENCER À JOUER</a>
              <a className="how" href="#concept">Comment ça fonctionne ?</a>
            </div>

            <div className="heroStats">
              <div><b>🇫🇷</b><span>SDIS français</span></div>
              <div><b>🚒</b><span>Centres réels</span></div>
              <div><b>📍</b><span>Carte interactive</span></div>
            </div>
          </div>

        </div>
      </section>

      <section className="concept" id="concept">
        <div className="wrap">
          <div className="sectionIntro">
            <span>LE CONCEPT CTA 18</span>
            <h2>Vous ne gérez pas une caserne.<br />Vous gérez <em>tout un territoire.</em></h2>
            <p>Les centres et les interventions sont visualisés directement sur une carte opérationnelle.</p>
          </div>

          <div className="conceptGrid">
            <article className="conceptCard">
              <div className="cardNumber">01</div>
              <div className="conceptIcon">🇫🇷</div>
              <h3>Choisissez votre SDIS</h3>
              <p>Jouez sur un département français et pilotez l'ensemble de son organisation opérationnelle.</p>
            </article>

            <article className="conceptCard">
              <div className="cardNumber">02</div>
              <div className="conceptIcon">🏢</div>
              <h3>Commandez les centres</h3>
              <p>Gérez les effectifs, les engins et la disponibilité des centres présents sur votre territoire.</p>
            </article>

            <article className="conceptCard">
              <div className="cardNumber">03</div>
              <div className="conceptIcon">🚨</div>
              <h3>Engagez les secours</h3>
              <p>Recevez les alertes, choisissez les moyens adaptés et lancez immédiatement l'intervention.</p>
            </article>

            <article className="conceptCard accent">
              <div className="cardNumber">04</div>
              <div className="conceptIcon">🗺️</div>
              <h3>Suivez les véhicules</h3>
              <p>Chaque engin engagé apparaît sur la carte et peut être suivi pendant son déplacement.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="operation" id="discover">
        <div className="wrap operationGrid">
          <div className="operationPanel">
            <div className="panelHeader">
              <div><span className="alarm">🚨</span> NOUVELLE ALERTE</div>
              <b>PRIORITÉ 1</b>
            </div>
            <div className="alertBody">
              <span className="alertIcon">🔥</span>
              <div>
                <small>INCENDIE</small>
                <h3>Feu d'habitation</h3>
                <p>Départ immédiat demandé · 14:32</p>
              </div>
            </div>
            <div className="alertRoute">
              <div><span className="statusDot"></span> CIS de départ</div>
              <div className="routeLine"></div>
              <div className="movingTruck">🚒</div>
              <div className="routeLine active"></div>
              <div>🔥 Intervention</div>
            </div>
          </div>

          <div className="operationCopy">
            <span>UNE VRAIE CARTE COMME POSTE DE COMMANDEMENT</span>
            <h2>Visualisez les secours directement sur le terrain.</h2>
            <p>
              Le CTA engage les moyens et la carte devient le cœur du jeu :
              centres de secours, véhicules disponibles, alertes et déplacements en cours.
            </p>
            <a className="textLink" href="#discover">Découvrir le gameplay →</a>
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
