// § 558 BGB check page: form in the user's language, result with legal basis from rules.json.
import { boot, store, h, paras, bdi, expr, field, callout, step, mount, fatal, reloadAfterClear, liveStatus, markInvalid } from "./common.js";
import { scopeForm, scopeState, scopeNotice, scopeShowsResults, readScope } from "./scope.js";
import { check, contestedYear } from "../lib/check558.js";
import { parseNumber, eur, pct, localDate, num } from "../lib/money.js";

const root = document.getElementById("app");
const { cfg, data, t, c, cl, lang } = await boot(["rules"]);
const rules = data.rules;

const FIELDS = [
  { id: "received", type: "date", required: true },
  { id: "demanded_rent", type: "money", required: true },
  { id: "current_rent", type: "money", required: true },
  { id: "requested_effective", type: "date" },
  { id: "area", type: "area" },
  { id: "last_change", type: "date" },
  { id: "rent_3y_ago", type: "money" },
  { id: "increases_559_560", type: "money" },
  { id: "ovm_per_sqm", type: "money" },
];

let s = { ...store.get("check") };
const calc = store.get("calcResult") || {};
const fmtEur = (x) => eur(x, lang);
const d = (iso) => localDate(iso, lang);

const unreadable = new Set(); // number fields whose text parseNumber cannot read

function input() {
  const out = {};
  unreadable.clear();
  for (const f of FIELDS) {
    const v = s[f.id];
    if (v === undefined || v === "") continue;
    out[f.id] = f.type === "date" ? v : parseNumber(v);
    if (f.type !== "date" && out[f.id] === null && String(v).trim() !== "") unreadable.add(f.id);
  }
  if (s.lwu) out.lwu = true;
  return out;
}

/** aria-invalid + error text on every number field that could not be read. */
function markFields() {
  for (const f of FIELDS) {
    if (f.type === "date") continue;
    const el = root.querySelector(`[data-field="${f.id}"]`);
    if (el) markInvalid(el, unreadable.has(f.id), t("chk_invalid_number"));
  }
}

/** Label/explanation for an output key: content text (rules.<key>) first, UI fallback. */
const label = (key) => c(`rules.${key}.title`) || t(`chk_out_${key}`);

function sourceLink(srcId) {
  const src = rules.sources && rules.sources[srcId];
  if (!src) return null;
  return h("span", { class: "source" }, t("legal_basis"), " ",
    h("a", { href: src.url, target: "_blank", rel: "noopener noreferrer", lang: "de", dir: "ltr" }, src.label),
    src.checked ? ` (${t("checked_on", { date: localDate(src.checked, lang) })})` : "");
}

function fact(key, value, srcId, ...extra) {
  const text = c(`rules.${key}.text`);
  return h("div", {},
    h("dt", {}, label(key)),
    h("dd", {}, h("strong", {}, bdi(value)), ...extra,
      text ? h("details", {}, h("summary", {}, t("explain_more")), h("div", cl, paras(text))) : null,
      sourceLink(srcId)));
}

/* ---------------- step 1: scope ---------------- */
const scopeBox = h("div", { "aria-live": "polite" });
let shownState = null; // scopeBox is only re-mounted when the scope state changes
function scope() { return scopeState(readScope(), { withAsk: true }); }

/* ---------------- step 2: form ---------------- */
const hints = {}; // field id → hint element (for dynamic hints)

