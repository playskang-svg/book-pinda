# 북핀다 (book.pinda.kr)

Payload CMS + Next.js on Cloudflare Workers (D1, R2).

## Deploy

OpenNext does not produce a working Worker on Windows, so GitHub Actions bundles on Linux.

1. `git push` to `main` and wait for the Build workflow.
2. `pnpm deploy:ci` downloads the bundle and uploads it with the local wrangler login.

After changing a collection, also run these before deploying:

```bash
pnpm payload migrate:create <name>
NODE_ENV=production pnpm payload migrate
```

## Content

- Books and reviews are edited at `/admin`. Publishing needs no deploy, but pages stay in the edge cache for 5 minutes.
- `scripts/seed.ts` loads `scripts/books.json` and can be re-run. It overwrites records with the same ISBN.
- 3hoursahead caps link creation per day across the whole account. A book with no issued link stays a draft; a book with one shows only that store.
- Buy links are product deep links issued in the 3hoursahead studio (`linkprice_kyobobook`, `linkprice_yes24`).
- 3hoursahead forbids the Kyobo brand name in content titles and search keywords, so keep it out of titles and meta tags.
- `pnpm exec tsx scripts/og.mjs` renders share thumbnails with the snsogg skill into `public/og/`.

## Environment

- `PAYLOAD_SECRET`: Worker secret, plus `.env` for local CLI runs.
- `NEXT_PUBLIC_GA_ID`: optional, read at build time.
