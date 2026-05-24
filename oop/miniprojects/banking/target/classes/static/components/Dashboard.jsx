// Dashboard screen

const { useState, useEffect, useMemo } = React;

// === Account card ===
const AccountCard = ({ acc, t, hidden, primary }) => {
  const [copied, setCopied] = useState(false);
  const balanceStr = hidden
    ? "•••••• " + (acc.currency === "USD" ? "USD" : "đ")
    : fmtAmount(acc.balance, acc.currency) + (acc.currency === "USD" ? "" : " ₫");

  const copyNumber = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(acc.number.replace(/\s/g, "-")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div style={{
      borderRadius: 18,
      padding: "20px 22px",
      background: acc.color,
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      minHeight: 168,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxShadow: primary ? "0 20px 50px rgba(10,37,64,0.25), inset 0 1px 0 rgba(255,255,255,0.1)" : "0 12px 30px rgba(10,37,64,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
      isolation: "isolate",
    }}>
      <svg style={{ position: "absolute", right: -40, top: -40, opacity: 0.18, zIndex: 0 }} width="220" height="220" viewBox="0 0 220 220" fill="none">
        <circle cx="170" cy="50" r="100" stroke="#fff" strokeWidth="0.5"/>
        <circle cx="170" cy="50" r="70" stroke="#fff" strokeWidth="0.5"/>
        <circle cx="170" cy="50" r="40" stroke="#fff" strokeWidth="0.5"/>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: "0.06em", textTransform: "uppercase" }}>{t[acc.nameKey] || acc._nameValue}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, opacity: 0.75, letterSpacing: "0.06em" }}>{acc.number}</span>
            <button onClick={copyNumber} style={{ background: "none", border: "none", padding: "2px 4px", cursor: "pointer", color: "#fff", opacity: copied ? 1 : 0.6, borderRadius: 4, lineHeight: 1, transition: "opacity .15s" }} title="Copy số tài khoản">
              <Icon name={copied ? "check" : "copy"} size={13} stroke={2}/>
            </button>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontStyle: "italic", opacity: 0.8 }}>
          {acc.currency}
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="num" style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>
          {balanceStr}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <div style={{ fontSize: 11.5, opacity: 0.7 }}>{t.available}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, opacity: 0.85, fontFamily: "var(--font-display)", fontStyle: "italic" }}>
            67Bank
            <div style={{ width: 24, height: 16, borderRadius: 3, background: "linear-gradient(135deg, #FFB800, #FFCD00)", display: "grid", placeItems: "center" }}>
              <div style={{ width: 16, height: 11, border: "1px solid rgba(0,0,0,0.2)", borderRadius: 1 }}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Cashflow chart (mini bar) ===
