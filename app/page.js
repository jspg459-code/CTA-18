'use client';

import { useMemo, useState } from 'react';

const demoRows = {
  'TV en direct': [
    ['TF1', 'Info & divertissement', 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=700&q=80'],
    ['France 2', 'Actualités & séries', 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=700&q=80'],
    ['Canal+', 'Sport & cinéma', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80'],
    ['Arte', 'Culture & documentaires', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=700&q=80'],
    ['France 5', 'Découverte', 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80'],
  ],
  Films: [
    ['The Last Horizon', 'Action • 2026', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=80'],
    ['Night Drive', 'Thriller • 2025', 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=80'],
    ['Blue Planet', 'Documentaire • 2026', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80'],
    ['After Midnight', 'Drame • 2025', 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80'],
  ],
  Séries: [
    ['The Agency', 'Saison 3', 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=700&q=80'],
    ['Dark City', 'Saison 2', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80'],
    ['The North', 'Saison 1', 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80'],
    ['Signal', 'Saison 4', 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=700&q=80'],
  ],
};

function Card({ item, onPlay, favorite, onFavorite }) {
  return (
    <article className="media-card">
      <button className="poster" onClick={() => onPlay(item)} aria-label={`Lire ${item[0]}`}>
        <img src={item[2]} alt="" />
        <span className="play">▶</span>
      </button>
      <button className={`heart ${favorite ? 'active' : ''}`} onClick={onFavorite} aria-label="Ajouter aux favoris">{favorite ? '♥' : '♡'}</button>
      <div className="card-copy"><strong>{item[0]}</strong><span>{item[1]}</span></div>
    </article>
  );
}

export default function Home() {
  const [active, setActive] = useState('Accueil');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const rows = useMemo(() => Object.entries(demoRows).map(([title, items]) => [title, items.filter(i => i[0].toLowerCase().includes(query.toLowerCase()))]).filter(([, items]) => items.length), [query]);

  const toggleFavorite = (title) => setFavorites(v => v.includes(title) ? v.filter(x => x !== title) : [...v, title]);

  return (
    <main>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">S</span><span>Stream<span>TV</span></span></div>
        <nav>
          {['Accueil', 'TV en direct', 'Films', 'Séries', 'Favoris', 'Mes playlists'].map(item => (
            <button key={item} className={active === item ? 'nav-active' : ''} onClick={() => setActive(item)}>{item === 'Accueil' ? '⌂' : item === 'TV en direct' ? '▣' : item === 'Films' ? '◉' : item === 'Séries' ? '▤' : item === 'Favoris' ? '♡' : '☷'} <span>{item}</span></button>
          ))}
        </nav>
        <div className="sidebar-bottom"><button onClick={() => setShowPlaylist(true)}>＋ Ajouter une playlist</button><button onClick={() => setActive('Paramètres')}>⚙ Paramètres</button></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">S</span>Stream<span>TV</span></div>
          <div className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher une chaîne, un film, une série..." /></div>
          <button className="profile" onClick={() => setActive('Mon compte')}><span>AM</span><div><b>Mon compte</b><small>Compte gratuit</small></div><i>⌄</i></button>
        </header>

        <div className="hero">
          <img src="https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1600&q=85" alt="" />
          <div className="hero-gradient" />
          <div className="hero-copy"><span className="eyebrow">STREAMTV ORIGINAL</span><h1>Votre télévision.<br /><em>Partout avec vous.</em></h1><p>Ajoutez vos playlists IPTV et retrouvez vos chaînes, films et séries dans une interface simple et élégante.</p><div className="hero-actions"><button className="primary" onClick={() => setShowPlaylist(true)}>＋ Ajouter une playlist</button><button className="secondary" onClick={() => setActive('TV en direct')}>▶ Explorer le direct</button></div></div>
        </div>

        <div className="page-head"><div><span className="eyebrow">VOTRE ESPACE</span><h2>{active}</h2></div><button className="outline" onClick={() => setShowPlaylist(true)}>Gérer mes playlists</button></div>

        <section className="continue"><div className="section-title"><h3>Reprendre la lecture</h3><span>Voir tout →</span></div><div className="continue-card"><div className="mini-poster"><img src={demoRows.Films[0][2]} alt="" /><span>▶</span></div><div className="continue-info"><span className="eyebrow">FILM</span><h3>The Last Horizon</h3><p>Vous étiez à 48 min • 62 % terminé</p><div className="progress"><i /></div><button onClick={() => setSelected(demoRows.Films[0])}>▶ Continuer</button></div></div></section>

        {rows.map(([title, items]) => <section className="media-row" key={title}><div className="section-title"><h3>{title}</h3><span>Voir tout →</span></div><div className="grid">{items.map(item => <Card key={item[0]} item={item} favorite={favorites.includes(item[0])} onFavorite={() => toggleFavorite(item[0])} onPlay={setSelected} />)}</div></section>)}

        <footer><div className="brand"><span className="brand-mark">S</span><span>Stream<span>TV</span></span></div><span>Votre contenu, vos playlists, votre expérience.</span><span>V1 • Gratuit</span></footer>
      </section>

      {selected && <div className="modal" onClick={() => setSelected(null)}><div className="player-modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}>×</button><div className="video-placeholder"><div className="big-play">▶</div><span>Lecteur StreamTV</span><small>{selected[0]} • ajoutez votre playlist pour lancer votre flux</small></div><div className="player-meta"><div><span className="eyebrow">EN LECTURE</span><h2>{selected[0]}</h2><p>{selected[1]}</p></div><button className="primary" onClick={() => toggleFavorite(selected[0])}>{favorites.includes(selected[0]) ? '♥ Favori' : '♡ Ajouter aux favoris'}</button></div></div></div>}

      {showPlaylist && <div className="modal" onClick={() => setShowPlaylist(false)}><div className="playlist-modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setShowPlaylist(false)}>×</button><span className="eyebrow">NOUVELLE PLAYLIST</span><h2>Ajouter une source</h2><p>Connectez une playlist IPTV que vous êtes autorisé à utiliser.</p><div className="source-grid"><button><b>▣</b><strong>M3U / M3U8</strong><small>URL ou fichier playlist</small></button><button><b>⌘</b><strong>Xtream Codes</strong><small>Serveur + identifiants</small></button></div><label>Nom de la playlist<input placeholder="Ma playlist" /></label><label>URL M3U<input placeholder="https://exemple.com/playlist.m3u" /></label><button className="primary full">Ajouter la playlist</button><small className="notice">StreamTV ne fournit aucun contenu TV. Vous ajoutez uniquement vos propres sources autorisées.</small></div></div>}
    </main>
  );
}
