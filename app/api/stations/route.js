import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter',
];

// Cache mémoire longue durée + cache CDN : une même recherche ne doit jamais relancer Overpass inutilement.
const CACHE_TTL = 1000 * 60 * 60 * 24;
const CDN_CACHE = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';
const stationCache = new Map();
const pendingQueries = new Map();

function buildQuery(code) {
  if (code === 'BSPP') {
    return '[out:json][timeout:60];nwr["amenity"="fire_station"](48.30,1.85,49.10,3.05);out center tags;';
  }

  if (code === 'BMPM') {
    return '[out:json][timeout:60];nwr["amenity"="fire_station"](43.05,5.15,43.55,5.75);out center tags;';
  }

  // Certains départements ne disposent pas toujours de l'area pré-calculée sur tous les miroirs Overpass.
  // On récupère donc à la fois l'area et la relation administrative puis on la convertit avec map_to_area.
  // Cela évite le résultat vide qui bloquait totalement l'engagement des moyens.
  return '[out:json][timeout:90];(area["boundary"="administrative"]["admin_level"="6"]["ref:INSEE"="' + code + '"];rel["boundary"="administrative"]["admin_level"="6"]["ref:INSEE"="' + code + '"];)->.department;.department map_to_area->.searchArea;nwr["amenity"="fire_station"](area.searchArea);out center tags;';
}

async function queryOverpass(query) {
  const controller = new AbortController();
  // On privilégie une réponse rapide : les 3 miroirs sont interrogés en parallèle.
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const attempts = OVERPASS_ENDPOINTS.map(async (endpoint) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          'User-Agent': 'CTA-18/1.0',
        },
        body: query,
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Service cartographique indisponible (' + response.status + ')');
      return response.json();
    });

    const data = await Promise.any(attempts);
    controller.abort();
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function isGenericStationName(name) {
  const normalized = cleanText(name).toLowerCase();
  return !normalized ||
    /^(caserne|caserne de pompiers|pompiers|fire station|centre de secours|centre d'incendie et de secours|cis)$/i.test(normalized) ||
    /^(centre de secours|caserne de pompiers)\s*[-–—]?$/i.test(normalized);
}

function normalizeStations(elements) {
  const seen = new Set();

  return (elements || [])
    .map((element) => {
      const tags = element.tags || {};
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;

      const locality = cleanText(
        tags['addr:city'] ||
        tags['addr:place'] ||
        tags['is_in:city'] ||
        tags['is_in'] ||
        tags['addr:suburb'] ||
        tags['addr:district'] ||
        tags.municipality ||
        tags.commune
      );

      const streetAddress = [
        tags['addr:housenumber'],
        tags['addr:street'],
      ].filter(Boolean).join(' ');

      const addressParts = [
        tags['addr:full'],
        streetAddress,
        [tags['addr:postcode'], locality].filter(Boolean).join(' '),
      ].filter(Boolean);

      const address = addressParts.length
        ? [...new Set(addressParts)].join(', ')
        : '';

      const rawName = cleanText(
        tags.name ||
        tags.short_name ||
        tags.ref ||
        tags['ref:FR:SDIS']
      );

      let name = rawName;
      if (isGenericStationName(rawName)) {
        if (locality) name = 'Centre de secours — ' + locality;
        else if (streetAddress) name = 'Centre de secours — ' + streetAddress;
        else if (tags['addr:postcode']) name = 'Centre de secours — ' + tags['addr:postcode'];
        else name = 'Centre de secours (commune à préciser)';
      }

      return {
        id: element.type + '-' + element.id,
        lat,
        lon,
        name,
        rawName,
        locality,
        address,
        ref: tags.ref || tags['ref:FR:SDIS'] || '',
        type: tags['fire_station:type:FR'] || 'CIS',
      };
    })
    .filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lon))
    .filter((station) => {
      const key = station.lat.toFixed(5) + ',' + station.lon.toFixed(5);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get('code') || '').trim();

  if (!code) {
    return NextResponse.json({ error: 'Code de territoire manquant.' }, { status: 400 });
  }

  const now = Date.now();
  const cached = stationCache.get(code);
  if (cached && now - cached.createdAt < CACHE_TTL) {
    return NextResponse.json(
      { stations: cached.stations, source: 'OpenStreetMap / Overpass', cached: true },
      { headers: { 'Cache-Control': CDN_CACHE } }
    );
  }

  if (!pendingQueries.has(code)) {
    const pending = (async () => {
      const data = await queryOverpass(buildQuery(code));
      const stations = normalizeStations(data.elements);
      stationCache.set(code, { stations, createdAt: Date.now() });
      return stations;
    })().finally(() => pendingQueries.delete(code));

    pendingQueries.set(code, pending);
  }

  try {
    const stations = await pendingQueries.get(code);
    return NextResponse.json(
      { stations, source: 'OpenStreetMap / Overpass', cached: false },
      { headers: { 'Cache-Control': CDN_CACHE } }
    );
  } catch {
    return NextResponse.json(
      { error: 'Impossible de charger les centres pour le moment. Réessayez dans quelques instants.' },
      { status: 503 }
    );
  }
}
