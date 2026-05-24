// 67 Bank app — auth gate + routing + topbar

const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "accent": "#0EA5E9",
  "density": "regular",
  "radius": "medium",
  "sidebar": "expanded"
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = ["#0EA5E9", "#22B8E6", "#7C3AED", "#10B981", "#F59E0B", "#E11D48"];
const RADIUS_MAP = {
  sharp: { xs: 2, sm: 4, md: 6, lg: 8, xl: 12, "2xl": 16 },
  medium: { xs: 6, sm: 8, md: 12, lg: 16, xl: 20, "2xl": 28 },
  rounded: { xs: 10, sm: 14, md: 18, lg: 22, xl: 28, "2xl": 36 },
};
const DENSITY_MAP = {
  compact: { topbar: 56, font: 13, pad: 22 },
  regular: { topbar: 68, font: 14, pad: 28 },
  comfy: { topbar: 76, font: 15, pad: 36 },
};

// ============== Auth Screen (Login + Register) ==============
const LoginScreen = ({ onLogin }) => {
  const [mode, setMode] = useStateA("login"); // "login" | "register"
  const [username, setUsername] = useStateA("");
  const [fullName, setFullName] = useStateA("");
  const [password, setPassword] = useStateA("");
  const [confirmPassword, setConfirmPassword] = useStateA("");
  const [error, setError] = useStateA("");
  const [success, setSuccess] = useStateA("");
  const [loading, setLoading] = useStateA(false);

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
    setUsername("");
    setFullName("");
    setPassword("");
    setConfirmPassword("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (mode === "register" && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "login") {
        const res = await fetch("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: username, password }),
        });
        if (res.ok) {
          onLogin(await res.json());
        } else {
          setError("Tên đăng nhập hoặc mật khẩu không đúng.");
        }
      } else {
        const res = await fetch("/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: username, password, fullName }),
        });
        if (res.ok) {
          setSuccess("Tạo tài khoản thành công! Đang đăng nhập…");
          const loginRes = await fetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: username, password }),
          });
          if (loginRes.ok) onLogin(await loginRes.json());
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = data.message || data.error || "";
          if (msg.toLowerCase().includes("taken") || msg.toLowerCase().includes("exist")) {
            setError("Tên đăng nhập đã tồn tại.");
          } else {
            setError(msg || "Tạo tài khoản thất bại.");
          }
        }
      }
    } catch {
      setError("Không thể kết nối đến máy chủ.");
    }
    setLoading(false);
  };

  const Spinner = () => (
    <span className="spin" style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }} />
  );

  const passwordMismatch = mode === "register" && confirmPassword !== "" && confirmPassword !== password;

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "linear-gradient(135deg, var(--navy-950) 0%, var(--navy-800) 50%, var(--navy-700) 100%)",
      padding: "24px 16px",
    }}>
      <div className="fade-in" style={{
        background: "var(--surface)",
        borderRadius: 20,
        padding: "40px 36px",
        width: 420,
        boxShadow: "var(--shadow-xl)",
      }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="brand-mark" style={{ margin: "0 auto 14px", width: 52, height: 52, fontSize: 22, borderRadius: 14, fontWeight: 800 }}>67</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>67<em style={{ fontStyle: "italic", color: "var(--accent)" }}>Bank</em></div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>Digital Banking · Est. 2067</div>
        </div>

        {/* Mode tabs */}
        <div className="toggle-group" style={{ width: "100%", marginBottom: 22 }}>
          <button className={mode === "login" ? "active" : ""} style={{ flex: 1, padding: "9px 12px" }} onClick={() => switchMode("login")}>
            Đăng nhập
          </button>
          <button className={mode === "register" ? "active" : ""} style={{ flex: 1, padding: "9px 12px" }} onClick={() => switchMode("register")}>
            Tạo tài khoản
          </button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Full name — register only */}
          {mode === "register" && (
            <div className="field">
              <label className="field-label">Họ và tên</label>
              <input
                className="field-input"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="field">
            <label className="field-label">Tên đăng nhập</label>
            <input
              className="field-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.trim())}
              placeholder="username"
              required
              autoComplete="off"
            />
          </div>

          <div className="field">
            <label className="field-label">Mật khẩu</label>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="off"
            />
          </div>

          {/* Confirm password — register only */}
          {mode === "register" && (
            <div className="field">
              <label className="field-label">Xác nhận mật khẩu</label>
              <input
                className="field-input"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                style={{ borderColor: passwordMismatch ? "var(--red-500)" : undefined }}
              />
              {passwordMismatch && (
                <div className="field-error" style={{ marginTop: 4 }}>
                  <Icon name="alert" size={12} /> Mật khẩu không khớp
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--red-100)", borderRadius: 8, color: "var(--red-600)", fontSize: 13 }}>
              <Icon name="alert" size={14} /> {error}
            </div>
          )}
          {success && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--green-100)", borderRadius: 8, color: "var(--green-600)", fontSize: 13 }}>
              <Icon name="check" size={14} /> {success}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ justifyContent: "center", height: 48, fontSize: 15, marginTop: 4 }}
            disabled={loading || passwordMismatch}>
            {loading ? <><Spinner /> Đang xử lý…</> : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
          </button>
        </form>

      </div>
    </div>
  );
};

