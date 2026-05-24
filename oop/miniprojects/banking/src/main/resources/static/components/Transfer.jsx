// Transfer screen with form validation + real API call

const { useState: useStateT, useEffect: useEffectT, useMemo: useMemoT } = React;

const Spinner = ({ white }) => (
  <span style={{ display: "inline-block", width: 14, height: 14, border: white ? "2px solid rgba(255,255,255,0.3)" : "2px solid var(--border)", borderTopColor: white ? "#fff" : "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
);

// === QR Pay Modal ===
const QRModal = ({ t, onClose }) => {
  const [tab, setTab] = useStateT("receive");
  const [amount, setAmount] = useStateT("");
  const [copied, setCopied] = useStateT(false);

  const grid = useMemoT(() => {
    const size = 25;
    const cells = [];
    const seed = amount || "67bank-qr-pay";
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const inFinder = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
        if (inFinder) continue;
        hash = (hash * 1103515245 + 12345) & 0x7fffffff;
        if ((hash >> 8) % 100 < 48) cells.push([x, y]);
      }
    }
    return { size, cells };
  }, [amount]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0,
      background: "rgba(6, 24, 41, 0.6)",
      backdropFilter: "blur(8px)",
      display: "grid", placeItems: "center",
      zIndex: 100,
      animation: "fadeIn .2s",
    }}>
      <div onClick={e => e.stopPropagation()} className="fade-in" style={{
        background: "var(--surface)",
        borderRadius: 20,
        width: 460,
        maxWidth: "90vw",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 22 }}>{t.qr_title}</h3>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{t.qr_sub}</div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="x" size={18}/>
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          <div className="toggle-group" style={{ width: "100%", marginBottom: 20 }}>
            <button className={tab === "receive" ? "active" : ""} style={{ flex: 1, padding: "8px 12px" }} onClick={() => setTab("receive")}>
              <Icon name="arrowDown" size={13} stroke={2.5} style={{ marginRight: 6, verticalAlign: -2 }}/>
              {t.qr_receive}
            </button>
            <button className={tab === "scan" ? "active" : ""} style={{ flex: 1, padding: "8px 12px" }} onClick={() => setTab("scan")}>
              <Icon name="qr" size={13} stroke={2.5} style={{ marginRight: 6, verticalAlign: -2 }}/>
              {t.qr_scan}
            </button>
          </div>

          {tab === "receive" ? (
            <>
              <div style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 20,
                display: "grid", placeItems: "center",
                marginBottom: 16,
              }}>
                <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--navy-800)", color: "var(--cyan-300)", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>N</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy-900)" }}>{ACCOUNTS[0]?.number || "—"}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#5A6B82" }}>67 Bank</div>
                  </div>
                </div>
                <svg width="220" height="220" viewBox={`0 0 ${grid.size} ${grid.size}`} style={{ imageRendering: "pixelated" }}>
                  <rect width={grid.size} height={grid.size} fill="#fff"/>
                  {[[0,0],[grid.size-7,0],[0,grid.size-7]].map(([fx,fy], i) => (
                    <g key={i}>
                      <rect x={fx} y={fy} width="7" height="7" fill="#0A2540"/>
                      <rect x={fx+1} y={fy+1} width="5" height="5" fill="#fff"/>
                      <rect x={fx+2} y={fy+2} width="3" height="3" fill="#0A2540"/>
                    </g>
                  ))}
                  {grid.cells.map(([x,y], i) => (
                    <rect key={i} x={x} y={y} width="1" height="1" fill="#0A2540"/>
                  ))}
                  <rect x={grid.size/2 - 3} y={grid.size/2 - 3} width="6" height="6" fill="#fff"/>
                  <rect x={grid.size/2 - 2.5} y={grid.size/2 - 2.5} width="5" height="5" fill="#0EA5E9" rx="0.5"/>
                </svg>
                {amount && (
                  <div className="num" style={{ marginTop: 12, fontSize: 22, fontWeight: 700, color: "var(--navy-900)" }}>
                    {fmtAmount(Number(amount), ACCOUNTS[0]?.currency || "VND")}
                  </div>
                )}
              </div>

              <div className="field" style={{ marginBottom: 16 }}>
                <label className="field-label">{t.qr_request_amount}</label>
                <input
                  type="text"
                  className="field-input"
                  inputMode="numeric"
                  value={amount ? new Intl.NumberFormat('vi-VN').format(Number(amount)) : ""}
                  onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="0"
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                  <Icon name={copied ? "check" : "copy"} size={14}/>
                  {copied ? "Copied" : t.qr_share}
                </button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  <Icon name="download" size={14}/>
                  {t.qr_save}
                </button>
              </div>
            </>
          ) : (
            <div style={{
              aspectRatio: "1",
              background: "var(--navy-950)",
              borderRadius: 16,
              position: "relative",
              overflow: "hidden",
              display: "grid", placeItems: "center",
            }}>
              <div style={{ position: "absolute", inset: 20, border: "2px dashed rgba(255,255,255,0.2)", borderRadius: 12 }}/>
              {[[16,16,"tl"],[null,16,"tr"],[16,null,"bl"],[null,null,"br"]].map(([l,top], i) => {
                const right = l === null ? 16 : null;
                const bottom = top === null ? 16 : null;
                return (
                  <div key={i} style={{
                    position: "absolute",
                    left: l ?? "auto", top: top ?? "auto",
                    right: right ?? "auto", bottom: bottom ?? "auto",
                    width: 40, height: 40,
                    borderTop: top != null ? "3px solid var(--cyan-400)" : "none",
                    borderBottom: bottom != null ? "3px solid var(--cyan-400)" : "none",
                    borderLeft: l != null ? "3px solid var(--cyan-400)" : "none",
                    borderRight: right != null ? "3px solid var(--cyan-400)" : "none",
                    borderRadius: "8px",
                  }}/>
                );
              })}
              <div style={{
                position: "absolute", left: "10%", right: "10%",
                top: "50%",
                height: 2,
                background: "linear-gradient(90deg, transparent, var(--cyan-400), transparent)",
                animation: "scanline 2s ease-in-out infinite",
                boxShadow: "0 0 12px var(--cyan-400)",
              }}/>
              <style>{`@keyframes scanline { 0%, 100% { top: 18%; } 50% { top: 82%; } }`}</style>
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.8)", zIndex: 1 }}>
                <Icon name="qr" size={48} stroke={1.2}/>
                <div style={{ marginTop: 12, fontSize: 13 }}>Position a QR code inside the frame</div>
                <div style={{ marginTop: 6, fontSize: 11, opacity: 0.6 }}>Or drag &amp; drop an image</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// === Success modal ===
