import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright";

const BASE = process.env.BROWSE_BASE || "http://127.0.0.1:3000";
const OUT = process.env.BROWSE_OUT || path.resolve("tmp/browser");
const headed = process.env.BROWSE_HEADED === "1";

mkdirSync(OUT, { recursive: true });

async function assertMervWash(page: Page, badge: string, label: string) {
  const wash = await page.evaluate(() => {
    const chip = document.querySelector("button.pdp-merv[aria-pressed='true']") as HTMLElement | null;
    const note = document.querySelector(".pdp-merv-note") as HTMLElement | null;
    const caption = document.querySelector(".pdp-merv-capture-label");
    return {
      chip: chip?.style.getPropertyValue("--merv-wash") ?? "",
      note: note?.style.getPropertyValue("--merv-wash") ?? "",
      label: caption ? getComputedStyle(caption).color : "",
    };
  });
  if (wash.chip !== badge || wash.note !== badge) {
    throw new Error(`${label} chip/note wash must be ${badge}, got chip ${wash.chip} note ${wash.note}`);
  }
  const n = badge.slice(1);
  const rgb = `rgb(${parseInt(n.slice(0, 2), 16)}, ${parseInt(n.slice(2, 4), 16)}, ${parseInt(n.slice(4, 6), 16)})`;
  if (wash.label !== rgb) {
    throw new Error(`${label} Capture label must be ${rgb}, got ${wash.label}`);
  }
}

