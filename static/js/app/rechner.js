// Calculator: Mietspiegel row + Orientierungshilfe netting, step by step.
import { boot, store, h, paras, de, bdi, expr, field, callout, step, mount, fatal, id, liveStatus, markInvalid, reloadAfterClear } from "./common.js";
import { scopeForm, scopeState, scopeNotice, readScope } from "./scope.js";
import {
  findRow, evaluate, featureApplies, blockedBy, exclusiveConflicts, disputes, featureIndex, energyBoxes, expandKennwert,
} from "../lib/mietspiegel.js";
import { chooseMietspiegel, contestedYear } from "../lib/check558.js";
import { parseNumber, eur, num, round, localDate } from "../lib/money.js";
import { isValid } from "../lib/dates.js";

const root = document.getElementById("app");
const { cfg, data, t, c, cl, lang } = await boot(["ms2026", "ms2024", "rules"]);
const MS = {};
if (data.ms2026) MS[2026] = data.ms2026;
if (data.ms2024) MS[2024] = data.ms2024;
const years = Object.keys(MS).map(Number).sort((a, b) => b - a);

const DEFAULTS = { date: "", year: years[0], wohnlage: "", baualter: "", area: "", minder: false, compare: false, demanded: "", feats: {} };
let s = { ...DEFAULTS, ...store.get("calc") };
if (!MS[s.year]) s.year = years[0];
s.feats = s.feats || {};

const ms = () => MS[s.year];
/** Cases outside the Berlin Mietspiegel (Nr. 3), asked before any result. */
const CALC_SCOPE = ["sozial", "gefoerdert", "efh", "neubau", "wc_out"];
const fmtEur = (x) => eur(x, lang);
const fmtNum = (x, d = 2) => num(x, lang, d);
const ftitle = (f) => c(`features.${f.id}.title`);
const gtitle = (g) => c(`groups.${g.id}.title`) || g.label_de;
const feat = (fid) => (s.feats[fid] ||= { me: false, ll: false, self: false });
const area = () => parseNumber(s.area);

function save() {
  store.set("calc", s);
  const r = calcScope() === "open" ? compute() : null;
  store.set("calcResult", r && r.row ? {
    year: s.year, row: r.row.row, wohnlage: s.wohnlage, baualter: s.baualter, area: area(),
    ovm_per_sqm: r.mine.ovm, monthly: r.mine.monthly,
    landlord: r.landlord ? { ovm_per_sqm: r.landlord.ovm, monthly: r.landlord.monthly } : null,
    disputes: r.disp, compare: s.compare,
  } : null);
}

function selected(who) {
  const out = [];
  for (const g of ms().groups) for (const f of g.features) {
    const st = s.feats[f.id];
    if (!st || !st[who] || !featureApplies(f, s.baualter)) continue;
    if (who === "me" && f.sign > 0 && st.self) continue; // tenant-installed equipment does not count
    out.push(f.id);
  }
  return expandKennwert(ms(), out); // kennwert boxes are cumulative (Nr. 10.4 A)
}

function compute() {
  const m = ms();
  const a = area();
  if (data.rules && isValid(s.date) && !chooseMietspiegel(data.rules, s.date)) return { row: null, noEdition: true };
  if (!m || !s.wohnlage || !s.baualter || !(a > 0)) return null;
  // Nr. 9: the tables apply only to fully equipped flats; Nr. 9.4 has an amount only for some Baualter
  if (s.minder && !(m.abschlag && (m.abschlag.baualter || []).includes(s.baualter))) return { row: null, minderOutside: true };
  const row = findRow(m, { wohnlage: s.wohnlage, baualter: s.baualter, area: a });
  if (!row) return { row: null };
  const opts = { baualter: s.baualter, area: a, minder: s.minder };
  const mine = evaluate(m, row.cell, selected("me"), opts);
  const landlord = s.compare ? evaluate(m, row.cell, selected("ll"), opts) : null;
  const disp = s.compare ? disputes(m, selected("me"), selected("ll")) : null;
  return { row, mine, landlord, disp };
}

/* ---------------- step 1: which Mietspiegel ---------------- */
const yearStatus = h("p", { class: "field__hint", role: "status", "aria-live": "polite" });
const yearNewer = h("div", { "aria-live": "polite" });
let shownNewer = null; // yearNewer is only re-mounted when its warning changes
const yearRadios = {};

