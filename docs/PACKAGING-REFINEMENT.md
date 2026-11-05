# Packaging, menu and rotation refinement

User brief: enlarge label illustration using Selo Zelenoe packaging as composition reference; prevent print overlapping factual copy; replace glass barcode cube with iPhone home-screen preview focused on Bloom; slower, smoother manipulation.

Plan: study official brand catalog and supplied product photo; author larger cream/gold botanical-and-milk illustration with a protected type area; explicitly wrap the technical side-panel into a fixed text column; regenerate model/posters and fresh-import GLB. Replace only menu app media with a crisp native phone home-screen composition using original Bloom icon; existing app demo screens untouched. Lower drag/wheel/auto sensitivity and release velocity; smooth wheel input through one RAF with lifecycle/reduced-motion guarantees. Verify narrow/desktop rendering, rotate around text side, wheel/drag/native scrolling, menu preview and build/tests.

Acceptance: no illustration under technical text; stronger retail-packaging composition, original factual demo values retained; Bloom icon clearly dominates its home-screen preview; wheel is no longer an instantaneous sharp jump; native scroll outside object and all prior fail-safe boundaries remain.

References: https://www.selo-zelenoe.ru/catalog/molochnye-deserty/yogurt/ and the user-supplied cherry yogurt image. Brand treated as visual reference, not a real product/partner claim.


## Delivered and verified

| Before | After | Why |
|---|---|---|
| Narrow botanical strip; centered long side-copy extended across UV panels | New large cream/gold botanical and milk illustration, protected front title and mass badge, measured 330px side column with word wrap | Fixes actual overlap and gives retail packaging the larger artwork requested |
| Barcode glass cube | Native iPhone home screen, 12 app icons, original Bloom icon brighter and 1.35× larger | Directly follows the revised menu direction; caption says concept |
| Drag .012rad/px; wheel .0045rad/px direct; auto .18rad/s; inertia cap7rad/s | Drag .0045; wheel .0018 with 14/s easing; auto .075; inertia cap1.4/decay9 | Less sensitive, slower and more controlled without restricting360° |

- Baseline11 product/menu tests passed before changes. Final27 Node tests PASS, go test ./... PASS, go vet PASS, focused Oxlint PASS, npm run build PASS. New tests cover non-jumping eased wheel, cancellation offscreen, and home-preview success→other preview failure→retry.
- Independent read-only review found an error-state mismatch for native phone composition. Fixed by hiding .menu-home-preview when data-image-error is present; final review APPROVE.
- Fresh GLB import PASS, same9meshes/18764triangles, GLB1516836bytes lazy-loaded below the fold, Russian label/lid textures retained. Python/Blender sources, PNG masters, JPEG runtime and original print art saved.
- Actual Go version restarted at http://localhost:8096/ and inspected1280×720 and1014×883, dark and light surfaces. Wheel over cup kept scrollY3020 unchanged; drag felt lower sensitivity, keyboard Home/6×Left exposed the side panel with no print overlap. Front/mass and lid checked in Blender render and browser. No UI/research claims from the reference brand were copied.
- Responsive390×680 checked in same-origin iframe: menu navigation works, no horizontal overflow, the updated package remains interactive and legible as a product illustration. Physical touch hardware not used; native pan-y/lifecycle covered by tests retained from the preceding pass.
- Browser console errors/warnings absent in the final Go page. Impeccable detect from workspace root returns[]. Existing sanctioned exceptions remain unchanged.
- Proof: refinement-package.png, refinement-label-side.png, refinement-menu.png, refinement-mobile.png. Sources/prompt: assets/generated/packaging-refinement.md. The glass cube and earlier print are retained as inactive sources only.

The phone home screen is a presentation concept. Real app UI demo screens, hero/Pacifico, closing mark and store placeholders remain as before. Previous Lighthouse scores belong to the preceding pass and were not rerun for these below-the-fold edits. Browser verification and actual build/test results above apply to this pass.

Temporary responsive fixture removed and Python8094 stopped after QA. Go8096 remains running; user-facing tab retained.
