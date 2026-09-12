'use client';

import { useEffect, useMemo, useState } from 'react';

const SUPABASE_URL = 'https://zypntdqemnehqgogwntu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OQ2mszgzlwfBRMVPCi33zw_jOT-hadJ';

const departmentRows = `
01|Ain
02|Aisne
03|Allier
04|Alpes-de-Haute-Provence
05|Hautes-Alpes
06|Alpes-Maritimes
07|Ardèche
08|Ardennes
09|Ariège
10|Aube
11|Aude
12|Aveyron
13|Bouches-du-Rhône
14|Calvados
15|Cantal
16|Charente
17|Charente-Maritime
18|Cher
19|Corrèze
2A|Corse-du-Sud
2B|Haute-Corse
21|Côte-d'Or
22|Côtes-d'Armor
23|Creuse
24|Dordogne
25|Doubs
26|Drôme
27|Eure
28|Eure-et-Loir
29|Finistère
30|Gard
31|Haute-Garonne
32|Gers
33|Gironde
34|Hérault
35|Ille-et-Vilaine
36|Indre
37|Indre-et-Loire
38|Isère
39|Jura
40|Landes
41|Loir-et-Cher
42|Loire
43|Haute-Loire
44|Loire-Atlantique
45|Loiret
46|Lot
47|Lot-et-Garonne
48|Lozère
49|Maine-et-Loire
50|Manche
51|Marne
52|Haute-Marne
53|Mayenne
54|Meurthe-et-Moselle
55|Meuse
56|Morbihan
57|Moselle
58|Nièvre
59|Nord
60|Oise
61|Orne
62|Pas-de-Calais
63|Puy-de-Dôme
64|Pyrénées-Atlantiques
65|Hautes-Pyrénées
66|Pyrénées-Orientales
67|Bas-Rhin
68|Haut-Rhin
69|Rhône
70|Haute-Saône
71|Saône-et-Loire
72|Sarthe
73|Savoie
74|Haute-Savoie
75|Paris
76|Seine-Maritime
77|Seine-et-Marne
78|Yvelines
79|Deux-Sèvres
80|Somme
81|Tarn
82|Tarn-et-Garonne
83|Var
84|Vaucluse
85|Vendée
86|Vienne
87|Haute-Vienne
88|Vosges
89|Yonne
90|Territoire de Belfort
91|Essonne
92|Hauts-de-Seine
93|Seine-Saint-Denis
94|Val-de-Marne
95|Val-d'Oise
971|Guadeloupe
972|Martinique
973|Guyane
974|La Réunion
976|Mayotte
`.trim();

const departments = departmentRows.split('\n').map((row) => {
  const [code, name] = row.split('|');
  return { code, name, type: 'SDIS', label: ['75','92','93','94'].includes(code) ? 'Zone BSPP' : 'SDIS ' + code };
});

const specialServices = [
  { code: 'BSPP', name: 'Brigade de sapeurs-pompiers de Paris', area: 'Paris et petite couronne', icon: '🗼' },
  { code: 'BMPM', name: 'Bataillon de marins-pompiers de Marseille', area: 'Marseille', icon: '⚓' },
];

