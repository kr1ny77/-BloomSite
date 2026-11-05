# Bloom · second design pass · 4 November 2026

## User direction
Replace weak photography and rethink structure/transitions using awarded sites. User identified the cropped yogurt scene as weak; Mana remains the preferred reference. Preserve recognizable brand, Pacifico, current hero, original screens, accessibility, store placeholders and truthful future-product framing.

## Audit and decision
The old method block shows a yogurt at the far left of a mostly empty dark photograph, while a long step list stays disconnected from it. A second standalone app block repeats the same promises and examples. Existing browser/scaffold architecture stays unchanged.
Reading: premium consumer presentation with tactile food/product storytelling, native HTML/CSS and local GSAP. DESIGN_VARIANCE8 / MOTION_INTENSITY7 desktop,4 mobile / VISUAL_DENSITY3. Existing green semantic theme tokens and Onest/Pacifico stay locked.

## Reference research
- https://en.manayerbamate.com/ and Awwwards SOTY gallery: central object, playful physical scale, coherent product world. Original colors/graphics are not copied.
- https://www.awwwards.com/sites/simply-chocolate and https://www.awwwards.com/inspiration/simply-chocolate-product-page : award archive viewed in browser; isolated package in a broad color field, natural ingredients beyond the package, object continuity rather than repeated photo cards.
- https://www.awwwards.com/sites/dont-board-me : archive lists a dedicated how-it-works narrative; live experience initially opens with an interactive loading gate. Bloom must not copy that gate because its information should be immediately accessible.

## Revised story
Hero -> everyday shopping context -> concise kinds of information -> one interactive product journey -> source transparency -> future launch.
Everyday context uses a full-width bright original grocery photograph with a shorter message instead of another left-text/right-photo split.
The new app journey absorbs old method + standalone app block. Preserve #how (intro) and #app (chapter), all other anchors and primary nav labels. Three scenes: entire illustrative package / original composition phone / original result phone. Short scene descriptions explain the action and why it matters. All ratings/screens remain explicitly demonstration material.
No fake search/scanner or working application is added. Controls present the concept only.

## Visual and motion plan
Uncropped alpha packshot sits directly in a leaf-green stage, not inside a dark photo tile. Scene changes keep a common object axis; CSS transform/opacity transitions acknowledge direct selection. The desktop stage is pinned at top top for about two viewport lengths using ScrollTrigger; natural scroll selects scenes, and direct controls move to their corresponding position while pinned. Native wheel/touch input is never blocked. Phone and reduced motion use direct, lightweight selection; no desktop engine download.
No-JS: same three scenes appear sequentially with native text and original images; there is no duplicate fallback markup. CSS tokens adapt all new surfaces in both themes.

## Acceptance criteria
The yogurt is entirely in frame on320/390/1440px; no obsolete dark yogurt photo remains in the rendered page/menu. Old method and app narratives are one chapter without repeated giant heading blocks. Selection works by pointer and Enter, updates aria-pressed/inert/aria-hidden and supports first/last states. Desktop scroll forward/reverse and control/scroll handoff work without jitter. Mobile remains native. Static content survives disabled JS/optional-engine failure. Theme contrast, overflow, assets, store product constraints, errors, tests/build/Lighthouse rechecked.

## Bounded cleanup plan
Scope: index.html, style.css, presentation.js, motion.js and related tests/docs. Baseline Go and10Node tests before edit. Delete obsolete method/app CSS and animation branches, replace the two-screen behavior test with three-scene behavior coverage. Static no-JS and optional-engine failure remain grounded fail-safe boundaries with diagnostics; do not introduce silent alternate paths. Independent reviewer checks changed files after implementation under ai-slop-cleaner writer/reviewer separation. No unrelated scaffold cleanup.

## Progress
Implemented and inspected. Two original ImageGen assets exported as responsive WebP; transparent package60KB/22KB, everyday photo177KB/49KB. Separate method/app blocks merged; redundant food-scene image and obsolete styles/observer deleted from active page. Menu previews now use the same new materials. Original files retained.

