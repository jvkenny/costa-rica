// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import AnimatedBackground from "./components/AnimatedBackground";
import OptionPanel from "./components/OptionPanel";
import LandingPage from "./components/LandingPage";
import TipsPage from "./components/TipsPage";
import RulesPage from "./components/RulesPage";
import SignupPage from "./components/SignupPage";
import DinnerPage from "./components/DinnerPage";
import { schedule } from "./data/schedule";
import { timeGuess } from "./utils/time";

export default function App() {
  const [page, setPage] = useState("landing");
  const [prevPage, setPrevPage] = useState(null);
  const [compact, setCompact] = useState(false);
  const [q, setQ] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [isHeaderOpen, setHeaderOpen] = useState(true);
  const [favs, setFavs] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("cr-favs") || "[]"));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    document.body.classList.toggle("compact", compact);
  }, [compact]);

  useEffect(() => {
    localStorage.setItem("cr-favs", JSON.stringify([...favs]));
  }, [favs]);

  function toggleFav(name) {
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  const filteredDays = useMemo(() => {
    const days = schedule || [];
    const qq = q.toLowerCase();

    const applySearch = (it) =>
      !qq ||
      it.name.toLowerCase().includes(qq) ||
      timeGuess(it.name).toLowerCase().includes(qq);

    const applyFav = (it) => !favOnly || favs.has(it.name);

    return days
      .map((d) => ({
        ...d,
        items: d.items.filter((it) => applySearch(it) && applyFav(it)),
      }))
      .filter((d) => d.items.length > 0);
  }, [q, favOnly, favs]);

  const favCount = favs.size;

  const navigate = (p) => {
    setPrevPage(page);
    setPage(p);
  };

  // simple page routing
  if (page === "landing") {
    return (
      <LandingPage
        onEnter={() => setPage("main")}
        onShowTips={() => navigate("tips")}
        onShowRules={() => navigate("rules")}
      />
    );
  }
  if (page === "tips") {
    return <TipsPage onBack={() => setPage(prevPage || "landing")} />;
  }
  if (page === "rules") {
    return <RulesPage onBack={() => setPage(prevPage || "landing")} />;
  }
  if (page === "signup") {
    return <SignupPage onBack={() => setPage(prevPage || "landing")} />;
  }
  if (page === "dinner") {
    setPage(null);
    return null;
  }

  // main schedule view
  return (
    <>
      <AnimatedBackground />
      <div className="container">
        <header className={`site-header ${isHeaderOpen ? "" : "collapsed"}`}>
          <div className="site-header__titles">
            <h1 className="site-title">Costa Rica Trip 2025</h1>
            <p className="site-subtitle">
              So excited for this trip together! This schedule was built from
              everyone's responses to the activity planning sheet.
            </p>
          </div>

          <p className="site-explainer">
            We scheduled a few <strong>Majority Preference activities</strong> by
            popular demand and left the rest as <strong>Open time</strong> for you
            to book (or chill) individually. We’ve shared both the Majority
            Preference picks and Other Preference options with the concierge.
          </p>

          {/* Organized actions: utilities on the left, nav on the right */}
          <div className="site-header__actions">
            <div className="actions__group">
              <input
                className="input"
                placeholder="Search activities (catamaran, coffee, beach...)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button
                className="btn"
                onClick={() => setFavOnly((v) => !v)}
                aria-pressed={favOnly}
              >
                {favOnly ? "Show All" : "Favorites Only"}
                <span className="badge">{favCount}</span>
              </button>
              <button
                className="btn"
                onClick={() => setCompact((c) => !c)}
                aria-pressed={compact}
              >
                {compact ? "Normal Spacing" : "Compact Spacing"}
              </button>
              <button className="btn btn--primary" onClick={() => window.print()}>
                Print / Save PDF
              </button>
            </div>

            <div className="actions__group">
              <div className="legend">
                <span className="tag tag--majority">Majority Preference</span>
                <span className="tag tag--open">Open</span>
                <span className="tag tag--other">Other Preference</span>
                <span className="tag tag--depart">Departure</span>
              </div>
              <button className="btn btn--home" onClick={() => navigate("landing")}>
                🏠 Home
              </button>
              <button className="btn" onClick={() => navigate("tips")}>
                🌴 Tips & Coordination
              </button>
              <button className="btn" onClick={() => navigate("rules")}>
                🛡️ Expectations & Rules
              </button>
              {/* Removed Dinner button */}
            </div>
          </div>

          <button
            className="header-toggle"
            onClick={() => setHeaderOpen((o) => !o)}
            aria-expanded={isHeaderOpen}
          >
            {isHeaderOpen ? "Hide" : "Show"} Info
          </button>
        </header>

        {/* BIG CTAs: keep Activities first, Dinner right next to it */}
        <div className="cta-banner" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn btn--cta"
            onClick={() => navigate("signup")}
            aria-label="Commit to activities and send deposits"
          >
            📝 Commit to Activities — Save Your Spot
          </button>
          {/* Removed Dinner CTA button */}
        </div>

        <OptionPanel
          id="panel-schedule"
          isActive={true}
          days={filteredDays}
          favorites={favs}
          onToggleFavorite={toggleFav}
        />
      </div>
    </>
  );
}
