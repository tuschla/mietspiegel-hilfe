#!/usr/bin/env python3
"""Build static/data/ms2026.json and ms2024.json from the official brochures.

Needs `pdftotext` (poppler) and the PDFs in tools/src/ (see docs/sources.md):
  tools/src/mietspiegel2026.pdf  (sha256 ff6f45de…)
  tools/src/mietspiegel2024.pdf  (sha256 a6ee91b8…)

Tables are parsed from `pdftotext -layout` (PDF pages 17–21). The feature
lists (Nr. 11, PDF pages 24–26) are parsed from plain `pdftotext` output;
the energy box on PDF page 26 and the verbatim prose (Nr. 9.4, 10, notes)
are written out below by hand from the same text and checked against the
rendered pages. Run `python3 tools/verify_data.py` afterwards.
"""
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "src"
OUT = ROOT / "static" / "data"

WOHNLAGEN = [
    {"id": "einfach", "label_de": "einfache Wohnlage"},
    {"id": "mittel", "label_de": "mittlere Wohnlage"},
    {"id": "gut", "label_de": "gute Wohnlage"},
]
AUSSTATTUNG = [{
    "id": "voll",
    "label_de": "voll ausgestattet: mit Sammelheizung und Bad und WC in der Wohnung (IWC)",
}]
FOOT_OST = ("Mit Wendewohnungen. Die Zuordnung West-Staakens basiert auf dem Gebietsstand 02.10.1990. "
            "Die Zuordnung der Bezirke basiert auf dem Gebietsstand 31.12.2000 vor der Gebietsreform "
            "(siehe Erläuterung unter Nr. 3).")
FOOT_9101 = "Ohne Wendewohnungen"

BAUALTER = {
    2026: ["bis1918", "1919_1949", "1950_1964", "1965_1972", "1973_1985w", "1986_1990w",
           "1973_1990o", "1991_2001", "2002_2009", "2010_2015", "2016_2019", "2020_2024"],
    2024: ["bis1918", "1919_1949", "1950_1964", "1965_1972", "1973_1985w", "1986_1990w",
           "1973_1990o", "1991_2001", "2002_2009", "2010_2015", "2016_2022"],
}
BAUALTER_LABEL = {
    "bis1918": "bis 1918", "1919_1949": "1919 bis 1949", "1950_1964": "1950 bis 1964",
    "1965_1972": "1965 bis 1972", "1973_1985w": "1973 bis 1985 West",
    "1986_1990w": "1986 bis 1990 West", "1973_1990o": "1973 bis 1990 Ost",
    "1991_2001": "1991 bis 2001", "2002_2009": "2002 bis 2009", "2010_2015": "2010 bis 2015",
    "2016_2019": "2016 bis 2019", "2020_2024": "2020 bis 2024", "2016_2022": "2016 bis 2022",
}


def label_to_baualter(label):
    s = label.replace("*", "").strip().lower()
    for bid, lab in BAUALTER_LABEL.items():
        if s == lab.lower():
            return bid
    raise ValueError(f"unknown Bezugsfertigkeit label {label!r}")


def pdftotext(year, first, last, layout):
    args = ["pdftotext", "-f", str(first), "-l", str(last)]
    if layout:
        args.append("-layout")
    args += [str(SRC / f"mietspiegel{year}.pdf"), "-"]
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def euro(s):
    return float(s.replace(",", "."))


# ---------------------------------------------------------------- tables
ROW_RE = re.compile(r"^\s*(\d{1,3})\s+(.*?)\s+(\d{1,2},\d\d) €\s+(\d{1,2},\d\d) €\s+(\d{1,2},\d\d) €\s*$")
TABLE_RE = re.compile(r"^\s*9\.([123]) Mietspiegeltabelle")
BAUALTER_IN_ROW = re.compile(r"^(Bis 1918|bis 1918|\d{4} bis \d{4}(?: West| Ost)?\**)\s{2,}(.*)$")


def parse_flaeche(text):
    t = re.sub(r"\s+", " ", text).strip()
    if t == "alle Wohnflächen":
        return "alle", 0, None, "alle Wohnflächen"
    m = re.fullmatch(r"bis unter (\d+) m²", t)
    if m:
        hi = int(m.group(1))
        return f"bis{hi}", 0, hi, f"bis unter {hi} m²"
    m = re.fullmatch(r"(\d+) m² bis unter (\d+) m²", t)
    if m:
        lo, hi = int(m.group(1)), int(m.group(2))
        return f"{lo}_{hi}", lo, hi, f"{lo} bis unter {hi} m²"
    m = re.fullmatch(r"ab (\d+) m²", t)
    if m:
        lo = int(m.group(1))
        return f"ab{lo}", lo, None, f"ab {lo} m²"
    raise ValueError(f"cannot parse Wohnfläche {text!r}")