/** A newer Mietspiegel a court may also use for this date of receipt (rules.json contested_window). */
function newerEdition(date, year) {
  const y = data.rules ? contestedYear(data.rules, date) : null;
  return y && y !== year && MS[y] ? y : null;
}

/** Show the newer-edition warning; rebuilt only when it changes so the live region is not re-read. */
function showNewer(n, y) {
  const key = n ? `${n} ${y}` : "";
  if (key === shownNewer) return;
  shownNewer = key;
  mount(yearNewer, n ? callout("warn", null, h("p", {}, t("calc_year_newer", { newer: n, stichtag: localDate(MS[n].stichtag, lang), year: y }))) : null);
}

function setYearFromDate() {
  if (!data.rules || !isValid(s.date)) { showNewer(null); yearStatus.textContent = ""; return; }
  const y = chooseMietspiegel(data.rules, s.date);
  if (y && MS[y]) {
    if (s.year !== y) { switchYear(y); }
    yearRadios[y].checked = true;
    yearStatus.textContent = t("calc_year_auto", { year: y });
    showNewer(newerEdition(s.date, y), y);
  } else {
    showNewer(null);
    yearStatus.textContent = t("calc_year_none");
  }
}

function stepYear() {
  const dateIn = h("input", { type: "date", value: s.date, oninput: (e) => { s.date = e.target.value; setYearFromDate(); save(); update(); } });
  const fs = h("fieldset", {}, h("legend", {}, t("calc_year_legend")),
    h("div", { class: "choices--inline" }, years.map((y) => {
      const r = h("input", { type: "radio", name: "year", value: String(y), checked: s.year === y,
        onchange: () => {
          switchYear(y);
          const need = data.rules && isValid(s.date) ? chooseMietspiegel(data.rules, s.date) : null;
          yearStatus.textContent = need && need !== y && newerEdition(s.date, need) !== y ? t("chk_calc_year_mismatch", { calc: y, need }) : "";
          save(); update();
        } });
      yearRadios[y] = r;
      return h("label", { class: "choice" }, r, h("span", {}, MS[y].title_de, " ", h("small", {}, t("calc_year_valid_from", { date: localDate(MS[y].valid_from, lang) }))));
    })));
  return step(1, t("calc_step_year"),
    paras(t("calc_year_intro")),
    field({ label: t("calc_date_label"), hint: t("calc_date_hint"), input: dateIn }),
    yearStatus,
    yearNewer,
    fs);
}

/* ---------------- step 2: the flat ---------------- */
const baualterSel = h("select", { dir: "ltr" }); // official German labels (each option has lang="de")
const baualterNew = h("p", { class: "field__hint" });
const minderBox = h("div", {});

/** First year of completion that the edition no longer covers (e.g. 2025 for the Mietspiegel 2026). */
function firstUncoveredYear() {
  const ys = ms().dims.baualter.map((b) => Number((/(\d{4})\D*$/.exec(b.id) || [])[1])).filter(Boolean);
  return ys.length ? Math.max(...ys) + 1 : null;
}
const areaIn = h("input", { type: "text", inputmode: "decimal", autocomplete: "off", value: s.area, size: 8 });

function fillBaualter() {
  const opts = [h("option", { value: "" }, t("calc_choose"))];
  let region = null;
  for (const b of ms().dims.baualter) {
    opts.push(h("option", { value: b.id, selected: b.id === s.baualter, lang: "de" }, b.label_de + (b.footnote_de ? " *" : "")));
    if (b.region) region = true;
  }
  baualterSel.replaceChildren(...opts);
  if (!ms().dims.baualter.some((b) => b.id === s.baualter)) { s.baualter = ""; baualterSel.value = ""; }
  const y = firstUncoveredYear();
  baualterNew.textContent = y ? t("calc_baualter_new", { year: y, ms: ms().title_de }) : "";
  return region;
}

