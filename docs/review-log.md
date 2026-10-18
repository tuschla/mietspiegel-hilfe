# Review-Log (Reviews A und B vom 18.10.2026)

Quellen: `99 Arbeitsdateien/Website/R_SiteReviewA.md` (A, F-1 … F-22) und `R_SiteReviewB.md` (B, F1 … F23). Jeder Eigentümer führt einen eigenen Abschnitt. Status: **FIXED** = umgesetzt · **PARTLY** = teilweise umgesetzt, Grund angegeben · **REJECTED** = nicht umgesetzt, Grund angegeben · **FORWARDED** = gehört einem anderen Eigentümer · **OWNER** = Entscheidung des Eigentümers.

## Content (content/*.md, de.json, rules.json, letters.json, Abschnitt Content in sources.md)

Funde, die beide Reviewer genannt haben, wurden nach Vorgabe von Main umgesetzt. Funde, die nur ein Reviewer genannt hat, wurden erst nach eigenem Öffnen der Quelle umgesetzt (Nachweis in `docs/sources.md`, Abschnitt „Content – Nachträge nach den Reviews“).

| Fund | Thema | Status | Was / Grund |
|---|---|---|---|
| A F-1 / B F2 | Geltungsbereich (Sozialwohnung, § 549, einseitige Erhöhungen, Mietspiegel-Ausnahmen) | FIXED | Neuer Abschnitt „Gilt diese Seite für Ihren Brief?“ in mieterhoehung.md. Kurzbox oben in pruefen.md, brief.md und rechner.md (Mietspiegel-Ausnahmen nach Nr. 3). Hinweis in _index.md. Neue Schlüssel `rules.scope` und `rules.json` `scope`. Erster Satz „darf die Miete nicht einfach selbst erhöhen“ auf § 558 beschränkt. Ablehnungs-Risiko in letters.json eingeschränkt („Das gilt nicht bei Modernisierung …“). Quellen: § 558 Abs. 2 S. 2, § 549 Abs. 2 und 3 BGB, MS 2026 Nr. 3. Die Ja/Nein-Abfrage im Prüfer ist UI (Frontend). |
| A F-2 / B F4 | Zahltermin im Brief früher als vom Vermieter verlangt | FIXED | Neue Ausgabe `pay_from` (Frontend). In rules.json: Regel `pay_from` und Tests t22, t23, t24, t25. Hilfetext `letters.fields.effective_help` neu. Zustimmungstext nennt das Datum ausdrücklich. |
| A F-3 / B F11 | Kappungsgrenze aus heutiger Miete; Feldtext „Erhöhungstermin“ | FIXED | Text für Feld und Hilfe neu, mit {date3y}. Neue Befunde `need_rent_3y` und `no_last_change` mit Text. `within_limits` umbenannt in „Nach Ihren Angaben keine Grenze überschritten“, mit Hinweis „keine Garantie“. Neue Regel `base_date` und Test t24/t25. Die Logik liegt bei Frontend. |
| A F-4 | 11 % in drei Jahren für landeseigene Unternehmen (LWU) | FIXED (bestätigt) | Bündnis-Vereinbarung vom 15.07.2025 (S. 5) und Pressemitteilung selbst geöffnet: Die LWU senken die Kappungsgrenze von 15 % auf 11 %, für die Laufzeit der Kooperationsvereinbarung. mieterhoehung.md, `rules.lwu`, rules.json `lwu.cap_rate_3y` = 0,11 mit Quelle. Alte Notiz „Bündnistext 2022 …“ entfernt. Neuer Befund `over_lwu` mit Text. Tests t26 und t27. SGB-II/XII-Satz ergänzt. |
| A F-5 / B F18 | Zustimmungsbrief ohne Zahlen; Freitext als Gegenangebot | FIXED | `zustimmung` verlangt jetzt current_rent, new_rent und effective. Text: „Ich stimme der Erhöhung der monatlichen Nettokaltmiete von {current_rent} auf {new_rent} zu … Weitere Änderungen des Mietvertrags sind mit dieser Zustimmung nicht verbunden.“ Derselbe Satz steht in `teilzustimmung`. Die Hilfe zu own_text warnt vor Bedingungen und Gegenangebot. Warnung zum Vermieter-Formular steht in brief.md und mieterhoehung.md. Hinweis auf Brutto- und Inklusivmiete im Erklärtext. Die Prüfung der Beträge macht Frontend. B wollte „Miete“ statt „Nettokaltmiete“: abgelehnt. Begründung: Die Website rechnet durchgehend mit der Nettokaltmiete. Stattdessen der Hinweis, sich bei Bruttomiete beraten zu lassen. |
| A F-6 / B F6 | Warnungen vor Zustimmung bei kritischen Befunden | FIXED (Text) / FORWARDED (UI) | brief.md: „Hat die Prüfung ein Problem gezeigt … stimmen Sie nicht zu, bevor Sie sich beraten lassen haben.“ Dasselbe in den `risks` beider Zustimmungsbriefe. Die Gefahren-Box aus den Befunden zeigt Frontend. |
| B F5 | Nach Zustimmung keine Mietpreisbremse gegen die neue Miete (BGH VIII ZR 300/21) | FIXED (bestätigt) | Volltext des amtlichen PDFs gelesen (Leitsätze, Rn. 13 und 32). Steht in mieterhoehung.md, mietpreisbremse.md (Punkt 4), brief.md, `rules.consent_binding`, `rules.mietpreisbremse_after_consent` und den Risiken von zustimmung und teilzustimmung. Wortlaut „grundsätzlich“ wie in Rn. 32. |
| A F-7 | Parkplatz: Leitsatz LG Berlin 67 S 150/18 | FIXED | umfeld-p03.check neu: Plätze gegen Entgelt zählen, aber nur bei Anmietung oder vorherigem Angebot zum Zeitpunkt des Zugangs. Hinweis „andere Gerichte …“. Der Volltext war am 17.10. gelesen worden (Rn. 9); Reviewer A zitiert den Leitsatz. |
| A F-8 / B F9 | Beweislast: Meinung einer Kammer als feste Regel | FIXED | Alle 85 Texte unter `proof`: Plus „in der Regel … So hat es das Landgericht Berlin entschieden; andere Gerichte können das anders sehen“. Minus „am besten selbst belegen … Das Landgericht Berlin verlangt das im Streitfall von Ihnen; andere Gerichte …“. mieterhoehung.md und `rules.burden_of_proof` nennen „Landgericht Berlin (heute Landgericht Berlin II)“. Die Rn. 6–9 bleiben. Sie wurden am 17.10. im Volltext auf gesetze.berlin.de gelesen; A hat Rn. 6 und 7 ebenfalls bestätigt. B konnte den Volltext nicht öffnen. |
| A F-9 | Satz „eigene Einbauten“ passt nicht zu Lage- und Gebäudemerkmalen | FIXED | Bei umfeld-* und gebaeude-p03, p04, p06, p07 gestrichen. |
| A F-10 | „+20 %“ wird als „20 % mehr Miete“ verstanden | FIXED | Fünf Gruppen-Einleitungen, rechner.md und `rules.netting` neu formuliert („ein Fünftel des Abstands … Das sind nicht 20 % mehr Miete.“). |
| A F-11 / B F12 | Liste der Merkmale ist nicht abschließend (Nr. 10.1) | FIXED | rechner.md ergänzt. |
| A F-12 | Wohnfläche: tatsächliche Fläche zählt (BGH VIII ZR 266/14) | FIXED (bestätigt) | Leitsatz a im amtlichen PDF gelesen. Geändert: rechner.md, mieterhoehung.md, `checker.area_help`, `rules.landlord_equipment`. Den UI-Hinweis `calc_area_hint` muss Frontend ändern. |
| A F-13 | Rn.-Zitat zum Widerruf | FIXED (bestätigt) | VIII ZR 62/18 Rn. 22 und VIII ZR 94/17 (Leitsatz) gelesen. Zitat jetzt „VIII ZR 94/17; bestätigt in VIII ZR 62/18, Rn. 21 und 22“. |
| A F-14 / B F8 | „bleibt es dabei“ zu absolut | PARTLY | „In der Regel“ eingefügt. Anfechtung bei Täuschung ergänzt (§ 123 BGB geöffnet). Den Teil zu § 313 BGB und Wohnfläche (VIII ZR 234/18) nicht übernommen: Reviewer A hat dazu nur Zusammenfassungen gesehen, kein Volltext gelesen. |
| A F-15 | Lastschrift | FIXED | mieterhoehung.md: dem Vermieter schreiben „nicht zugestimmt, Zahlung unter Vorbehalt“, die Bank fragen, beraten lassen. Kein Rechtsanspruch auf Rückgabe behauptet. |
| A F-16 | Mietpreisbremse: § 549, Art. 229 § 35 und § 51 EGBGB, langer Satz | FIXED (bestätigt) | Normen live geöffnet. Neue Punkte unter „Ausnahmen“. Die 30-Monats-Regel ist in kurze Sätze geteilt. Altverträge vor dem 01.04.2020: nur „ältere Fassung, beraten lassen“. Die alte Fassung von § 556g wurde nicht geöffnet, deshalb kein Inhalt dazu. |
| A F-17 | gebaeude-p08 „vor diesem Zeitpunkt“; wohnung-m08 „an allen Fenstern“ | FIXED | Erklärtext zu gebaeude-p08 nennt beide Lesarten. Prüftext zu wohnung-m08: sicher nur, wenn kein Fenster geschützt ist. Datenseite (Ausschluss für gebaeude-p08 entfernt, `note_de`): siehe Abschnitt Data, „A F-17 (Daten)“. |
| A F-18 | „WBS 220“ steht nicht in der Kooperationsvereinbarung | FIXED | Text: „Welche Grenze genau, nennt die Vereinbarung nicht. Das Berliner Gesetz … nennt für Härtefälle 220 %.“ (WUAusrStärkG BE § 3 Abs. 3, am 17.10. geöffnet). rules.json angepasst. |
| A F-19 | RDG: Ergebnisse als Bewertung formuliert | PARTLY / OWNER | Texte zu den Befunden neu („Nach der festen Rechenregel und Ihren Angaben …“), `checker.intro`, pruefen.md und ueber.md („Rechenergebnisse … keine rechtliche Bewertung“). ueber.md sagt jetzt wahrheitsgemäß, dass noch keine Anwältin und kein Anwalt die Texte geprüft hat. Ob vor der Veröffentlichung eine Prüfung durch einen Volljuristen erfolgt (§ 6 Abs. 2 RDG), entscheidet der Eigentümer. „Höchstbetrag“ und die Vorauswahl der Teilzustimmung im UI liegen bei Frontend. |
| A F-20 / B F23 | Fachwörter und lange Sätze | FIXED | Erklärt oder ersetzt: Rn., §, Gesetz- und Verordnungsblatt statt „GVBl.“, Soll-Regel, außerordentlich kündigen (mit Beispiel), rechtskräftig, Zustimmungsklage (in allen Plus-Texten ersetzt), Prozesskostenversicherung, Potentialausgleich, verdichtete Bebauung, Nettokaltmiete beim ersten Vorkommen, Rügen. Fundstellen stehen jetzt in einer eigenen Zeile „Quelle:“ unter den Abschnitten von mieterhoehung.md. Der LWU-Absatz ist eine Liste. Der Ablehnungs-Erklärtext ist in kurze Sätze geteilt. |
| A F-21 | Kündigung: alle Mieter unterschreiben | PARTLY | Text: „unterschreiben am sichersten alle die Kündigung“. Ohne geöffnete Norm nicht als Pflicht formuliert. |
| A F-22 / B F21 | Lokale Pfade; Testdatum 01.12.2026 | FIXED / FORWARDED | t22 jetzt: Zugang 16.11.2026, verlangt ab 01.01.2027. Alle Vektoren nachgerechnet. Die Pfade in README.md und sources.md Z. 144–145 (Abschnitt Frontend) wurden an Frontend gegeben. |
| B F1 | Welcher Mietspiegel bei Zugang 01.09.2025 – 27.05.2026 | FIXED (bestätigt) | LG Berlin 65 S 527/13 im Volltext gelesen (Kopie auf nicht amtlicher Website, so in sources.md vermerkt). BGH VIII ZR 295/15 Leitsatz im amtlichen PDF gelesen. Keine feste Regel mehr: „Meist … Ein Gericht kann … auch den Mietspiegel 2026 nehmen oder einen Zuschlag rechnen. Rechnen Sie mit beiden.“ rules.json `mietspiegel_choice.contested_window` gibt Frontend den Zeitraum für den Hinweis. |
| B F3 | Feld Betriebskosten erhöht die Kappungsgrenze zu Unrecht | FIXED | Bestätigt aus § 558 Abs. 3 BGB und dem Rechnen mit der Nettokaltmiete. Bezeichnung und Hilfe von `checker.increases_559_560` neu (nur Modernisierung; Pauschale ausdrücklich ausgenommen). mieterhoehung.md und `rules.kappung` angepasst. |
| B F7 | Impressum | OWNER | Keine Impressumsarbeit (Vorgabe von Main/Eigentümer). |
| B F10 | „15 %“ fest im Text | FIXED | `over_cap` verwendet {rate} und {cap_rent}. |
| B F13, F14, F15 | Teilausschlüsse nach Baualter, Denkmalschutz-Hinweis, Warmwasser-Text 2024 | FORWARDED | Daten: siehe Abschnitt Data (B F13, `note_de` mit Denkmalschutz-Satz bei gebaeude-m08…m11). Rechner-UI und Warmwasser-Text 2024: Frontend. Die Erklärtexte zu den Merkmalen nennen die Regeln schon. |
| B F16 | Rundung bei mehreren Gruppen | PARTLY | Hinweis in `rules.netting` und rules.json `netting.formula_de` (1 Cent möglich). Die Rundungsart wählt Frontend. |
| B F17 | Nach Teilzustimmung nur den zugestimmten Betrag zahlen | FIXED | Steht in mieterhoehung.md, im Risiko-Text von teilzustimmung und in `rules.partial_consent`. |
| B F19 | Tabelle der Mietpreisbremse: Abschluss statt Beginn | FIXED (bestätigt) | Art. 229 § 35 EGBGB geöffnet. Neue Spaltenüberschrift „abgeschlossen“ und der Satz „Die Höhe wird zum Beginn des Mietverhältnisses gemessen.“ |
| B F20 | „Mehrere Unternehmen beschreiben es … je Mieterhöhung“ | FIXED | Satz gestrichen (Vorgabe: nur Belegtes). |
| B F22 | Formvorschriften: § 558a Abs. 3; „an alle Mieter gerichtet“ | PARTLY | § 558a Abs. 3 übernommen (Norm am 17.10. geöffnet). „An alle Mieter gerichtet“ nicht übernommen: Dazu wurde keine Norm und keine Entscheidung geöffnet. |
| Main 3 | Mitgliedsbeiträge der Vereine | FIXED | hilfe.md enthält nur noch Links, keine Beiträge. |
| Main 3 | Freitext-Felder | FIXED | Bleiben erhalten. Warnung in brief.md und in `letters.fields.own_text_help`. |
| Main 3 | Ombudsstelle | FIXED | Nicht als kostenlos bezeichnet. Steht jetzt in einem eigenen Abschnitt in hilfe.md, nicht mehr unter „Kostenlos“. |
| Main 4 | Test t22 und alle Vektoren | FIXED | 33 Tests (27 Prüfer + 6 Saldierung). Alle Prüfer-Vektoren mit einer unabhängigen Python-Referenz nachgerechnet, 0 Abweichungen. Neue Ausgabeschlüssel: `pay_from`, `base_date`, `lwu_cap_rent` (mit Eingabe `lwu: true`). |

## Data (static/data/ms2026.json, ms2024.json, tools/extract_data.py, tools/verify_data.py, Abschnitt Data in sources.md)

Regel (Vorgabe Main): Ein harter Ausschluss `baualter_excluded` steht nur, wo der amtliche Wortlaut ganze Baualtersklassen eindeutig nennt. Ist die Regel mehrdeutig oder betrifft sie nur einen Teil eines Merkmals, gibt es keinen Ausschluss. Stattdessen steht in `note_de` der amtliche Wortlaut der Einschränkung, damit die Oberfläche nachfragen oder warnen kann. Neues Feld: `note_de` (optional, String). `verify_data.py` prüft, dass es wörtlich im Merkmalstext oder in den `notes_de` der Gruppe steht und nie zusammen mit `baualter_excluded` vorkommt. Lauf am 18.10.2026: 4214 Prüfungen bestanden, 0 fehlgeschlagen.

| Fund | Thema | Status | Was / Grund |
|---|---|---|---|
| A F-17 (Daten) | gebaeude-p08 „vor diesem Zeitpunkt“ | FIXED | Ausschluss für 2010+ in beiden Jahren entfernt. Grund: „diesem Zeitpunkt“ kann 2009 oder den Einbautermin meinen. `note_de` = „Einbau/Installation einer modernen Heizanlage ab 2009 (wenn Bezugsfertigkeit des Gebäudes/der Wohnung vor diesem Zeitpunkt)“. |
| A F-17 (Daten) | wohnung-m08 „an allen Fenstern“ (nur 2026) | FIXED | Kein Ausschluss vorhanden. `note_de` = „Kein Einbruchs- und/oder Sichtschutzsystem an allen Fenstern der Wohnung“, damit die Oberfläche auf die zwei möglichen Lesarten hinweisen kann. |
| B F13 | bad-p08 (wandhängendes WC ab 2002 ausgeschlossen, Stand-WC immer) | FIXED | Es gab keinen harten Ausschluss; dabei bleibt es, weil nur ein Teil betroffen ist. `note_de` = „(gilt nicht für die Baualtersklassen ab 2002)“. Teil-Kästchen (B schlägt bad-p08a/b vor) nicht als eigene Merkmale angelegt: Der PDF hat ein Kästchen; das entscheidet Frontend in der Oberfläche. |
| B F13 | bad-p09 (Handtuchwärmer bis 2001, elektrisch alle Baujahre) | FIXED | Kein harter Ausschluss. `note_de` = Wortlaut „(gilt für … bis einschließlich 2001); sofern zusätzlich/falls elektrisch betreibbar: alle Baujahre“. |
| B F13 | umfeld-p02 (Kinderspielplatz nur bei Bezugsfertigkeit vor 2003 bzw. 2024: vor 2002) | FIXED | Kein harter Ausschluss (betrifft nur ein Beispiel des Merkmals). `note_de` = „Kinderspielplatz – bei Bezugsfertigkeit des Gebäudes vor 2003“ (2024: „vor 2002“). |
| B F13 | gebaeude-p08 und Klasse 2002_2009 | FIXED | Durch Wegfall des Ausschlusses erledigt (siehe A F-17). |
| B F14 | Denkmalschutz-Regel bei den Energie-Minusmerkmalen | FIXED (Daten) / FORWARDED (UI) | gebaeude-m08 bis m11 tragen jetzt den amtlichen Denkmalschutz-Satz als `note_de` (wie in `groups[gebaeude].notes_de`). Den Hinweis neben den automatischen Energie-Kästchen zeigt Frontend. |
| B F15 | Warmwasser-Regel 2024 anders als 2026 | NO CHANGE (Daten) / FORWARDED (UI) | Beide Fassungen stehen schon wörtlich in `groups[gebaeude].notes_de` des jeweiligen Jahres. Die jahresabhängige Beschriftung macht Frontend. |

## Frontend (templates, static/js, static/css, ui/*.json, tests/run.mjs, README.md, Frontend section in sources.md)

Rule applied: findings raised by both reviewers were fixed. Findings raised by one reviewer were reproduced in code or checked in the source first (sources in `docs/sources.md`, Frontend section). Regression tests are in `tests/run.mjs`, section "review regressions".

