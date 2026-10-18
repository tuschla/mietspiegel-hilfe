// § 558 BGB rent-increase check. Implements static/data/rules.json mechanically:
// all periods, rates and validity dates come from that file; this module only combines them.
// Pure functions, shared by pruefen.js (browser) and tests/run.mjs.

import { addMonths, applyRule, isValid, max, nextWorkingDay, within } from "./dates.js";
import { round } from "./money.js";

/**
 * Resolve all rules.dates entries; entries may reference each other via "from".
 * Entries with shift_193 = "apply" move a last day on Saturday, Sunday or a Berlin public holiday
 * (rules.holidays_berlin) to the next working day (§ 193 BGB); the computed date is kept as `<key>_unshifted`.
 */
export function resolveDates(rules, base) {
  const defs = rules.dates || {};
  const out = { ...base };
  const busy = new Set();
  const get = (key) => {
    if (key in out) return out[key];
    if (!(key in defs) || busy.has(key)) return null; // unknown input or circular reference
    busy.add(key);
    const from = get(defs[key].from);
    const raw = isValid(from) ? applyRule(defs[key], from) : null;
    if (defs[key].shift_193 === "apply") {
      out[`${key}_unshifted`] = raw;
      out[key] = raw ? nextWorkingDay(raw, rules.holidays_berlin) : null;
    } else {
      out[key] = raw;
    }
    return out[key];
  };
  for (const key of Object.keys(defs)) get(key);
  return out;
}

/** Mietspiegel edition in force on `iso` (by validity dates in rules.json). */
export function chooseMietspiegel(rules, iso) {
  if (!isValid(iso)) return null;
  const hit = (rules.mietspiegel || []).find((m) => within(iso, m.valid_from, m.valid_to));
  return hit ? hit.year : null;
}

/** Kappungsgrenze rate and its source for the reference date. */
export function kappungRate(rules, iso) {
  const k = rules.kappung || {};
  const hit = isValid(iso) ? (k.rates || []).find((r) => within(iso, r.valid_from, r.valid_to)) : null;
  return hit ? { rate: hit.rate, source: hit.source } : { rate: k.default_rate, source: k.default_source };
}

function numOrNull(x) {
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}

/**
 * Window in which a court may also use a newer Mietspiegel (survey date before receipt, not yet in force):
 * rules.mietspiegel_choice.contested_window {from, to, also_year}. Returns also_year or null.
 */
export function contestedYear(rules, iso) {
  const w = (rules.mietspiegel_choice || {}).contested_window;
  return w && isValid(iso) && within(iso, w.from, w.to) ? w.also_year : null;
}

/** Euro cap of the LWU agreement for a flat of `area` m² (null above the largest class). */
export function lwuEurCap(rules, area) {
  const caps = ((rules.lwu || {}).eur_caps || []).slice().sort((a, b) => a.max_area - b.max_area);
  const hit = area > 0 ? caps.find((c) => area <= c.max_area) : null; // "bis zu" = inclusive
  return hit ? hit.max_increase_eur : null;
}

/**
 * Main check. Input keys (all optional except `received`):
 * received, last_change, current_rent, rent_3y_ago, increases_559_560, demanded_rent, area,
 * ovm_per_sqm, requested_effective, lwu (bool: landlord is a state-owned company).
 * Returns the output keys documented in the contract plus `findings` (result ids).
 */