const CashflowChart = ({ data }) => {
  const w = 540, h = 160, pad = { l: 8, r: 8, t: 12, b: 22 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;
  const maxV = Math.max(...data.flatMap(d => [d.in, d.out]), 1);
  const bw = (cw / data.length) * 0.6;
  const gap = (cw / data.length) - bw;
  const [hover, setHover] = useState(null);

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
        <line x1={pad.l} x2={w - pad.r} y1={h - pad.b} y2={h - pad.b} stroke="var(--border)" strokeWidth="1"/>
        {[0.25, 0.5, 0.75].map(p => (
          <line key={p} x1={pad.l} x2={w - pad.r} y1={pad.t + ch * p} y2={pad.t + ch * p} stroke="var(--border)" strokeDasharray="2 4"/>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * (bw + gap) + gap / 2;
          const yIn = pad.t + ch - (d.in / maxV) * ch * 0.95;
          const hIn = (d.in / maxV) * ch * 0.95;
          const yOut = pad.t + ch - (d.out / maxV) * ch * 0.95;
          const hOut = (d.out / maxV) * ch * 0.95;
          const isHover = hover === i;
          return (
            <g key={d.d} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={x - gap/2} y={pad.t} width={bw + gap} height={ch} fill="transparent" style={{ cursor: "pointer" }}/>
              {d.out > 0 && (
                <rect x={x} y={yOut} width={bw} height={hOut} rx="2.5"
                  fill="var(--red-500)" opacity={isHover ? 1 : 0.35}/>
              )}
              {d.in > 0 && (
                <rect x={x + bw * 0.15} y={yIn} width={bw * 0.7} height={hIn} rx="2.5"
                  fill="var(--green-500)" opacity={isHover ? 1 : 0.85}/>
              )}
              <text x={x + bw / 2} y={h - 6} textAnchor="middle" fontSize="10" fill="var(--text-subtle)" fontFamily="var(--font-mono)">{d.d}</text>
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div style={{
          position: "absolute",
          left: `${(pad.l + hover * (bw + gap) + gap/2 + bw/2) / w * 100}%`,
          top: -6,
          transform: "translate(-50%, -100%)",
          background: "var(--navy-900)",
          color: "#fff",
          fontSize: 11,
          padding: "6px 10px",
          borderRadius: 8,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          boxShadow: "var(--shadow-lg)",
        }}>
          <div style={{ opacity: 0.6, fontSize: 10 }}>May {data[hover].d}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
            <span style={{ color: "#34D399" }}>+{data[hover].in.toFixed(1)}</span>
            <span style={{ color: "#F87171" }}>−{data[hover].out.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// === Spending donut ===
const SpendingDonut = ({ data, t }) => {
  const total = data.reduce((s, d) => s + d.v, 0);
  let acc = 0;
  const segs = data.map(d => {
    const start = acc / total;
    acc += d.v;
    const end = acc / total;
    return { ...d, start, end };
  });
  const r = 64, cx = 80, cy = 80, stroke = 18;
  const C = 2 * Math.PI * r;

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-inset)" strokeWidth={stroke}/>
        {segs.map((s, i) => {
          const len = (s.end - s.start) * C;
          const off = -s.start * C;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={CATEGORIES[s.cat].color}
              strokeWidth={stroke}
              strokeDasharray={`${len - 2} ${C}`}
              strokeDashoffset={off}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: "all .3s" }}
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="var(--text-subtle)" fontFamily="var(--font-sans)" letterSpacing="0.06em">TOTAL</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="18" fill="var(--text)" fontFamily="var(--font-mono)" fontWeight="600">{(total/1000).toFixed(1)}K</text>
      </svg>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px" }}>
        {segs.map(s => (
          <div key={s.cat} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: CATEGORIES[s.cat].color }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t[`cat_${s.cat}`]}</div>
              <div style={{ color: "var(--text-subtle)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{((s.v/total)*100).toFixed(0)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// === KPI tile ===
const Kpi = ({ label, value, delta, deltaPositive, hint }) => (
  <div style={{ padding: "16px 18px", borderRight: "1px solid var(--border)", flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: 11.5, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
    <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 6, letterSpacing: "-0.01em" }}>{value}</div>
    {delta && (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 12, color: deltaPositive ? "var(--green-600)" : "var(--red-600)", fontWeight: 600 }}>
        <Icon name={deltaPositive ? "arrowUp" : "arrowDown"} size={12} stroke={2.5}/>
        <span className="num">{delta}</span>
        <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>{hint}</span>
      </div>
    )}
  </div>
);

// === Quick action button ===
const QuickAction = ({ icon, label, onClick, accent }) => (
  <button onClick={onClick} style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "18px 8px",
    borderRadius: 14,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    transition: "all .15s ease",
    minWidth: 0,
  }}
  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
    <div style={{
      width: 44, height: 44,
      borderRadius: 12,
      background: accent ? "linear-gradient(135deg, var(--cyan-500), var(--cyan-700))" : "var(--surface-inset)",
      color: accent ? "#fff" : "var(--text)",
      display: "grid", placeItems: "center",
      boxShadow: accent ? "0 6px 18px rgba(14,165,233,0.35)" : "none",
    }}>
      <Icon name={icon} size={22}/>
    </div>
    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{label}</div>
  </button>
);

// === Tx row (compact) ===
const TxRow = ({ tx, t, lang }) => {
  const cat = CATEGORIES[tx.cat];
  const acc = ACCOUNTS.find(a => a.id === tx.acc);
  const currency = acc ? acc.currency : "USD";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{
        width: 38, height: 38,
        borderRadius: 10,
        background: cat.color + "20",
        color: cat.color,
        display: "grid", placeItems: "center",
        flexShrink: 0,
      }}>
        <Icon name={cat.icon} size={18}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.desc}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2 }}>
          {fmtDate(tx.date, lang)} · {tx.time} · {t[`cat_${tx.cat}`]}
        </div>
      </div>
      <div className="num" style={{ fontSize: 13.5, fontWeight: 600, color: tx.amt > 0 ? "var(--green-600)" : "var(--text)", whiteSpace: "nowrap" }}>
        {tx.amt > 0 ? "+" : ""}{fmtAmount(Math.abs(tx.amt), currency)} {currency === "VND" ? "₫" : currency}
      </div>
    </div>
  );
};

const Spinner = () => (
  <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }}/>
);

