// Nordbank data layer — real API + mock fallback

// ============== Icons (24x24 stroke) ==============
const Icon = ({ name, size = 20, stroke = 1.75, ...props }) => {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    wallet: <><path d="M3 7.5A2.5 2.5 0 015.5 5h12a1.5 1.5 0 011.5 1.5V8H5.5A2.5 2.5 0 013 5.5"/><path d="M3 7v10.5A2.5 2.5 0 005.5 20H19a2 2 0 002-2v-9a1 1 0 00-1-1H5.5"/><circle cx="17" cy="14" r="1.25" fill="currentColor" stroke="none"/></>,
    send: <><path d="M21 3L10.5 13.5"/><path d="M21 3l-7 18-3.5-7.5L3 10l18-7z"/></>,
    list: <><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/></>,
    card: <><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><path d="M6 15h3"/></>,
    piggy: <><path d="M4 12c0-3.5 3.5-6 8-6s8 2.5 8 6c0 1.5-.7 2.8-1.8 3.8L19 19h-3l-.5-1.2A11 11 0 0112 18a11 11 0 01-3.5-.5L8 19H5l.8-3.2C4.7 14.8 4 13.5 4 12z"/><circle cx="16" cy="11" r=".8" fill="currentColor" stroke="none"/><path d="M9 9.5c1-.5 2-.7 3-.7"/></>,
    qr: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h2v2"/><path d="M19 14v2h-2"/><path d="M14 19h2v2"/><path d="M19 19v2"/></>,
    gear: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5"/><circle cx="12" cy="17" r=".8" fill="currentColor" stroke="none"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
    bell: <><path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 004 0"/></>,
    moon: <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
    chevronDown: <path d="M6 9l6 6 6-6"/>,
    chevronRight: <path d="M9 6l6 6-6 6"/>,
    chevronLeft: <path d="M15 6l-6 6 6 6"/>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    arrowUp: <><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></>,
    arrowDown: <><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></>,
    arrowRight: <><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></>,
    eye: <><path d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="M3 3l18 18"/><path d="M10.6 5.1A11 11 0 0112 5c6.5 0 10.5 7 10.5 7a18.5 18.5 0 01-3.2 4"/><path d="M6.1 6.1A18.5 18.5 0 001.5 12s4 7 10.5 7a11 11 0 005.9-1.7"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/></>,
    download: <><path d="M12 3v13"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/></>,
    filter: <path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
    check: <path d="M5 12l5 5L20 7"/>,
    x: <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></>,
    alert: <><path d="M12 3l10 18H2L12 3z"/><path d="M12 10v4M12 17.5v.5"/></>,
    sparkle: <path d="M12 3l1.8 5.3L19 10l-5.3 1.8L12 17l-1.8-5.3L5 10l5.2-1.7L12 3z"/>,
    food: <><path d="M4 7h16M5 7v13M19 7v13M9 7V4M15 7V4"/></>,
    car: <><path d="M5 16V11l2-5h10l2 5v5M5 16h14M5 16v2h2v-2M19 16v2h-2v-2"/><circle cx="8" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="13" r="1" fill="currentColor" stroke="none"/></>,
    bag: <><path d="M6 8h12l-1 13H7L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></>,
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>,
    music: <><circle cx="6" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/><path d="M8.5 18V6l11-2v12"/></>,
    heart: <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6.5 5.5 5.5 0 0121.5 12c-2.5 4.5-9.5 9-9.5 9z"/>,
    home: <><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z"/></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>,
    refresh: <><path d="M3 12a9 9 0 0115-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-15 6.7L3 16"/><path d="M3 21v-5h5"/></>,
    upload: <><path d="M12 16V4"/><path d="M7 8l5-5 5 5"/><path d="M5 21h14"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></>,
    laptop: <><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M0 20h24"/></>,
    phone: <><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name]}
    </svg>
  );
};

