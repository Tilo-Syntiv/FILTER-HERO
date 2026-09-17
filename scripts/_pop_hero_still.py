"""Lift the Seedance fly still off the navy without changing the pose.

Sky is transparent so `.hero-cast-stage` (same chrome as header / marquee)
shows through. Reads tmp/character-fly-still-original.png.
Do not run this on the already-popped public file.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tmp" / "character-fly-still-original.png"
OUT = ROOT / "client" / "public" / "hero" / "character-fly-still.png"

HERO_RED = np.array([188, 46, 54], dtype=np.float32)
GRID = np.array([236, 244, 252], dtype=np.float32)
CAPE = np.array([86, 132, 188], dtype=np.float32)
PANTS = np.array([72, 112, 172], dtype=np.float32)


def residual_mask(rgb: np.ndarray) -> np.ndarray:
    bg_row = rgb[:, :28].mean(axis=1, keepdims=True)
    resid = np.linalg.norm(rgb - bg_row, axis=2)
    hard = Image.fromarray(((resid > 16) * 255).astype(np.uint8), "L")
    hard = hard.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.MinFilter(11))
    hard = hard.filter(ImageFilter.MedianFilter(5))
    soft = hard.filter(ImageFilter.GaussianBlur(0.55))
    alpha = np.array(soft).astype(np.float32) / 255.0
    alpha[alpha < 0.16] = 0
    alpha[alpha > 0.92] = 1
    return alpha


def pop_figure(rgb: np.ndarray, mask: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    red = (r > b + 10) & (r > g + 6)
    light = (r + g + b) / 3 > 138
    cape = (b > r + 8) & (g > 70) & ~light
    pants = (b > r + 4) & ~light & ~cape

    out = rgb * 1.08 + 6

    def mix(flag: np.ndarray, color: np.ndarray, amount: float) -> None:
        nonlocal out
        w = (flag.astype(np.float32) * mask * amount)[..., None]
        out = out * (1 - w) + color * w

    mix(red, HERO_RED, 0.52)
    mix(cape, CAPE, 0.7)
    mix(pants, PANTS, 0.78)
    mix(light, GRID, 0.82)
    return np.clip(out, 0, 255)


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"missing original plate: {SRC}")
    src = Image.open(SRC).convert("RGB")
    rgb = np.array(src).astype(np.float32)
    mask = residual_mask(rgb)
    popped = pop_figure(rgb, mask)
    rgba = np.zeros((rgb.shape[0], rgb.shape[1], 4), dtype=np.uint8)
    rgba[..., :3] = popped.astype(np.uint8)
    rgba[..., 3] = np.clip(mask * 255, 0, 255).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} {tuple(rgba.shape[1::-1])} mask={mask.mean():.4f}")


if __name__ == "__main__":
    main()