export default function Home() {
  const [authMode, setAuthMode] = useState(null);
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [player, setPlayer] = useState(null);
  const [servicePicker, setServicePicker] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [search, setSearch] = useState('');
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);

  const closeAuth = () => { setAuthMode(null); setAuthMessage(''); };
  const logout = () => { setPlayer(null); setAuthMode(null); setAuthMessage(''); setServicePicker(false); setSelectedService(null); setSearch(''); };

  const filteredDepartments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter((d) => (d.code + ' ' + d.name + ' ' + d.label).toLowerCase().includes(q));
  }, [search]);

  const handleAuth = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get('email');
    const password = form.get('password');
    const username = form.get('username');
    setAuthLoading(true); setAuthMessage('');
    try {
      const endpoint = authMode === 'signup' ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password';
      const payload = authMode === 'signup' ? { email, password, data: { username } } : { email, password };
      const response = await fetch(SUPABASE_URL + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.msg || data?.message || 'Une erreur est survenue.');
      if (authMode === 'signup') setAuthMessage('Compte créé avec succès ! Vérifie ton e-mail si une confirmation est demandée.');
      else { setPlayer(data.user); setAuthMode(null); setAuthMessage(''); }
    } catch (error) { setAuthMessage(error.message || 'Impossible de continuer.'); }
    finally { setAuthLoading(false); }
  };

  const openCTA = (service) => {
    setSearch('');
    setServicePicker(false);
    setSelectedService(service);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const chooseDepartment = (department) => {
    if (['75','92','93','94'].includes(department.code)) {
      openCTA({ code: 'BSPP', name: 'Brigade de sapeurs-pompiers de Paris', area: 'Paris et petite couronne', icon: '🗼' });
      return;
    }
    openCTA({ code: department.code, name: 'SDIS ' + department.code + ' — ' + department.name, area: department.name, icon: '🚒' });
  };

  useEffect(() => {
    if (!selectedService) return;
    let cancelled = false;
    const loadStations = async () => {
      setStationsLoading(true);
      setStations([]);
      try {
        const response = await fetch('/api/stations?code=' + encodeURIComponent(selectedService.code));
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Impossible de charger les centres.');
        if (!cancelled) setStations(Array.isArray(data.stations) ? data.stations : []);
      } catch { if (!cancelled) setStations([]); }
      finally { if (!cancelled) setStationsLoading(false); }
    };
    loadStations();
    return () => { cancelled = true; };
  }, [selectedService]);

  const playerName = player?.user_metadata?.username || player?.email?.split('@')[0];

  return (
    <main className="site">
      <header className="top"><div className="wrap navWrap">
        <a className="brand" href="#home" onClick={() => { closeAuth(); setServicePicker(false); setSelectedService(null); }}><span className="shield">18</span><span>CTA <b>18</b></span></a>
        <div className="account">{player ? <><span className="playerName">👤 {playerName}</span><button type="button" className="logout" onClick={logout}>Déconnexion</button></> : <><button type="button" onClick={() => setAuthMode('login')}>Connexion</button><button type="button" className="signup" onClick={() => setAuthMode('signup')}>Inscription</button></>}</div>
      </div></header>

      {player ? (
        selectedService ? (
          <section className="commandPage"><div className="wrap">
            <button className="backToPicker" type="button" onClick={() => setServicePicker(true)}>← CHANGER DE SDIS</button>
            <div className="commandHero">
              <span className="authTag">CENTRE DE COMMANDEMENT • EN LIGNE</span>
              <h1>CTA — {selectedService.name}</h1>
              <p>Bienvenue dans votre centre de traitement de l’alerte. Vous commandez désormais le territoire de <strong>{selectedService.area}</strong>.</p>
            </div>
            <div className="commandCards">
              <article><span>🚨</span><h3>Alertes</h3><p>Aucune intervention active pour le moment. Les prochaines alertes arriveront directement dans votre CTA.</p></article>
              <article><span>🏢</span><h3>{stationsLoading ? '…' : stations.length} CIS</h3><p>Centres opérationnels référencés sur votre territoire.</p></article>
              <article><span>🚒</span><h3>Engins disponibles</h3><p>Le suivi des véhicules et leur disponibilité sera géré depuis ce centre de commandement.</p></article>
            </div>
            <div className="dataStatus">
              <div><span className="statusPill">● SYSTÈME OPÉRATIONNEL</span><h2>Vous êtes aux commandes.</h2><p>Depuis ce CTA, vous recevrez les alertes, choisirez les CIS à engager et suivrez les véhicules en intervention sur la carte avec leurs déplacements par les routes.</p></div>
              <button className="startGame" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>OUVRIR LES OPÉRATIONS →</button>
            </div>
          </div></section>
        ) : (
          <section className="dashboardPage"><div className="wrap dashboardWrap">
            {!servicePicker ? <><div className="dashboardWelcome"><span className="authTag">ESPACE JOUEUR</span><h1>Bienvenue, <span>{playerName}</span> 👋</h1><p>Choisissez maintenant le territoire réel que vous allez commander.</p></div><div className="dashboardGrid"><article className="gameCard primaryGameCard"><div className="gameIcon">🇫🇷</div><span className="cardLabel">NOUVELLE PARTIE</span><h2>Choisissez votre service</h2><p>Tous les départements français sont disponibles, avec la BSPP et le BMPM.</p><button className="startGame" type="button" onClick={() => setServicePicker(true)}>CHOISIR MON SDIS →</button></article><div className="dashboardSide"><article className="miniCard"><span>🇫🇷</span><div><b>{departments.length} départements</b><p>Une sélection nationale complète.</p></div></article><article className="miniCard"><span>🗼</span><div><b>BSPP</b><p>Paris et petite couronne.</p></div></article><article className="miniCard"><span>⚓</span><div><b>BMPM</b><p>Marseille.</p></div></article></div></div></> :
              <section className="servicePicker"><button className="backToPicker" type="button" onClick={() => { setServicePicker(false); setSearch(''); }}>← RETOUR</button><div className="pickerHead"><span className="authTag">NOUVELLE PARTIE</span><h1>Choisissez votre territoire</h1><p>Recherchez un département, un SDIS ou choisissez directement la BSPP et le BMPM.</p><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ex. 59, Nord, SDIS 62..." /></div><div className="specialGrid">{specialServices.map((service) => <button className="specialService" key={service.code} type="button" onClick={() => openCTA(service)}><span>{service.icon}</span><div><small>{service.code}</small><b>{service.name}</b><p>{service.area}</p></div><strong>→</strong></button>)}</div><div className="departmentHeader"><h2>🇫🇷 Tous les départements</h2><span>{filteredDepartments.length} résultats</span></div><div className="departmentGrid">{filteredDepartments.map((department) => <button key={department.code} className="departmentCard" type="button" onClick={() => chooseDepartment(department)}><span className="departmentCode">{department.code}</span><span className="departmentInfo"><b>{department.name}</b><small>{department.label}</small></span><span className="departmentArrow">→</span></button>)}</div></section>}
          </div></section>
        )
      ) : !authMode ? (
        <><section className="hero" id="home"><div className="wrap heroGrid"><div className="heroCopy"><span className="tag">🚨 SIMULATION OPÉRATIONNELLE</span><h1>Gérez les secours.<br /><span>À l'échelle d'un SDIS.</span></h1><p>Prenez le contrôle d'un service départemental d'incendie et de secours, coordonnez les centres, engagez vos véhicules et préparez-vous à répondre aux alertes.</p><div className="welcomeButtons"><button className="play" type="button" onClick={() => setAuthMode('signup')}>▶️ COMMENCER À JOUER</button><a className="how" href="#concept">Comment ça fonctionne ?</a></div><div className="heroStats"><div><b>🇫🇷</b><span>Territoires français</span></div><div><b>🚒</b><span>Centres réels</span></div><div><b>📍</b><span>Carte en partie</span></div></div></div></div></section><section className="concept" id="concept"><div className="wrap"><div className="sectionIntro"><span>LE CONCEPT CTA 18</span><h2>Vous ne gérez pas une caserne.<br />Vous gérez <em>tout un territoire.</em></h2><p>Choisissez un service français et prenez les décisions opérationnelles pour l'ensemble de son territoire.</p></div><div className="conceptGrid"><article className="conceptCard"><div className="cardNumber">01</div><div className="conceptIcon">🇫🇷</div><h3>Choisissez votre service</h3><p>SDIS, BSPP ou BMPM selon le territoire que vous souhaitez commander.</p></article><article className="conceptCard"><div className="cardNumber">02</div><div className="conceptIcon">🏢</div><h3>Commandez les centres</h3><p>Gérez les effectifs, les engins et la disponibilité des centres réels.</p></article><article className="conceptCard"><div className="cardNumber">03</div><div className="conceptIcon">🚨</div><h3>Engagez les secours</h3><p>Recevez les alertes et choisissez les moyens adaptés à chaque intervention.</p></article><article className="conceptCard accent"><div className="cardNumber">04</div><div className="conceptIcon">🗺️</div><h3>Suivez les véhicules</h3><p>La carte opérationnelle arrive une fois la partie lancée.</p></article></div></div></section></>
      ) : (
        <section className="authPage"><div className="authCard"><button className="authBack" type="button" onClick={closeAuth}>← Retour à l'accueil</button><div className="authLogo"><span className="shield">18</span><b>CTA 18</b></div>{authMode === 'login' ? <><span className="authTag">ESPACE JOUEUR</span><h1>Bon retour parmi les secours.</h1><p className="authIntro">Connectez-vous pour retrouver votre SDIS et votre progression.</p><form onSubmit={handleAuth}><label>Adresse e-mail</label><input name="email" type="email" placeholder="vous@exemple.fr" required /><label>Mot de passe</label><input name="password" type="password" placeholder="••••••••" required /><button className="authSubmit" type="submit" disabled={authLoading}>{authLoading ? 'CONNEXION...' : 'SE CONNECTER →'}</button>{authMessage && <p className="authMessage">{authMessage}</p>}</form><p className="authSwitch">Pas encore de compte ? <button type="button" onClick={() => setAuthMode('signup')}>Créer un compte</button></p></> : <><span className="authTag">REJOINDRE CTA 18</span><h1>Prêt à prendre le commandement ?</h1><p className="authIntro">Créez votre compte joueur et préparez-vous à gérer votre premier territoire.</p><form onSubmit={handleAuth}><label>Pseudo</label><input name="username" type="text" placeholder="Votre pseudo" required /><label>Adresse e-mail</label><input name="email" type="email" placeholder="vous@exemple.fr" required /><label>Mot de passe</label><input name="password" type="password" placeholder="Minimum 6 caractères" minLength="6" required /><button className="authSubmit" type="submit" disabled={authLoading}>{authLoading ? 'CRÉATION...' : 'CRÉER MON COMPTE →'}</button>{authMessage && <p className="authMessage">{authMessage}</p>}</form><p className="authSwitch">Déjà inscrit ? <button type="button" onClick={() => setAuthMode('login')}>Se connecter</button></p></>}</div></section>
      )}
      <footer><div className="wrap footerWrap"><div><b>CTA 18</b><span>Jeu de gestion et de simulation des secours</span></div><span>© 2026 CTA 18</span></div></footer>
    </main>
  );
}
