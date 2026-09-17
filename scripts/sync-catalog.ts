import "dotenv/config";
import {
  syncKlaviyoCatalog,
  syncStripeCatalog,
  syncSupabaseCatalog,
} from "./lib/catalog-sync.ts";

function flag(name: string): boolean {
  const args = process.argv.slice(2);
  if (args.length === 0) return true;
  return args.includes(`--${name}`) || args.includes(name);
}

async function main() {
  const wantStripe = flag("stripe");
  const wantKlaviyo = flag("klaviyo");
  const wantSupabase = flag("supabase");

  const report: Record<string, unknown> = {};
  if (wantStripe) {
    console.log("Syncing Stripe product catalog…");
    report.stripe = await syncStripeCatalog();
  }
  if (wantKlaviyo) {
    console.log("Syncing Klaviyo custom catalog…");
    report.klaviyo = await syncKlaviyoCatalog();
  }
  if (wantSupabase) {
    console.log("Syncing Supabase catalog_skus…");
    report.supabase = await syncSupabaseCatalog();
  }
  console.log(JSON.stringify(report, null, 2));
  const failed = Object.values(report).some(
    (row) => row && typeof row === "object" && "error" in row && (row as { error?: string }).error,
  );
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
