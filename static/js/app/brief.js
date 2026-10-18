// Letter generator: form and explanations in the user's language, letter text always German.
import { boot, store, h, paras, de, field, callout, step, mount, fatal, copyText, download, reloadAfterClear } from "./common.js";
import { readScope, scopeState, scopeNotice } from "./scope.js";
import { render, prefill, letterValues, amountProblems, consentWarnings } from "../lib/letter.js";
import { featureIndex } from "../lib/mietspiegel.js";
import { parseNumber, eur, pct, localDate } from "../lib/money.js";
import { todayISO } from "../lib/dates.js";

const root = document.getElementById("app");
const { cfg, data, t, c, cl } = await boot(["letters", "ms2026", "ms2024"]);
const letters = data.letters;

const calc = store.get("calcResult") || {};
const chk = store.get("checkResult") || {};
const chkIn = chk.input || {};
let s = { tpl: null, values: {}, prefilled: {}, ...store.get("letter") };
s.values = s.values || {};
s.prefilled = s.prefilled || {};

const year = calc.year || chk.mietspiegel_year || 2026;
const ms = data[`ms${year}`] || data.ms2026 || data.ms2024;
const idx = ms ? featureIndex(ms) : new Map();
const featureText = (fid) => (idx.get(fid) ? idx.get(fid).text_de : fid);

/** Values known from the calculator / checker (raw: numbers and ISO dates). */
const known = {
  received: chkIn.received, current_rent: chkIn.current_rent, demanded_rent: chkIn.demanded_rent,
  area: chkIn.area ?? calc.area, ovm_per_sqm: chkIn.ovm_per_sqm ?? calc.ovm_per_sqm, new_rent: chkIn.demanded_rent,
  max_rent: chk.max_rent, consent_deadline: chk.consent_deadline,
  // never earlier than the date the landlord asked for (pay_from = max(legal earliest date, requested date))
  effective: chk.pay_from ?? chk.effective,
  features_plus: calc.disputes ? calc.disputes.disputedPlus : undefined,
  features_minus: calc.disputes ? calc.disputes.missingMinus : undefined,
};
const BUILTIN_TYPES = { today: "date", ms_title: "text", ovm_per_sqm: "money", max_rent: "money", consent_deadline: "date", effective: "date" };

const tplById = (tid) => (letters ? letters.templates.find((x) => x.id === tid) : null);
const tplTitle = (tp) => c(`letters.${tp.id}.title`) || tp.title_de || tp.id;
const fieldLabel = (f) => {
  const own = c(`letters.fields.${f.id}`);
  if (own) return own;
  const ui = t(`letter_field_${f.id}`);
  return ui === `letter_field_${f.id}` ? f.label_de || f.id : ui;
};

function save() { store.set("letter", s); }

/* ---------------- step 1: choose ---------------- */
const explainBox = h("div", {});
const formBox = h("div", {});

function stepChoose() {
  const list = h("div", { class: "letter-pick", role: "radiogroup", "aria-label": t("letter_choose") },
    letters.templates.map((tp) => {
      const when = c(`letters.${tp.id}.when`);
      const r = h("input", { type: "radio", name: "tpl", value: tp.id, checked: s.tpl === tp.id,
        onchange: () => { s.tpl = tp.id; save(); renderChosen(); } });
      return h("label", { class: "choice" }, r,
        h("span", {},
          h("strong", cl, tplTitle(tp)),
          tp.risk ? h("span", { class: `letter-pick__risk risk--${tp.risk}` }, t(`risk_${tp.risk}`)) : null,
          when ? h("span", { class: "field__hint", ...cl }, h("br"), when) : null));
    }));
  return step(1, t("letter_step_choose"), paras(c("letters.intro.text") || t("letter_intro")), list);
}

/* ---------------- step 2: explanation + warnings ---------------- */
function findingTitle(fid) {
  const vars = {
    rate: pct(chk.kappung_rate, cfg.lang, 0), cap_rent: eur(chk.cap_rent, cfg.lang), ovm_rent: eur(chk.ovm_rent, cfg.lang),
    max_rent: eur(chk.max_rent, cfg.lang), lwu_cap: eur(chk.lwu_cap_rent, cfg.lang), over: eur(chk.demanded_over_max, cfg.lang),
    effective: localDate(chk.effective, cfg.lang), pay_from: localDate(chk.pay_from, cfg.lang), base_date: localDate(chk.base_date, cfg.lang),
  };
  return c(`checker.result.${fid}.title`, vars) || t(`chk_find_${fid}`, vars);
}