| Finding | Topic | Status | What / reason |
|---|---|---|---|
| A F-1 / B F2 | Scope gate | FIXED | New `static/js/app/scope.js`. **Checker:** step 1 asks "Does the letter ask you to consent?" (yes / no / not sure) plus a checklist: social housing/Kostenmiete, § 559, § 560, index/graduated rent, § 549 cases, 1–2-family/terraced house, new build after the Mietspiegel period, WC outside. If the answer is "no" or a non-§ 558 case is ticked, no result is shown. Instead a danger box says "do not simply stop paying, get advice" and links to Hilfe. If the question is unanswered, no result is shown either. "Not sure" shows a warning above the result. **Calculator:** Mietspiegel-scope checklist (Nr. 3) in step 2; if anything is ticked, row, result and comparison are hidden, and no OVM is passed on to the checker. The calculator also tells the user which build year the chosen edition stops covering. **Letter page:** shows the scope warning before any letter. |
| A F-2 / B F4 | Payment date in the letter | FIXED | `check()` returns `pay_from` = max(legal date, landlord's requested date) and `base_date`. The letter prefill uses `pay_from`. New pure helpers `prefill()` / `letterValues()` in `lib/letter.js`: a field the user emptied or edited is never refilled; built-in placeholders never override a template field of the same id. Tests: rules.json t22–t25 (Content) plus the unit tests "cleared date field is not refilled" and "consent letter with emptied date contains no automatic date". Browser reproduction of A's case (received 15.10.2026, requested 01.02.2027): letter says "ab dem 01.02.2027"; after clearing the field and reloading, no date is filled in. |
| A F-3 / B F11 | Cap computed from today's rent | FIXED (logic) / PARTLY | Reproduced (last_change 01.10.2024, rent_3y_ago empty → green "within limits"). New findings `need_rent_3y` (rent changed within 3 years, or date unknown, and field empty) and `no_last_change`. `within_limits` is now issued only if `last_change` and the OVM are present and no warning exists. The field hint shows the concrete date ("Ihre Nettokaltmiete am …"). Not done: setting `cap_rent = null` as A proposed – rules.json tests t13–t16 require the cap from the current rent when nothing else is known. It is still shown, with the note "your current rent was assumed as the rent on …". Not done either: A's "warn instead of ok" colour for `within_limits` – after the gating it only appears with complete inputs. The title says "nach Ihren Angaben". |
| A F-4 | LWU limits not checked | FIXED (verified) | Press release of 15.07.2025 and the Ombudsstelle FAQ opened live (quotes in sources.md). New checker option "Mein Vermieter ist ein landeseigenes Wohnungsunternehmen". The cap is min(base × (1 + `lwu.cap_rate_3y`) + § 559, current + euro cap by area); it only applies within the `lwu` validity period. New finding `over_lwu`. Tests t26/t27 (Content) and a unit test pass. |
| A F-5 / B F18 | Amounts in consent letters | FIXED | `amountProblems()`: partial consent requires current < agreed < demanded; consent requires current < new ≤ demanded. The error is shown in the form and above the letter. Template fields are Content's (now required). |
| A F-6 / B F6 | Checker warnings not shown before consent | FIXED | The letter page shows a danger box before consent or partial consent if the check found any of: sperrfrist_fail, requested_too_early, wartefrist_postponed, over_cap, over_ovm, over_lwu, need_rent_3y. If no check was done, a warning links to the checker. |
| B F5 | Consent loses Mietpreisbremse objections | FIXED | Fixed danger box "Eine Zustimmung legt die neue Miete fest" for consent and partial consent: binding agreement, no withdrawal as a rule, Mietpreisbremse lost (BGH VIII ZR 300/21), no conditions, don't sign the landlord's form. Includes a link to the Mietpreisbremse page. |
| B F17 | Partial consent: pay only agreed amount | FIXED | Added to UI warning `letter_warn_partial`. Content texts were changed as well. |
| A F-10 | "+20 %" read as rent +20 % | FIXED (verified in UI) | The calculator's group badges said "+20 %" / "−20 %". Now they say Plus / Minus / zählt nicht. The sum row shows the signed number of groups. The delta line reads "Summe × ein Fünftel (20 %) des Abstands". |
| A F-11 / B F12 | Feature list not closed | FIXED | `calc_oh_note` under every result: the list is not complete (Nr. 10.1), so the result is an estimate. |
| A F-12 | Actual floor area | FIXED (verified) | BGH VIII ZR 266/14 Leitsatz a opened. `calc_area_hint` changed. |
| A F-17 | gebaeude-p08 hard exclusion | FORWARDED → Data FIXED | Data removed the exclusion and added `note_de`. The calculator and the catalogue show `note_de` as a warning ("check this condition yourself"). |
| A F-19 | Verdict wording; partial consent steered | PARTLY | UI fallback for sperrfrist_fail: "Nach der festen Rechenregel und Ihren Angaben …". "Höchstens zulässig" renamed to "Rechnerische Obergrenze nach Ihren Angaben". The checker's callout no longer points to partial consent: it says get advice, read the letter notes, consent is binding. The letter page never pre-selects a template. A lawyer review (§ 6 RDG) is an owner decision. |
| A F-22 / B F21 | Local paths | FIXED | README and the Frontend section of sources.md now use `nix shell --inputs-from ../vps …`. The reference to the internal file E1_… was replaced by Frontend's own live check of the Wohnlage URL (18.10.2026). t22 date: Content. |
| B F1 | Newer Mietspiegel for receipts after its Stichtag | FIXED (verified) | LG Berlin 65 S 527/13 PDF opened (Leitsatz 1). `contestedYear()` reads `rules.mietspiegel_choice.contested_window`. The calculator shows "Ein Gericht kann deshalb auch den Mietspiegel 2026 nehmen …" after the date of receipt is entered; the checker shows the same next to the Mietspiegel year. Browser test: date 01.03.2026 → hint shown, year 2024, official 2024 example 7,53 € reproduced. |
| B F3 | "Betriebskosten" field raises the cap | FIXED (verified in code) | `cap_rent = base × (1 + rate) + increases`, so an advance-payment change typed there raised the net cap. UI label and hint now say: only § 559 modernisation increases of the cold rent; no advance payments. Content changed its overriding label the same way. |
| B F10 | "15 %" hard-coded | FIXED | Finding texts get `{rate}` (and `{cap_rent}`, `{ovm_rent}`, `{lwu_cap}`, `{base_date}`, `{pay_from}`). |
| B F13 | Partial (OR) Baualter exclusions not enforced | FIXED (warning) | One official checkbox with OR alternatives cannot be split without inventing data. Data's `note_de` (bad-p08, bad-p09, umfeld-p02, gebaeude-p08, wohnung-m08) is shown next to the checkbox as "Bitte prüfen Sie diese Bedingung selbst". |
| B F14 | Denkmalschutz not applied by the energy helper | FIXED | The official Denkmal sentence is shown under the energy helper and at gebaeude-m08…m11 (`note_de`). |
| B F15 | Hot-water rule differs in 2024 | FIXED (verified) | ms2024.txt: "Für dezentrale Warmwasserversorgung sind … aufzuschlagen"; 2026: "Für Kennwerte ohne Berücksichtigung der dezentralen Warmwasserversorgung …". The checkbox now shows the official sentence of the selected year (taken from the data) under a neutral label. |
| B F16 | Rounding with ≥ 2 net groups | PARTLY | Kept one rounding of net × 20 % × span: that is the literal formula of Nr. 10.3, and the official examples pass. A note is shown under the calculation when \|net\| ≥ 2 (difference of a few cents possible). |
| B F7 | Impressum | OWNER | Skipped as instructed by Main. |
| — | Own bug found during the fixes | FIXED | `rechner.js save()` crashed when no table row matched (`r.row` null). Now guarded. |

## Master fixes after translation (Content, 18.10.2026)

| Datei | alt | neu |
|---|---|---|
| content/ueber.md (Abschnitt „Was diese Seite ist“) | „Mit der Taste „Daten löschen“ entfernen Sie sie wieder.“ | „Mit der Taste „Meine Eingaben löschen“ entfernen Sie sie wieder.“ (= UI-Schlüssel `clear_data`) |
| content/ueber.md (Abschnitt „Sprachen“) | „Die Seite gibt es auf Deutsch in einfacher Sprache. Weitere Sprachen folgen. Briefe an den Vermieter sind immer auf Deutsch.“ | „Die Seite gibt es in diesen Sprachen: Deutsch (einfache Sprache), English, Türkçe, العربية, Українська, Русский und Polski. Alle Übersetzungen sind inoffiziell. Verbindlich ist nur der amtliche deutsche Text des Mietspiegels und der Gesetze. Briefe an den Vermieter sind immer auf Deutsch.“ |
| content/hilfe.md (Abschnitt „Rechtsanwältinnen und Rechtsanwälte“) | „Für einen Prozess oder eine verbindliche Prüfung können Sie sich …“ | „Für einen Prozess oder eine Prüfung Ihres Einzelfalls können Sie sich …“ |
| content/rechner.md (Baualter) | unverändert: „Eine modernisierte Wohnung bleibt in der Regel im ursprünglichen Baujahr des Hauses.“ | – (entspricht Mietspiegel 2026 Nr. 6.4: „grundsätzlich in das ursprüngliche Jahr der Bezugsfertigkeit“). Der UI-Schlüssel `calc_baualter_hint` („bleibt im alten Baujahr“) gehört Frontend; Frontend hat ihn in ui/de.json („… bleibt in der Regel im alten Baujahr.“) und ui/en.json („as a rule keeps the original year“) angeglichen. Laut Frontend (Prüfung aller 7 ui/<lang>.json) tragen alle Sprachen den Zusatz: tr „kural olarak“, ar „في العادة“, uk „як правило“, ru „как правило“, pl „z reguły“. Erledigt. |

### Master fixes after translation – Runde 2 (Content, 18.10.2026; Hinweise von T_ar über Main)

Prüfung zu 1: § 558 Abs. 3 S. 1 BGB: „darf sich die Miete innerhalb von drei Jahren, von Erhöhungen nach den §§ 559 bis 560 abgesehen, nicht um mehr als 20 vom Hundert erhöhen“ (am 17.10.2026 live geöffnet). Rechenweg in rules.json: cap_rent = rent_3y_ago × (1 + Satz) + increases_559_560. Die neue Formulierung beschreibt genau diese Rechnung. Den Vorschlag „die Grenze wird ohne sie berechnet“ habe ich nicht allein übernommen. Er lässt offen, ob die Modernisierungserhöhung zusätzlich erlaubt ist, deshalb steht jetzt ein Beispiel dabei.

| Datei / Schlüssel | alt | neu |
|---|---|---|
| content/mieterhoehung.md (Grenzen, Punkt 2) | „Erhöhungen nach einer Modernisierung (§ 559 BGB) werden zu dieser Grenze dazugerechnet. Änderungen Ihrer Vorauszahlung für Nebenkosten haben mit der Nettokaltmiete nichts zu tun.“ | „Erhöhungen nach einer Modernisierung (§ 559 BGB) zählen bei den 15 % nicht mit. Das heißt: Die 15 % werden ohne sie berechnet, und eine solche Erhöhung darf zusätzlich zu den 15 % dazukommen. Beispiel: Vor drei Jahren betrug die Nettokaltmiete 600 €. Seitdem stieg sie wegen einer Modernisierung um 40 €. Dann liegt die Grenze bei 600 € + 15 % = 690 €, plus 40 € = 730 €. Änderungen Ihrer Vorauszahlung für Nebenkosten haben mit der Nettokaltmiete nichts zu tun.“ |
| de.json `rules.kappung.text` | „Erhöhungen der Kaltmiete nach einer Modernisierung (§ 559 BGB) werden zur Grenze hinzugerechnet.“ | „Erhöhungen der Kaltmiete nach einer Modernisierung (§ 559 BGB) zählen bei den 15 % nicht mit: Die 15 % werden ohne sie berechnet, und eine solche Erhöhung darf zusätzlich dazukommen.“ |
| content/mieterhoehung.md (Formulare des Vermieters) und content/brief.md (Liste „Bitte beachten Sie“) | „Unsere Briefe enthalten nur die Mieterhöhung.“ | „Unsere Briefvorlagen betreffen nur die Mieterhöhung und nichts anderes in Ihrem Mietvertrag.“ |
| content/mieterhoehung.md (Landeseigene Vermieter, Leistbarkeitsversprechen) | „Das Berliner Gesetz zu den landeseigenen Unternehmen nennt für Härtefälle 220 % der Grenzen des Bundes.“ | „Das Berliner Gesetz zu den landeseigenen Unternehmen nennt für Härtefälle 220 % der Einkommensgrenzen aus dem Wohnraumförderungsgesetz des Bundes (§ 9 Abs. 2 WoFG).“ (Quelle: § 3 Abs. 3 WUAusrStärkG BE, am 17.10.2026 geprüft: „220 Prozent der Einkommensgrenzen nach § 9 Absatz 2 des Wohnraumförderungsgesetzes“) |

### Master fixes after QA – Runde 3 (Content, 18.10.2026; aus QA_en.md „Issues in the German master“ und QA_ar.md)

| Datei / Schlüssel | alt | neu |
|---|---|---|
| de.json `features.<id>.proof`, erster Satz, in 40 Minus-Merkmalen (bad-m01, bad-m02, bad-m03, bad-m04, bad-m05, bad-m06, bad-m07, bad-m08, bad-m09, bad-m10, gebaeude-m01, gebaeude-m02, gebaeude-m03, gebaeude-m04, gebaeude-m05, gebaeude-m06, gebaeude-m07, gebaeude-m08, gebaeude-m09, gebaeude-m10, gebaeude-m11, kueche-m01, kueche-m02, kueche-m03, kueche-m04, kueche-m05, kueche-m06, kueche-m07, umfeld-m01, umfeld-m02, umfeld-m03, umfeld-m04, wohnung-m01, wohnung-m02, wohnung-m03, wohnung-m04, wohnung-m05, wohnung-m06, wohnung-m07, wohnung-m08) | „Belegen Sie ein Minus-Merkmal, auf das Sie sich berufen, am besten selbst. Das Landgericht Berlin verlangt das im Streitfall von Ihnen; andere Gerichte können das anders sehen.“ | „Wenn Sie sich auf dieses Minus-Merkmal berufen, müssen in der Regel Sie es beweisen. So hat es das Landgericht Berlin entschieden; andere Gerichte können das anders sehen.“ (Rest des Textes, „Hilfreich: …“, unverändert) |
| de.json `rules.scope.text` | „Dann müssen Sie die höhere Miete oft auch ohne Zustimmung zahlen.“ | „Dann müssen Sie die höhere Miete meist auch ohne Zustimmung zahlen.“ (wie brief.md, pruefen.md, mieterhoehung.md) |
| ui/de.json `letter_binding_text` (Eigentümer Frontend) | „Hat Ihr Mietvertrag nach dem 01.06.2015 begonnen? …“ / „… können Sie sich nicht mehr auf die Mietpreisbremse berufen …“ | ERLEDIGT durch Frontend (de + en, Übersetzer informiert): „Hat Ihr Mietvertrag ab dem 01.06.2015 begonnen? …“ und „… können Sie sich grundsätzlich nicht mehr auf die Mietpreisbremse berufen …“. Quellen: Art. 229 § 35 Abs. 1 EGBGB (Verordnung vom 28.04.2015 gilt ab 01.06.2015), BGH VIII ZR 300/21 Rn. 32 („grundsätzlich“). |

### Frontend – QA round (QA_ar, QA_uk): Minderausstattung wording

| Finding | Topic | Status | What / reason |
|---|---|---|---|
| QA_ar | `calc_minder_label` unclear: "kein Bad" could be read as "WC outside the flat" | FIXED | de/en now say: no Sammelheizung, no Bad, or neither; "Das WC ist aber in der Wohnung"; and "Ist das WC außerhalb der Wohnung, gilt der Mietspiegel nicht" (the scope gate covers that case). `abschlag_intro` changed the same way. |
| QA_uk | "Sammelheizung" read as "central heating" | FIXED (verified) | Official definition checked in both brochures (tools/src/ms2026.layout.txt l. 411–416, ms2024.layout.txt l. 446–451, Nr. 6.3, identical): „alle Heizungsarten …, bei denen die Wärme- und Energieerzeugung von einer zentralen Stelle aus geschieht. Eine Etagenheizung oder Wohnungsheizung (Gas-, Öl-, Elektroheizung), die sämtliche Wohnräume angemessen erwärmt, ist einer Sammelheizung gleichzusetzen.“ The Bad definition (same place) is paraphrased too. The en text keeps the German terms Sammelheizung/Bad instead of "central heating". Translators (Fix_*) must update `calc_minder_label` and `abschlag_intro` in their ui/<lang>.json. |

## Translation QA – en

Quelle: `99 Arbeitsdateien/Website/QA_en.md` (QA_en, 18.10.2026). Keine CRITICAL- und keine MAJOR-Funde. Jeder Fund wurde mit dem deutschen Master verglichen.

| Fund | Datei / Schlüssel | Status | Was / Grund |
|---|---|---|---|
| M1 | en.json `features.*-m*.proof` (40 Minus-Merkmale) | FIXED | Mit dem Master-Sync Runde 3 erledigt: Die ersten zwei Sätze lauten jetzt „If you rely on this minus feature, it is usually you who has to prove it. This is how the Landgericht Berlin (Berlin Regional Court) decided; other courts may see it differently.“ Die Mehrdeutigkeit von „yourself“ ist damit weg. „Helpful: …“ unverändert. |
| M2 | en.json `groups.wohnung.intro`, `bad-p07.check`, `gebaeude-p03.check`, `wohnung-m01.check` | FIXED | „By the meaning of the word,“ → „Taken literally,“. |
| M3 | mieterhoehung.en.md (11 %-Absatz) | FIXED | „the rent in an agreement“ → „the rent under one tenancy agreement“ (Master: „in einem Vertrag“). |
| M4 | mieterhoehung.en.md (Mietpreisbremse-Hinweis) | FIXED | „Tenancy agreement from June 2015?“ → „Tenancy started in June 2015 or later?“ (Master: „ab Juni 2015“). |
| M5 | rechner.en.md; en.json `rules.netting.text` | FIXED | „set off against each other“ → „weighed / weigh the groups against each other: one plus group and one minus group cancel each other out“. Der Zusatz erklärt nur „aufrechnen“, ohne neuen Inhalt. |
| M6 | en.json `rules.termination_declare_by.title`; ui `chk_out_termination_declare_by` | FIXED | „deadline (common interpretation)“ / „until (common interpretation)“. |
| M7 | ui `calc_disp_other` | FIXED | „There are also {n} more differences … fewer plus features).“ |
| M8 | ui `calc_self_text` | FIXED | „If a tenant installed something themselves and the landlord did not pay back the costs, it does not count …“ (Master: „Ausstattung … Kosten nicht erstattet“). |
| M9 | en.json `checker.result.over_cap.text` | FIXED | „Based on this limit, the maximum works out at {cap_rent}.“ |
| M10 | ui `letter_binding_text` (Absatz 3) | FIXED | „(„nur wenn …“, “only if …”)“, wie in brief.en.md und `letters.fields.own_text_help`. |
| M11 | ueber.en.md (Keine Rechtsberatung) | FIXED | Zitiert jetzt das englische UI-Label “Above the cap (Kappungsgrenze)” (= `checker.result.over_cap.title`). |
| M12a | rechner.en.md (Baualter) | FIXED | „usually keeps the original building year“. |
| M12b | ueber.en.md (Stand) | FIXED | „on 17 and 18 October 2026“. |
| M12c | mietpreisbremse.en.md Punkt 2 | FIXED | „**Complain (Rüge):** Tell the landlord that the rent is too high. …“ (Rest unverändert). |
| M12d | en.json `wohnung-p11.explain` / `.check` | FIXED | „security bar(s)“ → „door guard(s) (Sperrbügel)“. |
| M12e | en.json `rules.termination_ends.text` | FIXED | „at the end of the second month after the month in which your notice arrives“. Das vorgeschlagene Beispiel wurde nicht ergänzt, weil es im Master an dieser Stelle nicht steht (es steht in mieterhoehung.en.md). |

Sync mit dem Master (Runde 3):
- en.json `features.<id>.proof` in allen 40 Minus-Merkmalen: neue erste zwei Sätze (siehe M1).
- en.json `rules.scope.text`: „often“ → „usually“ (Master „meist“).
- ui/en.json `letter_binding_text`: von Frontend schon angeglichen, geprüft: „on or after 01.06.2015“ und „as a rule, you can no longer rely on the rent brake“ entsprechen dem Master. Nur Absatz 3 geändert (M10).

Funde im deutschen Master (aus QA_en, nicht geändert): Alle drei sind in Runde 3 schon erledigt („ab dem 01.06.2015“, „grundsätzlich“ in `letter_binding_text`; „meist“ in `rules.scope.text`). Keine offenen Master-Funde.

## Translation QA – pl (Fix_pl, 18.10.2026)

Quelle: `99 Arbeitsdateien/Website/QA_pl.md` (QA_pl). Keine CRITICAL- und keine MAJOR-Befunde. Alle 13 MINOR-Befunde mit dem deutschen Master verglichen.

| Fund | Status | Was / Grund |
|---|---|---|
| M1 | FIXED | „w zwierciadle czynszów“ (Lokativ) in `features.kueche-m04/gebaeude-p03/umfeld-m01.explain`. |
| M2 | FIXED | mieterhoehung.pl.md: „Jeśli coś zostało zamontowane przez ciebie i opłacone z twoich własnych pieniędzy …“. |
| M3 | FIXED | `checker.result.wartefrist_postponed.text` und `rules.effective.text`: „nie minie jeszcze 15 miesięcy od ostatniej zmiany (twojego) czynszu“; BGH-Satz entschachtelt („Nie znaleźliśmy orzeczenia …, które wyjaśniałoby …“). |
| M4 | FIXED | Ankreuz-Kästchen = „kratki“: `groups.gebaeude.intro`, `gebaeude-m09/m10/m11/p09/p10/p11.explain`, ui `calc_energy_intro/apply/done`. „pole“ bleibt nur für das Mietspiegel-Feld. |
| M5 | FIXED (eigene Formulierung) | rechner.pl.md, ui `calc_scope_intro`, `scope_notms_text`: „czynsz nie jest ustalany na podstawie dotacji publicznych (nicht preisgebunden)“. QA schlug „urzędowo ograniczony“ vor; abgelehnt, weil Leser das mit der Mietpreisbremse (auch eine gesetzliche Begrenzung) verwechseln könnten. In `scope_notms_text` Bezug auf die Häuser klargestellt („w domach ukończonych …“). |
| M6 | FIXED | „kraj związkowy Berlin“ statt „Land(u) Berlin“: ui `footer_no_advice`, `opens_new_tab`, `calc_wohnlage_help`; hilfe.pl.md. |
| M7 | FIXED | ui `optional` = „opcjonalnie“. |
| M8 | FIXED | `letters.teilzustimmung.explain`: „(niewyczerpująca)“. |
| M9 | FIXED | ui `letter_warn_partial` („kwotę objętą twoją zgodą“), `letter_binding_text` Abs. 1 („Gdy wyrazisz zgodę, nowy czynsz zostaje uzgodniony.“) und Abs. 2 („Wobec czynszu objętego twoją zgodą co do zasady …“, „co do zasady“ behalten). |
| M10 | FIXED | „remis“ ersetzt: „Jeśli cech plus i cech minus jest tyle samo, grupa się nie liczy.“ in fünf `groups.*.intro`, rechner.pl.md, ui `calc_features_intro`; `rules.netting.text`: „Tyle samo plusów i minusów: 0.“ |
| M11 | FIXED | `features.bad-m09.check`: „nie pryskała po całym pomieszczeniu“. |
| M12 | FIXED | mieterhoehung.pl.md: „Wohnungsbindungsgesetz“ (ustawa o mieszkaniach dotowanych ze stałym czynszem). |
| M13 | FIXED | mietpreisbremse.pl.md: „Mietpreisprüfstelle (urząd sprawdzający wysokość czynszu)“ wie in hilfe.pl.md. |

Sync mit Master (Runde 3):
- `features.<id>.proof`, 40 Minus-Merkmale: erster Satz jetzt „Jeśli powołujesz się na tę cechę minus (Minus-Merkmal), z reguły to ty musisz ją udowodnić. Tak orzekł sąd Landgericht Berlin; inne sądy mogą to oceniać inaczej.“ (Rest unverändert).
- `rules.scope.text`: „często“ → „zwykle“ (meist).
- ui `letter_binding_text`: „01.06.2015 albo później“ und „co do zasady“ waren schon durch T_pl übernommen; geprüft, nicht doppelt geändert.

Master-Änderung ui (Hinweis von Main): `calc_minder_label` und `abschlag_intro` aus dem aktuellen ui/de.json neu übersetzt (Definition Sammelheizung/Bad nach Nr. 6.3, WC muss in der Wohnung sein; en.json als Vergleich). Ein QA_pl-Befund zu diesen Schlüsseln lag nicht vor.

Hinweise zum deutschen Master (nicht geändert):
- QA-Hinweis 1 (`letter_binding_text` „nach dem“) und 2 (`rules.scope.text` „oft“) sind durch Runde 3 erledigt.
- QA-Hinweis 3 offen: ui `calc_self_text` sagt „Haken Sie dann „selbst eingebaut“ an“, das Kästchen `calc_self_installed` heißt aber „selbst eingebaut und bezahlt (zählt nicht)“.
- Neu: ui `scope_intro` sagt noch „Dann müssen Sie die höhere Miete **oft** zahlen“, die anderen Texte nach Runde 3 „meist“. PL folgt dem Master („często“).

### Translation QA – uk (Fix_uk, 18.10.2026; Quelle: `99 Arbeitsdateien/Website/QA_uk.md`)

| Fund | Status | Was / Grund |
|---|---|---|
| M1 Sammelheizung | FIXED / ersetzt | `calc_minder_label` und `abschlag_intro` nach Vorgabe von Main aus dem neuen ui/de.json (amtliche Definition Nr. 6.3, WC in der Wohnung) neu übersetzt; damit ist der QA-Vorschlag für diese Schlüssel überholt. rechner.uk.md Z. 19: „опалення всіх кімнат від одного джерела тепла (Sammelheizung – наприклад, центральне або поквартирне опалення)“. |
| M2 Stockwerkszählung | FIXED | gebaeude-m06 title/explain/check nach QA-Vorschlag („5-й поверх над першим (5. Obergeschoss)“, ukrainische Zählung erklärt, „цокольний“ entfernt). gebaeude-p06 explain/check angeglichen („поверхів над першим (Obergeschosse)“). |
| M3 „напевно“ | FIXED | mieterhoehung.uk.md: „Ви точно встигнете …“. |
| m1 | FIXED | „Інша справа, якщо …“ (statt QA „Інакше буває“, idiomatischer) in mieterhoehung.uk.md und `rules.landlord_equipment.text`. |
| m2 | FIXED | „має значення“ / „вирішальним є“ an allen fünf Stellen. |
| m3 | FIXED | „вперше треба було сплатити“; „строк сплати якої настав“. |
| m4 | FIXED | „уточнене в межах діапазону за допомогою Orientierungshilfe“. |
| m5 | FIXED | „листа в довільній формі“. |
| m6 | FIXED | „щонайпізніше із закінченням дня 31.12.2029“. |
| m7 | FIXED | „Mietpreisprüfstelle (служба перевірки орендної плати)“ in mietpreisbremse.uk.md. |
| m8 | FIXED | „Центр підтримки новоприбулих (Willkommenszentrum)“. |
| m9 | FIXED | „Якщо ви заселилися в цей день або пізніше …“. |
| m10 | FIXED | Satz neu nach QA-Vorschlag. |
| m11 | FIXED | „за Mietspiegel {year} і за Mietspiegel {newer}“, „за Mietspiegel {need}“. |
| m12 | FIXED | „Кількість інших відмінностей, вигідних для вас: {n} …“ (grammatisch vollständig; Platzhalter unverändert). |
| m13 | FIXED | „вишукане (складне)“ / „вишукано (з більшими витратами)“ in wohnung-p04 und umfeld-p02. |
| m14 | FIXED | „точно може сказати лише електрик“. |
| m15 | FIXED | „комунальні витрати“ einheitlich in `rules.kappung`, `rules.scope`, `checker.increases_559_560_help`, ui `chk_in_increases_559_560_hint`, `calc_row_per_sqm_note`. |

Sync mit dem Master (Runde 3): 40 Minus-`proof`-Sätze neu („Якщо ви посилаєтеся на цю ознаку «мінус», як правило, довести її маєте саме ви. Так вирішив Земельний суд Берліна (Landgericht Berlin); інші суди можуть вважати інакше.“; Rest unverändert). `rules.scope.text`: „часто“ → „зазвичай“ (wie brief.uk.md, pruefen.uk.md). ui `letter_binding_text` war bereits synchron („почався 01.06.2015 або пізніше“, „як правило“), nicht doppelt geändert.

