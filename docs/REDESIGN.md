# Bloom redesign · 4 November 2026

## Objective and audience
Russian-speaking grocery shoppers who want understandable ingredient and nutrition information. This is an informational presentation of a future app, with no scanner, catalogue, account, forms, subscriptions or invented launch date.

## Baseline audit
Actual source: Go main.go + templates/index.html + static/. npm build copies these to dist. React/Vinext scaffold is inactive. Existing uncommitted work retained; pre-change copies in docs/redesign-before/.
Brand: original leaf mark, Pacifico loom, Onest. Dark forest #06110D, deep #103F2F, leaf #C7EB72. Preserve all anchors hero/about/inside/how/app/trust/closing, primary labels О составе / Приложение / Источники, original phone images, meta title/description/OG and store data attributes.
Current weakness: repeated full-screen photographic chapters, weak wayfinding, competing hero photo and wordmark, forced wheel landing at chapter boundary. Existing Go tests and 15 Node tests pass before edits.

## Design read and concept
Premium consumer presentation, brand-preserving visual overhaul. DESIGN_VARIANCE 8 / MOTION_INTENSITY 6 / VISUAL_DENSITY 3.
Concept: «Ясность изнутри». The leaf is the signature object. A large original emblem + Pacifico loom receive a concentrated green light field. The headline remains immediately understandable. Botanical object photography leads into real app screens and transparent explanation.
Native semantic HTML/CSS and local GSAP; no framework migration or extra runtime UI dependency. Native dialog supplies modal focus management and Escape. Native details preserve progressive enhancement.

## Tokens
Forest #071A13; canopy #123F2C; leaf accent #C7EB72; text #F2F6EA; secondary #B8C8BB; light surface #EFF4E9.
Onest variable for all reading and display text. Pacifico only for the original wordmark. Font-display swap, local assets.
Radius: 24px media, 16px information surfaces, pill controls. Layer scale: content 0, header 10, skip 20, native modal top layer.
Theme is system-driven across the whole page with semantic CSS tokens; an explicit theme control allows comparison. No arbitrary section inversions.
Gradient only on hero, menu visual and final brand scene: green reflected light, never gradient text. Reading sections stay flat.

## Layout plan
Hero: [promise + intro + CTA | oversized original mark + loom]. On mobile: logo above promise, all key content within a normal phone viewport.
About: generous typographic question plus cropped shopping photograph; audience grounded in everyday purchases.
Inside: wide original food still-life and three short facts outside the image.
How: a continuous vertical reading path next to a sticky photographed product on desktop. Native document flow on mobile.
App: original two phones on a green light stage with an accessible screen emphasis switch; examples explicitly disclosed.
Trust: a focused heading, native source disclosures and a clearly explained missing-data state.
Closing: large brand gesture and two honest, prepared store placeholders.

## Menu prototype
Small fixed header with original nav labels and an explicit Меню trigger. Native modal dialog expands from the upper right with 250ms transform/opacity transition. Large section links, current-section state, relevant photo preview on hover/focus, readable descriptions. Close button, Escape, backdrop, focus restoration, body scroll lock. Keyboard opens without ornamental entrance. Mobile has the same large touch targets with reduced visual complexity. With JS off, ordinary header links remain available.

## Motion
Purpose: explanation, wayfinding and state feedback. Native scrolling without wheel/touch capture, no scroll snapping. GSAP matchMedia owns desktop parallax and the sticky reading path; a short timeline reveals the hero copy. Mobile drops parallax; reduced motion is static. Every section remains visible if JS or GSAP is unavailable. No autoplaying obsolete logo video. Future final animation is opt-in through the hero integration contract, with a complete still always available.

## References inspected in browser
- https://egirltime.com/ : persistent section navigator, clear current location, responsive feedback. Adapt principle; do not copy visual style or content.
- https://www.awwwards.com/sites/opal-tadpole : product at an expressive physical scale and concise explanation. Award archive inspected; live URL now redirects to https://op.al/ and no longer presents the original Tadpole experience.
- https://www.awwwards.com/sites/mana-yerba-mate and https://en.manayerbamate.com/ : cohesive food-brand color, product-centred motion and changing section rhythm.
- https://www.awwwards.com/sites/igloo-inc and https://www.igloo.inc/ : material depth and a single signature scene. Archive inspected; live WebGL initially presents a loader, so no unobserved interaction is claimed.
- https://winners.webbyawards.com/winners/websites-and-mobile-sites/features-design/best-visual-design-aesthetic : inspected current gallery; Igloo also appears here.
Research boards: https://www.awwwards.com/websites/sites_of_the_year/ . No third-party creative assets are copied.

## Assets
Bloom-Keynote-v6.key opened as ZIP; embedded slide previews reviewed as a contact sheet in docs/materials-audit.jpg. Original emblem, Pacifico source outline/font, phone screens retained. Generate an original editorial food still life, optimized to WebP. Existing Blender source and renders are preserved; a new render is unnecessary while a separate final logo animation is pending.

## Acceptance criteria / verification plan
1. Hero and menu visually checked first at desktop and 390px mobile before full-page development.
2. All anchors and preserved primary navigation labels work; menu pointer, keyboard, touch-sized controls, Escape, focus containment and restoration checked.
3. All page sections checked at desktop/mobile; no horizontal overflow; no clipping at short viewports or enlarged text.
4. Native forward/reverse scroll; desktop motion and static reduced-motion; complete no-JS content and native links/details.
5. Original screenshots labelled demonstration; two store placeholders without destinations; missing-data message; no fabricated proof.
6. Go tests/vet, Node tests, JS syntax, focused lint, static build, asset references, browser errors and Lighthouse. Record actual measurements and tool limitations.

## Cleanup plan (changed files only)
Lock product contracts and screen-selection behavior first. Retire loaded chapter-stop wheel workaround and its obsolete active contract; keep archived source for historical recovery. Replace accumulated CSS overrides with a single token system. Classify static no-JS and media-error rendering as grounded fail-safe compatibility, with primary/disabled/failure paths tested. No broad swallowed exceptions. Independent reviewer checks final changed code, then fix concrete findings. No unrelated scaffold cleanup.

## Progress
Completed. Hero/menu inspected first, full-page implementation reviewed and corrected, final checks recorded in REDESIGN-VERIFICATION.md. User selected Mana as the principal interaction/art-direction reference. Final local Go preview: http://localhost:8096/ .
