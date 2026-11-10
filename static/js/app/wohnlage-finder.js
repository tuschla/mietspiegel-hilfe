// Address → Wohnlage in the calculator: street (with suggestions), house number and, only if the
// address exists in several PLZ, a choice of PLZ. The edition's address file is fetched from this
// site when the user starts typing (once per edition); the lookup runs in the browser and the
// address is not stored.

import { h, field, id } from "./common.js";
import { prepare, suggest, lookup, parseHouseNumber, formatHnr } from "../lib/wohnlage.js";

/** Look up an address; plz is used only if it is one of the candidates of an ambiguous address,
 *  so a PLZ chosen for another number or street cannot block the lookup. A house number typed into
 *  the street field ("Taborstraße 6") is used when the number field is empty. Pure.
 *  → { res: lookup() result, choose: candidates to pick a PLZ from, or null, street, number } */
export function findAddress(idx, street, number, plz = "") {
  street = String(street ?? "").trim();
  number = String(number ?? "").trim();
  let all = lookup(idx, street, number);
  if (all.notFound === "street" && !number) {
    const m = /^(.+?)[\s,]+(\d+\s*[a-z]?)$/i.exec(street);
    const split = m ? lookup(idx, m[1], m[2]) : null;
    if (split && split.notFound !== "street") { all = split; street = m[1]; number = m[2]; }
  }
  const many = all.ambiguous ? all.candidates : null;
  if (plz && many && many.some((c) => c.plz === plz)) return { res: lookup(idx, street, number, plz), choose: many, street, number };
  return { res: all, choose: many && !all.found ? many : null, street, number };
}

/** What the finder says about a lookup result. Pure.
 *  hasSuggestions: some street names start with what was typed (then an unknown name is not an
 *  error yet). → { key (UI text key, null: say nothing), vars: { address, near }, wohnlage, stadtteil } */
export function describeLookup(res, { street, number, hasSuggestions = false }) {
  const out = { key: null, vars: {}, wohnlage: null, stadtteil: null };
  const typed = String(number ?? "").trim();
  const hn = parseHouseNumber(typed);
  const hnr = hn ? formatHnr(hn.num, hn.suffix) : typed;
  // official spelling if all matches share it, else as typed
  const name = (xs) => (xs.length && xs.every((x) => x.street === xs[0].street) ? xs[0].street : String(street).trim());
  if (res.notFound === "street") {
    out.key = !hasSuggestions ? "calc_wl_street_unknown" : typed ? "calc_wl_street_pick" : null;
  } else if (res.invalidNumber) {
    out.key = typed ? "calc_wl_number_invalid" : "calc_wl_number_missing";
  } else if (res.notFound === "number") {
    const near = [...new Set(res.near.map((x) => x.hnr))];
    out.key = near.length ? "calc_wl_number_near" : "calc_wl_number_unknown";
    out.vars = { address: `${name(res.near)} ${hnr}`, near: near.join(", ") };
  } else if (res.found) {
    out.key = "calc_wl_found";
    out.wohnlage = res.wohnlage;
    out.stadtteil = res.stadtteil;
    out.vars = { address: res.plz ? `${res.street} ${res.hnr}, ${res.plz}` : `${name(res.candidates)} ${res.hnr}` };
  } else if (res.ambiguous) {
    out.key = "calc_wl_ambiguous";
    out.vars = { address: `${name(res.candidates)} ${hnr}` };
  }
  return out;
}

const indexes = new Map(); // url → Promise of the prepared index (a failed load is dropped, so typing retries)
const ready = new Set();

function loadIndex(url) {
  if (!indexes.has(url)) {
    const p = fetch(url, { credentials: "same-origin" })
      .then((res) => { if (!res.ok) throw new Error(`${res.status} ${url}`); return res.json(); })
      .then((json) => { const idx = prepare(json); ready.add(url); return idx; });
    p.catch(() => indexes.delete(url));
    indexes.set(url, p);
  }
  return indexes.get(url);
}

const NONE = { wohnlage: null, stadtteil: null };

/** Controls for the Wohnlage fieldset. onResult({ wohnlage, stadtteil }) runs after every lookup;
 *  both are null unless the address was found. → { nodes, setYear(year) } */