Hinweis zum Master (aus QA_uk, nicht geändert): `letter_binding_text` „nach dem 01.06.2015“ – inzwischen im Master auf „ab dem“ korrigiert (Runde 3); uk folgt.

## Translation QA – ar (Fix_ar, 18.10.2026; Quelle: `99 Arbeitsdateien/Website/QA_ar.md`)

| Fund | Status | Umsetzung |
|---|---|---|
| M1 | FIXED (ersetzt) | ui `calc_minder_label` nicht nach QA-Vorschlag, sondern nach Vorgabe Main aus dem neuen Master neu übersetzt: Bedingung „لكن المرحاض موجود داخل الشقة“ als eigener Satz, Definition Sammelheizung/Bad (Nr. 6.3), Satz „WC außerhalb → Mietspiegel gilt nicht“. Ebenso ui `abschlag_intro` neu übersetzt (bisher nur ein Satz ohne WC-Bedingung). Die Mehrdeutigkeit aus M1 ist damit beseitigt. |
| m1 | FIXED | „محكمة الولاية في برلين“ → „المحكمة الإقليمية في برلين“ überall (87 Stellen in content/ar.json, `mieterhoehung.ar.md`). Bei `features.umfeld-p03.proof` fehlte zudem „(Landgericht Berlin)“, ergänzt. |
| m2 | FIXED | `mieterhoehung.ar.md`: „خصائص الزائد / خصائص الناقص“. Dazu in 15 Plus-`proof`-Texten „خصائص زائد“ → „خصائص الزائد“ vereinheitlicht. |
| m3 | FIXED | `mieterhoehung.ar.md`: „غير صالح“ → „غير نافذ (unwirksam)“, wie in rules/checker/ui. |
| m4 | FIXED | „الإيجار البارد“ → „الإيجار الأساسي (Kaltmiete)“ in `rules.kappung.text`, `checker.increases_559_560_help`, ui `chk_in_increases_559_560_hint` (dort deutscher Begriff ergänzt). |
| m5 | FIXED | `checker.received_help`: „صندوق البريد عند بيتك (Briefkasten) أو … صندوقك في مكتب البريد (Postfach)“. |
| m6 | FIXED | `mietpreisbremse.ar.md` Vormiete: „إذا كان المستأجر الذي سكن قبلك يدفع إيجاراً أعلى أصلاً …“. |
| m7 | FIXED | „في الغالب“ für „überwiegend/meist“ ersetzt durch „معظم / الجزء الأكبر / في معظمها“: `groups.wohnung.intro`, `gebaeude-m01.explain`, `wohnung-m03.title/.explain`, `wohnung-m04.title/.explain`, `wohnung-p03.explain`, `wohnung-p05.title/.explain`, `wohnung-p10.explain`; zusätzlich `wohnung-m01.check` („Überwiegend“ (في معظمها)). `rules.mietspiegel_choice` („Meist nimmt man …“ = Häufigkeit) bleibt „في الغالب“, dort korrekt. |
| m8 | FIXED | „فيجب“ → „فينبغي“ in `brief.ar.md` und `letters.fields.tenant_name_help`. |
| m9 | FIXED | ui `calc_energy_bedarf`: „احتياج الطاقة“. |
| m10 | FIXED | ui `letter_binding_text`: „(„nur wenn …“ أي „فقط إذا …“)“, wie in `brief.ar.md`. |
| m11 | FIXED | `mieterhoehung.ar.md`: „أسماء الشاهدات والشهود“. |

Sync mit dem Master (Runde 3):
- 40 Minus-`proof`-Texte: erster Satz neu „إذا استندت إلى خاصية الناقص هذه، فعليك أنت في العادة أن تُثبتها. هكذا قررت المحكمة الإقليمية في برلين (Landgericht Berlin)؛ وقد ترى محاكم أخرى ذلك بشكل مختلف.“ (Rest unverändert).
- `rules.scope.text` „meist“: AR hatte schon „غالباً“ (= meist), gleich wie `brief.ar.md`/`pruefen.ar.md`; keine Änderung nötig.
- ui `letter_binding_text` Absatz 2 („ab dem 01.06.2015“, „grundsätzlich“): war bereits als „في 01.06.2015 أو بعده“ / „من حيث المبدأ“ übersetzt; geprüft, nicht doppelt geändert.
- ui `calc_minder_label`, `abschlag_intro`: neu aus dem geänderten Master übersetzt (siehe M1).

Hinweise zum Master (aus QA_ar, nicht geändert): (1) `letter_binding_text` „nach dem 01.06.2015“ – im Master inzwischen auf „ab dem“ korrigiert. (2) `calc_minder_label` Klammer „(das WC ist in der Wohnung)“ zu knapp – im Master inzwischen als eigener Satz „Das WC ist aber in der Wohnung.“ umformuliert.

## Translation QA – tr (Fix_tr, 18.10.2026; Quelle: `99 Arbeitsdateien/Website/QA_tr.md`)

| Fund | Schlüssel / Datei | Status | Was / Grund |
|---|---|---|---|
| M1 | `features.wohnung-p08.title`, `.explain` | FIXED | „az engelli“ (= leicht behindert) ersetzt durch „az bariyerli (kolay erişilebilir)“ bzw. „az bariyerli (barrierearm), yani kolay erişilebilir“; Bad-Zitat-Glosse „az bariyerli banyo düzeni“. |
| m1 | `_index.tr.md` Z. 13, `rechner.tr.md` description + Z. 21, `rules.ovm.text` | FIXED | „alan“ (Fläche) für das Mietspiegel-Feld ersetzt durch „satır (Feld)“, passend zu UI `calc_step_row`/`calc_row_found`. |
| m2 | `mieterhoehung.tr.md` Z. 141 | FIXED | „… fesih bildiriminin ulaştığı aydan sonraki ikinci ayın sonunda sona erer“, wie `rules.termination_ends`. |
| m3 | `mieterhoehung.tr.md` Z. 82 | FIXED | Pleonasmus „geri iade“ ersetzt: „otomatik ödemeyi (Lastschrift) iade ettirip ettiremeyeceğinizi“. |
| m4 | `_index.tr.md` Z. 17 | FIXED | „endeksli kirada (Indexmiete)“ mit Lokativ. |
| m5 | `checker.increases_559_560_help`, `rules.kappung.text`, ui `chk_in_increases_559_560_hint` | FIXED | „soğuk kira“ bleibt (Kaltmiete ist hier gemeint, nicht Nettokaltmiete), mit Glosse „(Kaltmiete: ısıtma giderleri hariç kira)“. |
| m6 | `rules.pay_from.title` | FIXED | „Onay verirseniz ne zamandan itibaren ödersiniz“ (Konditional wie „würden“). |
| m7 | `letters.zustimmung.when` | FIXED | „bekleme sürelerine uyulmuş“ (= eingehalten). |
| m8 | `features.gebaeude-p04.proof`, `gebaeude-m03.proof`, `gebaeude-m04.proof` | FIXED | „ayıp (kusur) bildirimleri“ → „kusur bildirimleri (Mängelmeldung)“. |
| m9 | `features.gebaeude-p06.explain` | FIXED | „zemin kat hariç beşten az katı (Obergeschoss)“. |
| m10 | `checker.rent_3y_ago_help`, ui `chk_in_rent_3y_ago_hint` | FIXED | „alanı“ → „burayı“ (keine Verwechslung mit Wohnfläche). |
| m11 | `mieterhoehung.tr.md` Z. 119, `rules.sperrfrist_earliest_received.text`, ui `chk_in_last_change_hint` | FIXED | „(§§ 559 bis 560 BGB)“ → „(§§ 559–560 BGB)“ im Fließtext; `*Kaynak:*`-Zeilen unverändert. |
| m12 | `hilfe.tr.md` Z. 19 | FIXED | Satzfragment zu vollständigem Satz: „… nedeniyle: Berlin eyaleti, Berlin'deki tüm kiracı hanelerine ücretsiz ilk danışmanlık verir.“ |
| m13 | `features.bad-m01/-m07/-p01/-p07.explain`, `gebaeude-m03/-p02.explain` | FIXED | Glosse hinter die Jahreszahl („Mietspiegel 2026'da (Berlin kira tablosu)“). Wo die Angabe schon in Klammern steht (bad-p01, gebaeude-m03), ohne verschachtelte Klammer: „(Mietspiegel 2026'da, yani Berlin kira tablosunda: …)“. |

Sync mit dem Master (Runde 3) und Main:
- 40 Minus-`proof`-Texte: erster Satz neu „Bu eksi özelliğe dayanırsanız, kural olarak onu sizin kanıtlamanız gerekir. Landgericht Berlin böyle karar verdi; başka mahkemeler bunu farklı görebilir.“ (wie die Plus-Texte; Rest unverändert).
- `rules.scope.text` „meist“: TR hatte schon „çoğu zaman“ (= meist), gleich wie `brief.tr.md`/`pruefen.tr.md`; keine Änderung nötig.
- ui `letter_binding_text` Absatz 2: war bereits „01.06.2015'te veya daha sonra“ (= ab dem) und „ilke olarak“ (= grundsätzlich); geprüft, nicht doppelt geändert.
- ui `calc_minder_label`, `abschlag_intro`: neu aus dem geänderten Master übersetzt (Sammelheizung nach Nr. 6.3 inkl. Etagen-/Wohnungsheizung, Bad-Definition, WC muss in der Wohnung sein; Label zusätzlich „Tuvalet dairenin dışındaysa Mietspiegel geçerli değildir“).

Hinweise zum Master: QA_tr nennt keine Fehler im deutschen Master.

## Translation QA – ru (Fix_ru, 18.10.2026; Quelle: `99 Arbeitsdateien/Website/QA_ru.md`)

Keine CRITICAL-Funde. Alle Funde mit dem deutschen Master verglichen.

| Fund | Datei / Schlüssel | Status | Was / Grund |
|---|---|---|---|
| 1 (MAJOR) | `features.gebaeude-m06` title/explain/check | FIXED | Nach QA-Vorschlag: „С 6-го этажа (5. Obergeschoss) без лифта“; explain nennt „5-м этаже над первым (5. Obergeschoss) … по русскому счёту на 6-м этаже“; check erklärt die deutsche Zählung (1. Obergeschoss = 2-й этаж). |
| 2 (MAJOR) | `features.wohnung-m01.title` | FIXED | „В основном окна только с одним стеклом“ (= meist). |
| 3 | _index.ru.md Z. 13 | FIXED | „Найти свою квартиру в Mietspiegel:“. |
| 4 | _index, pruefen, brief, mieterhoehung Z. 14, `rules.scope.text`, ui `scope_intro` | FIXED | „действует“ → „подходит“ für Seite/Hilfe. Für den Mietspiegel selbst und für Rechtsregeln („Mietspiegel gilt“, „andere Regeln gelten“) bleibt „действует“, dort richtig. |
| 5 | pruefen/brief Z. 10, `rules.scope.text`, ui `scope_item_s549` | FIXED | „квартиры, которая сдаётся только на короткое время“ (wie mieterhoehung.ru.md). |
| 6 | mieterhoehung.ru.md Z. 10 | FIXED | „всё проверить в первоисточнике“. |
| 7 | mieterhoehung.ru.md Z. 102; zusätzlich brief.ru.md Z. 20 (gleicher Satz) | FIXED | „если вы не понимаете всё, что в ней написано“. |
| 8 | mieterhoehung.ru.md Z. 125, `rules.landlord_equipment.text` | FIXED | „Иначе обстоит дело, если …“. QA-Zusatz „тогда оснащение считается“ nicht übernommen (steht nicht im Master). |
| 9 | mieterhoehung.ru.md Z. 141 | FIXED | „в конце месяца, следующего за следующим (übernächster Monat)“. |
| 10 | rechner.ru.md Z. 10; ui `scope_notms_text`, `calc_scope_intro` | FIXED (eigene Formulierung) | „арендная плата которых не связана условиями господдержки (nicht preisgebunden)“. QA-Vorschlag „государственное регулирование арендной платы“ abgelehnt: Leser könnten das mit der Mietpreisbremse (auch staatliche Regulierung) verwechseln und den Mietspiegel fälschlich für unanwendbar halten. |
| 11 | rechner.ru.md Z. 17; zusätzlich ui `calc_baualter_hint` | FIXED | „по-прежнему относится к первоначальному/старому году постройки“. |
| 12 | rechner.ru.md Z. 21, `rules.netting.text` | FIXED (eigene Formulierung) | „сопоставляются/сопоставляете группы: из числа групп с плюсом вычитается число групп с минусом“. QA-Vorschlag „вычтите минусы групп из плюсов“ zu ungenau (es werden Gruppen gezählt, nicht Merkmale). |
| 13 | `rules.effective.text` | FIXED | Nach QA-Vorschlag („с последнего изменения … прошло меньше 15 месяцев“). |
| 14 | `rules.lwu.text` | FIXED | „и рост не больше чем на 50 € … в месяц“. |
| 15 | `checker.rent_3y_ago_help` | FIXED | „Если вы въехали в этот день или позже …“. |
| 16 | `checker.result.wartefrist_postponed.text` | FIXED | Nach QA-Vorschlag. |
| 17 | `checker.result.over_lwu.text` | FIXED | „и рост не больше чем на 50, 75 или 100 € в месяц“. |
| 18 | `features.bad-m07.check` | FIXED | „на стены за раковиной, ванной и душем и рядом с ними“. |
| 19 | `features.bad-m08.check` | FIXED | „окно наружу (на улицу или во двор)“. |
| 20 | `features.bad-p07` explain/check | FIXED | „более новых домов“, „более поздних годов постройки“. |
| 21 | `features.gebaeude-m08.check` | FIXED | „Спросите, какого года отопительная установка; год выпуска часто указан на заводской табличке.“ |
| 22 | `features.gebaeude-p01.explain` | FIXED | „Они должны быть достаточно большими.“ |
| 23 | `features.gebaeude-p04.explain` | FIXED | „Плюс, если здание или часть здания, где находится квартира, содержится в состоянии выше среднего …“ („выше среднего“ behalten, weil check es zitiert). |
| 24 | `features.wohnung-m04.explain` | FIXED | „проложены открыто поверх штукатурки“. |
| 25 | `features.wohnung-p06.explain` | FIXED | „при установленной снаружи защите от солнца“ (Bezug für das Zitat in check). |
| 26 | mieterhoehung.ru.md Z. 135, brief.ru.md Z. 22, `letters.send.text`, ui `letter_send_text` | FIXED | Generisches Maskulinum „свидетель/свидетелей“. |
| 27 | ui `chk_find_no_last_change` | FIXED | „Запретный срок (Sperrfrist) и срок ожидания (Wartefrist) не проверены“. |
| 28 | ui `notfound_text` | FIXED | „Такой страницы нет или её больше нет.“ |
| 29 | ui `abschlag_heading`, `calc_line_abschlag`, `calc_abschlag_note`, `abschlag_intro`, `calc_minder_label` | FIXED | „Скидка“ → „Вычет“. `abschlag_intro` und `calc_minder_label` nach Vorgabe Main aus dem neuen ui/de.json komplett neu übersetzt (Sammelheizung nach Nr. 6.3 inkl. Etagen-/Wohnungsheizung, Bad-Definition, WC muss in der Wohnung sein, WC außerhalb → Mietspiegel gilt nicht). |
| 30 | `rules.termination_safe_by.text`, ui `chk_out_termination_safe_by` | FIXED | „не позднее этого дня“ / „надёжно не позднее“. |
| 31 | `letters.teilzustimmung.explain` | FIXED | „(не исчерпывающий)“. |
| 32 | `letters.nachfrage.explain` | FIXED | „Этим письмом вы не соглашаетесь и не отказываетесь.“ |
| 33 | `features.gebaeude-p06` explain/check | FIXED | „меньше пяти этажей над первым (Obergeschosse), то есть не больше 5 этажей по русскому счёту“; check entsprechend. |
| 34 | `features.wohnung-m06.explain` | FIXED | „«запроходная» комната“. |

Sync mit dem Master (Runde 3) und Main:
- 40 Minus-`proof`-Texte: erster Satz neu „Если вы ссылаетесь на этот минус-признак, как правило, доказать его должны вы. Так решил Земельный суд Берлина (Landgericht Berlin); другие суды могут считать иначе.“ (wie die Plus-Texte; Rest unverändert).
- `rules.scope.text`: „часто“ → „обычно“ (meist), wie brief.ru.md/pruefen.ru.md.
- ui `letter_binding_text` Absatz 2: war bereits „01.06.2015 или позже“ und „в принципе (grundsätzlich)“; geprüft, nicht doppelt geändert.
- ui `calc_minder_label`, `abschlag_intro`: neu aus dem geänderten Master übersetzt (siehe 29).

Hinweise zum Master: QA_ru nennt keine Fehler im deutschen Master. Wie bei pl: ui `scope_intro` sagt im Master noch „oft“, die anderen Texte nach Runde 3 „meist“; RU folgt dem Master („часто“).

## UI consistency (Main)

`scope_intro`: „oft“ → „meist“ wie `rules.scope.text`; `calc_self_text`: zitierter Checkbox-Name = `calc_self_installed` ohne Klammerzusatz.

| Sprache | Key | alt | neu |
|---|---|---|---|
| de | `scope_intro` | „oft“ | „meist“ |
| de | `calc_self_text` | „selbst eingebaut“ | „selbst eingebaut und bezahlt“ |
| en | `scope_intro` | “often” | “usually” |
| en | `calc_self_text` | – | unverändert (passt bereits: “installed and paid for by me”) |
| tr | `scope_intro` | – | unverändert („çoğu zaman“ = content `rules.scope.text`) |
| tr | `calc_self_text` | „kendim yaptırdım“ | „kendim yaptırdım ve ödedim“ |
| ar | `scope_intro` | – | unverändert („غالباً“ = content `rules.scope.text`) |
| ar | `calc_self_text` | „ركّبته بنفسي“ | „ركّبته ودفعت ثمنه بنفسي“ |
| uk | `scope_intro` | „часто“ | „зазвичай“ |
| uk | `calc_self_text` | «встановлено самостійно» | «встановлено самостійно й оплачено» |
| ru | `scope_intro` | „часто“ | „обычно“ |
| ru | `calc_self_text` | «установлено самостоятельно» | «установлено и оплачено самостоятельно» |
| pl | `scope_intro` | „często“ | „zwykle“ |
| pl | `calc_self_text` | „zamontowane samodzielnie” | „zamontowane i opłacone samodzielnie” |

### Main – Fristende an Samstag, Sonntag, Feiertag (§ 193 BGB), Content, 18.10.2026

Auslöser: Smoke-Test, Zugang 28.09.2026 → Klagefrist am Sonntag, 28.02.2027. Quellen: siehe sources.md, Abschnitt „Content – § 193 BGB / Feiertage“.

| Datei / Schlüssel | alt | neu |
|---|---|---|
| rules.json `dates.sue_deadline` | from consent_deadline, +3 Monate, end_of_month | from `consent_deadline_193`, +3 Monate, snap `period_from_next_day`, `shift_193: apply` (Ausgabe `sue_deadline` = nächster Werktag, `sue_deadline_unshifted` = Tag davor) |
| rules.json `dates.consent_deadline_193` | – | neu: nächster Werktag ab consent_deadline (nur Information) |
| rules.json `holidays_berlin`, `shift_193`, `snaps.period_from_next_day` | – | neu (Feiertage nach § 1 FeiertG BE in allen Fassungen) |
| rules.json `dates.effective`, `termination_*`, Sperr-/Wartefrist | – | `shift_193: none` (keine Verschiebung) |
| rules.json Tests | t05 sue_deadline 2027-05-31 | t05 sue_deadline 2027-06-01 (Zustimmungsfrist endet So 28.02.2027 → Mo 01.03.2027) und consent_deadline_193; neu t28–t33 (Sonntag, Samstag, Zustimmungsfrist am Samstag, Feiertag 1. Mai zweimal, normaler Werktag) und w01–w07 (`kind: workday`, u. a. Frauentag 08.03.2027, 08.03.2018 kein Feiertag, Karfreitag/Ostermontag, 08.05.2025 einmalig, 24.12. kein Feiertag). Alle 33 check()-Vektoren und 7 Werktag-Vektoren mit unabhängiger Python-Referenz nachgerechnet: 0 Abweichungen. |
| de.json `rules.consent_deadline.text` | „Sie haben Zeit bis zum Ende des zweiten Kalendermonats nach dem Monat, in dem das Schreiben ankam (§ 558b Abs. 2 BGB). Fällt das Ende auf einen Samstag, Sonntag oder Feiertag, kann es sich auf den nächsten Werktag verschieben (§ 193 BGB). Verlassen Sie sich nicht darauf.“ | „Sie haben Zeit bis zum Ende des zweiten Kalendermonats nach dem Monat, in dem das Schreiben ankam (§ 558b Abs. 2 BGB). Ihre Antwort sollte bis zu diesem Tag beim Vermieter ankommen. Fällt der Tag auf einen Samstag, Sonntag oder Feiertag in Berlin, verschiebt sich das Ende nach dem Wortlaut von § 193 BGB auf den nächsten Werktag. Eine Gerichtsentscheidung genau dazu haben wir nicht gefunden. Verlassen Sie sich deshalb nicht darauf.“ |
| de.json `rules.sue_deadline.text` | „Stimmen Sie nicht oder nur teilweise zu, kann der Vermieter auf Zustimmung klagen. Die Klage muss innerhalb von drei Monaten nach dem Ende Ihrer Frist erhoben werden (§ 558b Abs. 2 BGB). Danach kann er diese Erhöhung nicht mehr einklagen; ein neues Verlangen bleibt möglich.“ | „Stimmen Sie nicht oder nur teilweise zu, kann der Vermieter auf Zustimmung klagen. Die Klage muss innerhalb von drei Monaten nach dem Ende Ihrer Frist erhoben werden (§ 558b Abs. 2 BGB). Fällt das Ende auf einen Samstag, Sonntag oder Feiertag in Berlin, hat der Vermieter bis zum nächsten Werktag Zeit, zum Beispiel bis Montag (§ 193 BGB). Es reicht, wenn die Klage bis dahin beim Gericht eingeht und bald danach zugestellt wird (§ 167 ZPO). Wir zeigen hier deshalb das spätere Datum. Danach kann der Vermieter diese Erhöhung nicht mehr einklagen; ein neues Verlangen bleibt möglich.“ |
| de.json `rules.termination_safe_by.text` | „Kommt Ihre Kündigung bis zu diesem Tag beim Vermieter an (zwei Monate ab Zugang), sind Sie auf der sicheren Seite (§ 561 BGB). Die Kündigung muss schriftlich auf Papier mit Unterschrift sein (§ 568 Abs. 1 BGB). Die Mieterhöhung gilt dann nicht.“ | „Kommt Ihre Kündigung bis zu diesem Tag beim Vermieter an (zwei Monate ab Zugang), sind Sie auf der sicheren Seite (§ 561 BGB). Das gilt auch, wenn der Tag ein Samstag, Sonntag oder Feiertag ist: Ob sich die Frist dann verschiebt, ist nicht geklärt. Rechnen Sie nicht damit. Die Kündigung muss schriftlich auf Papier mit Unterschrift sein (§ 568 Abs. 1 BGB). Die Mieterhöhung gilt dann nicht.“ |
| de.json `rules.termination_declare_by.text` | (Satz ergänzt) | + „Auch hier verschieben wir das Datum nicht auf einen Werktag.“ |
| de.json `rules.consent_deadline_193` | – | neu (title, text) |
| de.json `checker.disclaimer` | „Die Daten sind Kalenderdaten. Fällt ein Fristende auf einen Samstag, Sonntag oder Feiertag, kann es sich verschieben (§ 193 BGB). Planen Sie mit dem früheren Datum.“ | „Die Daten sind Kalenderdaten. Nur bei der Klagefrist des Vermieters zeigen wir den nächsten Werktag, wenn das Ende auf einen Samstag, Sonntag oder Feiertag in Berlin fällt (§ 193 BGB). Für Ihre eigenen Fristen planen Sie mit dem Kalenderdatum und antworten lieber einige Tage früher.“ |
| content/mieterhoehung.md (Die Fristen) | „Fällt das Ende einer Frist auf einen Samstag, Sonntag oder Feiertag, kann es sich auf den nächsten Werktag verschieben. Planen Sie trotzdem so, dass Ihre Antwort vorher ankommt.“ | neuer Absatz „Samstag, Sonntag, Feiertag“ mit drei Punkten (eigene Frist: nicht darauf verlassen; Frist des Vermieters: „Dann hat der Vermieter bis Montag, 01.03.2027, Zeit.“; Sonderkündigung: nicht geklärt) und Quellenzeile |
| content/pruefen.md | „Die Rechnung zeigt Kalenderdaten. Fällt ein Fristende auf einen Samstag, Sonntag oder Feiertag, kann es sich auf den nächsten Werktag verschieben (§ 193 BGB). Verlassen Sie sich nicht darauf: Antworten Sie lieber einige Tage früher.“ | „Für Ihre eigenen Fristen zeigt die Rechnung Kalenderdaten. Ob sich Ihre Frist bei einem Samstag, Sonntag oder Feiertag verschiebt, ist nicht sicher. Antworten Sie lieber einige Tage früher. Bei der Klagefrist des Vermieters zeigen wir den nächsten Werktag, weil er dann bis zu diesem Tag Zeit hat (§ 193 BGB).“ |