def parse_table(year):
    text = pdftotext(year, 17, 21, layout=True)
    wl_ids = ["einfach", "mittel", "gut"]
    wohnlage = None
    baualter = None
    rows, flaechen = [], {}
    page = 17
    for line in text.split("\n"):
        if "\f" in line:
            page += line.count("\f")
            line = line.replace("\f", "")
        m = TABLE_RE.match(line)
        if m:
            wohnlage = wl_ids[int(m.group(1)) - 1]
            continue
        m = ROW_RE.match(line)
        if not m:
            continue
        nr, mid, lo, mean, hi = m.groups()
        mid = mid.strip()
        bm = BAUALTER_IN_ROW.match(mid)
        if bm:
            baualter = label_to_baualter(bm.group(1))
            mid = bm.group(2)
        fid, fmin, fmax, flabel = parse_flaeche(mid)
        flaechen[fid] = {"id": fid, "min": fmin, "max": fmax, "label_de": flabel}
        cells = {w: None for w in wl_ids}
        cells[wohnlage] = {"lower": euro(lo), "mean": euro(mean), "upper": euro(hi), "flags": []}
        rows.append({"row": int(nr), "wohnlage": wohnlage, "baualter": baualter, "ausstattung": "voll",
                     "flaeche": fid, "page_pdf": page, "cells": cells})
    rows.sort(key=lambda r: r["row"])
    flist = sorted(flaechen.values(), key=lambda f: (f["min"], f["max"] if f["max"] is not None else 10**6))
    return rows, flist


# ---------------------------------------------------------------- features
GROUPS = [("bad", "Merkmalgruppe 1: Bad/WC/Gäste-WC"), ("kueche", "Merkmalgruppe 2: Küche"),
          ("wohnung", "Merkmalgruppe 3: Wohnung"), ("gebaeude", "Merkmalgruppe 4: Gebäude"),
          ("umfeld", "Merkmalgruppe 5: Wohnumfeld")]

# Hard hyphens at line ends that plain pdftotext drops (checked against the page images).
HYPHEN_FIXES = [("Lärmund ", "Lärm- und "), ("Dienstleistungsund ", "Dienstleistungs- und "),
                ("VerbrauchsenergiekennwertGrenzen", "Verbrauchsenergiekennwert-Grenzen")]


def join_lines(lines):
    out = ""
    for ln in (x.strip() for x in lines):
        if not ln:
            continue
        if not out:
            out = ln
        elif out.endswith("/") or (out.endswith("-") and not re.match(r"^(und|oder)\b", ln)):
            out += ln
        else:
            out += " " + ln
    for a, b in HYPHEN_FIXES:
        out = out.replace(a, b)
    return out


SKIP = re.compile(r"^(BERLINER MIETSPIEGEL \d+|Wohnwert(mindernde|erhöhende) Merkmale.*|Fortsetzung.*|\d+|"
                  r"11\. Orientierungshilfe.*)$")


def parse_boxes(year):
    """Blocks in reading order: [(group heading, [item text, …]), …]."""
    blocks, cur, item = [], None, None
    for line in pdftotext(year, 24, 26, layout=False).split("\n"):
        s = line.replace("\f", "").strip()
        if not s or SKIP.match(s):
            continue
        if re.match(r"^Merkmalgruppe \d: ", s):
            if item is not None:
                cur[1].append(join_lines(item))
                item = None
            cur = (s, [])
            blocks.append(cur)
        elif s.startswith("☐"):
            if item is not None:
                cur[1].append(join_lines(item))
            item = [s[1:]]
        elif item is not None:
            item.append(s)
    if item is not None:
        cur[1].append(join_lines(item))
    return blocks


ENERGY = {
    2026: {
        "minus": ["Unzureichende Wärmedämmung oder Heizanlage mit ungünstigem Wirkungsgrad "
                  "(Einbau/Installation der Heizanlage vor 1995)",
                  "(End-)Energieverbrauchskennwert größer als 145 kWh/(m²a)",
                  "(End-)Energieverbrauchskennwert größer als 195 kWh/(m²a)",
                  "(End-)Energieverbrauchskennwert größer als 235 kWh/(m²a)"],
        "plus": ["Wärmedämmung zusätzlich zur vorhandenen Bausubstanz oder Einbau/Installation einer "
                 "modernen Heizanlage ab 2009 (wenn Bezugsfertigkeit des Gebäudes/der Wohnung vor diesem "
                 "Zeitpunkt)",
                 "(End-)Energieverbrauchskennwert kleiner als 120 kWh/(m²a)",
                 "(End-)Energieverbrauchskennwert kleiner als 100 kWh/(m²a)",
                 "(End-)Energieverbrauchskennwert kleiner als 80 kWh/(m²a)"],
        "notes": [
            "Die (End-)Energieverbrauchskennwerte beziehen sich auf Energie für Heizung und Warmwasser.",
            "Für die Einordnung eines Endenergiebedarfskennwertes sind die oben angegebenen "
            "Verbrauchsenergiekennwert-Grenzen um 20 % zu erhöhen.",
            "Für Kennwerte ohne Berücksichtigung der dezentralen Warmwasserversorgung sind vor der "
            "Eingruppierung 20 kWh/(m²a) auf den (End-)Energiekennwert aufzuschlagen.",
        ],
    },
    2024: {
        "minus": ["Unzureichende Wärmedämmung oder Heizanlage mit ungünstigem Wirkungsgrad "
                  "(Einbau/Installation der Heizanlage vor 1995)",
                  "Energieverbrauchskennwert größer als 145 kWh/(m²a)",
                  "Energieverbrauchskennwert größer als 195 kWh/(m²a)",
                  "Energieverbrauchskennwert größer als 235 kWh/(m²a)"],
        "plus": ["Wärmedämmung zusätzlich zur vorhandenen Bausubstanz oder Einbau/Installation einer "
                 "modernen Heizanlage ab 2009 (wenn Bezugsfertigkeit des Gebäudes/der Wohnung vor diesem "
                 "Zeitpunkt)",
                 "Energieverbrauchskennwert kleiner als 120 kWh/(m²a)",
                 "Energieverbrauchskennwert kleiner als 100 kWh/(m²a)",
                 "Energieverbrauchskennwert kleiner als 80 kWh/(m²a)"],
        "notes": [
            "Die Energieverbrauchskennwerte beziehen sich auf Energie für Heizung und Warmwasser.",
            "Für die Einordnung eines Endenergiebedarfskennwertes sind die oben angegebenen "
            "Verbrauchsenergiekennwert-Grenzen um 20 % zu erhöhen.",
            "Für dezentrale Warmwasserversorgung sind vor der Eingruppierung 20 kWh/(m²a) auf den "
            "ausgewiesenen Energiekennwert aufzuschlagen.",
        ],
    },
}
DENKMAL = ("Bei Wohnungen, die in denkmalgeschützten Gebäuden gelegen sind, werden die wohnwertmindernden "
           "Merkmale zur energetischen Beschaffenheit dann nicht berücksichtigt, wenn die Umsetzung von "
           "energetischen Sanierungen gegen denkmalschutzrechtliche Belange verstoßen würde oder deren "
           "Umsetzung durch denkmalschutzrechtliche Auflagen unverhältnismäßig (teuer) wäre.")
