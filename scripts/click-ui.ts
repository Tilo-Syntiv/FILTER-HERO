import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright";

const BASE = process.env.BROWSE_BASE || "http://127.0.0.1:3000";
const OUT = process.env.BROWSE_OUT || path.resolve("tmp/browser");
const headed = process.env.BROWSE_HEADED === "1";

mkdirSync(OUT, { recursive: true });

async function shot(page: Page, name: string) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function main() {
  const browser = await chromium.launch({ headless: !headed });
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
  await record("home");

  await page.getByRole("link", { name: /MERV 13 superior/i }).click();
  await page.waitForURL(/\/sizes\/20x25x1\?merv=13/, { timeout: 15000 });
  await page.locator('button[aria-pressed="true"]', { hasText: "MERV 13" }).first().waitFor();
  const merv13Src = await page.locator("img.product-shot").getAttribute("src");
  if (!merv13Src?.includes("merv-13-packshot")) {
    throw new Error(`MERV 13 gallery must use the official pack shot, got ${merv13Src}`);
  }
  await page.getByRole("button", { name: /^1 filter/i }).click();
  const merv13Qty1 = await page.locator("img.product-shot").getAttribute("src");
  if (merv13Qty1 !== merv13Src) {
    throw new Error(`MERV 13 qty 1 must keep the same pack shot, got ${merv13Qty1}`);
  }
  await record("merv-13");

  await page.getByRole("button", { name: /MERV 11 Pets/i }).click();
  await page.waitForURL(/merv=11/, { timeout: 8000 });
  await page.getByRole("link", { name: "Filter Hero home" }).click();
  await page.waitForURL((url) => url.pathname === "/", { timeout: 8000 });
  await page.getByRole("link", { name: /MERV 13 superior/i }).click();
  await page.waitForURL(/\/sizes\/20x25x1\?merv=13/, { timeout: 15000 });
  await page.locator('button[aria-pressed="true"]', { hasText: "MERV 13" }).first().waitFor();
  const merv13Again = await page.locator("img.product-shot").getAttribute("src");
  if (!merv13Again?.includes("merv-13-packshot")) {
    throw new Error(`SPA return to MERV 13 must keep the official pack shot, got ${merv13Again}`);
  }
  await record("merv-13-after-11");

  await page.goto(BASE, { waitUntil: "domcontentloaded" });

  const findMySize = page.getByRole("button", { name: "Find my size" });
  await findMySize.scrollIntoViewIfNeeded();
  await findMySize.waitFor({ state: "visible" });
  await record("finder");

  await findMySize.click();
  await page.waitForURL(/\/sizes\//, { timeout: 15000 });
  await page.getByRole("button", { name: /add \d+ to cart/i }).first().waitFor();
  await record("size");

  await page.getByRole("button", { name: /add \d+ to cart/i }).first().click();
  await page.getByText(/added|cart|checkout/i).first().waitFor({ timeout: 8000 }).catch(() => {});
  await record("added-to-cart");

  const cartBtn = page.getByRole("button", { name: /cart/i }).first();
  if (await cartBtn.count()) {
    await cartBtn.click();
    await page.waitForTimeout(400);
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
