// Sidebar component

const Sidebar = ({ t, currentPage, onNavigate, compact, initials, displayName, onLogout }) => {
  const items = [
    { id: "dashboard",    icon: "grid",   labelKey: "dashboard"   },
    { id: "accounts",     icon: "wallet", labelKey: "accounts"    },
    { id: "transfer",     icon: "send",   labelKey: "transfer"    },
    { id: "transactions", icon: "list",   labelKey: "transactions" },
    { id: "cards",        icon: "card",   labelKey: "cards"       },
    { id: "savings",      icon: "piggy",  labelKey: "savings"     },
    { id: "payments",     icon: "qr",     labelKey: "payments"    },
  ];
  const more = [
    { id: "sessions", icon: "laptop", labelKey: "sessions" },
    { id: "settings", icon: "gear",   labelKey: "settings" },
    { id: "help",     icon: "help",   labelKey: "help"     },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" style={{ fontSize: 16, fontWeight: 800 }}>67</div>
        <div>
          <div className="brand-name">67<em>Bank</em></div>
          <div className="brand-sub">Digital Banking · Est. 2067</div>
        </div>
      </div>

      <div className="nav-section-label">{t.nav_section_main}</div>
      {items.map(it => (
        <div key={it.id}
          className={`nav-item ${currentPage === it.id ? "active" : ""}`}
          onClick={() => onNavigate(it.id)}
          title={compact ? t[it.labelKey] : undefined}>
          <Icon name={it.icon} className="icon"/>
          <span>{t[it.labelKey]}</span>
        </div>
      ))}

      <div className="nav-section-label">{t.nav_section_more}</div>
      {more.map(it => (
        <div key={it.id}
          className={`nav-item ${currentPage === it.id ? "active" : ""}`}
          onClick={() => onNavigate(it.id)}
          title={compact ? t[it.labelKey] : undefined}>
          <Icon name={it.icon} className="icon"/>
          <span>{t[it.labelKey]}</span>
        </div>
      ))}

      <div className="sidebar-footer" style={{ cursor: "pointer" }} onClick={onLogout} title="Đăng xuất">
        <div className="avatar">{initials || "?"}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="user-name">{displayName || "Bạn"}</div>
          <div className="user-tier">★ {t.tier}</div>
        </div>
        <Icon name="logout" size={16} style={{ color: "var(--text-subtle)", flexShrink: 0 }}/>
      </div>
    </aside>
  );
};

window.Sidebar = Sidebar;