LAERM_FOOTNOTE = ("Hinweise auf bestehende Lärmbelastung von Wohngebäuden werden durch die Senatsverwaltung "
                  "für Mobilität, Verkehr, Klimaschutz und Umwelt bereitgestellt. Die Strategischen Lärmkarten "
                  "mit einer gebäudescharfen Darstellung der Fassadenpegel an lärmbeeinflussten Wohngebäuden "
                  "sind auf der Internetseite dieser Senatsverwaltung veröffentlicht. "
                  "www.berlin.de/sen/uvk/umwelt/laerm/laermminderungsplanung-berlin/laermkarten/")

# Feature ids are stable concepts across both years. 2026 is numbered in official order;
# 2024 reuses the 2026 id of the same item; 2024-only items get new numbers.
IDS_2024_OVERRIDE = {
    ("umfeld", -1): ["umfeld-m04", "umfeld-m01", "umfeld-m02", "umfeld-m03"],
    ("umfeld", 1): ["umfeld-p05", "umfeld-p01", "umfeld-p02", "umfeld-p03", "umfeld-p04"],
}

# Scope notes copied verbatim out of the item text (regex patterns, applied in this order).
COND_PATTERNS = [
    r"^Bei Erdgeschosswohnung:",
    r"^Wohngebäude/Wohnungen die vor 2002 bezugsfertig geworden sind:",
    r"\(gilt [^)]*\)",
    r"Kinderspielplatz – bei Bezugsfertigkeit des Gebäudes vor \d{4}",
    r"; gilt nicht für [^\[]*?(?= \[|$)",
    r"; gilt für die Baualtersklassen bis einschließlich 2015",
    r"; (?:sofern|falls) [^\[]*?alle Baujahre",
    r"\(jeweils Einbau ab 2002\)",
    r"\(Einbau ab 2002\)",
    r"\(wenn Bezugsfertigkeit des Gebäudes/der Wohnung vor diesem Zeitpunkt\)",
    r"\(Einbau/Installation der Heizanlage vor 1995\)",
    r"\[bezieht sich[^\]]*\]",
]


def conditions(text):
    found = {}
    for pat in COND_PATTERNS:
        for m in re.finditer(pat, text):
            found.setdefault(m.group(0).lstrip("; ").strip(), m.start())
    return " · ".join(sorted(found, key=found.get))


def later(year, first):
    """Baualter ids from `first` (inclusive) to the newest class of that year."""
    ids = [b for b in BAUALTER[year] if b not in ("1973_1990o",)]
    return ids[ids.index(first):]


def baualter_excluded(year, fid):
    """Only where the official note is unambiguous; otherwise None (see conditions_de)."""
    newest_2016 = "2016_2019" if year == 2026 else "2016_2022"
    rules = {
        "bad-m08": ["1973_1990o"],
        "bad-m10": ["1973_1990o"],
        "bad-p07": later(year, "2010_2015") if year == 2026 else ["2016_2022"],
        "kueche-p01": later(year, "2010_2015"),
        "kueche-p04": later(year, "2002_2009"),
        "wohnung-p05": later(year, "1991_2001"),
        "wohnung-p10": later(year, "2002_2009"),
        "gebaeude-m06": ["bis1918", "1919_1949"],
        "gebaeude-p04": later(year, newest_2016),
        "gebaeude-p06": later(year, "2010_2015"),
    }
    return rules.get(fid)


# Scope notes that are ambiguous or apply to only one part of an item: no hard exclusion,
# instead `note_de` = the verbatim official fragment so the UI can ask the user (reviews A F-17, B F13/F14).
NOTE_PATTERNS = {
    "bad-p08": r"\(gilt nicht für die Baualtersklassen ab 2002\)",
    "bad-p09": r"\(gilt für (?:die )?Baualtersklassen bis einschließlich 2001\); "
               r"(?:sofern zusätzlich|falls) elektrisch betreibbar: alle Baujahre",
    "wohnung-m08": r"Bei Erdgeschosswohnung",
    "gebaeude-p08": r"Einbau/Installation einer modernen Heizanlage ab 2009 "
                    r"\(wenn Bezugsfertigkeit des Gebäudes/der Wohnung vor diesem Zeitpunkt\)",
    "umfeld-p02": r"Kinderspielplatz – bei Bezugsfertigkeit des Gebäudes vor \d{4}",
}
DENKMAL_NOTE_IDS = ("gebaeude-m08", "gebaeude-m09", "gebaeude-m10", "gebaeude-m11")


