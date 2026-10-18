# Mietspiegel-Hilfe Berlin

Free help for tenants in Berlin with the Berliner Mietspiegel and rent increases under § 558 BGB, in seven languages. Live site: <https://tusch.la/mietspiegel/>

## What it does

| Page | Function |
|---|---|
| `rechner` | Finds the table row for a flat in the Mietspiegel 2026 or 2024 and places the rent in the range with the *Orientierungshilfe für die Spanneneinordnung*. |
| `pruefen` | Checks a § 558 BGB demand: reply deadline, date the new rent applies, waiting periods, Kappungsgrenze, cap for state-owned landlords, comparison with the Mietspiegel value. |
| `brief` | Builds a reply letter in German from fixed templates (agree, partly agree, refuse, ask about the features). Copy, download as `.txt` or print. |
| `merkmale`, `merkmale-2024` | All features of the Orientierungshilfe 2026 and 2024 in plain language, next to the official German wording. |
| `mieterhoehung`, `mietpreisbremse`, `hilfe`, `ueber` | Rules for rent increases, basics of the Mietpreisbremse, where to get advice, about and privacy. |

## Limits

- Not legal advice. The tools apply fixed rules to the user's own entries and do not assess a case. No lawyer has reviewed the texts.
- Translations are unofficial. Only the German text of the Mietspiegel and the statutes is binding.
- A scope check before the calculator, checker and letter stops or warns when § 558 or the Mietspiegel does not apply: old social housing with Kostenmiete, other subsidised flats, modernisation increases (§ 559), service charges (§ 560), index or graduated rent, furnished rooms in the landlord's flat (§ 549), one- or two-family and terraced houses, buildings completed after the Mietspiegel period, toilet outside the flat.
- The Orientierungshilfe and the Abschlag for Minderausstattung are not part of the qualified Mietspiegel (Mietspiegel Nr. 9.4, 10).

## Languages

German (default, at the site root), English, Turkish, Arabic (right to left), Ukrainian, Russian, Polish. Official German terms stay visible in brackets. Letters are always in German.

## Privacy

- Static site. All calculations run in the browser; the scripts fetch only the site's own JSON files.
- No cookies, no analytics, no third-party scripts, styles, fonts, images or frames. External links, such as the Senate's Wohnlage lookup, are only followed when clicked.
- Entries, scope answers and the dismissed language suggestion are kept in `sessionStorage` under `mietspiegel-hilfe:v1`, for the current tab until it is closed. The "Meine Eingaben löschen" button in the footer removes them.
- Server logging depends on the host. The live site describes its logging on the About page.

## Build

Needs [Zola](https://www.getzola.org/) 0.22.1. There is no JavaScript build step.

```sh
zola serve                                        # preview on http://127.0.0.1:1111
zola build --base-url "https://example.org/path"  # writes public/
```

### Hosting

The page template sets a CSP in a `<meta>` tag, but a meta CSP cannot set `frame-ancestors`. The server must send these headers on every response and must not merge them with a stricter parent policy (for example a `default-src 'none'` policy blocks the scripts and the tool pages stay at "Wird geladen …"):

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
```

If the site shares its origin with other pages, narrow `script-src` to the site's script folder, e.g. `https://example.org/path/js/`.

- Serve `.js` as `text/javascript` and `.json` as `application/json`.
- Point the 404 handler at `<prefix>/404.html`.
- Under a subpath, `robots.txt` and `sitemap.xml` are not at the host root.

## Tests

```sh
node tests/run.mjs   # or: bun tests/run.mjs
```

The runner imports the same modules as the pages and checks:

1. the test vectors in `static/data/rules.json`;
2. unit tests: date rules, the brochure examples on the real Mietspiegel data, letters, scope check, language suggestion;
3. consistency: every UI file has exactly the keys of `de.json`, every UI key used in templates and JS exists, content texts cover every feature id of both years, letter placeholders are known, a style lint of all texts;
4. if `public/` exists: no external resources in the built site, and the language suggestion links point to existing pages. Run `zola build` first to include this.

## Layout

| Path | Content |
|---|---|
| `content/` | Pages. German master `<slug>.md`, translations `<slug>.<lang>.md`. |
| `templates/` | Zola templates. The start page, `rechner`, `pruefen`, `brief` and `merkmale` have their own; other pages use `page.html`. |
| `static/js/lib/` | DOM-free modules (dates, money, § 558 check, Mietspiegel, letters, i18n), used by the pages and the tests. |
| `static/js/app/` | Page scripts. |
| `static/css/site.css` | All styles. Design tokens at the top; logical properties only, so RTL works. |
| `static/data/ms2026.json`, `ms2024.json` | Mietspiegel tables and verbatim feature wording. |
| `static/data/rules.json` | § 558 parameters, date rules, Kappungsgrenze, validity dates, sources, test vectors. |
| `static/data/letters.json` | German letter templates. |
| `static/i18n/ui/<lang>.json` | UI strings. |
| `static/i18n/content/<lang>.json` | Plain-language texts for features, checker, letters and rules. |
| `tools/` | Data extraction and verification. |
| `docs/` | Source log (`sources.md`) and review log (`review-log.md`). |

The main navigation is `extra.nav` in `config.toml` (page slugs; labels from UI key `nav_<slug>`).

## Mietspiegel data

`ms2026.json` and `ms2024.json` are generated from the official brochures. Download the PDFs listed in `docs/sources.md` into `tools/src/` (git-ignored), then:

```sh
python3 tools/extract_data.py   # needs pdftotext (poppler)
python3 tools/verify_data.py    # spot checks against the brochures; exit code 0 = pass
```

The editions 2026 and 2024 are fixed in these scripts, the page scripts, the templates and `rules.json`. A new edition needs changes in all of them and a new `merkmale` page.

## Adding a language

1. `config.toml`: add `[languages.<code>]` with `generate_feeds = false` and `build_search_index = false`, and an entry in `extra.languages` (`code`, `native`, `dir`).
2. `static/i18n/ui/<code>.json`: translate all keys of `de.json`. Keep `{placeholders}`. The tests fail on missing or extra keys.
3. `static/i18n/content/<code>.json`: same keys as `de.json`. Missing keys fall back to German.
4. `content/<slug>.<code>.md` for each page, with the front matter of the German file. Untranslated pages fall back to German in the navigation and are left out of the language switcher.
5. Put official German terms (Mietspiegel, Wohnlage, § 558 BGB) in brackets after the translation.
6. Run `zola build` and `node tests/run.mjs`.

## License

Copyright (C) 2026 the Mietspiegel-Hilfe Berlin contributors.

- Code (`static/js/`, `static/css/`, `templates/`, `tests/`, `tools/*.py`, `config.toml`): AGPL-3.0-or-later, see [`LICENSE`](LICENSE). If you run a modified version as a public website, you must offer its source to its users.
- Text (`content/`, `static/i18n/`, `static/data/letters.json`, the texts in `static/data/rules.json`, `docs/`): CC BY-SA 4.0, see [`LICENSES/CC-BY-SA-4.0.txt`](LICENSES/CC-BY-SA-4.0.txt).
- Not covered: the Mietspiegel tables and the verbatim wording in `ms2026.json` and `ms2024.json` (fields `text_de`, `conditions_de`, `note_de`, `rules_de`, `notes_de`), taken from the Berliner Mietspiegel [2026](https://mietspiegel.berlin.de/wp-content/uploads/2026/05/mietspiegel2026.pdf) and [2024](https://mietspiegel.berlin.de/wp-content/uploads/2024/11/mietspiegel2024.pdf) of the Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen. Quoted statutes and court decisions belong to their sources.