function renderMinder() {
  const ab = ms().abschlag;
  if (!ab || !s.baualter) { minderBox.replaceChildren(); return; }
  const box = h("input", { type: "checkbox", checked: s.minder, onchange: (e) => { s.minder = e.target.checked; save(); update(); } });
  if (!(ab.baualter || []).includes(s.baualter)) {
    // no Nr. 9.4 amount for this Baualter: the box leads to "no value" (calc_minder_outside)
    mount(minderBox, h("label", { class: "choice" }, box, h("span", {}, t("calc_minder_outside_label"))));
    return;
  }
  mount(minderBox,
    h("label", { class: "choice" }, box, h("span", {}, t("calc_minder_label", { eur: fmtEur(ab.eur_per_sqm) }))),
    h("details", { class: "field__hint" }, h("summary", {}, t("official_wording")), paras(ab.text_de, { lang: "de", dir: "ltr", class: "official" })),
  );
}

function stepFlat() {
  const wl = h("fieldset", {}, h("legend", {}, t("calc_wohnlage_legend")),
    paras(t("calc_wohnlage_help"), { class: "field__hint" }),
    h("p", { class: "field__hint" }, h("a", { href: cfg.wohnlage_lookup_url, target: "_blank", rel: "noopener noreferrer" }, t("calc_wohnlage_link")), " ", t("opens_new_tab")),
    ms().dims.wohnlage.map((w) => h("label", { class: "choice" },
      h("input", { type: "radio", name: "wohnlage", value: w.id, checked: s.wohnlage === w.id, onchange: () => { s.wohnlage = w.id; save(); update(); } }),
      h("span", {}, t(`wohnlage_${w.id}`), " ", h("small", { lang: "de" }, `(${w.label_de})`)))));

  baualterSel.addEventListener("change", () => { s.baualter = baualterSel.value; renderMinder(); refreshChecklist(); save(); update(); });
  areaIn.addEventListener("input", () => { s.area = areaIn.value; save(); update(); });
  fillBaualter();
  renderMinder();
  return step(2, t("calc_step_flat"),
    h("div", { class: "callout" }, paras(t("calc_scope_intro")),
      scopeForm({ t, withAsk: false, items: CALC_SCOPE, onChange: () => { save(); update(); } })),
    wl,
    field({ label: t("calc_baualter_label"), hint: t("calc_baualter_hint"), input: baualterSel }),
    baualterNew,
    field({ label: t("calc_area_label"), hint: t("calc_area_hint"), input: areaIn }),
    minderBox);
}

/* ---------------- step 3: row ---------------- */
const rowBox = h("div", {});
const resultStatus = liveStatus();

function renderRow(r) {
  if (calcScope() !== "open") { mount(rowBox, h("p", { class: "field__hint" }, t("scope_results_hidden"))); return; }
  if (!r) { rowBox.replaceChildren(h("p", { class: "field__hint" }, t("calc_row_incomplete"))); return; }
  if (r.noEdition) { rowBox.replaceChildren(callout("warn", t("calc_year_none"))); return; }
  if (r.minderOutside) { rowBox.replaceChildren(callout("warn", t("calc_minder_outside"))); return; }
  if (!r.row) { rowBox.replaceChildren(callout("warn", t("calc_row_none"), h("p", {}, t("calc_row_none_hint")))); return; }
  const { cell } = r.row;
  const b = ms().dims.baualter.find((x) => x.id === s.baualter);
  rowBox.replaceChildren(h("div", { class: "row-card" },
    h("p", { class: "small" }, t("calc_row_found", { row: r.row.row }), " · ", de("span", `${MS[s.year].title_de}, ${r.row.flaeche.label_de}, ${b ? b.label_de : ""}`)),
    h("div", { class: "span-bar" },
      h("div", {}, h("span", { class: "span-bar__k" }, t("lower")), h("span", { class: "span-bar__v" }, bdi(fmtEur(cell.lower)))),
      h("div", { class: "is-mean" }, h("span", { class: "span-bar__k" }, t("mean")), h("span", { class: "span-bar__v" }, bdi(fmtEur(cell.mean)))),
      h("div", {}, h("span", { class: "span-bar__k" }, t("upper")), h("span", { class: "span-bar__v" }, bdi(fmtEur(cell.upper))))),
    h("p", { class: "small" }, t("calc_row_per_sqm_note")),
    b && b.footnote_de ? h("p", { class: "small" }, "* ", de("span", b.footnote_de)) : null));
}

