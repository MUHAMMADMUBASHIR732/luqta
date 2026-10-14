import { illustrate } from "../../lib/illustrations.js";
import { generateMatches } from "./matching.js";

export const DEMO_PASSWORD = "demo1234";

export const demoAccounts = [
  { email: "finder@luqta.demo", name: "Hamza Qureshi", role: "Finder" },
  { email: "owner@luqta.demo", name: "Sana Malik", role: "Owner" },
];

const hoursAgo = (h) => new Date(Date.now() - h * 3600_000).toISOString();

const user = (id, name, email, phone) => ({ id, name, email, password: DEMO_PASSWORD, phone, trustScore: 100 });

function lost(id, userId, category, color, brand, description, place, lat, lng, hours, features, photo = true) {
  return {
    id,
    type: "lost",
    userId,
    imageUrl: photo ? illustrate(category, color) : null,
    attributes: { category, color, brand, features },
    category,
    color,
    brand,
    location: { lat, lng, label: place },
    dateTime: hoursAgo(hours),
    description,
    status: "open",
    analyzed: true,
    createdAt: hoursAgo(hours - 0.5),
  };
}

export function buildSeed() {
  const users = [
    user("u-finder", "Hamza Qureshi", "finder@luqta.demo", "+92 300 1234567"),
    user("u-owner", "Sana Malik", "owner@luqta.demo", "+92 321 7654321"),
    user("u-bilal", "Bilal Ahmed", "bilal@luqta.demo", "+92 333 1112233"),
    user("u-hira", "Hira Khan", "hira@luqta.demo", "+92 345 2223344"),
    user("u-omar", "Omar Sheikh", "omar@luqta.demo", "+92 312 3334455"),
    user("u-zara", "Zara Ali", "zara@luqta.demo", "+92 301 4445566"),
  ];

  const items = [
    lost("l-owner-bag", "u-owner", "backpack", "black", "Nike",
      "Black Nike backpack with a red keychain on the zip and a laptop sleeve inside. Small tear near the bottom strap.",
      "Dolmen Mall Clifton", 24.8018, 67.0309, 20, ["red keychain", "laptop sleeve", "torn strap"]),
    lost("l-owner-wallet", "u-owner", "wallet", "brown", "",
      "Brown leather wallet with my student card and a folded Rs. 500 note. Gold clasp on the front.",
      "Karachi University", 24.9456, 67.1186, 30, ["student card", "gold clasp"], false),
    lost("l-bilal-laptop", "u-bilal", "laptop", "silver", "Dell",
      "Silver Dell laptop in a grey sleeve. There is a cricket team sticker on the lid.",
      "NED University", 24.9298, 67.1136, 41, ["grey sleeve", "cricket sticker"]),
    lost("l-hira-keys", "u-hira", "keys", "silver", "",
      "Bunch of three keys on a blue carabiner with a small flag tag.",
      "Saddar Metro Station", 24.8546, 67.0225, 12, ["blue carabiner", "flag tag"]),
    lost("l-omar-phone", "u-omar", "phone", "black", "Samsung",
      "Black Samsung phone with a cracked corner and a blue case. The lock screen shows a mountain photo.",
      "Hyderi Market", 24.9333, 67.0412, 55, ["blue case", "cracked corner"], false),
    lost("l-zara-umbrella", "u-zara", "umbrella", "blue", "",
      "Navy blue umbrella with a wooden handle. Left it near the cafe entrance.",
      "Port Grand", 24.8465, 66.9996, 26, ["wooden handle"]),
    lost("l-bilal-bottle", "u-bilal", "bottle", "green", "Hydro Flask",
      "Dark green steel bottle with a few dents and a small mountain sticker.",
      "Bahria Town Karachi", 25.0245, 67.3104, 18, ["dents", "mountain sticker"]),
    lost("l-hira-earphones", "u-hira", "earphones", "white", "",
      "White earbuds in a scratched case with a pink strap.",
      "Jinnah International Airport", 24.9065, 67.1608, 33, ["pink strap", "scratched case"]),
  ];

  const found = {
    id: "f-finder-bag",
    type: "found",
    userId: "u-finder",
    imageUrl: illustrate("backpack", "black"),
    attributes: { category: "backpack", color: "black", features: ["red keychain"] },
    category: "backpack",
    color: "black",
    brand: null,
    location: { lat: 24.8018, lng: 67.0309, label: "Dolmen Mall Clifton" },
    dateTime: hoursAgo(3),
    description: "Found a black backpack on a bench near the food court. It has a red keychain on the zip.",
    status: "open",
    analyzed: true,
    createdAt: hoursAgo(2.8),
  };
  items.unshift(found);

  const state = { users, items, matches: [], claims: [], notifications: [] };
  state.matches = generateMatches(state, found);
  return state;
}