def note(fid, text):
    if fid in DENKMAL_NOTE_IDS:
        return DENKMAL
    pat = NOTE_PATTERNS.get(fid)
    if pat is None:
        return None
    m = re.search(pat, text)
    assert m, (fid, text)
    return m.group(0)


def build_features(year):
    blocks = parse_boxes(year)
    by_group = {gid: {-1: [], 1: []} for gid, _ in GROUPS}
    seen = {}
    for heading, items in blocks:
        gid = next(g for g, label in GROUPS if heading == label)
        n = seen.get(gid, 0)
        seen[gid] = n + 1
        if gid == "gebaeude" and n >= 2:
            # PDF page 26: continuation block; the energy box is handled from ENERGY below.
            items = [t for t in items if t.startswith("Schwellenarmer Zugang")]
            sign = 1
        else:
            sign = -1 if n % 2 == 0 else 1
        if gid == "umfeld" and sign == 1 and items:
            items[-1] = items[-1].split(" * Hinweise")[0]
        by_group[gid][sign].extend(items)
    by_group["gebaeude"][-1].extend(ENERGY[year]["minus"])
    by_group["gebaeude"][1].extend(ENERGY[year]["plus"])

    groups = []
    for gid, label in GROUPS:
        feats = []
        for sign in (-1, 1):
            texts = by_group[gid][sign]
            ids = IDS_2024_OVERRIDE.get((gid, sign)) if year == 2024 else None
            if ids is None:
                ids = [f"{gid}-{'m' if sign < 0 else 'p'}{i:02d}" for i in range(1, len(texts) + 1)]
            assert len(ids) == len(texts), (year, gid, sign, len(ids), len(texts))
            for fid, text in zip(ids, texts):
                f = {"id": fid, "sign": sign, "text_de": text, "conditions_de": conditions(text)}
                excl = baualter_excluded(year, fid)
                if excl:
                    f["baualter_excluded"] = excl
                n = note(fid, text)
                if n:
                    f["note_de"] = n
                if gid == "gebaeude":
                    k = re.search(r"(größer|kleiner) als (\d+) kWh", text)
                    is_energy = text in ENERGY[year]["minus"] + ENERGY[year]["plus"]
                    if is_energy:
                        f["excl"] = {"set": "energie_minus" if sign < 0 else "energie_plus",
                                     "part": "kennwert" if k else "daemmung"}
                        if k:
                            f["kwh_gt" if k.group(1) == "größer" else "kwh_lt"] = int(k.group(2))
                if fid == "umfeld-m01":
                    f["footnote_de"] = LAERM_FOOTNOTE
                feats.append(f)
        g = {"id": gid, "label_de": label, "features": feats}
        if gid == "gebaeude":
            g["notes_de"] = ENERGY[year]["notes"] + [DENKMAL,
                                                     "Beispiele zum Umgang mit den Merkmalen: siehe unter Nr. 10.4"]
        groups.append(g)
    return groups


