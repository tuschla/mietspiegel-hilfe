// Wohnlage lookup: address → einfach / mittel / gut, from static/data/wohnlage-<year>.json.
// The data is the official list "Wohnlagen nach Adressen zum Berliner Mietspiegel <year>"
// (SenStadt Berlin, Datenlizenz Deutschland – Zero – 2.0), compressed by tools/build_wohnlage.py;
// the file format is documented there. Pure; no DOM, no network: the page fetches the JSON
// from the site itself and passes it to prepare(). Addresses never leave the browser.
//
//   const idx = prepare(json);
//   suggest(idx, "Tabor")              → [{ street: "Taborstraße", plzs: ["10997"], bezirke: [...] }]
//   lookup(idx, "Taborstr.", "6", "10997") → { found: true, wohnlage: "mittel", stadtteil: "West", ... }

export const WOHNLAGEN = ["einfach", "mittel", "gut"];
const WL_LETTER = { e: "einfach", m: "mittel", g: "gut" };
const collator = new Intl.Collator("de");

const digitsLatin = (s) => s
  .replace(/[\u0660-\u0669]/g, (ch) => String(ch.charCodeAt(0) - 0x0660))
  .replace(/[\u06f0-\u06f9]/g, (ch) => String(ch.charCodeAt(0) - 0x06f0));

// lower case, ß → ss, umlauts → ae/oe/ue (so "Müllerstr" and "Muellerstr" both match),
// other accents dropped (é → e), every form of "Straße" at a word end → "str"
function fold(s) {
  return digitsLatin(String(s ?? ""))
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/str(?:asse|\.)?(?![a-z])/g, "str");
}

/** Loose key: case, ß/ss, umlauts, "Straße/Str./str" and all spaces, hyphens and dots ignored. */
export function normalizeStreet(s) {
  return fold(s).replace(/[^a-z0-9]+/g, "");
}

/** Tight key: like normalizeStreet, but word breaks (space, hyphen) count; separates
 *  "Dessauer Straße" from "Dessauerstraße". */
function tightKey(s) {
  return fold(s).replace(/[^a-z0-9]+/g, " ").trim();
}

/** "12", "12a", "12 A", "012A", "12-14" (first number), "١٢" → { num: 12, suffix: "A" }; else null. */
export function parseHouseNumber(s) {
  const m = /^\s*0*(\d+)\s*([a-z])?\s*(?:[-–/,+].*)?$/i.exec(digitsLatin(String(s ?? "")));
  if (!m) return null;
  return { num: Number(m[1]), suffix: (m[2] || "").toUpperCase() };
}

export const formatHnr = (num, suffix = "") => `${num}${suffix}`;

/** Build the lookup index from the parsed JSON file (once per edition). */
export function prepare(data) {
  const entries = data.streets.map(([street, plz, bez, st, runs]) => ({
    street, plz, bezirk: data.bez[bez], stadtteil: data.st[st], runs, tight: "", tokens: null,
  }));
  const byKey = new Map();
  const names = new Map(); // street name → { street, key, tight, starts, plzs, bezirke }
  for (const e of entries) {
    let n = names.get(e.street);
    if (!n) {
      const tight = tightKey(e.street);
      const words = tight.split(" ");
      // loose keys from every later word start, for "Marx" → "Karl-Marx-Allee"
      const starts = words.slice(1).map((_, i) => words.slice(i + 1).join(""));
      names.set(e.street, n = { street: e.street, key: words.join(""), tight, starts, plzs: new Set(), bezirke: new Set() });
    }
    e.tight = n.tight;
    if (!byKey.has(n.key)) byKey.set(n.key, []);
    byKey.get(n.key).push(e);
    n.plzs.add(e.plz);
    n.bezirke.add(e.bezirk);
  }
  const list = [...names.values()].sort((a, b) => collator.compare(a.street, b.street));
  return {
    edition: data.edition, title: data.title, source: data.source, licence: data.licence,
    fetched: data.fetched, counts: data.counts, entries, byKey, names: list,
  };
}

// Prefix typed so far: a half-typed "Stra", "Straß", "Strass" also counts as "str".
const prefixKey = (s) => normalizeStreet(s).replace(/str(?:a|as|ass|asse)?$/, "str");

/** Street names for a typed prefix: names starting with it first, then names with a later word
 *  starting with it, each group alphabetical. → [{ street, plzs: [...], bezirke: [...] }] */
export function suggest(idx, prefix, limit = 10) {
  const p = prefixKey(prefix);
  if (!p) return [];
  const first = [], later = [];
  for (const n of idx.names) {
    if (n.key.startsWith(p)) first.push(n);
    else if (n.starts.some((k) => k.startsWith(p))) later.push(n);
    if (first.length >= limit) break;
  }
  return first.concat(later).slice(0, limit).map((n) => ({
    street: n.street, plzs: [...n.plzs].sort(), bezirke: [...n.bezirke].sort(),
  }));
}

