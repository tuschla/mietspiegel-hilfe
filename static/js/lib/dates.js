// Calendar arithmetic on ISO dates ("YYYY-MM-DD"), timezone-free.
// Pure functions, shared by the browser and tests/run.mjs.

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parse(iso) {
  if (typeof iso !== "string") return null;
  const m = ISO.exec(iso.trim());
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (y < 1900 || mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo)) return null; // y < 1900: half-typed year
  return { y, m: mo, d };
}

export function isValid(iso) {
  return parse(iso) !== null;
}

export function format({ y, m, d }) {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function daysInMonth(y, m) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Month shift without day clamping: returns {y, m} of (date + n months). */
function shiftMonth(y, m, n) {
  const idx = y * 12 + (m - 1) + n;
  return { y: Math.floor(idx / 12), m: (idx % 12 + 12) % 12 + 1 };
}

/** date + n months; a missing day number becomes the last day of the month (§ 188 Abs. 3 BGB). */
export function addMonths(iso, n) {
  const p = parse(iso);
  if (!p) return null;
  const t = shiftMonth(p.y, p.m, n);
  return format({ y: t.y, m: t.m, d: Math.min(p.d, daysInMonth(t.y, t.m)) });
}

export function endOfMonth(iso) {
  const p = parse(iso);
  if (!p) return null;
  return format({ y: p.y, m: p.m, d: daysInMonth(p.y, p.m) });
}

export function startOfNextMonth(iso) {
  const p = parse(iso);
  if (!p) return null;
  const t = shiftMonth(p.y, p.m, 1);
  return format({ y: t.y, m: t.m, d: 1 });
}

/**
 * Apply one date rule from rules.json:
 *   {from, add_months, snap}
 * snap:
 *   none             date + N months (missing day → last day of month)
 *   end_of_month     last day of the month of (date + N months)
 *   start_next_month 1st day of the month after (date + N months)
 *   after_period     first day after a period of N months that started at the beginning of `from`
 *                    (§§ 187 Abs. 2, 188 Abs. 2, 3 BGB): same day number N months later;
 *                    if that day does not exist, the 1st of the following month.
 *   period_from_next_day  last day of a period of N months that starts the day after `from`
 *                    (= after_period(from + 1 day, N) − 1 day; used when one period follows another)
 */
export function applyRule(rule, base) {
  if (!rule || !isValid(base)) return null;
  const n = Number(rule.add_months || 0);
  const snap = rule.snap || "none";
  const p = parse(base);
  const t = shiftMonth(p.y, p.m, n);
  const dim = daysInMonth(t.y, t.m);
  switch (snap) {
    case "none":
      return format({ y: t.y, m: t.m, d: Math.min(p.d, dim) });
    case "end_of_month":
      return format({ y: t.y, m: t.m, d: dim });
    case "start_next_month": {
      const s = shiftMonth(t.y, t.m, 1);
      return format({ y: s.y, m: s.m, d: 1 });
    }
    case "after_period": {
      if (p.d <= dim) return format({ y: t.y, m: t.m, d: p.d });
      const s = shiftMonth(t.y, t.m, 1);
      return format({ y: s.y, m: s.m, d: 1 });
    }
    case "period_from_next_day": {
      const start = addDays(base, 1);
      return addDays(applyRule({ add_months: n, snap: "after_period" }, start), -1);
    }
    default:
      throw new Error(`Unknown snap "${snap}" in rules.json`);
  }
}

export function max(...isos) {
  const v = isos.filter(isValid);
  return v.length ? v.reduce((a, b) => (a > b ? a : b)) : null;
}

export function min(...isos) {
  const v = isos.filter(isValid);
  return v.length ? v.reduce((a, b) => (a < b ? a : b)) : null;
}

/** true if a ≤ iso ≤ b (null bounds are open). */
export function within(iso, from, to) {
  if (!isValid(iso)) return false;
  if (from && iso < from) return false;
  if (to && iso > to) return false;
  return true;
}

export function todayISO(now = new Date()) {
  return format({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() });
}

/** Easter Sunday (Gregorian, anonymous algorithm) as ISO date. */
export function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return format({ y, m: month, d: day });
}

export function addDays(iso, n) {
  const p = parse(iso);
  if (!p) return null;
  const t = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
  return format({ y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() });
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(iso) {
  const p = parse(iso);
  return p ? new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay() : null;
}

/**
 * Public holidays from a data definition (rules.json):
 * {fixed: ["MM-DD"], fixed_since: {"MM-DD": "YYYY-MM-DD" (first date it is a holiday)},
 *  easter_offsets: [days from Easter Sunday], one_off: ["YYYY-MM-DD"]}
 */
export function isHoliday(iso, def) {
  if (!def || !isValid(iso)) return false;
  const y = Number(iso.slice(0, 4)), md = iso.slice(5);
  if ((def.fixed || []).includes(md)) return true;
  const since = (def.fixed_since || {})[md];
  if (since && iso >= since) return true;
  if ((def.one_off || []).includes(iso)) return true;
  const e = easter(y);
  return (def.easter_offsets || []).some((n) => addDays(e, n) === iso);
}

/** § 193 BGB: a last day on Saturday, Sunday or a public holiday moves to the next working day. */
export function nextWorkingDay(iso, def) {
  let d = iso;
  if (!isValid(d)) return null;
  while (weekday(d) === 0 || weekday(d) === 6 || isHoliday(d, def)) d = addDays(d, 1);
  return d;
}