// ============== Main App ==============
const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [lang, setLang] = useStateA("vi");
  const [page, setPage] = useStateA("dashboard");
  const [qrOpen, setQrOpen] = useStateA(false);
  const [user, setUser] = useStateA(null);      // null = not checked yet
  const [authChecked, setAuthChecked] = useStateA(false);
  const [dataLoaded, setDataLoaded] = useStateA(false);

  const t = I18N[lang];

  // Check auth on mount
  useEffectA(() => {
    fetch("/auth/me")
      .then(async r => {
        if (r.ok) {
          setUser(await r.json());
        } else {
          setUser(null);
        }
        setAuthChecked(true);
      })
      .catch(() => { setUser(null); setAuthChecked(true); });
  }, []);

  // Load real data after auth confirmed
  useEffectA(() => {
    if (!user) return;
    loadData().then(result => {
      if (result.ok) {
        patchI18nForAccounts();
        setDataLoaded(true);
      }
    });
  }, [user]);

  // Apply tweaks via CSS variables
  useEffectA(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", tweaks.dark ? "dark" : "light");
    const accent = tweaks.accent;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-soft", accent + "1F");
    if (tweaks.dark) {
      root.style.setProperty("--primary", accent);
      root.style.setProperty("--primary-hover", accent + "CC");
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-hover");
    }
    const rs = RADIUS_MAP[tweaks.radius] || RADIUS_MAP.medium;
    Object.entries(rs).forEach(([k, v]) => root.style.setProperty(`--r-${k}`, v + "px"));
    const dm = DENSITY_MAP[tweaks.density] || DENSITY_MAP.regular;
    root.style.setProperty("--topbar-h", dm.topbar + "px");
    document.body.style.fontSize = dm.font + "px";
  }, [tweaks]);

  // Ctrl+K search
  useEffectA(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await fetch("/auth/logout", { method: "POST" });
    setUser(null);
    setDataLoaded(false);
    ACCOUNTS.length = 0;
    TRANSACTIONS.length = 0;
  };

  // Loading state
  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "var(--text-muted)" }}>
          <div className="brand-mark" style={{ width: 48, height: 48, fontSize: 18, fontWeight: 800 }}>67</div>
          <div className="pulse" style={{ fontSize: 14 }}>Đang tải…</div>
        </div>
      </div>
    );
  }

  // Not authenticated → show login
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  // Derive display name from user object
  const displayName = user.fullName
    ? user.fullName.split(" ").pop()
    : (user.email ? user.email.split("@")[0] : "Bạn");

  const initials = user.fullName
    ? user.fullName.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const renderPage = () => {
    if (!dataLoaded) {
      return (
        <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--text-muted)" }}>
          <div style={{ textAlign: "center" }}>
            <div className="pulse" style={{ fontSize: 14 }}>Đang tải dữ liệu tài khoản…</div>
          </div>
        </div>
      );
    }
    switch (page) {
      case "dashboard": return <Dashboard t={t} lang={lang} onNavigate={setPage} onOpenQR={() => setQrOpen(true)} displayName={displayName} onDataRefresh={() => { loadData().then(() => { patchI18nForAccounts(); setDataLoaded(v => !v); setDataLoaded(true); }); }} />;
      case "transfer": return <Transfer t={t} lang={lang} onOpenQR={() => setQrOpen(true)} onDataRefresh={() => { loadData().then(() => { patchI18nForAccounts(); setDataLoaded(v => !v); setDataLoaded(true); }); }} />;
      case "transactions": return <Transactions t={t} lang={lang} />;
      case "accounts": return <Placeholder t={t} title={t.accounts} sub="Quản lý tất cả tài khoản 67 Bank của bạn." icon="wallet" label="Accounts" />;
      case "cards": return <Placeholder t={t} title={t.cards} sub="Thẻ vật lý và thẻ ảo." icon="card" label="Cards" />;
      case "savings": return <Placeholder t={t} title={t.savings} sub="Tiền gửi có kỳ hạn, tiết kiệm mục tiêu." icon="piggy" label="Savings" />;
      case "payments": return <Placeholder t={t} title={t.payments} sub="Thanh toán hóa đơn, quét QR." icon="qr" label="Payments" />;
      case "sessions": return <Sessions t={t} />;
      case "settings": return <Placeholder t={t} title={t.settings} sub="Hồ sơ, bảo mật và thông báo." icon="gear" label="Settings" />;
      case "help": return <Placeholder t={t} title={t.help} sub="Hỗ trợ 24/7 và câu hỏi thường gặp." icon="help" label="Help" />;
      default: return null;
    }
  };

  return (
    <div className={`app ${tweaks.sidebar === "compact" ? "sidebar-compact" : ""}`}>
      <Sidebar t={t} currentPage={page} onNavigate={setPage} compact={tweaks.sidebar === "compact"} initials={initials} displayName={displayName} onLogout={handleLogout} />

      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <button className="icon-btn" onClick={() => setTweak("sidebar", tweaks.sidebar === "compact" ? "expanded" : "compact")} title="Toggle sidebar">
            <Icon name="list" size={18} />
          </button>

          <div className="topbar-search">
            <Icon name="search" size={16} />
            <input id="global-search" placeholder={t.search_placeholder} />
            <kbd>⌘K</kbd>
          </div>

          <div style={{ flex: 1 }} />

          <div className="toggle-group">
            <button className={lang === "vi" ? "active" : ""} onClick={() => setLang("vi")}>VI</button>
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          </div>

          <button className="icon-btn" onClick={() => setTweak("dark", !tweaks.dark)} title="Toggle theme">
            <Icon name={tweaks.dark ? "sun" : "moon"} size={18} />
          </button>

          <button className="icon-btn" title="Notifications">
            <Icon name="bell" size={18} />
            <div className="dot" />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 4px 4px", border: "1px solid var(--border)", borderRadius: 999, marginLeft: 4, cursor: "pointer" }}
            onClick={handleLogout} title="Đăng xuất">
            <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{initials}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{displayName}</div>
            <Icon name="chevronDown" size={13} style={{ color: "var(--text-subtle)" }} />
          </div>
        </header>

        {renderPage()}
      </div>

      {qrOpen && <QRModal t={t} onClose={() => setQrOpen(false)} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance" />
        <TweakToggle label="Dark mode" value={tweaks.dark} onChange={v => setTweak("dark", v)} />
        <TweakColor label="Accent" value={tweaks.accent} options={ACCENT_OPTIONS} onChange={v => setTweak("accent", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Sidebar" value={tweaks.sidebar} options={["expanded", "compact"]} onChange={v => setTweak("sidebar", v)} />
        <TweakRadio label="Density" value={tweaks.density} options={["compact", "regular", "comfy"]} onChange={v => setTweak("density", v)} />
        <TweakRadio label="Corners" value={tweaks.radius} options={["sharp", "medium", "rounded"]} onChange={v => setTweak("radius", v)} />
        <TweakSection label="Language" />
        <TweakRadio label="Locale" value={lang} options={["vi", "en"]} onChange={setLang} />
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
