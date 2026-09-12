import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const endpoints = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

function numberParam(searchParams, key) {
  const value = Number(searchParams.get(key));
  return Number.isFinite(value) ? value : null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const south = numberParam(searchParams,'south');
  const west = numberParam(searchParams,'west');
  const north = numberParam(searchParams,'north');
  const east = numberParam(searchParams,'east');

  if ([south,west,north,east].some(v => v === null)) {
    return NextResponse.json({ hospitals: [], error: 'invalid bounds' }, { status: 400 });
  }

  const query = '[out:json][timeout:20];(nwr["amenity"="hospital"](' + south + ',' + west + ',' + north + ',' + east + ');nwr["healthcare"="hospital"](' + south + ',' + west + ',' + north + ',' + east + '););out center tags;';

  let lastError = null;
  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'CTA-18 operational simulator' },
        body: query,
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Overpass ' + response.status);
      const data = await response.json();
      const unique = new Map();

      for (const item of data.elements || []) {
        const lat = item.lat ?? item.center?.lat;
        const lon = item.lon ?? item.center?.lon;
        if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) continue;
        const tags = item.tags || {};
        const name = tags.name || tags['name:fr'] || tags.operator || 'Hôpital';
        const address = [
          tags['addr:housenumber'],
          tags['addr:street'],
          tags['addr:postcode'],
          tags['addr:city'],
        ].filter(Boolean).join(' ') || tags['addr:full'] || '';

        unique.set(item.type + '-' + item.id, {
          id: item.type + '-' + item.id,
          lat: Number(lat),
          lon: Number(lon),
          name,
          address,
        });
      }

      const hospitals = [...unique.values()];
      return NextResponse.json(
        { hospitals },
        { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
      );
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }


  // Source rapide de secours : Photon/OpenStreetMap, utile lorsque Overpass est saturé.
  try {
    const bbox = [west, south, east, north].join(',');
    const queries = ['hospital', 'hôpital'];
    const unique = new Map();
    for (const q of queries) {
      const url = 'https://photon.komoot.io/api/?q=' + encodeURIComponent(q) + '&bbox=' + encodeURIComponent(bbox) + '&limit=100&lang=fr';
      const response = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
      if (!response.ok) continue;
      const data = await response.json();
      for (const feature of data.features || []) {
        const coords = feature.geometry?.coordinates || [];
        const lon = Number(coords[0]);
        const lat = Number(coords[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
        const p = feature.properties || {};
        const name = p.name || p.locality || p.city || 'Hôpital';
        const address = [p.street, p.housenumber, p.postcode, p.city].filter(Boolean).join(' ');
        const id = p.osm_type && p.osm_id ? p.osm_type + '-' + p.osm_id : name + '-' + lat + '-' + lon;
        unique.set(id, { id, lat, lon, name, address });
      }
    }
    if (unique.size) {
      return NextResponse.json(
        { hospitals: [...unique.values()], source: 'photon' },
        { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
      );
    }
  } catch {}

  return NextResponse.json(
    { hospitals: [], error: lastError?.message || 'hospital source unavailable' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
