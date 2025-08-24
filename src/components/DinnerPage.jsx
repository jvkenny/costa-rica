import { useEffect, useMemo, useState } from "react";
import AnimatedBackground from "./AnimatedBackground";
import Papa from "papaparse";
import { ENTREES, SIDES } from "../data/dinner";

// ---- Configure these three ----
const DINNER_SHEET_NAME = "Dinner";
const ROSTER_DINNER_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1YRtn_hKAm2OlP46XwhaOImenzWFkyW6RGQPGzVw60UA/export?format=csv&gid=1477118801";
// optional: set VITE_APPS_SCRIPT_URL_DINNER in .env, else fallback to your existing endpoint
const SUBMIT_ENDPOINT =
  import.meta.env.VITE_APPS_SCRIPT_URL_DINNER ||
  "https://cr-form-proxy.costaricaform.workers.dev";

function parseCSV(text) {
  return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
}

export default function DinnerPage({ onBack }) {
  // user
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [dietary, setDietary] = useState("");
  const [doneness, setDoneness] = useState("");

  // choices
  const [entree, setEntree] = useState("");
  const [side1, setSide1] = useState("");
  const [side2, setSide2] = useState("");

  // roster
  const [submitting, setSubmitting] = useState(false);
  const [roster, setRoster] = useState([]);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter your name.");
    if (!entree) return alert("Please choose an entree.");

    const payload = {
      sheet: DINNER_SHEET_NAME,
      // keys match your sheet headers exactly:
      "Name": name.trim(),
      "Entree": entree,
      "Side 1": side1 || "",
      "Side 2": side2 || "",
      "Doneness / Sauce": doneness || "",
      "Dietary Needs": dietary || "",
      "Notes": notes || "",
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

      // optimistic add
      setRoster((prev) => [
        ...prev,
        {
          Timestamp: payload.ts,
          Name: payload["Name"],
          Entree: payload["Entree"],
          "Side 1": payload["Side 1"],
          "Side 2": payload["Side 2"],
          "Doneness / Sauce": payload["Doneness / Sauce"],
          "Dietary Needs": payload["Dietary Needs"],
          Notes: payload["Notes"],
        },
      ]);

      // refresh from CSV if configured
      if (ROSTER_DINNER_CSV_URL.startsWith("http")) {
        fetch(`${ROSTER_DINNER_CSV_URL}&_=${Date.now()}`)
          .then((r) => (r.ok ? r.text() : ""))
          .then((txt) => txt && setRoster(parseCSV(txt)))
          .catch(() => {});
      }

      alert("Got it — your dinner choice was recorded!");
      // clear entree/sides if you want:
      // setEntree(""); setSide1(""); setSide2(""); setDoneness(""); setDietary(""); setNotes("");
    } catch (err) {
      console.error(err);
      alert("Sorry, could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        if (!ROSTER_DINNER_CSV_URL.startsWith("http")) return;
        const res = await fetch(ROSTER_DINNER_CSV_URL + `&cb=${Date.now()}`);
        if (res.ok) {
          const text = await res.text();
          setRoster(parseCSV(text));
        }
      } catch {}
    })();
  }, []);

  // simple counts by entree
  const countsByEntree = useMemo(() => {
    const m = new Map();
    for (const r of roster) {
      const e = (r["Entree"] || "").trim();
      const n = (r["Name"] || "").trim();
      if (!e) continue;
      if (!m.has(e)) m.set(e, { count: 0, names: [] });
      m.get(e).count += 1;
      if (n) m.get(e).names.push(n);
    }
    return m;
  }, [roster]);

  return (
    <>
      <AnimatedBackground />
      <div className="container">
        <header className="site-header" style={{ position: "static", marginBottom: 18 }}>
          <div className="site-header__titles">
            <h1 className="site-title">Saturday Dinner Selection</h1>
            <p className="site-subtitle">Pick your entree and sides. One form per person.</p>
          </div>
          <div className="site-explainer">
            This writes to <strong>{DINNER_SHEET_NAME}</strong> in our shared Google Sheet.
          </div>
          <div style={{ marginTop: 10 }}>
            <button className="btn" onClick={onBack}>← Back</button>
          </div>
        </header>

        <div className="info-grid">
          {/* Form */}
          <section className="info-card info-card--span6">
            <div className="kicker">Your Order</div>
            <h2 className="info-title">Choose Dinner</h2>

            <form onSubmit={submit} className="toolbar" style={{ gap: 10 }}>
              <input
                className="input"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label className="input">
                <span style={{ display: "block", fontSize: 12, opacity: 0.8 }}>Entree</span>
                <select
                  value={entree}
                  onChange={(e) => setEntree(e.target.value)}
                  required
                  style={{ width: "100%", border: "none", background: "transparent" }}
                >
                  <option value="" disabled>— select —</option>
                  {ENTREES.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
                <label className="input">
                  <span style={{ display: "block", fontSize: 12, opacity: 0.8 }}>Side 1</span>
                  <select
                    value={side1}
                    onChange={(e) => setSide1(e.target.value)}
                    style={{ width: "100%", border: "none", background: "transparent" }}
                  >
                    <option value="">(none)</option>
                    {SIDES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>

                <label className="input">
                  <span style={{ display: "block", fontSize: 12, opacity: 0.8 }}>Side 2</span>
                  <select
                    value={side2}
                    onChange={(e) => setSide2(e.target.value)}
                    style={{ width: "100%", border: "none", background: "transparent" }}
                  >
                    <option value="">(none)</option>
                    {SIDES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              <input
                className="input"
                placeholder="Doneness / sauce (optional)"
                value={doneness}
                onChange={(e) => setDoneness(e.target.value)}
              />
              <input
                className="input"
                placeholder="Dietary needs (optional)"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
              />
              <input
                className="input"
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="btn-row" style={{ marginTop: 8 }}>
                <button className="btn btn--primary" type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Dinner Choice"}
                </button>
              </div>
            </form>
          </section>

          {/* Roster */}
          <section className="info-card info-card--span6">
            <div className="kicker">Roster</div>
            <h2 className="info-title">Who’s Having What</h2>

            {[...countsByEntree.entries()].map(([entreeName, info]) => (
              <div key={entreeName} className="day__item" style={{ marginBottom: 10 }}>
                <div className="day__item-main">
                  <span className="day__item-name">{entreeName}</span>
                  <span className="badge">{info.count}</span>
                </div>
                {info.names.length > 0 && (
                  <div className="day__item-preferred" style={{ fontSize: 12 }}>
                    {info.names.join(", ")}
                  </div>
                )}
              </div>
            ))}

            {countsByEntree.size === 0 && (
              <div className="muted">No dinner selections yet.</div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
