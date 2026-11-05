# Bloom production deployment

## Target and release artifact

- Requested host: Vercel, static presentation from the active Go template, not the inactive React scaffold.
- Selected account: `kr1ny77-2399`; default team `team_OHXsrPmvwuIIJDH9oiO0BhbI` (`kr1ny77-2399s-projects`). Account plan: Hobby. No paid plan, domain purchase or paid feature has been requested.
- Separate project created: `bloom` / `prj_QYze3mrpd2q5rbfd1fLlcMRtW4rL`. The unrelated `v0-project` is preserved.
- Base Git commit: `e3c4c05`. The complete current site includes local changes; do not present that commit alone as the published revision.
- `npm run build` produces `dist/index.html` and `dist/static/`, including the new v3 hero, current model, app icons and menu. The artifact has 94 files / 12,540,248 bytes before any deployment-only configuration. No source scenes, project notes, environment files or account credentials are in that artifact.
- Repository `vercel.json` configures future source deployments as static builds with output directory `dist`. A direct file upload of the already-built artifact needs framework=null and no build/install command; it must serve the artifact root directly.

## Domain choice

The user prefers the label `bloom`. The live DigitalPlat dashboard now requires a paid slot for `.qzz.io`; no payment is authorized. Current free candidate: `bloom.qd.je`, selected in the existing account with one available free slot. Availability is pending the provider search. The user has confirmed checking the policy-acknowledgement checkbox personally.

Provider: https://github.com/DigitalPlatDev/FreeDomain . Its current public documentation lists `.qzz.io` and describes delegation to external nameservers. Registration/account policies and any slot/payment requirements must be checked in the live dashboard. User authorization covers a free domain; it does not authorize charges. Account verification, policy acknowledgement and registration contact details must be completed by the account owner when requested.

Use the DNS/nameservers returned for the actual Vercel domain/zone; do not copy guessed IP addresses. Attach and verify the domain only after successful registration. Verify delegation, HTTPS and the deployed homepage afterward.

## Completed preflight

- `npm run build`: pass.
- `node --test tests/*.test.mjs`: 40 pass.
- `go test ./...`: pass.
- Artifact checked for localhost references and unresolved Go-template expressions: none. Hero controller references v3.
- File manifest with SHA1/SHA256 and sizes prepared in the current deployment tool session; regenerate it if the artifact changes.

## Release in progress

- User confirmed Vercel team access; retry of the exact same team request succeeded.
- Project `bloom` was created in the verified default team with a static framework and public access, as requested. No existing project's protection was changed.
- User logged into DigitalPlat in Chrome; use that existing authorized tab. The separate in-app-browser login does not share that session.
- MCP file upload is limited by the local hook to 1MiB JSON input; the large animation cannot be uploaded that way. Two small/medium files were accepted, but no deployment was created from those uploads.
- The user explicitly requested committing the whole site project to `https://github.com/kr1ny77/-BloomSite.git`. The repository is public and empty (REST repo ID `1446954738`). Publish the reviewed project there and deploy the exact pushed commit through Vercel's Git API. Preserve all code, native assets, tests and project records; omit ignored dependencies, build output, caches and any secrets.
- The active v3 Blender master and timing are now included under `assets/hero-logo/` so the dark-theme render does not require files outside the repository.

Next: review/stage/commit the current complete site, push to the empty repository's main branch, deploy that exact commit to the existing Bloom project, inspect build status, verify the hosted website, then complete the free-domain availability/registration/DNS flow. Record final IDs/URLs and verification below. No published site or registered domain can be claimed until confirmed.