function tokens(e) {
  if (e.tokens) return e.tokens;
  let wl = null;
  e.tokens = e.runs.split(",").map((t) => {
    const m = /^([emg])?(\d+)([A-Z])?(?:([-:])(\d+|[A-Z]))?$/.exec(t);
    if (!m) throw new Error(`wohnlage: bad token ${t} in ${e.street} ${e.plz}`);
    if (m[1]) wl = WL_LETTER[m[1]];
    const a = Number(m[2]);
    if (m[3]) return { wl, a, b: a, step: 1, sx: m[3], sy: m[5] || m[3] };
    const b = m[5] ? Number(m[5]) : a;
    return { wl, a, b, step: m[4] === ":" ? 2 : 1, sx: "", sy: "" };
  });
  return e.tokens;
}

/** Wohnlage of one address in one entry, or null if the entry has no such address. */
function find(e, num, suffix) {
  for (const t of tokens(e)) {
    if (suffix ? t.sx && t.a === num && suffix >= t.sx && suffix <= t.sy
      : !t.sx && num >= t.a && num <= t.b && (num - t.a) % t.step === 0) return t.wl;
  }
  return null;
}

/** All addresses of an entry with this number, any suffix. */
function variants(e, num) {
  const out = [];
  for (const t of tokens(e)) {
    if (t.sx && t.a === num) {
      for (let c = t.sx.charCodeAt(0); c <= t.sy.charCodeAt(0); c++) out.push({ suffix: String.fromCharCode(c), wl: t.wl });
    } else if (!t.sx && num >= t.a && num <= t.b && (num - t.a) % t.step === 0) out.push({ suffix: "", wl: t.wl });
  }
  return out;
}

const place = (e, hnr, wohnlage) => ({ street: e.street, plz: e.plz, bezirk: e.bezirk, stadtteil: e.stadtteil, hnr, wohnlage });

/** Look up an address.
 *  street: as typed; number: house number with optional letter ("6", "12a"); plz: optional.
 *  Returns {
 *    found        true if exactly one address matches, or several that all have the same
 *                 Wohnlage and Stadtteil (then ambiguous is also true)
 *    wohnlage     "einfach" | "mittel" | "gut" | null
 *    stadtteil    "Ost" | "West" | null   (Mietspiegel Baualter 1973–1990 split)
 *    street, plz, bezirk  of the match, official spelling; null if none or ambiguous
 *    hnr          house number as read ("12A"), set whenever found is true
 *    ambiguous    true if the address exists in several PLZ / same-named streets
 *    candidates   matching addresses [{ street, plz, bezirk, stadtteil, hnr, wohnlage }]
 *    notFound     null | "street" | "plz" (street not in that PLZ) | "number" (no such address)
 *    invalidNumber  true if the house number could not be read
 *    plzs         PLZ where the street name exists (sorted), [] if the street is unknown
 *    near         notFound "number": same number with other suffixes [{ ..., hnr, wohnlage }]
 *    streetWohnlagen  Wohnlagen present in the searched street entries (sorted einfach→gut)
 *  } */
export function lookup(idx, street, number, plz = "") {
  const res = {
    found: false, wohnlage: null, stadtteil: null, street: null, plz: null, bezirk: null, hnr: null,
    ambiguous: false, candidates: [], notFound: null, invalidNumber: false, plzs: [], near: [], streetWohnlagen: [],
  };
  let es = idx.byKey.get(normalizeStreet(street)) || [];
  // same loose key, different names ("Dessauer Straße" / "Dessauerstraße"): prefer the one typed
  if (new Set(es.map((e) => e.street)).size > 1) {
    const tk = tightKey(street);
    const exact = es.filter((e) => e.tight === tk);
    if (exact.length) es = exact;
  }
  if (!es.length) { res.notFound = "street"; return res; }
  res.plzs = [...new Set(es.map((e) => e.plz))].sort();
  const p = digitsLatin(String(plz ?? "")).replace(/\s+/g, "");
  if (p) {
    es = es.filter((e) => e.plz === p);
    if (!es.length) { res.notFound = "plz"; return res; }
  }
  const wls = new Set();
  for (const e of es) for (const t of tokens(e)) wls.add(t.wl);
  res.streetWohnlagen = WOHNLAGEN.filter((w) => wls.has(w));
  const hn = parseHouseNumber(number);
  if (!hn) { res.invalidNumber = true; res.notFound = "number"; return res; }
  const hnr = formatHnr(hn.num, hn.suffix);
  for (const e of es) {
    const wl = find(e, hn.num, hn.suffix);
    if (wl) res.candidates.push(place(e, hnr, wl));
  }
  if (!res.candidates.length) {
    res.notFound = "number";
    for (const e of es) for (const v of variants(e, hn.num)) res.near.push(place(e, formatHnr(hn.num, v.suffix), v.wl));
    return res;
  }
  const c = res.candidates;
  res.ambiguous = c.length > 1;
  if (!res.ambiguous) Object.assign(res, c[0], { found: true });
  else if (c.every((x) => x.wohnlage === c[0].wohnlage && x.stadtteil === c[0].stadtteil)) {
    Object.assign(res, { found: true, wohnlage: c[0].wohnlage, stadtteil: c[0].stadtteil, hnr });
  }
  return res;
}
