# Smoother hero animation · v3 · 2026-11-05

Request: replace the initial-screen animation with the newly delivered smoother film. Source found in `../bloom-logo-rounded/v3/`; its `VERSIONS.md` identifies v3 as current. Preserve the existing hero composition and site behavior.

## Delivery

- Original v3: 5s / 300 frames / 60fps. Whole letters fade over 0.48s and rise over 1.4s, with 75ms stagger. Quintic curves soften arrival and settling. Leaf arrives already formed at 1.15s and settles at 2.9s; final hold lasts through 5s.
- Light-theme artwork and still copied from the delivered transparent `web/bloom-v3.webp` / `bloom-v3-static.webp` without altering choreography.
- Dark variant rendered from the same native `Bloom-v3.blend`; only glyph emission is changed to #f2f6ea. Camera, geometry, leaf material and motion remain intact. `assets/hero-logo/Bloom-v3-dark.blend` is the editable result. The exact authored web crop is rendered directly as 1200×500 with Cycles/Metal, 16 samples, GPU OIDN, two CPU threads. Render took 162.9s; blank and final hold frames reuse identical pixels.
- Published files use explicit `intro-v3-*` / `static-v3-*` names and the script URL changes to `intro.js?v=hero-v3`, preventing cached v2 playback.
- The controller now retains playback for 5000ms instead of 2500ms. Afterward it restores the matching final still. One play, no loop.
- Both desktop and phone use the supplied 1200×500 composition. An attempted raster resize increased the compressed file size; those generated variants were removed. Native-quality masters are preserved.
- Existing static fallback, JavaScript-disabled presentation, reduced-motion behavior, theme switching and media-failure behavior remain available. The existing late-load cutoff retains a complete static logo on slow connections.

## Verification

- `node --test tests/*.test.mjs`: 40 pass, including updated five-second duration, theme source selection and fallback behavior.
- Targeted Oxlint and JavaScript syntax check: pass.
- `npm run build`, `go test ./...`, production Go build: pass. The production server was rebuilt/restarted on port 8096 with the new embedded media.
- Both intro files checked: 1200×500, 162 optimized frames preserving 60fps timing, 5000ms, loop=1. Actual image route byte-range checks pass for both intros and both final stills.
- Browser: live staggered letter reveal, later leaf appearance, final still, light/dark theme switching, CTA navigation and return without replay checked at 1280×720. No warning/error logs.
- Phone layouts checked at 390×680 and 320×680; document widths match viewport widths. A sandboxed JavaScript-disabled view retains the complete v3 final logo. Proof: `hero-animation-v3-desktop.jpg`, `hero-animation-v3-mobile.jpg`.
- Reduced motion and interrupted/error loading remain covered by runtime tests. Physical Safari/iOS devices and a new Lighthouse audit were not checked in this pass.
- Impeccable detector from workspace root: no findings; no new exceptions added.

Previous v2 sources and media are preserved. No unrelated design changes are included.
