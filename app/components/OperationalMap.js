'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const stationIcon = L.divIcon({
  className: 'cisMarkerWrap',
  html: '<div class="cisMarker">🚒</div>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

function clusterIcon(count) {
  const size = count >= 100 ? 58 : count >= 10 ? 52 : 46;
  return L.divIcon({
    className: 'cisClusterWrap',
    html: '<div class="cisCluster" style="width:' + size + 'px;height:' + size + 'px"><span>' + count + '</span></div>',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitToStations({ stations, fallback }) {
  const map = useMap();

  useEffect(() => {
    if (stations.length) {
      map.fitBounds(stations.map((s) => [s.lat, s.lon]), {
        padding: [35, 35],
        maxZoom: 12,
      });
    } else {
      map.setView([fallback.lat, fallback.lon], fallback.zoom || 9);
    }
  }, [stations, fallback, map]);

  return null;
}

function ClusteredStations({ stations }) {
  const map = useMap();
  const [, setRevision] = useState(0);

  useMapEvents({
    zoomend: () => setRevision((value) => value + 1),
    moveend: () => setRevision((value) => value + 1),
  });

  const clusters = useMemo(() => {
    const zoom = map.getZoom();
    const cellSize = 70;
    const groups = new Map();

    stations.forEach((station) => {
      const point = map.project([station.lat, station.lon], zoom);
      const key = Math.floor(point.x / cellSize) + ':' + Math.floor(point.y / cellSize);

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(station);
    });

    return Array.from(groups.values());
  }, [stations, map, map.getZoom()]);

  return (
    <>
      {clusters.map((group) => {
        if (group.length === 1) {
          const station = group[0];
          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lon]}
              icon={stationIcon}
            >
              <Popup>
                <strong>{station.name}</strong><br />
                {station.address || 'Adresse non renseignée dans la source cartographique'}
              </Popup>
            </Marker>
          );
        }

        const bounds = L.latLngBounds(group.map((station) => [station.lat, station.lon]));
        const center = bounds.getCenter();

        return (
          <Marker
            key={group.map((station) => station.id).join('-')}
            position={center}
            icon={clusterIcon(group.length)}
            eventHandlers={{
              click: () => map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: Math.min(map.getZoom() + 3, 18),
              }),
            }}
          />
        );
      })}
    </>
  );
}

export default function OperationalMap({ stations, fallback }) {
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
        <ClusteredStations stations={stations} />
      </MapContainer>
    </div>
  );
}
