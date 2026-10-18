#!/usr/bin/env node
// Test runner: `node tests/run.mjs` or `bun tests/run.mjs` (from the site root or anywhere).
// Uses the same ES modules as the browser (static/js/lib/*.js, static/js/app/scope.js).
//  1. all `tests` vectors from static/data/rules.json (§ 558 check + netting)
//  2. fixed unit tests (date rules, brochure examples on the real Mietspiegel data, letters)
//  3. consistency: UI key parity, content keys for every feature id, letter placeholders, style lint of all texts
//  4. if public/ exists: no external resources (scripts, styles, fonts, images) in the built site

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { applyRule, addMonths, nextWorkingDay, isValid } from "../static/js/lib/dates.js";
import { check, compareExpected, chooseMietspiegel } from "../static/js/lib/check558.js";
import { findRow, evaluate, netting, groupSign, energyBoxes, exclusiveConflicts, disputes, expandKennwert } from "../static/js/lib/mietspiegel.js";
import { render, placeholders, prefill, letterValues, amountProblems, consentWarnings } from "../static/js/lib/letter.js";
import { parseNumber, round } from "../static/js/lib/money.js";
import { scopeState } from "../static/js/app/scope.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = (...xs) => join(ROOT, ...xs);
const load = (rel) => (existsSync(p(rel)) ? JSON.parse(readFileSync(p(rel), "utf8")) : null);

let pass = 0, fail = 0, warn = 0;
const ok = (name) => { pass++; console.log(`  ok    ${name}`); };
const bad = (name, why) => { fail++; console.log(`  FAIL  ${name}\n        ${[].concat(why).join("\n        ")}`); };
const note = (name, why) => { warn++; console.log(`  warn  ${name}: ${why}`); };
const eq = (name, got, want) => (JSON.stringify(got) === JSON.stringify(want) ? ok(name) : bad(name, `expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`));
const section = (t) => console.log(`\n${t}`);

const rules = load("static/data/rules.json");
const ms = { 2026: load("static/data/ms2026.json"), 2024: load("static/data/ms2024.json") };
const letters = load("static/data/letters.json");

