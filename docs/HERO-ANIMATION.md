# Hero animation · 2026-11-05

The current smoother revision is documented in [HERO-ANIMATION-V3.md](HERO-ANIMATION-V3.md). This page records the previous v2 integration.

User request: find the completed rounded lowercase Bloom animation and integrate it into the initial screen. The rest of the presentation stays intact.

## Selected source and adaptation

- Approved revision: `../bloom-logo-rounded/v2/Bloom-v2.blend`, not the rejected stroke-writing / leaf-unfolding v1.
- Original transparent exports: `../bloom-logo-rounded/v2/web/bloom-v2.webp` and `bloom-v2-static.webp`, copied into `static/media/bloom-logo/` as `intro-light.webp` / `static-light.webp`.
- Whole letters arrive with 45ms stagger; the already formed leaf appears afterward. The sequence lasts 2.5s, with the movement completed around 1.08s. It plays once, without looping.
- For dark surfaces, `assets/hero-logo/render-dark.py` modifies only the five glyph emission colors to #f2f6ea. Geometry, leaf pigment, camera and animation are preserved. The editable result is `assets/hero-logo/Bloom-v2-dark.blend`; `encode-dark.py` exports matching transparent WebP assets.
- Native render: Blender 5.2.2 LTS, Cycles/Metal GPU, 16 samples, GPU OIDN, 73 rendered dynamic frames, 171s. Published media: 1200×500, 60fps timing, 2500ms, one play. WebP optimization combines identical frames into 59 frames without changing duration.

## Integration behavior

- Fixed 12:5 space prevents media loading from changing the layout. No opaque background is baked into the logo.
- Static `<picture>` renders immediately and without JavaScript. System theme works natively; the existing manual theme switch updates the selected static source and stops the intro without replaying it.
- `intro.js` loads only the matching animation. A hidden overlay becomes visible after loading and returns to the identically framed static artwork after 2.5s.
- Reduced motion loads no animation. Enabling it during playback immediately restores the static logo. Backgrounding the document also settles the artwork.
- An image error or load taking over 1.2s keeps the static composition, avoiding a late disappearance/reappearance on slow connections.
- WebP avoids alpha-video codec/autoplay discrepancies; no animation library is added. Existing scroll motion remains intact.
- Previous Pacifico source font and old intro media remain available as project materials, but are no longer preloaded by this hero.

## Verification

- `node --test tests/*.test.mjs`: 40 pass, including 9 updated intro cases (loading, themes, reduced motion, completion, failure, slow loading, interruption, visibility).
- `go test ./...`: pass; real image endpoints and byte ranges checked for all four published assets.
- `npm run build`, Go production binary build, targeted Oxlint: pass.
- Impeccable detector from workspace root: no findings; no new ignores added.
- Both animation files inspected with Pillow: 1200×500, 2500ms, loop=1 (one play).
- Actual website inspected in browser at 1280×720, 390×680 and 320×680. Dark and light themes, live letter/leaf progression, final still, manual theme switching and JavaScript-disabled rendering checked. Mobile document widths match viewport widths without horizontal overflow.
- Native menu opens and closes with Escape over the updated hero; the logo has a persistent accessible name during playback. Browser warning/error log is empty. Proof: `hero-animation-desktop.jpg` and `hero-animation-mobile.jpg` beside this record.
- Reduced-motion interruption and image failure are covered by isolated runtime tests. Native Safari/iOS hardware and a new Lighthouse audit were not available in this pass; do not treat the earlier audit scores as scores for this change.

Runtime: Go embeds the template and static assets; rebuild/restart it after changes. Active local review URL: http://localhost:8096/.