// === Deposit / Withdraw modal ===
const FundModal = ({ mode, accounts, onClose, onSuccess }) => {
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null); // { title, amount, currency } on success

  const isDeposit = mode === "deposit";
  const title = isDeposit ? "Nạp tiền" : "Rút tiền";
  const endpoint = isDeposit ? "deposit" : "withdraw";

  const submit = async (e) => {
    e.preventDefault();
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) { setError("Số tiền không hợp lệ."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/accounts/${accountId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsed, currencyCode: acc.currency }),
      });
      if (res.ok) {
        setDone({ title, amount: parsed, currency: acc.currency });
        onSuccess();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error || body.message || "Giao dịch thất bại. Vui lòng kiểm tra lại số dư.");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const overlayStyle = {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(6,24,41,0.65)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  };

  const content = done ? (
    <div style={overlayStyle} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: 20, padding: "32px 28px",
        width: 360, maxWidth: "calc(100vw - 40px)", textAlign: "center", boxShadow: "var(--shadow-xl)",
      }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "var(--green-100)", margin: "0 auto 16px", display: "grid", placeItems: "center", color: "var(--green-600)" }}>
          <Icon name="check" size={34} stroke={3}/>
        </div>
        <h3 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontSize: 24 }}>{done.title} thành công</h3>
        <p style={{ margin: "0 0 18px", color: "var(--text-muted)", fontSize: 13.5 }}>Giao dịch đã được xử lý.</p>
        <div className="num" style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: isDeposit ? "var(--green-600)" : "var(--text)" }}>
          {isDeposit ? "+" : "−"}{fmtAmount(done.amount, done.currency)} {done.currency}
        </div>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onClose}>
          Xong
        </button>
      </div>
    </div>
  ) : (
    <div style={overlayStyle} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: 20, padding: "28px 30px",
        width: 380, maxWidth: "calc(100vw - 40px)", boxShadow: "var(--shadow-xl)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "var(--font-display)" }}>{title}</h2>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={18}/></button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>Tài khoản</label>
            <select value={accountId} onChange={e => setAccountId(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface-inset)", fontSize: 13.5, color: "var(--text)" }}>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.number} — {fmtAmount(a.balance, a.currency)} {a.currency}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>Số tiền</label>
            <div style={{ position: "relative" }}>
              <input
                type="number" min="0.01" step="any" required
                value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ width: "100%", padding: "10px 48px 10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface-inset)", fontSize: 15, fontWeight: 600, color: "var(--text)", boxSizing: "border-box", fontFamily: "var(--font-mono)" }}
              />
              <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
                {accounts.find(a => a.id === accountId)?.currency || "USD"}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 12px", background: "var(--red-100)", borderRadius: 8, color: "var(--red-600)", fontSize: 13, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Icon name="alert" size={14} style={{ flexShrink: 0, marginTop: 1 }}/> {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ justifyContent: "center", height: 46, fontSize: 14, marginTop: 2 }} disabled={loading}>
            {loading ? <><Spinner/> Đang xử lý…</> : title}
          </button>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

