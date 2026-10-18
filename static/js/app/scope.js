// Scope gate shared by the checker, the calculator and the letter page.
// Asks whether the letter is a § 558 demand for consent and whether the flat is outside § 558
// or outside the Mietspiegel. Answers are kept in sessionStorage ("scope") like all other entries.
import { store, h, paras, callout } from "./common.js";

/** Cases where § 558 does not apply at all (the rent may be owed without consent). */
export const NOT_558 = ["sozial", "mod559", "bk560", "index_staffel", "s549"];
/** Cases where § 558 applies but the Berlin Mietspiegel (and so the calculator) does not. */
export const NOT_MS = ["gefoerdert", "efh", "neubau", "wc_out"];
/** Order of the checkboxes in the checker and the letter scope (subsidised flats next to each other). */
export const SCOPE_ITEMS = ["sozial", "gefoerdert", "mod559", "bk560", "index_staffel", "s549", "efh", "neubau", "wc_out"];

export function readScope() {
  const sc = store.get("scope");
  return { ask: sc.ask || "", items: sc.items || {} };
}

/**
 * State: "open" (fine), "unanswered" (consent question not answered), "not558", "notMS".
 * @param withAsk  whether the consent question is part of the gate
 */
export function scopeState(sc, { withAsk = true, items = SCOPE_ITEMS } = {}) {
  const on = (id) => items.includes(id) && sc.items[id];
  if (NOT_558.some(on) || (withAsk && sc.ask === "no")) return "not558";
  if (withAsk && !sc.ask) return "unanswered";
  if (NOT_MS.some(on)) return "notMS";
  if (withAsk && sc.ask === "unsure") return "unsure";
  return "open";
}

/** Results are shown only when the gate is not closed. */
export function scopeShowsResults(state) {
  return state !== "not558" && state !== "unanswered";
}

/** Callout explaining what a closed gate means (null when open). */
export function scopeNotice(state, { t, cfg }) {
  const help = cfg.pages.hilfe ? h("p", {}, h("a", { href: cfg.pages.hilfe }, t("scope_help_link"))) : null;
  if (state === "not558") return callout("danger", t("scope_not558_title"), paras(t("scope_not558_text")), help);
  if (state === "notMS") return callout("warn", t("scope_notms_title"), paras(t("scope_notms_text")), help);
  if (state === "unanswered") return h("p", { class: "field__hint" }, t("scope_unanswered"));
  if (state === "unsure") return callout("warn", t("scope_unsure_title"), paras(t("scope_unsure_text")), help);
  return null;
}

/**
 * Form for the gate. `onChange(sc)` is called after every change.
 * @param opts {withAsk, items}
 */
export function scopeForm({ t, withAsk = true, items = SCOPE_ITEMS, onChange }) {
  const sc = readScope();
  const save = () => { store.set("scope", sc); onChange(sc); };
  const nodes = [];
  if (withAsk) {
    nodes.push(h("fieldset", {},
      h("legend", {}, t("scope_ask")),
      h("p", { class: "field__hint" }, t("scope_ask_hint")),
      h("div", { class: "choices--inline" }, ["yes", "no", "unsure"].map((v) => h("label", { class: "choice" },
        h("input", { type: "radio", name: "scope-ask", value: v, checked: sc.ask === v, required: true,
          onchange: () => { sc.ask = v; save(); } }),
        h("span", {}, t(`scope_ask_${v}`)))))));
  }
  nodes.push(h("fieldset", {},
    h("legend", {}, t("scope_items_legend")),
    items.map((id) => h("label", { class: "choice" },
      h("input", { type: "checkbox", checked: Boolean(sc.items[id]), onchange: (e) => { sc.items[id] = e.target.checked; save(); } }),
      h("span", {}, t(`scope_item_${id}`))))));
  return nodes;
}
