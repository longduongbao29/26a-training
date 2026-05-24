// Transaction history screen with search + filter

const { useState: useStateX, useMemo: useMemoX } = React;

const Transactions = ({ t, lang }) => {
  const [filter, setFilter] = useStateX("all");
  const [search, setSearch] = useStateX("");
  const [accFilter, setAccFilter] = useStateX("all");
  const [catFilter, setCatFilter] = useStateX("all");
  const [selected, setSelected] = useStateX(null);

  const filtered = useMemoX(() => {
    return TRANSACTIONS.filter(tx => {
      if (filter === "in" && tx.amt <= 0) return false;
      if (filter === "out" && tx.amt >= 0) return false;
      if (filter === "pending" && tx.status !== "pending") return false;
      if (filter === "failed" && tx.status !== "failed") return false;
      if (accFilter !== "all" && tx.acc !== accFilter) return false;
      if (catFilter !== "all" && tx.cat !== catFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!tx.desc.toLowerCase().includes(q) && !String(Math.abs(tx.amt)).includes(q)) return false;
      }
      return true;
    });
  }, [filter, search, accFilter, catFilter]);

  const grouped = useMemoX(() => {
    const groups = {};
    filtered.forEach(tx => {
      groups[tx.date] = groups[tx.date] || [];
      groups[tx.date].push(tx);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const stats = useMemoX(() => {
    const inSum = filtered.filter(tx => tx.amt > 0 && tx.status === "completed").reduce((s, tx) => s + tx.amt, 0);
    const outSum = filtered.filter(tx => tx.amt < 0 && tx.status === "completed").reduce((s, tx) => s + Math.abs(tx.amt), 0);
    return { inSum, outSum, count: filtered.length };
  }, [filtered]);

  const primaryCurrency = ACCOUNTS[0]?.currency || "USD";

  const filterTabs = [
    { id: "all",     label: t.filter_all,     count: TRANSACTIONS.length },
    { id: "in",      label: t.filter_in,      count: TRANSACTIONS.filter(tx => tx.amt > 0).length },
    { id: "out",     label: t.filter_out,     count: TRANSACTIONS.filter(tx => tx.amt < 0).length },
    { id: "pending", label: t.filter_pending, count: TRANSACTIONS.filter(tx => tx.status === "pending").length },
    { id: "failed",  label: t.filter_failed,  count: TRANSACTIONS.filter(tx => tx.status === "failed").length },
  ];

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  return (
    <div className="page fade-in" data-screen-label="03 Transactions">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.tx_title}</h1>
          <p className="page-sub">{t.tx_sub}</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary"><Icon name="calendar" size={14}/> {new Date().toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}</button>
          <button className="btn btn-secondary"><Icon name="download" size={14}/> {t.export}</button>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green-100)", color: "var(--green-600)", display: "grid", placeItems: "center" }}>
              <Icon name="arrowDown" size={16} stroke={2.5}/>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t.income}</div>
          </div>
          <div className="num" style={{ fontSize: 22, fontWeight: 600, color: "var(--green-600)" }}>+{fmtAmount(stats.inSum, primaryCurrency)}</div>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--red-100)", color: "var(--red-600)", display: "grid", placeItems: "center" }}>
              <Icon name="arrowUp" size={16} stroke={2.5}/>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t.spending}</div>
          </div>
          <div className="num" style={{ fontSize: 22, fontWeight: 600, color: "var(--red-600)" }}>−{fmtAmount(stats.outSum, primaryCurrency)}</div>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-inset)", color: "var(--navy-700)", display: "grid", placeItems: "center" }}>
              <Icon name="list" size={16}/>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t.tx_title}</div>
          </div>
          <div className="num" style={{ fontSize: 22, fontWeight: 600 }}>{stats.count} <span style={{ fontSize: 12, color: "var(--text-subtle)", fontWeight: 400, fontFamily: "var(--font-sans)" }}>items</span></div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4, padding: 3, background: "var(--surface-inset)", borderRadius: 10, flexWrap: "wrap" }}>
            {filterTabs.map(tab => (
              <button key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 7,
                  fontSize: 13,
                  fontWeight: 600,
                  background: filter === tab.id ? "var(--surface)" : "transparent",
                  color: filter === tab.id ? "var(--text)" : "var(--text-muted)",
                  boxShadow: filter === tab.id ? "var(--shadow-sm)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all .15s",
                }}>
                {tab.label}
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: 999,
                  background: filter === tab.id ? "var(--accent-soft)" : "var(--surface)",
                  color: filter === tab.id ? "var(--accent)" : "var(--text-subtle)",
                  fontFamily: "var(--font-mono)",
                }}>{tab.count}</span>
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }}/>

          <div style={{
            height: 36, display: "flex", alignItems: "center", gap: 8,
            padding: "0 12px",
            background: "var(--surface-inset)",
            borderRadius: 8,
            width: 260,
            border: "1px solid transparent",
          }}>
            <Icon name="search" size={15} style={{ color: "var(--text-subtle)" }}/>
            <input
              type="text"
              placeholder={t.search_placeholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: 13 }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color: "var(--text-subtle)", display: "grid", placeItems: "center" }}>
                <Icon name="x" size={13}/>
              </button>
            )}
          </div>

          <select value={accFilter} onChange={e => setAccFilter(e.target.value)} style={{
            height: 36, padding: "0 12px",
            background: "var(--surface-inset)",
            border: "1px solid transparent",
            borderRadius: 8, fontSize: 13, fontWeight: 500,
          }}>
            <option value="all">All accounts</option>
            {ACCOUNTS.map(a => <option key={a.id} value={a.id}>{t[a.nameKey] || a._nameValue}</option>)}
          </select>

          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{
            height: 36, padding: "0 12px",
            background: "var(--surface-inset)",
            border: "1px solid transparent",
            borderRadius: 8, fontSize: 13, fontWeight: 500,
          }}>
            <option value="all">All categories</option>
            {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{t[`cat_${c}`]}</option>)}
          </select>
        </div>
      </div>

      {/* Transaction list */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 16, alignItems: "start" }}>
        <div className="card">
          {grouped.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "var(--text-subtle)" }}>
              <Icon name="search" size={36} stroke={1.2}/>
              <div style={{ marginTop: 10, fontSize: 14 }}>
                {TRANSACTIONS.length === 0 ? "Chưa có giao dịch nào." : "No transactions match your filters."}
              </div>
            </div>
          ) : grouped.map(([date, items]) => {
            const d = new Date(date + "T00:00:00");
            const isToday = date === today;
            const isYesterday = date === yesterday;
            const dayLabel = isToday
              ? (lang === "vi" ? "Hôm nay" : "Today")
              : isYesterday
              ? (lang === "vi" ? "Hôm qua" : "Yesterday")
              : `${d.getDate()} ${t.months[d.getMonth()]} ${d.getFullYear()}`;
            const dayTotal = items.reduce((s, x) => s + (x.status === "completed" ? x.amt : 0), 0);
            return (
              <div key={date}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 22px",
                  background: "var(--surface-2)",
                  borderTop: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 12,
                }}>
                  <div style={{ fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{dayLabel}</div>
                  <div className="num" style={{ fontWeight: 600, color: dayTotal >= 0 ? "var(--green-600)" : "var(--text-muted)" }}>
                    {dayTotal >= 0 ? "+" : ""}{fmtAmount(Math.abs(dayTotal), ACCOUNTS[0]?.currency || "USD")}
                  </div>
                </div>
                {items.map(tx => {
                  const cat = CATEGORIES[tx.cat];
                  const acc = ACCOUNTS.find(a => a.id === tx.acc);
                  const currency = acc?.currency || "USD";
                  return (
                    <div key={tx.id}
                      onClick={() => setSelected(selected?.id === tx.id ? null : tx)}
                      style={{
                        display: "flex", alignItems: "center", gap: 16,
                        padding: "14px 22px",
                        borderBottom: "1px solid var(--border)",
                        cursor: "pointer",
                        background: selected?.id === tx.id ? "var(--accent-soft)" : "transparent",
                        transition: "background .15s",
                      }}
                      onMouseEnter={e => { if (selected?.id !== tx.id) e.currentTarget.style.background = "var(--surface-2)"; }}
                      onMouseLeave={e => { if (selected?.id !== tx.id) e.currentTarget.style.background = "transparent"; }}>
                      <div style={{
                        width: 40, height: 40,
                        borderRadius: 10,
                        background: cat.color + "20",
                        color: cat.color,
                        display: "grid", placeItems: "center",
                        flexShrink: 0,
                      }}>
                        <Icon name={cat.icon} size={18}/>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{tx.desc}</span>
                          {tx.status === "pending" && <span className="pill pill-amber"><Icon name="refresh" size={10}/> {t.filter_pending}</span>}
                          {tx.status === "failed" && <span className="pill pill-danger"><Icon name="x" size={10} stroke={2.5}/> {t.filter_failed}</span>}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2 }}>
                          {tx.time} · {t[`cat_${tx.cat}`]} · {acc ? (t[acc.nameKey] || acc._nameValue) : ""}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="num" style={{ fontSize: 15, fontWeight: 700, color: tx.amt > 0 ? "var(--green-600)" : (tx.status === "failed" ? "var(--text-subtle)" : "var(--text)"), textDecoration: tx.status === "failed" ? "line-through" : "none" }}>
                          {tx.amt > 0 ? "+" : ""}{fmtAmount(Math.abs(tx.amt), currency)}
                        </div>
                      </div>
                      <Icon name="chevronRight" size={14} style={{ color: "var(--text-subtle)", flexShrink: 0 }}/>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="card fade-in" style={{ position: "sticky", top: 90 }}>
            <div className="card-header">
              <h3 className="card-title">Transaction details</h3>
              <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => setSelected(null)}>
                <Icon name="x" size={16}/>
              </button>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: CATEGORIES[selected.cat].color + "20",
                  color: CATEGORIES[selected.cat].color,
                  display: "grid", placeItems: "center",
                  margin: "0 auto 12px",
                }}>
                  <Icon name={CATEGORIES[selected.cat].icon} size={26}/>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{selected.desc}</div>
                {(() => {
                  const selAcc = ACCOUNTS.find(a => a.id === selected.acc);
                  const selCurrency = selAcc?.currency || "USD";
                  return (
                    <div className="num" style={{ fontSize: 32, fontWeight: 700, color: selected.amt > 0 ? "var(--green-600)" : "var(--navy-900)", letterSpacing: "-0.01em" }}>
                      {selected.amt > 0 ? "+" : ""}{fmtAmount(Math.abs(selected.amt), selCurrency)} <span style={{ fontSize: 18, color: "var(--text-muted)" }}>{selCurrency}</span>
                    </div>
                  );
                })()}
                <div style={{ marginTop: 8 }}>
                  {selected.status === "completed" && <span className="pill pill-success"><Icon name="check" size={11} stroke={3}/> {t.completed}</span>}
                  {selected.status === "pending" && <span className="pill pill-amber"><Icon name="refresh" size={11}/> {t.filter_pending}</span>}
                  {selected.status === "failed" && <span className="pill pill-danger"><Icon name="x" size={11} stroke={2.5}/> {t.filter_failed}</span>}
                </div>
              </div>

              <div style={{ background: "var(--surface-inset)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <DetailRow label={t.date} value={`${fmtDate(selected.date, lang)} · ${selected.time}`}/>
                <DetailRow label={t.category} value={
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: CATEGORIES[selected.cat].color }}/>
                    {t[`cat_${selected.cat}`]}
                  </span>
                }/>
                <DetailRow label={t.account} value={(() => {
                  const a = ACCOUNTS.find(a => a.id === selected.acc);
                  return a ? (t[a.nameKey] || a._nameValue) : selected.acc;
                })()}/>
                <DetailRow label="Reference" value={<span className="num">TX{String(selected.id).slice(0, 8).toUpperCase()}</span>}/>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center", fontSize: 12.5 }}>
                  <Icon name="download" size={14}/> Receipt
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center", fontSize: 12.5 }}>
                  <Icon name="refresh" size={14}/> Repeat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 13 }}>
    <span style={{ color: "var(--text-muted)" }}>{label}</span>
    <span style={{ fontWeight: 600, textAlign: "right" }}>{value}</span>
  </div>
);

window.Transactions = Transactions;