function formStep() {
  const inputs = FIELDS.map((f) => {
    const el = f.type === "date"
      ? h("input", { type: "date", value: s[f.id] || "", required: f.required || null })
      : h("input", { type: "text", inputmode: "decimal", autocomplete: "off", size: 10, value: s[f.id] || "", required: f.required || null });
    el.addEventListener("input", () => { s[f.id] = el.value; store.set("check", s); update(); });
    const lbl = c(`checker.${f.id}`) || t(`chk_in_${f.id}`);
    const hint = c(`checker.${f.id}_help`) || t(`chk_in_${f.id}_hint`);
    const wrap = field({ label: lbl + (f.required ? "" : ` (${t("optional")})`), hint, input: el });
    hints[f.id] = wrap.querySelector(".field__hint");
    if (f.id === "ovm_per_sqm") {
      if (typeof calc.ovm_per_sqm === "number") {
        wrap.append(h("p", { class: "field__hint" },
          h("button", { type: "button", class: "btn btn--secondary", onclick: () => {
            el.value = num(calc.ovm_per_sqm, "de"); s.ovm_per_sqm = el.value;
            if (!s.area && calc.area) { s.area = num(calc.area, "de"); root.querySelector('[data-field="area"]').value = s.area; }
            store.set("check", s); update();
          } }, t("chk_take_from_calc", { value: fmtEur(calc.ovm_per_sqm), year: calc.year }))));
      } else if (cfg.pages.rechner) {
        wrap.append(h("p", { class: "field__hint" }, h("a", { href: cfg.pages.rechner }, t("chk_go_calc"))));
      }
    }
    el.dataset.field = f.id;
    return wrap;
  });
  const lwuNames = ((rules.lwu || {}).companies || []).join(", ");
  const lwuBox = rules.lwu ? h("label", { class: "choice" },
    h("input", { type: "checkbox", checked: Boolean(s.lwu), onchange: (e) => { s.lwu = e.target.checked; store.set("check", s); update(); } }),
    h("span", {}, t("chk_in_lwu"), " ", h("small", { lang: "de" }, `(${lwuNames})`))) : null;
  const disclaimer = c("checker.disclaimer");
  return step(2, t("chk_step_input"), paras(c("checker.intro") || t("chk_intro")),
    disclaimer ? callout("warn", null, paras(disclaimer)) : null,
    h("form", { onsubmit: (e) => e.preventDefault(), novalidate: true }, inputs, lwuBox));
}

/** Rent-3-years-ago hint with the concrete date (needs the date the new rent applies). */
function updateDynamicHints(r) {
  const el = hints.rent_3y_ago;
  if (!el) return;
  const base = c("checker.rent_3y_ago_help", { date3y: r && r.base_date ? d(r.base_date) : "…" }) || t("chk_in_rent_3y_ago_hint");
  el.textContent = r && r.base_date && !c("checker.rent_3y_ago_help") ? `${t("chk_rent_3y_date", { date: d(r.base_date) })} ${base}` : base;
}

/* ---------------- step 3: results ---------------- */
const out = h("div", {});
const status = liveStatus(); // short findings summary for screen readers

const KIND = {
  sperrfrist_fail: "danger", over_cap: "danger", over_ovm: "danger", over_lwu: "danger",
  wartefrist_postponed: "warn", requested_too_early: "warn", no_ovm: "warn", need_rent_3y: "warn", no_last_change: "warn",
  within_limits: "ok",
};

function findingVars(r, inp) {
  return {
    max_rent: fmtEur(r.max_rent), cap_rent: fmtEur(r.cap_rent), ovm_rent: fmtEur(r.ovm_rent),
    over: fmtEur(r.demanded_over_max), effective: d(r.effective), pay_from: d(r.pay_from),
    consent_deadline: d(r.consent_deadline), demanded: fmtEur(inp.demanded_rent),
    rate: pct(r.kappung_rate, lang, 0), lwu_cap: fmtEur(r.lwu_cap_rent), base_date: d(r.base_date), date3y: d(r.base_date),
  };
}

function renderFindings(r, inp) {
  const vars = findingVars(r, inp);
  return h("ul", { class: "findings" }, r.findings.map((fid) => {
    const title = c(`checker.result.${fid}.title`, vars) || t(`chk_find_${fid}`, vars);
    const own = c(`checker.result.${fid}.text`, vars);
    const fbKey = `chk_find_${fid}_text`;
    const fb = t(fbKey, vars);
    const text = own || (fb === fbKey ? "" : fb);
    const extra = fid === "no_ovm" && cfg.pages.rechner ? h("p", {}, h("a", { href: cfg.pages.rechner }, t("chk_go_calc"))) : null;
    return h("li", {}, callout(KIND[fid] || "warn", title, own ? h("div", cl, paras(text)) : paras(text), extra));
  }));
}

