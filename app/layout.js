import './globals.css';

export const metadata = {
  title: 'StreamTV — Votre télévision, partout',
  description: 'Lecteur IPTV personnel pour vos playlists autorisées.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
