export default function Page() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ color: '#18181b', margin: 0 }}>SitePulse</h1>
        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.5rem', fontWeight: 'bold' }}>
          Monitoring Active
        </div>
      </header>
      
      <section style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' 
      }}>
        <h2>Welcome to SitePulse</h2>
        <p style={{ color: '#52525b' }}>
          This is the dashboard where you will see your website uptime, response times, and incidents.
        </p>
      </section>
    </main>
  );
}