// === Main Dashboard ===
const Dashboard = ({ t, lang, onNavigate, onOpenQR, displayName, onDataRefresh }) => {
  const [hidden, setHidden] = useState(false);
  const [period, setPeriod] = useState("14d");
  const [fundModal, setFundModal] = useState(null); // "deposit" | "withdraw" | null

  if (ACCOUNTS.length === 0) {
    return (
      <div className="page fade-in" style={{ display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div className="pulse" style={{ fontSize: 14 }}>Đang tải tài khoản…</div>
        </div>
      </div>
    );
  }

  const recent = TRANSACTIONS.slice(0, 6);
  const completedTx = TRANSACTIONS.filter(tx => tx.status === "completed");
  const monthIncome = completedTx.filter(tx => tx.amt > 0).reduce((s, tx) => s + tx.amt, 0);
  const monthSpend = completedTx.filter(tx => tx.amt < 0).reduce((s, tx) => s + Math.abs(tx.amt), 0);
  const netFlow = monthIncome - monthSpend;

  const primaryCurrency = ACCOUNTS[0].currency;
  const totalBalance = ACCOUNTS.reduce((s, a) => s + a.balance, 0);

  const gridCols = ACCOUNTS.length === 1 ? "1fr" : ACCOUNTS.length === 2 ? "1fr 1fr" : "repeat(3, 1fr)";

  return (
    <div className="page fade-in" data-screen-label="01 Dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.welcome} <em>{displayName}</em>.</h1>
          <p className="page-sub">{t.welcome_sub}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary" onClick={() => setHidden(h => !h)}>
            <Icon name={hidden ? "eyeOff" : "eye"} size={16}/>
            {hidden ? "Show balance" : "Hide balance"}
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate("transfer")}>
            <Icon name="send" size={16}/>
            {t.transfer}
          </button>
        </div>
      </div>

      {/* Account cards */}
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 16, marginBottom: 20 }}>
        {ACCOUNTS.map((acc, i) => (
          <AccountCard key={acc.id} acc={acc} t={t} hidden={hidden} primary={i === 0}/>
        ))}
      </div>

      {/* KPI strip */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex" }}>
          <Kpi label={t.total_balance} value={hidden ? "••••••" : fmtAmount(totalBalance, primaryCurrency)} delta="+2.4%" deltaPositive hint="vs last month"/>
          <Kpi label={t.income} value={hidden ? "••••••" : fmtAmount(monthIncome, primaryCurrency)} delta="+12%" deltaPositive hint={t.this_month}/>
          <Kpi label={t.spending} value={hidden ? "••••••" : fmtAmount(monthSpend, primaryCurrency)} delta="−8%" deltaPositive hint={t.this_month}/>
          <div style={{ padding: "16px 18px", flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{t.net_flow}</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 6, color: netFlow >= 0 ? "var(--green-600)" : "var(--red-600)", letterSpacing: "-0.01em" }}>
              {netFlow >= 0 ? "+" : ""}{hidden ? "••••••" : fmtAmount(Math.abs(netFlow), primaryCurrency)}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-subtle)" }}>{t.this_month}</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <QuickAction icon="send" label={t.quick_transfer} onClick={() => onNavigate("transfer")} accent/>
        <QuickAction icon="upload" label={t.top_up} onClick={() => setFundModal("deposit")}/>
        <QuickAction icon="download" label={t.withdraw} onClick={() => setFundModal("withdraw")}/>
        <QuickAction icon="qr" label={t.qr_pay} onClick={onOpenQR}/>
        <QuickAction icon="bolt" label={t.pay_bill}/>
        <QuickAction icon="piggy" label={t.savings}/>
      </div>

      {fundModal && (
        <FundModal
          mode={fundModal}
          accounts={ACCOUNTS}
          onClose={() => setFundModal(null)}
          onSuccess={() => {
            if (onDataRefresh) onDataRefresh();
          }}
        />
      )}

      {/* Charts + recent + upcoming grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Cashflow */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Cash flow</h3>
                <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 4 }}>Last 14 days</div>
              </div>
              <div className="toggle-group">
                {["7d","14d","30d","90d"].map(p => (
                  <button key={p} className={period === p ? "active" : ""} onClick={() => setPeriod(p)}>{p}</button>
                ))}
              </div>
            </div>
            <div className="card-body" style={{ paddingTop: 8 }}>
              <div style={{ display: "flex", gap: 20, marginBottom: 12, fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: "var(--green-500)" }}/>
                  <span style={{ color: "var(--text-muted)" }}>{t.income}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: "var(--red-500)" }}/>
                  <span style={{ color: "var(--text-muted)" }}>{t.spending}</span>
                </div>
              </div>
              <CashflowChart data={CASHFLOW}/>
            </div>
          </div>

          {/* Recent activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t.recent_activity}</h3>
              <button className="btn btn-ghost" onClick={() => onNavigate("transactions")}>
                {t.view_all} <Icon name="chevronRight" size={14}/>
              </button>
            </div>
            <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
              {recent.length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-subtle)", fontSize: 13 }}>Chưa có giao dịch nào.</div>
              ) : (
                recent.map(tx => <TxRow key={tx.id} tx={tx} t={t} lang={lang}/>)
              )}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Spending */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t.spending_overview}</h3>
              <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>{t.this_month}</span>
            </div>
            <div className="card-body">
              <SpendingDonut data={SPENDING_BY_CAT} t={t}/>
            </div>
          </div>

          {/* Upcoming */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t.upcoming}</h3>
              <span className="pill pill-amber"><Icon name="calendar" size={11}/> 3</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {UPCOMING.map(u => {
                const d = new Date(u.date + "T00:00:00");
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: "var(--surface-inset)",
                      border: "1px solid var(--border)",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <div style={{ fontSize: 9.5, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {t.months[d.getMonth()]}
                      </div>
                      <div className="num" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1 }}>{d.getDate()}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{u.title}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-subtle)" }}>{u.payee}</div>
                    </div>
                    <div className="num" style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                      {fmtVND(u.amt)} ₫
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insight card */}
          <div className="card" style={{
            background: "linear-gradient(135deg, var(--navy-900), var(--navy-700))",
            color: "#fff",
            border: 0,
          }}>
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Icon name="sparkle" size={16} stroke={2}/>
                <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7 }}>Smart insight</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 19, lineHeight: 1.3, marginBottom: 14 }}>
                Welcome to <em style={{ color: "var(--cyan-300)" }}>67Bank</em>. Your account is ready.
              </div>
              <button className="btn" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}>
                Explore <Icon name="arrowRight" size={14}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
