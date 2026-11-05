# Bloom production deployment

## Live site

- Public HTTPS URL: **https://bloomfacts.vercel.app/**
- Host: Vercel Hobby, production, static output; no server function is needed.
- Team: `team_OHXsrPmvwuIIJDH9oiO0BhbI` / `kr1ny77-2399s-projects`.
- Project: `bloom` / `prj_QYze3mrpd2q5rbfd1fLlcMRtW4rL`.
- Domain is attached to the project, verified, and assigned to production (`gitBranch=null`), so it follows subsequent production deployments.
- No paid plan, domain purchase, DNS subscription or paid monitoring was enabled. The unrelated `v0-project` is preserved.

## Source and build

- User-requested repository: https://github.com/kr1ny77/-BloomSite . It was empty before the first push. The complete site project, native assets, tests and project records were committed; ignored dependencies, caches and build output remain excluded.
- First published source commit: `1fcc77559236eea325a093492ac62dd5a1f58a63` on `main`.
- The repository is connected to the Vercel project. Subsequent commits in `main` trigger deployment automatically.
- Source: Go template `templates/index.html` and `static/`; the React/Vinext scaffold is retained but is not the published app.
- Node.js is pinned to `24.x` in package metadata and project settings to avoid automatic major-version changes.
- Install: `npm ci --include=dev`. Build: `npm run build`. Output: `dist`.
- canonical, og:url and the absolute og:image use `https://bloomfacts.vercel.app/`.
- `docs/deploy-artifact-manifest.json` records SHA1/SHA256 and sizes for all 98 output files (18,163,015 bytes including native 60fps video alternatives).

## First successful release

- Deployment: `dpl_Fq1cTqdHK37BS86ga6kHhbbaNzgi`.
- Immutable URL: https://bloom-3ovakgj4c-kr1ny77-2399s-projects.vercel.app/ .
- State: READY; target: production; source SHA verified against the pushed `main` commit.
- Build log reports 42s; build+publication transition took about 49s.
- Default aliases are retained, but the intended public link is `bloomfacts.vercel.app`.
- The earlier deployment `dpl_5EFd1f4Rdq5ETRWxVAQd5uLCVMFy` failed with `git_info_fail` before GitHub was connected. Connecting the repository and deploying from `main` resolved it. It is not a live release.

## Domain decisions

The user preferred the label `bloom`. Live registration checks found:

- `bloom.qd.je` and `bloom.dpdns.org`: currently unavailable.
- `.us.kg` / `.xx.kg`: new free registration paused for accounts outside eligible subscription plans.
- `.qzz.io`: requires a paid/subscription slot in the current dashboard.
- `getbloom.qd.je`: shown as free and available, but **not registered**. The user then asked about using Vercel's address. The registration dialog was cancelled; the free slot remains available.
- Vercel returned `alias_in_use` for both `bloom.vercel.app` and `getbloom.vercel.app`. `bloomfacts.vercel.app` was available and was attached successfully to Bloom.

DigitalPlat's current UI also offers managed DigitalPlat DNS; the older repository tutorial describing external-only DNS is not a complete description of the current dashboard. No account verification data or consent links are stored in this repository.

## Verification

- `npm run build`: pass. `node --test tests/*.test.mjs`: 41 pass. `go test ./...`: pass.
- Anonymous HTTPS checks for the homepage and all 93 static files: 200, correct MIME types, SHA256 matches the checked build, no missing assets. Results: `deployment-http-check.json`.
- Browser on the real public origin: homepage, menu, navigation to the app section, loaded WebGL canvas, keyboard rotation/reset and return to the homepage checked. No browser warning/error logs during that check.
- Production responsive views inspected at 390×680 and 320×680, plus a sandboxed JavaScript-disabled view. Logo loads in every view; document widths match the viewports. Screenshot evidence: `deployment-live-home.jpg`, `deployment-live-product.jpg`, `deployment-live-mobile.jpg`.
- The 5-minute Vercel runtime error/fatal query returned no matching logs. This is a static site; this result is not a claim about every edge/CDN request. An initial 1h query exceeded the available retention window and was retried with 5m.
- Drains: none. No external continuous error monitoring was added.

## Limits and maintenance

- The install log reported 32 inherited dependency advisories (2 low, 12 moderate, 15 high, 3 critical). The retained React/Vinext scaffold is not served or executed as the production app, but its dependencies are still installed during the build. They were not force-upgraded as part of this deployment; review them separately before using that scaffold as a runtime app.
- Store buttons intentionally remain future-launch placeholders; demo product data remains identified as examples.
- Physical iOS/Safari devices and continuous production monitoring were not verified/configured in this release.
- This record may be followed by documentation/metadata commits. The exact current source/deployment SHA is available from GitHub `main` and the Vercel deployment record; do not confuse the first release SHA above with every later deployment.

## Hero video follow-up

Animated WebP playback was replaced with native 60fps VP9/HEVC video. Motion and brand artwork are preserved. Local measured active presentation: 60.00fps in in-app Chromium and 58.22fps in Chrome; see `HERO-VIDEO-60.md` and `hero-video60-browser.json`. Original release HTTP evidence above is historical; the current artifact manifest includes four additional video files.
