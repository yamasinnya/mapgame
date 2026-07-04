# mons.png（生き物素材シート）から個々のアイコンを透過PNGとして切り出す
import json
import os
from PIL import Image

SRC = os.path.join(os.path.dirname(__file__), "..", "mons.png")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "sprites_mons")
PAD = 6
BG = (243, 243, 243)

# (name, label_ja, y0, x0, y1, x1)
ITEMS = [
    ("cow_mother", "黒毛和牛 母牛", 202, 23, 433, 311),
    ("cow_10m", "黒毛和牛 10ヶ月", 250, 364, 434, 593),
    ("cow_4m", "黒毛和牛 子牛4ヶ月", 283, 632, 438, 828),
    ("cow_2m", "黒毛和牛 子牛2ヶ月（未登録）", 301, 875, 438, 1049),
    ("cow_newborn", "黒毛和牛 子牛 生まれたて（未登録）", 348, 1109, 439, 1263),
    ("karasu", "カラス", 690, 63, 894, 300),
    ("yamakagashi", "ヤマカガシ", 726, 387, 896, 599),
    ("nihon_nousagi", "ニホンノウサギ", 690, 706, 896, 891),
    ("kususan_youchu", "クスサン（幼虫）", 754, 975, 900, 1226),
]


def make_transparent(crop_rgb):
    crop_rgba = crop_rgb.convert("RGBA")
    px = crop_rgba.load()
    w, h = crop_rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            dist = abs(r - BG[0]) + abs(g - BG[1]) + abs(b - BG[2])
            if dist <= 8:
                alpha = 0
            elif dist >= 25:
                alpha = 255
            else:
                alpha = int((dist - 8) / 17 * 255)
            px[x, y] = (r, g, b, alpha)
    return crop_rgba


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    im = Image.open(SRC).convert("RGB")
    W, H = im.size
    manifest = []
    for name, label, y0, x0, y1, x1 in ITEMS:
        cy0 = max(0, y0 - PAD)
        cx0 = max(0, x0 - PAD)
        cy1 = min(H, y1 + PAD)
        cx1 = min(W, x1 + PAD)
        crop = im.crop((cx0, cy0, cx1, cy1))
        crop_t = make_transparent(crop)
        fname = f"{name}.png"
        crop_t.save(os.path.join(OUT_DIR, fname))
        manifest.append({
            "name": name,
            "label_ja": label,
            "file": f"assets/sprites_mons/{fname}",
            "width": crop_t.width,
            "height": crop_t.height,
        })
    with open(os.path.join(OUT_DIR, "..", "sprites_mons_manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"done: {len(manifest)} sprites -> {OUT_DIR}")


if __name__ == "__main__":
    main()
