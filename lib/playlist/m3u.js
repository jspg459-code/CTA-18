export function parseM3U(input) {
  const lines = String(input || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const items = [];
  let metadata = {};

  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      const attrs = Object.fromEntries([...line.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
      const title = line.includes(',') ? line.slice(line.indexOf(',') + 1).trim() : 'Sans titre';
      metadata = { ...attrs, title };
      continue;
    }
    if (line.startsWith('#')) continue;
    if (/^https?:\/\//i.test(line)) {
      const group = metadata['group-title'] || metadata.group || 'Autres';
      const category = group.toLowerCase();
      const media_type = /\b(series|serie|série)\b/i.test(category) ? 'series' : /\b(movie|film)\b/i.test(category) ? 'movie' : 'live';
      items.push({ media_type, category: group, title: metadata.title || line, stream_url: line, logo_url: metadata['tvg-logo'] || null, external_id: metadata['tvg-id'] || line });
      metadata = {};
    }
  }
  return items;
}
