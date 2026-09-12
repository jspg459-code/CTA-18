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
  iconSize: [15, 15],
  iconAnchor: [7, 7],
  popupAnchor: [0, -9],
});

function FitToStations({ stations, fallback }) {
  const map = useMap();

  useEffect(() => {
    if (stations.length) {
      const valid = stations.filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lon));
      if (valid.length) {
        map.fitBounds(valid.map((station) => [station.lat, station.lon]), {
          padding: [28, 28],
          maxZoom: 12,
        });
      }
    } else {
      map.setView([fallback.lat, fallback.lon], fallback.zoom || 9);
    }
  }, [stations, fallback, map]);

  return null;
}

function AllHospitals({ hospitals }) {
  return (
    <>
      {hospitals.map((hospital) => (
        <Marker key={hospital.id} position={[hospital.lat, hospital.lon]} icon={hospitalIcon}>
          <Popup>
            <strong>🏥 {hospital.name}</strong><br />
            {hospital.address || 'Établissement hospitalier'}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function AllStations({ stations, onStationSelect }) {
  return (
    <>
      {stations.map((station, index) => (
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
      ))}
    </>
  );
}

export default function OperationalMap({ stations, fallback, onStationSelect }) {
  const center = useMemo(() => [fallback.lat, fallback.lon], [fallback]);
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const radius = fallback.zoom && fallback.zoom <= 8 ? 35000 : 18000;
    const query = `[out:json][timeout:20];(nwr["amenity"="hospital"](around:${radius},${fallback.lat},${fallback.lon});nwr["healthcare"="hospital"](around:${radius},${fallback.lat},${fallback.lon}););out center tags;`;

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
          const name = item.tags?.name || 'Hôpital';
          unique.set(item.type + '-' + item.id, {
            id: item.type + '-' + item.id,
            lat,
            lon,
            name,
            address: [item.tags?.['addr:housenumber'], item.tags?.['addr:street'], item.tags?.['addr:postcode'], item.tags?.['addr:city']].filter(Boolean).join(' ') || item.tags?.['addr:full'] || '',
          });
        });
        setHospitals([...unique.values()]);
      })
      .catch(() => { if (!cancelled) setHospitals([]); });

    return () => { cancelled = true; };
  }, [fallback.lat, fallback.lon, fallback.zoom]);

  return (
    <div className="operationalMap">
      <MapContainer
        center={center}
        zoom={fallback.zoom || 9}
        scrollWheelZoom
        className="leafletOperational"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <FitToStations stations={stations} fallback={fallback} />
        <AllStations stations={stations} onStationSelect={onStationSelect} />
        <AllHospitals hospitals={hospitals} />
      </MapContainer>
    </div>
  );
}
