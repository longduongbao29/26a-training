// Sessions — login history page

const { useState: useSt, useEffect: useEff } = React;

const Sessions = ({ t }) => {
  const [sessions, setSessions] = useSt(null);
  const [error, setError] = useSt("");

  useEff(() => {
    fetch("/auth/sessions")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setSessions)
      .catch(() => setError("Không thể tải danh sách phiên đăng nhập."));
  }, []);

  const parseDevice = (ua) => {
    if (!ua) return { device: "Thiết bị không rõ", browser: "" };
    let device = "Máy tính";
    if (/iPhone|iPad|iPod/i.test(ua)) device = "iPhone / iPad";
    else if (/Android/i.test(ua)) device = "Android";
    let browser = "";
    if (/Edg\//i.test(ua)) browser = "Edge";
    else if (/Chrome/i.test(ua)) browser = "Chrome";
    else if (/Firefox/i.test(ua)) browser = "Firefox";
    else if (/Safari/i.test(ua)) browser = "Safari";
    return { device, browser };
  };

  const fmtTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="page fade-in" style={{ padding: "32px 28px", maxWidth: 780 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, margin: 0 }}>
          Phiên đăng nhập
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
          Lịch sử các lần đăng nhập vào tài khoản của bạn.
        </p>
      </div>

      {error && (
        <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "var(--red-100)", color: "var(--red-600)", borderRadius: 10, fontSize: 13 }}>
          <Icon name="alert" size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
        </div>
      )}

      {sessions === null && !error && (
        <div style={{ display: "flex", gap: 12, alignItems: "center", color: "var(--text-muted)", fontSize: 13 }}>
          <div className="spin" style={{ width: 16, height: 16, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%" }} />
          Đang tải…
        </div>
      )}

      {sessions && sessions.length === 0 && (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Chưa có phiên đăng nhập nào được ghi lại.</div>
      )}

      {sessions && sessions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sessions.map(s => {
            const { device, browser } = parseDevice(s.userAgent);
            const label = [device, browser].filter(Boolean).join(" · ");
            return (
              <div key={s.id} style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                background: "var(--surface)",
                borderRadius: "var(--r-lg)",
                border: s.current ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}>
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: "var(--r-md)",
                  background: s.current ? "var(--accent-soft)" : "var(--surface-inset)",
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>
                  <Icon name={/Android|iPhone|iPad/i.test(s.userAgent || "") ? "phone" : "laptop"} size={18}
                    style={{ color: s.current ? "var(--accent)" : "var(--text-subtle)" }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{label || "Thiết bị không rõ"}</span>
                    {s.current && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--accent-soft)", color: "var(--accent)" }}>
                        Phiên hiện tại
                      </span>
                    )}
                    {!s.active && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--surface-inset)", color: "var(--text-muted)" }}>
                        Đã đăng xuất
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <span>
                      <Icon name="clock" size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
                      Đăng nhập: {fmtTime(s.loggedInAt)}
                    </span>
                    {s.loggedOutAt && (
                      <span>
                        <Icon name="logout" size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        Đăng xuất: {fmtTime(s.loggedOutAt)}
                      </span>
                    )}
                    {s.ipAddress && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                        IP: {s.ipAddress}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

window.Sessions = Sessions;