# ---------------------------------------------------------------- prose (verbatim, Nr. 9.4 / 10)
RULES = {2026: """10. Zum Umgang mit den ausgewiesenen Preisspannen

Die im Mietspiegel ausgewiesenen Spannen sind erforderlich, weil Wohnungen über die in der Tabelle ausgewiesenen Merkmale Baujahr, Größe, Lage und Ausstattung hinaus weitere Unterschiede aufweisen können. In der weit überwiegenden Zahl der Fälle können die besonderen Nachteile und Vorteile einer Wohnung im Rahmen der Spannen des Mietspiegels durch Merkmale der »Orientierungshilfe für die Spanneneinordnung« (siehe Nr. 11) berücksichtigt werden. Mängel bei der Standardausstattung können durch andere Ausstattungen ausgeglichen werden. Die Miethöhe kann zudem von weiteren Merkmalen abhängig sein, die in der Tabelle nicht ausgewiesen sind (siehe auch Erläuterungen zu Nr. 10.1).

Es wird zur Berücksichtigung dieser Merkmale bei der Ermittlung der ortsüblichen Vergleichsmiete deshalb die nachfolgende »Orientierungshilfe für die Spanneneinordnung« als Schätzgrundlage empfohlen; sie gehört allerdings nicht zum qualifizierten Teil dieses Mietspiegels (siehe BGH, Urteil vom 20.04.2005 – VIII ZR 110/04, wiederholt etwa im Urteil vom 18.11.2020 – VIII ZR 123/20).

Diese Orientierungshilfe berücksichtigt dabei bisherige Erkenntnisse, die sowohl von der Praxis für die Einigung der Vertragsparteien als auch von vielen Berliner Gerichten für ihre Entscheidungen zugrunde gelegt worden sind, aber auch neuere Entwicklungen.

10.1 Merkmale der Orientierungshilfe

Das Annäherungsschema (siehe Nr. 11) nennt in den fünf Merkmalgruppen »Bad/WC/Gäste-WC«, »Küche«, »Wohnung«, »Gebäude« und »Wohnumfeld« wohnwerterhöhende bzw. wohnwertmindernde Merkmale. Je nach Häufung dieser Merkmale liegt die ortsübliche Vergleichsmiete unter oder über dem Mittelwert.

Die Aufzählung in der Orientierungshilfe berücksichtigt nach den Erfahrungen der Mitglieder der Arbeitsgruppe Mietspiegel die wesentlichen Merkmale. Es können aber in Einzelfällen weitere ebenfalls gewichtige Merkmale im Rahmen der Merkmalgruppen zum Tragen kommen.

10.2 Energetischer Zustand der Wohngebäude

Die Umgestaltung des Wohngebäudebestandes unter energetischen Gesichtspunkten wird immer wichtiger. Zudem gewinnen die Kosten von Heizungs- und Warmwasserversorgungsanlagen bei der Bewertung von Wohnraum für die Mieterinnen und Mieter zunehmend an Bedeutung.

Der Berliner Mietspiegel 2026 trägt der Entwicklung der Energiekosten durch die Einbeziehung eines abgestuften Energiekennwertes Rechnung. Die Einbeziehung des energetischen Zustands in das Wertungssystem der Orientierungshilfe berücksichtigt sowohl die unterschiedlichen Energiekennwerte, die sich für ein Wohngebäude aus dezentraler oder zentraler Warmwasserversorgung ergeben, als auch Umsetzungshindernisse für energetische Sanierungsmaßnahmen, die sich aus denkmalschutzrechtlichen Vorgaben ableiten.

Das gestufte Wertungssystem (je geringer der Energieverbrauch ist, umso stärker soll sich dies wohnwerterhöhend auswirken – je mehr Energieverbrauch, umso stärker soll sich dies wohnwertmindernd auswirken) bietet ein transparentes, leicht nachvollziehbares Instrument auf der Basis von objektiven Energiekennwerten.

10.3 Ermittlung der ortsüblichen Vergleichsmiete und der Spanneneinordnung

Folgende Spanneneinordung mittels der Orientierungshilfe wird empfohlen:

Die wohnwerterhöhenden oder wohnwertmindernden Merkmale sind in der Mietspiegeltabelle nicht gesondert ausgewiesen. Sie können aber die ortsübliche Vergleichsmiete innerhalb der Spanne – ausgehend vom Mittelwert positiv oder negativ – mit jeweils 20 Prozent für folgende Merkmalgruppen beeinflussen:

— Die Ausstattung des Bades/WC/Gäste-WC 20 %
— Die Ausstattung der Küche 20 %
— Die Ausstattung der Wohnung 20 %
— Die Ausstattung des Gebäudes 20 %
— Das Wohnumfeld 20 %
100 %

Überwiegen in einer Merkmalgruppe die wohnwerterhöhenden Merkmale, ist ein Zuschlag von 20 Prozent des Unterschiedsbetrages zwischen Mittelwert und Spannenoberwert gerechtfertigt. Überwiegen die wohnwertmindernden Merkmale in einer Merkmalgruppe, ist ein Abzug von 20 Prozent des Unterschiedsbetrages zwischen Mittelwert und Spannenunterwert angemessen. In gleicher Weise ist mit jeder anderen Merkmalgruppe zu verfahren. Das Überwiegen der Merkmale innerhalb einer Merkmalgruppe ergibt sich durch einfache Überzahl.

Die fünf Merkmalgruppen werden gegeneinander aufgerechnet!

Auf dieser Basis ist zunächst die Differenz zwischen dem ausgewiesenen Mittelwert und dem errechneten Spannenwert nach der Orientierungshilfe zu berechnen.

Überwiegen in allen fünf Merkmalgruppen die wohnwerterhöhenden Merkmale, liegt die ortsübliche Vergleichsmiete am oberen Spannenwert. Überwiegen in allen fünf Kategorien die wohnwertmindernden Merkmale, liegt die ortsübliche Vergleichsmiete am unteren Spannenwert.

10.4 Beispiele

A) Umgang mit den Merkmalen zur Berücksichtigung des energetischen Zustandes von Gebäuden in der Merkmalgruppe »Gebäude«

Bei den wohnwertmindernden Merkmalen ist es nur möglich, entweder das Merkmal »Unzureichende Wärmedämmung oder Heizanlage mit ungünstigem Wirkungsgrad (Einbau/Installation vor 1995)« oder ein bzw. mehrere Merkmale zum »Energieverbrauchskennwert« anzukreuzen. Analog gilt dies auch bei den wohnwerterhöhenden Merkmalen: entweder das Merkmal »Wärmedämmung zusätzlich zur vorhandenen Bausubstanz oder Einbau/Installation einer modernen Heizanlage ab 2009 (wenn Bezugsfertigkeit des Gebäudes/der Wohnung vor diesem Zeitpunkt)« wird ausgewählt oder ein bzw. mehrere Merkmale zum »Energieverbrauchskennwert«. Wenn der »Energieverbrauchskennwert« ausgewählt wird, dann ist es möglich, ein, zwei oder drei Merkmale anzukreuzen – je nach der Höhe des vorliegenden Energiekennwertes. Liegt der »Energieverbrauchskennwert« z. B. bei 240 kWh/(m²a) können alle drei Kästchen als wohnwertminderndes Merkmal angekreuzt werden. Liegt er z. B. bei 90 kWh/(m²a) können die zwei oberen Kästchen als wohnwerterhöhendes Merkmal angekreuzt werden.

B) Anwendung der Orientierungshilfe für die Spanneneinordnung (siehe Nr. 11)

Merkmalgruppe | es überwiegen | daher +/-
1. Bad/WC/Gäste-WC | wohnwerterhöhende Merkmale | + 20 %
2. Küche | wohnwerterhöhende Merkmale | + 20 %
3. Wohnung | wohnwerterhöhende Merkmale | + 20 %
4. Gebäude | wohnwertmindernde Merkmale | - 20 %
5. Wohnumfeld | wohnwertmindernde Merkmale | - 20 %
Ergebnis | | + 20 %

Handelt es sich z. B. um eine Wohnung in mittlerer Wohnlage, zwischen 1919 und 1949 bezugsfertig geworden mit Sammelheizung, Bad und WC in der Wohnung, 60 m² groß (siehe Nr. 9.2. Mietspiegeltabelle mittlere Wohnlage, Zeile 81), dann ergeben sich folgende Werte:

Unterwert: 5,90 Euro | Mittelwert: 7,30 Euro | Oberwert: 9,55 Euro
< Spanne 1,40 Euro > | < Spanne 2,25 Euro >

Das Ergebnis von 20 Prozent, bezogen auf die obere Spanne von 2,25 Euro, sind 0,45 Euro. Die Anwendung der empfohlenen Orientierungshilfe ergäbe für diese Wohnung dann eine ortsübliche Vergleichsmiete von 7,75 Euro/m² monatlich (= 7,30 Euro/m² monatlich + 0,45 Euro/m² monatlich).""",
         2024: """10. Zum Umgang mit den ausgewiesenen Preisspannen

Die im Mietspiegel ausgewiesenen Spannen sind erforderlich, weil Wohnungen über die in der Tabelle ausgewiesenen Merkmale Alter, Größe, Lage und Ausstattung hinaus weitere Unterschiede aufweisen können. In der weit überwiegenden Zahl der Fälle können die besonderen Nachteile und Vorteile einer Wohnung im Rahmen der Spannen des Mietspiegels durch Merkmale der »Orientierungshilfe für die Spanneneinordnung« (siehe Nr. 11) berücksichtigt werden. Mängel bei der Standardausstattung können durch andere Ausstattungen ausgeglichen werden. Die Miethöhe kann zudem von weiteren Merkmalen abhängig sein, die in der Tabelle nicht ausgewiesen sind (siehe auch Erläuterungen zu Nr. 10.1).

Es wird zur Berücksichtigung dieser Merkmale bei der Ermittlung der ortsüblichen Vergleichsmiete deshalb die nachfolgende »Orientierungshilfe für die Spanneneinordnung« als Schätzgrundlage empfohlen; sie gehört allerdings nicht zum qualifizierten Teil dieses Mietspiegels werden (siehe BGH, Urteil vom 20.04.2005 – VIII ZR 110/04, zuletzt etwa wiederholt im Urteil vom 18.11.2020 – VIII ZR 123/20). Diese Orientierungshilfe berücksichtigt dabei bisherige Erkenntnisse, die sowohl von der Praxis für die Einigung der Vertragsparteien als auch von vielen Berliner Gerichten für ihre Entscheidungen zugrunde gelegt worden sind, aber auch neuere Entwicklungen.

10.1 Merkmale der Orientierungshilfe

Das Annäherungsschema (siehe Nr. 11) nennt in den fünf Merkmalgruppen »Bad/WC/Gäste-WC«, »Küche«, »Wohnung«, »Gebäude« und »Wohnumfeld« wohnwerterhöhende bzw. wohnwertmindernde Merkmale. Je nach Häufung dieser Merkmale liegt die ortsübliche Vergleichsmiete unter oder über dem Mittelwert.

Die Aufzählung in der Orientierungshilfe berücksichtigt nach den Erfahrungen der Mitglieder der Arbeitsgruppe Mietspiegel die wesentlichen Merkmale. Es können aber in Einzelfällen weitere ebenfalls gewichtige Merkmale im Rahmen der Merkmalgruppen zum Tragen kommen.

10.2 Energetischer Zustand der Wohngebäude

Die Umgestaltung des Wohngebäudebestandes unter energetischen Gesichtspunkten wird immer wichtiger. Zudem gewinnen die Kosten von Heizungs- und Warmwasserversorgungsanlagen bei der Bewertung von Wohnraum für die Mieter zunehmend an Bedeutung.

Der Berliner Mietspiegel 2024 trägt der Entwicklung der Energiekosten durch die Einbeziehung eines abgestuften Energiekennwertes Rechnung. Die Einbeziehung des energetischen Zustands in das Wertungssystem der Orientierungshilfe berücksichtigt sowohl die unterschiedlichen Energiekennwerte, die sich für ein Wohngebäude aus dezentraler oder zentraler Warmwasserversorgung ergeben, als auch Umsetzungshindernisse für energetische Sanierungsmaßnahmen, die sich aus denkmalschutzrechtlichen Vorgaben ableiten.

Das gestufte Wertungssystem (je geringer der Energieverbrauch ist, umso stärker soll sich dies wohnwerterhöhend auswirken – je mehr Energieverbrauch, umso stärker soll sich dies wohnwertmindernd auswirken) bietet ein transparentes, leicht nachvollziehbares Instrument auf der Basis von objektiven Energiekennwerten.

10.3 Ermittlung der ortsüblichen Vergleichsmiete und der Spanneneinordnung

Folgende Spanneneinordung mittels der Orientierungshilfe wird empfohlen:

Die wohnwerterhöhenden oder wohnwertmindernden Merkmale sind in der Mietspiegeltabelle nicht gesondert ausgewiesen. Sie können aber die ortsübliche Vergleichsmiete innerhalb der Spanne - ausgehend vom Mittelwert positiv oder negativ – mit jeweils 20 Prozent für folgende Merkmalgruppen beeinflussen:

— Die Ausstattung des Bades/WC/Gäste-WC 20 %
— Die Ausstattung der Küche 20 %
— Die Ausstattung der Wohnung 20 %
— Die Ausstattung des Gebäudes 20 %
— Das Wohnumfeld 20 %
100 %

Überwiegen in einer Merkmalgruppe die wohnwerterhöhenden Merkmale, ist ein Zuschlag von 20 Prozent des Unterschiedsbetrages zwischen Mittelwert und Spannenoberwert gerechtfertigt. Überwiegen die wohnwertmindernden Merkmale in einer Merkmalgruppe, ist ein Abzug von 20 Prozent des Unterschiedsbetrages zwischen Mittelwert und Spannenunterwert angemessen. In gleicher Weise ist mit jeder anderen Merkmalgruppe zu verfahren. Das Überwiegen der Merkmale innerhalb einer Merkmalgruppe ergibt sich durch einfache Überzahl.

Die fünf Merkmalgruppen werden gegeneinander aufgerechnet!

Auf dieser Basis ist zunächst die Differenz zwischen dem ausgewiesenen Mittelwert und dem errechneten Spannenwert nach der Orientierungshilfe zu berechnen.

Überwiegen in allen fünf Merkmalgruppen die wohnwerterhöhenden Merkmale, liegt die ortsübliche Vergleichsmiete am oberen Spannenwert. Überwiegen in allen fünf Kategorien die wohnwertmindernden Merkmale, liegt die ortsübliche Vergleichsmiete am unteren Spannenwert.

10.4 Beispiele

A) Umgang mit den Merkmalen zur Berücksichtigung des energetischen Zustandes von Gebäuden in der Merkmalgruppe »Gebäude«

Bei den wohnwertmindernden Merkmalen ist es nur möglich, entweder das Merkmal »Unzureichende Wärmedämmung oder Heizanlage mit ungünstigem Wirkungsgrad (Einbau/Installation der Heizanlage vor 1995)« oder ein bzw. mehrere Merkmale zum »Energieverbrauchskennwert« anzukreuzen. Analog gilt dies auch bei den wohnwerterhöhenden Merkmalen: entweder das Merkmal »Wärmedämmung zusätzlich zur vorhandenen Bausubstanz oder Einbau/Installation einer modernen Heizanlage ab 2009 (wenn Bezugsfertigkeit des Gebäudes/der Wohnung vor diesem Zeitpunkt)« wird ausgewählt oder ein bzw. mehrere Merkmale zum »Energieverbrauchskennwert«. Wenn der »Energieverbrauchskennwert« ausgewählt wird, dann ist es möglich, ein, zwei oder drei Merkmale anzukreuzen – je nach der Höhe des vorliegenden Energiekennwertes. Liegt der »Energieverbrauchskennwert« z.B. bei 240 kWh/(m²a) können alle drei Kästchen als wohnwertminderndes Merkmal angekreuzt werden. Liegt er z.B. bei 90 kWh/(m²a) können die zwei oberen Kästchen als wohnwerterhöhendes Merkmal angekreuzt werden.

B) Anwendung der Orientierungshilfe für die Spanneneinordnung (siehe Nr. 11)

Merkmalgruppe | es überwiegen | daher +/-
1. Bad/WC/Gäste-WC | wohnwerterhöhende Merkmale | + 20 %
2. Küche | wohnwerterhöhende Merkmale | + 20 %
3. Wohnung | wohnwerterhöhende Merkmale | + 20 %
4. Gebäude | wohnwertmindernde Merkmale | - 20 %
5. Wohnumfeld | wohnwertmindernde Merkmale | - 20 %
Ergebnis | | + 20 %

Handelt es sich z.B. um eine Wohnung in mittlerer Lage, zwischen 1919 und 1949 bezugsfertig geworden mit Sammelheizung, Bad und WC in der Wohnung, 60 m² groß (siehe Nr. 9.2. Mietspiegeltabelle mittlere Wohnlage, Zeile 63), dann ergeben sich folgende Werte:

Unterwert: 6,02 Euro | Mittelwert: 7,12 Euro | Oberwert: 9,19 Euro
< Spanne 1,10 Euro > | < Spanne 2,07 Euro >

Das Ergebnis von 20 Prozent, bezogen auf die obere Spanne von 2,07 Euro, sind (kaufmännisch gerundet) 0,41 Euro. Die Anwendung der empfohlenen Orientierungshilfe ergäbe für diese Wohnung dann eine ortsübliche Vergleichsmiete von 7,53 Euro/m² monatlich (= 7,12 Euro/m² monatlich + 0,41 Euro/m² monatlich)."""}