Bewertung: Für die Mieterin werden eigene Fristen nicht verlängert (Vorsicht). Für die Klagefrist des Vermieters zeigt die Seite das spätere Datum und sagt offen, dass der Vermieter dann mehr Zeit hat. Implementierung in lib/dates.js / check558.js: Frontend.

Nachtrag 18.10.2026: Frontend hat die § 193-Regel umgesetzt; alle 46 Vektoren in rules.json laufen nach Frontends Meldung durch (t05, t28–t33, w01–w07). Frauentag über `fixed_since` (von w01 aufgedeckt). Anzeige: consent_deadline_193 nur als Hinweis unter dem Kalenderdatum; sue_deadline mit verschobenem Datum, das unverschobene in einer Anmerkung. Erledigt.

### § 193 sync – en

- static/i18n/content/en.json: `rules.consent_deadline.text`, `rules.sue_deadline.text`, `rules.termination_safe_by.text`, `rules.termination_declare_by.text` (Satz ergänzt), `rules.consent_deadline_193` (neu, title + text), `checker.disclaimer` nach aktuellem Deutsch übersetzt.
- static/i18n/ui/en.json: `chk_consent_193`, `chk_shifted_193` waren schon vorhanden und stimmen inhaltlich mit ui/de.json überein; unverändert.
- content/mieterhoehung.en.md (The deadlines): neuer Absatz „Saturday, Sunday, public holiday“ mit Feiertagsliste, drei Punkten (eigene Frist: bis zum Kalenderdatum; Frist des Vermieters: Sonntag, 28.02.2027 → Montag, 01.03.2027, § 167 ZPO; Sonderkündigung: nicht geklärt) und vollständiger Quellenzeile wie im Deutschen.
- content/pruefen.en.md: Hinweis zu Kalenderdaten / Klagefrist des Vermieters ersetzt.
- Prüfung: Schlüsselmenge content/en.json = content/de.json, ui/en.json = ui/de.json (jq-Vergleich, JSON gültig). Warnungen nicht abgeschwächt: eigene Frist nach Kalenderdatum, verschobenes Zustimmungsdatum nur Information, Verschiebung der Klagefrist begünstigt den Vermieter.

### § 193 sync – ar

Arabische Übersetzung an den deutschen Stand „Fristende an Samstag, Sonntag, Feiertag (§ 193 BGB)“ angeglichen, 18.10.2026.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| static/i18n/content/ar.json | `rules.consent_deadline.text` | neu übersetzt: Antwort soll bis zum Tag ankommen; Verschiebung nach dem Wortlaut von § 193 BGB, keine Gerichtsentscheidung gefunden, „لا تعتمد على ذلك“ |
| static/i18n/content/ar.json | `rules.sue_deadline.text` | + Verschiebung zugunsten des Vermieters bis zum nächsten Werktag (z. B. Montag), § 167 ZPO, „wir zeigen das spätere Datum“ |
| static/i18n/content/ar.json | `rules.termination_safe_by.text` | + „gilt auch bei Samstag/Sonntag/Feiertag; nicht geklärt; nicht damit rechnen“ |
| static/i18n/content/ar.json | `rules.termination_declare_by.text` | + „وهنا أيضاً لا ننقل التاريخ إلى يوم عمل.“ |
| static/i18n/content/ar.json | `rules.consent_deadline_193` | neu (title, text inkl. Berliner Feiertage) |
| static/i18n/content/ar.json | `checker.disclaimer` | neu übersetzt: nur Klagefrist des Vermieters verschoben; eigene Fristen nach Kalenderdatum, lieber früher antworten |
| static/i18n/ui/ar.json | `chk_consent_193`, `chk_shifted_193` | neu (`{date}` erhalten) |
| content/mieterhoehung.ar.md | Die Fristen | alter Satz ersetzt durch Absatz „السبت، الأحد، العطل الرسمية“ mit drei Punkten (Beispiel So 28.02.2027 → Mo 01.03.2027) und neuer Quellenzeile (wie de) |
| content/pruefen.ar.md | Hinweis | neu übersetzt (eigene Fristen Kalenderdatum; Klagefrist nächster Werktag) |

Warnungen nicht abgeschwächt: eigene Frist nach Kalenderdatum, verschobene Zustimmungsfrist nur Information, Verschiebung der Klagefrist ausdrücklich zugunsten des Vermieters.

### § 193 sync – tr

Türkische Übersetzung an den deutschen Stand „Fristende an Samstag, Sonntag, Feiertag (§ 193 BGB)“ angeglichen, 18.10.2026.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| static/i18n/content/tr.json | `rules.consent_deadline.text` | neu übersetzt: Antwort soll bis zum Tag ankommen; Verschiebung nach dem Wortlaut von § 193 BGB, keine Gerichtsentscheidung gefunden, „Bu yüzden buna güvenmeyin.“ |
| static/i18n/content/tr.json | `rules.sue_deadline.text` | + Verschiebung zugunsten des Vermieters bis zum nächsten Werktag (z. B. Montag), § 167 ZPO, „wir zeigen das spätere Datum“ |
| static/i18n/content/tr.json | `rules.termination_safe_by.text` | + „gilt auch bei Samstag/Sonntag/Feiertag; nicht geklärt; nicht damit rechnen“ |
| static/i18n/content/tr.json | `rules.termination_declare_by.text` | + „Burada da tarihi bir iş gününe kaydırmıyoruz.“ |
| static/i18n/content/tr.json | `rules.consent_deadline_193` | neu (title, text inkl. Berliner Feiertage, deutsche Namen in Klammern) |
| static/i18n/content/tr.json | `checker.disclaimer` | neu übersetzt: nur Klagefrist des Vermieters verschoben; eigene Fristen nach Kalenderdatum, lieber früher antworten |
| static/i18n/ui/tr.json | `chk_consent_193`, `chk_shifted_193` | neu (`{date}` erhalten, als „{date} tarihine/tarihinde“ ohne Suffix am Platzhalter) |
| content/mieterhoehung.tr.md | Süreler | alter Satz ersetzt durch Absatz „Cumartesi, pazar, resmî tatil“ mit drei Punkten (Beispiel So 28.02.2027 → Mo 01.03.2027) und neuer Quellenzeile (wie de) |
| content/pruefen.tr.md | Hinweis | neu übersetzt (eigene Fristen Kalenderdatum; Klagefrist nächster Werktag) |

Warnungen nicht abgeschwächt: eigene Frist nach Kalenderdatum, verschobene Zustimmungsfrist nur Information, Verschiebung der Klagefrist ausdrücklich zugunsten des Vermieters.

### § 193 sync – uk

Ukrainische Übersetzung an den deutschen Stand „Fristende an Samstag, Sonntag, Feiertag (§ 193 BGB)“ angeglichen, 18.10.2026. Glossar beibehalten: Werktag = „робочий день“, Feiertag = „святковий день“, Sonderkündigung = „позачергове розірвання“; „nach dem Wortlaut“ = „за буквою“.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| static/i18n/content/uk.json | `rules.consent_deadline.text` | neu übersetzt: Antwort muss bis zu diesem Tag ankommen; Verschiebung nach dem Wortlaut von § 193 BGB, keine Gerichtsentscheidung gefunden, „не покладайтеся на це“ |
| static/i18n/content/uk.json | `rules.sue_deadline.text` | + Verschiebung zugunsten des Vermieters bis zum nächsten Werktag (z. B. Montag), § 167 ZPO, „тут ми показуємо пізнішу дату“ |
| static/i18n/content/uk.json | `rules.termination_safe_by.text` | + gilt auch bei Samstag/Sonntag/Feiertag; nicht geklärt; „не розраховуйте на це“ |
| static/i18n/content/uk.json | `rules.termination_declare_by.text` | + „І тут ми не переносимо дату на робочий день.“ |
| static/i18n/content/uk.json | `rules.consent_deadline_193` | neu (title, text inkl. Berliner Feiertage) |
| static/i18n/content/uk.json | `checker.disclaimer` | neu übersetzt: nur Klagefrist des Vermieters verschoben; eigene Fristen nach Kalenderdatum, lieber früher antworten |
| static/i18n/ui/uk.json | `chk_consent_193`, `chk_shifted_193` | neu (`{date}` erhalten) |
| content/mieterhoehung.uk.md | Строки | alter Satz ersetzt durch Absatz „Субота, неділя, святковий день“ mit Feiertagsliste, drei Punkten (Beispiel So 28.02.2027 → Mo 01.03.2027) und neuer Quellenzeile (wie de, Klammerzusätze übersetzt) |
| content/pruefen.uk.md | Hinweis | neu übersetzt (eigene Fristen Kalenderdatum; Klagefrist nächster Werktag) |

Warnungen nicht abgeschwächt: eigene Frist nach Kalenderdatum, verschobene Zustimmungsfrist nur Information, Verschiebung der Klagefrist ausdrücklich zugunsten des Vermieters.

### § 193 sync – pl

Polnische Übersetzung an den deutschen Stand „Fristende an Samstag, Sonntag, Feiertag (§ 193 BGB)“ angeglichen, 18.10.2026.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| static/i18n/content/pl.json | `rules.consent_deadline.text` | neu übersetzt: Antwort soll bis zum Tag ankommen; Verschiebung nach dem Wortlaut von § 193 BGB, keine Gerichtsentscheidung gefunden, „Dlatego nie polegaj na tym.“ |
| static/i18n/content/pl.json | `rules.sue_deadline.text` | + Verschiebung zugunsten des Vermieters bis zum nächsten Werktag (z. B. Montag), § 167 ZPO, „wir zeigen das spätere Datum“ |
| static/i18n/content/pl.json | `rules.termination_safe_by.text` | + „gilt auch bei Samstag/Sonntag/Feiertag; nicht geklärt; nicht damit rechnen“ |
| static/i18n/content/pl.json | `rules.termination_declare_by.text` | + „Także tutaj nie przesuwamy daty na dzień roboczy.“ |
| static/i18n/content/pl.json | `rules.consent_deadline_193` | neu (title, text inkl. Berliner Feiertage) |
| static/i18n/content/pl.json | `checker.disclaimer` | neu übersetzt: nur Klagefrist des Vermieters verschoben; eigene Fristen nach Kalenderdatum, lieber früher antworten |
| static/i18n/ui/pl.json | `chk_consent_193`, `chk_shifted_193` | neu (`{date}` erhalten, als „tutaj na dzień {date}“ / „dnia {date}“) |
| content/mieterhoehung.pl.md | Terminy | alter Satz ersetzt durch Absatz „Sobota, niedziela, święto“ mit drei Punkten (Beispiel So 28.02.2027 → Mo 01.03.2027) und neuer Quellenzeile (wie de) |
| content/pruefen.pl.md | Hinweis | neu übersetzt (eigene Fristen Kalenderdatum; Klagefrist nächster Werktag) |

Warnungen nicht abgeschwächt: eigene Frist nach Kalenderdatum, verschobene Zustimmungsfrist nur Information, Verschiebung der Klagefrist ausdrücklich zugunsten des Vermieters. JSON mit jq geprüft (gültig).

### § 193 sync – ru

Russische Übersetzung an den deutschen Stand „Fristende an Samstag, Sonntag, Feiertag (§ 193 BGB)“ angeglichen, 18.10.2026.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| static/i18n/content/ru.json | `rules.consent_deadline.text` | neu übersetzt: Antwort muss bis zu diesem Tag ankommen; Verschiebung „по буквальному тексту § 193 BGB“, keine Gerichtsentscheidung gefunden, „Поэтому не полагайтесь на это.“ |
| static/i18n/content/ru.json | `rules.sue_deadline.text` | + Verschiebung zugunsten des Vermieters bis zum nächsten Werktag (z. B. Montag), § 167 ZPO, „Поэтому здесь мы показываем более позднюю дату.“ |
| static/i18n/content/ru.json | `rules.termination_safe_by.text` | + gilt auch bei Samstag/Sonntag/Feiertag; nicht geklärt; „Не рассчитывайте на это.“ |
| static/i18n/content/ru.json | `rules.termination_declare_by.text` | + „Здесь мы тоже не сдвигаем дату на рабочий день.“ |
| static/i18n/content/ru.json | `rules.consent_deadline_193` | neu (title, text inkl. Berliner Feiertage; deutsche Namen in Klammern bei Karfreitag, Ostermontag, Himmelfahrt, Pfingstmontag) |
| static/i18n/content/ru.json | `checker.disclaimer` | neu übersetzt: nur Klagefrist des Vermieters verschoben; eigene Fristen nach Kalenderdatum, lieber einige Tage früher antworten |
| static/i18n/ui/ru.json | `chk_consent_193`, `chk_shifted_193` | neu (`{date}` erhalten, als „здесь – на {date}“ / „заканчивается {date}“) |
| content/mieterhoehung.ru.md | Сроки | alter Satz ersetzt durch Absatz „Суббота, воскресенье, праздник“ mit drei Punkten (Beispiel So 28.02.2027 → Mo 01.03.2027) und neuer Quellenzeile (wie de; Versäumnisurteil als „заочное решение (Versäumnisurteil)“) |
| content/pruefen.ru.md | Hinweis | neu übersetzt (eigene Fristen Kalenderdatum, Verschiebung nicht sicher; Klagefrist nächster Werktag) |

Warnungen nicht abgeschwächt: eigene Frist nach Kalenderdatum, verschobene Zustimmungsfrist nur Information, Verschiebung der Klagefrist ausdrücklich zugunsten des Vermieters.

## Wave V – adversarial review

### FixText – deutscher Master + English (18.10.2026)

Quelle: `99 Arbeitsdateien/Website/WaveV_Adversarial/S1…S6_judge.md`. Nur de und en geändert; tr, ar, uk, ru, pl müssen die Übersetzer nachziehen (gleiche Schlüssel/Abschnitte wie unten). Keine Content-Schlüssel neu oder entfernt. Neue Quellen: `docs/sources.md`, Abschnitt „Content – Wave V, adversariale Prüfung“ (live geöffnet 18.10.2026).

| Judge-Id | Dateien (de + en) | Änderung |
|---|---|---|
| S5 F1 | content `rules.scope.text`, `letters.ablehnung.risks`; mieterhoehung.md (Liste, § 549-Punkte, 2 neue Absätze, Quellenzeile), pruefen.md:10, brief.md:10, _index.md:17 | „Sozialwohnung/geförderte Wohnung mit fester Miete“ → „alte Sozialwohnung mit „Kostenmiete““; § 549-Texte nach Gesetzeswortlaut (möbliert, vorübergehender Gebrauch; Mieterhöhungsregeln gelten nicht, leichtere Kündigung); Absatz zu neueren geförderten Wohnungen (Zustimmung + Höchstmiete). UI-Schlüssel `scope_item_sozial`, `scope_item_s549`, `scope_ask_hint`, `scope_not558_text`: Wortlaut an FixCode übergeben. |
| S5 F1 (Teil `gefoerdert`) | – | nicht angewendet: OWNER O4 (S2 C2 OWNER). |
| S5 F2 | mieterhoehung.md (Absatz „Post vom Gericht“, Quellenzeile § 276 Abs. 1, § 331 Abs. 3 ZPO), content `letters.ablehnung.risks`, `rules.silence.text` | 2-Wochen-Frist, Entscheidung ohne Verhandlung. |
| S5 F3 | hilfe.md:42 | Beratungshilfe, Prozesskostenhilfe, Kosten des Vermieters trotzdem (§ 123 ZPO). |
| S5 F4 | mietpreisbremse.md (neuer Listenpunkt, Satz beim Rechner) | Beginn vor dem 30.05.2024: älterer Mietspiegel, Archiv-Link, Rechner nicht nutzbar. |
| S5 F5 | mietpreisbremse.md:45 | § 556g Abs. 1a nur Vormiete, Modernisierung, Neubau, erste Vermietung nach umfassender Modernisierung. |
| S5 F6 | mietpreisbremse.md:51 | Rüge nach Ende des Mietverhältnisses; Art. 229 § 51 „vielleicht“, Vertragsschluss oder Beginn. |
| S5 F7 | mieterhoehung.md (Sonderkündigung + Quelle VIII ZR 14/04) | „müssen grundsätzlich alle … unterschreiben“. |
| S5 F8 | hilfe.md:22–23 | Willkommenszentrum: Beratungsstellen-Suche statt /en/housing/rent (falsche § 561-Aussage); en → /en/counseling-centers. URLs für tr/ar/ru in sources.md; uk/pl nehmen die en-URL. |
| S5 F9 | hilfe.md:19 | „Informationen auch auf Englisch.“ |
| S5 F10 | hilfe.md:27, content `rules.lwu.text` | berlinovo („klassische“ Mietwohnungen / „Klassisches Wohnen“). |
| S5 F11 + S6 F1 + S4 F4 | ueber.md:14, _index.md:9 | Zusammengeführt: „Alle Rechnungen laufen nur in Ihrem Browser.“ (S5) + Serversatz im Wortlaut von S6 F1 („Ihre Eingaben werden nicht an einen Server gesendet.“) statt S5s „nicht an uns oder andere geschickt“ (gleiche Aussage; S6 ersetzt genau diesen Satz) + S5s IP-Satz + S4-F4-Satz zum Speichern nur solange der Tab offen ist. _index.md:9 nur „Alles läuft“ → „Alle Rechnungen laufen“ (S5). |
| S3 C5 | content `letters.fields.effective_help` | 15-Monats-Wartefrist; Werkzeugname = `nav_pruefen` („‚Fristen und Grenzen prüfen‘“ / „‘Check deadlines and limits’“) statt „Der Rechner“. |
| S3 C8 | – | UI-Schlüssel `letter_text_intro` → FixCode. |
| S3 C9 | content `letters.fields.own_text`, `questions`, `contract_number` | Klammerzusatz am Ende entfernt (nur de/en; der C9-Test schlägt für tr/ar/uk/ru/pl fehl, bis die Übersetzer nachziehen). |
| S1 C11 | content `groups.{bad,kueche,wohnung,gebaeude,umfeld}.intro`, `rules.netting.text` | „Jedes Plus/Minus“ → „Jede Gruppe, die als Plus/Minus zählt“ (`rules.netting.text` mitgeändert, weil die Prüfung „„Jedes Plus“ nirgends in content/de.json“ verlangt). rechner.md:21 nicht geändert (nicht im Judge-Umfang; dort steht der Satz nach der Aufrechnung der Gruppen). |
| S1 C2 (optional `features.*.check`) | – | nicht angewendet: vom Richter als optional markiert. |
| S2 C2/C3/C7 | – | Wortlaut durch S5 F1 ersetzt (siehe oben). |
| S2 C8 | content `checker.disclaimer` | 2. Satz: Klagefrist „rechnen wir mit dem nächsten Werktag“; eigene Frist „nur als Hinweis“. (`rules.json note_de` → FixCode.) |
| S2 C11 (Content-Teil) | content `checker.last_change` | „Seit wann gilt Ihre Miete, ohne Erhöhungen wegen Modernisierung oder Betriebskosten?“ (UI `chk_in_last_change` → FixCode). |
| S2 PRO C10 | content `checker.result.no_ovm.text` | „… keine Vergleichsmiete oder keine Wohnfläche eingegeben.“ |
| S5 C-14 (NO-FIX, Empfehlung Z. 19 dieses Logs) | – | nicht angewendet (NO-FIX). |

### FixCode – Code, Daten, UI-Texte de + en (18.10.2026)

Quellen: `99 Arbeitsdateien/Website/WaveV_Adversarial/S1…S6_judge.md`; S4 als `S4_judge_prototype.diff` übernommen und ergänzt. Neue Testfälle: `rules.json` t34–t37, `tests/run.mjs` Abschnitt „Wave V“ und Prüfungen S3 C9, S4 F4, S6 F3. UI-Schlüssel neu oder geändert nur in `ui/de.json` und `ui/en.json`; tr/ar/uk/ru/pl ziehen die Übersetzer nach.

| Judge-Id | Dateien | Änderung |
|---|---|---|
| S2 C1 (BLOCKER) | `check558.js`, `pruefen.js`, ui `chk_cap_assumed` | Ausgangsmiete ohne Miete vor 3 Jahren = jetzige Miete − Erhöhungen §§ 559–560; `base_assumed` auch bei Erhöhungen; neues Ausgabefeld `base_rent`, Formel und Hinweis zeigen `{base}`. t34/t35, E6 als Test. |
| S3 C1 | `letter.js` (`RISKY`, `INCOMPLETE`, `consentWarnings`), `brief.js`, ui `letter_incomplete_title` | Kasten „Ihre Prüfung ist noch nicht vollständig“ bei `no_ovm`/`no_last_change` vor Zustimmung/Teilzustimmung. |
| S1 C4 + S2 C4 + S3 C4 | `money.js`, `pruefen.js`, `common.js` (`markInvalid`), `site.css`, ui `chk_invalid_number` | Arabisch-indische Ziffern, `٫`/`٬`, `,-`/`,–`, „1,234,567“. „1,200“/„1,050“ ergibt null (S2 C4 „ablehnen statt raten“ geht vor dem S1-Vektor „1,200“ → 1200; das Feld wird als unlesbar markiert, kein grünes Ergebnis). |
| S1 C4 (Plausibilität) | `rechner.js`, ui `calc_demand_implausible` | Unter 1 € pro m² → Warnung statt ok/danger. |
| S4 F1–F15 | `site.css`, `common.js`, `rechner.js`, `pruefen.js`, `brief.js`, `scope.js`, `tool.html`, `base.html`, `README.md`, ui `footer_privacy`, `store_note` | Wie Prototyp: Reflow, `expr()` für Rechenzeilen und Pfeil, `liveStatus()` (Rechner Schritt 5 und Prüfung Schritt 3), `sessionStorage`, `markInvalid` im Rechner, `autocomplete` name/street-address, `:user-invalid`, Rahmenkontrast, Bestätigung nach Löschen, Select ohne `lang`, Druck, „Wird geladen“ ohne JS versteckt, Navigation umbrechend, Dimmen nur Badge/Titel, Favicon. |
| S2 C5 | `pruefen.js` | Ergebnisbereich nicht mehr live; Statuszeile mit den Befund-Titeln; `scopeBox` nur bei Zustandswechsel neu. |
| S2 C6 | `check558.js` | Wartefrist am späteren Termin des Vermieters gemessen. t36. |
| S2 C9 | `pruefen.js` | Vorzeichen nur bei positiver Änderung. |
| S2 C10 | `dates.js` | Jahre < 1900 sind kein Datum. t37 + Unit-Test. |
| S2 C8 (rules.json) | `rules.json` `note_de` | Text nach Judge. |
| S2 C11 (UI) | ui `chk_in_last_change` | Text nach Judge. |
| S2 PRO C9 | `pruefen.js` | Datumssatz nur ohne Content-Hilfe. |
| S2 C2/C3/C7 → S5 F1 | ui `scope_item_sozial`, `scope_item_s549`, `scope_ask_hint`, `scope_not558_text` | Wortlaut von S5 F1 (geht S2 vor). |
| S1 C1 | ui `calc_baualter_hint` | Wendewohnungen / West-Staaken. Test Zeile 105. |
| S1 C2 | `rechner.js`, ui `calc_energy_water_excl` | 2026-Wortlaut („ohne Berücksichtigung“) → neue Frage; 2024 unverändert. |
| S1 C3 | ui `calc_energy_value`, `calc_energy_intro` | Endenergie statt Primärenergie. |
| S1 C5 | `rechner.js` | Datum ohne Mietspiegel → kein Ergebnis, Hinweis `calc_year_none`; Teil (b): Hinweis `chk_calc_year_mismatch` bei Handwahl eines anderen Jahrs. |
| S1 C6 | `rechner.js`, ui `calc_minder_outside_label`, `calc_minder_outside` | Kästchen auch außerhalb Nr. 9.4; angekreuzt → kein Wert. |
| S1 C7 | `rechner.js` | Denkmal-Präfix nur bei Minus-Merkmalen. |
| S1 C8 | `ms2026.json`, `tools/extract_data.py` | `wohnung-m08.note_de` = „Bei Erdgeschosswohnung“; `verify_data.py` grün. |
| S1 C10 | `mietspiegel.js` (`expandKennwert`), `rechner.js` | Kennwert-Kästchen kumulativ (Auswahl und Häkchen-Kaskade je Spalte). Tests. |
| S1 C12 | `rechner.js`, ui `calc_year_recheck` | Liste angekreuzter Merkmale mit anderem Wortlaut nach Jahreswechsel. |
| S1 C13 | `rechner.js` | Kein `aria-live` auf rowBox/resultBox (Statuszeile aus S4 F3); `aria-describedby` auf den Begründungstext. |
| S1 P-14 | `rules.json` `netting.formula_de` | „bis 2 Cent“. Test Zeile 2, net −5. |
| S1 P-15 | `rechner.js` | Energie-Helfer entfernt m08/p08 nur bei Kennwert-Treffer im selben Satz. |
| S3 C3 | `letter.js`, `brief.js`, ui `letter_problem_agreed_over_max` | Teilzustimmung über `max_rent` gemeldet. Test. |
| S3 C6 | `brief.js` | Unbeantwortete Frage 1 → Scope ohne Frage (notMS-Hinweis). |
| S3 C7 | `letter.js` | Merkmalslisten folgen dem Rechner, solange unverändert. Tests. |
| S3 C8 | ui `letter_text_intro` | Text nach Judge. |
| S3 C10 | `brief.js` | `problemNote` ohne `aria-live`. |
| S3 K1 | `letter.js` | Leerzeilen vor der Unterschrift bleiben. Test über alle Vorlagen. |
| S3 C9 (Test) | `tests/run.mjs` | Prüft alle 7 Content-Dateien; tr/ar/uk/ru/pl schlagen fehl, bis die Übersetzer nachziehen. |
| S6 F2 | `README.md` | Abschnitt „Hosting“. |
| S6 F3 | `base.html`, `tests/run.mjs` | `common.js` ohne Cachebust; Test „kein `common.js?h=`“. |
| S6 F4 | `404.html` | Links zu den anderen Sprachen. |

