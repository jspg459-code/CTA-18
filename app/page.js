'use client';

import { useState } from 'react';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main>
      <header className="nav">
        <a className="logo" href="#accueil" aria-label="CTA 18">
          <span className="logoMark"><span></span><span></span><span></span></span>
          <span>CTA <b>18</b></span>
        </a>

        <nav className={menuOpen ? 'navLinks open' : 'navLinks'}>
          <a href="#jeu" onClick={() => setMenuOpen(false)}>Le jeu</a>
          <a href="#univers" onClick={() => setMenuOpen(false)}>L'univers</a>
          <a href="#commencer" onClick={() => setMenuOpen(false)}>Commencer</a>
        </nav>

        <div className="navActions">
          <button className="login">Connexion</button>
          <a className="navPlay" href="#commencer">Jouer maintenant</a>
          <button className="menuButton" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <i></i><i></i>
          </button>
        </div>
      </header>

      <section className="heroNew" id="accueil">
        <div className="heroGlow"></div>
        <div className="heroGrid"></div>

        <div className="heroCopy">
          <div className="liveBadge"><span></span> SIMULATION OPÉRATIONNELLE</div>
          <h1>Quand l'alerte retentit,<br /><em>vous décidez.</em></h1>
          <p>
            Prenez place au cœur du centre opérationnel. Analysez les appels,
            engagez les secours et construisez votre propre histoire.
          </p>

          <div className="heroButtons" id="commencer">
            <a className="mainCta" href="#jeu">
              <span className="ctaIcon">▶</span>
              Commencer l'aventure
            </a>
            <a className="ghostCta" href="#jeu">Découvrir CTA 18 <span>↘</span></a>
          </div>

          <div className="heroMeta">
            <div><b>24/7</b><span>Centre opérationnel</span></div>
            <div><b>∞</b><span>Interventions possibles</span></div>
            <div><b>01</b><span>Votre aventure commence</span></div>
          </div>
        </div>

        <div className="commandVisual" aria-label="Aperçu du centre opérationnel">
          <div className="visualTop">
            <div className="visualBrand"><span className="pulse"></span> CTA 18</div>
            <span>EN DIRECT</span>
          </div>

          <div className="mapSurface">
            <div className="mapLines l1"></div>
            <div className="mapLines l2"></div>
            <div className="mapLines l3"></div>
            <div className="mapBlock b1"></div>
            <div className="mapBlock b2"></div>
            <div className="mapBlock b3"></div>
            <div className="pin pinBlue">⌂</div>
            <div className="pin pinRed">!</div>
            <div className="mapLabel">SECTEUR 18 · NORD</div>
          </div>

          <div className="incidentCard">
            <div className="incidentHeader">
              <span className="warningIcon">!</span>
              <div><small>ALERTE PRIORITAIRE</small><strong>Intervention en cours</strong></div>
              <span className="time">00:42</span>
            </div>
            <div className="incidentRow"><span>⌖</span> Secteur Nord · D18</div>
            <div className="units"><span>VSAV 01</span><span>FPT 01</span><span>+2</span></div>
          </div>
        </div>

        <div className="scrollHint"><span></span> DÉCOUVRIR</div>
      </section>

      <section className="introSection" id="jeu">
        <div className="sectionLabel">01 — L'EXPÉRIENCE</div>
        <div className="introHeading">
          <h2>Plus qu'un jeu.<br /><span>Une responsabilité.</span></h2>
          <p>Chaque appel peut changer le cours d'une intervention. Dans CTA 18, vos choix, vos moyens et votre réactivité façonnent votre centre opérationnel.</p>
        </div>

        <div className="featureCards" id="univers">
          <article className="featureCard featured">
            <span className="cardNumber">01</span>
            <div className="cardSymbol">◉</div>
            <h3>Recevez l'alerte</h3>
            <p>Analysez chaque situation et obtenez les premières informations essentielles.</p>
          </article>
          <article className="featureCard">
            <span className="cardNumber">02</span>
            <div className="cardSymbol">↗</div>
            <h3>Décidez des moyens</h3>
            <p>Choisissez les véhicules et les équipes les plus adaptés à la mission.</p>
          </article>
          <article className="featureCard">
            <span className="cardNumber">03</span>
            <div className="cardSymbol">✦</div>
            <h3>Construisez votre histoire</h3>
            <p>Développez votre centre et progressez dans un univers opérationnel vivant.</p>
          </article>
        </div>
      </section>

      <section className="finalSection">
        <div className="finalPanel">
          <div className="finalBadge">CTA 18</div>
          <h2>Le prochain appel<br />peut arriver <em>maintenant.</em></h2>
          <a href="#accueil" className="mainCta">Prendre le commandement <span>→</span></a>
        </div>
      </section>

      <footer>
        <div className="logo footerLogo"><span className="logoMark"><span></span><span></span><span></span></span><span>CTA <b>18</b></span></div>
        <span>© 2026 CTA 18 — Projet de simulation.</span>
      </footer>
    </main>
  );
}
