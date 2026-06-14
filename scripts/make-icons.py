"""Generate JobPilot app icons: violet rounded square + white paper plane.

Outputs app/public/jobpilot-{192,512}.png and landing/public/logo.png.
Run from repo root:  python scripts/make-icons.py
"""
from PIL import Image, ImageDraw
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SIZE = 1024

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# Vertical violet gradient on a rounded square
top, bottom = (124, 108, 237), (90, 75, 209)  # #7C6CED -> #5A4BD1
grad = Image.new("RGBA", (SIZE, SIZE))
gd = ImageDraw.Draw(grad)
for y in range(SIZE):
    t = y / SIZE
    gd.line(
        [(0, y), (SIZE, y)],
        fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bottom)) + (255,),
    )
mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, SIZE, SIZE], radius=SIZE // 4.5, fill=255)
img.paste(grad, (0, 0), mask)

# Paper plane: two white triangles with a subtle fold
d = ImageDraw.Draw(img)
cx, cy = SIZE * 0.52, SIZE * 0.50
plane = [
    (cx - 310, cy + 10),   # left tail
    (cx + 290, cy - 230),  # nose
    (cx - 40, cy + 250),   # bottom point
]
d.polygon(plane, fill=(255, 255, 255, 255))
fold = [
    (cx - 60, cy + 60),
    (cx + 290, cy - 230),
    (cx - 30, cy + 245),
]
d.polygon(fold, fill=(232, 229, 250, 255))
# amber spark, the brand secondary
d.ellipse(
    [SIZE * 0.70 - 38, SIZE * 0.74 - 38, SIZE * 0.70 + 38, SIZE * 0.74 + 38],
    fill=(245, 166, 35, 255),
)

out_app = ROOT / "app" / "public"
out_app.mkdir(parents=True, exist_ok=True)
img.resize((192, 192), Image.LANCZOS).save(out_app / "jobpilot-192.png")
img.resize((512, 512), Image.LANCZOS).save(out_app / "jobpilot-512.png")

out_landing = ROOT / "landing" / "public"
out_landing.mkdir(parents=True, exist_ok=True)
img.resize((256, 256), Image.LANCZOS).save(out_landing / "logo.png")
print("icons written")
