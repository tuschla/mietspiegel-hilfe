#!/usr/bin/env python3
"""Fetch the official Wohnlage address lists and build static/data/wohnlage-<year>.json.

Python 3 stdlib only.

Usage:
  python3 tools/build_wohnlage.py fetch [--raw DIR] [--year Y]   download from the WFS (network)
  python3 tools/build_wohnlage.py build [--raw DIR] [--year Y]   raw download → static/data (offline)
  python3 tools/verify_wohnlage.py      [--raw DIR] [--year Y]   check every raw address afterwards

DIR defaults to tools/src/wohnlage/ (git-ignored); --year may be repeated,
default both editions (2024, 2026).

Source: Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin,
"Wohnlagen nach Adressen zum Berliner Mietspiegel <year> – [WFS]",
Datenlizenz Deutschland – Zero – Version 2.0 (https://www.govdata.de/dl-de/zero-2-0).
  WFS 2.0.0  https://gdi.berlin.de/services/wfs/wohnlagenadr<year>
  typeName   wohnlagenadr<year>:wohnlagenadr<year>

`fetch` pages through GetFeature (outputFormat application/json,
sortBy=schluessel, 100 000 features per request) and writes
DIR/wohnlagenadr<year>-<nnn>.json plus DIR/fetch-<year>.json (start time,
endpoint, numberMatched, sha256 of every page). `build` refuses pages whose
sha256 differs.

Feature properties (DescribeFeatureType, all strings):
  schluessel  key                       not kept
  bezname     Bezirk                    kept per entry, for display
  plz         Postleitzahl              kept
  strasse     Straßenname               kept
  hnr         Hausnummer: zero-padded number plus optional capital letter
              ("006", "012A")           kept
  wol         Wohnlage einfach/mittel/gut   kept
  stadtteil   Ost/West (the Mietspiegel's split of Baualter 1973–1990)   kept
  plr_name    LOR Planungsraum          not kept
  geom        point, EPSG:25833         not kept

Output (compact JSON, one file per edition):
  {"edition", "title", "source", "licence", "fetched", "counts", "format",
   "wl": ["einfach", "mittel", "gut"], "st": ["Ost", "West"], "bez": [Bezirk, ...],
   "streets": [[strasse, plz, bezIndex, stIndex, runs], ...]}
One entry per (strasse, plz, bezname, stadtteil), sorted. `runs` is a string of
comma-separated tokens that lists every address of the entry exactly once:
  [w]N        one plain number            "12"
  [w]N-M      plain numbers N..M, step 1  "1-24"
  [w]N:M      plain numbers N..M, step 2  "1:41" (one side of the street)
  [w]NX       one number with suffix      "12A"
  [w]NX-Y     suffixes X..Y of number N   "12A-C" = 12A, 12B, 12C
The optional prefix w is e, m or g (einfach, mittel, gut) and sets the
Wohnlage of this token and all following ones; the first token always has
one. Tokens are grouped by Wohnlage, the most common one first.
Numbers outside the tokens do not exist in the official list.
"""
import argparse
import hashlib
import json
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "static" / "data"
DEFAULT_RAW = ROOT / "tools" / "src" / "wohnlage"
YEARS = (2024, 2026)
PAGE = 100000
WFS = "https://gdi.berlin.de/services/wfs/wohnlagenadr{y}"
DATASET = {
    2024: "https://daten.berlin.de/datensaetze/wohnlagen-nach-adressen-zum-berliner-mietspiegel-2024-wfs-eddbff85",
    2026: "https://daten.berlin.de/datensaetze/wohnlagen-nach-adressen-zum-berliner-mietspiegel-2026-wfs-809faebe",
}
METADATA = {
    2024: "https://gdi.berlin.de/geonetwork/geonetwork/api/records/eddbff85-7d58-37a3-9578-d68425654e24",
    2026: "https://gdi.berlin.de/geonetwork/geonetwork/api/records/809faebe-6fa8-4cf6-a1d9-e90b6fe8c490",
}
PUBLISHER = "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin"
LICENCE = {
    "id": "dl-de/zero-2-0",
    "name": "Datenlizenz Deutschland – Zero – Version 2.0",
    "url": "https://www.govdata.de/dl-de/zero-2-0",
    "text_de": "Jede Nutzung ist ohne Einschränkungen oder Bedingungen zulässig.",
}
WL = ["einfach", "mittel", "gut"]
WL_LETTER = {"einfach": "e", "mittel": "m", "gut": "g"}
ST = ["Ost", "West"]
FORMAT = ("streets: [strasse, plz, bez index, st index, runs]; runs: comma-separated tokens "
          "[w]N | [w]N-M (step 1) | [w]N:M (step 2) | [w]NX | [w]NX-Y (suffix letters X..Y); "
          "w = e/m/g sets the Wohnlage for this and the following tokens; see tools/build_wohnlage.py")


