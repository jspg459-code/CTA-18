'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const OperationalMap = dynamic(() => import('./components/OperationalMap'), {
  ssr: false,
  loading: () => <div className="mapLoading">Chargement de la cartographie…</div>,
});

const SUPABASE_URL = 'https://zypntdqemnehqgogwntu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OQ2mszgzlwfBRMVPCi33zw_jOT-hadJ';

const departments = [
  ['01','Ain'],['02','Aisne'],['03','Allier'],['04','Alpes-de-Haute-Provence'],['05','Hautes-Alpes'],['06','Alpes-Maritimes'],['07','Ardèche'],['08','Ardennes'],['09','Ariège'],['10','Aube'],['11','Aude'],['12','Aveyron'],['13','Bouches-du-Rhône'],['14','Calvados'],['15','Cantal'],['16','Charente'],['17','Charente-Maritime'],['18','Cher'],['19','Corrèze'],['21','Côte-d’Or'],['22','Côtes-d’Armor'],['23','Creuse'],['24','Dordogne'],['25','Doubs'],['26','Drôme'],['27','Eure'],['28','Eure-et-Loir'],['29','Finistère'],['30','Gard'],['31','Haute-Garonne'],['32','Gers'],['33','Gironde'],['34','Hérault'],['35','Ille-et-Vilaine'],['36','Indre'],['37','Indre-et-Loire'],['38','Isère'],['39','Jura'],['40','Landes'],['41','Loir-et-Cher'],['42','Loire'],['43','Haute-Loire'],['44','Loire-Atlantique'],['45','Loiret'],['46','Lot'],['47','Lot-et-Garonne'],['48','Lozère'],['49','Maine-et-Loire'],['50','Manche'],['51','Marne'],['52','Haute-Marne'],['53','Mayenne'],['54','Meurthe-et-Moselle'],['55','Meuse'],['56','Morbihan'],['57','Moselle'],['58','Nièvre'],['59','Nord'],['60','Oise'],['61','Orne'],['62','Pas-de-Calais'],['63','Puy-de-Dôme'],['64','Pyrénées-Atlantiques'],['65','Hautes-Pyrénées'],['66','Pyrénées-Orientales'],['67','Bas-Rhin'],['68','Haut-Rhin'],['69','Rhône'],['70','Haute-Saône'],['71','Saône-et-Loire'],['72','Sarthe'],['73','Savoie'],['74','Haute-Savoie'],['75','Paris'],['76','Seine-Maritime'],['77','Seine-et-Marne'],['78','Yvelines'],['79','Deux-Sèvres'],['80','Somme'],['81','Tarn'],['82','Tarn-et-Garonne'],['83','Var'],['84','Vaucluse'],['85','Vendée'],['86','Vienne'],['87','Haute-Vienne'],['88','Vosges'],['89','Yonne'],['90','Territoire de Belfort'],['91','Essonne'],['92','Hauts-de-Seine'],['93','Seine-Saint-Denis'],['94','Val-de-Marne'],['95','Val-d’Oise']
].map(([code,name]) => ({code,name}));


const LOCAL_STATION_FALLBACKS = {
  '59': [
    {id:'fallback-lille',name:'CIS Lille',address:'Lille',lat:50.6292,lon:3.0573},
    {id:'fallback-maubeuge',name:'CIS Maubeuge',address:'Maubeuge',lat:50.2780,lon:3.9720},
    {id:'fallback-valenciennes',name:'CIS Valenciennes',address:'Valenciennes',lat:50.3570,lon:3.5230},
    {id:'fallback-douai',name:'CIS Douai',address:'Douai',lat:50.3700,lon:3.0800},
    {id:'fallback-cambrai',name:'CIS Cambrai',address:'Cambrai',lat:50.1750,lon:3.2350},
    {id:'fallback-hazebrouck',name:'CIS Hazebrouck',address:'Hazebrouck',lat:50.7230,lon:2.5380},
    {id:'fallback-dunkerque',name:'CIS Dunkerque',address:'Dunkerque',lat:51.0344,lon:2.3768}
  ],
  '62': [
    {id:'fallback-arras',name:'CIS Arras',address:'Arras',lat:50.2910,lon:2.7770},
    {id:'fallback-lens',name:'CIS Lens',address:'Lens',lat:50.4300,lon:2.8330},
    {id:'fallback-bethune',name:'CIS Béthune',address:'Béthune',lat:50.5300,lon:2.6400},
    {id:'fallback-calais',name:'CIS Calais',address:'Calais',lat:50.9510,lon:1.8580}
  ]
};

