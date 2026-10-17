// German letter rendering from static/data/letters.json templates.
// Syntax: {fieldId} placeholder; {?fieldId}…{/fieldId} block kept only if the field is non-empty.
// Pure; no DOM.

import { eur, deDate, num } from "./money.js";

export const BLANK = "__________";

function isEmpty(v) {
  return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
}

/** Format one value for the German letter according to the field type. */
export function formatValue(type, v, featureText = (id) => id) {
  if (isEmpty(v)) return "";
  switch (type) {
    case "money": return eur(typeof v === "number" ? v : Number(v), "de").replace(/[\u00a0\u202f]/g, " ");
    case "area": return `${num(Number(v), "de", 2).replace(/,00$/, "")} m²`;
    case "date": return deDate(v);
    case "features_plus":
    case "features_minus":
    case "features":
      return (Array.isArray(v) ? v : [v]).map((id) => `– ${featureText(id)}`).join("\n");
    default: return String(v).trim();
  }
}

/**
 * @param body    template string (body_de)
 * @param values  {fieldId: raw value}
 * @param types   {fieldId: type}
 * @param featureText  id → official German text
 * @returns {text, missing:[fieldIds rendered as blanks]}
 */
export function render(body, values, types = {}, featureText) {
  const missing = new Set();
  const formatted = (id) => formatValue(types[id] || (typeof values[id] === "number" ? "money" : "text"), values[id], featureText);

  // Optional blocks (non-greedy, may be nested with different ids)
  let text = body;
  let prev;
  do {
    prev = text;
    text = text.replace(/\{\?([\w.-]+)\}([\s\S]*?)\{\/\1\}/g, (_, id, inner) => (formatted(id) ? inner : ""));
  } while (text !== prev);

  text = text.replace(/\{([\w.-]+)\}/g, (_, id) => {
    const v = formatted(id);
    if (v) return v;
    missing.add(id);
    return BLANK;
  });
  // collapse 3+ blank lines left over by removed blocks
  text = text.replace(/\n{3,}/g, "\n\n").trim() + "\n";
  return { text, missing: [...missing] };
}

/** Placeholder ids used in a template body (for tests and form generation). */
export function placeholders(body) {
  const ids = new Set();
  for (const m of body.matchAll(/\{[?/]?([\w.-]+)\}/g)) ids.add(m[1]);
  return [...ids];
}

const FEATURE_TYPES = ["features_plus", "features_minus", "features"];
const NUMERIC = ["money", "area"];

/** Raw value (number or ISO date) → form field text ("650,5" for numbers). */
export function toField(type, v) {
  if (v === undefined || v === null || v === "") return "";
  return NUMERIC.includes(type) ? String(v).replace(".", ",") : String(v);
}

/**
 * Prefill form values from known results. Mutates and returns {values, prefilled}.
 * - a field is filled only if it was never set, or if it still holds our own earlier prefill
 *   (then it follows a changed result, e.g. a new pay date from the checker);
 * - a field the user edited or emptied is never touched again.
 */
export function prefill(fields, values, prefilled, known) {
  for (const f of fields || []) {
    if (FEATURE_TYPES.includes(f.type)) {
      const k = known[f.type];
      if (values[f.id] === undefined && Array.isArray(k)) { values[f.id] = [...k]; prefilled[f.id] = [...k]; }
      continue;
    }
    const k = toField(f.type, known[f.id]);
    const untouched = values[f.id] === undefined || (prefilled[f.id] !== undefined && values[f.id] === prefilled[f.id]);
    if (!untouched) continue;
    const next = k || (values[f.id] === undefined && f.default !== undefined ? String(f.default) : values[f.id]);
    if (next === undefined) continue;
    values[f.id] = next;
    prefilled[f.id] = next;
  }
  return { values, prefilled };
}

/**
 * Values for render(): built-ins first, then the template's own fields. A template field always
 * wins over a built-in of the same id – an emptied field stays empty.
 */
export function letterValues(fields, values, builtins, parseNum) {
  const own = new Set((fields || []).map((f) => f.id));
  const out = {};
  for (const [k, v] of Object.entries(builtins)) if (!own.has(k)) out[k] = v;
  for (const f of fields || []) {
    const v = values[f.id];
    if (v === undefined || v === "" || (Array.isArray(v) && !v.length)) continue;
    out[f.id] = NUMERIC.includes(f.type) ? parseNum(v) : v;
  }
  return out;
}

/**
 * Plausibility of the amounts in consent letters. Returns a list of problem ids:
 * agreed_not_between (partial: current < agreed < demanded), new_over_demanded (consent: new ≤ demanded).
 */
export function amountProblems(tp, v, demanded) {
  const out = [];
  const cur = v.current_rent, agreed = v.agreed_rent, neu = v.new_rent;
  if (tp.kind === "partial" && typeof agreed === "number") {
    if ((typeof cur === "number" && agreed <= cur) || (typeof demanded === "number" && agreed >= demanded)) out.push("agreed_not_between");
  }
  if (tp.kind === "consent" && typeof neu === "number") {
    if ((typeof demanded === "number" && neu > demanded + 0.004) || (typeof cur === "number" && neu <= cur)) out.push("new_over_demanded");
  }
  return out;
}