Nicht angewendet (FixCode): S1 C2 optionaler Content-Teil (`features.*.check`, Content = FixText); S1 C9, S2 C2 (WoFG) / S2 C12 (§ 558 Abs. 5), S3 C2 (Häkchen), C8 (Speichern), C11–C14, S4 O1, S5 O1–O4 (`gefoerdert`), S6 O1–O4: OWNER. S1 C5 `valid_to`, S2 C10 „15 %“/2026 ohne Ende, S2 C12 (übrige), PRO C3/C12, S3 C2 (Vorbelegung, Ausdruck), C4 (Feldnamen), C6 (Frage auf Briefseite), C7 (Skalare), S4 NO-FIX-Punkte, S6 C8/C9 (Rest)/C12: NO-FIX.

### Wave V sync – uk

Ukrainische Übersetzung an den deutschen Stand „Wave V – adversarial review“ (FixCode, FixText) angeglichen, 18.10.2026. Glossar beibehalten: Kostenmiete bleibt deutsch in „…“ („старе соціальне житло з „Kostenmiete““), vorübergehender Gebrauch = „тимчасове користування“, Tab = „вкладка“, Endenergie/Primärenergie = „кінцева/первинна енергія“ (deutscher Begriff in Klammern), Amtsgericht = „дільничний суд“. Quellenzeilen, §§, Daten, URLs und Platzhalter unverändert.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| static/i18n/ui/uk.json | `calc_energy_water_excl`, `calc_demand_implausible`, `letter_incomplete_title`, `letter_problem_agreed_over_max` (`{max}`), `chk_invalid_number`, `calc_minder_outside_label`, `calc_minder_outside`, `calc_year_recheck` (`{ms}`) | neu, Reihenfolge wie de |
| static/i18n/ui/uk.json | `calc_baualter_hint`, `calc_energy_intro`, `calc_energy_value`, `chk_in_last_change`, `letter_text_intro`, `scope_ask_hint`, `scope_item_sozial`, `scope_item_s549`, `scope_not558_text`, `chk_cap_assumed` (`{base}`), `footer_privacy`, `store_note` | neu übersetzt nach de |
| static/i18n/content/uk.json | `rules.scope.text`, `rules.silence.text`, `rules.lwu.text`, `rules.netting.text`, `letters.ablehnung.risks`, `letters.fields.effective_help`, `groups.*.intro`, `checker.disclaimer`, `checker.last_change`, `checker.result.no_ovm.text` | neu übersetzt nach de (Post vom Gericht, § 276/§ 331 ZPO; „jede Gruppe, die als Plus/Minus zählt“; berlinovo) |
| static/i18n/content/uk.json | `letters.fields.own_text`, `questions`, `contract_number` | Klammerzusatz „(необов’язково)“ / „(якщо є)“ entfernt |
| content/_index.uk.md | Z. 9, 17 | Rechnungen im Browser; alte Sozialwohnung mit „Kostenmiete“ |
| content/pruefen.uk.md, content/brief.uk.md | Z. 10 | alte Sozialwohnung mit „Kostenmiete“; möbliertes Zimmer, vorübergehender Gebrauch; „Там правила … не діють“ |
| content/mieterhoehung.uk.md | Geltungsbereich, Schweigen, Sonderkündigung | Liste (Kostenmiete, § 549 präzisiert), Absatz „У цих трьох випадках…“, Absatz neuere Sozialwohnung, Absatz „Лист від суду“, alle unterschreiben, Quellenzeilen wie de (WoBindG, WoFG, § 276/§ 331 ZPO, VIII ZR 14/04) |
| content/hilfe.uk.md | Z. 19, 22–23, 27, 42 | „Інформація також англійською“; Willkommenszentrum-Suche <https://willkommenszentrum.berlin.de/en/counseling-centers> (Seite englisch); berlinovo; Beratungshilfe, Prozesskostenhilfe (§ 114 ZPO), Kosten des Vermieters (§ 123 ZPO) |
| content/mietpreisbremse.uk.md | Liste, Z. 45, 51, 54 | Beginn vor 30.05.2024 + Archiv-URL; Neubau/umfassende Modernisierung; Rüge nach Ende des Mietverhältnisses; Rechner nicht vor 30.05.2024 |
| content/ueber.uk.md | Z. 14 | IP-Adresse, Speicherung nur solange der Tab offen ist |

Warnungen nicht abgeschwächt: „не припиняйте просто так платити“, 2-Wochen-Frist bei Post vom Gericht, Kostenrisiko auch mit Prozesskostenhilfe.

### Wave V sync – ru

Russische Übersetzung an den deutschen Stand „Wave V – adversarial review“ (FixCode, FixText) angeglichen, 18.10.2026. Glossar beibehalten: Kostenmiete bleibt deutsch in «…» («старое социальное жильё (Sozialwohnung) с «Kostenmiete»»), vorübergehender Gebrauch = «временное пользование», Tab = «вкладка», Endenergie/Primärenergie = «конечная/первичная энергия» (deutscher Begriff in Klammern), Amtsgericht = «участковый суд (Amtsgericht)», Sammelheizung = «центральное отопление (Sammelheizung)». Quellenzeilen, §§, Daten, URLs und Platzhalter unverändert.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| static/i18n/ui/ru.json | `calc_energy_water_excl`, `calc_demand_implausible`, `letter_incomplete_title`, `letter_problem_agreed_over_max` (`{max}`), `chk_invalid_number`, `calc_minder_outside_label`, `calc_minder_outside`, `calc_year_recheck` (`{ms}`) | neu, Reihenfolge wie de |
| static/i18n/ui/ru.json | `calc_baualter_hint`, `calc_energy_intro`, `calc_energy_value`, `chk_in_last_change`, `letter_text_intro`, `scope_ask_hint`, `scope_item_sozial`, `scope_item_s549`, `scope_not558_text`, `chk_cap_assumed` (`{base}`), `footer_privacy`, `store_note` | neu übersetzt nach de (Wendewohnungen/West-Staaken, Endenergie, Tab-Speicherung, drei Fälle in `scope_not558_text`) |
| static/i18n/content/ru.json | `rules.scope.text`, `rules.silence.text`, `rules.lwu.text`, `rules.netting.text`, `letters.ablehnung.risks`, `letters.fields.effective_help`, `groups.*.intro`, `checker.disclaimer`, `checker.last_change`, `checker.result.no_ovm.text` | neu übersetzt nach de (Post vom Gericht, § 276/§ 331 ZPO; „каждая группа, которая считается как плюс/минус“; berlinovo «Klassisches Wohnen»; 15-Monats-Wartefrist, Werkzeugname = `nav_pruefen` «Проверить сроки и пределы») |
| static/i18n/content/ru.json | `letters.fields.own_text`, `questions`, `contract_number` | Klammerzusatz „(необязательно)“ / „(если есть)“ entfernt |
| content/_index.ru.md | Z. 9, 17 | Rechnungen im Browser; alte Sozialwohnung mit «Kostenmiete» |
| content/pruefen.ru.md, content/brief.ru.md | Z. 10 | alte Sozialwohnung mit «Kostenmiete»; möbliertes Zimmer, vorübergehender Gebrauch; «Там правила … не действуют» |
| content/mieterhoehung.ru.md | Geltungsbereich, Schweigen, Sonderkündigung | Liste (Kostenmiete, Wirtschaftlichkeitsberechnung, § 549 präzisiert), Absatz «В этих трёх случаях…», Absatz neuere Sozialwohnung, Absatz «Письмо из суда», „как правило, должны подписать все“, Quellenzeilen wie de (WoBindG, WoFG, § 276/§ 331 ZPO, VIII ZR 14/04) |
| content/hilfe.ru.md | Z. 19, 22–23, 27, 42 | «Информация также на английском языке»; Willkommenszentrum-Suche <https://willkommenszentrum.berlin.de/ru/konsultacionnye-centry>; berlinovo; Beratungshilfe, Prozesskostenhilfe (§ 114 ZPO), Kosten des Vermieters (§ 123 ZPO) |
| content/mietpreisbremse.ru.md | Liste, Z. 45, 51, 54 | Beginn vor 30.05.2024 + Archiv-URL; Neubau/umfassende Modernisierung; Rüge nach Ende des Mietverhältnisses, Art. 229 § 51 „возможно“; Rechner nicht vor 30.05.2024 |
| content/ueber.ru.md | Z. 14 | IP-Adresse, Speicherung nur solange der Tab offen ist |

Warnungen nicht abgeschwächt: «Не прекращайте просто так платить», 2-Wochen-Frist bei Post vom Gericht, Kostenrisiko auch mit Prozesskostenhilfe, Entscheidung ohne Sie «обычно в пользу арендодателя».

### Wave V sync – pl

Polnische Übersetzung an den deutschen Stand „Wave V – adversarial review“ (FixCode, FixText) angeglichen, 18.10.2026. Glossar beibehalten: Kostenmiete bleibt deutsch in „…“ („stare mieszkanie socjalne z „Kostenmiete”“), vorübergehender Gebrauch = „przejściowy użytek“, Tab = „karta (przeglądarki)“, Endenergie/Primärenergie = „energia końcowa/pierwotna“ (deutscher Begriff in Klammern), Amtsgericht = „sąd rejonowy“, Beratungshilfe/Prozesskostenhilfe deutsch in Klammern. Quellenzeilen, §§, Daten, URLs und Platzhalter unverändert.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| static/i18n/ui/pl.json | `calc_energy_water_excl`, `calc_demand_implausible`, `letter_incomplete_title`, `letter_problem_agreed_over_max` (`{max}`), `chk_invalid_number`, `calc_minder_outside_label`, `calc_minder_outside`, `calc_year_recheck` (`{ms}`) | neu, Reihenfolge wie de |
| static/i18n/ui/pl.json | `calc_baualter_hint`, `calc_energy_intro`, `calc_energy_value`, `chk_in_last_change`, `letter_text_intro`, `scope_ask_hint`, `scope_item_sozial`, `scope_item_s549`, `scope_not558_text`, `chk_cap_assumed` (`{base}`), `footer_privacy`, `store_note` | neu übersetzt nach de |
| static/i18n/content/pl.json | `rules.scope.text`, `rules.silence.text`, `rules.lwu.text`, `rules.netting.text`, `letters.ablehnung.risks`, `letters.fields.effective_help`, `groups.*.intro`, `checker.disclaimer`, `checker.last_change`, `checker.result.no_ovm.text` | neu übersetzt nach de (Post vom Gericht, § 276/§ 331 ZPO; „każda grupa, która liczy się jako plus/minus“; berlinovo) |
| static/i18n/content/pl.json | `letters.fields.own_text`, `questions`, `contract_number` | Klammerzusatz „(opcjonalnie)“ / „(jeśli jest)“ entfernt |
| content/_index.pl.md | Z. 9, 17 | Rechnungen im Browser; alte Sozialwohnung mit „Kostenmiete“ |
| content/pruefen.pl.md, content/brief.pl.md | Z. 10 | alte Sozialwohnung mit „Kostenmiete“; möbliertes Zimmer, vorübergehender Gebrauch; „Tam zasady … nie obowiązują“ |
| content/mieterhoehung.pl.md | Geltungsbereich, Schweigen, Sonderkündigung | Liste (Kostenmiete, § 549 präzisiert), Absatz „W tych trzech przypadkach…“, Absatz neuere Sozialwohnung, Absatz „Pismo z sądu“, alle unterschreiben, Quellenzeilen wie de (WoBindG, WoFG, § 276/§ 331 ZPO, VIII ZR 14/04) |
| content/hilfe.pl.md | Z. 19, 22–23, 27, 42 | „Informacje także po angielsku“; Willkommenszentrum-Suche <https://willkommenszentrum.berlin.de/en/counseling-centers> (Seite englisch); berlinovo; Beratungshilfe, Prozesskostenhilfe (§ 114 ZPO), Kosten des Vermieters (§ 123 ZPO) |
| content/mietpreisbremse.pl.md | Liste, Z. 45, 51, 54 | Beginn vor 30.05.2024 + Archiv-URL; Neubau/umfassende Modernisierung; Rüge nach Ende des Mietverhältnisses; Rechner nicht vor 30.05.2024 |
| content/ueber.pl.md | Z. 14 | IP-Adresse, Speicherung nur solange der Tab offen ist |

Warnungen nicht abgeschwächt: „Nie przestawaj po prostu płacić“, 2-Wochen-Frist bei Post vom Gericht, Kostenrisiko auch mit Prozesskostenhilfe.

### Wave V sync – tr

Türkische Übersetzung an den deutschen Stand „Wave V – adversarial review“ (FixCode, FixText) angeglichen, 18.10.2026. Glossar beibehalten: Kostenmiete bleibt deutsch in „…“ mit Erklärung („„Kostenmiete“ (maliyet kirası) olan eski sosyal konut“), vorübergehender Gebrauch = „geçici kullanım“, möbliert = „eşyalı“, Tab = „sekme“, Endenergie/Primärenergie = „nihai/birincil enerji“ (deutscher Begriff in Klammern), Amtsgericht = „sulh mahkemesi (Amtsgericht)“, Beratung = „danışma merkezi“/„danışmanlık“ wie bisher. Quellenzeilen, §§, Daten, URLs und Platzhalter unverändert.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| static/i18n/ui/tr.json | `calc_energy_water_excl`, `calc_demand_implausible`, `letter_incomplete_title`, `letter_problem_agreed_over_max` (`{max}`), `chk_invalid_number`, `calc_minder_outside_label`, `calc_minder_outside`, `calc_year_recheck` (`{ms}`) | neu, Reihenfolge wie de |
| static/i18n/ui/tr.json | `calc_baualter_hint`, `calc_energy_intro`, `calc_energy_value`, `chk_in_last_change`, `letter_text_intro`, `scope_ask_hint`, `scope_item_sozial`, `scope_item_s549`, `scope_not558_text`, `chk_cap_assumed` (`{base}`), `footer_privacy`, `store_note` | neu übersetzt nach de |
| static/i18n/content/tr.json | `rules.scope.text`, `rules.silence.text`, `rules.lwu.text`, `rules.netting.text`, `letters.ablehnung.risks`, `letters.fields.effective_help`, `groups.*.intro`, `checker.disclaimer`, `checker.last_change`, `checker.result.no_ovm.text` | neu übersetzt nach de (Post vom Gericht, § 276/§ 331 ZPO; „artı/eksi sayılan her grup“; berlinovo; „Kostenmiete“ in alter Sozialwohnung) |
| static/i18n/content/tr.json | `letters.fields.own_text`, `questions`, `contract_number` | Klammerzusatz „(isteğe bağlı)“ / „(varsa)“ entfernt |
| content/_index.tr.md | Z. 9, 17 | Rechnungen im Browser; alte Sozialwohnung mit „Kostenmiete“ |
| content/pruefen.tr.md, content/brief.tr.md | Z. 10 | alte Sozialwohnung mit „Kostenmiete“; eşyalı oda, geçici kullanım; „Orada kira artışıyla ilgili kurallar geçerli değildir.“ |
| content/mieterhoehung.tr.md | Geltungsbereich, Schweigen, Sonderkündigung | Liste (Kostenmiete, § 549 präzisiert), Absatz „Bu üç durumda…“, Absatz neuere Sozialwohnung, Absatz „Mahkemeden yazı“, alle müssen unterschreiben, Quellenzeilen wie de (WoBindG, WoFG, § 276/§ 331 ZPO, VIII ZR 14/04) |
| content/hilfe.tr.md | Z. 19, 22–23, 27, 42 | „Bilgiler İngilizce de var“; Willkommenszentrum-Suche <https://willkommenszentrum.berlin.de/tr/danisma-merkezleri>; berlinovo; Beratungshilfe, Prozesskostenhilfe (§ 114 ZPO), Kosten des Vermieters (§ 123 ZPO) |
| content/mietpreisbremse.tr.md | Liste, Z. 45, 51, 54 | Beginn vor 30.05.2024 + Archiv-URL; Neubau/umfassende Modernisierung; Rüge nach Ende des Mietverhältnisses; Rechner nicht vor 30.05.2024 |
| content/ueber.tr.md | Z. 14 | IP-Adresse, Speicherung nur solange der Tab offen ist |

Warnungen nicht abgeschwächt: „Ödemeyi öylece durdurmayın“, 2-Wochen-Frist bei Post vom Gericht, Kostenrisiko auch mit Prozesskostenhilfe.

### Wave V sync – ar

Arabische Übersetzung an den deutschen Stand „Wave V – adversarial review“ (FixCode, FixText) angeglichen, 18.10.2026. Glossar beibehalten: Kostenmiete = „إيجار التكلفة“ mit deutschem Begriff („شقة اجتماعية قديمة ذات „إيجار التكلفة“ (Kostenmiete)“), vorübergehender Gebrauch = „الاستعمال المؤقت“, möbliert = „مفروشة“, Tab = „علامة التبويب“, Endenergie/Primärenergie = „الطاقة النهائية/الأولية“ (deutscher Begriff in Klammern), Amtsgericht = „المحكمة المحلية (Amtsgericht)“, Sammelheizung = „تدفئة مركزية (Sammelheizung)“, Werkzeugname = `nav_pruefen` „فحص المهل والحدود“. Quellenzeilen, §§, Daten, URLs und Platzhalter unverändert.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| static/i18n/ui/ar.json | `calc_energy_water_excl`, `calc_demand_implausible`, `letter_incomplete_title`, `letter_problem_agreed_over_max` (`{max}`), `chk_invalid_number`, `calc_minder_outside_label`, `calc_minder_outside`, `calc_year_recheck` (`{ms}`) | neu, Reihenfolge wie de |
| static/i18n/ui/ar.json | `calc_baualter_hint`, `calc_energy_intro`, `calc_energy_value`, `chk_in_last_change`, `letter_text_intro`, `scope_ask_hint`, `scope_item_sozial`, `scope_item_s549`, `scope_not558_text`, `chk_cap_assumed` (`{base}`), `footer_privacy`, `store_note` | neu übersetzt nach de (Wendewohnungen/West-Staaken, Endenergie, Tab-Speicherung, drei Fälle in `scope_not558_text`) |
| static/i18n/content/ar.json | `rules.scope.text`, `rules.silence.text`, `rules.lwu.text`, `rules.netting.text`, `letters.ablehnung.risks`, `letters.fields.effective_help`, `groups.*.intro`, `checker.disclaimer`, `checker.last_change`, `checker.result.no_ovm.text` | neu übersetzt nach de (Post vom Gericht, § 276/§ 331 ZPO; „كل مجموعة تُحسب زائداً/ناقصاً“; berlinovo „Klassisches Wohnen“; 15-Monats-Wartefrist; „Kostenmiete“ in alter Sozialwohnung) |
| static/i18n/content/ar.json | `letters.fields.own_text`, `questions`, `contract_number` | Klammerzusatz „(اختياري)“ / „(إن وُجد)“ entfernt |
| content/_index.ar.md | Z. 9, 17 | Rechnungen im Browser; alte Sozialwohnung mit „Kostenmiete“ |
| content/pruefen.ar.md, content/brief.ar.md | Z. 10 | alte Sozialwohnung mit „Kostenmiete“; möblierte Zimmer, vorübergehender Gebrauch; „هناك لا تسري قواعد زيادة الإيجار“ |
| content/mieterhoehung.ar.md | Geltungsbereich, Schweigen, Sonderkündigung | Liste (Kostenmiete, Wirtschaftlichkeitsberechnung, § 549 präzisiert), Absatz „في هذه الحالات الثلاث…“, Absatz neuere Sozialwohnung, Absatz „بريد من المحكمة“, „يجب من حيث المبدأ أن يوقّعوا جميعاً“, Quellenzeilen wie de (WoBindG, WoFG, § 276/§ 331 ZPO, VIII ZR 14/04) |
| content/hilfe.ar.md | Z. 19, 22–23, 27, 42 | „المعلومات متوفرة أيضاً بالإنجليزية“; Willkommenszentrum-Suche <https://willkommenszentrum.berlin.de/ar/mrakz-alastshart>; berlinovo; Beratungshilfe, Prozesskostenhilfe (§ 114 ZPO), Kosten des Vermieters (§ 123 ZPO) |
| content/mietpreisbremse.ar.md | Liste, Z. 45, 51, 54 | Beginn vor 30.05.2024 + Archiv-URL; Neubau/umfassende Modernisierung; Rüge nach Ende des Mietverhältnisses, Art. 229 § 51 „قد تسري“; Rechner nicht vor 30.05.2024 |
| content/ueber.ar.md | Z. 14 | IP-Adresse, Speicherung nur solange der Tab offen ist |

Warnungen nicht abgeschwächt: „لا تتوقف عن الدفع ببساطة“, 2-Wochen-Frist bei Post vom Gericht, Kostenrisiko auch mit Prozesskostenhilfe, Entscheidung ohne Sie „وغالباً لصالح المؤجِّر“.

