# Deploying Duck Math (Vercel + Cloudflare DNS)

## One-time setup (you)
1. Create a GitHub repo (public or private) and push:
   `git remote add origin git@github.com:<user>/<repo>.git && git push -u origin master`
2. vercel.com -> Add New -> Project -> import the repo. Leave all settings as detected:
   `vercel.json` sets install/build commands, the `build/` output and `trailingSlash`.
   Production branch: `master` (Settings -> Git if Vercel picked another).
3. Wait for the first deployment to go green and open the `*.vercel.app` URL.
4. Project -> Settings -> Domains -> add `dm.ducksoft.ai`. Vercel shows the CNAME target.
5. Cloudflare DNS: `CNAME dm -> <target Vercel shows>` (usually `cname.vercel-dns.com`),
   proxy status **DNS only** (grey cloud). Vercel issues the certificate itself.
6. Back in Vercel -> Domains, wait until `dm.ducksoft.ai` shows "Valid Configuration".

## How deploys work
Push to `master` -> Vercel runs `npm run check && npm test && npm run build`; a failing
type check, unit test or i18n check fails the deploy. Other branches/PRs get preview URLs.
GitHub Actions (`ci.yml`) additionally runs the Playwright e2e suite on every push/PR.

## Notes
- Static output only (adapter-static); no Vercel functions, no secrets.
- The `/` language redirect is a static page (plan 01-03). Unknown URLs get `404.html`.
- Every route is a prerendered `index.html`; `trailingSlash: true` matches Kit's `'always'`.
- Do not enable Vercel Web Analytics / Speed Insights: the site makes no cross-origin requests.
- Vercel's Hobby plan is for non-commercial use.

## Verify
`curl -sI https://dm.ducksoft.ai/en/` shows `200`;
`curl -sI https://dm.ducksoft.ai/en/high-school/unit-circle/angle` redirects to the `/` form.