function update() {
  const state = scope();
  if (state !== shownState) { shownState = state; mount(scopeBox, scopeNotice(state, { t, cfg })); }
  const inp = input();
  markFields();
  if (!scopeShowsResults(state)) {
    updateDynamicHints(null);
    mount(out, h("p", { class: "field__hint" }, t(state === "not558" ? "scope_results_hidden" : "scope_unanswered")));
    store.set("checkResult", null);
    status.say("");
    return;
  }
  if (!inp.received) { updateDynamicHints(null); mount(out, h("p", { class: "field__hint" }, t("chk_need_received"))); status.say(""); return; }
  const r = check(inp, rules);
  const fvars = findingVars(r, inp);
  status.say(r.findings.map((fid) => c(`checker.result.${fid}.title`, fvars) || t(`chk_find_${fid}`, fvars)).join(". "));
  updateDynamicHints(r);
  store.set("checkResult", { ...r, input: inp, scope: state });
  const ruleSrc = (key) => ((rules.rules || []).find((x) => x.id === key) || {}).source || null;
  const src = (key) => (rules.dates && rules.dates[key] ? rules.dates[key].source : ruleSrc(key));

  const dates = h("dl", { class: "facts" },
    fact("consent_deadline", d(r.consent_deadline), src("consent_deadline"),
      r.consent_deadline_193 && r.consent_deadline_193 !== r.consent_deadline
        ? h("p", { class: "small" }, t("chk_consent_193", { date: d(r.consent_deadline_193) })) : null),
    fact("effective", d(r.effective), src("effective"),
      r.wartefrist_ok === false ? h("p", { class: "small" }, t("chk_effective_postponed", { regular: d(r.effective_regular) })) : null,
      r.pay_from && r.pay_from !== r.effective ? h("p", { class: "small" }, t("chk_pay_from_later", { date: d(r.pay_from) })) : null),
    "termination_safe_by" in r ? fact("termination_safe_by", d(r.termination_safe_by), src("termination_safe_by")) : null,
    r.termination_declare_by ? fact("termination_declare_by", d(r.termination_declare_by), src("termination_declare_by")) : null,
    r.termination_ends ? fact("termination_ends", d(r.termination_ends), src("termination_ends")) : null,
    r.sue_deadline ? fact("sue_deadline", d(r.sue_deadline), src("sue_deadline"),
      r.sue_deadline_unshifted && r.sue_deadline_unshifted !== r.sue_deadline
        ? h("p", { class: "small" }, t("chk_shifted_193", { date: d(r.sue_deadline_unshifted) })) : null) : null,
    r.sperrfrist_earliest_received ? fact("sperrfrist_earliest_received", d(r.sperrfrist_earliest_received), src("sperrfrist_earliest_received"),
      h("p", { class: "small" }, r.sperrfrist_ok ? t("chk_ok") : t("chk_not_ok"))) : null,
    r.wartefrist_earliest_effective ? fact("wartefrist_earliest_effective", d(r.wartefrist_earliest_effective), src("wartefrist_earliest_effective"),
      h("p", { class: "small" }, r.wartefrist_ok ? t("chk_ok") : t("chk_wartefrist_postpones"))) : null,
    r.mietspiegel_year ? fact("mietspiegel_choice", String(r.mietspiegel_year), rules.mietspiegel_choice && rules.mietspiegel_choice.source,
      calc.year && calc.year !== r.mietspiegel_year ? callout("warn", t("chk_calc_year_mismatch", { calc: calc.year, need: r.mietspiegel_year })) : null,
      contestedYear(rules, inp.received) && contestedYear(rules, inp.received) !== r.mietspiegel_year
        ? callout("warn", null, h("p", {}, t("chk_year_contested", { newer: contestedYear(rules, inp.received), year: r.mietspiegel_year }))) : null) : null,
  );

  const money = h("dl", { class: "facts" },
    typeof inp.current_rent === "number" && typeof inp.demanded_rent === "number"
      ? h("div", {}, h("dt", {}, t("chk_out_increase")), h("dd", {}, h("strong", {}, expr(`${fmtEur(inp.current_rent)} → ${fmtEur(inp.demanded_rent)} (${r.increase_pct > 0 ? "+" : ""}${pct(r.increase_pct, lang)})`)))) : null,
    r.cap_rent !== null ? fact("kappung", fmtEur(r.cap_rent), r.kappung_source,
      h("p", { class: "small" }, t("chk_cap_formula", { base: fmtEur(r.base_rent), rate: pct(r.kappung_rate, lang, 0), inc: fmtEur(inp.increases_559_560 ?? 0) })),
      r.base_assumed ? h("p", { class: "small" }, t("chk_cap_assumed", { date: d(r.base_date), base: fmtEur(r.base_rent) })) : null) : null,
    r.ovm_rent !== null ? fact("ovm", fmtEur(r.ovm_rent), ruleSrc("ovm"),
      h("p", { class: "small" }, t("chk_ovm_formula", { ovm: fmtEur(inp.ovm_per_sqm), area: num(inp.area, lang, inp.area % 1 ? 2 : 0) }))) : null,
    r.lwu_cap_rent !== null ? fact("lwu", fmtEur(r.lwu_cap_rent), (rules.lwu || {}).source) : null,
    r.max_rent !== null ? h("div", {}, h("dt", {}, t("chk_out_max_rent")), h("dd", {}, h("strong", { class: "mark" }, bdi(fmtEur(r.max_rent))),
      r.demanded_over_max > 0 ? h("p", {}, t("chk_over_by", { over: fmtEur(r.demanded_over_max) })) : null)) : null,
  );

  const answer = r.demanded_over_max > 0 || r.findings.includes("sperrfrist_fail")
    ? callout("warn", c("checker.partial_consent.title") || t("chk_partial_title"), paras(c("checker.partial_consent.text") || t("chk_partial_text")))
    : null;

  const more = (rules.rules || []).filter((x) => c(`rules.${x.id}.title`));
  const moreBox = more.length ? h("details", {}, h("summary", {}, t("chk_more_rules")),
    h("dl", { class: "facts" }, more.map((x) => h("div", {}, h("dt", {}, c(`rules.${x.id}.title`)),
      h("dd", {}, h("div", cl, paras(c(`rules.${x.id}.text`))), sourceLink(x.source)))))) : null;

  const next = [];
  if (cfg.pages.brief) next.push(h("a", { class: "btn", href: cfg.pages.brief }, t("chk_to_letter")));
  if (cfg.pages.hilfe) next.push(h("a", { class: "btn btn--secondary", href: cfg.pages.hilfe }, t("chk_to_help")));
  next.push(h("button", { type: "button", class: "btn btn--quiet", onclick: () => window.print() }, t("print")));

  mount(out,
    renderFindings(r, inp),
    h("h3", {}, t("chk_dates_title")), dates,
    h("h3", {}, t("chk_money_title")), money,
    answer,
    moreBox,
    h("p", { class: "small" }, t("chk_as_of", { date: localDate(rules.as_of, lang) })),
    h("div", { class: "btn-row" }, next),
    h("p", { class: "store-note" }, t("store_note")));
}

if (!rules) {
  fatal(root, t);
} else {
  mount(root,
    step(1, t("scope_step"),
      c("rules.scope.text") ? h("div", cl, paras(c("rules.scope.text"))) : paras(t("scope_intro")),
      scopeForm({ t, withAsk: true, onChange: update }), scopeBox),
    formStep(),
    step(3, t("chk_step_result"), status.el, out));
  update();
  document.addEventListener("msh:cleared", () => reloadAfterClear());
}