def fetch(raw: Path, year: int) -> None:
    raw.mkdir(parents=True, exist_ok=True)
    base = WFS.format(y=year)
    tn = f"wohnlagenadr{year}:wohnlagenadr{year}"
    pages, start, matched = [], 0, None
    started = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
    while True:
        q = urllib.parse.urlencode({
            "service": "WFS", "version": "2.0.0", "request": "GetFeature", "typeNames": tn,
            "outputFormat": "application/json", "sortBy": "schluessel",
            "count": PAGE, "startIndex": start,
        })
        url = f"{base}?{q}"
        for attempt in range(4):
            try:
                with urllib.request.urlopen(url, timeout=600) as r:
                    body = r.read()
                break
            except Exception as e:  # network hiccup: retry with backoff
                if attempt == 3:
                    raise
                print(f"  retry {start}: {e}", file=sys.stderr)
                time.sleep(5 * (attempt + 1))
        data = json.loads(body)
        n = len(data["features"])
        matched = data.get("totalFeatures", data.get("numberMatched", matched))
        name = f"wohnlagenadr{year}-{len(pages):03d}.json"
        (raw / name).write_bytes(body)
        pages.append({"file": name, "startIndex": start, "features": n, "sha256": hashlib.sha256(body).hexdigest()})
        print(f"  {year}: {name} {n} features (startIndex {start})")
        start += n
        if n < PAGE:
            break
    info = {
        "edition": year, "fetched": started, "endpoint": base, "typeName": tn,
        "numberMatched": matched, "features": start, "pages": pages,
    }
    (raw / f"fetch-{year}.json").write_text(json.dumps(info, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if matched is not None and int(matched) != start:
        sys.exit(f"{year}: numberMatched {matched} but {start} features downloaded")


def load_raw(raw: Path, year: int):
    """(fetch info, list of feature property dicts) of one edition; checks the page hashes."""
    info = json.loads((raw / f"fetch-{year}.json").read_text(encoding="utf-8"))
    rows = []
    for pg in info["pages"]:
        body = (raw / pg["file"]).read_bytes()
        if hashlib.sha256(body).hexdigest() != pg["sha256"]:
            sys.exit(f"{pg['file']}: sha256 differs from fetch-{year}.json")
        rows += [f["properties"] for f in json.loads(body)["features"]]
    if len(rows) != info["features"]:
        sys.exit(f"{year}: {len(rows)} features in the pages, fetch-{year}.json says {info['features']}")
    return info, rows


def split_hnr(hnr: str):
    """"012A" → (12, "A"); raises on anything else (the official list has no other forms)."""
    num, suf = hnr.rstrip("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), hnr.lstrip("0123456789")
    if not num.isdigit() or len(suf) > 1 or num + suf != hnr:
        raise ValueError(f"unexpected house number {hnr!r}")
    return int(num), suf


def plain_runs(nums):
    """Cover the set of plain numbers exactly with step-1 / step-2 runs (greedy, longest first)."""
    left, out = set(nums), []
    for x in sorted(nums):
        if x not in left:
            continue
        l1 = 1
        while x + l1 in left:
            l1 += 1
        l2 = 1
        while x + 2 * l2 in left:
            l2 += 1
        if l1 >= l2 and l1 > 1:
            out.append((x, x + l1 - 1, 1))
            left.difference_update(range(x, x + l1))
        elif l2 > 1:
            out.append((x, x + 2 * (l2 - 1), 2))
            left.difference_update(range(x, x + 2 * l2 - 1, 2))
        else:
            out.append((x, x, 1))
            left.discard(x)
    return out


def suffix_runs(pairs):
    """[(12, "A"), (12, "B"), (12, "C"), (14, "A")] → [(12, "A", "C"), (14, "A", "A")]."""
    out = []
    for n, s in sorted(pairs):
        if out and out[-1][0] == n and ord(out[-1][2]) + 1 == ord(s):
            out[-1] = (n, out[-1][1], s)
        else:
            out.append((n, s, s))
    return out


def encode(addrs):
    """addrs: {(number, suffix): wohnlage} of one entry → runs string."""
    by_wl = defaultdict(list)
    for key, wl in addrs.items():
        by_wl[wl].append(key)
    order = sorted(by_wl, key=lambda w: (-len(by_wl[w]), WL.index(w)))
    tokens = []
    for wl in order:
        keys = by_wl[wl]
        toks = []
        for a, b, step in plain_runs([n for n, s in keys if not s]):
            toks.append((a, f"{a}" if a == b else f"{a}{'-' if step == 1 else ':'}{b}"))
        for n, x, y in suffix_runs([(n, s) for n, s in keys if s]):
            toks.append((n, f"{n}{x}" if x == y else f"{n}{x}-{y}"))
        toks.sort(key=lambda t: t[0])
        toks[0] = (toks[0][0], WL_LETTER[wl] + toks[0][1])
        tokens += [t for _, t in toks]
    return ",".join(tokens)


def build(raw: Path, year: int) -> dict:
    info, rows = load_raw(raw, year)
    groups = defaultdict(dict)
    for r in rows:
        if r["wol"] not in WL or r["stadtteil"] not in ST:
            sys.exit(f"{year}: unexpected wol/stadtteil in {r}")
        key = (r["strasse"], r["plz"], r["bezname"], r["stadtteil"])
        hn = split_hnr(r["hnr"])
        if hn in groups[key]:
            sys.exit(f"{year}: duplicate address {key} {r['hnr']}")
        groups[key][hn] = r["wol"]
    bez = sorted({k[2] for k in groups})
    streets = [[s, plz, bez.index(b), ST.index(st), encode(groups[(s, plz, b, st)])]
               for s, plz, b, st in sorted(groups)]
    wl_count = Counter(r["wol"] for r in rows)
    return {
        "edition": year,
        "title": f"Wohnlagen nach Adressen zum Berliner Mietspiegel {year}",
        "source": {
            "publisher": PUBLISHER,
            "dataset": DATASET[year],
            "metadata": METADATA[year],
            "wfs": info["endpoint"],
            "typeName": info["typeName"],
        },
        "licence": LICENCE,
        "fetched": info["fetched"],
        "counts": {
            "addresses": len(rows),
            "entries": len(streets),
            "streets": len({s[0] for s in streets}),
            "tokens": sum(s[4].count(",") + 1 for s in streets),
            **{w: wl_count[w] for w in WL},
        },
        "format": FORMAT,
        "wl": WL,
        "st": ST,
        "bez": bez,
        "streets": streets,
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("cmd", choices=["fetch", "build"])
    ap.add_argument("--raw", type=Path, default=DEFAULT_RAW)
    ap.add_argument("--year", type=int, action="append", choices=YEARS)
    a = ap.parse_args()
    for y in a.year or YEARS:
        if a.cmd == "fetch":
            fetch(a.raw, y)
            continue
        data = build(a.raw, y)
        text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        # one entry per line keeps diffs readable at almost no cost
        text = text.replace(',"streets":[[', ',"streets":[\n[').replace("],[", "],\n[")
        path = OUT / f"wohnlage-{y}.json"
        path.write_text(text + "\n", encoding="utf-8")
        c = data["counts"]
        print(f"{path.relative_to(ROOT)}: {c['addresses']} addresses, {c['entries']} entries, "
              f"{c['streets']} street names, {c['tokens']} tokens, {path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
