export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section style={{ width: 'min(900px, 100%)', padding: 48, border: '1px solid #242a34', borderRadius: 24, background: '#0d1118', boxShadow: '0 20px 60px rgba(0,0,0,.35)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 999, background: '#151b24', color: '#ff4d4d', fontWeight: 700, letterSpacing: '.08em', fontSize: 13 }}>
          🚒 CTA 18
        </div>
        <h1 style={{ fontSize: 'clamp(44px, 8vw, 84px)', lineHeight: .95, margin: '22px 0 16px', maxWidth: 760 }}>
          Prenez le commandement des interventions.
        </h1>
        <p style={{ color: '#a8b1bf', fontSize: 19, lineHeight: 1.6, maxWidth: 720, marginBottom: 30 }}>
          Un jeu de simulation et de gestion des secours. Recevez les alertes, engagez vos moyens et développez votre centre opérationnel.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button style={{ border: 0, borderRadius: 14, padding: '14px 22px', background: '#e53935', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
            Entrer au CTA
          </button>
          <button style={{ border: '1px solid #303846', borderRadius: 14, padding: '14px 22px', background: 'transparent', color: '#f4f7fb', fontWeight: 700, cursor: 'pointer' }}>
            Découvrir le jeu
          </button>
        </div>
      </section>
    </main>
  );
}
