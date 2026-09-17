from pathlib import Path

from PIL import Image

SRC = Path(r"E:\FILTER HEROE\RESET.png")
OUT_DIR = Path(__file__).resolve().parent.parent / "client" / "public"


def main():
    src = Image.open(SRC).convert("RGB")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    desktop = src
    if desktop.width > 2400:
        ratio = 2400 / desktop.width
        desktop = desktop.resize(
            (2400, int(desktop.height * ratio)), Image.Resampling.LANCZOS
        )
    webp_path = OUT_DIR / "hero-banner.webp"
    desktop.save(webp_path, "WEBP", quality=92, method=6)

    shop = src.crop((1678, 754, 2008, 842))
    shop_path = OUT_DIR / "hero-shop-now.webp"
    shop.save(shop_path, "WEBP", quality=95, method=6)

    mobile = src.crop((0, 0, int(src.width * 0.50), src.height))
    if mobile.width > 1200:
        ratio = 1200 / mobile.width
        mobile = mobile.resize(
            (1200, int(mobile.height * ratio)), Image.Resampling.LANCZOS
        )
    mobile_path = OUT_DIR / "hero-banner-mobile.webp"
    mobile.save(mobile_path, "WEBP", quality=92, method=6)

    print("src", src.size)
    print("desktop", desktop.size, webp_path.stat().st_size)
    print("shop", shop.size, shop_path.stat().st_size)
    print("mobile", mobile.size, mobile_path.stat().st_size)


if __name__ == "__main__":
    main()
