'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const OperationalMap = dynamic(() => import('./components/OperationalMap'), { ssr: false, loading: () => <div className="mapLoading">Chargement de la carte opérationnelle…</div> });

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

const vehicleCatalog = {
  VSAV: 'Véhicule de secours et d’assistance aux victimes',
  FPT: 'Fourgon pompe-tonne',
  CCF: 'Camion-citerne feux de forêts',
  EPA: 'Échelle pivotante automatique',
  VSR: 'Véhicule de secours routier',
  VL: 'Véhicule léger de commandement',
};

// Base de départ CTA 18 : elle est remplacée au fur et à mesure par des données
// publiques vérifiées lorsqu'une flotte réelle est documentée.
const buildOperationalProfile = (station, index) => {
  const seed = Array.from(String(station.id || station.name || index)).reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const profile = [{ type: 'VSAV', count: 1 }, { type: 'FPT', count: 1 }];
  if (seed % 3 === 0) profile.push({ type: 'CCF', count: 1 });
  if (seed % 5 === 0) profile.push({ type: 'VSR', count: 1 });
  if (seed % 7 === 0) profile.push({ type: 'EPA', count: 1 });
  profile.push({ type: 'VL', count: 1 });
  return {
    ...station,
    fleet: profile,
    personnel: 8 + (seed % 18),
    source: 'Base CTA 18',
  };
};