/* ---------------- step 4: features ---------------- */
const checklist = h("div", {});
const items = new Map(); // id → {li, me, ll, self, why}
const tallies = new Map(); // group id → span

function featureItem(f) {
  const st = feat(f.id);
  const titleId = id("ft");
  const title = ftitle(f);
  const meLbl = id("lbl"), llLbl = id("lbl");
  const whyId = id("why");
  const me = h("input", { type: "checkbox", checked: st.me, "aria-labelledby": `${meLbl} ${titleId}`, "aria-describedby": whyId,
    onchange: (e) => { st.me = e.target.checked; cascadeKennwert(f, "me", st.me); save(); refreshChecklist(); update(); } });
  const ll = h("input", { type: "checkbox", checked: st.ll, "aria-labelledby": `${llLbl} ${titleId}`, "aria-describedby": whyId,
    onchange: (e) => { st.ll = e.target.checked; cascadeKennwert(f, "ll", st.ll); save(); refreshChecklist(); update(); } });
  const selfLbl = id("lbl");
  const self = f.sign > 0 ? h("input", { type: "checkbox", checked: st.self, "aria-labelledby": `${selfLbl} ${titleId}`, onchange: (e) => { st.self = e.target.checked; save(); update(); } }) : null;
  const why = h("p", { class: "check-item__why", id: whyId, hidden: true });

  const explain = c(`features.${f.id}.explain`), chk = c(`features.${f.id}.check`), proof = c(`features.${f.id}.proof`);
  const more = (explain || chk || proof) ? h("details", { class: "feature__more" }, h("summary", {}, t("feature_more")),
    h("dl", {},
      explain ? [h("dt", {}, t("feature_explain")), h("dd", cl, paras(explain))] : null,
      chk ? [h("dt", {}, t("feature_check")), h("dd", cl, paras(chk))] : null,
      proof ? [h("dt", {}, t("feature_proof")), h("dd", cl, paras(proof))] : null)) : null;

  const li = h("li", { class: "check-item", dataset: { id: f.id } },
    h("div", { class: "check-item__main" },
      h("span", { class: `badge badge--${f.sign > 0 ? "plus" : "minus"}` }, h("span", { "aria-hidden": "true" }, f.sign > 0 ? "+" : "−"), h("span", { class: "visually-hidden" }, t(f.sign > 0 ? "plus_short" : "minus_short"))),
      title ? h("p", { class: "check-item__title", id: titleId, ...cl }, title) : de("p", f.text_de, { class: "check-item__title", id: titleId }),
      title ? h("p", { class: "official", lang: "de", dir: "ltr" }, h("span", { class: "official__label", lang, dir: cfg.dir }, t("official_wording")), f.text_de) : null,
      f.footnote_de ? de("p", f.footnote_de, { class: "feature__cond" }) : null,
      // ambiguous or partial scope notes the calculator cannot apply by itself (data field note_de)
      f.note_de ? h("p", { class: "callout callout--warn check-item__note" }, t(f.excl && f.sign < 0 ? "calc_energy_denkmal" : "calc_condition_check"), " ", de("span", f.note_de)) : null,
      more, why),
    h("div", { class: "check-item__toggle" }, h("label", {}, me, h("span", { id: meLbl }, t("calc_col_me")))),
    h("div", { class: "check-item__toggle check-item__ll" }, h("label", {}, ll, h("span", { id: llLbl }, t("calc_col_ll")))),
    self ? h("label", { class: "choice check-item__self", hidden: !st.me }, self, h("span", { id: selfLbl }, t("calc_self_installed"))) : null);
  items.set(f.id, { li, me, ll, self, why, f });
  return li;
}

/** Kennwert boxes are cumulative (Nr. 10.4 A): ticking one also ticks the weaker ones in the same
 *  column, unticking one also unticks the stronger ones. */
function cascadeKennwert(f, who, on) {
  const kind = (g) => (typeof g.kwh_gt === "number" ? "gt" : typeof g.kwh_lt === "number" ? "lt" : null);
  const k = kind(f);
  if (!k) return;
  const limit = (g) => (k === "gt" ? g.kwh_gt : g.kwh_lt);
  for (const [fid, it] of items) {
    if (fid === f.id || kind(it.f) !== k) continue;
    const weaker = k === "gt" ? limit(it.f) < limit(f) : limit(it.f) > limit(f);
    if (on === weaker) { feat(fid)[who] = on; it[who].checked = on; }
  }
}

