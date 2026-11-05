# Hero playback correction · 2026-11-05

User reported low apparent frame rate. Scope: preserve the approved v3 scene and choreography; correct delivery and verify presentation, then publish to the existing project.

## Diagnosis and change

The previous hero used an animated WebP image. Its RIFF timestamps were already 16–17ms, so the file was not demonstrably encoded at 10fps. The earlier verification of those timestamps did not establish actual browser presentation frequency. Image decoding/scheduling was a suspected delivery bottleneck, not a measured universal explanation for the user's device.

The hero now uses native `<video>` playback: transparent VP9 WebM for Chromium and transparent HEVC/hvc1 MOV for Safari. Both themes are 1200×500, 300 frames, 5.000 seconds, 60/1 fps, without audio or looping. The light WebM is copied unchanged from the delivered v3 master; dark WebM and both HEVC files are encoded from native RGBA frames. `assets/hero-logo/encode-video.py` records a reproducible encoding recipe; dark frames can be regenerated with the existing Blender script. No interpolated frames or altered lettering/motion.

Sources are assigned only when motion is allowed and the document is visible. The static picture remains available without JS, during loading and after completion. `playing` controls the swap, native `ended` controls completion, and failed/blocked/late startup retains the still. Brief buffering may recover; only a sustained 1.8s stall settles the still. A browser check caught and corrected an overly eager initial waiting-event fallback. Theme changes, backgrounding and reduced motion stop playback without replaying it. Quality counters remain inspectable after completion. The script cache key is `video60-1`.

## Evidence

- FFprobe counted exactly 300 frames at 60/1 fps and 5.000s in all four videos. VP9 files contain `alpha_mode=1`; Apple AVFoundation reports `containsAlphaChannel=true` and nominalFrameRate=60 for both HEVC files.
- Native playback sampled with requestVideoFrameCallback on a temporary proxy of the actual page; no debug UI is shipped. Active-motion interval is media time 0.3–2.6s, excluding the intentionally motionless final hold. Detailed results: `hero-video60-browser.json`.
- Chrome dark: complete playback, 300 total frames, 6 dropped; active presentation 58.22fps. Chrome's native toolbar showed Energy Saver enabled. Its effect is documented by Google: https://github.com/GoogleChrome/developer.chrome.com/blob/main/site/en/blog/memory-and-energy-saver-mode/index.md . Browser preferences were not changed. This is an observed condition, not proof it was the sole cause of the original complaint.
- In-app Chromium light: complete playback, 300 total frames, 2 dropped; active presentation 60.00fps. Both choose VP9; alpha compositing and final still were visually inspected. Earlier passes varied with browser load; these are measurements of the recorded runs, not a universal frame-rate guarantee.
- `node --test tests/*.test.mjs`: 41 pass. `go test ./...`, `npm run build`, targeted Oxlint and whitespace check pass.
- Public artifact now contains 98 files / 18,163,015 bytes. A browser downloads only its selected theme and codec, approximately 0.7–1MB for the observed VP9 paths; all four alternatives are not downloaded together.

## Limits

Physical Safari/iOS playback has not been measured. HEVC encoding and alpha characteristics were checked natively with AVFoundation; unsupported or blocked playback retains the static logo. Actual frame delivery depends on device, display, browser load and power policies. The site does not override browser energy-saving settings. Existing historical WebP media and Blender masters are retained for rollback.
