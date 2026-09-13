'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const icon = (className, emoji, size) => L.divIcon({
  className,
  html: '<div class="' + className + 'Inner">' + emoji + '</div>',
  iconSize: size,
  iconAnchor: [Math.round(size[0] / 2), Math.round(size[1] / 2)],
  popupAnchor: [0, -Math.round(size[1] / 2)],
});

const stationIcon = icon('cisMarkerWrap', '🚒', [22,22]);
const hospitalIcon = icon('hospitalMarkerWrap', '🏥', [18,18]);
const interventionIcon = icon('interventionMarkerWrap', '🚨', [28,28]);
const engagedVehicleIcon = icon('engagedVehicleMarkerWrap', '🚒', [24,24]);
const transportIcon = icon('vsavTransportMarkerWrap', '🚑', [24,24]);

const validPoint = (lat, lon) => Number.isFinite(Number(lat)) && Number.isFinite(Number(lon));
const lerp = (a, b, t) => Number(a) + (Number(b) - Number(a)) * t;

function FitToOperationalPoints({ stations, hospitals, fallback, activeIntervention }) {
  const map = useMap();
  useEffect(() => {
    // Au repos, on cadre les CIS du territoire. Dès qu'un appel ou une intervention est actif,
    // on laisse le suivi opérationnel gérer la caméra pour éviter les retours en arrière.
    if (activeIntervention) return;
    const points = [
      ...stations.map(s => ({lat:Number(s.lat), lon:Number(s.lon)})),
      ...hospitals.map(h => ({lat:Number(h.lat), lon:Number(h.lon)})),
    ].filter(p => validPoint(p.lat,p.lon));

    if (points.length) map.fitBounds(points.map(p => [p.lat,p.lon]), {padding:[28,28], maxZoom:12});
    else map.setView([fallback.lat,fallback.lon], fallback.zoom || 9);
  }, [stations, hospitals, fallback, activeIntervention, map]);
  return null;
}

function AutoFocusEngagement({ vehicles = [], activeIntervention }) {
  const map = useMap();
  const lastKeyRef = useRef('');

  useEffect(() => {
    if (!vehicles.length) return;
    const first = vehicles[0];
    const key = vehicles.map(v => String(v.id)+':'+String(v.startedAt||'')).join('|');
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    const origin = [Number(first.originLat ?? first.lat), Number(first.originLon ?? first.lon)];
    const target = [Number(first.targetLat ?? activeIntervention?.lat), Number(first.targetLon ?? activeIntervention?.lon)];
    if (!validPoint(origin[0],origin[1]) || !validPoint(target[0],target[1])) return;

    // Un seul zoom pour tout le départ : le premier véhicule engagé sert de référence.
    const timer = setTimeout(() => {
      map.flyToBounds([origin,target], {padding:[70,70], maxZoom:13, duration:1.1});
    }, 150);
    return () => clearTimeout(timer);
  }, [vehicles, activeIntervention, map]);

  return null;
}
function RoutedVehicle({ vehicle, activeIntervention, now }) {
  const fromLat=Number(vehicle.originLat ?? vehicle.lat), fromLon=Number(vehicle.originLon ?? vehicle.lon);
  const toLat=Number(vehicle.targetLat ?? activeIntervention?.lat ?? vehicle.lat), toLon=Number(vehicle.targetLon ?? activeIntervention?.lon ?? vehicle.lon);
  const [route,setRoute]=useState(null);

  useEffect(()=>{
    let cancelled=false;
    if(!validPoint(fromLat,fromLon)||!validPoint(toLat,toLon)) return;
    const controller=new AbortController();
    const url='https://router.project-osrm.org/route/v1/driving/'+fromLon+','+fromLat+';'+toLon+','+toLat+'?overview=full&geometries=geojson';
    fetch(url,{signal:controller.signal}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{
      const coords=data?.routes?.[0]?.geometry?.coordinates;
      const path=Array.isArray(coords)?coords.map(([lon,lat])=>[Number(lat),Number(lon)]).filter(p=>validPoint(p[0],p[1])):[];
      if(!cancelled&&path.length>=2)setRoute(path);
    }).catch(()=>{if(!cancelled)setRoute([[fromLat,fromLon],[toLat,toLon]])});
    return()=>{cancelled=true;controller.abort()};
  },[fromLat,fromLon,toLat,toLon]);

  const path=route&&route.length>=2?route:[[fromLat,fromLon],[toLat,toLon]];
  const duration=Number(vehicle.travelDuration||18000);
  const progress=vehicle.status==='ARRIVÉ SUR PLACE'?1:Math.min(1,Math.max(0,(now-Number(vehicle.startedAt||now))/duration));
  const lengths=[];let total=0;
  for(let i=1;i<path.length;i++){const dx=(path[i][1]-path[i-1][1])*Math.cos(((path[i][0]+path[i-1][0])/2)*Math.PI/180);const dy=path[i][0]-path[i-1][0];total+=Math.sqrt(dx*dx+dy*dy);lengths.push(total)}
  let position=path[path.length-1];
  if(progress<1&&total>0){const target=total*progress;let previous=0;for(let i=0;i<lengths.length;i++){if(target<=lengths[i]){const local=(target-previous)/Math.max(lengths[i]-previous,0.0000001);const a=path[i],b=path[i+1];position=[a[0]+(b[0]-a[0])*local,a[1]+(b[1]-a[1])*local];break}previous=lengths[i]}}
  const isTransport=vehicle.status==='TRANSPORT HÔPITAL';
  return <>{route&&route.length>=2&&<Polyline positions={route} pathOptions={{weight:3,opacity:0.5}}/>}<Marker position={position} icon={isTransport?transportIcon:engagedVehicleIcon}><Popup><strong>{isTransport?'🚑':'🚒'} {vehicle.type}</strong><br/>{vehicle.stationName}<br/><small>{vehicle.status}</small></Popup></Marker></>;
}

