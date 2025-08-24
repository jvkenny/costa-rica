export const timeOrder = [
  "Early",
  "Morning",
  "Midday",
  "Afternoon",
  "Day",
  "Day (flex)",
  "Any",
  "Dinner",
  "Evening",
];

export function timeGuess(name = "") {
  const a = String(name).toLowerCase();

  if (a.includes("night")) return "Evening";
  if (a.includes("evening")) return "Evening";
  if (a.includes("early")) return "Early";
  if (a.includes("morning")) return "Morning";
  if (a.includes("coffee")) return "Morning";
  if (a.includes("manuel antonio")) return "Day";
  if (a.includes("catamaran")) return "Midday";
  if (a.includes("beach")) return a.includes("flex") ? "Day (flex)" : "Day";
  if (a.includes("chef")) return "Dinner";
  if (a.includes("dinner")) return "Dinner";
  if (a.includes("rappell") || a.includes("rappel")) return "Morning";
  if (a.includes("mangrove")) return "Morning";
  if (a.includes("chocolate")) return "Afternoon";

  return "Any";
}
