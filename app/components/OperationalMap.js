'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const icon = L.divIcon({
  className: 'cisMarkerWrap',
  html: '<div class="cisMarker">🚒</div>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

function FitToStations({ stations, fallback }) {
  const map = useMap();
  useEffect(() => {
    if (stations.length) {
      map.fitBounds(stations.map((s) => [s.lat, s.lon]), { padding: [35, 35], maxZoom: 12 });
    } else {
      map.setView([fallback.lat, fallback.lon], fallback.zoom || 9);
    }
  }, [stations, fallback, map]);
  return null;
}

export default function OperationalMap({ stations, fallback }) {
  const center = useMemo(() => [fallback.lat, fallback.lon], [fallback]);
  return (
    <div className="operationalMap">
      <MapContainer center={center} zoom={fallback.zoom || 9} scrollWheelZoom className="leafletOperational">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToStations stations={stations} fallback={fallback} />
        {stations.map((station) => (
          <Marker key={station.id} position={[station.lat, station.lon]} icon={icon}>
            <Popup>
              <strong>{station.name}</strong><br />
              {station.address || 'Adresse non renseignée dans la source cartographique'}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