const fallbackStationsFor = (code) => {
  if (LOCAL_STATION_FALLBACKS[code]) return LOCAL_STATION_FALLBACKS[code];
  return [];
};

const fallbackScenarios = [
  {id:'local-1',title:'Malaise à domicile',category:'SAP',difficulty:'Moyen',caller:'Mme Martin',description:'Une personne est inconsciente mais respire.',questions:[{question:'La personne est-elle consciente ?',answer:'Non, elle ne répond pas.'},{question:'Est-ce qu’elle respire normalement ?',answer:'Oui, sa respiration est présente.'}],requiredVehicles:['VSAV'],recommendedVehicles:[],victimTransport:{has_victims:true,victim_count:1,transport_required:true,transport_count:1,destination_type:'nearest'}},
  {id:'local-2',title:'Accident de la circulation',category:'AVP',difficulty:'Difficile',caller:'Témoin',description:'Deux véhicules sont impliqués sur une route départementale.',questions:[{question:'Combien de véhicules sont impliqués ?',answer:'Deux véhicules.'},{question:'Y a-t-il des victimes bloquées ?',answer:'Une personne ne peut pas sortir du véhicule.'}],requiredVehicles:['VSAV','VSR'],recommendedVehicles:['FPT'],victimTransport:{has_victims:true,victim_count:2,transport_required:true,transport_count:2,destination_type:'nearest'}},
  {id:'local-3',title:'Feu d’habitation',category:'INC',difficulty:'Critique',caller:'Voisin',description:'De la fumée sort d’une maison individuelle.',questions:[{question:'Le feu est-il visible ?',answer:'Oui, au rez-de-chaussée.'},{question:'Les occupants sont-ils évacués ?',answer:'Pas encore confirmé.'}],requiredVehicles:['FPT'],recommendedVehicles:['EPA','VSAV'],victimTransport:{has_victims:false,victim_count:0,transport_required:false}},
];

const fleetFor = (station,index) => {
  const seed = Array.from(String(station.id || station.name || index)).reduce((n,c)=>n+c.charCodeAt(0),0);
  const fleet=[{type:'VSAV',count:2},{type:'FPT',count:1},{type:'VL',count:1}];
  if(seed%3===0) fleet.push({type:'VSR',count:1});
  if(seed%4===0) fleet.push({type:'CCF',count:1});
  if(seed%6===0) fleet.push({type:'EPA',count:1});
  return {...station,lat:Number(station.lat),lon:Number(station.lon),fleet,personnel:8+(seed%15)};
};

const distanceKm = (a,b) => {
  const rad=x=>x*Math.PI/180;
  const R=6371;
  const dLat=rad(Number(b.lat)-Number(a.lat));
  const dLon=rad(Number(b.lon)-Number(a.lon));
  const x=Math.sin(dLat/2)**2+Math.cos(rad(Number(a.lat)))*Math.cos(rad(Number(b.lat)))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
};