export function check(input, rules) {
  const received = isValid(input.received) ? input.received : null;
  const lastChange = isValid(input.last_change) ? input.last_change : null;
  const d = resolveDates(rules, { received, last_change: lastChange });

  const wartefristEarliest = d.wartefrist_earliest_effective ?? null;
  const effective = max(d.effective, wartefristEarliest);
  // the rent is owed from the legal earliest date, but never earlier than the date the landlord asked for
  const requested = isValid(input.requested_effective) ? input.requested_effective : null;
  const pay_from = effective && requested ? max(effective, requested) : effective;
  const sperrfrist_ok = received && d.sperrfrist_earliest_received ? received >= d.sperrfrist_earliest_received : null;
  // § 558 Abs. 1 S. 1: the 15 months count to the date the increase is to take effect (the landlord's later date counts)
  const wartefristTarget = d.effective && requested ? max(d.effective, requested) : d.effective;
  const wartefrist_ok = wartefristTarget && wartefristEarliest ? wartefristTarget >= wartefristEarliest : null;

  const choice = rules.mietspiegel_choice || { by: "received" };
  const msDate = choice.by === "effective" ? effective : received;
  const mietspiegel_year = chooseMietspiegel(rules, msDate);

  const k = rules.kappung || {};
  const kDate = k.by === "effective" ? effective : received;
  const { rate: kappung_rate, source: kappung_source } = kappungRate(rules, kDate);

  // Kappungsgrenze base: rent three years before the new rent applies (BGH VIII ZR 177/03),
  // without increases under §§ 559–560 (§ 558 Abs. 3 S. 1).
  // Without rent_3y_ago the base is the current rent minus the §§ 559–560 increases of the three years,
  // because the current rent already contains them. That is an upper bound for the true base
  // (§ 558 increases only add to it); it is exact only if the rent has not changed otherwise since then.
  const base_date = pay_from ? addMonths(pay_from, -12 * (k.lookback_years || 3)) : null;
  const current = numOrNull(input.current_rent);
  const given3y = numOrNull(input.rent_3y_ago);
  const inc = numOrNull(input.increases_559_560) ?? 0;
  const base3y = given3y ?? (current !== null ? round(current - inc) : null);
  const base_assumed = given3y === null && current !== null && (inc > 0 || !(lastChange && base_date && lastChange <= base_date));
  const demanded = numOrNull(input.demanded_rent);
  const area = numOrNull(input.area);
  const ovm = numOrNull(input.ovm_per_sqm);

  const cap_rent = base3y !== null && numOrNull(kappung_rate) !== null ? round(base3y * (1 + kappung_rate) + inc) : null;
  const ovm_rent = ovm !== null && area !== null && area > 0 ? round(ovm * area) : null;

  // state-owned landlords (voluntary commitments; rules.lwu)
  const L = rules.lwu || {};
  const lwuActive = Boolean(input.lwu) && received && within(received, L.valid_from, L.valid_to);
  const lwuRate = typeof L.cap_rate_3y === "number" ? L.cap_rate_3y : null;
  const lwuEur = lwuActive && current !== null ? lwuEurCap(rules, area) : null;
  const lwuCaps = [];
  if (lwuActive && lwuRate !== null && base3y !== null) lwuCaps.push(round(base3y * (1 + lwuRate) + inc));
  if (lwuEur !== null) lwuCaps.push(round(current + lwuEur));
  const lwu_cap_rent = lwuCaps.length ? Math.min(...lwuCaps) : null;

  const limits = [cap_rent, ovm_rent].filter((x) => x !== null);
  const max_rent = limits.length ? Math.min(...limits) : null;
  const demanded_over_max = demanded !== null && max_rent !== null ? Math.max(0, round(demanded - max_rent)) : null;
  const increase_pct = demanded !== null && current ? round(demanded / current - 1, 4) : null;
  const requested_too_early = requested && effective ? requested < effective : null;

  const findings = [];
  if (sperrfrist_ok === false) findings.push("sperrfrist_fail");
  if (wartefrist_ok === false) findings.push("wartefrist_postponed");
  if (requested_too_early) findings.push("requested_too_early");
  if (demanded !== null && cap_rent !== null && demanded > cap_rent + 0.004) findings.push("over_cap");
  else if (base_assumed && cap_rent !== null) findings.push("need_rent_3y");
  if (demanded !== null && ovm_rent !== null && demanded > ovm_rent + 0.004) findings.push("over_ovm");
  if (demanded !== null && lwu_cap_rent !== null && demanded > lwu_cap_rent + 0.004) findings.push("over_lwu");
  if (ovm_rent === null) findings.push("no_ovm");
  if (!lastChange) findings.push("no_last_change");
  const blocking = ["sperrfrist_fail", "over_cap", "over_ovm", "over_lwu", "need_rent_3y", "no_ovm", "no_last_change"];
  if (demanded !== null && !findings.some((f) => blocking.includes(f))) findings.push("within_limits");

  // every date defined in rules.dates is part of the output (e.g. termination_safe_by),
  // plus `<key>_unshifted` for dates moved under § 193 BGB
  const ruleDates = {};
  for (const [k, def] of Object.entries(rules.dates || {})) {
    ruleDates[k] = d[k] ?? null;
    if (def.shift_193 === "apply") ruleDates[`${k}_unshifted`] = d[`${k}_unshifted`] ?? null;
  }
  return {
    ...ruleDates,
    mietspiegel_year,
    effective,
    effective_regular: d.effective ?? null,
    pay_from,
    base_date,
    base_rent: base3y,
    base_assumed,
    wartefrist_earliest_effective: wartefristEarliest,
    sperrfrist_ok,
    wartefrist_ok,
    kappung_rate: numOrNull(kappung_rate),
    kappung_source,
    cap_rent,
    ovm_rent,
    max_rent,
    lwu_cap_rent,
    lwu_rate: lwuActive ? lwuRate : null,
    lwu_eur_cap: lwuEur,
    demanded_over_max,
    increase_pct,
    requested_too_early,
    findings,
  };
}

/** Compare an output with a test vector's `expected`. Returns a list of mismatch strings. */
export function compareExpected(out, expected) {
  const bad = [];
  for (const [key, want] of Object.entries(expected || {})) {
    const got = out[key];
    let ok;
    if (typeof want === "number" && typeof got === "number") ok = Math.abs(want - got) < 0.005 + 1e-9;
    else if (Array.isArray(want)) ok = Array.isArray(got) && want.every((w) => got.includes(w)) && got.every((g) => want.includes(g));
    else ok = want === got;
    if (!ok) bad.push(`${key}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
  }
  return bad;
}