function energyHelper(group) {
  if (!group.features.some((f) => typeof f.kwh_gt === "number" || typeof f.kwh_lt === "number")) return null;
  const val = h("input", { type: "text", inputmode: "decimal", size: 6 });
  const bedarf = h("input", { type: "checkbox" });
  const water = h("input", { type: "checkbox" });
  const out = h("p", { class: "status", role: "status", "aria-live": "polite" });
  const apply = () => {
    const v = parseNumber(val.value);
    if (!(v > 0)) { out.textContent = t("calc_energy_invalid"); return; }
    const hits = new Set(energyBoxes(ms(), { value: v, bedarf: bedarf.checked, addWater: water.checked }));
    for (const f of group.features) {
      if (!f.excl) continue;
      const st = feat(f.id);
      // a valid Dämmung/Heizanlage box stays unless the value gives a kennwert box of the same set
      st.me = f.excl.part === "kennwert" ? hits.has(f.id)
        : st.me && ![...hits].some((hid) => items.get(hid)?.f.excl?.set === f.excl.set);
    }
    for (const [fid, it] of items) if (it.f.excl) it.me.checked = feat(fid).me;
    out.textContent = t("calc_energy_done", { n: hits.size });
    save(); refreshChecklist(); update();
  };
  const denkmal = (group.notes_de || []).find((n) => /denkmal/i.test(n));
  const waterNote = (group.notes_de || []).find((n) => /Warmwasser/.test(n) && /20 kWh/.test(n));
  return h("details", { class: "callout" },
    h("summary", {}, t("calc_energy_summary")),
    paras(t("calc_energy_intro")),
    field({ label: t("calc_energy_value"), input: val }),
    h("label", { class: "choice" }, bedarf, h("span", {}, t("calc_energy_bedarf"))),
    h("label", { class: "choice" }, water, h("span", {}, t(waterNote && /ohne Berücksichtigung/.test(waterNote) ? "calc_energy_water_excl" : "calc_energy_water"),
      waterNote ? [h("br"), h("small", { class: "official", lang: "de", dir: "ltr" }, waterNote)] : null)),
    h("div", { class: "btn-row" }, h("button", { type: "button", class: "btn btn--secondary", onclick: apply }, t("calc_energy_apply"))),
    out,
    denkmal ? h("p", { class: "field__hint" }, t("calc_energy_denkmal"), " ", de("span", denkmal, { class: "official" })) : null);
}

function buildChecklist() {
  items.clear();
  tallies.clear();
  const compareBox = h("input", { type: "checkbox", checked: s.compare,
    onchange: (e) => { s.compare = e.target.checked; checklist.classList.toggle("compare-on", s.compare); save(); update(); } });
  checklist.className = s.compare ? "compare-on" : "";
  mount(checklist,
    recheck && recheck.year === s.year
      ? callout("warn", t("calc_year_recheck", { ms: ms().title_de }),
        h("ul", {}, recheck.ids.map((fid) => { const f = featureIndex(ms()).get(fid); return h("li", {}, ftitle(f) || de("span", f.text_de)); })))
      : null,
    paras(t("calc_features_intro")),
    callout("warn", t("calc_self_title"), h("p", {}, t("calc_self_text"))),
    h("label", { class: "choice" }, compareBox, h("span", {}, t("calc_compare_label"))),
    h("p", { class: "field__hint" }, t("calc_compare_hint")),
    ms().groups.map((g) => {
      const tally = h("span", { class: "checklist-group__tally" });
      tallies.set(g.id, tally);
      const intro = c(`groups.${g.id}.intro`);
      return h("details", { class: "checklist-group", open: true },
        h("summary", {}, h("span", cl, gtitle(g)), tally),
        intro ? h("div", { class: "prose", ...cl }, paras(intro)) : null,
        g.id === "gebaeude" ? energyHelper(g) : null,
        g.notes_de && g.notes_de.length ? h("details", { class: "field__hint" }, h("summary", {}, t("official_notes")),
          h("ul", { class: "official", lang: "de", dir: "ltr" }, g.notes_de.map((n) => h("li", {}, n)))) : null,
        h("div", { class: "checklist-head", "aria-hidden": "true" }, h("span", {}, t("calc_col_feature")), h("span", {}, t("calc_col_me")), h("span", {}, t("calc_col_ll"))),
        h("ul", { class: "feature-list" }, g.features.map(featureItem)));
    }));
  refreshChecklist();
}

