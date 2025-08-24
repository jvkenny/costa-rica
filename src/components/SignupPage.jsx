import { useEffect, useMemo, useState } from "react";
import AnimatedBackground from "./AnimatedBackground";
import { schedule } from "../data/schedule";
import {
  OPTIONAL_SIGNUPS_KEYS,
  getMetaByKey,
  matchActivityMeta,
  getDepositInfo,
  getFullPriceInfo,
  detectDeposit
} from "../data/deposits";
import Papa from "papaparse";

// 👉 Set these:
const VENMO_USER = "John-Kenny-16";
const SUBMIT_ENDPOINT = "https://cr-form-proxy.costaricaform.workers.dev";
const ROSTER_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-DYvrR3GHNdhO129OGX7ba1Gg4YdBzZf1aB6_yvQewqinyCcM_J3Gf8AahziTqGaknPPGHxR47dUz/pub?output=csv";

function venmoUrl(amount, note) {
  const params = new URLSearchParams({
    txn: "pay",
    audience: "friends",
    recipients: VENMO_USER,
    amount: (amount || 0).toFixed(2),
    note,
  });
  return `https://venmo.com/?${params.toString()}`;
}
// CSV parser using PapaParse
function parseCSV(text) {
  return Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => String(h || "").trim().toLowerCase(),
  }).data;
}

// Simple badge
function Badge({ children, tone = "info" }) {
  const bg =
    tone === "ok" ? "var(--ok-25)" :
    tone === "warn" ? "var(--warn-25)" :
    "var(--primary-10)";
  const color =
    tone === "ok" ? "var(--ok-600)" :
    tone === "warn" ? "var(--warn-700)" :
    "var(--primary-700)";
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 12,
      background: bg,
      color
    }}>{children}</span>
  );
}

function PriceLine({ fullPriceLabel, depositLabel }) {
  return (
    <div className="day__item-preferred" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <span><strong>Total per person:</strong> {fullPriceLabel}</span>
      <span><strong>Deposit:</strong> {depositLabel}</span>
    </div>
  );
}

// Determines if a schedule item is your “Other Preference Sign-Ups (smaller-group items)” row
function isOpenOptionalRow(name) {
  return /other preference sign-ups/i.test(name) || /other preference/i.test(name);
}