function renderExplain(tp) {
  const explain = c(`letters.${tp.id}.explain`);
  const risks = c(`letters.${tp.id}.risks`);
  const agrees = tp.kind === "consent" || tp.kind === "partial";
  const kindWarn = tp.kind === "consent" ? t("letter_warn_consent") : tp.kind === "partial" ? t("letter_warn_partial") : "";
  const deadline = chk.consent_deadline ? t("letter_deadline", { date: localDate(chk.consent_deadline, cfg.lang) }) : "";

  // scope gate and checker findings before any consent
  // an unanswered scope question still shows a "Mietspiegel does not apply" notice from the calculator
  const sc0 = scopeState(readScope(), { withAsk: true });
  const sc = sc0 === "unanswered" ? scopeState(readScope(), { withAsk: false }) : sc0;
  const scopeBox = sc === "not558" || sc === "notMS" || sc === "unsure" ? scopeNotice(sc, { t, cfg }) : null;
  let checkBox = null, incompleteBox = null;
  if (agrees) {
    const w = consentWarnings(chk.findings);
    if (w.risky.length) {
      checkBox = callout("danger", t("letter_findings_title"),
        h("ul", {}, w.risky.map((f) => h("li", cl, findingTitle(f)))),
        paras(t("letter_findings_text")));
    } else if (w.unchecked) {
      checkBox = callout("warn", t("letter_no_check_title"), h("p", {}, t("letter_no_check_text")),
        cfg.pages.pruefen ? h("p", {}, h("a", { href: cfg.pages.pruefen }, t("letter_to_check"))) : null);
    }
    if (w.incomplete.length) {
      incompleteBox = callout("warn", t("letter_incomplete_title"),
        h("ul", {}, w.incomplete.map((f) => h("li", cl, findingTitle(f)))),
        h("p", {}, t("letter_no_check_text")),
        cfg.pages.pruefen ? h("p", {}, h("a", { href: cfg.pages.pruefen }, t("letter_to_check"))) : null);
    }
  }
  mount(explainBox,
    scopeBox,
    checkBox,
    incompleteBox,
    agrees ? callout("danger", t("letter_binding_title"), paras(t("letter_binding_text")),
      cfg.pages.mietpreisbremse ? h("p", {}, h("a", { href: cfg.pages.mietpreisbremse }, t("nav_mietpreisbremse"))) : null) : null,
    explain ? h("div", { class: "prose", ...cl }, paras(explain)) : null,
    kindWarn || risks ? callout(tp.risk === "high" || agrees ? "danger" : "warn",
      t("letter_risks_title"), kindWarn ? paras(kindWarn) : null, h("div", cl, paras(risks))) : null,
    deadline ? callout("warn", null, h("p", {}, deadline)) : null,
  );
}

/* ---------------- step 3: form ---------------- */
function featureField(f) {
  const sign = f.type === "features_minus" ? -1 : 1;
  if (!ms) return null;
  const chosen = new Set(s.values[f.id] || []);
  const boxes = [];
  for (const g of ms.groups) for (const ft of g.features) {
    if (Math.sign(ft.sign) !== sign) continue;
    const title = c(`features.${ft.id}.title`);
    boxes.push(h("label", { class: "choice" },
      h("input", { type: "checkbox", value: ft.id, checked: chosen.has(ft.id), onchange: (e) => {
        if (e.target.checked) chosen.add(ft.id); else chosen.delete(ft.id);
        s.values[f.id] = [...chosen]; save(); renderLetter();
      } }),
      h("span", {}, title || de("span", ft.text_de), title ? h("small", { class: "official", lang: "de", dir: "ltr" }, h("br"), ft.text_de) : null)));
  }
  const hint = c(`letters.fields.${f.id}_help`);
  return h("details", { class: "field", open: chosen.size > 0 },
    h("summary", {}, fieldLabel(f), ` (${chosen.size})`),
    hint ? h("p", { class: "field__hint" }, hint) : null,
    calc.disputes ? h("p", { class: "field__hint" }, t("letter_features_from_calc", { year })) : null,
    h("fieldset", {}, h("legend", { class: "visually-hidden" }, fieldLabel(f)), boxes));
}

const problemBox = h("div", { "aria-live": "polite" });
let shownProblems = null; // problemBox is only re-mounted when the problems change

