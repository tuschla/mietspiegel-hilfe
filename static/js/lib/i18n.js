// Text lookup with fallback: current language → German. Pure.

/** Look up a dotted key ("features.bad-m01.title") in nested objects, or a flat key. */
export function lookup(obj, key) {
  if (!obj) return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
  let cur = obj;
  for (const part of key.split(".")) {
    if (cur === null || typeof cur !== "object" || !(part in cur)) {
      // feature ids contain no dots, but tolerate keys like "a.b" inside a level
      return undefined;
    }
    cur = cur[part];
  }
  return cur;
}

/** Interpolate "{name}" with vars. */
export function fill(s, vars = {}) {
  return String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/**
 * Make a translator: t(key, vars) for UI strings (flat), c(key) for content texts (nested).
 * Missing keys fall back to German, then to the key itself (UI) or "" (content).
 */
export function makeI18n({ ui, uiDe, content, contentDe }) {
  const t = (key, vars) => {
    const v = lookup(ui, key) ?? lookup(uiDe, key);
    return v === undefined ? key : fill(v, vars);
  };
  const c = (key, vars) => {
    const v = lookup(content, key) ?? lookup(contentDe, key);
    return v === undefined || v === null ? "" : fill(v, vars);
  };
  return { t, c };
}

/** Split plain text into paragraphs on blank lines. */
export function paragraphs(s) {
  return String(s || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
