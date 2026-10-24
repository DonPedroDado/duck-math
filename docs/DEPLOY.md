# Deploying Duck Math (GitHub Pages + Cloudflare DNS)

## One-time setup (you)
1. Create the GitHub repo (public).
2. Add the remote and push:
   `git remote add origin git@github.com:<user>/<repo>.git && git push -u origin master`
   (or rename first: `git branch -m master main`).
3. Settings -> Pages -> Source: **GitHub Actions**.
4. Settings -> Pages -> Custom domain: `dm.ducksoft.ai`.
5. Cloudflare DNS: `CNAME dm -> <user>.github.io`, proxy status **DNS only** (grey cloud)
   until GitHub shows the certificate as issued; orange cloud is optional afterwards.
6. Cloudflare SSL/TLS mode: **Full** (Flexible causes redirect loops).
7. Settings -> Pages -> tick **Enforce HTTPS** once available.

## How deploys work
Push to `main` or `master` -> workflow runs check, unit tests, e2e tests and the static
build -> deploys `build/` to GitHub Pages. No secrets are needed.

## Notes
- Pages has no server redirects: the `/` language redirect is a static page (plan 01-03).
- Unknown URLs get `404.html`.
- Every route is a prerendered `index.html` (`trailingSlash: 'always'`).
- `static/CNAME` is copied into `build/CNAME` so the site is served from the domain root.

## Verify
`curl -sI https://dm.ducksoft.ai/en/` shows `200`.