ABSCHLAG = {
    2026: {"eur_per_sqm": 0.33, "baualter": ["bis1918", "1919_1949"], "qualified": False,
           "text_de": "Für Wohnungen bezugsfertig bis 1949 ohne Sammelheizung und/oder ohne Bad, mit WC in der "
                      "Wohnung (IWC) liegt die ortsübliche Vergleichsmiete je Quadratmeter monatlich 0,33 Euro unter "
                      "den Beträgen der jeweils zutreffenden Zeile (nach Wohnlage, Bezugsfertigkeit und Wohnfläche).\n\n"
                      "Diese Angabe hat wegen der geringen Zahl an Mietwerten nur bedingte Aussagekraft. Dieser "
                      "Abschlag kann daher nicht dem Anwendungsbereich des qualifizierten Mietspiegels zugeordnet werden.",
           "source_de": "Nr. 9.4, PDF-Seite 21 (Druckseite 19)"},
    2024: {"eur_per_sqm": 0.45, "baualter": ["bis1918", "1919_1949", "1950_1964"], "qualified": False,
           "text_de": "Für Wohnungen bezugsfertig bis 1964\n- ohne Sammelheizung, ohne Bad, mit WC in der Wohnung "
                      "(IWC) oder\n- mit Sammelheizung oder mit Bad, mit WC in der Wohnung (IWC)\nliegt die "
                      "ortsübliche Vergleichsmiete je Quadratmeter monatlich 0,45 Euro unter den Beträgen der jeweils "
                      "zutreffenden Zeile (nach Wohnlage, Bezugsfertigkeit und Wohnungsgröße)\n\nDiese Angaben haben "
                      "wegen geringer Zahl an Mietwerten nur bedingte Aussagekraft. Diese Abschläge können daher nicht "
                      "dem Anwendungsbereich des qualifizierten Mietspiegels zugeordnet werden.",
           "source_de": "Nr. 9.4, PDF-Seite 21 (Druckseite 19)"},
}