function refreshChecklist() {
  const mine = Object.keys(s.feats).filter((k) => s.feats[k].me);
  for (const [fid, it] of items) {
    const st = feat(fid);
    const applies = featureApplies(it.f, s.baualter);
    const blocked = applies ? blockedBy(ms(), fid, mine) : [];
    let reason = "";
    if (!applies) reason = t("calc_not_for_baualter");
    else if (blocked.length && !st.me) reason = t("calc_exclusive_blocked");
    it.me.disabled = !applies || (blocked.length > 0 && !st.me);
    it.ll.disabled = !applies;
    it.why.textContent = reason;
    it.why.hidden = !reason;
    it.li.classList.toggle("is-disabled", !applies);
    if (it.self) it.self.closest("label").hidden = !st.me;
    it.li.classList.toggle("is-dispute", s.compare && applies && st.me !== st.ll);
  }
}

/* ---------------- step 5: result ---------------- */
const resultBox = h("div", {});

function signLabel(sign) {
  return t(sign > 0 ? "calc_group_plus" : sign < 0 ? "calc_group_minus" : "calc_group_zero");
}

function badge(sign) {
  return h("span", { class: `badge badge--${sign > 0 ? "plus" : sign < 0 ? "minus" : "zero"}` }, signLabel(sign));
}

/** Mietspiegel scope for the calculator: results are hidden if a case outside the Mietspiegel is ticked. */
function calcScope() {
  return scopeState(readScope(), { withAsk: false, items: CALC_SCOPE });
}

function calcLines(ev, cell, a) {
  const lines = [[t("calc_line_mean"), fmtEur(cell.mean)]];
  if (ev.net > 0) lines.push([t("calc_line_span_up"), `${fmtEur(cell.upper)} − ${fmtEur(cell.mean)} = ${fmtEur(ev.spanUp)}`]);
  if (ev.net < 0) lines.push([t("calc_line_span_down"), `${fmtEur(cell.mean)} − ${fmtEur(cell.lower)} = ${fmtEur(ev.spanDown)}`]);
  lines.push([t("calc_line_delta", { net: ev.net }), `${ev.net} × 20 % × ${fmtEur(ev.span)} = ${fmtEur(ev.delta)}`]);
  lines.push([t("calc_line_ovm_table"), fmtEur(ev.ovmTable)]);
  if (ev.abschlagApplies) lines.push([t("calc_line_abschlag"), `− ${fmtEur(ev.abschlag)}`]);
  return lines;
}

