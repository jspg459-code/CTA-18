import { NextResponse } from 'next/server';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter',
];

function buildQuery(code) {
  if (code === 'BSPP') {
    return '[out:json][timeout:60];nwr["amenity"="fire_station"](48.30,1.85,49.10,3.05);out center tags;';
  }

  if (code === 'BMPM') {
    return '[out:json][timeout:60];nwr["amenity"="fire_station"](43.05,5.15,43.55,5.75);out center tags;';
  }

  return '[out:json][timeout:90];area["boundary"="administrative"]["admin_level"="6"]["ref:INSEE"="' + code + '"]->.searchArea;nwr["amenity"="fire_station"](area.searchArea);out center tags;';
}

async function queryOverpass(query) {
  let lastError;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          'User-Agent': 'CTA-18/1.0',
        },
        body: query,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Service cartographique indisponible (' + response.status + ')');
      }

      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Impossible de contacter les services cartographiques.');
}

function normalizeStations(elements) {
  const seen = new Set();

  return (elements || [])
    .map((element) => {
      const tags = element.tags || {};
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;

      const address =
        tags['addr:full'] ||
        [
          tags['addr:housenumber'],
          tags['addr:street'],
          tags['addr:postcode'],
          tags['addr:city'],
        ]
          .filter(Boolean)
          .join(', ');

      return {
        id: element.type + '-' + element.id,
        lat,
        lon,
        name:
          tags.name ||
          tags.short_name ||
          tags.ref ||
          tags['ref:FR:SDIS'] ||
          'Centre d’incendie et de secours',
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

  try {
    const data = await queryOverpass(buildQuery(code));
    return NextResponse.json(
      {
        stations: normalizeStations(data.elements),
        source: 'OpenStreetMap / Overpass',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          'Impossible de charger les centres pour le moment. Réessayez dans quelques instants.',
      },
      { status: 503 }
    );
  }
}