const SuccessModal = ({ t, recipient, amount, currency, onClose }) => (
  <div onClick={onClose} style={{
    position: "fixed", inset: 0,
    background: "rgba(6, 24, 41, 0.6)",
    backdropFilter: "blur(8px)",
    display: "grid", placeItems: "center",
    zIndex: 100,
  }}>
    <div onClick={e => e.stopPropagation()} className="fade-in" style={{
      background: "var(--surface)",
      borderRadius: 20,
      width: 420,
      padding: "32px 28px",
      textAlign: "center",
      boxShadow: "var(--shadow-xl)",
    }}>
      <div style={{
        width: 72, height: 72,
        borderRadius: "50%",
        background: "var(--green-100)",
        margin: "0 auto 16px",
        display: "grid", placeItems: "center",
        color: "var(--green-600)",
      }}>
        <Icon name="check" size={36} stroke={3}/>
      </div>
      <h3 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: 28 }}>{t.transfer_success}</h3>
      <p style={{ margin: "0 0 20px", color: "var(--text-muted)", fontSize: 14 }}>{t.transfer_success_sub}</p>
      <div style={{ padding: "16px 18px", background: "var(--surface-inset)", borderRadius: 12, marginBottom: 20, textAlign: "left" }}>
        <div style={{ fontSize: 11, color: "var(--text-subtle)", letterSpacing: "0.08em", textTransform: "uppercase" }}>To</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{recipient}</div>
        <div className="num" style={{ fontSize: 24, fontWeight: 700, marginTop: 10, color: "var(--navy-900)" }}>
          {fmtAmount(amount, currency || "VND")}
        </div>
      </div>
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onClose}>
        {t.done}
      </button>
    </div>
  </div>
);