export default function SignupPage({ onBack }) {
  // user info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // selections: Map<key, {date, name, depositAmount, depositLabel, fullPriceAmount, fullPriceLabel, reservationBacked}>
  const [selected, setSelected] = useState(new Map());

  // loading + roster
  const [submitting, setSubmitting] = useState(false);
  const [roster, setRoster] = useState([]);

  // Totals
  const totalDeposit = useMemo(() => {
    let t = 0;
    for (const v of selected.values()) t += v.depositAmount || 0;
    return t;
  }, [selected]);

  const { estTotal, hadUnknown } = useMemo(() => {
    let sum = 0;
    let unknown = false;
    for (const v of selected.values()) {
      if (typeof v.fullPriceAmount === "number" && !Number.isNaN(v.fullPriceAmount)) {
        sum += v.fullPriceAmount;
      } else {
        // ranges / unknowns are not included in numeric estimate
        unknown = true;
      }
    }
    return { estTotal: sum, hadUnknown: unknown };
  }, [selected]);

  function toggleTopLevelItem(day, it) {
  const key = `${day.date}::${it.name}`;
  const meta = matchActivityMeta(it.name);
  const { depositAmount, depositLabel } = getDepositInfo(meta);
  const { fullPriceAmount, fullPriceLabel: rawFullLabel } = getFullPriceInfo(meta);
  const safeFullLabel =
    rawFullLabel || (typeof fullPriceAmount === "number" ? `$${fullPriceAmount}` : "TBD");

  setSelected(prev => {
    const next = new Map(prev);
    if (next.has(key)) next.delete(key);
    else
      next.set(key, {
        key,
        date: day.date,
        name: it.name,
        depositAmount,
        depositLabel,
        fullPriceAmount,
        fullPriceLabel: safeFullLabel,
        reservationBacked: !!meta?.reservationBacked,
        variantId: "" // keep column J consistent in the sheet
      });
    return next;
  });
}


  function toggleOptionalSubItem(day, subKey) {
  const meta = getMetaByKey(subKey);
  if (!meta) return;

  const key = `${day.date}::${meta.label}`;
  const { depositAmount, depositLabel } = getDepositInfo(meta);
  const { fullPriceAmount, fullPriceLabel: rawFullLabel } = getFullPriceInfo(meta);
  const safeFullLabel =
    rawFullLabel || (typeof fullPriceAmount === "number" ? `$${fullPriceAmount}` : "TBD");

  setSelected(prev => {
    const next = new Map(prev);
    if (next.has(key)) next.delete(key);
    else
      next.set(key, {
        key,
        date: day.date,
        name: meta.label,
        depositAmount,
        depositLabel,
        fullPriceAmount,
        fullPriceLabel: safeFullLabel,
        reservationBacked: true,
        variantId: "" // keep column J consistent in the sheet
      });
    return next;
  });
}


  async function submitForm(e) {
    e.preventDefault();
    if (!name || !email) {
      alert("Please enter your name and email.");
      return;
    }
    if (selected.size === 0) {
      alert("Please select at least one activity.");
      return;
    }

    const payload = {
      name,
      email,
      phone,
      totalDeposit,           // primary (what you collect)
      total: totalDeposit,    // also send 'total' to satisfy any older/edge deployments
      selections: Array.from(selected.values()).map(s => ({
        date: s.date,
        activity: s.name,
        fullPriceLabel: s.fullPriceLabel || "TBD",
        depositLabel: s.depositLabel,
        depositAmount: s.depositAmount,
        reservationBacked: !!s.reservationBacked,
        variantId: s.variantId ?? ""
      })),
      ts: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      const res = await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || "Submit failed");

      // instant local roster update
      setRoster(prev => {
        const updated = [...prev];
        payload.selections.forEach(s => {
          updated.push({
            timestamp: payload.ts,
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            total: String(payload.totalDeposit),
            date: s.date,
            activity: s.activity,
            depositlabel: s.depositLabel,
            depositamount: String(s.depositAmount || 0),
          });
        });
        return updated;
      });

      // refresh from CSV
      fetch(`${ROSTER_CSV_URL}&_=${Date.now()}`)
        .then(r => (r.ok ? r.text() : ""))
        .then(txt => { if (txt) setRoster(parseCSV(txt)); })
        .catch(() => {});

      alert("Thanks! Your selections were recorded.");
      if (totalDeposit > 0) {
        const note = `CR Trip deposit — ${name || "Guest"}`;
        window.open(venmoUrl(totalDeposit, note), "_blank", "noopener");
      }
    } catch (err) {
      console.error(err);
      alert("Sorry, we could not submit your form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(ROSTER_CSV_URL + `&cb=${Date.now()}`);
        if (res.ok) {
          const text = await res.text();
          const rows = parseCSV(text);
          setRoster(rows);
        }
      } catch {}
    })();
  }, []);

  // group roster by date → activity
  const rosterByDay = useMemo(() => {
    const m = new Map();
    for (const row of roster) {
      const date = row.date || "Unknown";
      const act = row.activity || "";
      const who = row.name || "";
      if (!m.has(date)) m.set(date, new Map());
      const inner = m.get(date);
      if (!inner.has(act)) inner.set(act, new Set());
      inner.get(act).add(who);
    }
    return m;
  }, [roster]);

  return (
    <>
      <AnimatedBackground />
      <div className="container">
        {/* Header */}
        <header className="site-header" style={{ position: "static", margin: "0 0 18px" }}>
          <div className="site-header__titles">
            <h1 className="site-title">Activity Sign-Ups & Deposits</h1>
            <p className="site-subtitle">
              We built a schedule that locks in the <strong>Majority Preference activities most of us want</strong> while leaving plenty of open time to make the trip your own.
            </p>
          </div>

          <div className="site-explainer" style={{ marginTop: 8, lineHeight: 1.5 }}>
            If you pick one of the <strong>Other Preference small-group items we’re reserving now</strong> (below),
            we’ll include it in our concierge reservation and collect a deposit here. For other ideas beyond the Majority Preference picks,
            we can share contact info to self-book—or tell us and we’ll see if we can add it.
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone="ok">Reservation-backed Other Preference items: Mangrove • Waterfall Rappelling • Surf Lessons • Jungle Tubing</Badge>
          </div>
        </header>

        {/* 3-column layout */}
        <div className="info-grid">
          {/* Column 1: Schedule + selections, with other-preference checklist where applicable */}
          <section className="info-card info-card--span4">
            <div className="kicker">Step 1</div>
            <h2 className="info-title">Choose Activities</h2>

            <div className="days-grid">
              {schedule.map(day => (
                <div className="day" key={day.date}>
                  <h3 className="day__title">{day.date}</h3>
                  <div className="day__list">
                    {day.items.map((it, idx) => {
                      // Non-selectable info rows
                      if (/arrival|departure/i.test(it.name)) {
                        return (
                          <div key={idx} className="day__item">
                            <div className="day__item-main">
                              <span className="day__item-name">{it.name}</span>
                            </div>
                          </div>
                        );
                      }

                      // Optional checklist block
                      if (isOpenOptionalRow(it.name)) {
                        return (
                          <div key={idx} className="day__item" style={{ display: "block" }}>
                            <div className="day__item-main" style={{ alignItems: "flex-start" }}>
                              <span className="day__item-name">{it.name}</span>
                              <div style={{ marginTop: 6 }}><Badge tone="ok">We’ll reserve these if you check them</Badge></div>
                            </div>

                            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                              {OPTIONAL_SIGNUPS_KEYS.map(subKey => {
                                const meta = getMetaByKey(subKey);
                                if (!meta) return null;
                                const selKey = `${day.date}::${meta.label}`;
                                const isSelected = selected.has(selKey);
                                const { depositLabel } = getDepositInfo(meta);
                                const { fullPriceLabel } = getFullPriceInfo(meta);

                                return (
                                  <label key={subKey} className="day__item" style={{ cursor: "pointer", margin: 0 }}>
                                    <div className="day__item-main" style={{ alignItems: "flex-start" }}>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleOptionalSubItem(day, subKey)}
                                        style={{ marginRight: 10, marginTop: 2 }}
                                      />
                                      <span className="day__item-name">{meta.label}</span>
                                    </div>
                                    <PriceLine fullPriceLabel={fullPriceLabel} depositLabel={depositLabel} />
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      // Regular selectable (if any other rows you want selectable)
                      const key = `${day.date}::${it.name}`;
                      const isSelected = selected.has(key);
                      const meta = matchActivityMeta(it.name);
                      const { depositLabel } = getDepositInfo(meta);
                      const { fullPriceLabel } = getFullPriceInfo(meta);

                      return (
                        <label key={idx} className="day__item" style={{ cursor: "pointer" }}>
                          <div className="day__item-main" style={{ alignItems: "flex-start" }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTopLevelItem(day, it)}
                              style={{ marginRight: 10, marginTop: 2 }}
                            />
                            <span className="day__item-name">{it.name}</span>
                          </div>
                          <PriceLine fullPriceLabel={fullPriceLabel} depositLabel={depositLabel} />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Column 2: Your info + totals */}
          <section className="info-card info-card--span4">
            <div className="kicker">Step 2</div>
            <h2 className="info-title">Your Info & Deposits</h2>

            <form onSubmit={submitForm}>
              <div className="toolbar" style={{ marginTop: 0 }}>
                <input className="input" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
                <input className="input" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input className="input" placeholder="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              <div className="day__item" style={{ marginTop: 8 }}>
                <div className="day__item-main">
                  <span className="day__item-name">Selected Activities</span>
                  <span className="time-pill">Deposit Total ${totalDeposit.toFixed(2)}</span>
                </div>

                {/* NEW: Estimated Total (per person) */}
                <div className="day__item-preferred" style={{ marginTop: 6 }}>
                  <strong>Estimated Total (per person):</strong> ${estTotal.toFixed(2)}
                  {hadUnknown && (
                    <span className="muted" style={{ marginLeft: 8 }}>
                      (excludes items with range/unknown pricing)
                    </span>
                  )}
                </div>

                <div className="day__item-preferred" style={{ marginTop: 6 }}>
                  {selected.size === 0 ? (
                    <em>No selections yet.</em>
                  ) : (
                    Array.from(selected.values()).map((s, i) => (
                      <div key={i} style={{ marginTop: 6 }}>
                        <strong>{s.date}</strong> — {s.name}
                        <span style={{ marginLeft: 8 }}>{s.fullPriceLabel}</span>
                        <span style={{ marginLeft: 8, color: "var(--muted)" }}>
                          Deposit: {s.depositLabel}
                        </span>{" "}
                        {s.reservationBacked ? <Badge tone="ok">Reserved</Badge> : <Badge>Self-book</Badge>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="btn-row">
                <a
                  className="btn btn--primary"
                  aria-disabled={totalDeposit <= 0}
                  onClick={e => {
                    if (totalDeposit <= 0) { e.preventDefault(); return; }
                    const note = `CR Trip deposit — ${name || "Guest"}`;
                    window.open(venmoUrl(totalDeposit, note), "_blank", "noopener");
                  }}
                  href={totalDeposit > 0 ? venmoUrl(totalDeposit, `CR Trip deposit — ${name || "Guest"}`) : undefined}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Venmo ${totalDeposit.toFixed(2)}
                </a>
                <button className="btn btn--rules" type="submit" disabled={submitting || selected.size === 0}>
                  {submitting ? "Submitting…" : "Submit Selections"}
                </button>
              </div>

              <p className="muted" style={{ marginTop: 8 }}>
                By submitting, you agree that your spot is held once deposit is received. Some tours may have stricter cancellation terms.
              </p>
            </form>
          </section>

          {/* Column 3: Live roster */}
          <section className="info-card info-card--span4">
            <div className="kicker">Roster</div>
            <h2 className="info-title">Who’s Signed Up</h2>

            {schedule.map(day => {
              const byActivity = rosterByDay.get(day.date);
              return (
                <div className="day" key={day.date}>
                  <h3 className="day__title">{day.date}</h3>
                  <div className="day__list">
                    {day.items.map((it, idx) => {
                      const peopleSet = byActivity?.get(it.name) ?? new Set();
                      const people = Array.from(peopleSet);
                      return (
                        <div key={idx} className="day__item">
                          <div className="day__item-main">
                            <span className="day__item-name">{it.name}</span>
                            <span className="badge">{peopleSet.size}</span>
                          </div>
                          {people.length > 0 && (
                            <div className="day__item-preferred" style={{ fontSize: 12 }}>
                              {people.join(", ")}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </div>
    </>
  );
}