async function shot(page: Page, name: string) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function main() {
  const browser = await chromium.launch({
    headless: !headed,
    ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors: string[] = [];
  page.on("pageerror", (err) => consoleErrors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  const steps: { step: string; url: string; file: string }[] = [];
  const record = async (step: string) => {
    steps.push({ step, url: page.url(), file: await shot(page, String(steps.length + 1).padStart(2, "0") + "-" + step) });
  };

  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.getByText("Filter Hero", { exact: false }).first().waitFor({ timeout: 20000 });
  const homeMerv11 = await page.locator('img[alt="Filter Hero MERV 11 advanced air filter"]').getAttribute("src");
  if (!homeMerv11?.includes("/hero/pack-merv11.png")) {
    throw new Error(`home MERV 11 hero must use pack-merv11.png, got ${homeMerv11}`);
  }
  await record("home");
  const homeCopy = await page.locator("body").innerText();
  if (/free shipping/i.test(homeCopy)) {
    throw new Error("homepage must not promise free shipping");
  }

  await page.getByRole("link", { name: /MERV 13 superior/i }).click({ force: true });
  await page.waitForURL(/\/sizes\/20x25x1\?merv=13/, { timeout: 15000 });
  await page.locator('button[aria-pressed="true"]', { hasText: "MERV 13" }).first().waitFor();
  await assertMervWash(page, "#ee9e10", "MERV 13");
  const merv13Src = await page.locator("img.product-shot").getAttribute("src");
  if (!merv13Src?.includes("merv-13-packshot")) {
    throw new Error(`MERV 13 gallery must use the official pack shot, got ${merv13Src}`);
  }
  await page.getByRole("button", { name: /^1 filter/i }).click();
  const merv13Qty1 = await page.locator("img.product-shot").getAttribute("src");
  if (merv13Qty1 !== merv13Src) {
    throw new Error(`MERV 13 qty 1 must keep the same pack shot, got ${merv13Qty1}`);
  }
  await page.getByRole("button", { name: /increase pack quantity/i }).click();
  await page.getByRole("button", { name: /increase pack quantity/i }).click();
  const qty3 = (await page.locator(".pdp-stepper-count").textContent())?.trim();
  if (qty3 !== "3") {
    throw new Error(`stepper must allow qty 3, got ${qty3}`);
  }
  await record("merv-13");

  await page.getByRole("button", { name: /MERV 11 Pets/i }).click();
  await page.waitForURL(/merv=11/, { timeout: 8000 });
  await page.locator('button[aria-pressed="true"]', { hasText: "MERV 11" }).first().waitFor();
  await assertMervWash(page, "#d21b22", "MERV 11");
  const merv11Src = await page.locator("img.product-shot").getAttribute("src");
  if (!merv11Src?.includes("merv-11-packshot")) {
    throw new Error(`MERV 11 gallery must use the official pack shot, got ${merv11Src}`);
  }
  await page.getByRole("button", { name: /^1 filter/i }).click();
  const merv11Qty1 = await page.locator("img.product-shot").getAttribute("src");
  if (merv11Qty1 !== merv11Src) {
    throw new Error(`MERV 11 qty 1 must keep the same pack shot, got ${merv11Qty1}`);
  }
  await page.getByRole("button", { name: /^12\+ filters/i }).click();
  const merv11Qty12 = await page.locator("img.product-shot").getAttribute("src");
  if (merv11Qty12 !== merv11Src) {
    throw new Error(`MERV 11 qty 12 must keep the same pack shot, got ${merv11Qty12}`);
  }
  await page.getByRole("button", { name: /add \d+ to cart/i }).first().click();
  await page.getByText(/Added /i).first().waitFor({ timeout: 8_000 });
  await page.locator("button.header-cart").click({ force: true });
  const cartThumb = page.locator('img[src*="merv-11-packshot"]');
  await cartThumb.first().waitFor({ timeout: 8000 });
  await record("merv-11");
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForURL((url) => url.pathname === "/", { timeout: 8000 });
  await page.getByRole("link", { name: /MERV 13 superior/i }).click({ force: true });
  await page.waitForURL(/\/sizes\/20x25x1\?merv=13/, { timeout: 15000 });
  await page.locator('button[aria-pressed="true"]', { hasText: "MERV 13" }).first().waitFor();
  const merv13Again = await page.locator("img.product-shot").getAttribute("src");
  if (!merv13Again?.includes("merv-13-packshot")) {
    throw new Error(`SPA return to MERV 13 must keep the official pack shot, got ${merv13Again}`);
  }
  await record("merv-13-after-11");

  await page.goto(`${BASE}/sizes/14x25x1`, { waitUntil: "domcontentloaded" });
  await page.locator("button.pdp-merv").first().waitFor();
  const sparse = await page.evaluate(() => {
    const row = document.querySelector(".pdp-merv-row");
    const chip = document.querySelector("button.pdp-merv");
    if (!row || !chip) return { chips: 0, rowW: 0, chipW: 0 };
    return {
      chips: document.querySelectorAll("button.pdp-merv").length,
      rowW: row.getBoundingClientRect().width,
      chipW: chip.getBoundingClientRect().width,
    };
  });
  if (sparse.chips !== 1) {
    throw new Error(`14x25x1 must show one MERV chip, got ${sparse.chips}`);
  }
  if (sparse.chipW < sparse.rowW * 0.85) {
    throw new Error(`14x25x1 MERV chip must fill the row, chip ${sparse.chipW} vs row ${sparse.rowW}`);
  }
  await record("merv-8-only");

  await page.goto(BASE, { waitUntil: "domcontentloaded" });

  const findMySize = page.getByRole("button", { name: "Find my size" });
  await findMySize.scrollIntoViewIfNeeded();
  await findMySize.waitFor({ state: "visible" });
  await record("finder");

  await findMySize.click();
  await page.waitForURL(/\/sizes\//, { timeout: 15000 });
  await page.getByRole("button", { name: /add \d+ to cart/i }).first().waitFor();
  await record("size");
  const sizeCopy = await page.locator("body").innerText();
  if (/free shipping/i.test(sizeCopy)) {
    throw new Error("size page must not promise free shipping");
  }
  if (!/2-day delivery/i.test(sizeCopy)) {
    throw new Error("size page must keep the 2-day delivery chip");
  }

  await page.getByRole("button", { name: /add \d+ to cart/i }).first().click();
  await page.getByText(/added|cart|checkout/i).first().waitFor({ timeout: 8000 }).catch(() => {});
  await record("added-to-cart");

  const cartBtn = page.getByRole("button", { name: /cart/i }).first();
  if (await cartBtn.count()) {
    await cartBtn.click();
    await page.waitForTimeout(400);
  }
  const cartText = await page.locator('[role="dialog"]').innerText().catch(() => page.locator("body").innerText());
  if (/free shipping/i.test(cartText) || /shipping\s*free/i.test(cartText)) {
    throw new Error(`cart must not promise free shipping, got: ${cartText.slice(0, 400)}`);
  }
  if (!/shipping\s*at checkout/i.test(cartText)) {
    throw new Error(`cart must show shipping at checkout, got: ${cartText.slice(0, 400)}`);
  }
  await record("cart");

  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /sign in/i }).waitFor({ timeout: 10000 });
  await record("login");

  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await page.getByText(/staff|quotes|sign in|work email/i).first().waitFor({ timeout: 10000 });
  await record("admin");

  await page.goto(`${BASE}/brands/carrier`, { waitUntil: "domcontentloaded" });
  await page.getByText(/carrier/i).first().waitFor({ timeout: 10000 });
  await record("brand");

  await browser.close();

  const uniqueErrors = [...new Set(consoleErrors)].filter(
    (line) =>
      !line.includes("favicon") &&
      !line.includes("Download the React DevTools") &&
      !line.includes("font-size:0;color:transparent"),
  );

  console.log(
    JSON.stringify(
      {
        ok: uniqueErrors.length === 0,
        base: BASE,
        headed,
        out: OUT,
        steps,
        consoleErrors: uniqueErrors,
      },
      null,
      2,
    ),
  );
  if (uniqueErrors.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