### O4 gefoerdert (Owner-Entscheidung O4 Option a, 18.10.2026; S5 F1 Teil `gefoerdert`, S2 C2)

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| static/js/app/scope.js | `NOT_MS`, neu `SCOPE_ITEMS` | `gefoerdert` in `NOT_MS` (Rechner zeigt kein Mietspiegel-Ergebnis; Prüfung zeigt § 558-Ergebnisse mit `scope_notms`-Hinweis). `SCOPE_ITEMS` = Reihenfolge der Kästchen in Prüfung und Brief, `gefoerdert` direkt nach `sozial`; Standardwert für `scopeState`/`scopeForm`. |
| static/js/app/rechner.js | `CALC_SCOPE` | `gefoerdert` nach `sozial`. |
| static/i18n/ui/{de,en,tr,ar,uk,ru,pl}.json | neu `scope_item_gefoerdert` (nach `scope_item_sozial`); `scope_notms_text` | Kästchen „Neuere Sozialwohnung oder andere geförderte Wohnung ohne „Kostenmiete“ (die höchste Miete steht in der Förderung)“; Hinweis ergänzt: Zustimmung trotzdem nötig, Miete höchstens Höchstmiete aus der Förderung. Übersetzungen mit den Begriffen aus mieterhoehung.*.md Z. 33. |
| tests/run.mjs | Abschnitt 2 | Test „O4 gefoerdert: scopeState → notMS“ (`ask: "yes"`, `withAsk: true`). |
| content/mieterhoehung*.md, content/rechner*.md | – | unverändert: mieterhoehung Z. 33 (Absatz neuere geförderte Wohnung) und rechner Z. 10 („Sozialwohnungen und andere geförderte Wohnungen mit fester Miete“) nennen den Fall bereits in allen 7 Sprachen. |

Quellen: docs/sources.md, Abschnitt „Content – O4 gefoerdert“.

## De-slop – pl

Stilüberarbeitung der polnischen Texte, 18.10.2026 (Deslop_pl). Nur Stil: Bedeutung, Zahlen, Daten, §, Platzhalter und Warnungen unverändert. Ausnahme: Datenschutz-Absatz in ueber.pl.md nach dem neuen deutschen Master (Deslop_de/PrivacyLogs).

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| content/*.pl.md | alle | gesetzte Gedankenstriche („ – “) durch Komma, Doppelpunkt oder Klammer ersetzt; Quellenzeilen im Zitierstil „BGH, Urteil vom …, VIII ZR …“ (Komma vor dem Aktenzeichen). Die Trennzeile der Markdown-Tabelle in mietpreisbremse.pl.md bleibt (Tabellensyntax, kein Trennstrich). |
| content/mieterhoehung.pl.md | `title`, `description`, Z. 10, 16, 102 | Titel „co warto wiedzieć“ (Floskel) → „najważniejsze zasady“; Fettdruck für „§“/„Rn.“ und „przed“ entfernt; „Uwaga – …“ → „Uwaga: …“ |
| content/pruefen.pl.md, content/brief.pl.md | Z. 10, 14, 18; brief `description`, Z. 21 | Kasten „Czy to cię dotyczy?“ wie de in zwei Absätze geteilt: P1 nur „**Czy to cię dotyczy?**“ fett, P2 „**Nie** przestawaj … płacić“ + Links; Nettokaltmiete-Erklärung mit „czyli“; Linktext an neuen Titel; brief „Zwróć uwagę:“ nicht mehr fett; Beispiel „nur wenn …“ („tylko jeśli …“) ohne Strich |
| content/_index.pl.md, merkmale.pl.md, rechner.pl.md | Schritte, Einleitungen, Liste „Tego potrzebujesz“ | Fettdruck nach de-Regel (Deslop_de) entfernt: „Jak postępować:“, Schrittlabels, „Dla wszystkich cech…“, „Tego potrzebujesz:“ und Listenlabels; rechner Kasten nur Überschrift fett; Zitat mit Komma; Sammelheizung-Beispiele als eigener Satz |
| content/mieterhoehung.pl.md | Fristen-Unterliste, „Co się liczy“, Zgoda/Lastschrift, LWU „Ustawa:“, Kappung-Beispiel | Fettdruck entfernt bei generischen Labels (Unterliste § 193, „Moment/Powierzchnia/Liczy się tylko…“, „Polecenie zapłaty“, „Formularze“, „Częściowa zgoda…“, „Odmowy…“, „Przykład:“, „Ustawa:“); Warnungen/Fristen/Beträge bleiben fett |
| content/hilfe.pl.md | Bezpłatnie, LWU, Verbraucherzentrale | fett gesetzte Stellennamen → „### “-Unterüberschriften; Ombudsstelle-Absatz als normaler Satz; „nie doradza“ nicht fett; „AMV (Alternativer …)“ |
| content/mietpreisbremse.pl.md, merkmale-2024.pl.md | Wyjątki, Schritte 1–2, Schritt 4; `description` | Labels der Ausnahmen und Schritte 1–2 nicht mehr fett (3, 4 und „**przed**“ bleiben); BGH-Zitat mit Kommas; Komma statt Strich |
| content/ueber.pl.md | „Czym jest ta strona“, „Czym ta strona nie jest“, „Listy“ | IP-Satz ersetzt durch neuen Absatz zu Server-Logs nach dem de-Master (IP nicht gespeichert, Einträge 7 Tage, tägliche Zählung je Seite und Sprache, Fehlerprotokoll 7 Tage); Listenpunkte als ganze Sätze „Ta strona nie jest …“ ohne Fettdruck; „– jeśli chcesz –“ → „oraz, jeśli chcesz,“ |
| static/i18n/content/pl.json | `features` (67 S 150/18, Elektrosteigleitung, Potentialausgleich, gefangenes Zimmer, Durchgangszimmer), `checker.last_change_help`, `letters.fields.tenant_name`, `own_text_help`, `rules` (Kappungsgrenze, Teilzustimmung, LWU) | 11 Gedankenstriche ersetzt (Komma, „czyli“, Doppelpunkt, Semikolon) |
| static/i18n/ui/pl.json | `feature_exclusive_note`, `start_range_text`, `calc_baualter_label`, `calc_area_hint`, `calc_exclusive_blocked`, `calc_conflict_mine`, `chk_in_received_hint`, `chk_wartefrist_postpones`, `chk_partial_title`, `letter_send_text`, `letter_binding_text` | 11 Gedankenstriche ersetzt; „albo – albo“ → „albo jedno, albo drugie“. Listenzeichen „– “ am Zeilenanfang in `scope_not558_text` bleiben (wie de). |
| content/pruefen.pl.md, rechner.pl.md, ueber.pl.md; static/i18n/content/pl.json | „Potrzebujesz do tego:“, Absatz Spanne, `description`; 8 Energie-`explain` | wie de (Deslop_de): Aufzählung als Liste mit 5 Punkten; Pseudo-Überschrift „Jak umiejscowić…:“ aufgelöst („To, gdzie w tym przedziale leży twoje mieszkanie, pokazuje pomoc orientacyjna.“); `description` „Czym jest ta strona i gdzie są jej granice.“; „Ważne:“ gestrichen, „izolacji cieplnej/instalacji grzewczej“ → „izolacji cieplnej lub instalacji grzewczej“ |
| content/*.pl.md, static/i18n/content/pl.json, static/i18n/ui/pl.json | de-Master Runde 2 (Deslop_de, 7 Punkte) und Deslop_Guard_uk_ru_pl #2–4, #7–10 | mieterhoehung Z. 16 „**W następujących przypadkach obowiązują inne zasady.**“; Z. 10 „„§”“/„„Rn.”“ in Anführungszeichen; Restlabels/Fettdruck entfernt (Z. 14 zgodzić się, Z. 33 als Satz „W nowszym mieszkaniu socjalnym…“, „**Uważaj przy płaceniu:**“, Lastschrift und Formulare in den Satz, „Ustawa:“ gestrichen, „Poza tym istnieje Leistbarkeitsversprechen…“, Ombudsstelle nicht fett); hilfe Z. 10 „Te informacje mogą się zmienić.“; ueber Z. 14 „…programów statystycznych ani śledzących w twojej przeglądarce…“, Z. 21 „Nasze teksty nie są urzędowym tłumaczeniem.“; brief Z. 14 „Na tej stronie utworzysz list…“; _index „Ważne:“ gestrichen, „**Nie przestawaj wtedy po prostu płacić**“; mietpreisbremse „na początku“ nicht fett, Schritt 2 „(Rüge), czyli …“, Schritte 3–4 ohne Fettlabel, fett nur „**zwykle nie dostaniesz już nic z powrotem**“; Energie-Entweder-oder mit Merkmalsname in Anführungszeichen („cechę „Izolacja lub instalacja grzewcza”“) in 8 `explain`, `groups.gebaeude.intro`, ui `calc_conflict_landlord_text`; „nie obie naraz“ → „nie jedno i drugie“. merkmale-2024 `description` hatte schon Kommas. |

## De-slop – tr

Nur Stil, 18.10.2026: keine Gedankenstriche mit Leerzeichen, kein `---`, höchstens ein Fettdruck je Absatz/Listenpunkt, Zitierweise mit Komma („28.09.2022 tarihli karar, VIII ZR 300/21“; deutsche Quellenzeilen „BGH, Urteil vom 28.09.2022, VIII ZR 300/21“). Inhalt, Zahlen, Daten, §, Platzhalter und Warnungen unverändert.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| content/mieterhoehung.tr.md | `description`, Z. 10, 14, 16, 23, 35, 179, 184; alle `*Kaynak:*`-Zeilen | Fettdruck im Satz entfernt (§/Rn., „onaylamanız“, „geçerli değildir“, „durdurmayın“, „önce“, „başvuru üzerine“, Ombudsstelle-Name); „Dikkat –“ → „**Dikkat:**“; 15 Zitate mit Komma statt Strich |
| content/mietpreisbremse.tr.md | Z. 10, 27, 46, Tabelle, Liste Nr. 4 | Fettdruck „başındaki“/„önce“ entfernt; Zeiträume „01.06.2015 ile 31.05.2020 arası“; BGH-Zitat mit Komma |
| content/brief.tr.md, content/pruefen.tr.md | `description` (brief), Z. 10 | nur Einleitungsfrage fett; Strich → Punkt |
| content/rechner.tr.md | Z. 10, 18 | zweiter Fettdruck entfernt; Zitat mit Komma |
| content/hilfe.tr.md, content/merkmale-2024.tr.md | AMV, Schlusssatz, `description` | „AMV (Alternativer …)“; „vermez“ nicht mehr fett; Strich → Punkt |
| content/ueber.tr.md | „Bu site nedir“, „Mektuplar“ | IP-Satz ersetzt durch neuen Absatz nach de (IP nicht gespeichert, Einträge 7 Tage, tägliche Zählung je Seite und Sprache, Fehlerprotokoll 7 Tage); „– isterseniz –“ → „ve isterseniz“ |
| static/i18n/ui/tr.json | `feature_exclusive_note`, `start_range_text`, `calc_area_hint`, `calc_exclusive_blocked`, `calc_conflict_mine`, `chk_in_received_hint`, `chk_wartefrist_postpones`, `chk_partial_title`, `letter_send_text`, `letter_binding_text` | 10 Gedankenstriche ersetzt (Komma, Doppelpunkt, Umstellung); „ya – ya da“ → „ya biri ya diğeri“. Listenzeichen „– “ am Zeilenanfang in `scope_not558_text` bleiben (wie de). |
| static/i18n/content/tr.json | `features` (67 S 150/18) | Zitat mit Komma |
| content/*.tr.md | Bold-/Strukturregel von Deslop_de (nachgezogen) | Allgemeine Einleitungen nicht mehr fett: _index Schritte und „Böyle ilerleyin:“, „Önemli:“ entfällt, nur „**O zaman ödemeyi öylece durdurmayın**“ fett; brief „Lütfen dikkat edin:“; merkmale „iki kural“; rechner Listen-Labels und „Daireyi aralığa böyle yerleştirirsiniz:“ entfällt („Dairenizin bu aralıkta nerede olduğunu Orientierungshilfe … gösterir.“); mietpreisbremse Ausnahmen-Labels und Schritte 1–2 (fett bleiben Schritt 3–4 und „**önce**“); ueber „Bu site ne değildir“ als einfache Sätze. brief/pruefen: Geltungsbereich in zwei Absätze geteilt (P1 nur „**Bu sizin için geçerli mi?**“, P2 „Bu durumlarda ödemeyi öylece **durdurmayın**. …“). hilfe: Einträge als `###` (İlçenizdeki kiracı danışmanlığı (Mieterberatung) / Senato'nun kira danışma hattı (Servicetelefon Miete) / Mietpreisprüfstelle Berlin (kira kontrol bürosu) / Birçok dilde danışmanlık), Ombudsstelle als einfacher Satz. mieterhoehung: nicht mehr fett: Fristen-Unterliste, „Otomatik ödeme (Lastschrift):“, „Kısmen onay…“, „Reddi…“, „Ev sahibinin formları:“, „Örnek:“, Liste „Dairenizde ne sayılır?“, „Yasa:“; wieder fett wie de: „**onaylamanız**“, „**Dikkat: Şu durumlarda başka kurallar geçerlidir.**“, „**geçerli değildir**“, „**durdurmayın**“, „**başvuru üzerine**“. |
| content/mieterhoehung.tr.md, pruefen.tr.md, ueber.tr.md, static/i18n/content/tr.json | Nachzug de-Zusatzänderungen | Titel „Kira artışı: En önemli kurallar“ (Linktext in pruefen angepasst); ueber `description` „Bu site nedir ve sınırları nerededir.“; pruefen „Bunun için şunlara ihtiyacınız var:“ als Liste mit 5 Punkten; Energie-Merkmale (8 `explain`): „Önemli:“ entfällt, „ısı yalıtımı/ısıtma sistemi“ → „ısı yalıtımı veya ısıtma sistemi“ |
| content/mieterhoehung.tr.md | Abgleich mit finalem de | Wie finales de: „onaylamanız“ und „geçerli değildir“ nicht mehr fett; „**Şu durumlarda başka kurallar geçerlidir.**“; Absatz „Kostenmiete“ ohne Fett-Etikett als Satz; „**Ödemede dikkat:**“. Etiketten in den Satz eingearbeitet: Lastschrift („… çekme izni (otomatik ödeme, Lastschrift) verdiyseniz“), Teilzustimmung („Yalnızca kısmen de onay verebilirsiniz.“), Formular, „Yasa:“ entfällt; „Ödenebilirlik sözü (Leistbarkeitsversprechen)“ nicht mehr fett („Ayrıca … vardır:“) |
| content/*.tr.md, static/i18n/*/tr.json | Nachzug de (Meaning-Guard) | mieterhoehung Z. 16 „**Aşağıdaki durumlarda başka kurallar geçerlidir.**“; hilfe Z. 10 „… kontrol edin. Bu bilgiler değişebilir.“; ueber Z. 14 „Tarayıcınızda çerez (cookie), istatistik veya izleme (tracking) programı yoktur …“; brief Z. 14 „Bu sayfayla ev sahibinize bir mektup oluşturursunuz.“; merkmale-2024 `description` mit Komma; mietpreisbremse Schritte 3–4 ohne Fett-Etikett, einziges Fett „**çoğu zaman artık hiçbir şey geri alamazsınız**“; Energie-Entweder-oder als zwei Optionen mit Merkmalsnamen „Yalıtım veya ısıtma sistemi“: 8 `explain` (gebaeude-m08–m11, p08–p11), `groups.gebaeude.intro`, ui `calc_conflict_landlord_text` |
| content/hilfe.tr.md, merkmale.tr.md, merkmale-2024.tr.md, pruefen.tr.md, mieterhoehung.tr.md | Guard_tr_ar (Deslop_Guard_tr_ar.md Nr. 8–11, 13–15) | hilfe Z. 10 „Bu sayfada Berlin'deki danışma merkezleri yer alır.“, Z. 35 „… berlinovo kiracılarına hizmet verir.“; merkmale/merkmale-2024 „Bu sayfa, … gösterir.“; pruefen „Bu sayfayla § 558 BGB'ye göre …“; mieterhoehung Z. 10 „„§“ … „Rn.“ …“, Z. 51 „Belirleyici olan, …“. Nr. 12 (brief) durch neueren de-Stand ersetzt: Zweckssatz bleibt („Bu sayfayla ev sahibinize bir mektup oluşturursunuz.“). |

## De-slop – en

