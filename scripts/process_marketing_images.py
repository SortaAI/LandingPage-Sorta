"""
One-shot pipeline: crop browser chrome, polish, resize, export WebP for the marketing site.
Run from repo: python scripts/process_marketing_images.py
Requires: Pillow, source PNGs under SortaAI-1-Version/marketing-screenshots/
"""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(os.environ.get("SORTA_SCREENSHOT_SRC", r"c:\Users\idfke\Desktop\SortaAI-1-Version\marketing-screenshots"))
OUT = ROOT / "assets" / "screenshots"
OG_OUT = ROOT / "assets" / "og-image.jpg"


def inset_crop(im: Image.Image, left: float, top: float, right: float, bottom: float) -> Image.Image:
    w, h = im.size
    box = (
        int(w * left),
        int(h * top),
        int(w * (1.0 - right)),
        int(h * (1.0 - bottom)),
    )
    return im.crop(box)


def polish(im: Image.Image) -> Image.Image:
    im = im.convert("RGB")
    im = ImageOps.autocontrast(im, cutoff=0.8)
    im = ImageEnhance.Contrast(im).enhance(1.07)
    im = ImageEnhance.Color(im).enhance(1.05)
    im = ImageEnhance.Sharpness(im).enhance(1.12)
    return im


def fit_width(im: Image.Image, max_w: int) -> Image.Image:
    w, h = im.size
    if w <= max_w:
        return im
    nh = int(h * (max_w / w))
    return im.resize((max_w, nh), Image.Resampling.LANCZOS)


def save_webp(im: Image.Image, path: Path, quality: int = 88) -> tuple[int, int]:
    im.save(path, "WEBP", quality=quality, method=6)
    return im.size


def make_og(hero_path: Path) -> None:
    hero = Image.open(hero_path).convert("RGBA")
    hw, hh = hero.size
    scale = min(980 / hw, 520 / hh)
    nw, nh = int(hw * scale), int(hh * scale)
    hero = hero.resize((nw, nh), Image.Resampling.LANCZOS)

    w, h = hero.size
    rmask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(rmask)
    draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=18, fill=255)
    r, g, b, a = hero.split()
    hero = Image.merge("RGBA", (r, g, b, ImageChops.multiply(a, rmask)))

    bg = Image.new("RGB", (1200, 630), (5, 8, 72))
    px = bg.load()
    for y in range(630):
        t = y / 629
        r = int(4 + t * 28)
        g = int(2 + t * 14)
        b = int(55 + t * 85)
        for x in range(1200):
            px[x, y] = (r, g, b)

    x0 = (1200 - nw) // 2
    y0 = (630 - nh) // 2
    bg.paste(hero, (x0, y0), hero)

    OG_OUT.parent.mkdir(parents=True, exist_ok=True)
    bg.save(OG_OUT, "JPEG", quality=92, optimize=True, progressive=True)
    print("Wrote", OG_OUT)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # (filename, outfile stem, max_width, inset as fractions L,T,R,B)
    jobs: list[tuple[str, str, int, tuple[float, float, float, float]]] = [
        ("05_step3_form_fill_hero.png", "hero", 1680, (0.035, 0.068, 0.035, 0.038)),
        ("08_templates_panel.png", "step-templates", 1120, (0.032, 0.065, 0.032, 0.04)),
        ("03_step1_patient_lookup.png", "step-patient", 1120, (0.032, 0.065, 0.032, 0.04)),
        ("07_step3_pdf_export_moment.png", "step-pdf", 1120, (0.032, 0.065, 0.032, 0.04)),
        ("detail_07_sync_success_toast.png", "bento-sync", 880, (0.04, 0.06, 0.04, 0.12)),
        ("detail_02_patient_queue.png", "bento-queue", 640, (0.08, 0.07, 0.08, 0.06)),
    ]

    hero_processed: Path | None = None

    for fname, stem, max_w, inset in jobs:
        path = SRC / fname
        if not path.is_file():
            print("SKIP missing:", path)
            continue
        im = Image.open(path)
        im = inset_crop(im, *inset)
        im = polish(im)
        im = fit_width(im, max_w)
        out_path = OUT / f"{stem}.webp"
        w, h = save_webp(im, out_path)
        print(f"OK {stem}.webp {w}x{h}")
        if stem == "hero":
            hero_processed = out_path

    if hero_processed and hero_processed.is_file():
        make_og(hero_processed)
    else:
        print("No hero webp — skipped OG image")


if __name__ == "__main__":
    main()
