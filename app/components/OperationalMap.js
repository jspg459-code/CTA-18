'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const stationIcon = L.divIcon({
  className: 'cisMarkerWrap',
  html: '<div class="cisMarker">🚒</div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
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
      </MapContainer>
    </div>
  );
}
