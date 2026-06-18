"""Copy + optimize landing assets from references/assets and docs/screenshots.

Run from repo root: python scripts/prep-landing-assets.py
"""
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "references" / "assets"
SHOTS = ROOT / "docs" / "screenshots"
OUT = ROOT / "landing" / "src" / "assets"
(OUT / "agents").mkdir(parents=True, exist_ok=True)
(OUT / "shots").mkdir(parents=True, exist_ok=True)

MASCOTS = {
    "image1.png": ("hero-mascot.png", 560),
    "image2.png": ("mascot-search.png", 460),
    "iamge3.png": ("mascot-progress.png", 560),
    "iamge4.png": ("mascot-offer.png", 460),
    "image6.png": ("mascot-submitted.png", 560),
    "image3.png": ("mascot-working.png", 360),
    "faces.png": ("journey-strip.png", 1600),
}

for src_name, (out_name, max_w) in MASCOTS.items():
    im = Image.open(SRC / src_name)
    if im.width > max_w:
        ratio = max_w / im.width
        im = im.resize((max_w, int(im.height * ratio)), Image.LANCZOS)
    im.save(OUT / out_name, optimize=True)
    print(out_name, im.size)

SLUGS = ["job-search", "job-analysis", "cv-creation", "application-writer",
         "connection-builder", "career-advisor", "manager"]
for i, slug in enumerate(SLUGS, start=1):
    im = Image.open(SRC / f"face{i}.png")
    im.thumbnail((200, 200), Image.LANCZOS)
    im.save(OUT / "agents" / f"{slug}.png", optimize=True)

for shot in SHOTS.glob("*.png"):
    im = Image.open(shot)
    if im.width > 1440:
        ratio = 1440 / im.width
        im = im.resize((1440, int(im.height * ratio)), Image.LANCZOS)
    im.save(OUT / "shots" / shot.name, optimize=True)
    print("shot:", shot.name, im.size)

print("done")