// ============== Bank logos ==============
const bankLogo = (slug) => {
  const map = {
    "67bank":    { bg: "#0A2540", fg: "#22B8E6", letter: "67" },
    vietcombank: { bg: "#007D3C", fg: "#FFD800", letter: "V" },
    techcombank: { bg: "#E0162B", fg: "#fff",    letter: "T" },
    bidv:        { bg: "#1A5DAB", fg: "#fff",    letter: "B" },
    mb:          { bg: "#003972", fg: "#E11D2F", letter: "M" },
    acb:         { bg: "#003C84", fg: "#0096D6", letter: "A" },
    vpbank:      { bg: "#00824C", fg: "#FFCD11", letter: "VP" },
  };
  const it = map[slug] || map["67bank"];
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: it.bg, color: it.fg, display: "grid", placeItems: "center", fontWeight: 800, fontSize: it.letter.length > 1 ? 12 : 15, flexShrink: 0, letterSpacing: it.letter.length > 1 ? "-0.05em" : 0 }}>
      {it.letter}
    </div>
  );
};

// ============== Account color palette ==============
const ACCOUNT_COLORS = [
  "linear-gradient(135deg, #0A2540 0%, #1B4470 60%, #2E5A8A 100%)",
  "linear-gradient(135deg, #061829 0%, #0F3057 70%, #0EA5E9 130%)",
  "linear-gradient(135deg, #1B4470 0%, #2E5A8A 50%, #C8A24B 130%)",
  "linear-gradient(135deg, #0F3057 0%, #2E5A8A 60%, #10B981 130%)",
];

// ============== Helpers ==============
const fmtVND = (n) => {
  const abs = Math.abs(n);
  return (n < 0 ? "-" : "") + new Intl.NumberFormat('vi-VN').format(abs);
};
const fmtUSD = (n) => (n < 0 ? "-" : "") + "$" + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n));
const fmtAmount = (n, currency) => currency === "USD" ? fmtUSD(n) : fmtVND(n);

