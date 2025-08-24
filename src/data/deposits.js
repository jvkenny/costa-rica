// deposits.js

// Normalize helper
const norm = s => String(s || "").trim().toLowerCase();

// These four are the “Other Preference Sign-Ups we’ll reserve now”
export const OPTIONAL_SIGNUPS_KEYS = [
  "damas island mangrove",
  "waterfall rappelling",
  "surf lessons",
  "jungle tubing",
];

// Catalog: use fixed prices when we have them; ranges become text (no numeric total)
export const activityCatalog = [
  {
    key: "damas island mangrove",
    aliases: ["mangrove", "damas mangrove"],
    label: "Damas Island Mangrove Tour",
    reservationBacked: true,
    price: 75, // default to Day price
    priceText: "$75 Day (Night $85 available)",
    deposit: 20,
  },
  {
    key: "waterfall rappelling",
    aliases: ["adventure park tour", "rappel"],
    label: "Waterfall Rappelling Adventure Park Tour",
    reservationBacked: true,
    // leave numeric price unset to keep it out of the numeric estimate (since it's a range)
    priceText: "$100–$140 (depends on company)",
    deposit: 25,            // collect $25 now; may adjust $5 later if company requires $30
    depositRange: [25, 30],
  },
  {
    key: "surf lessons",
    aliases: ["surf lesson"],
    label: "Surf Lessons",
    reservationBacked: true,
    price: 90, // default to Full lesson
    priceText: "$90 (Full). 'No Frills' $55 available",
    deposit: 20,
  },
  {
    key: "jungle tubing",
    aliases: ["tubing"],
    label: "Jungle Tubing on the Savegre River",
    reservationBacked: true,
    price: 110,
    priceText: "$110",
    deposit: 20,
  },

  // Majority/common items so detectDeposit() still works nicely
  {
    key: "public catamaran",
    aliases: ["public catamaran tour", "catamaran (public)"],
    label: "Public Catamaran Tour",
    price: 89, // pick 89 adult; change to 80 if you prefer
    priceText: "$80–$89 adult (kids 5–10 $55, under 5 $10)",
    deposit: 25,
  },
  {
    key: "manuel antonio national park",
    aliases: ["ma national park", "manuel antonio park"],
    label: "Manuel Antonio National Park Tour",
    deposit: 10,
    priceText: "$55–$65 adult / $45–$55 child under 11 / free under 2",
  },
  {
    key: "coffee tour",
    aliases: [],
    label: "Coffee Tour",
    deposit: 20,
    priceText: "Varies by operator",
  },
  {
    key: "bird watching",
    aliases: ["birdwatching"],
    label: "Bird Watching (early)",
    deposit: 20,
    priceText: "Varies by operator",
  },
  {
    key: "private chef dinner",
    aliases: ["chef dinner", "villa chef"],
    label: "Private Chef Dinner (villa)",
    deposit: 0,
    priceText: "Menu-priced",
  },
];

// Find catalog entry by schedule item name (checks key OR aliases with substring matching)
export function matchActivityMeta(itemName) {
  const n = norm(itemName);
  return (
    activityCatalog.find(
      c => n.includes(c.key) || (c.aliases || []).some(a => n.includes(a))
    ) || null
  );
}

// Direct access by canonical key
export function getMetaByKey(key) {
  const n = norm(key);
  return activityCatalog.find(c => c.key === n) || null;
}

// Deposit descriptor
export function getDepositInfo(meta) {
  if (!meta) return { depositAmount: 0, depositLabel: "TBD" };

  if (Array.isArray(meta.depositRange) && meta.depositRange.length === 2) {
    const [min, max] = meta.depositRange;
    return {
      depositAmount: Number(min) || 0,
      depositLabel: `$${min}–$${max}`,
    };
  }

  const amt = Number(meta.deposit || 0) || 0;
  return { depositAmount: amt, depositLabel: amt ? `$${amt}` : "TBD" };
}

// Full price descriptor (numeric when possible, else text)
export function getFullPriceInfo(meta) {
  if (!meta) return { fullPriceAmount: null, fullPriceLabel: "TBD" };

  if (typeof meta.price === "number") {
    const label = `$${meta.price}` + (meta.priceText ? ` (${meta.priceText})` : "");
    return { fullPriceAmount: meta.price, fullPriceLabel: label };
  }

  if (meta.priceText) {
    return { fullPriceAmount: null, fullPriceLabel: meta.priceText };
  }

  return { fullPriceAmount: null, fullPriceLabel: "TBD" };
}

// Back-compat helper your code already imports
export function detectDeposit(itemName) {
  const meta = matchActivityMeta(itemName);
  const { depositAmount } = getDepositInfo(meta);
  return meta ? { label: meta.label, amount: depositAmount } : null;
}