## Verification · 4 November 2026
- Browser IAB1280×720: all three scenes, entire package/phones, light/dark theme, native forward and reverse scrolling, pointer and Enter selection. Fixed percentage-height overflow found in the first prototype by bounding object heights against the viewport.
- Actual iframe viewports390×844 and320×740: entire package/phone, readable copy, sticky selection, native scrolling, no horizontal overflow (clientWidth equals scrollWidth). Mouse emulation/keyboard used; physical touch hardware not tested.
- Menu: keyboard Enter, Shift+Tab/Tab containment, Escape and trigger restoration. Found and fixed a close-event/scroll-lock race: destination is now queued until dialog close restores scrolling, then focus/instant navigation and motion update run in one frame. Rechecked from pinned stage upwards to about and downwards to trust: correct destination top96px, pin relative, destination focused, lock removed, no extra wheel required.
- No JavaScript320px: all three scenes remain sequential; ordinary navigation and native details work. Opened Research disclosure successfully. No duplicate fallback markup.
- Reduced motion: browser audit launched with force-prefers-reduced-motion=reduce; no GSAP/ScrollTrigger requests. Mobile likewise downloads neither engine. Behaviour also covered by tests.
- Console: no errors/warnings in inspected local page. Original screens remain unchanged and labelled demonstration data. Store placeholders and future-product scope preserved.
- Go test/vet PASS. Node14 tests PASS, including a regression test that first failed on navigation under scroll lock and passed after repair. Focused oxlint and JS syntax checks PASS. npm build PASS (final run recorded below).
- Lighthouse laboratory measurements: mobile Performance99, LCP2.1s, CLS0, TBT0; desktop100, LCP0.6s, CLS0.001, TBT0; reduced desktop100, LCP0.6s. Accessibility/Best Practices/SEO100 in all three. JSON reports lighthouse-structure-*.json. These are local lab results, not field measurements.

## Before / after review
| Before | After | Reason |
| --- | --- | --- |
| Cropped yogurt in mostly empty dark photo | Entire isolated illustrative package on brand surface | Product remains the focal point at every size |
| Separate method list and phone gallery repeat promises | One chapter, three linked visual/text states | A clearer journey with less repetition |
| Repeated side-by-side photography | One wide everyday frame, open information rows, then product stage | Varied rhythm grounded in the story |
| Menu close/scroll race leaves a fixed stage until wheel | Navigation after unlock with explicit motion synchronization | Reliable anchor navigation and focus |

## AI SLOP CLEANUP REPORT
Scope: templates/index.html, static/css/style.css, static/js/app.js, presentation.js, motion.js and related tests/docs.
Behavior Lock: baseline Go+10Node; final Go+14Node including state/reverse/invalid input, engine failure and menu navigation regression.
Cleanup Plan: remove obsolete method/gallery code, duplicate content, stale menu images; preserve explicit boundaries.
Fallback Findings: no-JS semantic document, reduced-motion and optional engine failure are grounded fail-safe boundaries. Film autoplay/codec failure preserves still and diagnostics. No masking fallback, new dependencies or speculative architecture.
UI/Design Findings: repetitive compositions consolidated. Manual detector exposed weak light-theme secondary text (#46634e on #b6d583); corrected to #3e5945. Dark light token reduced to #2a5737 so even peak green retains readable secondary text. No low-contrast suppression. Narrow file-scoped exceptions recorded for cramped-padding (inner shell/summary actually supplies gutters/insets, visually checked) and radial-halo (explicit user brief requests leaf-inspired light gradient). No rule-wide/file-wide ignore. Manual detector now passes.
Passes Completed: resolution gate; dead code deletion; duplicate removal; naming/boundary cleanup; targeted test reinforcement. Independent read-only reviewer checked initial changes and identified the navigation race with a minimal repair recommendation; writer implemented and browser-verified it.
Quality Gates: regression/tests/lint/build PASS; static asset/anchor/syntax checks PASS. Typecheck N/A to changed native JS/CSS/Go; inactive React scaffold untouched. Security scan N/A (no backend/auth/data changes).
Changed Files: HTML combines story; CSS replaces old block styles; presentation owns one coherent accessible selection; motion owns optional desktop pin/transform and navigation synchronization; app menu uses new previews and ordered navigation; tests/docs match actual behaviour.
Remaining Risks: final leaf-to-wordmark animation still awaiting approved media; mobile touch hardware, Safari and real-network field data not verified. Research live Dont Board Me did not progress beyond initial interactive gate; only archive structure used. No site published.


## Final delivery
Production build rerun successfully. Final Go server http://localhost:8096 serves the exact current embedded HTML/CSS/JS (HTTP200, byte comparison for assets; HTML normalized for Go template comment removal). Final mobile/desktop Lighthouse reports rerun against this server. Reduced-motion report used the identical source preview before the final menu-order/contrast fixes; its no-engine condition is unchanged and covered by tests. Inspected final Go page additionally at1014px with working direct controls and no horizontal overflow. Saved viewport screenshots structure-final-stage.jpg and structure-final-mobile.jpg. Temporary responsive fixture removed and source-preview server8094 stopped; final Go8096 remains available. No deployment performed.
