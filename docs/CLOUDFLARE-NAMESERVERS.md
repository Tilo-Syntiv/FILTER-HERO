Do not run this until you have checked that filterhero.net loads the shop from every resolver. if there are any issues with Filterhero.net loading the shop from every resolver, Debug, test, and make sure everything's working 100%. We also need to make sure that everything is logged in the issues and fixes. then run @FILTER HERO/docs/CLOUDFLARE-NAMESERVERS.md again.

# Cloudflare nameservers (do not run yet)

**Summary:** Keep `filterhero.net` registered at Squarespace. When we want a DNS API, point **nameservers only** at Cloudflare. Copy every record into Cloudflare first. Do not transfer the domain.

**Why this file exists:** Squarespace has no public DNS API (FH-172). Railway, Resend, and Klaviyo all need records we cannot script today. This is the cutover checklist.

**Last snapshot:** 2026-09-07. Re-check live DNS before applying. Railway’s CNAME target can change if the custom domain is deleted and re-added.

## Do not

- Transfer the domain off Squarespace.
- Change nameservers until the Cloudflare zone already has every row in [Records to copy](#records-to-copy).
- Delete Google MX or the Google SPF TXT.
- Point `send.filterhero.net` at Klaviyo. That host is Resend (FH-172, FH-173).
- Orange-cloud (proxy) mail, DKIM, or verification hosts. Those must be **DNS only**.
- Enable Resend receiving on `@` (that steals Google MX).
- Replace the Google SPF with a Resend-only SPF. Never drop `include:_spf.google.com`.
- Commit a Cloudflare API token.

## Do

1. Create a free Cloudflare zone for `filterhero.net`. Do not change Squarespace NS yet.
2. Enter every record below. Proxy status: **DNS only** for all of them on day one.
3. Compare Cloudflare’s zone against live Squarespace DNS until they match.
4. In Squarespace → domain → nameservers, replace `nsc1`–`nsc4.squarespacedns.com` with the two Cloudflare nameservers. Leave the domain at Squarespace.
5. Wait until `nslookup -type=NS filterhero.net 8.8.8.8` shows only Cloudflare.
6. Confirm site, Gmail, Resend, and Klaviyo.

## Current nameservers (Squarespace)

```
nsc1.squarespacedns.com
nsc2.squarespacedns.com
nsc3.squarespacedns.com
nsc4.squarespacedns.com
```

## Records to copy

Cloudflare names omit `.filterhero.net`. `@` is the root. All **DNS only**.

### Site (Railway)

| Type | Name | Content |
|---|---|---|
| CNAME | `@` | `ckury9c8.up.railway.app` |
| CNAME | `www` | `ckury9c8.up.railway.app` |
| TXT | `_railway-verify` | `railway-verify=9c1c72eeb007b5e41f10616349a1ac7f2b23a3ce6c054fe65848b0a552fb52d1` |

### Google Workspace mail

| Type | Name | Content |
|---|---|---|
| MX | `@` | `smtp.google.com` (priority 1) |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` |

### Resend (transactional)

| Type | Name | Content |
|---|---|---|
| TXT | `resend._domainkey` | copy live `p=` from DNS if rotated |
| CNAME | `rsend` | `rsend.forge.rmta.net` |
| CNAME | `send` | `send.forge.rmta.net` |

### Klaviyo (marketing)

| Type | Name | Content |
|---|---|---|
| TXT | `@` | `klaviyo-site-verification=VnVNmQ` |
| CNAME | `klv` | `3840918940202419532.klaviyodns.com` |
| CNAME | `mtd1._domainkey` | `mtd1._domainkey.3840918940202419532.klaviyodns.com` |
| CNAME | `mtd2._domainkey` | `mtd2._domainkey.3840918940202419532.klaviyodns.com` |

## Verify after the NS change

```powershell
nslookup -type=NS filterhero.net 8.8.8.8
nslookup filterhero.net 8.8.8.8
nslookup -type=MX filterhero.net 8.8.8.8
curl.exe -s https://filterhero.net/api/health
```

Expect Cloudflare NS only, apex on Railway (not `198.185.159.*`), MX `smtp.google.com`, health `{"ok":true,"brand":"Filter Hero"}`.

## Related

- FH-172, FH-173, FH-180 in `docs/ISSUES-AND-FIXES.md`
- Railway service `FILTER-HERO` on project `9e90c440-beba-417a-a984-97e328749e16`
