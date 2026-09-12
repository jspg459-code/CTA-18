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
              coordonnez les centres, engagez vos véhicules et suivez chaque intervention sur la carte.
            </p>

            <div className="welcomeButtons">
              <a className="play" href="#discover">🗺️ DÉCOUVRIR LA CARTE</a>
              <a className="how" href="#concept">Comment ça fonctionne ?</a>
            </div>

            <div className="heroStats">
              <div><b>🇫🇷</b><span>SDIS français</span></div>
              <div><b>🚒</b><span>Centres de secours</span></div>
              <div><b>📍</b><span>Carte opérationnelle</span></div>
            </div>
          </div>

          <div className="mapPreview">
            <div className="mapTop">
              <div>
                <small>CARTE OPÉRATIONNELLE</small>
                <b>France · aperçu</b>
              </div>
              <span className="liveDot">EN DIRECT</span>
            </div>

            <div className="franceMap">
              <div className="mapGrid"></div>
              <div className="franceShape"></div>

              <div className="mapPin pin1"><span>🚒</span><b>CIS</b></div>
              <div className="mapPin pin2"><span>🚒</span><b>CIS</b></div>
              <div className="mapPin pin3"><span>🚑</span><b>VSAV</b></div>
              <div className="incidentPin"><span>🔥</span></div>

              <div className="route route1"></div>
              <div className="vehicle vehicle1">🚒</div>
            </div>

            <div className="mapBottom">
              <div><span className="green"></span> Centres disponibles</div>
              <div><span className="red"></span> Intervention</div>
              <b>1 véhicule engagé →</b>
            </div>
          </div>
        </div>
      </section>

      <section className="concept" id="concept">
        <div className="wrap">
          <div className="sectionIntro">
            <span>LE CONCEPT CTA 18</span>
            <h2>Vous ne gérez pas une caserne.<br />Vous gérez <em>tout un territoire.</em></h2>
            <p>Chaque décision commence au CTA et se poursuit directement sur la carte opérationnelle.</p>
          </div>

          <div className="conceptGrid">
            <article className="conceptCard">
              <div className="cardNumber">01</div>
              <div className="conceptIcon">🇫🇷</div>
              <h3>Choisissez votre SDIS</h3>
              <p>Basez votre partie sur un territoire français et son réseau de centres de secours.</p>
            </article>

            <article className="conceptCard">
              <div className="cardNumber">02</div>
              <div className="conceptIcon">🏢</div>
              <h3>Commandez les centres</h3>
              <p>Gérez les effectifs, les engins et la disponibilité de vos moyens sur l'ensemble du département.</p>
            </article>

            <article className="conceptCard">
              <div className="cardNumber">03</div>
              <div className="conceptIcon">🚨</div>
              <h3>Engagez les secours</h3>
              <p>Recevez les alertes, choisissez les moyens adaptés et lancez l'intervention.</p>
            </article>

            <article className="conceptCard accent">
              <div className="cardNumber">04</div>
              <div className="conceptIcon">🗺️</div>
              <h3>Suivez l'intervention</h3>
              <p>Visualisez les véhicules en déplacement et suivez leur progression jusqu'au lieu du sinistre.</p>
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
            <span>UNE INTERVENTION, DU DÉPART À L'ARRIVÉE</span>
            <h2>Chaque véhicule devient visible sur le terrain.</h2>
            <p>
              Le CTA engage les moyens. La carte devient votre poste de commandement :
              vous visualisez les départs, les déplacements et les interventions en cours.
            </p>
            <a className="textLink" href="#home">Explorer CTA 18 →</a>
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