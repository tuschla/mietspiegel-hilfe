// Browser helpers shared by the tool pages. Loaded on every page (clear-data button).
// Nothing here talks to any server except fetching this site's own JSON files.

import { makeI18n, paragraphs } from "../lib/i18n.js";

const STORE_KEY = "mietspiegel-hilfe:v1";

/* ---------- local storage (only in this browser) ---------- */
export const store = {
  read() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
  },
  get(part) { return this.read()[part] || {}; },
  set(part, value) {
    try {
      const all = this.read();
      all[part] = value;
      localStorage.setItem(STORE_KEY, JSON.stringify(all));
    } catch { /* storage disabled: tools still work, nothing is kept */ }
  },
  clear() {
    try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
  },
  has() {
    try { return localStorage.getItem(STORE_KEY) !== null; } catch { return false; }
  },
};

/* ---------- config + texts ---------- */
export function config() {
  const el = document.getElementById("app-config");
  return el ? JSON.parse(el.textContent) : null;
}

async function getJSON(url) {
  if (!url) return null;
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

/** Load config, texts and the requested data files. Missing optional files resolve to null. */
export async function boot(names = []) {
  const cfg = config();
  const want = new Set(["content", "content_de", ...names]);
  const entries = await Promise.all([...want].map(async (n) => {
    try { return [n, await getJSON(cfg.urls[n])]; } catch { return [n, null]; }
  }));
  const data = Object.fromEntries(entries);
  const { t, c } = makeI18n({ ui: cfg.ui, uiDe: cfg.ui_de, content: data.content, contentDe: data.content_de });
  // content texts fall back to German while a translation is missing: mark them lang="de"
  const cl = cfg.lang !== "de" && !data.content ? { lang: "de", dir: "ltr" } : {};
  return { cfg, data, t, c, cl, lang: cfg.lang };
}

/* ---------- DOM ---------- */
/** h("p", {class: "x", onclick: fn}, "text", child) – text is always set as text, never HTML. */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k === "class") el.className = v;
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k in el && typeof v !== "string") el[k] = v;
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const ch of children.flat(Infinity)) {
    if (ch === null || ch === undefined || ch === false) continue;
    el.append(ch instanceof Node ? ch : document.createTextNode(String(ch)));
  }
}

/** Plain text with blank-line paragraphs → <p> nodes. */
export function paras(text, attrs = {}) {
  return paragraphs(text).map((p) => {
    const el = h("p", attrs);
    p.split("\n").forEach((line, i) => { if (i) el.append(h("br")); el.append(line); });
    return el;
  });
}

/** German text island inside a page in another language. */
export function de(tag, text, attrs = {}) {
  return h(tag, { lang: "de", dir: "ltr", ...attrs }, text);
}

/** Number/amount island (isolated direction). */
export function bdi(text) {
  return h("bdi", {}, text);
}

let uid = 0;
export function id(prefix = "f") {
  uid += 1;
  return `${prefix}-${uid}`;
}

export function field({ label, hint, input }) {
  const iid = input.id || id("in");
  input.id = iid;
  const hintEl = hint ? h("p", { class: "field__hint", id: `${iid}-hint` }, hint) : null;
  if (hintEl) input.setAttribute("aria-describedby", hintEl.id);
  return h("div", { class: "field" }, h("label", { for: iid }, label), hintEl, input);
}

export function callout(kind, title, ...body) {
  return h("div", { class: `callout callout--${kind}` }, title ? h("p", { class: "callout__title" }, title) : null, ...body);
}

export function step(num, title, ...body) {
  const hid = id("step");
  return h("section", { class: "step", "aria-labelledby": hid },
    h("span", { class: "step__num", "aria-hidden": "true" }, String(num)),
    h("h2", { class: "step__title", id: hid }, title),
    ...body);
}

/** Replace the app root content; show a fatal state if data is missing. */
export function mount(root, ...nodes) {
  root.replaceChildren(...nodes.flat(Infinity).filter(Boolean));
}

export function fatal(root, t) {
  mount(root, callout("danger", t("data_missing"), h("p", {}, t("data_missing_hint"))));
}

/** Copy text to clipboard; resolves to true on success. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = h("textarea", { class: "visually-hidden" }, text);
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

export function download(filename, text) {
  const blob = new Blob([text.replace(/\n/g, "\r\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = h("a", { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- clear-data button in the footer ---------- */
function initClear() {
  const btn = document.querySelector("[data-clear-storage]");
  const status = document.querySelector("[data-clear-status]");
  if (!btn) return;
  btn.hidden = false;
  btn.addEventListener("click", () => {
    store.clear();
    if (status) status.textContent = btn.dataset.done || "";
    document.dispatchEvent(new CustomEvent("msh:cleared"));
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initClear);
  else initClear();
}
