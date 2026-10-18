# Mietspiegel-Hilfe Berlin

Free, neutral, multilingual help for Berlin tenants: understand the Mietspiegel *Orientierungshilfe für die Spanneneinordnung*, calculate where a flat sits in the range (Mietspiegel 2026 and 2024), check a § 558 BGB rent-increase demand, and write a German reply letter while all explanations are in the user's language.

Static site built with [Zola](https://www.getzola.org/) 0.22.1. No external requests, no cookies, no analytics, no build step for JavaScript. All calculations run in the browser; entries are kept only in the browser's `sessionStorage` (this tab, until it is closed) and can be deleted with the button in the footer.

## Build and serve

Always use the Zola version pinned by the VPS flake:

```sh
# local preview on http://127.0.0.1:1111
nix shell --inputs-from ../vps nixpkgs#zola -c zola serve

# build into public/
nix shell --inputs-from ../vps nixpkgs#zola -c zola build

# as in the VPS pipeline (absolute URLs come from get_url, nothing is hard-coded)
zola --root /path/to/mietspiegel-hilfe build --base-url "https://<domain>"
```

## Hosting

The page template sets a CSP in a `<meta>` tag, but a meta CSP cannot set `frame-ancestors` (CSP3 ignores it there). The server must therefore send these headers on every response under the site, and they must **replace** any stricter parent policy rather than merge with it (for example `add_header_inherit off` in an nginx location). A parent policy such as the blog's `default-src 'none'` blocks the tool scripts, and the pages stay at "Wird geladen …".

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
```

- Serve `.js` as `text/javascript` and `.json` as `application/json`.
- There is a single `404.html` at `<prefix>/404.html`; point `error_page 404` there.
- Under a subpath, `robots.txt` and `sitemap.xml` are not at the host root.

## Tests

```sh
node tests/run.mjs     # or: bun tests/run.mjs
```

The runner imports the same ES modules as the pages (`static/js/lib/*.js`) and checks:

1. every vector in `static/data/rules.json` → `tests` (§ 558 check; `"kind": "netting"` for the Orientierungshilfe),
2. unit tests: date rules, the brochure examples on the real Mietspiegel data (row 10, row 161, row 81 → 7,75 €/m²), energy boxes, letter rendering,
3. consistency: every `static/i18n/ui/<lang>.json` has exactly the keys of `de.json`; every UI key used in templates/JS exists; `static/i18n/content/<lang>.json` covers every feature id of both Mietspiegel years; letter placeholders are known,
4. if `public/` exists: no external scripts, styles, fonts, images or frames in the built site. Run `zola build` first to include this check.

## Structure and ownership

| Path | Content | Owner |
|---|---|---|
| `static/data/ms2026.json`, `ms2024.json` | Mietspiegel tables, features (verbatim), rules, footnotes | Data (`tools/extract_data.py`, `tools/verify_data.py`; source PDFs in git-ignored `tools/src/`) |
| `static/data/rules.json` | § 558 parameters, date rules, Kappungsgrenze, Mietspiegel validity, sources, test vectors | Content |
| `static/data/letters.json` | German letter templates with `{placeholders}` and `{?field}…{/field}` blocks | Content |
| `static/i18n/content/<lang>.json` | plain-language texts: groups, features, checker, letters, rules | Content / translators |
| `content/*.md` | pages (German master; translations as `<slug>.<lang>.md`) | Content / translators |
| `config.toml`, `templates/`, `static/css/`, `static/js/`, `static/i18n/ui/`, `tests/` | site, design system, tools, UI strings | Frontend |
| `docs/sources.md` | internal source log, one section per owner | all |

Pages and templates: `_index.md` → `index.html`; `rechner.md` → `rechner.html`; `pruefen.md` → `pruefen.html` (§ 558 check); `brief.md` → `brief.html`; `merkmale.md` / `merkmale-2024.md` → `merkmale.html` with `[extra] year`; all other pages → `page.html`. The main navigation is `extra.nav` in `config.toml` (page slugs; labels come from UI key `nav_<slug>`).

JavaScript: `static/js/lib/` holds pure, DOM-free modules (`dates.js`, `money.js`, `check558.js`, `mietspiegel.js`, `letter.js`, `i18n.js`) used by both the pages and the tests. `static/js/app/` holds the page code (`common.js` on every page, plus `rechner.js`, `pruefen.js`, `brief.js`). Templates pass UI strings and data URLs to the JS in a `<script type="application/json" id="app-config">` block.

Design tokens (colours, type scale, 4 px spacing scale, radii, motion) are CSS custom properties at the top of `static/css/site.css`. Use logical properties only (`margin-inline-start`, …) so that RTL works.

## Adding a language

Seven languages are registered: `de` (default, at the site root), `en`, `tr`, `ar` (RTL), `uk`, `ru`, `pl`. To add or complete one:

1. `config.toml`: add `[languages.<code>]` (with `generate_feeds = false`, `build_search_index = false`) and an entry in `extra.languages` (`code`, `native` name, `dir` = `ltr`/`rtl`).
2. `static/i18n/ui/<code>.json`: translate **all** keys of `static/i18n/ui/de.json` (the test fails on missing or extra keys). Keep `{placeholders}` unchanged.
3. `static/i18n/content/<code>.json`: same keys as `static/i18n/content/de.json`. Missing keys fall back to German and are marked `lang="de"`.
4. `content/<slug>.<code>.md` for each page, same front matter as the German file. Pages without a translation are not linked in that language; the navigation falls back to the German page, and the language switcher only lists languages that have the page.
5. German official terms (Mietspiegel, Wohnlage, Merkmalgruppe, § 558 BGB …) should also appear in German in brackets; the official German feature wording is always shown next to the translation. Letters stay German.
6. Run `zola build` and `node tests/run.mjs`.

## Limits

No legal advice. Translations are unofficial. The Orientierungshilfe and the Abschlag for Minderausstattung are not part of the qualified Mietspiegel (Mietspiegel Nr. 9.4, 10).
