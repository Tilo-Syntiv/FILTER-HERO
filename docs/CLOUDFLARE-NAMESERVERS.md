# Cloudflare nameservers (zone ready — Squarespace NS click left)

**Summary:** Keep `filterhero.net` registered at Squarespace. When we want a DNS API, point **nameservers only** at Cloudflare. Copy every record into Cloudflare first. Do not transfer the domain.

**Why this file exists:** Squarespace has no public DNS API. Railway, Resend, and Klaviyo all need records we cannot script today. This is the cutover checklist.

**Gate (2026-09-07):** Apex shop still loads from every resolver. Cloudflare zone `filterhero.net` exists (status `pending`) with every row in [Records to copy](#records-to-copy) and the FH-181 www redirect. Public NS are still Squarespace. The remaining step is the Squarespace nameserver click.

**Last snapshot:** 2026-09-07. Re-check live DNS before applying. Railway’s CNAME target can change if the custom domain is deleted and re-added.

## Live check 2026-09-07 (run before NS change)

| Check | Result |
|---|---|
| NS | Squarespace `nsc1`–`nsc4.squarespacedns.com` on Google, Cloudflare, Quad9, OpenDNS |
| Apex A | `69.46.46.70` on all five resolvers |
| `https://filterhero.net/api/health` | `{"ok":true,"brand":"Filter Hero"}` |
| `https://filterhero.net/` | 200 shop HTML (`Filter Hero \| Exact-Fit HVAC`) |
| `/sizes/20x25x1`, `/sitemap.xml`, `/llms.txt`, `/logo.png`, JS, CSS | 200 |
| `www` CNAME | `ckury9c8.up.railway.app` on all five resolvers |
| `https://www.filterhero.net/` | **FAIL** — TLS mismatch, then Railway `404 Application not found` (FH-181) |
| Railway custom domains | `filterhero.net` only. Trial rejects a second host |
| Railway regions | `us-east4-eqdc4a` × 1 (FH-182). Do not add `ams` |
| Service host | `https://filter-hero-production.up.railway.app/api/health` 200 |
| `ckury9c8.up.railway.app` as Host | 404 (edge CNAME target, not an app hostname) |
| Cloudflare zone | **ready, pending NS** — records + www redirect in zone (FH-183 fixed) |
| Cloudflare NS (not live yet) | `ganz.ns.cloudflare.com`, `marjory.ns.cloudflare.com` |

Apex shoppers are fine. `www` stays broken on the public internet until Squarespace uses the Cloudflare nameservers. Do not transfer the domain.

## Do not

- Transfer the domain off Squarespace.
- Change nameservers until the Cloudflare zone already has every row in [Records to copy](#records-to-copy) plus the www redirect.
- Delete Google MX or the Google SPF TXT.
- Point `send.filterhero.net` at Klaviyo. That host is Resend.
- Orange-cloud (proxy) mail, DKIM, or verification hosts. Those must be **DNS only**.
- Orange-cloud `@` on day one. Apex stays DNS-only to Railway.
- Enable Resend receiving on `@` (that steals Google MX).
- Replace the Google SPF with a Resend-only SPF. Never drop `include:_spf.google.com`.
- Commit a Cloudflare API token.
- Scale Railway to a second region on the trial plan (FH-182).

## Do

1. Mint a valid Cloudflare API token (FH-183). Create a free Cloudflare zone for `filterhero.net`. Do not change Squarespace NS yet.
2. Enter every record below. Proxy status: **DNS only** except `www`.
3. Add a Cloudflare Single Redirect: `www.filterhero.net/*` → `https://filterhero.net/$1` (301). `www` must be **proxied** for that rule to run. Railway trial cannot attach `www` (FH-181).
4. Compare Cloudflare’s zone against live Squarespace DNS until they match (except the www redirect).
5. In Squarespace → domain → nameservers, replace `nsc1`–`nsc4.squarespacedns.com` with the two Cloudflare nameservers. Leave the domain at Squarespace.
6. Wait until `nslookup -type=NS filterhero.net 8.8.8.8` shows only Cloudflare.
7. Confirm site (apex and www), Gmail, Resend, and Klaviyo.

## Current nameservers (still Squarespace)

```
nsc1.squarespacedns.com
nsc2.squarespacedns.com
nsc3.squarespacedns.com
nsc4.squarespacedns.com
```

## Cloudflare nameservers (paste these at Squarespace)

```
ganz.ns.cloudflare.com
marjory.ns.cloudflare.com
```

## Records to copy

Cloudflare names omit `.filterhero.net`. `@` is the root.

### Site (Railway)

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `@` | `ckury9c8.up.railway.app` | DNS only |
| CNAME | `www` | `ckury9c8.up.railway.app` | **Proxied** (redirect only; see Do §3) |
| TXT | `_railway-verify` | `railway-verify=9c1c72eeb007b5e41f10616349a1ac7f2b23a3ce6c054fe65848b0a552fb52d1` | DNS only |

Railway still lists that CNAME target for the apex custom domain. The clickable service hostname is `filter-hero-production.up.railway.app`. Do not point `@` at the service hostname unless Railway’s domain status page changes.

### Google Workspace mail

| Type | Name | Content | Proxy |
|---|---|---|---|
| MX | `@` | `smtp.google.com` (priority 1) | DNS only |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | DNS only |

### Resend (transactional)

| Type | Name | Content | Proxy |
|---|---|---|---|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDY0W7t8ajkqaBCLXw2hZewiuzDcM6kwa2lr/9LaJpxRCFTonmmcigVp7oqwhQJN7SjYE1BoVnWCVLxd06C8sudInqcGkp+/Lbi7+QaznZ2G8rYLQm4yoJ+GV04ig19JgGX2EXUHQkX1RfsCWTRIlQ2Oa3XRxCpfXTPe26ghUsMSQIDAQAB` | DNS only |
| CNAME | `rsend` | `rsend.forge.rmta.net` | DNS only |
| CNAME | `send` | `send.forge.rmta.net` | DNS only |

Re-copy the DKIM `p=` from live DNS if Resend rotated it.

### Klaviyo (marketing)

| Type | Name | Content | Proxy |
|---|---|---|---|
| TXT | `@` | `klaviyo-site-verification=VnVNmQ` | DNS only |
| CNAME | `klv` | `3840918940202419532.klaviyodns.com` | DNS only |
| CNAME | `mtd1._domainkey` | `mtd1._domainkey.3840918940202419532.klaviyodns.com` | DNS only |
| CNAME | `mtd2._domainkey` | `mtd2._domainkey.3840918940202419532.klaviyodns.com` | DNS only |

## Verify after the NS change

```powershell
nslookup -type=NS filterhero.net 8.8.8.8
nslookup filterhero.net 8.8.8.8
nslookup www.filterhero.net 8.8.8.8
nslookup -type=MX filterhero.net 8.8.8.8
curl.exe -s https://filterhero.net/api/health
curl.exe -sI https://www.filterhero.net/
```

Expect Cloudflare NS only, apex on Railway (not `198.185.159.*`), MX `smtp.google.com`, health `{"ok":true,"brand":"Filter Hero"}`, and www a 301/308 to `https://filterhero.net/`.

## Related

- FH-181, FH-182, FH-183 in `docs/ISSUES-AND-FIXES.md`
- Railway service `FILTER-HERO` on project `9e90c440-beba-417a-a984-97e328749e16`