export default function Home() {
  const [authMode, setAuthMode] = useState(null);
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [player, setPlayer] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [servicePicker, setServicePicker] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [search, setSearch] = useState('');
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [ctaView, setCtaView] = useState('map');
  const [activeCall, setActiveCall] = useState(null);
  const [operatorPanel, setOperatorPanel] = useState('calls');
  const [dispatchVehicles, setDispatchVehicles] = useState([]);
  const [callQuestionIndex, setCallQuestionIndex] = useState(0);
  const [transportStatus, setTransportStatus] = useState(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [creatorTab, setCreatorTab] = useState('library');
  const [scenarios, setScenarios] = useState([]);
  const [scenarioForm, setScenarioForm] = useState({ title:'', category:'SAP', difficulty:'Moyen', caller:'', description:'', questions:[{question:'Que s’est-il passé ?',answer:''}], requiredVehicles:[], recommendedVehicles:[], possibleReinforcements:[],victimTransport:{has_victims:false,victim_count:0,transport_required:false,transport_count:0,destination_type:'auto',notes:''} });

  const closeAuth = () => { setAuthMode(null); setAuthMessage(''); };
  const logout = () => { setSessionToken(null); setPlayer(null); setAuthMode(null); setAuthMessage(''); setServicePicker(false); setSelectedService(null); setSearch(''); };

  const scenarioApiHeaders = () => ({ 'Content-Type':'application/json', apikey:SUPABASE_KEY, Authorization:'Bearer ' + sessionToken });
  const loadScenarios = async () => {
    if (!sessionToken) return;
    const response = await fetch(SUPABASE_URL + '/rest/v1/intervention_scenarios?select=*&order=created_at.desc',{headers:scenarioApiHeaders()});
    if (!response.ok) return;
    const rows = await response.json();
    setScenarios(rows.map(s=>({id:s.id,title:s.title,category:s.category,difficulty:s.difficulty,caller:s.caller||'',description:s.description||'',questions:s.questions||[],requiredVehicles:s.required_vehicles||[],recommendedVehicles:s.recommended_vehicles||[],possibleReinforcements:s.possible_reinforcements||[],victimTransport:{has_victims:false,victim_count:0,transport_required:false,transport_count:0,destination_type:'auto',notes:'',...(s.victim_transport||{})},status:s.status,createdAt:s.created_at,createdBy:s.created_by_email})));
  };
  useEffect(()=>{loadScenarios();},[sessionToken]);

  const creatorAuthorized = player?.email?.toLowerCase() === 'jspg459@gmail.com';
  const vehicleTypes = ['VSAV','FPT','FPTL','VSR','EPA','VL','VLCG','CCF','VID','VGRIMP'];
  const toggleScenarioVehicle = (field, vehicle) => setScenarioForm((form) => ({...form,[field]:form[field].includes(vehicle)?form[field].filter(x=>x!==vehicle):[...form[field],vehicle]}));
  const addScenarioQuestion = () => setScenarioForm((form) => ({...form,questions:[...form.questions,{question:'',answer:''}]}));
  const updateScenarioQuestion = (index, field, value) => setScenarioForm((form) => ({...form,questions:form.questions.map((q,i)=>i===index?{...q,[field]:value}:q)}));
  const saveScenario = async () => {
    if (!scenarioForm.title.trim() || !sessionToken) return;
    const payload = {
      title:scenarioForm.title, category:scenarioForm.category, difficulty:scenarioForm.difficulty,
      caller:scenarioForm.caller, description:scenarioForm.description, questions:scenarioForm.questions,
      required_vehicles:scenarioForm.requiredVehicles, recommended_vehicles:scenarioForm.recommendedVehicles,
      possible_reinforcements:scenarioForm.possibleReinforcements, victim_transport:scenarioForm.victimTransport, status:'Disponible',
      created_by_email:player?.email || null
    };
    const response = await fetch(SUPABASE_URL + '/rest/v1/intervention_scenarios', {
      method:'POST', headers:{...scenarioApiHeaders(), Prefer:'return=representation'}, body:JSON.stringify(payload)
    });
    if (!response.ok) { alert('Impossible d’enregistrer le scénario dans la base centrale.'); return; }
    setScenarioForm({title:'',category:'SAP',difficulty:'Moyen',caller:'',description:'',questions:[{question:'Que s’est-il passé ?',answer:''}],requiredVehicles:[],recommendedVehicles:[],possibleReinforcements:[],victimTransport:{has_victims:false,transport_required:false,transport_count:0,destination_type:'auto',notes:''}});
    await loadScenarios();
    setCreatorTab('library');
  };
  const deleteScenario = async (id) => {
    const response = await fetch(SUPABASE_URL + '/rest/v1/intervention_scenarios?id=eq.' + encodeURIComponent(id), { method:'DELETE', headers:scenarioApiHeaders() });
    if (response.ok) await loadScenarios();
  };

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
      else { setPlayer(data.user); setSessionToken(data.access_token); setAuthMode(null); setAuthMessage(''); }
    } catch (error) { setAuthMessage(error.message || 'Impossible de continuer.'); }
    finally { setAuthLoading(false); }
  };

  const openCTA = (service) => {
    setSearch('');
    setServicePicker(false);
    setSelectedStation(null);
    setCtaView('map');
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
    const cacheKey = 'cta18-stations-v5-' + selectedService.code;

    const readCache = () => {
      try {
        const raw = window.localStorage.getItem(cacheKey);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        return Array.isArray(cached?.stations) && cached.stations.length ? cached.stations : null;
      } catch {
        return null;
      }
    };

    const cachedStations = readCache();
    setStations(cachedStations || []);
    setStationsLoading(!cachedStations?.length);
    setStationsError('');

    const loadStations = async () => {
      try {
        // URL stable : permet au navigateur et au CDN Vercel de réutiliser le cache.
        // L'ancienne version ajoutait un timestamp et forçait une requête Overpass complète à chaque ouverture.
        const response = await fetch(
          '/api/stations?code=' + encodeURIComponent(selectedService.code),
          { cache: 'force-cache' }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Le serveur des centres est temporairement indisponible.');

        const nextStations = Array.isArray(data.stations) ? data.stations : [];
        if (!nextStations.length) throw new Error('Aucun centre retourné pour ce territoire.');

        if (!cancelled) {
          setStations(nextStations);
          setStationsError('');
          try {
            window.localStorage.setItem(cacheKey, JSON.stringify({ stations: nextStations, savedAt: Date.now() }));
          } catch {}
        }
      } catch (error) {
        if (!cancelled) {
          // Les centres déjà présents restent immédiatement utilisables.
          if (!cachedStations?.length) setStations([]);
          setStationsError(error?.message || 'Impossible de charger les centres. Réessayez.');
        }
      } finally {
        if (!cancelled) setStationsLoading(false);
      }
    };

    // Si le territoire a déjà été ouvert, l'affichage est instantané depuis le stockage local.
    // La synchronisation réseau se fait ensuite sans vider la liste.
    loadStations();

    return () => { cancelled = true; };
  }, [selectedService]);

  const operationalStations = useMemo(() => stations.map(buildOperationalProfile), [stations]);
  const fleetTotals = useMemo(() => {
    const totals = {};
    operationalStations.forEach((station) => station.fleet.forEach((vehicle) => {
      totals[vehicle.type] = (totals[vehicle.type] || 0) + vehicle.count;
    }));
    return totals;
  }, [operationalStations]);
  const personnelTotal = useMemo(() => operationalStations.reduce((sum, station) => sum + station.personnel, 0), [operationalStations]);

  const playerName = player?.user_metadata?.username || player?.email?.split('@')[0];

  const startScenario = (scenario) => {
    const base = operationalStations[0];
    const call = { id:Date.now().toString(), scenario, status:'APPEL EN COURS', address:'Adresse générée automatiquement lors de l’alerte', lat:base?.lat||46.6, lon:base?.lon||1.88, startedAt:Date.now() };
    setActiveCall(call); setDispatchVehicles([]); setCallQuestionIndex(0); setOperatorPanel('call'); setCtaView('operations');
  };
  const dispatchVehicle = (station, type) => {
    if (!activeCall) return;
    const item={id:Date.now()+'-'+type,stationId:station.id,stationName:station.name,type,status:'EN ROUTE',lat:station.lat,lon:station.lon};
    setDispatchVehicles(list=>[...list,item]);
    setActiveCall(call=>({...call,status:'MOYENS ENGAGÉS'}));
  };
  const sendVsavToHospital = (vehicle) => {
    setDispatchVehicles(list=>list.map(v=>v.id===vehicle.id?{...v,status:'TRANSPORT HÔPITAL'}:v));
    setTransportStatus({vehicleId:vehicle.id,vehicleName:vehicle.type+' '+vehicle.stationName,lat:activeCall?.lat,lon:activeCall?.lon});
  };
  const returnVsavToCis = (vehicle) => {
    setDispatchVehicles(list=>list.map(v=>v.id===vehicle.id?{...v,status:'RETOUR CIS'}:v));
    setTransportStatus(null);
  };