function renderForm(tp) {
  prefill(tp.fields, s.values, s.prefilled, known);
  save();
  const nodes = (tp.fields || []).map((f) => {
    if (f.type === "features_plus" || f.type === "features_minus") return featureField(f);
    const v = s.values[f.id] ?? "";
    const ac = { tenant_name: "name", tenant_address: "street-address" }[f.id] || "off";
    const el = f.type === "textarea" ? h("textarea", { rows: 4, autocomplete: ac }, v)
      : f.type === "date" ? h("input", { type: "date", value: v })
      : f.type === "money" || f.type === "area" ? h("input", { type: "text", inputmode: "decimal", size: 10, value: v })
      : h("input", { type: "text", value: v, autocomplete: ac });
    if (f.required) el.required = true;
    el.addEventListener("input", () => { s.values[f.id] = el.value; save(); renderLetter(); });
    const hint = c(`letters.fields.${f.id}_help`);
    return field({ label: fieldLabel(f) + (f.required ? "" : ` (${t("optional")})`), hint, input: el });
  });
  mount(formBox, h("form", { onsubmit: (e) => e.preventDefault(), novalidate: true }, nodes), problemBox);
}

/* ---------------- step 4: letter ---------------- */
const sheet = h("textarea", { lang: "de", dir: "ltr", spellcheck: "false", "aria-label": t("letter_text_label") });
const printCopy = h("pre", { class: "letter-print", lang: "de", dir: "ltr", "aria-hidden": "true" });
const status = h("p", { class: "status", role: "status", "aria-live": "polite" });
const missingNote = h("p", { class: "field__hint" });
const problemNote = h("div", {}); // problemBox at the form is the live one
sheet.addEventListener("input", () => { printCopy.textContent = sheet.value; });

function renderLetter() {
  const tp = tplById(s.tpl);
  if (!tp) return;
  const types = { ...BUILTIN_TYPES };
  for (const f of tp.fields || []) types[f.id] = f.type;
  const builtins = {
    today: todayISO(), ms_title: ms ? ms.title_de : "",
    ovm_per_sqm: known.ovm_per_sqm, max_rent: known.max_rent, consent_deadline: known.consent_deadline, effective: known.effective,
  };
  const values = letterValues(tp.fields, s.values, builtins, parseNumber);
  const { text, missing } = render(tp.body_de, values, types, featureText);
  sheet.value = text;
  printCopy.textContent = text;
  missingNote.textContent = missing.length ? t("letter_missing", { n: missing.length }) : "";
  const problems = amountProblems(tp, values, known.demanded_rent, known.max_rent);
  const key = problems.join(" ");
  if (key !== shownProblems) {
    shownProblems = key;
    const box = () => (problems.length ? callout("danger", null, problems.map((p) => h("p", {}, t(`letter_problem_${p}`, { max: eur(known.max_rent, cfg.lang) })))) : null);
    mount(problemBox, box());
    mount(problemNote, box());
  }
}

function stepLetter() {
  const fname = () => `Antwort-Mieterhoehung-${s.tpl}-${todayISO()}.txt`;
  return step(4, t("letter_step_text"),
    paras(t("letter_text_intro")),
    missingNote,
    problemNote,
    h("div", { class: "letter-sheet" }, sheet, printCopy),
    h("div", { class: "btn-row" },
      h("button", { type: "button", class: "btn", onclick: async () => { status.textContent = (await copyText(sheet.value)) ? t("copied") : t("copy_failed"); } }, t("copy")),
      h("button", { type: "button", class: "btn btn--secondary", onclick: () => { download(fname(), sheet.value); status.textContent = t("downloaded"); } }, t("download_txt")),
      h("button", { type: "button", class: "btn btn--secondary", onclick: () => window.print() }, t("print"))),
    status,
    callout("warn", c("letters.send.title") || t("letter_send_title"), paras(c("letters.send.text") || t("letter_send_text"))),
    h("p", { class: "store-note" }, t("store_note")));
}

function renderChosen() {
  const tp = tplById(s.tpl);
  const rest = root.querySelectorAll("[data-after-choice]");
  rest.forEach((el) => { el.hidden = !tp; });
  if (!tp) return;
  renderExplain(tp);
  renderForm(tp);
  renderLetter();
}

if (!letters || !Array.isArray(letters.templates) || !letters.templates.length) {
  fatal(root, t);
} else {
  const s2 = step(2, t("letter_step_explain"), explainBox);
  const s3 = step(3, t("letter_step_form"), formBox);
  const s4 = stepLetter();
  for (const el of [s2, s3, s4]) el.dataset.afterChoice = "";
  s4.classList.add("letter-out");
  mount(root, stepChoose(), s2, s3, s4);
  renderChosen();
  document.addEventListener("msh:cleared", () => reloadAfterClear());
}
