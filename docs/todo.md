# Open content and feature gaps

From the review of 2026-10-19: comparison with official Berlin pages, tenant associations, commercial tools and offerings in other cities. Effort: S ≤ 1 day, M 2–4 days, L ≥ 1 week, each including 7 languages and tests (estimate). Before writing any rule, check it against a primary source (statute, Mietspiegel PDF, full text of the decision) and log it in `sources.md`.

## Ranked

- [ ] 1. Formal checklist for the increase demand: power of attorney and rejection under § 174 BGB (must be immediate), all landlords and all tenants named, amount in euros, type of justification, Mietspiegel values. Phrase results as "nach Ihren Angaben fehlt …", never "unwirksam". S (text), M (§ 174 letter). Has it: Senate Mietratgeber, BMV, BMG.
- [ ] 2. "Einvernehmliche" or informal increase offers (§ 557 Abs. 1) and exclusions (§ 557 Abs. 3 contract, § 558 Abs. 5 subsidies). Today such an offer leads into the consent letter, although the agreement is not bound by the Mietspiegel or the Kappungsgrenze. Add a hint in the scope step. S. Has it: Senate Mietratgeber, BMV Info 160.
- [ ] 3. Mietpreisbremse mode in the calculator: lease start → edition, +10 %, date of the 30-month limit, list of exceptions. Time-sensitive: leases from 30.05.2024 reach 30 months on 30.11.2026. M. Has it: mietspiegelrechner-berlin.de, BerlinEcho.
- [ ] 4. Letter templates for the Rüge and the Auskunft (§ 556g Abs. 2, 3). S–M. Has it: BMV, Mietpreisprüfstelle.
- [ ] 5. Mietpreisbremse for Staffel and Index rents (§ 557a Abs. 4, § 557b Abs. 4) and for furnished flats. S. Has it: BMV Info 169, Mieterverein Hamburg.
- [ ] 6. Bruttokalt- or Teilinklusivmiete: explanation and a warning in the checker (comparing a gross rent with net Mietspiegel values gives a false "too high"; MS 2026 Nr. 5). No converter. S. Has it: Munich calculator.
- [ ] 7. Typical landlord arguments and misconceptions ("in der Spanne = zulässig", top of the range without features, transport links as a plus) with the official worked example (row 81 → 7,75 €/m²). Check each case against a primary source first. S–M. Has it: mietspiegelrechner-berlin.de, Senate Urteilssammlung.
- [ ] 8. What a refusal means: defects are no reason to refuse, refusing is no ground for termination, cost risk, setting the difference aside. "Minderung setzt Fristen nicht zurück" is unsourced; check first. S. Has it: BMG Infoschrift, BMV Info 20.
- [ ] 9. Wohnlage from the address, offline from self-hosted official data (dl-de/zero-2.0, about 141 KB gzipped). No live third-party lookup. M–L. Has it: mietspiegelrechner-berlin.de, Frankfurt calculator.
- [ ] 10. "Weiß ich nicht" per feature group, result as a range (`netting()` already supports it). S–M. Has it: mietspiegelrechner-berlin.de, Huurcommissie.
- [ ] 11. Letter applying for the Leistbarkeitsversprechen (LWU, 27 %). S. Has it: Ombudsstelle.
- [ ] 12. One "Stand" date site-wide (footer from `rules.json` `as_of`) and a one-page result sheet for advice appointments (date, edition, row, inputs). No PDF library. S–M. Has it: Frankfurt calculator.
- [ ] 13. Mietpreisüberhöhung (§ 5 WiStG) and Wucher (§ 291 StGB) with the official report route to the district office. Text and link only. S. Has it: Service-Portal Berlin 355534, Bezirksämter.
- [ ] 14. Betriebskosten box: billing deadline and objection deadline (§ 556 Abs. 3), inspection of receipts (§ 556 Abs. 4). No per-item calculator. S (box), M (page and letters). Has it: Senate Betriebskostenübersicht 2026, BMV, BMG.
- [ ] 15. Measuring floor area (WoFlV § 4: balcony usually ¼, sloped ceilings), with a note on older contracts and contract clauses. S. Has it: Mieterverein Hamburg, Leipzig FAQ.

## Lower priority

- [ ] Feedback address (mailto) and an accessibility statement. S.
- [ ] Pointer to Wohngeld and WBS. S.
- [ ] Glossary in 7 languages. M.
- [ ] Commitments of private Bündnis partners (unsourced and changing). S plus check.
- [ ] Older Mietspiegel editions 2015–2023. L.
- [ ] Deposit after a Mietpreisbremse finding (source missing). S.
- [ ] Box on the law change once Mietrecht II is passed (BT-Drs. 21/6807, not law yet). S.
- [ ] LWU limits for modernisation (KoopV II.9). M.
- [ ] Links to official Leichte-Sprache pages. S.
- [ ] Plan for the LWU texts from 01.01.2028, when the Kooperationsvereinbarung ends. M.

## Do not copy

- Storing inputs on a server, results only against an e-mail address, lead generation, paywalls.
- localStorage or "continue later" links: inputs stay in sessionStorage.
- Analytics of any kind, even cookie-free.
- Embedded third-party tools (co2online, maps, booking widgets); links on click only.
- Uploads, AI quick checks, contingency fees, affiliate links, recommending paid services.
- Case verdicts such as "Formfehler → nichtig" or chances of success (RDG).
- One-click reports with contact data; the official form is enough.
- Energy value from the heating bill (factor 1.2, climate factor), dB limits for noise, a "Sondermerkmale" questionnaire: none of this is in the Mietspiegel 2026.
- Drawing ticks into the official PDF: it has no form fields and would look official.
- Asking-rent "Mietspiegel" figures, maps per Kiez, maps of won cases.
- Choosing the edition by the date of the letter instead of receipt; "110 % des Oberwerts"; "Vertragsfläche zählt".
- Own Wohngeld or WBS calculator; per-item Betriebskosten calculator.
- Landlord letter generators, REST API, MCP, keyboard shortcuts, ruling database, comments, app.
- Unsourced rules seen elsewhere: "Warmwasser −15 %", "Mietrecht II: 3,5 %".

Sources and full reasoning: review files of 2026-10-19 (`Judge.md` Part 3, `GS_A.md`, `GS_B.md`), kept outside the repo.
