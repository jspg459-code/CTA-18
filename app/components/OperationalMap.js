'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const stationIcon = L.divIcon({
  className: 'cisMarkerWrap',
  html: '<div class="cisMarker">🚒</div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
});

const hospitalIcon = L.divIcon({
  className: 'hospitalMarkerWrap',
  html: '<div class="hospitalMarker">🏥</div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

const vsavTransportIcon = L.divIcon({
  className: 'vsavTransportMarkerWrap',
  html: '<div class="vsavTransportMarker">🚑</div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
});

const interventionIcon = L.divIcon({
  className: 'interventionMarkerWrap',
  html: '<div class="interventionMarker">🚨</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

const engagedVehicleIcon = L.divIcon({
  className: 'engagedVehicleMarkerWrap',
  html: '<div class="engagedVehicleMarker">🚒</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

function FitToStations({ stations, fallback, activeIntervention, vehicles }) {
  const map = useMap();

  useEffect(() => {
    const points = [
      ...stations.map((station) => ({ lat:Number(station.lat), lon:Number(station.lon) })),
      ...(activeIntervention ? [{ lat:Number(activeIntervention.lat), lon:Number(activeIntervention.lon) }] : []),
      ...(vehicles || []).map((vehicle) => ({ lat:Number(vehicle.lat), lon:Number(vehicle.lon) })),
    ].filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon));

    if (points.length) {
      map.fitBounds(points.map((point) => [point.lat, point.lon]), {
        padding: [28, 28],
        maxZoom: 12,
      });
    } else {
      map.setView([fallback.lat, fallback.lon], fallback.zoom || 9);
    }
  }, [stations, fallback, activeIntervention, vehicles, map]);

  return null;
}

function AllHospitals({ hospitals }) {
  return hospitals.map((hospital) => (
    <Marker key={hospital.id} position={[hospital.lat, hospital.lon]} icon={hospitalIcon}>
      <Popup>
        <strong>🏥 {hospital.name}</strong><br />
        {hospital.address || 'Établissement hospitalier'}
      </Popup>
    </Marker>
  ));
}

function AllStations({ stations, onStationSelect }) {
  return stations.map((station, index) => (
    <Marker
      key={station.id || index}
      position={[station.lat, station.lon]}
      icon={stationIcon}
      eventHandlers={{ click: () => onStationSelect?.(station) }}
    >
      <Popup>
        <strong>{station.name}</strong><br />
        {station.address || station.locality || 'Adresse en cours de référencement'}
      </Popup>
    </Marker>
  ));
}

function ActiveIntervention({ intervention }) {
  const lat = Number(intervention?.lat);
  const lon = Number(intervention?.lon);
  if (!intervention || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return <Marker position={[lat, lon]} icon={interventionIcon}><Popup><strong>🚨 Intervention en cours</strong><br />{intervention.scenario?.title || 'Intervention'}<br />📍 {intervention.address || 'Localisation opérationnelle'}<br /><small>{intervention.status || 'EN COURS'}</small></Popup></Marker>;
}

function EngagedVehicles({ vehicles = [] }) {
  return vehicles.filter((vehicle) => Number.isFinite(Number(vehicle.lat)) && Number.isFinite(Number(vehicle.lon))).map((vehicle) => (
    <Marker key={vehicle.id} position={[Number(vehicle.lat), Number(vehicle.lon)]} icon={engagedVehicleIcon}>
      <Popup><strong>🚒 {vehicle.type}</strong><br />{vehicle.stationName}<br /><small>{vehicle.status}</small></Popup>
    </Marker>
  ));
}

function VsavTransports({ transports, hospitals }) {
  return transports.map((transport) => {
    const hospital = hospitals.find((h) => h.id === transport.hospitalId);
    if (!hospital) return null;
    return (
      <Marker key={transport.id} position={[transport.lat, transport.lon]} icon={vsavTransportIcon}>
        <Popup>
          <strong>🚑 {transport.vehicleName}</strong><br />
          🏥 Transporte une victime vers : <b>{hospital.name}</b><br />
          <small>Statut : transport hospitalier</small>
        </Popup>
      </Marker>
    );
  });
}

function buildHospitalQuery(stations, fallback) {
  const valid = stations.filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lon));

  if (!valid.length) {
    const d = 0.22;
    return `[out:json][timeout:25];(nwr["amenity"="hospital"](${fallback.lat-d},${fallback.lon-d},${fallback.lat+d},${fallback.lon+d});nwr["healthcare"="hospital"](${fallback.lat-d},${fallback.lon-d},${fallback.lat+d},${fallback.lon+d}););out center tags;`;
  }

  const lats = valid.map((s) => s.lat);
  const lons = valid.map((s) => s.lon);
  // On couvre tout le territoire réellement affiché, avec une petite marge.
  const margin = 0.08;
  const south = Math.max(-90, Math.min(...lats) - margin);
  const west = Math.max(-180, Math.min(...lons) - margin);
  const north = Math.min(90, Math.max(...lats) + margin);
  const east = Math.min(180, Math.max(...lons) + margin);

  return `[out:json][timeout:35];(nwr["amenity"="hospital"](${south},${west},${north},${east});nwr["healthcare"="hospital"](${south},${west},${north},${east}););out center tags;`;
}

export default function OperationalMap({ stations, fallback, onStationSelect, transports = [], activeIntervention = null, vehicles = [] }) {
  const center = useMemo(() => [fallback.lat, fallback.lon], [fallback]);
  const [hospitals, setHospitals] = useState([]);

  const stationSignature = useMemo(
    () => stations.map((s) => `${s.id || s.name}:${s.lat}:${s.lon}`).join('|'),
    [stations]
  );

  useEffect(() => {
    let cancelled = false;
    if (!stations.length) {
      setHospitals([]);
      return () => { cancelled = true; };
    }

    const query = buildHospitalQuery(stations, fallback);

    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: query,
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('hospital source unavailable')))
      .then((data) => {
        if (cancelled) return;

        const unique = new Map();
        (data.elements || []).forEach((item) => {
          const lat = item.lat ?? item.center?.lat;
          const lon = item.lon ?? item.center?.lon;
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

          const tags = item.tags || {};
          const name = tags.name || tags['name:fr'] || 'Hôpital';
          const address = [
            tags['addr:housenumber'],
            tags['addr:street'],
            tags['addr:postcode'],
            tags['addr:city'],
          ].filter(Boolean).join(' ') || tags['addr:full'] || '';

          unique.set(item.type + '-' + item.id, {
            id: item.type + '-' + item.id,
            lat,
            lon,
            name,
            address,
          });
        });

        setHospitals([...unique.values()]);
      })
      .catch(() => {
        if (!cancelled) setHospitals([]);
      });

    return () => { cancelled = true; };
  }, [stationSignature, stations, fallback]);

  return (
    <div className="operationalMap">
      <MapContainer center={center} zoom={fallback.zoom || 9} scrollWheelZoom className="leafletOperational">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <FitToStations stations={stations} fallback={fallback} activeIntervention={activeIntervention} vehicles={vehicles} />
        <AllStations stations={stations} onStationSelect={onStationSelect} />
        <AllHospitals hospitals={hospitals} />
        <ActiveIntervention intervention={activeIntervention} />
        <EngagedVehicles vehicles={vehicles} />
        <VsavTransports transports={transports} hospitals={hospitals} />
      </MapContainer>
    </div>
  );
}
