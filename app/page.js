'use client';

import { useState } from 'react';

const vehicles = [
  { name: 'VSAV 01', type: 'Secours à personne', status: 'Disponible', icon: '🚑' },
  { name: 'VSR 01', type: 'Secours routier', status: 'Disponible', icon: '🚒' },
  { name: 'FPT 01', type: 'Incendie', status: 'Disponible', icon: '🚒' },
];

export default function Home() {
  const [screen, setScreen] = useState('home');
  const [selected, setSelected] = useState(['VSAV 01', 'VSR 01']);
  const [mission, setMission] = useState('En attente');

  const toggleVehicle = (name) => {
    setSelected((current) =>
      current.includes(name) ? current.filter((v) => v !== name) : [...current, name]
    );
  };

  const engage = () => {
    if (!selected.length) return;
    setMission('Moyens engagés');
  };

  if (screen === 'home') {
    return (
      <main className="landing">
        <section className="hero">
          <div className="brand">🚒 <span>CTA 18</span></div>
          <div className="eyebrow">CENTRE DE TRAITEMENT DES ALERTES</div>
          <h1>Prenez le commandement des interventions.</h1>
          <p>
            Recevez les alertes, analysez la situation, engagez vos moyens et développez
            votre centre opérationnel.
          </p>
          <div className="heroActions">
            <button className="primary" onClick={() => setScreen('cta')}>Entrer au CTA</button>
            <button className="secondary" onClick={() => setScreen('cta')}>Découvrir le jeu</button>
          </div>
          <div className="features">
            <span>📻 Alertes</span><span>🚒 Véhicules</span><span>👨‍🚒 Effectifs</span><span>🗺️ Interventions</span>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="game">
      <header className="topbar">
        <button className="logoButton" onClick={() => setScreen('home')}>🚒 <strong>CTA 18</strong></button>
        <div className="topStatus"><span className="liveDot" /> SYSTÈME OPÉRATIONNEL</div>
        <div className="operator">👨‍🚒 Commandant</div>
      </header>

      <section className="dashboard">
        <div className="titleRow">
          <div>
            <p className="eyebrow red">CENTRE OPÉRATIONNEL</p>
            <h2>Tableau de commandement</h2>
          </div>
          <div className="clock">📻 CTA EN SERVICE</div>
        </div>

        <div className="stats">
          <Stat icon="🚨" value="1" label="Alerte active" danger />
          <Stat icon="🚒" value="8" label="Engins disponibles" />
          <Stat icon="👨‍🚒" value="24" label="Effectifs disponibles" />
          <Stat icon="📍" value="0" label="Interventions terminées" />
        </div>

        <div className="grid">
          <section className="panel alertPanel">
            <div className="panelHeader">
              <div>
                <p className="eyebrow red">🚨 ALERTE PRIORITAIRE</p>
                <h3>Accident de la circulation</h3>
              </div>
              <span className="urgent">URGENT</span>
            </div>

            <div className="alertInfo">
              <div><span>📍</span><div><small>LOCALISATION</small><strong>D18 — Secteur Nord</strong></div></div>
              <div><span>👥</span><div><small>SITUATION</small><strong>2 victimes signalées</strong></div></div>
              <div><span>⏱️</span><div><small>STATUT</small><strong>{mission}</strong></div></div>
            </div>

            <div className="recommendation">
              <span>💡</span>
              <div><strong>Moyens recommandés</strong><p>VSAV + VSR • Renfort incendie selon bilan</p></div>
            </div>

            <h4>Sélectionner les moyens</h4>
            <div className="vehicleList">
              {vehicles.map((vehicle) => {
                const active = selected.includes(vehicle.name);
                return (
                  <button
                    key={vehicle.name}
                    className={'vehicle ' + (active ? 'selected' : '')}
                    onClick={() => toggleVehicle(vehicle.name)}
                  >
                    <span className="vehicleIcon">{vehicle.icon}</span>
                    <span><strong>{vehicle.name}</strong><small>{vehicle.type}</small></span>
                    <span className={mission === 'Moyens engagés' && active ? 'status engaged' : 'status'}>{mission === 'Moyens engagés' && active ? 'En route' : vehicle.status}</span>
                  </button>
                );
              })}
            </div>

            <button className="engage" onClick={engage}>
              🚨 {mission === 'Moyens engagés' ? 'MOYENS EN ROUTE' : 'ENGAGER LES MOYENS'}
            </button>
          </section>

          <aside className="panel mapPanel">
            <div className="panelHeader">
              <div><p className="eyebrow">ZONE OPÉRATIONNELLE</p><h3>Carte des interventions</h3></div>
            </div>
            <div className="fakeMap">
              <div className="road r1" /><div className="road r2" /><div className="road r3" />
              <div className="mapPin fire">🚒<span>CTA 18</span></div>
              <div className="mapPin incident">🚨<span>AVP D18</span></div>
              <div className="mapLegend"><span><i className="green" /> Disponible</span><span><i className="redDot" /> Intervention</span></div>
            </div>
            <div className="mapFooter">
              <strong>📍 Secteur Nord</strong>
              <span>1 intervention active</span>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon, value, label, danger }) {
  return <div className={'stat ' + (danger ? 'dangerStat' : '')}><span>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></div>;
}
