export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d1117',
      color: '#c9d1d9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        padding: '36px',
        textAlign: 'center',
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
        <h1 style={{ color: '#58a6ff', fontSize: '24px', margin: '0 0 12px 0' }}>
          LLM Code OAuth Relay
        </h1>
        <p style={{ color: '#8b949e', fontSize: '15px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
          This serverless relay handles 1-click Google OAuth authentication for the <code>shiva-llmcode</code> terminal AI agent.
        </p>
        <div style={{
          background: '#0d1117',
          border: '1px solid #21262d',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'left',
          fontSize: '13px',
          color: '#79c0ff',
          fontFamily: 'monospace',
          marginBottom: '20px',
        }}>
          <div>$ npx shiva-llmcode</div>
          <div style={{ color: '#8b949e' }}>&gt; /connector</div>
          <div style={{ color: '#3fb950' }}>✓ 1-Click Sign in with Google</div>
        </div>
        <p style={{ fontSize: '12px', color: '#8b949e', margin: 0 }}>
          Stateless &amp; Secure &bull; No tokens stored on server &bull; Client direct handoff
        </p>
      </div>
    </main>
  );
}