function renderResult(r) {
  if (calcScope() !== "open") { mount(resultBox, scopeNotice(calcScope(), { t, cfg })); return; }
  if (!r || !r.row) { resultBox.replaceChildren(h("p", { class: "field__hint" }, t("calc_result_wait"))); return; }
  const { mine, landlord, row } = r;
  const a = area();
  const cmp = Boolean(landlord);

  const groupsTable = h("table", { class: "calc-table" },
    h("caption", {}, t("calc_result_groups")),
    h("thead", {}, h("tr", {}, h("th", { scope: "col" }, t("calc_col_group")), h("th", { scope: "col" }, "+"), h("th", { scope: "col" }, "−"),
      h("th", { scope: "col" }, cmp ? t("calc_result_mine") : t("calc_col_result")),
      cmp ? h("th", { scope: "col" }, t("calc_result_landlord")) : null)),
    h("tbody", {}, mine.groups.map((g, i) => h("tr", {},
      h("th", { scope: "row" }, gtitle(ms().groups[i])),
      h("td", {}, bdi(String(g.plus.length))), h("td", {}, bdi(String(g.minus.length))),
      h("td", {}, badge(g.sign)),
      cmp ? h("td", {}, badge(landlord.groups[i].sign)) : null))),
    h("tfoot", {}, h("tr", {}, h("td", { colspan: 3 }, t("calc_net")), h("td", {}, bdi(`${mine.net > 0 ? "+" : ""}${mine.net}`)),
      cmp ? h("td", {}, bdi(`${landlord.net > 0 ? "+" : ""}${landlord.net}`)) : null)));

  const lines = calcLines(mine, row.cell, a);
  const linesTable = h("table", { class: "calc-table" },
    h("caption", {}, t("calc_result_steps")),
    h("tbody", {}, lines.map(([k, v]) => h("tr", {}, h("th", { scope: "row" }, k), h("td", {}, expr(v))))),
    h("tfoot", {}, h("tr", {}, h("td", {}, t("calc_line_ovm")), h("td", {}, bdi(fmtEur(mine.ovm)))),
      h("tr", {}, h("td", {}, t("calc_line_monthly", { area: fmtNum(a, a % 1 ? 2 : 0) })), h("td", {}, expr(`${fmtNum(a, a % 1 ? 2 : 0)} m² × ${fmtEur(mine.ovm)} = ${fmtEur(mine.monthly)}`)))));

  const conflictsMine = mine.conflicts.length ? callout("danger", t("calc_conflict_mine")) : null;
  const conflictsLl = landlord && landlord.conflicts.length ? callout("warn", t("calc_conflict_landlord"), h("p", {}, t("calc_conflict_landlord_text"))) : null;

  let dispBox = null;
  if (r.disp) {
    const idx = featureIndex(ms());
    const list = (ids) => h("ul", {}, ids.map((fid) => { const f = idx.get(fid); return h("li", {}, ftitle(f) || de("span", f.text_de)); }));
    const parts = [];
    if (r.disp.disputedPlus.length) parts.push(h("h4", {}, t("calc_disp_plus")), list(r.disp.disputedPlus));
    if (r.disp.missingMinus.length) parts.push(h("h4", {}, t("calc_disp_minus")), list(r.disp.missingMinus));
    if (r.disp.disputedMinus.length || r.disp.missingPlus.length) parts.push(h("p", { class: "field__hint" }, t("calc_disp_other", { n: r.disp.disputedMinus.length + r.disp.missingPlus.length })));
    dispBox = parts.length ? h("div", {}, h("h3", {}, t("calc_disp_title")), ...parts) : h("p", {}, t("calc_disp_none"));
  }

  resultBox.replaceChildren(h("div", { class: "result" },
    h("h3", {}, t("calc_result_title")),
    h("p", { class: "result__big" }, h("span", { class: "mark" }, bdi(fmtEur(mine.ovm))), " ", h("small", {}, t("per_sqm"))),
    h("p", {}, t("calc_result_monthly", { area: fmtNum(a, a % 1 ? 2 : 0) }), " ", h("strong", {}, bdi(fmtEur(mine.monthly)))),
    landlord ? h("p", {}, t("calc_result_landlord_value"), " ", h("strong", {}, bdi(`${fmtEur(landlord.ovm)} / m² · ${fmtEur(landlord.monthly)}`))) : null,
    conflictsMine, conflictsLl,
    groupsTable, linesTable,
    mine.abschlagApplies ? h("p", { class: "small" }, t("calc_abschlag_note")) : null,
    h("p", { class: "small" }, t("calc_oh_note")),
    Math.abs(mine.net) >= 2 ? h("p", { class: "small" }, t("calc_rounding_note")) : null,
    dispBox));
}

/* ---------------- step 6: compare with demanded rent ---------------- */
const demandBox = h("div", {});
const demandIn = h("input", { type: "text", inputmode: "decimal", autocomplete: "off", value: s.demanded, size: 10 });

function renderDemand(r) {
  const d = parseNumber(s.demanded);
  if (calcScope() !== "open" || !r || !r.row || d === null) { demandBox.replaceChildren(); return; }
  const a = area();
  const diff = round(d - r.mine.monthly);
  const perSqm = round(d / a);
  if (perSqm < 1) { demandBox.replaceChildren(callout("warn", t("calc_demand_implausible"))); return; }
  const over = diff > 0;
  demandBox.replaceChildren(callout(over ? "danger" : "ok",
    over ? t("calc_demand_over", { diff: fmtEur(diff) }) : t("calc_demand_within"),
    h("p", {}, t("calc_demand_detail", { demanded: fmtEur(d), per_sqm: fmtEur(perSqm), ovm: fmtEur(r.mine.ovm), monthly: fmtEur(r.mine.monthly) })),
    h("p", {}, t("calc_demand_cap_hint"))));
}

