// src/components/OptionPanel.jsx
import React from "react";

function classify(name = "") {
  const n = name.toLowerCase();
  if (n.includes("departure")) return { kind: "depart", label: "Departure" };
  if (n.includes("majority preference"))
    return { kind: "majority", label: "Majority Preference" };
  if (n.includes("other preference"))
    return { kind: "other", label: "Other Preference" };
  if (/—\s*open\b/i.test(name) || n.endsWith(" — Open".toLowerCase())) {
    return { kind: "open", label: "Open" };
  }
  return { kind: "plain", label: null };
}

export default function OptionPanel({
  id,
  isActive,
  days = [],
  favorites = new Set(),
  onToggleFavorite = () => {},
}) {
  if (!isActive) return null;

  return (
    <section id={id}>
      <div className="days-grid">
        {days.map((day) => (
          <div className="day" key={day.date}>
            <h3 className="day__title">{day.date}</h3>

            <div className="day__list">
              {day.items.map((it, idx) => {
                const faved = favorites.has(it.name);
                const { kind, label } = classify(it.name);

                return (
                  <div
                    key={idx}
                    className={`day__item item--${kind} ${faved ? "faved" : ""}`}
                    style={{ wordBreak: "break-word" }}
                  >
                    <div className="day__item-main" style={{ alignItems: "flex-start" }}>
                      <span className="day__item-name" style={{ fontWeight: 800, whiteSpace: "pre-wrap" }}>
                        {it.name}
                      </span>

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {label && <span className={`tag tag--${kind}`}>{label}</span>}
                        <button
                          className="fav"
                          aria-pressed={faved}
                          onClick={() => onToggleFavorite(it.name)}
                          title={faved ? "Remove favorite" : "Add favorite"}
                        >
                          {faved ? "❤" : "♡"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
