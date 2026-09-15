# StreamTV Design Specification

## Goal
Transform the former CTA-18 project into StreamTV, a responsive IPTV player web app for users' own authorized playlists.

## Product
StreamTV is free in V1. Users create a free account, add multiple M3U/M3U8 or Xtream Codes playlists, and browse compatible live TV, movies, and series. The app stores playlist metadata, favorites, history, and preferences in Supabase; it does not host or redistribute TV content.

## UX
Dark premium interface inspired by the approved mockup: near-black background, blue/purple accents, rounded cards, large media artwork, responsive layouts, clear loading/error states, and mobile-first navigation.

## V1 Screens
- Authentication: sign up, sign in, sign out.
- Home: continue watching, favorites, recently added, shortcuts.
- Live TV: categories, channel cards, search, player.
- Movies: categories, artwork cards, details, player.
- Series: categories, seasons/episodes when playlist data supports them, player.
- Favorites: saved channels, movies, and series.
- Playlists: multiple playlist management, add/import, enable/disable, refresh, delete.
- Settings: account, preferences, playlist management.
- Player: HTML5 video controls, fullscreen, loading and error states.

## Data Model
Supabase Auth owns users. Application tables are scoped by authenticated user with RLS:
- playlists: id, user_id, name, source_type, source_url or encrypted/provider credential reference where appropriate, enabled, last_synced_at, created_at, updated_at.
- media_items: normalized playlist items associated with a playlist, including type, category, title, stream_url, logo/artwork, metadata, and external identifiers.
- favorites: user_id, media_item_id, created_at.
- watch_history: user_id, media_item_id, position_seconds, watched_at.
- user_preferences: user_id, preference JSON, updated_at.

Sensitive credentials must not be exposed in public client code. Xtream credentials should be handled server-side and never logged.

## Playlist Flow
1. User selects M3U URL/file or Xtream Codes.
2. Server validates and parses the source.
3. Items are normalized into TV, movie, and series records where the source provides enough metadata.
4. User sees import progress/errors.
5. Successful items become browsable and searchable.
6. Refresh repeats synchronization without duplicating records.

The first implementation should support remote M3U/M3U8 URLs and Xtream credentials; local file import can be added once the remote flow is stable.

## Architecture
Next.js App Router provides UI and server routes. Supabase provides Auth/Postgres/RLS. Vercel hosts the application. GitHub remains the source repository. The browser HTML5 video element is the initial player; browser codec/CORS limitations are surfaced as actionable errors rather than hidden.

## Security and Legal Boundaries
StreamTV only plays user-supplied or otherwise authorized streams. No pirate playlist, bundled channel list, copyrighted media catalog, or bypass of provider access controls is included. Server routes validate ownership and avoid exposing service-role credentials.

## Success Criteria
- New user can register and sign in.
- Authenticated user can add multiple playlists.
- Playlist content is normalized into TV/movies/series where supported.
- User can search, favorite, and play compatible streams.
- Favorites/history persist per user.
- Layout works on phone and desktop.
- Existing CTA-18 UI/API code is removed from the active application.
- Vercel production build succeeds.
