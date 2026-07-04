# set.png（素材シート）から個々のアイコンを透過PNGとして切り出すワンショットスクリプト
import json
import os
from PIL import Image

SRC = os.path.join(os.path.dirname(__file__), "..", "set.png")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "sprites")
PAD = 6  # 各辺に足す余白(px)

# (name, category, label_ja, y0, x0, y1, x1)
ITEMS = [
    # 建物・施設
    ("gyusha_small", "building", "牛舎（小）", 134, 36, 247, 148),
    ("gyusha_large", "building", "牛舎（大）", 97, 188, 245, 364),
    ("shiryoko", "building", "飼料庫", 112, 405, 245, 557),
    ("silo", "building", "サイロ", 82, 609, 247, 685),
    ("taihisha", "building", "堆肥舎", 151, 745, 247, 894),
    ("wrap_wara", "building", "ラップ藁置き場", 133, 946, 242, 1132),
    ("sagyogoya", "building", "作業小屋", 124, 1185, 245, 1294),
    # 機械・車両
    ("keitora", "vehicle", "軽トラック", 342, 19, 431, 142),
    ("wheel_loader", "vehicle", "ホイールローダ", 330, 162, 429, 327),
    ("tractor", "vehicle", "トラクター", 330, 364, 431, 478),
    ("shiryo_mixer", "vehicle", "飼料ミキサー", 326, 516, 426, 628),
    ("buggy", "vehicle", "バギー", 350, 670, 424, 765),
    # 牛（成長段階）
    ("cow_newborn", "cow", "生まれたて", 385, 818, 425, 881),
    ("cow_2m", "cow", "子牛2ヶ月", 366, 900, 427, 971),
    ("cow_4m", "cow", "子牛4ヶ月", 359, 985, 427, 1064),
    ("cow_10m", "cow", "10ヶ月", 349, 1081, 431, 1179),
    ("cow_mother", "cow", "母牛", 329, 1180, 430, 1320),
    # 環境・装飾
    ("tree_large", "env", "木（大）", 514, 8, 622, 146),
    ("tree_small", "env", "木（小）", 530, 181, 618, 247),
    ("rock", "env", "岩", 568, 290, 618, 350),
    ("kusamura", "env", "草むら", 555, 387, 617, 461),
    ("fence", "env", "柵", 550, 495, 614, 644),
    ("kanban", "env", "看板", 528, 687, 616, 775),
    ("keijiban", "env", "掲示板", 528, 831, 618, 936),
    ("mizunomiba", "env", "水飲み場", 557, 984, 614, 1080),
    ("ido", "env", "井戸", 509, 1124, 621, 1198),
    ("lamp", "env", "ランプ", 498, 1258, 621, 1297),
    # 地面・地形タイル
    ("tile_kusachi", "tile", "草地", 702, 13, 795, 112),
    ("tile_tochi", "tile", "土地", 702, 127, 795, 224),
    ("tile_bokujo_michi", "tile", "牧場の道", 698, 237, 795, 334),
    ("tile_ishidatami", "tile", "石畳", 698, 346, 795, 443),
    ("tile_saku_no_naka", "tile", "柵の中", 698, 456, 797, 555),
    ("tile_kusa_nagame", "tile", "草（長め）", 698, 565, 795, 663),
    ("tile_hatake", "tile", "畑", 698, 675, 795, 774),
    ("tile_doro", "tile", "道路", 698, 787, 795, 886),
    # その他オブジェクト
    ("kansoroll", "object", "乾草ロール", 716, 944, 794, 1028),
    ("kibako", "object", "木箱", 716, 1046, 795, 1127),
    ("mizutank", "object", "水タンク", 707, 1149, 797, 1216),
    ("masekitank", "object", "魔石タンク", 683, 1241, 798, 1306),
    # エフェクト・アイコン
    ("icon_mahou", "icon", "魔力アイコン", 902, 35, 959, 75),
    ("icon_taicho", "icon", "体調アイコン", 905, 122, 952, 170),
    ("icon_okane", "icon", "お金アイコン", 903, 213, 953, 261),
    ("icon_event", "icon", "イベント！", 897, 297, 953, 355),
    ("icon_kirakira", "icon", "キラキラ", 904, 393, 953, 441),
    ("icon_mahou_tsubu", "icon", "魔力の粒", 897, 483, 957, 526),
    # カーソル・マーカー
    ("cursor", "cursor", "カーソル", 905, 590, 961, 633),
    ("marker_destination", "cursor", "行き先マーカー", 911, 682, 954, 729),
    ("marker_facility", "cursor", "施設マーカー", 895, 785, 962, 829),
    # UIフレーム・枠
    ("ui_message_frame", "ui", "メッセージ枠", 894, 876, 975, 1031),
    ("ui_menu_panel", "ui", "メニューパネル", 883, 1036, 971, 1184),
    ("ui_button_example", "ui", "ボタン（例）", 913, 1197, 962, 1313),
    # 主人公（ドット）
    ("char_down", "char", "下向き", 1056, 34, 1129, 83),
    ("char_up", "char", "上向き", 1056, 128, 1129, 175),
    ("char_left", "char", "左向き", 1056, 219, 1129, 270),
    ("char_right", "char", "右向き", 1056, 312, 1129, 360),
    ("char_walk_down", "char", "歩行（下）", 1056, 406, 1129, 455),
    ("char_walk_left", "char", "歩行（左）", 1056, 497, 1129, 547),
    ("char_walk_right", "char", "歩行（右）", 1056, 591, 1129, 639),
]


def make_transparent(crop_rgb):
    """近似白を透過にする（しきい値付きソフトエッジ）"""
    crop_rgba = crop_rgb.convert("RGBA")
    px = crop_rgba.load()
    w, h = crop_rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            dist = (255 - r) + (255 - g) + (255 - b)
            if dist <= 10:
                alpha = 0
            elif dist >= 30:
                alpha = 255
            else:
                alpha = int((dist - 10) / 20 * 255)
            px[x, y] = (r, g, b, alpha)
    return crop_rgba


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    im = Image.open(SRC).convert("RGB")
    W, H = im.size
    manifest = []
    for name, category, label, y0, x0, y1, x1 in ITEMS:
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
            "category": category,
            "label_ja": label,
            "file": f"assets/sprites/{fname}",
            "width": crop_t.width,
            "height": crop_t.height,
        })
    with open(os.path.join(OUT_DIR, "..", "sprites_manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"done: {len(manifest)} sprites -> {OUT_DIR}")


if __name__ == "__main__":
    main()
