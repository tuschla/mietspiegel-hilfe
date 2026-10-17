#!/usr/bin/env python3
"""Check static/data/ms2026.json and ms2024.json (Python 3 stdlib only).

Usage: python3 tools/verify_data.py        exit code 0 = all checks passed

Spot-check values were read by eye off the rendered brochure pages
(pdftoppm, 110 dpi). Page numbers: "PDF n" = page n of the PDF file,
the printed page number is n − 2.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "static" / "data"
WOHNLAGEN = ("einfach", "mittel", "gut")
GROUP_IDS = ("bad", "kueche", "wohnung", "gebaeude", "umfeld")
ID_RE = re.compile(r"^(bad|kueche|wohnung|gebaeude|umfeld)-([mp])(\d\d)$")

# (year, row, wohnlage, lower, mean, upper, source)
SPOT = [
    (2026, 70, "mittel", 6.46, 8.49, 12.59, "given in assignment; PDF 18"),
    (2024, 55, "mittel", 5.79, 7.91, 11.50, "given in assignment; PDF 18"),
    (2026, 1, "einfach", 6.53, 9.58, 13.43, "PDF 17"),
    (2026, 46, "einfach", 5.11, 5.60, 6.00, "PDF 18"),
    (2026, 63, "einfach", 7.50, 10.38, 15.91, "PDF 18"),
    (2026, 81, "mittel", 5.90, 7.30, 9.55, "PDF 19; also Nr. 10.4 example, PDF 23"),
    (2026, 105, "mittel", 5.30, 5.89, 6.63, "PDF 19"),
    (2026, 127, "mittel", 10.78, 19.92, 24.04, "PDF 20"),
    (2026, 149, "gut", 7.49, 10.00, 12.78, "PDF 20"),
    (2026, 168, "gut", 5.26, 6.31, 9.65, "PDF 21"),
    (2026, 189, "gut", 10.28, 18.42, 23.49, "PDF 21"),
    (2024, 6, "einfach", 5.29, 6.96, 10.39, "PDF 17"),
    (2024, 33, "einfach", 5.03, 5.44, 6.11, "PDF 17"),
    (2024, 46, "einfach", 7.24, 9.98, 14.48, "PDF 18"),
    (2024, 63, "mittel", 6.02, 7.12, 9.19, "PDF 18; also Nr. 10.4 example, PDF 23"),
    (2024, 90, "mittel", 4.99, 5.37, 6.44, "PDF 19"),
    (2024, 113, "mittel", 10.22, 14.44, 21.93, "PDF 20"),
    (2024, 122, "gut", 6.09, 8.45, 12.55, "PDF 20"),
    (2024, 146, "gut", 6.11, 6.97, 8.48, "PDF 21"),
    (2024, 163, "gut", 12.22, 16.07, 18.47, "PDF 21"),
]

# (year, wohnlage, baualter, m², expected row, source) – lookups through the Wohnfläche classes.
LOOKUP = [
    (2026, "einfach", "bis1918", 80, 10, "worked example Nr. 8, PDF 16"),
    (2026, "gut", "1986_1990w", 65, 161, "worked example Nr. 8, PDF 16"),
    (2026, "mittel", "1919_1949", 60, 81, "worked example Nr. 10.4, PDF 23"),
    (2026, "mittel", "bis1918", 40, 70, "PDF 18 (lower bound inclusive)"),
    (2026, "mittel", "bis1918", 64.99, 70, "PDF 18 (upper bound exclusive)"),
    (2026, "mittel", "bis1918", 65, 71, "PDF 18"),
    (2026, "einfach", "2010_2015", 30, 63, "PDF 18 (alle Wohnflächen)"),
    (2024, "einfach", "bis1918", 80, 6, "worked example Nr. 8, PDF 16"),
    (2024, "gut", "1986_1990w", 65, 141, "worked example Nr. 8, PDF 16"),
    (2024, "mittel", "1919_1949", 60, 63, "worked example Nr. 10.4, PDF 23"),
    (2024, "mittel", "bis1918", 55, 55, "PDF 18"),
    (2024, "gut", "2016_2022", 120, 163, "PDF 21"),
]

# Nr. 10.4 B: all groups netted to +20 % → mean + 20 % of (upper − mean).
EXAMPLE_104 = [(2026, 81, 7.75), (2024, 63, 7.53)]

EXPECTED_FEATURES = {
    2026: {"bad": (10, 11), "kueche": (7, 7), "wohnung": (8, 11), "gebaeude": (11, 11), "umfeld": (3, 4)},
    2024: {"bad": (10, 11), "kueche": (7, 7), "wohnung": (7, 11), "gebaeude": (11, 11), "umfeld": (4, 5)},
}
EXPECTED_ROWS = {2026: 189, 2024: 163}
# Ambiguous or partial scope notes: verbatim `note_de` instead of a hard exclusion (reviews A F-17, B F13/F14).
_NOTE_COMMON = ("bad-p08", "bad-p09", "gebaeude-p08", "umfeld-p02",
                "gebaeude-m08", "gebaeude-m09", "gebaeude-m10", "gebaeude-m11")
NOTE_IDS = {2026: _NOTE_COMMON + ("wohnung-m08",), 2024: _NOTE_COMMON}

# (year, feature id, exact text_de, source) – read off the page images.
FEATURE_TEXT = [
    (2026, "umfeld-m02", "Besonders geruchsbelastete Lage", "PDF 26"),
    (2026, "gebaeude-m11", "(End-)Energieverbrauchskennwert größer als 235 kWh/(m²a)", "PDF 26"),
    (2026, "wohnung-m08", "Bei Erdgeschosswohnung: Kein Einbruchs- und/oder Sichtschutzsystem an allen Fenstern "
                          "der Wohnung (z. B. Gitter, Rollläden, Fensteralarm)", "PDF 25"),
    (2026, "bad-p06", "Fußbodenheizung [bezieht sich nicht auf Gäste-WCs]", "PDF 24"),
    (2024, "wohnung-p06", "Rollläden", "PDF 25"),
    (2024, "umfeld-m04", "Lage in stark vernachlässigter Umgebung", "PDF 26"),
    (2024, "umfeld-p05", "Bevorzugte Citylage (nahe repräsentativen, überregional ausstrahlenden Einkaufs-, "
                         "Dienstleistungs- und Wohnstandorten)", "PDF 26"),
    (2024, "gebaeude-p09", "Energieverbrauchskennwert kleiner als 120 kWh/(m²a)", "PDF 26"),
]


class Checker:
    def __init__(self):
        self.errors = []
        self.passed = 0

    def ok(self, cond, msg):
        if cond:
            self.passed += 1
        else:
            self.errors.append(msg)
        return cond


def is_num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def check_schema(c, year, d):
    p = f"ms{year}"
    for key, typ in (("year", int), ("title_de", str), ("valid_from", str), ("stichtag", str),
                     ("source_url", str), ("source_sha256", str), ("dims", dict), ("table", list),
                     ("groups", list), ("rules_de", str), ("notes_de", list), ("abschlag", dict)):
        c.ok(isinstance(d.get(key), typ), f"{p}: top-level {key!r} missing or not {typ.__name__}")
    c.ok(d.get("year") == year, f"{p}: year != {year}")
    for key in ("valid_from", "stichtag"):
        c.ok(bool(re.fullmatch(r"\d{4}-\d\d-\d\d", str(d.get(key)))), f"{p}: {key} not YYYY-MM-DD")
    c.ok(bool(re.fullmatch(r"[0-9a-f]{64}", str(d.get("source_sha256")))), f"{p}: source_sha256 not hex")
    c.ok(str(d.get("source_url", "")).startswith("https://"), f"{p}: source_url not https")
    c.ok(all(isinstance(n, str) and n for n in d.get("notes_de", [])), f"{p}: notes_de must be non-empty strings")
    c.ok(len(d.get("rules_de", "")) > 1000, f"{p}: rules_de suspiciously short")

    dims = d.get("dims", {})
    for dim in ("baualter", "ausstattung", "flaeche", "wohnlage"):
        items = dims.get(dim)
        if not c.ok(isinstance(items, list) and items, f"{p}: dims.{dim} missing"):
            continue
        ids = [i.get("id") for i in items]
        c.ok(len(ids) == len(set(ids)), f"{p}: dims.{dim} ids not unique")
        c.ok(all(isinstance(i.get("label_de"), str) and i["label_de"] for i in items),
             f"{p}: dims.{dim} label_de missing")
    c.ok([w["id"] for w in dims.get("wohnlage", [])] == list(WOHNLAGEN), f"{p}: wohnlage ids must be {WOHNLAGEN}")
    for f in dims.get("flaeche", []):
        c.ok(is_num(f.get("min")) and (f.get("max") is None or (is_num(f["max"]) and f["max"] > f["min"])),
             f"{p}: flaeche {f.get('id')} bad min/max")
    for b in dims.get("baualter", []):
        c.ok(b.get("region") in (None, "ost", "west"), f"{p}: baualter {b.get('id')} bad region")

    ab = d.get("abschlag", {})
    c.ok(is_num(ab.get("eur_per_sqm")) and ab["eur_per_sqm"] > 0, f"{p}: abschlag.eur_per_sqm")
    bids = {b["id"] for b in dims.get("baualter", [])}
    c.ok(set(ab.get("baualter", [])) <= bids and ab.get("baualter"), f"{p}: abschlag.baualter")
    c.ok(ab.get("qualified") is False, f"{p}: abschlag.qualified must be false")
    c.ok(isinstance(ab.get("text_de"), str) and str(ab.get("eur_per_sqm")).replace(".", ",") in ab["text_de"],
         f"{p}: abschlag.text_de must contain the amount")


def check_table(c, year, d):
    p = f"ms{year}"
    dims = d["dims"]
    ids = {k: {i["id"] for i in dims[k]} for k in ("baualter", "ausstattung", "flaeche")}
    rows = d["table"]
    c.ok(len(rows) == EXPECTED_ROWS[year], f"{p}: {len(rows)} rows, expected {EXPECTED_ROWS[year]}")
    nums = [r.get("row") for r in rows]
    c.ok(nums == list(range(1, len(rows) + 1)), f"{p}: row numbers not 1..N in order")
    for r in rows:
        rp = f"{p} row {r.get('row')}"
        for k in ("baualter", "ausstattung", "flaeche"):
            c.ok(r.get(k) in ids[k], f"{rp}: unknown {k} {r.get(k)!r}")
        cells = r.get("cells")
        if not c.ok(isinstance(cells, dict) and set(cells) == set(WOHNLAGEN),
                    f"{rp}: cells must have exactly the keys {WOHNLAGEN}"):
            continue
        filled = 0
        for w, cell in cells.items():
            if cell is None:
                continue
            filled += 1
            if not c.ok(isinstance(cell, dict) and all(is_num(cell.get(k)) for k in ("lower", "mean", "upper"))
                        and isinstance(cell.get("flags"), list), f"{rp} {w}: bad cell {cell!r}"):
                continue
            c.ok(0 < cell["lower"] <= cell["mean"] <= cell["upper"], f"{rp} {w}: not lower ≤ mean ≤ upper")
            c.ok(all(round(cell[k], 2) == cell[k] for k in ("lower", "mean", "upper")), f"{rp} {w}: > 2 decimals")
        c.ok(filled == 1, f"{rp}: expected exactly one Wohnlage cell, got {filled}")

    # Wohnfläche classes must partition [0, ∞) per (Wohnlage, Baualter) without gap or overlap.
    fl = {f["id"]: f for f in dims["flaeche"]}
    blocks = {}
    for r in rows:
        w = next(k for k, v in r["cells"].items() if v)
        blocks.setdefault((w, r["baualter"]), []).append(fl[r["flaeche"]])
    for (w, b), classes in blocks.items():
        classes = sorted(classes, key=lambda f: f["min"])
        edge = 0
        good = True
        for f in classes:
            good &= f["min"] == edge
            edge = f["max"]
            if edge is None:
                break
        good &= edge is None and classes[-1]["max"] is None
        c.ok(good, f"{p}: Wohnfläche classes for {w}/{b} do not partition [0, ∞): "
                   f"{[f['id'] for f in classes]}")
    c.ok({b for _, b in blocks} == ids["baualter"], f"{p}: some baualter has no rows")
    for w in WOHNLAGEN:
        c.ok({b for ww, b in blocks if ww == w} == ids["baualter"], f"{p}: {w} lacks some Baualter")


def lookup(d, wohnlage, baualter, area):
    fl = {f["id"]: f for f in d["dims"]["flaeche"]}
    hits = [r["row"] for r in d["table"]
            if r["cells"][wohnlage] and r["baualter"] == baualter
            and fl[r["flaeche"]]["min"] <= area and (fl[r["flaeche"]]["max"] is None or area < fl[r["flaeche"]]["max"])]
    return hits[0] if len(hits) == 1 else hits


def check_features(c, year, d):
    p = f"ms{year}"
    groups = d["groups"]
    c.ok([g.get("id") for g in groups] == list(GROUP_IDS), f"{p}: group ids/order must be {GROUP_IDS}")
    bids = {b["id"] for b in d["dims"]["baualter"]}
    all_ids = []
    for g in groups:
        gid = g.get("id")
        c.ok(isinstance(g.get("label_de"), str) and g["label_de"].startswith("Merkmalgruppe"),
             f"{p}: group {gid} label_de")
        feats = g.get("features", [])
        minus = [f for f in feats if f.get("sign") == -1]
        plus = [f for f in feats if f.get("sign") == 1]
        c.ok(len(minus) + len(plus) == len(feats), f"{p}: {gid} sign must be -1 or 1")
        exp = EXPECTED_FEATURES[year][gid]
        c.ok((len(minus), len(plus)) == exp, f"{p}: {gid} has {len(minus)}−/{len(plus)}+, expected {exp}")
        for f in feats:
            fid = f.get("id", "")
            all_ids.append(fid)
            m = ID_RE.match(fid)
            if not c.ok(bool(m), f"{p}: bad feature id {fid!r}"):
                continue
            c.ok(m.group(1) == gid, f"{p}: {fid} in group {gid}")
            c.ok((m.group(2) == "m") == (f.get("sign") == -1), f"{p}: {fid} sign does not match id")
            text = f.get("text_de")
            c.ok(isinstance(text, str) and len(text) >= 5 and "☐" not in text and "  " not in text,
                 f"{p}: {fid} text_de")
            cond = f.get("conditions_de")
            c.ok(isinstance(cond, str), f"{p}: {fid} conditions_de must be a string")
            for frag in filter(None, (cond or "").split(" · ")):
                c.ok(frag in text, f"{p}: {fid} condition fragment not verbatim in text_de: {frag!r}")
            if "note_de" in f:
                gnotes = g.get("notes_de", [])
                c.ok(isinstance(f["note_de"], str) and (f["note_de"] in text or f["note_de"] in gnotes),
                     f"{p}: {fid} note_de not verbatim in text_de or group notes_de")
                c.ok("baualter_excluded" not in f, f"{p}: {fid} has both note_de and baualter_excluded")
            if "baualter_excluded" in f:
                c.ok(set(f["baualter_excluded"]) <= bids and f["baualter_excluded"],
                     f"{p}: {fid} baualter_excluded invalid")
            if "excl" in f:
                e = f["excl"]
                c.ok(gid == "gebaeude" and e.get("part") in ("daemmung", "kennwert")
                     and e.get("set") == ("energie_minus" if f["sign"] < 0 else "energie_plus"),
                     f"{p}: {fid} excl invalid")
                c.ok((e.get("part") == "kennwert") == ("kwh_gt" in f or "kwh_lt" in f),
                     f"{p}: {fid} kennwert needs kwh_gt/kwh_lt")
                if "kwh_gt" in f:
                    c.ok(f["sign"] < 0 and f"größer als {f['kwh_gt']} kWh" in text, f"{p}: {fid} kwh_gt")
                if "kwh_lt" in f:
                    c.ok(f["sign"] > 0 and f"kleiner als {f['kwh_lt']} kWh" in text, f"{p}: {fid} kwh_lt")
    c.ok(len(all_ids) == len(set(all_ids)), f"{p}: feature ids not unique")
    feats = {f["id"]: f for g in groups for f in g["features"]}
    for fid in NOTE_IDS[year]:
        c.ok("note_de" in feats.get(fid, {}), f"{p}: {fid} needs note_de (ambiguous/partial scope)")
    for setname in ("energie_minus", "energie_plus"):
        parts = [f["excl"]["part"] for g in groups for f in g["features"] if f.get("excl", {}).get("set") == setname]
        c.ok(parts == ["daemmung", "kennwert", "kennwert", "kennwert"], f"{p}: {setname} parts {parts}")
    return set(all_ids)


def main():
    c = Checker()
    data = {}
    for year in (2026, 2024):
        path = DATA / f"ms{year}.json"
        try:
            data[year] = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as e:
            c.ok(False, f"{path}: cannot load: {e}")
            continue
        check_schema(c, year, data[year])
        check_table(c, year, data[year])
        check_features(c, year, data[year])

    if len(data) == 2:
        rows = {y: {r["row"]: r for r in data[y]["table"]} for y in data}
        for year, row, w, lo, mean, hi, src in SPOT:
            cell = rows[year].get(row, {}).get("cells", {}).get(w)
            c.ok(cell is not None and (cell["lower"], cell["mean"], cell["upper"]) == (lo, mean, hi),
                 f"spot ms{year} row {row} {w} ({src}): expected {lo}/{mean}/{hi}, got {cell}")
        for year, w, b, area, row, src in LOOKUP:
            got = lookup(data[year], w, b, area)
            c.ok(got == row, f"lookup ms{year} {w}/{b}/{area} m² ({src}): expected row {row}, got {got}")
        for year, row, expected in EXAMPLE_104:
            cell = next(v for v in rows[year][row]["cells"].values() if v)
            got = round(cell["mean"] + 0.2 * (cell["upper"] - cell["mean"]) + 1e-9, 2)
            c.ok(got == expected, f"Nr. 10.4 example ms{year} row {row}: expected {expected}, got {got}")
        feats = {y: {f["id"]: f for g in data[y]["groups"] for f in g["features"]} for y in data}
        for year, fid, text, src in FEATURE_TEXT:
            c.ok(feats[year].get(fid, {}).get("text_de") == text, f"feature text ms{year} {fid} ({src})")
        union = set(feats[2026]) | set(feats[2024])
        c.ok(len(union) == 85, f"union of feature ids is {len(union)}, expected 85")
        c.ok(set(feats[2026]) - set(feats[2024]) == {"wohnung-m08"}, "2026-only ids must be {wohnung-m08}")
        c.ok(set(feats[2024]) - set(feats[2026]) == {"umfeld-m04", "umfeld-p05"},
             "2024-only ids must be {umfeld-m04, umfeld-p05}")

    for e in c.errors:
        print("FAIL:", e)
    print(f"{c.passed} checks passed, {len(c.errors)} failed "
          f"({len(SPOT)} value spot checks, {len(LOOKUP)} row lookups, {len(FEATURE_TEXT)} feature texts)")
    return 1 if c.errors else 0


if __name__ == "__main__":
    sys.exit(main())