Stilüberarbeitung der englischen Texte, 18.10.2026 (Deslop_en). Nur Stil: Bedeutung, Zahlen, Daten, §, Platzhalter und Warnungen unverändert. Ausnahme: Datenschutz-Absatz in ueber.en.md nach dem neuen deutschen Master (Deslop_de/PrivacyLogs).

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| content/*.en.md | Quellenzeilen, Fließtext | Gesetzte Gedankenstriche („ – “) durch Komma ersetzt; Zitierstil „BGH, judgment of 28.09.2022, VIII ZR 300/21“ bzw. in den deutschen Quellenzeilen „BGH, Urteil vom …, VIII ZR …“. Trennzeile der Markdown-Tabelle in mietpreisbremse.en.md bleibt (Tabellensyntax). Keine `---`-Linien vorhanden. |
| content/mieterhoehung.en.md | `title`, `description`, Z. 10, 14, 16, 23, 33, 35, 72–74, 92, 102, 106, 110, 112, 121, 135–137, 173, 175, 184 | Titel „what you should know“ (Floskel) → „the main rules“ (Linktext in pruefen.en.md angepasst); „Careful – …“ → „Careful: …“; Fettdruck entfernt (nach der Fettdruck-Regel von Deslop_de) bei „§“/„Rn.“, „agree“, „not“ (Z. 23), „before“, Unterliste der Fristen, „Direct debit“, „The landlord’s forms“, „You can agree in part“, „Example“, Liste „What counts“, „Law“, „Affordability promise“, Ombudsstelle; doppelte Aussage „You do not have to give reasons … The law does not require you to give reasons“ zu einem Satz zusammengefasst; „Law: A Berlin law says: …“ als ganzer Satz. Fett bleiben nur Fristen, Beträge und Warnungen wie in de (je höchstens einer pro Absatz/Listenpunkt), dazu „do **not** simply stop paying“. |
| content/pruefen.en.md, brief.en.md | Z. 10–12, brief `description`, Z. 16 | Kasten wie de in zwei Absätze geteilt: Absatz 1 nur „**Does this apply to you?**“ fett (vorher 4×), Absatz 2 „In these cases, do **not** simply stop paying. Get advice … More on this …“; „Please note:“ nicht fett; Strich → Komma |
| content/rechner.en.md | Z. 10, 14–21 | Kasten: nur „Does this apply to you?“ fett; „What you need“, Listen-Etiketten und „How to place …“ nicht fett; BGH-Zitat mit Komma |
| content/_index.en.md | Z. 11–15 | „How to proceed“ und Schritt-Etiketten nicht fett; „Important:“ bleibt (Warnung) |
| content/hilfe.en.md | „Free of charge“, „For tenants of the state-owned …“, AMV, Schlusssatz | Wie de: die vier fetten Namen sind jetzt „###“-Unterüberschriften; Ombudsstelle als ganzer Satz ohne Fettdruck; „AMV – …“ → „AMV (…)“; Verbraucherzentrale „not“ nicht mehr fett |
| content/mietpreisbremse.en.md | Z. 10, 27, 39–44, 50–53 | „at the start“ und Etiketten der Ausnahmen nicht fett; Schritte 1–2 nicht fett, 3 (30-Monats-Frist) und 4 (Warnung) bleiben; „before“ (Z. 46) bleibt; BGH-Zitat mit Komma |
| content/merkmale.en.md, merkmale-2024.en.md | Z. 13, `description` | „Two rules apply …“ nicht fett; Strich → Komma |
| content/ueber.en.md | „What this site is“, „What this site is not“, „The letters“ | IP-Satz ersetzt durch eigenen Absatz nach de (IP normalerweise nicht gespeichert, Einträge 7 Tage, tägliche Zählung je Seite und Sprache, Fehlerprotokoll 7 Tage); die drei Hinweise wie de als ganze Sätze ohne Fettdruck („This site is not legal advice.“ …); „– if you want –“ → „and, if you want,“ |
| static/i18n/ui/en.json | `feature_exclusive_note`, `start_range_text`, `calc_area_hint`, `calc_exclusive_blocked`, `calc_conflict_mine`, `chk_in_received_hint`, `chk_wartefrist_postpones`, `chk_partial_title`, `letter_send_text`, `letter_binding_text`; `calc_conflict_landlord_text` | 10 Gedankenstriche ersetzt (Komma, Punkt); „either – or“ → „either/or“. Listenzeichen „– “ am Zeilenanfang in `scope_not558_text` bleiben (wie de). `calc_conflict_landlord_text`: „insulation/heating feature“ → „feature on thermal insulation or heating system“ (wie ui/de.json). |
| static/i18n/content/en.json | `features.umfeld-p03.check`; `features.gebaeude-m08`–`m11`, `p08`–`p11` `.explain` | Zitat mit Komma („judgment of 16.10.2018, 67 S 150/18“); wie de: Einleitung „Important:“ gestrichen, „thermal insulation/heating system“ → „thermal insulation or heating system“ |
| content/rechner.en.md, pruefen.en.md, ueber.en.md | rechner Z. 21, pruefen Z. 16–24, ueber `description` | Wie de: Pseudo-Überschrift „How to place the flat in the range:“ aufgelöst („… Where your flat lies in this range is shown by the Orientierungshilfe. It has five groups …“); „For this you need:“ als Liste mit 5 Punkten; ueber-Beschreibung → „What this site is and where its limits are.“ (de: „Was diese Seite ist und wo ihre Grenzen liegen.“) |
| content/*.en.md, content/en.json, ui/en.json | Deslop-Guard (`99 Arbeitsdateien/Website/Deslop_Guard_de_en.md`), Funde 1–8 nach de gespiegelt | mieterhoehung Z. 16 „**Other rules apply in the following cases.** You then usually have to pay …“ (verweist nach vorn auf die Liste); hilfe Z. 10 „… on the linked pages. This information can change.“; ueber Z. 14 „no statistics or tracking programs in your browser“ (kein Widerspruch zur täglichen Zählung auf dem Server); brief Z. 14 „With this page you create a letter to your landlord. …“ (wie de); merkmale-2024 `description` hatte schon das Komma; mietpreisbremse Schritte 3–4 ohne fette Etiketten, fett nur „You then **usually get nothing back**.“; Energie-Regel als genau zwei Möglichkeiten: „You choose either the feature “insulation or heating system” or the features on the energy value, not both.“ in allen 8 `explain` (gebaeude-m08–m11, p08–p11), `groups.gebaeude.intro` („you tick either the feature “insulation or heating system” or the features on the energy value …“) und ui `calc_conflict_landlord_text`; _index Z. 17 (Fund 6) „**Important:**“ gestrichen, fett nur „**do not simply stop paying**“. Hinweis aus Fund 3: Der Absatz zu den Server-Logs in ueber.en.md stimmt erst nach dem Deploy des privacy-logs-Moduls in tusch.la. |

## De-slop – ar

Nur Stil, 18.10.2026 (Deslop_ar): keine Gedankenstriche mit Leerzeichen (ersetzt durch arabisches Komma „،“, Punkt, Doppelpunkt oder Umstellung), kein `---`, höchstens ein Fettdruck je Absatz/Listenpunkt, Zitierweise mit Komma vor dem Aktenzeichen (deutsche Quellenzeilen „BGH, Urteil vom 28.09.2022, VIII ZR 300/21“; arabisch „حكم بتاريخ 16.10.2018، 67 S 150/18“). Bedeutung, Zahlen, Daten, §, Platzhalter, Warnungen, LTR-Inseln und deutsche Begriffe unverändert. Ausnahme: Datenschutz-Absatz in ueber.ar.md nach dem neuen deutschen Master (Deslop_de/PrivacyLogs).

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| content/mieterhoehung.ar.md | `description`, Z. 10, 14, 16, 23, 35, 51, 102, 149, 179, 184; alle `*المصدر:*`-Zeilen | `description` mit „بلغة بسيطة:“ vorangestellt statt Strich; Fettdruck im Satz entfernt (§/Rn. jetzt „الرمز §“/„الاختصار Rn.“, „توافق“, „لا“ ×2, „قبل“, „بناءً على طلب (Antrag)“, Ombudsstelle-Name); „انتبه –“ → „انتبه:“; „(الوصول، Zugang)“, Überschrift „(حق الفسخ الاستثنائي، Sonderkündigungsrecht)“; 15 Zitate mit Komma statt Strich |
| content/mietpreisbremse.ar.md | Z. 10, 27, 46, Liste Nr. 4 | Fettdruck „عند بداية“ ×2 und „قبل“ entfernt; BGH-Zitat mit Komma |
| content/brief.ar.md, content/pruefen.ar.md | `description` (brief), Z. 10, 14 (brief) | nur Einleitungsfrage fett (vorher 4×); Strich → Komma; Floskel „**يرجى الانتباه:**“ → „**مهم:**“ |
| content/rechner.ar.md | Z. 10, 14, 18 | zweiter Fettdruck („لا“) entfernt; „هذا ما تحتاج إليه:“ nicht fett; Zitat mit Komma |
| content/_index.ar.md, content/merkmale.ar.md | Z. 11, Z. 13 | Einleitungszeilen vor fett beschrifteten bzw. kurzen Listen nicht mehr fett |
| content/hilfe.ar.md, content/merkmale-2024.ar.md | AMV, Z. 44, `description` | „AMV (Alternativer …)“; „لا“ nicht mehr fett; Strich → Komma |
| content/ueber.ar.md | „ما هو هذا الموقع“, „الرسائل“ | IP-Satz ersetzt durch eigenen Absatz nach de (IP normalerweise nicht gespeichert, nur Seite und Zeit protokolliert, Einträge 7 Tage, tägliche Zählung je Seite und Sprache, Fehlerprotokoll 7 Tage); „و– إذا أردت –“ → „وكذلك … إذا أردت“ |
| static/i18n/ui/ar.json | `feature_exclusive_note`, `start_range_text`, `calc_area_hint`, `calc_exclusive_blocked`, `calc_conflict_mine`, `chk_in_received_hint`, `chk_wartefrist_postpones`, `chk_partial_title`, `letter_send_text`, `letter_binding_text` | 10 Gedankenstriche ersetzt (Komma, Punkt, „خطوة بخطوة:“ vorangestellt); „إما – أو“ → „إما هذه أو تلك“/„إما هذا أو ذاك“. Listenzeichen „– “ am Zeilenanfang in `scope_not558_text` bleiben (wie de). UI-Höflichkeitsform „يرجى“ (= „Bitte“) bleibt wie de. |
| static/i18n/content/ar.json | `features.umfeld-p03.check` | Zitat mit Komma; Bereich „Rn. 6–9“ (ohne Leerzeichen) bleibt |
| content/*.ar.md (2. Durchgang nach Fett-/Strukturregel von Deslop_de) | _index Z. 7–17; brief, pruefen Z. 10 ff.; rechner Z. 16–21; hilfe Z. 10–27; ueber `description`, „ما ليس هو هذا الموقع“; merkmale Z. 11, merkmale-2024 Z. 10; mietpreisbremse Z. 39–51; mieterhoehung Z. 35, 72–74, 90, 106, 110, 112, 121, 135–137, 173, 175, 179 | wie de: Einleitungen und Listen-/Absatzlabels nicht mehr fett (Schritte auf der Startseite, Rechner-Liste, Ausnahmen und Schritte 1–2 bei der Mietpreisbremse, Fristen-Unterliste, „Was zählt“-Liste, „القانون:“, „الخصم المباشر:“, „نماذج المؤجِّر:“, „الموافقة الجزئية ممكنة.“, „لا يجب عليك تبرير الرفض.“, „مثال:“, „وعد القدرة على الدفع:“); Fett nur noch bei Warnungen, Fristen und Beträgen. Wieder fett wie de: „**لا** تتوقف …“ (mieterhoehung Z. 35, brief/pruefen), „**بناءً على طلب (Antrag)**“, mietpreisbremse „**قبل** إبرام العقد“; Startseite „**لا تتوقف عن الدفع ببساطة**“ statt Label „مهم:“. Kasten in brief/pruefen auf zwei Absätze aufgeteilt (Absatz 1 nur „هل ينطبق هذا عليك؟“ fett, Absatz 2 Warnung + Links); brief „**مهم:**“ → „يرجى الانتباه:“ (nicht fett, wie de „Bitte beachten Sie:“). pruefen: Bedarf als Liste. rechner Z. 21 ohne Label, umgestellt wie de. hilfe: Einträge als `###`-Unterüberschriften, Ombudsstelle als ganzer Satz. ueber: drei Hinweise als ganze Sätze ohne Fett, `description` ohne „وما ليس هو“. „هنا تجد“ → „تعرض هذه الصفحة“ / „في هذه الصفحة“. Damit überholt: die Angaben oben zu brief „**مهم:**“, zu entfettetem „لا“ (Z. 35), „بناءً على طلب“ und mietpreisbremse „قبل“. |
| content/mieterhoehung.ar.md, content/pruefen.ar.md; static/i18n/content/ar.json | `title`, Linktext Z. 28; `features` Energie-Merkmale (8 `explain`) | wie de: Titel „زيادة الإيجار: أهم القواعد“ (statt Floskel „ما يجب أن تعرفه“), Linktext in pruefen angepasst; in den Energie-Merkmalen Einleitung „مهم:“ entfernt und „العزل الحراري/نظام التدفئة“ → „العزل الحراري أو نظام التدفئة،“ |
| content/*.ar.md; static/i18n/content/ar.json, static/i18n/ui/ar.json (3. Durchgang: 7-Punkte-Liste von Deslop_de und Funde aus `Deslop_Guard_tr_ar.md`) | mieterhoehung Z. 10, 16, 33, 51, 88, 90, 112, 173, 175; hilfe Z. 10; ueber Z. 14; brief Z. 14; mietpreisbremse Liste Nr. 3–4; content `features` Energie-Merkmale (8 `explain`), `groups.gebaeude.intro`; ui `calc_conflict_landlord_text` | wie de: Z. 16 „**في الحالات التالية تسري قواعد أخرى.** عندها …“ (verweist auf die Liste, „انتبه“ entfernt); Abkürzungen in Anführungszeichen („§“, „Rn.“); Kostenmiete-Label Z. 33 als ganzer Satz; „المهم هو“ → „العبرة ب…“; „لكن انتبه عند الدفع“ → „انتبه عند الدفع“; nach dem Entfetten verbliebene Labels aufgelöst (Lastschrift als Klammerzusatz, Formular-Satz, „القانون:“ gestrichen, „وهناك أيضاً وعد القدرة على الدفع“); hilfe „فهذه البيانات قد تتغير“ (klares Subjekt); ueber „ولا برامج إحصاء أو تتبّع (Tracking) في متصفحك“; brief Zweck-Satz wieder „بهذه الصفحة تنشئ رسالة إلى المؤجِّر …“; mietpreisbremse Schritte 3–4 ohne Fett-Label, einziges Fett „**لا تسترد في الغالب أي شيء**“; Energie-Entweder-oder mit Merkmalsname in Anführungszeichen „الخاصية „العزل أو نظام التدفئة“، أو الخصائص المتعلقة بمؤشر الطاقة“ (10 Stellen). merkmale-2024 `description` hatte schon das Komma statt Strich, unverändert. |

## De-slop – ru

Nur Stil, 18.10.2026: keine Gedankenstriche mit Leerzeichen (auch nicht der russische Strich für die weggelassene Kopula „X – Y“; umformuliert mit „является“, „составляет“, „служит“, „то есть“, Doppelpunkt, Komma oder Klammer), kein `---`, höchstens ein Fettdruck je Absatz/Listenpunkt, Zitierweise mit Komma („решение от 28.09.2022, VIII ZR 300/21“). Inhalt, Zahlen, Daten, §, Platzhalter und Warnungen unverändert.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| content/mieterhoehung.ru.md | `description`, Z. 10, 16, 41, 84 (Überschrift), 98, 102, 119, 121, 127, 128, 151, 161, 184; alle `*Источник:*`-Zeilen | „Простыми словами:“ an den Anfang der description; „§“/„Rn.“ in Anführungszeichen statt fett; „Осторожно – …“ → „Осторожно, …“; Überschrift „Молчание не означает согласия“; Fettdruck „до“, „Пример:“ und Ombudsstelle-Name entfernt; Sperrfrist-/Wartefrist-Labels ohne Strich; „Это значит:“ → „то есть“; 20 Zitate mit Komma |
| content/brief.ru.md, content/pruefen.ru.md | `description` (brief), Z. 10, 14/16 | Kasten „Подходит ли это вам?“: nur noch die Einleitungsfrage fett (vorher 4×); „Письма – это образцы“ → „Это образцы писем“; „Пожалуйста, обратите внимание:“ nicht fett; Nettokaltmiete-Erklärung mit „то есть“; „Результат является …“ |
| content/rechner.ru.md | Z. 10, 12, 14, 18, 23 | zweiter Fettdruck entfernt; „Значения указывают …“; „Что вам нужно:“ nicht fett; Zitat mit Komma; „результат является только оценкой“ |
| content/_index.ru.md | Z. 11, 17 | „Как действовать:“ nicht fett; „**Важно:**“-Opener entfernt, nur „дать согласие“ fett |
| content/hilfe.ru.md, merkmale.ru.md, merkmale-2024.ru.md, mietpreisbremse.ru.md | AMV, Z. 13/16, `description`, Z. 14, 27, Liste Nr. 4 | „AMV (Alternativer …)“; Einleitung nicht fett; „не являются официальным переводом“; Doppelpunkt statt Strich; „Весь Берлин является таким районом“; zweites „в начале“ nicht fett; BGH-Zitat mit Komma |
| content/ueber.ru.md | „Что это за сайт“, „Чем этот сайт не является“, „Письма“ | IP-Satz ersetzt durch neuen Absatz nach de (IP nicht gespeichert, Einträge 7 Tage, tägliche Zählung je Seite und Sprache, Fehlerprotokoll 7 Tage); Kopula-Striche umformuliert; „– если хотите –“ → „, если хотите,“ |
| static/i18n/content/ru.json | `features` (bad-m01, bad-m07, bad-p07, gebaeude-m06, gebaeude-m08, kueche-p02, umfeld-p03, wohnung-m02, wohnung-m06, wohnung-p09, wohnung-p10), `checker.last_change_help`, `checker.disclaimer`, `letters.fields.tenant_name`, `letters.fields.own_text_help`, `letters.intro.text`, `rules` (mietspiegel_choice, ovm, netting, termination_declare_by, termination_safe_by, kappung, silence.title, partial_consent, consent_deadline_193) | 30 Gedankenstriche ersetzt; „Важно:“-Opener in gebaeude-m08 entfernt; Zitat 67 S 150/18 mit Komma |
| static/i18n/ui/ru.json | `feature_exclusive_note`, `start_range_text`, `calc_baualter_label`, `calc_area_hint`, `calc_exclusive_blocked`, `calc_energy_bedarf`, `calc_conflict_mine`, `calc_oh_note`, `chk_intro`, `chk_in_received_hint`, `chk_wartefrist_postpones`, `chk_partial_title`, `letter_intro`, `letter_send_text`, `calc_rounding_note`, `chk_in_lwu`, `letter_binding_text`, `chk_consent_193` | 20 Gedankenstriche ersetzt; „либо – либо“ → „можно выбрать только один“ / „только один вариант“. Listenzeichen „– “ am Zeilenanfang in `scope_not558_text` bleiben (wie de). |
| content/*.ru.md | Fettdruck-/Strukturregeln von Deslop_de übernommen | Allgemeine Einleitungen nicht mehr fett (Schritte auf der Startseite, Listenlabels in rechner, Ausnahmen und Schritte 1–2 in mietpreisbremse, Fristen-Unterliste und Liste „Что считается“ in mieterhoehung, „Закон:“, „Прямое списание“, „Формы арендодателя“, „Частичное согласие…“, „Отказ…“, „Обещание доступности“, „дать согласие“, „не действуют“). Fett bleiben nur Warnungen, Fristen und Beträge. Der Absatz zur Anwendbarkeit in brief und pruefen ist geteilt; der zweite Absatz beginnt mit „В этих случаях **не** прекращайте…“. In ueber sind die Punkte von „Чем этот сайт не является“ ganze Sätze. In hilfe sind die Einträge `###`-Unterüberschriften, der Satz zur Ombudsstelle ist ohne Fettdruck, ebenso das „не“ bei der Verbraucherzentrale. |
| content/*.ru.md, static/i18n/content/ru.json | Nachtrag nach de-Endstand | mieterhoehung `title` → „Повышение арендной платы: самые важные правила“, Linktext in pruefen angepasst. ueber `description` → „Что это за сайт и где его границы.“ In rechner ist die Pseudo-Überschrift zur Spanne in den Fließtext aufgelöst. In pruefen ist „Для этого вам нужны:“ jetzt eine Liste mit 5 Punkten. „Здесь вы …“ ist umformuliert (brief, pruefen, hilfe, merkmale, merkmale-2024), und in merkmale-2024 steht „Этот Mietspiegel нужен вам“. Startseite: fett ist nur noch „не прекращайте просто так платить“. In mieterhoehung steht „**В этих случаях действуют другие правила.**“ und „Всё зависит от дня“; „Осторожно с оплатой“ steht ohne „Но“. Die Labels Sozialwohnung, Lastschrift, Teilzustimmung, Ablehnung, Formulare, Gesetz und Leistbarkeit sind als Sätze formuliert. ru.json, gebaeude-m09 bis m11 und p08 bis p11: Opener „Важно:“ (7×) entfernt; „теплоизоляции/отопительной установке“ (8×) → „теплоизоляции или отопительной установке“. |
| content/*.ru.md, static/i18n/content/ru.json, static/i18n/ui/ru.json | Neue de-Masterpunkte 1–7 und Befunde aus Deslop_Guard_uk_ru_pl (#1, 2, 3, 4, 6, 10, 11, 12, 13, 14) | ui `chk_consent_193`: „в вашем случае на {date}“ → „здесь на {date}“. Das war eine Bedeutungsänderung, jetzt wieder wie de „hier“. mieterhoehung: „**В следующих случаях действуют другие правила.**“ verweist auf die Liste darunter; „Решающим является день …“; „дополнительно снижают … с 15 % до 11 %“ (vorher doppeltes „senken … noch tiefer“). hilfe: „Эти данные могут меняться.“ ueber: „нет программ статистики или отслеживания в вашем браузере“; „Наши тексты не являются официальным переводом.“ brief: Satz zum Zweck der Seite wieder da („На этой странице вы составляете письмо арендодателю.“). merkmale-2024 `description`: Komma statt Doppelpunkt. mietpreisbremse: Schritt 2 „(Rüge), то есть пожаловаться …“; Schritte 3 und 4 ohne fette Labels, fett nur „обычно уже ничего не получите обратно“. ru.json: Entweder-oder-Regel mit dem Merkmalsnamen in Anführungszeichen („признак «Теплоизоляция или отопительная установка»“) in den 8 `explain`-Texten gebaeude-m08 bis m11 und p08 bis p11 sowie in `groups.gebaeude.intro`; bad-p07 wieder mit Doppelpunkt statt dreimal „не действует“. ui `calc_conflict_landlord_text` hat die gleiche Formulierung. |

## De-slop – de

Stilüberarbeitung des deutschen Masters, 18.10.2026 (Deslop_de). Nur Stil: Bedeutung, Zahlen, Daten, §, Platzhalter, Bedingungen und Warnungen unverändert. Ausnahme: Datenschutz-Absatz in ueber.md (Server-Protokolle, Text von PrivacyLogs). Regeln: keine Gedankenstriche mit Leerzeichen und keine Geviertstriche (ersetzt durch Punkt, Komma, Doppelpunkt oder Klammer), keine `---`-Linien, Fettdruck nur für Fristen, Beträge und echte Warnungen (höchstens einer je Absatz oder Listenpunkt), keine Floskeln wie „Wichtig:“ oder „Hier finden Sie“, Zitierweise „Urteil vom 28.09.2022, VIII ZR 300/21“. Bis-Striche ohne Leerzeichen (Rn. 6–9, 1973–1990) und Listenzeichen „– “ am Zeilenanfang (Briefe, `scope_not558_text`) bleiben. Die Trennzeile der Tabelle in mietpreisbremse.md ist Tabellensyntax und bleibt.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| content/_index.md | Z. 7, 11, 13–15, 17 | „So gehen Sie vor:“ und Schrittlabels nicht mehr fett; Opener „**Wichtig:**“ entfernt, fett bleibt nur die Warnung „Hören Sie dann nicht einfach auf zu zahlen“ |
| content/brief.md, content/pruefen.md | `description` (brief), Z. 10, 12, 14 | Kasten „Gilt das für Sie?“ in zwei Absätze geteilt: P1 nur „**Gilt das für Sie?**“ fett („zuzustimmen“ und erstes „nicht“ nicht mehr fett), P2 „Hören Sie in diesen Fällen **nicht** einfach auf zu zahlen …“ mit Links; „Hier erstellen Sie …“/„Hier prüfen Sie …“ umformuliert; „Bitte beachten Sie:“ nicht fett; doppeltes „dann“ in brief; pruefen: Aufzählung „Sie brauchen dafür“ als Liste; Linktext an neuen Titel von mieterhoehung.md |
| content/hilfe.md | Einleitung, „Kostenlos“, LWU, Mietervereine, Verbraucherzentrale | fett gesetzte Stellennamen → `###`-Unterüberschriften; Ombudsstelle als normaler Satz; „Hier finden Sie Stellen“ → „Auf dieser Seite stehen Beratungsstellen“; Komma-Satz geteilt; „AMV (Alternativer …)“; „nicht“ bei der Verbraucherzentrale nicht fett |
| content/merkmale.md, content/merkmale-2024.md | Z. 10/11, 13; `description` (2024) | „Hier finden Sie …“ → „Diese Seite zeigt …“; Bezug „ihn“ korrigiert („Diesen Mietspiegel brauchen Sie …“); „Zwei Regeln gelten für alle Merkmale:“ nicht fett; Punkt statt Strich |
| content/rechner.md | Z. 10, 14–19, 21 | Kasten: nur „Gilt das für Sie?“ fett; „Das brauchen Sie:“ und Listenlabels nicht fett; Zitat mit Komma; Pseudo-Überschrift „So ordnen Sie die Wohnung in die Spanne ein:“ in den Fließtext aufgelöst („Wo Ihre Wohnung in dieser Spanne liegt, zeigt die Orientierungshilfe.“) |
| content/ueber.md | `description`, „Was diese Seite ist“, „Was diese Seite nicht ist“, „Die Briefe“ | Beschreibung ohne Dreierreihe; Datenschutz-Absatz geteilt, der Satz „Wie bei jeder Website …“ ersetzt durch den Absatz zu Server-Protokollen (IP normalerweise nicht gespeichert, Seite und Zeit ohne IP/Browserdaten/Herkunft, Löschung nach 7 Tagen, tägliche Zählung je Seite und Sprache, Fehlerprotokoll mit möglicher IP ebenfalls 7 Tage); Listenpunkte als ganze Sätze ohne Fettdruck; „– wenn Sie wollen –“ → „, wenn Sie wollen,“ |
| content/mietpreisbremse.md | Z. 10, 27, Ausnahmen, Schritte 1, 2, 4 | „zu Beginn“ (2×) nicht fett; Labels der Ausnahmen und Schritte 1–2 nicht fett (Schritte 3, 4 und „**vor** dem Vertragsschluss“ bleiben); BGH-Zitat mit Komma |
| content/mieterhoehung.md | `title`, `description`, Z. 10, 14, 16, 23, 33, 51, 72–74, 90–92, 106, 110–112, 121, 135–137, 173, 175, 184; alle Quellenzeilen | Titel „Das sollten Sie wissen“ → „die wichtigsten Regeln“; Beschreibung ohne Strich; „§“/„Rn.“ in Anführungszeichen statt fett; „zustimmen“/„nicht“ nicht fett; „**Vorsicht – hier gelten andere Regeln.**“ → „**In diesen Fällen gelten andere Regeln.**“; Label „Neuere Sozialwohnung …“ als Satz; „Wichtig ist der Tag“ → „Es kommt auf den Tag an“; Fristen-Unterliste ohne Fett; „Aber Vorsicht beim Zahlen“ → „Vorsicht beim Zahlen“; Labels „Lastschrift:“, „Teilweise zustimmen geht.“, „Ablehnen müssen Sie nicht begründen.“ (doppelte Aussage gekürzt), „Formulare des Vermieters:“, „Beispiel:“, „Gesetz:“, „Leistbarkeitsversprechen:“ und „Was zählt“-Liste ohne Fett; Ombudsstelle nicht fett; 20 Zitate mit Komma vor dem Aktenzeichen |
| static/i18n/content/de.json | `features` gebaeude-m08 bis m11, gebaeude-p08 bis p11 (`explain`), umfeld-p03 (`check`) | gehäufter Opener „Wichtig:“ (8×) entfernt, „Wärmedämmung/Heizanlage“ → „Wärmedämmung oder Heizanlage“; Zitat 67 S 150/18 mit Komma. Der gleiche Absatz zur Verrechnung in allen fünf `groups.*.intro` bleibt: Der Rechner zeigt jede Gruppe einzeln. |
| static/i18n/ui/de.json | `feature_exclusive_note`, `start_range_text`, `calc_area_hint`, `calc_exclusive_blocked`, `calc_conflict_mine`, `chk_in_received_hint`, `chk_wartefrist_postpones`, `chk_partial_title`, `letter_send_text`, `letter_binding_text` | 10 Gedankenstriche ersetzt (Komma, Punkt, „Schritt für Schritt:“ vorangestellt); „(entweder – oder)“ → „Sie können nur eines davon wählen.“ bzw. gestrichen; Zitate mit Komma |
| static/data/letters.json | `body_de` aller 4 Vorlagen (Betreffzeile) | „… vom {demand_date} – Mietvertrag Nr. …“ → „…, Mietvertrag Nr. …“ |
| tests/run.mjs | Abschnitt 3 | neue Stilprüfung je Sprache (content/*.md, content/<lang>.json, ui/<lang>.json) und für letters.json: Fehler bei „ – “, „—“, „ -- “, `---`-Linien im Seitentext (ohne Front Matter) und mehr als 2 Fettdruck-Stellen in einem Absatz oder Listenpunkt |
| content/mieterhoehung.md, hilfe.md, ueber.md, brief.md, merkmale-2024.md, mietpreisbremse.md; static/i18n/content/de.json; static/i18n/ui/de.json | Nachträge nach Deslop-Guard (`99 Arbeitsdateien/Website/Deslop_Guard_de_en.md`) | mieterhoehung Z. 16 „**In den folgenden Fällen gelten andere Regeln.**“ (Bezug auf die folgende Liste); hilfe Z. 10 „Diese Angaben können sich ändern.“; ueber Z. 14 „keine Statistik- oder Tracking-Programme in Ihrem Browser“ (kein Widerspruch zur täglichen Zählung auf dem Server); brief Z. 14 Satz zum Zweck der Seite wieder da („Mit dieser Seite erstellen Sie einen Brief an Ihren Vermieter.“); merkmale-2024 `description` Komma statt Satzfragment; mietpreisbremse Schritte 3 und 4 mit normalen Labels wie 1 und 2, fett nur „meist nichts mehr zurück“ in Schritt 3; Energie-Regel als zwei Wahlmöglichkeiten: „das Merkmal „Dämmung oder Heizanlage“ oder die Merkmale zum Energiekennwert“ in den 8 `explain`-Texten, in `groups.gebaeude.intro` und in ui `calc_conflict_landlord_text` |

## De-slop – uk

Stilüberarbeitung der ukrainischen Texte, 18.10.2026 (Deslop_uk). Nur Stil: Bedeutung, Zahlen, Daten, §, Platzhalter und Warnungen unverändert. Ausnahme: Datenschutz-Absatz in ueber.uk.md nach dem neuen deutschen Master (Deslop_de/PrivacyLogs). Keine gesetzten Gedankenstriche mehr, auch nicht der ukrainische Strich für die weggelassene Kopula („X – це Y“): umformuliert mit „є“, „становить“, „тобто“, Doppelpunkt, Komma oder Klammer. Zitierweise mit Komma vor dem Aktenzeichen („BGH, рішення від 28.09.2022, VIII ZR 300/21“; deutsche Quellenzeilen „BGH, Urteil vom …, VIII ZR …“). Höchstens ein Fettdruck je Absatz/Listenpunkt; Fettdruck-/Strukturregel von Deslop_de übernommen.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| content/mieterhoehung.uk.md | `title`, `description`, Z. 10, 14, 16, 23, 33, 51, 72–74, 84, 90, 92, 98, 106, 110, 112, 121, 127–128, 135–137, 149, 173, 175, 184; alle `*Джерело:*`-Zeilen | Titel wie de „найважливіші правила“ (Linktext in pruefen.uk.md angepasst); `description` wie de ohne Strich; „§“/„Rn.“ in Anführungszeichen statt fett; „Обережно – …“ → „**У цих випадках діють інші правила.**“; „Важливий день“ → „Вирішальним є день“; Überschrift „Мовчання не є згодою“; Kopula-Striche („Згода – це …“, „Ці правила – …“) umformuliert; „(надходження, Zugang)“, „(Nettokaltmiete, тобто …)“, „(право на позачергове розірвання, Sonderkündigungsrecht)“; Sperrfrist/Wartefrist-Labels ohne Strich; Fettdruck entfernt bei „погодитися“, „не“ (Z. 23), Fristen-Unterliste, „Was zählt“-Liste, Lastschrift, Formulare, Teilzustimmung, Ablehnung, „Приклад:“, „Закон:“, Leistbarkeitsversprechen, Ombudsstelle, neuere geförderte Wohnung; alle Zitate mit Komma statt Strich |
| content/mietpreisbremse.uk.md | Z. 10, 18–21, 27, 39–44, 50–51, 53 | „на початку“ nicht fett; Tabellenzeiträume „з 01.06.2015 до 31.05.2020“ statt „ – “; Labels der Ausnahmen und Schritte 1–2 nicht fett (3, 4 und „**до**“ bleiben); „Rüge“ mit „тобто“; BGH-Zitat mit Komma. Trennzeile der Markdown-Tabelle bleibt (Tabellensyntax). |
| content/brief.uk.md, content/pruefen.uk.md | `description` (brief), Z. 10–16, pruefen Liste, Linktext | Kasten wie de in zwei Absätze geteilt: P1 nur „**Чи стосується це вас?**“ fett (vorher 4×), P2 „У цих випадках **не** припиняйте …“ + Links; brief „Зверніть увагу:“ nicht fett, „Листи є зразками“, Einleitungssatz wie de; pruefen „Для цього вам потрібні:“ als Liste mit 5 Punkten wie de, „Результат є …“ |
| content/rechner.uk.md | Z. 10, 12, 14, 16–19, 21, 23 | nur Kastenüberschrift fett; „Що вам потрібно:“ und Listenlabels nicht fett; Pseudo-Überschrift „Як визначити місце …:“ wie de aufgelöst; Kopula-Striche („Значення – це …“, „результат – лише оцінка“) umformuliert; „(Sammelheizung, наприклад …)“, „(готовність до заселення, Bezugsfertigkeit)“; BGH-Zitat mit Komma |
| content/_index.uk.md | Z. 11–17 | „Як діяти:“ und Schrittlabels nicht fett; „**Важливо:**“-Opener entfällt wie de, fett nur „**Тоді не припиняйте просто так платити**“; „(згода – Zustimmung, § 558 BGB)“ → „(§ 558 BGB)“ wie de |
| content/hilfe.uk.md | Z. 10, „Безкоштовно“, LWU-Abschnitt, AMV, Schlusssatz | wie de: vier fette Stellennamen → „### “-Unterüberschriften (deutscher Name in Klammern bleibt); Ombudsstelle als ganzer Satz ohne Fettdruck; „AMV (Alternativer …)“; Verbraucherzentrale „не“ nicht fett; Einleitung „На цій сторінці зібрано …“, Satz geteilt |
| content/merkmale.uk.md, content/merkmale-2024.uk.md | Z. 11/13, `description`, Z. 10 | „Для всіх ознак діють два правила:“ nicht fett; „Ця сторінка показує …“ wie de; Strich in `description` → Punkt; „Цей Mietspiegel потрібен …“ statt mehrdeutigem „Він“ |
| content/ueber.uk.md | `description`, „Що таке цей сайт“, „Чим цей сайт не є“, „Листи“, „Джерела й актуальність“ | `description` ohne Dreierreihe wie de; IP-Satz ersetzt durch eigenen Absatz nach de (IP normalerweise nicht gespeichert, nur Seite und Zeit protokolliert, Einträge 7 Tage, tägliche Zählung je Seite und Sprache, Fehlerprotokoll 7 Tage); drei Hinweise als ganze Sätze ohne Fettdruck („Цей сайт не є юридичною консультацією.“ …); „Листи є зразками …“; „і – якщо хочете –“ → „і, якщо хочете,“; „(Цивільний кодекс Німеччини, Bürgerliches Gesetzbuch, BGB)“ |
| static/i18n/content/uk.json | `features` (bad-m01, bad-m07, bad-p04, bad-p07, bad-p10, gebaeude-m06 explain/check, gebaeude-m08 bis m11, gebaeude-p08 bis p11, kueche-p02, umfeld-p03, wohnung-m02, wohnung-m06, wohnung-m07, wohnung-p09, wohnung-p10), `checker.last_change_help`, `checker.disclaimer`, `letters.ablehnung.risks`, `letters.fields.tenant_name`, `letters.intro.text`, `rules` (mietspiegel_choice, ovm, netting, termination_declare_by, termination_safe_by, sperrfrist/wartefrist `title`, kappung, silence `title`, partial_consent, lwu, consent_deadline_193) | alle gesetzten Gedankenstriche ersetzt (Komma, Doppelpunkt, Klammer, „тобто“, Umformulierung der Kopula); Opener „Важливо:“ (8×) entfernt und „теплоізоляції/опалювальної установки“ → „теплоізоляції чи опалювальної установки“ wie de; Zitat 67 S 150/18 mit Komma; Bereiche ohne Leerzeichen („1973–1990“, „Rn. 6–9“) bleiben |
| static/i18n/ui/uk.json | `feature_exclusive_note`, `start_range_text`, `calc_baualter_label`, `calc_area_hint`, `calc_minder_label`, `calc_exclusive_blocked`, `calc_energy_value`, `calc_energy_bedarf`, `calc_conflict_mine`, `calc_oh_note`, `chk_intro`, `chk_in_received_hint`, `chk_out_consent_deadline`, `chk_out_sperrfrist_earliest_received`, `chk_out_wartefrist_earliest_effective`, `chk_wartefrist_postpones`, `chk_partial_title`, `letter_intro`, `letter_send_text`, `scope_item_index_staffel`, `calc_rounding_note`, `chk_in_lwu`, `letter_binding_text`, `chk_consent_193` | alle gesetzten Gedankenstriche ersetzt; „(або – або)“ → „можна лише одне з двох“ / „лише один з двох“; Zitate mit Komma. Listenzeichen „– “ am Zeilenanfang in `scope_not558_text` bleiben (wie de). |
| content/*.uk.md, static/i18n/content/uk.json, static/i18n/ui/uk.json (2. Durchgang: neue de-Master-Änderungen nach Bedeutungsprüfung, Funde #2, #4, #5, #6, #12 aus Deslop_Guard_uk_ru_pl) | mieterhoehung Z. 16; hilfe Z. 10; ueber Z. 14; brief Z. 14; merkmale-2024 `description`; mietpreisbremse Schritte 3–4; _index Z. 17; content `groups.gebaeude.intro`, `features` gebaeude-m08 bis m11 und p08 bis p11 (`explain`); ui `calc_conflict_landlord_text` | „**У наведених нижче випадках діють інші правила.**“ (verweist auf die Liste darunter, nicht auf den § 558-Absatz); „Ці дані можуть змінюватися.“ (klares Subjekt); „немає програм статистики чи відстеження у вашому браузері“ (kein Widerspruch zur täglichen Zählung auf dem Server); brief: Satz zum Zweck der Seite wieder da („За допомогою цієї сторінки ви створюєте лист …“); merkmale-2024 `description` mit Komma statt Satzfragment; mietpreisbremse Schritte 3–4 ohne fette Labels, einziger Fettdruck in Schritt 3 „**здебільшого вже нічого не отримаєте назад**“; _index: deutsches Stichwort „(Zustimmung)“ wiederhergestellt; Energie-Regel als genau zwei Möglichkeiten mit Merkmalsnamen in Anführungszeichen: „або ознаку «Теплоізоляція або опалювальна установка», або ознаки щодо енергетичного показника, але не обидва варіанти“ |

## Language suggestion banner

Owner-Entscheidung, 18.10.2026: Hinweisleiste statt automatischer Weiterleitung. Bevorzugt der Browser (`navigator.languages`, sonst `navigator.language`) eine andere Sprache, in der es die Seite gibt, erscheint unter dem Kopf eine Zeile in dieser Sprache mit Link auf dieselbe Seite. Maßgeblich ist die erste Browsersprache, in der die Seite existiert; ist das die Sprache der Seite, erscheint nichts. Ohne JavaScript, im Druck und auf der 404-Seite keine Leiste; keine Netzwerkanfrage, keine Weiterleitung.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| templates/base.html | `<head>`, zwischen `</header>` und `<main>` | Modul `js/app/langsuggest.js` (wie `common.js`, ohne Cachebust, CSP `script-src 'self'`); verborgene Liste `<ul hidden data-lang-suggest>` mit je einem `<li data-lang data-dir data-href data-text data-close>` pro weiterer Übersetzung der Seite (Seiten und Sektionen, aus `cur.translations` und `config.extra.languages`), Texte per `load_data` aus `static/i18n/ui/<code>.json` wie in 404.html. 404 ohne Liste: dort stehen die Startseiten aller Sprachen schon im Inhalt, und „Diese Seite gibt es auch auf …“ wäre falsch. |
| static/js/app/langsuggest.js | neu | `pickSuggestion(browserLangs, pageLang, available)` (rein, getestet; Primär-Subtag, Groß/Klein egal). Leiste `<div role="region" aria-label="…" lang dir>` nach der Liste, Link mit `hreflang`, echter `<button>` „Schließen“ in der vorgeschlagenen Sprache; kein Fokuswechsel beim Laden; nach Schließen Fokus auf `#main`. Schließen und Link setzen `langSuggest: {closed: true}` im sessionStorage-Speicher von common.js (`store`), „Meine Eingaben löschen“ entfernt ihn mit. |
| static/css/site.css | Abschnitt 3 nach `.lang-switch`; Print | `.lang-suggest`: Hintergrund `--c-mark-soft`, Text und Link `--c-ink` (13,6:1 hell, 8,4:1 dunkel), Schließen-Rahmen `--c-ink-2` (7,0:1 / 4,9:1), Fokusring `--c-focus` (7,0:1 / 5,7:1); nur logische Eigenschaften, `flex-wrap`, Knopf mind. 2,75rem hoch; im Druck `display: none`. |
| static/i18n/ui/{de,en,tr,ar,uk,ru,pl}.json | neu `lang_suggest_text`, `lang_suggest_close` (nach `lang_switch_label`) | de „Diese Seite gibt es auch auf Deutsch.“ / „Schließen“; en, tr, ar, uk, ru, pl wie vom Owner vorgegeben. |
| tests/run.mjs | Abschnitt 2, Abschnitt 4 | 9 Tests für `pickSuggestion` (tr-TR vor de → tr; de-DE zuerst → keine; tr-Seite + tr → keine; en-Seite + fr, ar → ar; ohne uk-Übersetzung → keine bzw. nächste Sprache; leere Liste; „PL“ → pl). Gebaute Seite: jede HTML-Seite außer 404.html hat die Liste; Sprachen = `hreflang`-Alternativen ohne die eigene; jeder Link zeigt auf eine gebaute Seite mit diesem `lang`; `data-dir` und Texte wie in ui/<code>.json. |
| README.md | Tests, JavaScript | Leiste und Tests beschrieben. |

Browserprüfung (Headless Chromium, statischer Server auf dem Build mit `--base-url http://127.0.0.1:1290`, `navigator.languages` per Init-Skript, Viewport 360 px): tr und ar → Leiste auf /rechner/ und /mieterhoehung/ auf Türkisch bzw. Arabisch (`dir="rtl"`), zwischen Kopf und Inhalt, kein Querscrollen (scrollWidth 360); de und fr → keine Leiste; Schließen → Leiste weg, Fokus auf `main`, auf /pruefen/ und / nicht wieder; „Meine Eingaben löschen“ → Leiste kommt wieder; Link → /ar/mieterhoehung/ (`lang="ar"`, `dir="rtl"`, keine Leiste), danach auch auf deutschen Seiten keine Leiste; de-Browser auf /tr/rechner/ → „Diese Seite gibt es auch auf Deutsch.“; Druckmedium → `display: none`; Fokusring 3 px auf dem Knopf; keine Konsolenfehler, keine CSP-Verstöße.

## About page: final logging wording

Server-Log-Absatz in „Was diese Seite ist“ an die endgültige Protokollierung angepasst.

| Datei | Schlüssel / Abschnitt | Änderung |
|---|---|---|
| content/ueber.md | „Was diese Seite ist“, 2. Absatz | neuer Satz nach „… von welcher Seite Sie kamen.“: „Er merkt sich nur, ob ein Aufruf von einem automatischen Programm kam, damit solche Aufrufe nicht mitgezählt werden.“; Fehlerprotokoll-Satz jetzt „Nur bei bestimmten schweren Fehlern, etwa beim Verbindungsaufbau oder auf dem Server selbst, kann ein Fehlerprotokoll eine IP-Adresse enthalten.“ |
| content/ueber.{en,tr,ar,uk,ru,pl}.md | wie de | beide Änderungen übersetzt, Wortwahl des bestehenden Absatzes beibehalten (en „page view“, tr „açılış“, ar „فتح الصفحة“, uk/ru „відкриття/открытие“, pl „otwarcie“); keine Gedankenstriche, kein Fettdruck. |

`node tests/run.mjs`: 161 bestanden, 0 fehlgeschlagen (Stil-Lint aller Sprachen ok).

## Widersprüche und Lücken (Judge 19.10.2026)

Grundlage: `99 Arbeitsdateien/Website/Gaps_2026-10-18/Judge.md`, Teil 1 (Entscheidungen) und Teil 2 (Fix-Pakete A bis E). Platzhalter: `*` = alle 7 Sprachen, also `content/<seite>{,.en,.tr,.ar,.uk,.ru,.pl}.md` bzw. `static/i18n/{ui,content}/{de,en,tr,ar,uk,ru,pl}.json`.

| ID | Dateien | Status |
|---|---|---|
| F1 Vormiete (§ 556e Abs. 1 S. 2, BGH VIII ZR 125/23 Rn. 25) | content/mietpreisbremse*.md Z. 39; docs/sources.md | FIXED |
| F2 berlinovo nur Eigenbestand, nicht Fondsbestand (mit WV1-3, WV1-4) | static/data/rules.json `lwu.companies`; static/i18n/content/*.json `rules.lwu.text`; content/mieterhoehung*.md Z. 159, 186; content/hilfe*.md Z. 35; docs/sources.md (Roadmap 2.0 vom 05.06.2026, Ombudsstelle) | FIXED |
| F3 Grundsicherung für Arbeitsuchende statt Bürgergeld | content/mieterhoehung*.md Z. 180 (uk zusätzlich „або“) | FIXED |
| F4 Neubau: Wohnung bezugsfertig statt Haus fertig (mit WV3-7) | static/i18n/ui/*.json `scope_item_neubau`, `calc_baualter_new`; content/mieterhoehung*.md Z. 31, 37; content/rechner*.md Z. 10 | FIXED |
| F5 Sammelheizung | content/rechner*.md Z. 19 | FIXED |
| F6 § 558a Abs. 3 „Angaben für die Wohnung“ | content/mieterhoehung*.md Z. 43 | FIXED |
| C3, W10, WV3-1 Mietspiegel bei Mietbeginn (Mietpreisbremse) | content/mietpreisbremse*.md Z. 33, 55; static/i18n/ui/*.json `calc_year_intro`, `calc_year_newer` | FIXED |
| C9 Wortlaut „Absenkung … fort“ | content/mieterhoehung*.md Z. 161; docs/sources.md (Wayback-Beleg für `lwu.valid_from`) | FIXED |
| C10, M2 Nettoeinkommen, Wohngeld, 20 % Fläche | content/mieterhoehung*.md Z. 175, 177, 178 | FIXED |
| W1 Aufrechnen der Gruppen | static/i18n/content/*.json `groups.*.intro`, `rules.netting.text`; content/rechner*.md Z. 21 | FIXED |
| W2 LWU-Euro-Grenze nur für diese Erhöhung | static/i18n/content/*.json `rules.lwu.text`, `checker.result.over_lwu.text` | FIXED |
| W3 LWU-Grenze in Obergrenze, Teilzustimmung und Brief | static/js/app/pruefen.js (Zeile `chk_max_rent_lwu_lower`, Hinweis Teilzustimmung bei `over_lwu`); static/js/lib/letter.js `amountProblems(…, lwuCap)` → `agreed_over_lwu`; static/js/app/brief.js; static/i18n/ui/*.json `chk_out_max_rent`, `chk_max_rent_lwu_lower`, `letter_problem_agreed_over_lwu`; static/data/rules.json t41; tests/run.mjs „J W3“ | FIXED |
| W4 Klagefrist ab verschobener eigener Frist | static/i18n/content/*.json `rules.sue_deadline.text` | FIXED |
| W5 Formel-Etikett Kappungsgrenze | static/i18n/ui/*.json `chk_cap_formula` | FIXED |
| W6 Rundung höchstens 2 Cent pro m² | static/i18n/ui/*.json `calc_rounding_note`; static/i18n/content/*.json `rules.netting.text` | FIXED |
| W7 Vergleichsmiete per Klick übernehmen | content/pruefen*.md Z. 24 | FIXED |
| W8 selbst gestellte Ausstattung bei Minus-Merkmalen | static/i18n/ui/*.json `calc_self_text` | FIXED |
| W9 Mietvertrag „abgeschlossen“ statt „begonnen“ | static/i18n/ui/*.json `letter_binding_text`; static/i18n/content/*.json `letters.zustimmung.risks`, `letters.teilzustimmung.risks`, `rules.mietpreisbremse_after_consent.text`; content/mieterhoehung*.md Z. 102 | FIXED |
| W11 merkmale.md Z. 18 | content/merkmale*.md Z. 18 | FIXED |
| W12 „meist“ statt „oft“ | static/i18n/ui/*.json `scope_not558_text` | FIXED |
| W13 Sperrfrist ab Mietbeginn (mit WV3-4, G1b-10 Wortlaut) | static/js/lib/check558.js Eingabe `last_change_is_start`, Befund `sperrfrist_from_start` (blockiert `within_limits`); static/js/app/pruefen.js Kästchen, Stufe Warnung, Hinweis Teilzustimmung; static/js/lib/letter.js `RISKY`; static/data/rules.json t38, t39; tests/run.mjs „J W13“; static/i18n/ui/*.json `chk_in_last_change_is_start`, `chk_find_sperrfrist_from_start`, `chk_in_last_change_hint`; static/i18n/content/*.json `rules.sperrfrist_earliest_received.text`, `checker.last_change_help`, `checker.result.sperrfrist_from_start`; content/mieterhoehung*.md Z. 127 bis 128; docs/sources.md Z. 126 | FIXED |
| W14 Feiertage „zum Beispiel“ | content/mieterhoehung*.md Z. 70 | FIXED |
| W15 Titel „Kappungsgrenze“, LWU-Kästchen außerhalb der Laufzeit | static/js/lib/check558.js Ausgabe `lwu_outside_term`; static/js/app/pruefen.js Hinweis `chk_lwu_outside_term`; static/data/rules.json t40, t41; static/i18n/ui/*.json `chk_lwu_outside_term`; static/i18n/content/*.json `rules.kappung.title` | FIXED |
| W16 tote Doppeltexte (mit G1b-2, G1b-4) | static/js/app/pruefen.js (Ersatzlogik `chk_find_<id>_text` entfernt); static/data/letters.json `when_de`, `risks_de` in allen vier Vorlagen gelöscht; static/i18n/ui/*.json `chk_find_need_rent_3y_text`, `chk_find_over_lwu_text`, `chk_find_no_last_change_text` gelöscht; tests/run.mjs (jede content-Datei hat `checker.result` title/text für jede Befund-ID) | FIXED |
| W17 Rechner, alte Sozialwohnung → Hinweis „Mietspiegel gilt nicht“ | static/js/app/rechner.js `calcScope` (`not558` → `notMS`) | FIXED |
| T1, M1 „sollen“ statt Pflicht (ar, ru, tr) | static/i18n/ui/{ar,ru,tr}.json `scope_ask`; content/mieterhoehung.{ar,ru,tr}.md Z. 14 | FIXED |
| T2, T2a Fristende inklusiv (uk, ru) | static/i18n/content/{uk,ru}.json `rules.sue_deadline.text`; content/mieterhoehung.{uk,ru}.md Z. 73 (uk auch Z. 68); content/pruefen.{uk,ru}.md Z. 26 | FIXED |
| T3 „bis“ inklusiv (uk, ru) | static/i18n/content/{uk,ru}.json `features.gebaeude-m06.explain` (uk auch `rules.mietspiegel_choice.text`, `rules.kappung.text`, `rules.lwu.text`); content/mieterhoehung.uk.md Z. 54, 159, 165 bis 167; content/mieterhoehung.ru.md Z. 165 bis 167; content/mietpreisbremse.uk.md Z. 18 bis 21, 30 | FIXED |
| T4 tr Scope-Satz | content/rechner.tr.md Z. 10 | FIXED |
| T6 ar „ältere Mietspiegel ab 2017“ | content/mietpreisbremse.ar.md Z. 29 | FIXED |
| T7 ar Reihenfolge wie de | content/mieterhoehung.ar.md Z. 86 bis 92 | FIXED |
| T8 uk § 561 Ende des übernächsten Monats | content/mieterhoehung.uk.md Z. 151 | FIXED |
| T9 ru «обещания» | static/i18n/ui/ru.json `chk_out_lwu`, `chk_find_over_lwu`; static/i18n/content/ru.json `rules.lwu.text`, `checker.result.over_lwu.title` | FIXED |
| G1b-5 Warmwasser, Lesarten 2024 und 2026 | static/i18n/content/*.json `features.gebaeude-{m09,m10,m11,p09,p10,p11}.check` | FIXED |
| G1b-13 Fundstelle „Nr. 3 und 6.1“ | static/i18n/ui/*.json `calc_scope_intro`, `scope_notms_text` | FIXED |
| M3 (G1b-8, WV1-2) WoVG-Soll 15 % in vier Jahren nicht gerechnet | static/i18n/content/*.json `rules.lwu.text` | FIXED |
| WV3-3, WV1-1 WoVG-Härtefall 30 %/27 %, gilt nicht für berlinovo | content/mieterhoehung*.md Z. 173 | FIXED |
| WV3-6 § 556g Abs. 1a, zwei Jahre, Art. 229 § 49 Abs. 2 EGBGB | content/mietpreisbremse*.md Z. 46; docs/sources.md | FIXED |

REJECT, je mit Grund:
- G6 W1 Mietrecht II: nur ein Entwurf, heute kein Widerspruch (beobachten).
- G6 W2 Sondierung 2 %: politische Absicht, kein geltendes Recht (beobachten).
- G6 W3 Mietenaufsicht: erst 2027, dann den Link in `hilfe.md` prüfen.
- G6 W4 LWU-Erhöhungswelle: kein Widerspruch.
- C1, C2, C5, C6, C7, C11, C12: unsere Seite stimmt, die amtliche Seite ist veraltet oder irrt.
- C4 LWU 2 %/30 %: unsere Seite stimmt; der Härtefall ist WV3-3.
- C8 § 5 WiStG: die Seite sagt nichts dazu, nur eine Lücke.
- C9, G1b-7 (als Widerspruch): das Bündnis 2025 führt die Absenkung fort; nur der Wortlaut wurde geändert.
- G1b-9: die Zitate betreffen verschiedene Aussagen.
- G1b-10 (als Widerspruch): bei § 558 ist es derselbe Tag; der klärende Satz steht jetzt in mieterhoehung Z. 128.
- T5 pl „nicht preisgebunden“: vertretbare Umschreibung, kein Fehler.
- M5 LWU-Modernisierung: § 559 liegt außerhalb dessen, was die Seite abdeckt (Lücke).
- M6 Stichtag 01.01.2028: kein Fix heute; Erinnerung für den Eigentümer, der Code-Hinweis kam mit W15.
- WV3-2 Schreiben vor dem 28.05.2026: nur eine auslaufende Lücke, die Prüfung zeigt den Mietspiegel schon an.
- WV3-5 Gleichstand: kein Widerspruch (Nr. 10.3 „Überwiegen“).
- WV3-8 Sondermerkmale: gibt es im Mietspiegel 2026 nicht.