function MovingVehicles({ vehicles = [], activeIntervention }) {
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),250);return()=>clearInterval(timer)},[]);
  return vehicles.map(vehicle=><RoutedVehicle key={vehicle.id} vehicle={vehicle} activeIntervention={activeIntervention} now={now}/>);
}

export default function OperationalMap({ stations = [], fallback, onStationSelect, activeIntervention = null, vehicles = [], callAccepted = false, onTakeCall, onRefuseCall }) {
  const center = useMemo(() => [fallback.lat, fallback.lon], [fallback]);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);

  const bounds = useMemo(() => {
    const valid = stations.filter(s => validPoint(s.lat,s.lon));
    if (!valid.length) return null;
    const lats = valid.map(s => Number(s.lat));
    const lons = valid.map(s => Number(s.lon));
    return {
      south: Math.min(...lats) - 0.06,
      west: Math.min(...lons) - 0.06,
      north: Math.max(...lats) + 0.06,
      east: Math.max(...lons) + 0.06,
    };
  }, [stations]);

  const stationSignature = useMemo(() => stations.map(s => String(s.id||s.name)+':'+s.lat+':'+s.lon).join('|'), [stations]);

  useEffect(() => {
    let cancelled = false;
    if (!bounds) { setHospitals([]); return; }
    setHospitalsLoading(true);

    const params = new URLSearchParams(Object.entries(bounds).reduce((o,[k,v]) => ({...o,[k]:String(v)}),{}));
    fetch('/api/hospitals?' + params.toString(), {cache:'force-cache'})
      .then(r => r.ok ? r.json() : Promise.reject(new Error('hospitals unavailable')))
      .then(data => {
        if (cancelled) return;
        const rows = Array.isArray(data.hospitals) ? data.hospitals : [];
        setHospitals(rows.filter(h => validPoint(h.lat,h.lon)));
      })
      .catch(() => { if (!cancelled) setHospitals([]); })
      .finally(() => { if (!cancelled) setHospitalsLoading(false); });

    return () => { cancelled = true; };
  }, [stationSignature, bounds?.south, bounds?.west, bounds?.north, bounds?.east]);

  return (
    <div className="operationalMap">
      <MapContainer center={center} zoom={fallback.zoom || 9} scrollWheelZoom className="leafletOperational">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19}/>
        <FitToOperationalPoints stations={stations} hospitals={hospitals} fallback={fallback} activeIntervention={activeIntervention}/>
        <AutoFocusEngagement vehicles={vehicles} activeIntervention={activeIntervention}/>
        {stations.filter(s => validPoint(s.lat,s.lon)).map((station,index) => (
          <Marker key={station.id||index} position={[Number(station.lat),Number(station.lon)]} icon={stationIcon} eventHandlers={{click:()=>onStationSelect?.(station)}}>
            <Popup><strong>{station.name}</strong><br/>{station.address || station.locality || 'Adresse référencée'}</Popup>
          </Marker>
        ))}
        {hospitals.map(h => (
          <Marker key={h.id} position={[Number(h.lat),Number(h.lon)]} icon={hospitalIcon}>
            <Popup><strong>🏥 {h.name}</strong><br/>{h.address || 'Établissement hospitalier'}</Popup>
          </Marker>
        ))}
        {activeIntervention && validPoint(activeIntervention.lat,activeIntervention.lon) && (
          <Marker position={[Number(activeIntervention.lat),Number(activeIntervention.lon)]} icon={interventionIcon}>
            <Popup className="incomingCallPopup">
              {!callAccepted ? <div className="incomingCallCard">
                <span className="incomingCallLabel">📞 APPEL ENTRANT</span>
                <strong>Appels vers 18 / 112</strong>
                <p>{activeIntervention.scenario?.title || 'Nouvelle intervention'}</p>
                <small>📍 {activeIntervention.address || 'Localisation opérationnelle'}</small>
                <div className="incomingCallActions">
                  <button type="button" onClick={onTakeCall}>Prendre l'appel</button>
                  <button type="button" onClick={onRefuseCall}>Refuser l'appel</button>
                </div>
              </div> : <div>
                <strong>🚨 Intervention en cours</strong><br/>{activeIntervention.scenario?.title || 'Intervention'}<br/>📍 {activeIntervention.address || 'Localisation opérationnelle'}
              </div>}
            </Popup>
          </Marker>
        )}
        <MovingVehicles vehicles={vehicles} activeIntervention={activeIntervention}/>
      </MapContainer>
      {hospitalsLoading && <div className="mapHospitalLoading">🏥 Chargement des hôpitaux…</div>}
    </div>
  );
}
