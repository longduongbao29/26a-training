// Placeholder screens for not-yet-built pages

const Placeholder = ({ t, title, sub, icon, label }) => (
  <div className="page fade-in" data-screen-label={label}>
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-sub">{sub}</p>
      </div>
    </div>
    <div className="card" style={{ padding: "80px 40px", textAlign: "center" }}>
      <div style={{
        width: 88, height: 88,
        margin: "0 auto 20px",
        borderRadius: 22,
        background: "linear-gradient(135deg, var(--surface-inset), var(--surface-2))",
        display: "grid", placeItems: "center",
        color: "var(--navy-400)",
        border: "1px solid var(--border)",
      }}>
        <Icon name={icon} size={42} stroke={1.5}/>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "0 0 8px", fontWeight: 400 }}>
        Coming soon
      </h2>
      <p style={{ color: "var(--text-muted)", margin: "0 auto", maxWidth: 380, fontSize: 14 }}>
        This section is part of the full 67 Bank experience. The prototype focuses on Overview, Transfer, and Transaction history.
      </p>
    </div>
  </div>
);

window.Placeholder = Placeholder;
