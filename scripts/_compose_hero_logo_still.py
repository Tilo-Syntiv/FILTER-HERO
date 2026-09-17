"""Build the homepage fly still from the official character sheet.

Knock out the white studio fill. Do not paint a navy plate — the hero CSS
chrome shows through so the flyer sits in the same sky as the header.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "client" / "public" / "hero" / "character-sheet.png"
OUT = ROOT / "client" / "public" / "hero" / "character-fly-still.png"
SCALE = 2.5


def knockout_white(rgb: np.ndarray) -> np.ndarray:
    r = rgb[..., 0].astype(np.int16)
    g = rgb[..., 1].astype(np.int16)
    b = rgb[..., 2].astype(np.int16)
    luma = (r + g + b) / 3
    spread = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    # Studio fill and the white anti-alias ring. Cape grid is icy (blue > red).
    studio = ((r > 246) & (g > 246) & (b > 246) & (np.abs(r - b) < 10)) | (
        (luma > 228) & (spread < 16)
    )
    alpha = np.where(studio, 0, 255).astype(np.uint8)
    rgba = np.dstack([rgb, alpha])
    return rgba


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"missing character sheet: {SRC}")
    src = Image.open(SRC).convert("RGB")
    rgba = knockout_white(np.array(src))
    cut = Image.fromarray(rgba, "RGBA")
    alpha = cut.getchannel("A")
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.4))
    cut.putalpha(alpha)
    bbox = cut.getbbox()
    if not bbox:
        raise SystemExit("character sheet knockout was empty")
    cut = cut.crop(bbox)
    w, h = cut.size
    cut = cut.resize((int(w * SCALE), int(h * SCALE)), Image.Resampling.LANCZOS)
    cut.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} {cut.size}")


if __name__ == "__main__":
    main()
