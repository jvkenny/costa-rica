import { memo } from "react";
import { motion } from "framer-motion";
import { timeGuess } from "../utils/time";

const emojiFor = (slot) => ({
  Early: "🌅", Morning: "☕", Midday: "🌞", Afternoon: "🏖️",
  Day: "🌴", "Day (flex)": "🦥", Any: "🧭", Dinner: "🍽️", Evening: "🌙",
}[slot] || "🧭");

function DayCard({ date, items = [], favorites, onToggleFavorite }) {
  return (
    <motion.section
      className="day"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .22 }}
      layout
    >
      <h2 className="day__title">{date}</h2>
      <ul className="day__list">
        {items.map((item, i) => {
          const slot = timeGuess(item.name);
          const isFav = favorites?.has(item.name);
          return (
            <motion.li
              key={`${date}-${item.name}-${i}`}
              className={`day__item${isFav ? " faved" : ""}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .18, delay: i * .02 }}
              layout
            >
              <div className="day__item-main">
                <span className="day__item-name">
                  {item.name}
                  {onToggleFavorite && (
                    <button
                      className="fav"
                      aria-pressed={!!isFav}
                      title={isFav ? "Remove favorite" : "Mark favorite"}
                      onClick={() => onToggleFavorite(item.name)}
                    >
                      {isFav ? "💖" : "🤍"}
                    </button>
                  )}
                </span>
                <span className="time-pill">{emojiFor(slot)}&nbsp;{slot}</span>
              </div>
              {Array.isArray(item.preferred) && item.preferred.length > 0 && (
                <div className="day__item-preferred">
                  Preferred by: {item.preferred.join(", ")}
                </div>
              )}
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}

export default memo(DayCard);
