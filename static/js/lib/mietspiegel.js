// Mietspiegel row lookup and "Orientierungshilfe für die Spanneneinordnung" netting.
// Implements Nr. 10.3 of the Berlin Mietspiegel (2024 and 2026 identical):
// – per Merkmalgruppe: more plus than minus features → +1, more minus → −1, equal → 0 ("einfache Überzahl");
// – the five groups are netted against each other (sum of the group results);
// – a positive sum moves the value from the Mittelwert towards the Oberwert by 20 % of
//   (Oberwert − Mittelwert) per group, a negative sum towards the Unterwert by 20 % of
//   (Mittelwert − Unterwert) per group;
// – Nr. 9.4: optional fixed deduction for Minderausstattung (not part of the qualified Mietspiegel).
// Pure functions, shared by rechner.js and tests/run.mjs.

import { round } from "./money.js";

export const GROUP_SHARE = 0.2; // "jeweils 20 Prozent" per Merkmalgruppe (Nr. 10.3)

/** All features as a flat map id → {feature, group}. */
export function featureIndex(ms) {
  const idx = new Map();
  for (const g of ms.groups) for (const f of g.features) idx.set(f.id, { ...f, group: g.id });
  return idx;
}

export function flaecheClass(ms, id) {
  return ms.dims.flaeche.find((f) => f.id === id) || null;
}

/** Area matches a class "min bis unter max" (max exclusive, null = open). */
export function areaInClass(area, cls) {
  if (!cls || !(area > 0)) return false;
  if (cls.min !== null && cls.min !== undefined && area < cls.min) return false;
  if (cls.max !== null && cls.max !== undefined && area >= cls.max) return false;
  return true;
}

/**
 * Find the table row for wohnlage + baualter + area (+ ausstattung, default "voll").
 * Returns {row, wohnlage, flaeche, cell} or null.
 */
export function findRow(ms, { wohnlage, baualter, area, ausstattung = "voll" }) {
  for (const r of ms.table) {
    if (r.baualter !== baualter || (r.ausstattung && r.ausstattung !== ausstattung)) continue;
    const cell = r.cells[wohnlage];
    if (!cell) continue;
    const cls = flaecheClass(ms, r.flaeche);
    if (areaInClass(area, cls)) return { row: r.row, wohnlage, baualter, flaeche: cls, cell };
  }
  return null;
}

/** Whether a feature can apply to the given Baualter (machine-readable exclusions only). */
export function featureApplies(f, baualter) {
  return !(Array.isArray(f.baualter_excluded) && baualter && f.baualter_excluded.includes(baualter));
}

/**
 * Exclusive sets (energy features, Nr. 10.4 A): within a set, features of different parts
 * must not be combined. Returns [{set, parts:{part:[ids]}}] for every violated set.
 */
export function exclusiveConflicts(ms, ids) {
  const idx = featureIndex(ms);
  const sets = {};
  for (const id of ids) {
    const f = idx.get(id);
    if (!f || !f.excl) continue;
    const s = (sets[f.excl.set] ||= {});
    (s[f.excl.part] ||= []).push(id);
  }
  return Object.entries(sets)
    .filter(([, parts]) => Object.keys(parts).length > 1)
    .map(([set, parts]) => ({ set, parts }));
}

/**
 * Features of the same exclusive set but another part than `id` (to disable in the UI).
 */
export function blockedBy(ms, id, ids) {
  const idx = featureIndex(ms);
  const f = idx.get(id);
  if (!f || !f.excl) return [];
  return [...ids].filter((o) => {
    const g = idx.get(o);
    return g && g.excl && g.excl.set === f.excl.set && g.excl.part !== f.excl.part;
  });
}

/** Group results: counts and sign per Merkmalgruppe. */
export function groupTally(ms, ids, baualter) {
  const set = new Set(ids);
  return ms.groups.map((g) => {
    const plus = [], minus = [];
    for (const f of g.features) {
      if (!set.has(f.id) || !featureApplies(f, baualter)) continue;
      (f.sign > 0 ? plus : minus).push(f.id);
    }
    const sign = groupSign(plus.length, minus.length);
    return { id: g.id, label_de: g.label_de, plus, minus, sign };
  });
}

/** "Einfache Überzahl": +1 if more plus, −1 if more minus, 0 if equal. */
export function groupSign(plus, minus) {
  return Math.sign(plus - minus);
}

/**
 * Netting of the group results against each other (Nr. 10.3).
 * @param cell   {lower, mean, upper} in €/m²
 * @param signs  array of group signs (−1, 0, +1)
 * Adjustment = net × 20 % × (upper − mean) if net > 0, net × 20 % × (mean − lower) if net < 0,
 * rounded half-up to cents.
 */
