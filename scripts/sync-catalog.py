"""
Refresh public/data/catalog from the WeaponPaints plugin data.

WeaponPaints ships the item lists the game server uses, but its image folder
lags behind game updates (e.g. the Dead Hand gloves and finishes have entries
but no renders). Any image missing from the WeaponPaints repo is filled from
ByMykel/CSGO-API, which serves Steam CDN renders.

Usage:  python scripts/sync-catalog.py
Run it after each CS2 update once WeaponPaints has updated its data files.
"""
import json
import pathlib
import urllib.request

WP_RAW = "https://raw.githubusercontent.com/Nereziel/cs2-WeaponPaints/main"
WP_TREE = "https://api.github.com/repos/Nereziel/cs2-WeaponPaints/git/trees/main?recursive=1"
BM_API = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en"
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "data" / "catalog"

# local file name -> WeaponPaints data file
FILES = {
    "skins": "skins_en.json",
    "gloves": "gloves_en.json",
    "agents": "agents_en.json",
    "music": "music_en.json",
    "collectibles": "collectibles_en.json",
    "keychains": "keychains_en.json",
    "stickers": "stickers_en.json",
}


def get_json(url):
    with urllib.request.urlopen(url, timeout=120) as r:
        return json.load(r)


def main():
    tree = get_json(WP_TREE)
    have = {e["path"].rsplit("/", 1)[-1] for e in tree["tree"] if e["path"].startswith("website/img/skins/")}

    # (weapon defindex, paint index) -> render, and collectible def_index -> render
    bm_skins = {
        (int(s["weapon"]["weapon_id"]), str(s["paint_index"])): s["image"]
        for s in get_json(f"{BM_API}/skins.json")
        if s.get("image") and s.get("weapon") and s.get("paint_index") is not None
    }
    bm_collectibles = {str(c["def_index"]): c["image"] for c in get_json(f"{BM_API}/collectibles.json") if c.get("image")}

    OUT.mkdir(parents=True, exist_ok=True)
    for name, source in FILES.items():
        items = get_json(f"{WP_RAW}/website/data/{source}")
        filled = unresolved = 0
        for item in items:
            image = item.get("image") or ""
            if not image or image.rsplit("/", 1)[-1] in have:
                continue
            if name in ("skins", "gloves"):
                replacement = bm_skins.get((int(item["weapon_defindex"]), str(item["paint"])))
            elif name == "collectibles":
                replacement = bm_collectibles.get(str(item["id"]))
            else:
                replacement = None
            if replacement:
                item["image"] = replacement
                filled += 1
            else:
                unresolved += 1
        (OUT / f"{name}.json").write_text(json.dumps(items, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        print(f"{name:13} {len(items):6} items  images filled: {filled:3}  still missing: {unresolved}")


if __name__ == "__main__":
    main()