function stepNext() {
  demandIn.addEventListener("input", () => { s.demanded = demandIn.value; save(); update(); });
  const links = [];
  if (cfg.pages.pruefen) links.push(h("a", { class: "btn", href: cfg.pages.pruefen }, t("calc_to_check")));
  if (cfg.pages.brief) links.push(h("a", { class: "btn btn--secondary", href: cfg.pages.brief }, t("calc_to_letter")));
  links.push(h("button", { type: "button", class: "btn btn--quiet", onclick: () => window.print() }, t("print")));
  return step(6, t("calc_step_compare"),
    field({ label: t("calc_demand_label"), hint: t("calc_demand_hint"), input: demandIn }),
    demandBox,
    h("div", { class: "btn-row" }, links),
    h("p", { class: "store-note" }, t("store_note")));
}

/* ---------------- wiring ---------------- */
function update() {
  const r = compute();
  renderRow(r);
  renderResult(r);
  renderDemand(r);
  markInvalid(areaIn, s.area.trim() !== "" && area() === null, t("chk_invalid_number"));
  markInvalid(demandIn, s.demanded.trim() !== "" && parseNumber(s.demanded) === null, t("chk_invalid_number"));
  const d = parseNumber(s.demanded);
  resultStatus.say(calcScope() === "open" && r && r.row
    ? [`${fmtEur(r.mine.ovm)} ${t("per_sqm")}`, `${t("calc_result_monthly", { area: fmtNum(area(), area() % 1 ? 2 : 0) })} ${fmtEur(r.mine.monthly)}`,
      d === null ? "" : round(d / area()) < 1 ? t("calc_demand_implausible")
        : d - r.mine.monthly > 0 ? t("calc_demand_over", { diff: fmtEur(round(d - r.mine.monthly)) }) : t("calc_demand_within")].filter(Boolean).join(". ")
    : "");
  if (ms()) for (const g of ms().groups) {
    const el = tallies.get(g.id);
    if (!el) continue;
    const mine = selected("me");
    const p = g.features.filter((f) => f.sign > 0 && mine.includes(f.id)).length;
    const m = g.features.filter((f) => f.sign < 0 && mine.includes(f.id)).length;
    el.textContent = t("calc_tally", { plus: p, minus: m });
  }
}

/* ---------------- year switch ---------------- */
let recheck = null; // {year, ids}: ticked features whose wording differs in the edition switched to
const normText = (x) => (x || "").toLowerCase().replace(/\s+/g, "").replace(/[‐‑‒–—―-]/g, "-");

function switchYear(y) {
  const from = MS[s.year], to = MS[y];
  const ids = [];
  if (from && to && s.year !== y) {
    const a = featureIndex(from), b = featureIndex(to);
    for (const [fid, st] of Object.entries(s.feats)) {
      if ((st.me || st.ll) && a.has(fid) && b.has(fid) && normText(a.get(fid).text_de) !== normText(b.get(fid).text_de)) ids.push(fid);
    }
  }
  recheck = ids.length ? { year: y, ids } : null;
  s.year = y;
  rebuildForYear();
}

function rebuildForYear() {
  fillBaualter();
  renderMinder();
  buildChecklist();
}

if (!years.length) {
  fatal(root, t);
} else {
  // prefill from the § 558 check if the user came from there
  const chk = store.get("check");
  if (!s.demanded && chk.demanded_rent) s.demanded = String(chk.demanded_rent);
  if (!s.area && chk.area) s.area = String(chk.area);
  if (!s.date && chk.received) s.date = chk.received;
  demandIn.value = s.demanded;
  areaIn.value = s.area;

  buildChecklist();
  mount(root,
    stepYear(),
    stepFlat(),
    step(3, t("calc_step_row"), rowBox),
    step(4, t("calc_step_features"), checklist),
    step(5, t("calc_step_result"), resultStatus.el, resultBox),
    stepNext());
  setYearFromDate();
  update();
  document.addEventListener("msh:cleared", () => { s = { ...DEFAULTS, feats: {} }; reloadAfterClear(); });
}
