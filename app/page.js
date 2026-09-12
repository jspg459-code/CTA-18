'use client';

import { useState } from 'react';

// Configuration publique Supabase (clé publishable, utilisable côté navigateur)
const SUPABASE_URL = 'https://zypntdqemnehqgogwntu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OQ2mszgzlwfBRMVPCi33zw_jOT-hadJ';

export default function Home() {
  const [authMode, setAuthMode] = useState(null);
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [player, setPlayer] = useState(null);

  const closeAuth = () => { setAuthMode(null); setAuthMessage(''); };
  const logout = () => { setPlayer(null); setAuthMode(null); setAuthMessage(''); };

  const handleAuth = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get('email');
    const password = form.get('password');
    const username = form.get('username');

    setAuthLoading(true);
    setAuthMessage('');

    try {
      const endpoint = authMode === 'signup' ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password';
      const payload = authMode === 'signup'
        ? { email, password, data: { username } }
        : { email, password };

      const response = await fetch(SUPABASE_URL + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.msg || data?.message || 'Une erreur est survenue.');

      if (authMode === 'signup') {
        setAuthMessage('Compte créé avec succès ! Vérifie ton e-mail si une confirmation est demandée.');
      } else {
        setPlayer(data.user);
        setAuthMode(null);
        setAuthMessage('');
      }
    } catch (error) {
      setAuthMessage(error.message || 'Impossible de continuer.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <main className="site">
      <header className="top">
        <div className="wrap navWrap">
          <a className="brand" href="#home" onClick={closeAuth}>
            <span className="shield">18</span>
            <span>CTA <b>18</b></span>
          </a>
          <div className="account">
            <button type="button" onClick={() => setAuthMode('login')}>Connexion</button>
            <button type="button" className="signup" onClick={() => setAuthMode('signup')}>Inscription</button>
          </div>
        </div>
      </header>

      {player ? (
        <section className="dashboardPage"><div className="wrap dashboardWrap"><div className="dashboardWelcome"><span className="authTag">CENTRE DE COMMANDEMENT</span><h1>Bienvenue, <span>{player.user_metadata?.username || player.email?.split('@')[0]}</span> 👋</h1><p>Votre compte est prêt. Il est maintenant temps de choisir le territoire que vous allez commander.</p></div><div className="dashboardGrid"><article className="gameCard primaryGameCard"><div className="gameIcon">🇫🇷</div><span className="cardLabel">NOUVELLE PARTIE</span><h2>Choisissez votre SDIS</h2><p>Sélectionnez un département français et prenez le commandement de son service départemental d'incendie et de secours.</p><button className="startGame" type="button">CHOISIR MON SDIS →</button></article><div className="dashboardSide"><article className="miniCard"><span>🚒</span><div><b>Aucune partie active</b><p>Votre première partie vous attend.</p></div></article><article className="miniCard"><span>📍</span><div><b>Carte opérationnelle</b><p>Disponible une fois votre SDIS sélectionné.</p></div></article><article className="miniCard"><span>🚨</span><div><b>Centre d'alerte</b><p>Prêt à recevoir vos premières interventions.</p></div></article></div></div></div></section>
      ) : !authMode ? (
        <>
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
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="authPage">
          <div className="authCard">
            <button className="authBack" type="button" onClick={closeAuth}>← Retour à l'accueil</button>
            <div className="authLogo"><span className="shield">18</span><b>CTA 18</b></div>

            {authMode === 'login' ? (
              <>
                <span className="authTag">ESPACE JOUEUR</span>
                <h1>Bon retour parmi les secours.</h1>
                <p className="authIntro">Connectez-vous pour retrouver votre SDIS et votre progression.</p>
                <form onSubmit={handleAuth}>
                  <label>Adresse e-mail</label>
                  <input name="email" type="email" placeholder="vous@exemple.fr" required />
                  <label>Mot de passe</label>
                  <input name="password" type="password" placeholder="••••••••" required />
                  <button className="authSubmit" type="submit" disabled={authLoading}>{authLoading ? "CONNEXION..." : "SE CONNECTER →"}</button>
                {authMessage && <p className="authMessage">{authMessage}</p>}
                </form>
                <p className="authSwitch">Pas encore de compte ? <button type="button" onClick={() => setAuthMode('signup')}>Créer un compte</button></p>
              </>
            ) : (
              <>
                <span className="authTag">REJOINDRE CTA 18</span>
                <h1>Prêt à prendre le commandement ?</h1>
                <p className="authIntro">Créez votre compte joueur et préparez-vous à gérer votre premier SDIS.</p>
                <form onSubmit={handleAuth}>
                  <label>Pseudo</label>
                  <input name="username" type="text" placeholder="Votre pseudo" required />
                  <label>Adresse e-mail</label>
                  <input name="email" type="email" placeholder="vous@exemple.fr" required />
                  <label>Mot de passe</label>
                  <input name="password" type="password" placeholder="Minimum 6 caractères" minLength="6" required />
                  <button className="authSubmit" type="submit" disabled={authLoading}>{authLoading ? "CRÉATION..." : "CRÉER MON COMPTE →"}</button>
                {authMessage && <p className="authMessage">{authMessage}</p>}
                </form>
                <p className="authSwitch">Déjà inscrit ? <button type="button" onClick={() => setAuthMode('login')}>Se connecter</button></p>
              </>
            )}
          </div>
        </section>
      )}

      <footer>
        <div className="wrap footerWrap">
          <div><b>CTA 18</b><span>Jeu de gestion et de simulation des secours</span></div>
          <span>© 2026 CTA 18</span>
        </div>
      </footer>
    </main>
  );
}