TABLE_HEAD = {
    2026: "Ortsübliche Vergleichsmieten (Stichtag 01.09.2025) Nettokaltmiete in Euro je Quadratmeter monatlich "
          "für seitens der Vermieterin oder des Vermieters voll ausgestattete Wohnungen.",
    2024: "Ortsübliche Vergleichsmieten (Stichtag 01.09.2023) Netto-Kaltmiete in Euro je Quadratmeter monatlich "
          "für vermieterseitig voll ausgestattete Wohnungen.",
}
WENDE = {
    2026: "Die sogenannten „Wendewohnungen“ im Sinne dieses Mietspiegels sind die Wohnungen, die mit „DDR-Mitteln“ "
          "anfinanziert wurden und deren Baubeginn vor dem 03.10.1990 lag, die aber erst danach fertiggestellt "
          "wurden; für dies Wohnungen galten z. B. auch die Regelungen aus dem Mietenüberleitungsgesetz",
    2024: "Die sogenannten »Wendewohnungen« im Sinne dieses Mietspiegels sind die Wohnungen, die mit »DDR-Mitteln« "
          "anfinanziert wurden und deren Baubeginn vor dem 03.10.1990 lag, die aber erst danach fertiggestellt "
          "wurden; für diese Wohnungen galten z.B. auch die Regelungen aus dem Mietenüberleitungsgesetz.",
}