const operatorConsole = selectedService ? <div className="operatorConsoleInline">
  <div className="operatorHeader"><div><span className="authTag">POSTE OPÉRATEUR CTA</span><h2>Console opérationnelle</h2></div><div className="operatorStatus">{activeCall ? '🔴 '+activeCall.status : '🟢 EN ATTENTE D’ALERTE'}</div></div>
  <div className="operatorTabs"><button className={operatorPanel==='calls'?'active':''} onClick={()=>setOperatorPanel('calls')}>📞 Appels</button><button className={operatorPanel==='call'?'active':''} onClick={()=>setOperatorPanel('call')}>🎧 Appel en cours</button><button className={operatorPanel==='dispatch'?'active':''} onClick={()=>setOperatorPanel('dispatch')}>🚒 Engagement</button><button className={operatorPanel==='means'?'active':''} onClick={()=>setOperatorPanel('means')}>📊 Moyens</button><button className={operatorPanel==='hospital'?'active':''} onClick={()=>setOperatorPanel('hospital')}>🏥 Transports</button></div>
  {operatorPanel==='calls' && <div className="operatorBody"><h3>📞 Déclencher un scénario de test</h3><div className="scenarioLaunchGrid">{scenarios.map(s=><button key={s.id} className="launchScenario" onClick={()=>startScenario(s)}><b>{s.category}</b><strong>{s.title}</strong><small>{s.difficulty} • {s.victimTransport?.has_victims?'Victime(s)':'Sans victime'}</small></button>)}</div>{scenarios.length===0&&<p>Aucun scénario disponible.</p>}</div>}
  {operatorPanel==='call' && <div className="operatorBody">{!activeCall?<div className="operatorEmpty">Aucun appel actif.</div>:<><div className="callCard"><span>📞 APPELANT</span><h3>{activeCall.scenario.caller||'Témoin'}</h3><p>{activeCall.scenario.description}</p></div>{activeCall.scenario.questions?.length>0&&<div className="qaOperator"><div><span>QUESTION {callQuestionIndex+1}/{activeCall.scenario.questions.length}</span><h3>{activeCall.scenario.questions[callQuestionIndex].question}</h3><p>Réponse : {activeCall.scenario.questions[callQuestionIndex].answer||'À préciser'}</p></div><div className="qaControls"><button disabled={callQuestionIndex===0} onClick={()=>setCallQuestionIndex(i=>i-1)}>←</button><button disabled={callQuestionIndex>=activeCall.scenario.questions.length-1} onClick={()=>setCallQuestionIndex(i=>i+1)}>→</button></div></div>}<button className="operatorPrimary" onClick={()=>setOperatorPanel('dispatch')}>🚒 Passer à l'engagement des moyens</button></>}</div>}
  {operatorPanel==='dispatch' && <div className="operatorBody"><h3>🚒 Engager les moyens</h3>{!activeCall?<p>Aucune intervention sélectionnée.</p>:<><div className="dispatchRequirement"><b>Indispensables :</b> {activeCall.scenario.requiredVehicles.join(' • ')||'À définir'}</div><div className="dispatchStations">{operationalStations.slice(0,60).map(st=>{const vehicles=st.fleet||[];return <div className="dispatchStation" key={st.id}><strong>{st.name}</strong><div>{vehicles.map(v=>Array.from({length:v.count||1}).map((_,i)=><button key={v.type+i} onClick={()=>dispatchVehicle(st,v.type)}>+ {v.type}</button>))}</div></div>})}</div></>}</div>}
  {operatorPanel==='means' && <div className="operatorBody"><h3>📊 Moyens engagés</h3>{dispatchVehicles.length===0?<p>Aucun moyen engagé.</p>:dispatchVehicles.map(v=><div className="engagedVehicle" key={v.id}><b>🚒 {v.type}</b><span>{v.stationName}</span><em>{v.status}</em>{v.type==='VSAV'&&activeCall?.scenario.victimTransport?.transport_required&&<button onClick={()=>sendVsavToHospital(v)}>🏥 Transporter</button>}</div>)}</div>}
  {operatorPanel==='hospital' && <div className="operatorBody"><h3>🏥 Gestion des transports</h3>{!activeCall?<p>Aucune intervention.</p>:!activeCall.scenario.victimTransport?.has_victims?<p>Ce scénario ne comporte aucune victime.</p>:!activeCall.scenario.victimTransport?.transport_required?<div className="transportInfo">🟢 Victime(s) prise(s) en charge — <b>aucun transport hospitalier prévu.</b></div>:<><div className="transportInfo">🚑 {activeCall.scenario.victimTransport.transport_count} victime(s) à transporter • Destination : {activeCall.scenario.victimTransport.destination_type==='nearest'?'hôpital le plus proche':'hôpital adapté automatiquement'}</div>{dispatchVehicles.filter(v=>v.type==='VSAV').map(v=><div className="engagedVehicle" key={v.id}><b>🚑 VSAV</b><span>{v.stationName}</span><em>{v.status}</em>{v.status==='TRANSPORT HÔPITAL'?<button onClick={()=>returnVsavToCis(v)}>↩️ Retour CIS</button>:<button onClick={()=>sendVsavToHospital(v)}>🏥 Envoyer à l'hôpital</button>}</div>)}</>}</div>}
</div> : null;

  const creatorModal = creatorOpen && creatorAuthorized ? (
    <div className="creatorOverlay" onClick={(e)=>{if(e.target===e.currentTarget)setCreatorOpen(false)}}>
      <div className="creatorModal">
        <div className="creatorHeader"><div><span className="authTag">ESPACE PRIVÉ</span><h2>👑 Créateur d'interventions</h2><p>Bibliothèque nationale — jouable dans tous les départements.</p></div><button className="creatorClose" onClick={()=>setCreatorOpen(false)}>✕</button></div>
        <div className="creatorStats"><div><b>{scenarios.length}</b><span>SCÉNARIOS CRÉÉS</span></div><div><b>{scenarios.filter(s=>s.status==='Disponible').length}</b><span>DISPONIBLES</span></div><div><b>{scenarios.filter(s=>s.requiredVehicles.length).length}</b><span>MOYENS DÉFINIS</span></div></div>
        <div className="creatorTabs"><button className={creatorTab==='library'?'active':''} onClick={()=>setCreatorTab('library')}>📚 Interventions disponibles</button><button className={creatorTab==='create'?'active':''} onClick={()=>setCreatorTab('create')}>➕ Créer une intervention</button></div>
        {creatorTab==='library' ? <div className="scenarioLibrary">{scenarios.length===0?<div className="scenarioEmpty"><span>🚨</span><h3>Aucun scénario pour le moment</h3><button onClick={()=>setCreatorTab('create')}>Créer le premier scénario</button></div>:scenarios.map(s=><div className="scenarioCard" key={s.id}><div className="scenarioCardTop"><span className="scenarioCategory">{s.category}</span><span className="scenarioStatus">{s.status}</span></div><h3>{s.title}</h3><p>{s.description||'Scénario national.'}</p><div className="scenarioMeta"><span>🎚️ {s.difficulty}</span><span>📞 {s.questions.length} question(s)</span><span>🚒 {s.requiredVehicles.length} indispensable(s)</span></div><div className="scenarioVehiclePreview">{s.requiredVehicles.map(v=><b key={v}>{v}</b>)}</div><div className="scenarioActions"><button onClick={()=>deleteScenario(s.id)}>Supprimer</button></div></div>)}</div>:
        <div className="scenarioCreatorForm">
          <div className="formSection"><h3>🚨 Identité du scénario</h3><div className="creatorGrid"><label>Nom<input value={scenarioForm.title} onChange={e=>setScenarioForm({...scenarioForm,title:e.target.value})}/></label><label>Catégorie<select value={scenarioForm.category} onChange={e=>setScenarioForm({...scenarioForm,category:e.target.value})}><option>SAP</option><option>AVP</option><option>INC</option><option>DIV</option><option>RCH</option><option>Sauvetage</option></select></label><label>Difficulté<select value={scenarioForm.difficulty} onChange={e=>setScenarioForm({...scenarioForm,difficulty:e.target.value})}><option>Facile</option><option>Moyen</option><option>Difficile</option><option>Critique</option></select></label><label>Appelant<input value={scenarioForm.caller} onChange={e=>setScenarioForm({...scenarioForm,caller:e.target.value})}/></label></div><label className="fullLabel">Description<textarea value={scenarioForm.description} onChange={e=>setScenarioForm({...scenarioForm,description:e.target.value})}/></label></div>
          <div className="formSection"><h3>📞 Questions / réponses</h3>{scenarioForm.questions.map((q,i)=><div className="qaRow" key={i}><input value={q.question} onChange={e=>updateScenarioQuestion(i,'question',e.target.value)} placeholder="Question CTA"/><input value={q.answer} onChange={e=>updateScenarioQuestion(i,'answer',e.target.value)} placeholder="Réponse appelant"/></div>)}<button className="secondaryButton" onClick={addScenarioQuestion}>+ Ajouter une question</button></div>
          <div className="formSection"><h3>🏥 Victimes et transport hospitalier</h3>
<p className="formHint">Chaque scénario définit clairement si des victimes doivent être transportées ou non.</p>
<div className="creatorGrid">
<label>Y a-t-il des victimes ?<select value={scenarioForm.victimTransport.has_victims?'yes':'no'} onChange={e=>setScenarioForm({...scenarioForm,victimTransport:{...scenarioForm.victimTransport,has_victims:e.target.value==='yes',victim_count:e.target.value==='yes'?Math.max(1,Number(scenarioForm.victimTransport.victim_count)||1):0,transport_required:e.target.value==='yes'?scenarioForm.victimTransport.transport_required:false,transport_count:e.target.value==='yes'?scenarioForm.victimTransport.transport_count:0}})}><option value="no">Non</option><option value="yes">Oui</option></select></label>
{scenarioForm.victimTransport.has_victims && <><label>Nombre total de victimes<input type="number" min="1" value={scenarioForm.victimTransport.victim_count || 1} onChange={e=>setScenarioForm({...scenarioForm,victimTransport:{...scenarioForm.victimTransport,victim_count:Math.max(1,Number(e.target.value)||1),transport_count:Math.min(Math.max(1,Number(e.target.value)||1),scenarioForm.victimTransport.transport_count||0)}})}/></label><label>Transport nécessaire ?<select value={scenarioForm.victimTransport.transport_required?'yes':'no'} onChange={e=>setScenarioForm({...scenarioForm,victimTransport:{...scenarioForm.victimTransport,transport_required:e.target.value==='yes',transport_count:e.target.value==='yes'?Math.max(1,scenarioForm.victimTransport.transport_count||1):0}})}><option value="no">❌ Aucun transport</option><option value="yes">🏥 Transport vers un hôpital</option></select></label>
{scenarioForm.victimTransport.transport_required && <><label>Nombre de victimes à transporter<input type="number" min="1" max={scenarioForm.victimTransport.victim_count || undefined} value={scenarioForm.victimTransport.transport_count || 1} onChange={e=>setScenarioForm({...scenarioForm,victimTransport:{...scenarioForm.victimTransport,transport_count:Math.min(scenarioForm.victimTransport.victim_count||999,Math.max(1,Number(e.target.value)||1))}})}/></label><label>Destination<select value={scenarioForm.victimTransport.destination_type} onChange={e=>setScenarioForm({...scenarioForm,victimTransport:{...scenarioForm.victimTransport,destination_type:e.target.value}})}><option value="auto">Hôpital adapté automatiquement</option><option value="nearest">Hôpital le plus proche</option></select></label></>}</>}
</div>
{scenarioForm.victimTransport.has_victims && <label className="fullLabel">Consignes médicales / transport<textarea value={scenarioForm.victimTransport.notes} onChange={e=>setScenarioForm({...scenarioForm,victimTransport:{...scenarioForm.victimTransport,notes:e.target.value}})} placeholder="Ex. victime consciente, bilan médical, transport nécessaire ou maintien sur place..."/></label>}
</div>
<div className="formSection"><h3>🚒 Moyens opérationnels</h3><p className="formHint">Les moyens manquants peuvent rallonger l'intervention ou provoquer une demande automatique de renfort.</p><div className="vehicleRuleGrid">{[['requiredVehicles','🔴 Indispensables','Absents : renfort automatique'],['recommendedVehicles','🟠 Recommandés','Absents : intervention plus longue'],['possibleReinforcements','🔵 Renforts possibles','Selon évolution']].map(([field,title,desc])=><div className="vehicleRule" key={field}><h4>{title}</h4><p>{desc}</p>{vehicleTypes.map(v=><button type="button" key={v} className={scenarioForm[field].includes(v)?'selected':''} onClick={()=>toggleScenarioVehicle(field,v)}>{v}</button>)}</div>)}</div></div>
          <div className="scenarioSaveBar"><button className="saveScenarioButton" onClick={saveScenario}>💾 Enregistrer dans la base centrale</button></div>
        </div>}
      </div>
    </div>
  ) : null;

  return (
    <main className="site">{creatorModal}
      <header className="top"><div className="wrap navWrap">
        <a className="brand" href="#home" onClick={() => { closeAuth(); setServicePicker(false); setSelectedService(null); }}><span className="shield">18</span><span>CTA <b>18</b></span></a>
        <div className="account">{player ? <>{creatorAuthorized && <button type="button" className="creatorNavButton" onClick={() => setCreatorOpen(true)}>👑 Créateur</button>}<span className="playerName">👤 {playerName}</span><button type="button" className="logout" onClick={logout}>Déconnexion</button></> : <><button type="button" onClick={() => setAuthMode('login')}>Connexion</button><button type="button" className="signup" onClick={() => setAuthMode('signup')}>Inscription</button></>}</div>
      </div></header>

      {player ? (
        selectedService ? (
          <section className="ctaDashboard ctaCommandStyle">
            <div className="ctaStatusStrip">
              <div><b>{new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).toUpperCase()}</b><small>CTA 18 • simulation opérationnelle</small></div>
              <span><i className="legendDot green"></i> Intervention(s) au total: <b>0</b></span>
              <span><i className="legendDot green"></i> Intervention(s) en cours: <b>0</b></span>
              <span><i className="legendDot green"></i> Véhicule(s) en interventions: <b>0</b></span>
              <span><i className="legendDot green"></i> Temps de réponse moyen: <b>–</b></span>
              <button>GAME ID</button>
            </div>

            <section className="ctaMapCommand">
              <div className="commandMapToolbar">
                <div className="mapToolGroup">
                  <button className={ctaView === 'console' ? 'active' : ''} type="button" onClick={() => setCtaView('console')}>Console opérationnelle</button>
                  <button className={ctaView === 'map' ? 'active' : ''} type="button" onClick={() => setCtaView('map')}>Cartographie</button>
                  <button className={ctaView === 'activeInterventions' ? 'active' : ''} type="button" onClick={() => setCtaView('activeInterventions')}>Interventions en cours <span className="menuCounter">0</span></button>
                  <button className={ctaView === 'reinforcements' ? 'active' : ''} type="button" onClick={() => setCtaView('reinforcements')}>Demande de renfort <span className="menuCounter">0</span></button>
                </div>
                <div className="selectedSdisBadge">
                  <span className="selectedSdisLabel">SDIS SÉLECTIONNÉ</span>
                  <strong>{selectedService.name}</strong>
                  <span className="selectedSdisMeta"><i className="legendDot green"></i>{operationalStations.length} CIS • En ligne</span>
                </div>
              </div>}

              <div className="commandMapArea">
                {ctaView === 'console' ? operatorConsole : ctaView === 'map' ? <>
                  <OperationalMap
                    stations={operationalStations}
                    fallback={{ lat: 46.603354, lon: 1.888334, zoom: 6 }}
                    onStationSelect={setSelectedStation}
                  />
                  <div className="mapLegendOperational">
                    <div><i className="legendDot green"></i> CIS disponible</div>
                    <div><i className="legendDot red"></i> CIS engagé</div>
                    <div><i className="legendDot orange"></i> Intervention</div>
                    <div>🏥 Hôpital</div>
                  </div>
                </> : ctaView === 'operations' ? <div className="synopticScreen">
                  <div className="synopticScreenHead"><span className="authTag">SYNOPTIQUE DES OPÉRATIONS</span><h2>Suivi des interventions</h2><p>Toutes les alertes et les opérations du territoire apparaîtront ici en temps réel.</p></div>
                  <div className="synopticMetricGrid">
                    <div><b>0</b><span>APPELS EN ATTENTE</span></div>
                    <div><b>0</b><span>INTERVENTIONS EN COURS</span></div>
                    <div><b>0</b><span>ENGINS ENGAGÉS</span></div>
                    <div><b>–</b><span>TEMPS MOYEN</span></div>
                  </div>
                  <div className="synopticEmptyState"><span>🚨</span><h3>Aucune opération active</h3><p>Le tableau se remplira automatiquement dès qu'un appel sera traité.</p></div>
                </div> : ctaView === 'activeInterventions' ? <div className="synopticScreen activeInterventionsScreen">
                  <div className="synopticScreenHead"><span className="authTag">INTERVENTIONS EN COURS</span><h2>Suivi opérationnel en temps réel</h2><p>Toutes les interventions actives du territoire apparaîtront ici avec leur localisation, leur priorité et les moyens engagés.</p></div>
                  <div className="synopticMetricGrid">
                    <div><b>0</b><span>INTERVENTIONS ACTIVES</span></div>
                    <div><b>0</b><span>ENGINS ENGAGÉS</span></div>
                    <div><b>0</b><span>PERSONNELS ENGAGÉS</span></div>
                    <div><b>–</b><span>PRIORITÉ MAXIMALE</span></div>
                  </div>
                  <div className="synopticEmptyState"><span>🚨</span><h3>Aucune intervention en cours</h3><p>Dès qu'un appel sera traité et qu'une intervention sera créée, elle apparaîtra automatiquement dans cette liste.</p></div>
                </div> : ctaView === 'reinforcements' ? <div className="synopticScreen reinforcementScreen">
                  <div className="synopticScreenHead"><span className="authTag">DEMANDES DE RENFORT</span><h2>Coordination des renforts</h2><p>Les demandes de moyens supplémentaires provenant des interventions et des CIS seront centralisées ici.</p></div>
                  <div className="synopticMetricGrid resources">
                    <div><b>0</b><span>DEMANDES EN ATTENTE</span></div>
                    <div><b>0</b><span>RENFORTS ACCEPTÉS</span></div>
                    <div><b>{operationalStations.length}</b><span>CIS MOBILISABLES</span></div>
                    <div><b>{Object.values(fleetTotals).reduce((sum, value) => sum + value, 0)}</b><span>ENGINS DISPONIBLES</span></div>
                  </div>
                  <div className="synopticEmptyState"><span>🆘</span><h3>Aucune demande de renfort</h3><p>Lorsqu'une intervention nécessitera des moyens supplémentaires, la demande apparaîtra ici pour validation et engagement.</p></div>
                </div> : ctaView === 'resources' ? <div className="synopticScreen">
                  <div className="synopticScreenHead"><span className="authTag">SYNOPTIQUE DES MOYENS</span><h2>Disponibilité opérationnelle</h2><p>Vue en temps réel des CIS, engins et personnels disponibles.</p></div>
                  <div className="synopticMetricGrid resources">
                    <div><b>{operationalStations.length}</b><span>CIS DISPONIBLES</span></div>
                    <div><b>{personnelTotal}</b><span>PERSONNELS</span></div>
                    <div><b>{Object.values(fleetTotals).reduce((sum, value) => sum + value, 0)}</b><span>ENGINS</span></div>
                    <div><b>100%</b><span>DISPONIBILITÉ</span></div>
                  </div>
                  <div className="synopticFleetList">{Object.entries(fleetTotals).map(([type,count]) => <div key={type}><b>{type}</b><strong>{count}</strong><span>{vehicleCatalog[type] || 'Moyen opérationnel'}</span></div>)}</div>
                </div> : <div className="synopticScreen placeholderScreen">
                  <div className="synopticScreenHead"><span className="authTag">{ctaView === 'chat' ? 'CHAT OPÉRATIONNEL' : 'BILLETS'}</span><h2>{ctaView === 'chat' ? 'Communications CTA' : 'Billets opérationnels'}</h2><p>Cette section est prête pour la prochaine étape du jeu.</p></div>
                  <div className="synopticEmptyState"><span>{ctaView === 'chat' ? '💬' : '🎫'}</span><h3>Aucun élément pour le moment</h3></div>
                </div>}
              </div>
            </section>

            <section className="commandLowerGrid">
              <article className="operationsConsole">
                <div className="consoleHead"><div><span className="authTag">SYNOPTIQUE DES OPÉRATIONS</span><h2>Interventions</h2></div><strong>0</strong></div>
                <div className="operationEmpty"><span>🚨</span><div><b>Aucune intervention active</b><p>Les appels et interventions apparaîtront ici en temps réel.</p></div></div>
                <div className="consoleTimeline"><span className="greenLine"></span><span>Réception</span><span>Engagement</span><span>Surveillance</span><span>Clôture</span></div>
              </article>

              <article className="resourcesConsole">
                <div className="consoleHead"><div><span className="authTag">SYNOPTIQUE DES MOYENS</span><h2>Moyens disponibles</h2></div><strong>{Object.values(fleetTotals).reduce((sum, value) => sum + value, 0)}</strong></div>
                <div className="resourceQuickGrid">
                  <div><b>{operationalStations.length}</b><span>CIS</span></div>
                  <div><b>{personnelTotal}</b><span>PERSONNELS</span></div>
                  <div><b>{Object.values(fleetTotals).reduce((sum, value) => sum + value, 0)}</b><span>ENGINS</span></div>
                </div>
                <div className="resourceTypes">{Object.entries(fleetTotals).slice(0,6).map(([type,count]) => <span key={type}><b>{type}</b> {count}</span>)}</div>
              </article>
            </section>

            <section className="cisOperationsBoard commandCisList">
              <div className="sectionBoardHead">
                <div><span className="authTag">CENTRES DE SECOURS</span><h2>Disponibilité des CIS</h2><p>Sélectionnez un centre pour consulter ses moyens et son personnel.</p></div>
                <span>{stationsLoading ? 'Chargement…' : operationalStations.length + ' CIS'}</span>
              </div>
              {stationsLoading ? <div className="stationBoardLoading">Chargement des centres réels et de leurs positions…</div> :
                operationalStations.length ? <div className="cisOperationsList">
                  {operationalStations.map((station,index) => <button className={'cisCommandRow' + (selectedStation?.id===station.id ? ' selected' : '')} key={station.id || index} type="button" onClick={() => setSelectedStation(station)}>
                    <div className="cisCommandIcon">🚒</div>
                    <div className="cisCommandInfo"><b>{station.name}</b><small>{station.address || 'Adresse référencée dans la cartographie'}</small><span>👨‍🚒 {station.personnel} personnels disponibles</span></div>
                    <div className="cisFleetBadges">{station.fleet.map(v => <em key={v.type}>{v.type} × {v.count}</em>)}</div>
                    <strong>›</strong>
                  </button>)}
                </div> : <div className="stationBoardLoading">Aucun centre n'a pu être chargé pour ce territoire.</div>}
            </section>

            {selectedStation && <section className="stationCommandDetail">
              <div><span className="authTag">CENTRE SÉLECTIONNÉ</span><h3>🚒 {selectedStation.name}</h3><p>{selectedStation.address || 'Adresse cartographique non renseignée'} · 👨‍🚒 {selectedStation.personnel} personnels disponibles</p></div>
              <div className="detailVehicles">{selectedStation.fleet.map(v => <span key={v.type}><b>{v.type}</b> × {v.count}</span>)}</div>
              <button type="button" onClick={() => setSelectedStation(null)}>FERMER ✕</button>
            </section>}
          </section>
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
