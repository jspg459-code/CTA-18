'use client';

import { useEffect, useRef } from 'react';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

export default function Home() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const loadLeaflet = () =>
      new Promise((resolve) => {
        if (window.L) return resolve(window.L);
        const existing = document.querySelector('script[data-leaflet]');
        if (existing) {
          existing.addEventListener('load', () => resolve(window.L), { once: true });
          return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = LEAFLET_CSS;
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = LEAFLET_JS;
        script.dataset.leaflet = 'true';
        script.onload = () => resolve(window.L);
        document.body.appendChild(script);
      });

    let timer;

    loadLeaflet().then((L) => {
      if (!L || !mapRef.current || leafletMap.current) return;

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
      }).setView([47.2, 2.6], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      leafletMap.current = map;

      const icon = (emoji, cls = '') => L.divIcon({
        className: 'ctaMapIcon ' + cls,
        html: '<div class="mapMarker">' + emoji + '</div>',
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      const stations = [
        { name: 'CIS Maubeuge', coords: [50.279, 3.973], emoji: '🚒' },
        { name: 'CIS Lille', coords: [50.629, 3.057], emoji: '🚒' },
        { name: 'CIS Paris', coords: [48.8566, 2.3522], emoji: '🚒' },
        { name: 'CIS Lyon', coords: [45.764, 4.8357], emoji: '🚒' },
        { name: 'CIS Marseille', coords: [43.2965, 5.3698], emoji: '🚒' },
      ];

      stations.forEach((station) => {
        L.marker(station.coords, { icon: icon(station.emoji, 'station') })
          .addTo(map)
          .bindPopup('<b>' + station.name + '</b><br/>Centre de secours');
      });

      const departure = [50.279, 3.973];
      const incident = [50.258, 3.944];

      L.marker(incident, { icon: icon('🔥', 'incident') })
        .addTo(map)
        .bindPopup('<b>Intervention en cours</b><br/>Feu d\'habitation');

      const vehicle = L.marker(departure, { icon: icon('🚒', 'vehicle') })
        .addTo(map)
        .bindPopup('<b>FPT Maubeuge</b><br/>En intervention');

      // Calcul d'un véritable itinéraire routier : le camion suit les rues.
      const fallbackRoute = [departure, incident];
      let routeLine = L.polyline(fallbackRoute, {
        color: '#e23432',
        weight: 5,
        opacity: 0.9,
        dashArray: '8 10',
      }).addTo(map);

      const animateVehicle = (routePoints) => {
        if (!routePoints || routePoints.length < 2) return;

        let segment = 0;
        let segmentProgress = 0;

        if (timer) clearInterval(timer);
        timer = setInterval(() => {
          const from = routePoints[segment];
          const to = routePoints[(segment + 1) % routePoints.length];

          segmentProgress += 0.025;
          if (segmentProgress >= 1) {
            segmentProgress = 0;
            segment += 1;
            if (segment >= routePoints.length - 1) {
              segment = 0;
            }
          }

          const lat = from[0] + (to[0] - from[0]) * segmentProgress;
          const lng = from[1] + (to[1] - from[1]) * segmentProgress;
          vehicle.setLatLng([lat, lng]);
        }, 60);
      };

      // OSRM renvoie la géométrie réelle des routes OpenStreetMap.
      fetch(
        'https://router.project-osrm.org/route/v1/driving/' +
          departure[1] + ',' + departure[0] + ';' +
          incident[1] + ',' + incident[0] +
          '?overview=full&geometries=geojson'
      )
        .then((response) => {
          if (!response.ok) throw new Error('Routing unavailable');
          return response.json();
        })
        .then((data) => {
          const coordinates = data?.routes?.[0]?.geometry?.coordinates;
          if (!coordinates?.length) throw new Error('No route');

          const roadRoute = coordinates.map(([lng, lat]) => [lat, lng]);
          map.removeLayer(routeLine);
          routeLine = L.polyline(roadRoute, {
            color: '#e23432',
            weight: 5,
            opacity: 0.9,
            dashArray: '8 10',
          }).addTo(map);

          animateVehicle(roadRoute);
          map.fitBounds(routeLine.getBounds().pad(0.35));
        })
        .catch(() => {
          // Secours visuel si le service de calcul est momentanément indisponible.
          animateVehicle(fallbackRoute);
          map.fitBounds(routeLine.getBounds().pad(1.8));
        });

      setTimeout(() => map.invalidateSize(), 300);
    });

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
              <a className="play" href="#map">🗺️ OUVRIR LA CARTE</a>
              <a className="how" href="#concept">Comment ça fonctionne ?</a>
            </div>

            <div className="heroStats">
              <div><b>🇫🇷</b><span>SDIS français</span></div>
              <div><b>🚒</b><span>Centres réels</span></div>
              <div><b>📍</b><span>Carte interactive</span></div>
            </div>
          </div>

          <div className="mapPreview realMapCard" id="map">
            <div className="mapTop">
              <div>
                <small>CARTE OPÉRATIONNELLE</small>
                <b>France · temps réel</b>
              </div>
              <span className="liveDot">EN DIRECT</span>
            </div>

            <div ref={mapRef} className="realMap" aria-label="Carte opérationnelle CTA 18" />

            <div className="mapBottom">
              <div><span className="green"></span> Centres disponibles</div>
              <div><span className="red"></span> Intervention</div>
              <b>🚒 Véhicule en déplacement</b>
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
            <a className="textLink" href="#map">Voir la carte opérationnelle →</a>
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
