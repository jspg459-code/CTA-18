import './globals.css';

export const metadata = {
  title: 'CTA 18',
  description: 'Jeu de simulation et de gestion des interventions de secours.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