export default function Home(){
  const [authMode,setAuthMode]=useState(null);
  const [authLoading,setAuthLoading]=useState(false);
  const [authMessage,setAuthMessage]=useState('');
  const [player,setPlayer]=useState(null);
  const [sessionToken,setSessionToken]=useState(null);
  const [servicePicker,setServicePicker]=useState(false);
  const [selectedService,setSelectedService]=useState(null);
  const [search,setSearch]=useState('');
  const [stations,setStations]=useState([]);
  const [stationsLoading,setStationsLoading]=useState(false);
  const [stationsError,setStationsError]=useState('');
  const [scenarios,setScenarios]=useState(fallbackScenarios);
  const [activeCall,setActiveCall]=useState(null);
  const [callAccepted,setCallAccepted]=useState(false);
  const [workflow,setWorkflow]=useState('map');
  const [questionIndex,setQuestionIndex]=useState(0);
  const [selectedVehicles,setSelectedVehicles]=useState([]);
  const [engagedVehicles,setEngagedVehicles]=useState([]);
  const [activeTab,setActiveTab]=useState('map');

  const headers=()=>({'Content-Type':'application/json',apikey:SUPABASE_KEY,Authorization:'Bearer '+sessionToken});

  const handleAuth=async(e)=>{
    e.preventDefault();
    const form=new FormData(e.currentTarget);
    const email=form.get('email'),password=form.get('password'),username=form.get('username');
    setAuthLoading(true);setAuthMessage('');
    try{
      const signup=authMode==='signup';
      const response=await fetch(SUPABASE_URL+(signup?'/auth/v1/signup':'/auth/v1/token?grant_type=password'),{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_KEY},body:JSON.stringify(signup?{email,password,data:{username}}:{email,password})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.message||data.msg||'Impossible de continuer.');
      if(signup){setAuthMessage('Compte créé. Connecte-toi maintenant.');setAuthMode('login');}
      else {setPlayer(data.user);setSessionToken(data.access_token);setAuthMode(null);}
    }catch(err){setAuthMessage(err.message||'Erreur de connexion.');}
    finally{setAuthLoading(false);}
  };

  const openService=(service)=>{setSelectedService(service);setServicePicker(false);setActiveTab('map');setWorkflow('map');setActiveCall(null);setSelectedVehicles([]);setEngagedVehicles([]);};

  useEffect(()=>{
    if(!selectedService) return;
    let cancelled=false;
    setStationsLoading(true);setStationsError('');
    fetch('/api/stations?code='+encodeURIComponent(selectedService.code),{cache:'no-store'})
      .then(r=>r.json().then(data=>({ok:r.ok,data})))
      .then(({ok,data})=>{
        if(!ok) throw new Error(data.error||'Impossible de charger les centres.');
        if(!cancelled) { const rows=Array.isArray(data.stations)?data.stations:[]; setStations(rows.length?rows:fallbackStationsFor(selectedService.code)); if(!rows.length) setStationsError('Source des centres indisponible : affichage des centres de secours de secours.'); }
      })
      .catch(err=>{if(!cancelled){const fallback=fallbackStationsFor(selectedService.code); setStations(fallback); setStationsError(fallback.length?'Source en ligne indisponible : centres de secours affichés en mode secours.':(err.message||'Impossible de charger les centres.'));}})
      .finally(()=>{if(!cancelled)setStationsLoading(false);});
    return()=>{cancelled=true;};
  },[selectedService]);

  useEffect(()=>{
    if(!sessionToken) return;
    fetch(SUPABASE_URL+'/rest/v1/intervention_scenarios?select=*&status=eq.Disponible&order=created_at.desc',{headers:headers()})
      .then(r=>r.ok?r.json():[])
      .then(rows=>{if(Array.isArray(rows)&&rows.length)setScenarios(rows.map(s=>({id:s.id,title:s.title,category:s.category||'DIV',difficulty:s.difficulty||'Moyen',caller:s.caller||'',description:s.description||'',questions:s.questions||[],requiredVehicles:s.required_vehicles||[],recommendedVehicles:s.recommended_vehicles||[],victimTransport:{has_victims:false,victim_count:0,transport_required:false,transport_count:0,destination_type:'nearest',...(s.victim_transport||{})}})));})
      .catch(()=>{});
  },[sessionToken]);

  const operationalStations=useMemo(()=>{
    const list=stations.map(fleetFor);
    if(!activeCall) return list;
    return list.map(s=>({...s,distanceToCall:distanceKm(s,{lat:activeCall.lat,lon:activeCall.lon})})).sort((a,b)=>a.distanceToCall-b.distanceToCall);
  },[stations,activeCall]);

  const startScenario=(scenario)=>{
    const candidates=operationalStations.filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lon));
    const base=candidates[Math.floor(Math.random()*Math.max(candidates.length,1))];
    const seed=Date.now();
    const lat=base?base.lat+((((seed%1000)/1000)-.5)*.04):46.6;
    const lon=base?base.lon+((((Math.floor(seed/1000)%1000)/1000)-.5)*.04):1.88;
    const address=base?(base.address||('Secteur de '+base.name)):'Localisation opérationnelle';
    setActiveCall({id:String(seed),scenario,address,lat,lon,status:'APPEL ENTRANT',startedAt:seed});
    setCallAccepted(false);setQuestionIndex(0);setSelectedVehicles([]);setEngagedVehicles([]);setWorkflow('map');setActiveTab('map');
  };

  useEffect(()=>{
    if(!selectedService||activeCall||!scenarios.length) return;
    const timer=setTimeout(()=>startScenario(scenarios[Math.floor(Math.random()*scenarios.length)]),30000+Math.floor(Math.random()*30000));
    return()=>clearTimeout(timer);
  },[selectedService,activeCall,scenarios]);

  const takeCall=()=>{if(!activeCall)return;setCallAccepted(true);setActiveCall(c=>({...c,status:'TRAITEMENT'}));setWorkflow('treatment');};
  const refuseCall=()=>{setActiveCall(null);setCallAccepted(false);setWorkflow('map');};
  const toggleVehicle=(station,type,index)=>{
    const id=station.id+'-'+type+'-'+index;
    setSelectedVehicles(list=>list.some(v=>v.id===id)?list.filter(v=>v.id!==id):[...list,{id,station,type,index}]);
  };
  const engageSelected=()=>{
    if(!activeCall||!selectedVehicles.length)return;
    const now=Date.now();
    setEngagedVehicles(selectedVehicles.map(v=>({id:v.id,stationName:v.station.name,stationId:v.station.id,type:v.type,status:'EN ROUTE',originLat:Number(v.station.lat),originLon:Number(v.station.lon),targetLat:Number(activeCall.lat),targetLon:Number(activeCall.lon),startedAt:now,travelDuration:25000})));
    setActiveCall(c=>({...c,status:'MOYENS ENGAGÉS'}));
    setWorkflow('tracking');setActiveTab('map');
  };

  const totalVehicles=operationalStations.reduce((sum,s)=>sum+s.fleet.reduce((n,v)=>n+v.count,0),0);
  const playerName=player?.user_metadata?.username||player?.email?.split('@')[0]||'Opérateur';

  const operationPanel = workflow==='treatment' && activeCall ? <section className="operationWorkspace">
    <div className="workspaceHead"><div><span>TRAITEMENT DES APPELS</span><h1>Appel en cours</h1><p>{activeCall.scenario.title} • 📍 {activeCall.address}</p></div><button onClick={()=>setWorkflow('map')}>← Carte</button></div>
    <div className="treatmentGrid">
      <article className="treatmentCard callInfo"><h2>Données de l’appel</h2><p><b>Nom :</b> {activeCall.scenario.caller||'Appelant non identifié'}</p><p><b>Motif :</b> {activeCall.scenario.title}</p><p><b>Localisation :</b> {activeCall.address}</p><div className="categoryPills"><span>{activeCall.scenario.category}</span><span>{activeCall.scenario.difficulty}</span></div><h3>Observations</h3><textarea defaultValue={activeCall.scenario.description||''} placeholder="Entrez ici vos observations..." /></article>
      <div className="treatmentSide">
        <article className="treatmentCard"><h2>Questionnement</h2>{activeCall.scenario.questions?.length ? <><span className="questionCount">QUESTION {questionIndex+1}/{activeCall.scenario.questions.length}</span><h3>{activeCall.scenario.questions[questionIndex].question}</h3><p className="answer">{activeCall.scenario.questions[questionIndex].answer||'Réponse à recueillir auprès de l’appelant.'}</p><div className="questionButtons"><button disabled={questionIndex===0} onClick={()=>setQuestionIndex(i=>i-1)}>←</button><button disabled={questionIndex===activeCall.scenario.questions.length-1} onClick={()=>setQuestionIndex(i=>i+1)}>→</button></div></>:<p>Aucune question spécifique.</p>}</article>
        <article className="treatmentCard"><h2>Transfert d’appel</h2><div className="actionWrap"><button>Régulation 15-SAMU</button><button>Transfert 15-SAMU</button><button>Transfert 17-Police</button></div></article>
        <article className="treatmentCard"><h2>Avertir les services</h2><div className="actionWrap"><button>15-SAMU</button><button>17-Police / Gendarmerie</button><button>Réseau - Électricité</button><button>Réseau - Gaz</button><button className="alert">Officier CODIS</button><button className="alert">Chef de centre</button></div></article>
      </div>
    </div>
    <div className="departureBar"><div><h2>Votre départ</h2><p>Les CIS sont automatiquement classés du plus proche au plus éloigné de l’intervention.</p></div><button className="primary" onClick={()=>setWorkflow('dispatch')}>🚒 Choisir les moyens</button></div>
  </section> : workflow==='dispatch' && activeCall ? <section className="operationWorkspace">
    <div className="workspaceHead"><div><span>ENGAGEMENT OPÉRATIONNEL</span><h1>🚒 Engager les moyens</h1><p>Intervention : {activeCall.scenario.title} — {activeCall.address}</p></div><button onClick={()=>setWorkflow('treatment')}>← Traitement</button></div>
    <div className="dispatchSummary"><div><b>Indispensables :</b> {(activeCall.scenario.requiredVehicles||[]).join(' • ')||'Aucun moyen imposé'}</div><div><b>Recommandés :</b> {(activeCall.scenario.recommendedVehicles||[]).join(' • ')||'Selon appréciation'}</div></div>
    {stationsLoading?<div className="emptyState">Chargement des CIS…</div>:stationsError?<div className="emptyState">⚠️ {stationsError}</div>:<div className="dispatchTable"><div className="dispatchHead"><span>Centre</span><span>Véhicule</span><span>Rôle</span><span>Pompiers</span><span>Distance</span><span></span></div>{operationalStations.flatMap(st=>st.fleet.flatMap(v=>Array.from({length:v.count},(_,index)=>({st,v,index})))).map(({st,v,index})=>{const id=st.id+'-'+v.type+'-'+index;const selected=selectedVehicles.some(x=>x.id===id);const required=(activeCall.scenario.requiredVehicles||[]).includes(v.type);const recommended=(activeCall.scenario.recommendedVehicles||[]).includes(v.type);return <button type="button" className={'dispatchRow '+(selected?'selected ':'')+(required?'required':'')} key={id} onClick={()=>toggleVehicle(st,v.type,index)}><span><b>{st.name}</b><small>{st.address||'Centre de secours'}</small></span><span className="vehicleBadge">{v.type} {index+1}</span><span>{required?'Indispensable':recommended?'Recommandé':'Disponible'}</span><span>👨‍🚒 {Math.min(6,Math.max(2,st.personnel))}</span><span>{Number.isFinite(st.distanceToCall)?(st.distanceToCall<1?Math.round(st.distanceToCall*1000)+' m':st.distanceToCall.toFixed(1)+' km'):'—'}</span><span>{selected?'✓ Sélectionné':'Sélectionner'}</span></button>;})}</div>}
    <div className="engagementBar"><div><b>{selectedVehicles.length} véhicule(s) sélectionné(s)</b><p>{selectedVehicles.map(v=>v.type).join(' • ')||'Sélectionnez les moyens à envoyer.'}</p></div><button className="primary" disabled={!selectedVehicles.length} onClick={engageSelected}>ENGAGER LES MOYENS</button></div>
  </section> : null;

  const synoptic = activeTab==='operations' ? <section className="synoptic"><div className="synopticHead"><span>SYNOPTIQUE DES OPÉRATIONS</span><h1>Interventions en cours</h1></div>{activeCall?<article className="operationRow"><div className="operationNumber">🚨</div><div><b>{activeCall.scenario.title}</b><p>{activeCall.address}</p></div><span>{activeCall.status}</span><span>{engagedVehicles.length} moyen(x)</span><button onClick={()=>{setActiveTab('map');setWorkflow(engagedVehicles.length?'tracking':'treatment')}}>Suivre</button></article>:<div className="emptyState">Aucune intervention en cours.</div>}</section> : activeTab==='means' ? <section className="synoptic"><div className="synopticHead"><span>SYNOPTIQUE DES MOYENS</span><h1>Moyens disponibles</h1></div><div className="metricGrid"><div><b>{operationalStations.length}</b><span>CIS</span></div><div><b>{operationalStations.reduce((n,s)=>n+s.personnel,0)}</b><span>PERSONNELS</span></div><div><b>{totalVehicles}</b><span>ENGINS</span></div></div></section> : null;

  if(!player && !authMode) return <main className="landing"><header><b>🚨 CTA <em>18</em></b><div><button onClick={()=>setAuthMode('login')}>Connexion</button><button className="primary" onClick={()=>setAuthMode('signup')}>Commencer à jouer</button></div></header><section className="hero"><span>SIMULATION OPÉRATIONNELLE</span><h1>Gérez les secours.<br/><em>À l’échelle d’un territoire.</em></h1><p>Recevez les appels, traitez les informations, engagez les moyens et suivez les interventions sur la carte.</p><button className="primary big" onClick={()=>setAuthMode('signup')}>▶ COMMENCER À JOUER</button></section></main>;

  if(!player && authMode) return <main className="authPage"><section className="authCard"><button className="back" onClick={()=>setAuthMode(null)}>← Retour</button><h1>{authMode==='login'?'Connexion':'Créer un compte'}</h1><form onSubmit={handleAuth}>{authMode==='signup'&&<><label>Pseudo</label><input name="username" required /></>}<label>E-mail</label><input name="email" type="email" required/><label>Mot de passe</label><input name="password" type="password" minLength="6" required/><button className="primary" disabled={authLoading}>{authLoading?'Chargement…':authMode==='login'?'SE CONNECTER':'CRÉER MON COMPTE'}</button>{authMessage&&<p>{authMessage}</p>}</form><button className="linkButton" onClick={()=>setAuthMode(authMode==='login'?'signup':'login')}>{authMode==='login'?'Créer un compte':'Déjà inscrit ? Se connecter'}</button></section></main>;

  if(!selectedService) return <main className="pickerPage"><header className="gameHeader"><b>🚨 CTA <em>18</em></b><span>👤 {playerName}</span></header><section className="picker"><h1>Choisissez votre territoire</h1><p>Choisissez le SDIS que vous souhaitez commander.</p><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un département ou un numéro…"/><div className="departmentGrid">{departments.filter(d=>(d.code+' '+d.name).toLowerCase().includes(search.toLowerCase())).map(d=><button key={d.code} onClick={()=>openService({code:d.code,name:'SDIS '+d.code+' — '+d.name})}><b>{d.code}</b><span>{d.name}</span>→</button>)}</div></section></main>;

  return <main className="gamePage">
    <header className="gameHeader"><b>🚨 CTA <em>18</em></b><div className="availability">📞 Disponible <i></i></div><span>👤 {playerName}</span><button onClick={()=>{setSelectedService(null);setActiveCall(null)}}>Quitter</button></header>
    <div className="statusStrip"><span>{selectedService.name}</span><span>•</span><span>Intervention(s) au total : <b>{activeCall?1:0}</b></span><span>Intervention(s) en cours : <b>{engagedVehicles.length?1:0}</b></span><span>Véhicule(s) engagés : <b>{engagedVehicles.length}</b></span></div>
    <nav className="gameNav"><button className={activeTab==='map'?'active':''} onClick={()=>setActiveTab('map')}>Cartographie</button><button className={activeTab==='operations'?'active':''} onClick={()=>setActiveTab('operations')}>Synoptique des opérations {activeCall&&<i>1</i>}</button><button className={activeTab==='means'?'active':''} onClick={()=>setActiveTab('means')}>Synoptique des moyens</button><button>Options</button><button>Aide</button></nav>
    {activeTab==='map'?<><section className="mapShell"><OperationalMap stations={operationalStations} fallback={{lat:46.603354,lon:1.888334,zoom:6}} activeIntervention={activeCall} vehicles={engagedVehicles} callAccepted={callAccepted} onTakeCall={takeCall} onRefuseCall={refuseCall}/>{stationsLoading&&<div className="mapMessage">Chargement des centres…</div>}{stationsError&&<div className="mapMessage error">{stationsError}</div>}</section>
      {activeCall&&workflow==='tracking'&&<section className="trackingCard"><div><span>INTERVENTION EN COURS</span><h2>{activeCall.scenario.title}</h2><p>📍 {activeCall.address}</p></div><div>{engagedVehicles.map(v=><span key={v.id}>🚒 {v.type} — {v.status}</span>)}</div><button className="primary" onClick={()=>setActiveTab('operations')}>Voir le suivi</button></section>}
      {operationPanel}
      {!activeCall&&!operationPanel&&<div className="waiting">🟢 En attente d’un appel — les scénarios apparaissent automatiquement sur la carte.</div>}
    </>:synoptic}
  </main>;
}