export function wohnlageFinder({ t, cfg, year, onResult }) {
  let edition = year, plz = "", timer = null, run = 0, shownList = "", shownPlz = "";
  const url = () => cfg.urls[`wohnlage_${edition}`];

  const list = h("datalist", { id: id("wl-streets") });
  const streetIn = h("input", { type: "text", list: list.id, autocomplete: "off", spellcheck: "false", size: 28, dir: "ltr", lang: "de" });
  const numIn = h("input", { type: "text", autocomplete: "off", size: 6, dir: "ltr" });
  const plzSel = h("select", { dir: "ltr" });
  const plzField = field({ label: t("calc_wl_plz"), input: plzSel });
  plzField.hidden = true;
  const status = h("p", { class: "status", role: "status", "aria-live": "polite" });

  /** One status line; {address} and {near} are German street names, {wohnlage} is emphasised. */
  function say(key, vars = {}) {
    if (!key) { status.replaceChildren(); return; }
    const parts = t(key, { year: edition }).split(/\{(address|near|wohnlage)\}/);
    status.replaceChildren(...parts.map((p, i) => (i % 2 === 0 ? p
      : p === "wohnlage" ? h("strong", {}, vars.wohnlage) : h("bdi", { lang: "de", dir: "ltr" }, vars[p]))));
  }

  function showPlz(choose) {
    plzField.hidden = !choose;
    const opts = [];
    for (const c of choose || []) if (!opts.some((o) => o.plz === c.plz)) opts.push(c);
    const key = opts.map((c) => `${c.plz} ${c.bezirk} ${c.street}`).join("|");
    if (key !== shownPlz) {
      shownPlz = key;
      const oneName = opts.every((c) => c.street === opts[0].street);
      plzSel.replaceChildren(h("option", { value: "" }, t("calc_choose")),
        ...opts.map((c) => h("option", { value: c.plz, lang: "de" }, `${c.plz} ${c.bezirk}${oneName ? "" : ` (${c.street})`}`)));
    }
    plzSel.value = opts.some((c) => c.plz === plz) ? plz : "";
  }

  function showSuggestions(names) {
    const key = names.join("|");
    if (key === shownList) return;
    shownList = key;
    list.replaceChildren(...names.map((n) => h("option", { value: n })));
  }

  async function refresh() {
    clearTimeout(timer);
    const mine = ++run;
    const street = streetIn.value.trim();
    if (!street) { showSuggestions([]); showPlz(null); say(null); onResult(NONE); return; }
    const u = url();
    if (!ready.has(u)) say("calc_wl_loading");
    let idx;
    try { idx = await loadIndex(u); } catch { idx = null; }
    if (mine !== run) return; // a newer keystroke or edition is already on its way
    if (!idx) { showPlz(null); say("calc_wl_load_error"); onResult(NONE); return; }
    const names = suggest(idx, street, 8).map((x) => x.street);
    showSuggestions(names);
    const found = findAddress(idx, street, numIn.value, plz);
    showPlz(found.choose);
    const d = describeLookup(found.res, { street: found.street, number: found.number, hasSuggestions: names.length > 0 });
    say(d.key, { ...d.vars, wohnlage: d.wohnlage ? t(`wohnlage_${d.wohnlage}`) : "" });
    onResult({ wohnlage: d.wohnlage, stadtteil: d.stadtteil });
  }

  const schedule = () => {
    loadIndex(url()).catch(() => {}); // start the download with the first keystroke
    clearTimeout(timer);
    timer = setTimeout(refresh, 250);
  };
  streetIn.addEventListener("input", () => { plz = ""; schedule(); });
  numIn.addEventListener("input", schedule);
  plzSel.addEventListener("change", () => { plz = plzSel.value; refresh(); });

  return {
    nodes: [
      field({ label: t("calc_wl_street"), input: streetIn }), list,
      field({ label: t("calc_wl_number"), input: numIn }),
      plzField,
      status,
    ],
    /** The calculator switched editions: look the address up again in that edition's list. */
    setYear(y) {
      edition = y;
      if (streetIn.value.trim()) refresh();
    },
  };
}
