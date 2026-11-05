# Bloom · direct manipulation correction ·4 November2026

User clarified: hover over the cup and wheel rotates it; held left mouse drag also rotates. The range slider is not the intended primary UI. Preserve front/barcode and demonstration controls as optional accessible shortcuts, remove the slider and its dead bindings/styles. Wheel is local to actual model hit area, never the document. Zoom gestures and scrolling outside the cup remain native. Mesh raycast excludes shadow ground. Existing drag/inertia/keyboard, reduced motion, lifecycle and truthful demonstration copy stay intact.

Replace incorrect kitchen photograph: a shopper in a supermarket BEFORE purchase, with the phone DISPLAY toward the shopper and the hidden MAIN REAR CAMERA directed toward the cup barcode. No camera module facing the viewer in a false scanning pose. New original image must be visually inspected for physical orientation, store setting and mobile crop before use.

Plan: baseline9product tests; add wheel boundary/regression tests before edit; implement non-passive wheel only on viewer, raycast hit API and remove range; generate corrected scene; inspect pointer wheel vs page scroll, LMB drag, keyboard,320/390px and noJS; build/restart final Go and update records. Reuse existing read-only reviewer under ai-slop-cleaner. Scope product controller/viewer, range markup/styles, context image/copy, tests/docs only.

Latest request explicitly permits wheel capture over the object, superseding the earlier blanket no-wheel-capture design rule. No wheel hijacking elsewhere, no active/locked interaction mode, no extra global scroll listener.

## Completion / verification
- Original corrected supermarket photograph generated and inspected: exec-ffdbb027-d0d6-4914-b167-9b3f8f1bcb12.png. Viewer sees the screen, not the rear case; supermarket dairy shelves and basket establish purchase context. Wide and390px browser crops preserve cup and phone. Store-specific intro copy and descriptive alt updated. Old kitchen image no longer referenced.
- Real browser wheel over cup changed its orientation while scrollTop stayed3159.5→3159.5 in preview. Reverse wheel likewise retained position. LMB drag visibly rotated to reverse/side. Empty canvas at1180,300 scrolled the page3159.5→3267.5, confirming geometry-only capture. Final Go browser repeated hover-wheel:2800→2800, plus visible LMB rotation. No warnings/errors.
- Range selector count0; dead input JS/CSS removed. Optional buttons, keyboard Home/End/arrows, scan cancellation and lifecycle retained. Existing noJS/static poster remains structurally unchanged; no new whole-site noJS sweep was necessary for this local correction.
- Baseline9 product tests PASS. New3 wheel tests failed before implementation, then passed. Final28Node tests PASS, Go test/vet PASS, focused Oxlint/syntax/build PASS. Independent read-only reviewer approved with0 blockers. No dependency additions in this correction. Previous Lighthouse results remain historical; not rerun for this below-fold interaction/photo-only scope.
- Final Go http://localhost:8096 serves current JS/CSS/photo bytes matching source. Original brand byte hash unchanged. Evidence direct-final-store.jpg, direct-final-mobile.jpg, direct-final-rotation.jpg. Temporary responsive fixture and source preview server cleaned up after QA; Go preview remains available. Physical touch hardware and Safari not tested.

| Before | After | Why |
| --- | --- | --- |
| Range as a prominent rotation control | Wheel on hover and LMB drag on the actual cup | Matches the user's intended direct interaction |
| Possible whole-canvas wheel trap | Raycast only on model meshes | Blank space keeps ordinary page scrolling |
| Phone rear case facing shopper in a kitchen | Phone display facing shopper in supermarket | Correct camera direction and pre-purchase context |

## AI SLOP CLEANUP REPORT
Scope: product controller/viewer, range markup/styles, context image/copy and narrow tests/docs.
Behavior Lock: baseline9 product tests; final12 product/28total tests. Regression-first wheel behaviour covers direction, hit boundaries, zoom/native scroll, unloaded/inert states and takeover from drag/scan.
Cleanup Plan: remove slider path; add a local input boundary using existing cancellation and rendering; replace physically incorrect photo.
Fallback Findings: no new fallback; existing noJS/poster and diagnosed WebGL failure remain grounded fail-safe boundaries. No document-level wheel listeners or fake camera fallback.
UI Findings: direct manipulation replaces prominent slider; accessible shortcuts retained. User explicitly authorizes local wheel capture, overriding prior blanket no-wheel rule only over the model. No new design detector suppressions.
Passes Completed: dead range deletion; reuse existing cancellation; normalized wheel units/clamp; targeted tests; independent reviewer APPROVE.
Quality Gates: Tests/Go vet/Lint/Syntax/Asset+brand checks/Build PASS. Typecheck N/A plain JS/CSS. Security/dependency audit not repeated, no dependency changes; previous npm audit limitations remain recorded in INTERACTION-REFINEMENT.md.
Remaining Risks: hardware touch and Safari unverified; all product data and scan visuals remain explicitly demonstrative. No deploy.