const fmtDate = (iso, lang) => {
  const d = new Date(iso + "T00:00:00");
  const months = I18N[lang].months;
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

// ============== Static/mock data (charts, upcoming) ==============
const BANKS = [
  { slug: "67bank",      name: "67 Bank" },
  { slug: "vietcombank", name: "Vietcombank" },
  { slug: "techcombank", name: "Techcombank" },
  { slug: "bidv",        name: "BIDV" },
  { slug: "mb",          name: "MB Bank" },
  { slug: "acb",         name: "ACB" },
  { slug: "vpbank",      name: "VPBank" },
];

const SAVED_RECIPIENTS = [
  { id: "r1", name: "Nguyễn Minh Anh", bank: "vietcombank", bankName: "Vietcombank", account: "1014256338" },
  { id: "r2", name: "Trần Quốc Bảo",   bank: "techcombank", bankName: "Techcombank", account: "1903668822" },
  { id: "r3", name: "Lê Thị Hương",    bank: "bidv",        bankName: "BIDV",        account: "5601224511" },
  { id: "r4", name: "Phạm Đăng Khoa",  bank: "mb",          bankName: "MB Bank",     account: "0070109844" },
];

const CATEGORIES = {
  food:          { icon: "food",  color: "#F59E0B" },
  transport:     { icon: "car",   color: "#0EA5E9" },
  shopping:      { icon: "bag",   color: "#A78BFA" },
  bills:         { icon: "bolt",  color: "#EF4444" },
  salary:        { icon: "arrowDown", color: "#10B981" },
  transfer:      { icon: "send",  color: "#0A2540" },
  entertainment: { icon: "music", color: "#EC4899" },
  health:        { icon: "heart", color: "#F43F5E" },
};

const CASHFLOW = [
  { d: 11, in: 1.2, out: 1.4 }, { d: 12, in: 0, out: 0.09 },
  { d: 13, in: 0, out: 2.4 },   { d: 14, in: 0, out: 1.79 },
  { d: 15, in: 0, out: 5.0 },   { d: 16, in: 0, out: 0.49 },
  { d: 17, in: 0, out: 1.33 },  { d: 18, in: 0, out: 0.26 },
  { d: 19, in: 42.5, out: 0.52 },{ d: 20, in: 0, out: 27.9 },
  { d: 21, in: 0.45, out: 0 },  { d: 22, in: 0, out: 1.56 },
  { d: 23, in: 0, out: 4.04 },  { d: 24, in: 0, out: 0.21 },
];

const SPENDING_BY_CAT = [
  { cat: "food", v: 4500 }, { cat: "shopping", v: 8200 },
  { cat: "bills", v: 3100 }, { cat: "transport", v: 1400 },
  { cat: "entertainment", v: 850 }, { cat: "health", v: 1900 },
];

const UPCOMING = [
  { id: "u1", date: "2026-05-28", title: "Tiền thuê nhà", payee: "Vinhomes", amt: -12_000_000 },
  { id: "u2", date: "2026-05-30", title: "Thanh toán thẻ", payee: "67 Bank Platinum", amt: -3_450_000 },
  { id: "u3", date: "2026-06-01", title: "Tiết kiệm tự động", payee: "Wealth Savings", amt: -5_000_000 },
];

// ============== API state (mutable) ==============
// These start as empty arrays and are populated by loadData()
let ACCOUNTS = [];
let TRANSACTIONS = [];

// ============== Map API types to design categories ==============
const mapTxType = (type) => {
  switch (type) {
    case "DEPOSIT":      return "salary";
    case "WITHDRAW":     return "transfer";
    case "TRANSFER_IN":  return "salary";
    case "TRANSFER_OUT": return "transfer";
    default:             return "transfer";
  }
};

// ============== Load real data from Spring Boot API ==============
async function loadData() {
  try {
    const accRes = await fetch("/accounts");
    if (!accRes.ok) return { ok: false, status: accRes.status };

    const apiAccounts = await accRes.json();

    // Map API accounts to design format — CURRENT always before SAVING
    const sorted = [...apiAccounts].sort((a, b) => {
      const order = { CURRENT: 0, SAVING: 1 };
      return (order[a.accountType] ?? 2) - (order[b.accountType] ?? 2);
    });
    ACCOUNTS = sorted.map((a, i) => ({
      id: a.id,
      nameKey: `acc_${a.id}`,
      _nameValue: a.accountType === "CURRENT" ? "Tài khoản thanh toán" : "Tài khoản tiết kiệm",
      number: a.accountNumber.replace(/-/g, " "),
      balance: parseFloat(a.balanceAmount),
      _rawBalance: parseFloat(a.balanceAmount),
      _accountType: a.accountType,
      currency: a.balanceCurrency,
      color: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length],
    }));

    // For each account load transactions
    const txPromises = ACCOUNTS.map(a =>
      fetch(`/accounts/${a.id}/transactions`).then(r => r.ok ? r.json() : [])
    );
    const allTxArrays = await Promise.all(txPromises);

    TRANSACTIONS = allTxArrays.flat().map((tx, idx) => {
      const dt = new Date(tx.occurredAt);
      const dateStr = dt.toISOString().split("T")[0];
      const timeStr = dt.toTimeString().slice(0, 5);
      const isIncoming = tx.type === "DEPOSIT" || tx.type === "TRANSFER_IN";
      const rawAmt = parseFloat(tx.amount);
      return {
        id: tx.id,
        date: dateStr,
        time: timeStr,
        desc: tx.type === "DEPOSIT" ? "Nạp tiền" :
              tx.type === "WITHDRAW" ? "Rút tiền" :
              tx.type === "TRANSFER_IN" ? "Nhận tiền chuyển khoản" :
              "Chuyển tiền",
        cat: mapTxType(tx.type),
        acc: tx.accountId,
        amt: isIncoming ? rawAmt : -rawAmt,
        status: "completed",
      };
    }).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

    return { ok: true };
  } catch (e) {
    return { ok: false, status: 0 };
  }
}

// ============== Dynamic i18n keys for dynamic accounts ==============
function patchI18nForAccounts() {
  ACCOUNTS.forEach(a => {
    I18N.vi[a.nameKey] = a._nameValue;
    I18N.en[a.nameKey] = a._accountType === "SAVING" ? "Savings Account" : "Current Account";
  });
}

// ============== Export ==============
Object.assign(window, {
  Icon, bankLogo,
  ACCOUNTS, SAVED_RECIPIENTS, BANKS, CATEGORIES,
  TRANSACTIONS, CASHFLOW, SPENDING_BY_CAT, UPCOMING,
  fmtVND, fmtUSD, fmtAmount, fmtDate,
  loadData, patchI18nForAccounts,
});