/* ---------- 1. rules.json vectors ---------- */
section("1. Test vectors from static/data/rules.json");
if (!rules) {
  bad("rules.json present", "static/data/rules.json is missing");
} else {
  const tests = rules.tests || [];
  if (tests.length < 15) bad("at least 15 vectors", `only ${tests.length}`);
  for (const tv of tests) {
    const name = `${tv.id || "?"} ${tv.note_de || tv.note || ""}`.trim();
    try {
      if (tv.kind === "workday") {
        const got = nextWorkingDay(tv.input.date, rules.holidays_berlin);
        got === tv.expected.workday ? ok(name) : bad(name, `expected ${tv.expected.workday}, got ${got}`);
      } else if (tv.kind === "netting") {
        const order = ["bad", "kueche", "wohnung", "gebaeude", "umfeld"];
        const counts = tv.input.counts || {};
        const groups = Object.fromEntries(order.map((g) => [g, groupSign(counts[g]?.plus || 0, counts[g]?.minus || 0)]));
        const r = netting(tv.input, order.map((g) => groups[g]));
        const out = { groups, net_groups: r.net, ovm_per_sqm: r.ovmTable, adjustment: r.delta };
        const mism = [];
        for (const [k, want] of Object.entries(tv.expected)) {
          const got = out[k];
          const same = typeof want === "number" ? Math.abs(got - want) < 0.005 : JSON.stringify(got) === JSON.stringify(want);
          if (!same) mism.push(`${k}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
        }
        mism.length ? bad(name, mism) : ok(name);
      } else {
        const out = check(tv.input, rules);
        const mism = compareExpected(out, tv.expected);
        mism.length ? bad(name, mism) : ok(name);
      }
    } catch (e) {
      bad(name, e.stack || String(e));
    }
  }
}

/* ---------- 2. unit tests ---------- */
section("2. Unit tests");
// date snaps
eq("start_next_month: received 17.10.2026 + 2 → 01.01.2027", applyRule({ add_months: 2, snap: "start_next_month" }, "2026-10-17"), "2027-01-01");
eq("end_of_month: received 17.10.2026 + 2 → 31.12.2026", applyRule({ add_months: 2, snap: "end_of_month" }, "2026-10-17"), "2026-12-31");
eq("end_of_month: 31.12.2026 + 3 → 31.03.2027", applyRule({ add_months: 3, snap: "end_of_month" }, "2026-12-31"), "2027-03-31");
eq("none: 31.01.2026 + 1 → 28.02.2026", applyRule({ add_months: 1, snap: "none" }, "2026-01-31"), "2026-02-28");
eq("after_period: 31.01.2025 + 15 → 01.05.2026", applyRule({ add_months: 15, snap: "after_period" }, "2025-01-31"), "2026-05-01");
eq("after_period: 15.03.2025 + 12 → 15.03.2026", applyRule({ add_months: 12, snap: "after_period" }, "2025-03-15"), "2026-03-15");
eq("after_period: 29.02.2024 + 12 → 01.03.2025", applyRule({ add_months: 12, snap: "after_period" }, "2024-02-29"), "2025-03-01");
eq("addMonths across year", addMonths("2026-11-30", 3), "2027-02-28");
eq("parseNumber de", parseNumber("1.234,56"), 1234.56);
eq("parseNumber dot", parseNumber("8.49"), 8.49);
eq("parseNumber thousands", parseNumber("1.234"), 1234);
eq("round half-up 0.414 → 0.41", round(0.414), 0.41);
eq("round float noise 747.4999999 → 747.5", round(650 * 1.15), 747.5);
eq("round half-up 0.125 → 0.13", round(0.125), 0.13);

// brochure examples on the real data
if (ms[2026]) {
  const m = ms[2026];
  const r10 = findRow(m, { wohnlage: "einfach", baualter: "bis1918", area: 80 });
  eq("2026 Nr. 8 example: einfach, 1910, 80 m² → row 10", r10 && r10.row, 10);
  const r161 = findRow(m, { wohnlage: "gut", baualter: "1986_1990w", area: 65 });
  eq("2026 Nr. 8 example: gut, 1987 West, 65 m² → row 161", r161 && r161.row, 161);
  const r81 = findRow(m, { wohnlage: "mittel", baualter: "1919_1949", area: 60 });
  eq("2026 Nr. 10.4 example: mittel, 1919–1949, 60 m² → row 81", r81 && r81.row, 81);
  if (r81) {
    eq("row 81 values 5,90 / 7,30 / 9,55", [r81.cell.lower, r81.cell.mean, r81.cell.upper], [5.9, 7.3, 9.55]);
    // three plus groups, two minus groups (+20 %) → 7,75 €/m²
    const g = Object.fromEntries(m.groups.map((x) => [x.id, x.features]));
    const pick = (gid, sign) => g[gid].find((f) => f.sign === sign && !f.excl && !f.baualter_excluded).id;
    const ids = [pick("bad", 1), pick("kueche", 1), pick("wohnung", 1), pick("gebaeude", -1), pick("umfeld", -1)];
    const ev = evaluate(m, r81.cell, ids, { baualter: "1919_1949", area: 60 });
    eq("Nr. 10.4 B: net +1 group → 7,75 €/m²", [ev.net, ev.delta, ev.ovm], [1, 0.45, 7.75]);
    eq("monthly for 60 m² = 465,00 €", ev.monthly, 465);
    const ev2 = evaluate(m, r81.cell, ids, { baualter: "1919_1949", area: 60, minder: true });
    eq("Nr. 9.4 Abschlag 0,33 € for 1919–1949", ev2.ovm, 7.42);
    const ev3 = evaluate(m, r81.cell, [], { baualter: "1919_1949", area: 60 });
    eq("no features → Mittelwert", ev3.ovm, 7.3);
  }
  const boxes = (v, o = {}) => energyBoxes(m, { value: v, ...o }).sort();
  eq("Nr. 10.4 A: 240 kWh → all three minus boxes", boxes(240), ["gebaeude-m09", "gebaeude-m10", "gebaeude-m11"]);
  eq("Nr. 10.4 A: 90 kWh → the two upper plus boxes", boxes(90), ["gebaeude-p09", "gebaeude-p10"]);
  eq("Bedarfskennwert 150 (limit 145×1.2=174) → none", boxes(150, { bedarf: true }), []);
  eq("ohne dezentrales WW: 130+20=150 → m09", boxes(130, { addWater: true }), ["gebaeude-m09"]);
  eq("exclusive energy conflict detected", exclusiveConflicts(m, ["gebaeude-m08", "gebaeude-m09"]).length, 1);
  eq("same part is no conflict", exclusiveConflicts(m, ["gebaeude-m09", "gebaeude-m10"]).length, 0);
  const d = disputes(m, ["bad-m01"], ["bad-p01"]);
  eq("disputes: landlord plus not seen / minus not listed", [d.disputedPlus, d.missingMinus], [["bad-p01"], ["bad-m01"]]);
  // every row has exactly one cell and a valid area class
  const rowsOk = m.table.every((r) => Object.values(r.cells).filter(Boolean).length === 1 && m.dims.flaeche.some((f) => f.id === r.flaeche));
  rowsOk ? ok("2026 table: one cell per row, known area classes") : bad("2026 table: one cell per row", "inconsistent rows");
} else {
  bad("ms2026.json present", "missing");
}
if (ms[2024]) {
  const m = ms[2024];
  const rowsOk = m.table.every((r) => Object.values(r.cells).filter(Boolean).length === 1 && m.dims.flaeche.some((f) => f.id === r.flaeche));
  rowsOk ? ok("2024 table: one cell per row, known area classes") : bad("2024 table: one cell per row", "inconsistent rows");
  // every (wohnlage, baualter) has a row for every area > 0 that the table covers without gaps
  let gaps = [];
  for (const wl of ["einfach", "mittel", "gut"]) for (const b of m.dims.baualter) {
    const has = m.table.some((r) => r.baualter === b.id && r.cells[wl]);
    if (!has) continue;
    for (const a of [20, 34.99, 35, 40, 59.5, 60, 90, 130, 200]) if (!findRow(m, { wohnlage: wl, baualter: b.id, area: a })) gaps.push(`${wl}/${b.id}/${a}`);
  }
  gaps.length ? note("2024 rows without a value for some areas (empty table cells in the Mietspiegel?)", gaps.slice(0, 8).join(", ") + (gaps.length > 8 ? " …" : "")) : ok("2024 table covers all areas");
} else {
  bad("ms2024.json present", "missing");
}
if (ms[2026]) {
  const m = ms[2026];
  let gaps = [];
  for (const wl of ["einfach", "mittel", "gut"]) for (const b of m.dims.baualter) {
    if (!m.table.some((r) => r.baualter === b.id && r.cells[wl])) continue;
    for (const a of [20, 34.99, 35, 40, 59.5, 60, 90, 130, 200]) if (!findRow(m, { wohnlage: wl, baualter: b.id, area: a })) gaps.push(`${wl}/${b.id}/${a}`);
  }
  gaps.length ? note("2026 rows without a value for some areas (empty table cells in the Mietspiegel?)", gaps.slice(0, 8).join(", ") + (gaps.length > 8 ? " …" : "")) : ok("2026 table covers all areas");
}
if (rules) {
  eq("Mietspiegel choice 17.10.2026 → 2026", chooseMietspiegel(rules, "2026-10-17"), 2026);
  eq("Mietspiegel choice 01.03.2025 → 2024", chooseMietspiegel(rules, "2025-03-01"), 2024);
}

// letter renderer
{
  const body = "Sehr geehrte Damen und Herren,\n{?disputed}Bestritten:\n{disputed}\n{/disputed}\nMiete: {rent} ab {date}.\n{name}";
  const r = render(body, { disputed: ["bad-p01"], rent: 512.5, date: "2027-01-01" }, { disputed: "features_plus", rent: "money", date: "date", name: "text" }, (id) => `Text ${id}`);
  eq("letter: blocks, money, date, blanks", [r.text.includes("– Text bad-p01"), r.text.includes("512,50 €"), r.text.includes("01.01.2027"), r.missing], [true, true, true, ["name"]]);
  const r2 = render(body, { rent: 1 }, {}, (x) => x);
  eq("letter: empty optional block removed", r2.text.includes("Bestritten"), false);
}

// review regressions (docs/review-log.md)
if (rules) {
  const base = { received: "2026-10-15", current_rent: 600, demanded_rent: 650, area: 60 };
  const later = check({ ...base, requested_effective: "2027-02-01" }, rules);
  eq("A F-2/B F4: landlord's later date wins → pay_from 01.02.2027", [later.effective, later.pay_from], ["2027-01-01", "2027-02-01"]);
  const early = check({ ...base, requested_effective: "2026-12-01" }, rules);
  eq("A F-2/B F4: too early requested date → pay_from = legal date", early.pay_from, "2027-01-01");
  const none = check(base, rules);
  eq("pay_from without requested date = effective", none.pay_from, none.effective);

  const a3 = check({ received: "2026-10-15", last_change: "2024-10-01", current_rent: 600, demanded_rent: 680, area: 60, ovm_per_sqm: 12 }, rules);
  eq("A F-3: rent changed within 3 years, rent_3y_ago empty → need_rent_3y, no within_limits",
    [a3.findings.includes("need_rent_3y"), a3.findings.includes("within_limits"), a3.base_date], [true, false, "2024-01-01"]);
  const a3ok = check({ received: "2026-10-15", last_change: "2023-06-01", current_rent: 600, demanded_rent: 680, area: 60, ovm_per_sqm: 12 }, rules);
  eq("A F-3: rent unchanged for 3+ years → within_limits", [a3ok.findings.includes("need_rent_3y"), a3ok.findings.includes("within_limits")], [false, true]);
  const noLast = check({ ...base, ovm_per_sqm: 12 }, rules);
  eq("A F-3: no last_change → no within_limits, no_last_change", [noLast.findings.includes("within_limits"), noLast.findings.includes("no_last_change")], [false, true]);

  if (rules.lwu && typeof rules.lwu.cap_rate_3y === "number") {
    const lw = check({ received: "2026-10-15", last_change: "2023-06-01", current_rent: 600, demanded_rent: 680, area: 60, ovm_per_sqm: 12, lwu: true }, rules);
    // 60 m² → euro cap 50 €: 650; 11 %: 666 → 650
    eq("A F-4: LWU caps (11 % / 50 € for ≤ 65 m²) → 650 €, over_lwu", [lw.lwu_cap_rent, lw.findings.includes("over_lwu")], [650, true]);
  } else {
    note("A F-4 LWU test", "rules.lwu.cap_rate_3y missing");
  }
}
{
  // never refill a cleared field; built-ins never override a template field
  const fields = [{ id: "effective", type: "date" }, { id: "new_rent", type: "money" }, { id: "place", type: "text", default: "Berlin" }];
  const st = { values: {}, prefilled: {} };
  prefill(fields, st.values, st.prefilled, { effective: "2027-02-01", new_rent: 650 });
  eq("letter prefill: date, amount, default", [st.values.effective, st.values.new_rent, st.values.place], ["2027-02-01", "650", "Berlin"]);
  prefill(fields, st.values, st.prefilled, { effective: "2027-03-01", new_rent: 650 });
  eq("letter prefill follows a changed checker result while untouched", st.values.effective, "2027-03-01");
  st.values.effective = "";
  prefill(fields, st.values, st.prefilled, { effective: "2027-03-01", new_rent: 650 });
  eq("A F-2: cleared date field is not refilled", st.values.effective, "");
  const vals = letterValues(fields, st.values, { effective: "2027-03-01", today: "2026-10-18" }, parseNumber);
  eq("A F-2: built-in date does not override the emptied field", ["effective" in vals, vals.new_rent, vals.today], [false, 650, "2026-10-18"]);
  if (letters) {
    const tp = (letters.templates || []).find((x) => x.kind === "consent");
    if (tp) {
      const types = Object.fromEntries((tp.fields || []).map((f) => [f.id, f.type]));
      const v = letterValues(tp.fields, { effective: "", new_rent: "650", current_rent: "600" }, { effective: "2027-03-01", today: "2026-10-18" }, parseNumber);
      eq("A F-2: consent letter with emptied date contains no automatic date", render(tp.body_de, v, types, (x) => x).text.includes("01.03.2027"), false);
    }
  }
  eq("A F-5: partial consent amount must lie between current and demanded",
    [amountProblems({ kind: "partial" }, { current_rent: 600, agreed_rent: 700 }, 650), amountProblems({ kind: "partial" }, { current_rent: 600, agreed_rent: 620 }, 650)],
    [["agreed_not_between"], []]);
  eq("A F-5: consent amount above demanded is flagged", amountProblems({ kind: "consent" }, { current_rent: 600, new_rent: 660 }, 650), ["new_over_demanded"]);
}

// Wave V – adversarial review (docs/review-log.md)
{
  // S1 C4 / S2 C4 / S3 C4: number parsing ("1,200" is refused as ambiguous, S2 C4 wins over S1 C4)
  const nums = ["1,200", "1,234,567", "900,-", "64,5", "64,50", "1.234,56", "8.49", "12,5", "٦٥٠", "۶۵۰٫۵", "800,-", "1,050", "1,05", "850,-", "1.050,–"];
  eq("V S1/S2/S3 C4: parseNumber vectors", nums.map(parseNumber), [null, 1234567, 900, 64.5, 64.5, 1234.56, 8.49, 12.5, 650, 650.5, 800, null, 1.05, 850, 1050]);
  // S2 C10: half-typed years are no date
  eq("V S2 C10: isValid(0002-03-15) is false", isValid("0002-03-15"), false);
}
if (ms[2026]) {
  const m = ms[2026];
  // S1 C1: Wendewohnungen belong to 1973–1990 Ost
  eq("V S1 C1: mittel, 1973–1990 Ost, 60 m² → row 105", (findRow(m, { wohnlage: "mittel", baualter: "1973_1990o", area: 60 }) || {}).row, 105);
  // S1 C10: energy boxes are cumulative
  const r81 = findRow(m, { wohnlage: "mittel", baualter: "1919_1949", area: 60 });
  const ev = evaluate(m, r81.cell, expandKennwert(m, ["gebaeude-m10", "gebaeude-p01"]), { baualter: "1919_1949", area: 60 });
  eq("V S1 C10: m10 + p01 → m09 added, Gebäude −1, 7,02 €", [ev.groups.find((g) => g.id === "gebaeude").sign, ev.ovm], [-1, 7.02]);
  eq("V S1 C10: p11 vs p09–p11 → no disputed plus",
    disputes(m, expandKennwert(m, ["gebaeude-p11"]), expandKennwert(m, ["gebaeude-p09", "gebaeude-p10", "gebaeude-p11"])).disputedPlus, []);
  // S1 C2: the library is unchanged, only the question changes
  eq("V S1 C2: 130 + water → m09", energyBoxes(m, { value: 130, addWater: true }), ["gebaeude-m09"]);
  // S1 P-14: rounding once hits the range edge at net = −5; rounding per group misses it by 2 cents
  const row2 = m.table.find((r) => r.row === 2);
  const cell = row2.cells.einfach;
  const once = netting(cell, [-1, -1, -1, -1, -1]).ovmTable;
  const perGroup = round(cell.mean - 5 * round(0.2 * round(cell.mean - cell.lower)));
  eq("V S1 P-14: 2026 row 2 einfach, net −5: once 7,06 (= Unterwert), per group 7,04", [once, cell.lower, perGroup], [7.06, 7.06, 7.04]);
}
if (rules) {
  // S2 C1: § 559 increases are not counted twice (t34/t35 in rules.json); PRO case E6
  const e6 = check({ received: "2026-01-15", current_rent: 540, increases_559_560: 40, demanded_rent: 650, last_change: "2020-01-01" }, rules);
  eq("V S2 C1: E6 540/40 → cap 615, over_cap", [e6.cap_rent, e6.findings.includes("over_cap")], [615, true]);
}
{
  // S3 C1: incomplete check warns before consent
  eq("V S3 C1: consentWarnings",
    [consentWarnings(["no_ovm", "no_last_change"]), consentWarnings(undefined).unchecked, consentWarnings(["over_ovm", "no_last_change"])],
    [{ unchecked: false, risky: [], incomplete: ["no_ovm", "no_last_change"] }, true, { unchecked: false, risky: ["over_ovm"], incomplete: ["no_last_change"] }]);
  // S3 C3: partial consent above the computed upper limit
  eq("V S3 C3: agreed_over_max",
    [amountProblems({ kind: "partial" }, { current_rent: 800, agreed_rent: 900 }, 950, 840), amountProblems({ kind: "partial" }, { current_rent: 800, agreed_rent: 840 }, 950, 840)],
    [["agreed_over_max"], []]);
  // S3 C7: an untouched feature list follows a new comparison; an edited one stays
  const f7 = [{ id: "disputed_plus", type: "features_plus" }];
  eq("V S3 C7: untouched feature list follows the calculator",
    prefill(f7, { disputed_plus: ["x"] }, { disputed_plus: ["x"] }, { features_plus: ["y"] }).values.disputed_plus, ["y"]);
  eq("V S3 C7: edited feature list stays",
    prefill(f7, { disputed_plus: ["x", "z"] }, { disputed_plus: ["x"] }, { features_plus: ["y"] }).values.disputed_plus, ["x", "z"]);
  // S3 K1: room for the signature
  if (letters) {
    const bad1 = (letters.templates || []).filter((tp) => {
      const txt = render(tp.body_de, { tenant_name: "Max" }, {}, (x) => x).text;
      return !txt.endsWith("Grüßen\n\n\n\nMax\n") || /\n{3,}/.test(txt.slice(0, -"Grüßen\n\n\n\nMax\n".length));
    }).map((tp) => tp.id);
    eq("V S3 K1: every template keeps the signature space and nothing else", bad1, []);
  }
}
// O4 (S2 C2, S5 F1): newer subsidised flat – § 558 applies (consent needed), the Mietspiegel does not
eq("O4 gefoerdert: scopeState → notMS", scopeState({ ask: "yes", items: { gefoerdert: true } }, { withAsk: true }), "notMS");

/* ---------- 3. consistency ---------- */
section("3. Consistency");
const uiDir = p("static/i18n/ui");
const uiDe = load("static/i18n/ui/de.json");
for (const f of readdirSync(uiDir).filter((x) => x.endsWith(".json") && x !== "de.json")) {
  const o = load(`static/i18n/ui/${f}`);
  const missing = Object.keys(uiDe).filter((k) => !(k in o));
  const extra = Object.keys(o).filter((k) => !(k in uiDe));
  const empty = Object.keys(o).filter((k) => typeof o[k] !== "string" || !o[k].trim());
  missing.length || extra.length || empty.length
    ? bad(`ui/${f} has the same keys as ui/de.json`, [missing.length ? `missing: ${missing.join(", ")}` : "", extra.length ? `extra: ${extra.join(", ")}` : "", empty.length ? `empty: ${empty.join(", ")}` : ""].filter(Boolean))
    : ok(`ui/${f} has the same keys as ui/de.json`);
}
// every UI key used by templates and JS exists
{
  const used = new Set();
  const walk = (dir, re) => {
    for (const n of readdirSync(dir)) {
      const fp = join(dir, n);
      if (statSync(fp).isDirectory()) walk(fp, re);
      else for (const m of readFileSync(fp, "utf8").matchAll(re)) used.add(m[1]);
    }
  };
  walk(p("templates"), /\bui\.([a-z0-9_]+)/g);
  walk(p("static/js/app"), /\bt\(\s*"([a-z0-9_]+)"/g);
  const missing = [...used].filter((k) => !(k in uiDe));
  missing.length ? bad("all literal UI keys exist in ui/de.json", missing.join(", ")) : ok(`all ${used.size} literal UI keys exist in ui/de.json`);
}
// content texts cover every feature id
const contentDir = p("static/i18n/content");
if (existsSync(contentDir)) {
  for (const f of readdirSync(contentDir).filter((x) => x.endsWith(".json"))) {
    const c = load(`static/i18n/content/${f}`);
    const ids = new Set([...(ms[2026]?.groups || []), ...(ms[2024]?.groups || [])].flatMap((g) => g.features.map((x) => x.id)));
    const gids = new Set([...(ms[2026]?.groups || [])].map((g) => g.id));
    const missF = [...ids].filter((id) => !c.features || !c.features[id] || !c.features[id].title);
    const missG = [...gids].filter((id) => !c.groups || !c.groups[id] || !c.groups[id].title);
    missF.length || missG.length
      ? (f === "de.json" ? bad : note)(`content/${f} covers all ${ids.size} features and ${gids.size} groups`, [missF.length ? `features without title: ${missF.join(", ")}` : "", missG.length ? `groups without title: ${missG.join(", ")}` : ""].filter(Boolean).join("; "))
      : ok(`content/${f} covers all ${ids.size} features and ${gids.size} groups`);
  }
} else {
  bad("static/i18n/content/de.json present", "missing");
}
// S3 C9: no doubled "(optional)" – the form adds it to optional field labels
if (existsSync(contentDir)) {
  for (const f of readdirSync(contentDir).filter((x) => x.endsWith(".json"))) {
    const fl = (load(`static/i18n/content/${f}`).letters || {}).fields || {};
    const doubled = ["own_text", "questions", "contract_number"].filter((k) => typeof fl[k] === "string" && /\)\s*$/.test(fl[k]));
    doubled.length ? bad(`V S3 C9: content/${f} optional letter labels end without "(…)"`, doubled.join(", ")) : ok(`V S3 C9: content/${f} optional letter labels end without "(…)"`);
  }
}
// S4 F4: entries are kept in sessionStorage only
{
  const hits = [];
  const walkJs = (dir) => {
    for (const n of readdirSync(dir)) {
      const fp = join(dir, n);
      if (statSync(fp).isDirectory()) walkJs(fp);
      else if (n.endsWith(".js") && readFileSync(fp, "utf8").includes("localStorage")) hits.push(fp.slice(ROOT.length));
    }
  };
  walkJs(p("static/js"));
  hits.length ? bad("V S4 F4: no localStorage in static/js", hits) : ok("V S4 F4: no localStorage in static/js");
}
// letters: placeholders are fields or built-ins
if (letters) {
  const builtins = new Set(["today", "ms_title", "ovm_per_sqm", "max_rent", "consent_deadline", "effective"]);
  for (const tp of letters.templates || []) {
    const fields = new Set((tp.fields || []).map((f) => f.id));
    const unknown = placeholders(tp.body_de || "").filter((x) => !fields.has(x) && !builtins.has(x));
    const types = (tp.fields || []).map((f) => f.type).filter((x) => !["text", "textarea", "date", "money", "area", "features_plus", "features_minus"].includes(x));
    unknown.length || types.length || !tp.body_de
      ? bad(`letter ${tp.id}: placeholders/types known`, [unknown.length ? `unknown placeholders: ${unknown.join(", ")}` : "", types.length ? `unknown field types: ${types.join(", ")}` : "", tp.body_de ? "" : "no body_de"].filter(Boolean))
      : ok(`letter ${tp.id}: placeholders/types known`);
  }
} else {
  bad("letters.json present", "static/data/letters.json is missing");
}

// De-slop style lint (docs/review-log.md): no spaced en dashes, em dashes or " -- ", no Markdown "---" rules
// in page bodies, at most 2 bold phrases per paragraph or list item; checked per language and for letters.json
{
  const DASHES = [[" – ", "spaced en dash"], ["—", "em dash"], [" -- ", "spaced --"]];
  const snip = (s, i) => `"…${s.slice(Math.max(0, i - 30), i + 30).replace(/\n/g, " ")}…"`;
  const lineOf = (s, i) => s.slice(0, i).split("\n").length;
  // where(i) names the position of index i, e.g. "content/brief.md:12" or "ui/de.json scope_intro"
  const lintText = (s, where, out, { body = s, bodyStart = 0 } = {}) => {
    for (const [d, what] of DASHES) for (let i = s.indexOf(d); i >= 0; i = s.indexOf(d, i + d.length)) out.push(`${where(i)}: ${what} in ${snip(s, i)}`);
    let at = bodyStart;
    for (const line of body.split("\n")) {
      if (/^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/.test(line)) out.push(`${where(at)}: Markdown rule "${line.trim()}"`);
      at += line.length + 1;
    }
    at = bodyStart;
    for (const block of body.split(/(\n[ \t]*\n|\n(?=[ \t]*(?:[-*+–]|\d+\.)[ \t]))/)) {
      const n = (block.match(/\*\*[^*\n]+?\*\*/g) || []).length;
      if (n > 2) out.push(`${where(at)}: ${n} bold phrases in one paragraph or list item ${snip(block, 0)}`);
      at += block.length;
    }
  };
  const strings = (o, path, acc = []) => {
    if (typeof o === "string") acc.push([path, o]);
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) strings(v, Array.isArray(o) ? `${path}[${k}]` : path ? `${path}.${k}` : k, acc);
    return acc;
  };
  const lintJson = (rel, out) => {
    const o = load(rel);
    if (!o) return out.push(`${rel}: missing`);
    for (const [path, s] of strings(o, "")) lintText(s, () => `${rel.replace("static/i18n/", "")} ${path}`, out);
  };
  const report = (name, out) => (out.length ? bad(name, out.length > 25 ? [...out.slice(0, 25), `… ${out.length - 25} more`] : out) : ok(name));
  const pages = readdirSync(p("content")).filter((n) => n.endsWith(".md") && statSync(p("content", n)).isFile());
  for (const lang of readdirSync(uiDir).filter((x) => x.endsWith(".json")).map((x) => x.slice(0, -5)).sort()) {
    const out = [];
    for (const n of pages.filter((n) => (n.match(/\.([a-z]{2})\.md$/)?.[1] || "de") === lang)) {
      const s = readFileSync(p("content", n), "utf8");
      const fm = s.match(/^\+\+\+\r?\n[\s\S]*?\r?\n\+\+\+\r?\n/);
      const bodyStart = fm ? fm[0].length : 0;
      lintText(s, (i) => `content/${n}:${lineOf(s, i)}`, out, { body: s.slice(bodyStart), bodyStart });
    }
    lintJson(`static/i18n/content/${lang}.json`, out);
    lintJson(`static/i18n/ui/${lang}.json`, out);
    report(`style lint ${lang}: pages, content/${lang}.json, ui/${lang}.json`, out);
  }
  const out = [];
  lintJson("static/data/letters.json", out);
  report("style lint static/data/letters.json", out);
}

/* ---------- 4. built site ---------- */
section("4. Built site (public/)");
if (existsSync(p("public"))) {
  const offenders = [];
  // own origin = base_url used for the build (Zola writes absolute URLs); taken from sitemap.xml
  const sm = existsSync(p("public/sitemap.xml")) ? readFileSync(p("public/sitemap.xml"), "utf8") : "";
  const own = ((/<loc>(https?:\/\/[^/<]+)/.exec(sm) || [])[1] || "").toLowerCase();
  const external = (url) => /^(https?:)?\/\//i.test(url) && !(own && url.toLowerCase().startsWith(own + "/"));
  const reTag = /<(script|link|img|iframe|source|video|audio|embed|object)\b[^>]*>/gi;
  const walk = (dir) => {
    for (const n of readdirSync(dir)) {
      const fp = join(dir, n);
      if (statSync(fp).isDirectory()) { walk(fp); continue; }
      if (n.endsWith(".html")) {
        const html = readFileSync(fp, "utf8");
        for (const m of html.matchAll(reTag)) {
          const tag = m[0];
          const isAnchorish = /^<link\b/i.test(tag) && /rel="(alternate|canonical)"/i.test(tag);
          const url = (/(?:src|href|data)="([^"]+)"/i.exec(tag) || [])[1] || "";
          if (!isAnchorish && external(url)) offenders.push(`${fp.slice(ROOT.length)}: ${tag}`);
        }
        if (/url\(\s*["']?(https?:)?\/\//i.test(html)) offenders.push(`${fp.slice(ROOT.length)}: CSS url(…) to another host`);
      } else if (n.endsWith(".css") && /url\(\s*["']?(https?:)?\/\//i.test(readFileSync(fp, "utf8"))) {
        offenders.push(`${fp.slice(ROOT.length)}: url(…) to another host`);
      } else if (n.endsWith(".js") && /\bfetch\(\s*["'`]https?:/i.test(readFileSync(fp, "utf8"))) {
        offenders.push(`${fp.slice(ROOT.length)}: fetch to another host`);
      }
    }
  };
  walk(p("public"));
  offenders.length ? bad("no external resources in public/", offenders.slice(0, 20)) : ok("no external resources in public/ (scripts, styles, fonts, images, frames)");
  // S6 F3: one common.js module instance per page (no cache-busted second URL)
  const busted = [];
  const walkHtml = (dir) => {
    for (const n of readdirSync(dir)) {
      const fp = join(dir, n);
      if (statSync(fp).isDirectory()) walkHtml(fp);
      else if (n.endsWith(".html") && readFileSync(fp, "utf8").includes("common.js?h=")) busted.push(fp.slice(ROOT.length));
    }
  };
  walkHtml(p("public"));
  busted.length ? bad("V S6 F3: no common.js?h= in public/", busted.slice(0, 10)) : ok("V S6 F3: no common.js?h= in public/");
} else {
  note("public/", "not built – run zola build first to include this check");
}

console.log(`\n${pass} passed, ${fail} failed, ${warn} warnings`);
process.exit(fail ? 1 : 0);