export function netting(cell, signs) {
  const net = signs.reduce((a, b) => a + b, 0);
  const spanUp = round(cell.upper - cell.mean);
  const spanDown = round(cell.mean - cell.lower);
  const span = net >= 0 ? spanUp : spanDown;
  const delta = round(net * GROUP_SHARE * span);
  return { net, spanUp, spanDown, span, delta, ovmTable: round(cell.mean + delta) };
}

/**
 * Full evaluation.
 * @param ms        Mietspiegel data
 * @param cell      {lower, mean, upper}
 * @param ids       feature ids that count (already excluding tenant-installed equipment)
 * @param opts      {baualter, area, minder:boolean}
 */
export function evaluate(ms, cell, ids, { baualter, area, minder = false } = {}) {
  const conflicts = exclusiveConflicts(ms, ids);
  const groups = groupTally(ms, ids, baualter);
  const { net, spanUp, spanDown, span, delta, ovmTable } = netting(cell, groups.map((g) => g.sign));

  const ab = ms.abschlag;
  const abschlagApplies = Boolean(minder && ab && (ab.baualter || []).includes(baualter));
  const abschlag = abschlagApplies ? ab.eur_per_sqm : 0;
  const ovm = round(ovmTable - abschlag);
  const monthly = area > 0 ? round(ovm * area) : null;
  return {
    groups, net, spanUp, spanDown, span, share: GROUP_SHARE, delta,
    ovmTable, abschlag, abschlagApplies, ovm, monthly, conflicts,
  };
}

/** Plus features the landlord claims but the tenant does not see, and minus features the tenant sees but the landlord left out. */
export function disputes(ms, mine, landlord) {
  const me = new Set(mine), ll = new Set(landlord);
  const idx = featureIndex(ms);
  const disputedPlus = [], missingMinus = [], disputedMinus = [], missingPlus = [];
  for (const [id, f] of idx) {
    if (f.sign > 0 && ll.has(id) && !me.has(id)) disputedPlus.push(id);
    if (f.sign < 0 && me.has(id) && !ll.has(id)) missingMinus.push(id);
    if (f.sign < 0 && ll.has(id) && !me.has(id)) disputedMinus.push(id);
    if (f.sign > 0 && me.has(id) && !ll.has(id)) missingPlus.push(id);
  }
  return { disputedPlus, missingMinus, disputedMinus, missingPlus };
}

/**
 * Energy features (group Gebäude) from an energy certificate value, per the notes in the
 * Orientierungshilfe: limits are for Verbrauchskennwerte; for a Bedarfskennwert the limits are
 * raised by 20 %; for values without the decentral hot-water supply 20 kWh/(m²a) are added first.
 * Returns the ids of the "kennwert" boxes that apply (minus: value > limit, plus: value < limit).
 */
export const BEDARF_FACTOR = 1.2;
export const DECENTRAL_WATER_ADD = 20;

export function energyBoxes(ms, { value, bedarf = false, addWater = false }) {
  if (!(value > 0)) return [];
  const v = value + (addWater ? DECENTRAL_WATER_ADD : 0);
  const factor = bedarf ? BEDARF_FACTOR : 1;
  const out = [];
  for (const g of ms.groups) {
    for (const f of g.features) {
      if (typeof f.kwh_gt === "number" && v > f.kwh_gt * factor) out.push(f.id);
      if (typeof f.kwh_lt === "number" && v < f.kwh_lt * factor) out.push(f.id);
    }
  }
  return out;
}

/**
 * Energy kennwert boxes are cumulative (Nr. 10.4 A: "ein, zwei oder drei … je nach der Höhe"):
 * a value above 195 is also above 145, a value below 80 is also below 100 and 120.
 * Adds, for every selected box with `kwh_gt`, the boxes with a smaller `kwh_gt`, and for every
 * selected box with `kwh_lt`, the boxes with a larger `kwh_lt`. Order follows the Mietspiegel.
 */
export function expandKennwert(ms, ids) {
  const set = new Set(ids);
  const all = ms.groups.flatMap((g) => g.features);
  const gts = all.filter((f) => set.has(f.id) && typeof f.kwh_gt === "number").map((f) => f.kwh_gt);
  const lts = all.filter((f) => set.has(f.id) && typeof f.kwh_lt === "number").map((f) => f.kwh_lt);
  const maxGt = gts.length ? Math.max(...gts) : null;
  const minLt = lts.length ? Math.min(...lts) : null;
  for (const f of all) {
    if (maxGt !== null && typeof f.kwh_gt === "number" && f.kwh_gt <= maxGt) set.add(f.id);
    if (minLt !== null && typeof f.kwh_lt === "number" && f.kwh_lt >= minLt) set.add(f.id);
  }
  const order = new Map(all.map((f, i) => [f.id, i]));
  return [...set].sort((a, b) => (order.get(a) ?? Infinity) - (order.get(b) ?? Infinity));
}
