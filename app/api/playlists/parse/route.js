import { NextResponse } from 'next/server';
import { parseM3U } from '../../../../lib/playlist/m3u';

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body?.content) return NextResponse.json({ error: 'Playlist vide.' }, { status: 400 });
    const items = parseM3U(body.content);
    return NextResponse.json({ count: items.length, items });
  } catch {
    return NextResponse.json({ error: 'Impossible de lire cette playlist.' }, { status: 400 });
  }
}
