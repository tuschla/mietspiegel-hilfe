#!/usr/bin/env python3
"""Check static/data/wohnlage-2024.json and -2026.json against the raw WFS download (stdlib only).

Usage: python3 tools/verify_wohnlage.py [--raw DIR] [--year Y]   exit code 0 = all checks passed

DIR is the folder written by `python3 tools/build_wohnlage.py fetch` (default
tools/src/wohnlage/). Per edition:
  1. header: edition, licence, fetch time and counts match the raw download;
  2. decode: the runs are decoded here independently of the encoder; the decoded
     address set must equal the raw one exactly (no missing, no extra address) and
     every address must carry the official wol, stadtteil and Bezirk;
  3. JS (needs `node`): every raw address goes through lookup() of
     static/js/lib/wohnlage.js with its PLZ (must be found with the official values,
     100 %), again typed loosely ("Str." for "Straße", lower-case suffix, no
     leading zeros, must give the same result), and without PLZ (counts of unique
     and ambiguous results are reported).
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from collections import Counter
from pathlib import Path

sys.dont_write_bytecode = True  # no tools/__pycache__ from the import below
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_wohnlage import DEFAULT_RAW, LICENCE, OUT, ROOT, YEARS, load_raw  # noqa: E402

TOKEN = re.compile(r"^([emg])?(\d+)([A-Z])?(?:([-:])(\d+|[A-Z]))?$")
LETTER = {"e": "einfach", "m": "mittel", "g": "gut"}

JS = r"""
import { readFileSync } from "node:fs";
import { prepare, lookup } from "%MODULE%";
const [data, addrs] = process.argv.slice(-2).map((f) => readFileSync(f, "utf8"));
const idx = prepare(JSON.parse(data));
const out = { n: 0, failCount: 0, fail: [], looseCount: 0, loose: [], noPlz: { unique: 0, ambiguousSame: 0, ambiguousDiffer: 0, wrong: [] } };
const miss = (kind, x) => { out[kind + "Count"]++; if (out[kind].length < 20) out[kind].push(x); };
for (const line of addrs.split("\n")) {
  if (!line) continue;
  const [street, plz, hnr, wol, st, bez] = line.split("\t");
  out.n++;
  const r = lookup(idx, street, hnr, plz);
  if (!(r.found && !r.ambiguous && r.wohnlage === wol && r.stadtteil === st && r.bezirk === bez && r.street === street && r.plz === plz))
    miss("fail", [line, r.wohnlage, r.notFound, r.candidates.length]);
  const typed = street.replace(/straße$/, "str.").replace(/Straße$/, "Str.");
  const r2 = lookup(idx, typed, hnr.replace(/^0+/, "").toLowerCase(), plz);
  if (!(r2.found && r2.wohnlage === wol && r2.street === street && r2.plz === plz))
    miss("loose", [line, typed, r2.wohnlage, r2.notFound]);
  const r3 = lookup(idx, street, hnr);
  if (!r3.ambiguous) r3.found && r3.wohnlage === wol ? out.noPlz.unique++ : out.noPlz.wrong.push(line);
  else if (r3.found) r3.wohnlage === wol ? out.noPlz.ambiguousSame++ : out.noPlz.wrong.push(line);
  else r3.candidates.some((c) => c.plz === plz && c.wohnlage === wol) ? out.noPlz.ambiguousDiffer++ : out.noPlz.wrong.push(line);
}
console.log(JSON.stringify(out));
"""


def decode(data):
    """{(strasse, plz, hnr like '012A'): (wol, stadtteil, bezname)} from the compact file."""
    out, dup = {}, 0
    for strasse, plz, bez, st, runs in data["streets"]:
        wl = None
        for tok in runs.split(","):
            m = TOKEN.match(tok)
            if not m:
                raise ValueError(f"bad token {tok!r} in {strasse} {plz}")
            if m[1]:
                wl = LETTER[m[1]]
            if wl is None:
                raise ValueError(f"no Wohnlage before {tok!r} in {strasse} {plz}")
            a = int(m[2])
            if m[3]:
                hnrs = [f"{a:03d}{chr(c)}" for c in range(ord(m[3]), ord(m[5] or m[3]) + 1)]
            else:
                b = int(m[5]) if m[5] else a
                if b < a:
                    raise ValueError(f"empty run {tok!r} in {strasse} {plz}")
                hnrs = [f"{n:03d}" for n in range(a, b + 1, 2 if m[4] == ":" else 1)]
            for h in hnrs:
                key = (strasse, plz, h)
                dup += key in out
                out[key] = (wl, data["st"][st], data["bez"][bez])
    return out, dup


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--raw", type=Path, default=DEFAULT_RAW)
    ap.add_argument("--year", type=int, action="append", choices=YEARS)
    a = ap.parse_args()
    node = shutil.which("node")
    failed = 0

    def check(name, ok, detail=""):
        nonlocal failed
        failed += not ok
        print(f"  {'ok  ' if ok else 'FAIL'}  {name}{'' if ok or not detail else ': ' + str(detail)}")

    for y in a.year or YEARS:
        print(f"\n{y}")
        info, rows = load_raw(a.raw, y)
        path = OUT / f"wohnlage-{y}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        c = data["counts"]
        check("header: edition, licence, fetch time", data["edition"] == y and data["licence"] == LICENCE
              and data["fetched"] == info["fetched"] and data["source"]["wfs"] == info["endpoint"])
        check(f"raw download complete: {len(rows)} = numberMatched {info['numberMatched']}",
              int(info["numberMatched"]) == len(rows))
        wl_count = Counter(r["wol"] for r in rows)
        check(f"counts: {c['addresses']} addresses, einfach {c['einfach']}, mittel {c['mittel']}, gut {c['gut']}",
              c["addresses"] == len(rows) and all(c[w] == wl_count[w] for w in ("einfach", "mittel", "gut")))

        dec, dup = decode(data)
        raw = {(r["strasse"], r["plz"], r["hnr"]): (r["wol"], r["stadtteil"], r["bezname"]) for r in rows}
        missing = [k for k in raw if k not in dec]
        extra = [k for k in dec if k not in raw]
        wrong = [k for k, v in raw.items() if k in dec and dec[k] != v]
        check("decode: no address listed twice", dup == 0, dup)
        check(f"decode: {len(dec)} addresses decoded, none missing", not missing, missing[:5])
        check("decode: no extra addresses", not extra, extra[:5])
        check(f"decode: Wohnlage, Stadtteil, Bezirk = official for all {len(raw)} addresses", not wrong, wrong[:5])

        if not node:
            print("  warn  node not found: JS lookup check skipped")
            continue
        with tempfile.TemporaryDirectory() as tmp:
            tsv = Path(tmp) / "addr.tsv"
            tsv.write_text("".join(f"{r['strasse']}\t{r['plz']}\t{r['hnr']}\t{r['wol']}\t{r['stadtteil']}\t{r['bezname']}\n"
                                   for r in rows), encoding="utf-8")
            script = Path(tmp) / "check.mjs"
            script.write_text(JS.replace("%MODULE%", (ROOT / "static/js/lib/wohnlage.js").as_uri()), encoding="utf-8")
            p = subprocess.run([node, str(script), str(path), str(tsv)], capture_output=True, text=True)
        if p.returncode:
            check("JS lookup ran", False, p.stderr[-2000:])
            continue
        r = json.loads(p.stdout)
        n = r["n"]
        check(f"JS lookup(street, hnr, plz): {n - r['failCount']} / {n} found with the official values",
              r["failCount"] == 0, r["fail"])
        check(f"JS lookup typed loosely (Str., 6 for 006, lower-case suffix): {n - r['looseCount']} / {n}",
              r["looseCount"] == 0, r["loose"])
        q = r["noPlz"]
        check(f"JS lookup without PLZ: {q['unique']} unique, {q['ambiguousSame']} in several PLZ with the same "
              f"Wohnlage, {q['ambiguousDiffer']} in several PLZ with different Wohnlagen (candidates include the "
              f"official one), 0 wrong", not q["wrong"], q["wrong"][:5])
    print(f"\n{'all checks passed' if not failed else f'{failed} checks FAILED'}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
