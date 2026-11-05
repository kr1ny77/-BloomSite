# Screen-relative rotation and actual iOS app icons

User correction: desktop wheel feels reversed; vertical drag stops tilting after side turns; home-screen icons must be actual iPhone apps.

Root cause: absolute YXZ Euler assignment rotates pitch about the already-yawed model axis. At a side orientation the pitch movement becomes a spin about depth rather than the screen's horizontal axis. Simply reversing a sign would preserve that bug.

Fix: incremental normalized quaternion premultiplication around camera-plane axes. Cursor right/down moves the currently visible surface right/down regardless of accumulated orientation, including side, reverse and upside-down poses. Home/End reset deterministically to authored front/barcode poses. Wheel direction reversed; previous reduced sensitivity, wheel easing, inertia and lifecycle cancellation preserved. Touch pan-y remains native.

Real app artwork is downloaded from Apple's iTunes Lookup / App Store metadata, publisher validated as Apple. Provenance: assets/generated/ios-icons.json; original artwork: assets/generated/ios-icons; optimized runtime: static/images/ios-apps. Native home-screen frame retained. Calendar, Weather, Shortcuts, Clock, Notes, Maps, Music, Books, Files, Mail, Podcasts; Phone/Safari/Messages/Music in dock. Bloom remains larger and fully opaque.

Tests exercise the real Three.js orientation math with visible-point projection for five starting poses and all four directions, full turns, normalization and deterministic reset, plus controller/lifecycle regressions. Actual browser verification follows before completion.


## Verification

- 33 full Node tests PASS, including6 real-Three orientation cases; go test, go vet, focused Oxlint and npm run build PASS. Final Go binary restarted with both updated controller/bundle and local Apple artwork.
- Independent read-only reviewer: APPROVE; repeated19 targeted tests + lint PASS.
- Actual Go page inspected1280×720. Home→6×Left put cup at side. Native vertical mouse drag exposed the full lid, rather than spinning around depth. Proof: orientation-side-before.png and orientation-side-after.png. Home/End deterministic poses tested in real quaternion math.
- Wheel over rotated cup retained scrollY3064.5; empty canvas wheel scrolled3064.5→3208.5. No console warnings/errors. Reduced motion remains immediate, and offscreen/modal/pagehide cancellation tests pass.
- Native phone preview inspected with actual locally loaded Apple artwork. All16 displayed img instances complete with naturalWidth>0, including Bloom and4 dock images. Proof: orientation-real-icons.png. No live App Store API or external artwork fetch is needed by the visitor.
- This pass changes desktop rotation math and decorative phone artwork; physical touch hardware not used. Native vertical touch-scroll remains intentionally preserved, tested separately. Screenshot comparison and browser result show the specific side-tilt regression fixed.