// === Transfer main ===
const Transfer = ({ t, lang, onOpenQR, onDataRefresh }) => {
  const [fromAcc, setFromAcc] = useStateT(ACCOUNTS[0]?.id || "");
  const [recipient, setRecipient] = useStateT({ name: "", bank: "vietcombank", account: "", id: null });
  const [amount, setAmount] = useStateT("");
  const [note, setNote] = useStateT("");
  const [schedule, setSchedule] = useStateT("now");
  const [touched, setTouched] = useStateT({});
  const [step, setStep] = useStateT("form"); // form | review | success | loading
  const [apiError, setApiError] = useStateT("");
  const [lookup, setLookup] = useStateT(null); // null | "loading" | { ownerName, accountNumber } | "not_found"
  const [copied, setCopied] = useStateT(null); // accountId that was copied

  const from = ACCOUNTS.find(a => a.id === fromAcc) || ACCOUNTS[0];

  const errors = useMemoT(() => {
    if (!from) return {};
    const e = {};
    if (!recipient.name.trim()) e.name = t.err_required;
    if (!recipient.account.trim()) e.account = t.err_required;
    else if (!/^(VN[-\s]?\d{4}[-\s]?\d{4}|\d{8,20})$/i.test(recipient.account.replace(/\s/g, ""))) e.account = t.err_account_format;
    if (!amount) e.amount = t.err_required;
    else if (Number(amount) <= 0) e.amount = t.err_amount_min;
    else if (Number(amount) > from._rawBalance) e.amount = t.err_amount_max;
    return e;
  }, [recipient, amount, from, t]);

  const lookupAccount = async (number) => {
    if (!number.trim()) { setLookup(null); return; }
    setLookup("loading");
    try {
      const res = await fetch(`/accounts/lookup?number=${encodeURIComponent(number.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setLookup(data);
        setRecipient(r => ({ ...r, name: data.ownerName, bank: "67bank" }));
      } else {
        setLookup("not_found");
      }
    } catch {
      setLookup(null);
    }
  };

  const copyAccountNumber = (number, id) => {
    navigator.clipboard.writeText(number.replace(/\s/g, "-")).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const showError = (field) => touched[field] && errors[field];
  const isValid = Object.keys(errors).length === 0;

  const selectRecipient = (r) => {
    setRecipient({ name: r.name, bank: r.bank, account: r.account.replace(/\s/g, ""), id: r.id });
  };

  const submit = () => {
    setTouched({ name: true, account: true, amount: true });
    if (isValid) setStep("review");
  };

  const confirm = async () => {
    setStep("loading");
    setApiError("");

    // Only proceed if we have a valid 67 Bank lookup result with accountId
    if (!lookup || lookup === "loading" || lookup === "not_found" || !lookup.accountId) {
      setApiError("Vui lòng nhập số tài khoản 67 Bank hợp lệ.");
      setStep("review");
      return;
    }

    if (lookup.accountId === from.id) {
      setApiError("Không thể chuyển tiền vào chính tài khoản nguồn.");
      setStep("review");
      return;
    }

    try {
      const res = await fetch("/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountId: from.id,
          toAccountId: lookup.accountId,
          amount: Number(amount),
          currencyCode: from.currency,
        }),
      });
      if (res.ok) {
        if (onDataRefresh) onDataRefresh();
        setStep("success");
      } else {
        const err = await res.json().catch(() => ({}));
        setApiError(err.message || err.error || "Chuyển khoản thất bại.");
        setStep("review");
      }
    } catch {
      setApiError("Không thể kết nối đến máy chủ.");
      setStep("review");
    }
  };

  const reset = () => {
    setStep("form");
    setRecipient({ name: "", bank: "vietcombank", account: "", id: null });
    setAmount("");
    setNote("");
    setTouched({});
    setApiError("");
    setLookup(null);
  };

  if (!from) {
    return (
      <div className="page fade-in" style={{ display: "grid", placeItems: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Không có tài khoản nào.</div>
      </div>
    );
  }

  const amountFormatted = amount ? new Intl.NumberFormat('vi-VN').format(Number(amount)) : "";
  const recipientBank = BANKS.find(b => b.slug === recipient.bank);

  return (
    <div className="page fade-in" data-screen-label="02 Transfer">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.transfer_title}</h1>
          <p className="page-sub">{t.transfer_sub}</p>
        </div>
        <button className="btn btn-accent" onClick={onOpenQR}>
          <Icon name="qr" size={16}/>
          {t.use_qr}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>
        {/* Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{step === "review" || step === "loading" ? t.review : t.transfer_title}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: step !== "form" ? "var(--green-500)" : "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700 }}>
                  {step !== "form" ? <Icon name="check" size={10} stroke={3}/> : "1"}
                </div>
                <span>Details</span>
              </div>
              <div style={{ width: 24, height: 1, background: "var(--border-strong)" }}/>
              <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: step === "form" ? 0.4 : 1 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: (step === "review" || step === "loading") ? "var(--accent)" : (step === "success" ? "var(--green-500)" : "var(--surface-inset)"), color: step === "form" ? "var(--text-subtle)" : "#fff", border: step === "form" ? "1px solid var(--border-strong)" : 0, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700 }}>
                  {step === "success" ? <Icon name="check" size={10} stroke={3}/> : "2"}
                </div>
                <span>Confirm</span>
              </div>
            </div>
          </div>

          <div className="card-body" style={{ padding: "24px" }}>
            {step === "form" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* From */}
                <div className="field">
                  <label className="field-label">{t.from_account}</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ACCOUNTS.map(a => (
                      <label key={a.id} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px",
                        border: `1.5px solid ${fromAcc === a.id ? "var(--accent)" : "var(--border)"}`,
                        background: fromAcc === a.id ? "var(--accent-soft)" : "var(--surface)",
                        borderRadius: 10,
                        cursor: "pointer",
                        transition: "all .15s",
                      }}>
                        <input type="radio" checked={fromAcc === a.id} onChange={() => setFromAcc(a.id)} style={{ accentColor: "var(--accent)" }}/>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t[a.nameKey] || a._nameValue}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-subtle)" }}>{a.number}</span>
                            <button
                              type="button"
                              onClick={e => { e.preventDefault(); copyAccountNumber(a.number, a.id); }}
                              style={{ background: "none", border: "none", padding: "2px 4px", cursor: "pointer", color: copied === a.id ? "var(--green-500)" : "var(--text-subtle)", borderRadius: 4, lineHeight: 1 }}
                              title="Copy số tài khoản">
                              <Icon name={copied === a.id ? "check" : "copy"} size={12} stroke={2}/>
                            </button>
                          </div>
                        </div>
                        <div className="num" style={{ fontSize: 14, fontWeight: 600 }}>
                          {fmtAmount(a._rawBalance, a.currency)}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Recipient bank */}
                <div className="field">
                  <label className="field-label">{t.recipient_bank}</label>
                  <select
                    className="field-select"
                    value={recipient.bank}
                    onChange={e => setRecipient(r => ({ ...r, bank: e.target.value }))}>
                    {BANKS.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                  </select>
                </div>

                {/* Account number */}
                <div className="field">
                  <label className="field-label">{t.recipient_number}</label>
                  <input
                    type="text"
                    className={`field-input ${showError("account") ? "error" : ""}`}
                    placeholder="VN-XXXX-XXXX hoặc số tài khoản"
                    value={recipient.account}
                    onChange={e => {
                      setRecipient(r => ({ ...r, account: e.target.value }));
                      setLookup(null);
                    }}
                    onBlur={() => {
                      setTouched(tc => ({ ...tc, account: true }));
                      lookupAccount(recipient.account);
                    }}
                    style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
                  />
                  {showError("account") && <div className="field-error"><Icon name="alert" size={12}/> {errors.account}</div>}
                  {lookup === "loading" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>
                      <Spinner white={false}/> Đang kiểm tra tài khoản…
                    </div>
                  )}
                  {lookup && lookup !== "loading" && lookup !== "not_found" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "var(--green-600)", fontWeight: 600 }}>
                      <Icon name="check" size={13} stroke={3}/> {lookup.ownerName} · 67 Bank
                    </div>
                  )}
                  {lookup === "not_found" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "var(--red-600)" }}>
                      <Icon name="alert" size={13}/> Không tìm thấy tài khoản trong 67 Bank
                    </div>
                  )}
                </div>

                {/* Recipient name */}
                <div className="field">
                  <label className="field-label">{t.recipient_name}</label>
                  <input
                    type="text"
                    className={`field-input ${showError("name") ? "error" : ""}`}
                    placeholder="Full legal name"
                    value={recipient.name}
                    onChange={e => setRecipient(r => ({ ...r, name: e.target.value.toUpperCase() }))}
                    onBlur={() => setTouched(tc => ({ ...tc, name: true }))}
                    style={{ textTransform: "uppercase" }}
                  />
                  {showError("name") && <div className="field-error"><Icon name="alert" size={12}/> {errors.name}</div>}
                </div>

                {/* Amount */}
                <div className="field">
                  <label className="field-label">{t.amount}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className={`field-input ${showError("amount") ? "error" : ""}`}
                      placeholder="0"
                      inputMode="numeric"
                      value={amountFormatted}
                      onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                      onBlur={() => setTouched(tc => ({ ...tc, amount: true }))}
                      style={{ paddingRight: 60, fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}
                    />
                    <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                      {from.currency}
                    </div>
                  </div>
                  {showError("amount") ? (
                    <div className="field-error"><Icon name="alert" size={12}/> {errors.amount}</div>
                  ) : (
                    <div className="field-help">{t.available}: <span className="num" style={{ fontWeight: 600, color: "var(--text-muted)" }}>{fmtAmount(from._rawBalance, from.currency)}</span></div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    {[10, 50, 100, 500, 1000].map(v => (
                      <button key={v} type="button" className="pill" style={{ cursor: "pointer" }} onClick={() => setAmount(String(v))}>
                        +{v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div className="field">
                  <label className="field-label">{t.note}</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder={t.note_placeholder}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    maxLength={80}
                  />
                </div>

                {/* Schedule */}
                <div className="field">
                  <label className="field-label">{t.schedule}</label>
                  <div className="toggle-group" style={{ alignSelf: "flex-start" }}>
                    <button className={schedule === "now" ? "active" : ""} style={{ padding: "8px 14px" }} onClick={() => setSchedule("now")}>
                      <Icon name="bolt" size={12} style={{ marginRight: 4, verticalAlign: -2 }}/>
                      {t.schedule_now}
                    </button>
                    <button className={schedule === "later" ? "active" : ""} style={{ padding: "8px 14px" }} onClick={() => setSchedule("later")}>
                      <Icon name="calendar" size={12} style={{ marginRight: 4, verticalAlign: -2 }}/>
                      {t.schedule_later}
                    </button>
                  </div>
                </div>

                <div className="divider"/>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost" onClick={reset}>{t.cancel}</button>
                  <button
                    className="btn btn-primary"
                    onClick={submit}
                    aria-disabled={!isValid}>
                    {t.review}
                    <Icon name="arrowRight" size={14}/>
                  </button>
                </div>
              </div>
            )}

            {(step === "review" || step === "loading") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Big amount */}
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ fontSize: 11.5, color: "var(--text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>You will send</div>
                  <div className="num" style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--navy-900)" }}>
                    {amountFormatted} <span style={{ fontSize: 24, color: "var(--text-muted)" }}>{from.currency}</span>
                  </div>
                </div>

                <div style={{ background: "var(--surface-inset)", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                  <Row label={t.from_account} value={
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t[from.nameKey] || from._nameValue}</div>
                      <div className="num" style={{ fontSize: 11.5, color: "var(--text-subtle)" }}>{from.number}</div>
                    </div>
                  }/>
                  <div style={{ height: 1, background: "var(--border)" }}/>
                  <Row label={t.to_account} value={
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {bankLogo(recipient.bank)}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{recipient.name}</div>
                        <div className="num" style={{ fontSize: 11.5, color: "var(--text-subtle)" }}>{recipient.account} · {recipientBank?.name}</div>
                      </div>
                    </div>
                  }/>
                  <div style={{ height: 1, background: "var(--border)" }}/>
                  <Row label={t.fee} value={<span className="pill pill-success"><Icon name="check" size={11} stroke={3}/> {t.free}</span>}/>
                  <Row label={t.arrives} value={<span style={{ fontWeight: 600, fontSize: 13 }}><Icon name="bolt" size={12} stroke={2.5} style={{ verticalAlign: -2, marginRight: 4, color: "var(--amber-500)" }}/>{t.instant} · &lt; 30s</span>}/>
                  {note && <><div style={{ height: 1, background: "var(--border)" }}/><Row label={t.note} value={<span style={{ fontSize: 13 }}>{note}</span>}/></>}
                </div>

                {apiError && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--red-100)", borderRadius: 8, color: "var(--red-600)", fontSize: 13 }}>
                    <Icon name="alert" size={14}/>
                    {apiError}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "var(--amber-100)", borderRadius: 10, fontSize: 12.5, color: "#92500A" }}>
                  <Icon name="info" size={16} style={{ flexShrink: 0, marginTop: 1 }}/>
                  <div>Verify recipient details carefully. Transfers cannot be reversed once confirmed.</div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-secondary" onClick={() => setStep("form")} disabled={step === "loading"}>
                    <Icon name="chevronLeft" size={14}/>
                    Back
                  </button>
                  <button className="btn btn-primary" onClick={confirm} disabled={step === "loading"}>
                    {step === "loading" ? (
                      <><Spinner white/> Đang xử lý…</>
                    ) : (
                      <><Icon name="check" size={14} stroke={2.5}/> {t.confirm}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved recipients sidebar */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t.saved_recipients}</h3>
            <button className="icon-btn" style={{ width: 32, height: 32 }}>
              <Icon name="plus" size={16}/>
            </button>
          </div>
          <div className="card-body" style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
            {SAVED_RECIPIENTS.map(r => (
              <button key={r.id}
                onClick={() => selectRecipient(r)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 10px",
                  borderRadius: 10,
                  background: recipient.id === r.id ? "var(--accent-soft)" : "transparent",
                  border: `1px solid ${recipient.id === r.id ? "var(--accent)" : "transparent"}`,
                  transition: "all .15s",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={e => { if (recipient.id !== r.id) e.currentTarget.style.background = "var(--surface-inset)"; }}
                onMouseLeave={e => { if (recipient.id !== r.id) e.currentTarget.style.background = "transparent"; }}>
                {bankLogo(r.bank)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>{r.bankName} · <span className="num">{r.account.slice(-6)}</span></div>
                </div>
                <Icon name="chevronRight" size={14} style={{ color: "var(--text-subtle)" }}/>
              </button>
            ))}
            <div className="divider"/>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
              <Icon name="plus" size={14}/> {t.new_recipient}
            </button>
          </div>
        </div>
      </div>

      {step === "success" && (
        <SuccessModal
          t={t}
          recipient={recipient.name}
          amount={Number(amount)}
          currency={from.currency}
          onClose={reset}
        />
      )}
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
    <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.02em" }}>{label}</div>
    <div style={{ textAlign: "right" }}>{value}</div>
  </div>
);

window.Transfer = Transfer;
window.QRModal = QRModal;