META = {
    2026: {"valid_from": "2026-05-28", "stichtag": "2025-09-01",
           "source_url": "https://mietspiegel.berlin.de/wp-content/uploads/2026/05/mietspiegel2026.pdf",
           "pages_de": "Tabellen Nr. 9.1–9.3: PDF-Seiten 17–21 (Druckseiten 15–19); Nr. 10: PDF-Seiten 22–23; "
                       "Orientierungshilfe Nr. 11: PDF-Seiten 24–26 (Druckseiten 22–24)"},
    2024: {"valid_from": "2024-05-30", "stichtag": "2023-09-01",
           "source_url": "https://mietspiegel.berlin.de/wp-content/uploads/2024/11/mietspiegel2024.pdf",
           "pages_de": "Tabellen Nr. 9.1–9.3: PDF-Seiten 17–21 (Druckseiten 15–19); Nr. 10: PDF-Seiten 22–23; "
                       "Orientierungshilfe Nr. 11: PDF-Seiten 24–26 (Druckseiten 22–24)"},
}


def build(year):
    rows, flaechen = parse_table(year)
    used = {r["baualter"] for r in rows}
    baualter = []
    for bid in BAUALTER[year]:
        assert bid in used, (year, bid)
        b = {"id": bid, "label_de": BAUALTER_LABEL[bid]}
        if bid.endswith("w"):
            b["region"] = "west"
        if bid == "1973_1990o":
            b["region"] = "ost"
            b["footnote_de"] = FOOT_OST
        if bid == "1991_2001":
            b["footnote_de"] = FOOT_9101
        baualter.append(b)
    for r in rows:
        del r["wohnlage"]
    pdf = SRC / f"mietspiegel{year}.pdf"
    data = {
        "year": year,
        "title_de": f"Berliner Mietspiegel {year}",
        **{k: META[year][k] for k in ("valid_from", "stichtag", "source_url")},
        "source_sha256": sha256(pdf),
        "source_pages_de": META[year]["pages_de"],
        "dims": {"baualter": baualter, "ausstattung": AUSSTATTUNG, "flaeche": flaechen, "wohnlage": WOHNLAGEN},
        "table": rows,
        "abschlag": ABSCHLAG[year],
        "groups": build_features(year),
        "rules_de": RULES[year],
        "notes_de": [
            TABLE_HEAD[year],
            "* " + FOOT_OST,
            "** " + FOOT_9101,
            WENDE[year],
        ],
    }
    return data


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for year in (2026, 2024):
        data = build(year)
        path = OUT / f"ms{year}.json"
        path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        nf = sum(len(g["features"]) for g in data["groups"])
        print(f"{path.relative_to(ROOT)}: {len(data['table'])} rows, {nf} features")


if __name__ == "__main__":
    main()
