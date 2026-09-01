import "dotenv/config";
import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { ALL_FILTER_SIZES, FILTER_SIZES, MERV_TYPES, SELLABLE_ONLY, THICKNESSES } from "../shared/products";
import {
  DEFAULT_SITE_URL,
  absoluteUrl,
  buildAiTxt,
  buildLlmsFullTxt,
  buildLlmsTxt,
  injectSeoIntoHtml,
  resolveDocumentSeo,
  sitemapPaths,
} from "../shared/seo";
import { submitContact } from "./contact";
import { createCheckoutSession, getCheckoutSessionStatus, handleStripeWebhook } from "./stripe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checkoutBodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1)
    .max(50),
});

async function startServer() {
  const app = express();
  const server = createServer(app);
  const isProd = process.env.NODE_ENV === "production";
  const siteUrl = (
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    (isProd ? DEFAULT_SITE_URL : undefined) ||
    DEFAULT_SITE_URL
  ).replace(/\/$/, "");
  const clientUrl = (
    process.env.CLIENT_URL ||
    (isProd ? siteUrl : "http://localhost:3000")
  ).replace(/\/$/, "");

  // Stripe webhook needs raw body — register before json parser
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      try {
        const result = await handleStripeWebhook(
          req.body as Buffer,
          req.headers["stripe-signature"] as string | undefined,
        );
        res.json(result);
      } catch (err) {
        console.error("[stripe webhook]", err);
        res.status(400).json({
          error: err instanceof Error ? err.message : "Webhook error",
        });
      }
    },
  );

  app.use(express.json({ limit: "1mb" }));

  app.get("/sitemap.xml", (_req, res) => {
    const lastmod = new Date().toISOString().slice(0, 10);
    const urls = sitemapPaths()
      .map(
        ({ path: p, changefreq, priority }) => `  <url>
    <loc>${absoluteUrl(siteUrl, p)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
      )
      .join("\n");
    res
      .type("application/xml")
      .send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);
  });

  app.get("/robots.txt", (_req, res) => {
    res
      .type("text/plain")
      .send(`User-agent: *
Allow: /
Disallow: /checkout/
Disallow: /api/

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Google-CloudVertexBot
Allow: /

User-agent: meta-externalagent
Allow: /

Sitemap: ${absoluteUrl(siteUrl, "/sitemap.xml")}
`);
  });

  app.get("/llms.txt", (_req, res) => {
    res.type("text/plain").send(buildLlmsTxt(siteUrl));
  });

  app.get("/llms-full.txt", (_req, res) => {
    res.type("text/plain").send(buildLlmsFullTxt(siteUrl));
  });

  app.get("/ai.txt", (_req, res) => {
    res.type("text/plain").send(buildAiTxt(siteUrl));
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, brand: "Filter Hero" });
  });

  app.get("/api/products", (_req, res) => {
    res.json({
      sizeCount: FILTER_SIZES.length,
      archivedSizeCount: ALL_FILTER_SIZES.length,
      sellableOnly: SELLABLE_ONLY,
      thicknesses: THICKNESSES,
      merv: MERV_TYPES.map((t) => t.key),
    });
  });

  app.get("/api/checkout/session", async (req, res) => {
    try {
      const sessionId =
        typeof req.query.session_id === "string" ? req.query.session_id : "";
      const result = await getCheckoutSessionStatus(sessionId);
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Session lookup failed";
      const status = message.includes("not configured") ? 503 : 400;
      if (status !== 400) console.error("[checkout session]", err);
      res.status(status).json({ error: message, paid: false });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      const { items } = checkoutBodySchema.parse(req.body);
      const session = await createCheckoutSession(items, clientUrl);
      if (!session.url) {
        res.status(500).json({ error: "No checkout URL returned" });
        return;
      }
      res.json({ url: session.url });
    } catch (err) {
      console.error("[checkout]", err);
      const message = err instanceof Error ? err.message : "Checkout failed";
      const status = message.includes("not configured") ? 503 : 400;
      res.status(status).json({ error: message });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const result = await submitContact(req.body);
      res.json(result);
    } catch (err) {
      console.error("[contact]", err);
      const message = err instanceof Error ? err.message : "Contact failed";
      res.status(400).json({ error: message });
    }
  });

  if (isProd) {
    const staticPath = path.resolve(__dirname, "public");
    app.use(express.static(staticPath, { index: false }));
    app.get("*", (req, res) => {
      const indexPath = path.join(staticPath, "index.html");
      const html = fs.readFileSync(indexPath, "utf8");
      const seo = resolveDocumentSeo(req.path, siteUrl);
      res.type("html").send(injectSeoIntoHtml(html, seo));
    });
  }

  const port = Number(process.env.PORT) || (isProd ? 3000 : 3001);
  let retries = 0;

  const listen = () => {
    server.listen(port, () => {
      console.log(`API server running on http://localhost:${port}/`);
    });
  };

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && retries < 8) {
      retries += 1;
      console.warn(`[server] port ${port} in use, retry ${retries}/8`);
      setTimeout(listen, 400);
      return;
    }
    console.error(err);
    process.exit(1);
  });

  listen();
}

startServer().catch(console.error);
