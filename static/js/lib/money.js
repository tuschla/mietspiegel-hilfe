// Rounding and number formatting. Pure; no DOM.

/** Round half away from zero to `digits` decimals, robust against binary float noise. */
export function round(x, digits = 2) {
  if (x === null || x === undefined || !Number.isFinite(x)) return null;
  const f = 10 ** digits;
  const v = Math.abs(x) * f;
  // 1e-7 absorbs representation error such as 804.9999999999999
  return (Math.sign(x) * Math.round(v + 1e-7)) / f;
}

/** Parse user input: accepts "1.234,56", "1234,56", "1234.56", "1 234,56", "900,-", "1,234,567",
 *  Arabic-Indic digits ("٦٥٠", "۶۵۰٫۵"). Returns null for anything it cannot read safely –
 *  including "1,050", which is 1,05 in German but 1050 in English. */
export function parseNumber(s) {
  if (typeof s === "number") return Number.isFinite(s) ? s : null;
  if (typeof s !== "string") return null;
  let t = s
    .replace(/[\u0660-\u0669]/g, (ch) => String(ch.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (ch) => String(ch.charCodeAt(0) - 0x06f0))
    .replace(/\u066b/g, ",")
    .replace(/[\s\u00a0\u202f\u066c€]/g, "").replace(/m²|m2/gi, "")
    .replace(/[.,][-–—]+$/, ""); // "900,-" / "1.050,–"
  if (!t) return null;
  const lastComma = t.lastIndexOf(","), lastDot = t.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    // the later separator is the decimal separator
    if (lastComma > lastDot) t = t.replace(/\./g, "").replace(",", ".");
    else t = t.replace(/,/g, "");
  } else if (lastComma > -1) {
    if (/^\d{1,3},\d{3}$/.test(t)) return null; // ambiguous: refuse instead of guessing
    if (/^\d{1,3}(,\d{3}){2,}$/.test(t)) t = t.replace(/,/g, ""); // "1,234,567" thousands
    else t = t.replace(",", ".");
  } else if (lastDot > -1 && /^\d{1,3}(\.\d{3})+$/.test(t)) {
    t = t.replace(/\./g, ""); // "1.234" thousands
  }
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

const cache = new Map();
function nf(locale, opts) {
  const key = locale + JSON.stringify(opts);
  if (!cache.has(key)) {
    let f;
    try { f = new Intl.NumberFormat(`${locale}-u-nu-latn`, opts); }
    catch { f = new Intl.NumberFormat("de-DE", opts); }
    cache.set(key, f);
  }
  return cache.get(key);
}

/** "1.234,56 €" (de) or locale-specific; always Latin digits so figures match German documents. */
export function eur(x, locale = "de") {
  if (x === null || x === undefined || !Number.isFinite(x)) return "–";
  return nf(locale, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x);
}

export function num(x, locale = "de", digits = 2) {
  if (x === null || x === undefined || !Number.isFinite(x)) return "–";
  return nf(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(x);
}

export function pct(x, locale = "de", digits = 1) {
  if (x === null || x === undefined || !Number.isFinite(x)) return "–";
  return nf(locale, { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(x);
}

/** ISO date → "17.10.2026" (German letters). */
export function deDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "";
}

/** ISO date → long date in the UI language, Latin digits. */
export function localDate(iso, locale = "de") {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return "–";
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  try {
    return new Intl.DateTimeFormat(`${locale}-u-nu-latn`, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
  } catch {
    return deDate(iso);
  }
}
