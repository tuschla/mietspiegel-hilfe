// Language suggestion: if the browser prefers another language in which this page exists, show one
// line at the top linking to that translation. Never redirects; the data is built into the page
// (<ul hidden data-lang-suggest> in templates/base.html), so nothing is loaded.

import { store, h } from "./common.js";

/**
 * Language to suggest, or null.
 * browserLangs: navigator.languages (e.g. ["tr-TR", "de"]); pageLang: language of this page;
 * available: languages this page exists in (with or without pageLang).
 * The first browser language that this page exists in wins; if that is the page's own language,
 * nothing is suggested.
 */
export function pickSuggestion(browserLangs, pageLang, available) {
  const have = new Set([pageLang, ...(available || [])].map((x) => String(x || "").toLowerCase()));
  for (const tag of browserLangs || []) {
    const code = String(tag || "").split(/[-_]/)[0].toLowerCase();
    if (code && have.has(code)) return code === String(pageLang || "").toLowerCase() ? null : code;
  }
  return null;
}

const PART = "langSuggest";

function init() {
  const list = document.querySelector("[data-lang-suggest]");
  if (!list || store.get(PART).closed) return;
  const items = [...list.querySelectorAll("li[data-lang]")];
  const browser = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  const code = pickSuggestion(browser, document.documentElement.lang, items.map((li) => li.dataset.lang));
  const li = items.find((x) => x.dataset.lang === code);
  if (!li) return;
  const { lang, dir, href, text, close } = li.dataset;
  const dismiss = () => store.set(PART, { closed: true });
  const banner = h("div", { class: "lang-suggest", role: "region", "aria-label": text, lang, dir },
    h("div", { class: "wrap lang-suggest__bar" },
      h("a", { href, hreflang: lang, onclick: dismiss }, text),
      h("button", {
        type: "button", class: "lang-suggest__close",
        onclick: () => {
          dismiss();
          banner.remove();
          document.getElementById("main")?.focus();
        },
      }, close)));
  list.after(banner);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}
